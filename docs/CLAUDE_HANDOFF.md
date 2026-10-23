# CLAUDE_HANDOFF — chem-toolkit

> Resumo técnico pronto para copiar e colar na conversa com o Claude (consultor externo de arquitetura, lógica e revisão).
> O Claude não tem acesso aos arquivos locais; este documento deve ser autocontido.
> Regras e planejamento completos: `AGENTS.md`. Estado detalhado: `PROJECT_STATE.md`.

## Situação atual

- **Etapa:** Fase 3 — Balanceador de equações concluída, revisada pelo usuário e mesclada na `main` por fast-forward até `806c2e8`.
- **Repositório:** https://github.com/wenderson-hgs/projeto
- **`main`:** contém as Fases 0, 1, 2 e 3.
- **Projeto:** chem-toolkit, site estático (Vite + TypeScript, sem framework) com tabela periódica interativa, calculadora de massa molar, balanceador de equações e quiz.
- **Próxima fase:** Fase 4 — Quiz (plano a ser apresentado e aprovado antes de editar arquivos).

## 1. Objetivo da etapa e o que foi implementado

A Fase 3 adicionou o balanceador de equações. A entrada aceita `->`, `=` ou `→` entre reagentes e produtos, com termos separados por `+`. Cada composto é validado pelo mesmo parser de fórmulas da calculadora, então grupos (`Ca(OH)2`), colchetes aninhados (`K4[Fe(CN)6]`) e hidratos (`CuSO4·5H2O`) funcionam. O algoritmo monta a matriz de composição (elementos × compostos), calcula o espaço nulo com frações exatas usando `bigint` (sem ponto flutuante) e escala o vetor para os menores coeficientes inteiros. Casos impossíveis, com múltiplas soluções, com coeficiente zero ou sem solução positiva geram mensagens claras. A interface fica abaixo da calculadora, com exemplos clicáveis e resultado acessível. Foram adicionados 31 testes de balanceamento, totalizando 87 testes no projeto.

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
│  │  └─ balancer.ts              (parser de equações + balanceador exato)
│  ├─ ui/
│  │  ├─ periodic-table.ts        (grade + legenda)
│  │  ├─ details-panel.ts         (painel de detalhes)
│  │  ├─ search-filter.ts         (busca + select de categoria)
│  │  ├─ keyboard-navigation.ts   (setas entre células)
│  │  ├─ molar-mass.ts            (seção da calculadora)
│  │  └─ balancer.ts              (seção do balanceador)
│  └─ styles/
│     ├─ base.css                 (tema claro, layout, legenda, rodapé)
│     ├─ table.css                (CSS Grid, cores, seleção, filtro)
│     ├─ controls.css             (barra de busca/filtro)
│     ├─ details.css              (painel e bottom sheet)
│     ├─ calculator.css           (calculadora e tabela de composição)
│     └─ balancer.css             (balanceador e equação balanceada)
└─ tests/
   ├─ elements.test.ts            (24 testes)
   ├─ molar-mass.test.ts          (32 testes)
   └─ balancer.test.ts            (31 testes)
