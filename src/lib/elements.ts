import rawElements from '../data/elements.json';

export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth-metal'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export interface Element {
  atomicNumber: number;
  symbol: string;
  namePt: string;
  nameEn: string;
  atomicMass: number;
  atomicMassIsApproximate: boolean;
  category: ElementCategory;
  categoryIsPredicted: boolean;
  group: number;
  period: number;
  xpos: number;
  ypos: number;
}

export const elements = rawElements as Element[];

export const CATEGORY_ORDER: ElementCategory[] = [
  'alkali-metal',
  'alkaline-earth-metal',
  'transition-metal',
  'post-transition-metal',
  'metalloid',
  'nonmetal',
  'noble-gas',
  'lanthanide',
  'actinide',
];

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  'alkali-metal': 'Metal alcalino',
  'alkaline-earth-metal': 'Metal alcalino-terroso',
  'transition-metal': 'Metal de transição',
  'post-transition-metal': 'Metal pós-transição',
  metalloid: 'Semimetal',
  nonmetal: 'Não metal',
  'noble-gas': 'Gás nobre',
  lanthanide: 'Lantanídeo',
  actinide: 'Actinídeo',
};

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function searchElements(query: string, source: Element[] = elements): Element[] {
  const normalizedQuery = normalizeText(query.trim());

  if (normalizedQuery === '') {
    return source;
  }

  return source.filter((element) => {
    return (
      normalizeText(element.namePt).includes(normalizedQuery) ||
      normalizeText(element.nameEn).includes(normalizedQuery) ||
      normalizeText(element.symbol).includes(normalizedQuery) ||
      String(element.atomicNumber) === normalizedQuery
    );
  });
}

export function filterByCategory(
  category: ElementCategory | 'all',
  source: Element[] = elements,
): Element[] {
  if (category === 'all') {
    return source;
  }

  return source.filter((element) => element.category === category);
}

export function getElementByAtomicNumber(atomicNumber: number): Element | undefined {
  return elements.find((element) => element.atomicNumber === atomicNumber);
}

export function formatAtomicMass(element: Element): string {
  if (element.atomicMassIsApproximate) {
    return `[${element.atomicMass}]`;
  }

  return element.atomicMass.toFixed(3);
}
