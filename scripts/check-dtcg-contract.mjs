#!/usr/bin/env node
// DTCG contract guard (Plan 224, Phase 1 step 5).
//
// packages/tokens/io/sync holds the token source as standard W3C DTCG files plus a
// resolver file. This validates the committed files as written, against the two
// JSON Schemas in packages/tokens/schema:
//
//   1. tokens.resolver.json passes resolver.schema.json.
//   2. Every file the resolver references exists and passes token-file.schema.json.
//   3. No other .json file sits in the folder (a file the resolver does not list is
//      never built, so it is either stale or a mistake).
//
// The tokens tests also run the schemas over the real files, but only after a
// native round trip, which can normalise a bad hand edit away. This reads the
// files themselves, on every pull request.
//
// A folder with no tokens.resolver.json is in the native layout; there is nothing to
// validate and the check says so.
//
//   node scripts/check-dtcg-contract.mjs [--dir <folder>]
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokensDir = path.join(root, "packages/tokens");

// ajv is a dependency of the tokens package, not of the repo root
const Ajv = createRequire(path.join(tokensDir, "package.json"))("ajv");

const RESOLVER_FILE = "tokens.resolver.json";
const MAX_ERRORS_PER_FILE = 5;

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

/** Every `$ref` in the resolver that points at a file (not at `#/sets/...`). */
function fileRefs(node, found = new Set()) {
  if (Array.isArray(node)) {
    for (const item of node) fileRefs(item, found);
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (
        key === "$ref" &&
        typeof value === "string" &&
        !value.startsWith("#")
      ) {
        found.add(value);
      } else {
        fileRefs(value, found);
      }
    }
  }
  return found;
}

function describe(errors, file) {
  const shown = errors
    .slice(0, MAX_ERRORS_PER_FILE)
    .map((e) => `${file}: ${e.instancePath || "/"} ${e.message}`);
  if (errors.length > MAX_ERRORS_PER_FILE) {
    shown.push(`${file}: ...and ${errors.length - MAX_ERRORS_PER_FILE} more`);
  }
  return shown;
}

/** Validate a sync folder; returns the problems and what it checked. */
export function checkDtcgContract(dir) {
  const resolverPath = path.join(dir, RESOLVER_FILE);
  if (!fs.existsSync(resolverPath)) {
    return { layout: "native", problems: [], files: [] };
  }

  // allowUnionTypes: the official schemas use union types, which strict mode warns about
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const validateTokens = ajv.compile(
    readJson(path.join(tokensDir, "schema/token-file.schema.json"))
  );
  const validateResolver = ajv.compile(
    readJson(path.join(tokensDir, "schema/resolver.schema.json"))
  );

  const problems = [];
  let resolver;
  try {
    resolver = readJson(resolverPath);
  } catch (error) {
    return {
      layout: "dtcg",
      problems: [`${RESOLVER_FILE}: not valid JSON (${error.message})`],
      files: [],
    };
  }
  if (!validateResolver(resolver)) {
    problems.push(...describe(validateResolver.errors, RESOLVER_FILE));
  }

  const referenced = [...fileRefs(resolver)].sort();
  for (const ref of referenced) {
    const file = path.join(dir, ref);
    if (!fs.existsSync(file)) {
      problems.push(`${ref}: listed in ${RESOLVER_FILE} but not found`);
      continue;
    }
    let tree;
    try {
      tree = readJson(file);
    } catch (error) {
      problems.push(`${ref}: not valid JSON (${error.message})`);
      continue;
    }
    if (!validateTokens(tree)) {
      problems.push(...describe(validateTokens.errors, ref));
    }
  }

  const listed = new Set(referenced);
  for (const name of fs.readdirSync(dir).sort()) {
    if (name.endsWith(".json") && name !== RESOLVER_FILE && !listed.has(name)) {
      problems.push(
        `${name}: not listed in ${RESOLVER_FILE}, so the build never reads it. Reference it or delete it`
      );
    }
  }

  return { layout: "dtcg", problems, files: referenced };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const flag = process.argv.indexOf("--dir");
  const dir =
    flag === -1
      ? path.join(tokensDir, "io/sync")
      : path.resolve(process.argv[flag + 1] ?? "");
  const { layout, problems, files } = checkDtcgContract(dir);

  if (layout === "native") {
    console.log(
      `DTCG contract: no ${RESOLVER_FILE} in ${path.relative(root, dir) || dir}, native layout, nothing to validate`
    );
  } else if (problems.length > 0) {
    console.error(
      `DTCG contract: ${problems.length} problem${problems.length === 1 ? "" : "s"}\n`
    );
    for (const problem of problems) console.error(`  ${problem}`);
    console.error(
      "\nThe token files are the contract with every tool that reads them: see documentation/tokens/dtcg-contract.md."
    );
    process.exit(1);
  } else {
    console.log(
      `DTCG contract: the resolver and ${files.length} token file${files.length === 1 ? "" : "s"} pass`
    );
  }
}