```

## 3. Implementações e assinaturas

### Dados e busca por símbolo (`src/lib/elements.ts`)

```ts
function getElementBySymbol(symbol: string): Element | undefined;
```

- `elementsBySymbol` é um `Map<string, Element>` criado uma vez a partir do dataset.
- A busca é case-sensitive: `Fe` funciona, `fe` não. Isso é intencional, pois símbolos químicos diferenciam maiúsculas e minúsculas (`Co` ≠ `CO`).

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

interface CompositionEntry {
  symbol: string;
  namePt: string;
  count: number;
  mass: number;
  percent: number;
  isApproximate: boolean;
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

**Funcionamento do parser de fórmulas:**

1. Remove todos os espaços da entrada.
2. Divide a fórmula em segmentos de hidrato nos separadores de nível superior (`·`, `.`, `*`), respeitando parênteses/colchetes.
3. No primeiro segmento, rejeita coeficiente no início (`2H2O`).
4. Nos demais segmentos, lê um coeficiente opcional (`5H2O` = 5 × H2O) e aplica esse multiplicador à molécula inteira.
5. Cada segmento é analisado por descida recursiva: símbolos, contagens e grupos `()`/`[]` aninhados.
6. Símbolos são validados contra o dataset via `getElementBySymbol`.
7. Contagens precisam ser inteiros positivos; grupos vazios, fechamentos sem abertura e caracteres inválidos geram `FormulaError`.

**Cálculo:** massa de cada elemento = `atomicMass × count`; massa molar = soma; percentual = massa do elemento / massa total × 100; `isApproximate` fica `true` se qualquer elemento tiver `atomicMassIsApproximate`.

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

**Funcionamento do balanceamento:**

1. A entrada é aparada e precisa conter exatamente uma seta (`->`, `=` ou `→`). Nenhuma seta gera `missing-arrow`; mais de uma gera `multiple-arrows`.
2. Cada lado é dividido por `+`. Lado vazio gera `empty-side`; termo vazio (ex.: `H2 + + O2`) gera `empty-term`.
3. Em cada termo, um coeficiente inteiro positivo opcional é validado, mas **ignorado** — o balanceador sempre calcula os menores inteiros. O restante é a fórmula, com espaços removidos e validada por `parseFormula()`; erros de fórmula viram `BalanceError` com a mensagem original.
4. A matriz tem uma linha por elemento e uma coluna por composto: reagentes entram com sinal positivo, produtos com sinal negativo.
5. A matriz é reduzida à forma escalonada reduzida por linhas (RREF) com uma classe `Fraction` interna, baseada em `bigint` e normalizada por MDC. Não há ponto flutuante em nenhuma etapa.
6. As colunas sem pivô formam o espaço nulo:
   - 0 colunas livres → `no-solution` (equação impossível, como `H2 -> O2`);
   - mais de 1 → `multiple-solutions` (ex.: composto repetido dos dois lados).
7. Com uma coluna livre, o vetor é montado com a variável livre valendo 1 e as variáveis pivô resolvidas pelas linhas da RREF.
8. O vetor é multiplicado pelo MMC dos denominadores e dividido pelo MDC dos numeradores, produzindo os menores inteiros.
9. Coeficiente 0 em qualquer composto gera `zero-coefficient` (o composto não participaria); coeficientes de sinais mistos geram `no-positive-solution` (não há solução com todos positivos).
10. O resultado mantém a ordem de entrada e inclui o coeficiente em cada termo.

### Interface do balanceador (`src/ui/balancer.ts`)

```ts
function createEquationBalancer(): HTMLElement;
```

- Formulário com `label`, campo de texto e botão **Balancear**; Enter também envia.
- Botões de exemplo: `H2 + O2 -> H2O`, `Fe + O2 -> Fe2O3`, `C3H8 + O2 -> CO2 + H2O` e `KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2`.
- Erros em `role="alert"`, com `aria-invalid` e `aria-errormessage` no campo.
- Resultado em região `aria-live="polite"`, exibido como `2 H2 + O2 → 2 H2O`.
- Layout em card, responsivo; botão e campo empilham no celular.

## 4. Decisões de arquitetura e justificativas

| Decisão | Justificativa |
|---|---|
| Parser recursivo descendente em `src/lib/molar-mass.ts` | Mantém a lógica de química separada da UI, testável sem navegador, e cobre grupos aninhados sem biblioteca externa. |
| Espaços internos ignorados | Facilita colar fórmulas com espaços (`Ca (OH) 2`). |
| `·`, `.` e `*` como separadores de hidrato | Atende aos três formatos pedidos no `AGENTS.md`. |
| Coeficiente de hidrato aplicado à molécula inteira | `CuSO4·5H2O` soma 5 × (H2O) ao sulfato de cobre. |
| Coeficiente no início da fórmula rejeitado na calculadora | `2H2O` representa quantidade de matéria, não a fórmula de um composto; a calculadora recebe apenas a fórmula. |
| `FormulaError` com `code` e mensagem em português | Permite testar os códigos e exibir mensagens claras diretamente na interface. |
| `getElementBySymbol()` com `Map` | O parser consulta símbolos com frequência; evita busca linear no array de 118 elementos. |
| Balanceador usa frações exatas com `bigint` e eliminação de Gauss | Evita erros de arredondamento de ponto flutuante e garante os menores coeficientes inteiros; a matriz é pequena. |
| Coeficientes digitados na equação são validados, mas ignorados | O balanceador sempre recalcula os menores inteiros; isso corrige coeficientes errados e mantém a entrada simples. |
| Equações com coeficiente zero ou múltiplas soluções geram erro | Coeficiente zero indica composto que não participa; múltiplas soluções tornam o resultado ambíguo. |
| Fórmulas de cada termo são validadas por `parseFormula()` | Reaproveita grupos, colchetes aninhados e hidratos, além de validar símbolos contra o dataset. |
| `BalanceError` com código e mensagem em português | Consistente com `FormulaError`; permite testar os casos e exibir mensagens diretas na interface. |
| Calculadora e balanceador abaixo da tabela, sem abas | Mantém a navegação simples e o layout existente. |
| Valores com ponto decimal | Consistência com a tabela periódica e com as massas do dataset. |
| Nenhuma dependência nova | Requisito do `AGENTS.md`; parser e balanceador foram implementados do zero. |

## 5. Resultado real de `npm test`, `npm run build` e `npm run lint`

Executados em 2026-10-23, na `main`, após o merge da Fase 3:

```text
$ npm test
RUN  v5.0.5 C:/Users/wende/OneDrive/Desktop/wenderson/projetos/SaaS/meus projetos/projeto 1
Test Files  3 passed (3)
     Tests  87 passed (87)
  Duration  693ms

