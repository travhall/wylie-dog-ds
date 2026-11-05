#!/usr/bin/env node
// Hand-run check of the component builder against the text style definitions
// (Plan 208). Not part of CI: the builder is gitignored and only exists in the
// owner's checkout, so with no file this prints a note and exits 0.
//
//   node scripts/check-builder-coverage.mjs [path/to/code.js]
//
// It runs the builder's build functions under a stubbed `figma`, records every
// makeText call, and reports which text layers resolve to a style in
// packages/tokens/io/styles/text-styles.json by their font-size token (the way
// the builder looks styles up), which do not and why, how many of the
// definitions the builder uses, and the token names its getVar calls could not
// resolve. Run it after changing the builder or the tokens.

import fs from "node:fs";
import vm from "node:vm";
import { DEFINITIONS_FILE, readSyncTokens } from "./text-styles.mjs";

const BUILDER =
  process.argv[2] ?? "apps/figma-plugin/wylie-dog-figma-builder/code.js";
if (!fs.existsSync(BUILDER)) {
  console.log(`No builder at ${BUILDER}; nothing to check.`);
  process.exit(0);
}

const tokens = readSyncTokens();
const defs = JSON.parse(fs.readFileSync(DEFINITIONS_FILE, "utf8")).styles;
const byFontSize = new Map(defs.map((d) => [d.fontSize, d]));

let source = fs.readFileSync(BUILDER, "utf8");
const builders = [...source.matchAll(/return (build\w+)\(xCursor, Y\)/g)].map(
  (m) => m[1]
);
source = source.replace(/\nmain\(\);\s*$/, "\n");

// A stand-in for `figma`: every property is another stand-in, calls return one,
// and arithmetic sees 0.
const stub = () =>
  new Proxy(function () {}, {
    get: (_t, p) =>
      p === Symbol.toPrimitive ? () => 0 : p === "then" ? undefined : stub(),
    apply: () => stub(),
    construct: () => stub(),
    set: () => true,
  });

const context = {
  console: { log() {}, warn() {}, error() {} },
  figma: stub(),
};
vm.createContext(context);
vm.runInContext(source, context);

// Variables named the way the sync names them: "button.font-size.sm" is the
// variable "button/font-size/sm".
context.varMap = {};
for (const path of tokens.keys()) {
  const variable = { id: path, name: path.replace(/\./g, "/") };
  context.varMap[variable.name] = variable;
  context.varMap[path] = variable;
}

const unresolved = new Set();
const realGetVar = context.getVar;
context.getVar = (name) => {
  const found = realGetVar(name);
  if (!found) unresolved.add(name);
  return found;
};

// Plan 217: a border colour with no border-width token leaves the stroke weight
// unbound. bindStroke derives the width token through borderWidthFor, so a null
// answer is an unbound stroke weight.
const unboundStrokes = new Set();
const realBorderWidthFor = context.borderWidthFor;
context.borderWidthFor = (colorVariable) => {
  const found = realBorderWidthFor(colorVariable);
  if (!found) unboundStrokes.add(colorVariable.name);
  return found;
};

let current = "";
const layers = [];
context.makeText = (characters, styleName, fontSizeVar) => {
  layers.push({
    builder: current,
    characters,
    styleName,
    token: fontSizeVar ? context.tokenPathOf(fontSizeVar) : null,
  });
  return stub();
};

const errors = [];
for (const name of builders) {
  current = name;
  try {
    context[name](0, 0);
  } catch (error) {
    errors.push(`${name}: ${error.message}`);
  }
}

const matched = layers.filter((l) => l.token && byFontSize.has(l.token));
const unmatched = layers.filter((l) => !(l.token && byFontSize.has(l.token)));
const used = new Set(matched.map((l) => byFontSize.get(l.token).name));

console.log(`Builders run: ${builders.length}, errors: ${errors.length}`);
for (const e of errors) console.log(`  ${e}`);
console.log(
  `Text layers: ${layers.length}, with a style: ${matched.length}, without: ${unmatched.length}`
);
console.log(`Definitions used: ${used.size} of ${defs.length}`);

