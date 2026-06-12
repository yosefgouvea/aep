const usuarioHist = exigirLogin();
if (usuarioHist) {
  ligarSair();

  function renderizar() {
    // Fila (somente descartes do usuário logado, em ordem de chegada)
    const fila = sistema.filaDescartes.toArray().filter(d => d.usuario.email === usuarioHist.email);
    document.getElementById("fila-qtd").textContent = fila.length;
    const fEl = document.getElementById("fila");
    fEl.innerHTML = fila.length
      ? fila.map(d => `<div class="ranking-item"><span>${d.material.nome} — ${d.pesoKg}kg em ${d.pontoColeta.nome}</span><span class="tag">pendente</span></div>`).join("")
      : '<p class="subtitulo">Nenhum descarte pendente. Registre um no Mapa.</p>';

    // Histórico (Pilha) — recentes primeiro
    const acoes = usuarioHist.historico.recentes();
    const hEl = document.getElementById("historico");
    hEl.innerHTML = acoes.length
      ? acoes.map(a => `<div class="ranking-item"><span>${a.descricao}</span><span class="subtitulo">${new Date(a.data).toLocaleString("pt-BR")}</span></div>`).join("")
      : '<p class="subtitulo">Sem ações ainda.</p>';
  }

  document.getElementById("btn-processar").onclick = () => {
    const d = sistema.processarProximo();
    sistema.salvarEm(CHAVE_SAVE);
    if (d) renderizar(); else alert("A fila está vazia.");
  };
  document.getElementById("btn-processar-tudo").onclick = () => {
    const r = sistema.processarFila();
    sistema.salvarEm(CHAVE_SAVE);
    if (r.length) renderizar(); else alert("A fila está vazia.");
  };

  renderizar();
}
