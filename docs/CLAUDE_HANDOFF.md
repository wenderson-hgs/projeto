# CLAUDE_HANDOFF — chem-toolkit

> Resumo técnico pronto para copiar e colar na conversa com o Claude (consultor externo de arquitetura, lógica e revisão).
> O Claude não tem acesso aos arquivos locais; este documento deve ser autocontido.
> Regras e planejamento completos: `AGENTS.md`. Estado detalhado: `PROJECT_STATE.md`.

## Situação atual

- **Etapa:** Fase 2 — Massa molar concluída na branch `feat/phase-2-molar-mass` (commits `fa29aca` e `c3e471e`), aguardando revisão do usuário antes do merge na `main`.
- **Repositório:** https://github.com/wenderson-hgs/projeto
- **`main`:** commit `9d0def0` (Fase 1 publicada).
- **Projeto:** chem-toolkit, site estático (Vite + TypeScript, sem framework) com tabela periódica interativa, calculadora de massa molar, balanceador de equações e quiz.
- **Próxima fase:** Fase 3 — Balanceador de equações (ainda não planejada/aprovada).

## 1. Objetivo da etapa e o que foi implementado

A Fase 2 adicionou a calculadora de massa molar. O parser aceita fórmulas simples (`H2O`), parênteses e colchetes aninhados (`Ca(OH)2`, `Fe2(SO4)3`, `K4[Fe(CN)6]`) e hidratos com `·`, `.` ou `*` (`CuSO4·5H2O`). O resultado traz a massa molar total, a composição percentual por elemento e um aviso quando algum elemento usa massa atômica aproximada. A interface fica abaixo da tabela periódica, com exemplos clicáveis, mensagens de erro acessíveis e tabela responsiva. Foram adicionados 32 testes de fórmula, além dos 24 testes de elementos (56 no total), e o teste temporário `tests/smoke.test.ts` foi removido.

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
│  ├─ main.ts                     (composição e estado da aplicação)
│  ├─ data/
│  │  ├─ elements.json            (118 elementos — CC BY-SA 3.0)
│  │  └─ README.md                (fonte, licença e alterações)
│  ├─ lib/
│  │  ├─ elements.ts              (tipos, dataset e helpers)
│  │  └─ molar-mass.ts            (parser + massa molar)
│  ├─ ui/
│  │  ├─ periodic-table.ts        (grade + legenda)
│  │  ├─ details-panel.ts         (painel de detalhes)
│  │  ├─ search-filter.ts         (busca + select de categoria)
│  │  ├─ keyboard-navigation.ts   (setas entre células)
│  │  └─ molar-mass.ts            (seção da calculadora)
│  └─ styles/
│     ├─ base.css                 (tema claro, layout, legenda, rodapé)
│     ├─ table.css                (CSS Grid, cores, seleção, filtro)
│     ├─ controls.css             (barra de busca/filtro)
│     ├─ details.css              (painel e bottom sheet)
│     └─ calculator.css           (calculadora e tabela de composição)
└─ tests/
   ├─ elements.test.ts            (24 testes)
   └─ molar-mass.test.ts          (32 testes)
```

## 3. Implementações e assinaturas

### Dados e busca por símbolo (`src/lib/elements.ts`)

```ts
function getElementBySymbol(symbol: string): Element | undefined;
```

- `elementsBySymbol` é um `Map<string, Element>` criado uma vez a partir do dataset.
- A busca é case-sensitive: `Fe` funciona, `fe` não. Isso é intencional, pois símbolos químicos diferenciam maiúsculas e minúsculas (`Co` ≠ `CO`).

### Parser e cálculo (`src/lib/molar-mass.ts`)

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

**Funcionamento do parser:**

1. Remove todos os espaços da entrada.
2. Divide a fórmula em segmentos de hidrato nos separadores de nível superior (`·`, `.`, `*`), respeitando parênteses/colchetes.
3. No primeiro segmento, rejeita coeficiente no início (`2H2O`).
4. Nos demais segmentos, lê um coeficiente opcional (`5H2O` = 5 × H2O) e aplica esse multiplicador à molécula inteira.
5. Cada segmento é analisado por descida recursiva: símbolos, contagens e grupos `()`/`[]` aninhados.
6. Símbolos são validados contra o dataset via `getElementBySymbol`.
7. Contagens precisam ser inteiros positivos; grupos vazios, fechamentos sem abertura e caracteres inválidos geram `FormulaError`.

**Cálculo:**

- Massa de cada elemento = `atomicMass × count`.
- Massa molar total = soma das massas.
- Percentual = `massa do elemento / massa total × 100`.
- `isApproximate` fica `true` se qualquer elemento tiver `atomicMassIsApproximate`.

### Interface (`src/ui/molar-mass.ts`)

```ts
function createMolarMassCalculator(): HTMLElement;
```

- Formulário com `label`, campo de texto e botão **Calcular**; Enter também envia.
- Botões de exemplo: `H2O`, `Ca(OH)2`, `Fe2(SO4)3`, `K4[Fe(CN)6]`, `CuSO4·5H2O`.
- Erros em `role="alert"`, com `aria-invalid` e `aria-errormessage` no campo.
- Resultado em região `aria-live="polite"`.
- Tabela de composição com símbolo, nome, quantidade, massa e percentual.
- Aviso de resultado aproximado quando necessário.
- Layout em card, responsivo; a tabela de composição tem rolagem horizontal no celular.

## 4. Decisões de arquitetura e justificativas

| Decisão | Justificativa |
|---|---|
| Parser recursivo descendente em `src/lib/molar-mass.ts` | Mantém a lógica de química separada da UI, testável sem navegador, e cobre grupos aninhados sem biblioteca externa. |
| Espaços internos ignorados | Facilita colar fórmulas com espaços (`Ca (OH) 2`). |
| `·`, `.` e `*` como separadores de hidrato | Atende aos três formatos pedidos no `AGENTS.md`. |
| Coeficiente de hidrato aplicado à molécula inteira | `CuSO4·5H2O` soma 5 × (H2O) ao sulfato de cobre. |
| Coeficiente no início da fórmula rejeitado | `2H2O` representa quantidade de matéria, não a fórmula de um composto; a calculadora recebe apenas a fórmula. |
| `FormulaError` com `code` e mensagem em português | Permite testar os códigos e exibir mensagens claras diretamente na interface. |
| `getElementBySymbol()` com `Map` | O parser consulta símbolos com frequência; evita busca linear no array de 118 elementos. |
| Calculadora abaixo da tabela, sem abas | Mantém a navegação simples e o layout existente. |
| Valores com ponto decimal | Consistência com a tabela periódica e com as massas do dataset. |
| Nenhuma dependência nova | Requisito do `AGENTS.md`; o parser foi implementado do zero. |

## 5. Resultado real de `npm test`, `npm run build` e `npm run lint`

Executados em 2026-10-23, na branch `feat/phase-2-molar-mass`, após a interface:

```text
$ npm test
RUN  v5.0.5 C:/Users/wende/OneDrive/Desktop/wenderson/projetos/SaaS/meus projetos/projeto 1
Test Files  2 passed (2)
     Tests  56 passed (56)
  Duration  752ms

