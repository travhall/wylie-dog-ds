// Plan 203: the token build converts spacing, font size and radius from px to rem
// and keeps px for everything else. Run with: node --test scripts/__tests__/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const read = (p) => readFileSync(path.join(root, p), "utf8");

const source = JSON.parse(read("packages/tokens/io/sync/primitive.json"));
const css = read("packages/tokens/dist/tokens.css");

// First declaration of a custom property in the light block.
const cssVar = (name) => {
  const match = new RegExp(`^\\s+${name}:\\s*([^;]+);`, "m").exec(css);
  assert.ok(match, `${name} missing from dist/tokens.css`);
  return match[1].trim();
};

// Primitives are flat dotted keys under 0.primitive.variables ("space.200").
const variables = source["0"].primitive.variables;
const entries = (prefix) =>
  Object.entries(variables)
    .filter(([key]) => key.startsWith(`${prefix}.`))
    .map(([key, token]) => [key.slice(prefix.length + 1), token]);
const pxOf = (token) => parseFloat(String(token.$value));

test("space, font size and radius primitives are rem and exact (rem * 16 === px)", () => {
  const converted = [
    ...entries("space").map(([k, t]) => [`--space-${k}`, pxOf(t)]),
    ...entries("typography.font-size").map(([k, t]) => [
      `--font-size-${k}`,
      pxOf(t),
    ]),
    ...entries("border-radius")
      .filter(([k]) => k !== "full")
      .map(([k, t]) => [`--border-radius-${k}`, pxOf(t)]),
  ];
  assert.ok(
    converted.length >= 45,
    `expected the full scale, got ${converted.length}`
  );
  for (const [name, px] of converted) {
    const value = cssVar(name);
    assert.match(value, /^\d+(\.\d+)?rem$/, `${name} is ${value}`);
    const rem = parseFloat(value);
    assert.ok(Number.isFinite(rem) && rem >= 0, `${name} is ${value}`);
    assert.equal(rem * 16, px, `${name}: ${value} is not ${px}px`);
  }
});

test("border widths, focus, shadow geometry and the full radius stay px", () => {
  for (const [name, expected] of [
    ["--border-width-1", "1px"],
    ["--border-width-2", "2px"],
    ["--border-width-4", "4px"],
    ["--border-radius-full", "9999px"],
    ["--space-focus-width", "2px"],
    ["--space-focus-offset", "2px"],
  ]) {
    assert.equal(cssVar(name), expected);
  }
  assert.match(cssVar("--shadow-md"), /^0 4px 6px -1px/);
});

test("an alias takes the unit of the primitive it ends at", () => {
  // select.separator.height aliases border-width.1; toast padding aliases space.*.
  assert.equal(cssVar("--space-select-separator-height"), "1px");
  assert.match(cssVar("--space-toast-padding"), /rem$/);
});

test("no root font size is set in the token output", () => {
  assert.doesNotMatch(
    css,
    /(?:html|:root)\s*\{[^}]*font-size\s*:\s*(?:62\.5%|10px)/
  );
});
