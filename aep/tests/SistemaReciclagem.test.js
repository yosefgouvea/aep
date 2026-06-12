// tests/SistemaReciclagem.test.js
const { teste, assert, assertEqual, assertThrows } = require("./run.js");
const { SistemaReciclagem } = require("../js/models/SistemaReciclagem.js");
const { PontoColeta } = require("../js/models/PontoColeta.js");
const { Plastico } = require("../js/models/Material.js");

function sistemaComUsuario() {
  const s = new SistemaReciclagem();
  const u = s.cadastrarUsuario("Ana", "a@x.com", "1234");
  return { s, u };
}

teste("cadastrar bloqueia email duplicado", () => {
  const { s } = sistemaComUsuario();
  assertThrows(() => s.cadastrarUsuario("Outra", "a@x.com", "9"));
});
teste("login valida credenciais", () => {
  const { s } = sistemaComUsuario();
  assertThrows(() => s.login("a@x.com", "errada"));
  assertEqual(s.login("a@x.com", "1234").nome, "Ana");
});
teste("registrarDescarte enfileira e fica pendente", () => {
  const { s, u } = sistemaComUsuario();
  const p = new PontoColeta(1, "P", "R", 0, 0, ["plastico"]);
  s.registrarDescarte(u, p, new Plastico(), 2);
  assertEqual(s.filaDescartes.tamanho, 1);
  assertEqual(u.pontos, 0); // ainda não processado
});
teste("processarFila confirma e credita pontos/impacto/kg", () => {
  const { s, u } = sistemaComUsuario();
  const p = new PontoColeta(1, "P", "R", 0, 0, ["plastico"]);
  s.registrarDescarte(u, p, new Plastico(), 2);
  s.registrarDescarte(u, p, new Plastico(), 3);
  const processados = s.processarFila();
  assertEqual(processados.length, 2);
  assertEqual(u.pontos, 50);          // (2+3)kg * 10
  assertEqual(u.kgReciclados, 5);
  assert(s.filaDescartes.vazia);
});

// --- acrescentar ao final de tests/SistemaReciclagem.test.js ---
const { Medalha } = require("../js/models/Medalha.js");
const { RecompensaDesconto } = require("../js/models/Recompensa.js");

teste("gerarRanking ordena por pontos desc", () => {
  const s = new SistemaReciclagem();
  const a = s.cadastrarUsuario("Ana", "a@x.com", "1");
  const b = s.cadastrarUsuario("Bia", "b@x.com", "1");
  a.adicionarPontos(100); b.adicionarPontos(300);
  assertEqual(s.gerarRanking().map(u => u.nome), ["Bia", "Ana"]);
});

teste("verificarMedalhas desbloqueia ao bater criterio", () => {
  const s = new SistemaReciclagem();
  s.medalhas.push(new Medalha("kg1", "Primeiro Passo", "🌱", u => u.kgReciclados >= 1));
  const u = s.cadastrarUsuario("Ana", "a@x.com", "1");
  u.adicionarKg(2);
  s.verificarMedalhas(u);
  assertEqual(u.medalhas.length, 1);
  s.verificarMedalhas(u); // não duplica
  assertEqual(u.medalhas.length, 1);
});

teste("resgatarRecompensa desconta pontos e registra acao", () => {
  const s = new SistemaReciclagem();
  const u = s.cadastrarUsuario("Ana", "a@x.com", "1");
  u.adicionarPontos(200);
  s.recompensas.push(new RecompensaDesconto(1, "Desc10", "Cafe Verde", 100, 10));
  const msg = s.resgatarRecompensa(u, 1);
  assertEqual(u.pontos, 100);
  assert(msg.includes("Cafe Verde"));
  assertEqual(u.historico.topo.descricao.includes("Recompensa"), true);
});
