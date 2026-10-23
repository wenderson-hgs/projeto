import { FormulaError, parseFormula } from './molar-mass';

export type BalanceErrorCode =
  | 'empty-equation'
  | 'missing-arrow'
  | 'multiple-arrows'
  | 'empty-side'
  | 'empty-term'
  | 'invalid-coefficient'
  | 'invalid-formula'
  | 'no-solution'
  | 'multiple-solutions'
  | 'zero-coefficient'
  | 'no-positive-solution'
  | 'coefficient-too-large';

export class BalanceError extends Error {
  readonly code: BalanceErrorCode;

  constructor(code: BalanceErrorCode, message: string) {
    super(message);
    this.name = 'BalanceError';
    this.code = code;
  }
}

export interface BalancedTerm {
  coefficient: number;
  formula: string;
}

export interface BalancedEquation {
  reactants: BalancedTerm[];
  products: BalancedTerm[];
}

interface ParsedTerm {
  formula: string;
  counts: Record<string, number>;
}

const ARROW_PATTERN = /->|=|→/g;

export function balanceEquation(input: string): BalancedEquation {
  const equation = input.trim();

  if (equation === '') {
    throw new BalanceError('empty-equation', 'Digite uma equação química.');
  }

  const arrows = [...equation.matchAll(ARROW_PATTERN)];

  if (arrows.length === 0) {
    throw new BalanceError(
      'missing-arrow',
      'Use uma seta para separar reagentes e produtos: ->, = ou →.',
    );
  }

  if (arrows.length > 1) {
    throw new BalanceError(
      'multiple-arrows',
      'Use apenas uma seta para separar reagentes e produtos.',
    );
  }

  const arrow = arrows[0];
  const arrowIndex = arrow.index ?? 0;
  const leftSide = equation.slice(0, arrowIndex);
  const rightSide = equation.slice(arrowIndex + arrow[0].length);

  const reactants = parseSide(leftSide, 'reagentes');
  const products = parseSide(rightSide, 'produtos');
  const allTerms = [...reactants, ...products];

  const elements: string[] = [];

  for (const term of allTerms) {
    for (const symbol of Object.keys(term.counts)) {
      if (!elements.includes(symbol)) {
        elements.push(symbol);
      }
    }
  }

  // Reagentes entram positivos e produtos negativos; o balanceamento é o espaço nulo.
  const matrix = elements.map((symbol) => [
    ...reactants.map((term) => new Fraction(BigInt(term.counts[symbol] ?? 0))),
    ...products.map((term) => new Fraction(BigInt(-(term.counts[symbol] ?? 0)))),
  ]);

  const reduced = toReducedRowEchelonForm(matrix);
  const freeColumns = findFreeColumns(reduced.pivotColumns, allTerms.length);

  if (freeColumns.length === 0) {
    throw new BalanceError(
      'no-solution',
      'Essa equação é impossível: não existe combinação de coeficientes que conserve os átomos.',
    );
  }

  if (freeColumns.length > 1) {
    throw new BalanceError(
      'multiple-solutions',
      'Essa equação tem mais de uma solução. Verifique se algum composto aparece repetido.',
    );
  }

  const nullVector = buildNullVector(
    reduced.matrix,
    reduced.pivotColumns,
    freeColumns[0],
    allTerms.length,
  );
  const coefficients = scaleToSmallestIntegers(nullVector);

  const inactiveTerms = allTerms
    .filter((_, index) => coefficients[index] === 0n)
    .map((term) => term.formula);

  if (inactiveTerms.length > 0) {
    throw new BalanceError(
      'zero-coefficient',
      `A equação não usa ${inactiveTerms.join(', ')}: o coeficiente ficaria 0. Verifique os compostos.`,
    );
  }

  if (coefficients.some((value) => value < 0n)) {
    throw new BalanceError(
      'no-positive-solution',
      'Não existe solução com todos os coeficientes positivos. Verifique se reagentes e produtos estão nos lados corretos.',
    );
  }

  const numericCoefficients = coefficients.map(toSafeNumber);

  return {
    reactants: reactants.map((term, index) => ({
      coefficient: numericCoefficients[index],
      formula: term.formula,
    })),
    products: products.map((term, index) => ({
      coefficient: numericCoefficients[reactants.length + index],
      formula: term.formula,
    })),
  };
}

export function formatBalancedEquation(equation: BalancedEquation, arrow = '→'): string {
  return `${formatSide(equation.reactants)} ${arrow} ${formatSide(equation.products)}`;
}

function formatSide(terms: BalancedTerm[]): string {
  return terms
    .map((term) => (term.coefficient === 1 ? term.formula : `${term.coefficient} ${term.formula}`))
    .join(' + ');
}

function parseSide(side: string, label: 'reagentes' | 'produtos'): ParsedTerm[] {
  if (side.trim() === '') {
    throw new BalanceError('empty-side', `O lado dos ${label} está vazio.`);
  }

  return side.split('+').map((rawTerm) => parseTerm(rawTerm));
}

