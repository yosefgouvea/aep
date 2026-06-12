/** Wrapper de localStorage com tratamento de erro e (de)serialização JSON. */
const Storage = {
  salvar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
    catch (e) { console.error("Falha ao salvar:", e); return false; }
  },
  carregar(chave, padrao = null) {
    try { const v = localStorage.getItem(chave); return v === null ? padrao : JSON.parse(v); }
    catch (e) { console.error("Falha ao carregar:", e); return padrao; }
  },
  remover(chave) { try { localStorage.removeItem(chave); } catch (_) {} },
};

if (typeof module !== "undefined" && module.exports) { module.exports = { Storage }; }
