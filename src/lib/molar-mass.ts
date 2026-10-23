import { getElementBySymbol } from './elements';

export type FormulaErrorCode =
  | 'empty-formula'
  | 'unknown-symbol'
  | 'unbalanced-brackets'
  | 'unexpected-token'
  | 'invalid-count'
  | 'invalid-character'
  | 'empty-hydrate'
  | 'leading-coefficient'
  | 'empty-group';

export class FormulaError extends Error {
  readonly code: FormulaErrorCode;

  constructor(code: FormulaErrorCode, message: string) {
    super(message);
    this.name = 'FormulaError';
    this.code = code;
  }
}

export interface ParsedFormula {
  counts: Record<string, number>;
  hasHydrate: boolean;
}

export interface CompositionEntry {
  symbol: string;
  namePt: string;
  count: number;
  mass: number;
  percent: number;
  isApproximate: boolean;
}

export interface MolarMassResult {
  formula: string;
  molarMass: number;
  composition: CompositionEntry[];
  isApproximate: boolean;
}

const HYDRATE_SEPARATORS = new Set(['·', '.', '*']);

export function parseFormula(input: string): ParsedFormula {
  const formula = removeSpaces(input);

  if (formula === '') {
    throw new FormulaError('empty-formula', 'Digite uma fórmula química.');
  }

  const segments = splitHydrateSegments(formula);
  const counts: Record<string, number> = {};
  let hasHydrate = false;

  segments.forEach((segment, index) => {
    if (segment === '') {
      throw new FormulaError('empty-hydrate', 'Há um separador de hidrato sem fórmula ao lado.');
    }

    let multiplier = 1;
    let body = segment;

    if (index > 0) {
      hasHydrate = true;
      const coefficient = /^(\d+)/.exec(body);

      if (coefficient) {
        multiplier = Number(coefficient[1]);

        if (!Number.isSafeInteger(multiplier) || multiplier <= 0) {
          throw new FormulaError(
            'invalid-count',
            'A quantidade do hidrato deve ser um número inteiro positivo.',
          );
        }

        body = body.slice(coefficient[0].length);

        if (body === '') {
          throw new FormulaError('empty-hydrate', 'Há um coeficiente de hidrato sem fórmula.');
        }
      }
    } else if (/^\d/.test(body)) {
      throw new FormulaError(
        'leading-coefficient',
        'Não use coeficiente no início da fórmula; use apenas nos hidratos, como CuSO4·5H2O.',
      );
    }

    addCounts(counts, parseSegment(body), multiplier);
  });

  return { counts, hasHydrate };
}

export function calculateMolarMass(input: string): MolarMassResult {
  const parsed = parseFormula(input);
  const composition = Object.entries(parsed.counts).map(([symbol, count]) => {
    const element = getElementBySymbol(symbol);

    if (!element) {
      throw new FormulaError('unknown-symbol', `Símbolo desconhecido: "${symbol}".`);
    }

    return {
      symbol,
      namePt: element.namePt,
      count,
      mass: element.atomicMass * count,
      isApproximate: element.atomicMassIsApproximate,
    };
  });

  const molarMass = composition.reduce((total, entry) => total + entry.mass, 0);

  return {
    formula: removeSpaces(input),
    molarMass,
    composition: composition.map((entry) => ({
      ...entry,
      percent: (entry.mass / molarMass) * 100,
    })),
    isApproximate: composition.some((entry) => entry.isApproximate),
  };
}

function splitHydrateSegments(formula: string): string[] {
  const segments: string[] = [];
  let current = '';
  let depth = 0;

  for (const char of formula) {
    if (char === '(' || char === '[') {
      depth += 1;
      current += char;
      continue;
    }

    if (char === ')' || char === ']') {
      depth -= 1;

      if (depth < 0) {
        throw new FormulaError(
          'unbalanced-brackets',
          `Fechamento "${char}" sem abertura correspondente.`,
        );
      }

      current += char;
      continue;
    }

    if (depth === 0 && HYDRATE_SEPARATORS.has(char)) {
      segments.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (depth > 0) {
    throw new FormulaError('unbalanced-brackets', 'Há um parêntese ou colchete sem fechar.');
  }

  segments.push(current);
  return segments;
}

function parseSegment(segment: string): Record<string, number> {
  let index = 0;

  function parseGroup(closing?: ')' | ']'): Record<string, number> {
    const counts: Record<string, number> = {};

    while (index < segment.length) {
      const char = segment[index];

      if (closing && char === closing) {
        index += 1;
        return counts;
      }

      if (char === ')' || char === ']') {
        throw new FormulaError(
          'unbalanced-brackets',
          `Fechamento "${char}" sem abertura correspondente.`,
        );
      }

      if (char === '(' || char === '[') {
        const groupStart = index;
        const expectedClosing = char === '(' ? ')' : ']';
        index += 1;
        const inner = parseGroup(expectedClosing);

        if (Object.keys(inner).length === 0) {
          throw new FormulaError('empty-group', `Grupo vazio na posição ${groupStart + 1}.`);
        }

        addCounts(counts, inner, readCount());
        continue;
      }

      if (isUppercaseLetter(char)) {
        const symbol = readSymbol();
        const element = getElementBySymbol(symbol);

        if (!element) {
          throw new FormulaError('unknown-symbol', `Símbolo desconhecido: "${symbol}".`);
        }

        addCounts(counts, { [symbol]: readCount() });
        continue;
      }

      if (isDigit(char)) {
        throw new FormulaError('unexpected-token', `Número inesperado na posição ${index + 1}.`);
      }

      throw new FormulaError('invalid-character', `Caractere inválido: "${char}".`);
    }

    if (closing) {
      throw new FormulaError('unbalanced-brackets', `Falta fechar "${closing}".`);
    }

    return counts;
  }

  function readSymbol(): string {
    let symbol = segment[index];
    index += 1;

    while (index < segment.length && isLowercaseLetter(segment[index])) {
      symbol += segment[index];
      index += 1;
    }

    return symbol;
  }

  function readCount(): number {
    const start = index;

    while (index < segment.length && isDigit(segment[index])) {
      index += 1;
    }

    if (start === index) {
      return 1;
    }

    const digits = segment.slice(start, index);
    const count = Number(digits);

    if (!Number.isSafeInteger(count) || count <= 0) {
      throw new FormulaError(
        'invalid-count',
        `Quantidade inválida: "${digits}". Use um número inteiro positivo.`,
      );
    }

    return count;
  }

  return parseGroup();
}

function addCounts(
  target: Record<string, number>,
  source: Record<string, number>,
  multiplier = 1,
): void {
  for (const [symbol, count] of Object.entries(source)) {
    target[symbol] = (target[symbol] ?? 0) + count * multiplier;
  }
}

function removeSpaces(value: string): string {
  return value.replace(/\s+/g, '');
}

function isUppercaseLetter(char: string): boolean {
  return char >= 'A' && char <= 'Z';
}

function isLowercaseLetter(char: string): boolean {
  return char >= 'a' && char <= 'z';
}

function isDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}
