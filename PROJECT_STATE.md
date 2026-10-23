# PROJECT_STATE — chem-toolkit

> Estado atual do projeto, mantido pelo OpenCode e atualizado ao final de cada etapa relevante.
> Fonte principal de regras e planejamento: `AGENTS.md`.
> Resumo para o consultor externo: `docs/CLAUDE_HANDOFF.md`.

## Visão geral

| Campo | Valor |
|---|---|
| Projeto | chem-toolkit — Tabela Periódica Interativa e Ferramentas de Química |
| Versão | 0.0.0 (pré-v1.0) |
| Stack | Node.js 24 (LTS) + npm 11, Vite 8 + TypeScript 6 (sem framework), Vitest 5, ESLint 10 + Prettier 3 |
| Publicação | GitHub Pages via GitHub Actions (planejado para a Fase 5) |
| Repositório | https://github.com/wenderson-hgs/projeto (nome do repositório: `projeto`) |
| Branch principal | `main` (Fases 1 e 2 publicadas; Fase 2 mesclada por fast-forward até `f195c1f`, seguida deste commit de documentação) |
| Branch de trabalho | nenhuma ativa; `feat/phase-2-molar-mass` mesclada e publicada (Fase 3 a planejar) |
| Demo | ainda não publicada |

## Fase em andamento

**Fase 2 — Massa molar concluída, revisada pelo usuário e mesclada na `main`.**

> As Fases 0, 1 e 2 estão publicadas na `main`. A Fase 2 adiciona o parser de fórmulas, o cálculo de massa molar e a composição percentual. A próxima etapa é a Fase 3 — Balanceador de equações, que precisa ser planejada e aprovada antes de qualquer edição.

## Checklist de fases

### Fase 0 — Preparação
- [x] Verificar pré-requisitos (seção 3) — Node v24.21.0, npm 11.19.0, Git 2.55.0; `user.name` e `user.email` configurados
- [x] Criar o projeto Vite + TypeScript (template vanilla) e configurar Vitest, ESLint e Prettier
- [x] Criar `.gitignore` (inclui `node_modules` e `dist`), `LICENSE` (MIT) e um `README.md` inicial
- [x] `git init`, primeiro commit, criar o repositório no GitHub e fazer o primeiro push (com a minha confirmação) — repositório criado, branch de teste revisada e `main` publicada

### Fase 1 — Tabela periódica (MVP)
- [x] `src/data/elements.json` com os 118 elementos: número atômico, símbolo, nome em português e em inglês, massa atômica, categoria, grupo, período e posição (linha/coluna) no layout
- [x] Renderizar a tabela em CSS Grid, com cores por categoria e legenda
- [x] Clicar em um elemento abre um painel com os detalhes
- [x] Busca por nome, símbolo ou número e filtro por categoria
- [x] Navegação por teclado e layout responsivo (celular)

### Fase 2 — Massa molar
- [x] Parser de fórmulas: `H2O`, `Ca(OH)2`, `Fe2(SO4)3`, `K4[Fe(CN)6]` (parênteses e colchetes aninhados) e hidratos como `CuSO4·5H2O` (aceitar `·`, `.` e `*`)
- [x] Massa molar total + composição percentual por elemento
- [x] Mensagens de erro claras (símbolo desconhecido, parêntese sem fechar, fórmula vazia)
- [x] Testes unitários com os casos da seção 6

### Fase 3 — Balanceador de equações
- [ ] Entrada como `Fe + O2 -> Fe2O3` (aceitar `->`, `=` e `→`)
- [ ] Algoritmo: montar a matriz de composição e achar o espaço nulo com **frações exatas** (sem ponto flutuante), depois escalar para os menores inteiros
- [ ] Tratar casos sem solução ou com infinitas soluções, com mensagem clara
- [ ] Testes unitários com os casos da seção 6

### Fase 4 — Quiz
- [ ] Modos: símbolo → nome, nome → símbolo e categoria do elemento
- [ ] Pontuação e recorde salvos no `localStorage`

### Fase 5 — Polimento e publicação
- [ ] Tema claro/escuro e acessibilidade básica (contraste, foco visível, `aria-label`)
- [ ] README completo: descrição, prints ou GIF, como rodar, fonte e licença dos dados
- [ ] Deploy no GitHub Pages com GitHub Actions (atenção: o `base` do Vite precisa ser `/projeto/`, pois esse é o nome do repositório)
- [ ] Tag e release `v1.0.0`

## Histórico de etapas concluídas

