/**
 * Colour maths shared across the repo: OKLCH to sRGB and hex, WCAG 2 contrast,
 * APCA contrast, and the lookup of a CSS custom property in built token CSS.
 *
 * The tokens are built in OKLCH, but some surfaces (the Storybook manager theme)
 * need hex, and several places measure contrast. This is the one implementation
 * of that maths: the showcase, the contrast check and the Storybook theme import
 * it instead of carrying their own copies.
 *
 * Colours are CSS strings: `oklch(L C H)`, `oklch(L% C H)` (an alpha of 1 is
 * accepted) or `#rrggbb`. Out-of-gamut OKLCH values are clamped to sRGB.
 */

const OKLCH =
  /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i;
const HEX = /^#([0-9a-f]{6})$/i;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Lightness, chroma and hue of an `oklch()` string. */
export function parseOklch(css) {
  const m = OKLCH.exec(css.trim());
  if (!m) throw new Error(`Unsupported color: ${css}`);
  if (m[5] !== undefined && parseFloat(m[5]) !== 1 && m[5] !== "100%") {
    throw new Error(`Color ${css} has alpha; contrast needs opaque colors`);
  }
  const L = m[2] ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
  return [L, parseFloat(m[3]), parseFloat(m[4])];
}

/** Linear-light sRGB (0 to 1 per channel) of a hex or OKLCH color, clamped to gamut. */
export function toLinearRgb(css) {
  const hex = HEX.exec(css.trim());
  if (hex) {
    return [0, 2, 4].map((i) => {
      const c = parseInt(hex[1].slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
  }
  const [L, C, H] = parseOklch(css);
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    clamp01(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp01(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp01(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/** Gamma-encoded sRGB (0 to 1 per channel). */
export function toRgb(css) {
  return toLinearRgb(css).map((v) =>
    v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
  );
}

/** `#rrggbb` for a hex or OKLCH color. */
export function toHex(css) {
  return (
    "#" +
    toRgb(css)
      .map((v) =>
        Math.round(clamp01(v) * 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

/** WCAG 2 relative luminance. */
export function relativeLuminance(css) {
  const [r, g, b] = toLinearRgb(css);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two colors (1 to 21). */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * APCA lightness contrast (Lc, 0 to about 108) of text on a background, from the
 * SAPC 0.0.98G-4g constants. APCA is the perceptual model proposed for WCAG 3; it
 * rates dark text on a mid-tone fill far lower than the WCAG 2 ratio does. About
 * 60 is the working minimum for body text, 45 for large text. Polarity-aware: the
 * same pair gives a different score with the roles swapped.
 */
export function apcaContrast(textCss, backgroundCss) {
  const luminance = (css) => {
    const [r, g, b] = toRgb(css);
    const y = 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
    return y >= 0.022 ? y : y + (0.022 - y) ** 1.414;
  };
  const yText = luminance(textCss);
  const yBg = luminance(backgroundCss);
  if (Math.abs(yBg - yText) < 0.0005) return 0;
  if (yBg > yText) {
    const sapc = (yBg ** 0.56 - yText ** 0.57) * 1.14;
    return sapc < 0.1 ? 0 : (sapc - 0.027) * 100;
  }
  const sapc = (yBg ** 0.65 - yText ** 0.62) * 1.14;
  return sapc > -0.1 ? 0 : Math.abs((sapc + 0.027) * 100);
}

/** First `--name: value;` declaration in a stylesheet, or null. */
export function findCssVar(css, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|[\\s;{])${escaped}\\s*:\\s*([^;}]+);`).exec(
    css
  );
  return match ? match[1].trim() : null;
}
