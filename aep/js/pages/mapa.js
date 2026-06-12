const usuarioMapa = exigirLogin();
if (usuarioMapa) {
  ligarSair();
  const NOMES = { plastico: "Plástico", papel: "Papel", vidro: "Vidro", metal: "Metal", eletronico: "Eletrônico" };

  let pontoSelecionado = null;
  const modal = document.getElementById("modal");
  const selMaterial = document.getElementById("d-material");

  function abrirModal(ponto) {
    pontoSelecionado = ponto;
    document.getElementById("modal-titulo").textContent = "Registrar descarte — " + ponto.nome;
    selMaterial.innerHTML = ponto.materiaisAceitos.map(ch => `<option value="${ch}">${NOMES[ch]}</option>`).join("");
    document.getElementById("d-peso").value = "";
    document.getElementById("d-erro").textContent = "";
    modal.style.display = "flex";
  }
  document.getElementById("d-cancelar").onclick = () => { modal.style.display = "none"; };

  // 1) Lista lateral de pontos — NÃO depende do mapa/internet (funcionalidade essencial sempre disponível).
  const lista = document.getElementById("lista-pontos");
  for (const p of sistema.pontosColeta) {
    const materiaisTxt = p.materiaisAceitos.map(ch => NOMES[ch]).join(", ");
    const card = document.createElement("div");
    card.className = "card";
    card.style.marginBottom = "10px";
    card.innerHTML = `<strong>${p.nome}</strong><br><span class="subtitulo">${p.endereco}</span><br><span class="tag">${materiaisTxt}</span>`;
    const btn = document.createElement("button");
    btn.className = "btn mt"; btn.textContent = "Registrar descarte";
    btn.onclick = () => { if (window.__mapa) window.__mapa.setView([p.lat, p.lng], 15); abrirModal(p); };
    card.appendChild(btn);
    lista.appendChild(card);
  }

  // 2) Mapa Leaflet — aprimoramento progressivo. Se o Leaflet (CDN) ou os tiles falharem
  //    (ex.: sem internet), mostramos uma mensagem e a lista ao lado continua funcionando.
  const divMapa = document.getElementById("mapa");
  function avisoMapa(texto) {
    divMapa.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;
      padding:24px;text-align:center;color:var(--suave);background:#eef2f0;border-radius:var(--raio)">
      <div>🗺️<br><br>${texto}<br><br>Use a lista de pontos ao lado para registrar seus descartes normalmente.</div></div>`;
  }

  if (typeof L === "undefined") {
    avisoMapa("Não foi possível carregar a biblioteca do mapa (precisa de internet).");
  } else {
    try {
      const centro = sistema.pontosColeta[0];
      const mapa = L.map("mapa").setView([centro.lat, centro.lng], 13);
      window.__mapa = mapa;

      const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      });

      // Detecta falha de carregamento dos tiles (offline/bloqueio) e avisa uma única vez.
      let avisou = false;
      tiles.on("tileerror", () => {
        if (avisou) return;
        avisou = true;
        avisoMapa("O mapa precisa de internet para exibir as ruas.");
      });
      tiles.addTo(mapa);

      // Marcadores dos pontos de coleta.
      for (const p of sistema.pontosColeta) {
        const materiaisTxt = p.materiaisAceitos.map(ch => NOMES[ch]).join(", ");
        L.marker([p.lat, p.lng]).addTo(mapa)
          .bindPopup(`<strong>${p.nome}</strong><br>${p.endereco}<br><em>${materiaisTxt}</em>`)
          .on("click", () => abrirModal(p));
      }

      // Corrige o tamanho do mapa caso o container só ganhe dimensões após o load.
      window.addEventListener("load", () => mapa.invalidateSize());
      setTimeout(() => mapa.invalidateSize(), 300);
    } catch (ex) {
      avisoMapa("Não foi possível inicializar o mapa.");
    }
  }

  // 3) Submeter descarte → entra na fila.
  document.getElementById("form-descarte").onsubmit = (e) => {
    e.preventDefault();
    const erro = document.getElementById("d-erro");
    const peso = parseFloat(document.getElementById("d-peso").value);
    if (!(peso > 0)) { erro.textContent = "Informe um peso maior que zero."; return; }
    try {
      const material = criarMaterial(selMaterial.value);
      sistema.registrarDescarte(usuarioMapa, pontoSelecionado, material, peso);
      sistema.salvarEm(CHAVE_SAVE);
      modal.style.display = "none";
      alert("Descarte registrado! Ele está na fila — confirme no Histórico para ganhar os pontos.");
    } catch (ex) { erro.textContent = ex.message; }
  };
}
