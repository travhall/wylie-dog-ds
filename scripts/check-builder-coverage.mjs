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
process.exit(errors.length > 0 ? 1 : 0);
