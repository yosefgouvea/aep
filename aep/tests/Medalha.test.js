// tests/Medalha.test.js
const { teste, assert, assertEqual } = require("./run.js");
const { Medalha } = require("../js/models/Medalha.js");
const { Usuario } = require("../js/models/Usuario.js");

teste("Medalha verifica criterio sobre o usuario", () => {
  const m = new Medalha("primeiro", "Primeiro Passo", "🌱", u => u.kgReciclados >= 1);
  const u = new Usuario("Ana", "a@x.com", "1");
  assert(!m.verificar(u));
  u.adicionarKg(2);
  assert(m.verificar(u));
});
