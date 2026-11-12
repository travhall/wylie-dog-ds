// Plan 217: the code-vs-Figma comparison. Run with: pnpm test:scripts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  TOLERANCE,
  applyAllow,
  compareMetrics,
  parseHex,
  sameColor,
  weightOf,
} from "../figma/compare-ui.mjs";

const box = (over = {}) => ({
  w: 80,
  h: 40,
  pad: [8, 16, 8, 16],
  gap: 8,
  radius: 6,
  border: 1,
  stroke: "#112233",
  fill: "#445566",
  opacity: 1,
  shadow: [],
  ...over,
});
const text = (over = {}) => ({
  characters: "Button",
  family: "Manrope",
  size: 14,
  weight: 500,
  lineHeight: 20,
  tracking: 0,
  decoration: "none",
  color: "#ffffff",
  ...over,
});
const item = (over = {}) => ({
  set: "Button",
  variant: "variant=default, size=md",
  box: box(),
  texts: [text()],
  ...over,
});
const files = (f, c) => compareMetrics({ items: [f] }, { items: [c] });

test("identical measurements have no findings", () => {
  const r = files(item(), item());
  assert.deepEqual(r.findings, []);
  assert.deepEqual(r.missing, []);
});

test("sizes and spacing allow one pixel and no more", () => {
  assert.deepEqual(files(item(), item({ box: box({ w: 81 }) })).findings, []);
  const r = files(item(), item({ box: box({ w: 82, pad: [8, 16, 8, 14] }) }));
  assert.deepEqual(r.findings.map((f) => f.property).sort(), ["pad", "w"]);
});

test("a colour allows a small channel difference and not a different colour", () => {
  assert.equal(sameColor("#445566", "#475766"), true);
  assert.equal(sameColor("#445566", "#4a5566"), false);
  assert.equal(sameColor("#44556680", "#445566"), false);
  assert.equal(
    sameColor(null, "#00000000"),
    true,
    "no fill equals a clear one"
  );
  assert.equal(sameColor("#ffffff00", "#00000000"), true, "clear is clear");
  assert.deepEqual(
    parseHex("#ff000080").map((n) => Math.round(n * 100) / 100),
    [255, 0, 0, 0.5]
  );
  assert.equal(parseHex("red"), null);
});

test("the gaps the manual audit missed are now caught: family, tracking, shadow, opacity, weight", () => {
  const f = item({
    box: box({
      opacity: 0.5,
      shadow: [{ x: 0, y: 1, blur: 3, spread: 0, color: "#00000033" }],
    }),
    texts: [text({ family: "JetBrains Mono", tracking: 1, weight: "Medium" })],
  });
  const c = item({
    box: box({ opacity: 1, shadow: [] }),
    texts: [text({ family: "Manrope", tracking: 0, weight: 600 })],
  });
  const props = files(f, c)
    .findings.map((x) => `${x.scope}:${x.property}`)
    .sort();
  assert.deepEqual(props, [
    "box:opacity",
    "box:shadow",
    "text:family",
    "text:tracking",
    "text:weight",
  ]);
});

test("a family list compares by its first family, a weight name by its number", () => {
  const r = files(
    item({ texts: [text({ family: "JetBrains Mono", weight: "Medium" })] }),
    item({
      texts: [
        text({
          family: '"JetBrains Mono", ui-monospace, monospace',
          weight: 500,
        }),
      ],
    })
  );
  assert.deepEqual(r.findings, []);
  assert.equal(weightOf("SemiBold"), 600);
  assert.equal(weightOf("Semi Bold"), 600);
  assert.equal(weightOf("700"), 700);
  assert.equal(weightOf("nonsense"), null);
});

test("a missing text layer and a variant with no UI measurement are reported", () => {
  const r = files(item(), item({ texts: [] }));
  assert.equal(r.findings[0].property, "layer");
  const gone = compareMetrics(
    { items: [item()] },
    { items: [item({ variant: "variant=other" })] }
  );
  assert.deepEqual(gone.missing, ["Button variant=default, size=md"]);
  assert.deepEqual(gone.extra, ["Button variant=other"]);
});

test("an icon's drawn stroke must match to a tenth of a pixel", () => {
  // the same 2px token drawn flat in Figma and scaled by the viewBox in the UI (1.33px at 16px)
  const r = files(
    item({ icon: { stroke: 2 } }),
    item({ icon: { stroke: 1.33 } })
  );
  assert.deepEqual(
    r.findings.map((f) => [f.scope, f.property, f.figma, f.code]),
    [["icon", "stroke", 2, 1.33]]
  );
  assert.deepEqual(
    files(item({ icon: { stroke: 2 } }), item({ icon: { stroke: 2.04 } }))
      .findings,
    []
  );
});

test("an icon is compared only when both sides have one", () => {
  assert.deepEqual(files(item({ icon: { stroke: 2 } }), item()).findings, []);
  assert.deepEqual(files(item(), item({ icon: { stroke: 2 } })).findings, []);
});

test("shadows compare layer by layer", () => {
  const s = { x: 0, y: 4, blur: 6, spread: -1, color: "#0000001a" };
  const same = files(
    item({ box: box({ shadow: [s] }) }),
    item({ box: box({ shadow: [{ ...s, blur: 6.4 }] }) })
  );
  assert.deepEqual(same.findings, []);
  const diff = files(
    item({ box: box({ shadow: [s] }) }),
    item({ box: box({ shadow: [{ ...s, y: 8 }] }) })
  );
  assert.equal(diff.findings[0].property, "shadow");
});

