import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// Token Bridge decides a token's type when it exports from Figma, and one of
// its rules is deliberate: a `spacing` token whose name mentions "border" or
// "radius" is exported as `dimension` (apps/figma-plugin processor.ts,
// "spacing used for border properties should be dimension"). A token the repo
// types `spacing` against that rule is flipped on every Push, so the next push
// rewrote it and the DTCG file lost its `category: spacing` marker
// (toggle-group.item-border-width was the one such token).
//
// Both `spacing` and `dimension` give the same CSS variable (`--space-...`),
// so this is about the two sides agreeing, not about the CSS.
//
// io/processed holds the same flat token names whichever sync layout is in use.
const dir = new URL("../io/processed/", import.meta.url);

const tokens = readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) =>
    Object.entries(JSON.parse(readFileSync(new URL(f, dir), "utf8"))).map(
      ([name, token]) => ({ file: f, name, type: token.$type })
    )
  );

test("there are processed tokens to check", () => {
  assert.ok(tokens.length > 1000);
});

test("no spacing token has border or radius in its name (Token Bridge exports those as dimension)", () => {
  const offenders = tokens
    .filter((t) => t.type === "spacing" && /border|radius/i.test(t.name))
    .map((t) => `${t.file}: ${t.name}`);
  assert.deepEqual(offenders, []);
});
