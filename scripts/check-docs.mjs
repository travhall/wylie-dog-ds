#!/usr/bin/env node
// Docs drift checker. Fails when documentation disagrees with the repo.
//
//   A. Every --token name in tracked .md/.mdx files must exist in the built
//      token CSS (packages/tokens/dist), or be a prefix of one (so `--color`
//      and `--color-background-{...}` shorthand pass), or be allowlisted in
//      scripts/check-docs.config.json for that file.
//   B. README.md counts and versions must match source files: component count
//      (story files), Node version (engines, .nvmrc, netlify.toml) and the
//      tool versions in the badges and tech-stack table (pnpm-lock.yaml).
//
// Requires tokens to be built: pnpm --filter @wyliedog/tokens build
// Usage: node scripts/check-docs.mjs

import fs from "node:fs";
import { execSync } from "node:child_process";

const read = (p) => fs.readFileSync(p, "utf8");
const problems = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);
const config = JSON.parse(read("scripts/check-docs.config.json"));

// ---------- A. token names in docs ----------

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
const definedList = [...defined];
const isPrefixOfDefined = (name) =>
  definedList.some((d) => d.startsWith(`${name}-`));

const docs = execSync('git ls-files "*.md" "*.mdx"', { encoding: "utf8" })
  .split("\n")
  .filter((f) => f && !/CHANGELOG/.test(f));

const tokenRe =
  /(?<![a-z0-9-])(--(?:color|space|spacing|font|border|radius|shadow|duration|ease|z|opacity|size|text|line|letter|width|height)[a-z0-9-]*)/gi;

for (const file of docs) {
  const allow = (config.tokenAllow[file] ?? []).map((r) => new RegExp(r));
  const bad = new Set();
  for (const m of read(file).matchAll(tokenRe)) {
    const name = m[1].replace(/-+$/, "");
    if (defined.has(name) || isPrefixOfDefined(name)) continue;
    if (allow.some((re) => re.test(name))) continue;
    bad.add(name);
  }
  for (const name of bad)
    fail(file, `token ${name} is not defined in the built CSS`);
}

// ---------- B. README counts and versions ----------

const readme = read("README.md");

const storyCount = fs
  .readdirSync("apps/storybook/stories/Components", { recursive: true })
  .filter((f) => f.endsWith(".stories.tsx")).length;
for (const m of readme.matchAll(/\b(\d+)\s+(?:React\s+)?components\b/g)) {
  if (Number(m[1]) !== storyCount) {
    fail(
      "README.md",
      `says "${m[0]}" but Components has ${storyCount} story files`
    );
  }
}

const enginesMajor = /(\d+)/.exec(
  JSON.parse(read("package.json")).engines.node
)[1];
const nodeClaim = /Node\.js (\d+)\+/.exec(readme);
if (nodeClaim && nodeClaim[1] !== enginesMajor) {
  fail(
    "README.md",
    `says Node.js ${nodeClaim[1]}+ but engines.node is major ${enginesMajor}`
  );
}
const nvmrc = read(".nvmrc").trim().replace(/^v/, "").split(".")[0];
if (nvmrc !== enginesMajor)
  fail(".nvmrc", `Node ${nvmrc} but engines.node is major ${enginesMajor}`);
const netlify = /NODE_VERSION\s*=\s*"(\d+)/.exec(read("netlify.toml"));
if (netlify && netlify[1] !== enginesMajor) {
  fail(
    "netlify.toml",
    `NODE_VERSION ${netlify[1]} but engines.node is major ${enginesMajor}`
  );
}

const lock = read("pnpm-lock.yaml");
function lockedVersion(pkg) {
  const esc = pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(
    `\\n {4,10}${esc}:\\n {6,12}specifier: [^\\n]+\\n {6,12}version: ([0-9][^\\s(]*)`
  ).exec(lock);
  return m ? m[1] : null;
}
const tools = {
  React: "react",
  TypeScript: "typescript",
  "Tailwind CSS": "tailwindcss",
  Storybook: "storybook",
  Vite: "vite",
  Vitest: "vitest",
  Turborepo: "turbo",
  "Style Dictionary": "style-dictionary",
};
const majorMinor = (v) => v.split(".").slice(0, 2).join(".");
const claims = [];
for (const [label, pkg] of Object.entries(tools)) {
  const row = new RegExp(
    `^\\|\\s*${label}\\s*\\|\\s*([0-9.]+)\\s*\\|`,
    "m"
  ).exec(readme);
  if (row) claims.push([label, pkg, row[1], "tech-stack table"]);
  const badge = new RegExp(
    `badge/${label.replace(/ /g, "%20")}-([0-9.]+)-`
  ).exec(readme);
  if (badge) claims.push([label, pkg, badge[1], "badge"]);
}
for (const [label, pkg, claimed, where] of claims) {
  const actual = lockedVersion(pkg);
  if (!actual) {
    fail(
      "README.md",
      `cannot find ${pkg} in pnpm-lock.yaml to check ${label} ${where}`
    );
  } else if (majorMinor(actual) !== majorMinor(claimed)) {
    fail(
      "README.md",
      `${where} says ${label} ${claimed} but lockfile has ${actual}`
    );
  }
}

// ---------- report ----------

if (problems.length) {
  console.error(`Docs drift: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    "\nFix the doc, or (for intentional placeholders) add the name to scripts/check-docs.config.json."
  );
  process.exit(1);
}
console.log(
  `Docs OK: ${docs.length} files, ${defined.size} tokens, ${claims.length} version claims.`
);
