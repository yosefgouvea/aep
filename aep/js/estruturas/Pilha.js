/**
 * ESTRUTURA DE DADOS: PILHA (LIFO)
 * Onde: histórico de ações de cada Usuario.
 * Por quê: a ação mais recente fica no topo (último a entrar, primeiro a sair).
 */
class Pilha {
  #itens = [];
  empilhar(item) { this.#itens.push(item); return this; }
  desempilhar() { return this.#itens.length ? this.#itens.pop() : null; }
  get topo() { return this.#itens.length ? this.#itens[this.#itens.length - 1] : null; }
  get vazia() { return this.#itens.length === 0; }
  get tamanho() { return this.#itens.length; }
  toArray() { return [...this.#itens]; }            // base -> topo
  recentes() { return [...this.#itens].reverse(); } // topo -> base (para exibir)
}

if (typeof module !== "undefined" && module.exports) { module.exports = { Pilha }; }
