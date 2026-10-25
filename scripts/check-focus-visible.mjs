#!/usr/bin/env node
// Keyboard focus visibility check (Plan 197).
//
//   node scripts/check-focus-visible.mjs <storybook-static dir> [--only regex]
//
// Serves a static Storybook build, opens the first story of every component,
// tabs through it with the keyboard and asserts that every focused element
// draws an indicator: a real outline (style not none, width above 0, colour not
// transparent), in Light and Dark and in forced-colors mode (where the outline
// must still be drawn, because box-shadow is dropped).
//
// Elements that show focus only as a highlighted surface and are reached by
// arrow keys rather than Tab are covered by the contrast pairs, not here.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "apps/storybook/package.json"));
const { chromium } = require("playwright");

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { only: { type: "string" } },
});
const dir = positionals[0] && path.resolve(positionals[0]);
if (!dir) {
  console.error(
    "Usage: check-focus-visible.mjs <storybook-static dir> [--only regex]"
  );
  process.exit(2);
}

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
};
const server = http.createServer((req, res) => {
  const file = path.join(
    dir,
    decodeURIComponent(new URL(req.url, "http://x").pathname)
  );
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, {
      "content-type": types[path.extname(file)] ?? "application/octet-stream",
    });
    res.end(data);
  });
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const index = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"));
const firstByTitle = new Map();
for (const e of Object.values(index.entries)) {
  if (e.type !== "story" || !e.title.startsWith("Components/")) continue;
  if (!firstByTitle.has(e.title)) firstByTitle.set(e.title, e.id);
}
const only = values.only ? new RegExp(values.only) : null;
const stories = [...firstByTitle.values()].filter(
  (id) => !only || only.test(id)
);

const browser = await chromium.launch();
const failures = [];
let checked = 0;
for (const forced of ["none", "active"]) {
  for (const theme of ["light", "dark"]) {
    if (forced === "active" && theme === "dark") continue;
    const ctx = await browser.newContext({
      forcedColors: forced,
      viewport: { width: 1000, height: 800 },
    });
    const page = await ctx.newPage();
    for (const id of stories) {
      await page.goto(
        `http://localhost:${port}/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`
      );
      await page.waitForTimeout(250);
      await page.evaluate(() => document.activeElement?.blur());
      const seen = new Set();
      for (let i = 0; i < 14; i++) {
        await page.keyboard.press("Tab");
        await page.waitForTimeout(40);
        const info = await page.evaluate(() => {
          const el = document.activeElement;
          if (
            !el ||
            el === document.body ||
            !document.querySelector("#storybook-root")?.contains(el)
          )
            return null;
          const cs = getComputedStyle(el);
          const trail = [];
          for (
            let n = el;
            n && n.id !== "storybook-root" && trail.length < 3;
            n = n.parentElement
          )
            trail.unshift(
              n.tagName.toLowerCase() +
                (n.getAttribute("role")
                  ? `[role=${n.getAttribute("role")}]`
                  : "")
            );
          return {
            key:
              trail.join(">") +
              ":" +
              (el.textContent || el.getAttribute("aria-label") || "")
                .trim()
                .slice(0, 20),
            style: cs.outlineStyle,
            width: parseFloat(cs.outlineWidth),
            color: cs.outlineColor,
          };
        });
        if (!info || seen.has(info.key)) continue;
        seen.add(info.key);
        checked++;
        const transparent =
          /rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)|transparent/.test(info.color);
        const ok =
          info.style !== "none" &&
          info.width > 0 &&
          (forced === "active" || !transparent);
        if (!ok)
          failures.push(
            `${id} [${forced === "active" ? "forced-colors" : theme}] ${info.key}: outline ${info.style} ${info.width}px ${info.color}`
          );
      }
    }
    await ctx.close();
  }
}
await browser.close();
server.close();

if (failures.length) {
  console.error(
    `Focus visibility: ${failures.length} focused element(s) without an indicator (of ${checked} checked)\n`
  );
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `Focus visibility OK: ${checked} focused elements in ${stories.length} component stories, Light, Dark and forced-colors.`
);
