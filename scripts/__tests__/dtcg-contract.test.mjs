// Tests for scripts/check-dtcg-contract.mjs (Plan 224, Phase 1 step 5).
// Run with: node --test scripts/__tests__/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const realSync = path.join(root, "packages/tokens/io/sync");

const run = (dir) =>
  spawnSync("node", ["scripts/check-dtcg-contract.mjs", "--dir", dir], {
    cwd: root,
    encoding: "utf8",
  });

const scratch = [];
/** A copy of the real sync folder to break. */
function copyOfSync() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dtcg-contract-"));
  scratch.push(dir);
  fs.cpSync(realSync, dir, { recursive: true });
  return dir;
}
after(() => {
  for (const dir of scratch) fs.rmSync(dir, { recursive: true, force: true });
});

/** The first token (a node with $value) under a tree. */
function firstToken(node) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$") || typeof value !== "object" || value === null) {
      continue;
    }
    if ("$value" in value) return value;
    const found = firstToken(value);
    if (found) return found;
  }
  return null;
}

test("the committed token files pass", () => {
  const result = run(realSync);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /the resolver and \d+ token files pass/);
});

test("a token that breaks the schema fails and names the file", () => {
  const dir = copyOfSync();
  const file = path.join(dir, "primitive.json");
  const tree = JSON.parse(fs.readFileSync(file, "utf8"));
  firstToken(tree).$value = { unexpected: true };
  fs.writeFileSync(file, JSON.stringify(tree, null, 2));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /primitive\.json: \//);
});

test("a file the resolver references but the folder lacks fails", () => {
  const dir = copyOfSync();
  fs.rmSync(path.join(dir, "semantic.dark.json"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /semantic\.dark\.json: listed in tokens\.resolver\.json but not found/
  );
});

test("a stray token file the resolver does not list fails", () => {
  const dir = copyOfSync();
  fs.writeFileSync(path.join(dir, "old-semantic.json"), "{}");
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /old-semantic\.json: not listed in tokens\.resolver\.json/
  );
});

test("a resolver that is not valid JSON fails", () => {
  const dir = copyOfSync();
  fs.writeFileSync(path.join(dir, "tokens.resolver.json"), "{ not json");
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /tokens\.resolver\.json: not valid JSON/);
});

test("a native-layout folder has nothing to validate and passes", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dtcg-contract-native-"));
  scratch.push(dir);
  fs.writeFileSync(path.join(dir, "primitive.json"), "[]");
  const result = run(dir);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /native layout, nothing to validate/);
});
