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
 *
 * `getAlias` reads which primitive a semantic token points at (for example
 * `color.background.primary` -> fiery-coral 600) from the tracked token source,
 * so a page that explains the tiers never names a primitive by hand.
 */

import { cache } from "react";
import fs from "fs";
import path from "path";
import { findCssVar } from "@wyliedog/tokens/color";
import { readSyncCollection } from "@wyliedog/tokens/read-sync";

export { findCssVar };

// Next.js sets process.cwd() to the app root (apps/showcase/); see the note in
// showcase-metadata.ts about why __dirname is not used.
const TOKENS_DIST_DIR = path.resolve(
  process.cwd(),
  "../../packages/tokens/dist"
);

const readCss = cache((file: string): string =>
  fs.readFileSync(path.join(TOKENS_DIST_DIR, file), "utf-8")
);

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
 * `getColorModes("--color-background-default")`. Throws if the token is not in
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

/**
 * Tracked source the Token Bridge plugin syncs; holds the `{color.palette.step}`
 * aliases. Read through the shared reader, so either sync layout works.
 */
const SYNC_DIR = path.resolve(process.cwd(), "../../packages/tokens/io/sync");

interface SyncVariable {
  valuesByMode: Record<string, string>;
}

const readSemanticSource = cache((): Record<string, SyncVariable> => {
  const file = readSyncCollection(SYNC_DIR, "semantic") as unknown as Array<
    Record<string, { variables: Record<string, SyncVariable> }>
  >;
  return file[0].semantic.variables;
});

/** A primitive color reference such as `{ palette: "fiery-coral", step: "600" }`. */
export interface PrimitiveRef {
  palette: string;
  step: string;
}

/** Parses `{color.fiery-coral.600}`; null for anything that is not a plain color alias. */
export function parsePrimitiveRef(value: string): PrimitiveRef | null {
  const match = /^\{color\.([a-z-]+)\.(\d+)\}$/.exec(value);
  return match ? { palette: match[1], step: match[2] } : null;
}

export type TokenMode = "Light" | "Dark";

/**
 * The primitive a semantic color points at in one mode, e.g.
 * `getAlias("color.background.primary")`. Throws if the token is missing or is
 * not a plain alias, so a renamed token fails the build.
 */
export function getAlias(
  name: string,
  mode: TokenMode = "Light"
): PrimitiveRef {
  const variable = readSemanticSource()[name];
  const ref = variable ? parsePrimitiveRef(variable.valuesByMode[mode]) : null;
  if (!ref) {
    throw new Error(
      `Token ${name} is not a plain color alias in ${mode} (semantic collection, packages/tokens/io/sync)`
    );
  }
  return ref;
}

/** `fiery-coral-600`, the name a primitive goes by in prose and code. */
export function primitiveName(ref: PrimitiveRef): string {
  return `${ref.palette}-${ref.step}`;
}

/** `--color-fiery-coral-600`, the CSS variable of a primitive. */
export function primitiveVar(ref: PrimitiveRef): string {
  return `--color-${primitiveName(ref)}`;
}

/**
 * Where a semantic color lands, in words: `fiery-coral-600 in light and dark`,
 * or `fiery-coral-700 in light, fiery-coral-300 in dark` when the modes differ.
 */
export function describeAlias(name: string): string {
  const light = primitiveName(getAlias(name, "Light"));
  const dark = primitiveName(getAlias(name, "Dark"));
  return light === dark
    ? `${light} in light and dark`
    : `${light} in light, ${dark} in dark`;
}