const reasons = new Map();
for (const l of unmatched) {
  const reason = !l.token
    ? "no font-size token passed"
    : tokens.has(l.token)
      ? "a font-size token with no definition"
      : "not a token";
  const key = `${l.builder} ${l.styleName} (${reason}${l.token ? `: ${l.token}` : ""})`;
  reasons.set(key, (reasons.get(key) ?? 0) + 1);
}
if (reasons.size > 0) {
  console.log("\nLayers with no style (they keep direct bindings):");
  for (const [key, n] of reasons) console.log(`  ${key} x${n}`);
}

const unusedDefs = defs.filter((d) => !used.has(d.name)).map((d) => d.name);
if (unusedDefs.length > 0) {
  console.log(`\nDefinitions the builder never uses: ${unusedDefs.join(", ")}`);
}
if (unresolved.size > 0) {
  console.log(
    `\ngetVar names that do not resolve: ${[...unresolved].sort().join(", ")}`
  );
}
// Plan 217: raw numbers the builder assigns to gap, padding and corner radius stay
// unbound. Each budget is the count of sites the owner decided may stay; a new raw
// number fails the check. Corner radius 9999 is the pill fallback used only when the
// radius variable is missing. Figma follows code (owner, 2026-11-04): layout the UI does
// not have is not drawn, so gap is 0 sites. Allowed sites:
//   padding 4  Form input frame 8/16: a fallback, bound right after to
//              input/padding-y/md and input/padding-x
//   radius 3   Checkbox dash 1, Section Features glyph 4, icon fallback 2: drawn marks
// Not counted: menu item stacks (gap 0, as code), the Command input (binds
// command/item-padding-x), the Menubar bar-to-menu gap (binds menubar/content-side-offset),
// and computed values such as the Carousel button gap (a difference of two tokens).
const RAW_BUDGET = { gap: 0, padding: 4, radius: 3 };
const rawCount = (pattern) => [...source.matchAll(pattern)].length;
const raw = {
  gap: rawCount(/\.itemSpacing\s*=\s*[1-9][\d.]*\s*;/g),
  padding: rawCount(
    /\.padding(?:Left|Right|Top|Bottom)\s*=\s*[1-9][\d.]*\s*;/g
  ),
  radius: rawCount(/\.cornerRadius\s*=\s*(?!9999\b)[1-9][\d.]*\s*;/g),
};
console.log(
  `\nUnbound values: strokes with no border-width token ${unboundStrokes.size}` +
    (unboundStrokes.size ? ` (${[...unboundStrokes].sort().join(", ")})` : "")
);
for (const [kind, count] of Object.entries(raw)) {
  console.log(
    `  raw ${kind} assignments: ${count} (budget ${RAW_BUDGET[kind]})`
  );
  if (count > RAW_BUDGET[kind]) {
    errors.push(
      `raw ${kind} assignments ${count} exceed the budget ${RAW_BUDGET[kind]}`
    );
  }
}
// Plan 217 (J3): every content property of the builder must find a text layer. The
// stub cannot add properties, so check that each style pattern matches a style name
// the builders pass to makeText.
const specs = context.CONTENT_PROPERTIES ?? {};
const styleNames = new Set(layers.map((l) => l.styleName));
let contentProps = 0;
for (const [set, props] of Object.entries(specs)) {
  for (const [prop, pattern] of props) {
    contentProps++;
    if (![...styleNames].some((n) => new RegExp(pattern).test(n))) {
      const message = `content property ${set}.${prop}: no text layer matches ${pattern}`;
      console.log(message);
      errors.push(message);
    }
  }
}
console.log(
  `\nContent properties: ${contentProps} in ${Object.keys(specs).length} sets, each matches a text layer unless listed above`
);

