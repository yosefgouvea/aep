# EcoRecicla — Plano de Implementação

> **Para executores agênticos:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar este plano tarefa a tarefa. Os passos usam caixas de seleção (`- [ ]`) para acompanhamento.

**Goal:** Construir o EcoRecicla, uma aplicação web 100% front-end (HTML/CSS/JS puro) de incentivo à reciclagem com gamificação, alinhada à ODS 12.

**Architecture:** Vanilla HTML/CSS/JS sem build. Classes POO em arquivos `.js` separados, carregadas via `<script>` (roda abrindo o `index.html` com clique duplo). Persistência em `localStorage`. Mapa via Leaflet/OpenStreetMap (CDN). Cada arquivo de classe exporta para Node (`module.exports`) e fica global no navegador, permitindo TDD com Node nas classes de lógica pura.

**Tech Stack:** HTML5, CSS3 (tema vibrante/gamificado), JavaScript ES2022 (classes, campos privados `#`), Leaflet, localStorage, Node.js (apenas para rodar os testes de lógica).

---

## Convenções (ler antes de começar)

**Padrão de exportação dupla** — toda classe termina com:
```js
if (typeof module !== "undefined" && module.exports) { module.exports = { /* Classe(s) */ }; }
```
No navegador o `class` no topo do arquivo já é global; no Node o `require` pega o export.

**Rodar os testes de lógica (Node):**
```bash
node tests/run.js
```
`tests/run.js` é um runner mínimo (criado na Task 1) com `assert`/`assertEqual`/`teste` e um resumo de ✅/❌.

**Commits:** um commit por tarefa concluída (a tarefa diz o comando). Se a pasta ainda não for um repositório git, a Task 0 inicializa.

**Idioma:** todo código-fonte, comentários e documentação em **português**.

---

## Estrutura de arquivos

```
aep/
├── index.html            login.html  dashboard.html  mapa.html
├── historico.html        ranking.html  recompensas.html  tests.html
├── css/style.css
├── js/
│   ├── estruturas/  Lista.js  Fila.js  Pilha.js
│   ├── models/      Material.js  Recompensa.js  Usuario.js
│   │                PontoColeta.js  Descarte.js  Medalha.js  SistemaReciclagem.js
│   ├── services/    Storage.js
│   ├── data/        seed.js
│   └── pages/       login.js  dashboard.js  mapa.js  historico.js  ranking.js  recompensas.js
├── tests/           run.js  (+ um arquivo *.test.js por classe de lógica)
└── docs/            documentacao.md  (+ o spec e este plano já existentes)
```

---

## Task 0: Scaffolding do projeto

**Files:**
- Create: `tests/run.js`
- Create: pastas `css/`, `js/estruturas/`, `js/models/`, `js/services/`, `js/data/`, `js/pages/`, `tests/`

- [ ] **Step 1: Criar as pastas**

```bash
mkdir css js js/estruturas js/models js/services js/data js/pages tests
```

- [ ] **Step 2: Criar o runner de testes `tests/run.js`**

```js
// Runner de testes mínimo para Node — sem dependências externas.
// Uso: node tests/run.js
const path = require("path");

let total = 0, passou = 0;
const falhas = [];

function teste(nome, fn) {
  total++;
  try { fn(); passou++; console.log("  ✅ " + nome); }
  catch (e) { falhas.push(nome + " — " + e.message); console.log("  ❌ " + nome + " — " + e.message); }
}

function assert(cond, msg) { if (!cond) throw new Error(msg || "esperado verdadeiro"); }

function assertEqual(a, b, msg) {
  const sa = JSON.stringify(a), sb = JSON.stringify(b);
  if (sa !== sb) throw new Error((msg || "valores diferentes") + ` — obtido ${sa}, esperado ${sb}`);
}

function assertThrows(fn, msg) {
  let lancou = false;
  try { fn(); } catch (_) { lancou = true; }
  if (!lancou) throw new Error(msg || "esperava uma exceção");
}

module.exports = { teste, assert, assertEqual, assertThrows };

// Carrega todos os arquivos *.test.js da pasta tests/
const fs = require("fs");
const arquivos = fs.readdirSync(__dirname).filter(f => f.endsWith(".test.js"));
console.log(`\nRodando ${arquivos.length} arquivo(s) de teste...\n`);
for (const arq of arquivos) {
  console.log("▸ " + arq);
  require(path.join(__dirname, arq));
}
console.log(`\nResultado: ${passou}/${total} passaram.`);
if (falhas.length) { console.log("Falhas:\n  - " + falhas.join("\n  - ")); process.exit(1); }
```

- [ ] **Step 3: Inicializar git e fazer o primeiro commit**

```bash
git init
printf "node_modules/\n.superpowers/\n" > .gitignore
git add .
git commit -m "chore: scaffolding do projeto EcoRecicla"
```
Expected: repositório criado, commit inicial feito.

---

## Task 1: Estrutura de dados — Lista

**Files:**
- Create: `js/estruturas/Lista.js`
- Test: `tests/Lista.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
// tests/Lista.test.js
const { teste, assert, assertEqual } = require("./run.js");
const { Lista } = require("../js/estruturas/Lista.js");

teste("Lista adiciona e conta itens", () => {
  const l = new Lista();
  l.adicionar("a").adicionar("b");
  assertEqual(l.tamanho, 2);
});
teste("Lista busca por predicado", () => {
  const l = new Lista();
  l.adicionar({ id: 1 }).adicionar({ id: 2 });
  assertEqual(l.buscar(x => x.id === 2).id, 2);
  assertEqual(l.buscar(x => x.id === 9), null);
});
teste("Lista ordena por chave (desc)", () => {
  const l = new Lista();
  l.adicionar({ p: 5 }).adicionar({ p: 10 }).adicionar({ p: 1 });
  assertEqual(l.ordenarPor("p", true).map(x => x.p), [10, 5, 1]);
});
teste("Lista remove item", () => {
  const l = new Lista();
  const o = { id: 1 };
  l.adicionar(o).remover(o);
  assertEqual(l.tamanho, 0);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/run.js`
Expected: FALHA — `Cannot find module '../js/estruturas/Lista.js'`.

- [ ] **Step 3: Implementar `js/estruturas/Lista.js`**

```js
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node tests/run.js`
Expected: os 4 testes de Lista passam (✅).

- [ ] **Step 5: Commit**

```bash
git add js/estruturas/Lista.js tests/Lista.test.js
git commit -m "feat: estrutura de dados Lista"
```

---

## Task 2: Estrutura de dados — Fila (FIFO)

**Files:**
- Create: `js/estruturas/Fila.js`
- Test: `tests/Fila.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
// tests/Fila.test.js
const { teste, assert, assertEqual } = require("./run.js");
const { Fila } = require("../js/estruturas/Fila.js");

teste("Fila respeita FIFO", () => {
  const f = new Fila();
  f.enfileirar("a").enfileirar("b").enfileirar("c");
  assertEqual(f.desenfileirar(), "a");
  assertEqual(f.desenfileirar(), "b");
  assertEqual(f.tamanho, 1);
});
teste("Fila frente nao remove", () => {
  const f = new Fila();
  f.enfileirar("x");
  assertEqual(f.frente, "x");
  assertEqual(f.tamanho, 1);
});
teste("Fila vazia retorna null e flag", () => {
  const f = new Fila();
  assert(f.vazia);
  assertEqual(f.desenfileirar(), null);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/run.js`
Expected: FALHA — módulo `Fila.js` não encontrado.

- [ ] **Step 3: Implementar `js/estruturas/Fila.js`**

```js
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node tests/run.js`
Expected: testes de Fila passam.

- [ ] **Step 5: Commit**

```bash
git add js/estruturas/Fila.js tests/Fila.test.js
git commit -m "feat: estrutura de dados Fila (FIFO)"
```

---

## Task 3: Estrutura de dados — Pilha (LIFO)

**Files:**
- Create: `js/estruturas/Pilha.js`
- Test: `tests/Pilha.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
// tests/Pilha.test.js
const { teste, assert, assertEqual } = require("./run.js");
const { Pilha } = require("../js/estruturas/Pilha.js");

teste("Pilha respeita LIFO", () => {
  const p = new Pilha();
  p.empilhar(1).empilhar(2).empilhar(3);
  assertEqual(p.desempilhar(), 3);
  assertEqual(p.topo, 2);
  assertEqual(p.tamanho, 2);
});
teste("Pilha vazia retorna null", () => {
  const p = new Pilha();
  assert(p.vazia);
  assertEqual(p.desempilhar(), null);
});
teste("Pilha recentes() devolve do topo para a base", () => {
  const p = new Pilha();
  p.empilhar("velho").empilhar("novo");
  assertEqual(p.recentes(), ["novo", "velho"]);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/run.js`
Expected: FALHA — módulo `Pilha.js` não encontrado.

- [ ] **Step 3: Implementar `js/estruturas/Pilha.js`**

```js
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node tests/run.js`
Expected: testes de Pilha passam.

- [ ] **Step 5: Commit**

```bash
git add js/estruturas/Pilha.js tests/Pilha.test.js
git commit -m "feat: estrutura de dados Pilha (LIFO)"
```

---

## Task 4: Material (abstrata) + subclasses — Herança/Polimorfismo

**Files:**
- Create: `js/models/Material.js`
- Test: `tests/Material.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
// tests/Material.test.js
const { teste, assert, assertEqual, assertThrows } = require("./run.js");
const { Material, Plastico, Papel, Vidro, Metal, Eletronico, criarMaterial } = require("../js/models/Material.js");

teste("Material e abstrata (nao instanciavel)", () => {
  assertThrows(() => new Material("x", 1));
});
teste("Plastico calcula pontos = peso * fator", () => {
  assertEqual(new Plastico().calcularPontos(2), 20); // fator 10
});
teste("Polimorfismo: cada material tem impacto diferente", () => {
  const co2Plastico = new Plastico().calcularImpacto(1).co2;
  const co2Metal = new Metal().calcularImpacto(1).co2;
  assert(co2Plastico !== co2Metal, "impactos deveriam diferir");
});
teste("criarMaterial monta pela chave", () => {
  assertEqual(criarMaterial("vidro").nome, "Vidro");
  assert(criarMaterial("metal") instanceof Material);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/run.js`
