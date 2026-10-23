export type Theme = 'light' | 'dark';

export type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const THEME_STORAGE_KEY = 'chem-toolkit.theme';

export const THEME_COLORS: Record<Theme, string> = {
  light: '#f8fafc',
  dark: '#0f172a',
};

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export function readStoredTheme(storage: ThemeStorage | undefined): Theme | null {
  if (!storage) {
    return null;
  }

  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveTheme(storage: ThemeStorage | undefined, theme: Theme): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Sem persistência disponível: o tema ainda vale para a sessão atual.
  }
}

export function resolveInitialTheme(stored: Theme | null, prefersDark: boolean): Theme {
  if (stored) {
    return stored;
  }

  return prefersDark ? 'dark' : 'light';
}

export function toggleTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}
