# CLAUDE_HANDOFF — chem-toolkit

> Resumo técnico pronto para copiar e colar na conversa com o Claude (consultor externo de arquitetura, lógica e revisão).
> O Claude não tem acesso aos arquivos locais; este documento deve ser autocontido.
> Regras e planejamento completos: `AGENTS.md`. Estado detalhado: `PROJECT_STATE.md`.

## Situação atual

- **Etapa:** Fase 5 — Polimento e publicação concluída; v1.0.0 publicada no GitHub Pages e no GitHub em 2026-10-24.
- **Repositório:** https://github.com/wenderson-hgs/projeto (público desde 2026-10-24)
- **`main`:** Fases 1 a 5 publicadas; release `v1.0.0` no commit `d44845e`.
- **Versão:** 1.0.0 publicada; tag anotada e release disponíveis em https://github.com/wenderson-hgs/projeto/releases/tag/v1.0.0.
- **Demo:** https://wenderson-hgs.github.io/projeto/ (verificada em 2026-10-24)
- **Projeto:** chem-toolkit, site estático (Vite + TypeScript, sem framework) com tabela periódica interativa, calculadora de massa molar, balanceador de equações, quiz e tema claro/escuro.
- **Próximo passo:** nenhum pendente para a v1.0; os opcionais estão na seção 9 do `AGENTS.md` e dependem de pedido do usuário.

## 1. Objetivo da etapa e o que foi implementado

A Fase 5 prepara a versão 1.0. Foram adicionados tema claro/escuro com preferência salva no `localStorage` e fallback para `prefers-color-scheme`; script inline no `<head>` para aplicar o tema antes da primeira pintura; variáveis CSS semânticas em todos os componentes; link "Pular para o conteúdo", foco visível global e suporte a `prefers-reduced-motion`. O README foi reescrito com descrição, capturas reais, instruções, estrutura, fonte dos dados, licenças e limitações. A publicação usa `base: '/projeto/'` e um workflow do GitHub Actions que roda lint, testes e build antes de publicar `dist`. A versão foi atualizada para `1.0.0` e há um `CHANGELOG.md`. Foram adicionados 13 testes de tema, totalizando 115 no projeto. Nenhuma dependência nova foi instalada.

## 2. Arquivos principais

```text
projeto 1/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml               (lint + testes + build + GitHub Pages)
├─ AGENTS.md
├─ CHANGELOG.md
├─ PROJECT_STATE.md
├─ README.md
├─ LICENSE                         (MIT — código)
├─ index.html                      (script inline do tema)
├─ package.json                    (versão 1.0.0)
├─ package-lock.json
├─ tsconfig.json
├─ vite.config.ts                  (base '/projeto/')
├─ vitest.config.ts
├─ eslint.config.js
├─ .prettierrc.json
├─ .prettierignore
├─ .gitignore
├─ docs/
│  ├─ CLAUDE_HANDOFF.md
│  └─ screenshots/                 (capturas reais usadas no README)
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ main.ts                     (composição da aplicação, cabeçalho e skip link)
│  ├─ data/
│  │  ├─ elements.json            (118 elementos — CC BY-SA 3.0)
│  │  └─ README.md                (fonte, licença e alterações)
│  ├─ lib/
│  │  ├─ elements.ts              (tipos, dataset e helpers)
│  │  ├─ molar-mass.ts            (parser + massa molar)
│  │  ├─ balancer.ts              (parser de equações + balanceador exato)
│  │  ├─ quiz.ts                  (geração de perguntas)
│  │  ├─ quiz-storage.ts          (pontuação no localStorage)
│  │  └─ theme.ts                 (preferência e alternância do tema)
│  ├─ ui/
│  │  ├─ periodic-table.ts        (grade + legenda)
│  │  ├─ details-panel.ts         (painel de detalhes)
│  │  ├─ search-filter.ts         (busca + select de categoria)
│  │  ├─ keyboard-navigation.ts   (setas entre células)
│  │  ├─ molar-mass.ts            (seção da calculadora)
│  │  ├─ balancer.ts              (seção do balanceador)
│  │  ├─ quiz.ts                  (seção do quiz)
│  │  └─ theme-toggle.ts          (botão de tema e aplicação no <html>)
│  └─ styles/
│     ├─ base.css                 (variáveis dos temas claro/escuro, layout e skip link)
│     ├─ table.css                (CSS Grid, cores, seleção, filtro)
│     ├─ controls.css             (barra de busca/filtro)
│     ├─ details.css              (painel e bottom sheet)
│     ├─ calculator.css           (calculadora e tabela de composição)
│     ├─ balancer.css             (balanceador e equação balanceada)
│     └─ quiz.css                 (quiz e alternativas)
└─ tests/
   ├─ elements.test.ts            (24 testes)
   ├─ molar-mass.test.ts          (32 testes)
   ├─ balancer.test.ts            (31 testes)
   ├─ quiz.test.ts                (15 testes)
   └─ theme.test.ts               (13 testes)
```

