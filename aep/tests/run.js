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
