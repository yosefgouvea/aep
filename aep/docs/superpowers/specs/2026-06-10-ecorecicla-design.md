# EcoRecicla — Documento de Design (Spec)

**Data:** 2026-06-10
**Tema:** Aplicação web para incentivo à reciclagem e ao descarte correto de resíduos, alinhada à **ODS 12** (Consumo e Produção Responsáveis) da ONU.
**Tipo:** Projeto acadêmico (Análise e Desenvolvimento de Sistemas).

---

## 1. Visão geral & proposta de valor

**EcoRecicla** é uma aplicação web que transforma a reciclagem em uma experiência gamificada. O usuário registra descartes em pontos de coleta, ganha pontos e medalhas, sobe de nível, compete no ranking e troca pontos por recompensas de estabelecimentos parceiros.

- **Problema que resolve:** falta de incentivo e de informação para o descarte correto de resíduos recicláveis.
- **Usuários:** cidadãos comuns que querem reciclar de forma correta e ser recompensados por isso.
- **Diferencial:** combina gamificação (pontos, níveis, medalhas, ranking, metas) com um **indicador de impacto ambiental mensurável** (CO₂ evitado, água poupada, árvores equivalentes) e recompensas reais de parceiros.
- **Impacto social e ambiental:** aumenta o volume de material reciclado corretamente, gera consciência ambiental e conecta cidadãos a pontos de coleta próximos.

### Alinhamento com a ODS 12
A ODS 12 trata de Consumo e Produção Responsáveis, incluindo a meta 12.5 (reduzir a geração de resíduos por prevenção, redução, reciclagem e reuso). O EcoRecicla atua diretamente nessa meta ao **incentivar e facilitar a reciclagem**, **educar** sobre descarte correto e **medir o impacto** ambiental de cada usuário.

---

## 2. Arquitetura

