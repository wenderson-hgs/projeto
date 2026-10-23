# Dados dos elementos

`elements.json` contém os 118 elementos químicos usados pela tabela periódica.

## Fontes e licenças

- **Estrutura, massas atômicas, categorias, grupos, períodos e posições:** derivados do
  [Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON), de Bowserinator,
  licenciado sob [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- **Nomes em português do Brasil:** rótulos do [Wikidata](https://www.wikidata.org/),
  disponibilizados sob [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
- **Massas atômicas aproximadas:** para elementos sem massa atômica padrão da IUPAC, foi usado o
  número de massa do isótopo mais estável. Esses casos estão marcados com
  `atomicMassIsApproximate: true`.

## Alterações em relação à fonte

- Exclusão do elemento hipotético 119 (`Uue`).
- Normalização das categorias para nove grupos.
- Adição dos nomes em português (`namePt`) e em inglês (`nameEn`).
- As massas são mantidas com a precisão da fonte; o arredondamento para 3 casas decimais acontece
  apenas na interface.

## Licença deste arquivo de dados

Por ser derivado de um dataset CC BY-SA 3.0, `elements.json` é distribuído sob
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). O código do projeto continua sob a
licença MIT (veja o `LICENSE` na raiz).
