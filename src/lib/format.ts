const LOCALE = 'pt-BR';

export function formatDecimal(value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(value: number, fractionDigits = 2): string {
  return `${formatDecimal(value, fractionDigits)}%`;
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits }).format(value);
}

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

export function formatScientific(value: number, significantDigits = 3): string {
  if (!Number.isFinite(value)) {
    return '—';
  }

  if (value === 0) {
    return '0';
  }

  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const rounded = Number((value / 10 ** exponent).toPrecision(significantDigits));
  const needsNormalization = Math.abs(rounded) >= 10;
  const mantissa = needsNormalization ? rounded / 10 : rounded;
  const adjustedExponent = needsNormalization ? exponent + 1 : exponent;
  const formattedMantissa = new Intl.NumberFormat(LOCALE, {
    maximumSignificantDigits: significantDigits,
  }).format(mantissa);

  return `${formattedMantissa} × 10${toSuperscript(adjustedExponent)}`;
}

function toSuperscript(value: number): string {
  const digits = Math.abs(value)
    .toString()
    .split('')
    .map((digit) => SUPERSCRIPT_DIGITS[digit] ?? digit)
    .join('');

  return value < 0 ? `⁻${digits}` : digits;
}
