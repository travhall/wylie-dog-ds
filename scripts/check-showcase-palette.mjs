#!/usr/bin/env node
// Showcase palette guard.
//
// The rule (decided 2026-11-01): the showcase binds to semantic tokens, never to
// the primitive palette, so changing a token re-themes every page. A static
// reference to a primitive color in a showcase page is a violation:
//   - a palette variable, such as var(--color-blue-600)
//   - a Tailwind palette utility, such as bg-blue-600 or text-gray-400
//   - a hex color literal, such as #de622e
// A page that has to name a primitive derives it instead (`getAlias` in
// apps/showcase/src/lib/token-values.ts), and a template such as
// `var(--color-${palette}-${step})` is not static, so it passes.
//
// Not counted: comments, tests, and the dog illustration (wyliedoglogo.tsx),
// whose fills are the brand artwork and not UI color.
// Usage: node scripts/check-showcase-palette.mjs

import fs from "node:fs";
import { execSync } from "node:child_process";

const ROOT = "apps/showcase/src/";
const EXEMPT = [`${ROOT}app/wyliedoglogo.tsx`, `${ROOT}lib/__tests__/`];
const PALETTES =
  "blue|green|purple|pink|orange|yellow|red|violet|teal|gray|fiery-coral|polar-night|sandcastle|petrified-wood|black-bear|slate|zinc|neutral|amber|emerald|indigo|sky|rose";

const rules = [
  {
    name: "palette variable",
    re: new RegExp(`--color-(?:${PALETTES})-\\d+`),
  },
  {
    name: "Tailwind palette utility",
    re: new RegExp(
      `\\b(?:bg|text|border|ring|from|to|via|fill|stroke|divide|outline|decoration|shadow|accent|caret)-(?:${PALETTES})-\\d+\\b`
    ),
  },
  { name: "hex color literal", re: /#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?\b/ },
];

const files = execSync("git ls-files -z", {
  encoding: "utf8",
  maxBuffer: 1 << 26,
})
  .split("\0")
  .filter(
    (f) =>
      f.startsWith(ROOT) &&
      /\.(tsx?|css|mdx)$/.test(f) &&
      !EXEMPT.some((e) => f.startsWith(e))
  );

const violations = [];
for (const file of files) {
  let block = false;
  fs.readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      const trimmed = line.trim();
      if (block) {
        if (trimmed.includes("*/")) block = false;
        return;
      }
      if (trimmed.startsWith("/*")) {
        if (!trimmed.includes("*/")) block = true;
        return;
      }
      if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
      for (const rule of rules) {
        const m = line.match(rule.re);
        if (m) violations.push(`${file}:${i + 1}: ${rule.name} ${m[0]}`);
      }
    });
}

if (violations.length > 0) {
  console.error(
    `Showcase palette: ${violations.length} problem(s). Bind to a semantic token (or derive the primitive with getAlias) instead.\n`
  );
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}
console.log(
  `Showcase palette OK: ${files.length} files, no static primitive colors.`
);