| Item | Decisão |
|------|---------|
| Camadas | 100% front-end (sem backend) |
| Linguagens | HTML, CSS e JavaScript puro (vanilla) |
| Persistência | `localStorage` (dados serializados em JSON) |
| Mapa | Leaflet + OpenStreetMap (via CDN, sem chave de API) |
| Organização JS | Classes em arquivos `.js` separados, carregadas via `<script>` no HTML |
| Execução | Abre direto no navegador com clique duplo no `index.html` (file://), sem servidor |
| Identidade visual | Estilo vibrante & gamificado: gradientes verde/ciano, cantos arredondados, sombras suaves, emojis |

**Justificativa:** o enunciado pede apenas HTML/CSS/JS e classes em POO. Scripts clássicos (em vez de módulos ES6) garantem que o projeto rode com clique duplo, sem atrito para avaliação e gravação do vídeo.

---

## 3. Estrutura de pastas

```
aep/
├── index.html            → landing (apresenta projeto + ODS 12)
├── login.html            → cadastro e login
├── dashboard.html        → pontos, nível, meta, impacto, medalhas
├── mapa.html             → mapa Leaflet + lista de pontos de coleta
├── historico.html        → histórico (Pilha) + processar Fila
├── ranking.html          → leaderboard de usuários
├── recompensas.html      → loja de recompensas de parceiros
├── tests.html            → testes automáticos das classes e estruturas
├── css/
│   └── style.css         → tema vibrante global
├── js/
│   ├── models/
│   │   ├── Material.js            (abstrata) + Plastico, Papel, Vidro, Metal, Eletronico
│   │   ├── Recompensa.js          (abstrata) + RecompensaDesconto, RecompensaBrinde
│   │   ├── Usuario.js
│   │   ├── PontoColeta.js
│   │   ├── Descarte.js
│   │   ├── Medalha.js
│   │   └── SistemaReciclagem.js   (orquestrador)
│   ├── estruturas/
│   │   ├── Lista.js               (List)
│   │   ├── Fila.js                (Queue / FIFO)
│   │   └── Pilha.js               (Stack / LIFO)
│   ├── services/
│   │   └── Storage.js             (wrapper de localStorage)
│   ├── data/
│   │   └── seed.js                (pontos de coleta, materiais, usuários demo)
│   └── pages/
│       ├── dashboard.js, mapa.js, login.js, historico.js,
│       └── ranking.js, recompensas.js   (um controlador por página)
└── docs/
    └── (documentação acadêmica completa)
```

> Observação: para os modelos carregados via `<script>`, a ordem de inclusão importa — bases (`Material`, `Recompensa`, estruturas, `Storage`) antes das classes que dependem delas.

---

## 4. Modelagem Orientada a Objetos

### Diagrama de classes (texto)

```
Material (ABSTRATA)                      ← Abstração + Herança + Polimorfismo
 ├─ Plastico
 ├─ Papel
 ├─ Vidro
 ├─ Metal
 └─ Eletronico
   cada subclasse sobrescreve calcularPontos(peso) e calcularImpacto(peso)
   com fatores próprios (pontos/kg, CO₂, água, árvores)

Recompensa (ABSTRATA)                    ← Herança + Polimorfismo
 ├─ RecompensaDesconto   → aplicarBeneficio() / descricao() próprios
 └─ RecompensaBrinde     → idem

Usuario          ← Encapsulamento (campos privados #)
PontoColeta
Descarte
Medalha
SistemaReciclagem (orquestrador)
   ── usa ──→ Lista<Usuario>          (usuários cadastrados)
   ── usa ──→ Fila<Descarte>          (descartes pendentes de validação)
   Usuario  ── tem ──→ Pilha          (histórico de ações)
```

### Descrição das classes

**`Material`** (abstrata)
- Atributos: `nome`, `fatorPontos`.
- Métodos: `calcularPontos(pesoKg)`, `calcularImpacto(pesoKg)` (retorna `{co2, agua, arvores}`).
- Subclasses `Plastico`, `Papel`, `Vidro`, `Metal`, `Eletronico` sobrescrevem o cálculo de impacto com fatores próprios.

**`Recompensa`** (abstrata)
- Atributos: `id`, `nome`, `parceiro`, `custoPontos`, `descricaoBase`.
- Métodos: `descricao()`, `aplicarBeneficio(usuario)`, `resgatar(usuario)`.
- Subclasses `RecompensaDesconto` e `RecompensaBrinde` definem benefício e descrição próprios.

**`Usuario`**
- Atributos privados: `#nome`, `#email`, `#senha`, `#pontos`, `#nivel`, `#medalhas[]`, `#metaMensalKg`, `#historico` (Pilha).
- Construtor: recebe nome, email, senha.
- Métodos: `adicionarPontos(p)`, `calcularNivel()`, `desbloquearMedalha(m)`, getters/setters, `registrarAcao(acao)`.
- Encapsulamento: acesso a saldo/senha só via métodos públicos.

**`PontoColeta`**
- Atributos: `id`, `nome`, `endereco`, `lat`, `lng`, `materiaisAceitos[]`.
- Métodos: `aceita(material)`.

**`Descarte`**
- Atributos: `id`, `usuario`, `pontoColeta`, `material`, `pesoKg`, `data`, `status` (`pendente`/`confirmado`), `pontosGerados`, `impacto`.
- Métodos: `confirmar()` (calcula pontos e impacto via polimorfismo do material).

**`Medalha`**
- Atributos: `id`, `nome`, `icone`, `criterio`, `desbloqueada`.
- Métodos: `verificar(usuario)`.

**`SistemaReciclagem`** (orquestrador — abstração)
- Mantém `Lista<Usuario>` e `Fila<Descarte>`.
- Métodos públicos: `cadastrarUsuario()`, `login()`, `registrarDescarte()` (enfileira), `processarFila()` (desenfileira, confirma, credita pontos, verifica medalhas), `gerarRanking()`, `resgatarRecompensa()`.

### Conceitos de POO utilizados (para o vídeo)
- **Encapsulamento:** campos privados (`#`) em `Usuario`, manipulados só por métodos.
- **Herança:** `Material` e `Recompensa` como bases reutilizadas pelos subtipos.
- **Polimorfismo:** `calcularImpacto()` e `descricao()` se comportam de forma diferente conforme o tipo concreto; o sistema chama o mesmo método sem conhecer a subclasse.
- **Abstração:** `SistemaReciclagem` expõe operações de alto nível escondendo a complexidade interna.

---

## 5. Estruturas de dados

| Estrutura | Arquivo | Onde é usada | Por quê |
|-----------|---------|--------------|---------|
| **Lista** | `Lista.js` | Usuários cadastrados; base do ranking | Coleção dinâmica com busca e ordenação (`adicionar`, `buscar`, `ordenarPor`) |
| **Fila** (FIFO) | `Fila.js` | Descartes pendentes de validação | Processar na ordem de chegada (`enfileirar`, `desenfileirar`); botão "Processar próximo" |
| **Pilha** (LIFO) | `Pilha.js` | Histórico de ações do usuário | Ação mais recente no topo (`empilhar`, `desempilhar`, `topo`) |

Cada arquivo terá comentários explicando **onde** e **por que** a estrutura é usada (exigência do enunciado).

---

## 6. Páginas & funcionalidades

1. **index.html** — apresenta o projeto, a ODS 12, a proposta de valor e CTA para login.
2. **login.html** — cadastro + login com validação; sessão guardada em localStorage.
3. **dashboard.html** — saldo de pontos, nível + barra de progresso, meta mensal, painel de impacto ambiental (CO₂/água/árvores), medalhas conquistadas, atalho "registrar descarte".
4. **mapa.html** — mapa Leaflet com marcadores dos pontos; popup com materiais aceitos e botão "registrar descarte aqui"; lista lateral sincronizada com filtro por material.
5. **Registrar descarte** (modal) — seleciona ponto, material e peso (kg); o descarte entra na **Fila**.
6. **historico.html** — **Pilha** de ações com status pendente/confirmado; botão "Processar fila" que valida e credita pontos.
7. **ranking.html** — leaderboard ordenado por pontos (usa **Lista**).
8. **recompensas.html** — catálogo de recompensas de parceiros; resgatar gastando pontos.

---

## 7. Regras de gamificação

- **Pontos** = `pesoKg × fatorPontos` do material.
- **Níveis** por faixa de pontos: Iniciante → Reciclador → Eco-Guerreiro → Guardião do Planeta.
- **Medalhas** desbloqueadas por critérios (1º descarte, 10 kg reciclados, 5 dias seguidos, etc.).
- **Meta mensal** de reciclagem com barra de progresso.
- **Impacto ambiental** acumulado por material: CO₂ evitado, litros de água poupados, árvores equivalentes.

---

## 8. Tratamento de erros

- Validação de formulários: email válido, senha mínima, peso > 0, campos obrigatórios.
- `Storage.js` com `try/catch` e fallback caso o localStorage falhe ou esteja indisponível.
- Estados vazios tratados (sem descartes, ranking vazio, sem medalhas).
- Login: feedback de credenciais inválidas; cadastro bloqueia e-mail duplicado.

---

## 9. Testes

- **tests.html** roda asserções automáticas no próprio navegador (sem build/ferramentas):
  - `Fila` respeita FIFO;
  - `Pilha` respeita LIFO;
  - `Lista` adiciona/busca/ordena corretamente;
  - cálculo de pontos por material;
  - polimorfismo de `calcularImpacto()` por subtipo de `Material`.
- Cada teste mostra ✅/❌ — útil para a nota e fácil de exibir no vídeo.

---

## 10. Entregáveis (em `docs/`)

Documentação cobrindo os 10 itens do enunciado:
1. Descrição completa da aplicação.
2. Casos de uso.
3. Diagrama de classes em texto.
4. Estrutura de pastas do projeto.
5. Código completo (HTML/CSS/JS).
6. Implementação das classes POO.
7. Implementação das estruturas de dados.
8. Roteiro/explicação detalhada para a apresentação em vídeo.
9. Explicação de como o projeto atende à ODS 12.
10. Sugestões de melhorias futuras.

---

## 11. Fora de escopo (YAGNI)

- Backend, banco de dados ou API.
- Autenticação real / criptografia forte (a senha é validada localmente; será apenas ofuscada, não é segurança de produção).
- Pagamentos reais nas recompensas.
- Aplicativo mobile nativo / PWA offline avançado.
