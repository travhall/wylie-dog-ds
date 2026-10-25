/**
 * token-units.ts
 *
 * The token source and Figma hold px; the built CSS and manifest hold rem for
 * spacing, font size and radius (1rem = 16px, the browser default root size).
 * Token pages show both, so the value in code and the value in Figma read
 * side by side.
 */

const REM_BASE_PX = 16;

/** A manifest size value ("0.75rem", "4px" or a bare number) as pixels. */
export function toPx(value: string | number): number {
  if (typeof value === "number") return value;
  const n = parseFloat(value);
  if (Number.isNaN(n)) return 0;
  return value.trim().endsWith("rem") ? n * REM_BASE_PX : n;
}

/** "0.75rem (12px)" for a rem value; a px value is returned unchanged. */
export function formatSize(value: string | number): string {
  const text = String(value);
  return text.trim().endsWith("rem") ? `${text} (${toPx(text)}px)` : text;
}
