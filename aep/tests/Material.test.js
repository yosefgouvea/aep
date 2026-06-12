// tests/Material.test.js
const { teste, assert, assertEqual, assertThrows } = require("./run.js");
const { Material, Plastico, Papel, Vidro, Metal, Eletronico, criarMaterial } = require("../js/models/Material.js");

teste("Material e abstrata (nao instanciavel)", () => {
  assertThrows(() => new Material("x", 1));
});
teste("Plastico calcula pontos = peso * fator", () => {
  assertEqual(new Plastico().calcularPontos(2), 20); // fator 10
});
teste("Polimorfismo: cada material tem impacto diferente", () => {
  const co2Plastico = new Plastico().calcularImpacto(1).co2;
  const co2Metal = new Metal().calcularImpacto(1).co2;
  assert(co2Plastico !== co2Metal, "impactos deveriam diferir");
});
teste("criarMaterial monta pela chave", () => {
  assertEqual(criarMaterial("vidro").nome, "Vidro");
  assert(criarMaterial("metal") instanceof Material);
});
