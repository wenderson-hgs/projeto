import {
  BalanceError,
  balanceEquation,
  formatBalancedEquation,
  type BalancedEquation,
} from '../lib/balancer';

const EXAMPLES = [
  'H2 + O2 -> H2O',
  'Fe + O2 -> Fe2O3',
  'C3H8 + O2 -> CO2 + H2O',
  'KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2',
];

export function createEquationBalancer(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'balancer-section';
  section.setAttribute('aria-labelledby', 'balancer-title');

  const card = document.createElement('div');
  card.className = 'balancer-card';

  const title = document.createElement('h2');
  title.id = 'balancer-title';
  title.textContent = 'Balanceador de equações';

  const description = document.createElement('p');
  description.className = 'balancer-description';
  description.textContent =
    'Digite reagentes e produtos para encontrar os menores coeficientes inteiros.';

  const form = document.createElement('form');
  form.className = 'balancer-form';
  form.noValidate = true;

  const label = document.createElement('label');
  label.htmlFor = 'equation-input';
  label.textContent = 'Equação química';

  const row = document.createElement('div');
  row.className = 'equation-row';

  const input = document.createElement('input');
  input.id = 'equation-input';
  input.name = 'equation';
  input.type = 'text';
  input.placeholder = 'Ex.: Fe + O2 -> Fe2O3';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('aria-describedby', 'equation-hint');
  input.setAttribute('aria-errormessage', 'equation-error');

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'balance-button';
  submitButton.textContent = 'Balancear';

  row.append(input, submitButton);

  const hint = document.createElement('p');
  hint.id = 'equation-hint';
  hint.className = 'equation-hint';
  hint.textContent = 'Separe reagentes e produtos com ->, = ou →. Coeficientes são opcionais.';

  form.append(label, row, hint);

  const examples = document.createElement('div');
  examples.className = 'equation-examples';

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
      input.value = equation;
      runBalance();
      input.focus();
      input.select();
    });
    examples.append(button);
  }

  const output = document.createElement('div');
  output.className = 'balancer-output';
  output.setAttribute('aria-live', 'polite');

  const error = document.createElement('p');
  error.id = 'equation-error';
  error.className = 'balancer-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;

  const result = document.createElement('div');
  result.className = 'balancer-result';
  result.hidden = true;

  const resultLabel = document.createElement('p');
  resultLabel.className = 'balancer-result-label';
  resultLabel.textContent = 'Equação balanceada:';

  const resultEquation = document.createElement('p');
  resultEquation.className = 'balanced-equation';

  result.append(resultLabel, resultEquation);
  output.append(error, result);

  card.append(title, description, form, examples, output);
  section.append(card);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runBalance();
  });

  input.addEventListener('input', () => {
    error.hidden = true;
    input.removeAttribute('aria-invalid');
  });

  function runBalance(): void {
    try {
      const balanced = balanceEquation(input.value);
      showResult(balanced);
    } catch (caught) {
      if (caught instanceof BalanceError) {
        showError(caught.message);
        return;
      }

      showError('Não foi possível balancear. Verifique a equação e tente novamente.');
    }
  }

  function showError(message: string): void {
    error.textContent = message;
    error.hidden = false;
    result.hidden = true;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }

  function showResult(balanced: BalancedEquation): void {
    resultEquation.textContent = formatBalancedEquation(balanced);
    error.hidden = true;
    input.removeAttribute('aria-invalid');
    result.hidden = false;
  }

  return section;
}
