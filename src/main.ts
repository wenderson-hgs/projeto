import './styles/base.css';
import './styles/table.css';
import './styles/controls.css';
import './styles/details.css';
import './styles/calculator.css';
import './styles/balancer.css';
import './styles/quiz.css';
import {
  elements,
  filterByCategory,
  getElementByAtomicNumber,
  searchElements,
  type Element as ChemicalElement,
} from './lib/elements';
import { createDetailsPanel } from './ui/details-panel';
import { createEquationBalancer } from './ui/balancer';
import { enableGridKeyboardNavigation } from './ui/keyboard-navigation';
import { createMolarMassCalculator } from './ui/molar-mass';
import { createLegend, createPeriodicTable } from './ui/periodic-table';
import { createSearchFilter, type CategoryFilter } from './ui/search-filter';
import { createQuiz } from './ui/quiz';
import { createThemeToggle } from './ui/theme-toggle';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Elemento #app não encontrado');
}

app.replaceChildren();

const skipLink = document.createElement('a');
skipLink.className = 'skip-link';
skipLink.href = '#conteudo';
skipLink.textContent = 'Pular para o conteúdo';

const header = document.createElement('header');
header.className = 'site-header';

const headerTop = document.createElement('div');
headerTop.className = 'site-header-top';

const titleBlock = document.createElement('div');
titleBlock.className = 'site-header-titles';

const title = document.createElement('h1');
title.textContent = 'chem-toolkit';

const subtitle = document.createElement('p');
subtitle.textContent = 'Tabela periódica interativa e ferramentas de química com os 118 elementos.';

titleBlock.append(title, subtitle);
headerTop.append(titleBlock, createThemeToggle());
header.append(headerTop);

const main = document.createElement('main');
main.id = 'conteudo';
main.tabIndex = -1;

const section = document.createElement('section');
section.className = 'table-section';
section.setAttribute('aria-labelledby', 'table-title');

const sectionTitle = document.createElement('h2');
sectionTitle.id = 'table-title';
sectionTitle.textContent = 'Tabela periódica';
sectionTitle.className = 'sr-only';

const scrollHint = document.createElement('p');
scrollHint.className = 'scroll-hint';
scrollHint.textContent = 'Deslize para os lados para ver a tabela completa.';

const table = createPeriodicTable(elements);

const tableWrapper = document.createElement('div');
tableWrapper.className = 'table-wrapper';
tableWrapper.append(table);

const status = document.createElement('p');
status.className = 'filter-status';
status.setAttribute('role', 'status');

const filterBar = createSearchFilter(applyFilters);

const detailsPanel = createDetailsPanel(closeDetails);

let selectedAtomicNumber: number | null = null;

section.append(sectionTitle, scrollHint, filterBar, status, tableWrapper, createLegend());
main.append(section, createMolarMassCalculator(), createEquationBalancer(), createQuiz());

const footer = document.createElement('footer');
footer.className = 'site-footer';
footer.append(
  document.createTextNode('Dados: '),
  createLink('https://github.com/Bowserinator/Periodic-Table-JSON', 'Periodic-Table-JSON'),
  document.createTextNode(' (CC BY-SA 3.0) · Nomes: '),
  createLink('https://www.wikidata.org/', 'Wikidata'),
  document.createTextNode(' (CC0) · '),
  createLink('https://github.com/wenderson-hgs/projeto', 'Código no GitHub'),
);

app.append(skipLink, header, main, detailsPanel.element, footer);

table.addEventListener('click', handleTableClick);
enableGridKeyboardNavigation(table);
document.addEventListener('keydown', handleGlobalKeydown);
applyFilters('', 'all');

function handleTableClick(event: MouseEvent): void {
  if (!(event.target instanceof Element)) {
    return;
  }

  const cell = event.target.closest<HTMLButtonElement>('.element-cell');

  if (!cell) {
    return;
  }

  const element = getElementByAtomicNumber(Number(cell.dataset.atomicNumber));

  if (!element) {
    return;
  }

  if (selectedAtomicNumber === element.atomicNumber) {
    closeDetails();
    return;
  }

  showDetails(element, cell);
}

function showDetails(element: ChemicalElement, cell: HTMLButtonElement): void {
  if (selectedAtomicNumber !== null) {
    const previousCell = findCell(selectedAtomicNumber);
    previousCell?.classList.remove('is-selected');
    previousCell?.setAttribute('aria-expanded', 'false');
  }

  selectedAtomicNumber = element.atomicNumber;
  cell.classList.add('is-selected');
  cell.setAttribute('aria-expanded', 'true');
  detailsPanel.show(element);
}

function closeDetails(restoreFocus = true): void {
  const cell = selectedAtomicNumber === null ? null : findCell(selectedAtomicNumber);

  if (cell) {
    cell.classList.remove('is-selected');
    cell.setAttribute('aria-expanded', 'false');
  }

  selectedAtomicNumber = null;
  detailsPanel.hide();

  if (restoreFocus && cell && !cell.disabled) {
    cell.focus();
  }
}

function findCell(atomicNumber: number): HTMLButtonElement | null {
  return table.querySelector<HTMLButtonElement>(
    `.element-cell[data-atomic-number="${atomicNumber}"]`,
  );
}

function handleGlobalKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !detailsPanel.isOpen()) {
    return;
  }

  event.preventDefault();
  closeDetails();
}

function applyFilters(query: string, category: CategoryFilter): void {
  const matches = filterByCategory(category, searchElements(query));
  const matchedNumbers = new Set(matches.map((element) => element.atomicNumber));

  for (const cell of table.querySelectorAll<HTMLButtonElement>('.element-cell')) {
    const isMatch = matchedNumbers.has(Number(cell.dataset.atomicNumber));
    cell.disabled = !isMatch;
  }

  if (selectedAtomicNumber !== null && !matchedNumbers.has(selectedAtomicNumber)) {
    closeDetails(false);
  }

  status.textContent = buildStatusMessage(matches.length);
}

function buildStatusMessage(count: number): string {
  if (count === elements.length) {
    return `Mostrando todos os ${elements.length} elementos.`;
  }

  if (count === 0) {
    return 'Nenhum elemento encontrado. Ajuste a busca ou a categoria.';
  }

  const noun = count === 1 ? 'elemento encontrado' : 'elementos encontrados';
  return `${count} ${noun} de ${elements.length}.`;
}

function createLink(href: string, text: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  link.target = '_blank';
  link.rel = 'noreferrer';
  return link;
}
