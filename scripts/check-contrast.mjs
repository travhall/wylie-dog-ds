#!/usr/bin/env node
// Contrast checker for declared foreground/background token pairs.
//
// A pair is the contract: scripts/contrast-pairs.json lists each foreground
// token with the backgrounds it must be readable on. Every pair is resolved to
// its final color in both Light and Dark and must meet WCAG 2.2 AA (4.5:1 for
// text, 3:1 for icons, indicators and boundaries).
//
// knownFailures is a ratchet. A listed failure is reported but does not fail
// the run; a new failure does, and so does a listed failure that now passes
// (remove it). This lets the check run in CI while real problems are fixed.
//
// Completeness: a component color token whose name marks it as text or an
// icon must be declared as a pair, or listed in "exempt" with a reason, so a new
// component foreground cannot ship without a contrast declaration.
//
// Reads the tracked token sources, so no build is needed.
// Usage: node scripts/check-contrast.mjs [--list]

import fs from "node:fs";
import { contrastRatio as contrast } from "../packages/tokens/lib/color.js";

const MODES = ["Light", "Dark"];
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const config = read("scripts/contrast-pairs.json");
const showList = process.argv.includes("--list");

// ---------- tokens ----------

const collection = (name) =>
  Object.assign({}, ...read(`packages/tokens/io/sync/${name}.json`))[name]
    .variables;
const tokens = {
  ...collection("primitive"),
  ...collection("semantic"),
  ...collection("components"),
};

/** Final color string for a token in one mode, following alias chains. */
function resolve(name, mode) {
  let token = tokens[name];
  if (!token) throw new Error(`unknown token "${name}"`);
  let value = token.valuesByMode?.[mode] ?? token.$value;
  for (
    let i = 0;
    i < 10 && typeof value === "string" && value.startsWith("{");
    i++
  ) {
    const next = value.slice(1, -1);
    token = tokens[next];
    if (!token) throw new Error(`"${name}" references unknown token "${next}"`);
    value = token.valuesByMode?.[mode] ?? token.$value;
  }
  if (typeof value !== "string") {
    throw new Error(`"${name}" does not resolve to a color string`);
  }
  return value;
}

// ---------- color maths: shared with the showcase and the Storybook theme ----------

export { contrast };

// Guard the maths: white on black is exactly 21:1, and a neutral grey of
// lightness 0.5 has luminance 0.5^3, so against white it is 1.05 / 0.175 = 6.
const near = (x, y) => Math.abs(x - y) < 0.01;
if (
  !near(contrast("oklch(1 0 0)", "oklch(0 0 0)"), 21) ||
  !near(contrast("oklch(0.5 0 0)", "oklch(1 0 0)"), 6)
) {
  console.error("Contrast maths self-check failed.");
  process.exit(2);
}

// ---------- check ----------

const problems = [];

const componentTokens = collection("components");
const looksLikeForeground = (name) =>
  /(^|[.-])(text|color|foreground|icon|label|placeholder|link)([.-]|$)/.test(
    name
  ) &&
  !/(background|border|ring|outline|shadow|track|fill|overlay|indicator)/.test(
    name
  );
const declaredForegrounds = new Set(config.pairs.map((p) => p.foreground));
const exemptTokens = new Map((config.exempt ?? []).map((e) => [e.token, e]));
for (const [name, token] of Object.entries(componentTokens)) {
  if (token.$type !== "color" || !looksLikeForeground(name)) continue;
  if (!declaredForegrounds.has(name) && !exemptTokens.has(name)) {
    problems.push(
      `${name} looks like a foreground but is neither declared in "pairs" nor listed in "exempt"`
    );
  }
}
for (const name of exemptTokens.keys()) {
  if (!componentTokens[name]) {
    problems.push(`"exempt" lists ${name}, which does not exist`);
  } else if (declaredForegrounds.has(name)) {
    problems.push(`"exempt" lists ${name}, which is now declared; remove it`);
  }
}
const results = [];
for (const entry of config.pairs) {
  const minimum = config.thresholds[entry.kind];
  if (!minimum) {
    problems.push(`${entry.foreground}: unknown kind "${entry.kind}"`);
    continue;
  }
  for (const background of entry.backgrounds) {
    for (const mode of MODES) {
      try {
        const ratio = contrast(
          resolve(entry.foreground, mode),
          resolve(background, mode)
        );
        results.push({
          foreground: entry.foreground,
          background,
          mode,
          ratio,
          minimum,
        });
      } catch (error) {
        problems.push(`${entry.foreground} on ${background}: ${error.message}`);
      }
    }
  }
}

// Aligned ramps: every listed palette shares the reference palette's OKLCH
// lightness at each step (hue and chroma differ), so the same step means the
// same contrast in every hue.
if (config.alignedRamps) {
  const { reference, palettes, tolerance } = config.alignedRamps;
  const lightness = (css) => {
    const m = /^oklch\(\s*([\d.]+)(%?)/i.exec(css);
    return m[2] ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
  };
  const referencePattern = new RegExp(`^color\\.${reference}\\.(\\d+)$`);
  const steps = Object.keys(tokens)
    .map((name) => referencePattern.exec(name)?.[1])
    .filter(Boolean);
  for (const step of steps) {
    const target = lightness(resolve(`color.${reference}.${step}`, MODES[0]));
    for (const palette of palettes) {
      const name = `color.${palette}.${step}`;
      const actual = lightness(resolve(name, MODES[0]));
      if (Math.abs(actual - target) > tolerance) {
        problems.push(
          `${name} has lightness ${actual.toFixed(3)}; aligned ramps need ${target.toFixed(3)} (like color.${reference}.${step})`
        );
      }
    }
  }
}

const isKnown = (r) =>
  config.knownFailures.find(
    (k) =>
      k.foreground === r.foreground &&
      k.background === r.background &&
      k.mode === r.mode
  );

const failing = results.filter((r) => r.ratio < r.minimum);
const newFailures = failing.filter((r) => !isKnown(r));
for (const r of newFailures) {
  problems.push(
    `${r.mode}: ${r.foreground} on ${r.background} is ${r.ratio.toFixed(2)}:1, needs ${r.minimum}:1`
  );
}
for (const known of config.knownFailures) {
  const result = results.find(
    (r) =>
      r.foreground === known.foreground &&
      r.background === known.background &&
      r.mode === known.mode
  );
  if (!result) {
    problems.push(
      `knownFailures lists ${known.mode}: ${known.foreground} on ${known.background}, which is not a declared pair`
    );
  } else if (result.ratio >= result.minimum) {
    problems.push(
      `${known.mode}: ${known.foreground} on ${known.background} now passes (${result.ratio.toFixed(2)}:1); remove it from knownFailures`
    );
  }
}

if (problems.length) {
  console.error(`Contrast check: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

const known = failing.length;
console.log(
  `Contrast OK: ${config.pairs.length} declared foregrounds, ${results.length} checks (Light and Dark), ${known} known failure${known === 1 ? "" : "s"}.`
);
if (known && showList) {
  for (const r of failing) {
    console.log(
      `  known  ${r.mode}  ${r.ratio.toFixed(2)}:1  ${r.foreground} on ${r.background}  (${isKnown(r).reason})`
    );
  }
} else if (known) {
  console.log("  Run with --list to see the known failures.");
}
