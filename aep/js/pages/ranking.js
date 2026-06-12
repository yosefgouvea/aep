ligarSair();
const logado = sistema.usuarioLogado; // ranking é público; destaca o logado se houver
const ranking = sistema.gerarRanking();
const medalhas = ["🥇", "🥈", "🥉"];
const el = document.getElementById("ranking");

el.innerHTML = ranking.map((u, i) => {
  const eu = logado && u.email === logado.email ? " eu" : "";
  const pos = medalhas[i] || (i + 1);
  return `<div class="ranking-item${eu}">
    <span class="pos">${pos}</span>
    <span style="flex:1"><strong>${u.nome}</strong><br><span class="subtitulo">${u.nivel}</span></span>
    <span><strong>${u.pontos}</strong> pts</span>
  </div>`;
}).join("");