Expected: FALHA — módulo `Material.js` não encontrado.

- [ ] **Step 3: Implementar `js/models/Material.js`**

```js
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node tests/run.js`
Expected: testes de Material passam.

- [ ] **Step 5: Commit**

```bash
git add js/models/Material.js tests/Material.test.js
git commit -m "feat: hierarquia Material com polimorfismo de impacto"
```

---

## Task 5: Usuario — Encapsulamento

**Files:**
- Create: `js/models/Usuario.js`
- Test: `tests/Usuario.test.js`

> Carrega `Pilha` (Task 3). No Node, `require`; no navegador, a tag `<script>` da Pilha vem antes.

- [ ] **Step 1: Escrever o teste que falha**

```js
// tests/Usuario.test.js
const { teste, assert, assertEqual, assertThrows } = require("./run.js");
const { Usuario } = require("../js/models/Usuario.js");

teste("Usuario inicia Iniciante com 0 pontos", () => {
  const u = new Usuario("Ana", "ana@x.com", "1234");
  assertEqual(u.pontos, 0);
  assertEqual(u.nivel, "Iniciante");
});
teste("Encapsulamento: senha nao e legivel diretamente", () => {
  const u = new Usuario("Ana", "ana@x.com", "1234");
  assertEqual(u.senha, undefined);
  assert(u.verificarSenha("1234"));
  assert(!u.verificarSenha("errada"));
});
teste("adicionarPontos sobe de nivel", () => {
  const u = new Usuario("Ana", "ana@x.com", "1234");
  u.adicionarPontos(250);
  assertEqual(u.nivel, "Reciclador");
  u.adicionarPontos(600);
  assertEqual(u.nivel, "Eco-Guerreiro");
});
teste("gastarPontos valida saldo", () => {
  const u = new Usuario("Ana", "ana@x.com", "1234");
  u.adicionarPontos(100);
  u.gastarPontos(40);
  assertEqual(u.pontos, 60);
  assertThrows(() => u.gastarPontos(999));
});
teste("registrarAcao empilha no historico", () => {
  const u = new Usuario("Ana", "ana@x.com", "1234");
  u.registrarAcao("fez algo");
  assertEqual(u.historico.topo.descricao, "fez algo");
});
teste("registrarImpacto e kg acumulam", () => {
  const u = new Usuario("Ana", "ana@x.com", "1234");
  u.registrarImpacto({ co2: 2, agua: 100, arvores: 0.1 });
  u.adicionarKg(3);
  assertEqual(u.impacto.co2, 2);
  assertEqual(u.kgReciclados, 3);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/run.js`
Expected: FALHA — módulo `Usuario.js` não encontrado.

- [ ] **Step 3: Implementar `js/models/Usuario.js`**

```js
// No Node, importa Pilha; no navegador, Pilha já é global.
if (typeof module !== "undefined" && module.exports) {
  var { Pilha } = require("../estruturas/Pilha.js");
}

/** POO: Encapsulamento — estado interno protegido por campos privados (#) e exposto via getters/métodos. */
class Usuario {
  #nome; #email; #senha; #pontos; #nivel; #medalhas; #metaMensalKg; #historico; #impacto; #kgReciclados;

  constructor(nome, email, senha) {
    this.#nome = nome;
    this.#email = email;
    this.#senha = Usuario.ofuscar(senha);
    this.#pontos = 0;
    this.#nivel = "Iniciante";
    this.#medalhas = [];
    this.#metaMensalKg = 20;
    this.#historico = new Pilha();
    this.#impacto = { co2: 0, agua: 0, arvores: 0 };
    this.#kgReciclados = 0;
  }

  // Ofuscação determinística (NÃO é segurança de produção — apenas evita guardar senha em texto puro).
  static ofuscar(txt) {
    let h = 0;
    for (const c of String(txt)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return "h" + h.toString(16);
  }

  get nome() { return this.#nome; }
  get email() { return this.#email; }
  get pontos() { return this.#pontos; }
  get nivel() { return this.#nivel; }
  get medalhas() { return [...this.#medalhas]; }
  get historico() { return this.#historico; }
  get metaMensalKg() { return this.#metaMensalKg; }
  get impacto() { return { ...this.#impacto }; }
  get kgReciclados() { return this.#kgReciclados; }

  verificarSenha(senha) { return this.#senha === Usuario.ofuscar(senha); }

  adicionarPontos(p) { this.#pontos += p; this.#nivel = this.#calcularNivel(); return this.#pontos; }
  gastarPontos(p) {
    if (p > this.#pontos) throw new Error("Pontos insuficientes");
    this.#pontos -= p; this.#nivel = this.#calcularNivel();
  }
  adicionarKg(kg) { this.#kgReciclados += kg; }
  registrarImpacto(imp) {
    this.#impacto.co2 += imp.co2;
    this.#impacto.agua += imp.agua;
    this.#impacto.arvores += imp.arvores;
  }
  registrarAcao(descricao) { this.#historico.empilhar({ descricao, data: new Date().toISOString() }); }
  desbloquearMedalha(medalha) {
    if (this.#medalhas.some(m => m.id === medalha.id)) return false;
    this.#medalhas.push(medalha); return true;
  }

  #calcularNivel() {
    if (this.#pontos >= 2000) return "Guardião do Planeta";
    if (this.#pontos >= 800) return "Eco-Guerreiro";
    if (this.#pontos >= 200) return "Reciclador";
    return "Iniciante";
  }

  // Serialização para persistência (usada na Task 10).
  toJSON() {
    return {
      nome: this.#nome, email: this.#email, senhaHash: this.#senha,
      pontos: this.#pontos, kgReciclados: this.#kgReciclados, impacto: { ...this.#impacto },
      medalhasIds: this.#medalhas.map(m => m.id), acoes: this.#historico.toArray(),
    };
  }
  static fromJSON(obj, catalogoMedalhas = []) {
    const u = new Usuario(obj.nome, obj.email, "");
    u.#senha = obj.senhaHash;
    u.#pontos = obj.pontos;
    u.#kgReciclados = obj.kgReciclados;
    u.#impacto = { ...obj.impacto };
    u.#nivel = u.#calcularNivel();
    u.#medalhas = catalogoMedalhas.filter(m => obj.medalhasIds.includes(m.id));
    for (const a of obj.acoes) u.#historico.empilhar(a);
    return u;
  }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { Usuario }; }
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node tests/run.js`
Expected: testes de Usuario passam.

- [ ] **Step 5: Commit**

```bash
git add js/models/Usuario.js tests/Usuario.test.js
git commit -m "feat: classe Usuario com encapsulamento e niveis"
```

---

## Task 6: PontoColeta + Descarte

**Files:**
- Create: `js/models/PontoColeta.js`
- Create: `js/models/Descarte.js`
- Test: `tests/PontoColeta.test.js`, `tests/Descarte.test.js`

- [ ] **Step 1: Escrever os testes que falham**

```js
// tests/PontoColeta.test.js
const { teste, assert, assertEqual } = require("./run.js");
const { PontoColeta } = require("../js/models/PontoColeta.js");

teste("PontoColeta sabe quais materiais aceita", () => {
  const p = new PontoColeta(1, "Eco Ponto", "Rua A", -23.5, -46.6, ["plastico", "vidro"]);
  assert(p.aceita("plastico"));
  assert(!p.aceita("metal"));
});
```

```js
// tests/Descarte.test.js
const { teste, assert, assertEqual } = require("./run.js");
const { Descarte } = require("../js/models/Descarte.js");
const { Plastico } = require("../js/models/Material.js");
const { PontoColeta } = require("../js/models/PontoColeta.js");
const { Usuario } = require("../js/models/Usuario.js");

teste("Descarte nasce pendente e confirma calculando pontos/impacto", () => {
  const u = new Usuario("Ana", "a@x.com", "1");
  const p = new PontoColeta(1, "P", "R", 0, 0, ["plastico"]);
  const d = new Descarte(1, u, p, new Plastico(), 2);
  assertEqual(d.status, "pendente");
  d.confirmar();
  assertEqual(d.status, "confirmado");
  assertEqual(d.pontosGerados, 20);          // 2kg * fator 10
  assert(d.impacto.co2 > 0);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/run.js`
Expected: FALHA — módulos `PontoColeta.js`/`Descarte.js` não encontrados.

- [ ] **Step 3: Implementar `js/models/PontoColeta.js`**

```js
class PontoColeta {
  constructor(id, nome, endereco, lat, lng, materiaisAceitos) {
    this.id = id;
    this.nome = nome;
    this.endereco = endereco;
    this.lat = lat;
    this.lng = lng;
    this.materiaisAceitos = materiaisAceitos; // array de chaves: "plastico", "vidro", ...
  }
  aceita(chaveMaterial) { return this.materiaisAceitos.includes(chaveMaterial); }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { PontoColeta }; }
```

- [ ] **Step 4: Implementar `js/models/Descarte.js`**

```js
class Descarte {
  constructor(id, usuario, pontoColeta, material, pesoKg) {
    this.id = id;
    this.usuario = usuario;
    this.pontoColeta = pontoColeta;
    this.material = material;          // instância de Material (polimorfismo)
    this.pesoKg = pesoKg;
    this.data = new Date();
    this.status = "pendente";
    this.pontosGerados = 0;
    this.impacto = { co2: 0, agua: 0, arvores: 0 };
  }
  confirmar() {
    this.pontosGerados = this.material.calcularPontos(this.pesoKg);
    this.impacto = this.material.calcularImpacto(this.pesoKg);
    this.status = "confirmado";
    return this;
  }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { Descarte }; }
```

- [ ] **Step 5: Rodar e ver passar**

Run: `node tests/run.js`
Expected: testes de PontoColeta e Descarte passam.

