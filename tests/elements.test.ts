import { describe, expect, it } from 'vitest';
import {
  CATEGORY_LABELS,
  elements,
  filterByCategory,
  formatAtomicMass,
  getElementByAtomicNumber,
  getElementBySymbol,
  searchElements,
} from '../src/lib/elements';

describe('elements data', () => {
  it('has 118 elements with unique atomic numbers', () => {
    expect(elements).toHaveLength(118);

    const numbers = new Set(elements.map((element) => element.atomicNumber));
    expect(numbers.size).toBe(118);
    expect(Math.min(...numbers)).toBe(1);
    expect(Math.max(...numbers)).toBe(118);
  });

  it('has unique symbols and grid positions', () => {
    expect(new Set(elements.map((element) => element.symbol)).size).toBe(118);
    expect(new Set(elements.map((element) => `${element.xpos},${element.ypos}`)).size).toBe(118);
  });

  it('has required fields for every element', () => {
    for (const element of elements) {
      expect(element.namePt).toBeTruthy();
      expect(element.nameEn).toBeTruthy();
      expect(element.atomicMass).toBeGreaterThan(0);
      expect(element.group).toBeGreaterThanOrEqual(1);
      expect(element.group).toBeLessThanOrEqual(18);
      expect(element.period).toBeGreaterThanOrEqual(1);
      expect(element.period).toBeLessThanOrEqual(7);
      expect(element.xpos).toBeGreaterThanOrEqual(1);
      expect(element.xpos).toBeLessThanOrEqual(18);
      expect(element.ypos).toBeGreaterThanOrEqual(1);
      expect(element.ypos).toBeLessThanOrEqual(10);
      expect(CATEGORY_LABELS[element.category]).toBeTruthy();
    }
  });

  it('matches known atomic masses', () => {
    const expected: Record<string, number> = {
      H: 1.008,
      C: 12.011,
      O: 15.999,
      Fe: 55.845,
      Au: 196.967,
    };

    for (const [symbol, mass] of Object.entries(expected)) {
      const element = elements.find((item) => item.symbol === symbol);
      expect(element).toBeDefined();
      expect(element!.atomicMass).toBeCloseTo(mass, 2);
    }
  });

  it('uses Brazilian Portuguese names', () => {
    const bySymbol = new Map(elements.map((element) => [element.symbol, element]));

    expect(bySymbol.get('N')?.namePt).toBe('Nitrogênio');
    expect(bySymbol.get('O')?.namePt).toBe('Oxigênio');
    expect(bySymbol.get('Fe')?.namePt).toBe('Ferro');
    expect(bySymbol.get('Au')?.namePt).toBe('Ouro');
  });

  it('marks approximate masses', () => {
    const technetium = elements.find((element) => element.symbol === 'Tc');
    expect(technetium?.atomicMassIsApproximate).toBe(true);
    expect(technetium?.atomicMass).toBe(98);

    const hydrogen = elements.find((element) => element.symbol === 'H');
    expect(hydrogen?.atomicMassIsApproximate).toBe(false);
  });
});

describe('searchElements', () => {
  it('returns all elements for an empty query', () => {
    expect(searchElements('')).toHaveLength(118);
    expect(searchElements('   ')).toHaveLength(118);
  });

  it('finds by Portuguese name without accents', () => {
    const result = searchElements('hidrogenio');
    expect(result.map((element) => element.symbol)).toContain('H');
  });

  it('finds by English name', () => {
    const result = searchElements('iron');
    expect(result.map((element) => element.symbol)).toContain('Fe');
  });

  it('finds by symbol', () => {
    const result = searchElements('Au');
    expect(result.map((element) => element.symbol)).toContain('Au');
  });

  it('finds by atomic number', () => {
    const result = searchElements('26');
    expect(result.map((element) => element.symbol)).toContain('Fe');
    expect(result).toHaveLength(1);
  });
});

describe('filterByCategory', () => {
  it('returns all elements for "all"', () => {
    expect(filterByCategory('all')).toHaveLength(118);
  });

  it('filters lanthanides and actinides', () => {
    expect(filterByCategory('lanthanide')).toHaveLength(15);
    expect(filterByCategory('actinide')).toHaveLength(15);
  });

  it('filters noble gases', () => {
    expect(filterByCategory('noble-gas')).toHaveLength(7);
  });

  it('keeps only the requested category in a custom source', () => {
    const result = filterByCategory('nonmetal', elements.slice(0, 10));
    expect(result.every((element) => element.category === 'nonmetal')).toBe(true);
  });
});

describe('combined search and category filter', () => {
  it('finds a noble gas by Portuguese name', () => {
    const result = filterByCategory('noble-gas', searchElements('argonio'));
    expect(result.map((element) => element.symbol)).toEqual(['Ar']);
  });

  it('excludes results from other categories', () => {
    expect(filterByCategory('noble-gas', searchElements('ferro'))).toHaveLength(0);
  });

  it('combines a symbol search with a category', () => {
    const result = filterByCategory('nonmetal', searchElements('n'));
    expect(result.every((element) => element.category === 'nonmetal')).toBe(true);
    expect(result.map((element) => element.symbol)).toContain('N');
  });
});

describe('getElementByAtomicNumber', () => {
  it('finds elements by atomic number', () => {
    expect(getElementByAtomicNumber(1)?.symbol).toBe('H');
    expect(getElementByAtomicNumber(26)?.symbol).toBe('Fe');
    expect(getElementByAtomicNumber(118)?.symbol).toBe('Og');
  });

  it('returns undefined for unknown atomic numbers', () => {
    expect(getElementByAtomicNumber(0)).toBeUndefined();
    expect(getElementByAtomicNumber(119)).toBeUndefined();
    expect(getElementByAtomicNumber(-1)).toBeUndefined();
  });
});

describe('getElementBySymbol', () => {
  it('finds elements by symbol', () => {
    expect(getElementBySymbol('H')?.atomicNumber).toBe(1);
    expect(getElementBySymbol('Fe')?.namePt).toBe('Ferro');
    expect(getElementBySymbol('Og')?.atomicNumber).toBe(118);
  });

  it('returns undefined for unknown symbols and wrong case', () => {
    expect(getElementBySymbol('Xx')).toBeUndefined();
    expect(getElementBySymbol('fe')).toBeUndefined();
    expect(getElementBySymbol('')).toBeUndefined();
  });
});

describe('formatAtomicMass', () => {
  it('formats standard masses with 3 decimals', () => {
    const hydrogen = elements.find((element) => element.symbol === 'H')!;
    expect(formatAtomicMass(hydrogen)).toBe('1.008');
  });

  it('formats approximate masses in brackets', () => {
    const technetium = elements.find((element) => element.symbol === 'Tc')!;
    expect(formatAtomicMass(technetium)).toBe('[98]');
  });
});
