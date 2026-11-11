import assert from "node:assert/strict";
import { test } from "node:test";
import { readSyncTokens } from "../text-styles.mjs";

// Single-line controls share one size scale, so a button, a toggle, an input and a select trigger
// of the same size line up in a row. Button is the baseline (owner decision, 2026-11-11):
// height = 2 x padding-y + font size x line height + 2 x border. Button and Toggle use a 100% line
// height. A native input never goes below its font's normal line height, so Input, Select and
// Textarea keep 150% and trim the padding instead: md matches exactly, sm and lg land one pixel
// off because 4.5px and 11.5px are not on the spacing scale.

const tokens = readSyncTokens();

function resolve(name) {
  let value = tokens.get(name)?.$value;
  assert.ok(value !== undefined, `token ${name} exists`);
  while (typeof value === "string" && value.startsWith("{")) {
    const next = tokens.get(value.slice(1, -1));
    assert.ok(next, `alias ${value} resolves`);
    value = next.$value;
  }
  return parseFloat(value);
}
// space tokens are px strings ("12px"), font sizes and percentages are numbers
const px = (name) => resolve(name);
const pct = (name) => resolve(name) / 100;

const height = ({ padY, font, lineHeight, border }) =>
  2 * px(padY) + px(font) * pct(lineHeight) + 2 * px(border);

const BUTTON = {
  sm: { padY: "button.padding-y.sm", font: "button.font-size.sm" },
  md: { padY: "button.padding-y.md", font: "button.font-size.md" },
  lg: { padY: "button.padding-y.lg", font: "button.font-size.lg" },
};
const button = (s) =>
  height({
    ...BUTTON[s],
    lineHeight: "button.line-height",
    border: "button.border-width",
  });

test("button heights are the baseline: 32, 42 and 52", () => {
  assert.deepEqual(["sm", "md", "lg"].map(button), [32, 42, 52]);
});

test("a toggle is as tall as the button of the same size", () => {
  const toggle = { sm: "sm", md: "default", lg: "lg" };
  for (const [size, key] of Object.entries(toggle)) {
    const h = height({
      padY: `toggle.size.${key}.padding-y`,
      font: `toggle.font-size.${size}`,
      lineHeight: "toggle.line-height",
      border: "toggle.border-width",
    });
    assert.equal(h, button(size), `toggle ${size}`);
  }
  // a toggle group item is the default toggle
  assert.equal(
    height({
      padY: "toggle-group.item-padding-y",
      font: "toggle-group.item-font-size",
      lineHeight: "toggle-group.item-line-height",
      border: "toggle-group.item-border-width",
    }),
    button("md")
  );
});

test("an input is as tall as the button, within one pixel, and exactly at md", () => {
  for (const size of ["sm", "md", "lg"]) {
    const h = height({
      padY: `input.padding-y.${size}`,
      font: `input.font-size.${size}`,
      lineHeight: "input.line-height",
      border: "input.border-width",
    });
    assert.ok(
      Math.abs(h - button(size)) <= 1,
      `input ${size} is ${h}, button ${button(size)}`
    );
    if (size === "md") assert.equal(h, button(size));
  }
});

test("a select trigger and a textarea use the input's padding and font size for each size", () => {
  for (const size of ["sm", "md", "lg"]) {
    assert.equal(
      px(`select.trigger.padding-y.${size}`),
      px(`input.padding-y.${size}`),
      `select padding ${size}`
    );
    assert.equal(
      px(`select.trigger.font-size.${size}`),
      px(`input.font-size.${size}`),
      `select font ${size}`
    );
    assert.equal(
      px(`textarea.font-size.${size}`),
      px(`input.font-size.${size}`),
      `textarea font ${size}`
    );
  }
  assert.equal(pct("select.trigger.line-height"), pct("input.line-height"));
  assert.equal(pct("textarea.line-height"), pct("input.line-height"));
});

test("a select chevron stays under the line height so it never sets the trigger height", () => {
  for (const size of ["sm", "md", "lg"]) {
    const line =
      px(`select.trigger.font-size.${size}`) *
      pct("select.trigger.line-height");
    assert.ok(
      px("select.trigger.icon-size") <= line,
      `chevron fits the ${size} line`
    );
  }
});
