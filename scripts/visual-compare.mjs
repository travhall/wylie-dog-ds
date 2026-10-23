#!/usr/bin/env node
// Pixel-compares every story between two static Storybook builds, in Light and Dark.
//
//   node scripts/visual-compare.mjs <dirA> <dirB> [--label name] [--only regex] [--out dir]
//   node scripts/visual-compare.mjs --noise <dir> [--label name]
//
// <dirA> and <dirB> are `storybook-static` directories (each has an index.json).
// --noise serves one build twice and compares it with itself, to show how many
// stories differ from rendering alone (interaction stories, timers, fonts).
// A real change is a story that differs between A and B and is NOT in that noise set.
//
// Output: a JSON summary on stdout, results.json plus a/b PNG pairs for every
// shot that differs by more than --threshold percent (default 0.2) in --out
// (default /tmp/visual-compare/<label>).
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "apps/storybook/package.json"));
const { chromium } = require("playwright");
const { PNG } = require("pngjs");

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    label: { type: "string", default: "compare" },
    only: { type: "string" },
    out: { type: "string" },
    threshold: { type: "string", default: "0.2" },
    noise: { type: "boolean", default: false },
  },
});
const noise = values.noise;
const [dirA, dirB = dirA] = positionals.map((p) => path.resolve(p));
if (!dirA || (!noise && positionals.length < 2)) {
  console.error(
    "Usage: visual-compare.mjs <dirA> <dirB> [--label x]\n       visual-compare.mjs --noise <dir> [--label x]"
  );
  process.exit(2);
}
const threshold = Number(values.threshold);
const out = path.resolve(values.out ?? `/tmp/visual-compare/${values.label}`);
fs.mkdirSync(out, { recursive: true });

const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".png": "image/png",
  ".ico": "image/x-icon",
};
// Serve a directory on an ephemeral port; resolves to { server, port }.
const serve = (dir) =>
  new Promise((resolve) => {
    const server = http
      .createServer((req, res) => {
        const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
        const f = path.join(dir, p === "/" ? "index.html" : p);
        if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
          res.writeHead(404);
          res.end();
          return;
        }
        res.writeHead(200, { "content-type": types[path.extname(f)] ?? "application/octet-stream" });
        fs.createReadStream(f).pipe(res);
      })
      .listen(0, () => resolve({ server, port: server.address().port }));
  });

const idsOf = (dir) => {
  const idx = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"));
  return Object.values(idx.entries)
    .filter((e) => e.type === "story")
    .map((e) => e.id);
};
const idsA = idsOf(dirA);
const idsB = idsOf(dirB);
const setA = new Set(idsA);
const setB = new Set(idsB);
const shared = idsB.filter((id) => setA.has(id));
const onlyInA = idsA.filter((id) => !setB.has(id));
const onlyInB = idsB.filter((id) => !setA.has(id));
const filter = values.only ? new RegExp(values.only) : null;
const ids = filter ? shared.filter((id) => filter.test(id)) : shared;

const A = await serve(dirA);
const B = await serve(dirB);
const browser = await chromium.launch();

const shot = async (ctx, port, id, theme) => {
  const page = await ctx.newPage();
  try {
    await page.goto(`http://localhost:${port}/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`, {
      waitUntil: "load",
      timeout: 30000,
    });
    await page.addStyleTag({
      content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
    });
    await page.waitForTimeout(450);
    return await page.screenshot({ type: "png" });
  } catch {
    return null;
  } finally {
    await page.close();
  }
};

// Percent of pixels whose largest channel difference exceeds 8, and that largest difference.
const diff = (x, y) => {
  const a = PNG.sync.read(x);
  const b = PNG.sync.read(y);
  if (a.width !== b.width || a.height !== b.height) return { pct: 100, max: 255 };
  let n = 0;
  let max = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const d = Math.max(
      Math.abs(a.data[i] - b.data[i]),
      Math.abs(a.data[i + 1] - b.data[i + 1]),
      Math.abs(a.data[i + 2] - b.data[i + 2])
    );
    if (d > 8) {
      n++;
      if (d > max) max = d;
    }
  }
  return { pct: (n / (a.width * a.height)) * 100, max };
};

const results = [];
const jobs = ids.flatMap((id) => ["light", "dark"].map((theme) => ({ id, theme })));
let next = 0;
const worker = async () => {
  const opts = { viewport: { width: 800, height: 600 }, reducedMotion: "reduce" };
  const ctxA = await browser.newContext(opts);
  const ctxB = await browser.newContext(opts);
  while (next < jobs.length) {
    const { id, theme } = jobs[next++];
    const [x, y] = await Promise.all([shot(ctxA, A.port, id, theme), shot(ctxB, B.port, id, theme)]);
    if (!x || !y) {
      results.push({ id, theme, error: true });
      continue;
    }
    const d = diff(x, y);
    results.push({ id, theme, ...d });
    if (d.pct > threshold) {
      fs.writeFileSync(path.join(out, `${id}__${theme}__a.png`), x);
      fs.writeFileSync(path.join(out, `${id}__${theme}__b.png`), y);
    }
  }
  await ctxA.close();
  await ctxB.close();
};
await Promise.all([worker(), worker(), worker(), worker()]);
await browser.close();
A.server.close();
B.server.close();

const changed = results.filter((r) => !r.error && r.pct > threshold);
const summary = {
  label: values.label,
  mode: noise ? "noise (build compared with itself)" : "compare",
  stories: ids.length,
  shots: results.length,
  errors: results.filter((r) => r.error).length,
  changedShots: changed.length,
  storiesChanged: new Set(changed.map((r) => r.id)).size,
  onlyInA: onlyInA.length,
  onlyInB: onlyInB.length,
};
fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({ ...summary, onlyInA, onlyInB, results }, null, 1));
console.log(JSON.stringify(summary));
console.log(`Details and differing shots: ${out}`);
