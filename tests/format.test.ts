import { describe, expect, it } from 'vitest';
import { formatDecimal, formatNumber, formatPercent, formatScientific } from '../src/lib/format';

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

describe('formatNumber', () => {
  it('omits trailing zeros', () => {
    expect(formatNumber(7.874, 5)).toBe('7,874');
    expect(formatNumber(2.2, 2)).toBe('2,2');
    expect(formatNumber(18, 1)).toBe('18');
  });

  it('rounds to the maximum number of decimals', () => {
    expect(formatNumber(1537.85, 1)).toBe('1.537,9');
    expect(formatNumber(0.08988, 5)).toBe('0,08988');
  });
});

describe('formatScientific', () => {
  it('formats large values with a comma decimal separator and superscript exponent', () => {
    expect(formatScientific(6.02214076e23)).toBe('6,02 × 10²³');
    expect(formatScientific(1.1949e24)).toBe('1,19 × 10²⁴');
  });

  it('formats negative exponents and zero', () => {
    expect(formatScientific(1e-3)).toBe('1 × 10⁻³');
    expect(formatScientific(0)).toBe('0');
  });

  it('accepts a custom number of significant digits', () => {
    expect(formatScientific(12.34, 4)).toBe('1,234 × 10¹');
  });

  it('normalizes a mantissa that rounds up to 10', () => {
    expect(formatScientific(9.999e23)).toBe('1 × 10²⁴');
    expect(formatScientific(-9.999e23)).toBe('-1 × 10²⁴');
  });

  it('uses a dash for non-finite values', () => {
    expect(formatScientific(Number.NaN)).toBe('—');
  });
});
