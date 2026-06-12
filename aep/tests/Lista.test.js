// tests/Lista.test.js
const { teste, assert, assertEqual } = require("./run.js");
const { Lista } = require("../js/estruturas/Lista.js");

teste("Lista adiciona e conta itens", () => {
  const l = new Lista();
  l.adicionar("a").adicionar("b");
  assertEqual(l.tamanho, 2);
});
teste("Lista busca por predicado", () => {
  const l = new Lista();
  l.adicionar({ id: 1 }).adicionar({ id: 2 });
  assertEqual(l.buscar(x => x.id === 2).id, 2);
  assertEqual(l.buscar(x => x.id === 9), null);
});
teste("Lista ordena por chave (desc)", () => {
  const l = new Lista();
  l.adicionar({ p: 5 }).adicionar({ p: 10 }).adicionar({ p: 1 });
  assertEqual(l.ordenarPor("p", true).map(x => x.p), [10, 5, 1]);
});
teste("Lista remove item", () => {
  const l = new Lista();
  const o = { id: 1 };
  l.adicionar(o).remover(o);
  assertEqual(l.tamanho, 0);
});
