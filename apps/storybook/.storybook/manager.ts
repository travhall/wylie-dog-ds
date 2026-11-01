import { addons } from "storybook/manager-api";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import "./font-faces";
import { chromeExtras, themeFor } from "./theme";
import type { Mode } from "./theme";

type Choice = "light" | "dark" | "system";

const STORAGE_KEY = "storybook-theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

/*
 * The manager and the preview are separate apps. The toolbar's theme control
 * drives the preview (theme-sync.ts), so the manager follows the same choice: the
 * stored value when it first loads, then every change the toolbar makes, and the
 * system preference while the choice is "system".
 */
function storedChoice(): Choice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage can be blocked; fall back to the system preference.
  }
  return "system";
}

const resolve = (choice: Choice): Mode =>
  choice === "system"
    ? window.matchMedia(MEDIA_QUERY).matches
      ? "dark"
      : "light"
    : choice;

/*
 * What the theme API cannot reach: radios and checkboxes in the panels use the
 * browser's accent color, and the selected sidebar item gets a background derived
 * from the secondary color that is too light for its text in Dark. Both use the
 * accent pair (the system's "selected" fill and its mark) instead.
 */
function applyChromeStyles(mode: Mode) {
  const id = "wd-manager-chrome";
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }
  const { control, controlText } = chromeExtras(mode);
  style.textContent = `
    input[type="radio"], input[type="checkbox"] { accent-color: ${control}; }
    #storybook-explorer-tree [data-selected="true"] { background: ${control} !important; color: ${controlText} !important; }
  `;
}

let choice = storedChoice();
addons.setConfig({ theme: themeFor(resolve(choice)) });
applyChromeStyles(resolve(choice));

addons.register("wylie-dog/theme", (api) => {
  const apply = (next: Choice) => {
    choice = next;
    const mode = resolve(next);
    api.setOptions({ theme: themeFor(mode) });
    applyChromeStyles(mode);
  };

  api.on(GLOBALS_UPDATED, (payload?: { globals?: { theme?: unknown } }) => {
    const next = payload?.globals?.theme ?? api.getGlobals()?.theme;
    if (next === "light" || next === "dark" || next === "system") apply(next);
  });

  window
    .matchMedia(MEDIA_QUERY)
    .addEventListener("change", () => choice === "system" && apply("system"));
});
