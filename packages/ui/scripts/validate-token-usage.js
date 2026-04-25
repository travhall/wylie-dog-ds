#!/usr/bin/env node
/**
 * Scans packages/ui/src/**\/*.{ts,tsx} for CSS custom-property references
 * (`(--some-var)`, `var(--some-var)`) and fails if any are not in the
 * generated token manifest at @wyliedog/tokens/dist/css-vars.js.
 *
 * Catches typos like `--transition-duration-normal` (which silently falls
 * back to the browser default) before they ship.
 *
 * Exit codes:
 *   0  no unknown vars
 *   1  one or more unknown vars found (CI should fail)
 *   2  internal error (token manifest missing, etc.)
 */

import { readFileSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(__dirname, "..", "..", "..");
const uiSrc = resolve(__dirname, "..", "src");

// ── Load token manifest ────────────────────────────────────────────────────
let cssVarNames;
try {
  const mod = await import("@wyliedog/tokens/css-vars");
  cssVarNames = new Set(mod.cssVarNames);
} catch (err) {
  console.error(
    "✖ Could not import @wyliedog/tokens/css-vars. Run `pnpm --filter @wyliedog/tokens build` first."
  );
  console.error(err.message);
  process.exit(2);
}

// ── Walk source tree ───────────────────────────────────────────────────────
async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      // skip tests, coverage, dist — they're not shipped runtime
      if (e.name === "__tests__" || e.name === "coverage" || e.name === "dist" || e.name === "node_modules") continue;
      yield* walk(p);
    } else if (
      (e.name.endsWith(".ts") || e.name.endsWith(".tsx")) &&
      !e.name.endsWith(".test.ts") &&
      !e.name.endsWith(".test.tsx") &&
      !e.name.endsWith(".d.ts")
    ) {
      yield p;
    }
  }
}

// Matches either `(--name)` or `var(--name)` or `var(--name, fallback)`.
// Name pattern: start with a letter, then letters/digits/hyphens.
const CSS_VAR_RE = /(?:var\(|\()(--[a-z][a-z0-9-]*)/gi;

// Allowlists for names referenced in shipped code that intentionally don't
// come from @wyliedog/tokens (e.g. Radix-provided vars, browser built-ins).
const ALLOWLIST = new Set([
  // Add external var names here if/when needed.
]);
const ALLOWLIST_PREFIXES = [
  "--radix-",       // Radix UI injects positioning/size vars at runtime
];

const isAllowed = (name) =>
  ALLOWLIST.has(name) || ALLOWLIST_PREFIXES.some((p) => name.startsWith(p));

const unknowns = []; // { file, line, varName, context }

for await (const file of walk(uiSrc)) {
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    CSS_VAR_RE.lastIndex = 0;
    while ((m = CSS_VAR_RE.exec(line)) !== null) {
      const varName = m[1];
      if (cssVarNames.has(varName)) continue;
      if (isAllowed(varName)) continue;
      unknowns.push({
        file: relative(repoRoot, file),
        line: i + 1,
        varName,
        context: line.trim().slice(0, 140),
      });
    }
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
if (unknowns.length === 0) {
  console.log("✓ All CSS var references in packages/ui/src resolve to known tokens.");
  process.exit(0);
}

// Group by var name so the report is actionable
const byVar = new Map();
for (const u of unknowns) {
  if (!byVar.has(u.varName)) byVar.set(u.varName, []);
  byVar.get(u.varName).push(u);
}

console.error(`✖ Found ${unknowns.length} reference(s) to ${byVar.size} unknown token(s):\n`);
for (const [varName, occurrences] of [...byVar.entries()].sort()) {
  console.error(`  ${varName}  (${occurrences.length}×)`);
  for (const o of occurrences.slice(0, 3)) {
    console.error(`    ${o.file}:${o.line}`);
  }
  if (occurrences.length > 3) {
    console.error(`    ...and ${occurrences.length - 3} more`);
  }
}
console.error(
  `\nEither (a) add the token to packages/tokens/io/sync/*.json and rebuild,`
);
console.error(`or (b) fix the typo in packages/ui/src/*.`);
process.exit(1);
