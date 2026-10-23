#!/usr/bin/env node
// Contrast checker for declared foreground/background token pairs.
//
// A pair is the contract: scripts/contrast-pairs.json lists each foreground
// token with the backgrounds it must be readable on. Every pair is resolved to
// its final colour in both Light and Dark and must meet WCAG 2.2 AA (4.5:1 for
// text, 3:1 for icons, indicators and boundaries).
//
// knownFailures is a ratchet. A listed failure is reported but does not fail
// the run; a new failure does, and so does a listed failure that now passes
// (remove it). This lets the check run in CI while real problems are fixed.
//
// Completeness: a component colour token whose name marks it as text or an
// icon must be declared as a pair, or listed in "exempt" with a reason, so a new
// component foreground cannot ship without a contrast declaration.
//
// Reads the tracked token sources, so no build is needed.
// Usage: node scripts/check-contrast.mjs [--list]

import fs from "node:fs";

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

/** Final colour string for a token in one mode, following alias chains. */
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
    throw new Error(`"${name}" does not resolve to a colour string`);
  }
  return value;
}

// ---------- colour maths (OKLCH or hex to WCAG relative luminance) ----------

function toLinearSrgb(css) {
  const hex = /^#([0-9a-f]{6})$/i.exec(css);
  if (hex) {
    return [0, 2, 4].map((i) => {
      const c = parseInt(hex[1].slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
  }
  const m =
    /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i.exec(
      css
    );
  if (!m) throw new Error(`unsupported colour "${css}"`);
  if (m[5] !== undefined && parseFloat(m[5]) !== 1 && m[5] !== "100%") {
    throw new Error(`colour "${css}" has alpha; contrast needs opaque colours`);
  }
  const L = m[2] ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
  const C = parseFloat(m[3]);
  const h = (parseFloat(m[4]) * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  return [
    clamp(4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s),
  ];
}

const luminance = (css) => {
  const [r, g, b] = toLinearSrgb(css);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function contrast(foregroundCss, backgroundCss) {
  const a = luminance(foregroundCss);
  const b = luminance(backgroundCss);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

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
