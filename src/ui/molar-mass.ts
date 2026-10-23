import { calculateMolarMass, FormulaError, type MolarMassResult } from '../lib/molar-mass';

const EXAMPLES = ['H2O', 'Ca(OH)2', 'Fe2(SO4)3', 'K4[Fe(CN)6]', 'CuSO4·5H2O'];

export function createMolarMassCalculator(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'calculator-section';
  section.setAttribute('aria-labelledby', 'calculator-title');

  const card = document.createElement('div');
  card.className = 'calculator-card';

  const title = document.createElement('h2');
  title.id = 'calculator-title';
  title.textContent = 'Calculadora de massa molar';

  const description = document.createElement('p');
  description.className = 'calculator-description';
  description.textContent =
    'Digite uma fórmula química para calcular a massa molar e a composição percentual.';

  const form = document.createElement('form');
  form.className = 'calculator-form';
  form.noValidate = true;

  const label = document.createElement('label');
  label.htmlFor = 'formula-input';
  label.textContent = 'Fórmula química';

  const row = document.createElement('div');
  row.className = 'formula-row';

  const input = document.createElement('input');
  input.id = 'formula-input';
  input.name = 'formula';
  input.type = 'text';
  input.placeholder = 'Ex.: Ca(OH)2';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('aria-describedby', 'formula-hint');
  input.setAttribute('aria-errormessage', 'formula-error');

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'calculate-button';
  submitButton.textContent = 'Calcular';

  row.append(input, submitButton);

  const hint = document.createElement('p');
  hint.id = 'formula-hint';
  hint.className = 'formula-hint';
  hint.textContent = 'Aceita parênteses, colchetes e hidratos como CuSO4·5H2O (use ·, . ou *).';

  form.append(label, row, hint);

  const examples = document.createElement('div');
  examples.className = 'formula-examples';

  const examplesLabel = document.createElement('span');
  examplesLabel.className = 'examples-label';
  examplesLabel.textContent = 'Exemplos:';
  examples.append(examplesLabel);

  for (const formula of EXAMPLES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'example-button';
    button.textContent = formula;
    button.addEventListener('click', () => {
      input.value = formula;
      runCalculation();
      input.focus();
      input.select();
    });
    examples.append(button);
  }

  const output = document.createElement('div');
  output.className = 'calculator-output';
  output.setAttribute('aria-live', 'polite');

  const error = document.createElement('p');
  error.id = 'formula-error';
  error.className = 'calculator-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;

  const result = document.createElement('div');
  result.className = 'calculator-result';
  result.hidden = true;

  const resultFormula = document.createElement('p');
  resultFormula.className = 'result-formula';

  const resultFormulaLabel = document.createElement('span');
  resultFormulaLabel.textContent = 'Fórmula: ';

  const resultFormulaValue = document.createElement('strong');

  resultFormula.append(resultFormulaLabel, resultFormulaValue);

  const resultTotal = document.createElement('p');
  resultTotal.className = 'result-total';

  const resultTotalLabel = document.createElement('span');
  resultTotalLabel.textContent = 'Massa molar: ';

  const resultTotalValue = document.createElement('strong');

  resultTotal.append(resultTotalLabel, resultTotalValue);

  const warning = document.createElement('p');
  warning.className = 'result-warning';
  warning.textContent =
    'Resultado aproximado: um ou mais elementos não têm massa atômica padrão da IUPAC.';
  warning.hidden = true;

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'composition-wrapper';

  const table = document.createElement('table');
  table.className = 'composition-table';

  const caption = document.createElement('caption');
  caption.className = 'sr-only';
  caption.textContent = 'Composição percentual da fórmula';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');

  const columns = [
    { label: 'Elemento', numeric: false },
    { label: 'Quantidade', numeric: true },
    { label: 'Massa (g/mol)', numeric: true },
    { label: 'Percentual', numeric: true },
  ];

  for (const column of columns) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = column.label;

    if (column.numeric) {
      cell.className = 'numeric';
    }

    headRow.append(cell);
  }

  thead.append(headRow);

  const tbody = document.createElement('tbody');

  table.append(caption, thead, tbody);
  tableWrapper.append(table);

  result.append(resultFormula, resultTotal, warning, tableWrapper);
  output.append(error, result);

  card.append(title, description, form, examples, output);
  section.append(card);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runCalculation();
  });

  input.addEventListener('input', () => {
    error.hidden = true;
    input.removeAttribute('aria-invalid');
  });

  function runCalculation(): void {
    try {
      const calculation = calculateMolarMass(input.value);
      showResult(calculation);
    } catch (caught) {
      if (caught instanceof FormulaError) {
        showError(caught.message);
        return;
      }

      showError('Não foi possível calcular. Verifique a fórmula e tente novamente.');
    }
  }

  function showError(message: string): void {
    error.textContent = message;
    error.hidden = false;
    result.hidden = true;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }

  function showResult(calculation: MolarMassResult): void {
    resultFormulaValue.textContent = calculation.formula;
    resultTotalValue.textContent = `${formatMass(calculation.molarMass)} g/mol`;
    warning.hidden = !calculation.isApproximate;
    caption.textContent = `Composição percentual de ${calculation.formula}`;

    tbody.replaceChildren();

    for (const entry of calculation.composition) {
      const tableRow = document.createElement('tr');

      const elementCell = document.createElement('th');
      elementCell.scope = 'row';

      const symbol = document.createElement('span');
      symbol.className = 'composition-symbol';
      symbol.textContent = entry.symbol;

      const name = document.createElement('span');
      name.className = 'composition-name';
      name.textContent = entry.namePt;

      elementCell.append(symbol, name);
      tableRow.append(
        elementCell,
        createCell(String(entry.count), 'numeric'),
        createCell(formatMass(entry.mass), 'numeric'),
        createCell(formatPercent(entry.percent), 'numeric'),
      );

      tbody.append(tableRow);
    }

    error.hidden = true;
    input.removeAttribute('aria-invalid');
    result.hidden = false;
  }

  return section;
}

function createCell(text: string, className: string): HTMLTableCellElement {
  const cell = document.createElement('td');
  cell.className = className;
  cell.textContent = text;
  return cell;
}

function formatMass(value: number): string {
  return value.toFixed(3);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}
