# ♻️ EcoRecicla

Aplicação web para incentivo à reciclagem e ao descarte correto de resíduos, alinhada à **ODS 12** (Consumo e Produção Responsáveis) da ONU. Transforma a reciclagem em uma experiência gamificada: o usuário registra descartes em pontos de coleta, ganha pontos e medalhas, sobe de nível, compete no ranking e troca pontos por recompensas de parceiros.

> Projeto acadêmico — 100% front-end (HTML, CSS e JavaScript puro), com Programação Orientada a Objetos e estruturas de dados implementadas do zero.

## 🚀 Como executar

**Não precisa instalar nada nem rodar servidor.** Basta **abrir o arquivo `index.html` com clique duplo** no navegador.

> O mapa de pontos de coleta (`mapa.html`) usa a biblioteca Leaflet via CDN, então **essa página específica precisa de conexão com a internet**. O restante funciona offline.

### Usuários de demonstração

Já existem 5 usuários cadastrados (senha de todos: `demo`):

| Usuário | E-mail | Pontos | Nível |
|---------|--------|--------|-------|
| Mariana Silva | `mariana@demo.com` | 2.380 | Guardião do Planeta |
| João Pereira | `joao@demo.com` | 1.450 | Eco-Guerreiro |
| Carla Souza | `carla@demo.com` | 980 | Eco-Guerreiro |
| Pedro Almeida | `pedro@demo.com` | 540 | Reciclador |
| Beatriz Lima | `beatriz@demo.com` | 180 | Iniciante |

Você também pode criar uma conta nova na tela de cadastro.

### ⚠️ Reiniciar os dados

Os dados ficam salvos no `localStorage` do navegador. Se quiser zerar tudo (e recarregar os usuários de demonstração), abra o console do navegador (tecla **F12**) e rode:

```js
localStorage.clear()
```

Depois recarregue a página.

## 📄 Páginas

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Página inicial — apresenta o projeto e a ODS 12 |
| `login.html` | Cadastro e login de usuários |
| `dashboard.html` | Pontos, nível, meta mensal, impacto ambiental e medalhas |
| `mapa.html` | Mapa interativo (Leaflet) com os pontos de coleta + registro de descarte |
| `historico.html` | Fila de descartes pendentes e histórico de ações |
| `ranking.html` | Ranking dos usuários mais engajados |
| `recompensas.html` | Loja de recompensas de estabelecimentos parceiros |
| `tests.html` | Testes automáticos das classes e estruturas (executados no navegador) |

## 🗂️ Estrutura do projeto

```
aep/
├── index.html  login.html  dashboard.html  mapa.html
├── historico.html  ranking.html  recompensas.html  tests.html
├── css/style.css                 → tema visual (vibrante / gamificado)
├── js/
│   ├── estruturas/  Lista.js  Fila.js  Pilha.js
│   ├── models/      Material.js  Recompensa.js  Usuario.js  PontoColeta.js
│   │                Descarte.js  Medalha.js  SistemaReciclagem.js
│   ├── services/    Storage.js   → persistência em localStorage
│   ├── data/        seed.js      → dados iniciais (pontos, recompensas, medalhas, demo)
│   └── pages/       um controlador por página
├── tests/           run.js + um arquivo *.test.js por classe de lógica
└── docs/            documentacao.md (entregáveis acadêmicos) + spec e plano
```

## 🧪 Testes

Há duas formas de rodar os testes:

- **No navegador:** abra `tests.html` (clique duplo) — mostra ✅/❌ por teste.
- **Via Node.js** (linha de comando):

```bash
node tests/run.js
```

A suíte cobre as estruturas de dados (Lista/Fila/Pilha), o polimorfismo dos materiais, o encapsulamento do usuário, a persistência e os fluxos do sistema.

## 🧱 Conceitos demonstrados

- **POO:** Encapsulamento (campos privados `#`), Herança (`Material`, `Recompensa`), Polimorfismo (`calcularImpacto`, `descricao`) e Abstração (`SistemaReciclagem` como fachada).
- **Estruturas de dados:** **Lista** (usuários cadastrados / ranking), **Fila** (descartes pendentes de validação) e **Pilha** (histórico de ações).
- **Gamificação:** pontos, níveis, medalhas, ranking, metas mensais e indicador de impacto ambiental (CO₂, água, árvores).

## 📚 Documentação completa

Veja `docs/documentacao.md` para a descrição detalhada, casos de uso, diagrama de classes, explicação dos conceitos de POO e das estruturas de dados, roteiro de apresentação em vídeo, alinhamento com a ODS 12 e sugestões de melhorias futuras.
