// Wires hover and press transitions onto component sets that already exist (Plan 137), so a
// rebuild of the whole library is not needed to get them. The body of one `use_figma` call; it
// WRITES (reactions, and the link underline), so run it only when the owner has said to.
//
// It does what the builder's applyStateReactions does, from the same variables:
//   Default -> Hover on hover, Default -> Pressed on press, Hover -> Pressed on press,
//   each CHANGE_TO with Smart Animate, with the duration and curve of the library's
//   transition/duration/fast and transition/easing/default. Figma takes literals there, so they
//   are read from the variables now; run this again after the tokens change.
// A link's hover and pressed labels also get their underline (code: hover:underline), set after
// the text styles, which have no decoration.
//
// It refuses to guess: unless both variables are native TIMING and EASING (Pull the tokens with
// the current Token Bridge first) it changes nothing and says why. Re-running is safe: each
// variant's reactions are replaced, not added to.
const PAGE_NAME = "Components";
const SET_NAMES = ["Button"];
const STATE_DURATION = "transition/duration/fast";
const STATE_EASING = "transition/easing/default";

const page = figma.root.children.find((p) => p.name === PAGE_NAME);
if (!page) throw new Error(`No page named ${PAGE_NAME}`);
await figma.setCurrentPageAsync(page);

const vars = await figma.variables.getLocalVariablesAsync();
const byId = Object.fromEntries(vars.map((v) => [v.id, v]));
const named = (n) => vars.find((v) => v.name === n);
const valueOf = (variable, depth = 0) => {
  if (!variable || depth > 10) return null;
  const v = variable.valuesByMode[Object.keys(variable.valuesByMode)[0]];
  return v && typeof v === "object" && v.type === "VARIABLE_ALIAS"
    ? valueOf(byId[v.id], depth + 1)
    : (v ?? null);
};

const durationVar = named(STATE_DURATION);
const easingVar = named(STATE_EASING);
if (
  !durationVar ||
  !easingVar ||
  durationVar.resolvedType !== "TIMING" ||
  easingVar.resolvedType !== "EASING"
) {
  return {
    changed: 0,
    reason: `${STATE_DURATION} is ${durationVar?.resolvedType ?? "missing"} and ${STATE_EASING} is ${easingVar?.resolvedType ?? "missing"}; they must be TIMING and EASING. Rebuild and re-import Token Bridge, then Pull.`,
  };
}
const seconds = valueOf(durationVar);
const curve = valueOf(easingVar);
if (typeof seconds !== "number" || !curve?.easingFunctionCubicBezier) {
  return {
    changed: 0,
    reason: "the duration or easing value could not be read",
  };
}
const transition = {
  type: "SMART_ANIMATE",
  easing: {
    type: "CUSTOM_CUBIC_BEZIER",
    easingFunctionCubicBezier: curve.easingFunctionCubicBezier,
  },
  duration: seconds,
};

// A text node's font must be loaded before it is edited (Figma throws otherwise).
const loadFontsOf = async (node) => {
  for (const seg of node.getStyledTextSegments(["fontName"])) {
    await figma.loadFontAsync(seg.fontName);
  }
};

const parse = (name) => {
  const props = {};
  for (const part of name.split(",")) {
    const i = part.indexOf("=");
    if (i > 0) props[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return props;
};

let wired = 0;
let underlined = 0;
let cleared = 0;
const log = [];
for (const set of page.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
  if (!SET_NAMES.includes(set.name)) continue;
  // An underline that spread to the styled labels (see below) is removed first: setting NONE on
  // one styled label clears it on every label that shares the text property.
  const styledLabel = set
    .findAll((n) => n.type === "TEXT" && n.textStyleId)
    .find((n) => n.textDecoration !== "NONE");
  if (styledLabel) {
    await loadFontsOf(styledLabel);
    styledLabel.textDecoration = "NONE";
    cleared++;
  }
  // variants grouped by everything except their state
  const groups = new Map();
  for (const variant of set.children) {
    const props = parse(variant.name);
    // `state`, or `interaction` where `state` already names something else
    const axis = props.state !== undefined ? "state" : "interaction";
    if (props[axis] === undefined) continue;
    const { [axis]: state, ...rest } = props;
    const key = JSON.stringify(rest);
    if (!groups.has(key)) groups.set(key, {});
    groups.get(key)[state] = variant;
  }
  const change = (dest, trigger) => ({
    trigger: { type: trigger },
    actions: [
      {
        type: "NODE",
        destinationId: dest.id,
        navigation: "CHANGE_TO",
        transition,
        resetVideoPosition: false,
      },
    ],
  });
  for (const [key, g] of groups) {
    if (!g.default) continue;
    const rest = JSON.parse(key);
    const base = [];
    if (g.hover) base.push(change(g.hover, "ON_HOVER"));
    if (g.pressed) base.push(change(g.pressed, "ON_PRESS"));
    await g.default.setReactionsAsync(base);
    wired += base.length;
    if (g.hover && g.pressed) {
      await g.hover.setReactionsAsync([change(g.pressed, "ON_PRESS")]);
      wired += 1;
    }
    if (rest.variant === "link") {
      for (const state of ["hover", "pressed"]) {
        const variant = g[state];
        if (!variant) continue;
        const label = variant.findAll(
          (n) => n.type === "TEXT" && n.visible !== false
        )[0];
        if (!label) continue;
        // Clear the label's text style, then underline it. On a label WITH a style a
        // decoration set on one spreads to every label sharing the Button's text property
        // (60 of 60 were underlined on the rebuilt library), so these labels carry no style.
        await loadFontsOf(label);
        await label.setTextStyleIdAsync("");
        const offset = named("button/link-underline-offset");
        label.textDecoration = "UNDERLINE";
        if (offset && typeof valueOf(offset) === "number") {
          label.textDecorationOffset = {
            unit: "PIXELS",
            value: valueOf(offset),
          };
        }
        underlined++;
      }
    }
  }
  log.push(`${set.name}: ${groups.size} variant groups`);
}
return { changed: wired + underlined, wired, underlined, cleared, transition, log };
