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
| Branch principal | `main` (Fases 1, 2 e 3 publicadas; último commit `640e77b`) |
| Branch de trabalho | `feat/phase-4-quiz` (Fase 4; commits `9b2235c` e `14610d8`; documentação no commit seguinte) |
| Demo | ainda não publicada |

## Fase em andamento

**Fase 4 — Quiz concluída na branch `feat/phase-4-quiz`, aguardando revisão do usuário antes do merge na `main`.**

> As Fases 0, 1, 2 e 3 estão publicadas na `main`. A Fase 4 adiciona o quiz com três modos, rodadas de 10 perguntas, feedback imediato e pontuação/recorde por modo salvos no `localStorage`.

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
- [x] Entrada como `Fe + O2 -> Fe2O3` (aceitar `->`, `=` e `→`)
- [x] Algoritmo: montar a matriz de composição e achar o espaço nulo com **frações exatas** (sem ponto flutuante), depois escalar para os menores inteiros
- [x] Tratar casos sem solução ou com infinitas soluções, com mensagem clara
- [x] Testes unitários com os casos da seção 6

### Fase 4 — Quiz
- [x] Modos: símbolo → nome, nome → símbolo e categoria do elemento
- [x] Pontuação e recorde salvos no `localStorage`

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
| 2026-10-23 | Fase 3 — Etapa 1: lógica | Criados o parser de equações e o balanceador em `src/lib/balancer.ts`. A matriz de composição é reduzida por eliminação de Gauss com frações exatas (`bigint`); o espaço nulo é escalado para os menores inteiros com MMC/MDC. Erros com código para equação vazia, seta ausente/múltipla, lado vazio, coeficiente inválido, fórmula inválida, equação impossível, múltiplas soluções, coeficiente zero e solução sem coeficientes positivos. Criados 31 testes em `tests/balancer.test.ts`. Commit `a33db2d`. |
| 2026-10-23 | Fase 3 — Etapa 2: interface | Criada a seção do balanceador em `src/ui/balancer.ts`, com exemplos clicáveis, resultado, mensagens de erro acessíveis e layout responsivo em `src/styles/balancer.css`. Integrada abaixo da calculadora em `src/main.ts`; subtítulo atualizado. Commit `d5e2547`. |
| 2026-10-23 | Fase 3 — Etapa 3: validação e documentação | README, `PROJECT_STATE.md`, `docs/CLAUDE_HANDOFF.md` e checklist do `AGENTS.md` atualizados. Checks finais: 87 testes, build e lint sem erros. |
| 2026-10-23 | Fase 3 — revisão e merge | Usuário aprovou o balanceador. Branch `feat/phase-3-equation-balancer` publicada e mesclada por fast-forward na `main` (até `806c2e8`). Checks repetidos na `main`: 87 testes, build e lint sem erros. |
| 2026-10-23 | Fase 4 — Etapa 1: lógica | Criados `src/lib/quiz.ts` (três modos, rodadas de 10 perguntas, 4 alternativas, RNG injetável) e `src/lib/quiz-storage.ts` (última pontuação e recorde por modo no `localStorage`, com acesso protegido). Criados 15 testes em `tests/quiz.test.ts`. Commit `9b2235c`. |
| 2026-10-23 | Fase 4 — Etapa 2: interface | Criada a seção do quiz em `src/ui/quiz.ts`, com escolha de modo, rodada, feedback imediato, resultado, recorde e foco acessível. Estilos em `src/styles/quiz.css`; integrada abaixo do balanceador em `src/main.ts`. Commit `14610d8`. |
| 2026-10-23 | Fase 4 — Etapa 3: validação e documentação | README, `PROJECT_STATE.md`, `docs/CLAUDE_HANDOFF.md` e checklist do `AGENTS.md` atualizados. Checks finais: 102 testes, build e lint sem erros. |

## Pendências

