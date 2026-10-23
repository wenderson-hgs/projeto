# chem-toolkit — Tabela Periódica Interativa e Ferramentas de Química

> Arquivo de contexto para o OpenCode. Leia tudo antes de agir e releia a seção da fase atual sempre que começar uma nova fase.

## 1. Objetivo

Criar um site estático (sem backend) com:

1. Tabela periódica interativa com os 118 elementos
2. Calculadora de massa molar (aceita fórmulas como `Ca(OH)2`)
3. Balanceador de equações químicas
4. Modo quiz

Este é o meu **primeiro projeto publicado no GitHub**, com demo online no GitHub Pages. A prioridade é **terminar uma versão 1.0 pequena e funcionando** antes de qualquer extra.

## 2. Como quero trabalhar com você

- Responda em **português do Brasil**. Explique *o que* está fazendo e *por quê*, em linguagem simples. Estou aprendendo.
- Código, nomes de arquivos/variáveis e mensagens de commit em **inglês**. Interface do site e README em **português**. Comentários no código em português, só onde o motivo não for óbvio.
- Trabalhe **uma fase por vez**. Antes de editar arquivos, mostre um plano curto (arquivos que vai criar/alterar e comandos que vai rodar) e espere o meu "ok".
- Passos pequenos e testáveis. Depois de cada etapa, rode `npm run build` e `npm test` e me diga o resultado.
- **Avise antes de instalar qualquer coisa** (programa ou dependência), dizendo o motivo. Não adicione dependências fora da seção 3 sem perguntar.
- Não use bibliotecas prontas de química para o parser de fórmulas nem para o balanceador: quero implementar e entender a lógica.
- Não migre para framework (React, Vue etc.) e não crie backend, a menos que eu peça.
- Nunca comite segredos (tokens, chaves, `.env`). Não rode comandos destrutivos (`rm -rf`, `git reset --hard`, `git push --force`) sem pedir confirmação.
- Commits pequenos, no padrão Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`). Peça minha confirmação antes de `git push`.
- Se algo estiver ambíguo, pergunte (uma pergunta por vez) em vez de adivinhar.
- Ao terminar cada fase: resuma o que foi feito, diga como testar manualmente, marque os itens no checklist da seção 5 e sugira o commit.

## 3. Stack

- Node.js (versão LTS) + npm
- Vite + TypeScript, sem framework (HTML, CSS e TS puros)
- Vitest para testes unitários
- ESLint + Prettier com configuração simples
- Git + GitHub (GitHub CLI `gh` opcional) e GitHub Pages via GitHub Actions

Pré-requisitos: confira `node -v`, `npm -v` e `git --version`. Se faltar algo, me diga como instalar no meu sistema operacional **antes** de continuar.

## 4. Estrutura sugerida

```text
chem-toolkit/
├─ AGENTS.md
├─ README.md
├─ LICENSE
├─ index.html
├─ src/
│  ├─ main.ts
│  ├─ data/elements.json
│  ├─ lib/        # parser de fórmulas, massa molar, balanceador
│  ├─ ui/         # tabela, painel de detalhes, calculadora, balanceador, quiz
│  └─ styles/
└─ tests/
```

Mantenha a lógica de química em `src/lib/` **separada da interface**, para testar sem navegador (e reaproveitar depois).

## 5. Fases (marque [x] ao concluir)

### Fase 0 — Preparação
- [x] Verificar pré-requisitos (seção 3)
- [x] Criar o projeto Vite + TypeScript (template vanilla) e configurar Vitest, ESLint e Prettier
- [x] Criar `.gitignore` (inclua `node_modules` e `dist`), `LICENSE` (MIT) e um `README.md` inicial
- [x] `git init`, primeiro commit, criar o repositório no GitHub e fazer o primeiro push (com a minha confirmação)

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
- [ ] Deploy no GitHub Pages com GitHub Actions (atenção: o `base` do Vite precisa ser `/nome-do-repositorio/`)
- [ ] Tag e release `v1.0.0`

## 6. Dados e casos de teste

**Dados dos elementos**
- Não invente valores. Use um dataset aberto (por exemplo, o repositório Periodic-Table-JSON no GitHub; confirme a licença antes) e cite a fonte e a licença no README.
- Use massas atômicas convencionais (IUPAC), exibidas com 3 casas decimais.
- Depois de montar o JSON, confira manualmente alguns elementos (H, C, O, Fe, Au) e me avise sobre qualquer dúvida.
- Nomes em português do Brasil com a grafia oficial; guarde também o nome em inglês (`nameEn`) para facilitar a busca.

**Massa molar** (tolerância de ±0,05 g/mol; no código, use ponto decimal)

| Fórmula | Massa molar esperada |
|---|---|
| H2O | ≈ 18,015 |
| NaCl | ≈ 58,44 |
| Ca(OH)2 | ≈ 74,09 |
| C6H12O6 | ≈ 180,16 |
| Fe2(SO4)3 | ≈ 399,88 |
| CuSO4·5H2O | ≈ 249,68 |

**Balanceamento**

| Entrada | Resultado esperado |
|---|---|
| H2 + O2 -> H2O | 2 H2 + O2 -> 2 H2O |
| Fe + O2 -> Fe2O3 | 4 Fe + 3 O2 -> 2 Fe2O3 |
| C3H8 + O2 -> CO2 + H2O | C3H8 + 5 O2 -> 3 CO2 + 4 H2O |
| Al + HCl -> AlCl3 + H2 | 2 Al + 6 HCl -> 2 AlCl3 + 3 H2 |
| KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2 | 2 KMnO4 + 16 HCl -> 2 KCl + 2 MnCl2 + 8 H2O + 5 Cl2 |
| H2 -> O2 | erro claro (equação impossível) |

## 7. Publicar no GitHub

1. Confirme `git config user.name` e `user.email`; se usar `gh`, confira `gh auth status`.
2. Crie o repositório público `chem-toolkit` (ou o nome que eu escolher) e conecte ao remoto.
3. Configure o deploy: workflow do GitHub Actions que roda `npm ci`, `npm test`, `npm run build` e publica a pasta `dist` no GitHub Pages. Em Settings → Pages, a fonte (Source) deve ser **GitHub Actions**; me guie nesse passo.
4. Depois do deploy, coloque o link da demo no topo do README e na descrição do repositório.

## 8. Resumo para o Claude

Eu uso o Claude como consultor externo de arquitetura e revisão. Ele **não tem acesso aos arquivos**, então eu colo aqui o que você gerar. Ao fim de cada fase, ou quando eu pedir "resumo para o Claude", gere um texto curto, pronto para copiar e colar, com:

1. Fase concluída e o que foi implementado (3 a 6 linhas)
2. Árvore de arquivos (só pastas e arquivos principais)
3. Decisões de design e assinaturas das funções/tipos principais (sem colar arquivos inteiros)
4. Resultado de `npm test` e `npm run build`
5. Dúvidas ou pontos que você quer que o Claude revise

## 9. Depois da v1.0 (só se eu pedir)

- Expor `src/lib/` como servidor MCP para o próprio OpenCode usar
- Versão PWA/offline e README em inglês
- Mais ferramentas: estequiometria, pH, conversão de unidades

## 10. Primeira tarefa

Comece pela **Fase 0**: mostre o plano e espere o meu "ok" antes de criar ou alterar qualquer arquivo.