## 3. Implementações e assinaturas

### Dados e busca por símbolo (`src/lib/elements.ts`)

```ts
function getElementBySymbol(symbol: string): Element | undefined;
```

- `elementsBySymbol` é um `Map<string, Element>` criado uma vez a partir do dataset.
- A busca é case-sensitive: `Fe` funciona, `fe` não. Isso é intencional, pois símbolos químicos diferenciam maiúsculas e minúsculas (`Co` ≠ `CO`).
- `CATEGORY_ORDER` e `CATEGORY_LABELS` definem as 9 categorias usadas na tabela, no filtro e no quiz.

### Parser e cálculo de massa molar (`src/lib/molar-mass.ts`)

```ts
type FormulaErrorCode =
  | 'empty-formula'
  | 'unknown-symbol'
  | 'unbalanced-brackets'
  | 'unexpected-token'
  | 'invalid-count'
  | 'invalid-character'
  | 'empty-hydrate'
  | 'leading-coefficient'
  | 'empty-group';

class FormulaError extends Error {
  readonly code: FormulaErrorCode;
}

interface ParsedFormula {
  counts: Record<string, number>;
  hasHydrate: boolean;
}

interface MolarMassResult {
  formula: string;
  molarMass: number;
  composition: CompositionEntry[];
  isApproximate: boolean;
}

function parseFormula(input: string): ParsedFormula;
function calculateMolarMass(input: string): MolarMassResult;
```

O parser remove espaços, separa hidratos de nível superior (`·`, `.`, `*`), aceita grupos `()`/`[]` aninhados e valida símbolos contra o dataset. Coeficiente no início da fórmula (`2H2O`) é rejeitado na calculadora; nos hidratos, `5H2O` multiplica a molécula inteira. A massa molar é a soma de `atomicMass × count`, com percentual por elemento e aviso quando há massa aproximada.

### Balanceador (`src/lib/balancer.ts`)

```ts
type BalanceErrorCode =
  | 'empty-equation'
  | 'missing-arrow'
  | 'multiple-arrows'
  | 'empty-side'
  | 'empty-term'
  | 'invalid-coefficient'
  | 'invalid-formula'
  | 'no-solution'
  | 'multiple-solutions'
  | 'zero-coefficient'
  | 'no-positive-solution'
  | 'coefficient-too-large';

class BalanceError extends Error {
  readonly code: BalanceErrorCode;
}

interface BalancedTerm {
  coefficient: number;
  formula: string;
}

interface BalancedEquation {
  reactants: BalancedTerm[];
  products: BalancedTerm[];
}

function balanceEquation(input: string): BalancedEquation;
function formatBalancedEquation(equation: BalancedEquation, arrow = '→'): string;
```

O balanceador aceita `->`, `=` ou `→`, divide os lados por `+`, valida cada fórmula com `parseFormula()` e monta uma matriz com reagentes positivos e produtos negativos. A RREF usa uma classe `Fraction` interna com `bigint`, sem ponto flutuante. O espaço nulo é escalado pelo MMC dos denominadores e pelo MDC dos numeradores. Sem solução, múltiplas soluções, coeficiente zero ou solução sem todos os coeficientes positivos geram `BalanceError` com mensagem clara. Coeficientes digitados na entrada são validados, mas ignorados.

### Quiz (`src/lib/quiz.ts` e `src/lib/quiz-storage.ts`)

