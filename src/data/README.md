# Dados dos elementos

`elements.json` contém os 118 elementos químicos usados pela tabela periódica, incluindo
propriedades físicas para o painel de detalhes.

## Fontes e licenças

- **Estrutura, massas atômicas, categorias, grupos, períodos, posições, estado físico,
  configuração eletrônica, eletronegatividade, pontos de fusão/ebulição, densidade e bloco:**
  derivados do [Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON), de
  Bowserinator, licenciado sob [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- **Nomes em português do Brasil:** rótulos do [Wikidata](https://www.wikidata.org/),
  disponibilizados sob [CC0](https://creativecommons.org/publicdomain/zero/1.0/), com revisão
  manual da nomenclatura brasileira.
- **Massas atômicas aproximadas:** para elementos sem massa atômica padrão da IUPAC, foi usado o
  número de massa do isótopo mais estável. Esses casos estão marcados com
  `atomicMassIsApproximate: true`.

## Campos

| Campo                    | Descrição                                                                 |
| ------------------------ | ------------------------------------------------------------------------- |
| `atomicNumber`           | Número atômico (1 a 118).                                                 |
| `symbol`                 | Símbolo químico.                                                          |
| `namePt` / `nameEn`      | Nome em português do Brasil e em inglês.                                  |
| `atomicMass`             | Massa atômica na precisão da fonte.                                       |
| `atomicMassIsApproximate` | Indica massa baseada no isótopo mais estável.                             |
| `category`               | Uma das nove categorias usadas na tabela e no quiz.                       |
| `categoryIsPredicted`    | Indica categoria prevista para elementos superpesados.                    |
| `group` / `period`       | Grupo (1 a 18) e período (1 a 7) da tabela.                               |
| `xpos` / `ypos`          | Posição da célula no layout em grade.                                     |
| `phase`                  | Estado físico: `solid`, `liquid` ou `gas`.                                |
| `electronConfiguration`  | Configuração eletrônica semântica (por exemplo, `[Ar] 3d6 4s2`).          |
| `electronegativity`      | Eletronegatividade de Pauling, ou `null` quando não disponível.           |
| `meltingPointK`          | Ponto de fusão em kelvin, ou `null` quando não disponível.                |
| `boilingPointK`          | Ponto de ebulição em kelvin, ou `null` quando não disponível.             |
| `density`                | Densidade na unidade original, ou `null` quando não disponível.           |
| `densityUnit`            | `g/L` para gases, `g/cm3` para os demais; `null` sem densidade.           |
| `block`                  | Bloco da tabela: `s`, `p`, `d` ou `f`.                                    |

A interface converte os pontos de fusão e ebulição de kelvin para graus Celsius e exibe a
densidade com a unidade de origem (`g/cm³` para sólidos e líquidos, `g/L` para gases). Valores
ausentes aparecem como `—`.

## Alterações em relação à fonte

- Exclusão do elemento hipotético 119 (`Uue`).
- Normalização das categorias para nove grupos.
- Adição dos nomes em português (`namePt`) e em inglês (`nameEn`).
- As massas são mantidas com a precisão da fonte; o arredondamento para 3 casas decimais acontece
  apenas na interface.
- Estados físicos normalizados para `solid`, `liquid` e `gas`.
- Temperaturas mantidas em kelvin (`meltingPointK` e `boilingPointK`); a interface converte para
  graus Celsius.
- Densidade mantida com a unidade da fonte (`g/L` para gases e `g/cm3` para os demais).
- Valores ausentes são gravados como `null` e exibidos como `—`.
- Revisão de nomes em português: `Rutherfórdio` → **Ruterfórdio** (Rf) e `Niônio` → **Nihônio**
  (Nh). A forma brasileira **Hôlmio** (Ho) foi mantida, conforme o Livro Verde da SBQ.

## Licença deste arquivo de dados

Por ser derivado de um dataset CC BY-SA 3.0, `elements.json` é distribuído sob
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). O código do projeto continua sob a
licença MIT (veja o `LICENSE` na raiz).
