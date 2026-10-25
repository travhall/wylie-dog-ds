// Dry-run tests for scripts/generate-component.js (Plan 196).
// Run with: node --test scripts/__tests__/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const generate = (...args) =>
  spawnSync("node", ["scripts/generate-component.js", ...args], {
    cwd: root,
    encoding: "utf8",
  });

const plan = (...args) => {
  const result = generate(...args, "--dry-run", "--json");
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return JSON.parse(result.stdout);
};

// <component>.<part>.<property>, hyphens inside a segment, no state as a path level
const GRAMMAR = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*){1,3}$/;
const STATES = ["hover", "active", "focus", "disabled", "pressed", "checked"];

// CSS variables the scaffold references, from the token names (the token build's rule)
const cssVar = (name, token) =>
  token.type === "color"
    ? `--color-${name.replaceAll(".", "-")}`
    : `--space-${name.replaceAll(".", "-")}`;

const scaffoldVars = (content) =>
  new Set([...content.matchAll(/\((--[a-z0-9-]+)\)/g)].map((m) => m[1]));

for (const [label, args] of [
  ["primitive", ["zz-sample-card", "--category=content-display"]],
  ["composition", ["zz-sample-band", "--composition", "--category=Layout Patterns"]],
]) {
  test(`${label}: token names follow the grammar`, () => {
    const { tokens } = plan(...args);
    assert.ok(Object.keys(tokens).length >= 3);
    for (const [name, token] of Object.entries(tokens)) {
      assert.match(name, GRAMMAR, name);
      const segments = name.split(".");
      for (const segment of segments.slice(0, -1)) {
        assert.ok(!STATES.includes(segment), `${name}: state as a path level`);
      }
      assert.ok(token.description.length > 0, `${name}: no description`);
    }
  });

  test(`${label}: every variable in the scaffold is a token in the output`, () => {
    const { files, tokens } = plan(...args);
    const known = new Set(
      Object.entries(tokens).map(([name, token]) => cssVar(name, token))
    );
    const used = scaffoldVars(files[0].content);
    // focus ring colour is the one documented semantic exception (focusRingClasses)
    assert.ok(used.size > 0);
    for (const variable of used) {
      assert.ok(known.has(variable), `${variable} is not in the dry-run tokens`);
    }
    for (const variable of known) {
      assert.ok(used.has(variable), `${variable} is added but unused`);
    }
  });
}

test("a composition also gets spacing tokens, a primitive does not", () => {
  const composition = Object.keys(
    plan("zz-sample-band", "--composition", "--category=Layout Patterns").tokens
  );
  const primitive = Object.keys(
    plan("zz-sample-card", "--category=content-display").tokens
  );
  for (const part of ["padding-x", "padding-y", "gap"]) {
    assert.ok(composition.includes(`zz-sample-band.${part}`));
    assert.ok(!primitive.includes(`zz-sample-card.${part}`));
  }
});

test("the scaffold has no Tailwind scale literal", () => {
  const { files } = plan("zz-sample-band", "--composition", "--category=Layout Patterns");
  assert.doesNotMatch(
    files[0].content,
    /\b(?:p[xy]?|m[xytblr]?|gap|space-[xy]|h|w|max-w)-\d/
  );
});

test("a dry run writes nothing", () => {
  const before = spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" });
  plan("zz-sample-card", "--category=content-display");
  const after = spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" });
  assert.equal(after.stdout, before.stdout);
});

test("Bad_Name is rejected", () => {
  const result = generate("Bad_Name", "--category=content-display", "--dry-run");
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /lowercase/);
});

test("an existing component is refused", () => {
  const result = generate(
    "site-header",
    "--composition",
    "--category=Layout Patterns",
    "--dry-run"
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /already exists/);
});
