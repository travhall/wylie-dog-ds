#!/usr/bin/env node
// Story token-binding guard (Plan 213).
//
// The rule (decided 2026-10-24): stories never bind to tokens. The Wylie Dog UI
// package is the contract with adopters; story demos use the UI components and
// plain layout classes. A reference to a token variable in a story, such as
// text-(--color-foreground-muted), var(--space-200) or style={{ color: "var(--x)" }},
// is a violation.
//
// Scans tracked .ts/.tsx/.mdx/.css files under apps/storybook/stories. Not counted:
//   - Foundations/Design Tokens/*, whose subject is the tokens
//   - stories/globals.css, the Storybook shell that grounds the page background
//   - fenced code blocks in MDX, comments and `summary:` strings: they document
//     how to use tokens, they do not bind a story to one
// Usage: node scripts/check-story-token-bindings.mjs

import fs from "node:fs";
import { execSync } from "node:child_process";

const ROOT = "apps/storybook/stories/";
const EXEMPT = [`${ROOT}Foundations/Design Tokens/`, `${ROOT}globals.css`];
const refRe = /(?:var\(\s*|-\(\s*(?:[a-z]+:)?)(--[a-z0-9][a-z0-9-]*)/gi;

const files = execSync("git ls-files -z", { encoding: "utf8", maxBuffer: 1 << 26 })
  .split("\0")
  .filter(
    (f) =>
      f.startsWith(ROOT) &&
      /\.(tsx?|mdx|css)$/.test(f) &&
      !EXEMPT.some((e) => f.startsWith(e))
  );

const violations = [];
for (const file of files) {
  const isMdx = file.endsWith(".mdx");
  let fence = null;
  let block = false;
  fs.readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (isMdx) {
        // CommonMark: a fence closes only on a run of the same character that is
        // at least as long as the opener, so a four-backtick fence can hold three.
        const m = line.match(/^\s*(`{3,}|~{3,})/);
        if (fence) {
          if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null;
          return;
        }
        if (m) {
          fence = m[1];
          return;
        }
      }
      let text = line;
      if (block) {
        const end = text.indexOf("*/");
        if (end === -1) return;
        text = text.slice(end + 2);
        block = false;
      }
      text = text.replace(/\/\*.*?\*\//g, "");
      const open = text.indexOf("/*");
      if (open !== -1) {
        text = text.slice(0, open);
        block = true;
      }
      text = text.replace(/(^|\s)\/\/.*$/, "$1");
      if (/^\s*summary:\s*["'`]/.test(text)) return;
      for (const m of text.matchAll(refRe))
        violations.push(`${file}:${i + 1}  ${m[0]}`);
    });
}

if (violations.length) {
  console.error(`Story token bindings: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  ${v}`);
  console.error(
    "\nStories must not reference token variables (see STORY_AUTHORING_GUIDE.md, 'Stories never bind to tokens')."
  );
  process.exit(1);
}
console.log(`Story token bindings OK: ${files.length} files, no token references.`);
