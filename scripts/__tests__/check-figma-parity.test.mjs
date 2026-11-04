// Tests for the Figma parity check (Plan 216, Phase C), on small fixture manifests.
import test from "node:test";
import assert from "node:assert/strict";
import {
  compare,
  cvaVariantsOf,
  defaultVariantsOf,
  norm,
  optionsOf,
  readCodeComponents,
  renderReport,
} from "../check-figma-parity.mjs";

const docgen = (name, props) => ({
  id: name,
  name,
  reactDocgenTypescript: { filePath: `src/${name}.tsx`, props },
});
const union = (...o) => ({ type: { name: o.map((x) => `"${x}"`).join(" | ") + " | null" } });
const storybook = (...entries) => ({
  components: Object.fromEntries(entries.map((e) => [e.id, e])),
});
const set = (name, properties, extra = {}) => ({
  name,
  type: "COMPONENT_SET",
  id: "1:1",
  description: "A component.",
  documentationLinks: ["https://example.test"],
  properties,
  variantCount: 1,
  expectedVariantCount: 1,
  ...extra,
});
const variant = (def, options) => ({ type: "VARIANT", default: def, options });
const figmaOf = (...components) => ({ components });
const rules = (r) => r.findings.map((f) => `${f.rule}:${f.component}`);

const button = docgen("Button", {
  variant: union("default", "secondary"),
  size: union("default", "sm"),
});
const buttonSource = 'cva("x", { variants: {}, defaultVariants: { variant: "default", size: "default" } })';

test("helpers parse unions, booleans, defaults and names", () => {
  assert.deepEqual(optionsOf('"a" | "b" | null'), ["a", "b"]);
  assert.deepEqual(optionsOf("boolean"), ["false", "true"]);
  assert.equal(optionsOf("string"), null);
  assert.deepEqual(defaultVariantsOf(buttonSource), { variant: "default", size: "default" });
  assert.equal(norm("Navigation Menu"), norm("NavigationMenu"));
});

test("a matching component produces no structural findings", () => {
  const code = readCodeComponents(storybook(button), () => buttonSource);
  const fig = figmaOf(
    set("Button", {
      variant: variant("default", ["default", "secondary"]),
      size: variant("default", ["default", "sm"]),
    })
  );
  assert.deepEqual(compare(code, fig).findings, []);
});

test("reports missing components in both directions and honours the name map", () => {
  const code = readCodeComponents(storybook(button, docgen("RadioGroup", { x: union("a", "b") })), () => "");
  const fig = figmaOf(
    set("Radio", { x: variant("a", ["a", "b"]) }),
    set("Gadget", { x: variant("a", ["a", "b"]) })
  );
  const unmapped = rules(compare(code, fig));
  assert.ok(unmapped.includes("missing-in-code:Radio"));
  const mapped = rules(compare(code, fig, { names: { Radio: "RadioGroup" } }));
  assert.ok(!mapped.includes("missing-in-code:Radio"));
  assert.ok(mapped.includes("missing-in-figma:Button"));
  assert.ok(mapped.includes("missing-in-code:Gadget"));
});

test("reports option, default, generic-property and partial-set differences", () => {
  const code = readCodeComponents(storybook(button), () => buttonSource);
  const fig = figmaOf(
    set(
      "Button",
      {
        variant: variant("secondary", ["default", "secondary"]),
        size: variant("sm", ["sm"]),
        "Property 1": variant("Default", ["Default"]),
      },
      { variantCount: 1, expectedVariantCount: 2 }
    )
  );
  const found = rules(compare(code, fig));
  for (const r of ["options-differ", "default-differs", "generic-property", "partial-set"]) {
    assert.ok(found.includes(`${r}:Button`), r);
  }
});

test("state axis, inherited props and unreadable components get their own rules", () => {
  const code = readCodeComponents(
    storybook(button, docgen("Dialog", {})),
    () => buttonSource
  );
  const fig = figmaOf(
    set("Button", {
      variant: variant("default", ["default", "secondary"]),
      size: variant("default", ["default", "sm"]),
      state: variant("default", ["default", "disabled"]),
      disabled: variant("false", ["false", "true"]),
    }),
    set("Dialog", { size: variant("sm", ["sm", "md"]), state: variant("a", ["a", "b"]), "Property 1": variant("D", ["D"]) })
  );
  const found = rules(compare(code, fig));
  assert.ok(found.includes("state-axis:Button"));
  assert.ok(found.includes("inherited-property:Button"));
  assert.ok(found.includes("props-unreadable:Dialog"));
  assert.ok(found.includes("state-axis:Dialog"));
  assert.ok(found.includes("generic-property:Dialog"));
  assert.ok(!found.includes("property-not-in-code:Dialog"));
});

