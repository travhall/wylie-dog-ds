#!/usr/bin/env node
// Hand-run check of the component builder against the text style definitions
// (Plan 208). Not part of CI: the builder is gitignored and only exists in the
// owner's checkout, so with no file this prints a note and exits 0.
//
//   node scripts/check-builder-coverage.mjs [path/to/code.js]
//
// It runs the builder's build functions under a stubbed `figma`, records every
// makeText call, and reports which text layers resolve to a style in
// packages/tokens/io/styles/text-styles.json by their font-size token (the way
// the builder looks styles up), which do not and why, how many of the
// definitions the builder uses, and the token names its getVar calls could not
// resolve. Run it after changing the builder or the tokens.

import fs from "node:fs";
import vm from "node:vm";
import { DEFINITIONS_FILE, readSyncTokens } from "./text-styles.mjs";

const BUILDER =
  process.argv[2] ?? "apps/figma-plugin/wylie-dog-figma-builder/code.js";
if (!fs.existsSync(BUILDER)) {
  console.log(`No builder at ${BUILDER}; nothing to check.`);
  process.exit(0);
}

const tokens = readSyncTokens();
const defs = JSON.parse(fs.readFileSync(DEFINITIONS_FILE, "utf8")).styles;
const byFontSize = new Map(defs.map((d) => [d.fontSize, d]));

let source = fs.readFileSync(BUILDER, "utf8");
const builders = [...source.matchAll(/return (build\w+)\(xCursor, Y\)/g)].map(
  (m) => m[1]
);
source = source.replace(/\nmain\(\);\s*$/, "\n");

// A stand-in for `figma`: every property is another stand-in, calls return one,
// and arithmetic sees 0.
const stub = () =>
  new Proxy(function () {}, {
    get: (_t, p) =>
      p === Symbol.toPrimitive ? () => 0 : p === "then" ? undefined : stub(),
    apply: () => stub(),
    construct: () => stub(),
    set: () => true,
  });

const context = {
  console: { log() {}, warn() {}, error() {} },
  figma: stub(),
};
vm.createContext(context);
vm.runInContext(source, context);

// Variables named the way the sync names them: "button.font-size.sm" is the
// variable "button/font-size/sm".
context.varMap = {};
for (const path of tokens.keys()) {
  const variable = { id: path, name: path.replace(/\./g, "/") };
  context.varMap[variable.name] = variable;
  context.varMap[path] = variable;
}

const unresolved = new Set();
const realGetVar = context.getVar;
context.getVar = (name) => {
  const found = realGetVar(name);
  if (!found) unresolved.add(name);
  return found;
};

// Plan 217: a border colour with no border-width token leaves the stroke weight
// unbound. bindStroke derives the width token through borderWidthFor, so a null
// answer is an unbound stroke weight.
const unboundStrokes = new Set();
const realBorderWidthFor = context.borderWidthFor;
context.borderWidthFor = (colorVariable) => {
  const found = realBorderWidthFor(colorVariable);
  if (!found) unboundStrokes.add(colorVariable.name);
  return found;
};

let current = "";
const layers = [];
context.makeText = (characters, styleName, fontSizeVar) => {
  layers.push({
    builder: current,
    characters,
    styleName,
    token: fontSizeVar ? context.tokenPathOf(fontSizeVar) : null,
  });
  return stub();
};

const errors = [];
for (const name of builders) {
  current = name;
  try {
    context[name](0, 0);
  } catch (error) {
    errors.push(`${name}: ${error.message}`);
  }
}

const matched = layers.filter((l) => l.token && byFontSize.has(l.token));
const unmatched = layers.filter((l) => !(l.token && byFontSize.has(l.token)));
const used = new Set(matched.map((l) => byFontSize.get(l.token).name));

console.log(`Builders run: ${builders.length}, errors: ${errors.length}`);
for (const e of errors) console.log(`  ${e}`);
console.log(
  `Text layers: ${layers.length}, with a style: ${matched.length}, without: ${unmatched.length}`
);
console.log(`Definitions used: ${used.size} of ${defs.length}`);

const reasons = new Map();
for (const l of unmatched) {
  const reason = !l.token
    ? "no font-size token passed"
    : tokens.has(l.token)
      ? "a font-size token with no definition"
      : "not a token";
  const key = `${l.builder} ${l.styleName} (${reason}${l.token ? `: ${l.token}` : ""})`;
  reasons.set(key, (reasons.get(key) ?? 0) + 1);
}
if (reasons.size > 0) {
  console.log("\nLayers with no style (they keep direct bindings):");
  for (const [key, n] of reasons) console.log(`  ${key} x${n}`);
}

const unusedDefs = defs.filter((d) => !used.has(d.name)).map((d) => d.name);
if (unusedDefs.length > 0) {
  console.log(`\nDefinitions the builder never uses: ${unusedDefs.join(", ")}`);
}
if (unresolved.size > 0) {
  console.log(
    `\ngetVar names that do not resolve: ${[...unresolved].sort().join(", ")}`
  );
}
// Plan 217: raw numbers the builder assigns to gap, padding and corner radius stay
// unbound. Each budget is the count of sites the owner decided may stay; a new raw
// number fails the check. Corner radius 9999 is the pill fallback used only when the
// radius variable is missing. Figma follows code (owner, 2026-11-04): layout the UI does
// not have is not drawn, so gap is 0 sites. Allowed sites:
//   padding 4  Form input frame 8/16: a fallback, bound right after to
//              input/padding-y/md and input/padding-x
//   radius 3   Checkbox dash 1, Section Features glyph 4, icon fallback 2: drawn marks
// Not counted: menu item stacks (gap 0, as code), the Command input (binds
// command/item-padding-x), the Menubar bar-to-menu gap (binds menubar/content-side-offset),
// and computed values such as the Carousel button gap (a difference of two tokens).
const RAW_BUDGET = { gap: 0, padding: 4, radius: 3 };
const rawCount = (pattern) => [...source.matchAll(pattern)].length;
const raw = {
  gap: rawCount(/\.itemSpacing\s*=\s*[1-9][\d.]*\s*;/g),
  padding: rawCount(
    /\.padding(?:Left|Right|Top|Bottom)\s*=\s*[1-9][\d.]*\s*;/g
  ),
  radius: rawCount(/\.cornerRadius\s*=\s*(?!9999\b)[1-9][\d.]*\s*;/g),
};
console.log(
  `\nUnbound values: strokes with no border-width token ${unboundStrokes.size}` +
    (unboundStrokes.size ? ` (${[...unboundStrokes].sort().join(", ")})` : "")
);
for (const [kind, count] of Object.entries(raw)) {
  console.log(
    `  raw ${kind} assignments: ${count} (budget ${RAW_BUDGET[kind]})`
  );
  if (count > RAW_BUDGET[kind]) {
    errors.push(
      `raw ${kind} assignments ${count} exceed the budget ${RAW_BUDGET[kind]}`
    );
  }
}
// Names live on real nodes, which the stub cannot see: check that main() runs the
// naming pass; scripts/figma/audit-library.js counts default names in the file.
if (!/nameDefaultLayers\(built\)/.test(source)) {
  errors.push("main() does not call nameDefaultLayers(built)");
}
if (unboundStrokes.size) {
  errors.push(
    `${unboundStrokes.size} border colour(s) with no border-width token`
  );
}
process.exit(errors.length > 0 ? 1 : 0);
