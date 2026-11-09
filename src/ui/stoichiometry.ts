import { BalanceError, formatBalancedEquation } from '../lib/balancer';
import { formatDecimal, formatPercent, formatScientific } from '../lib/format';
import {
  calculateStoichiometry,
  prepareStoichiometry,
  StoichiometryError,
  type AmountUnit,
  type ReactantAmount,
  type StoichiometryResult,
  type StoichiometrySetup,
  type StoichiometrySpecies,
} from '../lib/stoichiometry';

const EXAMPLES = ['H2 + O2 -> H2O', 'Fe + O2 -> Fe2O3', 'C3H8 + O2 -> CO2 + H2O'];

interface ReactantRow {
  species: StoichiometrySpecies;
  input: HTMLInputElement;
  unit: HTMLSelectElement;
}

export function createStoichiometry(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'stoichiometry-section';
  section.setAttribute('aria-labelledby', 'stoichiometry-title');

  const card = document.createElement('div');
  card.className = 'stoichiometry-card';

  const title = document.createElement('h2');
  title.id = 'stoichiometry-title';
  title.textContent = 'Estequiometria';

  const description = document.createElement('p');
  description.className = 'stoichiometry-description';
  description.textContent =
    'Calcule reagente limitante, rendimento teórico e excesso a partir de uma equação química.';

  const equationForm = document.createElement('form');
  equationForm.className = 'stoichiometry-form';
  equationForm.noValidate = true;

  const equationLabel = document.createElement('label');
  equationLabel.htmlFor = 'stoichiometry-equation';
  equationLabel.textContent = 'Equação química';

  const equationRow = document.createElement('div');
  equationRow.className = 'stoichiometry-equation-row';

  const equationInput = document.createElement('input');
  equationInput.id = 'stoichiometry-equation';
  equationInput.name = 'equation';
  equationInput.type = 'text';
  equationInput.placeholder = 'Ex.: H2 + O2 -> H2O';
  equationInput.autocomplete = 'off';
  equationInput.spellcheck = false;
  equationInput.setAttribute('aria-describedby', 'stoichiometry-hint');
  equationInput.setAttribute('aria-errormessage', 'stoichiometry-error');

  const prepareButton = document.createElement('button');
  prepareButton.type = 'submit';
  prepareButton.className = 'stoichiometry-primary';
  prepareButton.textContent = 'Preparar equação';

  equationRow.append(equationInput, prepareButton);

  const hint = document.createElement('p');
  hint.id = 'stoichiometry-hint';
  hint.className = 'stoichiometry-hint';
  hint.textContent = 'Use ->, = ou →. Os coeficientes são calculados automaticamente.';

  equationForm.append(equationLabel, equationRow, hint);

  const examples = document.createElement('div');
  examples.className = 'stoichiometry-examples';

  const examplesLabel = document.createElement('span');
  examplesLabel.className = 'examples-label';
  examplesLabel.textContent = 'Exemplos:';
  examples.append(examplesLabel);

  for (const equation of EXAMPLES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'example-button';
    button.textContent = equation;
    button.addEventListener('click', () => {
      equationInput.value = equation;
      prepareEquation();
    });
    examples.append(button);
  }

  const equationError = document.createElement('p');
  equationError.id = 'stoichiometry-error';
  equationError.className = 'stoichiometry-error';
  equationError.setAttribute('role', 'alert');
  equationError.hidden = true;

  const setupArea = document.createElement('div');
  setupArea.className = 'stoichiometry-setup';
  setupArea.hidden = true;

  const balancedLabel = document.createElement('p');
  balancedLabel.className = 'stoichiometry-balanced-label';
  balancedLabel.textContent = 'Equação balanceada:';

  const balancedEquation = document.createElement('p');
  balancedEquation.className = 'stoichiometry-balanced-equation';

  const calculationForm = document.createElement('form');
  calculationForm.className = 'stoichiometry-calculation-form';
  calculationForm.noValidate = true;

  const reactantsFieldset = document.createElement('fieldset');
  reactantsFieldset.className = 'stoichiometry-reactants';

  const reactantsLegend = document.createElement('legend');
  reactantsLegend.textContent = 'Quantidades dos reagentes';

  const reactantsHint = document.createElement('p');
  reactantsHint.className = 'stoichiometry-hint';
  reactantsHint.textContent =
    'Preencha pelo menos um reagente. Deixe os demais em branco para não considerá-los.';

  const reactantsList = document.createElement('div');
  reactantsList.className = 'stoichiometry-reactant-list';

  reactantsFieldset.append(reactantsLegend, reactantsHint, reactantsList);

  const productRow = document.createElement('div');
  productRow.className = 'stoichiometry-field-row';

  const productLabel = document.createElement('label');
  productLabel.htmlFor = 'stoichiometry-product';
  productLabel.textContent = 'Produto para calcular';

  const productSelect = document.createElement('select');
  productSelect.id = 'stoichiometry-product';
  productSelect.name = 'product';

  productRow.append(productLabel, productSelect);

  const yieldRow = document.createElement('div');
  yieldRow.className = 'stoichiometry-field-row';

  const yieldLabel = document.createElement('label');
  yieldLabel.htmlFor = 'stoichiometry-actual-yield';
  yieldLabel.textContent = 'Massa obtida (g) — opcional';

  const yieldInput = document.createElement('input');
  yieldInput.id = 'stoichiometry-actual-yield';
  yieldInput.name = 'actual-yield';
  yieldInput.type = 'text';
  yieldInput.inputMode = 'decimal';
  yieldInput.autocomplete = 'off';
  yieldInput.placeholder = 'Ex.: 30';
  yieldInput.setAttribute('aria-describedby', 'stoichiometry-yield-hint');

  const yieldHint = document.createElement('p');
  yieldHint.id = 'stoichiometry-yield-hint';
  yieldHint.className = 'stoichiometry-hint';
  yieldHint.textContent = 'Informe a massa realmente obtida para calcular o rendimento percentual.';

  yieldRow.append(yieldLabel, yieldInput, yieldHint);

  const calculateButton = document.createElement('button');
  calculateButton.type = 'submit';
  calculateButton.className = 'stoichiometry-primary';
  calculateButton.textContent = 'Calcular';

  calculationForm.append(reactantsFieldset, productRow, yieldRow, calculateButton);

  const calculationError = document.createElement('p');
  calculationError.className = 'stoichiometry-error';
  calculationError.setAttribute('role', 'alert');
  calculationError.hidden = true;

  const result = document.createElement('div');
  result.className = 'stoichiometry-result';
  result.setAttribute('aria-live', 'polite');
  result.hidden = true;

  const resultTitle = document.createElement('h3');
  resultTitle.textContent = 'Resultado';
  resultTitle.tabIndex = -1;

  const limitingLine = document.createElement('p');
  limitingLine.className = 'stoichiometry-highlight';

  const yieldLine = document.createElement('p');
  yieldLine.className = 'stoichiometry-highlight';

  const excessList = document.createElement('ul');
  excessList.className = 'stoichiometry-excess';

  const percentYieldLine = document.createElement('p');
  percentYieldLine.className = 'stoichiometry-highlight';
  percentYieldLine.hidden = true;

  const notes = document.createElement('div');
  notes.className = 'stoichiometry-notes';

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'stoichiometry-table-wrapper';

  const table = document.createElement('table');
  table.className = 'stoichiometry-table';

  const caption = document.createElement('caption');
  caption.className = 'sr-only';
  caption.textContent = 'Massas molares das substâncias da equação';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');

  for (const column of [
    { label: 'Substância', numeric: false },
    { label: 'Coeficiente', numeric: true },
    { label: 'Massa molar (g/mol)', numeric: true },
  ]) {
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

  result.append(
    resultTitle,
    limitingLine,
    yieldLine,
    excessList,
    percentYieldLine,
    notes,
    tableWrapper,
  );

  setupArea.append(balancedLabel, balancedEquation, calculationForm, calculationError, result);

  card.append(title, description, equationForm, examples, equationError, setupArea);
  section.append(card);

  let setup: StoichiometrySetup | null = null;
  let reactantRows: ReactantRow[] = [];

  equationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    prepareEquation();
  });

  equationInput.addEventListener('input', () => {
    equationError.hidden = true;
    equationInput.removeAttribute('aria-invalid');

    if (setup) {
      setup = null;
      setupArea.hidden = true;
      result.hidden = true;
      calculationError.hidden = true;
    }
  });

  calculationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    calculate();
  });

  productSelect.addEventListener('change', clearResult);
  yieldInput.addEventListener('input', () => {
    yieldInput.removeAttribute('aria-invalid');
    clearResult();
  });

  function prepareEquation(): void {
    try {
      const prepared = prepareStoichiometry(equationInput.value);

      setup = prepared;
      showSetup(prepared);
    } catch (caught) {
      if (caught instanceof BalanceError) {
        showEquationError(caught.message);
        return;
      }

      showEquationError(
        'Não foi possível preparar a equação. Verifique os compostos e tente novamente.',
      );
    }
  }

  function showSetup(prepared: StoichiometrySetup): void {
    equationError.hidden = true;
    equationInput.removeAttribute('aria-invalid');
    calculationError.hidden = true;
    result.hidden = true;

    balancedEquation.textContent = formatBalancedEquation(prepared.equation);

    reactantsList.replaceChildren();
    reactantRows = prepared.reactants.map((species, index) => {
      const row = document.createElement('div');
      row.className = 'stoichiometry-reactant-row';

      const label = document.createElement('label');
      label.htmlFor = `stoichiometry-reactant-${index}`;

      const formula = document.createElement('span');
      formula.textContent = species.formula;

      const molarMass = document.createElement('span');
      molarMass.textContent = `${formatDecimal(species.molarMass, 3)} g/mol`;

      label.append(formula, molarMass);

      const input = document.createElement('input');
      input.id = `stoichiometry-reactant-${index}`;
      input.name = `reactant-${index}`;
      input.type = 'text';
      input.inputMode = 'decimal';
      input.autocomplete = 'off';
      input.placeholder = '0';
      input.setAttribute(
        'aria-label',
        `Quantidade de ${species.formula} (massa molar ${formatDecimal(species.molarMass, 3)} g/mol)`,
      );

      const unit = document.createElement('select');
      unit.setAttribute('aria-label', `Unidade da quantidade de ${species.formula}`);

      for (const value of ['g', 'mol'] as AmountUnit[]) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        unit.append(option);
      }

      input.addEventListener('input', () => {
        input.removeAttribute('aria-invalid');
        clearResult();
      });

      unit.addEventListener('change', clearResult);

      row.append(label, input, unit);
      reactantsList.append(row);

      return { species, input, unit };
    });

    productSelect.replaceChildren();

    for (const product of prepared.products) {
      const option = document.createElement('option');
      option.value = product.formula;
      option.textContent =
        product.coefficient === 1 ? product.formula : `${product.coefficient} ${product.formula}`;
      productSelect.append(option);
    }

    yieldInput.value = '';
    yieldInput.removeAttribute('aria-invalid');

    setupArea.hidden = false;

    const firstInput = reactantRows[0]?.input;

    if (firstInput) {
      firstInput.focus();
    } else {
      productSelect.focus();
    }
  }

  function calculate(): void {
    if (!setup) {
      return;
    }

    for (const row of reactantRows) {
      row.input.removeAttribute('aria-invalid');
    }

    yieldInput.removeAttribute('aria-invalid');

    const amounts: ReactantAmount[] = [];

    for (const row of reactantRows) {
      const rawValue = row.input.value.trim();

      if (rawValue === '') {
        continue;
      }

      const value = parseAmount(rawValue);

      if (value === null || value <= 0) {
        showCalculationError(`Informe uma quantidade positiva para ${row.species.formula}.`);
        row.input.setAttribute('aria-invalid', 'true');
        row.input.focus();
        return;
      }

      amounts.push({
        formula: row.species.formula,
        value,
        unit: row.unit.value as AmountUnit,
      });
    }

    const rawYield = yieldInput.value.trim();
    const actualYield = rawYield === '' ? null : parseAmount(rawYield);

    if (rawYield !== '' && (actualYield === null || actualYield < 0)) {
      showCalculationError('Informe uma massa obtida válida ou deixe o campo em branco.');
      yieldInput.setAttribute('aria-invalid', 'true');
      yieldInput.focus();
      return;
    }

    try {
      const calculation = calculateStoichiometry(setup, amounts, productSelect.value, actualYield);

      showResult(calculation, setup);
    } catch (caught) {
      if (caught instanceof StoichiometryError) {
        showCalculationError(caught.message);

        if (caught.code === 'no-amount') {
          reactantRows[0]?.input.focus();
        }

        if (caught.code === 'unknown-product') {
          productSelect.focus();
        }

        return;
      }

      showCalculationError('Não foi possível calcular. Verifique os valores e tente novamente.');
    }
  }

  function showResult(calculation: StoichiometryResult, currentSetup: StoichiometrySetup): void {
    calculationError.hidden = true;
    result.hidden = false;

    limitingLine.textContent = `Reagente limitante: ${calculation.limitingFormula}`;

    yieldLine.textContent =
      `Rendimento teórico de ${calculation.product.formula}: ` +
      `${formatDecimal(calculation.theoreticalMoles, 3)} mol · ` +
      `${formatDecimal(calculation.theoreticalMass, 3)} g · ` +
      `${formatScientific(calculation.theoreticalParticles)} partículas`;

    excessList.replaceChildren();

    if (calculation.excess.length === 0) {
      excessList.hidden = true;
    } else {
      excessList.hidden = false;

      for (const excess of calculation.excess) {
        const item = document.createElement('li');
        item.textContent =
          `${excess.formula}: ${formatDecimal(excess.remainingMoles, 3)} mol · ` +
          `${formatDecimal(excess.remainingMass, 3)} g restantes`;
        excessList.append(item);
      }
    }

    if (calculation.percentYield === null) {
      percentYieldLine.hidden = true;
    } else {
      percentYieldLine.hidden = false;
      percentYieldLine.textContent =
        `Rendimento percentual: ${formatPercent(calculation.percentYield)}` +
        (calculation.percentYield > 100 ? ' (acima de 100%; confira a massa obtida).' : '');
    }

    notes.replaceChildren();

    if (calculation.unspecifiedReactants.length > 0) {
      const note = document.createElement('p');
      note.className = 'stoichiometry-note';
      note.textContent =
        `Sem quantidade informada: ${calculation.unspecifiedReactants.join(', ')}. ` +
        'O cálculo considera apenas os reagentes preenchidos.';
      notes.append(note);
    }

    const approximateSpecies = [...currentSetup.reactants, ...currentSetup.products].filter(
      (species) => species.isApproximate,
    );

    if (approximateSpecies.length > 0) {
      const note = document.createElement('p');
      note.className = 'stoichiometry-note';
      note.textContent =
        'Resultado aproximado: um ou mais compostos usam massa atômica do isótopo mais estável.';
      notes.append(note);
    }

    caption.textContent = 'Massas molares das substâncias da equação';
    tbody.replaceChildren();

    for (const species of [...currentSetup.reactants, ...currentSetup.products]) {
      const row = document.createElement('tr');

      const formula = document.createElement('th');
      formula.scope = 'row';
      formula.textContent = species.isApproximate ? `${species.formula} *` : species.formula;

      row.append(
        formula,
        createCell(String(species.coefficient), 'numeric'),
        createCell(formatDecimal(species.molarMass, 3), 'numeric'),
      );
      tbody.append(row);
    }

    resultTitle.focus();
  }

  function showEquationError(message: string): void {
    equationError.textContent = message;
    equationError.hidden = false;
    equationInput.setAttribute('aria-invalid', 'true');
    setup = null;
    setupArea.hidden = true;
    result.hidden = true;
    calculationError.hidden = true;
    equationInput.focus();
  }

  function showCalculationError(message: string): void {
    calculationError.textContent = message;
    calculationError.hidden = false;
    result.hidden = true;
  }

  function clearResult(): void {
    calculationError.hidden = true;
    result.hidden = true;
  }

  return section;
}

function parseAmount(value: string): number | null {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function createCell(text: string, className: string): HTMLTableCellElement {
  const cell = document.createElement('td');
  cell.className = className;
  cell.textContent = text;
  return cell;
}
