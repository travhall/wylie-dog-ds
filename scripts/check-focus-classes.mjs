#!/usr/bin/env node
// Focus class check (Plan 197).
//
// The focus indicator is a two-tone outline plus a halo (see lib/utils.ts,
// documentation/tokens/focus-states.md). This check keeps component source on
// that model. It fails on:
//   - outline-none: it removes the outline in forced-colors mode too; write
//     outline-hidden (a transparent outline that forced colors still draws)
//   - a box-shadow focus ring (focus:ring-*, focus-visible:ring-*) and any
//     ring-offset-*: box-shadow is dropped in forced-colors mode
//   - an un-hinted arbitrary value on outline or ring: Tailwind v4 reads a bare
//     --space-* variable as a colour, so the utility silently does nothing
//     (this is how the old ring offset rendered as 0px). Write
//     outline-(length:--x) or outline-(color:--x).
//
// Usage: node scripts/check-focus-classes.mjs
import fs from "node:fs";
import path from "node:path";

const root = "packages/ui/src";
const rules = [
  {
    pattern: /(?<![\w-])outline-none\b/,
    message:
      "outline-none removes the outline in forced-colors mode; use outline-hidden or the focus classes in lib/utils.ts",
  },
  {
    pattern:
      /(?<![\w-])(?:focus|focus-visible|focus-within):ring(?![\w-]*-0\b)/,
    message:
      "box-shadow focus ring: forced-colors mode drops it; use focusRingClasses or focusRingInsetClasses from lib/utils.ts",
  },
  {
    pattern: /ring-offset-/,
    message:
      "ring-offset is part of the retired box-shadow ring; the focus offset is outline-offset (focusRingClasses)",
  },
  {
    pattern: /(?<![\w-])(?:[\w:[\]-]*:)?-?outline(?:-offset)?-\(--/,
    message:
      "un-hinted outline value: Tailwind v4 may read it as the wrong type; write outline-(length:--x), outline-(color:--x) or outline-offset-(length:--x)",
  },
  {
    pattern: /ring-\(--space-/,
    message:
      "un-hinted ring value: a --space-* variable reads as a colour; write ring-(length:--x)",
  },
];

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") continue;
      walk(full);
    } else if (
      /\.tsx?$/.test(entry.name) &&
      !/\.(test|stories)\./.test(entry.name)
    )
      files.push(full);
  }
};
walk(root);

const problems = [];
for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    for (const { pattern, message } of rules)
      if (pattern.test(line)) problems.push(`${file}:${i + 1}: ${message}`);
  });
}

if (problems.length) {
  console.error(`Focus classes: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(
  `Focus classes OK: ${files.length} files, no box-shadow ring, no outline-none, no un-hinted outline or ring values.`
);