$ npm run build
tsc && vite build
vite v8.3.5 building client environment for production...
✓ 17 modules transformed.
dist/index.html                  0.65 kB │ gzip: 0.40 kB
dist/assets/index-uva6E6jb.css   8.93 kB │ gzip: 2.56 kB
dist/assets/index-BYOXClAd.js   43.69 kB │ gzip: 9.79 kB
✓ built in 307ms

$ npm run lint
eslint .
(sem erros)
```

Na Etapa 1 (somente lógica, sem a interface integrada), os resultados foram: 56 testes em 879 ms e build de 312 ms com 14 módulos. Nenhum resultado foi declarado sem execução real.

## 6. Problemas conhecidos, limitações e dúvidas para revisão

- **Sem testes de navegador:** a calculadora foi validada por `tsc`, build, lint e testes unitários da lógica; não há jsdom/Playwright. O usuário precisa testar o formulário no `npm run dev`.
- **Limitações do parser:** não aceita coeficientes no início (`2H2O`), quantidades decimais nem separadores de hidrato diferentes de `·`, `.` e `*`.
- **Precisão dos dados:** `Fe2(SO4)3` resulta em 399,858 g/mol com as massas do dataset. Está dentro da tolerância de ±0,05 do `AGENTS.md` (399,88), mas difere do valor convencional arredondado. Vale manter ou documentar melhor?
- **Massas aproximadas:** elementos sem padrão IUPAC usam o número de massa do isótopo mais estável; a UI avisa, mas o valor não é uma massa atômica padrão.
- **`aria-live` no resultado inteiro:** a região inclui a tabela de composição. Isso pode ser verboso em leitores de tela; vale anunciar só a massa total?
- **Reuso na Fase 3:** o balanceador precisará aceitar coeficientes estequiométricos (`2 H2 + O2 -> 2 H2O`). Vale extrair um tokenizador/AST compartilhado agora ou criar um parser separado para equações?
- **Branch ainda não mesclada:** `feat/phase-2-molar-mass` aguarda revisão; a `main` continua em `9d0def0`.
- **GitHub Pages** ainda não configurado; na Fase 5 o `base` do Vite deve ser `/projeto/`.
- **Dúvidas para o Claude:**
  1. A separação `elements.ts` / `molar-mass.ts` / `ui/molar-mass.ts` está adequada para evoluir para o balanceador, ou seria melhor introduzir um módulo de parsing compartilhado?
  2. Lançar `FormulaError` é a melhor escolha para a UI, ou um retorno discriminado (`{ ok: true } | { ok: false, error }`) seria mais testável?
  3. O tratamento de hidratos por split de nível superior cobre os casos reais, ou há armadilhas (por exemplo, hidratos com grupos e múltiplos separadores)?
  4. Alguma sugestão de acessibilidade para o resultado e a tabela de composição?

## 7. Como usar este documento

1. O OpenCode atualiza este arquivo ao final de cada etapa relevante, com dados reais.
2. O usuário copia o conteúdo e cola na conversa com o Claude.
3. O Claude retorna a revisão; o OpenCode compara com o código existente e com o `AGENTS.md`, explica benefícios e riscos e pede aprovação antes de implementar mudanças significativas.
