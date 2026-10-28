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
//
// Plan 212: text in apps/showcase/src is never below 0.75rem (the xs token size)
// unless it sits inside a mock UI preview: an element with a `data-mock` attribute,
// or the `preview` prop / property of a card. Mock previews imitate the product at
// reduced scale and are not meant to be read.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/check-units.config.json"), "utf8")
);
const list = process.argv.includes("--list");
const ts = createRequire(path.join(root, "package.json"))("typescript");

const MIN_TEXT_REM = 0.75;
const MIN_TEXT_DIR = "apps/showcase/src";

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
      // React turns a bare number in a style object into px: minHeight: 280, padding: 20
      const bare = new RegExp(
        `\\b(?:${LENGTH_PROPERTIES.replace("|line-height|lineHeight", "")})\\s*:\\s*(-?\\d*\\.?\\d+)\\s*(?:[,}]|$)`,
        "g"
      );
      for (const m of line.matchAll(bare)) {
        if (Number(m[1]) > 1)
          add(
            m[0].replace(/\s*[,}]$/, ""),
            "bare number in a style object is px: use rem"
          );
      }
      for (const m of line.matchAll(prop)) {
        if (pxValues(m[2]).some((n) => n !== 1 && n !== 0)) {
          add(m[0], "px in a length property: use rem");
        }
      }
    }
  });
  return out;
}

// text-[0.6875rem] and friends, outside a mock preview (JSX `data-mock` element or
// a `preview` prop / property).
function scanMinText(file) {
  const out = [];
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const isMockAttrs = (attrs) =>
    attrs.properties.some((p) => p.name?.getText() === "data-mock");
  const visit = (node, mock) => {
    if (
      (ts.isJsxAttribute(node) || ts.isPropertyAssignment(node)) &&
      node.name.getText() === "preview"
    )
      mock = true;
    if (ts.isJsxElement(node) && isMockAttrs(node.openingElement.attributes))
      mock = true;
    if (ts.isJsxSelfClosingElement(node) && isMockAttrs(node.attributes))
      mock = true;
    if (
      !mock &&
      (ts.isStringLiteralLike(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node))
    ) {
      const text = node.getText();
      for (const m of text.matchAll(/text-\[(\d*\.?\d+)rem\]/g)) {
        if (Number(m[1]) >= MIN_TEXT_REM) continue;
        const pos = node.getStart() + m.index;
        const line = sf.getLineAndCharacterOfPosition(pos).line + 1;
        if (!allowed(file, source.split("\n")[line - 1]))
          out.push({
            file,
            line,
            match: m[0],
            why: `text under ${MIN_TEXT_REM}rem outside a mock preview: use text-xs or mark the preview with data-mock`,
          });
      }
    }
    ts.forEachChild(node, (c) => visit(c, mock));
  };
  visit(sf, false);
  return out;
}

const gather = (dirs) => dirs.flatMap((d) => files(d)).flatMap(scan);
const failures = [
  ...gather(FAIL_DIRS),
  ...files(MIN_TEXT_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .flatMap(scanMinText),
];
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
    `Units check failed: ${failures.length} violation(s) for text size, spacing, sizing or radius:`
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
  `Units OK: no px literals for text size, spacing, sizing or radius in ${FAIL_DIRS.join(" and ")}, and no text under ${MIN_TEXT_REM}rem outside a mock preview in ${MIN_TEXT_DIR} (${config.allow.length} allowlisted).`
);
