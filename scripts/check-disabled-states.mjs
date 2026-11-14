#!/usr/bin/env node
// Disabled-state guard (Plan 223).
//
// A disabled control keeps its normal colours and dims. Each component that can be
// disabled has one number token, <component>.<part>.opacity-disabled (or
// <component>.opacity-disabled), that aliases a primitive opacity, and its classes use
// it. This guard keeps that true for every component, present and future:
//
//   1. No component token is a disabled colour (a `*-disabled` token of type color).
//   2. Every opacity-disabled token is a number that aliases {opacity.*}.
//   3. Every opacity-disabled token is used by a class in packages/ui/src.
//   4. No class sets a colour (--color-*) under a disabled variant (disabled:,
//      data-disabled:, data-[disabled]:, peer-disabled:, group-disabled:, aria-disabled:).
//   5. A control that can be disabled never switches pointer events off with
//      `disabled:pointer-events-none`, so its not-allowed cursor can show. Radix item
//      components use data-disabled:pointer-events-none and are not affected.
//
//   node scripts/check-disabled-states.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readSyncCollection } from "../packages/tokens/lib/read-sync.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "packages/ui/src");
const syncDir = path.join(root, "packages/tokens/io/sync");

const variables = Object.assign(
  {},
  ...readSyncCollection(syncDir, "components")
).components.variables;

const problems = [];

// 1 and 2: the tokens
const opacityTokens = [];
for (const [name, token] of Object.entries(variables)) {
  if (/disabled/.test(name) && token.$type === "color") {
    problems.push(
      `${name}: a disabled colour token; a disabled control dims with its opacity-disabled token instead`
    );
  }
  if (/opacity-disabled$/.test(name)) {
    opacityTokens.push(name);
    if (token.$type !== "number" || !/^\{opacity\.\d+\}$/.test(token.$value)) {
      problems.push(
        `${name}: must be a number aliasing a primitive {opacity.*}`
      );
    }
  }
}

// Component sources (no tests, no stories)
const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "__tests__") walk(full);
    } else if (entry.name.endsWith(".tsx")) files.push(full);
  }
};
walk(srcDir);
const sources = files.map((file) => ({
  file: path.relative(root, file),
  text: fs.readFileSync(file, "utf8"),
}));
const allText = sources.map((s) => s.text).join("\n");

// 3: each token is used. A token a.b-opacity-disabled has the CSS variable --a-b-opacity-disabled
for (const name of opacityTokens) {
  const cssVar = `--${name.replace(/[.]/g, "-")}`;
  if (!allText.includes(`(${cssVar})`)) {
    problems.push(`${name}: no class in packages/ui/src uses ${cssVar}`);
  }
}

// 4 and 5: the classes
const disabledVariant =
  "(?:disabled|data-disabled|data-\\[disabled(?:=true)?\\]|peer-disabled|group-disabled|aria-disabled)";
const colourUnderDisabled = new RegExp(
  `(?:[\\w\\[\\]=-]+:)*${disabledVariant}:(?:[\\w-]+-)\\((?:length:)?--color-[a-z0-9-]+\\)`,
  "g"
);
const pointerOffUnderDisabled = /(?<![\w-])disabled:pointer-events-none/g;
let classesChecked = 0;
for (const { file, text } of sources) {
  classesChecked += (text.match(new RegExp(`${disabledVariant}:`, "g")) ?? [])
    .length;
  for (const match of text.matchAll(colourUnderDisabled)) {
    problems.push(
      `${file}: ${match[0]} sets a colour under a disabled variant; use the component's opacity-disabled class`
    );
  }
  for (const match of text.matchAll(pointerOffUnderDisabled)) {
    problems.push(
      `${file}: ${match[0]} hides the not-allowed cursor; use disabled:cursor-not-allowed and scope hover to not-disabled`
    );
  }
}

if (problems.length) {
  console.error(`Disabled states: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(
  `Disabled states OK: ${opacityTokens.length} opacity-disabled tokens, all used; ` +
    `${classesChecked} disabled-variant classes set no colour and none switches pointer events off.`
);
