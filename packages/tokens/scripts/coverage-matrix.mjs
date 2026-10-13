#!/usr/bin/env node
/**
 * Token coverage matrix
 *
 * Measures, per top-level component in packages/ui/src/*.tsx:
 *   - how many references to each token category it makes (--color-*, --space-*, ...)
 *   - which hardcoded Tailwind utilities it still uses where a token category exists
 *
 * Reads the built token CSS (run `pnpm build` first) so only names that actually
 * exist are counted. Prints Markdown to stdout.
 *
 * Usage: node scripts/coverage-matrix.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const uiSrc = path.join(repoRoot, "packages/ui/src");
const dist = path.join(__dirname, "../dist");

const defined = new Set();
for (const f of ["tokens.css", "semantic-light.css", "semantic-dark.css"]) {
  const p = path.join(dist, f);
  if (!fs.existsSync(p)) {
    console.error(`Missing ${p}. Run: pnpm --filter @wyliedog/tokens build`);
    process.exit(2);
  }
  for (const m of fs
    .readFileSync(p, "utf8")
    .matchAll(/(--[a-z0-9][a-z0-9-]*)\s*:/gi)) {
    defined.add(m[1]);
  }
}

const categories = [
  ["Color", /^--color-/],
  // Component radius tokens are named --space-<component>-radius
  ["Space", /^--space-(?![a-z0-9-]*radius)/],
  ["Radius", /^--border-radius-|^--space-[a-z0-9-]*radius/],
  ["Type", /^--(font-size|font-weight|line-height|font-family)-/],
  ["Shadow", /^--shadow-/],
  ["Motion", /^--(duration|transition-)/],
  ["Z", /^--z-index-/],
  ["Opacity", /^--opacity-/],
];

// Hardcoded utilities that have a token category available
const hardcoded = [
  [
    "transition",
    /(?<![\w-])transition(-(colors|all|transform|opacity|shadow))?(?![\w-])/g,
  ],
  ["duration-N", /(?<![\w-])duration-\d+/g],
  ["animate-in/out", /(?<![\w-])animate-(in|out)(?![\w-])/g],
  ["z-N", /(?<![\w-])z-\d+/g],
  ["opacity-N", /(?<![\w-])opacity-\d+/g],
  ["shadow-size", /(?<![\w-])shadow(-(sm|md|lg|xl|2xl|inner))?(?![\w-(])/g],
];

const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const files = fs
  .readdirSync(uiSrc)
  .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"))
  .sort();

const rows = [];
const totals = Object.fromEntries(hardcoded.map(([n]) => [n, 0]));
const hardFiles = Object.fromEntries(hardcoded.map(([n]) => [n, []]));

for (const f of files) {
  const src = stripComments(fs.readFileSync(path.join(uiSrc, f), "utf8"));
  const refs = new Set(src.match(/--[a-z0-9][a-z0-9-]*/gi) ?? []);
  const used = [...refs].filter((r) => defined.has(r));
  const catCounts = categories.map(
    ([, re]) => used.filter((r) => re.test(r)).length
  );
  const hard = hardcoded.map(([name, re]) => {
    const n = (src.match(re) ?? []).length;
    totals[name] += n;
    if (n) hardFiles[name].push(f.replace(".tsx", ""));
    return n;
  });
  rows.push({ name: f.replace(".tsx", ""), catCounts, hard });
}

const dash = (n) => (n ? String(n) : "·");
const out = [];
out.push(
  `Components scanned: ${rows.length}. Defined CSS variables: ${defined.size}.\n`
);
out.push("### Distinct token references per component\n");
out.push(`| Component | ${categories.map(([n]) => n).join(" | ")} |`);
out.push(`| --- | ${categories.map(() => "--:").join(" | ")} |`);
for (const r of rows)
  out.push(`| ${r.name} | ${r.catCounts.map(dash).join(" | ")} |`);
out.push("\n### Hardcoded utilities per component (occurrences)\n");
out.push(`| Component | ${hardcoded.map(([n]) => n).join(" | ")} |`);
out.push(`| --- | ${hardcoded.map(() => "--:").join(" | ")} |`);
for (const r of rows) {
  if (r.hard.some(Boolean))
    out.push(`| ${r.name} | ${r.hard.map(dash).join(" | ")} |`);
}
out.push("\n### Hardcoded utility totals\n");
out.push("| Utility | Occurrences | Components |");
out.push("| --- | --: | --- |");
for (const [name] of hardcoded) {
  out.push(
    `| \`${name}\` | ${totals[name]} | ${hardFiles[name].join(", ") || "none"} |`
  );
}
console.log(out.join("\n"));
