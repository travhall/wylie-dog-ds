// Tests for the text style definitions generator (Plan 206).
// Run with: node --test scripts/__tests__/
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFINITIONS_FILE,
  checkReferences,
  deriveTextStyles,
  readSyncTokens,
  resolveValue,
  serializeDefinitions,
} from "../text-styles.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const tokenMap = (entries, file = "components.json") =>
  new Map(
    Object.entries(entries).map(([name, $value]) => [name, { $value, file }])
  );

const primitives = {
  "typography.font-family.sans": "Manrope",
  "typography.font-size.sm": 14,
  "typography.font-weight.medium": 500,
  "typography.line-height.tight": 125,
  "typography.tracking.tight": "-0.025em",
};

const sample = () =>
  new Map([
    ...tokenMap(primitives, "primitive.json"),
    ...tokenMap({
      "button.font-size.sm": "{typography.font-size.sm}",
      "button.font-size.md": "{typography.font-size.sm}",
      "button.font-weight": "{typography.font-weight.medium}",
      "button.line-height": "{typography.line-height.tight}",
      "dialog.title-font-size": "{typography.font-size.sm}",
      "dialog.title-letter-spacing": "{typography.tracking.tight}",
      "hero.title.font-size-lg": "{typography.font-size.sm}",
      "hero.title.font-size-sm": "{typography.font-size.sm}",
      "hero.title.tracking": "{typography.tracking.tight}",
      "hero.title.tracking-sm": "{typography.tracking.tight}",
      "tooltip.font-size": "{typography.font-size.sm}",
      "card.title.font-weight": "{typography.font-weight.medium}",
    }),
  ]);

test("pairs weight, line height and tracking by prefix, sized names win", () => {
  const { styles } = deriveTextStyles(sample());
  const byName = Object.fromEntries(styles.map((s) => [s.name, s]));
  assert.deepEqual(byName["button/sm"], {
    name: "button/sm",
    fontFamily: "typography.font-family.sans",
    fontSize: "button.font-size.sm",
    fontWeight: "button.font-weight",
    lineHeight: "button.line-height",
  });
  assert.equal(byName["button/md"].fontSize, "button.font-size.md");
  assert.equal(byName["dialog/title"].letterSpacing, "dialog.title-letter-spacing");
  assert.equal(byName["hero/title/sm"].letterSpacing, "hero.title.tracking-sm");
  assert.equal(byName["hero/title/lg"].letterSpacing, "hero.title.tracking");
});

test("a size-only part gets a style with no partners", () => {
  const { styles } = deriveTextStyles(sample());
  const tooltip = styles.find((s) => s.name === "tooltip");
  assert.deepEqual(Object.keys(tooltip), ["name", "fontFamily", "fontSize"]);
});

test("names are paths: dots become slashes, hyphens stay, size is last", () => {
  const names = deriveTextStyles(sample()).styles.map((s) => s.name);
  assert.ok(names.includes("dialog/title"));
  assert.ok(names.includes("hero/title/lg"));
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)));
});

test("typographic tokens with no font size are reported, not paired", () => {
  const { styles, orphans } = deriveTextStyles(sample());
  assert.deepEqual(orphans, ["card.title.font-weight"]);
  assert.ok(!styles.some((s) => s.name.startsWith("card")));
});

test("only component tokens make styles", () => {
  const tokens = sample();
  tokens.set("typography.font-size.sm", { $value: 14, file: "primitive.json" });
  assert.ok(
    !deriveTextStyles(tokens).styles.some((s) => s.name.startsWith("typography"))
  );
});

test("alias chains resolve; broken ones do not", () => {
  const tokens = sample();
  assert.equal(resolveValue(tokens, "button.font-size.sm"), 14);
  assert.equal(resolveValue(tokens, "nope"), undefined);
  tokens.set("loop.a", { $value: "{loop.b}", file: "components.json" });
  tokens.set("loop.b", { $value: "{loop.a}", file: "components.json" });
  assert.equal(resolveValue(tokens, "loop.a"), undefined);
});

test("derived styles pass the reference check", () => {
  const tokens = sample();
  assert.deepEqual(checkReferences(deriveTextStyles(tokens).styles, tokens), []);
});

test("a missing token and an unusable value are named", () => {
  const tokens = sample();
  const styles = deriveTextStyles(tokens).styles;
  styles[0].lineHeight = "button.gone";
  styles[1].fontWeight = "typography.font-family.sans";
  const problems = checkReferences(styles, tokens);
  assert.equal(problems.length, 2);
  assert.match(problems[0], /lineHeight token "button.gone" does not exist/);
  assert.match(problems[1], /fontWeight token .* does not resolve/);
});

test("duplicate names and missing required fields are named", () => {
  const tokens = sample();
  const [first] = deriveTextStyles(tokens).styles;
  const problems = checkReferences([first, { ...first }, { name: "x" }], tokens);
  assert.ok(problems.some((p) => /duplicate style name/.test(p)));
  assert.ok(problems.some((p) => /fontSize is required/.test(p)));
});

test("the committed definitions are current and reference real tokens", () => {
  const tokens = readSyncTokens(root);
  const { styles } = deriveTextStyles(tokens);
  const committed = fs.readFileSync(path.join(root, DEFINITIONS_FILE), "utf8");
  assert.equal(
    committed,
    serializeDefinitions(styles),
    "stale: run pnpm generate:text-styles"
  );
  assert.deepEqual(checkReferences(JSON.parse(committed).styles, tokens), []);
});

test("every component font-size token has a style", () => {
  const tokens = readSyncTokens(root);
  const sizes = [...tokens.keys()].filter(
    (n) => tokens.get(n).file === "components.json" && /font-size/.test(n)
  );
  assert.equal(deriveTextStyles(tokens).styles.length, sizes.length);
});