```ts
type QuizMode = 'symbol-to-name' | 'name-to-symbol' | 'element-category';

const QUIZ_MODES: QuizMode[];
const QUIZ_MODE_LABELS: Record<QuizMode, string>;
const QUESTIONS_PER_ROUND = 10;
const OPTIONS_PER_QUESTION = 4;

interface QuizQuestion {
  atomicNumber: number;
  question: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

function createQuizRound(
  mode: QuizMode,
  count = QUESTIONS_PER_ROUND,
  random: () => number = Math.random,
): QuizQuestion[];

interface QuizScore {
  last: number;
  best: number;
}

type QuizScores = Record<QuizMode, QuizScore>;
type ScoreStorage = Pick<Storage, 'getItem' | 'setItem'>;

const QUIZ_STORAGE_KEY = 'chem-toolkit.quiz.scores';

function createEmptyScores(): QuizScores;
function readQuizScores(storage: ScoreStorage | undefined): QuizScores;
function saveQuizScore(storage: ScoreStorage | undefined, mode: QuizMode, score: number): QuizScore;
```

**Geração da rodada:**

1. Os elementos são embaralhados com Fisher-Yates; a função aleatória é injetável para testes determinísticos.
2. São escolhidos até 10 elementos, sem repetição.
3. Para cada elemento, a resposta correta depende do modo: `namePt`, `symbol` ou `CATEGORY_LABELS[category]`.
4. Os 3 distratores vêm do mesmo domínio: outros nomes, outros símbolos ou outras categorias (nunca a correta).
5. As 4 alternativas são embaralhadas e `correctIndex` aponta para a correta.
6. O prompt mostra o símbolo, o nome ou `Nome (Símbolo)`, conforme o modo.

**Armazenamento:**

- Lê um JSON em `chem-toolkit.quiz.scores` com `{ last, best }` por modo.
- Valores inválidos viram 0; campos válidos de outros modos são preservados.
- `saveQuizScore` atualiza `last` e mantém o maior `best`.
- `getItem`/`setItem` são protegidos por `try/catch`; sem armazenamento, a pontuação da sessão ainda é retornada.

### Interface do quiz (`src/ui/quiz.ts`)

```ts
function createQuiz(): HTMLElement;
```

- `fieldset` com três modos (radios) e linha de recorde do modo selecionado.
- Botão **Começar quiz** inicia uma rodada; os modos ficam desabilitados durante o jogo.
- Pergunta, prompt, 4 botões de alternativa e progresso (`Pergunta X de 10`, `Pontos: Y`).
- Feedback imediato em `role="status"`; a alternativa correta fica verde e a errada selecionada fica vermelha, sempre com texto.
- **Próxima pergunta** / **Ver resultado**; o foco vai para o botão após responder.
- Resultado com acertos, última pontuação e recorde; **Jogar novamente** inicia outra rodada no modo selecionado.
- O foco vai para o bloco da pergunta ao renderizar e para o texto do resultado ao terminar.

### Tema e acessibilidade (`src/lib/theme.ts`, `src/ui/theme-toggle.ts`)

```ts
type Theme = 'light' | 'dark';
type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;

const THEME_STORAGE_KEY = 'chem-toolkit.theme';
const THEME_COLORS: Record<Theme, string>;

function isTheme(value: unknown): value is Theme;
function readStoredTheme(storage: ThemeStorage | undefined): Theme | null;
function saveTheme(storage: ThemeStorage | undefined, theme: Theme): void;
function resolveInitialTheme(stored: Theme | null, prefersDark: boolean): Theme;
function toggleTheme(theme: Theme): Theme;

// src/ui/theme-toggle.ts
function createThemeToggle(): HTMLButtonElement;
```

