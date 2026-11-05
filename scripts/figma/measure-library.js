// Measures what the Figma library DRAWS, variant by variant (Plan 217). The body of one
// `use_figma` call run through the Figma MCP; it writes nothing. The result is the Figma half of
// scripts/figma/compare-ui.mjs: save it as figma-metrics.json, then run harvest-ui.mjs on it.
//
// Edit the three constants, run it once per page that holds component sets (use_figma resets the
// page on every call; merge the `items` arrays), and keep the file's variable mode the same as MODE
// (a colour read here is the one the node resolves in the mode it is currently set to).
const PAGE_NAME = "Components"; // the page to read
const SET_NAMES = []; // [] measures every component set on the page; or e.g. ["Button", "Badge"]
const MODE = "light"; // "light" or "dark": the label the comparison checks against the UI run

const page = figma.root.children.find((p) => p.name === PAGE_NAME);
if (!page) throw new Error(`No page named ${PAGE_NAME}`);
await figma.setCurrentPageAsync(page);

const r2 = (n) => Math.round(n * 100) / 100;
const h2 = (n) =>
  Math.round(n * 255)
    .toString(16)
    .padStart(2, "0");
// A colour paint as "#rrggbb", or "#rrggbbaa" when it is not opaque. Null for no visible solid.
const paintHex = (paint) => {
  if (!paint || paint.type !== "SOLID" || paint.visible === false) return null;
  const alpha =
    (paint.opacity === undefined ? 1 : paint.opacity) *
    (paint.color.a === undefined ? 1 : paint.color.a);
  if (alpha <= 0) return null;
  return `#${h2(paint.color.r)}${h2(paint.color.g)}${h2(paint.color.b)}${alpha >= 1 ? "" : h2(alpha)}`;
};
const firstPaint = (paints) =>
  Array.isArray(paints)
    ? (paints.map(paintHex).find((hex) => hex !== null) ?? null)
    : null;
const mixed = (v) => v === figma.mixed;

function measureBox(node) {
  const auto = "layoutMode" in node && node.layoutMode !== "NONE";
  const w = node.width;
  const h = node.height;
  const strokes = Array.isArray(node.strokes)
    ? node.strokes.filter((s) => s.visible !== false)
    : [];
  let border = 0;
  if (strokes.length) {
    border = mixed(node.strokeWeight)
      ? (node.strokeTopWeight ?? 0)
      : (node.strokeWeight ?? 0);
  }
  const radius =
    "cornerRadius" in node
      ? mixed(node.cornerRadius)
        ? node.topLeftRadius
        : node.cornerRadius
      : 0;
  const shadow = (node.effects ?? [])
    .filter((e) => e.type === "DROP_SHADOW" && e.visible !== false)
    .map((e) => ({
      x: r2(e.offset.x),
      y: r2(e.offset.y),
      blur: r2(e.radius),
      spread: r2(e.spread ?? 0),
      color: paintHex({ type: "SOLID", color: e.color, opacity: 1 }),
    }));
  return {
    w: r2(w),
    h: r2(h),
    pad: auto
      ? [
          node.paddingTop,
          node.paddingRight,
          node.paddingBottom,
          node.paddingLeft,
        ].map(r2)
      : [0, 0, 0, 0],
    gap: auto ? r2(node.itemSpacing ?? 0) : 0,
    radius: r2(Math.min(radius || 0, w / 2, h / 2)),
    border: r2(border),
    stroke: strokes.length ? firstPaint(strokes) : null,
    fill: firstPaint(node.fills),
    opacity: r2(node.opacity ?? 1),
    shadow,
  };
}

function measureText(node) {
  const size = mixed(node.fontSize) ? null : node.fontSize;
  const lh = node.lineHeight;
  let lineHeight = null;
  if (!mixed(lh) && size !== null) {
    lineHeight =
      lh.unit === "PIXELS"
        ? lh.value
        : lh.unit === "PERCENT"
          ? (size * lh.value) / 100
          : node.height;
  }
  const ls = node.letterSpacing;
  let tracking = 0;
  if (!mixed(ls) && size !== null) {
    tracking = ls.unit === "PIXELS" ? ls.value : (size * ls.value) / 100;
  }
  const font = mixed(node.fontName)
    ? { family: null, style: null }
    : node.fontName;
  const deco = mixed(node.textDecoration)
    ? "none"
    : node.textDecoration.toLowerCase();
  return {
    characters: node.characters,
    family: font.family,
    size,
    weight: font.style,
    lineHeight: lineHeight === null ? null : r2(lineHeight),
    tracking: r2(tracking),
    decoration: deco === "none" ? "none" : deco,
    color: firstPaint(node.fills),
  };
}

const items = [];
const sets = page.findAllWithCriteria({ types: ["COMPONENT_SET"] });
for (const set of sets) {
  if (SET_NAMES.length && !SET_NAMES.includes(set.name)) continue;
  for (const variant of set.children) {
    if (variant.type !== "COMPONENT") continue;
    // visible text layers, in reading order
    const texts = variant
      .findAll((n) => n.type === "TEXT" && n.visible !== false)
      .filter((n) => {
        for (let p = n.parent; p && p !== variant; p = p.parent)
          if (p.visible === false) return false;
        return true;
      })
      .map(measureText);
    items.push({
      set: set.name,
      variant: variant.name,
      box: measureBox(variant),
      texts,
    });
  }
}
return { mode: MODE, page: PAGE_NAME, count: items.length, items };
