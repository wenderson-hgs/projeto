import { describe, expect, it } from 'vitest';
import {
  BalanceError,
  balanceEquation,
  formatBalancedEquation,
  type BalancedEquation,
} from '../src/lib/balancer';

function coefficients(equation: BalancedEquation): number[] {
  return [...equation.reactants, ...equation.products].map((term) => term.coefficient);
}

function getBalanceError(input: string): BalanceError {
  try {
    balanceEquation(input);
  } catch (error) {
    if (error instanceof BalanceError) {
      return error;
    }

    throw error;
  }

  throw new Error(`Esperava um erro para "${input}".`);
}

describe('balanceEquation', () => {
  it.each([
    ['H2 + O2 -> H2O', [2, 1, 2]],
    ['Fe + O2 -> Fe2O3', [4, 3, 2]],
    ['C3H8 + O2 -> CO2 + H2O', [1, 5, 3, 4]],
    ['Al + HCl -> AlCl3 + H2', [2, 6, 2, 3]],
    ['KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2', [2, 16, 2, 2, 8, 5]],
  ] as const)('balances %s', (input, expected) => {
    expect(coefficients(balanceEquation(input))).toEqual(expected);
  });

  it('keeps the order of reactants and products', () => {
    const equation = balanceEquation('Fe + O2 -> Fe2O3');

    expect(equation.reactants).toEqual([
      { coefficient: 4, formula: 'Fe' },
      { coefficient: 3, formula: 'O2' },
    ]);
    expect(equation.products).toEqual([{ coefficient: 2, formula: 'Fe2O3' }]);
  });

  it('accepts ->, = and the arrow character', () => {
    const expected = coefficients(balanceEquation('H2 + O2 -> H2O'));

    expect(coefficients(balanceEquation('H2 + O2 = H2O'))).toEqual(expected);
    expect(coefficients(balanceEquation('H2 + O2 → H2O'))).toEqual(expected);
  });

  it('ignores input coefficients and returns the smallest integers', () => {
    expect(coefficients(balanceEquation('2 H2 + O2 = 2 H2O'))).toEqual([2, 1, 2]);
    expect(coefficients(balanceEquation('6 H2 + 3 O2 -> 6 H2O'))).toEqual([2, 1, 2]);
  });

  it('accepts spaces around terms and coefficients', () => {
    expect(coefficients(balanceEquation('  Fe  +  O2  ->  Fe2O3  '))).toEqual([4, 3, 2]);
  });

  it('balances formulas with groups', () => {
    expect(coefficients(balanceEquation('Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O'))).toEqual([
      3, 2, 1, 6,
    ]);
  });

  it('balances formulas with hydrates', () => {
    expect(coefficients(balanceEquation('CuSO4·5H2O -> CuSO4 + H2O'))).toEqual([1, 1, 5]);
  });

  it('works when every coefficient is one', () => {
    expect(coefficients(balanceEquation('C + O2 -> CO2'))).toEqual([1, 1, 1]);
  });
});

describe('formatBalancedEquation', () => {
  it('formats the equation without coefficient 1', () => {
    const equation = balanceEquation('Fe + O2 -> Fe2O3');

    expect(formatBalancedEquation(equation)).toBe('4 Fe + 3 O2 → 2 Fe2O3');
  });

  it('accepts a custom arrow', () => {
    const equation = balanceEquation('H2 + O2 -> H2O');

    expect(formatBalancedEquation(equation, '->')).toBe('2 H2 + O2 -> 2 H2O');
  });
});

describe('balance errors', () => {
  it.each([
    ['', 'empty-equation'],
    ['   ', 'empty-equation'],
    ['H2 + O2', 'missing-arrow'],
    ['H2 -> O2 -> H2O', 'multiple-arrows'],
    ['H2 + O2 ->', 'empty-side'],
    ['-> H2O', 'empty-side'],
    ['H2 + + O2 -> H2O', 'empty-term'],
    ['0 H2 + O2 -> H2O', 'invalid-coefficient'],
    ['2.5 H2 + O2 -> H2O', 'invalid-formula'],
    ['Xx2 + O2 -> Xx2O', 'invalid-formula'],
    ['H2 + O2 -> H2O + N2', 'zero-coefficient'],
    ['H2 -> O2 + H2O', 'no-positive-solution'],
    ['H2 -> O2', 'no-solution'],
    ['H2 + O2 -> H2O + O2', 'multiple-solutions'],
  ] as const)('rejects %s with code %s', (input, code) => {
    expect(getBalanceError(input).code).toBe(code);
  });

  it('explains an impossible equation', () => {
    expect(getBalanceError('H2 -> O2').message).toContain('impossível');
  });

  it('mentions the invalid formula', () => {
    expect(getBalanceError('Xx2 -> Xx2').message).toContain('Xx2');
  });

  it('mentions the compound with coefficient zero', () => {
    expect(getBalanceError('H2 + O2 -> H2O + N2').message).toContain('N2');
  });
});
