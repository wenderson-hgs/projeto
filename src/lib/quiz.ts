import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  elements,
  type Element,
  type ElementCategory,
} from './elements';

export type QuizMode = 'symbol-to-name' | 'name-to-symbol' | 'element-category';

export const QUIZ_MODES: QuizMode[] = ['symbol-to-name', 'name-to-symbol', 'element-category'];

export const QUIZ_MODE_LABELS: Record<QuizMode, string> = {
  'symbol-to-name': 'Símbolo → nome',
  'name-to-symbol': 'Nome → símbolo',
  'element-category': 'Categoria do elemento',
};

export const QUESTIONS_PER_ROUND = 10;
export const OPTIONS_PER_QUESTION = 4;

export interface QuizQuestion {
  atomicNumber: number;
  question: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

const QUESTION_TEXTS: Record<QuizMode, string> = {
  'symbol-to-name': 'Qual é o nome deste elemento?',
  'name-to-symbol': 'Qual é o símbolo deste elemento?',
  'element-category': 'A qual categoria pertence este elemento?',
};

export function createQuizRound(
  mode: QuizMode,
  count = QUESTIONS_PER_ROUND,
  random: () => number = Math.random,
): QuizQuestion[] {
  const targets = shuffle(elements, random).slice(0, Math.min(count, elements.length));

  return targets.map((element) => buildQuestion(mode, element, random));
}

function buildQuestion(mode: QuizMode, element: Element, random: () => number): QuizQuestion {
  const correctAnswer = getCorrectAnswer(mode, element);
  const distractors = getDistractors(mode, element, random);
  const options = shuffle([correctAnswer, ...distractors], random);

  return {
    atomicNumber: element.atomicNumber,
    question: QUESTION_TEXTS[mode],
    prompt: getPrompt(mode, element),
    options,
    correctIndex: options.indexOf(correctAnswer),
  };
}

function getPrompt(mode: QuizMode, element: Element): string {
  switch (mode) {
    case 'symbol-to-name':
      return element.symbol;
    case 'name-to-symbol':
      return element.namePt;
    case 'element-category':
      return `${element.namePt} (${element.symbol})`;
  }
}

function getCorrectAnswer(mode: QuizMode, element: Element): string {
  switch (mode) {
    case 'symbol-to-name':
      return element.namePt;
    case 'name-to-symbol':
      return element.symbol;
    case 'element-category':
      return CATEGORY_LABELS[element.category];
  }
}

function getDistractors(mode: QuizMode, element: Element, random: () => number): string[] {
  if (mode === 'element-category') {
    const otherCategories = CATEGORY_ORDER.filter(
      (category: ElementCategory) => category !== element.category,
    );

    return shuffle(otherCategories, random)
      .slice(0, OPTIONS_PER_QUESTION - 1)
      .map((category) => CATEGORY_LABELS[category]);
  }

  return shuffle(
    elements.filter((candidate) => candidate.atomicNumber !== element.atomicNumber),
    random,
  )
    .slice(0, OPTIONS_PER_QUESTION - 1)
    .map((candidate) => (mode === 'symbol-to-name' ? candidate.namePt : candidate.symbol));
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.min(index, Math.floor(random() * (index + 1)));
    [result[index], result[target]] = [result[target], result[index]];
  }

  return result;
}
