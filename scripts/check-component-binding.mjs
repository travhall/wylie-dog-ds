#!/usr/bin/env node
// Binding check for the UI package (Plan 193).
//
// The rule: components bind only to component tokens. Every --color-* reference in
// packages/ui/src (tests excluded) must be a colour token from the components
// collection. A reference to a semantic or primitive colour is a violation, with
// the documented exceptions below.
//
// Everything that is not a colour is covered too (Plan 198), in every file of
// packages/ui/src (tests excluded): a variable reference to a token that is not in
// the components collection (a semantic or primitive such as --space-icon-size-md,
// --shadow-md, --z-index-modal, --duration-normal, --border-radius-md,
// --line-height-none) is a violation. The exceptions are the focus indicator, the
// font family and the variables Radix sets at runtime.
//
// Compositions are components too (Plan 196): the files in
// packages/ui/src/compositions and the pattern-level compositions card-grid.tsx and
// feature-grid.tsx also fail on a hardcoded Tailwind scale utility (px-4, gap-8,
// h-16, max-w-4xl, text-lg, font-bold, rounded-md, z-50 ...), unless it is a
// documented layout exception.
//
// Reads the tracked token source, so no build is needed.
// Usage: node scripts/check-component-binding.mjs

import fs from "node:fs";
import path from "node:path";

const tokenFile = "packages/tokens/io/sync/components.json";
const srcDir = "packages/ui/src";

// Documented exceptions. Each needs a reason; keep this list short.
// An entry matches a reference by exact name, or by prefix when it ends in "-".
const ALLOWLIST = [
  {
    name: "--color-focus-ring",
    reason:
      "Focus indicator outline: one centralized semantic token on purpose, so the indicator is the same everywhere (Plan 193 decision 2, kept by Plan 197).",
  },
  {
    name: "--space-focus-",
    reason:
      "Focus indicator width, offset and halo width: the dimensions of the same centralized indicator, shared by every component through focusRingClasses (Plan 197).",
  },
  {
    name: "--color-focus-halo",
    reason:
      "Focus indicator halo: the second tone of the same centralized indicator (Plan 197).",
  },
  {
    name: "--typography-font-family-",
    reason:
      "Font family: text may bind the primitive directly; it is the only non-colour exception (Plan 193 decision). Listed so the exception is recorded.",
  },
  {
    name: "--radix-",
    reason:
      "Variables Radix sets at runtime (trigger and viewport sizes, swipe offsets): measurements, not design tokens.",
  },
  {
    name: "--font-family-",
    reason:
      "Font family: the Tailwind theme alias of the primitive (same exception).",
  },
];

// Layout exceptions for compositions (none are needed today): utilities that carry
// no design decision, or that belong to another system. Matched against the class with its variants
// (sm:, focus:, ...) removed. A value in LAYOUT_VALUES is always allowed.
const LAYOUT_VALUES = ["0", "auto", "full", "screen", "min", "max", "fit"];
const COMPOSITION_LITERAL_ALLOWLIST = [];

const variables = Object.assign(
  {},
  ...JSON.parse(fs.readFileSync(tokenFile, "utf8"))
).components.variables;
const componentColours = new Set(
  Object.entries(variables)
    .filter(([, token]) => token.$type === "color")
    .map(([name]) => `--color-${name.replaceAll(".", "-")}`)
);

// CSS variable name of every component token, by the naming of the token build
// (packages/tokens/style-dictionary.config.js): spacing and dimension are
// --space-*, duration --duration-*, numbers --font-size-*, --font-weight-*,
// --line-height-* by name, and any other number is unprefixed (z-index).
const cssVarName = (name, type) => {
  const key = name.replaceAll(".", "-");
  if (type === "color") return `--color-${key}`;
  if (type === "spacing" || type === "dimension") return `--space-${key}`;
  if (type === "duration") return `--duration-${key}`;
  if (type === "shadow") return `--shadow-${key}`;
  if (type === "number") {
    if (key.includes("font-weight")) return `--font-weight-${key}`;
    if (key.includes("line-height")) return `--line-height-${key}`;
    if (key.includes("font-size")) return `--font-size-${key}`;
    return `--${key}`;
  }
  return `--${key}`;
};
const componentVars = new Set(
  Object.entries(variables).map(([name, token]) =>
    cssVarName(name, token.$type)
  )
);

const isAllowed = (ref) =>
  ALLOWLIST.some((entry) =>
    entry.name.endsWith("-") ? ref.startsWith(entry.name) : ref === entry.name
  );

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        !["__tests__", "node_modules", "dist", "coverage"].includes(entry.name)
      )
        walk(full);
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.(test|d)\.tsx?$/.test(entry.name)
    ) {
      files.push(full);
    }
  }
})(srcDir);

