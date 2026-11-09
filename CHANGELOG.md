# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

## [1.2.0] — 2026-11-09

### Adicionado

- Painel de detalhes com estado físico, configuração eletrônica, eletronegatividade de Pauling, pontos de fusão e ebulição (convertidos de kelvin para °C), densidade com a unidade de origem e bloco.
- Rótulos de grupo e período no painel (por exemplo, "Grupo 8 — metais de transição"), com tratamento próprio para o hidrogênio e para lantanídeos/actinídeos.
- Revisão dos erros ao final do quiz, mostrando a pergunta, a resposta escolhida e a resposta correta. Quando todas as respostas estão certas, aparece uma mensagem positiva.

### Corrigido

- Nomes em português de Rf e Nh: `Ruterfórdio` e `Nihônio`.

### Dados

- Novos campos em `elements.json`: `phase`, `electronConfiguration`, `electronegativity`, `meltingPointK`, `boilingPointK`, `density`, `densityUnit` e `block`, derivados do Periodic-Table-JSON (CC BY-SA 3.0).
- Valores ausentes são gravados como `null` e exibidos como `—` na interface.

### Testes

- Cobertura para propriedades físicas, rótulos de grupo/período, nomes corrigidos, busca sem acentos e revisão de erros do quiz.

## [1.1.0] — 2026-11-09

### Corrigido

- Números exibidos com vírgula decimal (pt-BR) no painel de detalhes, na calculadora e nos percentuais.
- Mensagem do balanceador agora distingue fórmulas repetidas de equações com mais de uma solução (sistema indeterminado).

### Adicionado

- A calculadora aceita subscritos Unicode (`H₂O`) e estados físicos no fim da fórmula (`H2O(s)`, `H2O(l)`, `H2O(g)`, `H2O(aq)`).
- A tabela usa roving tabindex: um único ponto de Tab, setas para navegar e foco gerenciado no painel de detalhes (abrir pelo teclado leva o foco ao painel; `Esc` devolve à célula).
- Metadados de SEO e compartilhamento (canonical, Open Graph, Twitter Card e JSON-LD), com imagem social 1200×630.
- Workflow `CI` que roda lint, testes e build em pull requests.

### Testes

- Cobertura para formatação numérica pt-BR, normalização de subscritos/estados e mensagens do balanceador.

## [1.0.0] — 2026-10-23

Primeira versão publicada.

### Adicionado

- Tabela periódica interativa com os 118 elementos, busca, filtro por categoria, painel de detalhes e navegação por teclado.
- Calculadora de massa molar com parser de fórmulas, grupos aninhados, hidratos e composição percentual.
- Balanceador de equações com frações exatas, menores coeficientes inteiros e mensagens de erro claras.
- Quiz com três modos, rodadas de 10 perguntas, feedback imediato, pontuação e recorde por modo.
- Tema claro e escuro, com preferência salva no `localStorage` e respeito à preferência do sistema.
- Link para pular ao conteúdo, foco visível, rótulos acessíveis e suporte a `prefers-reduced-motion`.
- README completo com capturas de tela, instruções de uso, estrutura, fonte dos dados e licenças.
- Deploy automático no GitHub Pages via GitHub Actions.

### Dados

- 118 elementos derivados do Periodic-Table-JSON (CC BY-SA 3.0).
- Nomes em português do Brasil obtidos do Wikidata (CC0).
- Massas atômicas convencionais da IUPAC, exibidas com 3 casas decimais.

### Licença

- Código sob MIT; dados sob CC BY-SA 3.0.