| Data | Etapa | O que foi feito |
|---|---|---|
| 2026-10-23 | Fluxo de trabalho | Criados `PROJECT_STATE.md` e `docs/CLAUDE_HANDOFF.md` para documentar estado e handoff com o Claude. Nenhum código de aplicação criado. |
| 2026-10-23 | Fase 0 — Preparação | Pré-requisitos verificados. Template Vite 8 + TypeScript 6 (vanilla) criado. Instalados Vitest 5, ESLint 10, Prettier 3 e dependências auxiliares. Configurados scripts (`test`, `test:watch`, `lint`, `format`), `vitest.config.ts`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.gitignore`, `LICENSE` (MIT) e `README.md` inicial. Criado `tests/smoke.test.ts`. Repositório Git inicializado e commits `8026282` e `dce96eb` criados. |
| 2026-10-23 | Publicação e merge da Fase 0 | Repositório `https://github.com/wenderson-hgs/projeto` conectado como `origin`. Histórico remoto (`Initial commit` com README mínimo) integrado à branch `test/phase-0-bootstrap`, mantendo o nosso `README.md`. Branch revisada pelo usuário e merge fast-forward na `main` (`3d6e034`), seguido do commit `5790db8` (nome do projeto no `package-lock.json`). `main` enviada ao GitHub. |
| 2026-10-23 | Fase 1 — Etapa 1: dados | Dataset original (119 entradas) filtrado para 118 elementos. Licença CC BY-SA 3.0 confirmada no repositório de origem. Nomes `pt-br` obtidos do Wikidata (CC0), com fallback para `pt`. Categorias normalizadas em 9 grupos; massas aproximadas marcadas. Criados `src/data/elements.json`, `src/data/README.md`, `src/lib/elements.ts` e `tests/elements.test.ts`. Commit `c87e66a`. |
| 2026-10-23 | Fase 1 — Etapa 2: tabela | Criadas a grade CSS de 18 colunas, as 118 células, os placeholders dos lantanídeos/actinídeos e a legenda de categorias. Substituída a página de exemplo do Vite por `src/main.ts` próprio e removidos os arquivos de demonstração. Criados `src/styles/base.css`, `src/styles/table.css` e `src/ui/periodic-table.ts`. Commit `8415a94`. |
| 2026-10-23 | Fase 1 — Etapa 3: interação | Criados o painel de detalhes, a barra de busca/filtro, a navegação por setas e os estilos responsivos. A tabela agora marca a célula selecionada, fecha o painel com `Esc`, ignora células filtradas na navegação e exibe contagem de resultados. Testes ampliados para busca combinada e consulta por número atômico. Commit `6c311ad`. |
| 2026-10-23 | Fase 1 — revisão e merge | Branch revisada pelo usuário e mesclada por fast-forward na `main` (até `4c72f8a`), seguida do commit de documentação. Checks repetidos na `main`: 23 testes, build e lint sem erros. |
| 2026-10-23 | Fase 2 — Etapa 1: lógica | Criados o parser recursivo de fórmulas e o cálculo de massa molar/composição em `src/lib/molar-mass.ts`. Adicionado `getElementBySymbol()` com `Map` em `src/lib/elements.ts`. Removido o teste temporário `tests/smoke.test.ts`. Testes ampliados para 56 casos. Commit `fa29aca`. |
| 2026-10-23 | Fase 2 — Etapa 2: interface | Criada a seção da calculadora em `src/ui/molar-mass.ts`, com exemplos clicáveis, resultado, composição percentual, aviso de massa aproximada e mensagens de erro. Integrada abaixo da tabela em `src/main.ts`, com estilos em `src/styles/calculator.css`. Commit `c3e471e`. |
| 2026-10-23 | Fase 2 — Etapa 3: validação e documentação | README, `PROJECT_STATE.md`, `docs/CLAUDE_HANDOFF.md` e checklist do `AGENTS.md` atualizados. Checks finais: 56 testes, build e lint sem erros. |
| 2026-10-23 | Fase 2 — revisão e merge | Usuário testou e aprovou a calculadora. Branch `feat/phase-2-molar-mass` publicada e mesclada por fast-forward na `main` (até `f195c1f`). Checks repetidos na `main`: 56 testes, build e lint sem erros. |

## Pendências

- Planejar e aprovar a Fase 3 — Balanceador de equações antes de editar arquivos.
- Remover as branches de trabalho já mescladas (`feat/phase-1-periodic-table`, `feat/phase-2-molar-mass` e `test/phase-0-bootstrap`) quando o usuário quiser.

## Decisões importantes