function parseTerm(rawTerm: string): ParsedTerm {
  const text = rawTerm.trim();

  if (text === '') {
    throw new BalanceError('empty-term', 'Há um "+" sem composto ao lado.');
  }

  // Coeficientes digitados são validados, mas ignorados: o resultado usa os menores inteiros.
  const coefficientMatch = /^(\d+)\s*/.exec(text);

  if (coefficientMatch) {
    const coefficient = Number(coefficientMatch[1]);

    if (!Number.isSafeInteger(coefficient) || coefficient <= 0) {
      throw new BalanceError(
        'invalid-coefficient',
        `Coeficiente inválido: "${coefficientMatch[1]}". Use um número inteiro positivo.`,
      );
    }
  }

  const formula = text.slice(coefficientMatch ? coefficientMatch[0].length : 0).replace(/\s+/g, '');

  if (formula === '') {
    throw new BalanceError(
      'invalid-formula',
      `Falta a fórmula depois do coeficiente em "${text}".`,
    );
  }

  try {
    const parsed = parseFormula(formula);

    return { formula, counts: parsed.counts };
  } catch (error) {
    if (error instanceof FormulaError) {
      throw new BalanceError(
        'invalid-formula',
        `Fórmula inválida em "${formula}": ${error.message}`,
      );
    }

    throw error;
  }
}

interface ReducedMatrix {
  matrix: Fraction[][];
  pivotColumns: number[];
}

function toReducedRowEchelonForm(matrix: Fraction[][]): ReducedMatrix {
  const rowCount = matrix.length;
  const columnCount = rowCount === 0 ? 0 : matrix[0].length;
  const pivotColumns: number[] = [];
  let pivotRow = 0;

  for (let column = 0; column < columnCount && pivotRow < rowCount; column += 1) {
    let sourceRow = -1;

    for (let row = pivotRow; row < rowCount; row += 1) {
      if (!matrix[row][column].isZero()) {
        sourceRow = row;
        break;
      }
    }

    if (sourceRow === -1) {
      continue;
    }

    [matrix[pivotRow], matrix[sourceRow]] = [matrix[sourceRow], matrix[pivotRow]];

    const pivot = matrix[pivotRow][column];

    for (let index = 0; index < columnCount; index += 1) {
      matrix[pivotRow][index] = matrix[pivotRow][index].divide(pivot);
    }

    for (let row = 0; row < rowCount; row += 1) {
      if (row === pivotRow || matrix[row][column].isZero()) {
        continue;
      }

      const factor = matrix[row][column];

      for (let index = 0; index < columnCount; index += 1) {
        matrix[row][index] = matrix[row][index].subtract(factor.multiply(matrix[pivotRow][index]));
      }
    }

    pivotColumns.push(column);
    pivotRow += 1;
  }

  return { matrix, pivotColumns };
}

function findFreeColumns(pivotColumns: number[], columnCount: number): number[] {
  const freeColumns: number[] = [];

  for (let column = 0; column < columnCount; column += 1) {
    if (!pivotColumns.includes(column)) {
      freeColumns.push(column);
    }
  }

  return freeColumns;
}

function buildNullVector(
  matrix: Fraction[][],
  pivotColumns: number[],
  freeColumn: number,
  columnCount: number,
): Fraction[] {
  const vector: Fraction[] = Array.from({ length: columnCount }, () => new Fraction(0n));

  vector[freeColumn] = new Fraction(1n);

  pivotColumns.forEach((pivotColumn, rowIndex) => {
    vector[pivotColumn] = matrix[rowIndex][freeColumn].negate();
  });

  return vector;
}

function scaleToSmallestIntegers(vector: Fraction[]): bigint[] {
  let commonDenominator = 1n;

  for (const value of vector) {
    commonDenominator = leastCommonMultiple(commonDenominator, value.denominator);
  }

  const integers = vector.map((value) => value.numerator * (commonDenominator / value.denominator));
  const commonDivisor = integers.reduce(
    (result, value) => greatestCommonDivisor(result, value),
    0n,
  );

  return integers.map((value) => value / commonDivisor);
}

function toSafeNumber(value: bigint): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new BalanceError(
      'coefficient-too-large',
      'Os coeficientes calculados são grandes demais para exibir.',
    );
  }

  return Number(value);
}

class Fraction {
  readonly numerator: bigint;
  readonly denominator: bigint;

  constructor(numerator: bigint, denominator = 1n) {
    if (denominator === 0n) {
      throw new Error('Denominador zero.');
    }

    if (denominator < 0n) {
      numerator = -numerator;
      denominator = -denominator;
    }

    const divisor = greatestCommonDivisor(numerator, denominator);

    this.numerator = numerator / divisor;
    this.denominator = denominator / divisor;
  }

  subtract(other: Fraction): Fraction {
    return new Fraction(
      this.numerator * other.denominator - other.numerator * this.denominator,
      this.denominator * other.denominator,
    );
  }

  multiply(other: Fraction): Fraction {
    return new Fraction(this.numerator * other.numerator, this.denominator * other.denominator);
  }

  divide(other: Fraction): Fraction {
    return new Fraction(this.numerator * other.denominator, this.denominator * other.numerator);
  }

  negate(): Fraction {
    return new Fraction(-this.numerator, this.denominator);
  }

  isZero(): boolean {
    return this.numerator === 0n;
  }
}

function greatestCommonDivisor(first: bigint, second: bigint): bigint {
  let a = first < 0n ? -first : first;
  let b = second < 0n ? -second : second;

  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a;
}

function leastCommonMultiple(first: bigint, second: bigint): bigint {
  return (first / greatestCommonDivisor(first, second)) * second;
}
