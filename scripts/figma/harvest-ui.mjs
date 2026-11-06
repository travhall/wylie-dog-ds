#!/usr/bin/env node
// Measures the UI the way scripts/figma/measure-library.js measures Figma (Plan 217).
// For every variant in a figma-metrics.json it renders the same variant in Storybook, by URL
// args (variant, size, disabled ...) and by hovering or pressing for a hover or pressed state,
// then reads the computed styles of the component's root and of its first text.
//
//   node scripts/figma/harvest-ui.mjs figma-metrics.json [--base http://localhost:6006] > code-metrics.json
//
// Storybook must be running. The theme comes from the Figma file's `mode` (light or dark), so
// both sides are measured in the same one. How a Figma set maps to a story, a root element and
// args is in scripts/figma/compare-ui.config.json.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** "variant=default, size=md" to { variant: "default", size: "md" }. */
export function parseVariant(name) {
  const props = {};
  for (const part of String(name).split(",")) {
    const i = part.indexOf("=");
    if (i > 0) props[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return props;
}

/** Storybook's URL syntax for args: booleans are !true and !false, the rest are plain. */
export function argsParam(figmaProps, component) {
  const parts = [];
  for (const [prop, arg] of Object.entries(component.args ?? {})) {
    if (figmaProps[prop] === undefined) continue;
    // One Figma value that is several story args (Checkbox's `checked=error` is an unchecked,
    // errored box): `valueArgs` gives the whole args string for that value.
    const whole = component.valueArgs?.[prop]?.[figmaProps[prop]];
    if (whole) {
      parts.push(whole);
      continue;
    }
    const value =
      component.values?.[prop]?.[figmaProps[prop]] ?? figmaProps[prop];
    parts.push(
      `${arg}:${value === "true" ? "!true" : value === "false" ? "!false" : value}`
    );
  }
  return parts.join(";");
}

export function storyUrl(base, component, figmaProps, mode) {
  // A state that is a prop in code (Input's error, success and disabled) is rendered through
  // `stateArgs`, e.g. { "error": "error:!true" }
  const stateArg = component.stateArgs?.[figmaProps[component.state]];
  const args = [argsParam(figmaProps, component), stateArg]
    .filter(Boolean)
    .join(";");
  // A Figma value whose variant lives in another story (Toast's default is not in the solid
  // toasts story): `valueStories` maps property to value to story id.
  let story = component.story;
  for (const [prop, byValue] of Object.entries(component.valueStories ?? {})) {
    story = byValue[figmaProps[prop]] ?? story;
  }
  return (
    `${base}/iframe.html?id=${story}&viewMode=story` +
    `&globals=theme:${mode ?? "light"}` +
    (args ? `&args=${args}` : "")
  );
}

// Runs in the page. Colours are converted through a canvas so oklch, lab and color() all
// come out as the sRGB the Figma side stores.
function measureInPage(rootSelector) {
  const ctx = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  const hex = (css) => {
    if (!css || css === "transparent") return null;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    if (a === 0) return null;
    const h = (n) => n.toString(16).padStart(2, "0");
    return `#${h(r)}${h(g)}${h(b)}${a === 255 ? "" : h(a)}`;
  };
  const px = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
  };
  const el = document.querySelector(rootSelector);
  if (!el) return null;
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const clamp = (r) => Math.min(r, rect.height / 2, rect.width / 2);

  // box-shadow: split on top-level commas, then colour and four lengths per layer
  const shadows = [];
  if (cs.boxShadow && cs.boxShadow !== "none") {
    let depth = 0;
    let start = 0;
    const layers = [];
    for (let i = 0; i < cs.boxShadow.length; i++) {
      const c = cs.boxShadow[i];
      if (c === "(") depth++;
      else if (c === ")") depth--;
      else if (c === "," && depth === 0) {
        layers.push(cs.boxShadow.slice(start, i));
        start = i + 1;
      }
    }
    layers.push(cs.boxShadow.slice(start));
    for (const layer of layers) {
      if (/inset/.test(layer)) continue;
      const color =
        /(rgba?|oklab|oklch|lab|lch|color)\([^)]*\)|#[0-9a-f]+/i.exec(layer);
      const nums =
        layer.replace(color ? color[0] : "", "").match(/-?[\d.]+px/g) ?? [];
      const [x, y, blur, spread] = nums.map(px);
      const layerColor = hex(color ? color[0] : "#000");
      // Tailwind composes a shadow with fully transparent layers; they draw nothing
      if (!layerColor) continue;
      shadows.push({
        x: x ?? 0,
        y: y ?? 0,
        blur: blur ?? 0,
        spread: spread ?? 0,
        color: layerColor,
      });
    }
  }

  const bw = px(cs.borderTopWidth);
  const boxMetrics = {
    w: Math.round(rect.width * 100) / 100,
    h: Math.round(rect.height * 100) / 100,
    pad: [
      px(cs.paddingTop),
      px(cs.paddingRight),
      px(cs.paddingBottom),
      px(cs.paddingLeft),
    ],
    gap:
      cs.display.includes("flex") || cs.display.includes("grid")
        ? px(cs.columnGap)
        : 0,
    radius: Math.round(clamp(px(cs.borderTopLeftRadius)) * 100) / 100,
    border: bw,
    // the colour of the first side that has a border (a bottom rule, border-b, has no top edge)
    stroke: (() => {
      for (const side of ["Top", "Bottom", "Left", "Right"]) {
        if (px(cs[`border${side}Width`]) > 0) return hex(cs[`border${side}Color`]);
      }
      return null;
    })(),
    fill: hex(cs.backgroundColor),
    opacity: px(cs.opacity),
    shadow: shadows,
  };

  // the first text in the element
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node;
  let textNode = null;
  while ((node = walker.nextNode())) {
    if (node.textContent.trim()) {
      textNode = node;
      break;
    }
  }
  const texts = [];
  if (textNode) {
    const t = getComputedStyle(textNode.parentElement);
    const range = document.createRange();
    range.selectNodeContents(textNode);
    const lineBox = range.getBoundingClientRect();
    const fontSize = px(t.fontSize);
    texts.push({
      characters: textNode.textContent.trim(),
      family: t.fontFamily,
      size: fontSize,
      weight: Number(t.fontWeight),
      lineHeight:
        t.lineHeight === "normal"
          ? Math.round(lineBox.height * 100) / 100
          : px(t.lineHeight),
      tracking: t.letterSpacing === "normal" ? 0 : px(t.letterSpacing),
      decoration:
        t.textDecorationLine === "none"
          ? "none"
          : t.textDecorationLine.split(" ")[0],
      color: hex(t.color),
    });
  }
  return { box: boxMetrics, texts };
}

