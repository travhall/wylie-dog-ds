// The stroke follows the size everywhere (Plan: per-size icon stroke tokens).
//
// <Icon size> picks both the size and the stroke token (`icon.stroke-width.sm|md|lg`). The
// system's own components size their icons from their own component tokens, so they must also
// pass the matching `size`, or the icon would draw the md stroke at any size. This fails when:
//   - an <Icon> in packages/ui/src passes no `size`,
//   - its `size` is not the tier of the size its component token draws (see scripts/icon-tiers.mjs),
//   - an icon is drawn as a raw <svg> (it would carry no stroke token; Checkbox is the one
//     component that owns its per-size stroke tokens).

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pxOfSpaceVar, tierForPx } from "../icon-tiers.mjs";

const srcDir = "packages/ui/src";
const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["__tests__", "node_modules", "dist"].includes(entry.name))
        walk(full);
    } else if (/\.tsx$/.test(entry.name) && entry.name !== "icon.tsx") {
      files.push(full);
    }
  }
})(srcDir);

const elements = [];
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  for (const match of src.matchAll(
    /<Icon\b(?:"[^"]*"|\{[^}]*\}|[^>"{])*\/>/g
  )) {
    const line = src.slice(0, match.index).split("\n").length;
    elements.push({ where: `${file}:${line}`, text: match[0] });
  }
}

test("finds the icons the system renders", () => {
  assert.ok(
    elements.length >= 20,
    `found only ${elements.length} <Icon> elements`
  );
});

// One icon: the size it passes against the size token it draws.
const checkSize = (where, size, sizeVar, problems) => {
  // no size token means the glyph keeps the 24px it is drawn at, the md tier
  const px = sizeVar ? pxOfSpaceVar(sizeVar) : 24;
  if (px === undefined) {
    problems.push(`${where}  ${sizeVar} is not a size token`);
    return;
  }
  const expected = tierForPx(px);
  if (size !== expected) {
    problems.push(
      `${where}  size="${size}" but ${sizeVar ?? "the default"} draws ${px}px, which is ${expected}`
    );
  }
};

test("every <Icon> passes the size whose stroke matches the size it draws", () => {
  const problems = [];
  for (const { where, text } of elements) {
    // a size that depends on the component's own size comes from a map, checked below
    if (/\ssize=\{/.test(text)) continue;
    const size = /\ssize="(sm|md|lg)"/.exec(text)?.[1];
    if (!size) {
      problems.push(
        `${where}  no size="sm|md|lg" (the size picks the stroke token)`
      );
      continue;
    }
    checkSize(
      where,
      size,
      /\bh-\((--space-[a-z0-9-]+)\)/.exec(text)?.[1],
      problems
    );
  }
  assert.deepEqual(problems, []);
});

test("an icon whose size depends on its component's size takes its stroke from a map that matches", () => {
  const problems = [];
  let pairs = 0;
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    // { size: "sm", className: "h-(--space-select-trigger-icon-size-sm) ..." }
    for (const match of src.matchAll(
      /size:\s*"(sm|md|lg)",\s*className:\s*"([^"]*)"/g
    )) {
      pairs++;
      const line = src.slice(0, match.index).split("\n").length;
      checkSize(
        `${file}:${line}`,
        match[1],
        /\bh-\((--space-[a-z0-9-]+)\)/.exec(match[2])?.[1],
        problems
      );
    }
  }
  const dynamic = elements.filter(({ text }) => /\ssize=\{/.test(text));
  assert.ok(
    pairs >= dynamic.length * 3,
    `${dynamic.length} <Icon> with a mapped size, but only ${pairs} size and className pairs`
  );
  assert.deepEqual(problems, []);
});

test("no component draws an icon as a raw <svg>, outside Checkbox", () => {
  const raw = files
    .filter((file) => path.basename(file) !== "checkbox.tsx")
    .filter((file) => /<svg\b/.test(fs.readFileSync(file, "utf8")));
  assert.deepEqual(raw, []);
});
