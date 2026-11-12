// The Icon story's glyph list and the Figma Icon set's `icon` options are one list: a glyph added
// on one side and not the other shows up here. Run with: pnpm test:scripts
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

test("the Icon story lists the glyphs the Figma Icon set draws", () => {
  const story = fs.readFileSync(
    path.join(
      root,
      "apps/storybook/stories/Components/Content-Display/icon.stories.tsx"
    ),
    "utf8"
  );
  const block =
    /const GLYPHS = \{([\s\S]*?)\} as const;/.exec(story)?.[1] ?? "";
  // Figma shows "Chevron Down"; the manifest and the code say "chevron-down"
  const inStory = [...block.matchAll(/^\s*(?:"([^"]+)"|(\w+)):/gm)].map((m) =>
    (m[1] ?? m[2]).toLowerCase().replace(/\s+/g, "-")
  );
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, "figma/manifest.json"), "utf8")
  );
  const sets = Array.isArray(manifest.sets)
    ? manifest.sets
    : (manifest.components ?? Object.values(manifest));
  const icon = sets.find((s) => s?.name === "Icon");
  const inFigma = icon?.properties?.icon?.options ?? [];
  assert.ok(inStory.length > 0, "found no glyphs in the story");
  assert.ok(
    inFigma.length > 0,
    "found no `icon` options on the Figma Icon set"
  );
  assert.deepEqual([...inStory].sort(), [...inFigma].sort());
});
