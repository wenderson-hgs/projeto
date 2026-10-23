import { CATEGORY_LABELS, CATEGORY_ORDER, type ElementCategory } from '../lib/elements';

export type CategoryFilter = ElementCategory | 'all';

export function createSearchFilter(
  onChange: (query: string, category: CategoryFilter) => void,
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'filter-bar';
  container.setAttribute('role', 'search');

  const queryField = document.createElement('div');
  queryField.className = 'filter-field';

  const queryLabel = document.createElement('label');
  queryLabel.htmlFor = 'element-search';
  queryLabel.textContent = 'Buscar';

  const input = document.createElement('input');
  input.id = 'element-search';
  input.type = 'search';
  input.placeholder = 'Nome, símbolo ou número';
  input.autocomplete = 'off';
  input.spellcheck = false;

  queryField.append(queryLabel, input);

  const categoryField = document.createElement('div');
  categoryField.className = 'filter-field';

  const categoryLabel = document.createElement('label');
  categoryLabel.htmlFor = 'category-filter';
  categoryLabel.textContent = 'Categoria';

  const select = document.createElement('select');
  select.id = 'category-filter';

  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'Todas as categorias';
  select.append(allOption);

  for (const category of CATEGORY_ORDER) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = CATEGORY_LABELS[category];
    select.append(option);
  }

  categoryField.append(categoryLabel, select);

  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'filter-clear';
  clearButton.textContent = 'Limpar';

  const emit = (): void => onChange(input.value, select.value as CategoryFilter);

  input.addEventListener('input', emit);
  select.addEventListener('change', emit);
  clearButton.addEventListener('click', () => {
    input.value = '';
    select.value = 'all';
    emit();
    input.focus();
  });

  container.append(queryField, categoryField, clearButton);
  return container;
}
