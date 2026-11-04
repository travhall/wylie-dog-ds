#!/usr/bin/env node
// Generate or check the Figma code syntax file (Plan 216, Phase E).
//
//   node scripts/generate-code-syntax.mjs          write the file
//   node scripts/generate-code-syntax.mjs --check  fail if it is stale, names a token that
//                                                  does not exist, or names a CSS variable the
//                                                  built CSS does not declare
//
// See scripts/code-syntax.mjs.

import fs from "node:fs";
import path from "node:path";
import { readSyncTokens } from "./text-styles.mjs";
import {
  CODE_SYNTAX_FILE,
  checkCodeSyntax,
  declaredCssVariables,
  deriveCodeSyntax,
  serializeCodeSyntax,
} from "./code-syntax.mjs";

const check = process.argv.includes("--check");
const tokens = readSyncTokens();
const syntax = deriveCodeSyntax(tokens);
const expected = serializeCodeSyntax(syntax);
const count = Object.keys(syntax).length;

if (!check) {
  fs.mkdirSync(path.dirname(CODE_SYNTAX_FILE), { recursive: true });
  fs.writeFileSync(CODE_SYNTAX_FILE, expected);
  console.log(`Wrote ${count} code syntax entries to ${CODE_SYNTAX_FILE}`);
  process.exit(0);
}

const problems = [];
let committed = null;
try {
  committed = fs.readFileSync(CODE_SYNTAX_FILE, "utf8");
} catch {
  problems.push(`${CODE_SYNTAX_FILE} is missing. Run: node scripts/generate-code-syntax.mjs`);
}
if (committed !== null) {
  if (committed !== expected) {
    problems.push(
      `${CODE_SYNTAX_FILE} is stale. Run: node scripts/generate-code-syntax.mjs`
    );
  }
  try {
    problems.push(...checkCodeSyntax(JSON.parse(committed).syntax ?? {}, tokens, declaredCssVariables()));
  } catch (error) {
    problems.push(`${CODE_SYNTAX_FILE} could not be checked: ${error.message}`);
  }
}

if (problems.length > 0) {
  console.error(`Code syntax FAILED:\n- ${problems.slice(0, 20).join("\n- ")}`);
  process.exit(1);
}
console.log(`Code syntax OK: ${count} entries, current, every CSS variable is declared in the built CSS.`);
