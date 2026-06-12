// tests/Descarte.test.js
const { teste, assert, assertEqual } = require("./run.js");
const { Descarte } = require("../js/models/Descarte.js");
const { Plastico } = require("../js/models/Material.js");
const { PontoColeta } = require("../js/models/PontoColeta.js");
const { Usuario } = require("../js/models/Usuario.js");

teste("Descarte nasce pendente e confirma calculando pontos/impacto", () => {
  const u = new Usuario("Ana", "a@x.com", "1");
  const p = new PontoColeta(1, "P", "R", 0, 0, ["plastico"]);
  const d = new Descarte(1, u, p, new Plastico(), 2);
  assertEqual(d.status, "pendente");
  d.confirmar();
  assertEqual(d.status, "confirmado");
  assertEqual(d.pontosGerados, 20);          // 2kg * fator 10
  assert(d.impacto.co2 > 0);
});

teste("Descarte encapsula atributos (campos privados com getters)", () => {
  const u = new Usuario("Ana", "a@x.com", "1");
  const p = new PontoColeta(1, "P", "R", 0, 0, ["plastico"]);
  const d = new Descarte(5, u, p, new Plastico(), 3);
  assertEqual(d.id, 5);
  assertEqual(d.pesoKg, 3);
  assertEqual(d.status, "pendente");
  assertEqual(d.material.nome, "Plástico");
  assertEqual(d.usuario.email, "a@x.com");
  assertEqual(d.pontoColeta.nome, "P");
  // campos privados (#) não aparecem como propriedades próprias enumeráveis
  assertEqual(Object.keys(d), []);
});
