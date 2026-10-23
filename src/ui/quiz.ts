import {
  saveQuizScore,
  readQuizScores,
  type QuizScore,
  type ScoreStorage,
} from '../lib/quiz-storage';
import {
  createQuizRound,
  QUESTIONS_PER_ROUND,
  QUIZ_MODE_LABELS,
  QUIZ_MODES,
  type QuizMode,
  type QuizQuestion,
} from '../lib/quiz';

export function createQuiz(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'quiz-section';
  section.setAttribute('aria-labelledby', 'quiz-title');

  const card = document.createElement('div');
  card.className = 'quiz-card';

  const title = document.createElement('h2');
  title.id = 'quiz-title';
  title.textContent = 'Quiz';

  const description = document.createElement('p');
  description.className = 'quiz-description';
  description.textContent = 'Teste seus conhecimentos sobre os elementos químicos.';

  const setup = document.createElement('div');
  setup.className = 'quiz-setup';

  const modesFieldset = document.createElement('fieldset');
  modesFieldset.className = 'quiz-modes';

  const modesLegend = document.createElement('legend');
  modesLegend.textContent = 'Escolha o modo';

  modesFieldset.append(modesLegend);

  const modeInputs: HTMLInputElement[] = [];

  for (const mode of QUIZ_MODES) {
    const label = document.createElement('label');
    label.className = 'quiz-mode';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'quiz-mode';
    input.value = mode;
    input.checked = mode === 'symbol-to-name';
    input.id = `quiz-mode-${mode}`;

    const text = document.createElement('span');
    text.textContent = QUIZ_MODE_LABELS[mode];

    label.append(input, text);
    modesFieldset.append(label);
    modeInputs.push(input);
  }

  const setupRow = document.createElement('div');
  setupRow.className = 'quiz-setup-row';

  const best = document.createElement('p');
  best.className = 'quiz-best';

  const startButton = document.createElement('button');
  startButton.type = 'button';
  startButton.className = 'quiz-start';
  startButton.textContent = 'Começar quiz';

  setupRow.append(best, startButton);
  setup.append(modesFieldset, setupRow);

  const play = document.createElement('div');
  play.className = 'quiz-play';
  play.hidden = true;

  const meta = document.createElement('div');
  meta.className = 'quiz-meta';

  const progress = document.createElement('p');
  progress.className = 'quiz-progress';

  const scoreLabel = document.createElement('p');
  scoreLabel.className = 'quiz-score';

  meta.append(progress, scoreLabel);

  const questionText = document.createElement('p');
  questionText.className = 'quiz-question';

  const prompt = document.createElement('p');
  prompt.className = 'quiz-prompt';

  const promptBlock = document.createElement('div');
  promptBlock.className = 'quiz-prompt-block';
  promptBlock.tabIndex = -1;
  promptBlock.append(questionText, prompt);

  const options = document.createElement('div');
  options.className = 'quiz-options';
  options.setAttribute('role', 'group');
  options.setAttribute('aria-label', 'Alternativas');

  const feedback = document.createElement('p');
  feedback.className = 'quiz-feedback';
  feedback.setAttribute('role', 'status');
  feedback.hidden = true;

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'quiz-next';
  nextButton.textContent = 'Próxima pergunta';
  nextButton.hidden = true;

  play.append(meta, promptBlock, options, feedback, nextButton);

  const result = document.createElement('div');
  result.className = 'quiz-result';
  result.hidden = true;

  const resultTitle = document.createElement('h3');
  resultTitle.className = 'quiz-result-title';
  resultTitle.textContent = 'Resultado';

  const resultText = document.createElement('p');
  resultText.className = 'quiz-result-text';
  resultText.tabIndex = -1;

  const resultRecord = document.createElement('p');
  resultRecord.className = 'quiz-result-record';

  const againButton = document.createElement('button');
  againButton.type = 'button';
  againButton.className = 'quiz-again';
  againButton.textContent = 'Jogar novamente';

  result.append(resultTitle, resultText, resultRecord, againButton);

  card.append(title, description, setup, play, result);
  section.append(card);

  const storage = getStorage();
  const scores = readQuizScores(storage);

  let mode: QuizMode = 'symbol-to-name';
  let round: QuizQuestion[] = [];
  let currentIndex = 0;
  let currentScore = 0;
  let answered = false;

  updateBestLine();

  for (const [index, input] of modeInputs.entries()) {
    input.addEventListener('change', () => {
      if (input.checked) {
        mode = QUIZ_MODES[index];
        updateBestLine();
      }
    });
  }

  startButton.addEventListener('click', () => {
    startRound();
  });

  againButton.addEventListener('click', () => {
    startRound();
  });

  nextButton.addEventListener('click', () => {
    currentIndex += 1;

    if (currentIndex >= round.length) {
      finishRound();
      return;
    }

    renderQuestion();
  });

  function startRound(): void {
    mode = getSelectedMode();
    round = createQuizRound(mode);
    currentIndex = 0;
    currentScore = 0;
    answered = false;

    modesFieldset.disabled = true;
    startButton.hidden = true;
    result.hidden = true;
    play.hidden = false;
    updateBestLine();
    renderQuestion();
  }

  function renderQuestion(): void {
    const question = round[currentIndex];

    if (!question) {
      finishRound();
      return;
    }

    answered = false;
    progress.textContent = `Pergunta ${currentIndex + 1} de ${round.length}`;
    scoreLabel.textContent = `Pontos: ${currentScore}`;
    questionText.textContent = question.question;
    prompt.textContent = question.prompt;
    options.replaceChildren();
    feedback.hidden = true;
    feedback.classList.remove('is-correct', 'is-incorrect');
    nextButton.hidden = true;
    nextButton.textContent =
      currentIndex === round.length - 1 ? 'Ver resultado' : 'Próxima pergunta';

    question.options.forEach((option, optionIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option';
      button.textContent = option;
      button.addEventListener('click', () => {
        selectOption(optionIndex, button);
      });
      options.append(button);
    });

    promptBlock.focus();
  }

  function selectOption(selectedIndex: number, selectedButton: HTMLButtonElement): void {
    if (answered) {
      return;
    }

    answered = true;

    const question = round[currentIndex];
    const isCorrect = selectedIndex === question.correctIndex;

    if (isCorrect) {
      currentScore += 1;
      scoreLabel.textContent = `Pontos: ${currentScore}`;
    }

    const optionButtons = options.querySelectorAll<HTMLButtonElement>('.quiz-option');

    optionButtons.forEach((button, optionIndex) => {
      button.disabled = true;

      if (optionIndex === question.correctIndex) {
        button.classList.add('is-correct');
      }
    });

    if (!isCorrect) {
      selectedButton.classList.add('is-incorrect');
    }

    feedback.textContent = isCorrect
      ? 'Correto!'
      : `Incorreto. A resposta certa é ${question.options[question.correctIndex]}.`;
    feedback.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
    feedback.hidden = false;
    nextButton.hidden = false;
    nextButton.focus();
  }

  function finishRound(): void {
    const updated = saveQuizScore(storage, mode, currentScore);
    scores[mode] = updated;
    play.hidden = true;
    result.hidden = false;
    resultText.textContent = `Você acertou ${currentScore} de ${round.length}.`;
    resultRecord.textContent = formatScores(updated, round.length);
    modesFieldset.disabled = false;
    updateBestLine();
    resultText.focus();
  }

  function updateBestLine(): void {
    best.textContent = `Recorde neste modo: ${scores[mode].best}/${QUESTIONS_PER_ROUND}`;
  }

  function getSelectedMode(): QuizMode {
    const selected = modeInputs.find((input) => input.checked);
    const selectedMode = selected?.value;

    return QUIZ_MODES.find((candidate) => candidate === selectedMode) ?? 'symbol-to-name';
  }

  return section;
}

function formatScores(score: QuizScore, total: number): string {
  return `Última pontuação: ${score.last}/${total} · Recorde: ${score.best}/${total}`;
}

function getStorage(): ScoreStorage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
