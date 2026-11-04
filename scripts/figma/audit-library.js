// Read-only audit of the Wylie Dog Figma library (Plan 217). The body of one `use_figma` call, run through
// the Figma MCP; it writes nothing. Page "Components" (1863:2). Returns, per component set, the layers whose
// gap, padding, corner radius or stroke weight has no bound variable, text with no text style, and layers
// that keep a default name. VECTOR stroke weights (icon glyphs) are counted apart: they are bound in phase C
// through the icon stroke token, so a nonzero count there is a finding, not noise.
const page = await figma.getNodeByIdAsync("1863:2");
await figma.setCurrentPageAsync(page);
const sets = page.findAllWithCriteria({ types: ["COMPONENT_SET"] });
const DEFAULT_NAME = /^(Vector|Frame \d*|Rectangle|Group|Ellipse|Line)\s*\d*$/;
const num = (v) => typeof v === "number";
const bound = (n, field) => !!(n.boundVariables && n.boundVariables[field]);
const result = [];
for (const set of sets) {
  const row = {
    set: set.name,
    gap: {},
    padding: {},
    radius: {},
    stroke: {},
    strokeVector: 0,
    textNoStyle: 0,
    defaultName: 0,
  };
  const bump = (bucket, key) => {
    bucket[key] = (bucket[key] || 0) + 1;
  };
  const nodes = set.findAll(() => true);
  for (const n of nodes) {
    if (DEFAULT_NAME.test(n.name)) row.defaultName++;
    if (n.type === "TEXT" && !n.textStyleId) row.textNoStyle++;
    if ("layoutMode" in n && n.layoutMode !== "NONE") {
      if (num(n.itemSpacing) && n.itemSpacing !== 0 && !bound(n, "itemSpacing"))
        bump(row.gap, n.itemSpacing);
      for (const f of [
        "paddingLeft",
        "paddingRight",
        "paddingTop",
        "paddingBottom",
      ]) {
        if (num(n[f]) && n[f] !== 0 && !bound(n, f))
          bump(row.padding, f + "=" + n[f]);
      }
    }
    if (
      "cornerRadius" in n &&
      num(n.cornerRadius) &&
      n.cornerRadius !== 0 &&
      n.parent !== set
    ) {
      if (!bound(n, "topLeftRadius") && !bound(n, "cornerRadius"))
        bump(row.radius, n.cornerRadius + " " + n.name);
    }
    if (
      "strokeWeight" in n &&
      num(n.strokeWeight) &&
      n.strokeWeight !== 0 &&
      n.strokes &&
      n.strokes.some((p) => p.visible !== false && p.opacity !== 0)
    ) {
      if (!bound(n, "strokeTopWeight") && !bound(n, "strokeWeight")) {
        if (n.type === "VECTOR") row.strokeVector++;
        else bump(row.stroke, n.strokeWeight + " " + n.name);
      }
    }
  }
  result.push(row);
}
const empty = (o) => Object.keys(o).length === 0;
return result.filter(
  (r) =>
    !empty(r.gap) ||
    !empty(r.padding) ||
    !empty(r.radius) ||
    !empty(r.stroke) ||
    r.strokeVector ||
    r.textNoStyle ||
    r.defaultName
);