test("an allow entry moves a finding aside, and one that matches nothing is stale", () => {
  const { findings } = files(item(), item({ box: box({ radius: 12 }) }));
  const r = applyAllow(findings, [
    { set: "Button", property: "radius", reason: "pill look agreed" },
    { set: "Badge", property: "fill", reason: "unused" },
  ]);
  assert.equal(r.open.length, 0);
  assert.equal(r.allowed[0].reason, "pill look agreed");
  assert.deepEqual(
    r.stale.map((a) => a.set),
    ["Badge"]
  );
  const scoped = applyAllow(findings, [
    {
      set: "Button",
      property: "radius",
      variant: "variant=ghost",
      reason: "x",
    },
  ]);
  assert.equal(
    scoped.open.length,
    1,
    "a variant-scoped entry does not cover other variants"
  );
});

test("an allow entry whose variant ends in $ matches only the end of the variant name", () => {
  const { findings } = files(
    item({ variant: "Size=md :: select-stack" }),
    item({ variant: "Size=md :: select-stack", box: box({ radius: 12 }) })
  );
  const rows = files(
    item({ variant: "Size=md :: select-stack-row" }),
    item({ variant: "Size=md :: select-stack-row", box: box({ radius: 12 }) })
  ).findings;
  const allow = [
    {
      set: "Button",
      property: "radius",
      variant: ":: select-stack$",
      reason: "x",
    },
  ];
  assert.equal(applyAllow(findings, allow).open.length, 0);
  assert.equal(
    applyAllow(rows, allow).open.length,
    1,
    "the row is not the stack"
  );
});

test("an allow entry's variant is written the code's way and still matches the Title Case Figma name", () => {
  const { findings } = files(
    item({ variant: "State=With Selection :: table-row#1" }),
    item({
      variant: "State=With Selection :: table-row#1",
      box: box({ radius: 12 }),
    })
  );
  const r = applyAllow(findings, [
    {
      set: "Button",
      property: "radius",
      variant: "state=with-selection :: table-row#1",
      reason: "x",
    },
  ]);
  assert.equal(r.open.length, 0);
  assert.equal(r.stale.length, 0);
});

test("the harvester turns a Figma variant into story args, and a prop-backed state into its arg", async () => {
  const { argsParam, parseVariant, storyUrl } =
    await import("../figma/harvest-ui.mjs");
  assert.deepEqual(parseVariant("variant=link, size=md, state=hover"), {
    variant: "link",
    size: "md",
    state: "hover",
  });
  assert.deepEqual(
    parseVariant("Variant=Link, Size=md, State=Hover, Loading=False"),
    {
      variant: "link",
      size: "md",
      state: "hover",
      loading: "false",
    }
  );
  assert.deepEqual(parseVariant("State=With Many Pages, Size=md"), {
    state: "with-many-pages",
    size: "md",
  });
  const button = {
    story: "components-inputs-controls-button--default",
    args: { variant: "variant", size: "size", disabled: "disabled" },
    state: "state",
  };
  assert.equal(
    argsParam(
      parseVariant("variant=ghost, size=lg, disabled=true, state=hover"),
      button
    ),
    "variant:ghost;size:lg;disabled:!true"
  );
  const input = {
    story: "components-inputs-controls-input--default",
    args: { size: "size" },
    state: "state",
    stateArgs: { error: "error:!true" },
  };
  assert.match(
    storyUrl("http://x", input, parseVariant("size=md, state=error"), "dark"),
    /id=components-inputs-controls-input--default.*globals=theme:dark.*args=size:md;error:!true$/
  );
  assert.match(
    storyUrl(
      "http://x",
      input,
      parseVariant("size=md, state=default"),
      "light"
    ),
    /args=size:md$/
  );
});

test("one Figma value can be several story args, or live in another story", async () => {
  const { argsParam, parseVariant, storyUrl } =
    await import("../figma/harvest-ui.mjs");
  const checkbox = {
    story: "components-inputs-controls-checkbox--default",
    args: { size: "size", checked: "checked" },
    valueArgs: { checked: { error: "error:!true;checked:!false" } },
  };
  assert.equal(
    argsParam(parseVariant("size=md, checked=error, disabled=false"), checkbox),
    "size:md;error:!true;checked:!false"
  );
  assert.equal(
    argsParam(parseVariant("size=md, checked=true, disabled=false"), checkbox),
    "size:md;checked:!true"
  );
  const toast = {
    story: "components-feedback-status-toast--controls-on-solid-toasts",
    args: {},
    valueStories: {
      variant: { default: "components-feedback-status-toast--with-action" },
    },
  };
  assert.match(
    storyUrl("http://x", toast, parseVariant("variant=default"), "dark"),
    /id=components-feedback-status-toast--with-action&/
  );
  assert.match(
    storyUrl("http://x", toast, parseVariant("variant=info"), "dark"),
    /id=components-feedback-status-toast--controls-on-solid-toasts&/
  );
});

test("a property that only has valueArgs still turns into story args", async () => {
  const { argsParam } = await import("../figma/harvest-ui.mjs");
  const input = {
    args: { size: "size" },
    valueArgs: { filled: { true: "defaultValue:Input text" } },
  };
  assert.equal(
    argsParam({ size: "md", filled: "true" }, input),
    "size:md;defaultValue:Input text"
  );
  assert.equal(argsParam({ size: "md", filled: "false" }, input), "size:md");
});

test("the tolerance is the documented one", () => {
  assert.equal(TOLERANCE.px, 1);
  assert.equal(TOLERANCE.colorChannel, 3);
});
