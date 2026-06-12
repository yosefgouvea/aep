# EcoRecicla — Documentação Acadêmica Completa

**Disciplina:** Análise e Desenvolvimento de Sistemas
**Tema:** Aplicação web para incentivo à reciclagem e ao descarte correto de resíduos
**Alinhamento:** ODS 12 — Consumo e Produção Responsáveis (ONU)

---

## Sumário

1. [Descrição completa da aplicação](#1-descrição-completa-da-aplicação)
2. [Casos de uso](#2-casos-de-uso)
3. [Diagrama de classes em texto](#3-diagrama-de-classes-em-texto)
4. [Estrutura de pastas](#4-estrutura-de-pastas)
5. [Código completo](#5-código-completo)
6. [Classes orientadas a objetos](#6-classes-orientadas-a-objetos)
7. [Estruturas de dados](#7-estruturas-de-dados)
8. [Roteiro para o vídeo de apresentação](#8-roteiro-para-o-vídeo-de-apresentação)
9. [Atendimento à ODS 12](#9-atendimento-à-ods-12)
10. [Sugestões de melhorias futuras](#10-sugestões-de-melhorias-futuras)

---

## 1. Descrição completa da aplicação

### O que é o EcoRecicla

O **EcoRecicla** é uma aplicação web que transforma a reciclagem em uma experiência gamificada. O cidadão registra seus descartes em pontos de coleta próximos, acumula pontos e medalhas, sobe de nível, compete em um ranking ecológico e troca seus pontos por recompensas reais de parceiros (descontos e brindes). Ao mesmo tempo, acompanha o impacto ambiental mensurável de cada ação: CO₂ evitado, litros de água poupados e árvores equivalentes preservadas.

### Problema que resolve

A baixa adesão à reciclagem no Brasil decorre, em grande parte, da falta de incentivo tangível e de informação sobre onde e como descartar corretamente. O EcoRecicla combate esses dois obstáculos: informa onde ficam os pontos de coleta (via mapa interativo) e recompensa cada descarte realizado.

### Público-alvo

Cidadãos comuns que desejam reciclar de forma correta e ser recompensados por isso. Não é necessário conhecimento técnico; o fluxo é intuitivo e visual.

### Diferencial

- **Gamificação completa:** pontos por descarte, quatro níveis de usuário (Iniciante, Reciclador, Eco-Guerreiro, Guardião do Planeta), quatro medalhas desbloqueáveis por critérios objetivos e ranking público.
- **Impacto ambiental mensurável:** cada material tem fatores próprios de CO₂, água e árvores (calculados via polimorfismo). O usuário vê, no dashboard, o total acumulado de sua contribuição ambiental.
- **Recompensas reais:** descontos percentuais e brindes em parceiros, resgatáveis diretamente na plataforma.
- **Zero dependência de servidor:** roda com clique duplo no arquivo `index.html`, persiste dados em `localStorage` e usa Leaflet/OpenStreetMap via CDN para o mapa.

### Arquitetura técnica

| Aspecto | Decisão |
|---------|---------|
| Linguagens | HTML5, CSS3 e JavaScript ES2022 (vanilla) |
| Persistência | `localStorage` (JSON serializado) |
| Mapa | Leaflet 1.9.4 + OpenStreetMap (CDN) |
| Organização JS | Classes em arquivos `.js` separados, carregadas via `<script>` em ordem específica |
| Execução | Clique duplo no `index.html` (protocolo `file://`), sem servidor, sem build |
| Testes | `tests/run.js` (Node) + `tests.html` (navegador) |

### Fluxo geral da aplicação

```
Landing (index.html)
    └─ Login / Cadastro (login.html)
           └─ Dashboard (dashboard.html)  ←──────────────────────┐
                  ├─ Mapa + Registrar descarte (mapa.html)        │
                  │         └─ Descarte vai para a Fila           │
                  ├─ Histórico + Processar Fila (historico.html)  │
                  │         └─ Pontos creditados, Pilha atualizada─┘
                  ├─ Ranking (ranking.html)
                  └─ Recompensas (recompensas.html)
```

---

## 2. Casos de uso

### UC-01 — Cadastrar-se

| Campo | Detalhe |
|-------|---------|
| **Ator** | Visitante (usuário sem conta) |
| **Pré-condição** | Acessar `login.html` e clicar em "Cadastrar" |
| **Fluxo principal** | 1. Preenche nome, e-mail e senha (mínimo 4 caracteres). 2. O sistema valida se o e-mail já está cadastrado (`SistemaReciclagem.cadastrarUsuario`). 3. Cria um `Usuario` com `#pontos = 0` e nível "Iniciante". 4. Adiciona à `Lista` de usuários. 5. Salva no `localStorage`. 6. Redireciona para `dashboard.html`. |
| **Exceção** | E-mail duplicado: exibe mensagem "E-mail já cadastrado". Senha curta: exibe mensagem de validação. |

### UC-02 — Fazer login

| Campo | Detalhe |
|-------|---------|
| **Ator** | Usuário cadastrado |
| **Pré-condição** | Possuir e-mail e senha cadastrados |
| **Fluxo principal** | 1. Preenche e-mail e senha. 2. `SistemaReciclagem.login` busca o usuário na `Lista` e compara a senha ofuscada (`Usuario.verificarSenha`). 3. Define `usuarioLogado`. 4. Salva sessão no `localStorage`. 5. Redireciona para `dashboard.html`. |
| **Exceção** | Credenciais inválidas: exibe "Credenciais inválidas". |

### UC-03 — Visualizar pontos de coleta no mapa

| Campo | Detalhe |
|-------|---------|
| **Ator** | Usuário logado |
| **Pré-condição** | Estar autenticado; internet disponível para carregar o mapa Leaflet |
| **Fluxo principal** | 1. Acessa `mapa.html`. 2. O sistema carrega os quatro `PontoColeta` do `seed.js`. 3. Cada ponto é exibido como marcador no mapa (Leaflet + OpenStreetMap) e como card na lista lateral. 4. O popup do marcador exibe nome, endereço e materiais aceitos. |

### UC-04 — Registrar descarte

| Campo | Detalhe |
|-------|---------|
| **Ator** | Usuário logado |
| **Pré-condição** | Estar autenticado; estar na página do mapa |
| **Fluxo principal** | 1. Clica em um marcador ou em "Registrar descarte" na lista lateral. 2. Modal exibe seletor de material (apenas os aceitos pelo ponto) e campo de peso (kg). 3. Confirma. 4. `SistemaReciclagem.registrarDescarte` cria um `Descarte` com `status = "pendente"` e o **enfileira** na `Fila`. 5. Registra uma ação na `Pilha` do usuário. 6. Salva no `localStorage`. |
| **Exceção** | Peso ≤ 0: exibe "Informe um peso maior que zero". |

### UC-05 — Processar fila / confirmar descarte

| Campo | Detalhe |
|-------|---------|
| **Ator** | Usuário logado |
| **Pré-condição** | Existir pelo menos um descarte pendente na fila |
| **Fluxo principal** | 1. Acessa `historico.html`. 2. Visualiza os descartes pendentes (retirados da `Fila` via `toArray().filter`). 3. Clica em "Processar próximo" ou "Processar todos". 4. `SistemaReciclagem.processarProximo` desenfileira o descarte, chama `Descarte.confirmar()` (calcula pontos e impacto via polimorfismo do material), credita pontos e impacto no `Usuario`, atualiza kg reciclados, verifica medalhas. 5. Página é re-renderizada mostrando o estado atualizado. |

### UC-06 — Ver histórico de ações

| Campo | Detalhe |
|-------|---------|
| **Ator** | Usuário logado |
| **Pré-condição** | Ter realizado pelo menos uma ação (descarte ou resgate) |
| **Fluxo principal** | 1. Acessa `historico.html`. 2. O sistema chama `usuario.historico.recentes()` na `Pilha`, que retorna as ações do topo para a base (mais recentes primeiro). 3. Cada ação é exibida com descrição e data/hora. |

### UC-07 — Ver ranking

| Campo | Detalhe |
|-------|---------|
| **Ator** | Qualquer visitante (ranking é público) |
| **Pré-condição** | Nenhuma |
| **Fluxo principal** | 1. Acessa `ranking.html`. 2. `SistemaReciclagem.gerarRanking()` chama `Lista.ordenarPor("pontos", true)` (ordem decrescente). 3. O leaderboard exibe todos os usuários com nome, nível e pontuação. As três primeiras posições recebem medalhas 🥇🥈🥉. O usuário logado é destacado com contorno verde. |

### UC-08 — Resgatar recompensa

| Campo | Detalhe |
|-------|---------|
| **Ator** | Usuário logado |
| **Pré-condição** | Possuir pontos suficientes para pelo menos uma recompensa |
| **Fluxo principal** | 1. Acessa `recompensas.html`. 2. Catálogo exibe as recompensas com nome, parceiro, descrição (polimorfismo: "10% de desconto em Café Verde" ou "Brinde: ecobag em EcoStore") e custo em pontos. Botão desabilitado se saldo insuficiente. 3. Clica em "Resgatar". 4. `SistemaReciclagem.resgatarRecompensa` valida saldo, chama `Recompensa.resgatar`, desconta pontos via `Usuario.gastarPontos`, registra ação na `Pilha`. 5. Exibe mensagem de confirmação (cupom ou voucher). |
| **Exceção** | Pontos insuficientes: botão desabilitado e exceção capturada se tentado via código. |

### UC-09 — Acompanhar metas e impacto ambiental

| Campo | Detalhe |
|-------|---------|
| **Ator** | Usuário logado |
| **Pré-condição** | Estar autenticado |
| **Fluxo principal** | 1. Acessa `dashboard.html`. 2. Exibe: pontos totais, nível atual, kg reciclados, barra de progresso da meta mensal (padrão: 20 kg), CO₂ evitado, litros de água poupados, árvores equivalentes preservadas, e painel de medalhas (desbloqueadas em cor, bloqueadas em cinza). |

---

## 3. Diagrama de classes em texto

```
┌─────────────────────────────────────────────────────────────┐
│  HIERARQUIA DE MATERIAL (Abstração + Herança + Polimorfismo) │
└─────────────────────────────────────────────────────────────┘

Material  [ABSTRATA]
  Atributos: nome: string, fatorPontos: number
  Métodos:   calcularPontos(pesoKg): number
             calcularImpacto(pesoKg): { co2, agua, arvores }  ← ABSTRATO
  ├── Plastico   fatorPontos=10  calcularImpacto → co2×1.5, agua×100, arvores×0.02
  ├── Papel      fatorPontos=8   calcularImpacto → co2×1.1, agua×50,  arvores×0.017
  ├── Vidro      fatorPontos=6   calcularImpacto → co2×0.3, agua×20,  arvores=0
  ├── Metal      fatorPontos=12  calcularImpacto → co2×4,   agua×150, arvores=0
  └── Eletronico fatorPontos=20  calcularImpacto → co2×5,   agua×200, arvores=0

  Função auxiliar: criarMaterial(chave: string): Material

┌────────────────────────────────────────────────────────────┐
│  HIERARQUIA DE RECOMPENSA (Herança + Polimorfismo)         │
└────────────────────────────────────────────────────────────┘

Recompensa  [ABSTRATA]
  Atributos: id, nome, parceiro, custoPontos
  Métodos:   podeResgatar(usuario): boolean
             resgatar(usuario): string
             descricao(): string              ← ABSTRATO
             aplicarBeneficio(usuario): string ← ABSTRATO
  ├── RecompensaDesconto
  │     Atributos extras: percentual
  │     descricao()       → "X% de desconto em <parceiro>"
  │     aplicarBeneficio() → "Cupom de X% gerado para <parceiro>"
  └── RecompensaBrinde
        Atributos extras: brinde
        descricao()       → "Brinde: <brinde> em <parceiro>"
        aplicarBeneficio() → "Voucher de <brinde> gerado para <parceiro>"

┌────────────────────────────────────────────────────────────┐
│  CLASSE Usuario (Encapsulamento)                           │
└────────────────────────────────────────────────────────────┘

Usuario
  Atributos privados (#):
    #nome, #email, #senha (hash), #pontos, #nivel
    #medalhas: Medalha[], #metaMensalKg: number
    #historico: Pilha, #impacto: {co2, agua, arvores}, #kgReciclados
  Atributos estáticos:
    ofuscar(txt): string
  Getters (somente leitura):
    nome, email, pontos, nivel, medalhas, historico,
    metaMensalKg, impacto, kgReciclados
  Métodos públicos:
    verificarSenha(senha): boolean
    adicionarPontos(p): number
    gastarPontos(p): void
    adicionarKg(kg): void
    registrarImpacto(imp): void
    registrarAcao(descricao): void
    desbloquearMedalha(medalha): boolean
    toJSON(): object
    fromJSON(obj, catalogoMedalhas): Usuario  [estático]
  Método privado:
    #calcularNivel(): string

┌────────────────────────────────────────────────────────────┐
│  CLASSE PontoColeta                                        │
└────────────────────────────────────────────────────────────┘

PontoColeta
  Atributos: id, nome, endereco, lat, lng, materiaisAceitos: string[]
  Métodos:   aceita(chaveMaterial: string): boolean

┌────────────────────────────────────────────────────────────┐
│  CLASSE Descarte                                           │
└────────────────────────────────────────────────────────────┘

Descarte
  Atributos: id, usuario: Usuario, pontoColeta: PontoColeta,
             material: Material, pesoKg, data: Date,
             status: "pendente"|"confirmado",
             pontosGerados: number, impacto: {co2, agua, arvores}
  Métodos:   confirmar(): Descarte

┌────────────────────────────────────────────────────────────┐
│  CLASSE Medalha                                            │
└────────────────────────────────────────────────────────────┘

Medalha
  Atributos: id, nome, icone, criterio: (Usuario)=>boolean, desbloqueada
  Métodos:   verificar(usuario: Usuario): boolean

┌────────────────────────────────────────────────────────────┐
│  CLASSE SistemaReciclagem (Abstração — orquestrador)       │
└────────────────────────────────────────────────────────────┘

SistemaReciclagem
  Atributos privados: #contadorDescarte
  Atributos públicos:
    usuarios: Lista<Usuario>
    filaDescartes: Fila<Descarte>
    pontosColeta: PontoColeta[]
    recompensas: Recompensa[]
    medalhas: Medalha[]
    usuarioLogado: Usuario | null
  Métodos públicos:
    cadastrarUsuario(nome, email, senha): Usuario
    login(email, senha): Usuario
    logout(): void
    registrarDescarte(usuario, pontoColeta, material, pesoKg): Descarte
    processarProximo(): Descarte | null
    processarFila(): Descarte[]
    verificarMedalhas(usuario): void
    gerarRanking(): Usuario[]
    resgatarRecompensa(usuario, idRecompensa): string
    salvarEm(chave): void
    carregarDe(chave): boolean
  Método privado:
    #chaveDoMaterial(material): string

┌────────────────────────────────────────────────────────────┐
│  ESTRUTURAS DE DADOS                                       │
└────────────────────────────────────────────────────────────┘

Lista
  Atributos privados: #itens: any[]
  Métodos: adicionar(item), remover(item), buscar(predicado),
           filtrar(predicado), ordenarPor(chave, desc), toArray()
  Getter: tamanho

Fila  [FIFO]
  Atributos privados: #itens: any[]
  Métodos: enfileirar(item), desenfileirar(), toArray()
  Getters: frente, vazia, tamanho

Pilha  [LIFO]
  Atributos privados: #itens: any[]
  Métodos: empilhar(item), desempilhar(), toArray(), recentes()
  Getters: topo, vazia, tamanho

┌────────────────────────────────────────────────────────────┐
│  RELACIONAMENTOS                                           │
└────────────────────────────────────────────────────────────┘

SistemaReciclagem ──usa──► Lista<Usuario>       (usuarios cadastrados)
SistemaReciclagem ──usa──► Fila<Descarte>       (descartes pendentes)
Usuario           ──tem──► Pilha                (historico de acoes)
Descarte          ──ref──► Usuario, PontoColeta, Material
```

---

## 4. Estrutura de pastas

A seguir a árvore real do projeto conforme implementado:

```
aep/
├── index.html             → landing: apresenta o projeto e a ODS 12
├── login.html             → cadastro e login
├── dashboard.html         → pontos, nível, meta mensal, impacto, medalhas
├── mapa.html              → mapa Leaflet com pontos de coleta + modal de descarte
├── historico.html         → fila de pendentes e pilha de ações (mais recentes no topo)
├── ranking.html           → leaderboard ordenado por pontos
├── recompensas.html       → catálogo de recompensas de parceiros
├── tests.html             → testes automáticos das classes no navegador
├── css/
│   └── style.css          → tema vibrante e gamificado (gradiente verde/ciano)
├── js/
│   ├── estruturas/
│   │   ├── Lista.js       → Lista dinâmica com busca, filtro e ordenação
│   │   ├── Fila.js        → Fila FIFO (descartes pendentes)
│   │   └── Pilha.js       → Pilha LIFO (histórico de ações)
│   ├── models/
│   │   ├── Material.js    → classe abstrata + Plastico, Papel, Vidro, Metal, Eletronico
│   │   ├── Recompensa.js  → classe abstrata + RecompensaDesconto, RecompensaBrinde
│   │   ├── Usuario.js     → encapsulamento com campos privados (#)
│   │   ├── PontoColeta.js → ponto de coleta com lista de materiais aceitos
│   │   ├── Descarte.js    → registro de descarte (pendente → confirmado)
│   │   ├── Medalha.js     → conquista baseada em critério (função)
│   │   └── SistemaReciclagem.js → orquestrador (abstração de alto nível)
│   ├── services/
│   │   └── Storage.js     → wrapper de localStorage com try/catch
│   ├── data/
│   │   └── seed.js        → pontos de coleta, recompensas, medalhas e usuários demo
│   └── pages/
│       ├── login.js       → bootstrap do sistema + handlers de login/cadastro
│       ├── dashboard.js   → renderiza métricas, meta e medalhas do usuário logado
│       ├── mapa.js        → inicializa mapa Leaflet e modal de registro de descarte
│       ├── historico.js   → exibe fila pendente e pilha de ações; processa a fila
│       ├── ranking.js     → exibe leaderboard via Lista.ordenarPor
│       └── recompensas.js → exibe catálogo e trata resgate de recompensas
├── tests/
│   ├── run.js             → runner de testes para Node (sem dependências externas)
│   ├── Lista.test.js
│   ├── Fila.test.js
│   ├── Pilha.test.js
│   ├── Material.test.js
│   ├── Usuario.test.js
│   ├── PontoColeta.test.js
│   ├── Descarte.test.js
│   ├── Medalha.test.js
│   ├── Recompensa.test.js
│   ├── SistemaReciclagem.test.js
│   └── Storage.test.js
└── docs/
    ├── documentacao.md    → este documento (10 entregáveis)
    └── superpowers/
        ├── plans/         → plano de implementação
        └── specs/         → documento de design (spec)
```

**Observação sobre ordem de carregamento:** como os scripts são carregados via `<script>` clássico (sem módulos ES6), a ordem importa. Toda página HTML segue a sequência: `Lista.js → Fila.js → Pilha.js → Material.js → Usuario.js → PontoColeta.js → Descarte.js → Medalha.js → Recompensa.js → SistemaReciclagem.js → Storage.js → seed.js → login.js → [script da página]`.

---

## 5. Código completo

Todo o código-fonte está no repositório git do projeto. Os arquivos estão organizados conforme a árvore da seção anterior. A seguir, o mapeamento por responsabilidade:

### Estruturas de dados
| Arquivo | Responsabilidade |
|---------|-----------------|
| `js/estruturas/Lista.js` | Coleção dinâmica com inserção, remoção, busca por predicado, filtro e ordenação por chave |
| `js/estruturas/Fila.js` | Fila FIFO: `enfileirar` / `desenfileirar` / getter `frente` |
| `js/estruturas/Pilha.js` | Pilha LIFO: `empilhar` / `desempilhar` / getter `topo` / `recentes()` |

### Modelos (POO)
| Arquivo | Responsabilidade |
|---------|-----------------|
| `js/models/Material.js` | Hierarquia de materiais recicláveis com cálculo polimórfico de pontos e impacto |
| `js/models/Recompensa.js` | Hierarquia de recompensas (descontos e brindes) com descrição e benefício polimórficos |
| `js/models/Usuario.js` | Usuário com encapsulamento via campos privados `#`, serialização `toJSON`/`fromJSON` |
| `js/models/PontoColeta.js` | Ponto de coleta com coordenadas e lista de materiais aceitos |
| `js/models/Descarte.js` | Registro de descarte com ciclo de vida `pendente → confirmado` |
| `js/models/Medalha.js` | Conquista verificada por função de critério |
| `js/models/SistemaReciclagem.js` | Orquestrador central: cadastro, login, fila de descartes, ranking, recompensas, persistência |

### Serviços e dados
| Arquivo | Responsabilidade |
|---------|-----------------|
| `js/services/Storage.js` | Wrapper de `localStorage` com `try/catch` e serialização JSON |
| `js/data/seed.js` | Dados iniciais: 4 pontos de coleta, 4 recompensas, 4 medalhas, 3 usuários demo |

### Controladores de página
| Arquivo | Página correspondente |
|---------|----------------------|
| `js/pages/login.js` | `login.html` + bootstrap compartilhado por todas as páginas |
| `js/pages/dashboard.js` | `dashboard.html` |
| `js/pages/mapa.js` | `mapa.html` |
| `js/pages/historico.js` | `historico.html` |
| `js/pages/ranking.js` | `ranking.html` |
| `js/pages/recompensas.js` | `recompensas.html` |

### Testes
| Arquivo | O que testa |
|---------|-------------|
| `tests/run.js` | Runner mínimo para Node: `teste`, `assert`, `assertEqual`, `assertThrows` |
| `tests/Lista.test.js` | Adicionar, buscar, ordenar, remover |
| `tests/Fila.test.js` | Comportamento FIFO, getter `frente`, fila vazia |
| `tests/Pilha.test.js` | Comportamento LIFO, getter `topo`, `recentes()` |
| `tests/Material.test.js` | Classe abstrata não instanciável, cálculo de pontos, polimorfismo de impacto, `criarMaterial` |
| `tests/Usuario.test.js` | Encapsulamento da senha, níveis, `gastarPontos`, `registrarAcao`, impacto e kg |
| `tests/PontoColeta.test.js` | Método `aceita(chave)` |
| `tests/Descarte.test.js` | Fluxo `pendente → confirmar → confirmado`, cálculo de pontos e impacto |
| `tests/Medalha.test.js` | Verificação de critério sobre o usuário |
| `tests/Recompensa.test.js` | Classe abstrata, polimorfismo de `descricao`, resgate com desconto de pontos |
| `tests/SistemaReciclagem.test.js` | Cadastro, login, fila, processamento, ranking, medalhas, resgate de recompensa |
| `tests/Storage.test.js` | Salvar/carregar JSON, persistência do sistema completo com mock de `localStorage` |

Para rodar os testes de lógica via Node:
```bash
node tests/run.js
```

Para rodar os testes no navegador: abrir `tests.html` com clique duplo.

---

## 6. Classes orientadas a objetos

Esta seção explica como cada um dos quatro pilares de POO foi aplicado no EcoRecicla, com referência direta aos arquivos implementados.

### 6.1 Encapsulamento — `js/models/Usuario.js`

A classe `Usuario` protege todo o seu estado interno com **campos privados** (sintaxe `#` do ES2022), tornando-o inacessível fora da classe:

```js
class Usuario {
  #nome; #email; #senha; #pontos; #nivel;
  #medalhas; #metaMensalKg; #historico; #impacto; #kgReciclados;
  ...
}
```

O acesso é concedido apenas via **getters somente-leitura** (`get nome()`, `get pontos()`, etc.) e **métodos de negócio** com validação (`adicionarPontos`, `gastarPontos`, `verificarSenha`). Isso garante que:

- A senha nunca é exposta (`u.senha` retorna `undefined`); comparação só via `verificarSenha(texto)`.
- O saldo de pontos não pode ser alterado arbitrariamente; `gastarPontos` lança exceção se o saldo for insuficiente.
- O nível é recalculado automaticamente pelo método privado `#calcularNivel()` toda vez que os pontos mudam.

O encapsulamento não se restringe a `Usuario`: **todas** as classes do projeto protegem seu estado interno. `PontoColeta` e `Descarte` (`js/models/PontoColeta.js`, `js/models/Descarte.js`) usam campos privados `#` com getters somente-leitura — em `Descarte`, o atributo `status` só transita de `"pendente"` para `"confirmado"` através do método `confirmar()`, nunca por atribuição direta. As estruturas de dados (`Lista`, `Fila`, `Pilha`) encapsulam o array interno `#itens`, e `SistemaReciclagem` protege o contador `#contadorDescarte`.

### 6.2 Herança — `js/models/Material.js` e `js/models/Recompensa.js`

**Hierarquia de Material:** a classe base `Material` define a estrutura comum (atributos `nome` e `fatorPontos`, método `calcularPontos`) e bloqueia sua instanciação direta com `if (new.target === Material) throw new Error(...)`. As cinco subclasses (`Plastico`, `Papel`, `Vidro`, `Metal`, `Eletronico`) herdam de `Material` via `extends` e reutilizam `calcularPontos` sem alteração, sobrescrevendo apenas `calcularImpacto` com seus fatores ambientais próprios.

**Hierarquia de Recompensa:** analogamente, `Recompensa` é a classe base abstrata (bloqueia instanciação direta). `RecompensaDesconto` e `RecompensaBrinde` estendem-na, herdando `podeResgatar` e `resgatar`, e implementando `descricao()` e `aplicarBeneficio()` de forma independente.

A herança evita duplicação: a lógica de validar saldo e descontar pontos está em um único lugar (`Recompensa.resgatar`), aproveitada por todos os subtipos.

### 6.3 Polimorfismo — `js/models/Material.js`, `js/models/Recompensa.js`, `js/models/Descarte.js`

O polimorfismo permite que o sistema trate objetos de tipos diferentes de forma uniforme, sem precisar conhecer o subtipo concreto:

**`calcularImpacto` em Material:** quando `Descarte.confirmar()` executa `this.material.calcularImpacto(this.pesoKg)`, o resultado varia conforme o tipo real do material — 1 kg de Metal gera 4 kg de CO₂ evitado, enquanto 1 kg de Plástico gera 1,5 kg. O `Descarte` não precisa de `if/switch` para cada tipo; a subclasse resolve.

**`descricao()` em Recompensa:** quando `recompensas.js` chama `r.descricao()` para exibir o card, o resultado é diferente para cada subtipo — `RecompensaDesconto` retorna "10% de desconto em Café Verde", `RecompensaBrinde` retorna "Brinde: ecobag em EcoStore". O código de exibição é idêntico para ambos.

### 6.4 Abstração — `js/models/SistemaReciclagem.js`

`SistemaReciclagem` é a fachada de alto nível da aplicação. Ela **esconde a complexidade interna** e expõe apenas operações de negócio coesas:

- `cadastrarUsuario` cuida de verificar duplicidade e adicionar à `Lista`.
- `registrarDescarte` encapsula a criação do `Descarte` e o enfileiramento na `Fila`.
- `processarProximo` orquestra: desenfileirar, confirmar, creditar pontos/impacto/kg, verificar medalhas — tudo em uma chamada.
- `gerarRanking` retorna a `Lista` ordenada sem expor o mecanismo interno de ordenação.

As páginas (`login.js`, `historico.js`, etc.) interagem exclusivamente com esses métodos de alto nível, sem manipular diretamente `Lista`, `Fila` ou o estado interno dos objetos.

---

## 7. Estruturas de dados

O projeto implementa as três estruturas de dados solicitadas pelo enunciado, cada uma em arquivo próprio com comentário explicando onde e por que é usada.

### 7.1 Lista — `js/estruturas/Lista.js`

**Onde é usada:**
- `SistemaReciclagem.usuarios`: armazena todos os usuários cadastrados (`this.usuarios = new Lista()`).
- `SistemaReciclagem.gerarRanking()`: chama `this.usuarios.ordenarPor("pontos", true)` para produzir o leaderboard em ordem decrescente de pontos.

**Por que essa estrutura:**
A `Lista` é uma coleção dinâmica que suporta as operações necessárias: `adicionar` (cadastro de novo usuário), `buscar(predicado)` (localizar por e-mail no login), `filtrar(predicado)` (consultas parciais) e `ordenarPor(chave, desc)` (ranking). Internamente usa um array JavaScript com campo privado `#itens`, garantindo encapsulamento da estrutura.

**Métodos implementados:** `adicionar(item)`, `remover(item)`, `buscar(predicado)`, `filtrar(predicado)`, `ordenarPor(chave, desc)`, `toArray()`, getter `tamanho`.

### 7.2 Fila (FIFO) — `js/estruturas/Fila.js`

**Onde é usada:**
- `SistemaReciclagem.filaDescartes`: cada descarte registrado pelo usuário é **enfileirado** (`filaDescartes.enfileirar(d)`); ao processar, o primeiro a entrar é o primeiro a sair (`filaDescartes.desenfileirar()`).
- `historico.js`: exibe os descartes pendentes em ordem de chegada (`sistema.filaDescartes.toArray().filter(...)`).
- Botões "Processar próximo" e "Processar todos" em `historico.html` consomem a fila.

**Por que essa estrutura:**
A semântica FIFO é a correta para validação de descartes: o sistema deve confirmar na ordem em que os descartes foram registrados, garantindo justiça e rastreabilidade. `shift()` remove o primeiro elemento em O(n), adequado para o volume de uma aplicação local.

**Métodos implementados:** `enfileirar(item)`, `desenfileirar()`, `toArray()`, getters `frente`, `vazia`, `tamanho`.

### 7.3 Pilha (LIFO) — `js/estruturas/Pilha.js`

**Onde é usada:**
- `Usuario.#historico`: toda ação do usuário (registro de descarte, confirmação, resgate de recompensa) é **empilhada** via `registrarAcao(descricao)`. O método `historico.recentes()` retorna as ações do topo para a base, exibindo as mais recentes primeiro.
- `historico.html`: renderiza o histórico com `usuarioHist.historico.recentes()`.
- Serialização: `Usuario.toJSON()` usa `historico.toArray()` (base → topo) e `fromJSON` reempilha na ordem original.

**Por que essa estrutura:**
O padrão de uso é tipicamente "mostrar o que aconteceu por último". A Pilha torna essa operação natural: `topo` retorna a ação mais recente em O(1), e `recentes()` produz a lista em ordem inversa sem modificar a estrutura.

**Métodos implementados:** `empilhar(item)`, `desempilhar()`, `toArray()`, `recentes()`, getters `topo`, `vazia`, `tamanho`.

---

## 8. Roteiro para o vídeo de apresentação

Este roteiro orienta a gravação do vídeo de demonstração, integrando a navegação pelas páginas com a explicação dos conceitos de POO e estruturas de dados.

---

### Parte 1 — Introdução (1–2 min)

**Tela:** `index.html`

- Apresentar o projeto: "EcoRecicla é uma aplicação web gamificada de incentivo à reciclagem, 100% front-end, sem servidor."
- Mostrar a seção "Como funciona" (três cards: Descarte certo → Ganhe pontos → Seja recompensado).
- Mostrar o card ODS 12 e mencionar o alinhamento com a meta 12.5.
- Clicar em "Comece agora".

---

### Parte 2 — Cadastro e Login (2–3 min)

**Tela:** `login.html`

- Clicar em "Cadastrar". Preencher nome, e-mail e senha.
  - **Explicar:** "A senha nunca é armazenada em texto puro. A classe `Usuario` usa campos privados `#senha` — encapsulamento de POO — e um método de ofuscação determinístico. `u.senha` retorna `undefined`."
- Criar a conta → sistema redireciona para o dashboard.
- (Opcional) Mostrar que e-mail duplicado gera erro de validação.
- Alternativamente, fazer login com `mariana@demo.com` / `demo` (usuário demo com 1450 pontos e medalhas).

---

### Parte 3 — Dashboard (1–2 min)

**Tela:** `dashboard.html`

- Mostrar pontos, nível (ex.: "Eco-Guerreiro"), kg reciclados.
- Mostrar a barra de progresso da meta mensal (padrão 20 kg).
- Mostrar o painel de impacto ambiental: CO₂ evitado, litros de água, árvores equivalentes.
  - **Explicar:** "Cada material tem fatores de impacto diferentes. Isso é **polimorfismo**: `Descarte.confirmar()` chama `material.calcularImpacto(peso)` sem saber se é Plástico, Metal ou Eletrônico — cada subclasse responde de forma diferente."
- Mostrar as medalhas (desbloqueadas em cor, bloqueadas em cinza).

---

### Parte 4 — Mapa e Registro de Descarte (2–3 min)

**Tela:** `mapa.html`

- Mostrar o mapa com os 4 marcadores em São Paulo (requer internet).
- Clicar em um marcador → popup com nome, endereço e materiais aceitos.
- Clicar em "Registrar descarte" na lista lateral.
  - **Explicar:** "O seletor de material só mostra os tipos aceitos pelo ponto — o método `PontoColeta.aceita(chave)` filtra a lista."
- Preencher material (ex.: Plástico) e peso (ex.: 2 kg). Confirmar.
  - **Explicar:** "O descarte é criado com `status = 'pendente'` e imediatamente **enfileirado** na `Fila` de descartes — estrutura FIFO. Os pontos ainda não foram creditados; o processamento vem a seguir."
- Registrar um segundo descarte com material diferente (ex.: Metal, 1 kg).

---

### Parte 5 — Histórico e Processamento da Fila (2–3 min)

**Tela:** `historico.html`

- Mostrar a seção "Fila de descartes pendentes" com os 2 descartes registrados.
  - **Explicar:** "Esta é a **Fila** (FIFO). Os descartes entram pela cauda e saem pela frente — o primeiro registrado será o primeiro processado."
- Clicar em "Processar próximo da fila".
  - **Explicar:** "`SistemaReciclagem.processarProximo()` chama `filaDescartes.desenfileirar()`, confirma o descarte, credita pontos ao usuário e registra a ação na **Pilha** de histórico."
- Clicar em "Processar todos".
- Mostrar a seção "Histórico de ações" com as ações mais recentes no topo.
  - **Explicar:** "O histórico usa uma **Pilha** (LIFO). O método `historico.recentes()` retorna do topo para a base — a última ação aparece primeiro, exatamente como esperado."

---

### Parte 6 — Dashboard atualizado (30 s)

**Tela:** `dashboard.html` (recarregar)

- Mostrar pontos atualizados, impacto ambiental acrescido, progresso da meta.
- Se atingiu critério de medalha, mostrar medalha desbloqueada.

---

### Parte 7 — Ranking (1 min)

**Tela:** `ranking.html`

- Mostrar o leaderboard com os usuários demo e o usuário recém-criado.
- Destacar que o usuário logado tem contorno verde.
  - **Explicar:** "`SistemaReciclagem.gerarRanking()` chama `usuarios.ordenarPor('pontos', true)` — método da **Lista** que retorna uma cópia ordenada em ordem decrescente sem modificar a estrutura original."

---

### Parte 8 — Recompensas (1–2 min)

**Tela:** `recompensas.html`

- Mostrar o catálogo: dois descontos e dois brindes.
  - **Explicar:** "Os cards usam `r.descricao()` — **polimorfismo**: `RecompensaDesconto.descricao()` retorna '10% de desconto em Café Verde'; `RecompensaBrinde.descricao()` retorna 'Brinde: ecobag em EcoStore'. O código de renderização é idêntico para ambos."
- Resgatar uma recompensa com saldo suficiente (logado como Mariana, que tem 1450 pts).
- Mostrar a mensagem de confirmação (cupom/voucher).
- Mostrar que o saldo de pontos foi descontado.

---

### Parte 9 — Testes automáticos (1–2 min)

**Tela:** `tests.html`

- Abrir com clique duplo.
- Mostrar a lista de testes com todos em verde (✅):
  - "Fila é FIFO"
  - "Pilha é LIFO"
  - "Lista ordena por pontos"
  - "Polimorfismo de Material"
  - "Usuario protege senha"
  - "Fluxo: registrar → processar credita pontos"
- Mencionar que a suíte completa de lógica é executada no Node: `node tests/run.js` com 11 arquivos de teste cobrindo todas as classes.

---

### Parte 10 — Encerramento (30 s)

- Recapitular os conceitos demonstrados: Encapsulamento (`#` em Usuario), Herança (Material/Recompensa), Polimorfismo (`calcularImpacto`/`descricao`), Abstração (SistemaReciclagem).
- Recapitular as estruturas: Lista (usuários/ranking), Fila (descartes pendentes), Pilha (histórico).
- Mencionar a persistência em `localStorage` — recarregar qualquer página logada mantém o estado.

---

## 9. Atendimento à ODS 12

A **ODS 12 — Consumo e Produção Responsáveis** da ONU estabelece metas para garantir padrões de consumo e produção sustentáveis até 2030. O EcoRecicla atua diretamente em três frentes desta agenda:

### 9.1 Meta 12.5 — Redução da geração de resíduos

A meta 12.5 propõe "reduzir substancialmente a geração de resíduos por meio da prevenção, redução, reciclagem e reuso". O EcoRecicla combate a geração de resíduos no aterro ao **facilitar e incentivar o descarte correto**:

- O mapa interativo exibe os quatro pontos de coleta de São Paulo com os materiais aceitos em cada um, eliminando a desculpa "não sei onde descartar".
- O sistema de pontuação transforma cada descarte em benefício tangível (pontos → recompensas), criando motivação extrínseca para o comportamento correto.
- O processamento em fila (FIFO) garante que cada descarte registrado seja confirmado e contabilizado de forma ordenada e auditável.

### 9.2 Educação para o consumo responsável

O EcoRecicla educa implicitamente ao:

- Exibir, para cada descarte, qual impacto ambiental aquele material gera — o usuário aprende que reciclar 1 kg de metal evita 4 kg de CO₂, enquanto 1 kg de eletrônico evita 5 kg de CO₂ (os maiores fatores).
- Diferenciar materiais por valor de pontos (Eletrônico = 20 pts/kg, Metal = 12, Plástico = 10, Papel = 8, Vidro = 6), ensinando implicitamente a hierarquia de impacto ambiental de cada material.
- Mostrar na landing page o card "Nosso compromisso com a ODS 12", contextualizando o projeto dentro da agenda global de sustentabilidade.

### 9.3 Medição do impacto ambiental

O EcoRecicla vai além do incentivo à ação e torna o impacto **visível e mensurável**. O dashboard do usuário exibe, em tempo real, o total acumulado de:

| Indicador | Cálculo (por material, por kg) |
|-----------|-------------------------------|
| CO₂ evitado (kg) | Plástico ×1,5 / Papel ×1,1 / Vidro ×0,3 / Metal ×4 / Eletrônico ×5 |
| Água poupada (litros) | Plástico ×100 / Papel ×50 / Vidro ×20 / Metal ×150 / Eletrônico ×200 |
| Árvores equivalentes | Plástico ×0,02 / Papel ×0,017 (Vidro, Metal e Eletrônico = 0) |

Essa visibilidade transforma a reciclagem de um ato abstrato em uma contribuição quantificada, criando consciência ambiental genuína — alinhada ao espírito da ODS 12 de promover informação sobre estilos de vida sustentáveis.

### 9.4 Impacto social e de engajamento

O sistema de gamificação (níveis, medalhas, ranking, metas mensais) cria um mecanismo de reforço positivo de longo prazo. Parceiros locais (Café Verde, Mercado Bio, EcoStore) são integrados como recompensas, criando um ecossistema econômico circular que beneficia estabelecimentos alinhados com a sustentabilidade e incentiva o consumo consciente.

---

## 10. Sugestões de melhorias futuras

### 10.1 Backend e autenticação segura

A versão atual persiste dados em `localStorage` com senha ofuscada por hash simples (sem sal). Uma versão produtiva exigiria:

- API REST com banco de dados (ex.: Node.js + PostgreSQL) para persistência multiusuário real.
- Autenticação via JWT ou OAuth 2.0 com hash bcrypt para senhas.
- Sincronização de dados entre dispositivos do mesmo usuário.

### 10.2 Geolocalização do usuário

Integrar a API de Geolocalização do navegador (`navigator.geolocation`) para:

- Centralizar o mapa automaticamente na posição do usuário.
- Ordenar os pontos de coleta por distância.
- Calcular e exibir a rota até o ponto mais próximo (via Leaflet Routing Machine).

### 10.3 Integração com APIs municipais de coleta

Conectar-se às APIs abertas de prefeituras (ex.: dados.gov.br) para:

- Manter a base de pontos de coleta sempre atualizada automaticamente.
- Incluir informações de horário de funcionamento e capacidade.
- Cobrir todo o território nacional, não apenas pontos de São Paulo.

### 10.4 Aplicativo mobile / PWA

Transformar o EcoRecicla em uma Progressive Web App (PWA) com:

- `manifest.json` e Service Worker para funcionamento offline.
- Notificações push para lembrar o usuário de bater a meta mensal.
- Ícone instalável na tela inicial do celular.

### 10.5 Validação de descarte por QR Code

Adicionar confiabilidade ao sistema com:

- Geração de QR Code único por descarte no momento do registro.
- Scanner no ponto de coleta (via câmera do celular) para confirmar a entrega física.
- Transição do `status` de "pendente" para "confirmado" somente após leitura do QR, eliminando descartes fictícios.

### 10.6 Notificações e metas personalizadas

Ampliar o sistema de gamificação com:

- Notificações de progresso de meta (ex.: "Você está a 5 kg de completar o mês!").
- Metas semanais além das mensais.
- Desafios comunitários (ex.: bairro vs. bairro, escola vs. escola).
- Meta personalizada definida pelo próprio usuário (em vez do padrão fixo de 20 kg/mês).

### 10.7 Relatórios e histórico detalhado

- Exportar o histórico de descartes em PDF ou CSV.
- Gráficos de evolução de pontos e impacto ao longo do tempo.
- Resumo mensal enviado por e-mail com o impacto acumulado.

### 10.8 Acessibilidade e internacionalização

- Garantir contraste mínimo WCAG AA em todos os elementos visuais.
- Suporte a leitores de tela (atributos `aria-*`).
- Internacionalização (i18n) para uso em outros países da América Latina.

---

*Documento gerado em 2026-06-10 | EcoRecicla — Projeto Acadêmico ADS*
