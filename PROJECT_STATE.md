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
| Repositório | ainda não criado no GitHub |
| Demo | ainda não publicada |

## Fase em andamento

**Fase 0 — Preparação** (concluída localmente; falta criar o repositório no GitHub e fazer o primeiro push, com confirmação do usuário)

## Checklist de fases

### Fase 0 — Preparação
- [x] Verificar pré-requisitos (seção 3) — Node v24.21.0, npm 11.19.0, Git 2.55.0; `user.name` e `user.email` configurados
- [x] Criar o projeto Vite + TypeScript (template vanilla) e configurar Vitest, ESLint e Prettier
- [x] Criar `.gitignore` (inclui `node_modules` e `dist`), `LICENSE` (MIT) e um `README.md` inicial
- [ ] `git init`, primeiro commit, criar o repositório no GitHub e fazer o primeiro push (com a minha confirmação) — `git init` e primeiro commit (`8026282`) concluídos; repositório e push pendentes de confirmação

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
- [ ] Deploy no GitHub Pages com GitHub Actions (atenção: o `base` do Vite precisa ser `/nome-do-repositorio/`)
- [ ] Tag e release `v1.0.0`

## Histórico de etapas concluídas

| Data | Etapa | O que foi feito |
|---|---|---|
| 2026-10-23 | Fluxo de trabalho | Criados `PROJECT_STATE.md` e `docs/CLAUDE_HANDOFF.md` para documentar estado e handoff com o Claude. Nenhum código de aplicação criado. |
| 2026-10-23 | Fase 0 — Preparação | Pré-requisitos verificados. Template Vite 8 + TypeScript 6 (vanilla) criado. Instalados Vitest 5, ESLint 10, Prettier 3 e dependências auxiliares. Configurados scripts (`test`, `test:watch`, `lint`, `format`), `vitest.config.ts`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.gitignore`, `LICENSE` (MIT) e `README.md` inicial. Criado `tests/smoke.test.ts`. Repositório Git inicializado e primeiro commit `8026282` criado. |

## Pendências

- Criar o repositório `chem-toolkit` no GitHub e fazer o primeiro push (com confirmação do usuário).
- Iniciar a Fase 1 — Tabela periódica (MVP).

## Decisões importantes

| Data | Decisão | Justificativa |
|---|---|---|
| 2026-10-23 | `AGENTS.md` permanece como fonte principal de regras e planejamento | Evita duplicação e divergência entre documentos. |
| 2026-10-23 | `PROJECT_STATE.md` centraliza o estado real (fases, decisões, testes) | Permite saber rapidamente onde o projeto está. |
| 2026-10-23 | `docs/CLAUDE_HANDOFF.md` é o único documento colado no chat com o Claude | O Claude não tem acesso aos arquivos locais; o resumo precisa ser autocontido. |
| 2026-10-23 | Sugestões do Claude não são aplicadas automaticamente | Antes de implementar, o OpenCode compara com o código existente e com o `AGENTS.md`, explica benefícios e riscos e pede aprovação. |
| 2026-10-23 | Raiz do repositório é a pasta atual (`projeto 1`) | O `AGENTS.md` já está aqui e nada precisa ser movido; o nome do repositório no GitHub será `chem-toolkit`. |
| 2026-10-23 | Template Vite gerado em pasta temporária e copiado para a raiz | Evita que o `create-vite` apague `AGENTS.md`, `PROJECT_STATE.md` e `docs/` em pasta não vazia. |
| 2026-10-23 | `tests/smoke.test.ts` temporário | Prova que o Vitest funciona; será substituído pelos testes reais na Fase 2. |
| 2026-10-23 | `tsconfig.json` inclui `src` e `tests` | Permite que `tsc` (rodado no build) também verifique os tipos dos testes. |

## Resultados de testes e build

| Data | Etapa | `npm test` | `npm run build` | `npm run lint` |
|---|---|---|---|---|
| 2026-10-23 | Fase 0 | 1 arquivo, 1 teste passou (Vitest 5.0.5, 575 ms) | sucesso: `tsc` + Vite 8.3.5, 9 módulos, `dist/` gerado em 2,64 s | sem erros |

## Problemas conhecidos, limitações e dúvidas

- O `index.html` e `src/main.ts` ainda mostram a página de exemplo do Vite; serão substituídos na Fase 1.
- O teste `tests/smoke.test.ts` é apenas uma verificação da ferramenta e será removido/substituído na Fase 2.
- O repositório remoto ainda não existe; o push depende da confirmação do usuário.
- A pasta do projeto contém espaços no caminho (`read me\projeto 1`); isso funciona, mas comandos manuais no terminal podem exigir aspas.

## Próximo passo

Criar o repositório `chem-toolkit` no GitHub, conectar o remoto e fazer o primeiro push (somente após confirmação explícita do usuário). Depois, iniciar a Fase 1 — Tabela periódica (MVP).
