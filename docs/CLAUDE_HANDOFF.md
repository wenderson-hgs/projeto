# CLAUDE_HANDOFF — chem-toolkit

> Resumo técnico pronto para copiar e colar na conversa com o Claude (consultor externo de arquitetura, lógica e revisão).
> O Claude não tem acesso aos arquivos locais; este documento deve ser autocontido.
> Regras e planejamento completos: `AGENTS.md`. Estado detalhado: `PROJECT_STATE.md`.

## Situação atual

- **Etapa:** pós-v1.0. A1/A2 (confiança), B (tabela rica e quiz educativo) e C1 (estequiometria) estão implementados em branches empilhadas.
- **Repositório:** https://github.com/wenderson-hgs/projeto (público desde 2026-10-24)
- **`main`:** Fases 1 a 5 publicadas; release `v1.0.0` no commit `d44845e`.
- **Branches:** `feat/v1.1-confidence` (A1+A2, enviada), `feat/v1.2-rich-table` (B, enviada) e `feat/v1.3-stoichiometry` (C1, aguardando revisão e confirmação para push).
- **Versão de desenvolvimento:** `1.3.0` na branch do C1; as tags/releases `v1.1.0`, `v1.2.0` e `v1.3.0` ainda não foram criadas.
- **Demo:** https://wenderson-hgs.github.io/projeto/ (publicada com a v1.0.0)
- **Projeto:** site estático (Vite + TypeScript, sem framework) com tabela periódica interativa, calculadora de massa molar, balanceador de equações, estequiometria, quiz e tema claro/escuro.
- **Próximo passo:** revisar e abrir os PRs na ordem A1/A2 → B → C1; depois, se aprovado, seguir para pH e soluções.

## 1. Objetivo da etapa e o que foi implementado

O C1 adiciona uma ferramenta de estequiometria que balanceia a equação automaticamente e calcula reagente limitante, rendimento teórico em mol, gramas e partículas, excesso de reagentes e rendimento percentual opcional. A lógica pura fica em `src/lib/stoichiometry.ts` e reaproveita `balanceEquation()` e `calculateMolarMass()`; a interface em duas etapas fica em `src/ui/stoichiometry.ts`. Foram adicionados `formatScientific()` para partículas, 12 testes de estequiometria e testes de formatação científica, totalizando 166 testes. Nenhuma dependência nova foi instalada.

O A1 corrigiu a formatação numérica pt-BR, as mensagens do balanceador e a normalização de subscritos/estados físicos. O A2 adicionou roving tabindex, foco gerenciado no painel, metadados sociais/SEO e um workflow de CI. O B enriqueceu o painel de detalhes com propriedades físicas, corrigiu os nomes de Rf e Nh e adicionou a revisão dos erros do quiz.

## 2. Arquivos principais

