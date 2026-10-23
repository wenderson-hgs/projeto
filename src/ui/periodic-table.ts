import { CATEGORY_LABELS, CATEGORY_ORDER, type Element } from '../lib/elements';

const PLACEHOLDERS = [
  { xpos: 3, ypos: 6, label: '57–71' },
  { xpos: 3, ypos: 7, label: '89–103' },
];

const F_BLOCK_LABELS = [
  { ypos: 9, label: 'Lantanídeos' },
  { ypos: 10, label: 'Actinídeos' },
];

export function createPeriodicTable(source: Element[]): HTMLElement {
  const table = document.createElement('div');
  table.className = 'periodic-table';
  table.setAttribute('role', 'group');
  table.setAttribute('aria-label', 'Tabela periódica dos elementos');

  for (const element of source) {
    table.append(createElementCell(element));
  }

  for (const placeholder of PLACEHOLDERS) {
    const cell = document.createElement('div');
    cell.className = 'element-placeholder';
    cell.textContent = placeholder.label;
    cell.setAttribute('aria-hidden', 'true');
    cell.style.setProperty('--x', String(placeholder.xpos));
    cell.style.setProperty('--y', String(placeholder.ypos));
    table.append(cell);
  }

  for (const label of F_BLOCK_LABELS) {
    const cell = document.createElement('div');
    cell.className = 'f-block-label';
    cell.textContent = label.label;
    cell.style.setProperty('--y', String(label.ypos));
    table.append(cell);
  }

  return table;
}

function createElementCell(element: Element): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `element-cell category-${element.category}`;
  button.dataset.atomicNumber = String(element.atomicNumber);
  button.dataset.category = element.category;
  button.dataset.predicted = String(element.categoryIsPredicted);
  button.style.setProperty('--x', String(element.xpos));
  button.style.setProperty('--y', String(element.ypos));
  button.setAttribute('aria-controls', 'element-details');
  button.setAttribute('aria-expanded', 'false');

  const categoryLabel = CATEGORY_LABELS[element.category];
  const predictedNote = element.categoryIsPredicted ? ' (categoria prevista)' : '';
  button.setAttribute(
    'aria-label',
    `${element.namePt}, símbolo ${element.symbol}, número atômico ${element.atomicNumber}, ${categoryLabel}${predictedNote}`,
  );
  button.title = `${element.namePt} (${element.nameEn}) — ${categoryLabel}${predictedNote}`;

  const number = document.createElement('span');
  number.className = 'element-number';
  number.textContent = String(element.atomicNumber);

  const symbol = document.createElement('span');
  symbol.className = 'element-symbol';
  symbol.textContent = element.symbol;

  button.append(number, symbol);
  return button;
}

export function createLegend(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'legend-container';

  const legend = document.createElement('ul');
  legend.className = 'legend';
  legend.setAttribute('aria-label', 'Legenda das categorias');

  for (const category of CATEGORY_ORDER) {
    const item = document.createElement('li');
    item.className = 'legend-item';

    const swatch = document.createElement('span');
    swatch.className = `legend-swatch category-${category}`;
    swatch.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.textContent = CATEGORY_LABELS[category];

    item.append(swatch, text);
    legend.append(item);
  }

  const note = document.createElement('p');
  note.className = 'legend-note';
  note.textContent = '* Categoria prevista (elementos superpesados).';

  container.append(legend, note);
  return container;
}
