// Plan 217: the catch-all guard for design utilities no other guard sees.
// Run with: pnpm test:scripts
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classify, scanCss, scanSource } from "../check-design-utilities.mjs";
import { stripVariants } from "../class-variants.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

test("stripVariants removes plain, bracketed and nested-bracket variants", () => {
  assert.equal(stripVariants("hover:scale-105"), "scale-105");
  assert.equal(stripVariants("md:hover:scale-105"), "scale-105");
  assert.equal(stripVariants("data-[state=open]:after:h-1"), "h-1");
  assert.equal(
    stripVariants("[&[data-state=open]>svg]:rotate-180"),
    "rotate-180"
  );
  assert.equal(
    stripVariants("**:[[cmdk-group-heading]]:px-(--space-x)"),
    "px-(--space-x)"
  );
  assert.equal(stripVariants("[&:has([role=checkbox])]:pr-0"), "pr-0");
  assert.equal(stripVariants("scale-105"), "scale-105");
  // A colon inside a token reference or an arbitrary value is not a variant
  assert.equal(stripVariants("bg-[url(a:b)]"), "bg-[url(a:b)]");
});

test("classify flags a literal in each family", () => {
  const flagged = {
    "scale-105": "transform",
    "-translate-y-1": "transform",
    "translate-x-2": "transform",
    "rotate-45": "transform",
    "skew-x-3": "transform",
    "underline-offset-4": "underline offset",
    "decoration-2": "decoration thickness",
    "line-clamp-2": "line clamp",
    "font-mono": "font family",
    "outline-2": "outline width",
    "outline-offset-2": "outline offset",
    "stroke-2": "stroke width",
    "divide-y": "divide width",
    "backdrop-blur-sm": "filter",
    "backdrop-blur": "filter",
    "blur-md": "filter",
    "drop-shadow-lg": "filter",
    "animate-spin": "animation",
    "ease-in-out": "easing",
    "bg-white": "named colour",
    "text-blue-500": "named colour",
    "border-red-500/50": "named colour",
    "bg-[#fff]": "colour literal",
    "text-[oklch(0.5_0.1_20)]": "colour literal",
    "rotate-[30deg]": "transform",
    "duration-[200ms]": "unit literal",
  };
  for (const [cls, kind] of Object.entries(flagged)) {
    const hit = classify(cls);
    assert.ok(hit, `${cls} should be flagged`);
    assert.equal(hit.kind, kind, cls);
  }
});

test("classify passes a token reference, a reset, a centring fraction and structure", () => {
  for (const cls of [
    "scale-(--card-grid-item-hover-scale)",
    "translate-x-(--space-switch-thumb-translate-md)",
    "translate-x-(--radix-toast-swipe-move-x)",
    "translate-x-0",
    "scale-100",
    "rotate-0",
    "-translate-x-1/2",
    "-translate-y-1/2",
    "translate-x-[-50%]",
    "translate-y-full",
    "underline-offset-auto",
    "underline",
    "animate-none",
    "duration-(--duration-progress-indicator-duration)",
    "ease-(--easing-x)",
    "transition-colors",
    "transition-all",
    "bg-transparent",
    "text-current",
    "bg-(--color-card-background)",
    "border-current",
    "font-(--font-weight-x)",
    "font-(family-name:--badge-font-family)",
    "flex",
    "grid-cols-3",
    "aspect-square",
    "cursor-pointer",
    "blur",
    "invert",
    "outline-solid",
    "outline-hidden",
    "stroke-(length:--space-icon-stroke-width-md)",
    "decoration-(--color-x)",
    "",
  ]) {
    assert.equal(classify(cls), null, `${cls} should pass`);
  }
});

test("scanSource reads a literal behind a nested-bracket variant and an inline style", () => {
  const hits = scanSource(
    [
      'const a = "group [&[data-state=open]>svg]:rotate-180 h-(--space-x)";',
      "const b = `hover:scale-105 hover:-translate-y-1`;",
      '<div style={{ transform: "rotate(3deg)", width: "var(--space-x)" }} />',
      '<div style={{ color: "var(--color-x)" }} />',
      '// "scale-105" in a comment is not a class',
      '  "border-t": "x",',
    ].join("\n")
  );
  assert.deepEqual(
    hits.map((h) => h.text),
    [
      "rotate-180",
      "scale-105",
      "-translate-y-1",
      'style transform: "rotate(3deg)"',
    ]
  );
});

test("scanCss flags a time, angle or colour literal and skips tokens, custom properties and data URIs", () => {
  const hits = scanCss(
    [
      "a { transition: background-color 0.15s; }",
      "a { transition: background-color var(--duration-x); }",
      "a { animation-duration: 0.01ms !important; }",
      "a { color: #fff; }",
      "a { --x: 200ms; }",
      'a { mask-image: url(\'data:image/svg+xml;utf8,<svg stroke="white" stroke-width="2.5"/>\'); }',
      "a { outline: 1px solid ButtonText; }",
    ].join("\n")
  );
  assert.deepEqual(
    hits.map((h) => `${h.kind}: ${h.text}`),
    [
      "css time or angle: transition: background-color 0.15s",
      "css time or angle: animation-duration: 0.01ms !important",
      "css colour: color: #fff",
    ]
  );
});

test("the guard passes on packages/ui/src", () => {
  const out = execFileSync(
    process.execPath,
    [path.join(root, "scripts/check-design-utilities.mjs")],
    { encoding: "utf8" }
  );
  assert.match(out, /^Design utilities OK/);
});
