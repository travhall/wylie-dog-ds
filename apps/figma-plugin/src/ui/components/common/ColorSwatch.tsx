import { h } from "preact";

/** Whether a value string is a CSS-renderable color (hex/oklch/rgb/hsl). */
export function isColorValue(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const s = value.trim();
  return (
    s.startsWith("#") ||
    s.startsWith("oklch(") ||
    s.startsWith("rgb(") ||
    s.startsWith("hsl(")
  );
}

/** Small color preview swatch — modern Chromium (Figma's iframe) renders oklch. */
export function ColorSwatch({ value }: { value: string }) {
  return (
    <span
      aria-hidden="true"
      title={value}
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "2px",
        background: value,
        border: "1px solid var(--border-default)",
        marginRight: "4px",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    />
  );
}
