class Medalha {
  constructor(id, nome, icone, criterio) {
    this.id = id;
    this.nome = nome;
    this.icone = icone;
    this.criterio = criterio; // função (usuario) => boolean
    this.desbloqueada = false;
  }
  verificar(usuario) { return this.criterio(usuario); }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { Medalha }; }
