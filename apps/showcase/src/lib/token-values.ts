/**
 * token-values.ts
 *
 * Reads resolved semantic color values (light and dark) from the built token
 * CSS so pages that display or swatch a token never carry a typed copy that
 * goes stale when the design changes.
 *
 * USAGE: Server Components and server-side utilities only (uses fs).
 *
 * Light values come from packages/tokens/dist/semantic-light.css, dark values
 * from semantic-dark.css (the `.dark { ... }` overrides). A token that has no
 * dark override reuses its light value, matching how the CSS cascades.
 */

import { cache } from "react";
import fs from "fs";
import path from "path";

// Next.js sets process.cwd() to the app root (apps/showcase/); see the note in
// showcase-metadata.ts about why __dirname is not used.
const TOKENS_DIST_DIR = path.resolve(
  process.cwd(),
  "../../packages/tokens/dist"
);

const readCss = cache((file: string): string =>
  fs.readFileSync(path.join(TOKENS_DIST_DIR, file), "utf-8")
);

/** First `--name: value;` declaration in a stylesheet, or null. */
export function findCssVar(css: string, name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|[\\s;{])${escaped}\\s*:\\s*([^;}]+);`).exec(
    css
  );
  return match ? match[1].trim() : null;
}

/** Shape of a token entry in `@wyliedog/tokens/manifest.json`. */
export interface ManifestToken {
  value: string;
  variable: string;
  path: string[];
  description?: string;
}

export interface ColorModes {
  light: string;
  dark: string;
}

/**
 * Resolved light and dark values for a semantic color token, e.g.
 * `getColorModes("--color-background-primary")`. Throws if the token is not in
 * the built CSS, so a renamed or removed token fails the build instead of
 * showing a wrong value.
 */
export function getColorModes(name: string): ColorModes {
  const light = findCssVar(readCss("semantic-light.css"), name);
  if (!light) {
    throw new Error(
      `Token ${name} not found in packages/tokens/dist/semantic-light.css`
    );
  }
  const dark = findCssVar(readCss("semantic-dark.css"), name) ?? light;
  return { light, dark };
}
