/*
 * The Storybook manager (sidebar, toolbar, panels) is its own app and cannot read
 * the design system's CSS variables, and its theme API wants concrete colors. So
 * the palette is read from the semantic tokens, resolved per mode from the built
 * color-modes.json and converted from OKLCH to hex. Changing a token in Figma (primary,
 * accent, a surface, a border) reaches the manager the next time Storybook builds,
 * with no color named here. Each key is the semantic token that plays that part:
 * the action is primary, links and active labels are the link token, a checked
 * control is the accent, and a control's boundary is the control border.
 */
import modes from "@wyliedog/tokens/color-modes.json";
import { toHex } from "@wyliedog/tokens/color";

export type Mode = "light" | "dark";

const colorModes = modes as Record<string, { light: string; dark: string }>;

/** A semantic color token in a mode (color-modes.json already applies Dark's fallback to Light). */
export function tokenValue(mode: Mode, token: string): string {
  const entry = colorModes[`color-${token}`];
  if (!entry)
    throw new Error(`Token --color-${token} not found in color-modes.json`);
  return entry[mode];
}

const hex = (mode: Mode, token: string) => toHex(tokenValue(mode, token));

/** The Storybook theme variables that carry color. */
export function chromePalette(mode: Mode) {
  const t = (token: string) => hex(mode, token);
  return {
    colorPrimary: t("background-primary"),
    // Storybook draws active toolbar labels and links in this color, so it is
    // the link token (readable on both surfaces), not the accent fill.
    colorSecondary: t("foreground-link"),
    appBg: t("background-muted"),
    appContentBg: t("background-default"),
    appPreviewBg: t("background-default"),
    appBorderColor: t("border-muted"),
    textColor: t("foreground-default"),
    textMutedColor: t("foreground-muted"),
    textInverseColor: t("foreground-primary"),
    barBg: t("background-default"),
    barTextColor: t("foreground-muted"),
    barSelectedColor: t("foreground-primary-muted"),
    barHoverColor: t("foreground-primary-muted"),
    inputBg: t("background-default"),
    inputBorder: t("border-emphasis"),
    inputTextColor: t("foreground-default"),
    buttonBg: t("background-muted"),
    buttonBorder: t("border-default"),
    booleanBg: t("background-emphasis"),
    booleanSelectedBg: t("background-default"),
  };
}

/** Colors the theme API does not reach, applied as CSS by the manager. */
export function chromeExtras(mode: Mode) {
  return {
    /** Radios and checkboxes in the panels, which use the browser's accent. */
    control: hex(mode, "background-accent"),
    /** The selected sidebar item: a quiet tint with default text and an accent bar. */
    selectedBg: hex(mode, "background-emphasis"),
    selectedText: hex(mode, "foreground-default"),
    // The link token, not the accent fill: the fill is only 2.5:1 on the Dark tint.
    selectedBar: hex(mode, "foreground-link"),
  };
}

/** The brand image: the accent tile (as in the showcase header) and the wordmark ink. */
export function chromeBrand(mode: Mode) {
  return {
    tile: hex(mode, "background-accent"),
    ink: hex(mode, "foreground-default"),
  };
}
