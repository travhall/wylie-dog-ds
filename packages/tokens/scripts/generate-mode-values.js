#!/usr/bin/env node
/**
 * Writes dist/color-modes.json: the resolved Light and Dark value of every color
 * token in the semantic CSS, e.g.
 *
 *   { "color-background-primary": { "light": "oklch(...)", "dark": "oklch(...)" } }
 *
 * The manifest only carries Light values. Consumers that cannot read the CSS
 * variables (the Storybook manager theme, which is bundled without a CSS loader)
 * resolve a token for either mode from this file instead of parsing stylesheets.
 * Dark falls back to Light for a token with no Dark override, as the CSS cascade
 * does.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = join(dirname(fileURLToPath(import.meta.url)), "../dist");

function colorVariables(file) {
  const css = readFileSync(join(distDir, file), "utf8");
  const variables = new Map();
  for (const [, name, value] of css.matchAll(
    /(--color-[a-z0-9-]+):\s*([^;]+);/g
  )) {
    if (!variables.has(name)) variables.set(name, value.trim());
  }
  return variables;
}

const light = colorVariables("semantic-light.css");
const dark = colorVariables("semantic-dark.css");

const modes = {};
for (const name of [...light.keys()].sort()) {
  modes[name.slice(2)] = {
    light: light.get(name),
    dark: dark.get(name) ?? light.get(name),
  };
}
for (const name of [...dark.keys()].sort()) {
  if (!light.has(name)) {
    throw new Error(`${name} has a Dark value but no Light value`);
  }
}

writeFileSync(
  join(distDir, "color-modes.json"),
  JSON.stringify(modes, null, 2) + "\n"
);
console.log(
  `✓ Generated color-modes.json: ${Object.keys(modes).length} semantic colors`
);
