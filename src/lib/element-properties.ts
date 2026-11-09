import type { DensityUnit, Element, ElementPhase } from './elements';
import { formatNumber } from './format';

export const PHASE_LABELS: Record<ElementPhase, string> = {
  solid: 'Sólido',
  liquid: 'Líquido',
  gas: 'Gasoso',
};

const GROUP_LABELS: Record<number, string> = {
  1: 'metais alcalinos',
  2: 'metais alcalino-terrosos',
  3: 'metais de transição',
  4: 'metais de transição',
  5: 'metais de transição',
  6: 'metais de transição',
  7: 'metais de transição',
  8: 'metais de transição',
  9: 'metais de transição',
  10: 'metais de transição',
  11: 'metais de transição',
  12: 'metais de transição',
  13: 'grupo do boro',
  14: 'grupo do carbono',
  15: 'grupo do nitrogênio',
  16: 'calcogênios',
  17: 'halogênios',
  18: 'gases nobres',
};

const DENSITY_UNIT_LABELS: Record<DensityUnit, string> = {
  'g/L': 'g/L',
  'g/cm3': 'g/cm³',
};

export function formatGroup(element: Element): string {
  if (element.category === 'lanthanide' || element.category === 'actinide') {
    return '—';
  }

  if (element.atomicNumber === 1) {
    return 'Grupo 1 — hidrogênio';
  }

  const label = GROUP_LABELS[element.group];
  return label ? `Grupo ${element.group} — ${label}` : `Grupo ${element.group}`;
}

export function formatPeriod(element: Element): string {
  return `Período ${element.period}`;
}

export function formatPhase(element: Element): string {
  return PHASE_LABELS[element.phase];
}

export function formatElectronConfiguration(element: Element): string {
  return element.electronConfiguration || '—';
}

export function formatElectronegativity(element: Element): string {
  return element.electronegativity === null ? '—' : formatNumber(element.electronegativity, 2);
}

export function formatMeltingPoint(element: Element): string {
  return formatKelvinAsCelsius(element.meltingPointK);
}

export function formatBoilingPoint(element: Element): string {
  return formatKelvinAsCelsius(element.boilingPointK);
}

export function formatDensity(element: Element): string {
  if (element.density === null || element.densityUnit === null) {
    return '—';
  }

  return `${formatNumber(element.density, 5)} ${DENSITY_UNIT_LABELS[element.densityUnit]}`;
}

export function formatBlock(element: Element): string {
  return element.block;
}

function formatKelvinAsCelsius(kelvin: number | null): string {
  if (kelvin === null) {
    return '—';
  }

  return `${formatNumber(kelvin - 273.15, 1)} °C`;
}