- [ ] **Step 6: Commit**

```bash
git add js/models/PontoColeta.js js/models/Descarte.js tests/PontoColeta.test.js tests/Descarte.test.js
git commit -m "feat: classes PontoColeta e Descarte"
```

---

## Task 7: Medalha + Recompensa (abstrata) e subtipos

**Files:**
- Create: `js/models/Medalha.js`
- Create: `js/models/Recompensa.js`
- Test: `tests/Medalha.test.js`, `tests/Recompensa.test.js`

- [ ] **Step 1: Escrever os testes que falham**

```js
// tests/Medalha.test.js
const { teste, assert, assertEqual } = require("./run.js");
const { Medalha } = require("../js/models/Medalha.js");
const { Usuario } = require("../js/models/Usuario.js");

teste("Medalha verifica criterio sobre o usuario", () => {
  const m = new Medalha("primeiro", "Primeiro Passo", "🌱", u => u.kgReciclados >= 1);
  const u = new Usuario("Ana", "a@x.com", "1");
  assert(!m.verificar(u));
  u.adicionarKg(2);
  assert(m.verificar(u));
});
```

```js
// tests/Recompensa.test.js
const { teste, assert, assertEqual, assertThrows } = require("./run.js");
const { Recompensa, RecompensaDesconto, RecompensaBrinde } = require("../js/models/Recompensa.js");
const { Usuario } = require("../js/models/Usuario.js");

teste("Recompensa e abstrata", () => { assertThrows(() => new Recompensa(1, "x", "y", 10)); });

teste("Polimorfismo na descricao das recompensas", () => {
  const d = new RecompensaDesconto(1, "Desc10", "Cafe Verde", 100, 10);
  const b = new RecompensaBrinde(2, "Eco Bag", "Mercado Bio", 200, "ecobag");
  assert(d.descricao().includes("%"));
  assert(b.descricao().toLowerCase().includes("ecobag"));
});

teste("Resgatar desconta pontos e exige saldo", () => {
  const u = new Usuario("Ana", "a@x.com", "1");
  const d = new RecompensaDesconto(1, "Desc10", "Cafe Verde", 100, 10);
  assertThrows(() => d.resgatar(u));     // sem pontos
  u.adicionarPontos(150);
  const msg = d.resgatar(u);
  assertEqual(u.pontos, 50);
  assert(msg.includes("Cafe Verde"));
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/run.js`
Expected: FALHA — módulos não encontrados.

- [ ] **Step 3: Implementar `js/models/Medalha.js`**

```js
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
```

- [ ] **Step 4: Implementar `js/models/Recompensa.js`**

```js
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
```

- [ ] **Step 5: Rodar e ver passar**

Run: `node tests/run.js`
Expected: testes de Medalha e Recompensa passam.

- [ ] **Step 6: Commit**

```bash
git add js/models/Medalha.js js/models/Recompensa.js tests/Medalha.test.js tests/Recompensa.test.js
git commit -m "feat: classes Medalha e hierarquia Recompensa"
```

---

## Task 8: SistemaReciclagem — cadastro, login, descarte e fila

**Files:**
- Create: `js/models/SistemaReciclagem.js`
- Test: `tests/SistemaReciclagem.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
// tests/SistemaReciclagem.test.js
const { teste, assert, assertEqual, assertThrows } = require("./run.js");
const { SistemaReciclagem } = require("../js/models/SistemaReciclagem.js");
const { PontoColeta } = require("../js/models/PontoColeta.js");
const { Plastico } = require("../js/models/Material.js");

function sistemaComUsuario() {
  const s = new SistemaReciclagem();
  const u = s.cadastrarUsuario("Ana", "a@x.com", "1234");
  return { s, u };
}

teste("cadastrar bloqueia email duplicado", () => {
  const { s } = sistemaComUsuario();
  assertThrows(() => s.cadastrarUsuario("Outra", "a@x.com", "9"));
});
teste("login valida credenciais", () => {
  const { s } = sistemaComUsuario();
  assertThrows(() => s.login("a@x.com", "errada"));
  assertEqual(s.login("a@x.com", "1234").nome, "Ana");
});
teste("registrarDescarte enfileira e fica pendente", () => {
  const { s, u } = sistemaComUsuario();
  const p = new PontoColeta(1, "P", "R", 0, 0, ["plastico"]);
  s.registrarDescarte(u, p, new Plastico(), 2);
  assertEqual(s.filaDescartes.tamanho, 1);
  assertEqual(u.pontos, 0); // ainda não processado
});
teste("processarFila confirma e credita pontos/impacto/kg", () => {
  const { s, u } = sistemaComUsuario();
  const p = new PontoColeta(1, "P", "R", 0, 0, ["plastico"]);
  s.registrarDescarte(u, p, new Plastico(), 2);
  s.registrarDescarte(u, p, new Plastico(), 3);
  const processados = s.processarFila();
  assertEqual(processados.length, 2);
  assertEqual(u.pontos, 50);          // (2+3)kg * 10
  assertEqual(u.kgReciclados, 5);
  assert(s.filaDescartes.vazia);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/run.js`
Expected: FALHA — módulo `SistemaReciclagem.js` não encontrado.

- [ ] **Step 3: Implementar `js/models/SistemaReciclagem.js`** (parte 1 — sem ranking/recompensa, vêm na Task 9)

```js
if (typeof module !== "undefined" && module.exports) {
  var { Lista } = require("../estruturas/Lista.js");
  var { Fila } = require("../estruturas/Fila.js");
  var { Usuario } = require("./Usuario.js");
  var { Descarte } = require("./Descarte.js");
}

/** POO: Abstração — fachada que coordena Usuarios (Lista), descartes (Fila), medalhas e recompensas. */
class SistemaReciclagem {
  #contadorDescarte = 0;
  constructor() {
    this.usuarios = new Lista();
    this.filaDescartes = new Fila();
    this.pontosColeta = [];   // PontoColeta[]
    this.recompensas = [];    // Recompensa[]
    this.medalhas = [];       // Medalha[]
    this.usuarioLogado = null;
  }

  cadastrarUsuario(nome, email, senha) {
    if (this.usuarios.buscar(u => u.email === email)) throw new Error("E-mail já cadastrado");
    const u = new Usuario(nome, email, senha);
    this.usuarios.adicionar(u);
    return u;
  }

  login(email, senha) {
    const u = this.usuarios.buscar(x => x.email === email);
    if (!u || !u.verificarSenha(senha)) throw new Error("Credenciais inválidas");
    this.usuarioLogado = u;
    return u;
  }
  logout() { this.usuarioLogado = null; }

  registrarDescarte(usuario, pontoColeta, material, pesoKg) {
    if (!(pesoKg > 0)) throw new Error("Peso deve ser maior que zero");
    const d = new Descarte(++this.#contadorDescarte, usuario, pontoColeta, material, pesoKg);
    this.filaDescartes.enfileirar(d);
    usuario.registrarAcao(`Descarte de ${pesoKg}kg de ${material.nome} registrado (pendente)`);
    return d;
  }

  processarProximo() {
    if (this.filaDescartes.vazia) return null;
    const d = this.filaDescartes.desenfileirar();
    d.confirmar();
    d.usuario.adicionarPontos(d.pontosGerados);
    d.usuario.registrarImpacto(d.impacto);
    d.usuario.adicionarKg(d.pesoKg);
    d.usuario.registrarAcao(`Descarte confirmado: +${d.pontosGerados} pts`);
    this.verificarMedalhas(d.usuario);
    return d;
  }
  processarFila() {
    const r = [];
    while (!this.filaDescartes.vazia) r.push(this.processarProximo());
    return r;
  }

  // Implementado na Task 9 — placeholder seguro para esta tarefa não quebrar.
  verificarMedalhas(_usuario) { /* preenchido na Task 9 */ }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { SistemaReciclagem }; }
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node tests/run.js`
Expected: testes de SistemaReciclagem (cadastro/login/fila) passam.

- [ ] **Step 5: Commit**

```bash
git add js/models/SistemaReciclagem.js tests/SistemaReciclagem.test.js
git commit -m "feat: SistemaReciclagem com cadastro, login e processamento da fila"
```

---

## Task 9: SistemaReciclagem — ranking, recompensas e medalhas

**Files:**
- Modify: `js/models/SistemaReciclagem.js`
- Modify: `tests/SistemaReciclagem.test.js` (acrescentar testes)

- [ ] **Step 1: Acrescentar testes que falham em `tests/SistemaReciclagem.test.js`**

```js
// --- acrescentar ao final de tests/SistemaReciclagem.test.js ---
const { Medalha } = require("../js/models/Medalha.js");
const { RecompensaDesconto } = require("../js/models/Recompensa.js");

teste("gerarRanking ordena por pontos desc", () => {
  const s = new SistemaReciclagem();
  const a = s.cadastrarUsuario("Ana", "a@x.com", "1");
  const b = s.cadastrarUsuario("Bia", "b@x.com", "1");
  a.adicionarPontos(100); b.adicionarPontos(300);
  assertEqual(s.gerarRanking().map(u => u.nome), ["Bia", "Ana"]);
});

teste("verificarMedalhas desbloqueia ao bater criterio", () => {
  const s = new SistemaReciclagem();
  s.medalhas.push(new Medalha("kg1", "Primeiro Passo", "🌱", u => u.kgReciclados >= 1));
  const u = s.cadastrarUsuario("Ana", "a@x.com", "1");
  u.adicionarKg(2);
  s.verificarMedalhas(u);
  assertEqual(u.medalhas.length, 1);
  s.verificarMedalhas(u); // não duplica
  assertEqual(u.medalhas.length, 1);
});

teste("resgatarRecompensa desconta pontos e registra acao", () => {
  const s = new SistemaReciclagem();
  const u = s.cadastrarUsuario("Ana", "a@x.com", "1");
  u.adicionarPontos(200);
  s.recompensas.push(new RecompensaDesconto(1, "Desc10", "Cafe Verde", 100, 10));
  const msg = s.resgatarRecompensa(u, 1);
  assertEqual(u.pontos, 100);
  assert(msg.includes("Cafe Verde"));
  assertEqual(u.historico.topo.descricao.includes("Recompensa"), true);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/run.js`
