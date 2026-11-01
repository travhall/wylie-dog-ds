/**
 * WCAG contrast ratio for OKLCH color strings, so the showcase can show real
 * numbers instead of invented ones. The maths lives in the tokens package, shared
 * with the contrast check and the Storybook theme.
 */

export {
  contrastRatio,
  parseOklch,
  relativeLuminance,
} from "@wyliedog/tokens/color";

/** Highest WCAG level a ratio reaches for normal text, or null. */
export function wcagLevel(ratio: number): "AAA" | "AA" | null {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return null;
}
