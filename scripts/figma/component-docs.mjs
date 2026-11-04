#!/usr/bin/env node
// Component descriptions and documentation links for the Figma library (Plan 216, Phase E).
//
// The words come from one place: each story's `parameters.docs.description.component`. The
// Figma description is its first paragraph in plain text (cut after the last whole sentence within 280 characters), and the Figma documentation link
// is the component's docs page in the published Storybook. The Storybook components
// manifest has neither, so the story files are read directly.
//
// Used by scripts/check-figma-parity.mjs (to compare), and by hand:
//   node scripts/figma/component-docs.mjs --json
//       prints { "<Figma set name>": { description, url } } for the Figma MCP pass
//   node scripts/figma/component-docs.mjs --builder [path/to/code.js]
//       rewrites the generated COMPONENT_DOCS block in the (gitignored) Figma builder
// Both need a Storybook build (`pnpm --filter storybook build`) and read figma/manifest.json
// for the Figma set names.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const STORYBOOK_URL = "https://wyliedogstorybook.com";
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

// The string literal that follows `description: { component:` in a story file, or null.
export function readStoryDescription(source) {
  const m = /description\s*:\s*\{\s*component\s*:\s*(["'`])/.exec(source);
  if (!m) return null;
  const quote = m[1];
  let out = "";
  for (let i = m.index + m[0].length; i < source.length; i++) {
    const ch = source[i];
    if (ch === "\\") {
      const next = source[++i];
      out += next === "n" ? "\n" : next === "t" ? "\t" : next;
    } else if (ch === quote) return out;
    else out += ch;
  }
  return null;
}

// First paragraph of a markdown text, as plain text on one line.
export function firstParagraph(markdown) {
  const para = markdown.trim().split(/\n\s*\n/)[0];
  return para
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// The Figma description: the first paragraph, cut after the last whole sentence that fits in
// `max` characters (never shorter than the first sentence), so it stays short in the panel.
export function figmaDescription(markdown, max = 280) {
  const text = firstParagraph(markdown);
  if (text.length <= max) return text;
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
  let out = sentences[0];
  for (const next of sentences.slice(1)) {
    if ((out + " " + next).length > max) break;
    out += " " + next;
  }
  return out;
}

export const docsUrl = (id) => `${STORYBOOK_URL}/?path=/docs/${id}--docs`;

// Storybook manifest -> Map of normalized component name -> { name, description, url }
export function componentDocs(manifest, readFile) {
  const out = new Map();
  for (const entry of Object.values(manifest.components)) {
    if (entry.error) continue;
    const raw = readStoryDescription(readFile(entry.path) ?? "");
    if (!raw) continue;
    const key = norm(entry.name);
    // CardGrid and FeatureGrid have a Components and a Patterns story: keep the component one.
    if (out.has(key) && !entry.id.startsWith("components-")) continue;
    out.set(key, {
      name: entry.name,
      description: figmaDescription(raw),
      url: docsUrl(entry.id),
    });
  }
  return out;
}

// { "<Figma set name>": { description, url } } for the sets that have a story.
export function docsByFigmaName(docs, figma, names = {}) {
  const out = {};
  for (const c of figma.components) {
    const d = docs.get(norm(names[c.name] ?? c.name));
    if (d) out[c.name] = { description: d.description, url: d.url };
  }
  return out;
}

const BEGIN = "// BEGIN GENERATED COMPONENT_DOCS (node scripts/figma/component-docs.mjs --builder)";
const END = "// END GENERATED COMPONENT_DOCS";
const ANCHOR = "// Code defaults for the sets whose default variant";

export function builderBlock(table) {
  return `${BEGIN}\n// Description and documentation link per component set, from the stories. Do not edit by hand.\nvar COMPONENT_DOCS = ${JSON.stringify(table, null, 2)};\n${END}\n`;
}

export function patchBuilder(source, table) {
  const block = builderBlock(table);
  const b = source.indexOf(BEGIN);
  const e = source.indexOf(END);
  if (b >= 0 && e > b) return source.slice(0, b) + block.trimEnd() + source.slice(e + END.length);
  const at = source.indexOf(ANCHOR);
  if (at < 0) throw new Error("Builder anchor not found: " + ANCHOR);
  return source.slice(0, at) + block + "\n" + source.slice(at);
}

function main() {
  const argv = process.argv.slice(2);
  const storybookFile = "apps/storybook/storybook-static/manifests/components.json";
  if (!fs.existsSync(storybookFile)) {
    console.error("No Storybook manifest. Run: pnpm --filter storybook build");
    process.exit(2);
  }
  const manifest = JSON.parse(fs.readFileSync(storybookFile, "utf8"));
  const figma = JSON.parse(fs.readFileSync("figma/manifest.json", "utf8"));
  const config = JSON.parse(fs.readFileSync("scripts/figma-parity.config.json", "utf8"));
  const readFile = (p) => {
    try {
      return fs.readFileSync(path.join("apps/storybook", p), "utf8");
    } catch {
      return null;
    }
  };
  const table = docsByFigmaName(componentDocs(manifest, readFile), figma, config.names);
  if (argv.includes("--builder")) {
    const i = argv.indexOf("--builder");
    const file =
      argv[i + 1] && !argv[i + 1].startsWith("--")
        ? argv[i + 1]
        : "apps/figma-plugin/wylie-dog-figma-builder/code.js";
    if (!fs.existsSync(file)) {
      console.log(`No builder at ${file}; nothing to update.`);
      return;
    }
    fs.writeFileSync(file, patchBuilder(fs.readFileSync(file, "utf8"), table));
    console.log(`COMPONENT_DOCS written to ${file} (${Object.keys(table).length} components).`);
  } else {
    console.log(JSON.stringify(table));
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
