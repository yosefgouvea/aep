/** POO: Encapsulamento — atributos protegidos por campos privados (#), expostos via getters. */
class PontoColeta {
  #id; #nome; #endereco; #lat; #lng; #materiaisAceitos;

  constructor(id, nome, endereco, lat, lng, materiaisAceitos) {
    this.#id = id;
    this.#nome = nome;
    this.#endereco = endereco;
    this.#lat = lat;
    this.#lng = lng;
    this.#materiaisAceitos = materiaisAceitos; // array de chaves: "plastico", "vidro", ...
  }

  get id() { return this.#id; }
  get nome() { return this.#nome; }
  get endereco() { return this.#endereco; }
  get lat() { return this.#lat; }
  get lng() { return this.#lng; }
  get materiaisAceitos() { return [...this.#materiaisAceitos]; }

  aceita(chaveMaterial) { return this.#materiaisAceitos.includes(chaveMaterial); }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { PontoColeta }; }
