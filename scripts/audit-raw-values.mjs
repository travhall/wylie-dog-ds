#!/usr/bin/env node
// Raw value audit for packages/ui/src (Plan 217, phase A). Read-only.
//
// Goal: no raw value in the UI package that a token should own. Lists every
// Tailwind scale utility (gap-2, h-4, px-3, text-sm, rounded-md, border-2 ...),
// arbitrary numeric value (h-[28px]), Lucide icon prop (size, strokeWidth), inline
// style number and CSS length that is not a token reference, grouped by the value
// it resolves to, so each distinct value can be given one token.
//
//   node scripts/audit-raw-values.mjs [--json] [--files]
//
// Keyword utilities carry no design decision and are skipped: w-full, h-full,
// size-full, rounded-full, min-h-screen, 0 and auto. Test files are skipped.
// Tailwind's default scale is assumed (spacing = n x 0.25rem), which is what the
// UI package uses; the resolved value is shown so a token can keep it identical.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripVariants } from "./class-variants.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = "packages/ui/src";

const SPACING_PROPERTIES = {
  p: "padding",
  px: "padding",
  py: "padding",
  pt: "padding",
  pb: "padding",
  pl: "padding",
  pr: "padding",
  ps: "padding",
  pe: "padding",
  m: "margin",
  mx: "margin",
  my: "margin",
  mt: "margin",
  mb: "margin",
  ml: "margin",
  mr: "margin",
  ms: "margin",
  me: "margin",
  gap: "gap",
  "gap-x": "gap",
  "gap-y": "gap",
  "space-x": "gap",
  "space-y": "gap",
  w: "size",
  h: "size",
  size: "size",
  "min-w": "size",
  "min-h": "size",
  "max-w": "size",
  "max-h": "size",
  top: "offset",
  left: "offset",
  right: "offset",
  bottom: "offset",
  start: "offset",
  end: "offset",
  inset: "offset",
  "inset-x": "offset",
  "inset-y": "offset",
};
const TEXT_SIZES = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
};
const RADII = {
  none: "0",
  xs: "0.125rem",
  sm: "0.25rem",
  "": "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
};
const FONT_WEIGHTS = [
  "thin",
  "extralight",
  "light",
  "normal",
  "medium",
  "semibold",
  "bold",
  "extrabold",
  "black",
];
const KEYWORDS = new Set([
  "0",
  "auto",
  "full",
  "screen",
  "min",
  "max",
  "fit",
  "dvh",
  "svh",
  "lvh",
  "dvw",
  "svw",
  "lvw",
]);

const spacingRem = (value) => {
  if (value === "px") return "1px";
  const n = Number(value);
  return Number.isFinite(n) ? `${n * 0.25}rem` : null;
};

