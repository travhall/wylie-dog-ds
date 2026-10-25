#!/usr/bin/env node
// Binding check for the UI package (Plan 193).
//
// The rule: components bind only to component tokens. Every --color-* reference in
// packages/ui/src (tests excluded) must be a colour token from the components
// collection. A reference to a semantic or primitive colour is a violation, with
// the documented exceptions below.
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
    name: "--font-family-",
    reason:
      "Font family: the Tailwind theme alias of the primitive (same exception).",
  },
];

const variables = Object.assign(
  {},
  ...JSON.parse(fs.readFileSync(tokenFile, "utf8"))
).components.variables;
const componentColours = new Set(
  Object.entries(variables)
    .filter(([, token]) => token.$type === "color")
    .map(([name]) => `--color-${name.replaceAll(".", "-")}`)
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

if (problems.length) {
  console.error(
    `Component binding: ${problems.length} reference(s) to a token that is not a component token\n`
  );
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    "\nA component binds only to component tokens. Add a token to packages/tokens/io/sync/components.json that aliases the semantic tone, then reference it."
  );
  process.exit(1);
}
console.log(
  `Component binding OK: ${checked} colour references in ${files.length} files, all component tokens or allowlisted (${ALLOWLIST.length} exceptions).`
);
