# CLAUDE_HANDOFF — chem-toolkit

> Resumo técnico pronto para copiar e colar na conversa com o Claude (consultor externo de arquitetura, lógica e revisão).
> O Claude não tem acesso aos arquivos locais; este documento deve ser autocontido.
> Regras e planejamento completos: `AGENTS.md`. Estado detalhado: `PROJECT_STATE.md`.

## Situação atual

- **Etapa:** Fase 1 — Tabela periódica (MVP) concluída e mesclada na `main` por fast-forward até `4c72f8a`, seguida do commit de documentação.
- **Repositório:** https://github.com/wenderson-hgs/projeto
- **Projeto:** chem-toolkit, site estático (Vite + TypeScript, sem framework) com tabela periódica interativa, calculadora de massa molar, balanceador de equações e quiz.
- **Próxima fase:** Fase 2 — Massa molar (ainda não planejada/aprovada).

## 1. Objetivo da etapa e o que foi implementado

A Fase 1 entregou a tabela periódica interativa com os 118 elementos. O dataset foi derivado do Periodic-Table-JSON (CC BY-SA 3.0), com nomes `pt-br` do Wikidata (CC0), categorias normalizadas em 9 grupos e massas aproximadas marcadas. A tabela é renderizada em CSS Grid de 18 colunas, com cores pastel por categoria e legenda. Clicar em um elemento abre um painel de detalhes; a barra superior permite buscar por nome (PT/EN, sem acentos), símbolo ou número atômico e filtrar por categoria. As setas navegam espacialmente entre células habilitadas, `Esc` fecha o painel e o layout se adapta ao celular (tabela com rolagem horizontal e painel em bottom sheet).

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
│  │  └─ elements.ts              (tipos, dataset e helpers puros)
│  ├─ ui/
│  │  ├─ periodic-table.ts        (grade + legenda)
│  │  ├─ details-panel.ts         (painel de detalhes)
│  │  ├─ search-filter.ts         (busca + select de categoria)
│  │  └─ keyboard-navigation.ts   (setas entre células)
│  └─ styles/
│     ├─ base.css                 (tema claro, layout, legenda, rodapé)
│     ├─ table.css                (CSS Grid, cores, seleção, filtro)
│     ├─ controls.css             (barra de busca/filtro)
│     └─ details.css              (painel e bottom sheet)
└─ tests/
   ├─ elements.test.ts            (23 testes)
   └─ smoke.test.ts               (temporário, 1 teste)
```

## 3. Implementações e assinaturas

### Dados (`src/data/elements.json`)

Cada item tem:

```ts
{
  atomicNumber: number;
  symbol: string;
  namePt: string;                 // ex.: "Nitrogênio"
  nameEn: string;                 // ex.: "Nitrogen"
  atomicMass: number;
  atomicMassIsApproximate: boolean;
  category: ElementCategory;
  categoryIsPredicted: boolean;
  group: number;                  // 1–18
  period: number;                 // 1–7
  xpos: number;                   // coluna no grid, 1–18
  ypos: number;                   // linha no grid, 1–10
}
```

- 118 elementos, sem duplicatas de número/símbolo/posição.
- Lantanídeos e actinídeos ficam nas linhas 9 e 10 do grid, com placeholders `57–71` e `89–103` nas linhas 6 e 7.
- `atomicMassIsApproximate` é `true` para elementos sem massa padrão da IUPAC (ex.: Tc, Pm, Ac e superpesados); a UI mostra `[massa]`.

### Lógica pura (`src/lib/elements.ts`)

```ts
type ElementCategory =
  | 'alkali-metal' | 'alkaline-earth-metal' | 'transition-metal'
  | 'post-transition-metal' | 'metalloid' | 'nonmetal'
  | 'noble-gas' | 'lanthanide' | 'actinide';

interface Element { /* campos acima */ }

const elements: Element[];
const CATEGORY_ORDER: ElementCategory[];
const CATEGORY_LABELS: Record<ElementCategory, string>;

function normalizeText(value: string): string;
function searchElements(query: string, source?: Element[]): Element[];
function filterByCategory(category: ElementCategory | 'all', source?: Element[]): Element[];
function getElementByAtomicNumber(atomicNumber: number): Element | undefined;
function formatAtomicMass(element: Element): string;
```

- `normalizeText` remove acentos via NFD e converte para minúsculas.
- `searchElements` procura em `namePt`, `nameEn`, `symbol` e número atômico exato.
- `formatAtomicMass` usa 3 casas decimais ou `[massa]` para aproximadas.

### Interface (`src/ui/`)

```ts
// periodic-table.ts
function createPeriodicTable(source: Element[]): HTMLElement;
function createLegend(): HTMLElement;

// details-panel.ts
interface DetailsPanel {
  element: HTMLElement;
  show(element: Element): void;
  hide(): void;
  isOpen(): boolean;
}
function createDetailsPanel(onClose: () => void): DetailsPanel;

// search-filter.ts
type CategoryFilter = ElementCategory | 'all';
function createSearchFilter(
  onChange: (query: string, category: CategoryFilter) => void,
): HTMLElement;

