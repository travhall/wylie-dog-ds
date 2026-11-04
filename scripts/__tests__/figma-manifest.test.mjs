// Shape checks for the committed Figma manifest (Plan 216, Phase B). The manifest is a
// snapshot written through the Figma MCP (scripts/figma/export-manifest.js); these tests
// catch a bad or hand-damaged snapshot, not drift against the code (Phase C does that).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(
  fs.readFileSync(new URL("../../figma/manifest.json", import.meta.url), "utf8")
);

test("manifest has a schema, a file key, a timestamp and a matching count", () => {
  assert.equal(manifest.schema, 1);
  assert.match(manifest.fileKey, /^[0-9a-zA-Z]{22,128}$/);
  assert.ok(!Number.isNaN(Date.parse(manifest.generatedAt)));
  assert.equal(manifest.count, manifest.components.length);
});

test("components are unique, sorted by name and carry the agreed fields", () => {
  const names = manifest.components.map((c) => c.name);
  assert.equal(new Set(names).size, names.length);
  assert.deepEqual(
    names,
    [...names].sort((a, b) => a.localeCompare(b))
  );
  for (const c of manifest.components) {
    assert.ok(c.id && c.type, `${c.name}: id and type`);
    assert.equal(typeof c.description, "string", `${c.name}: description`);
    assert.ok(Array.isArray(c.documentationLinks), `${c.name}: links`);
    assert.equal(typeof c.properties, "object", `${c.name}: properties`);
  }
});

test("every variant property has options that include its default", () => {
  for (const c of manifest.components) {
    let expected = 1;
    for (const [name, p] of Object.entries(c.properties)) {
      if (p.type !== "VARIANT") continue;
      assert.ok(p.options?.length > 0, `${c.name}.${name}: options`);
      assert.ok(p.options.includes(p.default), `${c.name}.${name}: default`);
      expected *= p.options.length;
    }
    if (c.type === "COMPONENT_SET") {
      assert.equal(c.expectedVariantCount, expected, `${c.name}: expected count`);
      assert.ok(c.variantCount <= expected, `${c.name}: variant count`);
    }
  }
});
