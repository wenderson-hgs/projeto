import { describe, expect, it } from 'vitest';
import {
  calculateStoichiometry,
  prepareStoichiometry,
  StoichiometryError,
  type StoichiometryErrorCode,
} from '../src/lib/stoichiometry';

function expectStoichiometryError(callback: () => void, code: StoichiometryErrorCode): void {
  try {
    callback();
  } catch (error) {
    expect(error).toBeInstanceOf(StoichiometryError);
    expect((error as StoichiometryError).code).toBe(code);
    return;
  }

  throw new Error(`Esperava um StoichiometryError com o código "${code}".`);
}

describe('prepareStoichiometry', () => {
  it('balances the equation and calculates molar masses', () => {
    const setup = prepareStoichiometry('H2 + O2 -> H2O');

    expect(setup.equation.reactants).toEqual([
      { coefficient: 2, formula: 'H2' },
      { coefficient: 1, formula: 'O2' },
    ]);
    expect(setup.equation.products).toEqual([{ coefficient: 2, formula: 'H2O' }]);
    expect(setup.reactants[0].molarMass).toBeCloseTo(2.016, 3);
    expect(setup.reactants[1].molarMass).toBeCloseTo(31.998, 3);
    expect(setup.products[0].molarMass).toBeCloseTo(18.015, 3);
  });

  it('marks species with approximate atomic masses', () => {
    const setup = prepareStoichiometry('Ra + O2 -> RaO');
    const radium = setup.reactants.find((reactant) => reactant.formula === 'Ra');

    expect(radium?.isApproximate).toBe(true);
    expect(setup.products[0].isApproximate).toBe(true);
  });
});

describe('calculateStoichiometry', () => {
  it('finds the limiting reactant and the theoretical yield in grams', () => {
    const setup = prepareStoichiometry('H2 + O2 -> H2O');
    const result = calculateStoichiometry(
      setup,
      [
        { formula: 'H2', value: 4, unit: 'g' },
        { formula: 'O2', value: 32, unit: 'g' },
      ],
      'H2O',
    );

    expect(result.limitingFormula).toBe('H2');
    expect(result.theoreticalMoles).toBeCloseTo(1.984127, 6);
    expect(result.theoreticalMass).toBeCloseTo(35.744048, 6);
    expect(result.theoreticalParticles / 1e24).toBeCloseTo(1.1949, 3);
    expect(result.excess).toHaveLength(1);
    expect(result.excess[0].formula).toBe('O2');
    expect(result.excess[0].remainingMoles).toBeCloseTo(0.007999, 6);
    expect(result.excess[0].remainingMass).toBeCloseTo(0.255952, 6);
    expect(result.unspecifiedReactants).toEqual([]);
    expect(result.percentYield).toBeNull();
  });

  it('works with a different coefficient ratio and reports excess', () => {
    const setup = prepareStoichiometry('Fe + O2 -> Fe2O3');
    const result = calculateStoichiometry(
      setup,
      [
        { formula: 'Fe', value: 100, unit: 'g' },
        { formula: 'O2', value: 96, unit: 'g' },
      ],
      'Fe2O3',
    );

    expect(result.limitingFormula).toBe('Fe');
    expect(result.theoreticalMoles).toBeCloseTo(0.895332, 6);
    expect(result.theoreticalMass).toBeCloseTo(142.973255, 6);
    expect(result.excess[0].remainingMoles).toBeCloseTo(1.657189, 6);
    expect(result.excess[0].remainingMass).toBeCloseTo(53.026745, 6);
  });

  it('accepts amounts in moles and reports unspecified reactants', () => {
    const setup = prepareStoichiometry('H2 + O2 -> H2O');
    const result = calculateStoichiometry(setup, [{ formula: 'H2', value: 2, unit: 'mol' }], 'H2O');

    expect(result.limitingFormula).toBe('H2');
    expect(result.theoreticalMoles).toBeCloseTo(2, 6);
    expect(result.theoreticalMass).toBeCloseTo(36.03, 3);
    expect(result.excess).toEqual([]);
    expect(result.unspecifiedReactants).toEqual(['O2']);
  });

  it('calculates the yield for a chosen product', () => {
    const setup = prepareStoichiometry('C3H8 + O2 -> CO2 + H2O');
    const result = calculateStoichiometry(
      setup,
      [{ formula: 'C3H8', value: 44.1, unit: 'g' }],
      'CO2',
    );

    expect(result.limitingFormula).toBe('C3H8');
    expect(result.theoreticalMoles).toBeCloseTo(3.000204, 6);
    expect(result.theoreticalMass).toBeCloseTo(132.035982, 6);
    expect(result.unspecifiedReactants).toEqual(['O2']);
  });

  it('calculates the percent yield when the actual mass is informed', () => {
    const setup = prepareStoichiometry('H2 + O2 -> H2O');
    const result = calculateStoichiometry(
      setup,
      [
        { formula: 'H2', value: 4, unit: 'g' },
        { formula: 'O2', value: 32, unit: 'g' },
      ],
      'H2O',
      30,
    );

    expect(result.percentYield).toBeCloseTo(83.93, 2);
  });

  it('returns zero percent yield for a zero actual mass', () => {
    const setup = prepareStoichiometry('H2 + O2 -> H2O');
    const result = calculateStoichiometry(
      setup,
      [{ formula: 'H2', value: 4, unit: 'g' }],
      'H2O',
      0,
    );

    expect(result.percentYield).toBe(0);
  });

  it('rejects missing amounts', () => {
    const setup = prepareStoichiometry('H2 + O2 -> H2O');

    expectStoichiometryError(() => calculateStoichiometry(setup, [], 'H2O'), 'no-amount');
  });

  it('rejects invalid amounts', () => {
    const setup = prepareStoichiometry('H2 + O2 -> H2O');

    expectStoichiometryError(
      () => calculateStoichiometry(setup, [{ formula: 'H2', value: 0, unit: 'g' }], 'H2O'),
      'invalid-amount',
    );
    expectStoichiometryError(
      () => calculateStoichiometry(setup, [{ formula: 'H2', value: Number.NaN, unit: 'g' }], 'H2O'),
      'invalid-amount',
    );
  });

  it('rejects duplicate reactants and reactants outside the equation', () => {
    const setup = prepareStoichiometry('H2 + O2 -> H2O');

    expectStoichiometryError(
      () =>
        calculateStoichiometry(
          setup,
          [
            { formula: 'H2', value: 4, unit: 'g' },
            { formula: 'H2', value: 2, unit: 'g' },
          ],
          'H2O',
        ),
      'duplicate-reactant',
    );
    expectStoichiometryError(
      () => calculateStoichiometry(setup, [{ formula: 'N2', value: 1, unit: 'g' }], 'H2O'),
      'unknown-reactant',
    );
  });

  it('rejects an unknown product and an invalid yield', () => {
    const setup = prepareStoichiometry('H2 + O2 -> H2O');

    expectStoichiometryError(
      () => calculateStoichiometry(setup, [{ formula: 'H2', value: 4, unit: 'g' }], 'CO2'),
      'unknown-product',
    );
    expectStoichiometryError(
      () => calculateStoichiometry(setup, [{ formula: 'H2', value: 4, unit: 'g' }], 'H2O', -1),
      'invalid-yield',
    );
  });
});
