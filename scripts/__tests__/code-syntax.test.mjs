// Tests for the Figma code syntax derivation (Plan 216, Phase E).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { cssVariableName } from "../../packages/tokens/lib/css-variable.js";
import { readSyncTokens } from "../text-styles.mjs";
import {
  CODE_SYNTAX_FILE,
  checkCodeSyntax,
  declaredCssVariables,
  deriveCodeSyntax,
} from "../code-syntax.mjs";

test("the CSS name depends on the token type", () => {
  assert.equal(cssVariableName({ $type: "spacing" }, "button-padding-x-md"), "--space-button-padding-x-md");
  assert.equal(cssVariableName({ $type: "color" }, "color-button-primary-background"), "--color-button-primary-background");
  assert.equal(cssVariableName({ $type: "dimension" }, "border-radius-md"), "--border-radius-md");
  assert.equal(cssVariableName({ $type: "number" }, "button-font-size-md"), "--font-size-button-font-size-md");
  assert.equal(cssVariableName({ $type: "fontFamily" }, "typography-font-family-sans"), "--typography-font-family-sans");
  assert.equal(cssVariableName({ $type: "unknownType" }, "something-else"), "--something-else");
});

test("deriveCodeSyntax maps token paths to var() names, sorted", () => {
  const tokens = new Map([
    ["button.padding-x.md", { $type: "spacing" }],
    ["alpha.token", { $type: "unknownType" }],
  ]);
  const syntax = deriveCodeSyntax(tokens);
  assert.deepEqual(Object.keys(syntax), ["alpha.token", "button.padding-x.md"]);
  assert.equal(syntax["button.padding-x.md"], "var(--space-button-padding-x-md)");
});

test("checkCodeSyntax reports a missing token, an undeclared variable and a shared name", () => {
  const tokens = new Map([["a", {}], ["b", {}]]);
  const declared = new Set(["--x"]);
  assert.deepEqual(checkCodeSyntax({ a: "var(--x)" }, tokens, declared), []);
  const problems = checkCodeSyntax(
    { a: "var(--x)", b: "var(--x)", c: "var(--nope)", d: "plain" },
    tokens,
    declared
  );
  assert.ok(problems.some((p) => p.includes("c is not a token")));
  assert.ok(problems.some((p) => p.includes("--nope is not declared")));
  assert.ok(problems.some((p) => p.includes("share --x")));
  assert.ok(problems.some((p) => p.includes('"plain" is not var(--name)')));
});

test("the committed file matches the tokens and the built CSS", () => {
  const tokens = readSyncTokens();
  const committed = JSON.parse(fs.readFileSync(CODE_SYNTAX_FILE, "utf8"));
  assert.equal(committed.platform, "WEB");
  assert.deepEqual(committed.syntax, deriveCodeSyntax(tokens));
  assert.deepEqual(checkCodeSyntax(committed.syntax, tokens, declaredCssVariables()), []);
});
