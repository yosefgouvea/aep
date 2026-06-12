// Popula um SistemaReciclagem com pontos de coleta, recompensas, medalhas e usuários demo.
// Depende de classes globais (carregadas via <script> antes deste arquivo).
function carregarSeed(sistema) {
  // Pontos de coleta (coordenadas em São Paulo como exemplo)
  sistema.pontosColeta = [
    new PontoColeta(1, "Eco Ponto Centro", "Praça da Sé, 100", -23.5505, -46.6333, ["plastico", "papel", "vidro", "metal"]),
    new PontoColeta(2, "Recicla Paulista", "Av. Paulista, 1500", -23.5614, -46.6559, ["plastico", "papel", "eletronico"]),
    new PontoColeta(3, "Verde Pinheiros", "R. dos Pinheiros, 200", -23.5670, -46.7010, ["vidro", "metal"]),
    new PontoColeta(4, "EcoVila Madalena", "R. Aspicuelta, 50", -23.5546, -46.6900, ["plastico", "papel", "vidro", "metal", "eletronico"]),
  ];

  // Recompensas de parceiros (polimorfismo: descontos e brindes)
  sistema.recompensas = [
    new RecompensaDesconto(1, "10% Café Verde", "Café Verde", 100, 10),
    new RecompensaDesconto(2, "20% Mercado Bio", "Mercado Bio", 250, 20),
    new RecompensaBrinde(3, "Ecobag exclusiva", "EcoStore", 200, "ecobag"),
    new RecompensaBrinde(4, "Garrafa reutilizável", "EcoStore", 400, "garrafa reutilizável"),
  ];

  // Medalhas / conquistas
  sistema.medalhas = [
    new Medalha("primeiro", "Primeiro Passo", "🌱", u => u.kgReciclados >= 1),
    new Medalha("dez_kg", "Reciclador Dedicado", "♻️", u => u.kgReciclados >= 10),
    new Medalha("nivel2", "Eco-Guerreiro", "🛡️", u => u.nivel === "Eco-Guerreiro" || u.nivel === "Guardião do Planeta"),
    new Medalha("mil_pts", "Mil Pontos", "⭐", u => u.pontos >= 1000),
  ];

  // Usuários demo (para o ranking não nascer vazio)
  if (sistema.usuarios.tamanho === 0) {
    const demo = [
      ["Mariana Silva", "mariana@demo.com", "demo", 2380],
      ["João Pereira", "joao@demo.com", "demo", 1450],
      ["Carla Souza", "carla@demo.com", "demo", 980],
      ["Pedro Almeida", "pedro@demo.com", "demo", 540],
      ["Beatriz Lima", "beatriz@demo.com", "demo", 180],
    ];
    for (const [nome, email, senha, pts] of demo) {
      const u = sistema.cadastrarUsuario(nome, email, senha);
      u.adicionarPontos(pts);
      u.adicionarKg(pts / 50);
      sistema.verificarMedalhas(u);
    }
  }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { carregarSeed }; }
