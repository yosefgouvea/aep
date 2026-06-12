/**
 * ESTRUTURA DE DADOS: FILA (FIFO)
 * Onde: descartes pendentes de validação no SistemaReciclagem.
 * Por quê: processar os descartes na ordem de chegada (primeiro a entrar, primeiro a sair).
 */
class Fila {
  #itens = [];
  enfileirar(item) { this.#itens.push(item); return this; }
  desenfileirar() { return this.#itens.length ? this.#itens.shift() : null; }
  get frente() { return this.#itens.length ? this.#itens[0] : null; }
  get vazia() { return this.#itens.length === 0; }
  get tamanho() { return this.#itens.length; }
  toArray() { return [...this.#itens]; }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { Fila }; }
