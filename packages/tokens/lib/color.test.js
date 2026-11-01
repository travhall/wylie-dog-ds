import { test } from "node:test";
import assert from "node:assert/strict";
import {
  apcaContrast,
  contrastRatio,
  findCssVar,
  parseOklch,
  toHex,
} from "./color.js";

const near = (actual, expected, tolerance) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} is not within ${tolerance} of ${expected}`
  );

test("white on black is 21:1 and a mid grey on white is 6:1", () => {
  near(contrastRatio("oklch(1 0 0)", "oklch(0 0 0)"), 21, 0.01);
  near(contrastRatio("oklch(0.5 0 0)", "oklch(1 0 0)"), 6, 0.01);
});

test("accepts percent lightness, hex input, and an alpha of one", () => {
  assert.deepEqual(parseOklch("oklch(61% 0.169 37.69)"), [0.61, 0.169, 37.69]);
  assert.deepEqual(parseOklch("oklch(0.5 0 0 / 1)"), [0.5, 0, 0]);
  near(contrastRatio("#000000", "#ffffff"), 21, 0.01);
});

test("rejects a color with transparency, because contrast needs opaque colors", () => {
  assert.throws(() => parseOklch("oklch(0.5 0 0 / 0.5)"), /alpha/);
  assert.throws(() => parseOklch("rgb(0 0 0)"), /Unsupported/);
});

test("converts OKLCH to hex at the extremes and round-trips a hex value", () => {
  assert.equal(toHex("oklch(1 0 0)"), "#ffffff");
  assert.equal(toHex("oklch(0 0 0)"), "#000000");
  assert.equal(toHex("#43372a"), "#43372a");
});

test("the polar-night primitive converts to the teal in the dog logo", () => {
  // polar-night 500 is oklch(0.361 0.058 221.82); the logo's fill is #114453.
  assert.equal(toHex("oklch(0.361 0.058 221.82)"), "#114453");
});

test("clamps an out-of-gamut color to a valid hex", () => {
  assert.match(toHex("oklch(0.7 0.4 150)"), /^#[0-9a-f]{6}$/);
});

test("the WCAG ratio for the coral fill matches the documented values", () => {
  const coral600 = "oklch(0.61 0.169 37.69)";
  near(contrastRatio("oklch(0.991 0.003 264.39)", coral600), 3.98, 0.02);
  near(contrastRatio("oklch(0.149 0.012 259.74)", coral600), 4.83, 0.02);
});

test("APCA rates white on the coral fill far above dark text on it", () => {
  const coral600 = "oklch(0.61 0.169 37.69)";
  const white = "oklch(0.991 0.003 264.39)";
  const dark = "oklch(0.149 0.012 259.74)";
  near(apcaContrast(white, coral600), 70.7, 1);
  near(apcaContrast(dark, coral600), 36.7, 1);
  assert.ok(apcaContrast(white, coral600) > apcaContrast(dark, coral600) + 30);
});

test("APCA is zero for identical colors", () => {
  assert.equal(apcaContrast("oklch(0.5 0 0)", "oklch(0.5 0 0)"), 0);
});

test("finds a custom property declaration and not a longer name that starts the same", () => {
  const css = ":root { --a: 1; --a-b: 2; }\n.dark { --a: 3; }";
  assert.equal(findCssVar(css, "--a"), "1");
  assert.equal(findCssVar(css, "--a-b"), "2");
  assert.equal(findCssVar(css, "--b"), null);
});
