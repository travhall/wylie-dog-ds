import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidScope, renameScope } from "../rename-scope.mjs";

// Built from parts so the rename script cannot rewrite this fixture.
const OLD = "@wylie" + "dog";

test("renameScope rewrites every occurrence of the old scope", () => {
  const input = `import "${OLD}/ui/button"; // from ${OLD}/tokens`;
  assert.equal(
    renameScope(input, "@acme"),
    'import "@acme/ui/button"; // from @acme/tokens'
  );
});

test("renameScope leaves text without the scope untouched", () => {
  assert.equal(renameScope("no scope here", "@acme"), "no scope here");
});

test("isValidScope accepts npm-style scopes and rejects the rest", () => {
  assert.equal(isValidScope("@acme"), true);
  assert.equal(isValidScope("@acme-ds"), true);
  assert.equal(isValidScope("acme"), false);
  assert.equal(isValidScope("@Acme"), false);
  assert.equal(isValidScope("@acme/ui"), false);
});
