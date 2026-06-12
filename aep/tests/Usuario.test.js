// tests/Usuario.test.js
const { teste, assert, assertEqual, assertThrows } = require("./run.js");
const { Usuario } = require("../js/models/Usuario.js");

teste("Usuario inicia Iniciante com 0 pontos", () => {
  const u = new Usuario("Ana", "ana@x.com", "1234");
  assertEqual(u.pontos, 0);
  assertEqual(u.nivel, "Iniciante");
});
teste("Encapsulamento: senha nao e legivel diretamente", () => {
  const u = new Usuario("Ana", "ana@x.com", "1234");
  assertEqual(u.senha, undefined);
  assert(u.verificarSenha("1234"));
  assert(!u.verificarSenha("errada"));
});
teste("adicionarPontos sobe de nivel", () => {
  const u = new Usuario("Ana", "ana@x.com", "1234");
  u.adicionarPontos(250);
  assertEqual(u.nivel, "Reciclador");
  u.adicionarPontos(600);
  assertEqual(u.nivel, "Eco-Guerreiro");
});
teste("gastarPontos valida saldo", () => {
  const u = new Usuario("Ana", "ana@x.com", "1234");
  u.adicionarPontos(100);
  u.gastarPontos(40);
  assertEqual(u.pontos, 60);
  assertThrows(() => u.gastarPontos(999));
});
teste("registrarAcao empilha no historico", () => {
  const u = new Usuario("Ana", "ana@x.com", "1234");
  u.registrarAcao("fez algo");
  assertEqual(u.historico.topo.descricao, "fez algo");
});
teste("registrarImpacto e kg acumulam", () => {
  const u = new Usuario("Ana", "ana@x.com", "1234");
  u.registrarImpacto({ co2: 2, agua: 100, arvores: 0.1 });
  u.adicionarKg(3);
  assertEqual(u.impacto.co2, 2);
  assertEqual(u.kgReciclados, 3);
});