Expected: FALHA — `gerarRanking`/`resgatarRecompensa` não existem; `verificarMedalhas` é vazio.

- [ ] **Step 3: Implementar os métodos em `js/models/SistemaReciclagem.js`**

Substituir o método `verificarMedalhas` placeholder por:
```js
  verificarMedalhas(usuario) {
    for (const m of this.medalhas) {
      const jaTem = usuario.medalhas.some(x => x.id === m.id);
      if (!jaTem && m.verificar(usuario)) usuario.desbloquearMedalha(m);
    }
  }

  gerarRanking() { return this.usuarios.ordenarPor("pontos", true); }

  resgatarRecompensa(usuario, idRecompensa) {
    const r = this.recompensas.find(x => x.id === idRecompensa);
    if (!r) throw new Error("Recompensa não encontrada");
    const msg = r.resgatar(usuario);
    usuario.registrarAcao(`Recompensa resgatada: ${r.nome}`);
    return msg;
  }
```
(Inserir antes do fechamento da classe; remover o comentário/placeholder antigo de `verificarMedalhas`.)

- [ ] **Step 4: Rodar e ver passar**

Run: `node tests/run.js`
Expected: todos os testes (incluindo ranking, medalhas, recompensa) passam.

- [ ] **Step 5: Commit**

```bash
git add js/models/SistemaReciclagem.js tests/SistemaReciclagem.test.js
git commit -m "feat: ranking, medalhas e resgate de recompensas no SistemaReciclagem"
```

---

## Task 10: Storage + persistência (toJSON/fromJSON do sistema)

**Files:**
- Create: `js/services/Storage.js`
- Modify: `js/models/SistemaReciclagem.js` (adicionar `salvarEm`/`carregarDe`)
- Test: `tests/Storage.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
// tests/Storage.test.js
const { teste, assert, assertEqual } = require("./run.js");

// Mock de localStorage para Node
global.localStorage = {
  _d: {},
  getItem(k) { return k in this._d ? this._d[k] : null; },
  setItem(k, v) { this._d[k] = String(v); },
  removeItem(k) { delete this._d[k]; },
};

const { Storage } = require("../js/services/Storage.js");
const { SistemaReciclagem } = require("../js/models/SistemaReciclagem.js");
const { PontoColeta } = require("../js/models/PontoColeta.js");
const { Plastico, criarMaterial } = require("../js/models/Material.js");

teste("Storage salva e carrega objeto", () => {
  Storage.salvar("teste", { a: 1 });
  assertEqual(Storage.carregar("teste").a, 1);
});
teste("Storage carregar inexistente retorna padrao", () => {
  assertEqual(Storage.carregar("nao_existe", "x"), "x");
});

teste("Sistema persiste usuarios e fila e recarrega", () => {
  const s = new SistemaReciclagem();
  const u = s.cadastrarUsuario("Ana", "a@x.com", "1234");
  const p = new PontoColeta(1, "P", "R", 0, 0, ["plastico"]);
  s.pontosColeta = [p];
  s.registrarDescarte(u, p, new Plastico(), 2); // fica na fila (pendente)
  s.salvarEm("eco_save");

  const s2 = new SistemaReciclagem();
  s2.pontosColeta = [p];
  s2.carregarDe("eco_save");
  assertEqual(s2.usuarios.tamanho, 1);
  assert(s2.usuarios.buscar(x => x.email === "a@x.com").verificarSenha("1234"));
  assertEqual(s2.filaDescartes.tamanho, 1);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/run.js`
Expected: FALHA — `Storage.js` não existe; `salvarEm`/`carregarDe` não existem.

- [ ] **Step 3: Implementar `js/services/Storage.js`**

```js
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
```

- [ ] **Step 4: Adicionar `salvarEm`/`carregarDe` em `js/models/SistemaReciclagem.js`**

No topo (bloco de `require` do Node), acrescentar:
```js
if (typeof module !== "undefined" && module.exports) {
  var { Lista } = require("../estruturas/Lista.js");
  var { Fila } = require("../estruturas/Fila.js");
  var { Usuario } = require("./Usuario.js");
  var { Descarte } = require("./Descarte.js");
  var { Storage } = require("../services/Storage.js");
  var { criarMaterial } = require("./Material.js");
}
```
Adicionar os métodos antes do fechamento da classe:
```js
  salvarEm(chave) {
    const snapshot = {
      usuarios: this.usuarios.toArray().map(u => u.toJSON()),
      logado: this.usuarioLogado ? this.usuarioLogado.email : null,
      fila: this.filaDescartes.toArray().map(d => ({
        usuarioEmail: d.usuario.email,
        pontoId: d.pontoColeta.id,
        materialChave: this.#chaveDoMaterial(d.material),
        pesoKg: d.pesoKg,
      })),
    };
    Storage.salvar(chave, snapshot);
  }

  carregarDe(chave) {
    const snap = Storage.carregar(chave);
    if (!snap) return false;
    this.usuarios = new Lista();
    for (const obj of snap.usuarios) this.usuarios.adicionar(Usuario.fromJSON(obj, this.medalhas));
    // recomputa medalhas (auto-corrige catálogo)
    for (const u of this.usuarios.toArray()) this.verificarMedalhas(u);
    this.usuarioLogado = snap.logado ? this.usuarios.buscar(u => u.email === snap.logado) : null;
    this.filaDescartes = new Fila();
    for (const item of (snap.fila || [])) {
      const u = this.usuarios.buscar(x => x.email === item.usuarioEmail);
      const p = this.pontosColeta.find(x => x.id === item.pontoId);
      if (u && p) this.registrarDescarte(u, p, criarMaterial(item.materialChave), item.pesoKg);
    }
    return true;
  }

  #chaveDoMaterial(material) {
    return material.nome
      .normalize("NFD").replace(/[̀-ͯ]/g, "") // remove acentos (faixa Unicode de diacríticos)
      .toLowerCase();
  }
```
> `#chaveDoMaterial` converte "Plástico" → "plastico", "Eletrônico" → "eletronico" (bate com as chaves de `MATERIAIS`).

- [ ] **Step 5: Rodar e ver passar**

Run: `node tests/run.js`
Expected: testes de Storage e persistência passam.

- [ ] **Step 6: Commit**

```bash
git add js/services/Storage.js js/models/SistemaReciclagem.js tests/Storage.test.js
git commit -m "feat: persistencia em localStorage (Storage + salvarEm/carregarDe)"
```

---

## Task 11: Dados-semente (seed.js)

**Files:**
- Create: `js/data/seed.js`

> Sem teste de unidade dedicado (é configuração). Será exercitado pelas páginas e pelo `tests.html`.

- [ ] **Step 1: Criar `js/data/seed.js`**

```js
// Popula um SistemaReciclagem com pontos de coleta, recompensas, medalhas e usuários demo.
// Depende de classes globais (carregadas via <script> antes deste arquivo).
function carregarSeed(sistema) {
  // Pontos de coleta (coordenadas em São Paulo como exemplo)
  sistema.pontosColeta = [
    new PontoColeta(1, "Eco Ponto Centro", "Praça da Sé, 100", -23.5505, -46.6333, ["plastico", "papel", "vidro", "metal"]),
    new PontoColeta(2, "Recicla Paulista", "Av. Paulista, 1500", -23.5614, -46.6559, ["plastico", "papel", "eletronico"]),
    new PontoColeta(3, "Verde Pinheiros", "R. dos Pinheiros, 200", -23.5670, -46.7010, ["vidro", "metal"]),
    new PontoColeta(4, "EcoVila Madalena", "R. Aspicuelta, 50", -23.5546, -46.6900, ["plastico", "papel", "vidro", "metal", "eletronico"]),
  ];

  // Recompensas de parceiros (polimorfismo: descontos e brindes)
  sistema.recompensas = [
    new RecompensaDesconto(1, "10% Café Verde", "Café Verde", 100, 10),
    new RecompensaDesconto(2, "20% Mercado Bio", "Mercado Bio", 250, 20),
    new RecompensaBrinde(3, "Ecobag exclusiva", "EcoStore", 200, "ecobag"),
    new RecompensaBrinde(4, "Garrafa reutilizável", "EcoStore", 400, "garrafa reutilizável"),
  ];

  // Medalhas / conquistas
  sistema.medalhas = [
    new Medalha("primeiro", "Primeiro Passo", "🌱", u => u.kgReciclados >= 1),
    new Medalha("dez_kg", "Reciclador Dedicado", "♻️", u => u.kgReciclados >= 10),
    new Medalha("nivel2", "Eco-Guerreiro", "🛡️", u => u.nivel === "Eco-Guerreiro" || u.nivel === "Guardião do Planeta"),
    new Medalha("mil_pts", "Mil Pontos", "⭐", u => u.pontos >= 1000),
  ];

  // Usuários demo (para o ranking não nascer vazio)
  if (sistema.usuarios.tamanho === 0) {
    const demo = [
      ["Mariana Silva", "mariana@demo.com", "demo", 1450],
      ["João Pereira", "joao@demo.com", "demo", 980],
      ["Carla Souza", "carla@demo.com", "demo", 540],
    ];
    for (const [nome, email, senha, pts] of demo) {
      const u = sistema.cadastrarUsuario(nome, email, senha);
      u.adicionarPontos(pts);
      u.adicionarKg(pts / 50);
      sistema.verificarMedalhas(u);
    }
  }
}

if (typeof module !== "undefined" && module.exports) { module.exports = { carregarSeed }; }
```

- [ ] **Step 2: Commit**

```bash
git add js/data/seed.js
git commit -m "feat: dados-semente (pontos, recompensas, medalhas, usuarios demo)"
```

---

## Task 12: tests.html — testes no navegador

