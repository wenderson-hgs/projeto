import { describe, expect, it } from 'vitest';
import { CATEGORY_LABELS, getElementByAtomicNumber } from '../src/lib/elements';
import {
  createQuizRound,
  OPTIONS_PER_QUESTION,
  QUESTIONS_PER_ROUND,
  QUIZ_MODE_LABELS,
  QUIZ_MODES,
  type QuizMode,
  type QuizQuestion,
} from '../src/lib/quiz';
import {
  createEmptyScores,
  QUIZ_STORAGE_KEY,
  readQuizScores,
  saveQuizScore,
  type ScoreStorage,
} from '../src/lib/quiz-storage';

function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function expectedAnswer(mode: QuizMode, question: QuizQuestion): string {
  const element = getElementByAtomicNumber(question.atomicNumber);

  if (!element) {
    throw new Error(`Elemento ${question.atomicNumber} não encontrado.`);
  }

  switch (mode) {
    case 'symbol-to-name':
      return element.namePt;
    case 'name-to-symbol':
      return element.symbol;
    case 'element-category':
      return CATEGORY_LABELS[element.category];
  }
}

function expectedPrompt(mode: QuizMode, question: QuizQuestion): string {
  const element = getElementByAtomicNumber(question.atomicNumber);

  if (!element) {
    throw new Error(`Elemento ${question.atomicNumber} não encontrado.`);
  }

  switch (mode) {
    case 'symbol-to-name':
      return element.symbol;
    case 'name-to-symbol':
      return element.namePt;
    case 'element-category':
      return `${element.namePt} (${element.symbol})`;
  }
}

function createMemoryStorage(): ScoreStorage & { setRaw: (value: string) => void } {
  const data = new Map<string, string>();

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    setRaw: (value) => {
      data.set(QUIZ_STORAGE_KEY, value);
    },
  };
}

describe('createQuizRound', () => {
  it('creates a round with the requested number of unique questions', () => {
    const questions = createQuizRound('symbol-to-name', 10, createRandom(42));

    expect(questions).toHaveLength(QUESTIONS_PER_ROUND);
    expect(new Set(questions.map((question) => question.atomicNumber)).size).toBe(
      QUESTIONS_PER_ROUND,
    );
  });

  it.each(QUIZ_MODES)('creates valid questions for the %s mode', (mode) => {
    const questions = createQuizRound(mode, 10, createRandom(7));

    for (const question of questions) {
      expect(question.question).toBe(
        mode === 'symbol-to-name'
          ? 'Qual é o nome deste elemento?'
          : mode === 'name-to-symbol'
            ? 'Qual é o símbolo deste elemento?'
            : 'A qual categoria pertence este elemento?',
      );
      expect(question.prompt).toBe(expectedPrompt(mode, question));
      expect(question.options).toHaveLength(OPTIONS_PER_QUESTION);
      expect(new Set(question.options).size).toBe(OPTIONS_PER_QUESTION);
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(question.options.length);
      expect(question.options[question.correctIndex]).toBe(expectedAnswer(mode, question));
    }
  });

  it('uses only category labels in the category mode', () => {
    const categoryLabels = new Set(Object.values(CATEGORY_LABELS));
    const questions = createQuizRound('element-category', 10, createRandom(99));

    for (const question of questions) {
      expect(question.options.every((option) => categoryLabels.has(option))).toBe(true);
    }
  });

  it('respects a smaller question count', () => {
    expect(createQuizRound('symbol-to-name', 3, createRandom(1))).toHaveLength(3);
  });

  it('never creates more questions than elements', () => {
    expect(createQuizRound('symbol-to-name', 999, createRandom(1))).toHaveLength(118);
  });

  it('is deterministic when the random function is seeded', () => {
    const first = createQuizRound('name-to-symbol', 10, createRandom(123));
    const second = createQuizRound('name-to-symbol', 10, createRandom(123));

    expect(second).toEqual(first);
  });

  it('provides labels for every mode', () => {
    for (const mode of QUIZ_MODES) {
      expect(QUIZ_MODE_LABELS[mode].length).toBeGreaterThan(0);
    }
  });
});

describe('quiz scores', () => {
  it('returns empty scores without storage', () => {
    expect(readQuizScores(undefined)).toEqual(createEmptyScores());
  });

  it('returns empty scores for invalid JSON', () => {
    const storage = createMemoryStorage();
    storage.setRaw('not-json');

    expect(readQuizScores(storage)).toEqual(createEmptyScores());
  });

  it('ignores invalid fields but keeps valid ones', () => {
    const storage = createMemoryStorage();
    storage.setRaw(
      JSON.stringify({
        'symbol-to-name': { last: 'oito', best: 9 },
        'name-to-symbol': { last: -2, best: 4.9 },
        'element-category': 'inválido',
      }),
    );

    expect(readQuizScores(storage)).toEqual({
      'symbol-to-name': { last: 0, best: 9 },
      'name-to-symbol': { last: 0, best: 4 },
      'element-category': { last: 0, best: 0 },
    });
  });

  it('saves the last score and keeps the best score', () => {
    const storage = createMemoryStorage();

    expect(saveQuizScore(storage, 'symbol-to-name', 7)).toEqual({ last: 7, best: 7 });
    expect(saveQuizScore(storage, 'symbol-to-name', 5)).toEqual({ last: 5, best: 7 });
    expect(saveQuizScore(storage, 'symbol-to-name', 10)).toEqual({ last: 10, best: 10 });
    expect(readQuizScores(storage)['symbol-to-name']).toEqual({ last: 10, best: 10 });
  });

  it('keeps scores of other modes', () => {
    const storage = createMemoryStorage();

    saveQuizScore(storage, 'symbol-to-name', 6);
    saveQuizScore(storage, 'name-to-symbol', 8);

    expect(readQuizScores(storage)).toMatchObject({
      'symbol-to-name': { last: 6, best: 6 },
      'name-to-symbol': { last: 8, best: 8 },
      'element-category': { last: 0, best: 0 },
    });
  });

  it('survives a storage that throws', () => {
    const brokenStorage: ScoreStorage = {
      getItem: () => {
        throw new Error('indisponível');
      },
      setItem: () => {
        throw new Error('indisponível');
      },
    };

    expect(readQuizScores(brokenStorage)).toEqual(createEmptyScores());
    expect(saveQuizScore(brokenStorage, 'symbol-to-name', 5)).toEqual({ last: 5, best: 5 });
  });
});