| Data | Decisão | Justificativa |
|---|---|---|
| 2026-10-23 | `AGENTS.md` permanece como fonte principal de regras e planejamento | Evita duplicação e divergência entre documentos. |
| 2026-10-23 | `PROJECT_STATE.md` centraliza o estado real (fases, decisões, testes) | Permite saber rapidamente onde o projeto está. |
| 2026-10-23 | `docs/CLAUDE_HANDOFF.md` é o único documento colado no chat com o Claude | O Claude não tem acesso aos arquivos locais; o resumo precisa ser autocontido. |
| 2026-10-23 | Sugestões do Claude não são aplicadas automaticamente | Antes de implementar, o OpenCode compara com o código existente e com o `AGENTS.md`, explica benefícios e riscos e pede aprovação. |
| 2026-10-23 | Raiz do repositório é a pasta atual (`projeto 1`) | O `AGENTS.md` já está aqui e nada precisa ser movido. |
| 2026-10-23 | Nome do repositório remoto: `projeto` | Nome escolhido pelo usuário ao criar o repositório no GitHub. Impacto futuro: o `base` do Vite no GitHub Pages deverá ser `/projeto/`. |
| 2026-10-23 | Template Vite gerado em pasta temporária e copiado para a raiz | Evita que o `create-vite` apague `AGENTS.md`, `PROJECT_STATE.md` e `docs/` em pasta não vazia. |
| 2026-10-23 | `tests/smoke.test.ts` temporário | Teste da Fase 0 para validar o Vitest; foi removido na Fase 2, quando os testes reais passaram a cobrir os dados e a calculadora. |
| 2026-10-23 | `tsconfig.json` inclui `src` e `tests` | Permite que `tsc` (rodado no build) também verifique os tipos dos testes. |
| 2026-10-23 | Revisão em branch de teste antes da `main` | Permite ao usuário conferir cada fase no GitHub antes de publicar na branch principal. |
| 2026-10-23 | README remoto inicial substituído pelo nosso | O GitHub criou `# projeto`; o nosso README é completo e é a versão oficial do projeto. |
| 2026-10-23 | Dataset de origem: Bowserinator/Periodic-Table-JSON (CC BY-SA 3.0) | Era o conjunto mais completo e com licença localizável; `elements.json` é derivado e distribuído sob CC BY-SA 3.0, enquanto o código permanece MIT. O elemento hipotético 119 foi excluído. |
| 2026-10-23 | Nomes em português do Brasil via rótulos `pt-br` do Wikidata (CC0) | Os rótulos `pt` do Wikidata usam português europeu (`azoto`, `hidrogénio`); `pt-br` entrega a grafia brasileira (`nitrogênio`, `hidrogênio`). |
| 2026-10-23 | Categorias normalizadas em 9 grupos, com `categoryIsPredicted` | O dataset original tem 14 rótulos, incluindo categorias incertas de elementos superpesados. A UI usa 9 grupos e marca os previstos com `*`. |
| 2026-10-23 | Massas aproximadas usam o isótopo mais estável e aparecem entre colchetes | Elementos sem massa padrão da IUPAC não devem ser exibidos como se tivessem massa exata; `atomicMassIsApproximate` documenta o caso. |
| 2026-10-23 | Filtro esmaece/desabilita células em vez de removê-las do grid | Preserva o layout da tabela e a posição espacial dos elementos; a navegação por setas pula células desabilitadas. |
| 2026-10-23 | Painel de detalhes fixo no canto inferior direito e bottom sheet no celular | Mantém a tabela visível no desktop e evita cobrir a tela toda em telas pequenas. `Esc` e o botão "Fechar" encerram; clicar de novo no mesmo elemento também fecha. |
| 2026-10-23 | Busca e filtro são combinados (busca primeiro, categoria depois) | Permite refinar rapidamente, por exemplo, "argônio" dentro de "Gás nobre"; a contagem de resultados é anunciada em `role="status"`. |
| 2026-10-23 | Parser recursivo descendente em `src/lib/molar-mass.ts`, sem biblioteca de química | Atende ao `AGENTS.md`, é testável sem navegador e cobre parênteses/colchetes aninhados e hidratos. |
| 2026-10-23 | Espaços internos são ignorados e `·`, `.` e `*` separam hidratos | Facilita colar fórmulas com espaços e aceitar as três grafias de hidrato pedidas. Coeficientes de hidrato são aplicados à molécula inteira (`5H2O` = 5 × H2O). |
| 2026-10-23 | Coeficiente no início da fórmula é rejeitado | `2H2O` é uma quantidade de matéria, não a fórmula de um composto; a calculadora recebe apenas a fórmula. Quantidades são inteiros positivos, sem decimais. |
| 2026-10-23 | Erros usam `FormulaError` com `code` e mensagem em português | Permite testar os códigos e exibir mensagens claras diretamente na interface. |
| 2026-10-23 | Resultado mostra composição percentual e aviso de massa aproximada | Transparência sobre a origem das massas e sobre elementos sem massa padrão da IUPAC. |
| 2026-10-23 | Calculadora fica abaixo da tabela, na mesma página | Mantém a navegação simples, sem abas ou rotas, e reaproveita o layout existente. |
| 2026-10-23 | `getElementBySymbol()` usa um `Map` | O parser consulta símbolos com frequência; a busca deixa de ser linear. |
| 2026-10-23 | Valores exibidos com ponto decimal | Mantém consistência com a tabela periódica e com as massas do dataset. |

