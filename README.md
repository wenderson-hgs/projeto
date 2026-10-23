# chem-toolkit

Tabela periódica interativa e ferramentas de química, feitas com HTML, CSS e TypeScript puros (sem framework e sem backend).

> Status: **em desenvolvimento**.

## Funcionalidades planejadas

- Tabela periódica interativa com os 118 elementos
- Calculadora de massa molar (ex.: `Ca(OH)2`, `CuSO4·5H2O`)
- Balanceador de equações químicas (ex.: `Fe + O2 -> Fe2O3`)
- Quiz de símbolos, nomes e categorias

## Como rodar

Pré-requisitos: Node.js (LTS) e npm.

```bash
npm install      # instala as dependências
npm run dev      # inicia o servidor de desenvolvimento
npm test         # roda os testes unitários
npm run build    # gera a versão de produção em dist/
npm run preview  # visualiza a versão de produção
npm run lint     # verifica o código com ESLint
npm run format   # formata o código com Prettier
```

## Stack

- Vite + TypeScript (sem framework)
- Vitest para testes unitários
- ESLint + Prettier

## Dados

Os dados dos elementos serão obtidos de um dataset aberto. A fonte e a licença serão registradas aqui na Fase 1.

## Licença

MIT — veja [LICENSE](LICENSE).
