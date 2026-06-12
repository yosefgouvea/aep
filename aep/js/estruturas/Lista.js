/**
 * ESTRUTURA DE DADOS: LISTA
 * Onde: armazena os usuários cadastrados (SistemaReciclagem) e é base do ranking.
 * Por quê: coleção dinâmica com inserção, busca e ordenação.
 */
class Lista {
  #itens = [];
  adicionar(item) { this.#itens.push(item); return this; }
  remover(item) { const i = this.#itens.indexOf(item); if (i >= 0) this.#itens.splice(i, 1); return this; }
  buscar(predicado) { const r = this.#itens.find(predicado); return r === undefined ? null : r; }
  filtrar(predicado) { return this.#itens.filter(predicado); }
  ordenarPor(chave, desc = false) {
    return [...this.#itens].sort((a, b) => desc ? b[chave] - a[chave] : a[chave] - b[chave]);
  }
  get tamanho() { return this.#itens.length; }
  toArray() { return [...this.#itens]; }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { Lista }; }
