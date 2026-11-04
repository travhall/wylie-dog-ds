// Tests for the component descriptions and links of the Figma library (Plan 216, Phase E).
import test from "node:test";
import assert from "node:assert/strict";
import {
  componentDocs,
  docsByFigmaName,
  docsUrl,
  figmaDescription,
  firstParagraph,
  patchBuilder,
  readStoryDescription,
} from "../figma/component-docs.mjs";

const story = (text) =>
  "const meta = { parameters: { docs: { description: { component: `" + text + "` } } } };";

test("readStoryDescription reads a template literal and its escapes", () => {
  const raw = readStoryDescription(story("First \\`code\\` line.\n\nSecond."));
  assert.equal(raw, "First `code` line.\n\nSecond.");
  assert.equal(readStoryDescription("export default {};"), null);
  assert.equal(readStoryDescription('{ description: { component: "A \\"quoted\\" one." } }'), 'A "quoted" one.');
});

test("firstParagraph keeps the first paragraph as plain text", () => {
  assert.equal(
    firstParagraph("A **bold** [link](https://x.test) and `code`.\nSecond line.\n\n- item"),
    "A bold link and code. Second line."
  );
});

test("figmaDescription cuts after the last whole sentence that fits", () => {
  const long = "One sentence here. Two sentence here. " + "Three ".repeat(60) + "end.";
  assert.equal(figmaDescription(long, 60), "One sentence here. Two sentence here.");
  assert.equal(figmaDescription("Only one very long sentence " + "x".repeat(100) + ".", 20).startsWith("Only one"), true);
  assert.equal(figmaDescription("Short.", 280), "Short.");
});

test("componentDocs maps names to docs, preferring the Components story over Patterns", () => {
  const manifest = {
    components: {
      "patterns-data-card-grid": { id: "patterns-data-card-grid", name: "CardGrid", path: "p.tsx" },
      "components-layout-cardgrid": { id: "components-layout-cardgrid", name: "CardGrid", path: "c.tsx" },
      bad: { id: "bad", name: "Bad", path: "b.tsx", error: { name: "x" } },
    },
  };
  const files = { "p.tsx": story("Pattern."), "c.tsx": story("Component."), "b.tsx": story("Bad.") };
  const docs = componentDocs(manifest, (p) => files[p]);
  assert.equal(docs.size, 1);
  assert.equal(docs.get("cardgrid").description, "Component.");
  assert.equal(docs.get("cardgrid").url, docsUrl("components-layout-cardgrid"));
  const byName = docsByFigmaName(docs, { components: [{ name: "Card Grid" }, { name: "Nope" }] });
  assert.deepEqual(Object.keys(byName), ["Card Grid"]);
});

test("patchBuilder inserts the block once, then replaces it", () => {
  const src = "a\n// Code defaults for the sets whose default variant is x\nb\n";
  const once = patchBuilder(src, { A: { description: "d", url: "u" } });
  assert.match(once, /var COMPONENT_DOCS = /);
  const twice = patchBuilder(once, { B: { description: "e", url: "v" } });
  assert.equal(twice.match(/BEGIN GENERATED COMPONENT_DOCS/g).length, 1);
  assert.match(twice, /"B"/);
  assert.doesNotMatch(twice, /"A"/);
  assert.throws(() => patchBuilder("nothing", {}));
});
