#!/usr/bin/env node
// Hand-run accessibility and layout audit of the built showcase.
//
//   pnpm --filter showcase build
//   pnpm --filter showcase exec next start --port 3099      (in another shell)
//   node scripts/audit-showcase.mjs [--base http://localhost:3099] [--only regex] [--json file]
//
// Runs axe-core (wcag2a, wcag2aa, wcag21aa, wcag22aa, best-practice) over every
// route x Light/Dark x 1280/375 pixels, and also reports console errors, failed
// requests, images without alt, <h1> count, horizontal page overflow (with the
// offending elements that are not inside a scroll container) and the count of
// text nodes under 12px. Exits 1 if any critical or serious violation or any
// horizontal overflow remains.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire(
  path.join(root, "apps/storybook/package.json")
)("playwright");
const axeSource = fs.readFileSync(
  createRequire(path.join(root, "packages/ui/package.json")).resolve(
    "axe-core/axe.min.js"
  ),
  "utf8"
);

const { values } = parseArgs({
  options: {
    base: { type: "string", default: "http://localhost:3099" },
    only: { type: "string" },
    json: { type: "string" },
  },
});

const ROUTES = [
  "/",
  "/components",
  "/patterns",
  "/architecture",
  "/plugin",
  "/tokens",
  "/tokens/colors",
  "/tokens/spacing",
  "/tokens/typography",
  "/tokens/borders",
  "/tokens/elevation",
  "/tokens/motion",
].filter((r) => !values.only || new RegExp(values.only).test(r));
const SCHEMES = ["light", "dark"];
const WIDTHS = [1280, 375];
const BLOCKING = new Set(["critical", "serious"]);

// Runs in the page: elements that stick out past the viewport and are not inside
// a scroll container (overflow-x auto, scroll, hidden or clip).
function pageProbe() {
  const vw = document.documentElement.clientWidth;
  const inScroller = (el) => {
    for (
      let p = el.parentElement;
      p && p !== document.documentElement;
      p = p.parentElement
    ) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip")
        return true;
    }
    return false;
  };
  const describe = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? `#${el.id}` : "") +
    (typeof el.className === "string" && el.className.trim()
      ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".")
      : "");
  const overflowing = [];
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > vw + 1 && !inScroller(el))
      overflowing.push(describe(el));
  }
  let small = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim() || !n.parentElement) continue;
    if (parseFloat(getComputedStyle(n.parentElement).fontSize) < 12) small++;
  }
  return {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: vw,
    overflowing: overflowing.slice(0, 8),
    overflowCount: overflowing.length,
    h1: document.querySelectorAll("h1").length,
    imgNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
    smallText: small,
  };
}

const browser = await chromium.launch();
const runs = [];
for (const scheme of SCHEMES) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      colorScheme: scheme,
    });
    await context.addInitScript((s) => {
      try {
        localStorage.setItem("wd-theme", s);
      } catch {}
    }, scheme);
    for (const route of ROUTES) {
      const page = await context.newPage();
      const consoleErrors = [];
      const failed = [];
      page.on(
        "console",
        (m) => m.type() === "error" && consoleErrors.push(m.text())
      );
      page.on("requestfailed", (r) => failed.push(r.url()));
      await page.goto(values.base + route, { waitUntil: "networkidle" });
      await page.evaluate(axeSource);
      const axe = await page.evaluate(() =>
        // eslint-disable-next-line no-undef
        axe.run(document, {
          runOnly: [
            "wcag2a",
            "wcag2aa",
            "wcag21aa",
            "wcag22aa",
            "best-practice",
          ],
        })
      );
      const probe = await page.evaluate(pageProbe);
      runs.push({
        route,
        scheme,
        width,
        consoleErrors,
        failed,
        probe,
        violations: axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
          sample: v.nodes[0].target.join(" "),
        })),
      });
      await page.close();
    }
    await context.close();
  }
}
await browser.close();

// Summary by rule: nodes, runs, and where.
const byRule = new Map();
for (const run of runs) {
  const where = `${run.route} ${run.scheme}/${run.width}`;
  for (const v of run.violations) {
    const e = byRule.get(v.id) ?? {
      impact: v.impact,
      nodes: 0,
      runs: 0,
      sample: where + "  " + v.sample,
    };
    e.nodes += v.nodes;
    e.runs += 1;
    byRule.set(v.id, e);
  }
}
console.log(
  `\n${runs.length} runs (${ROUTES.length} routes x ${SCHEMES.length} schemes x ${WIDTHS.length} widths)\n`
);
console.log("Violations by rule");
if (byRule.size === 0) console.log("  none");
for (const [id, e] of [...byRule].sort((a, b) => b[1].nodes - a[1].nodes)) {
  console.log(
    `  ${id.padEnd(34)} ${String(e.impact).padEnd(9)} ${String(e.nodes).padStart(4)} nodes in ${String(e.runs).padStart(2)} runs`
  );
  console.log(`      e.g. ${e.sample}`);
}

const overflow = runs.filter((r) => r.probe.scrollWidth > r.probe.clientWidth);
console.log("\nHorizontal page overflow");
if (overflow.length === 0) console.log("  none");
for (const r of overflow) {
  console.log(
    `  ${r.route} ${r.scheme}/${r.width}: scrollWidth ${r.probe.scrollWidth} > ${r.probe.clientWidth} (${r.probe.overflowCount} elements outside a scroller)`
  );
  console.log(`      ${r.probe.overflowing.join(", ")}`);
}

const errs = runs.filter((r) => r.consoleErrors.length || r.failed.length);
console.log("\nConsole errors and failed requests");
if (errs.length === 0) console.log("  none");
for (const r of errs) {
  console.log(
    `  ${r.route} ${r.scheme}/${r.width}: ${[...r.consoleErrors, ...r.failed].slice(0, 2).join(" | ")}`
  );
}

const noH1 = runs.filter((r) => r.probe.h1 !== 1);
const noAlt = runs.filter((r) => r.probe.imgNoAlt > 0);
console.log(`\nPages without exactly one <h1>: ${noH1.length}`);
console.log(`Pages with images missing alt: ${noAlt.length}`);
const smallMax = Math.max(0, ...runs.map((r) => r.probe.smallText));
console.log(
  `Text nodes under 12px (most on one page; Plan 212 owns this): ${smallMax}`
);

if (values.json) fs.writeFileSync(values.json, JSON.stringify(runs, null, 2));

const blocking = runs.some((r) =>
  r.violations.some((v) => BLOCKING.has(v.impact))
);
const failedRun = blocking || overflow.length > 0;
console.log(
  `\n${failedRun ? "FAIL" : "PASS"}: ${blocking ? "critical or serious violations remain. " : ""}${overflow.length ? "horizontal overflow remains." : ""}`
);
process.exit(failedRun ? 1 : 0);
