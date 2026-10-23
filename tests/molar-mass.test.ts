import { describe, expect, it } from 'vitest';
import { calculateMolarMass, FormulaError, parseFormula } from '../src/lib/molar-mass';

const molarMassCases: Array<[string, number]> = [
  ['H2O', 18.015],
  ['NaCl', 58.44],
  ['Ca(OH)2', 74.09],
  ['C6H12O6', 180.16],
  ['Fe2(SO4)3', 399.88],
  ['CuSO4·5H2O', 249.68],
];

function getFormulaError(formula: string): FormulaError {
  try {
    parseFormula(formula);
  } catch (error) {
    if (error instanceof FormulaError) {
      return error;
    }

    throw error;
  }

  throw new Error(`Esperava um erro para "${formula}".`);
}

describe('calculateMolarMass', () => {
  it.each(molarMassCases)('calculates the molar mass of %s', (formula, expected) => {
    const result = calculateMolarMass(formula);
    expect(Math.abs(result.molarMass - expected)).toBeLessThanOrEqual(0.05);
  });

  it('calculates a formula with nested brackets', () => {
    const result = calculateMolarMass('K4[Fe(CN)6]');

    expect(Math.abs(result.molarMass - 368.35)).toBeLessThanOrEqual(0.05);
    expect(result.composition.map((entry) => entry.symbol)).toEqual(['K', 'Fe', 'C', 'N']);
    expect(result.composition.map((entry) => entry.count)).toEqual([4, 1, 6, 6]);
  });

  it('returns the percentage composition', () => {
    const result = calculateMolarMass('H2O');
    const totalPercent = result.composition.reduce((sum, entry) => sum + entry.percent, 0);

    expect(result.composition).toHaveLength(2);
    expect(result.composition[0]).toMatchObject({
      symbol: 'H',
      namePt: 'Hidrogênio',
      count: 2,
    });
    expect(totalPercent).toBeCloseTo(100, 6);
  });

  it('accepts dot, middle dot and asterisk as hydrate separators', () => {
    const middleDot = calculateMolarMass('CuSO4·5H2O');
    const dot = calculateMolarMass('CuSO4.5H2O');
    const asterisk = calculateMolarMass('CuSO4*5H2O');

    expect(dot.molarMass).toBeCloseTo(middleDot.molarMass, 6);
    expect(asterisk.molarMass).toBeCloseTo(middleDot.molarMass, 6);
  });

  it('ignores spaces in the formula', () => {
    expect(calculateMolarMass('Ca (OH) 2').molarMass).toBeCloseTo(
      calculateMolarMass('Ca(OH)2').molarMass,
      6,
    );
  });

  it('flags results that use approximate atomic masses', () => {
    expect(calculateMolarMass('Tc2O7').isApproximate).toBe(true);
    expect(calculateMolarMass('H2O').isApproximate).toBe(false);
  });
});

describe('parseFormula', () => {
  it('counts atoms outside and inside groups', () => {
    expect(parseFormula('Ca(OH)2').counts).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(parseFormula('Fe2(SO4)3').counts).toEqual({ Fe: 2, S: 3, O: 12 });
  });

  it('counts atoms in nested brackets', () => {
    expect(parseFormula('K4[Fe(CN)6]').counts).toEqual({
      K: 4,
      Fe: 1,
      C: 6,
      N: 6,
    });
  });

  it('applies the hydrate multiplier to the whole molecule', () => {
    const parsed = parseFormula('CuSO4·5H2O');

    expect(parsed.counts).toEqual({ Cu: 1, S: 1, O: 9, H: 10 });
    expect(parsed.hasHydrate).toBe(true);
    expect(parseFormula('H2O').hasHydrate).toBe(false);
  });

  it('accepts coefficients of one in hydrates', () => {
    expect(parseFormula('CuSO4·H2O').counts).toEqual({ Cu: 1, S: 1, O: 5, H: 2 });
  });
});

describe('formula errors', () => {
  it.each([
    ['', 'empty-formula'],
    ['   ', 'empty-formula'],
    ['Xx2', 'unknown-symbol'],
    ['Ca(OH2', 'unbalanced-brackets'],
    ['CaOH)2', 'unbalanced-brackets'],
    ['Ca(OH]2', 'unbalanced-brackets'],
    ['H2O(', 'unbalanced-brackets'],
    ['H0', 'invalid-count'],
    ['CuSO4·0H2O', 'invalid-count'],
    ['2H2O', 'leading-coefficient'],
    ['H2O@', 'invalid-character'],
    ['h2o', 'invalid-character'],
    ['CuSO4·', 'empty-hydrate'],
    ['CuSO4·5', 'empty-hydrate'],
    ['()', 'empty-group'],
    ['Ca()2', 'empty-group'],
  ] as const)('rejects %s with code %s', (formula, code) => {
    expect(getFormulaError(formula).code).toBe(code);
  });

  it('provides a human-readable message', () => {
    expect(getFormulaError('Xx2').message).toContain('Xx');
    expect(getFormulaError('').message).toContain('fórmula');
  });
});