- O tema é aplicado em `<html data-theme="light|dark">`; o CSS define as variáveis semânticas em `:root` e `:root[data-theme='dark']`.
- Um script inline no `<head>` lê `chem-toolkit.theme` e `prefers-color-scheme` antes da primeira pintura, evitando flash do tema errado.
- `createThemeToggle()` lê a preferência salva, aplica o tema, cria o botão com rótulo de ação ("Tema escuro"/"Tema claro") e `aria-label`, salva a escolha ao clicar e acompanha mudanças do sistema somente quando não há preferência salva.
- `readStoredTheme`/`saveTheme` usam `try/catch`; sem `localStorage`, o tema funciona na sessão, mas não persiste.
- `src/main.ts` adiciona o link "Pular para o conteúdo" (`#conteudo`), `main` com `tabindex="-1"`, o botão de tema no cabeçalho e o rodapé existente.
- `base.css` concentra as variáveis de superfície, texto, foco, estados de sucesso/erro/aviso, sombras e as 9 cores de categoria nos dois temas. Também inclui foco global, `input::placeholder`, skip link e `prefers-reduced-motion`.

## 4. Decisões de arquitetura e justificativas

| Decisão                                                            | Justificativa                                                                                                                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parser recursivo descendente em `src/lib/molar-mass.ts`            | Mantém a lógica de química separada da UI, testável sem navegador, e cobre grupos aninhados sem biblioteca externa.                               |
| Balanceador com frações exatas (`bigint`) e RREF                   | Evita erros de arredondamento e garante os menores coeficientes inteiros; a matriz é pequena.                                                     |
| Equações com coeficiente zero ou múltiplas soluções geram erro     | Evita resultados ambíguos ou compostos que não participam da reação.                                                                              |
| `FormulaError` e `BalanceError` com `code` e mensagem em português | Permite testar os códigos e exibir mensagens claras diretamente na interface.                                                                     |
| Quiz com 10 perguntas e 4 alternativas                             | Rodada curta, com feedback imediato e boa leitura no celular.                                                                                     |
| Distratores do mesmo domínio da pergunta                           | Evita alternativas elimináveis pelo formato (por exemplo, números entre nomes).                                                                   |
| Função aleatória injetável                                         | Testes determinísticos sem depender de `Math.random`.                                                                                             |
| Pontuação e recorde por modo no `localStorage`                     | Cada modo tem dificuldade própria; separar os recordes é mais justo. Acesso protegido para navegação privada.                                     |
| Foco na pergunta e no resultado                                    | Leitores de tela ouvem a pergunta completa e a pontuação final; feedback em `role="status"`.                                                      |
| Tema em `data-theme` + variáveis CSS                               | Um único conjunto de componentes atende aos dois temas; as cores de categoria e os estados também são variáveis.                                  |
| Script inline antes da primeira pintura                            | Evita flash de tema claro ao carregar no escuro; a chave é sincronizada com `src/lib/theme.ts`.                                                   |
| Preferência salva tem prioridade sobre o sistema                   | O usuário controla a escolha; `prefers-color-scheme` serve de padrão inicial e fallback.                                                          |
| `base: '/projeto/'` no `vite.config.ts`                            | O repositório se chama `projeto`; dev, preview e produção usam o mesmo caminho, evitando surpresas no Pages.                                      |
| Workflow com actions oficiais e Node 24                            | `checkout@v7`, `setup-node@v7`, `configure-pages@v6`, `upload-pages-artifact@v5` e `deploy-pages@v5` eram as versões estáveis em outubro de 2026. |
| Capturas reais em PNG no README                                    | Mostram a interface verdadeira nos dois temas; foram geradas com Edge headless e verificadas antes do commit.                                     |
| Calculadora, balanceador e quiz na mesma página                    | Mantém a navegação simples, sem abas ou rotas.                                                                                                    |
| Nenhuma dependência nova                                           | Requisito do `AGENTS.md`; toda a lógica foi implementada do zero.                                                                                 |

## 5. Resultado real de `npm test`, `npm run build` e `npm run lint`

Executados em 2026-10-23, na branch `feat/phase-5-polish-and-deploy`, após a configuração do GitHub Pages, e repetidos na `main` em 2026-10-24 (115 testes, build e lint sem erros):

```text
$ npm test
RUN  v5.0.5 C:/Users/wende/OneDrive/Desktop/wenderson/projetos/SaaS/meus projetos/projeto 1
Test Files  5 passed (5)
     Tests  115 passed (115)
  Duration  926ms

$ npm run build
tsc && vite build
vite v8.3.5 building client environment for production...
✓ 26 modules transformed.
dist/index.html                  1.35 kB │ gzip:  0.67 kB
dist/assets/index-t4n3gPG3.css  17.38 kB │ gzip:  4.00 kB
dist/assets/index-DM-G0T3H.js   58.56 kB │ gzip: 14.08 kB
✓ built in 306ms

$ npm run lint
eslint .
(sem erros)
```