```text
projeto 1/
├─ .github/
│  └─ workflows/
│     ├─ ci.yml                   (lint + testes + build em pull requests)
│     └─ deploy.yml               (lint + testes + build + GitHub Pages)
├─ AGENTS.md
├─ CHANGELOG.md
├─ PROJECT_STATE.md
├─ README.md
├─ LICENSE                         (MIT — código)
├─ index.html                      (metadados e script inline do tema)
├─ package.json                    (versão 1.3.0)
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
│  ├─ favicon.svg
│  └─ social-card.png
├─ src/
│  ├─ main.ts                     (composição da aplicação)
│  ├─ data/
│  │  ├─ elements.json            (118 elementos — CC BY-SA 3.0)
│  │  └─ README.md                (fonte, licença e alterações)
│  ├─ lib/
│  │  ├─ elements.ts              (tipos, dataset e helpers)
│  │  ├─ format.ts                (formatação decimal, percentual, número e científica)
│  │  ├─ molar-mass.ts            (parser + massa molar)
│  │  ├─ balancer.ts              (parser de equações + balanceador exato)
│  │  ├─ stoichiometry.ts         (reagente limitante, rendimento e excesso)
│  │  ├─ element-properties.ts    (rótulos e formatadores das propriedades físicas)
│  │  ├─ quiz.ts                  (geração de perguntas e revisão)
│  │  ├─ quiz-storage.ts          (pontuação no localStorage)
│  │  └─ theme.ts                 (preferência e alternância do tema)
│  ├─ ui/
│  │  ├─ periodic-table.ts        (grade + legenda)
│  │  ├─ details-panel.ts         (painel de detalhes)
│  │  ├─ search-filter.ts         (busca + select de categoria)
│  │  ├─ keyboard-navigation.ts   (setas entre células)
│  │  ├─ molar-mass.ts            (seção da calculadora)
│  │  ├─ balancer.ts              (seção do balanceador)
│  │  ├─ stoichiometry.ts         (seção de estequiometria)
│  │  ├─ quiz.ts                  (seção do quiz)
│  │  └─ theme-toggle.ts          (botão de tema e aplicação no <html>)
│  └─ styles/
│     ├─ base.css                 (variáveis dos temas, layout e skip link)
│     ├─ table.css                (CSS Grid, cores, seleção, filtro)
│     ├─ controls.css             (barra de busca/filtro)
│     ├─ details.css              (painel e bottom sheet)
│     ├─ calculator.css           (calculadora e tabela de composição)
│     ├─ balancer.css             (balanceador e equação balanceada)
│     ├─ stoichiometry.css        (formulário, resultados e tabela)
│     └─ quiz.css                 (quiz e alternativas)
└─ tests/
   ├─ elements.test.ts
   ├─ element-properties.test.ts
   ├─ format.test.ts
   ├─ molar-mass.test.ts
   ├─ balancer.test.ts
   ├─ stoichiometry.test.ts
   ├─ quiz.test.ts
   └─ theme.test.ts
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

O parser remove espaços, separa hidratos de nível superior (`·`, `.`, `*`), aceita grupos `()`/`[]` aninhados e valida símbolos contra o dataset. Coeficiente no início da fórmula (`2H2O`) é rejeitado na calculadora; nos hidratos, `5H2O` multiplica a molécula inteira. A massa molar é a soma de `atomicMass × count`, com percentual por elemento e aviso quando há massa aproximada. Subscritos Unicode (`H₂O`) e estados físicos (`H2O(s)`, `(l)`, `(g)`, `(aq)`) são normalizados; cargas iônicas continuam fora do escopo.

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

### Estequiometria (`src/lib/stoichiometry.ts`)

```ts
type AmountUnit = 'g' | 'mol';

type StoichiometryErrorCode =
  | 'no-amount'
  | 'invalid-amount'
  | 'duplicate-reactant'
  | 'unknown-reactant'
  | 'unknown-product'
  | 'invalid-yield';

class StoichiometryError extends Error {
  readonly code: StoichiometryErrorCode;
}

interface StoichiometrySpecies {
  formula: string;
  coefficient: number;
  molarMass: number;
  isApproximate: boolean;
}

interface StoichiometrySetup {
  equation: BalancedEquation;
  reactants: StoichiometrySpecies[];
  products: StoichiometrySpecies[];
}

interface ReactantAmount {
  formula: string;
  value: number;
  unit: AmountUnit;
}

interface RemainingReactant {
  formula: string;
  remainingMoles: number;
  remainingMass: number;
}

interface StoichiometryResult {
  product: StoichiometrySpecies;
  limitingFormula: string;
  theoreticalMoles: number;
  theoreticalMass: number;
  theoreticalParticles: number;
  excess: RemainingReactant[];
  percentYield: number | null;
  unspecifiedReactants: string[];
}

const AVOGADRO_CONSTANT = 6.02214076e23;

