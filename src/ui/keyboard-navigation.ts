export interface GridKeyboardNavigation {
  refresh(): void;
}

export function enableGridKeyboardNavigation(table: HTMLElement): GridKeyboardNavigation {
  const cells = Array.from(table.querySelectorAll<HTMLButtonElement>('.element-cell'));
  const byPosition = new Map<string, HTMLButtonElement>();

  for (const cell of cells) {
    const x = cell.style.getPropertyValue('--x');
    const y = cell.style.getPropertyValue('--y');
    byPosition.set(`${x},${y}`, cell);
  }

  // Roving tabindex: só uma célula participa da ordem de Tab; as setas movem o foco.
  for (const cell of cells) {
    cell.tabIndex = -1;
  }

  let tabStop: HTMLButtonElement | null = null;
  setTabStop(cells.find((cell) => !cell.disabled) ?? null);

  table.addEventListener('focusin', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const cell = event.target.closest<HTMLButtonElement>('.element-cell');

    if (cell) {
      setTabStop(cell);
    }
  });

  table.addEventListener('keydown', (event) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const cell = event.target.closest<HTMLButtonElement>('.element-cell');
    if (!cell) {
      return;
    }

    const x = Number(cell.style.getPropertyValue('--x'));
    const y = Number(cell.style.getPropertyValue('--y'));

    let dx = 0;
    let dy = 0;

    switch (event.key) {
      case 'ArrowLeft':
        dx = -1;
        break;
      case 'ArrowRight':
        dx = 1;
        break;
      case 'ArrowUp':
        dy = -1;
        break;
      case 'ArrowDown':
        dy = 1;
        break;
      default:
        return;
    }

    event.preventDefault();

    let nextX = x + dx;
    let nextY = y + dy;

    while (nextX >= 1 && nextX <= 18 && nextY >= 1 && nextY <= 10) {
      const next = byPosition.get(`${nextX},${nextY}`);
      if (next && !next.disabled) {
        next.focus();
        return;
      }

      nextX += dx;
      nextY += dy;
    }
  });

  function refresh(): void {
    if (tabStop && !tabStop.disabled) {
      return;
    }

    setTabStop(cells.find((cell) => !cell.disabled) ?? null);
  }

  function setTabStop(cell: HTMLButtonElement | null): void {
    if (tabStop && tabStop !== cell) {
      tabStop.tabIndex = -1;
    }

    tabStop = cell;

    if (cell) {
      cell.tabIndex = 0;
    }
  }

  return { refresh };
}