- Revisar a branch `feat/phase-4-quiz` no GitHub e testar o quiz localmente.
- Após aprovação, fazer o merge da Fase 4 na `main` e publicar.
- Remover as branches de trabalho já mescladas (`feat/phase-1-periodic-table`, `feat/phase-2-molar-mass`, `feat/phase-3-equation-balancer`, `feat/phase-4-quiz` e `test/phase-0-bootstrap`) quando o usuário quiser.

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
| 2026-10-23 | Balanceador usa frações exatas com `bigint` e eliminação de Gauss | Evita erros de arredondamento de ponto flutuante e garante os menores coeficientes inteiros. A matriz é pequena, então o custo é irrelevante. |
| 2026-10-23 | Coeficientes digitados na equação são validados, mas ignorados | O balanceador sempre recalcula os menores inteiros; isso corrige coeficientes errados e mantém a entrada simples. |
| 2026-10-23 | Equações com coeficiente zero ou com múltiplas soluções geram erro | Um coeficiente zero indica composto que não participa; múltiplas soluções tornam o resultado ambíguo. Mensagens claras evitam resultados enganosos. |
| 2026-10-23 | `BalanceError` com código e mensagem em português | Consistente com `FormulaError`; permite testar os casos e exibir mensagens diretas na interface. |
| 2026-10-23 | Fórmulas de cada termo são validadas por `parseFormula()` | Reaproveita grupos, colchetes aninhados e hidratos, além de validar símbolos contra o dataset. |
| 2026-10-23 | Balanceador fica abaixo da calculadora, na mesma página | Mantém a navegação simples, sem abas ou rotas, seguindo o padrão da Fase 2. |
| 2026-10-23 | Quiz com rodadas de 10 perguntas e 4 alternativas | Rodada curta, com feedback imediato e resultado claro; quatro opções equilibram dificuldade e leitura no celular. |
| 2026-10-23 | Distratores vêm do mesmo domínio da pergunta | Nomes, símbolos ou categorias, conforme o modo; evita alternativas fáceis de eliminar por formato. |
| 2026-10-23 | Gerador de perguntas recebe função aleatória injetável | Permite testes determinísticos sem depender do `Math.random`. |
| 2026-10-23 | Pontuação e recorde por modo no `localStorage` | Cada modo tem dificuldade própria; separar os recordes é mais justo. Acesso protegido com `try/catch` para navegação privada. |
| 2026-10-23 | Foco movido para a pergunta e para o resultado | Leitores de tela ouvem a pergunta completa e a pontuação final; o feedback usa `role="status"`. |

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
| 2026-10-23 | Fase 3 — Etapa 1 (lógica) | 3 arquivos, 87 testes passaram (1,18 s) | sucesso: 17 módulos, 335 ms; CSS 8,93 kB / JS 43,69 kB | sem erros |
| 2026-10-23 | Fase 3 — Etapa 2 (interface) | 3 arquivos, 87 testes passaram (792 ms) | sucesso: 20 módulos, 249 ms; CSS 10,98 kB / JS 50,68 kB | sem erros |
| 2026-10-23 | Fase 3 — Etapa 3 (documentação) | 3 arquivos, 87 testes passaram (784 ms) | sucesso: 20 módulos, 237 ms; CSS 10,98 kB / JS 50,68 kB | sem erros |
| 2026-10-23 | Fase 3 — validação na `main` | 3 arquivos, 87 testes passaram (693 ms) | sucesso: 20 módulos, 302 ms; `index.html` 0,65 kB, CSS 10,98 kB / JS 50,68 kB | sem erros |
| 2026-10-23 | Fase 4 — Etapa 1 (lógica) | 4 arquivos, 102 testes passaram (783 ms) | não executado nesta etapa (interface ainda não integrada) | não executado nesta etapa |
| 2026-10-23 | Fase 4 — Etapa 2 (interface) | 4 arquivos, 102 testes passaram (1,12 s) | sucesso: 24 módulos, 332 ms; CSS 14,08 kB / JS 56,91 kB | sem erros |
| 2026-10-23 | Fase 4 — Etapa 3 (documentação) | 4 arquivos, 102 testes passaram (872 ms) | sucesso: 24 módulos, 332 ms; CSS 14,08 kB / JS 56,91 kB | sem erros |

## Problemas conhecidos, limitações e dúvidas

- A interface (tabela, calculadora, balanceador e quiz) foi validada por `tsc`, build e lint, mas **não tem testes automatizados de navegador** (não há jsdom nem Playwright). A revisão manual no `npm run dev` é necessária.
- O parser não aceita coeficientes estequiométricos no início (`2H2O`) nem quantidades decimais. Coeficientes são aceitos apenas em hidratos, depois de `·`, `.` ou `*`.
- As massas vêm do dataset; por isso `Fe2(SO4)3` resulta em 399,858 g/mol (dentro da tolerância de ±0,05 do `AGENTS.md`, mas diferente do valor arredondado 399,88). Pequenas diferenças em relação a massas convencionais arredondadas são esperadas.
- `src/data/elements.json` é derivado de dataset CC BY-SA 3.0 e continua sob essa licença; o código do projeto é MIT. A distinção está em `src/data/README.md` e no `README.md`.
- As massas de elementos sem massa padrão da IUPAC usam o número de massa do isótopo mais estável e aparecem entre colchetes na tabela; na calculadora, o resultado recebe um aviso de valor aproximado.
- O GitHub Pages ainda não está configurado; o deploy é da Fase 5 e deverá usar `base: '/projeto/'`.
- A branch `test/phase-0-bootstrap` continua no remoto; pode ser removida depois, se o usuário quiser.
- A branch `feat/phase-4-quiz` ainda não foi publicada no momento desta atualização; a `main` contém as Fases 1, 2 e 3.
- O balanceador não trata cargas iônicas nem equações redox com íons (ex.: `Fe2+`); o escopo atual cobre fórmulas neutras.
- Coeficientes digitados pelo usuário são ignorados no cálculo; o resultado sempre usa os menores inteiros. Equações com coeficiente zero, múltiplas soluções ou sem solução positiva são rejeitadas com mensagem clara.
- O quiz usa 10 perguntas por rodada e 4 alternativas; não há níveis de dificuldade nem limite de tempo.
- A pontuação e o recorde do quiz ficam no `localStorage` do navegador: limpar os dados do site ou trocar de dispositivo zera o histórico. Em navegação privada, o quiz funciona, mas o recorde pode não persistir.
- A pasta do projeto contém espaços no caminho (`meus projetos\projeto 1`); isso funciona, mas comandos manuais no terminal podem exigir aspas.
- A tabela usa rolagem horizontal em telas estreitas, com dica visível; a legenda, a barra de filtros, a calculadora, o balanceador e o quiz se reorganizam em uma coluna.

## Próximo passo

Enviar `feat/phase-4-quiz` ao GitHub e pedir ao usuário para revisar o quiz e o diff. Após aprovação, fazer o merge na `main` e só então planejar a Fase 5 — Polimento e publicação.
