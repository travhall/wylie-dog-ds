import { addons } from "storybook/manager-api";
import { darkTheme, lightTheme } from "./theme";

/*
 * Follow the same choice the preview uses (see theme-sync.ts): the stored
 * "storybook-theme" value, or the system preference when it is "system" or
 * missing.
 */
function prefersDark(): boolean {
  try {
    const stored = window.localStorage.getItem("storybook-theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {
    // Storage can be blocked; fall back to the system preference.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

addons.setConfig({
  theme: prefersDark() ? darkTheme : lightTheme,
});
