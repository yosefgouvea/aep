// Bootstrap compartilhado: reconstrói o sistema do Storage, aplica seed se necessário.
const CHAVE_SAVE = "ecorecicla_save";

function inicializarSistema() {
  const s = new SistemaReciclagem();
  carregarSeed(s);                 // pontos/recompensas/medalhas + demo (se vazio)
  const tinha = s.carregarDe(CHAVE_SAVE); // sobrescreve usuários/fila se houver save
  if (!tinha) s.salvarEm(CHAVE_SAVE);
  return s;
}

const sistema = inicializarSistema();

const formLogin = document.getElementById("form-login");
const formCadastro = document.getElementById("form-cadastro");
if (formLogin && formCadastro) {
  document.getElementById("aba-login").onclick = () => { formLogin.style.display = ""; formCadastro.style.display = "none"; };
  document.getElementById("aba-cadastro").onclick = () => { formLogin.style.display = "none"; formCadastro.style.display = ""; };

  formLogin.onsubmit = (e) => {
    e.preventDefault();
    const erro = document.getElementById("login-erro");
    try {
      sistema.login(document.getElementById("login-email").value.trim(), document.getElementById("login-senha").value);
      sistema.salvarEm(CHAVE_SAVE);
      window.location.href = "dashboard.html";
    } catch (ex) { erro.textContent = ex.message; }
  };

  formCadastro.onsubmit = (e) => {
    e.preventDefault();
    const erro = document.getElementById("cad-erro");
    const senha = document.getElementById("cad-senha").value;
    if (senha.length < 4) { erro.textContent = "A senha precisa de pelo menos 4 caracteres."; return; }
    try {
      const u = sistema.cadastrarUsuario(
        document.getElementById("cad-nome").value.trim(),
        document.getElementById("cad-email").value.trim(),
        senha
      );
      sistema.login(u.email, senha);
      sistema.salvarEm(CHAVE_SAVE);
      window.location.href = "dashboard.html";
    } catch (ex) { erro.textContent = ex.message; }
  };
}

// Helper de sessão usado por todas as páginas protegidas
function exigirLogin() {
  if (!sistema.usuarioLogado) { window.location.href = "login.html"; return null; }
  return sistema.usuarioLogado;
}
function ligarSair() {
  const sair = document.getElementById("sair");
  if (sair) sair.onclick = (e) => { e.preventDefault(); sistema.logout(); sistema.salvarEm(CHAVE_SAVE); window.location.href = "index.html"; };
}
