import { balanceEquation, type BalancedEquation, type BalancedTerm } from './balancer';
import { calculateMolarMass } from './molar-mass';

export type AmountUnit = 'g' | 'mol';

export type StoichiometryErrorCode =
  | 'no-amount'
  | 'invalid-amount'
  | 'duplicate-reactant'
  | 'unknown-reactant'
  | 'unknown-product'
  | 'invalid-yield';

export class StoichiometryError extends Error {
  readonly code: StoichiometryErrorCode;

  constructor(code: StoichiometryErrorCode, message: string) {
    super(message);
    this.name = 'StoichiometryError';
    this.code = code;
  }
}

export interface StoichiometrySpecies {
  formula: string;
  coefficient: number;
  molarMass: number;
  isApproximate: boolean;
}

export interface StoichiometrySetup {
  equation: BalancedEquation;
  reactants: StoichiometrySpecies[];
  products: StoichiometrySpecies[];
}

export interface ReactantAmount {
  formula: string;
  value: number;
  unit: AmountUnit;
}

export interface RemainingReactant {
  formula: string;
  remainingMoles: number;
  remainingMass: number;
}

export interface StoichiometryResult {
  product: StoichiometrySpecies;
  limitingFormula: string;
  theoreticalMoles: number;
  theoreticalMass: number;
  theoreticalParticles: number;
  excess: RemainingReactant[];
  percentYield: number | null;
  unspecifiedReactants: string[];
}

export const AVOGADRO_CONSTANT = 6.02214076e23;

export function prepareStoichiometry(equationInput: string): StoichiometrySetup {
  const equation = balanceEquation(equationInput);

  return {
    equation,
    reactants: equation.reactants.map(toSpecies),
    products: equation.products.map(toSpecies),
  };
}

export function calculateStoichiometry(
  setup: StoichiometrySetup,
  amounts: ReactantAmount[],
  productFormula: string,
  actualYieldGrams: number | null = null,
): StoichiometryResult {
  const product = setup.products.find((candidate) => candidate.formula === productFormula);

  if (!product) {
    throw new StoichiometryError(
      'unknown-product',
      'Escolha um produto que faça parte da equação.',
    );
  }

  if (amounts.length === 0) {
    throw new StoichiometryError('no-amount', 'Informe a quantidade de pelo menos um reagente.');
  }

  const reactantByFormula = new Map(
    setup.reactants.map((reactant) => [reactant.formula, reactant]),
  );
  const amountByFormula = new Map<string, ReactantAmount>();

  for (const amount of amounts) {
    const reactant = reactantByFormula.get(amount.formula);

    if (!reactant) {
      throw new StoichiometryError(
        'unknown-reactant',
        `O reagente ${amount.formula} não faz parte da equação.`,
      );
    }

    if (amountByFormula.has(amount.formula)) {
      throw new StoichiometryError(
        'duplicate-reactant',
        `Há mais de uma quantidade para o reagente ${amount.formula}.`,
      );
    }

    if (!Number.isFinite(amount.value) || amount.value <= 0) {
      throw new StoichiometryError(
        'invalid-amount',
        `Informe uma quantidade positiva para ${amount.formula}.`,
      );
    }

    amountByFormula.set(amount.formula, amount);
  }

  const candidates = [...amountByFormula.values()].map((amount) => {
    const reactant = reactantByFormula.get(amount.formula);

    if (!reactant) {
      throw new StoichiometryError(
        'unknown-reactant',
        `O reagente ${amount.formula} não faz parte da equação.`,
      );
    }

    const moles = amount.unit === 'mol' ? amount.value : amount.value / reactant.molarMass;

    return {
      reactant,
      moles,
      productMoles: moles * (product.coefficient / reactant.coefficient),
    };
  });

  const limiting = candidates.reduce((smallest, candidate) =>
    candidate.productMoles < smallest.productMoles ? candidate : smallest,
  );
  const theoreticalMoles = limiting.productMoles;
  const theoreticalMass = theoreticalMoles * product.molarMass;
  const theoreticalParticles = theoreticalMoles * AVOGADRO_CONSTANT;

  const excess = candidates
    .filter((candidate) => candidate.reactant.formula !== limiting.reactant.formula)
    .map((candidate) => {
      const consumedMoles =
        theoreticalMoles * (candidate.reactant.coefficient / product.coefficient);
      const remainingMoles = Math.max(0, candidate.moles - consumedMoles);

      return {
        formula: candidate.reactant.formula,
        remainingMoles,
        remainingMass: remainingMoles * candidate.reactant.molarMass,
      };
    });

  const unspecifiedReactants = setup.reactants
    .filter((reactant) => !amountByFormula.has(reactant.formula))
    .map((reactant) => reactant.formula);

  let percentYield: number | null = null;

  if (actualYieldGrams !== null) {
    if (!Number.isFinite(actualYieldGrams) || actualYieldGrams < 0) {
      throw new StoichiometryError(
        'invalid-yield',
        'O rendimento obtido deve ser um número maior ou igual a zero.',
      );
    }

    percentYield = theoreticalMass > 0 ? (actualYieldGrams / theoreticalMass) * 100 : null;
  }

  return {
    product,
    limitingFormula: limiting.reactant.formula,
    theoreticalMoles,
    theoreticalMass,
    theoreticalParticles,
    excess,
    percentYield,
    unspecifiedReactants,
  };
}

function toSpecies(term: BalancedTerm): StoichiometrySpecies {
  const { molarMass, isApproximate } = calculateMolarMass(term.formula);

  return {
    formula: term.formula,
    coefficient: term.coefficient,
    molarMass,
    isApproximate,
  };
}
