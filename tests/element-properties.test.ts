import { describe, expect, it } from 'vitest';
import {
  formatBlock,
  formatBoilingPoint,
  formatDensity,
  formatElectronConfiguration,
  formatElectronegativity,
  formatGroup,
  formatMeltingPoint,
  formatPeriod,
  formatPhase,
} from '../src/lib/element-properties';
import { getElementByAtomicNumber, type Element } from '../src/lib/elements';

function element(atomicNumber: number): Element {
  const found = getElementByAtomicNumber(atomicNumber);

  if (!found) {
    throw new Error(`Elemento ${atomicNumber} não encontrado.`);
  }

  return found;
}

describe('group and period labels', () => {
  it('labels transition metals, halogens and noble gases', () => {
    expect(formatGroup(element(26))).toBe('Grupo 8 — metais de transição');
    expect(formatGroup(element(17))).toBe('Grupo 17 — halogênios');
    expect(formatGroup(element(10))).toBe('Grupo 18 — gases nobres');
    expect(formatGroup(element(5))).toBe('Grupo 13 — grupo do boro');
  });

  it('labels hydrogen separately from the alkali metals', () => {
    expect(formatGroup(element(1))).toBe('Grupo 1 — hidrogênio');
  });

  it('omits the group for lanthanides and actinides', () => {
    expect(formatGroup(element(57))).toBe('—');
    expect(formatGroup(element(89))).toBe('—');
  });

  it('formats the period', () => {
    expect(formatPeriod(element(1))).toBe('Período 1');
    expect(formatPeriod(element(26))).toBe('Período 4');
  });
});

describe('physical properties', () => {
  it('translates the physical state', () => {
    expect(formatPhase(element(1))).toBe('Gasoso');
    expect(formatPhase(element(26))).toBe('Sólido');
    expect(formatPhase(element(80))).toBe('Líquido');
  });

  it('shows the electron configuration', () => {
    expect(formatElectronConfiguration(element(1))).toBe('1s1');
    expect(formatElectronConfiguration(element(26))).toBe('[Ar] 3d6 4s2');
  });

  it('formats electronegativity and handles missing values', () => {
    expect(formatElectronegativity(element(26))).toBe('1,83');
    expect(formatElectronegativity(element(8))).toBe('3,44');
    expect(formatElectronegativity(element(2))).toBe('—');
  });

  it('converts melting and boiling points from kelvin to celsius', () => {
    expect(formatMeltingPoint(element(26))).toBe('1.537,9 °C');
    expect(formatBoilingPoint(element(26))).toBe('2.860,9 °C');
    expect(formatMeltingPoint(element(1))).toBe('-259,2 °C');
    expect(formatBoilingPoint(element(1))).toBe('-252,9 °C');
  });

  it('uses a dash for missing temperatures', () => {
    expect(formatBoilingPoint(element(6))).toBe('—');
    expect(formatMeltingPoint(element(105))).toBe('—');
  });

  it('formats density with the source unit', () => {
    expect(formatDensity(element(26))).toBe('7,874 g/cm³');
    expect(formatDensity(element(1))).toBe('0,08988 g/L');
    expect(formatDensity(element(100))).toBe('—');
  });

  it('shows the block', () => {
    expect(formatBlock(element(1))).toBe('s');
    expect(formatBlock(element(8))).toBe('p');
    expect(formatBlock(element(26))).toBe('d');
    expect(formatBlock(element(57))).toBe('f');
  });
});
