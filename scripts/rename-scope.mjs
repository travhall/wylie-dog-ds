#!/usr/bin/env node
// Rename the package scope (@wyliedog) in every tracked text file.
//
//   node scripts/rename-scope.mjs @acme            rewrite the files
//   node scripts/rename-scope.mjs @acme --dry-run  list what would change
//
// Part of "Make it yours" (documentation/guides/make-it-yours.md). Run it once on a
// fresh fork, then `pnpm install` to refresh the lockfile and `pnpm build` to confirm.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OLD_SCOPE = "@wyliedog/";
const SELF = "scripts/rename-scope.mjs";
const SCOPE_PATTERN = /^@[a-z0-9][a-z0-9._-]*$/;

export function isValidScope(scope) {
  return SCOPE_PATTERN.test(scope);
}

export function renameScope(text, scope) {
  return text.split(OLD_SCOPE).join(`${scope}/`);
}

function trackedFiles() {
  const out = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" });
  return out.split("\0").filter(Boolean);
}

function run(argv) {
  const dryRun = argv.includes("--dry-run");
  const scope = argv.find((arg) => !arg.startsWith("--"));

  if (!scope || !isValidScope(scope)) {
    console.error(
      "Usage: node scripts/rename-scope.mjs @your-scope [--dry-run]"
    );
    process.exit(1);
  }
  if (scope === OLD_SCOPE.slice(0, -1)) {
    console.error(`The scope is already ${scope}.`);
    process.exit(1);
  }

  let changed = 0;
  for (const file of trackedFiles()) {
    if (file === SELF) continue;
    const buffer = readFileSync(file);
    if (buffer.includes(0)) continue; // binary
    const before = buffer.toString("utf8");
    const after = renameScope(before, scope);
    if (after === before) continue;
    changed += 1;
    console.log(`${dryRun ? "would change" : "changed"}  ${file}`);
    if (!dryRun) writeFileSync(file, after);
  }

  console.log(
    `\n${changed} file(s) ${dryRun ? "would change" : "changed"}. ` +
      (dryRun ? "" : "Run `pnpm install` to refresh the lockfile.")
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run(process.argv.slice(2));
}