async function main() {
  const args = process.argv.slice(2);
  const baseIndex = args.indexOf("--base");
  const base = baseIndex >= 0 ? args[baseIndex + 1] : "http://localhost:6006";
  const file = args.find(
    (a, i) => !a.startsWith("--") && args[i - 1] !== "--base"
  );
  if (!file) {
    console.error(
      "usage: node scripts/figma/harvest-ui.mjs figma-metrics.json [--base url] > code-metrics.json"
    );
    process.exit(2);
  }
  const config = JSON.parse(
    fs.readFileSync(path.join(root, "scripts/figma/compare-ui.config.json"), "utf8")
  );
  const figma = JSON.parse(fs.readFileSync(file, "utf8"));
  const mode = figma.mode ?? "light";
  const { chromium } = createRequire(
    path.join(root, "apps/storybook/package.json")
  )("playwright");
  const browser = await chromium.launch();
  const items = [];
  const skipped = [];
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  for (const item of figma.items ?? []) {
    // a part ("<variant> :: <part>") is harvested with its parent variant, through `parts`
    if (item.variant.includes(" :: ")) continue;
    const component = config.components[item.set];
    if (!component) {
      skipped.push(`${item.set}: not in compare-ui.config.json`);
      continue;
    }
    const props = parseVariant(item.variant);
    const state = component.state ? props[component.state] : undefined;
    if (
      state &&
      !["default", "hover", "pressed"].includes(state) &&
      !component.stateArgs?.[state]
    ) {
      skipped.push(
        `${item.set} ${item.variant}: state ${state} is not hover or pressed`
      );
      continue;
    }
    // a root may name a Figma property in braces, e.g. [data-variant={variant}], for a story that
    // draws every variant side by side
    const root = component.root.replace(/\{(\w+)\}/g, (_, k) => props[k] ?? "");
    await page.goto(storyUrl(base, component, props, mode));
    try {
      // attached, not visible: a w-full element in a shrink-wrapped story (Progress) has no width
      await page.waitForSelector(root, {
        timeout: 8000,
        state: "attached",
      });
    } catch {
      skipped.push(
        `${item.set} ${item.variant}: nothing matched ${root}`
      );
      continue;
    }
    await page.waitForTimeout(250);
    if (state === "hover" || state === "pressed") {
      await page.hover(root);
      if (state === "pressed") await page.mouse.down();
      // longer than the transition (150ms) so the settled style is measured
      await page.waitForTimeout(450);
    }
    const measured = await page.evaluate(measureInPage, root);
    if (state === "pressed") await page.mouse.up();
    await page.mouse.move(0, 0);
    if (!measured) {
      skipped.push(
        `${item.set} ${item.variant}: no element for ${root}`
      );
      continue;
    }
    items.push({ set: item.set, variant: item.variant, ...measured });
    // Named inner layers (Slider's track, range and thumb): each is measured on its own and
    // compared against the Figma descendant of the same name ("<variant> :: <part>").
    for (const [part, selector] of Object.entries(component.parts ?? {})) {
      const inner = await page.evaluate(
        measureInPage,
        selector.replace(/\{(\w+)\}/g, (_, k) => props[k] ?? "")
      );
      if (!inner) {
        skipped.push(`${item.set} ${item.variant} :: ${part}: no element for ${selector}`);
        continue;
      }
      items.push({ set: item.set, variant: `${item.variant} :: ${part}`, ...inner });
    }
  }
  await browser.close();
  for (const s of skipped) console.error(`skipped: ${s}`);
  process.stdout.write(JSON.stringify({ mode, base, items }, null, 2) + "\n");
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main();
