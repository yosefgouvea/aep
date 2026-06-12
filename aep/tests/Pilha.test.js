// tests/Pilha.test.js
const { teste, assert, assertEqual } = require("./run.js");
const { Pilha } = require("../js/estruturas/Pilha.js");

teste("Pilha respeita LIFO", () => {
  const p = new Pilha();
  p.empilhar(1).empilhar(2).empilhar(3);
  assertEqual(p.desempilhar(), 3);
  assertEqual(p.topo, 2);
  assertEqual(p.tamanho, 2);
});
teste("Pilha vazia retorna null", () => {
  const p = new Pilha();
  assert(p.vazia);
  assertEqual(p.desempilhar(), null);
});
teste("Pilha recentes() devolve do topo para a base", () => {
  const p = new Pilha();
  p.empilhar("velho").empilhar("novo");
  assertEqual(p.recentes(), ["novo", "velho"]);
});
