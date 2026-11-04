#!/usr/bin/env node
// Plan 217: no raw value in packages/ui/src that a token should own. Runs the audit
// (scripts/audit-raw-values.mjs) and fails on every use that is not an entry in
// scripts/check-raw-values.config.json, and on every entry that matches nothing.
//
//   node scripts/check-raw-values.mjs
//
// Not scanned: values inside an embedded SVG data URI (the mask-image of the native
// search and date icons in styles/index.css) and keyword utilities (full, auto, screen).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(
  fs.readFileSync(
    path.join(root, "scripts/check-raw-values.config.json"),
    "utf8"
  )
);
const findings = JSON.parse(
  execFileSync(
    process.execPath,
    [path.join(root, "scripts/audit-raw-values.mjs"), "--json"],
    { encoding: "utf8", maxBuffer: 1 << 26 }
  )
);

const used = new Set();
const problems = [];
for (const f of findings) {
  const text = f.cls || `${f.kind}: ${f.value}`;
  const index = config.allow.findIndex(
    (entry) => entry.file === f.file && text.includes(entry.match)
  );
  if (index >= 0) used.add(index);
  else problems.push(`${f.file}:${f.line}  ${text}  (${f.kind}, ${f.value})`);
}
config.allow.forEach((entry, i) => {
  if (!used.has(i))
    problems.push(`stale allow entry: ${entry.file} "${entry.match}"`);
});

if (problems.length) {
  console.error(`Raw values: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    "\nBind the value to a component token in packages/tokens/io/sync/components.json and reference it as (--token), or add an entry with a reason to scripts/check-raw-values.config.json."
  );
  process.exit(1);
}
console.log(
  `Raw values OK: ${findings.length} uses in packages/ui/src, all allow-listed (${config.allow.length} entries with a reason), none stale.`
);
