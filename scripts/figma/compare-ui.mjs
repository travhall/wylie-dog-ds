#!/usr/bin/env node
// Compares what the Figma library draws with what the UI renders, variant by variant
// (Plan 217). check-figma-parity compares the PROPERTIES; this compares the drawn VALUES:
// size, padding, gap, radius, border, fill, shadow, opacity, for the first text layer the
// family, size, weight, line height, tracking, decoration and colour, and for the first icon the
// drawn stroke width (one `icon.stroke-width` token must draw one line in Figma and in the UI).
//
//   1. Measure Figma:  run scripts/figma/measure-library.js through use_figma and save the
//      result as figma-metrics.json (see the header of that file).
//   2. Measure the UI: node scripts/figma/harvest-ui.mjs figma-metrics.json > code-metrics.json
//      (Storybook must be running; the harvester renders each Figma variant by URL args).
//   3. Compare:        node scripts/figma/compare-ui.mjs figma-metrics.json code-metrics.json
//
// Both files have the shape { mode, items: [{ set, variant, box, texts, icon? }] }, where `icon`
// is { stroke } in drawn pixels. A finding is
// "allowed" when scripts/figma/compare-ui.config.json lists it with a reason, and the run
// fails on any open finding or any allow entry that matches nothing.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

export const TOLERANCE = {
  px: 1, // sizes, padding, gap, radius, border width, font size, line height, shadow offsets
  colorChannel: 3, // 0-255 per channel: Figma stores sRGB, the browser may gamut-map
  alpha: 0.02,
  opacity: 0.02,
  tracking: 0.1, // px
  stroke: 0.1, // px, an icon's drawn stroke width (a 2px and a 1.33px stroke must not pass)
};

const FONT_WEIGHTS = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  normal: 400,
  medium: 500,
  semibold: 600,
  "semi bold": 600,
  bold: 700,
  extrabold: 800,
  "extra bold": 800,
  black: 900,
};

export function weightOf(value) {
  if (typeof value === "number") return value;
  const n = Number(value);
  if (Number.isFinite(n)) return n;
  return FONT_WEIGHTS[String(value ?? "").toLowerCase()] ?? null;
}

/** "#rrggbb" or "#rrggbbaa" to [r, g, b, a]; null for no colour. */
export function parseHex(hex) {
  if (!hex) return null;
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const a = m[2] ? parseInt(m[2], 16) / 255 : 1;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
}

/** True when two colours are the same within tolerance. A null colour is fully transparent. */
export function sameColor(a, b, tol = TOLERANCE) {
  const ca = parseHex(a) ?? [0, 0, 0, 0];
  const cb = parseHex(b) ?? [0, 0, 0, 0];
  // Two fully transparent colours are the same whatever their RGB
  if (ca[3] <= tol.alpha && cb[3] <= tol.alpha) return true;
  return (
    Math.abs(ca[3] - cb[3]) <= tol.alpha &&
    [0, 1, 2].every((i) => Math.abs(ca[i] - cb[i]) <= tol.colorChannel)
  );
}

const near = (a, b, tol) => Math.abs((a ?? 0) - (b ?? 0)) <= tol;

