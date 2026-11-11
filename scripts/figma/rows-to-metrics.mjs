// Converts compact Figma rows (Plan 218) into the metrics file compare-ui.mjs reads.
// usage: node rows-to-metrics.mjs rows.json out.json dark|light
import fs from "node:fs";
const [, , input, output, mode] = process.argv;
if (!input || !output || !["dark", "light"].includes(mode)) {
  console.error(
    "usage: node rows-to-metrics.mjs rows.json out.json dark|light"
  );
  process.exit(2);
}
const rows = JSON.parse(fs.readFileSync(input, "utf8"));
const items = rows.map(
  ([
    set,
    variant,
    w,
    h,
    pad,
    gap,
    radius,
    border,
    stroke,
    fill,
    opacity,
    shadow,
    tx,
  ]) => ({
    set,
    variant,
    box: {
      w,
      h,
      pad,
      gap,
      radius,
      border,
      stroke,
      fill,
      opacity,
      shadow: (shadow ?? []).map(([x, y, blur, spread, color]) => ({
        x,
        y,
        blur,
        spread,
        color,
      })),
    },
    texts: tx
      ? [
          {
            characters: tx[0],
            family: tx[1],
            size: tx[2],
            weight: tx[3],
            lineHeight: tx[4],
            tracking: tx[5],
            decoration: tx[6],
            color: tx[7],
          },
        ]
      : [],
  })
);
fs.writeFileSync(
  output,
  JSON.stringify({ mode, page: "Components", count: items.length, items })
);
console.log(`${items.length} items, mode ${mode}`);
