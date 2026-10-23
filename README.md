# chem-toolkit

Tabela periódica interativa e ferramentas de química, feitas com HTML, CSS e TypeScript puros (sem framework e sem backend).

> Status: **em desenvolvimento**.

## Funcionalidades

- [x] Tabela periódica interativa com os 118 elementos
- [x] Calculadora de massa molar (ex.: `Ca(OH)2`, `CuSO4·5H2O`)
- [x] Balanceador de equações químicas (ex.: `Fe + O2 -> Fe2O3`)
- [ ] Quiz de símbolos, nomes e categorias

A calculadora aceita fórmulas simples, parênteses e colchetes aninhados (`K4[Fe(CN)6]`) e hidratos com `·`, `.` ou `*` (`CuSO4·5H2O`). O resultado inclui a massa molar total e a composição percentual por elemento.

O balanceador aceita `->`, `=` ou `→` entre reagentes e produtos. Ele usa frações exatas para encontrar os menores coeficientes inteiros, sem arredondamentos de ponto flutuante. Coeficientes digitados são opcionais; a equação é sempre balanceada do zero.

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

Os dados dos 118 elementos estão em [`src/data/elements.json`](src/data/elements.json). A fonte, a licença e as alterações estão documentadas em [`src/data/README.md`](src/data/README.md).

Resumo: estrutura, massas, categorias e posições derivadas do [Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON) (CC BY-SA 3.0); nomes em português do Brasil obtidos do [Wikidata](https://www.wikidata.org/) (CC0). O arquivo de dados é distribuído sob CC BY-SA 3.0; o código do projeto permanece MIT.

## Licença

MIT — veja [LICENSE](LICENSE).
