#!/usr/bin/env node
// Generate or check the Figma text style definitions (Plan 206).
//
//   node scripts/generate-text-styles.mjs          write the definitions file
//   node scripts/generate-text-styles.mjs --check  fail if it is stale or names
//                                                  a token that does not exist
//
// See scripts/text-styles.mjs for the pairing rule and the owner decisions.

import fs from "node:fs";
import path from "node:path";
import {
  DEFINITIONS_FILE,
  checkReferences,
  deriveTextStyles,
  readSyncTokens,
  serializeDefinitions,
} from "./text-styles.mjs";

const check = process.argv.includes("--check");
const tokens = readSyncTokens();
const { styles, orphans } = deriveTextStyles(tokens);
const expected = serializeDefinitions(styles);

const report = () => {
  if (orphans.length === 0) return;
  console.log(
    `Note: ${orphans.length} weight, line-height or tracking token(s) have no font-size sibling and get no style: ${orphans.join(", ")}`
  );
};

if (!check) {
  fs.mkdirSync(path.dirname(DEFINITIONS_FILE), { recursive: true });
  fs.writeFileSync(DEFINITIONS_FILE, expected);
  console.log(`Wrote ${styles.length} text styles to ${DEFINITIONS_FILE}`);
  report();
  process.exit(0);
}

const problems = [];
let committed = null;
try {
  committed = fs.readFileSync(DEFINITIONS_FILE, "utf8");
} catch {
  problems.push(
    `${DEFINITIONS_FILE} is missing. Run: node scripts/generate-text-styles.mjs`
  );
}

if (committed !== null) {
  let parsed = null;
  try {
    parsed = JSON.parse(committed);
  } catch {
    problems.push(`${DEFINITIONS_FILE} is not valid JSON.`);
  }
  if (parsed) {
    problems.push(...checkReferences(parsed.styles ?? [], tokens));
  }
  if (committed !== expected) {
    const have = new Set((parsed?.styles ?? []).map((s) => JSON.stringify(s)));
    const want = new Set(styles.map((s) => JSON.stringify(s)));
    const stale = [...want].filter((s) => !have.has(s)).length;
    const extra = [...have].filter((s) => !want.has(s)).length;
    problems.push(
      `${DEFINITIONS_FILE} is stale (${stale} derived style(s) differ or are missing, ${extra} committed style(s) are no longer derived). Run: node scripts/generate-text-styles.mjs`
    );
  }
}

if (problems.length > 0) {
  console.error(`Text styles FAILED:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(
  `Text styles OK: ${styles.length} definitions, current, every referenced token exists.`
);
report();