// keyboard-navigation.ts
function enableGridKeyboardNavigation(table: HTMLElement): void;
```

- Cada célula é um `<button>` com `data-atomic-number`, `aria-controls="element-details"` e `aria-expanded`.
- A grade usa `--x`/`--y` inline e `grid-column`/`grid-row`.
- A navegação por setas percorre a posição espacial, pulando células `disabled`.
- O filtro **esmaece e desabilita** células que não correspondem, preservando o grid.
- A busca e a categoria são combinadas: `filterByCategory(category, searchElements(query))`.
- O status (`role="status"`) anuncia a contagem de resultados.
- O painel é um `<aside>` fixo no canto inferior direito; no celular vira bottom sheet. Clicar novamente no mesmo elemento fecha; `Esc` e o botão "Fechar" também.

## 4. Decisões de arquitetura e justificativas

| Decisão | Justificativa |
|---|---|
| Dataset Bowserinator/Periodic-Table-JSON (CC BY-SA 3.0) | Era o conjunto mais completo e com licença verificável. O elemento hipotético 119 (`Uue`) foi excluído. `elements.json` é derivado e permanece CC BY-SA 3.0; o código é MIT. |
| Nomes `pt-br` do Wikidata (CC0) | Evita grafias europeias como “azoto” e “hidrogénio”; cobre 118/118 elementos. |
| 9 categorias normalizadas + `categoryIsPredicted` | O dataset original usa 14 rótulos, incluindo “unknown, probably…”; 9 grupos são suficientes para a UI e os previstos recebem `*`. |
| Massas aproximadas entre colchetes | Não apresentar número de massa de isótopo mais estável como massa atômica padrão. |
| Filtro esmaece/desabilita em vez de remover | Preserva o layout e a posição dos elementos; a navegação por teclado ignora desabilitados. |
| Estado da aplicação em `src/main.ts` | O projeto é pequeno e sem framework; não foi criado store global. Apenas `selectedAtomicNumber` e o painel são mutáveis. |
| Lógica de química separada em `src/lib/` | Permite testar sem navegador e será reutilizada nas Fases 2–4. |
| Sem bibliotecas de química e sem framework | Exigência do `AGENTS.md`; o objetivo é implementar e entender a lógica. |

## 5. Resultado real de `npm test`, `npm run build` e `npm run lint`

Executados em 2026-10-23, na `main`, após o merge da Fase 1:

```text
$ npm test
RUN  v5.0.5 C:/Users/wende/OneDrive/Desktop/wenderson/projetos/SaaS/meus projetos/projeto 1
Test Files  2 passed (2)
     Tests  23 passed (23)
  Duration  825ms

$ npm run build
tsc && vite build
vite v8.3.5 building client environment for production...
✓ 14 modules transformed.
dist/index.html                  0.65 kB │ gzip: 0.40 kB
dist/assets/index-s8JI_o9c.css   6.14 kB │ gzip: 1.97 kB
dist/assets/index-CAHkaCQS.js   36.23 kB │ gzip: 7.34 kB
✓ built in 327ms

$ npm run lint
eslint .
(sem erros)
```

Etapas anteriores: Etapa 1 com 18 testes e build de 194 ms; Etapa 2 com 18 testes e build de 127 ms. Nenhum resultado foi declarado sem execução real.

## 6. Problemas conhecidos, limitações e dúvidas para revisão

- **Sem testes de navegador:** clique, busca, filtro, painel e teclado foram validados por `tsc`/build/lint e revisão manual, mas não há jsdom/Playwright. A Fase 1 depende de o usuário testar no `npm run dev`.
- **Acessibilidade do filtro:** células fora do filtro ficam `disabled` e com `opacity: 0.3`. Isso preserva o grid, mas elementos desabilitados continuam expostos na árvore de acessibilidade. Vale usar `aria-hidden`/`tabindex="-1"` ou outra abordagem?
- **Estado global mínimo:** `src/main.ts` concentra a composição e os handlers. Para as próximas fases (calculadora, balanceador, quiz), vale extrair um pequeno store/event bus ou manter composição imperativa?
- **Consultas lineares:** `getElementByAtomicNumber` e `searchElements` percorrem o array. Na Fase 2, o parser vai precisar de busca por símbolo com frequência; vale criar `Map` de símbolo/número agora ou otimizar depois?
- **Licença dos dados:** `elements.json` é CC BY-SA 3.0 e o código é MIT. A atribuição está no README, no rodapé e em `src/data/README.md`. Há algo a melhorar nessa separação?
- **`tests/smoke.test.ts`** ainda é temporário e deve ser removido/substituído na Fase 2.
- **GitHub Pages** ainda não configurado; na Fase 5 o `base` do Vite deve ser `/projeto/`.
- **Branch mesclada:** `feat/phase-1-periodic-table` foi integrada à `main`; pode ser removida do `origin` depois.

## 7. Como usar este documento

1. O OpenCode atualiza este arquivo ao final de cada etapa relevante, com dados reais.
2. O usuário copia o conteúdo e cola na conversa com o Claude.
3. O Claude retorna a revisão; o OpenCode compara com o código existente e com o `AGENTS.md`, explica benefícios e riscos e pede aprovação antes de implementar mudanças significativas.