function prepareStoichiometry(equationInput: string): StoichiometrySetup;
function calculateStoichiometry(
  setup: StoichiometrySetup,
  amounts: ReactantAmount[],
  productFormula: string,
  actualYieldGrams: number | null = null,
): StoichiometryResult;
```

**Algoritmo:**

1. `prepareStoichiometry()` balanceia a equação e calcula a massa molar de cada reagente e produto, marcando `isApproximate`.
2. `calculateStoichiometry()` converte cada quantidade para mol (`g / molarMass` ou o valor já em mol).
3. Para cada reagente, calcula os mols de produto possíveis pela razão `coeficiente do produto / coeficiente do reagente`.
4. O reagente limitante é o de menor rendimento teórico.
5. O excesso é `mols iniciais - mols consumidos` (nunca negativo), convertido para gramas.
6. Partículas usam `mols × 6,02214076 × 10²³`.
7. O rendimento percentual é `massa obtida / massa teórica × 100`, quando a massa obtida é informada; valores acima de 100% são exibidos com aviso.
8. Erros cobrem nenhuma quantidade, quantidade inválida, reagente duplicado, reagente/produto fora da equação e rendimento inválido. Reagentes sem quantidade são devolvidos em `unspecifiedReactants` e não entram no cálculo.

### Formatação (`src/lib/format.ts`)

```ts
function formatDecimal(value: number, fractionDigits: number): string;
function formatPercent(value: number, fractionDigits = 2): string;
function formatNumber(value: number, maximumFractionDigits = 2): string;
function formatScientific(value: number, significantDigits = 3): string;
```

`formatScientific()` usa `Intl.NumberFormat` com locale `pt-BR` e expoente em sobrescrito (`6,02 × 10²³`, `1 × 10⁻³`), com `—` para valores não finitos.

### Propriedades físicas (`src/lib/element-properties.ts`)

```ts
const PHASE_LABELS: Record<ElementPhase, string>;

function formatGroup(element: Element): string;
function formatPeriod(element: Element): string;
function formatPhase(element: Element): string;
function formatElectronConfiguration(element: Element): string;
function formatElectronegativity(element: Element): string;
function formatMeltingPoint(element: Element): string;
function formatBoilingPoint(element: Element): string;
function formatDensity(element: Element): string;
function formatBlock(element: Element): string;
```

Grupos recebem rótulos (por exemplo, "Grupo 8 — metais de transição"); hidrogênio é "Grupo 1 — hidrogênio" e lantanídeos/actinídeos exibem `—`. Temperaturas são convertidas de kelvin para °C e valores ausentes viram `—`.

### Quiz (`src/lib/quiz.ts` e `src/lib/quiz-storage.ts`)

```ts
type QuizMode = 'symbol-to-name' | 'name-to-symbol' | 'element-category';