// One class (variants removed) to { kind, value } or null when it is not raw.
function classify(bare) {
  if (!bare || /^[a-z-]*[(]/.test(bare) || bare.includes("/")) return null;
  // Arbitrary values: a number is raw, a var() or calc() reference is not
  const arbitrary = /^(-?[a-z-]+)-\[(-?[\d.]+(?:px|rem|em|%|vh|vw)?)\]$/.exec(
    bare
  );
  if (arbitrary) {
    const [, utility, value] = arbitrary;
    if (
      /^(?:bg|text|fill|stroke|border|ring|outline|shadow|from|via|to)$/.test(
        utility
      ) &&
      !/^[\d.]+(px|rem|em)$/.test(value)
    )
      return null;
    return { kind: `arbitrary ${utility}`, value };
  }
  if (/\[|\(/.test(bare)) return null;

  const text = /^text-(xs|sm|base|lg|xl|[2-9]xl)$/.exec(bare);
  if (text) return { kind: "text size", value: TEXT_SIZES[text[1]] };
  const weight = /^font-([a-z]+)$/.exec(bare);
  if (weight && FONT_WEIGHTS.includes(weight[1]))
    return { kind: "font weight", value: weight[1] };
  const radius =
    /^rounded(?:-(?:[trblse]|tl|tr|bl|br|ss|se|es|ee))?(?:-(none|xs|sm|md|lg|xl|[2-9]xl))?$/.exec(
      bare
    );
  if (radius && !/-full$/.test(bare))
    return { kind: "radius", value: RADII[radius[1] ?? ""] };
  // Bare border and border-N are widths; border-<side> without N is 1px
  const border = /^border(?:-([xytblrse]))?(?:-(\d+))?$/.exec(bare);
  if (border) return { kind: "border width", value: `${border[2] ?? 1}px` };
  const ring = /^ring(?:-(\d+))?$/.exec(bare);
  if (ring) return { kind: "ring width", value: `${ring[1] ?? 3}px` };
  const leading = /^leading-(.+)$/.exec(bare);
  if (leading) return { kind: "line height", value: leading[1] };
  const tracking = /^tracking-(.+)$/.exec(bare);
  if (tracking) return { kind: "letter spacing", value: tracking[1] };
  const shadow = /^shadow(?:-(.+))?$/.exec(bare);
  if (shadow) return { kind: "shadow", value: shadow[1] ?? "default" };
  const z = /^-?z-(\d+)$/.exec(bare);
  if (z) return { kind: "z-index", value: z[1] };
  const duration = /^(duration|delay)-(\d+)$/.exec(bare);
  if (duration) return { kind: duration[1], value: `${duration[2]}ms` };
  const opacity = /^opacity-(\d+)$/.exec(bare);
  if (opacity) return { kind: "opacity", value: `${opacity[1]}%` };

  const m = /^-?((?:min-|max-)?[a-z]+(?:-[xy])?)-(.+)$/.exec(bare);
  if (m && SPACING_PROPERTIES[m[1]]) {
    const [, utility, value] = m;
    if (KEYWORDS.has(value)) return null;
    const rem = spacingRem(value);
    if (rem) return { kind: SPACING_PROPERTIES[utility], value: rem };
    // max-w-4xl, w-xs: Tailwind container sizes
    if (/^(?:xs|sm|md|lg|xl|[2-9]xl|prose)$/.test(value))
      return { kind: "container size", value };
  }
  return null;
}

const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "))
    .replace(/(^|\s)\/\/.*$/gm, "$1");

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(path.join(root, dir), {
    withFileTypes: true,
  })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        !["__tests__", "node_modules", "dist", "coverage"].includes(entry.name)
      )
        walk(rel);
    } else if (
      /\.(tsx?|css)$/.test(entry.name) &&
      !/\.(test|d)\.tsx?$/.test(entry.name) &&
      !/test-(setup|utils)/.test(entry.name)
    ) {
      files.push(rel);
    }
  }
})(srcDir);

const findings = [];
const add = (file, line, source, kind, value, cls = "") =>
  findings.push({
    file,
    line,
    component: path.basename(file).replace(/\.\w+$/, ""),
    source,
    kind,
    value,
    cls,
  });

