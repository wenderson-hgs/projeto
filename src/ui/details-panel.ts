import { CATEGORY_LABELS, formatAtomicMass, type Element } from '../lib/elements';

export interface DetailsPanel {
  element: HTMLElement;
  show(element: Element): void;
  hide(): void;
  isOpen(): boolean;
}

export function createDetailsPanel(onClose: () => void): DetailsPanel {
  const panel = document.createElement('aside');
  panel.id = 'element-details';
  panel.className = 'details-panel';
  panel.hidden = true;
  panel.setAttribute('aria-live', 'polite');
  panel.setAttribute('aria-label', 'Detalhes do elemento');

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'details-close';
  closeButton.textContent = 'Fechar';
  closeButton.addEventListener('click', onClose);

  const symbol = document.createElement('span');
  symbol.className = 'details-symbol';

  const names = document.createElement('div');
  names.className = 'details-names';

  const namePt = document.createElement('h2');
  namePt.className = 'details-name';

  const nameEn = document.createElement('p');
  nameEn.className = 'details-name-en';

  names.append(namePt, nameEn);

  const header = document.createElement('div');
  header.className = 'details-header';
  header.append(symbol, names, closeButton);

  const list = document.createElement('dl');
  list.className = 'details-list';

  const rows = {
    atomicNumber: createRow('Número atômico'),
    atomicMass: createRow('Massa atômica'),
    category: createRow('Categoria'),
    group: createRow('Grupo'),
    period: createRow('Período'),
  };

  for (const row of Object.values(rows)) {
    list.append(row.term, row.description);
  }

  panel.append(header, list);

  function show(element: Element): void {
    symbol.textContent = element.symbol;
    symbol.className = `details-symbol category-${element.category}`;
    namePt.textContent = element.namePt;
    nameEn.textContent = element.nameEn;

    rows.atomicNumber.description.textContent = String(element.atomicNumber);
    rows.atomicMass.description.textContent =
      formatAtomicMass(element) +
      (element.atomicMassIsApproximate ? ' (isótopo mais estável)' : '');
    rows.category.description.textContent =
      CATEGORY_LABELS[element.category] + (element.categoryIsPredicted ? ' (prevista)' : '');
    rows.group.description.textContent =
      element.category === 'lanthanide' || element.category === 'actinide'
        ? '—'
        : String(element.group);
    rows.period.description.textContent = String(element.period);

    panel.hidden = false;
  }

  function hide(): void {
    panel.hidden = true;
  }

  function isOpen(): boolean {
    return !panel.hidden;
  }

  return { element: panel, show, hide, isOpen };
}

function createRow(label: string): { term: HTMLElement; description: HTMLElement } {
  const term = document.createElement('dt');
  term.textContent = label;

  const description = document.createElement('dd');

  return { term, description };
}