**Files:**
- Create: `tests.html`

> Reaproveita os mesmos testes conceituais, mas no navegador, para exibir no vídeo (o `node tests/run.js` continua sendo a fonte de verdade no desenvolvimento).

- [ ] **Step 1: Criar `tests.html`**

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoRecicla — Testes</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body class="pagina-simples">
  <main class="container">
    <h1>✅ Testes automáticos</h1>
    <div id="resultado" class="lista-testes"></div>
    <p id="resumo" class="resumo-testes"></p>
  </main>

  <!-- Estruturas e modelos (ordem importa) -->
  <script src="js/estruturas/Lista.js"></script>
  <script src="js/estruturas/Fila.js"></script>
  <script src="js/estruturas/Pilha.js"></script>
  <script src="js/models/Material.js"></script>
  <script src="js/models/Usuario.js"></script>
  <script src="js/models/PontoColeta.js"></script>
  <script src="js/models/Descarte.js"></script>
  <script src="js/models/Medalha.js"></script>
  <script src="js/models/Recompensa.js"></script>
  <script src="js/models/SistemaReciclagem.js"></script>

  <script>
    let total = 0, passou = 0;
    const out = document.getElementById("resultado");
    function teste(nome, fn) {
      total++;
      const div = document.createElement("div");
      try { fn(); passou++; div.className = "teste-ok"; div.textContent = "✅ " + nome; }
      catch (e) { div.className = "teste-fail"; div.textContent = "❌ " + nome + " — " + e.message; }
      out.appendChild(div);
    }
    function assert(c, m) { if (!c) throw new Error(m || "esperado verdadeiro"); }
    function assertEqual(a, b) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`obtido ${JSON.stringify(a)}, esperado ${JSON.stringify(b)}`); }

    // FILA / PILHA / LISTA
    teste("Fila é FIFO", () => { const f = new Fila(); f.enfileirar(1).enfileirar(2); assertEqual(f.desenfileirar(), 1); });
    teste("Pilha é LIFO", () => { const p = new Pilha(); p.empilhar(1).empilhar(2); assertEqual(p.desempilhar(), 2); });
    teste("Lista ordena por pontos", () => { const l = new Lista(); l.adicionar({p:1}).adicionar({p:9}); assertEqual(l.ordenarPor("p", true)[0].p, 9); });
    // POLIMORFISMO
    teste("Polimorfismo de Material", () => { assert(new Plastico().calcularImpacto(1).co2 !== new Metal().calcularImpacto(1).co2); });
    // ENCAPSULAMENTO
    teste("Usuario protege senha", () => { const u = new Usuario("A","a@x","1"); assertEqual(u.senha, undefined); assert(u.verificarSenha("1")); });
    // FLUXO COMPLETO
    teste("Fluxo: registrar -> processar credita pontos", () => {
      const s = new SistemaReciclagem();
      const u = s.cadastrarUsuario("A", "a@x", "1");
      const pc = new PontoColeta(1,"P","R",0,0,["plastico"]);
      s.registrarDescarte(u, pc, new Plastico(), 2);
      s.processarFila();
      assertEqual(u.pontos, 20);
    });

    document.getElementById("resumo").textContent = `${passou}/${total} testes passaram.`;
  </script>
