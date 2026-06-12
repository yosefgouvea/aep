/** POO: Encapsulamento — estado protegido por campos privados (#). O status só transita via confirmar(). */
class Descarte {
  #id; #usuario; #pontoColeta; #material; #pesoKg; #data; #status; #pontosGerados; #impacto;

  constructor(id, usuario, pontoColeta, material, pesoKg) {
    this.#id = id;
    this.#usuario = usuario;
    this.#pontoColeta = pontoColeta;
    this.#material = material;          // instância de Material (polimorfismo)
    this.#pesoKg = pesoKg;
    this.#data = new Date();
    this.#status = "pendente";
    this.#pontosGerados = 0;
    this.#impacto = { co2: 0, agua: 0, arvores: 0 };
  }

  get id() { return this.#id; }
  get usuario() { return this.#usuario; }
  get pontoColeta() { return this.#pontoColeta; }
  get material() { return this.#material; }
  get pesoKg() { return this.#pesoKg; }
  get data() { return this.#data; }
  get status() { return this.#status; }
  get pontosGerados() { return this.#pontosGerados; }
  get impacto() { return { ...this.#impacto }; }

  confirmar() {
    this.#pontosGerados = this.#material.calcularPontos(this.#pesoKg);
    this.#impacto = this.#material.calcularImpacto(this.#pesoKg);
    this.#status = "confirmado";
    return this;
  }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { Descarte }; }