## Resultados de testes e build

| Data | Etapa | `npm test` | `npm run build` | `npm run lint` |
|---|---|---|---|---|
| 2026-10-23 | Fase 0 (antes do merge) | 1 arquivo, 1 teste passou (Vitest 5.0.5, 575 ms) | sucesso: `tsc` + Vite 8.3.5, 9 módulos, `dist/` gerado em 2,64 s | sem erros |
| 2026-10-23 | Fase 0 (após merge do README remoto) | 1 arquivo, 1 teste passou (Vitest 5.0.5, 432 ms) | sucesso: `tsc` + Vite 8.3.5, 9 módulos, `dist/` gerado em 268 ms | sem erros |
| 2026-10-23 | Fase 1 — Etapa 1 (dados) | 2 arquivos, 18 testes passaram (515 ms) | sucesso: 9 módulos, 194 ms; CSS 4,10 kB / JS 4,49 kB | sem erros |
| 2026-10-23 | Fase 1 — Etapa 2 (tabela) | 2 arquivos, 18 testes passaram (425 ms) | sucesso: 9 módulos, 127 ms; CSS 3,66 kB / JS 30,73 kB | sem erros |
| 2026-10-23 | Fase 1 — Etapa 3 (interação) | 2 arquivos, 23 testes passaram (481 ms) | sucesso: 14 módulos, 242 ms; CSS 6,14 kB / JS 36,23 kB | sem erros |
| 2026-10-23 | Fase 1 — validação na `main` | 2 arquivos, 23 testes passaram (825 ms) | sucesso: 14 módulos, 327 ms; `index.html` 0,65 kB, CSS 6,14 kB / JS 36,23 kB | sem erros |
| 2026-10-23 | Fase 2 — Etapa 1 (lógica) | 2 arquivos, 56 testes passaram (879 ms) | sucesso: 14 módulos, 312 ms; CSS 6,14 kB / JS 36,27 kB | sem erros |
| 2026-10-23 | Fase 2 — Etapa 2 (interface) | 2 arquivos, 56 testes passaram (752 ms) | sucesso: 17 módulos, 307 ms; CSS 8,93 kB / JS 43,69 kB | sem erros |
| 2026-10-23 | Fase 2 — validação na `main` | 2 arquivos, 56 testes passaram (763 ms) | sucesso: 17 módulos, 293 ms; `index.html` 0,65 kB, CSS 8,93 kB / JS 43,69 kB | sem erros |

## Problemas conhecidos, limitações e dúvidas

- A interface (tabela e calculadora) foi validada por `tsc`, build e lint, mas **não tem testes automatizados de navegador** (não há jsdom nem Playwright). A revisão manual no `npm run dev` é necessária.
- O parser não aceita coeficientes estequiométricos no início (`2H2O`) nem quantidades decimais. Coeficientes são aceitos apenas em hidratos, depois de `·`, `.` ou `*`.
- As massas vêm do dataset; por isso `Fe2(SO4)3` resulta em 399,858 g/mol (dentro da tolerância de ±0,05 do `AGENTS.md`, mas diferente do valor arredondado 399,88). Pequenas diferenças em relação a massas convencionais arredondadas são esperadas.
- `src/data/elements.json` é derivado de dataset CC BY-SA 3.0 e continua sob essa licença; o código do projeto é MIT. A distinção está em `src/data/README.md` e no `README.md`.
- As massas de elementos sem massa padrão da IUPAC usam o número de massa do isótopo mais estável e aparecem entre colchetes na tabela; na calculadora, o resultado recebe um aviso de valor aproximado.
- O GitHub Pages ainda não está configurado; o deploy é da Fase 5 e deverá usar `base: '/projeto/'`.
- A branch `test/phase-0-bootstrap` continua no remoto; pode ser removida depois, se o usuário quiser.
- A branch `feat/phase-2-molar-mass` foi mesclada e publicada; a `main` contém a Fase 2.
- A pasta do projeto contém espaços no caminho (`meus projetos\projeto 1`); isso funciona, mas comandos manuais no terminal podem exigir aspas.
- A tabela usa rolagem horizontal em telas estreitas, com dica visível; a legenda, a barra de filtros e a calculadora se reorganizam em uma coluna.

## Próximo passo

Apresentar o plano da Fase 3 — Balanceador de equações e aguardar o "ok" do usuário antes de criar a branch e editar arquivos.
