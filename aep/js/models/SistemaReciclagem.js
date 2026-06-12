// Dependências (somente Node) atribuídas a globalThis. No navegador essas classes/funções
// já são globais — NÃO declarar os nomes aqui (var/let/const) para não colidir com os
// bindings léxicos globais dos outros <script> e quebrar o carregamento do arquivo.
if (typeof module !== "undefined" && module.exports) {
  globalThis.Lista = require("../estruturas/Lista.js").Lista;
  globalThis.Fila = require("../estruturas/Fila.js").Fila;
  globalThis.Usuario = require("./Usuario.js").Usuario;
  globalThis.Descarte = require("./Descarte.js").Descarte;
  globalThis.Storage = require("../services/Storage.js").Storage;
  globalThis.criarMaterial = require("./Material.js").criarMaterial;
}

/** POO: Abstração — fachada que coordena Usuarios (Lista), descartes (Fila), medalhas e recompensas. */
class SistemaReciclagem {
  #contadorDescarte = 0;
  constructor() {
    this.usuarios = new Lista();
    this.filaDescartes = new Fila();
    this.pontosColeta = [];   // PontoColeta[]
    this.recompensas = [];    // Recompensa[]
    this.medalhas = [];       // Medalha[]
    this.usuarioLogado = null;
  }

  cadastrarUsuario(nome, email, senha) {
    if (this.usuarios.buscar(u => u.email === email)) throw new Error("E-mail já cadastrado");
    const u = new Usuario(nome, email, senha);
    this.usuarios.adicionar(u);
    return u;
  }

  login(email, senha) {
    const u = this.usuarios.buscar(x => x.email === email);
    if (!u || !u.verificarSenha(senha)) throw new Error("Credenciais inválidas");
    this.usuarioLogado = u;
    return u;
  }
  logout() { this.usuarioLogado = null; }

  registrarDescarte(usuario, pontoColeta, material, pesoKg) {
    if (!(pesoKg > 0)) throw new Error("Peso deve ser maior que zero");
    const d = new Descarte(++this.#contadorDescarte, usuario, pontoColeta, material, pesoKg);
    this.filaDescartes.enfileirar(d);
    usuario.registrarAcao(`Descarte de ${pesoKg}kg de ${material.nome} registrado (pendente)`);
    return d;
  }

  processarProximo() {
    if (this.filaDescartes.vazia) return null;
    const d = this.filaDescartes.desenfileirar();
    d.confirmar();
    d.usuario.adicionarPontos(d.pontosGerados);
    d.usuario.registrarImpacto(d.impacto);
    d.usuario.adicionarKg(d.pesoKg);
    d.usuario.registrarAcao(`Descarte confirmado: +${d.pontosGerados} pts`);
    this.verificarMedalhas(d.usuario);
    return d;
  }
  processarFila() {
    const r = [];
    while (!this.filaDescartes.vazia) r.push(this.processarProximo());
    return r;
  }

  verificarMedalhas(usuario) {
    for (const m of this.medalhas) {
      const jaTem = usuario.medalhas.some(x => x.id === m.id);
      if (!jaTem && m.verificar(usuario)) usuario.desbloquearMedalha(m);
    }
  }

  gerarRanking() { return this.usuarios.ordenarPor("pontos", true); }

  resgatarRecompensa(usuario, idRecompensa) {
    const r = this.recompensas.find(x => x.id === idRecompensa);
    if (!r) throw new Error("Recompensa não encontrada");
    const msg = r.resgatar(usuario);
    usuario.registrarAcao(`Recompensa resgatada: ${r.nome}`);
    return msg;
  }

  salvarEm(chave) {
    const snapshot = {
      usuarios: this.usuarios.toArray().map(u => u.toJSON()),
      logado: this.usuarioLogado ? this.usuarioLogado.email : null,
      fila: this.filaDescartes.toArray().map(d => ({
        usuarioEmail: d.usuario.email,
        pontoId: d.pontoColeta.id,
        materialChave: this.#chaveDoMaterial(d.material),
        pesoKg: d.pesoKg,
      })),
    };
    Storage.salvar(chave, snapshot);
  }

  carregarDe(chave) {
    const snap = Storage.carregar(chave);
    if (!snap) return false;
    this.usuarios = new Lista();
    for (const obj of snap.usuarios) this.usuarios.adicionar(Usuario.fromJSON(obj, this.medalhas));
    // recomputa medalhas (auto-corrige catálogo)
    for (const u of this.usuarios.toArray()) this.verificarMedalhas(u);
    this.usuarioLogado = snap.logado ? this.usuarios.buscar(u => u.email === snap.logado) : null;
    this.filaDescartes = new Fila();
    for (const item of (snap.fila || [])) {
      const u = this.usuarios.buscar(x => x.email === item.usuarioEmail);
      const p = this.pontosColeta.find(x => x.id === item.pontoId);
      if (u && p) this.registrarDescarte(u, p, criarMaterial(item.materialChave), item.pesoKg);
    }
    return true;
  }

  #chaveDoMaterial(material) {
    return material.nome
      .normalize("NFD").replace(/[̀-ͯ]/g, "") // remove acentos (faixa Unicode de diacríticos)
      .toLowerCase();
  }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { SistemaReciclagem }; }
