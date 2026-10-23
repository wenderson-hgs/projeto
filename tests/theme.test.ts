import { describe, expect, it } from 'vitest';
import {
  isTheme,
  readStoredTheme,
  resolveInitialTheme,
  saveTheme,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  toggleTheme,
  type ThemeStorage,
} from '../src/lib/theme';

function createMemoryStorage(initialValue: string | null = null): ThemeStorage & {
  getValue: () => string | null;
} {
  let value = initialValue;

  return {
    getItem: (key) => (key === THEME_STORAGE_KEY ? value : null),
    setItem: (key, storedValue) => {
      if (key === THEME_STORAGE_KEY) {
        value = storedValue;
      }
    },
    getValue: () => value,
  };
}

describe('isTheme', () => {
  it('accepts only light and dark', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('system')).toBe(false);
    expect(isTheme('')).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(1)).toBe(false);
  });
});

describe('readStoredTheme', () => {
  it('returns null without storage', () => {
    expect(readStoredTheme(undefined)).toBeNull();
  });

  it('returns null when no theme was saved', () => {
    expect(readStoredTheme(createMemoryStorage())).toBeNull();
  });

  it('reads valid themes', () => {
    expect(readStoredTheme(createMemoryStorage('light'))).toBe('light');
    expect(readStoredTheme(createMemoryStorage('dark'))).toBe('dark');
  });

  it('ignores invalid values', () => {
    expect(readStoredTheme(createMemoryStorage('sepia'))).toBeNull();
  });

  it('survives a storage that throws', () => {
    const brokenStorage: ThemeStorage = {
      getItem: () => {
        throw new Error('indisponível');
      },
      setItem: () => {
        throw new Error('indisponível');
      },
    };

    expect(readStoredTheme(brokenStorage)).toBeNull();
  });
});

describe('saveTheme', () => {
  it('writes the theme to the expected key', () => {
    const storage = createMemoryStorage();

    saveTheme(storage, 'dark');

    expect(storage.getValue()).toBe('dark');
  });

  it('does nothing without storage', () => {
    expect(() => saveTheme(undefined, 'light')).not.toThrow();
  });

  it('survives a storage that throws', () => {
    const brokenStorage: ThemeStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('indisponível');
      },
    };

    expect(() => saveTheme(brokenStorage, 'dark')).not.toThrow();
  });
});

describe('resolveInitialTheme', () => {
  it('prefers the stored theme over the system preference', () => {
    expect(resolveInitialTheme('light', true)).toBe('light');
    expect(resolveInitialTheme('dark', false)).toBe('dark');
  });

  it('falls back to the system preference', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
    expect(resolveInitialTheme(null, false)).toBe('light');
  });
});

describe('toggleTheme', () => {
  it('alternates between light and dark', () => {
    expect(toggleTheme('light')).toBe('dark');
    expect(toggleTheme('dark')).toBe('light');
  });
});

describe('THEME_COLORS', () => {
  it('provides a browser chrome color for each theme', () => {
    expect(THEME_COLORS.light).toMatch(/^#[0-9a-f]{6}$/);
    expect(THEME_COLORS.dark).toMatch(/^#[0-9a-f]{6}$/);
    expect(THEME_COLORS.light).not.toBe(THEME_COLORS.dark);
  });
});