interface QuizQuestion {
  atomicNumber: number;
  question: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

interface QuizReviewItem {
  atomicNumber: number;
  prompt: string;
  selectedAnswer: string;
  correctAnswer: string;
}

function createQuizRound(
  mode: QuizMode,
  count = QUESTIONS_PER_ROUND,
  random: () => number = Math.random,
): QuizQuestion[];

function buildQuizReview(
  questions: QuizQuestion[],
  selectedIndexes: Array<number | null>,
): QuizReviewItem[];

interface QuizScore {
  last: number;
  best: number;
}

const QUIZ_STORAGE_KEY = 'chem-toolkit.quiz.scores';

function readQuizScores(storage: ScoreStorage | undefined): QuizScores;
function saveQuizScore(storage: ScoreStorage | undefined, mode: QuizMode, score: number): QuizScore;
```

**Geração da rodada:** elementos embaralhados com Fisher-Yates (RNG injetável), até 10 sem repetição; a resposta correta depende do modo (`namePt`, `symbol` ou categoria); os 3 distratores vêm do mesmo domínio e as 4 alternativas são embaralhadas. `buildQuizReview()` devolve apenas as questões erradas, com a resposta escolhida e a correta.

**Armazenamento:** lê um JSON em `chem-toolkit.quiz.scores` com `{ last, best }` por modo; valores inválidos viram 0; `saveQuizScore` atualiza `last` e mantém o maior `best`; `getItem`/`setItem` são protegidos por `try/catch`.

### Tema e acessibilidade (`src/lib/theme.ts`, `src/ui/theme-toggle.ts`)

```ts
type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'chem-toolkit.theme';

function readStoredTheme(storage: ThemeStorage | undefined): Theme | null;
function saveTheme(storage: ThemeStorage | undefined, theme: Theme): void;
function resolveInitialTheme(stored: Theme | null, prefersDark: boolean): Theme;
function toggleTheme(theme: Theme): Theme;

function createThemeToggle(): HTMLButtonElement;
```

O tema é aplicado em `<html data-theme="light|dark">`, com script inline no `<head>` para evitar flash antes da primeira pintura. O CSS concentra as variáveis semânticas em `base.css`. A tabela usa roving tabindex: um único ponto de Tab, setas para navegar, filtros reposicionando o ponto e foco gerenciado no painel de detalhes; `Esc` devolve o foco à célula.

## 4. Decisões de arquitetura e justificativas

| Decisão                                                          | Justificativa                                                                                                                             |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Parser recursivo descendente em `src/lib/molar-mass.ts`          | Mantém a lógica de química separada da UI, testável sem navegador, e cobre grupos aninhados sem biblioteca externa.                       |
| Balanceador com frações exatas (`bigint`) e RREF                 | Evita erros de arredondamento e garante os menores coeficientes inteiros; a matriz é pequena.                                             |
| Equações com coeficiente zero ou múltiplas soluções geram erro   | Evita resultados ambíguos ou compostos que não participam da reação.                                                                      |
| `FormulaError`, `BalanceError` e `StoichiometryError` com `code` | Permite testar os códigos e exibir mensagens claras diretamente na interface, sem comparar strings.                                       |
| Estequiometria reaproveita balanceador e calculadora             | Evita duplicar química já testada e mantém `src/lib/` independente da interface.                                                          |
| Estequiometria em duas etapas                                    | As quantidades só fazem sentido depois que reagentes e produtos balanceados são conhecidos; evita campos obsoletos quando a equação muda. |
| Quantidades apenas em gramas ou mol                              | Mantém o C1 pequeno e testável; volume de gases e molaridade exigem dados adicionais (temperatura, pressão, concentração).                |
| Rendimento acima de 100% é aviso, não erro                       | Massas obtidas podem incluir impurezas ou erro de medição; bloquear esconderia o resultado. O aviso pede conferência.                     |
| Reagentes sem quantidade não bloqueiam o cálculo                 | O usuário pode calcular com os reagentes que conhece; a interface lista explicitamente quem ficou de fora.                                |
| Quiz com 10 perguntas e 4 alternativas                           | Rodada curta, com feedback imediato e boa leitura no celular.                                                                             |
| Distratores do mesmo domínio da pergunta                         | Evita alternativas elimináveis pelo formato.                                                                                              |
| Função aleatória injetável                                       | Testes determinísticos sem depender de `Math.random`.                                                                                     |
| Pontuação e recorde por modo no `localStorage`                   | Cada modo tem dificuldade própria; acesso protegido para navegação privada.                                                               |
| Tema em `data-theme` + variáveis CSS                             | Um único conjunto de componentes atende aos dois temas.                                                                                   |
| `base: '/projeto/'` no `vite.config.ts`                          | O repositório se chama `projeto`; dev, preview e produção usam o mesmo caminho.                                                           |
| Nenhuma dependência nova                                         | Requisito do `AGENTS.md`; toda a lógica foi implementada do zero.                                                                         |

## 5. Resultado real de `npm test`, `npm run build` e `npm run lint`

Executados em 2026-11-09 na branch `feat/v1.3-stoichiometry`:

```text
$ npm test
RUN  v5.0.5 C:/Users/wende/OneDrive/Desktop/wenderson/projetos/SaaS/meus projetos/projeto 1
Test Files  8 passed (8)
     Tests  166 passed (166)
  Duration  664ms

$ npm run build
tsc && vite build
vite v8.3.5 building client environment for production...
✓ 31 modules transformed.
dist/index.html                  3.99 kB │ gzip:  1.20 kB
dist/assets/index-DcQAc0Wp.css  22.91 kB │ gzip:  4.60 kB
dist/assets/index-CmoxJixM.js   95.72 kB │ gzip: 21.29 kB
✓ built in 128ms

$ npm run lint
eslint .
(sem erros)
```

**Validação manual no navegador (Edge headless via CDP, `npm run preview` em `http://127.0.0.1:4173/projeto/`):**

- `H2 + O2 -> H2O`, 4 g de H2 e 32 g de O2: H2 limitante, 1,984 mol e 35,744 g de H2O, 0,256 g de O2 em excesso; com 30 g obtidos, rendimento de 83,93%.
- `Fe + O2 -> Fe2O3`, 100 g de Fe e 96 g de O2: Fe limitante, 0,895 mol e 142,973 g de Fe2O3, 53,027 g de O2 em excesso.
- `C3H8 + O2 -> CO2 + H2O`, 44,1 g de C3H8: 3,000 mol e 132,036 g de CO2, com aviso de O2 sem quantidade.
- Unidade mol, vírgula decimal, rendimento acima de 100% com aviso, erros de quantidade vazia/inválida, produto inexistente, equação impossível e seta ausente, com foco e `aria-invalid` corretos.
- Composto com massa aproximada (`RaO`) exibe aviso e asterisco na tabela.
- Mobile em 390 px sem overflow horizontal; console sem erros.

## 6. Problemas conhecidos, limitações e dúvidas para revisão

- **Sem testes de navegador automatizados:** a interface foi validada por `tsc`, build, lint, testes unitários e Edge headless via CDP, mas não há jsdom/Playwright. A revisão manual no `npm run dev` continua necessária.
- **Escopo da estequiometria:** considera reação completa e coeficientes balanceados como proporção real; não calcula volume de gases, soluções/molalidade, pureza ou impurezas. As quantidades dos reagentes são aceitas apenas em gramas ou mol.
- **Massas aproximadas:** elementos sem massa padrão da IUPAC usam o número de massa do isótopo mais estável; a interface avisa e marca a espécie com `*`.
- **Rendimento acima de 100%:** é permitido e exibido com aviso, não como erro.
- **Cargas iônicas:** o parser e o balanceador cobrem fórmulas neutras; `Fe2+`, `SO4^2-` e redox com íons não são suportados.
- **Sem tags/releases para 1.1, 1.2 e 1.3:** as branches estão empilhadas e os PRs ainda precisam ser abertos manualmente (o `gh` não está instalado).
- **Vulnerabilidades de desenvolvimento:** `npm audit` reporta 10 vulnerabilidades moderadas em dependências de desenvolvimento; não usar `npm audit fix --force`.
- **Capturas:** são PNGs gerados em 1280 px, sem versão mobile e sem GIF; a captura da estequiometria foi adicionada em `docs/screenshots/stoichiometry-light.png`.
- **Dúvidas para o Claude:**
  1. O fluxo em duas etapas (preparar equação → calcular) é mais claro do que um formulário único? Há risco de o usuário esquecer de preparar a equação?
  2. Reagentes sem quantidade devem continuar sendo apenas avisados, ou o cálculo deveria ser bloqueado até todos os reagentes serem preenchidos?
  3. Rendimento acima de 100% deve permanecer como aviso ou virar erro de validação?
  4. A notação científica com sobrescritos (`1,19 × 10²⁴`) é adequada para leitores de tela, ou vale oferecer também uma forma por extenso?
  5. Para a próxima fase, pH/soluções ou conversão de unidades? Alguma preocupação com a ordem?
  6. Vale adicionar Playwright em uma fase futura para cobrir a interface, ou a validação manual com Edge headless é suficiente por enquanto?

## 7. Como usar este documento

1. O OpenCode atualiza este arquivo ao final de cada etapa relevante, com dados reais.
2. O usuário copia o conteúdo e cola na conversa com o Claude.
3. O Claude retorna a revisão; o OpenCode compara com o código existente e com o `AGENTS.md`, explica benefícios e riscos e pede aprovação antes de implementar mudanças significativas.
