#!/usr/bin/env node
/**
 * Token rename codemod.
 *
 * Renames tokens across:
 *   - io/sync/{primitive,semantic,components}.json (source of truth)
 *   - io/processed/{primitive,semantic-light,semantic-dark,component-light,component-dark}.json
 *
 * Also rewrites references (`{old.name}`) inside all token values to use the
 * new name, so reference chains don't break on rename.
 *
 * Usage:
 *   node scripts/rename-tokens.js --map renames.json
 *   node scripts/rename-tokens.js --rename "input.background:input.default.background"
 *
 * `renames.json` shape: { "old.dotted.path": "new.dotted.path", ... }
 *
 * This is a BREAKING sync-contract change — coordinate with Figma plugin
 * consumers before merging. See packages/tokens/SYNC_CONTRACT.md.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_TOKENS = join(__dirname, "..");

const SYNC_FILES = [
  "io/sync/primitive.json",
  "io/sync/semantic.json",
  "io/sync/components.json",
];

const PROCESSED_FILES = [
  "io/processed/primitive.json",
  "io/processed/semantic-light.json",
  "io/processed/semantic-dark.json",
  "io/processed/component-light.json",
  "io/processed/component-dark.json",
];

/**
 * Parse CLI args. Supports --map <file> and --rename <old:new> (repeatable).
 */
function parseArgs(argv) {
  const renames = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--map") {
      const file = argv[++i];
      const contents = JSON.parse(readFileSync(file, "utf8"));
      Object.assign(renames, contents);
    } else if (arg === "--rename") {
      const pair = argv[++i];
      const [oldName, newName] = pair.split(":");
      if (!oldName || !newName) {
        throw new Error(
          `--rename expects "old:new", got "${pair}"`
        );
      }
      renames[oldName] = newName;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage:
  node scripts/rename-tokens.js --map renames.json
  node scripts/rename-tokens.js --rename "old.name:new.name" [--rename ...]`);
      process.exit(0);
    }
  }
  return renames;
}

/**
 * Rewrite a reference string `{old.name}` → `{new.name}` if the path matches.
 */
function rewriteReference(value, renames) {
  if (typeof value !== "string") return value;
  return value.replace(/\{([^}]+)\}/g, (match, path) => {
    return renames[path] ? `{${renames[path]}}` : match;
  });
}

/**
 * Deep-rewrite all references in any value (string, array, object).
 */
function rewriteValueRefs(val, renames) {
  if (typeof val === "string") return rewriteReference(val, renames);
  if (Array.isArray(val)) return val.map((v) => rewriteValueRefs(v, renames));
  if (val && typeof val === "object") {
    const out = {};
    for (const [k, v] of Object.entries(val)) out[k] = rewriteValueRefs(v, renames);
    return out;
  }
  return val;
}

/**
 * Rename keys in a variables map. Preserves insertion order for diff clarity.
 */
function renameKeys(variables, renames) {
  const out = {};
  let renamedCount = 0;
  for (const [key, value] of Object.entries(variables)) {
    const newKey = renames[key] || key;
    if (newKey !== key) renamedCount++;
    out[newKey] = rewriteValueRefs(value, renames);
  }
  return { variables: out, renamedCount };
}

/**
 * Process a sync-format file (wrapped: [{ collectionName: { variables: {...} } }]).
 */
function processSyncFile(path, renames) {
  if (!existsSync(path)) return { path, status: "missing" };
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const arr = Array.isArray(raw) ? raw : [raw];
  let totalRenamed = 0;
  for (const collectionWrapper of arr) {
    for (const [, colData] of Object.entries(collectionWrapper)) {
      if (colData && typeof colData === "object" && colData.variables) {
        const { variables, renamedCount } = renameKeys(colData.variables, renames);
        colData.variables = variables;
        totalRenamed += renamedCount;
      }
    }
  }
  writeFileSync(path, JSON.stringify(arr, null, 2) + "\n");
  return { path, status: "ok", renamed: totalRenamed };
}

/**
 * Process a processed-format file (flat: { "token.path": {...}, ... }).
 */
function processProcessedFile(path, renames) {
  if (!existsSync(path)) return { path, status: "missing" };
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const { variables, renamedCount } = renameKeys(raw, renames);
  writeFileSync(path, JSON.stringify(variables, null, 2) + "\n");
  return { path, status: "ok", renamed: renamedCount };
}

function main() {
  const renames = parseArgs(process.argv);
  if (Object.keys(renames).length === 0) {
    console.error("No renames provided. Use --map <file> or --rename old:new.");
    process.exit(1);
  }

  console.log(`📝 Applying ${Object.keys(renames).length} renames:`);
  for (const [o, n] of Object.entries(renames)) console.log(`   ${o} → ${n}`);

  const results = [];
  for (const rel of SYNC_FILES) {
    results.push(processSyncFile(join(REPO_TOKENS, rel), renames));
  }
  for (const rel of PROCESSED_FILES) {
    results.push(processProcessedFile(join(REPO_TOKENS, rel), renames));
  }

  console.log("\n📊 Rename summary:");
  let grandTotal = 0;
  for (const r of results) {
    if (r.status === "missing") console.log(`   (skip) ${r.path}`);
    else {
      console.log(`   ${r.renamed.toString().padStart(4)} renames in ${r.path}`);
      grandTotal += r.renamed;
    }
  }
  console.log(`\n✅ ${grandTotal} total renames applied.`);
  console.log(
    `   Next: run 'pnpm --filter @wyliedog/tokens build' to regenerate dist/, then validate.`
  );
}

main();
