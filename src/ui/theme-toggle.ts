import {
  readStoredTheme,
  resolveInitialTheme,
  saveTheme,
  toggleTheme,
  THEME_COLORS,
  type Theme,
  type ThemeStorage,
} from '../lib/theme';

export function createThemeToggle(): HTMLButtonElement {
  const storage = getStorage();
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let theme = resolveInitialTheme(readStoredTheme(storage), media.matches);

  applyTheme(theme);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';

  const icon = document.createElement('span');
  icon.className = 'theme-toggle-icon';
  icon.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'theme-toggle-label';

  button.append(icon, label);
  updateButton();

  button.addEventListener('click', () => {
    theme = toggleTheme(theme);
    saveTheme(storage, theme);
    applyTheme(theme);
    updateButton();
  });

  media.addEventListener('change', (event) => {
    if (readStoredTheme(storage) !== null) {
      return;
    }

    theme = event.matches ? 'dark' : 'light';
    applyTheme(theme);
    updateButton();
  });

  function updateButton(): void {
    const nextLabel = theme === 'dark' ? 'Tema claro' : 'Tema escuro';
    button.setAttribute('aria-label', `Ativar ${nextLabel.toLowerCase()}`);
    button.title = `Ativar ${nextLabel.toLowerCase()}`;
    icon.textContent = theme === 'dark' ? '☀' : '☾';
    label.textContent = nextLabel;
  }

  return button;
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
}

function getStorage(): ThemeStorage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
