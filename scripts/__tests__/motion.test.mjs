// Plan 137: the motion guard. Run with: pnpm test:scripts
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkComponent, checkStylesheet } from "../check-motion.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

const goodCss = `
@keyframes wd-fade-in { from { opacity: 0; } }
@keyframes wd-fade-out { to { opacity: 0; } }
@layer components {
  .wd-motion-fade[data-state="open"] { animation: wd-fade-in var(--wd-motion-duration) var(--wd-motion-easing) both; }
  .wd-motion-fade[data-state="closed"] { animation: wd-fade-out var(--wd-motion-duration) var(--wd-motion-easing) both; }
}
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

test("a complete stylesheet passes and reports its kinds", () => {
  const sheet = checkStylesheet(goodCss);
  assert.deepEqual(sheet.problems, []);
  assert.deepEqual([...sheet.kinds], ["fade"]);
});

test("a stylesheet without the reduced-motion block fails", () => {
  const css = goodCss.replace(/@media[\s\S]*$/, "");
  assert.match(
    checkStylesheet(css).problems.join(),
    /no @media \(prefers-reduced-motion: reduce\) block/
  );
});

test("a reduced-motion block that leaves out a duration, the loop or the universal selector fails", () => {
  const withoutLoop = goodCss.replace(
    "animation-iteration-count: 1 !important;",
    ""
  );
  assert.match(
    checkStylesheet(withoutLoop).problems.join(),
    /does not stop animations from looping/
  );
  const withoutTransition = goodCss.replace(
    "transition-duration: 0.01ms !important;",
    ""
  );
  assert.match(
    checkStylesheet(withoutTransition).problems.join(),
    /does not shorten transition-duration/
  );
  const notUniversal = goodCss.replace("*,\n  ::before,\n  ::after", ".a");
  assert.match(
    checkStylesheet(notUniversal).problems.join(),
    /does not apply to every element/
  );
});

test("keyframes outside the wd- namespace, and a rule naming missing keyframes, fail", () => {
  const css = goodCss + "\n@keyframes spin { to { rotate: 1turn; } }";
  assert.match(
    checkStylesheet(css).problems.join(),
    /keyframes spin is not named wd-\*/
  );
  const missing = goodCss.replace(
    "animation: wd-fade-in",
    "animation: wd-fade-inn"
  );
  assert.match(
    checkStylesheet(missing).problems.join(),
    /keyframes wd-fade-inn, which do not exist/
  );
});

const kinds = new Set([
  "fade",
  "pop",
  "float",
  "slide",
  "expand",
  "spin",
  "pulse",
]);

test("a component fed duration and easing from tokens passes", () => {
  const src =
    '"wd-motion-fade [--wd-motion-duration:var(--duration-x-duration)] [--wd-motion-easing:var(--x-easing)]"';
  assert.deepEqual(checkComponent(src, kinds).problems, []);
});

test("a component missing a required property fails", () => {
  const noEasing =
    '"wd-motion-fade [--wd-motion-duration:var(--duration-x-duration)]"';
  assert.match(
    checkComponent(noEasing, kinds).problems.join(),
    /wd-motion-fade is not given --wd-motion-easing/
  );
  const floatNoDistance =
    '"wd-motion-float [--wd-motion-duration:var(--duration-x)] [--wd-motion-easing:var(--x)] [--wd-motion-scale:var(--s)]"';
  assert.match(
    checkComponent(floatNoDistance, kinds).problems.join(),
    /wd-motion-float is not given --wd-motion-distance/
  );
});

test("a literal duration in place of a token reference fails", () => {
  const literal =
    '"wd-motion-spin [--wd-motion-duration:1s] [--wd-motion-easing:var(--x)]"';
  assert.match(
    checkComponent(literal, kinds).problems.join(),
    /wd-motion-spin is not given --wd-motion-duration/
  );
});

test("a slide takes a token or a full-edge start position", () => {
  const base = "[--wd-motion-duration:var(--d)] [--wd-motion-easing:var(--e)]";
  assert.deepEqual(
    checkComponent(`"wd-motion-slide ${base} [--wd-motion-y:100%]"`, kinds)
      .problems,
    []
  );
  assert.deepEqual(
    checkComponent(`"wd-motion-slide ${base} [--wd-motion-x:-100%]"`, kinds)
      .problems,
    []
  );
  assert.match(
    checkComponent(`"wd-motion-slide ${base}"`, kinds).problems.join(),
    /--wd-motion-x or --wd-motion-y/
  );
});

test("a class the stylesheet does not define fails, and a comment is ignored", () => {
  assert.match(
    checkComponent('"wd-motion-wobble"', kinds).problems.join(),
    /wd-motion-wobble is not defined/
  );
  assert.deepEqual(
    checkComponent('// "wd-motion-wobble" was removed\nconst a = 1;', kinds)
      .problems,
    []
  );
});

test("the custom properties are not read as classes", () => {
  const { used } = checkComponent(
    '"[--wd-motion-duration:var(--d)] [--wd-motion-easing:var(--e)]"',
    kinds
  );
  assert.equal(used.size, 0);
});

test("the guard passes on packages/ui/src", () => {
  const out = execFileSync(
    process.execPath,
    [path.join(root, "scripts/check-motion.mjs")],
    { encoding: "utf8" }
  );
  assert.match(out, /^Motion OK/);
});
