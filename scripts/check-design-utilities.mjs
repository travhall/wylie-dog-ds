#!/usr/bin/env node
// Catch-all for design utilities no other guard sees (Plan 217).
//
// check-component-binding.mjs covers variable references, check-raw-values.mjs the
// spacing, size, radius, border, type, shadow, z-index, duration and opacity scales.
// This guard covers the rest of what a class, a stylesheet or an inline style can say
// about how a component looks, when the value is a literal instead of a component token:
//
//   transform     translate-*, scale-*, rotate-*, skew-* (centring fractions and resets excepted)
//   text          underline-offset-*, decoration-<n>, line-clamp-<n>, font-sans|serif|mono
//   lines         outline-<n>, outline-offset-<n>, stroke-<n>, divide-x|y
//   filter        blur-*, backdrop-blur-*, brightness-*, drop-shadow-* and the other filters
//   motion        animate-*, ease-* (a named animation or easing curve is a Tailwind theme value)
//   colour        named palette utilities (bg-white, text-blue-500) and colour literals
//   units         arbitrary values in deg, turn, ms, s and the other units
//   stylesheets   a time, angle or colour literal in a .css declaration
//   inline style  a transform, transition, animation, filter or colour in style={{ }}
//
// A token-bound form (`scale-(--card-grid-item-hover-scale)`, `duration-(--duration-x)`)
// always passes. Everything else needs a component token, or an entry with a reason in
// scripts/check-design-utilities.config.json. An entry that matches nothing fails too.
//
// Not covered, on purpose: `transition`, `transition-colors` and the other transition
// utilities (they name the property and take the Tailwind default duration unless a
// `duration-(--token)` sits beside them, which is the parked motion system), and
// structural utilities (flex, grid, position, overflow, cursor, align, aspect-square).
// A bare filter word ("blur", "invert") is not read as a class, since it is also an
// event name.
//
//   node scripts/check-design-utilities.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripVariants } from "./class-variants.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = "packages/ui/src";

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_UTILITY =
  "bg|text|border(?:-[xytblrse])?|fill|stroke|ring|outline|from|via|to|decoration|divide|shadow|accent|caret";
const UNITS = "deg|grad|rad|turn|ms|s|ch|ex|lh|pt|pc|cm|mm|in|cqw|cqh";
const FILTERS =
  "blur|brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia";

// A value that is geometry or a reset, not a design decision: 0, full, none, the
// identity scale, a fraction of the element's own size (centring) and a percentage.
const NEUTRAL = /^(?:0|100|full|none|\d+\/\d+|\[-?\d+%\])$/;

// [kind, pattern on the class with its variants removed, is the captured value a literal]
const RULES = [
  [
    "transform",
    /^-?(?:translate(?:-[xyz])?|scale(?:-[xyz])?|rotate(?:-[xyz])?|skew(?:-[xy])?)-(.+)$/,
    (v) => !NEUTRAL.test(v),
  ],
  ["underline offset", /^underline-offset-(.+)$/, (v) => v !== "auto"],
  ["decoration thickness", /^decoration-(\d+)$/, () => true],
  ["line clamp", /^line-clamp-(\d+)$/, () => true],
  ["font family", /^font-(sans|serif|mono)$/, () => true],
  ["outline width", /^outline-(\d+)$/, () => true],
  ["outline offset", /^-?outline-offset-(\d+)$/, () => true],
  ["stroke width", /^stroke-(\d+)$/, () => true],
  ["divide width", /^divide-([xy](?:-\d+)?)$/, () => true],
  [
    "filter",
    new RegExp(
      `^(?:backdrop-(?:${FILTERS})(?:-(.+))?|(?:${FILTERS}|drop-shadow)-(.+))$`
    ),
    () => true,
  ],
  ["animation", /^animate-(.+)$/, (v) => v !== "none"],
  ["easing", /^ease-(linear|in|out|in-out)$/, () => true],
  [
    "named colour",
    new RegExp(
      `^(?:${COLOR_UTILITY})-(white|black|(?:${PALETTE})-\\d+)(?:/\\d+)?$`
    ),
    () => true,
  ],
  [
    "colour literal",
    new RegExp(
      `^(?:${COLOR_UTILITY})-\\[((?:#|rgba?\\(|hsla?\\(|oklch\\().*)\\]`
    ),
    () => true,
  ],
  [
    "unit literal",
    new RegExp(`^-?[a-z-]+-\\[(-?[\\d.]+(?:${UNITS}))\\]$`),
    () => true,
  ],
];

