// tests/Recompensa.test.js
const { teste, assert, assertEqual, assertThrows } = require("./run.js");
const { Recompensa, RecompensaDesconto, RecompensaBrinde } = require("../js/models/Recompensa.js");
const { Usuario } = require("../js/models/Usuario.js");

teste("Recompensa e abstrata", () => { assertThrows(() => new Recompensa(1, "x", "y", 10)); });

teste("Polimorfismo na descricao das recompensas", () => {
  const d = new RecompensaDesconto(1, "Desc10", "Cafe Verde", 100, 10);
  const b = new RecompensaBrinde(2, "Eco Bag", "Mercado Bio", 200, "ecobag");
  assert(d.descricao().includes("%"));
  assert(b.descricao().toLowerCase().includes("ecobag"));
});

teste("Resgatar desconta pontos e exige saldo", () => {
  const u = new Usuario("Ana", "a@x.com", "1");
  const d = new RecompensaDesconto(1, "Desc10", "Cafe Verde", 100, 10);
  assertThrows(() => d.resgatar(u));     // sem pontos
  u.adicionarPontos(150);
  const msg = d.resgatar(u);
  assertEqual(u.pontos, 50);
  assert(msg.includes("Cafe Verde"));
});
