// Plan 216, Phase B: export the Figma library as a manifest (read-only).
//
// This file is NOT run by Node. It is the body of one `use_figma` call (Figma MCP):
// top-level await and `return` are available, `figma` is the Plugin API. A Claude
// session with the Figma MCP runs it against the library file, then writes the
// result to `figma/manifest.json` (see "Writing the file" below). Nothing here
// changes the Figma file.
//
// Page: every component lives on the "Components" page (the per-component pages are
// empty). Change PAGE_ID if the library moves.
//
// Writing the file: wrap the returned object as
//   { "schema": 1, "fileKey": "<file key>", ...returned object }
// and keep the component order the script returns (sorted by name). The check in
// Phase C reads this file; it never opens Figma.
//
// Rule 18 of the figma-use skill: componentPropertyDefinitions is read only from a
// COMPONENT_SET (or a COMPONENT outside a set), never from a variant.
const PAGE_ID = "1863:2";
const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
const nodes = page
  .findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] })
  .filter(
    (n) => n.type === "COMPONENT_SET" || n.parent.type !== "COMPONENT_SET"
  );
const components = [];
for (const n of nodes) {
  const defs = n.componentPropertyDefinitions;
  const properties = {};
  let expected = 1;
  for (const key of Object.keys(defs).sort()) {
    const d = defs[key];
    let value = d.defaultValue;
    // An instance swap defaults to a node id, which changes on every rebuild: record the
    // component's name instead
    if (d.type === "INSTANCE_SWAP") {
      const target = await figma.getNodeByIdAsync(value);
      value = target ? target.name : value;
    }
    const p = { type: d.type, default: value };
    if (d.variantOptions) {
      p.options = d.variantOptions.slice();
      expected *= d.variantOptions.length;
    }
    properties[key.replace(/#\d+:\d+$/, "")] = p;
  }
  const out = {
    name: n.name,
    type: n.type,
    description: n.description || "",
    documentationLinks: n.documentationLinks.map((l) => l.uri),
    properties,
  };
  if (n.type === "COMPONENT_SET") {
    out.variantCount = n.children.length;
    out.expectedVariantCount = expected;
  }
  components.push(out);
}
components.sort((a, b) => a.name.localeCompare(b.name));
return {
  file: figma.root.name,
  page: page.name,
  generatedAt: new Date().toISOString(),
  count: components.length,
  components,
};
