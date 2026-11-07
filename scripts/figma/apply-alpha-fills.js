// Post-rebuild step: gives the Section Features icon tiles their 10% tint again. The body of one
// `use_figma` call run through the Figma MCP. It WRITES (paint opacity on the tiles only), is safe to
// run twice, and keeps every variable binding.
//
// Why it exists: a bound colour carries no alpha, so `bg-(--color-section-features-icon-background)/10`
// is paint opacity on a bound fill. Setting a variable mode on a section resets that opacity to 1,
// and the builder cannot reliably set it on the Card instances in the `cards` variants, so the tiles
// come out solid after a rebuild. Run this once after the builder and Token Bridge are done.
const PAGE_NAME = "Components";
const SET_NAME = "Section Features";
const ALPHA = 0.1;

const page = figma.root.children.find((p) => p.name === PAGE_NAME);
if (!page) throw new Error(`No page named ${PAGE_NAME}`);
await figma.setCurrentPageAsync(page);

const set = page
  .findAllWithCriteria({ types: ["COMPONENT_SET"] })
  .find((s) => s.name === SET_NAME);
if (!set) throw new Error(`No component set named ${SET_NAME}`);

const tiles = set.findAll(
  (n) => n.type === "FRAME" && n.name === "icon" && n.visible
);
let changed = 0;
for (const tile of tiles) {
  const fill = tile.fills[0];
  if (!fill || fill.type !== "SOLID") continue;
  if (Math.abs((fill.opacity ?? 1) - ALPHA) < 0.001) continue;
  const next = JSON.parse(JSON.stringify(fill));
  next.opacity = ALPHA;
  tile.fills = [next];
  changed += 1;
}
const opacities = [
  ...new Set(
    set
      .findAll((n) => n.type === "FRAME" && n.name === "icon" && n.visible)
      .map((t) => Math.round(t.fills[0].opacity * 100) / 100)
  ),
];
return { tiles: tiles.length, changed, opacities };
