// No Node, importa Pilha para globalThis; no navegador, Pilha já é uma classe global.
// NÃO usar `var`/`let`/`const` aqui: declarar o nome no escopo global do browser
// colide com o binding léxico de `class Pilha` (outro <script>) e quebra o carregamento.
if (typeof module !== "undefined" && module.exports) {
  globalThis.Pilha = require("../estruturas/Pilha.js").Pilha;
}

/** POO: Encapsulamento — estado interno protegido por campos privados (#) e exposto via getters/métodos. */
class Usuario {
  #nome; #email; #senha; #pontos; #nivel; #medalhas; #metaMensalKg; #historico; #impacto; #kgReciclados;

  constructor(nome, email, senha) {
    this.#nome = nome;
    this.#email = email;
    this.#senha = Usuario.ofuscar(senha);
    this.#pontos = 0;
    this.#nivel = "Iniciante";
    this.#medalhas = [];
    this.#metaMensalKg = 20;
    this.#historico = new Pilha();
    this.#impacto = { co2: 0, agua: 0, arvores: 0 };
    this.#kgReciclados = 0;
  }

  // Ofuscação determinística (NÃO é segurança de produção — apenas evita guardar senha em texto puro).
  static ofuscar(txt) {
    let h = 0;
    for (const c of String(txt)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return "h" + h.toString(16);
  }

  get nome() { return this.#nome; }
  get email() { return this.#email; }
  get pontos() { return this.#pontos; }
  get nivel() { return this.#nivel; }
  get medalhas() { return [...this.#medalhas]; }
  get historico() { return this.#historico; }
  get metaMensalKg() { return this.#metaMensalKg; }
  get impacto() { return { ...this.#impacto }; }
  get kgReciclados() { return this.#kgReciclados; }

  verificarSenha(senha) { return this.#senha === Usuario.ofuscar(senha); }

  adicionarPontos(p) { this.#pontos += p; this.#nivel = this.#calcularNivel(); return this.#pontos; }
  gastarPontos(p) {
    if (p > this.#pontos) throw new Error("Pontos insuficientes");
    this.#pontos -= p; this.#nivel = this.#calcularNivel();
  }
  adicionarKg(kg) { this.#kgReciclados += kg; }
  registrarImpacto(imp) {
    this.#impacto.co2 += imp.co2;
    this.#impacto.agua += imp.agua;
    this.#impacto.arvores += imp.arvores;
  }
  registrarAcao(descricao) { this.#historico.empilhar({ descricao, data: new Date().toISOString() }); }
  desbloquearMedalha(medalha) {
    if (this.#medalhas.some(m => m.id === medalha.id)) return false;
    this.#medalhas.push(medalha); return true;
  }

  #calcularNivel() {
    if (this.#pontos >= 2000) return "Guardião do Planeta";
    if (this.#pontos >= 800) return "Eco-Guerreiro";
    if (this.#pontos >= 200) return "Reciclador";
    return "Iniciante";
  }

  // Serialização para persistência (usada na Task 10).
  toJSON() {
    return {
      nome: this.#nome, email: this.#email, senhaHash: this.#senha,
      pontos: this.#pontos, kgReciclados: this.#kgReciclados, impacto: { ...this.#impacto },
      medalhasIds: this.#medalhas.map(m => m.id), acoes: this.#historico.toArray(),
    };
  }
  static fromJSON(obj, catalogoMedalhas = []) {
    const u = new Usuario(obj.nome, obj.email, "");
    u.#senha = obj.senhaHash;
    u.#pontos = obj.pontos;
    u.#kgReciclados = obj.kgReciclados;
    u.#impacto = { ...obj.impacto };
    u.#nivel = u.#calcularNivel();
    u.#medalhas = catalogoMedalhas.filter(m => obj.medalhasIds.includes(m.id));
    for (const a of obj.acoes) u.#historico.empilhar(a);
    return u;
  }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { Usuario }; }
