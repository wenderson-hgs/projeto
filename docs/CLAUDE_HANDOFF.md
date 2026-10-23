# CLAUDE_HANDOFF — chem-toolkit

> Resumo técnico pronto para copiar e colar na conversa com o Claude (consultor externo de arquitetura, lógica e revisão).
> O Claude não tem acesso aos arquivos locais; este documento deve ser autocontido.
> Regras e planejamento completos: `AGENTS.md`. Estado detalhado: `PROJECT_STATE.md`.

## Situação atual

- **Etapa:** Fase 4 — Quiz concluída, revisada pelo usuário e mesclada na `main` por fast-forward até `a75252d`.
- **Repositório:** https://github.com/wenderson-hgs/projeto
- **`main`:** contém as Fases 0, 1, 2, 3 e 4.
- **Projeto:** chem-toolkit, site estático (Vite + TypeScript, sem framework) com tabela periódica interativa, calculadora de massa molar, balanceador de equações e quiz.
- **Próxima fase:** Fase 5 — Polimento e publicação (plano a ser apresentado e aprovado antes de editar arquivos).

## 1. Objetivo da etapa e o que foi implementado

A Fase 4 adicionou o quiz. Há três modos: símbolo → nome, nome → símbolo e categoria do elemento. Cada rodada tem 10 perguntas, sem repetir elementos, com 4 alternativas e feedback imediato. O resultado mostra a pontuação, a última pontuação e o recorde do modo. A última pontuação e o recorde de cada modo ficam no `localStorage`, com leitura/gravação protegidas por `try/catch` (navegação privada não quebra o quiz). A interface fica abaixo do balanceador, com foco movido para a pergunta e para o resultado para melhorar a leitura por leitores de tela. Foram adicionados 15 testes, totalizando 102 no projeto.

## 2. Arquivos principais

```text
projeto 1/
├─ AGENTS.md
├─ PROJECT_STATE.md
├─ README.md
├─ LICENSE                         (MIT — código)
├─ index.html
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ vitest.config.ts
├─ eslint.config.js
├─ .prettierrc.json
├─ .prettierignore
├─ .gitignore
├─ docs/
│  └─ CLAUDE_HANDOFF.md
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ main.ts                     (composição da aplicação)
│  ├─ data/
│  │  ├─ elements.json            (118 elementos — CC BY-SA 3.0)
│  │  └─ README.md                (fonte, licença e alterações)
│  ├─ lib/
│  │  ├─ elements.ts              (tipos, dataset e helpers)
│  │  ├─ molar-mass.ts            (parser + massa molar)
│  │  ├─ balancer.ts              (parser de equações + balanceador exato)
│  │  ├─ quiz.ts                  (geração de perguntas)
│  │  └─ quiz-storage.ts          (pontuação no localStorage)
│  ├─ ui/
│  │  ├─ periodic-table.ts        (grade + legenda)
│  │  ├─ details-panel.ts         (painel de detalhes)
│  │  ├─ search-filter.ts         (busca + select de categoria)
│  │  ├─ keyboard-navigation.ts   (setas entre células)
│  │  ├─ molar-mass.ts            (seção da calculadora)
│  │  ├─ balancer.ts              (seção do balanceador)
│  │  └─ quiz.ts                  (seção do quiz)
│  └─ styles/
│     ├─ base.css                 (tema claro, layout, legenda, rodapé)
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
   └─ quiz.test.ts                (15 testes)
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
  | 'empty-formula' | 'unknown-symbol' | 'unbalanced-brackets'
  | 'unexpected-token' | 'invalid-count' | 'invalid-character'
  | 'empty-hydrate' | 'leading-coefficient' | 'empty-group';

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
  | 'empty-equation' | 'missing-arrow' | 'multiple-arrows'
  | 'empty-side' | 'empty-term' | 'invalid-coefficient'
  | 'invalid-formula' | 'no-solution' | 'multiple-solutions'
  | 'zero-coefficient' | 'no-positive-solution'
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
function saveQuizScore(
  storage: ScoreStorage | undefined,
  mode: QuizMode,
  score: number,
): QuizScore;
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

## 4. Decisões de arquitetura e justificativas

| Decisão | Justificativa |
|---|---|
| Parser recursivo descendente em `src/lib/molar-mass.ts` | Mantém a lógica de química separada da UI, testável sem navegador, e cobre grupos aninhados sem biblioteca externa. |
| Balanceador com frações exatas (`bigint`) e RREF | Evita erros de arredondamento e garante os menores coeficientes inteiros; a matriz é pequena. |
| Equações com coeficiente zero ou múltiplas soluções geram erro | Evita resultados ambíguos ou compostos que não participam da reação. |
| `FormulaError` e `BalanceError` com `code` e mensagem em português | Permite testar os códigos e exibir mensagens claras diretamente na interface. |
| Quiz com 10 perguntas e 4 alternativas | Rodada curta, com feedback imediato e boa leitura no celular. |
| Distratores do mesmo domínio da pergunta | Evita alternativas elimináveis pelo formato (por exemplo, números entre nomes). |
| Função aleatória injetável | Testes determinísticos sem depender de `Math.random`. |
| Pontuação e recorde por modo no `localStorage` | Cada modo tem dificuldade própria; separar os recordes é mais justo. Acesso protegido para navegação privada. |
| Foco na pergunta e no resultado | Leitores de tela ouvem a pergunta completa e a pontuação final; feedback em `role="status"`. |
| Calculadora, balanceador e quiz na mesma página | Mantém a navegação simples, sem abas ou rotas. |
| Nenhuma dependência nova | Requisito do `AGENTS.md`; toda a lógica foi implementada do zero. |

## 5. Resultado real de `npm test`, `npm run build` e `npm run lint`

Executados em 2026-10-23, na `main`, após o merge da Fase 4:

```text
$ npm test
RUN  v5.0.5 C:/Users/wende/OneDrive/Desktop/wenderson/projetos/SaaS/meus projetos/projeto 1
Test Files  4 passed (4)
     Tests  102 passed (102)
  Duration  970ms