for (const file of files) {
  const raw = fs.readFileSync(path.join(root, file), "utf8");
  const lines = stripComments(raw).split("\n");
  const lucide = new Set(
    [...raw.matchAll(/import\s*\{([^}]*)\}\s*from\s*"lucide-react"/g)].flatMap(
      (m) =>
        m[1]
          .split(",")
          .map((s) =>
            s
              .trim()
              .split(/\s+as\s+/)
              .pop()
          )
          .filter(Boolean)
    )
  );
  // Lucide icons and svg tags with a literal size or stroke width. Tags span
  // lines, so scan the whole file and map the offset back to a line number.
  if (!file.endsWith(".css")) {
    const source = stripComments(raw);
    for (const tag of source.matchAll(
      /<([A-Z]\w*|svg|path|circle|line|polyline|rect)\b([^<>]*?)\/?>/g
    )) {
      if (!lucide.has(tag[1]) && !/^[a-z]/.test(tag[1])) continue;
      for (const prop of tag[2].matchAll(
        /\b(size|strokeWidth|width|height)=(?:\{([\d.]+)\}|"([\d.]+)")/g
      )) {
        const at = tag.index + tag[0].indexOf(prop[0]);
        add(
          file,
          source.slice(0, at).split("\n").length,
          "icon prop",
          `${/^[a-z]/.test(tag[1]) ? "svg" : "icon"} ${prop[1]}`,
          prop[2] ?? prop[3]
        );
      }
    }
  }
  lines.forEach((line, index) => {
    const n = index + 1;
    if (file.endsWith(".css")) {
      for (const m of line.matchAll(
        /([a-z-]+)\s*:\s*([^;{}]*?\b\d*\.?\d+(?:px|rem|em)\b[^;{}]*);/g
      )) {
        if (/^--/.test(m[1]) || /var\(/.test(m[2])) continue;
        add(file, n, "css", m[1], m[2].trim());
      }
      return;
    }
    // Class names in string and template literals
    for (const literal of line.matchAll(/"([^"]*)"|`([^`]*)`/g)) {
      // An object key ("border-t": ...) names a class group, it is not a class
      if (/^\s*:/.test(line.slice(literal.index + literal[0].length))) continue;
      for (const cls of (literal[1] ?? literal[2]).split(/\s+/)) {
        const bare = stripVariants(cls);
        const hit = classify(bare);
        if (hit) add(file, n, "class", hit.kind, hit.value, bare);
      }
    }
    // Numeric behavior props the class scan cannot see (Plan 217): a Radix offset is a
    // gap or inset in px, so it belongs in a token applied as a margin
    for (const m of line.matchAll(
      /\b(sideOffset|alignOffset|collisionPadding|delayDuration|skipDelayDuration)\s*[=:]\s*(-?\d[\d.]*)/g
    )) {
      add(file, n, "behavior prop", m[1], m[2], `${m[1]} = ${m[2]}`);
    }
    // Inline style numbers
    for (const style of line.matchAll(/style=\{\{([^}]*)\}\}/g)) {
      for (const prop of style[1].matchAll(
        /\b([a-zA-Z]+)\s*:\s*(-?\d*\.?\d+(?:px|rem|em)?)(?=[\s,}]|$)/g
      )) {
        if (
          /^(?:flex|zIndex|opacity|order|lineHeight)$/.test(prop[1]) &&
          !/px|rem/.test(prop[2])
        )
          continue;
        add(file, n, "inline style", prop[1], prop[2]);
      }
    }
  });
}

if (process.argv.includes("--json")) {
  // No process.exit here: it can cut a large piped write short
  console.log(JSON.stringify(findings, null, 2));
} else {
  report();
}

function report() {
  const groups = new Map();
  for (const f of findings) {
    const key = `${f.source} | ${f.kind} | ${f.value}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }
  const rows = [...groups.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], undefined, { numeric: true })
  );
  console.log(
    `Raw values in ${srcDir}: ${findings.length} uses, ${groups.size} distinct (source | kind | value), ${files.length} files scanned`
  );
  let lastGroup = "";
  for (const [key, uses] of rows) {
    const [source, kind, value] = key.split(" | ");
    const group = `${source} | ${kind}`;
    if (group !== lastGroup) console.log(`\n## ${group}`);
    lastGroup = group;
    const components = [...new Set(uses.map((u) => u.component))].sort();
    const classes = [...new Set(uses.map((u) => u.cls).filter(Boolean))];
    console.log(
      `  ${value.padEnd(10)} x${String(uses.length).padStart(3)}  ${classes.join(" ")}  [${components.join(", ")}]`
    );
    if (process.argv.includes("--files"))
      for (const u of uses) console.log(`      ${u.file}:${u.line}`);
  }
}