// Plan 217: every icon kind a builder draws must be a glyph of the Icon set, or makeIcon falls
// back to a hand-drawn frame and the icon is not an instance of the master.
const glyphs = new Set(Object.keys(context.ICON_SVG ?? {}));
const kinds = new Set(
  [...source.matchAll(/makeIcon\(\s*"([a-z-]+)"/g)].map((m) => m[1])
);
for (const kind of kinds) {
  if (!glyphs.has(kind)) {
    const message = `makeIcon draws "${kind}", which is not a glyph of the Icon set`;
    console.log(message);
    errors.push(message);
  }
}
console.log(
  `\nIcon glyphs: ${glyphs.size} in the Icon set; ${kinds.size} kinds drawn by the builders, all present`
);

// Plan 137: hover and press. A set with a state axis is queued, and after the sets exist
// the builder connects Default to Hover and Pressed, and Hover to Pressed, with Smart
// Animate. Check the plan on the real Button configuration, then run the wiring against
// fake variables carrying the real token values (the stub cannot make real nodes).
const stateSets = context.pendingStateSets ?? [];
let stateWired = 0;
if (stateSets.length === 0) {
  errors.push("no component set queued for hover and press reactions");
}
const tokenSeconds = (path) => parseFloat(tokens.get(path)?.$value) / 1000;
const tokenBezier = (path) => {
  const m = /cubic-bezier\(([^)]*)\)/.exec(tokens.get(path)?.$value ?? "");
  const [x1, y1, x2, y2] = (m ? m[1] : "0,0,0,0").split(",").map(parseFloat);
  return { x1, y1, x2, y2 };
};
const fakeVariables = (durationType, easingType) => ({
  "transition/duration/fast": {
    resolvedType: durationType,
    valuesByMode: {
      m:
        durationType === "TIMING"
          ? tokenSeconds("transition.duration.fast")
          : "150ms",
    },
  },
  "transition/easing/default": {
    resolvedType: easingType,
    valuesByMode: {
      m:
        easingType === "EASING"
          ? {
              type: "CUSTOM_CUBIC_BEZIER",
              easingFunctionCubicBezier: tokenBezier(
                "transition.easing.default"
              ),
            }
          : "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
});
const fakeSet = (props) => ({
  children: props.map((p, i) => ({
    name: context.variantNameOf(p),
    id: `variant-${i}`,
    reactions: null,
    setReactionsAsync(r) {
      this.reactions = r;
      return Promise.resolve();
    },
  })),
});
for (const entry of stateSets) {
  const plan = context.stateReactionPlan(entry.props);
  // What to expect comes from the set's own variants: within each group (every property but
  // state) Default goes to Hover and to Pressed where those exist, and Hover to Pressed where
  // both do. A set may have only some of the states (Toggle and Input have no Pressed).
  const groupsOf = new Map();
  // The axis is `state`, or `interaction` where `state` already names something else
  entry.props.forEach((p) => {
    const axis = context.interactionAxis(p);
    if (!axis) return;
    const key = context.variantNameOf({ ...p, [axis]: "" });
    if (!groupsOf.has(key)) groupsOf.set(key, {});
    groupsOf.get(key)[p[axis]] = true;
  });
  let expectedSteps = 0;
  for (const g of groupsOf.values()) {
    if (!g.default) continue;
    expectedSteps +=
      (g.hover ? 1 : 0) + (g.pressed ? 1 : 0) + (g.hover && g.pressed ? 1 : 0);
  }
  if (plan.length !== expectedSteps) {
    errors.push(
      `state plan has ${plan.length} steps, expected ${expectedSteps} from the variants' own states`
    );
  }
  for (const step of plan) {
    const from = entry.props[step.from];
    const to = entry.props[step.to];
    if (from.disabled === "true" || to.disabled === "true") {
      errors.push("a disabled variant is wired to a state");
    }
  }
  // the wiring itself, against fake variables with the real values
  const real = context.getVar;
  const realPending = context.pendingStateSets;
  context.getVar = (n) => fakeVariables("TIMING", "EASING")[n] ?? null;
  const set = fakeSet(entry.props);
  context.pendingStateSets = [{ set, props: entry.props }];
  const result = await context.applyStateReactions();
  stateWired += result.wired;
  if (result.wired !== plan.length || result.skipped) {
    errors.push(
      `state wiring wired ${result.wired} of ${plan.length}${result.skipped ? `, skipped: ${result.skipped}` : ""}`
    );
  }
  const wantSeconds = tokenSeconds("transition.duration.fast");
  const wantCurve = tokenBezier("transition.easing.default");
  for (const comp of set.children) {
    for (const r of comp.reactions ?? []) {
      const t = r.actions[0].transition;
      const c = t.easing.easingFunctionCubicBezier;
      if (
        r.actions[0].navigation !== "CHANGE_TO" ||
        t.type !== "SMART_ANIMATE" ||
        t.duration !== wantSeconds ||
        c.x1 !== wantCurve.x1 ||
        c.y1 !== wantCurve.y1 ||
        c.x2 !== wantCurve.x2 ||
        c.y2 !== wantCurve.y2
      ) {
        errors.push(
          `${comp.name}: a state reaction does not use the token duration and curve`
        );
      }
    }
  }
  const byName = Object.fromEntries(set.children.map((c) => [c.name, c]));
  for (const p of entry.props) {
    const comp = byName[context.variantNameOf(p)];
    const n = (comp.reactions ?? []).length;
    const axis = context.interactionAxis(p);
    const g =
      groupsOf.get(context.variantNameOf({ ...p, [axis]: "" })) ?? {};
    const want =
      p[axis] === "default"
        ? (g.hover ? 1 : 0) + (g.pressed ? 1 : 0)
        : p[axis] === "hover" && g.default && g.pressed
          ? 1
          : 0;
    if (n !== want) {
      errors.push(`${comp.name} has ${n} reactions, expected ${want}`);
    }
  }
  // not native yet: no guessing, and nothing is wired
  context.getVar = (n) => fakeVariables("STRING", "STRING")[n] ?? null;
  context.pendingStateSets = [
    { set: fakeSet(entry.props), props: entry.props },
  ];
  const skippedRun = await context.applyStateReactions();
  if (skippedRun.wired !== 0 || !skippedRun.skipped.includes("TIMING")) {
    errors.push(
      "state wiring did not skip when the motion variables are not native"
    );
  }
  context.getVar = real;
  context.pendingStateSets = realPending;
}
console.log(
  `\nState reactions: ${stateSets.length} set with a state axis, ${stateWired} transitions wired from the token duration and curve; skipped, with a reason, when the variables are not native`
);

// The link underlines on hover and press (code: hover:underline). The labels of a Button share
// one text property, and on a label that carries a text style a decoration set on one spreads
// to all of them (found on the rebuilt library, 2026-11-05: 60 of 60 labels underlined). So the
// link's hover and pressed labels deliberately carry no text style and are underlined
// directly; each is reported as an unstyled layer with the reason. Every other label keeps its
// style.
{
  const props = (context.pendingStateSets ?? []).flatMap((s) => s.props);
  const wanted = props.filter(
    (p) =>
      p.variant === "link" &&
      p.size !== "icon" &&
      (p.state === "hover" || p.state === "pressed")
  ).length;
  const unstyled = (context.unstyledLayers ?? []).filter((u) =>
    /link underline/.test(u.token)
  ).length;
  if (unstyled !== wanted) {
    errors.push(
      `${unstyled} link labels are left unstyled for the underline, expected ${wanted} (hover and pressed, every size with a label)`
    );
  }
  if (/pendingUnderlines|applyPendingUnderlines/.test(source)) {
    errors.push(
      "the underline must not be applied through the text styles: it would spread to every Button label"
    );
  }
  // an unstyled label falls back to AUTO line height (24 against 16 at md), so the button
  // would grow on hover; the builder sets button.line-height on it directly
  if (!/label\.lineHeight\s*=\s*\{\s*unit:\s*"PERCENT",\s*value:\s*linkLineHeight\s*\}/.test(source)) {
    errors.push(
      "the unstyled link hover and pressed labels must set lineHeight themselves, or the button grows on hover"
    );
  }
  console.log(
    `\nLink underlines: ${unstyled} hover and pressed labels carry no text style so the underline stays on them`
  );
}

// Names live on real nodes, which the stub cannot see: check that main() runs the
// naming pass; scripts/figma/audit-library.js counts default names in the file.
if (!/nameDefaultLayers\(built\)/.test(source)) {
  errors.push("main() does not call nameDefaultLayers(built)");
}
if (unboundStrokes.size) {
  errors.push(
    `${unboundStrokes.size} border colour(s) with no border-width token`
  );
}
if (errors.length > 0) {
  console.error(`\nFailed (${errors.length}):`);
  for (const e of new Set(errors)) console.error(`  ${e}`);
}
process.exit(errors.length > 0 ? 1 : 0);