test("an allow-list entry suppresses a finding; an unused entry is reported", () => {
  const code = readCodeComponents(storybook(button), () => buttonSource);
  const fig = figmaOf(
    set("Button", {
      variant: variant("default", ["default", "secondary"]),
      size: variant("sm", ["sm", "default"]),
    })
  );
  const config = {
    allow: [
      { component: "Button", rule: "default-differs", property: "size", reason: "test" },
      { component: "Nothing", rule: "partial-set", reason: "test" },
    ],
  };
  const r = compare(code, fig, config);
  const f = r.findings.find((x) => x.rule === "default-differs");
  assert.equal(f.allowed, "test");
  assert.equal(r.staleAllow.length, 1);
});

test("empty descriptions and links are findings; the report renders", () => {
  const code = readCodeComponents(storybook(button), () => buttonSource);
  const fig = figmaOf(
    set(
      "Button",
      {
        variant: variant("default", ["default", "secondary"]),
        size: variant("default", ["default", "sm"]),
      },
      { description: "", documentationLinks: [] }
    )
  );
  const r = compare(code, fig);
  assert.deepEqual(
    rules(r).sort(),
    ["no-description:Button", "no-doc-link:Button"]
  );
  const md = renderReport(r, { fileKey: "k", generatedAt: "t" }, false);
  assert.match(md, /Generated by/);
  assert.match(md, /2 open/);
});

test("an alias reads a code option as another before comparing", () => {
  const code = readCodeComponents(storybook(button), () => buttonSource);
  const fig = figmaOf(
    set("Button", {
      variant: variant("default", ["default", "secondary"]),
      size: variant("sm", ["sm"]),
    })
  );
  const none = rules(compare(code, fig));
  assert.ok(none.includes("options-differ:Button"));
  const aliased = compare(code, figmaOf(
    set("Button", {
      variant: variant("default", ["default", "secondary"]),
      size: variant("md", ["md", "sm"]),
    })
  ), { aliases: [{ component: "Button", property: "size", from: "default", to: "md", reason: "same" }] });
  assert.deepEqual(aliased.findings, []);
});

test("cvaVariantsOf reads variant names and options from source, skipping class strings", () => {
  const source = `
    const a = cva("base {x}", {
      variants: {
        size: { sm: "h-1 [&>svg]:w-2", "full-width": cn("a", cond && "b"), lg: \`c\` },
        error: { true: "x", false: "" },
      },
      defaultVariants: { size: "sm" },
    });
    const b = cva("y", { variants: { size: { xl: "z" } } });
  `;
  assert.deepEqual(cvaVariantsOf(source), {
    size: ["sm", "full-width", "lg", "xl"],
    error: ["true", "false"],
  });
});

test("cva variants fill in props the manifest misses, and the unreadable rule then no longer fires", () => {
  const dialog = docgen("Dialog", {});
  const code = readCodeComponents(
    storybook(dialog),
    () => 'cva("x", { variants: { size: { sm: "a", md: "b" } }, defaultVariants: { size: "sm" } })'
  );
  assert.deepEqual(code.get("dialog").props.size, { options: ["sm", "md"], default: "sm" });
  const fig = figmaOf(set("Dialog", { size: variant("sm", ["sm", "md", "lg"]) }));
  const found = rules(compare(code, fig));
  assert.ok(found.includes("options-differ:Dialog"));
  assert.ok(!found.includes("props-unreadable:Dialog"));
});

test("with story docs, a different description or link is a finding", () => {
  const code = readCodeComponents(storybook(button), () => buttonSource);
  const docs = new Map([["button", { description: "Right.", url: "https://s.test/button" }]]);
  const base = {
    variant: variant("default", ["default", "secondary"]),
    size: variant("default", ["default", "sm"]),
  };
  const same = compare(
    code,
    figmaOf(set("Button", base, { description: "Right.", documentationLinks: ["https://s.test/button"] })),
    {},
    docs
  );
  assert.deepEqual(same.findings, []);
  const diff = compare(
    code,
    figmaOf(set("Button", base, { description: "Old.", documentationLinks: ["https://s.test/old"] })),
    {},
    docs
  );
  assert.deepEqual(rules(diff).sort(), ["description-differs:Button", "doc-link-differs:Button"]);
});