// One class (variants removed) to { kind, value } or null when it is not a literal.
export function classify(bare) {
  // A token reference is the form this guard wants
  if (!bare || /\(--|var\(--/.test(bare)) return null;
  for (const [kind, pattern, isLiteral] of RULES) {
    const match = pattern.exec(bare);
    if (!match) continue;
    const value = match.slice(1).find((v) => v !== undefined) ?? "";
    if (isLiteral(value)) return { kind, value: value || bare };
  }
  return null;
}

const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "))
    .replace(/(^|\s)\/\/.*$/gm, "$1");

// Class names in the string and template literals of a .ts or .tsx source, and the
// literal values of an inline style.
export function scanSource(src) {
  const hits = [];
  stripComments(src)
    .split("\n")
    .forEach((line, index) => {
      for (const literal of line.matchAll(/"([^"]*)"|`([^`]*)`/g)) {
        // An object key ("border-t": ...) names a class group, it is not a class
        if (/^\s*:/.test(line.slice(literal.index + literal[0].length)))
          continue;
        for (const cls of (literal[1] ?? literal[2]).split(/\s+/)) {
          const bare = stripVariants(cls);
          const hit = classify(bare);
          if (hit)
            hits.push({
              line: index + 1,
              text: bare,
              kind: hit.kind,
              value: hit.value,
            });
        }
      }
      for (const style of line.matchAll(/style=\{\{(.*?)\}\}/g)) {
        for (const prop of style[1].matchAll(
          /\b(transform|transition\w*|animation\w*|filter|backdropFilter|color|background\w*|borderColor|fill|stroke)\s*:\s*([^,]*)/g
        )) {
          if (/var\(--/.test(prop[2])) continue;
          hits.push({
            line: index + 1,
            text: `style ${prop[1]}: ${prop[2].trim()}`,
            kind: "inline style",
            value: prop[1],
          });
        }
      }
    });
  return hits;
}

// Declarations of a stylesheet that carry a time, angle or colour literal. Custom
// property definitions, var() values and the data URI of a mask-image are skipped.
export function scanCss(src) {
  const hits = [];
  const literalPattern =
    /(?:^|[\s,(])-?[\d.]+(?:ms|s|deg|turn)\b|#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(/;
  stripComments(src.replace(/url\([^)]*\)/g, "url()"))
    .split("\n")
    .forEach((line, index) => {
      for (const m of line.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)) {
        const [, property, value] = m;
        if (/^--/.test(property) || /^\s*var\(/.test(value)) continue;
        const literal = literalPattern.exec(value);
        if (!literal) continue;
        const colour = /^\s*#|\($/.test(literal[0]);
        hits.push({
          line: index + 1,
          text: `${property}: ${value.trim()}`,
          kind: colour ? "css colour" : "css time or angle",
          value: literal[0].trim(),
        });
      }
    });
  return hits;
}

function run() {
  const config = JSON.parse(
    fs.readFileSync(
      path.join(root, "scripts/check-design-utilities.config.json"),
      "utf8"
    )
  );
  const files = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(path.join(root, dir), {
      withFileTypes: true,
    })) {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (
          !["__tests__", "node_modules", "dist", "coverage"].includes(
            entry.name
          )
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

  const used = new Set();
  const problems = [];
  let total = 0;
  for (const file of files) {
    const src = fs.readFileSync(path.join(root, file), "utf8");
    const hits = file.endsWith(".css") ? scanCss(src) : scanSource(src);
    for (const hit of hits) {
      total++;
      const index = config.allow.findIndex(
        (entry) => entry.file === file && hit.text.includes(entry.match)
      );
      if (index >= 0) used.add(index);
      else
        problems.push(
          `${file}:${hit.line}  ${hit.text}  (${hit.kind}: ${hit.value})`
        );
    }
  }
  config.allow.forEach((entry, i) => {
    if (!used.has(i))
      problems.push(`stale allow entry: ${entry.file} "${entry.match}"`);
  });

  if (problems.length) {
    console.error(`Design utilities: ${problems.length} problem(s)\n`);
    for (const p of problems) console.error(`  ${p}`);
    console.error(
      "\nBind the value to a component token in the components collection of packages/tokens/io/sync and reference it as (--token), or add an entry with a reason to scripts/check-design-utilities.config.json."
    );
    process.exit(1);
  }
  console.log(
    `Design utilities OK: ${total} literal uses in ${files.length} files, all allow-listed (${config.allow.length} entries with a reason), none stale.`
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  run();