$ npm run build
tsc && vite build
vite v8.3.5 building client environment for production...
✓ 24 modules transformed.
dist/index.html                  0.65 kB │ gzip:  0.40 kB
dist/assets/index-BlDbAV9F.css  14.08 kB │ gzip:  3.28 kB
dist/assets/index-D7SDOidd.js   56.91 kB │ gzip: 13.55 kB
✓ built in 336ms

$ npm run lint
eslint .
(sem erros)
```

Na branch, após a interface: 102 testes em 1,12 s e build de 332 ms. Nenhum resultado foi declarado sem execução real.

## 6. Problemas conhecidos, limitações e dúvidas para revisão

- **Sem testes de navegador:** tabela, calculadora, balanceador e quiz foram validados por `tsc`, build, lint e testes unitários; não há jsdom/Playwright. O usuário precisa testar o quiz no `npm run dev`.
- **`localStorage` é local ao navegador:** limpar os dados do site ou trocar de dispositivo zera o histórico. Em navegação privada, o recorde pode não persistir.
- **Rodada fixa:** 10 perguntas e 4 alternativas, sem níveis de dificuldade, limite de tempo ou modo de resposta digitada.
- **Categorias previstas:** o quiz usa a categoria normalizada de cada elemento, inclusive para superpesados cuja categoria é prevista (`categoryIsPredicted`). O quiz não avisa sobre isso; vale excluir esses elementos ou mostrar a ressalva?
- **Nomes em inglês:** o quiz usa apenas `namePt`; `nameEn` não é usado.
- **Aleatoriedade:** em produção usa `Math.random`; não há seed persistida nem repetição controlada entre rodadas.
- **Precisão dos dados:** `Fe2(SO4)3` resulta em 399,858 g/mol com as massas do dataset, dentro da tolerância de ±0,05 do `AGENTS.md`.
- **Massas aproximadas:** elementos sem padrão IUPAC usam o número de massa do isótopo mais estável; a calculadora avisa.
- **Branch mesclada:** `feat/phase-4-quiz` foi revisada pelo usuário, mesclada por fast-forward na `main` e publicada.
- **GitHub Pages** ainda não configurado; na Fase 5 o `base` do Vite deve ser `/projeto/`.
- **Dúvidas para o Claude:**
  1. Rodadas de 10 perguntas com 4 alternativas são adequadas para o público iniciante, ou vale um modo sem limite?
  2. O quiz deve excluir elementos com categoria prevista ou apenas sinalizar a ressalva?
  3. O formato `{ last, best }` por modo no `localStorage` é suficiente, ou vale versionar a chave para evoluções futuras?
  4. Alguma sugestão de acessibilidade para o feedback imediato e a troca de foco entre perguntas?

## 7. Como usar este documento

1. O OpenCode atualiza este arquivo ao final de cada etapa relevante, com dados reais.
2. O usuário copia o conteúdo e cola na conversa com o Claude.
3. O Claude retorna a revisão; o OpenCode compara com o código existente e com o `AGENTS.md`, explica benefícios e riscos e pede aprovação antes de implementar mudanças significativas.