Na Etapa 1 (tema), os mesmos 115 testes passaram em 1,12 s e o build de 26 módulos levou 741 ms. O `dist/index.html` foi conferido: favicon e assets apontam para `/projeto/`. O `npm run preview` serviu a aplicação em `http://localhost:4173/projeto/`, e uma captura com Edge headless confirmou o carregamento dos assets e o tema escuro.

No GitHub Actions (run `40096907344`, 2026-10-24), todos os passos passaram: checkout, setup do Node 24, `npm ci`, lint, testes, build, configuração do Pages, upload do artefato e deploy. A demo publicada foi verificada com requisições reais (HTML, JS, CSS e favicon retornando 200) e com captura do Edge headless. Nenhum resultado foi declarado sem execução real.

## 6. Problemas conhecidos, limitações e dúvidas para revisão

- **Sem testes de navegador automatizados:** a interface foi validada por `tsc`, build, lint, testes unitários e capturas com Edge headless, mas não há jsdom/Playwright. Ainda é necessário revisar manualmente o tema, o layout responsivo e o quiz no `npm run dev`.
- **Deploy executado em 2026-10-24:** o repositório foi tornado público (Pages em repositório privado exige plano pago), o Pages foi habilitado com publicação via workflow e o run `40096907344` publicou `dist`. A demo responde 200 para HTML, JS, CSS e favicon.
- **Link da demo:** `https://wenderson-hgs.github.io/projeto/` está no ar e no topo do README; o deploy é automático a cada push na `main`.
- **`base` fixo:** `base: '/projeto/'` atende ao nome atual do repositório; se o repositório for renomeado, o caminho precisa ser atualizado.
- **Tema persistido:** a preferência fica no `localStorage`; em navegação privada ou com armazenamento bloqueado, o tema funciona, mas não persiste. Mudanças do sistema só são seguidas enquanto não houver escolha salva.
- **Custo do script inline:** a lógica de tema aparece duplicada no `index.html` (antes da pintura) e em `src/lib/theme.ts`; a chave `chem-toolkit.theme` precisa ser mantida em sincronia.
- **Capturas:** são PNGs gerados em 1280 px, sem versão mobile e sem GIF. O README não tem teste automatizado que detecte imagens desatualizadas.
- **Acessibilidade:** contraste e foco foram revisados manualmente, mas não houve auditoria automatizada (axe/Lighthouse) nem teste com leitor de tela real.
- **Versão/tag:** `package.json` está em `1.0.0`; a tag anotada `v1.0.0` e a release no GitHub foram publicadas em 2026-10-24 com as notas do `CHANGELOG.md`.
- **Dúvidas para o Claude:**
  1. O botão de tema com rótulo de ação ("Tema escuro"/"Tema claro") e `aria-label` é suficientemente claro, ou vale usar `aria-pressed`/um switch?
  2. `base: '/projeto/'` fixo é aceitável para este projeto, ou vale ler uma variável de ambiente para permitir outros repositórios?
  3. Vale rodar Lighthouse/axe antes da release, mesmo sem adicionar dependências ao projeto (por exemplo, usando o Edge/Chrome instalado)?
  4. As capturas em PNG são suficientes para o README, ou vale a pena gerar um GIF curto da interação?
  5. A v1.0.0 foi publicada com tag anotada e release; há algo a revisar no fluxo de versionamento ou nas notas da release?
- **Dúvidas da Fase 4 ainda em aberto:** excluir elementos com categoria prevista do quiz ou apenas sinalizar a ressalva; e se o formato `{ last, best }` por modo deve ser versionado para evoluções futuras.

## 7. Como usar este documento

1. O OpenCode atualiza este arquivo ao final de cada etapa relevante, com dados reais.
2. O usuário copia o conteúdo e cola na conversa com o Claude.
3. O Claude retorna a revisão; o OpenCode compara com o código existente e com o `AGENTS.md`, explica benefícios e riscos e pede aprovação antes de implementar mudanças significativas.
