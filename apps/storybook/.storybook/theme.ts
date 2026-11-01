import { create } from "storybook/theming";
import { chromeExtras, chromePalette } from "./chrome-palette";
import type { Mode } from "./chrome-palette";
import { fontMono, fontSans } from "./font-stacks";

export type { Mode };

const fonts = { fontBase: fontSans, fontCode: fontMono };

const brand = {
  brandTitle: "Wylie Dog",
  brandUrl: "https://wyliedog.com",
  brandImage: "/favicon.svg",
  brandTarget: "_blank",
  appBorderRadius: 8,
  inputBorderRadius: 6,
};

type StorybookTheme = ReturnType<typeof create>;

/*
 * The sidebar chevrons use `color.ultraviolet`, which Storybook sets from a fixed
 * constant and no theme variable reaches, so it is replaced on the built theme.
 * `create` is typed as returning the variables, but at runtime it returns the full
 * theme, hence the cast.
 */
function withExtras(theme: StorybookTheme, mode: Mode): StorybookTheme {
  const built = theme as unknown as { color: Record<string, string> };
  return {
    ...theme,
    color: { ...built.color, ultraviolet: chromeExtras(mode).chevron },
  } as unknown as StorybookTheme;
}

const manager = (mode: Mode) =>
  withExtras(
    create({ base: mode, ...brand, ...fonts, ...chromePalette(mode) }),
    mode
  );

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
