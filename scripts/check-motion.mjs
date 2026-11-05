#!/usr/bin/env node
// Motion guard (Plan 137).
//
// Every animation in the UI package goes through the wd-motion-* classes in
// packages/ui/src/styles/index.css, and every number in them is a component token.
// This guard keeps that true:
//
//   1. The stylesheet has the one reduced-motion block that shortens every animation
//      and transition, so all motion, present and future, respects the setting.
//   2. Every wd-motion-<kind> class used in a component is defined in the stylesheet.
//   3. A component that uses a kind feeds it what the kind needs: always a duration
//      and an easing, plus a distance and scale (float), a scale (pop), a start
//      position (slide), a height (expand) or an opacity (pulse).
//   4. Every keyframe a wd-motion class names exists, and every keyframe is named wd-*.
//
// A literal animate-* class, a bare duration or easing is already caught by
// check-design-utilities.mjs.
//
//   node scripts/check-motion.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = "packages/ui/src";
const cssFile = "packages/ui/src/styles/index.css";

// What each kind needs from the component, as property names
const REQUIRED = {
  fade: ["duration", "easing"],
  pop: ["duration", "easing", "scale"],
  float: ["duration", "easing", "distance", "scale"],
  slide: ["duration", "easing", ["x", "y"]],
  expand: ["duration", "easing", "height"],
  spin: ["duration", "easing"],
  pulse: ["duration", "easing", "opacity"],
};

const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "))
    .replace(/(^|\s)\/\/.*$/gm, "$1");

// The stylesheet: reduced motion, keyframes and the wd-motion classes it defines.
export function checkStylesheet(css) {
  const problems = [];
  const reduced =
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?\n\})/.exec(
      css
    );
  if (!reduced) {
    problems.push("no @media (prefers-reduced-motion: reduce) block");
  } else {
    const body = reduced[1];
    if (!/animation-duration:\s*[^;]*!important/.test(body))
      problems.push("reduced motion does not shorten animation-duration");
    if (!/transition-duration:\s*[^;]*!important/.test(body))
      problems.push("reduced motion does not shorten transition-duration");
    if (!/animation-iteration-count:\s*1\s*!important/.test(body))
      problems.push("reduced motion does not stop animations from looping");
    if (!/\*/.test(body.split("{")[0]))
      problems.push("reduced motion does not apply to every element");
  }
  const keyframes = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(
    (m) => m[1]
  );
  for (const name of keyframes)
    if (!name.startsWith("wd-"))
      problems.push(`keyframes ${name} is not named wd-*`);
  const defined = new Set(
    [...css.matchAll(/\.wd-motion-([a-z]+)/g)].map((m) => m[1])
  );
  for (const m of css.matchAll(/animation:\s*([\w-]+)\s/g))
    if (!keyframes.includes(m[1]))
      problems.push(
        `a wd-motion rule names keyframes ${m[1]}, which do not exist`
      );
  return { problems, kinds: defined, keyframes };
}

// A component source: the kinds it uses and what it feeds them.
export function checkComponent(src, kinds) {
  const text = stripComments(src);
  const problems = [];
  const used = new Set(
    // A class, not the --wd-motion-* custom properties that feed it
    [...text.matchAll(/(?<![\w-])wd-motion-([a-z]+)\b(?!:)/g)].map((m) => m[1])
  );
  for (const kind of used) {
    if (!kinds.has(kind) || !REQUIRED[kind]) {
      problems.push(`wd-motion-${kind} is not defined in the stylesheet`);
      continue;
    }
    for (const need of REQUIRED[kind]) {
      const names = Array.isArray(need) ? need : [need];
      const fed = names.some(
        (n) =>
          new RegExp(`\\[--wd-motion-${n}:var\\(--[a-z0-9-]+\\)\\]`).test(
            text
          ) ||
          // a fixed edge position is geometry, not a token: [--wd-motion-y:100%]
          ((n === "x" || n === "y") &&
            new RegExp(`\\[--wd-motion-${n}:-?100%\\]`).test(text))
      );
      if (!fed)
        problems.push(
          `wd-motion-${kind} is not given --wd-motion-${names.join(" or --wd-motion-")}`
        );
    }
  }
  return { problems, used };
}

function run() {
  const css = fs.readFileSync(path.join(root, cssFile), "utf8");
  const sheet = checkStylesheet(css);
  const problems = sheet.problems.map((p) => `${cssFile}: ${p}`);
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
        /\.tsx?$/.test(entry.name) &&
        !/\.(test|d)\.tsx?$/.test(entry.name)
      )
        files.push(rel);
    }
  })(srcDir);
  const usedKinds = new Set();
  let surfaces = 0;
  for (const file of files) {
    const result = checkComponent(
      fs.readFileSync(path.join(root, file), "utf8"),
      sheet.kinds
    );
    result.used.forEach((k) => usedKinds.add(k));
    if (result.used.size) surfaces++;
    for (const p of result.problems) problems.push(`${file}: ${p}`);
  }
  for (const kind of sheet.kinds)
    if (!usedKinds.has(kind))
      problems.push(
        `${cssFile}: wd-motion-${kind} is defined but no component uses it`
      );
  if (problems.length) {
    console.error(`Motion: ${problems.length} problem(s)\n`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log(
    `Motion OK: ${surfaces} component files use ${usedKinds.size} motion kinds, each fed from tokens; reduced motion shortens every animation and transition.`
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  run();
