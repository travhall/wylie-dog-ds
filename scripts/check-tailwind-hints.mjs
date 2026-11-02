#!/usr/bin/env node
// Tailwind type-hint guard.
//
// Tailwind v4 cannot tell what a bare arbitrary variable is for. `border-b-(--space-x)`
// and `outline-(--space-x)` are read as a COLOR, so the width is never set and the
// utility silently does nothing. This is how the Tabs active indicator went missing
// (see the note above focusRingClasses in packages/ui/src/lib/utils.ts). A width needs
// the hint: `border-b-(length:--space-x)`.
//
// Fails on any border, outline, ring, divide or decoration utility whose variable is a
// width or size token (--space-*, --border-width-*, --size-*) and has no `length:` hint.
// Scans tracked .ts/.tsx files in packages/ui/src and apps/showcase/src.
// Usage: node scripts/check-tailwind-hints.mjs

import fs from "node:fs";
import { execSync } from "node:child_process";

const ROOTS = ["packages/ui/src/", "apps/showcase/src/"];
const bare =
  /(?<![\w:(-])((?:[\w-]+:)*)(border(?:-[xytblrse])?|outline|ring|divide(?:-[xy])?|decoration)-\(--(space|border-width|size)[a-z0-9-]*\)/g;

const files = execSync("git ls-files -z", {
  encoding: "utf8",
  maxBuffer: 1 << 26,
})
  .split("\0")
  .filter(
    (f) =>
      ROOTS.some((r) => f.startsWith(r)) &&
      /\.tsx?$/.test(f) &&
      !/__tests__|\.test\./.test(f)
  );

const violations = [];
for (const file of files) {
  fs.readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      // Comments explain the rule with bare examples; only code can break it.
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      for (const m of line.matchAll(bare)) {
        violations.push(`${file}:${i + 1}  ${m[0]}`);
      }
    });
}

if (violations.length) {
  console.error(
    `Tailwind hint check FAILED: ${violations.length} width utility(ies) read a --space variable as a color:`
  );
  for (const v of violations) console.error("  " + v);
  console.error("Add the type hint, e.g. border-b-(length:--space-x).");
  process.exit(1);
}
console.log(
  `Tailwind hints OK: ${files.length} files, every width utility has a length: hint.`
);
