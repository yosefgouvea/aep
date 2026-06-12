const usuario = exigirLogin();
if (usuario) {
  ligarSair();
  const r1 = (n) => Math.round(n * 10) / 10;

  document.getElementById("saudacao").textContent = `Olá, ${usuario.nome}! 🌱`;
  document.getElementById("m-pontos").textContent = usuario.pontos;
  document.getElementById("m-nivel").textContent = usuario.nivel;
  document.getElementById("m-kg").textContent = r1(usuario.kgReciclados);

  const pct = Math.min(100, Math.round((usuario.kgReciclados / usuario.metaMensalKg) * 100));
  document.getElementById("meta-barra").style.width = pct + "%";
  document.getElementById("meta-texto").textContent = `${r1(usuario.kgReciclados)} de ${usuario.metaMensalKg} kg (${pct}%)`;

  const imp = usuario.impacto;
  document.getElementById("i-co2").textContent = r1(imp.co2);
  document.getElementById("i-agua").textContent = r1(imp.agua);
  document.getElementById("i-arvores").textContent = r1(imp.arvores);

  const cont = document.getElementById("medalhas");
  for (const m of sistema.medalhas) {
    const tem = usuario.medalhas.some(x => x.id === m.id);
    const div = document.createElement("div");
    div.className = "medalha" + (tem ? "" : " bloqueada");
    div.innerHTML = `<span class="icone">${m.icone}</span><span class="nome">${m.nome}</span>`;
    cont.appendChild(div);
  }
}
