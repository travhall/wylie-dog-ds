#!/usr/bin/env node
// Undefined token reference checker. Fails when source code uses a CSS custom
// property that nothing defines.
//
// Scans tracked .ts/.tsx/.css files under packages/ui/src, apps/showcase/src
// and apps/storybook for references like var(--x), bg-(--x) and
// text-(length:--x). A name is fine if it is
//   - defined in the built token CSS (packages/tokens/dist),
//   - declared somewhere in the scanned files (e.g. `--tw-x: ...` in a CSS
//     file, or a `"--x": value` style prop), or
//   - allowlisted in scripts/check-token-refs.config.json.
// Comments are ignored, so documentation examples do not count.
//
// Requires tokens to be built: pnpm --filter @wyliedog/tokens build
// Usage: node scripts/check-token-refs.mjs

import fs from "node:fs";
import { execSync } from "node:child_process";

const read = (p) => fs.readFileSync(p, "utf8");
const config = JSON.parse(read("scripts/check-token-refs.config.json"));

const defined = new Set();
for (const f of ["tokens.css", "semantic-light.css", "semantic-dark.css"]) {
  const p = `packages/tokens/dist/${f}`;
  if (!fs.existsSync(p)) {
    console.error(
      `Missing ${p}. Build tokens first: pnpm --filter @wyliedog/tokens build`
    );
    process.exit(2);
  }
  for (const m of read(p).matchAll(/(--[a-z0-9][a-z0-9-]*)\s*:/gi))
    defined.add(m[1]);
}

const roots = ["packages/ui/src", "apps/showcase/src", "apps/storybook"];
const files = execSync("git ls-files", { encoding: "utf8" })
  .split("\n")
  .filter(
    (f) =>
      roots.some((r) => f.startsWith(`${r}/`)) &&
      /\.(tsx?|css)$/.test(f) &&
      !/(__tests__|\.test\.|\.d\.ts$)/.test(f)
  );

// Remove comments so documentation examples are not treated as usage.
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");

const sources = new Map(files.map((f) => [f, stripComments(read(f))]));

// Names declared in the scanned code itself
const declared = new Set();
for (const src of sources.values()) {
  for (const m of src.matchAll(/["']?(--[a-z0-9][a-z0-9-]*)["']?\s*:/gi))
    declared.add(m[1]);
}

const allow = config.allow.map((r) => new RegExp(r));
const definedList = [...defined];
// A reference built from a template literal (var(--color-blue-${step})) shows up
// as a prefix ending in '-'. It is fine if real tokens start with that prefix.
const isDynamicPrefix = (name) =>
  name.endsWith("-") && definedList.some((d) => d.startsWith(name));
const refRe = /(?:var\(\s*|-\(\s*(?:[a-z]+:)?)(--[a-z0-9][a-z0-9-]*)/gi;

const bad = new Map();
for (const [file, src] of sources) {
  for (const m of src.matchAll(refRe)) {
    const name = m[1];
    if (
      defined.has(name) ||
      declared.has(name) ||
      isDynamicPrefix(name) ||
      allow.some((re) => re.test(name)) ||
      (config.allowByFile?.[file] ?? []).some((r) => new RegExp(r).test(name))
    )
      continue;
    const entry = bad.get(name) ?? new Map();
    entry.set(file, (entry.get(file) ?? 0) + 1);
    bad.set(name, entry);
  }
}

if (bad.size) {
  console.error(`Undefined token references: ${bad.size} name(s)\n`);
  for (const [name, byFile] of [...bad].sort()) {
    const where = [...byFile]
      .map(([f, n]) => `${f}${n > 1 ? ` (x${n})` : ""}`)
      .join(", ");
    console.error(`  ${name}\n    ${where}`);
  }
  console.error(
    "\nUse a token that exists (see packages/tokens/dist/manifest.json), declare the variable, or add it to scripts/check-token-refs.config.json."
  );
  process.exit(1);
}
console.log(
  `Token refs OK: ${files.length} files, ${defined.size} tokens defined.`
);
