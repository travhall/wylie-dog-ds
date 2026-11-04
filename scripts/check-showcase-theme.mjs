#!/usr/bin/env node
// Plan 217: the showcase renders the design system's own scales. Its globals.css points
// Tailwind's named type, leading, tracking and radius scales at the token variables
// (`@theme inline { --text-sm: var(--font-size-sm); ... }`), so `text-sm`, `leading-tight`,
// `tracking-wide` and `rounded-md` read tokens without class edits. This check fails when a
// scale step is missing from that block or maps to a variable the built token CSS does not
// declare, so a renamed token cannot silently put the showcase back on Tailwind's defaults.
//
//   node scripts/check-showcase-theme.mjs
import fs from "node:fs";

const css = fs.readFileSync("apps/showcase/src/app/globals.css", "utf8");
const tokens = fs.readFileSync("packages/tokens/dist/tokens.css", "utf8");

const block = /@theme inline\s*\{([\s\S]*?)\n\}/.exec(css);
if (!block) {
  console.error(
    "Showcase theme: no `@theme inline` block in apps/showcase/src/app/globals.css"
  );
  process.exit(1);
}
const mapped = new Map(
  [...block[1].matchAll(/(--[a-z0-9-]+):\s*var\((--[a-z0-9-]+)\);/g)].map(
    (m) => [m[1], m[2]]
  )
);

const SCALES = {
  text: ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"],
  leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
  tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"],
  radius: ["sm", "md", "lg", "xl", "2xl"],
};
const declared = new Set(
  [...tokens.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1])
);

const problems = [];
let steps = 0;
for (const [scale, names] of Object.entries(SCALES)) {
  for (const name of names) {
    steps++;
    const key = `--${scale}-${name}`;
    const target = mapped.get(key);
    if (!target) problems.push(`${key} is not mapped in the showcase theme`);
    else if (!declared.has(target))
      problems.push(`${key} maps to ${target}, which no token declares`);
  }
}
if (problems.length) {
  console.error(`Showcase theme: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(
  `Showcase theme OK: ${steps} scale steps (type, leading, tracking, radius) read token variables.`
);