function sameFamily(a, b) {
  const norm = (s) =>
    String(s ?? "")
      .split(",")[0]
      .replace(/["']/g, "")
      .trim()
      .toLowerCase();
  return norm(a) === norm(b);
}

function sameShadow(a = [], b = [], tol = TOLERANCE) {
  if (a.length !== b.length) return false;
  return a.every((s, i) => {
    const t = b[i];
    return (
      near(s.x, t.x, tol.px) &&
      near(s.y, t.y, tol.px) &&
      near(s.blur, t.blur, tol.px) &&
      near(s.spread, t.spread, tol.px) &&
      sameColor(s.color, t.color, tol)
    );
  });
}

// [property, label, equal(figma, code)]
const BOX_CHECKS = [
  ["w", "width", (a, b, t) => near(a, b, t.px)],
  ["h", "height", (a, b, t) => near(a, b, t.px)],
  [
    "pad",
    "padding (top, right, bottom, left)",
    (a, b, t) => (a ?? []).every((v, i) => near(v, (b ?? [])[i], t.px)),
  ],
  ["gap", "gap", (a, b, t) => near(a, b, t.px)],
  ["radius", "corner radius", (a, b, t) => near(a, b, t.px)],
  ["border", "border width", (a, b, t) => near(a, b, t.px)],
  ["stroke", "border colour", (a, b, t) => sameColor(a, b, t)],
  ["fill", "fill", (a, b, t) => sameColor(a, b, t)],
  ["opacity", "opacity", (a, b, t) => near(a, b, t.opacity)],
  ["shadow", "shadow", (a, b, t) => sameShadow(a, b, t)],
];

const TEXT_CHECKS = [
  ["family", "font family", (a, b) => sameFamily(a, b)],
  ["size", "font size", (a, b, t) => near(a, b, t.px)],
  ["weight", "font weight", (a, b) => weightOf(a) === weightOf(b)],
  ["lineHeight", "line height", (a, b, t) => near(a, b, t.px)],
  ["tracking", "letter spacing", (a, b, t) => near(a, b, t.tracking)],
  ["decoration", "text decoration", (a, b) => (a || "none") === (b || "none")],
  ["color", "text colour", (a, b, t) => sameColor(a, b, t)],
];

/**
 * Compare two metric files. Returns { findings, missing, extra }:
 * findings: [{ set, variant, scope, property, label, figma, code }]
 * missing: Figma variants the code run has no measurement for; extra: the reverse.
 */
export function compareMetrics(figma, code, tolerance = TOLERANCE) {
  const key = (i) => `${i.set}|${i.variant}`;
  const codeBy = new Map((code.items ?? []).map((i) => [key(i), i]));
  const figmaBy = new Map((figma.items ?? []).map((i) => [key(i), i]));
  const findings = [];
  const missing = [];
  for (const item of figma.items ?? []) {
    const other = codeBy.get(key(item));
    if (!other) {
      missing.push(`${item.set} ${item.variant}`);
      continue;
    }
    for (const [prop, label, equal] of BOX_CHECKS) {
      const a = item.box?.[prop];
      const b = other.box?.[prop];
      if (a === undefined && b === undefined) continue;
      if (!equal(a, b, tolerance)) {
        findings.push({
          set: item.set,
          variant: item.variant,
          scope: "box",
          property: prop,
          label,
          figma: a,
          code: b,
        });
      }
    }
    const ta = item.texts?.[0];
    const tb = other.texts?.[0];
    if (ta && !tb) {
      findings.push({
        set: item.set,
        variant: item.variant,
        scope: "text",
        property: "layer",
        label: "text layer",
        figma: ta.characters,
        code: undefined,
      });
    } else if (ta && tb) {
      for (const [prop, label, equal] of TEXT_CHECKS) {
        if (!equal(ta[prop], tb[prop], tolerance)) {
          findings.push({
            set: item.set,
            variant: item.variant,
            scope: "text",
            property: prop,
            label,
            figma: ta[prop],
            code: tb[prop],
          });
        }
      }
    }
    // The first icon's drawn stroke width: one token (`icon.stroke-width`) must draw the same
    // line in Figma and in the UI. Only compared when both sides have an icon (an unchecked box
    // or a hidden slot has none).
    const ia = item.icon;
    const ib = other.icon;
    if (ia && ib && !near(ia.stroke, ib.stroke, tolerance.stroke)) {
      findings.push({
        set: item.set,
        variant: item.variant,
        scope: "icon",
        property: "stroke",
        label: "icon stroke width",
        figma: ia.stroke,
        code: ib.stroke,
      });
    }
  }
  const extra = [...codeBy.keys()]
    .filter((k) => !figmaBy.has(k))
    .map((k) => k.replace("|", " "));
  return { findings, missing, extra };
}

/** Split findings by the allow list; report entries that matched nothing. */
export function applyAllow(findings, allow = []) {
  // an entry's `variant` is written the code's way ("state=with-selection"); the Figma name is
  // Title Case ("State=With Selection"), so both sides are compared lower-cased with hyphens
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, "-");
  // a `variant` ending in "$" must match the end of the variant name, so an entry for a part
  // ("... :: select-stack$") does not also cover the parts whose names start with it
  const variantMatches = (f, variant) =>
    variant.endsWith("$")
      ? norm(f.variant).endsWith(norm(variant.slice(0, -1)))
      : norm(f.variant).includes(norm(variant));
  const used = new Set();
  const open = [];
  const allowed = [];
  for (const f of findings) {
    const index = allow.findIndex(
      (a) =>
        a.set === f.set &&
        a.property === f.property &&
        (!a.scope || a.scope === f.scope) &&
        (!a.variant || variantMatches(f, a.variant))
    );
    if (index >= 0) {
      used.add(index);
      allowed.push({ ...f, reason: allow[index].reason });
    } else open.push(f);
  }
  const stale = allow.filter((_, i) => !used.has(i));
  return { open, allowed, stale };
}

const show = (v) => (v === undefined ? "none" : JSON.stringify(v));

function main() {
  const [figmaFile, codeFile] = process.argv.slice(2);
  if (!figmaFile || !codeFile) {
    console.error(
      "usage: node scripts/figma/compare-ui.mjs figma-metrics.json code-metrics.json"
    );
    process.exit(2);
  }
  const config = JSON.parse(
    fs.readFileSync(
      path.join(root, "scripts/figma/compare-ui.config.json"),
      "utf8"
    )
  );
  const figma = JSON.parse(fs.readFileSync(figmaFile, "utf8"));
  const code = JSON.parse(fs.readFileSync(codeFile, "utf8"));
  if (figma.mode && code.mode && figma.mode !== code.mode) {
    console.error(
      `The files are in different modes (Figma ${figma.mode}, UI ${code.mode}); a colour comparison would mean nothing.`
    );
    process.exit(2);
  }
  const { findings, missing, extra } = compareMetrics(figma, code, {
    ...TOLERANCE,
    ...(config.tolerance ?? {}),
  });
  const { open, allowed, stale } = applyAllow(findings, config.allow);
  const sets = new Set((figma.items ?? []).map((i) => i.set));
  console.log(
    `Compared ${figma.items?.length ?? 0} Figma variants in ${sets.size} sets (${figma.mode ?? "mode unknown"}): ${open.length} open, ${allowed.length} allowed, ${missing.length} with no UI measurement.`
  );
  const bySet = new Map();
  for (const f of open) {
    const k = `${f.set}  ${f.variant}`;
    if (!bySet.has(k)) bySet.set(k, []);
    bySet.get(k).push(f);
  }
  for (const [k, list] of bySet) {
    console.log(`\n${k}`);
    for (const f of list) {
      console.log(
        `  ${f.label}${f.scope === "text" ? " (text layer)" : f.scope === "icon" ? " (first icon)" : ""}: Figma ${show(f.figma)}, UI ${show(f.code)}`
      );
    }
  }
  if (missing.length) {
    console.log(
      `\nNo UI measurement for: ${missing.slice(0, 12).join("; ")}${missing.length > 12 ? `; and ${missing.length - 12} more` : ""}`
    );
  }
  if (extra.length)
    console.log(`\nMeasured in the UI but not drawn in Figma: ${extra.length}`);
  if (stale.length) {
    console.log("\nAllow entries that matched nothing:");
    for (const a of stale) console.log(`  ${a.set} ${a.property}`);
  }
  process.exit(open.length || stale.length ? 1 : 0);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main();
