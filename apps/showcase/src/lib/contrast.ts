/**
 * WCAG contrast ratio for OKLCH color strings, so the showcase can show real
 * numbers instead of invented ones. Handles the `oklch(L C H)` form the tokens
 * are built in (L as 0-1, no alpha).
 */

const OKLCH = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/;

export function parseOklch(value: string): [number, number, number] {
  const m = OKLCH.exec(value.trim());
  if (!m) throw new Error(`Unsupported color: ${value}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** Relative luminance (WCAG) of an OKLCH color, clamped to the sRGB gamut. */
export function relativeLuminance(value: string): number {
  const [L, C, H] = parseOklch(value);
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  const r = clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bl = clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);

  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}

/** WCAG contrast ratio between two OKLCH colors (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Highest WCAG level a ratio reaches for normal text, or null. */
export function wcagLevel(ratio: number): "AAA" | "AA" | null {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return null;
}
