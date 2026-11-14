import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Ajv from "ajv";

const load = (name) =>
  JSON.parse(
    readFileSync(new URL(`../schema/${name}`, import.meta.url), "utf8")
  );

const ajv = new Ajv({ allErrors: true });
const validateTokens = ajv.compile(load("token-file.schema.json"));
const validateResolver = ajv.compile(load("resolver.schema.json"));

const coral = { colorSpace: "oklch", components: [0.61, 0.169, 37.68] };
const layer = {
  color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.05 },
  offsetX: { value: 0, unit: "px" },
  offsetY: { value: 1, unit: "px" },
  blur: { value: 2, unit: "px" },
  spread: { value: 0, unit: "px" },
};

// One token per supported type, mirroring real tokens in io/sync.
const valid = () => ({
  color: {
    "fiery-coral": {
      600: { $type: "color", $value: coral, $description: "Brand fill." },
    },
    background: {
      primary: { $type: "color", $value: "{color.fiery-coral.600}" },
    },
  },
  space: {
    100: { $type: "dimension", $value: { value: 0.5, unit: "rem" } },
  },
  typography: {
    "font-family": { sans: { $type: "fontFamily", $value: "Manrope" } },
    scale: { $type: "number", $value: 1.05 },
    tracking: {
      tighter: {
        $type: "number",
        $value: -0.05,
        $extensions: { "com.wyliedog.tokens": { unit: "em" } },
      },
    },
  },
  motion: {
    fast: { $type: "duration", $value: { value: 150, unit: "ms" } },
    ease: { $type: "cubicBezier", $value: [0.4, 0, 0.2, 1] },
  },
  shadow: {
    sm: { $type: "shadow", $value: layer },
    md: { $type: "shadow", $value: [layer, { ...layer, inset: true }] },
    none: {
      $type: "shadow",
      $value: {
        ...layer,
        color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0 },
        offsetY: { value: 0, unit: "px" },
        blur: { value: 0, unit: "px" },
      },
    },
  },
});

const rejects = (file, why) => assert.equal(validateTokens(file), false, why);

test("token file: a valid file with every supported type passes", () => {
  assert.equal(
    validateTokens(valid()),
    true,
    JSON.stringify(validateTokens.errors)
  );
});

test("token file: names may not contain dots or braces", () => {
  const file = valid();
  file["color.coral"] = file.color["fiery-coral"][600];
  rejects(file, "a dotted name is not DTCG");
});

test("token file: every token needs an explicit $type", () => {
  const file = valid();
  delete file.space[100].$type;
  rejects(file, "$type is required by the contract");
});

test("token file: a colour is an object, not a CSS string", () => {
  const file = valid();
  file.color["fiery-coral"][600].$value = "oklch(0.61 0.169 37.68)";
  rejects(file, "CSS colour strings are not strict DTCG");
});

test("token file: dimensions allow px and rem only", () => {
  const file = valid();
  file.space[100].$value = { value: 0.05, unit: "em" };
  rejects(file, "em is not a DTCG dimension unit");
});

test("token file: spacing and fontSize are not DTCG types", () => {
  const file = valid();
  file.space[100].$type = "spacing";
  rejects(file, "spacing converts to dimension");
});

test("token file: numbers are JSON numbers, not strings", () => {
  const file = valid();
  file.typography.scale.$value = "1.05";
  rejects(file, "a numeric string is not a number");
});

test("token file: a shadow is an object or array, not a CSS string", () => {
  const file = valid();
  file.shadow.sm.$value = "0 1px 2px 0 rgb(0 0 0 / 0.05)";
  rejects(file, "CSS shadow strings are not strict DTCG");
});

test("token file: a reference must be a braced dotted path", () => {
  const file = valid();
  file.color.background.primary.$value = "color.fiery-coral.600";
  rejects(file, "an unbraced string is not a reference");
});

test("token file: cubic bezier x values stay within 0 to 1", () => {
  const file = valid();
  file.motion.ease.$value = [1.5, 0, 0.2, 1];
  rejects(file, "x1 must be in 0..1");
});

const resolver = () => ({
  version: "2025.10",
  name: "Wylie Dog tokens",
  sets: { primitive: { sources: [{ $ref: "primitive.json" }] } },
  modifiers: {
    theme: {
      contexts: {
        light: [{ $ref: "semantic.light.json" }],
        dark: [{ $ref: "semantic.dark.json" }],
      },
      default: "light",
    },
  },
  resolutionOrder: [
    { $ref: "#/sets/primitive" },
    { $ref: "#/modifiers/theme" },
  ],
});

test("resolver: the Wylie Dog layout passes", () => {
  assert.equal(
    validateResolver(resolver()),
    true,
    JSON.stringify(validateResolver.errors)
  );
});

test("resolver: version must be 2025.10", () => {
  const file = resolver();
  file.version = "2024.01";
  assert.equal(validateResolver(file), false);
});

test("resolver: a modifier needs at least two contexts", () => {
  const file = resolver();
  delete file.modifiers.theme.contexts.dark;
  assert.equal(
    validateResolver(file),
    false,
    "a single mode is a set, not a modifier"
  );
});

test("resolver: sources are file references, not inline tokens", () => {
  const file = resolver();
  file.sets.primitive.sources = [{ color: { $type: "color", $value: coral } }];
  assert.equal(validateResolver(file), false);
});

test("resolver: resolutionOrder may only point at sets and modifiers", () => {
  const file = resolver();
  file.resolutionOrder = [{ $ref: "primitive.json" }];
  assert.equal(validateResolver(file), false);
});
