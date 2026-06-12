// tests/Storage.test.js
const { teste, assert, assertEqual } = require("./run.js");

// Mock de localStorage para Node
global.localStorage = {
  _d: {},
  getItem(k) { return k in this._d ? this._d[k] : null; },
  setItem(k, v) { this._d[k] = String(v); },
  removeItem(k) { delete this._d[k]; },
};

const { Storage } = require("../js/services/Storage.js");
const { SistemaReciclagem } = require("../js/models/SistemaReciclagem.js");
const { PontoColeta } = require("../js/models/PontoColeta.js");
const { Plastico, criarMaterial } = require("../js/models/Material.js");

teste("Storage salva e carrega objeto", () => {
  Storage.salvar("teste", { a: 1 });
  assertEqual(Storage.carregar("teste").a, 1);
});
teste("Storage carregar inexistente retorna padrao", () => {
  assertEqual(Storage.carregar("nao_existe", "x"), "x");
});

teste("Sistema persiste usuarios e fila e recarrega", () => {
  const s = new SistemaReciclagem();
  const u = s.cadastrarUsuario("Ana", "a@x.com", "1234");
  const p = new PontoColeta(1, "P", "R", 0, 0, ["plastico"]);
  s.pontosColeta = [p];
  s.registrarDescarte(u, p, new Plastico(), 2); // fica na fila (pendente)
  s.salvarEm("eco_save");

  const s2 = new SistemaReciclagem();
  s2.pontosColeta = [p];
  s2.carregarDe("eco_save");
  assertEqual(s2.usuarios.tamanho, 1);
  assert(s2.usuarios.buscar(x => x.email === "a@x.com").verificarSenha("1234"));
  assertEqual(s2.filaDescartes.tamanho, 1);
});
