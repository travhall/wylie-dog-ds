import { create } from "storybook/theming";
import { chromeExtras, chromePalette } from "./chrome-palette";
import type { Mode } from "./chrome-palette";
import { brandImage } from "./brand-image";
import { fontMono, fontSans } from "./font-stacks";

export type { Mode };

const fonts = { fontBase: fontSans, fontCode: fontMono };

const brand = {
  brandTitle: "Wylie Dog",
  brandUrl: "https://wyliedog.com",
  brandTarget: "_blank",
  appBorderRadius: 8,
  inputBorderRadius: 6,
};

const manager = (mode: Mode) =>
  create({
    base: mode,
    ...brand,
    brandImage: brandImage(mode),
    ...fonts,
    ...chromePalette(mode),
  });

export const lightTheme = manager("light");
export const darkTheme = manager("dark");

/** The manager theme for a resolved mode. */
export const themeFor = (mode: Mode) =>
  mode === "dark" ? darkTheme : lightTheme;

/* Docs pages follow the same palette, so they switch with the toolbar theme. */
export const docsLightTheme = create({
  base: "light",
  ...fonts,
  ...chromePalette("light"),
});
export const docsDarkTheme = create({
  base: "dark",
  ...fonts,
  ...chromePalette("dark"),
});

export { chromeExtras };
