import { describe, expect, it } from 'vitest';
import { formatDecimal, formatPercent } from '../src/lib/format';

describe('formatDecimal', () => {
  it('uses a comma as the decimal separator', () => {
    expect(formatDecimal(74.0924, 3)).toBe('74,092');
    expect(formatDecimal(1.008, 3)).toBe('1,008');
    expect(formatDecimal(54.09, 2)).toBe('54,09');
  });

  it('keeps the requested number of decimal places', () => {
    expect(formatDecimal(18, 3)).toBe('18,000');
    expect(formatDecimal(0.5, 3)).toBe('0,500');
  });

  it('uses a dot as the thousands separator', () => {
    expect(formatDecimal(1234.5, 3)).toBe('1.234,500');
  });
});

describe('formatPercent', () => {
  it('formats percentages with two decimals by default', () => {
    expect(formatPercent(54.09)).toBe('54,09%');
    expect(formatPercent(11.19)).toBe('11,19%');
  });

  it('accepts a custom number of decimals', () => {
    expect(formatPercent(100, 1)).toBe('100,0%');
  });
});
