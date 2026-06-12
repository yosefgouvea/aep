/** POO: Herança + Polimorfismo — subtipos definem benefício e descrição próprios. */
class Recompensa {
  constructor(id, nome, parceiro, custoPontos) {
    if (new.target === Recompensa) throw new Error("Recompensa e abstrata");
    this.id = id;
    this.nome = nome;
    this.parceiro = parceiro;
    this.custoPontos = custoPontos;
  }
  podeResgatar(usuario) { return usuario.pontos >= this.custoPontos; }
  resgatar(usuario) {
    if (!this.podeResgatar(usuario)) throw new Error("Pontos insuficientes");
    usuario.gastarPontos(this.custoPontos);
    return this.aplicarBeneficio(usuario);
  }
  descricao() { throw new Error("Metodo abstrato: descricao"); }
  aplicarBeneficio(_usuario) { throw new Error("Metodo abstrato: aplicarBeneficio"); }
}

class RecompensaDesconto extends Recompensa {
  constructor(id, nome, parceiro, custoPontos, percentual) {
    super(id, nome, parceiro, custoPontos);
    this.percentual = percentual;
  }
  descricao() { return `${this.percentual}% de desconto em ${this.parceiro}`; }
  aplicarBeneficio(_u) { return `Cupom de ${this.percentual}% gerado para ${this.parceiro}`; }
}

class RecompensaBrinde extends Recompensa {
  constructor(id, nome, parceiro, custoPontos, brinde) {
    super(id, nome, parceiro, custoPontos);
    this.brinde = brinde;
  }
  descricao() { return `Brinde: ${this.brinde} em ${this.parceiro}`; }
  aplicarBeneficio(_u) { return `Voucher de ${this.brinde} gerado para ${this.parceiro}`; }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { Recompensa, RecompensaDesconto, RecompensaBrinde };
}
