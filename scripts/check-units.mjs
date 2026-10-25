#!/usr/bin/env node
// Plan 203: sizes are rem. Fails on px literals for text size, spacing, sizing and
// radius in packages/ui/src and apps/showcase/src; warns (never fails) for
// apps/storybook/stories, which are free-form demo layouts.
//
//   node scripts/check-units.mjs [--list]
//
// Exempt by rule: 1px hairlines; border widths; shadows, blur, gradients,
// background sizes and transforms (decorative geometry, not text-relative sizes);
// media-query breakpoints; test files; prose. Everything else needs an entry in
// scripts/check-units.config.json with a reason.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/check-units.config.json"), "utf8")
);
const list = process.argv.includes("--list");

const FAIL_DIRS = ["packages/ui/src", "apps/showcase/src"];
const WARN_DIRS = ["apps/storybook/stories"];
const EXTENSIONS = new Set([".ts", ".tsx", ".css", ".mdx"]);

// Tailwind utilities whose arbitrary px value is decorative or a border width.
const EXEMPT_UTILITY =
  /^(?:border|shadow|ring|outline|drop-shadow|blur|backdrop-blur|bg|translate|rotate|skew|decoration|underline-offset)/;
// CSS and style-object properties whose px value must be rem.
const LENGTH_PROPERTIES = [
  "font-size|fontSize|line-height|lineHeight",
  "padding(?:-[a-z]+)?|padding[A-Z]\\w*|margin(?:-[a-z]+)?|margin[A-Z]\\w*",
  "gap|row-gap|column-gap|rowGap|columnGap",
  "width|height|min-width|max-width|min-height|max-height",
  "minWidth|maxWidth|minHeight|maxHeight|top|left|right|bottom|inset",
  "border-radius|borderRadius|border-[a-z]+-radius|flex-basis|flexBasis",
].join("|");
// CSS (kebab-case only) for declarations in .css files.
const CSS_PROPERTIES = LENGTH_PROPERTIES.split("|")
  .filter((p) => !/[A-Z]/.test(p))
  .join("|");

const files = (dir) =>
  fs
    .readdirSync(path.join(root, dir), { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && EXTENSIONS.has(path.extname(e.name)))
    .map((e) => path.relative(root, path.join(e.parentPath, e.name)))
    .filter((f) => !/(?:__tests__|\.test\.|\.spec\.)/.test(f));

const allowed = (file, line) =>
  config.allow.some((a) => a.file === file && line.includes(a.match));

// px numbers in a snippet, e.g. "0 0 8px 1px" gives [8, 1]. A template hole
// (`${n}px`) counts as a non-hairline size.
const pxValues = (text) =>
  [...text.matchAll(/(-?\d*\.?\d+)px|\}px/g)].map((m) =>
    m[1] === undefined ? Infinity : Number(m[1])
  );

function scan(file) {
  const out = [];
  const lines = fs.readFileSync(path.join(root, file), "utf8").split("\n");
  const isCss = file.endsWith(".css");
  let inMedia = false;
  lines.forEach((line, i) => {
    const add = (match, why) => {
      if (!allowed(file, line)) out.push({ file, line: i + 1, match, why });
    };
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) return;
    if (isCss) {
      if (/@media/.test(line)) inMedia = true;
      if (inMedia) {
        if (/^\s*\}/.test(line)) inMedia = false;
        return; // breakpoints and anything inside a media block's header line
      }
    }

    // Tailwind arbitrary values: text-[11px], max-w-[320px], rounded-[10px], gap-[6px]
    for (const m of line.matchAll(
      /(?<![\w-])([a-z][a-z0-9-]*?)-\[(-?\d*\.?\d+)px\]/g
    )) {
      const [whole, utility, value] = m;
      if (EXEMPT_UTILITY.test(utility) || Number(value) === 1) continue;
      add(whole, "arbitrary px: use the rem equivalent");
    }
    if (isCss) {
      // CSS declarations: font-size: 14px; padding: 4px 8px
      const decl = new RegExp(
        `^\\s*(?:${CSS_PROPERTIES})\\s*:\\s*([^;]*)`
      ).exec(line);
      if (decl && pxValues(decl[1]).some((n) => n !== 1 && n !== 0)) {
        add(decl[0].trim(), "px in a length property: use rem");
      }
    } else {
      // Style objects: gap: "8px", fontSize: `${n}px`, height: '360px'
      const prop = new RegExp(
        `\\b(?:${LENGTH_PROPERTIES})\\s*:\\s*(["'\`])((?:(?!\\1).)*)\\1`,
        "g"
      );
      for (const m of line.matchAll(prop)) {
        if (pxValues(m[2]).some((n) => n !== 1 && n !== 0)) {
          add(m[0], "px in a length property: use rem");
        }
      }
    }
  });
  return out;
}

const gather = (dirs) => dirs.flatMap((d) => files(d)).flatMap(scan);
const failures = gather(FAIL_DIRS);
const warnings = gather(WARN_DIRS);

if (warnings.length) {
  console.log(
    `Units: ${warnings.length} px literal(s) in apps/storybook/stories (warning only)${list ? ":" : ". Run with --list to see them."}`
  );
  if (list)
    warnings.forEach((r) => console.log(`  ${r.file}:${r.line}  ${r.match}`));
}
if (failures.length) {
  console.error(
    `Units check failed: ${failures.length} px literal(s) for text size, spacing, sizing or radius:`
  );
  failures.forEach((r) =>
    console.error(`  ${r.file}:${r.line}  ${r.match}  (${r.why})`)
  );
  console.error(
    "\nConvert to rem (px / 16), or add a documented entry to scripts/check-units.config.json."
  );
  process.exit(1);
}
console.log(
  `Units OK: no px literals for text size, spacing, sizing or radius in ${FAIL_DIRS.join(" and ")} (${config.allow.length} allowlisted).`
);
