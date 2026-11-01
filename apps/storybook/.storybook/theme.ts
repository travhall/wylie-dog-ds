import { create } from "storybook/theming";
import manifest from "@wyliedog/tokens/manifest.json";

/*
 * The Storybook manager (sidebar, toolbar, panels) is its own app and cannot
 * read the design system's CSS variables, so its theme needs concrete colors.
 * They are read from the token manifest and converted from OKLCH, so a change
 * to a brand palette reaches the manager the next time Storybook builds.
 */

type Palette = Record<string, { value: string }>;
const colors = manifest.primitives.colors as unknown as Record<string, Palette>;

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/* OKLCH to sRGB hex (Bjorn Ottosson's OKLab matrices). */
function oklchToHex(css: string): string {
  const match = css.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (!match) throw new Error(`Unsupported color value: ${css}`);
  const [L, C, h] = [match[1], match[2], match[3]].map(Number);
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const encode = (v: number) => {
    const c = clamp(v);
    return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  };
  return (
    "#" +
    linear
      .map((v) =>
        Math.round(encode(v) * 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

const color = (palette: string, step: number) =>
  oklchToHex(colors[palette][String(step)].value);

const fonts = {
  fontBase: '"Manrope", ui-sans-serif, system-ui, sans-serif',
  fontCode: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
};

/* Docs pages keep Storybook's default colors, which the preview's own light and
   dark styles already override; only the brand fonts are set here. */
export const docsTheme = create({ base: "light", ...fonts });

const brand = {
  brandTitle: "Wylie Dog",
  brandUrl: "https://wyliedog.com",
  brandImage: "/favicon.svg",
  brandTarget: "_blank",
  appBorderRadius: 8,
  inputBorderRadius: 6,
};

export const lightTheme = create({
  base: "light",
  ...brand,
  ...fonts,
  colorPrimary: color("fiery-coral", 700),
  colorSecondary: color("fiery-coral", 700),
  appBg: color("sandcastle", 50),
  appContentBg: "#ffffff",
  appPreviewBg: "#ffffff",
  appBorderColor: color("sandcastle", 200),
  textColor: color("black-bear", 950),
  textMutedColor: color("black-bear", 600),
  textInverseColor: "#ffffff",
  barBg: "#ffffff",
  barTextColor: color("black-bear", 600),
  barSelectedColor: color("fiery-coral", 700),
  barHoverColor: color("fiery-coral", 700),
  inputBg: "#ffffff",
  inputBorder: color("sandcastle", 700),
  inputTextColor: color("black-bear", 950),
});

export const darkTheme = create({
  base: "dark",
  ...brand,
  ...fonts,
  colorPrimary: color("fiery-coral", 400),
  colorSecondary: color("fiery-coral", 400),
  appBg: color("polar-night", 950),
  appContentBg: color("polar-night", 900),
  appPreviewBg: color("polar-night", 950),
  appBorderColor: color("polar-night", 800),
  textColor: color("sandcastle", 50),
  textMutedColor: color("sandcastle", 200),
  textInverseColor: color("black-bear", 950),
  barBg: color("polar-night", 900),
  barTextColor: color("sandcastle", 200),
  barSelectedColor: color("fiery-coral", 400),
  barHoverColor: color("fiery-coral", 400),
  inputBg: color("polar-night", 950),
  inputBorder: color("polar-night", 600),
  inputTextColor: color("sandcastle", 50),
});
