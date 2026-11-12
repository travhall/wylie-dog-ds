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
// Inner layers to measure on their own, by set: { Slider: ["track", "range", "thumb"] }. Each is
// emitted as an extra item named "<variant> :: <part>" (the first descendant with that name), which
// harvest-ui.mjs matches through the config's `parts`. Use it for a set whose root is a wrapper.
const PARTS = {};
// Sets whose root is a bare wrapper with no look of its own (Select): emit only their parts, not
// the root, so the wrapper is not compared against the UI's inner element.
const ONLY_PARTS = []; // e.g. ["Select"] with PARTS = { Select: ["trigger"] }

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
    // a text node's fill is its text colour, which the text layer already carries
    fill: node.type === "TEXT" ? null : firstPaint(node.fills),
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

// The first visible stroked vector under a node: the stroke width an icon draws. { icon: { stroke } }
// to spread into an item, or nothing when the node has no stroked vector (compared only when both
// sides have an icon).
function measureIcon(node) {
  if (!("findAll" in node)) return {};
  const visible = (n) => {
    for (let p = n; p && p !== node.parent; p = p.parent)
      if (p.visible === false) return false;
    return true;
  };
  const vector = node
    .findAll(
      (n) =>
        n.type === "VECTOR" &&
        Array.isArray(n.strokes) &&
        n.strokes.some((s) => s.visible !== false) &&
        !mixed(n.strokeWeight) &&
        n.strokeWeight > 0
    )
    .find(visible);
  return vector ? { icon: { stroke: r2(vector.strokeWeight) } } : {};
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
    if (!ONLY_PARTS.includes(set.name))
      items.push({
        set: set.name,
        variant: variant.name,
        box: measureBox(variant),
        texts,
        ...measureIcon(variant),
      });
    for (const part of PARTS[set.name] ?? []) {
      // "name#1" is the second descendant called "name" (layers repeat: tabs-row-row)
      const [partName, partIndex] = part.split("#");
      // a part hidden in this variant (Form's message layer outside the error variants) is not drawn
      const visible = (n) => {
        for (let p = n; p && p !== variant; p = p.parent)
          if (p.visible === false) return false;
        return true;
      };
      const node = variant.findAll((n) => n.name === partName).filter(visible)[
        Number(partIndex ?? 0)
      ];
      if (!node) continue;
      const partTexts =
        node.type === "TEXT"
          ? [measureText(node)]
          : "findAll" in node
            ? node
                .findAll((n) => n.type === "TEXT" && n.visible !== false)
                .slice(0, 1)
                .map(measureText)
            : [];
      items.push({
        set: set.name,
        variant: `${variant.name} :: ${part}`,
        box: measureBox(node),
        texts: partTexts,
        ...measureIcon(node),
      });
    }
  }
}
return { mode: MODE, page: PAGE_NAME, count: items.length, items };