// Comments mention placeholder names; blank them out, keeping line breaks.
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "))
    .replace(/(^|\s)\/\/.*$/gm, "$1");

const problems = [];
let checked = 0;
for (const file of files) {
  const lines = stripComments(fs.readFileSync(file, "utf8")).split("\n");
  lines.forEach((line, index) => {
    for (const match of line.matchAll(
      /--(?:color|typography-font-family|font-family)-[a-z0-9-]*[a-z0-9]/g
    )) {
      const ref = match[0];
      checked++;
      if (componentColours.has(ref) || isAllowed(ref)) continue;
      problems.push(`${file}:${index + 1}  ${ref}`);
    }
  });
}

// Non-colour variable references in every file, and hardcoded scale utilities in the
// compositions.
const SCALE_PROPERTY =
  /^-?(?:p[xytblrse]?|m[xytblrse]?|gap(?:-[xy])?|space-[xy]|(?:min-|max-)?[hw]|size|inset(?:-[xy])?|top|left|right|bottom|start|end|leading|tracking|rounded(?:-[a-z]{1,2})?|shadow|z|duration|delay|opacity|ring|ring-offset)-(.+)$/;
const SCALE_TEXT = /^text-(?:xs|sm|base|lg|xl|[2-9]xl)$/;
const SCALE_FONT =
  /^font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/;
const SCALE_VALUE =
  /^(?:\d[\d./]*|px|xs|sm|md|lg|xl|[2-9]?xl|[2-9]xl|none|tight|snug|normal|relaxed|loose|wide|wider|widest|tighter|prose|base|inner|outer)$/;
// Compositions: the compositions folder and the pattern-level compositions at the
// package root (Plan 198 decision 6).
const PATTERN_COMPOSITIONS = ["card-grid.tsx", "feature-grid.tsx"];
const isComposition = (file) =>
  file.split(path.sep).includes("compositions") ||
  PATTERN_COMPOSITIONS.includes(path.basename(file));
let literalClasses = 0;
let nonColourVars = 0;
for (const file of files) {
  const lines = stripComments(fs.readFileSync(file, "utf8")).split("\n");
  lines.forEach((line, index) => {
    for (const match of line.matchAll(
      /\((?:[a-z]+:)?(--[a-z0-9-]*[a-z0-9])[,)]/g
    )) {
      const ref = match[1];
      if (ref.startsWith("--color-")) continue; // colours: handled above
      nonColourVars++;
      if (componentVars.has(ref) || isAllowed(ref)) continue;
      problems.push(`${file}:${index + 1}  ${ref}  (not a component token)`);
    }
    if (!isComposition(file)) return;
    for (const literal of line.matchAll(/"([^"]*)"|`([^`]*)`/g)) {
      for (const cls of (literal[1] ?? literal[2]).split(/\s+/)) {
        const bare = cls.replace(/^(?:[^\s:[]+:|\[[^\]]*\]:)+/, "");
        if (!bare || /^[a-z-]*[(\[]/.test(bare) || bare.includes("/")) continue;
        const prop = SCALE_PROPERTY.exec(bare);
        const isLiteral =
          SCALE_TEXT.test(bare) ||
          SCALE_FONT.test(bare) ||
          (prop &&
            SCALE_VALUE.test(prop[1]) &&
            !LAYOUT_VALUES.includes(prop[1]));
        if (!isLiteral) continue;
        literalClasses++;
        if (COMPOSITION_LITERAL_ALLOWLIST.some((entry) => entry.name === bare))
          continue;
        problems.push(
          `${file}:${index + 1}  ${cls}  (hardcoded scale value: add a component token)`
        );
      }
    }
  });
}

if (problems.length) {
  console.error(
    `Component binding: ${problems.length} reference(s) to a token that is not a component token\n`
  );
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    "\nA component binds only to component tokens. Add a token to packages/tokens/io/sync/components.json that aliases the semantic tone (or the scale, for a non-colour value), then reference it."
  );
  process.exit(1);
}
console.log(
  `Component binding OK: ${checked} colour references in ${files.length} files, all component tokens or allowlisted (${ALLOWLIST.length} exceptions).`
);
console.log(
  `Non-colour OK: ${nonColourVars} variable references in ${files.length} files are component tokens or allowlisted; compositions have ${literalClasses} scale literals (${COMPOSITION_LITERAL_ALLOWLIST.length} allowlisted).`
);
