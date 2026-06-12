const usuarioRec = exigirLogin();
if (usuarioRec) {
  ligarSair();

  function renderizar() {
    document.getElementById("meus-pontos").textContent = usuarioRec.pontos;
    const el = document.getElementById("recompensas");
    el.innerHTML = "";
    for (const r of sistema.recompensas) {
      const pode = r.podeResgatar(usuarioRec);
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<span class="tag">${r.parceiro}</span>
        <h3 class="mt">${r.nome}</h3>
        <p class="subtitulo">${r.descricao()}</p>
        <p class="mt"><strong>${r.custoPontos} pts</strong></p>`;
      const btn = document.createElement("button");
      btn.className = "btn mt";
      btn.textContent = pode ? "Resgatar" : "Pontos insuficientes";
      btn.disabled = !pode;
      btn.onclick = () => {
        try {
          const msg = sistema.resgatarRecompensa(usuarioRec, r.id);
          sistema.salvarEm(CHAVE_SAVE);
          alert("✅ " + msg);
          renderizar();
        } catch (ex) { alert(ex.message); }
      };
      card.appendChild(btn);
      el.appendChild(card);
    }
  }
  renderizar();
}
