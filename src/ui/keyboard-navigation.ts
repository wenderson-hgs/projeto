export function enableGridKeyboardNavigation(table: HTMLElement): void {
  const cells = Array.from(table.querySelectorAll<HTMLButtonElement>('.element-cell'));
  const byPosition = new Map<string, HTMLButtonElement>();

  for (const cell of cells) {
    const x = cell.style.getPropertyValue('--x');
    const y = cell.style.getPropertyValue('--y');
    byPosition.set(`${x},${y}`, cell);
  }

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
}
