/**
 * POO: Abstração (classe-base), Herança (subtipos) e Polimorfismo (calcularImpacto sobrescrito).
 * Cada material tem fatores próprios de pontos e de impacto ambiental.
 */
class Material {
  constructor(nome, fatorPontos) {
    if (new.target === Material) throw new Error("Material e uma classe abstrata");
    this.nome = nome;
    this.fatorPontos = fatorPontos;
  }
  calcularPontos(pesoKg) { return Math.round(pesoKg * this.fatorPontos); }
  // Retorna { co2 (kg evitado), agua (litros), arvores (equivalente) }
  calcularImpacto(_pesoKg) { throw new Error("Metodo abstrato: calcularImpacto"); }
}

class Plastico extends Material {
  constructor() { super("Plástico", 10); }
  calcularImpacto(p) { return { co2: p * 1.5, agua: p * 100, arvores: p * 0.02 }; }
}
class Papel extends Material {
  constructor() { super("Papel", 8); }
  calcularImpacto(p) { return { co2: p * 1.1, agua: p * 50, arvores: p * 0.017 }; }
}
class Vidro extends Material {
  constructor() { super("Vidro", 6); }
  calcularImpacto(p) { return { co2: p * 0.3, agua: p * 20, arvores: 0 }; }
}
class Metal extends Material {
  constructor() { super("Metal", 12); }
  calcularImpacto(p) { return { co2: p * 4, agua: p * 150, arvores: 0 }; }
}
class Eletronico extends Material {
  constructor() { super("Eletrônico", 20); }
  calcularImpacto(p) { return { co2: p * 5, agua: p * 200, arvores: 0 }; }
}

const MATERIAIS = { plastico: Plastico, papel: Papel, vidro: Vidro, metal: Metal, eletronico: Eletronico };
function criarMaterial(chave) {
  const C = MATERIAIS[chave];
  if (!C) throw new Error("Material desconhecido: " + chave);
  return new C();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { Material, Plastico, Papel, Vidro, Metal, Eletronico, MATERIAIS, criarMaterial };
}
