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
| Publicação | GitHub Pages via GitHub Actions (planejado) |
| Repositório | https://github.com/wenderson-hgs/projeto (nome do repositório: `projeto`) |
| Branch principal | `main` (Fase 0 publicada) |
| Demo | ainda não publicada |

## Fase em andamento

**Fase 1 — Tabela periódica (MVP)** (não iniciada)

> Fase 0 concluída e publicada na `main`.

## Checklist de fases

### Fase 0 — Preparação
- [x] Verificar pré-requisitos (seção 3) — Node v24.21.0, npm 11.19.0, Git 2.55.0; `user.name` e `user.email` configurados
- [x] Criar o projeto Vite + TypeScript (template vanilla) e configurar Vitest, ESLint e Prettier
- [x] Criar `.gitignore` (inclui `node_modules` e `dist`), `LICENSE` (MIT) e um `README.md` inicial
- [x] `git init`, primeiro commit, criar o repositório no GitHub e fazer o primeiro push (com a minha confirmação) — repositório criado, branch de teste revisada e `main` publicada

### Fase 1 — Tabela periódica (MVP)
- [ ] `src/data/elements.json` com os 118 elementos: número atômico, símbolo, nome em português e em inglês, massa atômica, categoria, grupo, período e posição (linha/coluna) no layout
- [ ] Renderizar a tabela em CSS Grid, com cores por categoria e legenda
- [ ] Clicar em um elemento abre um painel com os detalhes
- [ ] Busca por nome, símbolo ou número e filtro por categoria
- [ ] Navegação por teclado e layout responsivo (celular)

### Fase 2 — Massa molar
- [ ] Parser de fórmulas: `H2O`, `Ca(OH)2`, `Fe2(SO4)3`, `K4[Fe(CN)6]` (parênteses e colchetes aninhados) e hidratos como `CuSO4·5H2O` (aceitar `·`, `.` e `*`)
- [ ] Massa molar total + composição percentual por elemento
- [ ] Mensagens de erro claras (símbolo desconhecido, parêntese sem fechar, fórmula vazia)
- [ ] Testes unitários com os casos da seção 6

### Fase 3 — Balanceador de equações
- [ ] Entrada como `Fe + O2 -> Fe2O3` (aceitar `->`, `=` e `→`)
- [ ] Algoritmo: montar a matriz de composição e achar o espaço nulo com frações exatas (sem ponto flutuante), depois escalar para os menores inteiros
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

## Pendências

- Iniciar a Fase 1 — Tabela periódica (MVP).

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
| 2026-10-23 | `tests/smoke.test.ts` temporário | Prova que o Vitest funciona; será substituído pelos testes reais na Fase 2. |
| 2026-10-23 | `tsconfig.json` inclui `src` e `tests` | Permite que `tsc` (rodado no build) também verifique os tipos dos testes. |
| 2026-10-23 | Revisão em branch de teste antes da `main` | Permite ao usuário conferir cada fase no GitHub antes de publicar na branch principal. |
| 2026-10-23 | README remoto inicial substituído pelo nosso | O GitHub criou `# projeto`; o nosso README é completo e é a versão oficial do projeto. |

## Resultados de testes e build

| Data | Etapa | `npm test` | `npm run build` | `npm run lint` |
|---|---|---|---|---|
| 2026-10-23 | Fase 0 (antes do merge) | 1 arquivo, 1 teste passou (Vitest 5.0.5, 575 ms) | sucesso: `tsc` + Vite 8.3.5, 9 módulos, `dist/` gerado em 2,64 s | sem erros |
| 2026-10-23 | Fase 0 (após merge do README remoto) | 1 arquivo, 1 teste passou (Vitest 5.0.5, 432 ms) | sucesso: `tsc` + Vite 8.3.5, 9 módulos, `dist/` gerado em 268 ms | sem erros |

## Problemas conhecidos, limitações e dúvidas

- O `index.html` e `src/main.ts` ainda mostram a página de exemplo do Vite; serão substituídos na Fase 1.
- O teste `tests/smoke.test.ts` é apenas uma verificação da ferramenta e será removido/substituído na Fase 2.
- O GitHub Pages ainda não está configurado; o deploy é da Fase 5 e deverá usar `base: '/projeto/'`.
- A branch `test/phase-0-bootstrap` continua no remoto; pode ser removida depois, se o usuário quiser.
- A pasta do projeto contém espaços no caminho (`read me\projeto 1`); isso funciona, mas comandos manuais no terminal podem exigir aspas.

## Próximo passo

Apresentar o plano da Fase 1 — Tabela periódica (MVP) e aguardar aprovação antes de criar ou alterar arquivos.
