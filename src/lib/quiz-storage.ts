import { QUIZ_MODES, type QuizMode } from './quiz';

export interface QuizScore {
  last: number;
  best: number;
}

export type QuizScores = Record<QuizMode, QuizScore>;

export type ScoreStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const QUIZ_STORAGE_KEY = 'chem-toolkit.quiz.scores';

export function createEmptyScores(): QuizScores {
  return {
    'symbol-to-name': { last: 0, best: 0 },
    'name-to-symbol': { last: 0, best: 0 },
    'element-category': { last: 0, best: 0 },
  };
}

export function readQuizScores(storage: ScoreStorage | undefined): QuizScores {
  const scores = createEmptyScores();

  if (!storage) {
    return scores;
  }

  try {
    const raw = storage.getItem(QUIZ_STORAGE_KEY);

    if (!raw) {
      return scores;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) {
      return scores;
    }

    for (const mode of QUIZ_MODES) {
      const entry = parsed[mode];

      if (isRecord(entry)) {
        scores[mode] = {
          last: normalizeScore(entry.last),
          best: normalizeScore(entry.best),
        };
      }
    }
  } catch {
    return createEmptyScores();
  }

  return scores;
}

export function saveQuizScore(
  storage: ScoreStorage | undefined,
  mode: QuizMode,
  score: number,
): QuizScore {
  const scores = readQuizScores(storage);
  const normalizedScore = normalizeScore(score);
  const updated: QuizScore = {
    last: normalizedScore,
    best: Math.max(scores[mode].best, normalizedScore),
  };

  scores[mode] = updated;

  if (storage) {
    try {
      storage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(scores));
    } catch {
      // Sem persistência disponível: a pontuação ainda é exibida nesta sessão.
    }
  }

  return updated;
}

function normalizeScore(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