</body>
</html>
```

- [ ] **Step 2: Verificar no navegador**

Abrir `tests.html` com clique duplo.
Expected: lista de testes toda verde (✅) e resumo "X/X testes passaram".

- [ ] **Step 3: Commit**

```bash
git add tests.html
git commit -m "feat: pagina de testes no navegador (tests.html)"
```

---

## Task 13: CSS — tema vibrante & gamificado

**Files:**
- Create: `css/style.css`

- [ ] **Step 1: Criar `css/style.css`**

```css
/* ===== EcoRecicla — tema vibrante & gamificado ===== */
:root {
  --verde: #22c55e; --verde-escuro: #16a34a; --ciano: #06b6d4;
  --grad: linear-gradient(135deg, #22c55e, #06b6d4);
  --fundo: #f0fdf4; --card: #ffffff; --texto: #0f172a; --suave: #64748b;
  --borda: #e2e8f0; --raio: 18px; --sombra: 0 8px 24px rgba(34,197,94,.15);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, "Segoe UI", sans-serif; background: var(--fundo); color: var(--texto); line-height: 1.5; }
a { color: var(--verde-escuro); text-decoration: none; }
.container { max-width: 1100px; margin: 0 auto; padding: 24px; }

/* Navbar */
.navbar { background: var(--grad); color: #fff; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--sombra); }
.navbar .logo { font-weight: 800; font-size: 1.25rem; }
.navbar nav a { color: #fff; margin-left: 18px; font-weight: 600; opacity: .92; }
.navbar nav a:hover { opacity: 1; text-decoration: underline; }

/* Botões */
.btn { background: var(--grad); color: #fff; border: none; padding: 12px 22px; border-radius: 999px; font-weight: 700; cursor: pointer; box-shadow: var(--sombra); transition: transform .1s; }
.btn:hover { transform: translateY(-1px); }
.btn-secundario { background: #fff; color: var(--verde-escuro); border: 2px solid var(--verde); }

/* Cards */
.card { background: var(--card); border-radius: var(--raio); padding: 20px; box-shadow: var(--sombra); border: 1px solid var(--borda); }
.grid { display: grid; gap: 18px; }
.grid-3 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

/* Barra de progresso */
.progresso { height: 12px; background: #e9fbef; border-radius: 999px; overflow: hidden; }
.progresso > div { height: 100%; background: var(--grad); border-radius: 999px; }

/* Métricas / badges */
.metrica { text-align: center; }
.metrica .valor { font-size: 2rem; font-weight: 800; }
.metrica .rotulo { color: var(--suave); font-size: .85rem; }
.medalha { display: inline-flex; flex-direction: column; align-items: center; gap: 4px; background: #fff; border-radius: 16px; padding: 12px; width: 92px; box-shadow: var(--sombra); }
.medalha.bloqueada { filter: grayscale(1); opacity: .45; }
.medalha .icone { font-size: 1.8rem; }
.medalha .nome { font-size: .72rem; text-align: center; color: var(--suave); }

/* Hero (landing) */
.hero { background: var(--grad); color: #fff; border-radius: 24px; padding: 56px 32px; text-align: center; }
.hero h1 { font-size: 2.4rem; margin-bottom: 12px; }
.hero p { max-width: 640px; margin: 0 auto 24px; opacity: .95; }

/* Formulários */
.campo { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.campo input, .campo select { padding: 12px; border: 1px solid var(--borda); border-radius: 12px; font-size: 1rem; }
.erro { color: #dc2626; font-size: .85rem; min-height: 1em; }

/* Tabela ranking */
.ranking-item { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 14px; background: #fff; margin-bottom: 8px; box-shadow: var(--sombra); }
.ranking-item .pos { font-weight: 800; width: 32px; }
.ranking-item.eu { outline: 2px solid var(--verde); }

/* Mapa */
#mapa { height: 460px; border-radius: var(--raio); box-shadow: var(--sombra); }
.layout-mapa { display: grid; grid-template-columns: 2fr 1fr; gap: 18px; }
@media (max-width: 768px) { .layout-mapa { grid-template-columns: 1fr; } }

/* Testes */
.lista-testes div { padding: 8px 12px; border-radius: 10px; margin-bottom: 6px; font-family: monospace; }
.teste-ok { background: #dcfce7; } .teste-fail { background: #fee2e2; }
.resumo-testes { font-weight: 700; margin-top: 12px; }

/* utilitários */
.titulo-secao { margin: 24px 0 12px; font-size: 1.4rem; }
.subtitulo { color: var(--suave); }
.mt { margin-top: 18px; } .center { text-align: center; }
.tag { display: inline-block; background: #dcfce7; color: var(--verde-escuro); padding: 2px 10px; border-radius: 999px; font-size: .75rem; font-weight: 700; }
```

- [ ] **Step 2: Commit**

```bash
git add css/style.css
git commit -m "feat: tema visual vibrante e gamificado (style.css)"
```

---

## Task 14: index.html — landing

**Files:**
- Create: `index.html`

- [ ] **Step 1: Criar `index.html`**

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoRecicla — recicle e seja recompensado</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="navbar">
    <span class="logo">🌱 EcoRecicla</span>
    <nav>
      <a href="index.html">Início</a>
      <a href="mapa.html">Pontos de coleta</a>
      <a href="ranking.html">Ranking</a>
      <a href="login.html">Entrar</a>
    </nav>
  </header>

  <main class="container">
    <section class="hero">
      <h1>Transforme sua reciclagem em recompensas ♻️</h1>
      <p>Registre seus descartes em pontos de coleta, ganhe pontos e medalhas, suba no ranking e troque por benefícios em parceiros. Pequenos gestos, grande impacto.</p>
      <a class="btn" href="login.html">Comece agora</a>
    </section>

    <h2 class="titulo-secao">Como funciona</h2>
    <div class="grid grid-3">
      <div class="card"><h3>1. Descarte certo</h3><p class="subtitulo">Encontre o ponto de coleta mais perto e registre o material reciclado.</p></div>
      <div class="card"><h3>2. Ganhe pontos</h3><p class="subtitulo">Cada descarte vira pontos, medalhas e progresso de nível.</p></div>
      <div class="card"><h3>3. Seja recompensado</h3><p class="subtitulo">Troque pontos por descontos e brindes em estabelecimentos parceiros.</p></div>
    </div>

    <h2 class="titulo-secao">Nosso compromisso com a ODS 12</h2>
    <div class="card">
      <p>O EcoRecicla apoia o <strong>Objetivo de Desenvolvimento Sustentável 12 — Consumo e Produção Responsáveis</strong>, da ONU. Ao incentivar o descarte correto e a reciclagem (meta 12.5), reduzimos resíduos, promovemos consumo consciente e medimos o impacto ambiental real de cada usuário (CO₂ evitado, água poupada e árvores preservadas).</p>
    </div>
  </main>
</body>
</html>
```

- [ ] **Step 2: Verificar no navegador**

Abrir `index.html` com clique duplo.
Expected: landing com hero verde/ciano, seções "Como funciona" e "ODS 12", navbar funcional.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: landing page (index.html)"
```

---

## Task 15: login.html + js/pages/login.js

**Files:**
- Create: `login.html`
- Create: `js/pages/login.js`

> Padrão de bootstrap das páginas com sessão: carregar sistema do Storage, aplicar seed se vazio, salvar. Definido aqui e reutilizado nas próximas páginas.

- [ ] **Step 1: Criar `login.html`**

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoRecicla — Entrar / Cadastrar</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="navbar"><span class="logo">🌱 EcoRecicla</span><nav><a href="index.html">Início</a></nav></header>
  <main class="container" style="max-width:460px">
    <div class="card">
      <div id="abas" style="display:flex;gap:8px;margin-bottom:16px">
        <button class="btn" id="aba-login">Entrar</button>
        <button class="btn-secundario btn" id="aba-cadastro">Cadastrar</button>
      </div>

      <form id="form-login">
        <div class="campo"><label>E-mail</label><input type="email" id="login-email" required></div>
        <div class="campo"><label>Senha</label><input type="password" id="login-senha" required></div>
        <div class="erro" id="login-erro"></div>
        <button class="btn" type="submit" style="width:100%">Entrar</button>
        <p class="subtitulo mt center">Demo: mariana@demo.com / demo</p>
      </form>

      <form id="form-cadastro" style="display:none">
        <div class="campo"><label>Nome</label><input type="text" id="cad-nome" required></div>
        <div class="campo"><label>E-mail</label><input type="email" id="cad-email" required></div>
        <div class="campo"><label>Senha (mín. 4)</label><input type="password" id="cad-senha" required></div>
        <div class="erro" id="cad-erro"></div>
        <button class="btn" type="submit" style="width:100%">Criar conta</button>
      </form>
    </div>
  </main>

  <script src="js/estruturas/Lista.js"></script>
  <script src="js/estruturas/Fila.js"></script>
  <script src="js/estruturas/Pilha.js"></script>
  <script src="js/models/Material.js"></script>
  <script src="js/models/Usuario.js"></script>
  <script src="js/models/PontoColeta.js"></script>
  <script src="js/models/Descarte.js"></script>
  <script src="js/models/Medalha.js"></script>
  <script src="js/models/Recompensa.js"></script>
  <script src="js/models/SistemaReciclagem.js"></script>
  <script src="js/services/Storage.js"></script>
  <script src="js/data/seed.js"></script>
  <script src="js/pages/login.js"></script>
</body>
</html>
```

- [ ] **Step 2: Criar `js/pages/login.js`**

```js
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

// Alternância de abas
const formLogin = document.getElementById("form-login");
const formCadastro = document.getElementById("form-cadastro");
document.getElementById("aba-login").onclick = () => { formLogin.style.display = ""; formCadastro.style.display = "none"; };
document.getElementById("aba-cadastro").onclick = () => { formLogin.style.display = "none"; formCadastro.style.display = ""; };

// Login
formLogin.onsubmit = (e) => {
  e.preventDefault();
  const erro = document.getElementById("login-erro");
  try {
    const u = sistema.login(document.getElementById("login-email").value.trim(), document.getElementById("login-senha").value);
    sistema.salvarEm(CHAVE_SAVE);
    window.location.href = "dashboard.html";
  } catch (ex) { erro.textContent = ex.message; }
};

// Cadastro
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
```

- [ ] **Step 3: Verificar no navegador**

Abrir `login.html`. Testar: login com `mariana@demo.com`/`demo` → vai para `dashboard.html` (que ainda não existe; verá 404, normal). Cadastro com senha curta mostra erro; e-mail duplicado mostra erro.
Expected: validações funcionam; sessão é salva no localStorage.

- [ ] **Step 4: Commit**

```bash
git add login.html js/pages/login.js
git commit -m "feat: cadastro/login + bootstrap do sistema"
```

---

## Task 16: dashboard.html + js/pages/dashboard.js

**Files:**
- Create: `dashboard.html`
- Create: `js/pages/dashboard.js`

- [ ] **Step 1: Criar `dashboard.html`**

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoRecicla — Dashboard</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="navbar">
    <span class="logo">🌱 EcoRecicla</span>
    <nav>
      <a href="dashboard.html">Dashboard</a>
      <a href="mapa.html">Mapa</a>
      <a href="historico.html">Histórico</a>
      <a href="ranking.html">Ranking</a>
      <a href="recompensas.html">Recompensas</a>
      <a href="#" id="sair">Sair</a>
    </nav>
  </header>

  <main class="container">
    <h1 id="saudacao">Olá!</h1>
    <div class="grid grid-3 mt">
      <div class="card metrica"><div class="valor" id="m-pontos">0</div><div class="rotulo">Pontos</div></div>
      <div class="card metrica"><div class="valor" id="m-nivel">—</div><div class="rotulo">Nível</div></div>
      <div class="card metrica"><div class="valor" id="m-kg">0</div><div class="rotulo">Kg reciclados</div></div>
    </div>

    <div class="card mt">
      <strong>Meta mensal</strong> <span id="meta-texto" class="subtitulo"></span>
      <div class="progresso mt"><div id="meta-barra" style="width:0%"></div></div>
    </div>

    <h2 class="titulo-secao">🌍 Seu impacto ambiental</h2>
    <div class="grid grid-3">
      <div class="card metrica"><div class="valor" id="i-co2">0</div><div class="rotulo">kg de CO₂ evitado</div></div>
      <div class="card metrica"><div class="valor" id="i-agua">0</div><div class="rotulo">litros de água</div></div>
      <div class="card metrica"><div class="valor" id="i-arvores">0</div><div class="rotulo">árvores equivalentes</div></div>
    </div>

    <h2 class="titulo-secao">🏅 Suas medalhas</h2>
    <div id="medalhas" class="grid" style="grid-template-columns:repeat(auto-fill,100px)"></div>

    <p class="mt"><a class="btn" href="mapa.html">+ Registrar descarte</a></p>
  </main>

  <script src="js/estruturas/Lista.js"></script>
  <script src="js/estruturas/Fila.js"></script>
  <script src="js/estruturas/Pilha.js"></script>
  <script src="js/models/Material.js"></script>
  <script src="js/models/Usuario.js"></script>
  <script src="js/models/PontoColeta.js"></script>
  <script src="js/models/Descarte.js"></script>
  <script src="js/models/Medalha.js"></script>
  <script src="js/models/Recompensa.js"></script>
  <script src="js/models/SistemaReciclagem.js"></script>
  <script src="js/services/Storage.js"></script>
  <script src="js/data/seed.js"></script>
  <script src="js/pages/login.js"></script>
  <script src="js/pages/dashboard.js"></script>
</body>
</html>
```
> Observação: `login.js` é incluído de novo só para reaproveitar `inicializarSistema()`/`sistema`/`CHAVE_SAVE`. Os formulários não existem nesta página, então os `onsubmit` simplesmente não são ligados (os `getElementById` retornam `null`). **Ajuste necessário:** proteger os handlers de `login.js` com `if (formLogin) {...}`.

- [ ] **Step 2: Tornar `js/pages/login.js` reutilizável (guardas de null)**

Em `js/pages/login.js`, envolver a parte de DOM:
```js
// ... mantém CHAVE_SAVE, inicializarSistema(), const sistema = inicializarSistema();

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
```

- [ ] **Step 3: Criar `js/pages/dashboard.js`**

```js
const usuario = exigirLogin();
if (usuario) {
  ligarSair();
  const r1 = (n) => Math.round(n * 10) / 10;

  document.getElementById("saudacao").textContent = `Olá, ${usuario.nome}! 🌱`;
  document.getElementById("m-pontos").textContent = usuario.pontos;
  document.getElementById("m-nivel").textContent = usuario.nivel;
  document.getElementById("m-kg").textContent = r1(usuario.kgReciclados);

  const pct = Math.min(100, Math.round((usuario.kgReciclados / usuario.metaMensalKg) * 100));
  document.getElementById("meta-barra").style.width = pct + "%";
  document.getElementById("meta-texto").textContent = `${r1(usuario.kgReciclados)} de ${usuario.metaMensalKg} kg (${pct}%)`;

  const imp = usuario.impacto;
  document.getElementById("i-co2").textContent = r1(imp.co2);
  document.getElementById("i-agua").textContent = r1(imp.agua);
  document.getElementById("i-arvores").textContent = r1(imp.arvores);

  const cont = document.getElementById("medalhas");
  for (const m of sistema.medalhas) {
    const tem = usuario.medalhas.some(x => x.id === m.id);
    const div = document.createElement("div");
    div.className = "medalha" + (tem ? "" : " bloqueada");
    div.innerHTML = `<span class="icone">${m.icone}</span><span class="nome">${m.nome}</span>`;
    cont.appendChild(div);
  }
}
```

- [ ] **Step 4: Verificar no navegador**

Logar como `mariana@demo.com`/`demo` → `dashboard.html`. 
Expected: pontos/nível/kg, barra de meta, impacto ambiental e medalhas (algumas desbloqueadas). "Sair" volta para a landing.

- [ ] **Step 5: Commit**

```bash
git add dashboard.html js/pages/dashboard.js js/pages/login.js
git commit -m "feat: dashboard do usuario com metas, impacto e medalhas"
```

---

## Task 17: mapa.html + js/pages/mapa.js (Leaflet + registrar descarte)

**Files:**
- Create: `mapa.html`
- Create: `js/pages/mapa.js`

- [ ] **Step 1: Criar `mapa.html`**

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoRecicla — Pontos de coleta</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="navbar">
    <span class="logo">🌱 EcoRecicla</span>
    <nav>
      <a href="dashboard.html">Dashboard</a>
      <a href="mapa.html">Mapa</a>
      <a href="historico.html">Histórico</a>
      <a href="ranking.html">Ranking</a>
      <a href="recompensas.html">Recompensas</a>
      <a href="#" id="sair">Sair</a>
    </nav>
  </header>

  <main class="container">
    <h1>Pontos de coleta</h1>
    <p class="subtitulo">Clique em um marcador ou em "Registrar descarte" na lista.</p>
    <div class="layout-mapa mt">
      <div id="mapa"></div>
      <div id="lista-pontos"></div>
    </div>
  </main>

  <!-- Modal de registro -->
  <div id="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);align-items:center;justify-content:center;">
    <div class="card" style="max-width:420px;width:90%">
      <h3 id="modal-titulo">Registrar descarte</h3>
      <form id="form-descarte" class="mt">
        <div class="campo"><label>Material</label><select id="d-material"></select></div>
        <div class="campo"><label>Peso (kg)</label><input type="number" id="d-peso" min="0.1" step="0.1" required></div>
        <div class="erro" id="d-erro"></div>
        <div style="display:flex;gap:8px">
          <button class="btn" type="submit">Registrar</button>
          <button class="btn btn-secundario" type="button" id="d-cancelar">Cancelar</button>
        </div>
      </form>
    </div>
  </div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="js/estruturas/Lista.js"></script>
  <script src="js/estruturas/Fila.js"></script>
  <script src="js/estruturas/Pilha.js"></script>
  <script src="js/models/Material.js"></script>
  <script src="js/models/Usuario.js"></script>
  <script src="js/models/PontoColeta.js"></script>
  <script src="js/models/Descarte.js"></script>
  <script src="js/models/Medalha.js"></script>
  <script src="js/models/Recompensa.js"></script>
  <script src="js/models/SistemaReciclagem.js"></script>
  <script src="js/services/Storage.js"></script>
  <script src="js/data/seed.js"></script>
  <script src="js/pages/login.js"></script>
  <script src="js/pages/mapa.js"></script>
</body>
</html>
```

- [ ] **Step 2: Criar `js/pages/mapa.js`**

```js
const usuarioMapa = exigirLogin();
if (usuarioMapa) {
  ligarSair();
  const NOMES = { plastico: "Plástico", papel: "Papel", vidro: "Vidro", metal: "Metal", eletronico: "Eletrônico" };

  // Mapa Leaflet centralizado no primeiro ponto
  const centro = sistema.pontosColeta[0];
  const mapa = L.map("mapa").setView([centro.lat, centro.lng], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(mapa);

  let pontoSelecionado = null;
  const modal = document.getElementById("modal");
  const selMaterial = document.getElementById("d-material");

  function abrirModal(ponto) {
    pontoSelecionado = ponto;
    document.getElementById("modal-titulo").textContent = "Registrar descarte — " + ponto.nome;
    selMaterial.innerHTML = ponto.materiaisAceitos.map(ch => `<option value="${ch}">${NOMES[ch]}</option>`).join("");
    document.getElementById("d-peso").value = "";
    document.getElementById("d-erro").textContent = "";
    modal.style.display = "flex";
  }
  document.getElementById("d-cancelar").onclick = () => { modal.style.display = "none"; };

  // Marcadores + lista lateral
  const lista = document.getElementById("lista-pontos");
  for (const p of sistema.pontosColeta) {
    const materiaisTxt = p.materiaisAceitos.map(ch => NOMES[ch]).join(", ");
    const marker = L.marker([p.lat, p.lng]).addTo(mapa)
      .bindPopup(`<strong>${p.nome}</strong><br>${p.endereco}<br><em>${materiaisTxt}</em>`);
    marker.on("click", () => abrirModal(p));

    const card = document.createElement("div");
    card.className = "card";
    card.style.marginBottom = "10px";
    card.innerHTML = `<strong>${p.nome}</strong><br><span class="subtitulo">${p.endereco}</span><br><span class="tag">${materiaisTxt}</span>`;
    const btn = document.createElement("button");
    btn.className = "btn mt"; btn.textContent = "Registrar descarte";
    btn.onclick = () => { mapa.setView([p.lat, p.lng], 15); abrirModal(p); };
    card.appendChild(btn);
    lista.appendChild(card);
  }

  // Submeter descarte → entra na fila
  document.getElementById("form-descarte").onsubmit = (e) => {
    e.preventDefault();
    const erro = document.getElementById("d-erro");
    const peso = parseFloat(document.getElementById("d-peso").value);
    if (!(peso > 0)) { erro.textContent = "Informe um peso maior que zero."; return; }
    try {
      const material = criarMaterial(selMaterial.value);
      sistema.registrarDescarte(usuarioMapa, pontoSelecionado, material, peso);
      sistema.salvarEm(CHAVE_SAVE);
      modal.style.display = "none";
      alert("Descarte registrado! Ele está na fila — confirme no Histórico para ganhar os pontos.");
    } catch (ex) { erro.textContent = ex.message; }
  };
}
```

- [ ] **Step 3: Verificar no navegador**

Abrir `mapa.html` logado. 
Expected: mapa carrega com 4 marcadores; clicar abre popup; "Registrar descarte" abre o modal só com materiais aceitos pelo ponto; registrar mostra alerta e salva (vai para a fila). Requer internet (tiles + Leaflet via CDN).

- [ ] **Step 4: Commit**

```bash
git add mapa.html js/pages/mapa.js
git commit -m "feat: mapa Leaflet com pontos de coleta e registro de descarte"
```

---

## Task 18: historico.html + js/pages/historico.js (Pilha + processar Fila)

**Files:**
- Create: `historico.html`
- Create: `js/pages/historico.js`

- [ ] **Step 1: Criar `historico.html`**

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoRecicla — Histórico</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="navbar">
    <span class="logo">🌱 EcoRecicla</span>
    <nav>
      <a href="dashboard.html">Dashboard</a>
      <a href="mapa.html">Mapa</a>
      <a href="historico.html">Histórico</a>
      <a href="ranking.html">Ranking</a>
      <a href="recompensas.html">Recompensas</a>
      <a href="#" id="sair">Sair</a>
    </nav>
  </header>

  <main class="container">
    <h1>Histórico & Fila de processamento</h1>

    <div class="card mt">
      <strong>📥 Fila de descartes pendentes</strong>
      <span class="tag" id="fila-qtd">0</span>
      <div id="fila" class="mt"></div>
      <button class="btn mt" id="btn-processar">Processar próximo da fila</button>
      <button class="btn btn-secundario mt" id="btn-processar-tudo">Processar todos</button>
    </div>

    <h2 class="titulo-secao">📚 Histórico de ações (mais recentes no topo)</h2>
    <div id="historico"></div>
  </main>

  <script src="js/estruturas/Lista.js"></script>
  <script src="js/estruturas/Fila.js"></script>
  <script src="js/estruturas/Pilha.js"></script>
  <script src="js/models/Material.js"></script>
  <script src="js/models/Usuario.js"></script>
  <script src="js/models/PontoColeta.js"></script>
  <script src="js/models/Descarte.js"></script>
  <script src="js/models/Medalha.js"></script>
  <script src="js/models/Recompensa.js"></script>
  <script src="js/models/SistemaReciclagem.js"></script>
  <script src="js/services/Storage.js"></script>
  <script src="js/data/seed.js"></script>
  <script src="js/pages/login.js"></script>
  <script src="js/pages/historico.js"></script>
</body>
</html>
```

- [ ] **Step 2: Criar `js/pages/historico.js`**

```js
const usuarioHist = exigirLogin();
if (usuarioHist) {
  ligarSair();

  function renderizar() {
    // Fila (somente descartes do usuário logado, em ordem de chegada)
    const fila = sistema.filaDescartes.toArray().filter(d => d.usuario.email === usuarioHist.email);
    document.getElementById("fila-qtd").textContent = fila.length;
    const fEl = document.getElementById("fila");
    fEl.innerHTML = fila.length
      ? fila.map(d => `<div class="ranking-item"><span>${d.material.nome} — ${d.pesoKg}kg em ${d.pontoColeta.nome}</span><span class="tag">pendente</span></div>`).join("")
      : '<p class="subtitulo">Nenhum descarte pendente. Registre um no Mapa.</p>';

    // Histórico (Pilha) — recentes primeiro
    const acoes = usuarioHist.historico.recentes();
    const hEl = document.getElementById("historico");
    hEl.innerHTML = acoes.length
      ? acoes.map(a => `<div class="ranking-item"><span>${a.descricao}</span><span class="subtitulo">${new Date(a.data).toLocaleString("pt-BR")}</span></div>`).join("")
      : '<p class="subtitulo">Sem ações ainda.</p>';
  }

  document.getElementById("btn-processar").onclick = () => {
    const d = sistema.processarProximo();
    sistema.salvarEm(CHAVE_SAVE);
    if (d) renderizar(); else alert("A fila está vazia.");
  };
  document.getElementById("btn-processar-tudo").onclick = () => {
    const r = sistema.processarFila();
    sistema.salvarEm(CHAVE_SAVE);
    if (r.length) renderizar(); else alert("A fila está vazia.");
  };

  renderizar();
}
```

- [ ] **Step 3: Verificar no navegador**

Registrar um descarte no mapa, abrir `historico.html`. 
Expected: descarte aparece como pendente na fila; "Processar próximo" remove da fila, credita pontos (vê no dashboard) e adiciona ações ao histórico (topo = mais recente).

- [ ] **Step 4: Commit**

```bash
git add historico.html js/pages/historico.js
git commit -m "feat: historico (Pilha) e processamento da Fila"
```

---

## Task 19: ranking.html + js/pages/ranking.js

**Files:**
- Create: `ranking.html`
- Create: `js/pages/ranking.js`

- [ ] **Step 1: Criar `ranking.html`**

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoRecicla — Ranking</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="navbar">
    <span class="logo">🌱 EcoRecicla</span>
    <nav>
      <a href="dashboard.html">Dashboard</a>
      <a href="mapa.html">Mapa</a>
      <a href="historico.html">Histórico</a>
      <a href="ranking.html">Ranking</a>
      <a href="recompensas.html">Recompensas</a>
      <a href="#" id="sair">Sair</a>
    </nav>
  </header>
  <main class="container">
    <h1>🏆 Ranking ecológico</h1>
    <p class="subtitulo">Usuários mais engajados (ordenados por pontos).</p>
    <div id="ranking" class="mt"></div>
  </main>

  <script src="js/estruturas/Lista.js"></script>
  <script src="js/estruturas/Fila.js"></script>
  <script src="js/estruturas/Pilha.js"></script>
  <script src="js/models/Material.js"></script>
  <script src="js/models/Usuario.js"></script>
  <script src="js/models/PontoColeta.js"></script>
  <script src="js/models/Descarte.js"></script>
  <script src="js/models/Medalha.js"></script>
  <script src="js/models/Recompensa.js"></script>
  <script src="js/models/SistemaReciclagem.js"></script>
  <script src="js/services/Storage.js"></script>
  <script src="js/data/seed.js"></script>
  <script src="js/pages/login.js"></script>
  <script src="js/pages/ranking.js"></script>
</body>
</html>
```

- [ ] **Step 2: Criar `js/pages/ranking.js`**

```js
ligarSair();
const logado = sistema.usuarioLogado; // ranking é público; destaca o logado se houver
const ranking = sistema.gerarRanking();
const medalhas = ["🥇", "🥈", "🥉"];
const el = document.getElementById("ranking");

el.innerHTML = ranking.map((u, i) => {
  const eu = logado && u.email === logado.email ? " eu" : "";
  const pos = medalhas[i] || (i + 1);
  return `<div class="ranking-item${eu}">
    <span class="pos">${pos}</span>
    <span style="flex:1"><strong>${u.nome}</strong><br><span class="subtitulo">${u.nivel}</span></span>
    <span><strong>${u.pontos}</strong> pts</span>
  </div>`;
}).join("");
```

- [ ] **Step 3: Verificar no navegador**

Abrir `ranking.html`. 
Expected: lista ordenada por pontos (demos no topo), medalhas 🥇🥈🥉 nas 3 primeiras posições, usuário logado destacado com contorno verde.

- [ ] **Step 4: Commit**

```bash
git add ranking.html js/pages/ranking.js
git commit -m "feat: ranking de usuarios (usa Lista.ordenarPor)"
```

---

## Task 20: recompensas.html + js/pages/recompensas.js

**Files:**
- Create: `recompensas.html`
- Create: `js/pages/recompensas.js`

- [ ] **Step 1: Criar `recompensas.html`**

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoRecicla — Recompensas</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="navbar">
    <span class="logo">🌱 EcoRecicla</span>
    <nav>
      <a href="dashboard.html">Dashboard</a>
      <a href="mapa.html">Mapa</a>
      <a href="historico.html">Histórico</a>
      <a href="ranking.html">Ranking</a>
      <a href="recompensas.html">Recompensas</a>
      <a href="#" id="sair">Sair</a>
    </nav>
  </header>
  <main class="container">
    <h1>🎁 Loja de recompensas</h1>
    <p>Seus pontos: <strong id="meus-pontos">0</strong></p>
    <div id="recompensas" class="grid grid-3 mt"></div>
  </main>

  <script src="js/estruturas/Lista.js"></script>
  <script src="js/estruturas/Fila.js"></script>
  <script src="js/estruturas/Pilha.js"></script>
  <script src="js/models/Material.js"></script>
  <script src="js/models/Usuario.js"></script>
  <script src="js/models/PontoColeta.js"></script>
  <script src="js/models/Descarte.js"></script>
  <script src="js/models/Medalha.js"></script>
  <script src="js/models/Recompensa.js"></script>
  <script src="js/models/SistemaReciclagem.js"></script>
  <script src="js/services/Storage.js"></script>
  <script src="js/data/seed.js"></script>
  <script src="js/pages/login.js"></script>
  <script src="js/pages/recompensas.js"></script>
</body>
</html>
```

- [ ] **Step 2: Criar `js/pages/recompensas.js`**

```js
const usuarioRec = exigirLogin();
if (usuarioRec) {
  ligarSair();

  function renderizar() {
    document.getElementById("meus-pontos").textContent = usuarioRec.pontos;
    const el = document.getElementById("recompensas");
    el.innerHTML = "";
    for (const r of sistema.recompensas) {
      const pode = r.podeResgatar(usuarioRec);
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<span class="tag">${r.parceiro}</span>
        <h3 class="mt">${r.nome}</h3>
        <p class="subtitulo">${r.descricao()}</p>
        <p class="mt"><strong>${r.custoPontos} pts</strong></p>`;
      const btn = document.createElement("button");
      btn.className = "btn mt";
      btn.textContent = pode ? "Resgatar" : "Pontos insuficientes";
      btn.disabled = !pode;
      btn.onclick = () => {
        try {
          const msg = sistema.resgatarRecompensa(usuarioRec, r.id);
          sistema.salvarEm(CHAVE_SAVE);
          alert("✅ " + msg);
          renderizar();
        } catch (ex) { alert(ex.message); }
      };
      card.appendChild(btn);
      el.appendChild(card);
    }
  }
  renderizar();
}
```

- [ ] **Step 3: Verificar no navegador**

Abrir `recompensas.html` logado. 
Expected: catálogo com descontos e brindes; botão desabilitado quando faltam pontos; resgatar desconta pontos, mostra mensagem do benefício e atualiza o saldo. A ação aparece no histórico.

- [ ] **Step 4: Commit**

```bash
git add recompensas.html js/pages/recompensas.js
git commit -m "feat: loja de recompensas com resgate por pontos"
```

---

## Task 21: Documentação acadêmica (entregáveis)

**Files:**
- Create: `docs/documentacao.md`

- [ ] **Step 1: Criar `docs/documentacao.md`** cobrindo os 10 entregáveis do enunciado

Conteúdo (preencher com base no que foi implementado — todas as seções são obrigatórias, sem TODO):
1. **Descrição completa da aplicação** — o que é o EcoRecicla, propósito e funcionamento (resumir do spec).
2. **Casos de uso** — listar: Cadastrar-se, Fazer login, Visualizar pontos no mapa, Registrar descarte, Processar fila/confirmar descarte, Ver histórico, Ver ranking, Resgatar recompensa, Acompanhar metas e impacto. Para cada: ator, pré-condição, fluxo principal.
3. **Diagrama de classes em texto** — copiar o diagrama da Task 4/Seção 4 do spec, com atributos e métodos de cada classe.
4. **Estrutura de pastas** — copiar a árvore de arquivos deste plano.
5. **Código completo** — apontar que está no repositório, listando os arquivos por pasta.
6. **Classes POO** — explicar Encapsulamento (`Usuario` com `#`), Herança (`Material`, `Recompensa`), Polimorfismo (`calcularImpacto`, `descricao`), Abstração (`SistemaReciclagem`), citando os arquivos.
7. **Estruturas de dados** — `Lista` (usuários/ranking), `Fila` (descartes pendentes), `Pilha` (histórico): onde e por quê, com referência aos arquivos.
8. **Roteiro para o vídeo** — passo a passo da demonstração: abrir landing → cadastrar/login → mapa e registrar descarte → histórico e processar fila → dashboard (pontos/impacto/medalhas) → ranking → recompensas → `tests.html` mostrando testes verdes; explicar POO e estruturas durante a demo.
9. **Como atende à ODS 12** — meta 12.5 (redução de resíduos via reciclagem), educação para consumo responsável, medição de impacto.
10. **Melhorias futuras** — backend real com login seguro, geolocalização do usuário, integração com APIs de coleta municipais, app mobile/PWA, validação de descarte por QR Code no ponto, notificações de metas.

- [ ] **Step 2: Commit**

```bash
git add docs/documentacao.md
git commit -m "docs: documentacao academica completa (10 entregaveis)"
```

---

## Task 22: Verificação final (smoke test manual)

**Files:** nenhum (apenas verificação)

- [ ] **Step 1: Rodar a suíte de testes de lógica**

Run: `node tests/run.js`
Expected: 100% verde, `process.exit(0)`.

- [ ] **Step 2: Abrir `tests.html`** — todos os testes verdes no navegador.

- [ ] **Step 3: Fluxo completo no navegador** (com internet para o mapa)

1. `index.html` → "Comece agora".
2. Cadastrar novo usuário → cai no dashboard (0 pontos).
3. `mapa.html` → registrar 2 descartes em pontos diferentes.
4. `historico.html` → "Processar todos" → pontos creditados, histórico preenchido.
5. `dashboard.html` → pontos/impacto/medalhas atualizados; barra de meta avança.
6. `ranking.html` → seu usuário aparece e é destacado.
7. `recompensas.html` → resgatar uma recompensa que você já tem saldo.
8. Recarregar qualquer página logada → estado persiste (localStorage).

Expected: todo o fluxo funciona sem erros no console.

- [ ] **Step 4: Commit final (se houver ajustes)**

```bash
git add -A
git commit -m "chore: verificacao final e ajustes do fluxo completo"
```

---

## Notas de execução

- **Internet necessária** apenas no `mapa.html` (Leaflet + tiles via CDN). Todo o resto roda offline com clique duplo.
- **Dependências entre arquivos (Node + navegador)**: nos blocos `if (typeof module ...)` use `globalThis.X = require(...).X` — **não** declare o nome com `var`/`let`/`const`. No navegador o `if` é pulado e as classes já são globais; declarar o nome no escopo global colidiria com o binding léxico de `class X` de outro `<script>` e lançaria SyntaxError ao carregar (bug "funciona no Node, quebra no navegador").
- **Reset de dados**: para zerar, abrir o console do navegador e rodar `localStorage.clear()` (ou criar um botão de reset, opcional).
- **Ordem dos `<script>`**: estruturas → Material → Usuario → PontoColeta → Descarte → Medalha → Recompensa → SistemaReciclagem → Storage → seed → login → página. Manter essa ordem em todas as páginas.