$ npm run build
tsc && vite build
vite v8.3.5 building client environment for production...
✓ 20 modules transformed.
dist/index.html                  0.65 kB │ gzip:  0.40 kB
dist/assets/index-CWb9NivL.css  10.98 kB │ gzip:  2.76 kB
dist/assets/index-I2_NsqV6.js   50.68 kB │ gzip: 11.73 kB
✓ built in 302ms

$ npm run lint
eslint .
(sem erros)
```

Na branch, após a interface: 87 testes em 792 ms e build de 249 ms. Nenhum resultado foi declarado sem execução real.

## 6. Problemas conhecidos, limitações e dúvidas para revisão

- **Sem testes de navegador:** tabela, calculadora e balanceador foram validados por `tsc`, build, lint e testes unitários da lógica; não há jsdom/Playwright. O usuário precisa testar os formulários no `npm run dev`.
- **Cargas iônicas não são suportadas:** o balanceador trabalha com fórmulas neutras. Equações redox com íons (`Fe2+`, `MnO4-`) ficam para uma fase futura, se houver interesse.
- **Coeficientes digitados são ignorados:** `6 H2 + 3 O2 -> 6 H2O` retorna `2 H2 + O2 -> 2 H2O`. O comportamento é intencional, mas pode surpreender; vale explicar melhor na interface?
- **Múltiplas soluções geram erro:** equações com compostos repetidos ou subdeterminadas não escolhem uma solução arbitrária.
- **Coeficiente zero gera erro:** um composto que não participa da reação (ex.: `N2` em `H2 + O2 -> H2O + N2`) é rejeitado em vez de removido silenciosamente.
- **Precisão dos dados:** `Fe2(SO4)3` resulta em 399,858 g/mol com as massas do dataset. Está dentro da tolerância de ±0,05 do `AGENTS.md` (399,88), mas difere do valor convencional arredondado.
- **Massas aproximadas:** elementos sem padrão IUPAC usam o número de massa do isótopo mais estável; a UI avisa, mas o valor não é uma massa atômica padrão.
- **`aria-live` no resultado da calculadora:** a região inclui a tabela de composição. Isso pode ser verboso em leitores de tela; vale anunciar só a massa total?
- **Branch mesclada:** `feat/phase-3-equation-balancer` foi revisada pelo usuário, mesclada por fast-forward na `main` e publicada.
- **GitHub Pages** ainda não configurado; na Fase 5 o `base` do Vite deve ser `/projeto/`.
- **Dúvidas para o Claude:**
  1. O uso de RREF com `bigint` e espaço nulo é adequado para o escopo, ou há uma abordagem mais simples e igualmente exata para equações químicas?
  2. O tratamento de coeficiente zero e de múltiplas soluções como erro é a melhor escolha de UX, ou seria melhor explicar/omitir compostos?
  3. Vale extrair o tokenizador de fórmulas para um módulo compartilhado antes da Fase 4, ou o reuso atual via `parseFormula()` é suficiente?
  4. Alguma sugestão de acessibilidade para o resultado da equação balanceada?

## 7. Como usar este documento

1. O OpenCode atualiza este arquivo ao final de cada etapa relevante, com dados reais.
2. O usuário copia o conteúdo e cola na conversa com o Claude.
3. O Claude retorna a revisão; o OpenCode compara com o código existente e com o `AGENTS.md`, explica benefícios e riscos e pede aprovação antes de implementar mudanças significativas.
