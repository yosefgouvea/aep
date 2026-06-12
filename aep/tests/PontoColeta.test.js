// tests/PontoColeta.test.js
const { teste, assert, assertEqual } = require("./run.js");
const { PontoColeta } = require("../js/models/PontoColeta.js");

teste("PontoColeta sabe quais materiais aceita", () => {
  const p = new PontoColeta(1, "Eco Ponto", "Rua A", -23.5, -46.6, ["plastico", "vidro"]);
  assert(p.aceita("plastico"));
  assert(!p.aceita("metal"));
});

teste("PontoColeta encapsula atributos (campos privados com getters)", () => {
  const p = new PontoColeta(7, "Eco X", "Rua B", -23.1, -46.2, ["papel"]);
  assertEqual(p.id, 7);
  assertEqual(p.nome, "Eco X");
  assertEqual(p.endereco, "Rua B");
  assertEqual(p.lat, -23.1);
  assertEqual(p.lng, -46.2);
  assertEqual(p.materiaisAceitos, ["papel"]);
  // campos privados (#) não aparecem como propriedades próprias enumeráveis
  assertEqual(Object.keys(p), []);
});
