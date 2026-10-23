# CLAUDE_HANDOFF — chem-toolkit

> Resumo técnico pronto para copiar e colar na conversa com o Claude (consultor externo de arquitetura, lógica e revisão).
> O Claude não tem acesso aos arquivos locais; este documento deve ser autocontido.
> Regras e planejamento completos: `AGENTS.md`. Estado detalhado: `PROJECT_STATE.md`.

## Situação atual

- **Etapa:** Fase 0 — Preparação concluída localmente e publicada na branch de teste `test/phase-0-bootstrap`.
- **Repositório:** https://github.com/wenderson-hgs/projeto (a `main` remota ainda está no `Initial commit` do GitHub).
- **Próxima fase:** após revisão/aprovação da branch de teste, merge na `main`; depois Fase 1 — Tabela periódica (MVP).
- **Projeto:** chem-toolkit, site estático (Vite + TypeScript, sem framework) com tabela periódica interativa, calculadora de massa molar, balanceador de equações e quiz.

## 1. Objetivo da etapa e o que foi implementado

A Fase 0 montou a base do projeto: template Vite + TypeScript (vanilla), testes com Vitest, lint/formação com ESLint + Prettier, `.gitignore`, `LICENSE` (MIT) e `README.md` inicial. Também foram criados os arquivos de fluxo de trabalho (`PROJECT_STATE.md` e este handoff). Nenhuma funcionalidade de química foi implementada ainda.

## 2. Arquivos principais alterados

```text
projeto 1/
├─ AGENTS.md
├─ PROJECT_STATE.md
├─ README.md
├─ LICENSE
├─ index.html
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ vite.config.ts          (não existe; o template usa a configuração padrão do Vite)
├─ vitest.config.ts
├─ eslint.config.js
├─ .prettierrc.json
├─ .prettierignore
├─ .gitignore
├─ docs/
│  └─ CLAUDE_HANDOFF.md
├─ public/
│  ├─ favicon.svg
│  └─ icons.svg
├─ src/
│  ├─ main.ts              (ainda é a página de exemplo do Vite)
│  ├─ counter.ts
│  ├─ style.css
│  └─ assets/
└─ tests/
   └─ smoke.test.ts        (temporário)
```

## 3. Implementações realizadas

- Projeto criado com `create-vite` v9.3.1, template `vanilla-ts` (Vite 8.3.5 + TypeScript 6.0.3).
- Dependências de desenvolvimento instaladas: `vitest` 5.0.5, `eslint` 10.13.0, `@eslint/js` 10.0.1, `typescript-eslint` 8.72.0, `eslint-config-prettier` 10.1.8, `prettier` 3.9.10.
- `package.json`: nome alterado para `chem-toolkit`; scripts adicionados:
  - `test`: `vitest run`
  - `test:watch`: `vitest`
  - `lint`: `eslint .`
  - `format`: `prettier --write .`
  - mantidos `dev`, `build` (`tsc && vite build`) e `preview`.
- `vitest.config.ts`: testes em `tests/**/*.test.ts`.
- `eslint.config.js`: flat config com `@eslint/js`, `typescript-eslint` e `eslint-config-prettier`.
- `.prettierrc.json`: `singleQuote: true`, `printWidth: 100`.
- `tsconfig.json`: `include` alterado para `["src", "tests"]`.
- `index.html`: `lang="pt-BR"` e título `chem-toolkit — Ferramentas de Química`.
- `README.md` inicial em português com funcionalidades planejadas, comandos e stack.
- `LICENSE` MIT (titular: Wenderson, 2026).
- Nenhuma dependência de química foi instalada (conforme `AGENTS.md`).

## 4. Assinaturas de funções e tipos relevantes

Ainda não há código de domínio (química). O único teste existente é:

```ts
// tests/smoke.test.ts
describe('smoke test', () => {
  it('runs the test environment', () => {
    expect(1 + 1).toBe(2);
  });
});
```

O restante de `src/` é o exemplo padrão do Vite (`setupCounter` em `src/counter.ts`), que será substituído.

## 5. Decisões de arquitetura e justificativas

| Decisão | Justificativa |
|---|---|
| Raiz do repositório é a pasta atual (`projeto 1`), e não uma subpasta `chem-toolkit/` | O `AGENTS.md` já está aqui; o nome do repositório no GitHub será `chem-toolkit`. |
| Template gerado em pasta temporária e copiado para a raiz | Evita que o `create-vite` apague arquivos existentes em pasta não vazia. |
| `tsc` roda no `build` e inclui `tests` | Verifica tipos do código e dos testes no mesmo comando. |
| `tests/smoke.test.ts` temporário | Valida a ferramenta de testes; será substituído na Fase 2. |
| Lógica de química ficará em `src/lib/`, separada da UI | Permite testar sem navegador, conforme `AGENTS.md`. |
| Nenhuma sugestão do Claude é aplicada automaticamente | O OpenCode compara com o código e com o `AGENTS.md`, explica benefícios e riscos e pede aprovação. |
| Nome do repositório remoto: `projeto` | Escolha do usuário; o `base` do Vite no GitHub Pages deverá ser `/projeto/`. |
| Revisão em branch de teste antes da `main` | Permite ao usuário conferir a Fase 0 no GitHub antes de publicar na branch principal. |

## 6. Resultado real de `npm test` e `npm run build`

Executados em 2026-10-23, na pasta do projeto:

```text
$ npm test
RUN  v5.0.5
Test Files  1 passed (1)
Tests       1 passed (1)
Duration    575ms

$ npm run build
tsc && vite build
vite v8.3.5 building client environment for production...
✓ 9 modules transformed.
✓ built in 2.64s

$ npm run lint
eslint .
(sem erros)
```

O `build` gerou `dist/` com `index.html`, CSS e JS. Nenhum resultado foi declarado sem execução real.

Após integrar o `Initial commit` remoto (merge que só envolveu o `README.md`), os checks foram repetidos:

```text
$ npm test
Test Files  1 passed (1)
Tests       1 passed (1)
Duration    432ms

$ npm run build
✓ 9 modules transformed.
✓ built in 268ms

$ npm run lint
(sem erros)
```

## 7. Problemas conhecidos, limitações e dúvidas para revisão

- `index.html`/`src/main.ts` ainda exibem a página de exemplo do Vite; serão substituídos na Fase 1.
- `tests/smoke.test.ts` é temporário.
- A `main` remota ainda está no `Initial commit`; o projeto está na branch `test/phase-0-bootstrap`, aguardando revisão do usuário.
- O nome do repositório é `projeto` (não `chem-toolkit`); na Fase 5, o `base` do Vite para o GitHub Pages deverá ser `/projeto/`.
- O caminho local contém espaços (`read me\projeto 1`); funciona, mas comandos manuais podem exigir aspas.
- **Dúvidas para o Claude:**
  1. A organização planejada (`src/data`, `src/lib`, `src/ui`, `src/styles`) é adequada para um projeto vanilla TS desse tamanho, ou há sugestão mais simples?
  2. Vale a pena incluir `vite.config.ts` agora (por exemplo, para configurar o `base` do GitHub Pages desde já) ou deixar para a Fase 5?
  3. Alguma sugestão para o formato dos dados dos 118 elementos que evite retrabalho nas fases 1–4?

## 8. Como usar este documento

1. Ao final de uma etapa relevante, o OpenCode atualiza este arquivo com dados reais.
2. O usuário copia o conteúdo e cola na conversa com o Claude.
3. O Claude retorna a revisão; o OpenCode compara com o código existente e com o `AGENTS.md`, explica benefícios e riscos e pede aprovação antes de implementar mudanças significativas.
