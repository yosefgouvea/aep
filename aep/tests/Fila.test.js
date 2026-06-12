// tests/Fila.test.js
const { teste, assert, assertEqual } = require("./run.js");
const { Fila } = require("../js/estruturas/Fila.js");

teste("Fila respeita FIFO", () => {
  const f = new Fila();
  f.enfileirar("a").enfileirar("b").enfileirar("c");
  assertEqual(f.desenfileirar(), "a");
  assertEqual(f.desenfileirar(), "b");
  assertEqual(f.tamanho, 1);
});
teste("Fila frente nao remove", () => {
  const f = new Fila();
  f.enfileirar("x");
  assertEqual(f.frente, "x");
  assertEqual(f.tamanho, 1);
});
teste("Fila vazia retorna null e flag", () => {
  const f = new Fila();
  assert(f.vazia);
  assertEqual(f.desenfileirar(), null);
});
