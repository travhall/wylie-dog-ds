// ============================================================
// Wylie Dog Component Builder — Figma Plugin v39
// Plan 208: this builder creates NO text styles. Token Bridge owns them.
// Run order for a file: Token Bridge Pull with "Text styles" ticked first,
// then this builder. Each text layer gets the Token Bridge style whose
// fontSizeToken link equals the layer's font-size token (see
// apps/figma-plugin/README.md). With no Token Bridge styles in the file the
// run stops before building anything. Layers with no matching style (a literal
// null font size, or a token with no definition) keep direct variable bindings
// and are listed at the end of the run.
// Token Bridge never depends on this builder; this builder depends on Token
// Bridge's Pull.
// ============================================================

var TARGET_PAGE_NAME = null;
var varMap = {};
var primitiveValues = {};
// Token Bridge's text styles, by the dotted path of their font-size token
// (shared plugin data "fontSizeToken"), e.g. "button.font-size.sm".
var styleByFontSizeToken = {};
// Plan 217: the variable each Token Bridge text style binds its font family to (sans, or
// a component token such as badge/font-family), by style id.
var familyVarByStyleId = {};
// Text layers that got no style: { layer, token } for the end-of-run report.
var unstyledLayers = [];

// Text layers waiting for their text style. The style is applied in an async
// pass at the end of main() (Plan 205): the manifest sets documentAccess
// "dynamic-page", where the synchronous `node.textStyleId = id` setter fails
// (and only logged), while `await node.setTextStyleIdAsync(id)` works.
var pendingTextStyles = [];

// Component sets with a hover/pressed state axis, waiting for their prototype reactions
// (Plan 137). The reactions are set in an async pass at the end of main(), after the sets
// exist: { set, props } where props lists each variant's properties.
var pendingStateSets = [];

// Every variable by id, for following an alias (the sync getVariableById is not
// available under documentAccess dynamic-page).
var variableById = {};

// Shared plugin data on text styles. Namespace and keys are the contract with
// Token Bridge (apps/figma-plugin/src/plugin/variables/text-style-links.ts):
// "definition" marks a style Token Bridge manages, "fontSizeToken" holds the
// dotted path of its font-size token (Plan 208), e.g. "button.font-size.sm".
var LINK_NAMESPACE = "wylie_dog";
var LINK_DEFINITION = "definition";
var LINK_FONT_SIZE = "fontSizeToken";

// Same transform Token Bridge uses to name a token from its variable
// ("Button/Line Height" becomes "button.line-height").
function tokenPathOf(variable) {
  return variable.name
    .toLowerCase()
    .replace(/[\/\s]+/g, ".")
    .replace(/[^a-z0-9.-]/g, "");
}

// ============================================================
// INITIALIZATION
// ============================================================

async function initialize() {
  var allVars = await figma.variables.getLocalVariablesAsync();
  for (var i = 0; i < allVars.length; i++) {
    var v = allVars[i];
    varMap[v.name] = v;
    varMap[v.name.replace(/\//g, ".")] = v;
    variableById[v.id] = v;
  }

  var collections = await figma.variables.getLocalVariableCollectionsAsync();
  var modeMap = {};
  for (var c = 0; c < collections.length; c++) {
    var col = collections[c];
    var firstModeId = col.modes[0].modeId;
    for (var v2 = 0; v2 < col.variableIds.length; v2++) {
      modeMap[col.variableIds[v2]] = firstModeId;
    }
  }

  var varById = {};
  for (var i2 = 0; i2 < allVars.length; i2++) {
    varById[allVars[i2].id] = allVars[i2];
  }

  for (var i3 = 0; i3 < allVars.length; i3++) {
    primitiveValues[allVars[i3].id] = resolveToNumber(
      allVars[i3],
      modeMap,
      varById,
      0
    );
  }

  // Index Token Bridge's text styles by their font-size token. Only styles
  // carrying the "definition" marker count; a designer's own styles are not
  // ours to apply. The first style wins if two claim the same token.
  var existingStyles = await figma.getLocalTextStylesAsync();
  for (var s = 0; s < existingStyles.length; s++) {
    var st = existingStyles[s];
    if (!st.getSharedPluginData(LINK_NAMESPACE, LINK_DEFINITION)) continue;
    var sizeToken = st.getSharedPluginData(LINK_NAMESPACE, LINK_FONT_SIZE);
    if (!sizeToken) continue;
    if (styleByFontSizeToken[sizeToken]) {
      console.warn("Two text styles claim " + sizeToken + "; using " + styleByFontSizeToken[sizeToken].name);
      continue;
    }
    styleByFontSizeToken[sizeToken] = st;
    var familyBinding = st.boundVariables && st.boundVariables.fontFamily;
    if (familyBinding) {
      var familyVariable = await figma.variables.getVariableByIdAsync(familyBinding.id);
      if (familyVariable) familyVarByStyleId[st.id] = familyVariable;
    }
  }

  console.log(
    "Initialized: " +
      allVars.length +
      " variables, " +
      existingStyles.length +
      " text styles"
  );
}

function resolveToNumber(variable, modeMap, varById, depth) {
  if (depth > 10 || !variable) return null;
  var modeId = modeMap[variable.id];
  if (!modeId) return null;
  var val = variable.valuesByMode[modeId];
  if (val === undefined || val === null) return null;
  if (typeof val === "object" && val.type === "VARIABLE_ALIAS") {
    return resolveToNumber(varById[val.id], modeMap, varById, depth + 1);
  }
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    var parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

function resolvedValue(variable) {
  if (!variable) return null;
  var val = primitiveValues[variable.id];
  return val !== undefined ? val : null;
}

function getVar(tokenPath) {
  return varMap[tokenPath] || varMap[tokenPath.replace(/\//g, ".")] || null;
}

function resolveSpace(variable) {
  var v = resolvedValue(variable);
  return v !== null ? v : 0;
}
function resolveRadius(variable) {
  var v = resolvedValue(variable);
  return v !== null ? v : 4;
}
function resolveFontSize(variable) {
  var v = resolvedValue(variable);
  return v !== null ? v : 16;
}
function resolveFontWeight(variable) {
  var v = resolvedValue(variable);
  return v !== null ? v : 400;
}
function resolveToken(tokenPath) {
  return resolvedValue(getVar(tokenPath));
}

function fontStyleFromWeight(weight) {
  if (weight >= 800) return "ExtraBold";
  if (weight >= 700) return "Bold";
  if (weight >= 600) return "SemiBold";
  if (weight >= 500) return "Medium";
  if (weight >= 300) return "Light";
  return "Regular";
}

// ============================================================
// BINDING HELPERS
// ============================================================

// The paint's stored colour should match what the variable resolves to:
// Figma's editor resolves the binding live, but previews, exports and code
// generation read the stored colour (a 0.1 grey placeholder read as dark
// text on every solid fill).
function resolvedPaintColor(variable, node, fallback) {
  try {
    var rv = variable.resolveForConsumer(node);
    if (rv && rv.resolvedType === "COLOR" && rv.value) {
      return { r: rv.value.r, g: rv.value.g, b: rv.value.b };
    }
  } catch (e) {}
  return fallback;
}

function bindFill(node, variable) {
  if (!variable) return;
  try {
    var alias = figma.variables.createVariableAlias(variable);
    node.fills = [
      {
        type: "SOLID",
        color: resolvedPaintColor(variable, node, { r: 0.8, g: 0.8, b: 0.8 }),
        boundVariables: { color: alias },
      },
    ];
  } catch (e) {
    console.warn("bindFill: " + e.message);
  }
}

// Plan 217: a border colour token "card/border" names its component, whose width
// token is "card/border-width". Colour prefixes that differ from the width token's
// prefix are listed here.
var BORDER_WIDTH_PREFIX = { navigation: "navigation-menu" };
function borderWidthFor(colorVariable) {
  var prefix = tokenPathOf(colorVariable).split(".")[0];
  prefix = BORDER_WIDTH_PREFIX[prefix] || prefix;
  return (
    varMap[prefix + "/border-width"] ||
    varMap[prefix + "/border/width"] ||
    null
  );
}

// widthVariable: a variable, null to derive it from the colour token, false for none
function bindStroke(node, colorVariable, widthVariable) {
  if (!colorVariable) return;
  if (widthVariable === null || widthVariable === undefined) {
    widthVariable = borderWidthFor(colorVariable);
  }

  // Set numeric strokeWeight from token, fallback to 1
  var strokeWeight = 1;
  if (widthVariable) {
    var resolved = resolvedValue(widthVariable);
    if (resolved !== null) strokeWeight = resolved;
  }
  node.strokeWeight = strokeWeight;
  node.strokeAlign = "INSIDE";

  // Set stroke paint first (stored colour = what the variable resolves to,
  // see resolvedPaintColor), then bind color variable
  node.strokes = [
    {
      type: "SOLID",
      color: resolvedPaintColor(colorVariable, node, { r: 0.5, g: 0.5, b: 0.5 }),
    },
  ];
  try {
    node.setBoundVariable("strokes", 0, colorVariable);
  } catch (e) {
    try {
      var alias = figma.variables.createVariableAlias(colorVariable);
      node.strokes = [
        {
          type: "SOLID",
          color: { r: 0.5, g: 0.5, b: 0.5 },
          boundVariables: { color: alias },
        },
      ];
    } catch (e2) {
      console.warn("bindStroke color: " + e2.message);
    }
  }

  // Bind strokeWeight variable
  if (widthVariable) {
    try {
      node.setBoundVariable("strokeWeight", widthVariable);
    } catch (e) {}
  }
}

// A bound colour carries no alpha, so alpha on a bound fill (bg-(--token)/10) is paint opacity. Moving
// a node under a section with explicit variable modes re-resolves its bound paints and resets that
// opacity to 1, so each alpha fill is recorded and applied again once everything is arranged.
var alphaFills = [];
function setFillAlpha(node, alpha) {
  try {
    var f = node.fills;
    if (f && f[0]) {
      var c = JSON.parse(JSON.stringify(f[0]));
      c.opacity = alpha;
      node.fills = [c];
    }
  } catch (e) {
    console.warn("fill alpha: " + e.message);
  }
}
function applyFillAlpha(node, alpha) {
  alphaFills.push({ node: node, alpha: alpha });
  setFillAlpha(node, alpha);
}
function reapplyFillAlphas() {
  for (var i = 0; i < alphaFills.length; i++) {
    if (!alphaFills[i].node.removed) setFillAlpha(alphaFills[i].node, alphaFills[i].alpha);
  }
}

// Changing the Card's own tile refreshes the layers of its instances, so a reference taken earlier
// to an instance tile goes stale. The Section Features card tiles are found again here, after
// every master alpha is in place, and get the 10% tint as an override of their own.
function reapplyCardInstanceTileAlphas() {
  var set = builtSetNodes["Section Features"];
  if (!set) return;
  var cards = set.findAll(function (n) {
    return n.type === "INSTANCE" && n.name === "card";
  });
  for (var i = 0; i < cards.length; i++) {
    var t = cards[i].findOne(function (n) {
      return n.name === "icon" && n.type === "FRAME";
    });
    if (t) setFillAlpha(t, 0.1);
  }
}

// Real CSS uses border-(--color-x)/10 style alpha, but a bound colour carries
// no alpha: keep the stroke bound and put the alpha on the paint instead.
function setStrokeOpacity(node, alpha) {
  try {
    var st = JSON.parse(JSON.stringify(node.strokes));
    if (st && st[0]) {
      st[0].opacity = alpha;
      node.strokes = st;
    }
  } catch (e) {}
}

// A border-transparent element in code (ghost and link buttons) still takes up its 1px
// border: an invisible stroke of the border width keeps the box the same size in Figma.
function transparentBorder(node, widthVariable) {
  node.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
  node.strokeAlign = "INSIDE";
  var weight = widthVariable ? resolvedValue(widthVariable) : null;
  node.strokeWeight = weight !== null ? weight : 1;
  if (widthVariable) {
    try {
      node.setBoundVariable("strokeWeight", widthVariable);
    } catch (e) {}
  }
}

function clearStrokes(node) {
  node.strokes = [];
  node.strokeWeight = 0;
}

function bindCornerRadius(node, variable) {
  node.cornerRadius = resolveRadius(variable);
  if (!variable) return;
  try {
    node.setBoundVariable("cornerRadius", variable);
  } catch (e) {}
}

// Bind width and/or height variables to a node
function bindSize(node, widthVar, heightVar) {
  if (widthVar) {
    try {
      node.setBoundVariable("width", widthVar);
    } catch (e) {}
  }
  if (heightVar) {
    try {
      node.setBoundVariable("height", heightVar);
    } catch (e) {}
  }
}

// Apply opacity variable or resolved value
function bindOpacity(node, variable) {
  if (!variable) return;
  // Set the number, do not bind it: a bound opacity variable is read as a
  // percent, so the token value 0.7 became 0.7% (icons at opacity 0.007).
  var val = resolvedValue(variable);
  if (val !== null) node.opacity = val > 1 ? val / 100 : val;
}

// Bind a numeric auto-layout / radius property to a token variable (value is already set)
// Disabled is a real persistent prop state (the `disabled` attribute). It is drawn with
// the control's normal tokens and dimmed to the component's opacity-disabled value
// (owner decision 2026-11-10, Plan 223): the disabled colour tokens are gone, so
// pickDisabled returns the normal token whatever the state. The dimming is applied to
// the disabled variants afterwards by applyDisabledOpacity.
function pickDisabled(disabled, normalPath, disabledPath) {
  return getVar(normalPath);
}

// Opacity of a disabled control. Every component token is {opacity.60} except
// calendar.nav-opacity-disabled (30%). The tokens are hidden from Figma (a bound opacity
// variable is read as a percent), so the number is set, not bound.
var DISABLED_OPACITY = 0.6;
function applyDisabledOpacity(set) {
  if (set.name === "Carousel") return 0; // its disabled button is dimmed where it is drawn
  var n = 0;
  for (var i = 0; i < set.children.length; i++) {
    var child = set.children[i];
    if (/(^|, )disabled=true(,|$)|(^|, )state=disabled(,|$)/.test(child.name)) {
      child.opacity = DISABLED_OPACITY;
      n++;
    }
  }
  return n;
}

// resize() resets BOTH auto-layout axes to FIXED. The builders set AUTO
// (hug) on the axis they want content-driven and then resize() to give the
// other axis a size, so restore whichever axes were AUTO before the call.
function resizeKeep(node, w, h) {
  var lm = node.layoutMode;
  var p = lm && lm !== "NONE" ? node.primaryAxisSizingMode : null;
  var c = lm && lm !== "NONE" ? node.counterAxisSizingMode : null;
  node.resize(w, h);
  if (p === "AUTO") node.primaryAxisSizingMode = "AUTO";
  if (c === "AUTO") node.counterAxisSizingMode = "AUTO";
}

// Fill the parent's cross axis. layoutAlign = "STRETCH" is ignored on hugging
// frames; layoutSizing FILL is the working form, and only valid once the node
// has an auto-layout parent.
function stretch(node) {
  try {
    var p = node.parent;
    if (!p) return;
    if (p.layoutMode === "VERTICAL") node.layoutSizingHorizontal = "FILL";
    else if (p.layoutMode === "HORIZONTAL") node.layoutSizingVertical = "FILL";
  } catch (e) {}
}

// Real vector icons (lucide geometry, 24 viewBox) instead of solid chips.
// bbox is each path's extent in the 24 box, used to position the vector
// whether Figma normalises the node origin to the path or not.
var ICON_PATHS = {
  "chevron-down": "M6 9 L12 15 L18 9",
  "chevron-right": "M9 18 L15 12 L9 6",
  "chevron-left": "M15 18 L9 12 L15 6",
  x: "M18 6 L6 18 M6 6 L18 18",
  check: "M20 6 L9 17 L4 12",
  heart:
    "M12 21 L5 14 C3.5 12.55 2 10.8 2 8.5 C2 5.46 4.46 3 7.5 3 C9.26 3 10.5 3.5 12 5 C13.5 3.5 14.74 3 16.5 3 C19.54 3 22 5.46 22 8.5 C22 10.8 20.5 12.55 19 14 L12 21 Z",
  search:
    "M3 11 C3 6.582 6.582 3 11 3 C15.418 3 19 6.582 19 11 C19 15.418 15.418 19 11 19 C6.582 19 3 15.418 3 11 Z M21 21 L16.65 16.65",
};
var ICON_BBOX = {
  "chevron-down": { x: 6, y: 9, w: 12, h: 6 },
  "chevron-right": { x: 9, y: 6, w: 6, h: 12 },
  "chevron-left": { x: 9, y: 6, w: 6, h: 12 },
  x: { x: 6, y: 6, w: 12, h: 12 },
  check: { x: 4, y: 6, w: 16, h: 11 },
  heart: { x: 2, y: 3, w: 20, h: 18 },
  search: { x: 3, y: 3, w: 18, h: 18 },
};

var ICON_ORDER = ["heart","chevron-down","chevron-left","chevron-right","x","check","circle","search","ellipsis","grip-vertical","minus","arrow-right","plus","user","settings","bell","calendar","house","link","folder","file","map-pin","bold","italic","info","circle-check","triangle-alert","circle-x"];
var ICON_SVG = {
  "heart": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\"/></svg>",
  "chevron-down": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m6 9 6 6 6-6\"/></svg>",
  "chevron-left": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m15 18-6-6 6-6\"/></svg>",
  "chevron-right": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m9 18 6-6-6-6\"/></svg>",
  "x": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/></svg>",
  "check": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 6 9 17l-5-5\"/></svg>",
  "circle": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/></svg>",
  "search": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m21 21-4.34-4.34\"/><circle cx=\"11\" cy=\"11\" r=\"8\"/></svg>",
  "ellipsis": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"19\" cy=\"12\" r=\"1\"/><circle cx=\"5\" cy=\"12\" r=\"1\"/></svg>",
  "grip-vertical": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"5\" r=\"1\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"19\" r=\"1\"/></svg>",
  "minus": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"/></svg>",
  "arrow-right": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"/><path d=\"m12 5 7 7-7 7\"/></svg>",
  "plus": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"/><path d=\"M12 5v14\"/></svg>",
  "user": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/></svg>",
  "settings": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>",
  "bell": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10.268 21a2 2 0 0 0 3.464 0\"/><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"/></svg>",
  "calendar": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 2v3\"/><path d=\"M16 2v3\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/></svg>",
  "house": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg>",
  "link": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/></svg>",
  "folder": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"/></svg>",
  "file": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"/><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"/></svg>",
  "map-pin": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/></svg>",
  "bold": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8\"/></svg>",
  "italic": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"19\" x2=\"10\" y1=\"4\" y2=\"4\"/><line x1=\"14\" x2=\"5\" y1=\"20\" y2=\"20\"/><line x1=\"15\" x2=\"9\" y1=\"4\" y2=\"20\"/></svg>",
  "info": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/></svg>",
  "circle-check": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m16 9-5.5 5.5L8 12\"/></svg>",
  "triangle-alert": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/><path d=\"M12 9v4\"/><path d=\"M12 17h.01\"/></svg>",
  "circle-x": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m15 9-6 6\"/><path d=\"m9 9 6 6\"/></svg>"
};

// Plan 217 (owner: option B): one "Icon" component set holds every glyph at the five token sizes
// (variant properties `icon` and `size`, like the code's Icon props). Every icon the other
// builders draw is an instance of it, and the slots in Button, Badge and Toggle swap between its
// variants. Glyph geometry comes from lucide's own SVG, so it equals the code's. Stroke weight is
// the icon-stroke-width token (a flat weight, owner decision C1.1); colour is bound per use.
var iconSetNode = null;
var ICON_SIZES = ["xs", "sm", "md", "lg", "xl"];

function iconVariant(name, size) {
  if (!iconSetNode) return null;
  var want = "icon=" + name + ", size=" + size;
  for (var i = 0; i < iconSetNode.children.length; i++) {
    if (iconSetNode.children[i].name === want) return iconSetNode.children[i];
  }
  return null;
}

function bindIconStroke(node, colorVar) {
  var vectors = node.findAll(function (n) {
    return n.type === "VECTOR" || n.type === "LINE" || n.type === "ELLIPSE" || n.type === "RECTANGLE" || n.type === "BOOLEAN_OPERATION";
  });
  for (var i = 0; i < vectors.length; i++) {
    var v = vectors[i];
    try {
      v.fills = [];
    } catch (e) {}
    bindStroke(v, colorVar, getVar("icon-stroke-width"));
    try {
      v.strokeAlign = "CENTER";
      v.strokeCap = "ROUND";
      v.strokeJoin = "ROUND";
    } catch (e) {}
  }
}

function buildIconVariant(name, size) {
  var px = resolveSpace(getVar("icon/size/" + size)) || 24;
  var comp = figma.createComponent();
  comp.name = "icon=" + name + ", size=" + size;
  comp.fills = [];
  comp.clipsContent = false;
  comp.resize(24, 24);
  try {
    var svg = figma.createNodeFromSvg(ICON_SVG[name]);
    var glyphCount = svg.children.length;
    for (var gi = 0; gi < glyphCount; gi++) {
      var child = svg.children[0];
      comp.appendChild(child);
      try {
        child.constraints = { horizontal: "SCALE", vertical: "SCALE" };
      } catch (e) {}
    }
    svg.remove();
  } catch (e) {
    console.error("icon " + name + ": " + e.message);
  }
  bindIconStroke(comp, getVar("color/foreground/default"));
  resizeKeep(comp, px, px);
  var sizeVar = getVar("icon/size/" + size);
  bindSize(comp, sizeVar, sizeVar);
  return comp;
}

function buildIcon(x, y) {
  var configs = [];
  for (var i = 0; i < ICON_ORDER.length; i++) {
    for (var j = 0; j < ICON_SIZES.length; j++) {
      (function (name, size) {
        configs.push({
          variantProps: { icon: name, size: size },
          buildFn: function () {
            return buildIconVariant(name, size);
          },
        });
      })(ICON_ORDER[i], ICON_SIZES[j]);
    }
  }
  iconSetNode = buildComponentSet("Icon", configs, "icon", x, y);
  return iconSetNode;
}

// An icon slot for a component set: an instance of the Icon set, hidden by default, shown by a
// BOOLEAN `showIcon` and swapped through an INSTANCE_SWAP `icon`. The instance layers must be
// named layerName. Without the Icon set (stub runs) nothing is added.
function addIconSlot(set, layerName, defaultName, defaultSize) {
  var master = iconVariant(defaultName, defaultSize);
  if (!master) return 0;
  var boolKey;
  var swapKey;
  try {
    boolKey = set.addComponentProperty("showIcon", "BOOLEAN", false);
    swapKey = set.addComponentProperty("icon", "INSTANCE_SWAP", master.id, {
      preferredValues: [{ type: "COMPONENT_SET", key: iconSetNode.key }],
    });
  } catch (e) {
    console.warn("icon slot on " + set.name + ": " + e.message);
    return 0;
  }
  var slots = set.findAll(function (n) {
    return n.type === "INSTANCE" && n.name === layerName;
  });
  for (var i = 0; i < slots.length; i++) {
    slots[i].componentPropertyReferences = { visible: boolKey, mainComponent: swapKey };
  }
  return slots.length;
}

// Every built-in icon is an instance of the Icon set, so a designer who edits a glyph there
// edits it everywhere.
function makeIcon(kind, size, colorVar, sizeVar) {
  var master = iconVariant(kind, "md");
  if (!master) return makeIconFrame(kind, size, colorVar, sizeVar);
  var inst = master.createInstance();
  inst.name = kind + "-icon";
  resizeKeep(inst, size, size);
  bindSize(inst, sizeVar, sizeVar);
  if (colorVar) {
    var vectors = inst.findAll(function (n) {
      return n.type === "VECTOR" || n.type === "LINE" || n.type === "ELLIPSE" || n.type === "RECTANGLE" || n.type === "BOOLEAN_OPERATION";
    });
    // bindStroke writes a raw weight of 1 unless it is given the width variable, which would
    // replace the master's bound icon-stroke-width on the instance's vectors
    var strokeWidthVar = getVar("icon-stroke-width");
    for (var i = 0; i < vectors.length; i++) bindStroke(vectors[i], colorVar, strokeWidthVar);
  }
  return inst;
}

function makeIconFrame(kind, size, colorVar, sizeVar) {
  var f = figma.createFrame();
  f.name = kind + "-icon";
  f.fills = [];
  f.clipsContent = false;
  resizeKeep(f, 24, 24);
  try {
    var v = figma.createVector();
    v.vectorPaths = [{ windingRule: "NONE", data: ICON_PATHS[kind] }];
    v.fills = [];
    f.appendChild(v);
    var bb = ICON_BBOX[kind];
    if (Math.abs(v.width - bb.w) < 1 && Math.abs(v.height - bb.h) < 1) {
      v.x = bb.x;
      v.y = bb.y;
    } else {
      v.x = 0;
      v.y = 0;
    }
    bindStroke(v, colorVar, false);
    // no colour variable: still draw the glyph, in a neutral grey
    if (!colorVar) v.strokes = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
    v.strokeAlign = "CENTER";
    v.strokeCap = "ROUND";
    v.strokeJoin = "ROUND";
    v.strokeWeight = Math.max(1, (2 * size) / 24);
    // Plan 217 (owner, C1.1): one flat weight from the token, not scaled with the size
    bindProp(v, "strokeWeight", getVar("icon-stroke-width"));
    v.constraints = { horizontal: "SCALE", vertical: "SCALE" };
  } catch (e) {
    console.error("makeIcon " + kind + ": " + e.message);
    f.cornerRadius = 2;
    bindFill(f, colorVar);
  }
  resizeKeep(f, size, size);
  bindSize(f, sizeVar, sizeVar);
  return f;
}

function bindProp(node, prop, variable) {
  if (!variable) return;
  try {
    node.setBoundVariable(prop, variable);
  } catch (e) {}
}

function bindPadding(node, topVar, rightVar, bottomVar, leftVar) {
  node.paddingTop = resolveSpace(topVar);
  node.paddingRight = resolveSpace(rightVar);
  node.paddingBottom = resolveSpace(bottomVar);
  node.paddingLeft = resolveSpace(leftVar);
  try {
    if (topVar) node.setBoundVariable("paddingTop", topVar);
    if (rightVar) node.setBoundVariable("paddingRight", rightVar);
    if (bottomVar) node.setBoundVariable("paddingBottom", bottomVar);
    if (leftVar) node.setBoundVariable("paddingLeft", leftVar);
  } catch (e) {}
}

// Every text layer with the style name it was made for, so content properties can find
// their layers by role (Plan 217, J3).
var textRegistry = [];

// Every built set by name, so a composition or pattern can place instances of the real
// components (Button, Badge, Card) instead of redrawing them as frames.
var builtSetNodes = {};

// An instance of one variant of a built set, with its first text layer set to `label`.
// Null when the set or variant is not there (the caller falls back to a frame).
function instanceFromSet(setName, variantName, label) {
  var set = builtSetNodes[setName];
  if (!set) return null;
  var master = null;
  for (var i = 0; i < set.children.length; i++) {
    if (set.children[i].name === variantName) master = set.children[i];
  }
  if (!master) return null;
  var inst = master.createInstance();
  if (label !== undefined) {
    try {
      var t = inst.findOne(function (n) {
        return n.type === "TEXT";
      });
      if (t) t.characters = label;
    } catch (e) {
      console.warn("instance label on " + setName + ": " + e.message);
    }
  }
  return inst;
}

function makeText(
  characters,
  styleName,
  fontSizeVar,
  fontWeightVar,
  fillVar,
  lineHeightVar,
  letterSpacingVar
) {
  var fontSize = resolveFontSize(fontSizeVar);
  var fontWeight = resolveFontWeight(fontWeightVar);

  var sizeToken = fontSizeVar ? tokenPathOf(fontSizeVar) : null;
  var style = sizeToken ? styleByFontSizeToken[sizeToken] : null;
  var familyVar = style ? familyVarByStyleId[style.id] || null : null;
  var familyName =
    style && style.fontName && style.fontName.family
      ? style.fontName.family
      : "Manrope";

  var t = figma.createText();
  textRegistry.push({ node: t, style: styleName });
  // A family other than Manrope takes the face its text style resolved to: Figma's JetBrains
  // Mono has no SemiBold, and the style holds the nearest face (Bold). Manrope has every weight.
  t.fontName =
    familyName !== "Manrope" && style && style.fontName
      ? style.fontName
      : { family: familyName, style: fontStyleFromWeight(fontWeight) };
  t.characters = characters;

  // Find the Token Bridge style by the layer's font-size token (above). No style (a
  // null font size, or a token with no definition): the layer keeps the direct
  // bindings below and is reported at the end of the run.
  // The style itself is applied later, in applyPendingTextStyles() at the end
  // of main(): the synchronous textStyleId setter fails in dynamic-page mode
  // (Plan 205). Everything below is set now so the layer is correct even if
  // that pass never runs, and set again after the style lands.
  if (style) {
    pendingTextStyles.push({
      node: t,
      styleId: style.id,
      styleName: style.name,
      fontSizeVar: fontSizeVar,
      fontWeightVar: fontWeightVar,
      fillVar: fillVar,
      familyVar: familyVar,
    });
  } else {
    unstyledLayers.push({
      layer: styleName + ' "' + characters + '"',
      token: sizeToken || "(no font-size token)",
    });
  }
  bindTextVariables(t, styleName, fontSizeVar, fontWeightVar, fillVar, familyVar);

  return t;
}

// Bind fontSize/fontWeight/fontFamily and the fill on a text node. These are
// the fields users most notice when wrong. They are bound on the node as well
// as on the style so each shows its own bound-variable pill in the inspector
// (the same pattern Fill already uses); applying them after the style is safe
// because Figma detaches only the field being overridden, not the whole
// style. An earlier version dropped the fontSize call on the theory that it
// detached the node from the style; that was wrong (the style application was
// failing on its own), and it made fontSize fall back to Figma's raw
// createText() default (12px) instead of the token value.
//
// No node-level lineHeight or letterSpacing override: binding either through
// setBoundVariable always yields PIXELS; the style's PERCENT values (written by
// Token Bridge) are inherited through the text style.
// Plan 217 (owner E1): slot content has no token of its own in code. Body text in
// a slot uses the card content size (sm, the body style) and the default foreground.
function slotTextSize() {
  return getVar("card/content/font-size");
}
function slotTextColor() {
  return getVar("color/foreground/default");
}

function bindTextVariables(t, styleName, fontSizeVar, fontWeightVar, fillVar, familyVar) {
  if (fontSizeVar) {
    try {
      t.setBoundVariable("fontSize", fontSizeVar);
    } catch (e) {
      console.error("fontSize bind failed for " + styleName + ": " + e.message);
    }
  }
  if (fontWeightVar) {
    try {
      t.setBoundVariable("fontWeight", fontWeightVar);
    } catch (e) {
      console.error("fontWeight bind failed for " + styleName + ": " + e.message);
    }
  }
  var fontFamilyVar = familyVar || getVar("typography/font-family/sans");
  if (fontFamilyVar) {
    try {
      t.setBoundVariable("fontFamily", fontFamilyVar);
    } catch (e) {
      console.error("fontFamily bind failed for " + styleName + ": " + e.message);
    }
  }
  if (fillVar) {
    try {
      var alias = figma.variables.createVariableAlias(fillVar);
      t.fills = [
        {
          type: "SOLID",
          color: resolvedPaintColor(fillVar, t, { r: 0.1, g: 0.1, b: 0.1 }),
          boundVariables: { color: alias },
        },
      ];
    } catch (e) {
      console.warn("text fill: " + e.message);
    }
  }
}

// Apply every queued text style with the async setter, then re-bind the
// node-level variables in case applying the style reset them. Order per text
// layer overall: createText, fontName, characters, style lookup
// (Token Bridge style by font-size token), bind font and fill (makeText); then, here:
// setTextStyleIdAsync, bind font and fill again. Nodes that were removed
// meanwhile are skipped. Failures are logged and counted, never thrown, so one
// bad layer does not stop the rest.
// Plan 217 (owner J1, J2): designer-editable properties named after the code props.
// TEXT: every text layer with these characters in the set follows one property.
// BOOLEAN: the layers named layerName show or hide with the property.
// Failures are logged and skipped: a property never blocks a build.
function addTextProperty(set, propName, characters) {
  var key;
  try {
    key = set.addComponentProperty(propName, "TEXT", characters);
  } catch (e) {
    console.warn("TEXT property " + propName + ": " + e.message);
    return 0;
  }
  var nodes = set.findAll(function (n) {
    return n.type === "TEXT" && n.characters === characters;
  });
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].componentPropertyReferences = { characters: key };
    nodes[i].name = propName;
  }
  return nodes.length;
}
function addBooleanProperty(set, propName, layerName, defaultValue) {
  var key;
  try {
    key = set.addComponentProperty(propName, "BOOLEAN", defaultValue);
  } catch (e) {
    console.warn("BOOLEAN property " + propName + ": " + e.message);
    return 0;
  }
  var nodes = set.findAll(function (n) {
    return n.name === layerName;
  });
  for (var i = 0; i < nodes.length; i++) {
    // keep a TEXT reference the layer already has (description: characters + visible)
    var refs = {};
    var current = nodes[i].componentPropertyReferences;
    if (current) {
      for (var rk in current) refs[rk] = current[rk];
    }
    refs.visible = key;
    nodes[i].componentPropertyReferences = refs;
  }
  return nodes.length;
}

// TEXT property for every layer made with a matching style name inside the set.
// excludeChars skips a layer by its text (the Label's required marker "*").
function addTextPropertyByStyle(set, propName, styleSource, excludeChars) {
  var re = new RegExp(styleSource);
  var matches = [];
  for (var i = 0; i < textRegistry.length; i++) {
    var r = textRegistry[i];
    if (r.node.removed || !re.test(r.style)) continue;
    if (excludeChars && r.node.characters === excludeChars) continue;
    var p = r.node.parent;
    while (p && p.id !== set.id) p = p.parent;
    if (p) matches.push(r.node);
  }
  if (!matches.length) {
    console.warn("TEXT property " + propName + ": no layer in " + set.name);
    return 0;
  }
  var key;
  try {
    key = set.addComponentProperty(propName, "TEXT", matches[0].characters);
  } catch (e) {
    console.warn("TEXT property " + propName + ": " + e.message);
    return 0;
  }
  for (var j = 0; j < matches.length; j++) {
    matches[j].componentPropertyReferences = { characters: key };
    matches[j].name = propName;
  }
  return matches.length;
}

// Plan 217 (owner J3): editable text for the single-content components. Names match code
// where a twin exists (children, placeholder); title, description and content are
// sub-components in code and are allow-listed in the parity check. Alert Dialog's title
// differs per variant, so only its description is a property.
var CONTENT_PROPERTIES = {
  Badge: [["children", "^badge/label/"]],
  Toggle: [["children", "^toggle$"]],
  Label: [["children", "^label/", "*"]],
  Tooltip: [["children", "^tooltip$"]],
  Input: [["placeholder", "^input/placeholder/"]],
  Textarea: [["placeholder", "^textarea/placeholder$"]],
  Alert: [["title", "^alert/title/"], ["description", "^alert/description/"]],
  Toast: [["title", "^toast/title$"], ["description", "^toast/description$"]],
  Dialog: [["title", "^dialog/title$"], ["description", "^dialog/description$"], ["body", "^dialog/body$"]],
  "Alert Dialog": [["title", "^alert-dialog/title$"], ["description", "^alert-dialog/description$"]],
  Popover: [["title", "^popover/title$"], ["content", "^popover/body$"]],
  "Hover Card": [["title", "^hover-card/title$"], ["content", "^hover-card/body$"]],
  Sheet: [["title", "^sheet/title$"], ["description", "^sheet/description$"]],
  Accordion: [["trigger", "^accordion/trigger$"], ["content", "^accordion/content$"]],
  Collapsible: [["trigger", "^collapsible/trigger$"], ["content", "^collapsible/body$"]],
};
function applyContentProperties(set) {
  var spec = CONTENT_PROPERTIES[set.name];
  if (!spec) return 0;
  var n = 0;
  for (var i = 0; i < spec.length; i++) {
    if (addTextPropertyByStyle(set, spec[i][0], spec[i][1], spec[i][2])) n++;
  }
  return n;
}

// Dialog and Alert Dialog (owner decision 2026-11-10): the description, the footer and each
// footer button show or hide with a BOOLEAN (cancel and action on, extra off); the footer
// Buttons are exposed so their label and variant are edited from the dialog instance; the
// Dialog body is a SLOT (a form, a list or text). None of these are props in code: they are
// children, allow-listed in the parity check. Runs after applyContentProperties, which names
// the description layer. Variants must keep a State or Size axis: the Plugin API rejects
// setProperties on a set with none.
function applyOverlayProperties(set) {
  var isDialog = set.name === "Dialog";
  if (!isDialog && set.name !== "Alert Dialog") return 0;
  var count = 0;
  // names are Title Case like Toast's "Show Close" and Alert's "Show Icon"
  if (isDialog) {
    count += addBooleanProperty(set, "Show Footer", "dialog-footer", false);
    var footers = set.findAll(function (n) {
      return n.name === "dialog-footer";
    });
    for (var f = 0; f < footers.length; f++) footers[f].visible = false;
    count += addBooleanProperty(set, "Show Body", "dialog-body", true);
  }
  count += addBooleanProperty(set, "Show Description", "description", true);
  count += addBooleanProperty(set, "Show Cancel Button", "cancel-button", true);
  count += addBooleanProperty(set, "Show Action Button", "action-button", true);
  count += addBooleanProperty(set, "Show Extra Button", "extra-button", false);
  var buttons = set.findAll(function (n) {
    return n.type === "INSTANCE" && /^(extra|cancel|action)-button$/.test(n.name);
  });
  for (var b = 0; b < buttons.length; b++) {
    buttons[b].isExposedInstance = true;
    if (buttons[b].name === "extra-button") buttons[b].visible = false;
  }
  if (isDialog) {
    try {
      // a slot cannot hold a text bound to a property, so the text body (Body) and the
      // slot (Custom Body) are separate layers, each with its own Show boolean
      var slotKey = set.addComponentProperty("Custom Body", "SLOT", "", {
        description: "Optional space for a form, a list or any other content. Turn on Show Custom Body to use it.",
        slotSettings: { displayEmptyByDefault: true, stretchChildOnInsert: true },
      });
      var showCustomKey = set.addComponentProperty("Show Custom Body", "BOOLEAN", false);
      var customs = set.findAll(function (n) {
        return n.name === "custom-body";
      });
      for (var s = 0; s < customs.length; s++) {
        customs[s].componentPropertyReferences = { slotContentId: slotKey, visible: showCustomKey };
        customs[s].visible = false;
      }
      count += customs.length;
    } catch (e) {
      console.warn("SLOT property Custom Body: " + e.message);
    }
  }
  return count;
}

// Plan 217 (owner G1): the component sets sit in sections by Storybook category, in
// the Storybook sidebar order, in rows wrapped at about 3,000px. Keep the map in
// step with the stories (a name not listed lands in "Other").
var SET_SECTIONS = [
  ["Form Controls", ["Button", "Checkbox", "Form", "Input", "Label", "Radio", "Select", "Slider", "Switch", "Textarea", "Toggle", "Toggle Group"]],
  ["Layout & Structure", ["Card Grid", "Collapsible", "Feature Grid", "Resizable", "Scrollbar", "Separator"]],
  ["Navigation", ["Breadcrumb", "Command", "Menubar", "Navigation Menu", "Pagination", "Tabs"]],
  ["Content Display", ["Accordion", "Avatar", "Badge", "Calendar", "Card", "Carousel", "Icon", "Table"]],
  ["Overlays & Popovers", ["Alert Dialog", "Context Menu", "Dialog", "Dropdown Menu", "Hover Card", "Popover", "Sheet", "Tooltip"]],
  ["Feedback & Status", ["Alert", "Progress", "Skeleton", "Toast"]],
  ["Compositions", ["Page Layout", "Section Features", "Section Hero", "Site Footer", "Site Header"]],
];
function arrangeInSections(sets) {
  var PAD = 100;
  var GAP = 100;
  var MAX_ROW = 3000;
  var originX = sets.length ? sets[0].x : 0;
  var sectionY = sets.length ? sets[0].y : 0;
  var byName = {};
  var listed = {};
  for (var i = 0; i < sets.length; i++) byName[sets[i].name] = sets[i];
  var groups = [];
  for (var g = 0; g < SET_SECTIONS.length; g++) {
    var members = [];
    for (var m = 0; m < SET_SECTIONS[g][1].length; m++) {
      var found = byName[SET_SECTIONS[g][1][m]];
      if (found) {
        members.push(found);
        listed[found.name] = true;
      }
    }
    groups.push([SET_SECTIONS[g][0], members]);
  }
  var others = [];
  for (var k = 0; k < sets.length; k++) if (!listed[sets[k].name]) others.push(sets[k]);
  if (others.length) groups.push(["Other", others]);

  var created = [];
  for (var gi = 0; gi < groups.length; gi++) {
    var members2 = groups[gi][1];
    if (!members2.length) continue;
    var section = figma.createSection();
    section.name = groups[gi][0];
    section.x = originX;
    section.y = sectionY;
    var x = PAD;
    var y = PAD;
    var rowH = 0;
    var right = 0;
    for (var n = 0; n < members2.length; n++) {
      var set = members2[n];
      if (x > PAD && x + set.width > MAX_ROW) {
        x = PAD;
        y += rowH + GAP;
        rowH = 0;
      }
      section.appendChild(set);
      set.x = x;
      set.y = y;
      x += set.width + GAP;
      rowH = Math.max(rowH, set.height);
      right = Math.max(right, set.x + set.width);
    }
    section.resizeWithoutConstraints(right + PAD, y + rowH + PAD);
    sectionY += section.height + 200;
    created.push(section);
  }
  return created;
}

// Plan 217: layers the builder creates and never names would keep Figma's defaults
// (Vector, Frame, Rectangle ...). Name them after the part they sit in, by role: a
// glyph in an icon frame is "glyph", an auto-layout frame is "row" or "stack".
var DEFAULT_LAYER_NAME = /^(Vector|Frame|Rectangle|Group|Ellipse|Line)(\s*\d+)?$/;
function kebab(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function nameDefaultLayers(sets) {
  var renamed = 0;
  for (var i = 0; i < sets.length; i++) {
    var set = sets[i];
    var base = kebab(set.name);
    var nodes = set.findAll(function (n) {
      return DEFAULT_LAYER_NAME.test(n.name);
    });
    for (var j = 0; j < nodes.length; j++) {
      var n = nodes[j];
      var parent = n.parent;
      var owner = base;
      if (parent && parent.type !== "COMPONENT" && parent.type !== "COMPONENT_SET") {
        if (!DEFAULT_LAYER_NAME.test(parent.name) && parent.name.indexOf("=") < 0) {
          owner = parent.name;
        }
      }
      var role = "shape";
      if (n.type === "VECTOR") role = "glyph";
      else if (n.type === "ELLIPSE") role = "dot";
      else if (n.type === "LINE") role = "line";
      else if (n.type === "GROUP") role = "group";
      else if (n.type === "FRAME") {
        role =
          n.layoutMode === "HORIZONTAL"
            ? "row"
            : n.layoutMode === "VERTICAL"
              ? "stack"
              : "box";
      }
      // A glyph in an icon frame is already named by that frame
      var label = n.type === "VECTOR" && /-icon$/.test(String(owner)) ? role : kebab(owner) + "-" + role;
      try {
        n.name = label;
        renamed++;
      } catch (e) {}
    }
  }
  return renamed;
}

// ============================================================
// STATE REACTIONS (Plan 137)
// A hover or press changes the variant with Smart Animate. Figma takes a LITERAL duration
// and easing there (a variable cannot be bound to a transition), so both are read from the
// library's semantic fast duration and default easing at build time, the same pair the
// UI's transition-colors uses (index.css binds Tailwind's default transition to them).
// ============================================================

var STATE_DURATION = "transition/duration/fast";
var STATE_EASING = "transition/easing/default";

function resolveVariableValue(variable, depth) {
  if (!variable || depth > 10) return null;
  var modeId = Object.keys(variable.valuesByMode)[0];
  var val = variable.valuesByMode[modeId];
  if (val && typeof val === "object" && val.type === "VARIABLE_ALIAS") {
    return resolveVariableValue(variableById[val.id], depth + 1);
  }
  return val === undefined ? null : val;
}

// { duration, easing } in Figma's own units, or null with the reason in motionProblem()
function stateTransition() {
  var durationVar = getVar(STATE_DURATION);
  var easingVar = getVar(STATE_EASING);
  if (!durationVar || durationVar.resolvedType !== "TIMING") return null;
  if (!easingVar || easingVar.resolvedType !== "EASING") return null;
  var seconds = resolveVariableValue(durationVar, 0);
  var curve = resolveVariableValue(easingVar, 0);
  if (typeof seconds !== "number" || !curve || !curve.easingFunctionCubicBezier) return null;
  return {
    duration: seconds,
    easing: {
      type: "CUSTOM_CUBIC_BEZIER",
      easingFunctionCubicBezier: curve.easingFunctionCubicBezier,
    },
  };
}

function motionProblem() {
  var durationVar = getVar(STATE_DURATION);
  var easingVar = getVar(STATE_EASING);
  if (!durationVar || !easingVar) {
    return STATE_DURATION + " or " + STATE_EASING + " is missing from the file";
  }
  if (durationVar.resolvedType !== "TIMING" || easingVar.resolvedType !== "EASING") {
    return (
      "they are " + durationVar.resolvedType + " and " + easingVar.resolvedType +
      ", not TIMING and EASING: Pull the tokens in Token Bridge first"
    );
  }
  return "their values could not be read";
}

// The component name buildComponentSet gives a variant: "variant=default, size=md".
function variantNameOf(props) {
  return Object.keys(props)
    .map(function (k) {
      return k + "=" + props[k];
    })
    .join(", ");
}

// Which variant to change to, and on what, for every variant that has a state.
// props: the variant properties of each variant, in the order the set holds them.
// Returns [{ from, to, trigger }] as indexes into props. Default goes to Hover on hover and
// to Pressed on press; Hover goes to Pressed on press (a press happens while hovering).
// A disabled variant has no hover or press, so it gets none.
// The axis is called `state`, or `interaction` where `state` already names something else
// (Accordion's open and closed, for instance).
function interactionAxis(p) {
  return p.state !== undefined ? "state" : p.interaction !== undefined ? "interaction" : null;
}

function stateReactionPlan(props) {
  var groups = {};
  for (var i = 0; i < props.length; i++) {
    var p = props[i];
    var axis = interactionAxis(p);
    if (!axis) continue;
    var rest = [];
    Object.keys(p).forEach(function (k) {
      if (k !== axis) rest.push(k + "=" + p[k]);
    });
    var key = rest.join(", ");
    if (!groups[key]) groups[key] = {};
    groups[key][p[axis]] = i;
  }
  var plan = [];
  Object.keys(groups).forEach(function (key) {
    var g = groups[key];
    if (g["default"] === undefined) return;
    if (g.hover !== undefined) plan.push({ from: g["default"], to: g.hover, trigger: "ON_HOVER" });
    if (g.pressed !== undefined) plan.push({ from: g["default"], to: g.pressed, trigger: "ON_PRESS" });
    if (g.hover !== undefined && g.pressed !== undefined) {
      plan.push({ from: g.hover, to: g.pressed, trigger: "ON_PRESS" });
    }
  });
  return plan;
}

async function applyStateReactions() {
  var wired = 0;
  var skipped = "";
  var transition = stateTransition();
  if (!transition) {
    skipped = motionProblem();
    if (pendingStateSets.length) {
      console.warn("State reactions skipped: " + skipped);
    }
    pendingStateSets = [];
    return { wired: 0, skipped: skipped };
  }
  for (var i = 0; i < pendingStateSets.length; i++) {
    var entry = pendingStateSets[i];
    // combineAsVariants does not promise to keep the order, so find each variant by name
    var byName = {};
    for (var c = 0; c < entry.set.children.length; c++) {
      byName[entry.set.children[c].name] = entry.set.children[c];
    }
    var comps = entry.props.map(function (p) {
      return byName[variantNameOf(p)];
    });
    var plan = stateReactionPlan(entry.props);
    var byFrom = {};
    for (var k = 0; k < plan.length; k++) {
      var step = plan[k];
      if (!byFrom[step.from]) byFrom[step.from] = [];
      byFrom[step.from].push(step);
    }
    var names = Object.keys(byFrom);
    for (var n = 0; n < names.length; n++) {
      var steps = byFrom[names[n]];
      var reactions = [];
      if (!comps[Number(names[n])]) continue;
      for (var q = 0; q < steps.length; q++) {
        if (!comps[steps[q].to]) continue;
        reactions.push({
          trigger: { type: steps[q].trigger },
          actions: [
            {
              type: "NODE",
              destinationId: comps[steps[q].to].id,
              navigation: "CHANGE_TO",
              transition: {
                type: "SMART_ANIMATE",
                easing: transition.easing,
                duration: transition.duration,
              },
              resetVideoPosition: false,
            },
          ],
        });
      }
      try {
        await comps[Number(names[n])].setReactionsAsync(reactions);
        wired += reactions.length;
      } catch (e) {
        console.error("setReactionsAsync failed for " + comps[Number(names[n])].name + ": " + e.message);
      }
    }
  }
  pendingStateSets = [];
  return { wired: wired, skipped: skipped };
}

async function applyPendingTextStyles() {
  var applied = 0;
  var failed = 0;
  for (var i = 0; i < pendingTextStyles.length; i++) {
    var item = pendingTextStyles[i];
    if (item.node.removed) continue;
    try {
      await item.node.setTextStyleIdAsync(item.styleId);
      // The style carries its own weight and re-binding the same weight variable does not move
      // it, so a layer whose bound weight differs from its style (a menu label is semibold,
      // its style is the regular item style) stays on the style's weight. Unbind, set the
      // face, and let bindTextVariables bind the variable again.
      if (item.fontWeightVar && item.node.fontName !== figma.mixed) {
        try {
          var wantStyle = fontStyleFromWeight(resolveFontWeight(item.fontWeightVar));
          var cur = item.node.fontName;
          if (cur.style !== wantStyle) {
            var face = { family: cur.family, style: wantStyle };
            await figma.loadFontAsync(face);
            item.node.setBoundVariable("fontWeight", null);
            item.node.fontName = face;
          }
        } catch (e) {
          console.warn("weight override skipped for " + item.styleName + ": " + e.message);
        }
      }
      bindTextVariables(
        item.node,
        item.styleName,
        item.fontSizeVar,
        item.fontWeightVar,
        item.fillVar,
        item.familyVar
      );
      applied++;
    } catch (e) {
      failed++;
      console.error(
        "setTextStyleIdAsync failed for " + item.styleName + ": " + e.message
      );
    }
  }
  pendingTextStyles = [];
  console.log("Text styles applied: " + applied + ", failed: " + failed);
  return { applied: applied, failed: failed };
}

// Plan 217: text styles apply last and change line heights, so a set or section sized from
// the variants' earlier heights can clip them by a few pixels. Grow each to fit its children.
function fitToChildren(node, pad) {
  var maxRight = 0;
  var maxBottom = 0;
  for (var i = 0; i < node.children.length; i++) {
    var c = node.children[i];
    maxRight = Math.max(maxRight, c.x + c.width);
    maxBottom = Math.max(maxBottom, c.y + c.height);
  }
  var w = Math.max(node.width, maxRight + pad);
  var h = Math.max(node.height, maxBottom + pad);
  if (w !== node.width || h !== node.height) {
    try {
      node.resizeWithoutConstraints(w, h);
    } catch (e) {}
  }
}
function fitSetsAndSections(sets, sections) {
  for (var i = 0; i < sets.length; i++) fitToChildren(sets[i], 0);
  for (var j = 0; j < sections.length; j++) fitToChildren(sections[j], 100);
}

async function applyPendingEffectStyles() {
  var applied = 0;
  var failed = 0;
  for (var i = 0; i < pendingEffectStyles.length; i++) {
    var item = pendingEffectStyles[i];
    if (item.node.removed) continue;
    try {
      await item.node.setEffectStyleIdAsync(item.styleId);
      applied++;
    } catch (e) {
      failed++;
      console.error("setEffectStyleIdAsync failed for " + item.name + ": " + e.message);
    }
  }
  pendingEffectStyles = [];
  console.log("Effect styles applied: " + applied + ", failed: " + failed);
  return { applied: applied, failed: failed };
}

// ============================================================
// FONT PRELOADING
// ============================================================

async function loadFonts() {
  var styles = ["Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold"];
  for (var i = 0; i < styles.length; i++) {
    await figma.loadFontAsync({ family: "Manrope", style: styles[i] });
  }
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  // The Badge text style is mono (badge.font-family); a missing font is logged, never fatal.
  for (var m = 0; m < styles.length; m++) {
    try {
      await figma.loadFontAsync({ family: "JetBrains Mono", style: styles[m] });
    } catch (e) {
      console.warn("JetBrains Mono " + styles[m] + ": " + e.message);
    }
  }
}

// ============================================================
// COMPONENT SET BUILDER WITH GRID LAYOUT
// Organizes variants in a grid: primary axis = first prop, secondary = rest
// e.g. Button: columns = sizes, rows = variants
// ============================================================

// BEGIN GENERATED COMPONENT_DOCS (node scripts/figma/component-docs.mjs --builder)
// Description and documentation link per component set, from the stories. Do not edit by hand.
var COMPONENT_DOCS = {
  "Accordion": {
    "description": "Collapsible content sections built on Radix UI primitives with full accessibility support, and keyboard navigation. The chevron turns as a panel opens; the panel itself opens without animation.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-content-display-accordion--docs"
  },
  "Alert": {
    "description": "Alert component for displaying important messages to users. Includes support for different variants (default, destructive, warning, success, info) and compound components for structured content.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-feedback-status-alert--docs"
  },
  "Alert Dialog": {
    "description": "Modal confirmation dialogs for destructive or important actions. Built on Radix UI primitives with proper focus management and accessibility support.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-overlays-popovers-alertdialog--docs"
  },
  "Avatar": {
    "description": "Avatar component for displaying user profile pictures with fallback support. Includes size variants and compound components for image and fallback content.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-content-display-avatar--docs"
  },
  "Badge": {
    "description": "Compact status indicators and labels for displaying metadata, counts, or categorical information. Accessibility: Use semantic colors and consider adding visually hidden text for context when badges convey important information through color alone.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-content-display-badge--docs"
  },
  "Breadcrumb": {
    "description": "Navigation breadcrumbs showing the current page location within a navigational hierarchy. Built with semantic HTML (nav, ol, li) and full accessibility support including ARIA labels and landmarks.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-navigation-breadcrumb--docs"
  },
  "Button": {
    "description": "Versatile button component for user actions. Supports multiple variants, sizes, loading states, and full keyboard accessibility.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-inputs-controls-button--docs"
  },
  "Calendar": {
    "description": "A flexible calendar component for date selection with support for single dates, multiple dates, and date ranges.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-content-display-calendar--docs"
  },
  "Card": {
    "description": "Flexible container component for grouping related content. Composed of Card, CardHeader, CardTitle, CardDescription, CardContent, and CardFooter.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-content-display-card--docs"
  },
  "Card Grid": {
    "description": "Responsive grid container for laying out Card components. Supports per-breakpoint column counts, gap, centering, and visual variants (default, compact, spacious, masonry, elevated).",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-layout-structure-cardgrid--docs"
  },
  "Carousel": {
    "description": "A scroll-snap carousel: the slides sit in a horizontally scrolling track that snaps to each slide. Swipe, use the arrow keys when the track is focused, or use the previous and next buttons, which disable at either end. Slide spacing comes from the carousel.item-spacing token.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-content-display-carousel--docs"
  },
  "Checkbox": {
    "description": "Checkbox component built on Radix UI primitives with full accessibility support, keyboard navigation, and customizable styling.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-inputs-controls-checkbox--docs"
  },
  "Collapsible": {
    "description": "Collapsible component for showing and hiding content sections. Built on Radix UI primitives with flexible trigger options. It opens and closes without animation.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-layout-structure-collapsible--docs"
  },
  "Command": {
    "description": "Command palette interface for quick actions and navigation. Features search, keyboard shortcuts, and grouped commands. Built on cmdk with full accessibility including keyboard navigation (Arrow keys, Enter, Escape) and ARIA attributes.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-navigation-command--docs"
  },
  "Context Menu": {
    "description": "Right-click context menus with support for submenus, checkboxes, radio groups, and keyboard shortcuts. Built on Radix UI primitives with full accessibility support including ARIA attributes, focus management, and keyboard navigation (Arrow keys, Enter, Escape).",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-overlays-popovers-contextmenu--docs"
  },
  "Dialog": {
    "description": "Modal dialog component with focus trapping and backdrop. Built on Radix UI primitives with full keyboard and screen reader support.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-overlays-popovers-dialog--docs"
  },
  "Dropdown Menu": {
    "description": "Dropdown menu component for displaying a menu of actions or options. Supports checkboxes, radio groups, and keyboard navigation.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-overlays-popovers-dropdownmenu--docs"
  },
  "Feature Grid": {
    "description": "Renders a responsive grid of feature items, each with an icon, title, description, and optional badge. Built for marketing and landing-page feature sections.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-layout-structure-featuregrid--docs"
  },
  "Form": {
    "description": "The Form system provides composable primitives for building accessible, consistently styled forms. Each primitive reads from a shared FormField context so label wiring, error state, and description IDs are handled automatically.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-inputs-controls-form--docs"
  },
  "Hover Card": {
    "description": "Hover-triggered content cards for displaying additional information. Built on Radix UI primitives with flexible positioning.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-overlays-popovers-hovercard--docs"
  },
  "Icon": {
    "description": "Renders any icon component at a token size with the token stroke weight. The glyph comes from the icon library you already use (lucide-react here); the system owns size and stroke, so changing the icon size or stroke tokens changes every icon at once.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-content-display-icon--docs"
  },
  "Input": {
    "description": "Input component for single-line text input with support for different sizes, types, and error states. Accessibility: Always pair with Label using htmlFor and id. Use appropriate input types for better mobile keyboards.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-inputs-controls-input--docs"
  },
  "Label": {
    "description": "Label component provides accessible labels for form controls with support for required indicators and error states.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-inputs-controls-label--docs"
  },
  "Menubar": {
    "description": "A horizontal menu bar with dropdown menus, commonly used for application navigation and actions. Built on Radix UI primitives with full accessibility including keyboard navigation (Arrow keys, Enter, Escape) and ARIA attributes.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-navigation-menubar--docs"
  },
  "Navigation Menu": {
    "description": "A navigation menu component with dropdown submenus, hover interactions, and keyboard navigation support. Built on Radix UI primitives with full accessibility including ARIA attributes and focus management.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-navigation-navigationmenu--docs"
  },
  "Page Layout": {
    "description": "Full-page layout composition combining header, footer, sidebar, and main content area. Supports multiple width variants and optional sidebar positioning for building complete page structures.",
    "url": "https://wyliedogstorybook.com/?path=/docs/patterns-page-compositions-page-layout--docs"
  },
  "Pagination": {
    "description": "Navigation component for paginated content with customizable styling and accessibility support. Includes PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, and PaginationEllipsis subcomponents for building flexible pagination interfaces.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-navigation-pagination--docs"
  },
  "Popover": {
    "description": "Click-triggered content overlays for displaying additional information, forms, or controls. Built on Radix UI primitives with flexible positioning.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-overlays-popovers-popover--docs"
  },
  "Progress": {
    "description": "Progress component for displaying completion progress with different variants and sizes. Supports linear progress bars with smooth animations.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-feedback-status-progress--docs"
  },
  "Radio": {
    "description": "Radio button group for single selection from multiple options. Built on Radix UI primitives with full accessibility support and keyboard navigation.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-inputs-controls-radiogroup--docs"
  },
  "Resizable": {
    "description": "Resizable panels with drag handles for creating flexible layouts like IDEs and dashboards. Built on react-resizable-panels with full accessibility including keyboard controls and ARIA attributes.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-layout-structure-resizable--docs"
  },
  "Scrollbar": {
    "description": "Custom scrollable area with styled scrollbars that works consistently across platforms. Built on Radix UI ScrollArea primitive with full accessibility and native scrolling behavior.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-layout-structure-scrollarea--docs"
  },
  "Section Features": {
    "description": "Real-world features section composition for showcasing product features and benefits. This Tier 2 pattern component displays features in a grid layout with optional badges, supporting multiple column configurations and style variants.",
    "url": "https://wyliedogstorybook.com/?path=/docs/patterns-page-compositions-features-section--docs"
  },
  "Section Hero": {
    "description": "Real-world hero section composition for landing pages with title, description, action buttons, and optional images. Supports multiple layouts (default, gradient, centered) and image positioning for flexible page designs.",
    "url": "https://wyliedogstorybook.com/?path=/docs/patterns-page-compositions-hero-section--docs"
  },
  "Select": {
    "description": "Select component built on Radix UI primitives with keyboard navigation, search, and full accessibility support. Includes trigger, content, items, and separator sub-components.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-inputs-controls-select--docs"
  },
  "Separator": {
    "description": "Visual divider for separating content sections. Built on Radix UI with proper ARIA role handling for decorative and semantic separators.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-layout-structure-separator--docs"
  },
  "Sheet": {
    "description": "Side drawer overlay component that slides in from any edge of the screen. Commonly used for navigation menus, settings panels, and detailed views.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-overlays-popovers-sheet--docs"
  },
  "Site Footer": {
    "description": "Real-world site footer composition for page footers with logo, navigation columns, social links, and copyright. Supports default and minimal variants with responsive grid layout.",
    "url": "https://wyliedogstorybook.com/?path=/docs/patterns-navigation-patterns-site-footer--docs"
  },
  "Site Header": {
    "description": "Real-world site header composition with logo, navigation links, and action buttons. Production-ready with responsive design, sticky positioning, and backdrop blur. Supports default and transparent variants for different page contexts.",
    "url": "https://wyliedogstorybook.com/?path=/docs/patterns-navigation-patterns-site-header--docs"
  },
  "Skeleton": {
    "description": "Skeleton component for displaying loading placeholders with different variants and sizes. Provides visual feedback while content is loading.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-feedback-status-skeleton--docs"
  },
  "Slider": {
    "description": "A slider component for selecting values from a range with support for single and multiple handles.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-inputs-controls-slider--docs"
  },
  "Switch": {
    "description": "Switch component for binary choices, built on Radix UI with smooth animations and full accessibility support. Perfect for settings and feature toggles.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-inputs-controls-switch--docs"
  },
  "Table": {
    "description": "A responsive table component for displaying tabular data with support for sorting, selection, and actions. Built with semantic HTML elements (table, thead, tbody, tr, th, td) and fully accessible.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-content-display-table--docs"
  },
  "Tabs": {
    "description": "Tabbed navigation component for organizing content into switchable panels. Built on Radix UI primitives with full keyboard navigation and ARIA support.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-navigation-tabs--docs"
  },
  "Textarea": {
    "description": "Textarea component for multi-line text input with support for different sizes, error states, and resize behaviors.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-inputs-controls-textarea--docs"
  },
  "Toast": {
    "description": "Non-intrusive notification system for displaying temporary messages to users.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-feedback-status-toast--docs"
  },
  "Toggle": {
    "description": "Boolean toggle button for on/off states. Built on Radix UI primitives with support for variants, sizes, and icons.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-inputs-controls-toggle--docs"
  },
  "Toggle Group": {
    "description": "Toggle button groups for selecting one or multiple options. Built on Radix UI primitives with full accessibility support and keyboard navigation.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-inputs-controls-togglegroup--docs"
  },
  "Tooltip": {
    "description": "Tooltip component built on Radix UI primitives for displaying contextual information. Supports different positioning and provides excellent accessibility support.",
    "url": "https://wyliedogstorybook.com/?path=/docs/components-overlays-popovers-tooltip--docs"
  }
};
// END GENERATED COMPONENT_DOCS

// Code defaults for the sets whose default variant is not the first one built (Plan 216).
// Figma's default variant is the top-left one, which is what a designer gets when dragging
// the component in, so the code default is moved to the front: its row is laid out first and
// it is first in its row. The other variants keep their order. Values are strings, as in
// variantProps. Button size "default" is an alias of "md" in code; Figma draws "md" only.
var DEFAULT_VARIANTS = {
  Avatar: { size: "md", state: "image" },
  Icon: { icon: "heart", size: "md" },
  Badge: { variant: "default", size: "md", interaction: "default" },
  Button: { variant: "default", size: "md", disabled: "false", state: "default" },
  Checkbox: { size: "md", checked: "false", disabled: "false" },
  Input: { size: "md", state: "default" },
  Label: { size: "md", error: "false", required: "false" },
  Select: { size: "md", state: "closed" },
  Switch: { size: "md", checked: "false", disabled: "false" },
  Textarea: { size: "md", state: "default" },
  Toggle: { variant: "default", size: "default", pressed: "false", disabled: "false", state: "default" },
  "Section Features": { variant: "default", columns: "3" },
  Dialog: { size: "md" },
  "Hover Card": { size: "md" },
  Popover: { size: "md" },
  Radio: { size: "md", checked: "false", disabled: "false" },
  Sheet: { size: "md" },
  Tabs: { size: "md" },
};

function orderForDefault(name, configs) {
  var wanted = DEFAULT_VARIANTS[name];
  if (!wanted) return configs;
  var keys = Object.keys(wanted);
  for (var i = 0; i < configs.length; i++) {
    var matches = true;
    for (var k = 0; k < keys.length; k++) {
      if (String(configs[i].variantProps[keys[k]]) !== wanted[keys[k]]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      if (i === 0) return configs;
      return [configs[i]].concat(configs.slice(0, i), configs.slice(i + 1));
    }
  }
  console.warn("No variant matches the code default for " + name + ": " + JSON.stringify(wanted));
  return configs;
}

function buildComponentSet(name, configs, rowProp, x, y) {
  configs = orderForDefault(name, configs);
  // Group configs by rowProp value to determine grid structure
  var rowGroups = {};
  var rowOrder = [];
  for (var i = 0; i < configs.length; i++) {
    var cfg = configs[i];
    var rowVal = cfg.variantProps[rowProp] || "default";
    if (!rowGroups[rowVal]) {
      rowGroups[rowVal] = [];
      rowOrder.push(rowVal);
    }
    rowGroups[rowVal].push(cfg);
  }

  var ITEM_GAP = 16;
  var ROW_GAP = 16;

  // Build each component and position it in a grid
  var components = [];
  var curY = 0;

  for (var r = 0; r < rowOrder.length; r++) {
    var rowKey = rowOrder[r];
    var row = rowGroups[rowKey];
    var curX = 0;
    var rowHeight = 0;

    for (var c = 0; c < row.length; c++) {
      var cfg = row[c];
      var node = cfg.buildFn();

      // Name the component with its variant properties
      var keys = Object.keys(cfg.variantProps);
      var parts = [];
      for (var k = 0; k < keys.length; k++) {
        parts.push(keys[k] + "=" + cfg.variantProps[keys[k]]);
      }
      node.name = parts.length ? parts.join(", ") : "Default";

      node.x = curX;
      node.y = curY;
      curX += node.width + ITEM_GAP;
      if (node.height > rowHeight) rowHeight = node.height;

      components.push(node);
    }

    curY += rowHeight + ROW_GAP;
  }

  var set = figma.combineAsVariants(components, figma.currentPage);
  set.name = name;
  // Description and documentation link, from the stories (generated COMPONENT_DOCS)
  var docEntry = COMPONENT_DOCS[name];
  if (docEntry) {
    set.description = docEntry.description;
    try {
      set.documentationLinks = [{ uri: docEntry.url }];
    } catch (e) {
      console.warn("Could not set the documentation link for " + name + ": " + e.message);
    }
  }
  set.x = x;
  set.y = y;
  set.fills = [];
  set.cornerRadius = 0;
  set.layoutMode = "NONE";
  builtSetNodes[name] = set;
  return set;
}

// ============================================================
// BUTTON
// Grid: rows = variant, columns = size
// ============================================================

function buttonTokenVariant(variantKey) {
  return variantKey === "default" ? "primary" : variantKey;
}

// state: "default", "hover" or "pressed" (Plan 137). Code changes only the background on
// hover (hover:bg-*) and press (active:bg-*); a link underlines on hover and stays
// underlined while pressed, because a press happens while hovering.
function buildButtonVariant(variantKey, sizeKey, disabled, state) {
  var tokenVariant = buttonTokenVariant(variantKey);
  // a link has no background tokens, only the underline
  var stateSuffix =
    variantKey === "link" ? "" : state === "hover" ? "-hover" : state === "pressed" ? "-active" : "";
  var sizeToken = sizeKey === "icon" ? "md" : sizeKey;

  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "AUTO";
  comp.clipsContent = false;
  var iconGapVar = getVar("button/icon-gap");
  comp.itemSpacing = iconGapVar ? resolveSpace(iconGapVar) : 8;
  bindProp(comp, "itemSpacing", iconGapVar);

  var radiusVar = getVar("button/radius");

  if (sizeKey === "icon") {
    var iconSize = resolveToken("button/icon-size") || 40;
    resizeKeep(comp, iconSize, iconSize);
    comp.primaryAxisSizingMode = "FIXED";
    comp.counterAxisSizingMode = "FIXED";
    comp.paddingTop = 0;
    comp.paddingBottom = 0;
    comp.paddingLeft = 0;
    comp.paddingRight = 0;
    bindSize(comp, getVar("button/icon-size"), getVar("button/icon-size"));
  } else if (variantKey === "link") {
    // Real "link" variant is p-0 h-auto — plain underlined inline text,
    // no padding, no button-shaped box
    comp.paddingTop = 0;
    comp.paddingBottom = 0;
    comp.paddingLeft = 0;
    comp.paddingRight = 0;
  } else {
    bindPadding(
      comp,
      getVar("button/padding-y/" + sizeToken),
      getVar("button/padding-x/" + sizeToken),
      getVar("button/padding-y/" + sizeToken),
      getVar("button/padding-x/" + sizeToken)
    );
  }

  bindCornerRadius(comp, radiusVar);

  var bgVar = pickDisabled(
    disabled,
    "button/" + tokenVariant + "/background" + stateSuffix,
    "button/" + tokenVariant + "/background-disabled"
  );
  if (bgVar) {
    bindFill(comp, bgVar);
  } else {
    comp.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
  }

  var borderVar = pickDisabled(
    disabled,
    "button/" + tokenVariant + "/border",
    "button/" + tokenVariant + "/border-disabled"
  );
  var borderWidthVar = getVar("button/border-width");
  if (borderVar) {
    bindStroke(comp, borderVar, borderWidthVar);
  } else {
    // ghost and link are border-transparent in code: the 1px border still takes space
    transparentBorder(comp, borderWidthVar);
  }

  // Plan 217 (owner J3): a hidden spinner, shown by the `loading` property like the
  // code's loading prop; sized and drawn from the button.spinner tokens
  var spinnerColorVar =
    variantKey === "link"
      ? pickDisabled(disabled, "button/link-text", "button/link-text-disabled")
      : pickDisabled(
          disabled,
          "button/" + tokenVariant + "/text",
          "button/" + tokenVariant + "/text-disabled"
        );
  var spinnerSizeVar = getVar("button/spinner/size");
  var spinnerSize = resolveSpace(spinnerSizeVar) || 16;
  // a ring with the top quarter open (border-top-color: transparent in code), drawn as a
  // 270 degree arc; it does not spin in Figma
  var spinner = figma.createEllipse();
  spinner.name = "spinner";
  spinner.fills = [];
  resizeKeep(spinner, spinnerSize, spinnerSize);
  bindSize(spinner, spinnerSizeVar, spinnerSizeVar);
  bindStroke(spinner, spinnerColorVar, getVar("button/spinner/border-width"));
  spinner.arcData = {
    startingAngle: -Math.PI / 4,
    endingAngle: -Math.PI / 4 + (3 * Math.PI) / 2,
    innerRadius: 0,
  };
  spinner.visible = false;
  comp.appendChild(spinner);

  // Icon slot (Plan 217): hidden by default, before the label, spaced by button.icon-gap
  var buttonSlot = makeIcon("plus", 16, spinnerColorVar, getVar("icon/size/sm"));
  buttonSlot.name = "icon";
  buttonSlot.visible = false;
  comp.appendChild(buttonSlot);

  if (sizeKey !== "icon") {
    var label = makeText(
      "Button",
      "button/label/" + sizeToken,
      getVar("button/font-size/" + sizeToken),
      getVar("button/font-weight"),
      variantKey === "link"
        ? pickDisabled(disabled, "button/link-text", "button/link-text-disabled")
        : pickDisabled(
            disabled,
            "button/" + tokenVariant + "/text",
            "button/" + tokenVariant + "/text-disabled"
          ),
      getVar("button/line-height")
    );
    // hover:underline in code: the link is underlined on hover and press, not at rest
    // The label carries NO text style: the labels of a Button share one text property, and
    // on a label with a style a decoration set on one spreads to all of them (found on the
    // rebuilt library, 2026-11-05: 60 of 60 labels underlined). Without the style it stays on
    // this label, which keeps its direct variable bindings from makeText.
    if (variantKey === "link" && state && state !== "default") {
      pendingTextStyles = pendingTextStyles.filter(function (item) {
        return item.node !== label;
      });
      unstyledLayers.push({
        layer: "button/label/" + sizeToken + " \"Button\" (link " + state + ")",
        token: "link underline: a text style would spread it to every Button label",
      });
      try {
        label.textDecoration = "UNDERLINE";
        label.textDecorationOffset = {
          unit: "PIXELS",
          value: resolveSpace(getVar("button/link-underline-offset")),
        };
        // Without the style the line height falls back to AUTO (24 against the default's 16
        // at md), so the button grew on hover; the UI keeps button.line-height in every state
        var linkLineHeight = resolveToken("button/line-height");
        if (typeof linkLineHeight === "number") {
          label.lineHeight = { unit: "PERCENT", value: linkLineHeight };
        }
      } catch (e) {}
    }
    comp.appendChild(label);
  } else {
    // the stories render a 24px lucide Heart inside the icon button
    comp.appendChild(
      makeIcon(
        "heart",
        24,
        pickDisabled(
          disabled,
          "button/" + tokenVariant + "/text",
          "button/" + tokenVariant + "/text-disabled"
        ),
        null
      )
    );
  }

  return comp;
}

function buildButton(x, y) {
  var variants = [
    "default",
    "secondary",
    "outline",
    "ghost",
    "link",
    "destructive",
  ];
  var sizes = ["sm", "md", "lg", "icon"];
  var configs = [];
  // Matches the Storybook stories (AllVariants, AllSizes, States) plus the
  // icon size from the code. rows = variant. Disabled is drawn for every variant and
  // size: it keeps the variant's colours at 60% opacity (Plan 223), so it differs from rest.
  var variants = ["default", "secondary", "outline", "ghost", "link", "destructive"];
  var disabledFor = { default: true, secondary: true, outline: true, ghost: true, link: true, destructive: true };
  for (var i = 0; i < variants.length; i++) {
    var passes = disabledFor[variants[i]] ? [false, true] : [false];
    for (var p = 0; p < passes.length; p++) {
      for (var j = 0; j < sizes.length; j++) {
        // hover and pressed (Plan 137): a disabled button has pointer-events-none, so
        // it has neither
        var states = passes[p] ? ["default"] : ["default", "hover", "pressed"];
        for (var t = 0; t < states.length; t++) {
          (function (variant, size, disabled, state) {
            configs.push({
              variantProps: {
                variant: variant,
                size: size,
                disabled: String(disabled),
                state: state,
              },
              buildFn: function () {
                return buildButtonVariant(variant, size, disabled, state);
              },
            });
          })(variants[i], sizes[j], passes[p], states[t]);
        }
      }
    }
  }
  var buttonSet = buildComponentSet("Button", configs, "variant", x, y);
  pendingStateSets.push({
    set: buttonSet,
    props: configs.map(function (c) {
      return c.variantProps;
    }),
  });
  // Pilot (J1): the label is `children` in code
  addTextProperty(buttonSet, "children", "Button");
  addBooleanProperty(buttonSet, "loading", "spinner", false);
  addIconSlot(buttonSet, "icon", "plus", "sm");
  return buttonSet;
}

// ============================================================
// BADGE
// Grid: rows = variant, columns = size (interactive pairs within each cell)
// ============================================================

// interaction: "default", "hover" or "pressed" (Plan 137). The code changes only the background
// (hover:bg-*, active:bg-*) and only when the badge is interactive; the border keeps its rest colour.
function buildBadgeVariant(variantKey, sizeKey, interactive, disabled, interaction) {
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "AUTO";

  bindPadding(
    comp,
    getVar("badge/padding-y/" + sizeKey),
    getVar("badge/padding-x/" + sizeKey),
    getVar("badge/padding-y/" + sizeKey),
    getVar("badge/padding-x/" + sizeKey)
  );

  bindCornerRadius(comp, getVar("badge/radius"));
  if (!getVar("badge/radius")) comp.cornerRadius = 9999;
  var radiusVar = getVar("badge/radius");
  if (radiusVar) {
    try {
      comp.setBoundVariable("cornerRadius", radiusVar);
    } catch (e) {}
  }

  var badgeStateSuffix = interaction === "hover" ? "-hover" : interaction === "pressed" ? "-active" : "";
  var bgVar = pickDisabled(
    disabled,
    "badge/" + variantKey + "/background" + badgeStateSuffix,
    "badge/" + variantKey + "/background-disabled"
  );
  var borderVar = pickDisabled(
    disabled,
    "badge/" + variantKey + "/border",
    "badge/" + variantKey + "/border-disabled"
  );

  if (bgVar) {
    bindFill(comp, bgVar);
  } else {
    comp.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
  }

  var borderWidthVar = getVar("badge/border-width");
  if (borderVar) {
    bindStroke(comp, borderVar, borderWidthVar);
  } else {
    comp.strokes = [];
  }

  // `interactive` only adds cursor-pointer/focus-ring/hover-bg behavior \u2014
  // there is no dismiss/close glyph on the real component
  var label = makeText(
    "Badge",
    "badge/label/" + sizeKey,
    getVar("badge/font-size/" + sizeKey),
    getVar("badge/font-weight"),
    pickDisabled(
      disabled,
      "badge/" + variantKey + "/text",
      "badge/" + variantKey + "/text-disabled"
    ),
    getVar("badge/line-height")
  );
  var badgeSlot = makeIcon(
    "plus",
    12,
    pickDisabled(disabled, "badge/" + variantKey + "/text", "badge/" + variantKey + "/text-disabled"),
    getVar("icon/size/xs")
  );
  badgeSlot.name = "icon";
  badgeSlot.visible = false;
  comp.appendChild(badgeSlot);
  var badgeGapVar = getVar("badge/icon-gap");
  comp.itemSpacing = badgeGapVar ? resolveSpace(badgeGapVar) : 4;
  bindProp(comp, "itemSpacing", badgeGapVar);
  comp.appendChild(label);

  return comp;
}

function buildBadge(x, y) {
  // Matches the Storybook stories: seven variants x three sizes. There is no
  // persistent disabled look to draw: the colour tokens only apply to a real
  // <button disabled>, and the story fakes it with opacity-50 on a span. The
  // `interactive` prop only adds hover/focus.
  var variants = ["default", "secondary", "success", "info", "warning", "destructive", "outline"];
  var sizes = ["sm", "md", "lg"];
  var configs = [];
  for (var i = 0; i < variants.length; i++) {
    for (var j = 0; j < sizes.length; j++) {
      (function (variant, size) {
        // hover and pressed show what an interactive badge does (Plan 137); the rest look
        // is the same either way
        ["default", "hover", "pressed"].forEach(function (interaction) {
          configs.push({
            variantProps: { variant: variant, size: size, interaction: interaction },
            buildFn: function () {
              return buildBadgeVariant(variant, size, false, false, interaction);
            },
          });
        });
      })(variants[i], sizes[j]);
    }
  }
  var badgeSet = buildComponentSet("Badge", configs, "variant", x, y);
  pendingStateSets.push({
    set: badgeSet,
    props: configs.map(function (c) {
      return c.variantProps;
    }),
  });
  addIconSlot(badgeSet, "icon", "plus", "xs");
  return badgeSet;
}

// ============================================================
// INPUT
// Variants: size (sm, md, lg) × inputState (default, error, success)
// Fixed height from token, full-width auto layout
// ============================================================

function buildInputVariant(sizeKey, stateKey) {
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "MIN"; // left-align content
  comp.counterAxisAlignItems = "CENTER"; // vertically center text

  // Resolve padding values first
  var padYVar = getVar("input/padding-y/" + sizeKey);
  var padXVar = getVar("input/padding-x");
  var padY = resolveSpace(padYVar) || 8;
  var padX = resolveSpace(padXVar) || 16;

  comp.paddingTop = padY;
  bindProp(comp, "paddingTop", padYVar);
  comp.paddingBottom = padY;
  bindProp(comp, "paddingBottom", padYVar);
  comp.paddingLeft = padX;
  bindProp(comp, "paddingLeft", padXVar);
  comp.paddingRight = padX;
  bindProp(comp, "paddingRight", padXVar);
  try {
    if (padYVar) comp.setBoundVariable("paddingTop", padYVar);
    if (padYVar) comp.setBoundVariable("paddingBottom", padYVar);
    if (padXVar) comp.setBoundVariable("paddingLeft", padXVar);
    if (padXVar) comp.setBoundVariable("paddingRight", padXVar);
  } catch (e) {}

  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "AUTO";
  resizeKeep(comp, 240, 40);

  // Radius
  bindCornerRadius(comp, getVar("input/radius"));

  // Background — same for all states except disabled, which has its own
  // (disabled:bg-...); the other states are told apart by border
  bindFill(
    comp,
    stateKey === "hover" && getVar("input/background-hover")
      ? getVar("input/background-hover")
      : pickDisabled(
          stateKey === "disabled",
          "input/default/background",
          "input/background-disabled"
        )
  );

  // Border — color varies by state, no border-width token on input (1px default)
  var borderPaths = {
    default: "input/border",
    error: "input/border-error",
    success: "input/border-success",
  };
  var borderVar = getVar(borderPaths[stateKey] || "input/border");
  if (borderVar) bindStroke(comp, borderVar, null);

  // Placeholder text
  var fontSizeVar = getVar("input/font-size/" + sizeKey);
  var placeholderVar = getVar("input/placeholder");
  var label = makeText(
    "Placeholder text",
    "input/placeholder/" + sizeKey,
    fontSizeVar,
    null,
    placeholderVar
  );
  // Make text fill the available width inside the input
  try {
    label.layoutSizingHorizontal = "FILL";
  } catch (e) {}
  comp.appendChild(label);

  return comp;
}

function buildInput(x, y) {
  var sizes = ["sm", "md", "lg"];
  // hover:bg-input-background-hover applies to the default look (Plan 137)
  var states = ["default", "hover", "error", "success", "disabled"];
  var configs = [];
  for (var i = 0; i < sizes.length; i++) {
    for (var j = 0; j < states.length; j++) {
      (function (size, state) {
        configs.push({
          variantProps: { size: size, state: state },
          buildFn: function () {
            return buildInputVariant(size, state);
          },
        });
      })(sizes[i], states[j]);
    }
  }
  var inputSet = buildComponentSet("Input", configs, "size", x, y);
  pendingStateSets.push({
    set: inputSet,
    props: configs.map(function (c) {
      return c.variantProps;
    }),
  });
  return inputSet;
}

// ============================================================
// ALERT
// Variants: variant (default, destructive, warning, success)
// Composed of: icon slot + title + description
// Note: border-left-width = 4px accent, all other sides = 1px
// ============================================================

function buildAlertVariant(variantKey) {
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "MIN";
  comp.counterAxisAlignItems = "MIN";
  comp.primaryAxisSizingMode = "FIXED"; // FILL invalid on top-level; use fixed width
  comp.counterAxisSizingMode = "AUTO";
  // code lays an Alert's children out as they come: no icon gap (Plan 217)
  comp.itemSpacing = 0;
  resizeKeep(comp, 400, 80);

  // Padding
  var padXVar = getVar("alert/padding-x");
  var padYVar = getVar("alert/padding-y");
  bindPadding(comp, padYVar, padXVar, padYVar, padXVar);

  // Radius
  var radiusVar = getVar("alert/radius");
  bindCornerRadius(comp, radiusVar);

  // Background + text fill
  var bgVar = getVar("alert/" + variantKey + "/background");
  if (bgVar) bindFill(comp, bgVar);

  // Full border (1px)
  var borderVar = getVar("alert/" + variantKey + "/border");
  if (borderVar) bindStroke(comp, borderVar, null);

  // Left accent border — applied as additional left stroke via strokeWeight override
  // Figma doesn't support per-side borders natively so we use a nested frame trick
  // The left accent is represented as a visible left border weight
  comp.strokeLeftWeight = resolveToken("alert/border-left-width") || 4;
  comp.strokeTopWeight = 1;
  comp.strokeRightWeight = 1;
  comp.strokeBottomWeight = 1;
  comp.strokeAlign = "INSIDE";

  // Text content — vertical stack
  // Icon slot (Plan 217): hidden by default, a row with the text column, spaced by alert.icon-gap
  var alertIconSizeVar = getVar("alert/icon-size");
  var alertSlot = makeIcon(
    "info",
    resolveSpace(alertIconSizeVar) || 16,
    getVar("alert/" + variantKey + "/text"),
    alertIconSizeVar
  );
  alertSlot.name = "icon";
  alertSlot.visible = false;
  comp.appendChild(alertSlot);
  var alertGapVar = getVar("alert/icon-gap");
  comp.itemSpacing = alertGapVar ? resolveSpace(alertGapVar) : 12;
  bindProp(comp, "itemSpacing", alertGapVar);

  var textStack = figma.createFrame();
  textStack.layoutMode = "VERTICAL";
  textStack.primaryAxisSizingMode = "AUTO";
  textStack.counterAxisSizingMode = "AUTO";
  textStack.itemSpacing = resolveToken("alert/title-margin-bottom") || 4;
  bindProp(textStack, "itemSpacing", getVar("alert/title-margin-bottom"));
  textStack.fills = [];

  var titleVar = getVar("alert/" + variantKey + "/text");
  var titleFontSizeVar = getVar("alert/title/font-size");
  var titleWeightVar = getVar("alert/title/font-weight");
  var title = makeText(
    "Alert Title",
    "alert/title/" + variantKey,
    titleFontSizeVar,
    titleWeightVar,
    titleVar,
    getVar("alert/title/line-height"),
    getVar("alert/title/letter-spacing")
  );
  textStack.appendChild(title);

  var descFontSizeVar = getVar("alert/description-font-size");
  var desc = makeText(
    "Alert description text goes here.",
    "alert/description/" + variantKey,
    descFontSizeVar,
    null,
    titleVar,
    getVar("alert/description/line-height")
  );
  textStack.appendChild(desc);

  comp.appendChild(textStack);
  try {
    textStack.layoutSizingHorizontal = "FILL"; // the text column fills the row, like flex-1 in code
  } catch (e) {}

  return comp;
}

function buildAlert(x, y) {
  var variants = ["default", "destructive", "warning", "success", "info"];
  var configs = [];
  for (var i = 0; i < variants.length; i++) {
    (function (variant) {
      configs.push({
        variantProps: { variant: variant },
        buildFn: function () {
          return buildAlertVariant(variant);
        },
      });
    })(variants[i]);
  }
  var alertSet = buildComponentSet("Alert", configs, "variant", x, y);
  addIconSlot(alertSet, "icon", "info", "sm");
  return alertSet;
}

// ============================================================
// CARD
// Variants: interactive (true, false)
// Composed of: CardHeader (title + description) + CardContent + CardFooter
// ============================================================

// interaction: "default", "hover" or "pressed" (Plan 137). An interactive card fills with
// card.background-hover and borders with card.border-hover on hover; pressed takes
// card.background-active and keeps the hover border (active:bg follows hover:bg in code).
function buildCardVariant(interactive, interaction) {
  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisAlignItems = "MIN";
  comp.counterAxisAlignItems = "MIN";
  // Width is fixed (the story's 320 frame); height hugs the content like the UI does, so
  // the footer boolean and longer text change the height instead of overflowing a fixed 200
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, 320, 200);
  comp.primaryAxisSizingMode = "AUTO";

  // Padding + gap
  var paddingVar = getVar("card/padding");
  var padding = resolveSpace(paddingVar);
  comp.paddingTop = padding;
  bindProp(comp, "paddingTop", paddingVar);
  comp.paddingBottom = padding;
  bindProp(comp, "paddingBottom", paddingVar);
  comp.paddingLeft = padding;
  bindProp(comp, "paddingLeft", paddingVar);
  comp.paddingRight = padding;
  bindProp(comp, "paddingRight", paddingVar);
  try {
    comp.setBoundVariable("paddingTop", paddingVar);
    comp.setBoundVariable("paddingBottom", paddingVar);
    comp.setBoundVariable("paddingLeft", paddingVar);
    comp.setBoundVariable("paddingRight", paddingVar);
  } catch (e) {}

  var gapVar = getVar("card/gap");
  comp.itemSpacing = resolveSpace(gapVar);
  bindProp(comp, "itemSpacing", gapVar);
  try {
    comp.setBoundVariable("itemSpacing", gapVar);
  } catch (e) {}

  // Real cardVariants (packages/ui/src/card.tsx): interactive:true only adds
  // hover:/focus:/active: pseudo-class classes — at rest it renders
  // identically to interactive:false. Confirmed against the "Interactive
  // Card" story, which shows no visible difference until actually hovered.
  // So both variants correctly use the same resting-state tokens here.
  bindCornerRadius(comp, getVar("card/radius"));
  bindFill(
    comp,
    interaction === "pressed" && getVar("card/background-active")
      ? getVar("card/background-active")
      : interaction === "hover" && getVar("card/background-hover")
        ? getVar("card/background-hover")
        : getVar("card/background")
  );
  bindStroke(
    comp,
    interaction && interaction !== "default" && getVar("card/border-hover")
      ? getVar("card/border-hover")
      : getVar("card/border"),
    null
  );

  // Shadow: card.shadow is {shadow.sm}, so use the shared shadow/sm effect
  // style like every other surface (the old hand-rolled effect read
  // primitive tokens that do not exist and fell back to made-up numbers).
  applyEffectStyle(comp, "shadow/sm");

  // Header — title + description
  var header = figma.createFrame();
  header.layoutMode = "VERTICAL";
  header.primaryAxisSizingMode = "AUTO";
  header.counterAxisSizingMode = "AUTO";
  header.itemSpacing = resolveToken("card/header-gap") || 8;
  bindProp(header, "itemSpacing", getVar("card/header-gap"));
  header.fills = [];

  var titleFontSizeVar = getVar("card/header/title/font-size");
  var titleWeightVar = getVar("card/title/font-weight");
  var titleColorVar = getVar("card/header/title/color");
  var titleText = makeText(
    "Card Title",
    "card/title",
    titleFontSizeVar,
    titleWeightVar,
    titleColorVar,
    getVar("card/title/line-height"),
    getVar("card/title/letter-spacing")
  );
  // Hidden icon row for the Section Features cards variant (an instance cannot take new
  // children). Hidden layers add no height, so every Card variant is unchanged.
  var iconWrap = makeStack("icon-wrap", "V", null);
  iconWrap.paddingBottom = resolveSpace(getVar("section-features/card.icon-margin-bottom"));
  bindProp(iconWrap, "paddingBottom", getVar("section-features/card.icon-margin-bottom"));
  iconWrap.appendChild(makeFeatureIconTile());
  var featureIcon = makeStack("feature-icon", "V", null);
  featureIcon.paddingBottom = resolveSpace(getVar("section-features/card.row-margin-bottom"));
  bindProp(featureIcon, "paddingBottom", getVar("section-features/card.row-margin-bottom"));
  featureIcon.appendChild(iconWrap);
  header.appendChild(featureIcon);
  featureIcon.visible = false;
  header.appendChild(titleText);

  var descFontSizeVar = getVar("card/header/description/font-size");
  var descColorVar = getVar("card/header/description/color");
  var descText = makeText(
    "Card description text",
    "card/description",
    descFontSizeVar,
    null,
    descColorVar,
    getVar("card/header/description/line-height")
  );
  appendWrapped(header, descText); // wraps in a narrower card, like the UI
  comp.appendChild(header);
  stretch(header);

  // Content
  var contentFontSizeVar = getVar("card/content/font-size");
  var contentColorVar = getVar("card/content/color");
  var contentText = makeText(
    "Card content goes here.",
    "card/content",
    contentFontSizeVar,
    null,
    contentColorVar,
    getVar("card/content/line-height")
  );
  appendWrapped(comp, contentText);

  // Footer placeholder
  var footer = figma.createFrame();
  footer.name = "card-footer";
  footer.layoutMode = "HORIZONTAL";
  footer.primaryAxisSizingMode = "AUTO";
  footer.counterAxisSizingMode = "AUTO";
  footer.fills = [];
  footer.itemSpacing = resolveToken("card/footer/gap") || 8;
  bindProp(footer, "itemSpacing", getVar("card/footer/gap"));
  var footerLabel = makeText(
    "Footer",
    "card/footer",
    getVar("card/content/font-size"),
    null,
    getVar("card/content/color")
  );
  footer.appendChild(footerLabel);
  comp.appendChild(footer);

  return comp;
}

function buildCard(x, y) {
  // `interactive` only adds hover/focus/active classes, so at rest a card is
  // the same either way: one variant
  var configs = ["default", "hover", "pressed"].map(function (interaction) {
    return {
      variantProps: { interaction: interaction },
      buildFn: function () {
        return buildCardVariant(false, interaction);
      },
    };
  });
  var cardSet = buildComponentSet("Card", configs, "interaction", x, y);
  pendingStateSets.push({
    set: cardSet,
    props: configs.map(function (c) {
      return c.variantProps;
    }),
  });
  // Pilot (J1): the card parts are CardTitle, CardDescription, CardContent, CardFooter
  addTextProperty(cardSet, "title", "Card Title");
  addTextProperty(cardSet, "description", "Card description text");
  addTextProperty(cardSet, "content", "Card content goes here.");
  addBooleanProperty(cardSet, "footer", "card-footer", true);
  return cardSet;
}

// ============================================================
// AVATAR
// Variants: size (sm, md, lg, xl) × state (image, fallback)
// ============================================================

var AVATAR_SIZES = { sm: "sm", md: "md", lg: "lg", xl: "xl" };
var AVATAR_INITIALS = { sm: "A", md: "AB", lg: "AB", xl: "AB" };

function buildAvatarVariant(sizeKey, stateKey) {
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";

  var sizeVar = getVar("avatar/size/" + sizeKey);
  var size = resolveSpace(sizeVar) || 40;
  if (size < 1) size = 40;
  resizeKeep(comp, size, size);
  if (sizeVar) {
    try {
      comp.setBoundVariable("width", sizeVar);
    } catch (e) {}
  }
  if (sizeVar) {
    try {
      comp.setBoundVariable("height", sizeVar);
    } catch (e) {}
  }

  // Full circle — bind variable, fallback to hardcoded 9999
  var roundedVar = getVar("avatar/rounded");
  if (roundedVar) {
    try {
      comp.setBoundVariable("cornerRadius", roundedVar);
    } catch (e) {
      comp.cornerRadius = 9999;
    }
  } else {
    comp.cornerRadius = 9999;
  }

  // Border
  bindStroke(comp, getVar("avatar/border"), null);

  // Clip content so the circular mask works correctly on both states
  comp.clipsContent = true;

  if (stateKey === "image") {
    // No background fill on component — the image-slot provides the visual
    comp.fills = [];

    // Image placeholder frame — must also be circular to fill the component correctly
    var img = figma.createFrame();
    img.name = "image-slot";
    resizeKeep(img, size, size);
    img.cornerRadius = 9999;
    bindProp(img, "cornerRadius", getVar("avatar/rounded"));
    img.fills = [{ type: "SOLID", color: { r: 0.7, g: 0.7, b: 0.75 } }];
    bindFill(img, getVar("avatar/background"));
    comp.appendChild(img);
  } else {
    // Fallback state — initials on bg
    var fallbackBgVar = getVar("avatar/fallback-background");
    if (fallbackBgVar) bindFill(comp, fallbackBgVar);

    var fallbackFontSizeVar = getVar("avatar/fallback/font-size/" + sizeKey);
    var fallbackWeightVar = getVar("avatar/fallback-font-weight");
    var fallbackTextVar = getVar("avatar/fallback-text");
    var initials = AVATAR_INITIALS[sizeKey] || "AB";
    var label = makeText(
      initials,
      "avatar/fallback/" + sizeKey,
      fallbackFontSizeVar,
      fallbackWeightVar,
      fallbackTextVar
    );
    comp.appendChild(label);
  }

  return comp;
}

function buildAvatar(x, y) {
  var sizes = ["sm", "md", "lg", "xl"];
  var states = ["image", "fallback"];
  var configs = [];
  for (var i = 0; i < sizes.length; i++) {
    for (var j = 0; j < states.length; j++) {
      (function (size, state) {
        configs.push({
          variantProps: { size: size, state: state },
          buildFn: function () {
            return buildAvatarVariant(size, state);
          },
        });
      })(sizes[i], states[j]);
    }
  }
  return buildComponentSet("Avatar", configs, "state", x, y);
}

// ============================================================
// CHECKBOX
// Variants: size (sm, md, lg) × checked (true, false, indeterminate)
// ============================================================

function buildCheckboxVariant(sizeKey, checkedState, disabled) {
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  comp.clipsContent = false;

  var sizeVar = getVar("checkbox/size/" + sizeKey);
  var size = resolveSpace(sizeVar) || 16;
  resizeKeep(comp, size, size);
  if (sizeVar) {
    try {
      comp.setBoundVariable("width", sizeVar);
    } catch (e) {}
  }
  if (sizeVar) {
    try {
      comp.setBoundVariable("height", sizeVar);
    } catch (e) {}
  }

  var radiusVar = getVar("checkbox/border/radius");
  bindCornerRadius(comp, radiusVar);

  var borderWidthVar = getVar("checkbox/border/width");

  if (checkedState === "true") {
    // Checked: filled background + matching border + white indicator
    bindFill(
      comp,
      pickDisabled(disabled, "checkbox/background-checked", "checkbox/background-disabled")
    );
    bindStroke(
      comp,
      pickDisabled(disabled, "checkbox/border-checked", "checkbox/border-disabled"),
      borderWidthVar
    );

    // White checkmark indicator
    var iconSizeVar = getVar("checkbox/icon/size/" + sizeKey);
    var iconSize = resolveSpace(iconSizeVar) || Math.round(size * 0.55);
    var textColor = pickDisabled(disabled, "checkbox/text-checked", "checkbox/text-disabled");
    // a real check glyph; the old filled square covered the whole box, so
    // checked looked blank (white on the teal fill, brown when disabled)
    var indicator = makeIcon("check", iconSize, textColor, iconSizeVar);
    indicator.name = "checkmark";
    comp.appendChild(indicator);
  } else if (checkedState === "indeterminate") {
    // Indeterminate: same filled background, dash indicator
    bindFill(
      comp,
      pickDisabled(disabled, "checkbox/background-checked", "checkbox/background-disabled")
    );
    bindStroke(
      comp,
      pickDisabled(disabled, "checkbox/border-checked", "checkbox/border-disabled"),
      borderWidthVar
    );

    var dashW = Math.round(size * 0.55);
    var dash = figma.createFrame();
    dash.name = "dash";
    resizeKeep(dash, dashW, 2);
    dash.cornerRadius = 1;
    dash.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]; // white
    var textColor2 = pickDisabled(disabled, "checkbox/text-checked", "checkbox/text-disabled");
    if (textColor2) bindFill(dash, textColor2);
    comp.appendChild(dash);
  } else if (checkedState === "error") {
    // Unchecked + error: transparent fill, red border, no indicator
    // (error border only shows unchecked — data-[state=checked] wins the cascade when checked)
    comp.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
    bindStroke(comp, getVar("checkbox/error-border"), borderWidthVar);
  } else {
    // Unchecked: transparent fill, gray border, no indicator (disabled gets
    // its own background and border colours)
    comp.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
    bindStroke(
      comp,
      pickDisabled(disabled, "checkbox/border/color", "checkbox/border-disabled"),
      borderWidthVar
    );
  }

  return comp;
}

function buildCheckbox(x, y) {
  var sizes = ["sm", "md", "lg"];
  var states = ["false", "true", "indeterminate", "error"];
  var configs = [];
  for (var i = 0; i < sizes.length; i++) {
    for (var j = 0; j < states.length; j++) {
      (function (size, state) {
        configs.push({
          variantProps: { size: size, checked: state, disabled: "false" },
          buildFn: function () {
            return buildCheckboxVariant(size, state, false);
          },
        });
        // disabled combines with the three real check states (the error
        // border is only visible unchecked and never combines with disabled)
        if (state !== "error") {
          configs.push({
            variantProps: { size: size, checked: state, disabled: "true" },
            buildFn: function () {
              return buildCheckboxVariant(size, state, true);
            },
          });
        }
      })(sizes[i], states[j]);
    }
  }
  return buildComponentSet("Checkbox", configs, "size", x, y);
}

// ============================================================
// RADIO
// Variants: size (sm, md, lg) × checked (true, false)
// ============================================================

function buildRadioVariant(sizeKey, checked, disabled) {
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  comp.clipsContent = true;

  var sizeVar = getVar("radio/size/" + sizeKey);
  var size = resolveSpace(sizeVar) || 16;
  resizeKeep(comp, size, size);
  if (sizeVar) {
    try {
      comp.setBoundVariable("width", sizeVar);
    } catch (e) {}
  }
  if (sizeVar) {
    try {
      comp.setBoundVariable("height", sizeVar);
    } catch (e) {}
  }

  // Full circle
  var radiusVar = getVar("radio/border-radius");
  if (radiusVar) {
    try {
      comp.setBoundVariable("cornerRadius", radiusVar);
    } catch (e) {
      comp.cornerRadius = 9999;
    }
  } else {
    comp.cornerRadius = 9999;
  }

  var borderWidthVar = getVar("radio/focus-ring/width"); // closest to a border-width token
  if (checked) {
    bindFill(
      comp,
      pickDisabled(disabled, "radio/background-checked", "radio/background-disabled")
    );
    bindStroke(
      comp,
      pickDisabled(disabled, "radio/border-checked", "radio/border-disabled"),
      null
    );
  } else {
    comp.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
    bindStroke(
      comp,
      pickDisabled(disabled, "radio/border", "radio/border-disabled"),
      null
    );
  }

  // Inner dot for checked state
  if (checked) {
    var indicatorSizeVar = getVar("radio/indicator-size-" + sizeKey);
    var indicatorSize = resolveSpace(indicatorSizeVar) || size * 0.4;
    var dot = figma.createFrame();
    dot.name = "indicator";
    resizeKeep(dot, indicatorSize, indicatorSize);
    var indicatorSizeVar2 = getVar("radio/indicator-size-" + sizeKey);
    bindSize(dot, indicatorSizeVar2, indicatorSizeVar2);
    dot.cornerRadius = 9999;
    bindProp(dot, "cornerRadius", getVar("radio/border-radius"));
    var indicatorColor = pickDisabled(disabled, "radio/indicator", "radio/indicator-disabled");
    if (indicatorColor) bindFill(dot, indicatorColor);
    else dot.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    comp.appendChild(dot);
  }

  return comp;
}

function buildRadio(x, y) {
  var sizes = ["sm", "md", "lg"];
  var configs = [];
  for (var i = 0; i < sizes.length; i++) {
    (function (size) {
      [false, true].forEach(function (disabled) {
        configs.push({
          variantProps: { size: size, checked: "false", disabled: String(disabled) },
          buildFn: function () {
            return buildRadioVariant(size, false, disabled);
          },
        });
        configs.push({
          variantProps: { size: size, checked: "true", disabled: String(disabled) },
          buildFn: function () {
            return buildRadioVariant(size, true, disabled);
          },
        });
      });
    })(sizes[i]);
  }
  return buildComponentSet("Radio", configs, "size", x, y);
}

// ============================================================
// SWITCH
// Variants: size (sm, md, lg) × checked (true, false)
// Track is fixed-size frame; thumb positioned absolutely via x offset
// checked=true: thumb at right edge (translate token)
// checked=false: thumb at left edge (2px from left)
// ============================================================

function buildSwitchVariant(sizeKey, checked, disabled) {
  var trackWidthVar = getVar("switch/track/width/" + sizeKey);
  var trackHeightVar = getVar("switch/track/height/" + sizeKey);
  var thumbSizeVar = getVar("switch/thumb/size/" + sizeKey);
  var translateVar = getVar("switch/thumb/translate/" + sizeKey);

  var trackW = resolveSpace(trackWidthVar) || 40;
  var trackH = resolveSpace(trackHeightVar) || 24;
  var thumbSize = resolveSpace(thumbSizeVar) || 20;
  var translate = resolveSpace(translateVar) || 16;

  var comp = figma.createComponent();
  comp.layoutMode = "NONE"; // absolute positioning for thumb
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, trackW, trackH);
  if (trackWidthVar) {
    try {
      comp.setBoundVariable("width", trackWidthVar);
    } catch (e) {}
  }
  if (trackHeightVar) {
    try {
      comp.setBoundVariable("height", trackHeightVar);
    } catch (e) {}
  }
  comp.clipsContent = false;

  // Track radius
  var trackRadiusVar = getVar("switch/track/radius");
  if (trackRadiusVar) {
    try {
      comp.setBoundVariable("cornerRadius", trackRadiusVar);
    } catch (e) {}
  } else {
    comp.cornerRadius = 9999;
  }

  // Track fill — checked vs unchecked
  var trackBgVar = checked
    ? getVar("switch/track/background-checked")
    : getVar("switch/track/background-unchecked");
  if (trackBgVar) bindFill(comp, trackBgVar);

  // Border
  var trackBorderVar = getVar("switch/track/border-width");
  // The token is 0px (border-transparent in code), so nothing is drawn: a fallback of 2 here
  // gave every switch a 2px stroke the UI does not have.
  var trackBorderWidth = trackBorderVar ? resolveSpace(trackBorderVar) : 0;
  if (trackBorderWidth > 0) {
    comp.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0 }];
    comp.strokeWeight = trackBorderWidth;
    comp.strokeAlign = "INSIDE";
  }

  // Thumb
  var thumb = figma.createFrame();
  thumb.name = "thumb";
  resizeKeep(thumb, thumbSize, thumbSize);
  bindSize(thumb, thumbSizeVar, thumbSizeVar);
  var thumbRadiusVar = getVar("switch/thumb/radius");
  if (thumbRadiusVar) {
    try {
      thumb.setBoundVariable("cornerRadius", thumbRadiusVar);
    } catch (e) {}
  } else {
    thumb.cornerRadius = 9999;
  }

  var thumbBgVar = getVar("switch/thumb/background");
  if (thumbBgVar) bindFill(thumb, thumbBgVar);
  else thumb.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  // switch.thumb.shadow is {shadow.lg} (the real thumb has shadow-lg)
  applyEffectStyle(thumb, "shadow/lg");

  // Position thumb: vertically centered, horizontally at left (unchecked) or right (checked)
  var thumbY = Math.round((trackH - thumbSize) / 2);
  // Unchecked: thumb inset = same margin as vertical centering for consistency
  var thumbInset = Math.max(1, Math.round((trackH - thumbSize) / 2));
  var thumbX = checked ? translate : thumbInset;
  thumb.x = thumbX;
  thumb.y = thumbY;

  comp.appendChild(thumb);

  return comp;
}

function buildSwitch(x, y) {
  var sizes = ["sm", "md", "lg"];
  var configs = [];
  for (var i = 0; i < sizes.length; i++) {
    (function (size) {
      [false, true].forEach(function (disabled) {
        configs.push({
          variantProps: { size: size, checked: "false", disabled: String(disabled) },
          buildFn: function () {
            return buildSwitchVariant(size, false, disabled);
          },
        });
        configs.push({
          variantProps: { size: size, checked: "true", disabled: String(disabled) },
          buildFn: function () {
            return buildSwitchVariant(size, true, disabled);
          },
        });
      });
    })(sizes[i]);
  }
  return buildComponentSet("Switch", configs, "size", x, y);
}

// ============================================================
// SEPARATOR
// Variants: orientation (horizontal, vertical)
// ============================================================

function buildSeparatorVariant(orientation) {
  var comp = figma.createComponent();
  var colorVar = getVar("separator/color");
  comp.cornerRadius = 0; // separators have no radius

  if (orientation === "horizontal") {
    comp.layoutMode = "HORIZONTAL";
    comp.primaryAxisSizingMode = "FIXED";
    comp.counterAxisSizingMode = "FIXED";
    var sepHVar = getVar("separator/height-horizontal");
    var sepH = resolveSpace(sepHVar) || 1;
    resizeKeep(comp, 240, sepH);
    if (sepHVar) {
      try {
        comp.setBoundVariable("height", sepHVar);
      } catch (e) {}
    }
    if (colorVar) bindFill(comp, colorVar);
  } else {
    comp.layoutMode = "VERTICAL";
    comp.primaryAxisSizingMode = "FIXED";
    comp.counterAxisSizingMode = "FIXED";
    var sepWVar = getVar("separator/width-vertical");
    var sepW = resolveSpace(sepWVar) || 1;
    resizeKeep(comp, sepW, 80);
    if (sepWVar) {
      try {
        comp.setBoundVariable("width", sepWVar);
      } catch (e) {}
    }
    if (colorVar) bindFill(comp, colorVar);
  }

  return comp;
}

function buildSeparator(x, y) {
  var configs = [
    {
      variantProps: { orientation: "horizontal" },
      buildFn: function () {
        return buildSeparatorVariant("horizontal");
      },
    },
    {
      variantProps: { orientation: "vertical" },
      buildFn: function () {
        return buildSeparatorVariant("vertical");
      },
    },
  ];
  return buildComponentSet("Separator", configs, "orientation", x, y);
}

// ============================================================
// LABEL
// Variants: size (sm, md, lg) × state (default, error, disabled)
// ============================================================

function buildLabelVariant(sizeKey, errorFlag, requiredFlag) {
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "AUTO";

  // The real Label has no bottom margin (the label/margin-bottom token was removed in Plan 193)
  comp.paddingBottom = 0;

  // Gap between label text and asterisk — use itemSpacing instead of paddingLeft on text node
  var reqMarginVar = getVar("label/required-margin-left");
  comp.itemSpacing = resolveSpace(reqMarginVar) || 4;
  bindProp(comp, "itemSpacing", reqMarginVar);

  var fontSizeVar = getVar("label/font-size/" + sizeKey);
  var fontWeightVar = getVar("label/font-weight");
  var colorVar = errorFlag
    ? getVar("label/error-text")
    : getVar("label/default-color");

  // Real Label uses the primitive `line-height-none` token directly (not a
  // component-specific one)
  var labelLineHeightVar = getVar("typography/line-height/none");

  var label = makeText(
    "Label",
    "label/" + sizeKey,
    fontSizeVar,
    fontWeightVar,
    colorVar,
    labelLineHeightVar
  );
  comp.appendChild(label);

  // Required asterisk only renders when the `required` prop is set — text nodes
  // don't support padding; spacing handled by itemSpacing above
  if (requiredFlag) {
    var asterisk = makeText(
      "*",
      "label/" + sizeKey,
      fontSizeVar,
      fontWeightVar,
      getVar("label/required-text"),
      labelLineHeightVar
    );
    comp.appendChild(asterisk);
  }

  return comp;
}

function buildLabel(x, y) {
  var sizes = ["sm", "md", "lg"];
  var errorFlags = [false, true];
  var requiredFlags = [false, true];
  var configs = [];
  for (var i = 0; i < sizes.length; i++) {
    for (var j = 0; j < errorFlags.length; j++) {
      for (var k = 0; k < requiredFlags.length; k++) {
        (function (size, errorFlag, requiredFlag) {
          configs.push({
            variantProps: {
              size: size,
              error: String(errorFlag),
              required: String(requiredFlag),
            },
            buildFn: function () {
              return buildLabelVariant(size, errorFlag, requiredFlag);
            },
          });
        })(sizes[i], errorFlags[j], requiredFlags[k]);
      }
    }
  }
  return buildComponentSet("Label", configs, "size", x, y);
}

// ============================================================
// TEXTAREA
// Variants: size (sm, md, lg) × inputState (default, error)
// min-height from token, padding from textarea/padding token
// ============================================================

function buildTextareaVariant(sizeKey, stateKey) {
  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisAlignItems = "MIN";
  comp.counterAxisAlignItems = "MIN";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";

  var minHeightVar = getVar("textarea/min-height/" + sizeKey);
  var minHeight = resolveSpace(minHeightVar) || 80;
  var padVar = getVar("textarea/padding");
  var pad = resolveSpace(padVar) || 16;

  resizeKeep(comp, 240, minHeight);
  if (minHeightVar) {
    try {
      comp.setBoundVariable("height", minHeightVar);
    } catch (e) {}
  }
  comp.paddingTop = pad;
  bindProp(comp, "paddingTop", padVar);
  comp.paddingBottom = pad;
  bindProp(comp, "paddingBottom", padVar);
  comp.paddingLeft = pad;
  bindProp(comp, "paddingLeft", padVar);
  comp.paddingRight = pad;
  bindProp(comp, "paddingRight", padVar);
  try {
    comp.setBoundVariable("paddingTop", padVar);
    comp.setBoundVariable("paddingBottom", padVar);
    comp.setBoundVariable("paddingLeft", padVar);
    comp.setBoundVariable("paddingRight", padVar);
  } catch (e) {}

  bindCornerRadius(comp, getVar("textarea/radius"));
  // shares the input background token, except disabled has its own
  bindFill(
    comp,
    pickDisabled(
      stateKey === "disabled",
      "input/default/background",
      "textarea/background-disabled"
    )
  );

  var textareaBorderPaths = {
    default: "input/border",
    error: "input/border-error",
    success: "input/border-success",
  };
  var borderVar = getVar(textareaBorderPaths[stateKey] || "input/border");
  if (borderVar) bindStroke(comp, borderVar, null);

  var fontSizeVar = getVar("textarea/font-size");
  var fontWeightVar = getVar("textarea/font-weight");
  var placeholderVar = getVar("input/placeholder");
  var label = makeText(
    "Placeholder text",
    "textarea/placeholder",
    fontSizeVar,
    fontWeightVar,
    placeholderVar
  );
  try {
    label.layoutSizingHorizontal = "FILL";
  } catch (e) {}
  comp.appendChild(label);

  return comp;
}

function buildTextarea(x, y) {
  var sizes = ["sm", "md", "lg"];
  var states = ["default", "error", "success", "disabled"];
  var configs = [];
  for (var i = 0; i < sizes.length; i++) {
    for (var j = 0; j < states.length; j++) {
      (function (size, state) {
        configs.push({
          variantProps: { size: size, state: state },
          buildFn: function () {
            return buildTextareaVariant(size, state);
          },
        });
      })(sizes[i], states[j]);
    }
  }
  return buildComponentSet("Textarea", configs, "size", x, y);
}

// ============================================================
// PROGRESS
// Variants: variant (default, success, warning, destructive)
// A numeric component property "value" (0–100) controls fill width.
// Default value = 50. Designers can update via component property inspector.
// ============================================================

function buildProgressVariant(variantKey, progressValue) {
  var trackHeightVar = getVar("progress/height");
  var trackH = resolveSpace(trackHeightVar) || 8;
  var trackW = 240;

  var comp = figma.createComponent();
  comp.layoutMode = "NONE"; // absolute positioning for fill
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, trackW, trackH);
  comp.clipsContent = true;

  // Track radius
  var radiusVar = getVar("progress/radius");
  if (radiusVar) {
    try {
      comp.setBoundVariable("cornerRadius", radiusVar);
    } catch (e) {
      comp.cornerRadius = 9999;
    }
  } else {
    comp.cornerRadius = 9999;
  }

  // Track background
  bindFill(comp, getVar("progress/background"));

  // Fill frame — width driven by progressValue percentage
  var fillW = Math.round((progressValue / 100) * trackW);
  if (fillW < 1) fillW = 1;
  var fill = figma.createFrame();
  fill.name = "fill";
  resizeKeep(fill, fillW, trackH);
  fill.x = 0;
  fill.y = 0;
  fill.cornerRadius = 9999;
  bindProp(fill, "cornerRadius", getVar("progress/radius"));

  var fillColorMap = {
    default: "progress/default-fill",
    success: "progress/success-fill",
    warning: "progress/warning-fill",
    destructive: "progress/destructive-fill",
  };
  bindFill(fill, getVar(fillColorMap[variantKey] || "progress/default-fill"));
  comp.appendChild(fill);

  // Expose progress value as a component property so designers can adjust in inspector
  try {
    comp.addComponentProperty("value", "NUMBER", progressValue);
  } catch (e) {
    // Component properties API may not be available — fill width is fixed at build time
  }

  return comp;
}

function buildProgress(x, y) {
  var variants = ["default", "success", "warning", "destructive"];
  var configs = [];
  for (var i = 0; i < variants.length; i++) {
    (function (variant) {
      configs.push({
        variantProps: { variant: variant },
        buildFn: function () {
          return buildProgressVariant(variant, 50);
        },
      });
    })(variants[i]);
  }
  return buildComponentSet("Progress", configs, "variant", x, y);
}

// ============================================================
// STYLE GENERATION
// Runs before component building. Creates:
// 1. Effect styles from semantic shadow tokens
// 2. Global text styles from semantic typography tokens
// ============================================================

var generatedEffectStyles = {};

// Parse a single CSS box-shadow string into a Figma DropShadow effect
// Handles: "X Y blur spread rgb(r g b / a)" and "inset X Y blur spread rgb(r g b / a)"
function parseShadowValue(cssValue) {
  var effects = [];
  var parts = cssValue.split(/,\s*(?=[^)]*(?:\(|$))/); // split on commas outside parens

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i].trim();
    var isInset = part.indexOf("inset") === 0;
    if (isInset) part = part.replace("inset", "").trim();

    // Extract rgb values: rgb(r g b / a) or rgba(r,g,b,a)
    var colorMatch = part.match(/rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)/);
    var r = 0,
      g = 0,
      b = 0,
      a = 0.1;
    if (colorMatch) {
      r = parseInt(colorMatch[1]) / 255;
      g = parseInt(colorMatch[2]) / 255;
      b = parseInt(colorMatch[3]) / 255;
      a = parseFloat(colorMatch[4]);
      part = part.replace(colorMatch[0], "").trim();
    }

    // Remaining tokens are: offsetX offsetY blur spread
    var nums = part
      .trim()
      .split(/\s+/)
      .filter(function (s) {
        return s !== "";
      });
    var offsetX = parseFloat(nums[0]) || 0;
    var offsetY = parseFloat(nums[1]) || 0;
    var blur = parseFloat(nums[2]) || 0;
    var spread = parseFloat(nums[3]) || 0;

    effects.push({
      type: isInset ? "INNER_SHADOW" : "DROP_SHADOW",
      color: { r: r, g: g, b: b, a: a },
      offset: { x: offsetX, y: offsetY },
      radius: blur,
      spread: spread,
      visible: true,
      blendMode: "NORMAL",
    });
  }
  return effects;
}

async function generateEffectStyles() {
  var shadowDefs = {
    "shadow/sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "shadow/base":
      "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "shadow/md":
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "shadow/lg":
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "shadow/xl":
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "shadow/inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  };

  // The Dark shadow alphas of the semantic shadow.* tokens (same geometry, darker colour).
  // Effect styles have no modes, so each style's colour is bound to a Light/Dark colour
  // variable in the semantic collection and follows whichever mode a frame is set to.
  // The variables are Figma-only helpers (prefix _figma/, hidden from pickers, never exported).
  var shadowDarkAlpha = {
    "shadow/sm": 0.3,
    "shadow/base": 0.4,
    "shadow/md": 0.4,
    "shadow/lg": 0.4,
    "shadow/xl": 0.4,
    "shadow/inner": 0.2,
  };
  var shadowVars = {};
  var existingShadowVars = {};
  try {
    var localVars = await figma.variables.getLocalVariablesAsync("COLOR");
    for (var lv = 0; lv < localVars.length; lv++) {
      if (localVars[lv].name.indexOf("_figma/") === 0) existingShadowVars[localVars[lv].name] = localVars[lv];
    }
    var allCollections = await figma.variables.getLocalVariableCollectionsAsync();
    var semanticCol = null;
    for (var ci = 0; ci < allCollections.length; ci++) {
      if (allCollections[ci].name === "semantic") semanticCol = allCollections[ci];
    }
    if (semanticCol) {
      var lightMode = null;
      var darkMode = null;
      for (var mi = 0; mi < semanticCol.modes.length; mi++) {
        if (semanticCol.modes[mi].name === "Light") lightMode = semanticCol.modes[mi].modeId;
        if (semanticCol.modes[mi].name === "Dark") darkMode = semanticCol.modes[mi].modeId;
      }
      if (lightMode && darkMode) {
        var shadowNames = Object.keys(shadowDefs);
        for (var si = 0; si < shadowNames.length; si++) {
          var sName = shadowNames[si];
          var lightAlpha = parseShadowValue(shadowDefs[sName])[0].color.a;
          // a re-run without a fresh Pull finds the variable from last time
          var shadowVar = existingShadowVars["_figma/" + sName] || figma.variables.createVariable(
            "_figma/" + sName,
            semanticCol,
            "COLOR"
          );
          shadowVar.scopes = [];
          shadowVar.setValueForMode(lightMode, { r: 0, g: 0, b: 0, a: lightAlpha });
          shadowVar.setValueForMode(darkMode, { r: 0, g: 0, b: 0, a: shadowDarkAlpha[sName] });
          shadowVars[sName] = shadowVar;
        }
      }
    }
  } catch (e) {
    console.warn("Dark shadow variables skipped: " + e);
    shadowVars = {};
  }

  // Pre-cache existing effect styles to avoid duplicates
  var existing = await figma.getLocalEffectStylesAsync();
  var existingMap = {};
  for (var i = 0; i < existing.length; i++) {
    existingMap[existing[i].name] = existing[i].id;
  }

  var created = 0;
  var keys = Object.keys(shadowDefs);
  for (var j = 0; j < keys.length; j++) {
    var name = keys[j];
    if (existingMap[name]) {
      generatedEffectStyles[name] = existingMap[name];
      continue;
    }
    var effects = parseShadowValue(shadowDefs[name]);
    if (shadowVars[name]) {
      try {
        var plainEffects = effects;
        effects = effects.map(function (eff, ei) {
          var bound = figma.variables.setBoundVariableForEffect(eff, "color", shadowVars[name]);
          // binding the colour returned the effect with its spread dropped on the real library
          // (negative spreads read back as 0); put the geometry back from the parsed token
          return Object.assign({}, bound, {
            offset: plainEffects[ei].offset,
            radius: plainEffects[ei].radius,
            spread: plainEffects[ei].spread,
          });
        });
      } catch (e) {
        console.warn("Shadow colour binding skipped for " + name + ": " + e);
      }
    }
    if (effects.length > 0) {
      var style = figma.createEffectStyle();
      style.name = name;
      style.effects = effects;
      if (style.effects[0].spread !== effects[0].spread) {
        console.warn("Shadow spread did not stick on " + name + ": " + style.effects[0].spread + " for " + effects[0].spread);
      }
      generatedEffectStyles[name] = style.id;
      created++;
    }
  }
  console.log(
    "Effect styles: " +
      created +
      " created, " +
      (keys.length - created) +
      " existing"
  );
}


// Helper to apply a named effect style to a node
// Plan 217: the synchronous effectStyleId setter fails silently under
// documentAccess "dynamic-page" (the file had six shadow styles and no layer used
// one), so styles are queued and set with setEffectStyleIdAsync at the end of main().
var pendingEffectStyles = [];
function applyEffectStyle(node, styleName) {
  var styleId = generatedEffectStyles[styleName];
  if (!styleId) return;
  pendingEffectStyles.push({ node: node, styleId: styleId, name: styleName });
}

// ============================================================
// SHARED OVERLAY BUILDER
// Common pattern: surface frame with background, border, radius, shadow
// Returns a configured component frame ready for content
// ============================================================

function buildOverlaySurface(
  width,
  height,
  bgVar,
  borderVar,
  radiusVar,
  shadowName,
  asFrame
) {
  // asFrame: a surface nested inside another component (a component cannot
  // contain a component, which is what broke the Menubar build)
  var comp = asFrame ? figma.createFrame() : figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisAlignItems = "MIN";
  comp.counterAxisAlignItems = "MIN";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, width, height);

  bindCornerRadius(comp, radiusVar);
  if (bgVar) bindFill(comp, bgVar);
  if (borderVar) bindStroke(comp, borderVar, null);
  if (shadowName) applyEffectStyle(comp, shadowName);
  // overlays hug their content in height; width stays the fixed size given
  comp.primaryAxisSizingMode = "AUTO";

  return comp;
}

// ============================================================
// SHARED MENU PARTS (label, separator, shortcut)
// DropdownMenu, ContextMenu and Menubar content all share this anatomy.
// ============================================================

function addMenuLabel(parent, text, o) {
  var f = figma.createFrame();
  f.name = "menu-label";
  f.layoutMode = "HORIZONTAL";
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = [];
  f.paddingLeft = o.padX;
  bindProp(f, "paddingLeft", o.padXVar);
  f.paddingRight = o.padX;
  bindProp(f, "paddingRight", o.padXVar);
  f.paddingTop = o.padY;
  bindProp(f, "paddingTop", o.padYVar);
  f.paddingBottom = o.padY;
  bindProp(f, "paddingBottom", o.padYVar);
  f.appendChild(
    makeText(text, o.styleName, o.fontSizeVar, o.weightVar, o.colorVar)
  );
  parent.appendChild(f);
  try {
    stretch(f);
  } catch (e) {}
  return f;
}

function addMenuSeparator(parent, o) {
  var wrap = figma.createFrame();
  wrap.name = "menu-separator";
  wrap.layoutMode = "VERTICAL";
  wrap.primaryAxisSizingMode = "AUTO";
  wrap.counterAxisSizingMode = "AUTO";
  wrap.fills = [];
  var marginY = resolveSpace(o.marginYVar) || 0; // no token, no margin (Command)
  wrap.paddingTop = marginY;
  bindProp(wrap, "paddingTop", o.marginYVar);
  wrap.paddingBottom = marginY;
  bindProp(wrap, "paddingBottom", o.marginYVar);
  var line = figma.createFrame();
  line.name = "line";
  resizeKeep(line, 10, resolveSpace(o.heightVar) || 1);
  bindProp(line, "height", o.heightVar);
  bindFill(line, o.colorVar);
  wrap.appendChild(line);
  parent.appendChild(wrap);
  try {
    stretch(wrap);
    stretch(line);
  } catch (e) {}
  return wrap;
}

function addMenuShortcut(item, text, o) {
  var t = makeText(text, o.styleName, o.fontSizeVar, null, o.colorVar);
  if (o.opacityVar) bindOpacity(t, o.opacityVar);
  item.appendChild(t);
  return t;
}

// ============================================================
// DROPDOWN MENU
// Variants: state (default, hover) — shows the menu surface + items
// ============================================================

function buildDropdownMenuVariant(stateKey) {
  var paddingVar = getVar("dropdown-menu/content/padding");
  var pad = resolveSpace(paddingVar) || 4;
  var minWidthVar = getVar("dropdown-menu/content/min-width");
  var minWidth = resolveSpace(minWidthVar) || 128;

  var comp = buildOverlaySurface(
    minWidth,
    160,
    getVar("dropdown-menu/content/background"),
    getVar("dropdown-menu/content/border"),
    getVar("dropdown-menu/content-radius"),
    "shadow/md"
  );

  comp.paddingTop = pad;
  bindProp(comp, "paddingTop", paddingVar);
  comp.paddingBottom = pad;
  bindProp(comp, "paddingBottom", paddingVar);
  comp.paddingLeft = pad;
  bindProp(comp, "paddingLeft", paddingVar);
  comp.paddingRight = pad;
  bindProp(comp, "paddingRight", paddingVar);
  comp.itemSpacing = 0; // real items stack flush, no gap between them

  // Add 3 representative menu items
  var items = ["Menu Item", "Menu Item", "Menu Item"];
  var fontSizeVar = getVar("dropdown-menu/item/font-size");
  var itemPadX = resolveSpace(getVar("dropdown-menu/item/padding-x")) || 8;
  var itemPadXVar = getVar("dropdown-menu/item/padding-x");
  var itemPadY = resolveSpace(getVar("dropdown-menu/item/padding-y")) || 4;
  var itemPadYVar = getVar("dropdown-menu/item/padding-y");
  var itemRadiusVar = getVar("dropdown-menu/item-radius");

  // DropdownMenuLabel (semibold, inset like an item), shortcut on the first
  // item and a separator after the second, as in the real menu anatomy
  addMenuLabel(comp, "My Account", {
    styleName: "dropdown-menu/item",
    fontSizeVar: fontSizeVar,
    weightVar: getVar("dropdown-menu/label-font-weight"),
    colorVar: getVar("dropdown-menu/content/text"),
    padX: itemPadX,
    padXVar: itemPadXVar,
    padY: itemPadY,
    padYVar: itemPadYVar,
  });

  for (var i = 0; i < items.length; i++) {
    var item = figma.createFrame();
    item.name = "menu-item";
    item.layoutMode = "HORIZONTAL";
    item.primaryAxisAlignItems = "MIN";
    item.counterAxisAlignItems = "CENTER";
    item.primaryAxisSizingMode = "FIXED"; // fill the menu width
    item.counterAxisSizingMode = "AUTO";
    resizeKeep(item, minWidth - pad * 2, 32); // explicit width minus parent padding
    item.paddingTop = itemPadY;
    bindProp(item, "paddingTop", itemPadYVar);
    item.paddingBottom = itemPadY;
    bindProp(item, "paddingBottom", itemPadYVar);
    item.paddingLeft = itemPadX;
    bindProp(item, "paddingLeft", itemPadXVar);
    item.paddingRight = itemPadX;
    bindProp(item, "paddingRight", itemPadXVar);
    bindCornerRadius(item, itemRadiusVar);

    // Hover state — highlight first item
    if (stateKey === "hover" && i === 0) {
      bindFill(item, getVar("dropdown-menu/item/background-hover"));
    } else {
      item.fills = [];
    }

    var textColor = getVar("dropdown-menu/content/text");
    var label = makeText(
      items[i],
      "dropdown-menu/item",
      fontSizeVar,
      null,
      textColor
    );
    try {
      label.layoutSizingHorizontal = "FILL";
    } catch (e) {}
    item.appendChild(label);
    // FILL is only valid once the label has its auto-layout parent
    try {
      label.layoutSizingHorizontal = "FILL";
    } catch (e) {}
    if (i === 0) {
      addMenuShortcut(item, "\u21E7\u2318P", {
        styleName: "dropdown-menu/shortcut",
        fontSizeVar: getVar("dropdown-menu/shortcut/font-size"),
        colorVar: getVar("dropdown-menu/content/text"),
        opacityVar: getVar("dropdown-menu/shortcut/opacity"),
      });
    }
    comp.appendChild(item);
    if (i === 1) {
      addMenuSeparator(comp, {
        colorVar: getVar("dropdown-menu/separator/background"),
        heightVar: getVar("dropdown-menu/separator/height"),
        marginYVar: getVar("dropdown-menu/separator/margin-y"),
      });
    }
  }

  return comp;
}

function buildDropdownMenu(x, y) {
  var configs = [
    {
      variantProps: { state: "default" },
      buildFn: function () {
        return buildDropdownMenuVariant("default");
      },
    },
    {
      variantProps: { state: "hover" },
      buildFn: function () {
        return buildDropdownMenuVariant("hover");
      },
    },
  ];
  return buildComponentSet("Dropdown Menu", configs, "state", x, y);
}

// ============================================================
// SELECT
// Variants: size (sm, md, lg) × state (closed, open, error, disabled)
// Shows the trigger button; open state also shows the dropdown; error uses the
// input error border, as the code's `error` prop does (--color-input-border-error)
// ============================================================

function buildSelectVariant(sizeKey, stateKey) {
  var triggerHeightVar = getVar("select/trigger/height/" + sizeKey);
  var triggerHeight = resolveSpace(triggerHeightVar) || 40;
  var padXVar = getVar("select/trigger/padding-x/" + sizeKey);
  var padX = resolveSpace(padXVar) || 12;
  var fontSizeVar = getVar("select/trigger/font-size/" + sizeKey);
  var fontSize = resolveFontSize(fontSizeVar);
  var radiusVar = getVar("select/trigger/radius");

  // Trigger is a plain frame (not a component) — the top-level node for
  // every variant must be a single figma.createComponent() so
  // combineAsVariants gets a consistent structure across all size x state
  // combinations; nesting a second component inside it breaks the set.
  var trigger = figma.createFrame();
  trigger.name = "trigger";
  trigger.layoutMode = "HORIZONTAL";
  trigger.primaryAxisAlignItems = "SPACE_BETWEEN"; // label left, chevron right
  trigger.counterAxisAlignItems = "CENTER";
  trigger.primaryAxisSizingMode = "FIXED";
  trigger.counterAxisSizingMode = "FIXED";
  resizeKeep(trigger, 200, triggerHeight);
  if (triggerHeightVar) {
    try {
      trigger.setBoundVariable("height", triggerHeightVar);
    } catch (e) {}
  }
  trigger.paddingLeft = padX;
  bindProp(trigger, "paddingLeft", padXVar);
  trigger.paddingRight = padX;
  bindProp(trigger, "paddingRight", padXVar);
  if (padXVar) {
    try {
      trigger.setBoundVariable("paddingLeft", padXVar);
      trigger.setBoundVariable("paddingRight", padXVar);
    } catch (e) {}
  }
  bindCornerRadius(trigger, radiusVar);
  var selectDisabled = stateKey === "disabled";
  bindFill(
    trigger,
    pickDisabled(
      selectDisabled,
      "input/default/background",
      "select/trigger/background-disabled"
    )
  );
  bindStroke(
    trigger,
    pickDisabled(
      selectDisabled,
      stateKey === "error" ? "input/border-error" : "input/border",
      "select/trigger/border-disabled"
    ),
    null
  );

  var textColor = pickDisabled(
    selectDisabled,
    "select/content/text",
    "select/trigger/text-disabled"
  );
  var label = makeText(
    "Select option...",
    "select/trigger/" + sizeKey,
    fontSizeVar,
    null,
    textColor
  );
  // Text fills available space; chevron stays at right edge via SPACE_BETWEEN
  try {
    label.layoutSizingHorizontal = "FILL";
  } catch (e) {}
  trigger.appendChild(label);

  // Chevron — visible triangle shape using a frame with a diagonal fill
  // Since we can't draw SVG paths, use a small square as a visual stand-in
  // with the trigger icon opacity token applied
  var chevronSizeVar = getVar("select/trigger/icon-size");
  var chevronSize =
    resolveSpace(chevronSizeVar) || Math.round(fontSize * 0.85);
  var iconOpacity = resolveToken("select/trigger/icon-opacity") || 0.5;
  var chevron = makeIcon(
    "chevron-down",
    chevronSize,
    getVar("select/content/text"),
    chevronSizeVar
  );
  chevron.opacity = iconOpacity;
  trigger.appendChild(chevron);

  var comp = figma.createComponent();
  comp.name = "select";
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "AUTO";
  comp.itemSpacing = 0; // real dropdown sits flush against the trigger
  comp.fills = [];
  comp.appendChild(trigger);

  if (stateKey !== "open") {
    return comp;
  }

  // Open state: append dropdown content below the trigger, inside the
  // same top-level component
  var contentPad = resolveSpace(getVar("select/content/padding")) || 4;
  var contentPadVar = getVar("select/content/padding");
  var contentMinWidth = resolveSpace(getVar("select/content/min-width")) || 200;
  var contentMinWidthVar = getVar("select/content/min-width");
  var content = figma.createFrame();
  content.layoutMode = "VERTICAL";
  content.primaryAxisSizingMode = "AUTO";
  content.counterAxisSizingMode = "FIXED";
  // the panel is at least as wide as its trigger (min-w trigger width)
  var contentWidth = Math.max(contentMinWidth, trigger.width);
  content.counterAxisAlignItems = "MIN";
  resizeKeep(content, contentWidth, 1);
  content.paddingTop = contentPad;
  bindProp(content, "paddingTop", contentPadVar);
  content.paddingBottom = contentPad;
  bindProp(content, "paddingBottom", contentPadVar);
  content.paddingLeft = contentPad;
  bindProp(content, "paddingLeft", contentPadVar);
  content.paddingRight = contentPad;
  bindProp(content, "paddingRight", contentPadVar);
  content.itemSpacing = 0; // real items stack with no gap between them
  bindCornerRadius(content, getVar("select/content/radius"));
  bindFill(content, getVar("select/content/background"));
  applyEffectStyle(content, "shadow/md");

  var options = ["Option 1", "Option 2", "Option 3"];
  var itemPadY = resolveSpace(getVar("select/item/padding-y")) || 6;
  var itemPadYVar = getVar("select/item/padding-y");
  var itemPadLeft = resolveSpace(getVar("select/item/padding-left")) || 8;
  var itemPadLeftVar = getVar("select/item/padding-left");
  var itemPadRight = resolveSpace(getVar("select/item/padding-right")) || 8;
  var itemPadRightVar = getVar("select/item/padding-right");
  var itemFontSizeVar = getVar("select/trigger/font-size/md");
  for (var oi = 0; oi < options.length; oi++) {
    var item = figma.createFrame();
    item.layoutMode = "HORIZONTAL";
    item.primaryAxisSizingMode = "AUTO";
    item.counterAxisSizingMode = "FIXED";
    resizeKeep(item, contentWidth - contentPad * 2, 1);
    item.primaryAxisAlignItems = "MIN"; // options are left aligned
    item.counterAxisAlignItems = "CENTER";
    item.paddingTop = itemPadY;
    bindProp(item, "paddingTop", itemPadYVar);
    item.paddingBottom = itemPadY;
    bindProp(item, "paddingBottom", itemPadYVar);
    item.paddingLeft = itemPadLeft;
    bindProp(item, "paddingLeft", itemPadLeftVar);
    item.paddingRight = itemPadRight;
    bindProp(item, "paddingRight", itemPadRightVar);
    bindCornerRadius(item, getVar("select/item/radius"));
    var isFocused = oi === 0;
    if (isFocused) {
      bindFill(item, getVar("select/item/background-highlighted"));
    } else {
      item.fills = [];
    }
    var optionColor = isFocused
      ? getVar("select/item/text-highlighted")
      : getVar("select/content/text");
    var optionLabel = makeText(
      options[oi],
      "select/item",
      itemFontSizeVar,
      null,
      optionColor
    );
    item.appendChild(optionLabel);
    content.appendChild(item);
    stretch(item);
  }
  comp.appendChild(content);

  return comp;
}

function buildSelect(x, y) {
  var sizes = ["sm", "md", "lg"];
  var states = ["closed", "open", "error", "disabled"];
  var configs = [];
  for (var i = 0; i < sizes.length; i++) {
    for (var j = 0; j < states.length; j++) {
      (function (size, state) {
        configs.push({
          variantProps: { size: size, state: state },
          buildFn: function () {
            return buildSelectVariant(size, state);
          },
        });
      })(sizes[i], states[j]);
    }
  }
  return buildComponentSet("Select", configs, "size", x, y);
}

// ============================================================
// POPOVER
// Variants: size (sm, md, lg)
// Surface with title + description content
// ============================================================

function buildPopoverVariant(sizeKey) {
  var widthVar = getVar("popover/content/width/" + sizeKey);
  var width = resolveSpace(widthVar) || 256;
  var padVar = getVar("popover/content-padding");
  var pad = resolveSpace(padVar) || 24;

  var comp = buildOverlaySurface(
    width,
    40, // height will grow from content (AUTO)
    getVar("popover/background"),
    getVar("popover/border"),
    getVar("popover/content-radius"),
    "shadow/md"
  );
  comp.paddingTop = pad;
  bindProp(comp, "paddingTop", padVar);
  comp.paddingBottom = pad;
  bindProp(comp, "paddingBottom", padVar);
  comp.paddingLeft = pad;
  bindProp(comp, "paddingLeft", padVar);
  comp.paddingRight = pad;
  bindProp(comp, "paddingRight", padVar);
  comp.itemSpacing = 0; // content flows as written, no gap in code

  var titleText = makeText(
    "Popover Title",
    "popover/title",
    slotTextSize(),
    getVar("label/font-weight"),
    getVar("popover/text")
  );
  var bodyText = makeText(
    "Popover description content.",
    "popover/body",
    slotTextSize(),
    null,
    getVar("popover/text")
  );
  try {
    titleText.layoutSizingHorizontal = "FILL";
  } catch (e) {}
  try {
    bodyText.layoutSizingHorizontal = "FILL";
  } catch (e) {}
  comp.appendChild(titleText);
  comp.appendChild(bodyText);

  return comp;
}

function buildPopover(x, y) {
  var sizes = ["sm", "md", "lg"];
  var configs = [];
  for (var i = 0; i < sizes.length; i++) {
    (function (size) {
      configs.push({
        variantProps: { size: size },
        buildFn: function () {
          return buildPopoverVariant(size);
        },
      });
    })(sizes[i]);
  }
  return buildComponentSet("Popover", configs, "size", x, y);
}

// ============================================================
// TOOLTIP
// Variants: position (top, bottom, left, right)
// Dark surface, inverse text
// ============================================================

// Real TooltipContent (packages/ui/src/tooltip.tsx) is a Radix primitive
// with no arrow element — `side` only controls placement via floating-ui,
// it doesn't change the bubble's own rendering. So all 4 position variants
// are legitimately identical bubbles; that's accurate, not a missed variant.
function buildTooltipVariant(position) {
  var padXVar = getVar("tooltip/padding-x");
  var padYVar = getVar("tooltip/padding-y");
  var padX = resolveSpace(padXVar) || 12;
  var padY = resolveSpace(padYVar) || 8;

  var comp = figma.createComponent();
  comp.name = "tooltip";
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "AUTO";
  comp.paddingTop = padY;
  bindProp(comp, "paddingTop", padYVar);
  comp.paddingBottom = padY;
  bindProp(comp, "paddingBottom", padYVar);
  comp.paddingLeft = padX;
  bindProp(comp, "paddingLeft", padXVar);
  comp.paddingRight = padX;
  bindProp(comp, "paddingRight", padXVar);

  bindCornerRadius(comp, getVar("tooltip/radius"));
  bindFill(comp, getVar("tooltip/background"));
  bindStroke(comp, getVar("tooltip/border"), null);
  applyEffectStyle(comp, "shadow/md");

  var fontSizeVar = getVar("tooltip/font-size");
  var label = makeText(
    "Tooltip text",
    "tooltip",
    fontSizeVar,
    null,
    getVar("tooltip/text")
  );
  comp.appendChild(label);

  return comp;
}

function buildTooltip(x, y) {
  // `side` only changes where floating-ui places the tooltip; there is no
  // arrow, so all four positions drew the same box: one variant
  var configs = [
    {
      variantProps: {},
      buildFn: function () {
        return buildTooltipVariant("top");
      },
    },
  ];
  return buildComponentSet("Tooltip", configs, "position", x, y);
}

// ============================================================
// DIALOG
// Variants: size (sm, md, lg). The footer is a BOOLEAN property ("Footer", off by
// default), not a state variant. xl and full are not drawn: every size is only a
// max-width cap in code (w-full max-w-*), so a wider dialog resizes the instance
// (owner decision 2026-11-10, recorded in the parity allow-list).
// Shows the dialog surface with header, body and a toggleable footer
// ============================================================

function buildDialogVariant(sizeKey) {
  var widthVar = getVar("dialog/content/width/" + sizeKey);
  var width = resolveSpace(widthVar) || 448;
  // Note: width binding applied after resize below
  var padVar = getVar("dialog/content/padding");
  var pad = resolveSpace(padVar) || 24;
  var headerGapVar = getVar("dialog/header-gap");
  // one gap between header, body and footer (dialog.content.gap); the footer has no margin
  var contentGapVar = getVar("dialog/content/gap");

  var comp = buildOverlaySurface(
    width,
    220,
    getVar("dialog/background"),
    getVar("dialog/border"),
    getVar("dialog/content/radius"),
    "shadow/lg"
  );
  if (widthVar) {
    try {
      comp.setBoundVariable("width", widthVar);
    } catch (e) {}
  }
  comp.paddingTop = pad;
  bindProp(comp, "paddingTop", padVar);
  comp.paddingBottom = pad;
  bindProp(comp, "paddingBottom", padVar);
  comp.paddingLeft = pad;
  bindProp(comp, "paddingLeft", padVar);
  comp.paddingRight = pad;
  bindProp(comp, "paddingRight", padVar);
  comp.itemSpacing = resolveSpace(contentGapVar) || 24;
  bindProp(comp, "itemSpacing", contentGapVar);
  comp.clipsContent = false;

  // Close button (×) — always rendered top-right on every real DialogContent
  var closeOffset = resolveSpace(getVar("dialog/close-button-offset")) || 16;
  var closeOffsetVar = getVar("dialog/close-button-offset");
  var closeIconSize =
    resolveSpace(getVar("dialog/close-button/icon-size")) || 24;
  var closeIconSizeVar = getVar("dialog/close-button/icon-size");
  var closeBtn = makeIcon("x", closeIconSize, getVar("dialog/title"), closeIconSizeVar);
  closeBtn.name = "close-button";
  // resting opacity (70%) from the token; hover raises it to 100%
  bindOpacity(closeBtn, getVar("dialog/close-button.opacity"));
  comp.appendChild(closeBtn);
  try {
    closeBtn.layoutPositioning = "ABSOLUTE";
    closeBtn.x = width - closeOffset - closeIconSize;
    closeBtn.y = closeOffset;
  } catch (e) {}

  // Header — title + description
  var header = figma.createFrame();
  header.layoutMode = "VERTICAL";
  header.primaryAxisSizingMode = "AUTO";
  header.counterAxisSizingMode = "AUTO";
  header.itemSpacing = resolveSpace(headerGapVar) || 4;
  bindProp(header, "itemSpacing", headerGapVar);
  header.fills = [];

  var titleFontSizeVar = getVar("dialog/title-font-size");
  var titleWeightVar = getVar("dialog/title-font-weight");
  var titleText = makeText(
    "Dialog Title",
    "dialog/title",
    titleFontSizeVar,
    titleWeightVar,
    getVar("dialog/title"),
    getVar("typography/line-height/none"),
    getVar("dialog/title-letter-spacing")
  );
  header.appendChild(titleText);

  var descFontSizeVar = getVar("dialog/description-font-size");
  var descText = makeText(
    "Dialog description text goes here.",
    "dialog/description",
    descFontSizeVar,
    null,
    getVar("dialog/description")
  );
  header.appendChild(descText);
  comp.appendChild(header);

  // Body content placeholder
  var body = figma.createFrame();
  body.name = "dialog-body";
  body.layoutMode = "VERTICAL";
  body.primaryAxisSizingMode = "AUTO";
  body.counterAxisSizingMode = "AUTO";
  body.fills = [];
  var bodyText = makeText(
    "Dialog content goes here.",
    "dialog/body",
    getVar("dialog/description-font-size"),
    null,
    getVar("dialog/description")
  );
  body.appendChild(bodyText);
  comp.appendChild(body);

  // Custom body: an empty frame that applyOverlayProperties turns into a SLOT (a form, a
  // list or other content), hidden until its boolean is turned on
  var customBody = figma.createFrame();
  customBody.name = "custom-body";
  customBody.layoutMode = "VERTICAL";
  customBody.primaryAxisSizingMode = "AUTO";
  customBody.counterAxisSizingMode = "AUTO";
  customBody.fills = [];
  comp.appendChild(customBody);
  customBody.layoutAlign = "STRETCH";
  customBody.visible = false;

  // Footer — always built, hidden until the Footer boolean property is turned on
  var footer = figma.createFrame();
  footer.name = "dialog-footer";
  footer.layoutMode = "HORIZONTAL";
  // sm:justify-end in code: buttons sit at the right edge
  footer.primaryAxisAlignItems = "MAX";
  footer.counterAxisAlignItems = "CENTER";
  footer.primaryAxisSizingMode = "AUTO";
  footer.counterAxisSizingMode = "AUTO";
  footer.itemSpacing = resolveSpace(getVar("dialog/footer-gap")) || 8;
  bindProp(footer, "itemSpacing", getVar("dialog/footer-gap"));
  // buttons wrap onto a second row in a narrow dialog (three buttons do not fit sm)
  footer.layoutWrap = "WRAP";
  footer.counterAxisSpacing = resolveSpace(getVar("dialog/footer-gap")) || 8;
  bindProp(footer, "counterAxisSpacing", getVar("dialog/footer-gap"));
  footer.fills = [];
  // DialogFooter holds Buttons: an optional extra (hidden by default), outline Cancel and
  // default Confirm. applyOverlayProperties wires the booleans and exposes the instances.
  var extraBtn = makeButtonFrame("Learn more", "secondary", "md");
  extraBtn.name = "extra-button";
  var cancelBtn = makeButtonFrame("Cancel", "outline", "md");
  cancelBtn.name = "cancel-button";
  var actionBtn = makeButtonFrame("Confirm", "default", "md");
  actionBtn.name = "action-button";
  footer.appendChild(extraBtn);
  footer.appendChild(cancelBtn);
  footer.appendChild(actionBtn);
  comp.appendChild(footer);
  footer.layoutAlign = "STRETCH";

  return comp;
}

function buildDialog(x, y) {
  var sizes = ["sm", "md", "lg"];
  var configs = [];
  for (var i = 0; i < sizes.length; i++) {
    (function (size) {
      configs.push({
        variantProps: { size: size },
        buildFn: function () {
          return buildDialogVariant(size);
        },
      });
    })(sizes[i]);
  }
  // the footer, description and button booleans and the body slot are added by
  // applyOverlayProperties, after the text properties exist
  return buildComponentSet("Dialog", configs, "size", x, y);
}

// ============================================================
// TABS — size (sm, md, lg) × variant (line, enclosed)
// ============================================================
// Real tabsListVariants/tabsTriggerVariants (packages/ui/src/tabs.tsx) have
// no "variant" prop at all — only "size". The list always has a bottom
// border, and the active trigger gets a colored bottom indicator border;
// there is no separate "enclosed" box-tab style to build.
function buildTabsVariant(sizeKey) {
  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, 320, 160);
  comp.itemSpacing = resolveSpace(getVar("tabs/content/margin-top")) || 8;
  bindProp(comp, "itemSpacing", getVar("tabs/content/margin-top"));
  comp.fills = [];

  // Tab list
  var list = figma.createFrame();
  list.layoutMode = "HORIZONTAL";
  list.primaryAxisSizingMode = "AUTO";
  list.counterAxisSizingMode = "FIXED";
  list.counterAxisAlignItems = "CENTER";
  var tabsListHeightVar = getVar("tabs/list/height/" + sizeKey);
  var tabsListPadVar = getVar("tabs/list/padding/" + sizeKey);
  var tabsListH = resolveSpace(tabsListHeightVar) || 40;
  var tabsListPad = resolveSpace(tabsListPadVar) || 4;
  resizeKeep(list, 320, tabsListH);
  if (tabsListHeightVar) {
    try {
      list.setBoundVariable("height", tabsListHeightVar);
    } catch (e) {}
  }
  list.paddingLeft = tabsListPad;
  bindProp(list, "paddingLeft", tabsListPadVar);
  list.paddingRight = tabsListPad;
  bindProp(list, "paddingRight", tabsListPadVar);
  // the list is p-(tabs.list.padding) on all four sides in code
  list.paddingTop = tabsListPad;
  bindProp(list, "paddingTop", tabsListPadVar);
  list.paddingBottom = tabsListPad;
  bindProp(list, "paddingBottom", tabsListPadVar);
  if (tabsListPadVar) {
    try {
      list.setBoundVariable("paddingLeft", tabsListPadVar);
      list.setBoundVariable("paddingRight", tabsListPadVar);
      list.setBoundVariable("paddingTop", tabsListPadVar);
      list.setBoundVariable("paddingBottom", tabsListPadVar);
    } catch (e) {}
  }
  list.itemSpacing = resolveSpace(getVar("tabs/list/gap")) || 4;
  bindProp(list, "itemSpacing", getVar("tabs/list/gap"));
  bindFill(list, getVar("tabs/list/background"));
  // Real list always has a bottom border, unconditionally
  bindStroke(list, getVar("tabs/list/border/color"), getVar("tabs/list/border/width"));
  list.strokeTopWeight = 0;
  list.strokeLeftWeight = 0;
  list.strokeRightWeight = 0;
  comp.appendChild(list);

  // Tabs
  var tabLabels = ["Tab 1", "Tab 2", "Tab 3"];
  var padX = resolveSpace(getVar("tabs/trigger/padding-x/" + sizeKey)) || 12;
  var padXVar = getVar("tabs/trigger/padding-x/" + sizeKey);
  var padY = resolveSpace(getVar("tabs/trigger/padding-y/" + sizeKey)) || 4;
  var padYVar = getVar("tabs/trigger/padding-y/" + sizeKey);
  var fontSizeVar = getVar("tabs/trigger/font-size/" + sizeKey);
  var fontWeightVar = getVar("tabs/trigger/font-weight");

  for (var i = 0; i < tabLabels.length; i++) {
    var tabsPadXVar = getVar("tabs/trigger/padding-x/" + sizeKey);
    var tabsPadYVar = getVar("tabs/trigger/padding-y/" + sizeKey);
    var tab = figma.createFrame();
    tab.layoutMode = "HORIZONTAL";
    tab.primaryAxisAlignItems = "CENTER";
    tab.counterAxisAlignItems = "CENTER";
    tab.primaryAxisSizingMode = "AUTO";
    tab.counterAxisSizingMode = "AUTO";
    tab.paddingTop = padY;
    bindProp(tab, "paddingTop", padYVar);
    tab.paddingBottom = padY;
    bindProp(tab, "paddingBottom", padYVar);
    tab.paddingLeft = padX;
    bindProp(tab, "paddingLeft", padXVar);
    tab.paddingRight = padX;
    bindProp(tab, "paddingRight", padXVar);
    if (tabsPadXVar) {
      try {
        tab.setBoundVariable("paddingLeft", tabsPadXVar);
        tab.setBoundVariable("paddingRight", tabsPadXVar);
      } catch (e) {}
    }
    if (tabsPadYVar) {
      try {
        tab.setBoundVariable("paddingTop", tabsPadYVar);
        tab.setBoundVariable("paddingBottom", tabsPadYVar);
      } catch (e) {}
    }
    if (i === 0) {
      bindFill(tab, getVar("tabs/trigger/background-active"));
      // tabs.trigger.shadow (shadow.sm): the active trigger lifts off the list
      applyEffectStyle(tab, "shadow/sm");
      // Active trigger's signature bottom indicator border
      bindStroke(
        tab,
        getVar("tabs/trigger/indicator-color"),
        getVar("tabs/trigger/indicator-width")
      );
      tab.strokeTopWeight = 0;
      tab.strokeLeftWeight = 0;
      tab.strokeRightWeight = 0;
    } else {
      tab.fills = [];
      // border-b-4 border-transparent in code: an inactive trigger keeps the same 4px
      // bottom border as the active one, so both are the same height
      transparentBorder(tab, getVar("tabs/trigger/indicator-width"));
      tab.strokeTopWeight = 0;
      tab.strokeLeftWeight = 0;
      tab.strokeRightWeight = 0;
    }
    var textColor =
      i === 0 ? getVar("tabs/trigger/text-active") : getVar("tabs/list/text");
    var label = makeText(
      tabLabels[i],
      "tabs/trigger/" + sizeKey,
      fontSizeVar,
      fontWeightVar,
      textColor
    );
    tab.appendChild(label);
    list.appendChild(tab);
  }

  // Content area
  var content = figma.createFrame();
  content.layoutMode = "VERTICAL";
  content.primaryAxisSizingMode = "AUTO";
  content.counterAxisSizingMode = "AUTO";
  content.paddingTop = resolveSpace(getVar("tabs/content/padding")) || 12;
  content.paddingBottom = resolveSpace(getVar("tabs/content/padding")) || 12;
  content.paddingLeft = resolveSpace(getVar("tabs/content/padding")) || 12;
  content.paddingRight = resolveSpace(getVar("tabs/content/padding")) || 12;
  ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"].forEach(
    function (side) {
      bindProp(content, side, getVar("tabs/content/padding"));
    }
  );
  content.fills = [];
  var contentText = makeText(
    "Tab content goes here.",
    "tabs/content/" + sizeKey,
    fontSizeVar,
    null,
    getVar("tabs/list/text")
  );
  content.appendChild(contentText);
  comp.appendChild(content);
  return comp;
}

function buildTabs(x, y) {
  var sizes = ["sm", "md", "lg"];
  var configs = [];
  for (var i = 0; i < sizes.length; i++) {
    (function (s) {
      configs.push({
        variantProps: { size: s },
        buildFn: function () {
          return buildTabsVariant(s);
        },
      });
    })(sizes[i]);
  }
  return buildComponentSet("Tabs", configs, "size", x, y);
}

// ============================================================
// ACCORDION — state (closed, open)
// ============================================================
function buildAccordionVariant(stateKey) {
  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, 320, stateKey === "open" ? 120 : 56);
  // the item hugs its trigger (and content when open) in code; it is not a fixed height
  comp.primaryAxisSizingMode = "AUTO";
  comp.fills = [];
  // bg-(--color-accordion-background) sits on AccordionItem, so the trigger and
  // content below stay unfilled and show it through
  bindFill(comp, getVar("accordion/background"));
  // Real AccordionItem only has a bottom border (border-b), not all four sides
  bindStroke(
    comp,
    getVar("accordion/border"),
    getVar("accordion/item-border-width")
  );
  try {
    comp.strokeTopWeight = 0;
    comp.strokeLeftWeight = 0;
    comp.strokeRightWeight = 0;
  } catch (e) {}

  var trigPad = resolveSpace(getVar("accordion/trigger/padding")) || 12;
  var trigPadVar = getVar("accordion/trigger/padding");
  var trigger = figma.createFrame();
  trigger.layoutMode = "HORIZONTAL";
  trigger.primaryAxisAlignItems = "SPACE_BETWEEN";
  trigger.counterAxisAlignItems = "CENTER";
  trigger.primaryAxisSizingMode = "AUTO";
  trigger.counterAxisSizingMode = "AUTO";
  trigger.paddingTop = trigPad;
  bindProp(trigger, "paddingTop", trigPadVar);
  trigger.paddingBottom = trigPad;
  bindProp(trigger, "paddingBottom", trigPadVar);
  trigger.paddingLeft = trigPad;
  bindProp(trigger, "paddingLeft", trigPadVar);
  trigger.paddingRight = trigPad;
  bindProp(trigger, "paddingRight", trigPadVar);
  trigger.fills = [];
  var trigTextColor =
    stateKey === "open"
      ? getVar("accordion/trigger-text-open")
      : getVar("accordion/trigger-text");
  var trigLabel = makeText(
    "Accordion Item",
    "accordion/trigger",
    getVar("accordion/trigger/font-size"),
    getVar("accordion/trigger/font-weight"),
    trigTextColor,
    getVar("accordion/trigger/line-height")
  );
  try {
    trigLabel.layoutSizingHorizontal = "FILL";
  } catch (e) {}
  // Chevron — visible chip using a frame filled with the icon color, same
  // placeholder convention used for Select/Pagination chevrons in this file
  var iconSize = resolveSpace(getVar("accordion/trigger/icon-size")) || 16;
  var iconSizeVar = getVar("accordion/trigger/icon-size");
  var iconColorVar =
    stateKey === "open"
      ? getVar("accordion/icon-open")
      : getVar("accordion/icon");
  var iconFrame = makeIcon("chevron-down", iconSize, iconColorVar, iconSizeVar);
  // [&[data-state=open]>svg]:rotate-180
  if (stateKey === "open") iconFrame.rotation = 180;
  trigger.appendChild(trigLabel);
  try {
    trigLabel.layoutSizingHorizontal = "FILL"; // label takes the slack, chevron sits right
  } catch (e) {}
  trigger.appendChild(iconFrame);
  comp.appendChild(trigger);
  stretch(trigger);

  if (stateKey === "open") {
    var contentPad = resolveSpace(getVar("accordion/content/padding")) || 12;
    var contentPadVar = getVar("accordion/content/padding");
    var content = figma.createFrame();
    content.layoutMode = "VERTICAL";
    content.primaryAxisSizingMode = "AUTO";
    content.counterAxisSizingMode = "AUTO";
    content.paddingTop = 0;
    content.paddingBottom = contentPad;
    bindProp(content, "paddingBottom", contentPadVar);
    content.paddingLeft = contentPad;
    bindProp(content, "paddingLeft", contentPadVar);
    content.paddingRight = contentPad;
    bindProp(content, "paddingRight", contentPadVar);
    content.fills = [];
    var bodyText = makeText(
      "Accordion content text goes here.",
      "accordion/content",
      getVar("accordion/content/font-size"),
      null,
      getVar("accordion/content-text"),
      getVar("accordion/content/line-height")
    );
    content.appendChild(bodyText);
    comp.appendChild(content);
  }
  return comp;
}

function buildAccordion(x, y) {
  var configs = [
    {
      variantProps: { state: "closed" },
      buildFn: function () {
        return buildAccordionVariant("closed");
      },
    },
    {
      variantProps: { state: "open" },
      buildFn: function () {
        return buildAccordionVariant("open");
      },
    },
  ];
  return buildComponentSet("Accordion", configs, "state", x, y);
}

// ============================================================
// TOAST — variant (default, success, warning, destructive)
// ============================================================
function buildToastVariant(variantKey) {
  var width = resolveSpace(getVar("toast/width")) || 256;
  var pad = resolveSpace(getVar("toast/padding")) || 24;
  var padVar = getVar("toast/padding");
  var comp = buildOverlaySurface(
    width,
    80,
    null,
    null,
    getVar("toast/radius"),
    "shadow/lg"
  );
  // Same layout as the code (Plan 218 follow-up, Toast): two columns. The content column
  // (title above description) fills the width; the controls column (close above action) hugs
  // and aligns right. A hidden close or action simply drops out of the controls column.
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "AUTO";
  comp.primaryAxisAlignItems = "MIN";
  comp.counterAxisAlignItems = "MIN";
  comp.paddingTop = pad;
  bindProp(comp, "paddingTop", padVar);
  comp.paddingBottom = pad;
  bindProp(comp, "paddingBottom", padVar);
  comp.paddingLeft = pad;
  bindProp(comp, "paddingLeft", padVar);
  comp.paddingRight = pad;
  bindProp(comp, "paddingRight", padVar);
  comp.itemSpacing = resolveSpace(getVar("toast/gap")) || 8;
  bindProp(comp, "itemSpacing", getVar("toast/gap"));

  var bgVar =
    variantKey === "default"
      ? getVar("toast/default-background")
      : getVar("toast/" + variantKey + "/background");
  if (bgVar) bindFill(comp, bgVar);

  // the default toast has its own border token; the role toasts draw their role's
  var borderVar =
    variantKey === "default"
      ? getVar("toast/default-border")
      : getVar("toast/" + variantKey + "/border");
  if (borderVar) bindStroke(comp, borderVar, getVar("toast/border-width"));

  var textColor =
    variantKey !== "default"
      ? getVar("toast/" + variantKey + "/text")
      : getVar("toast/text");
  var closeColor =
    variantKey !== "default"
      ? getVar("toast/" + variantKey + "/close-icon")
      : getVar("toast/close");

  // content column
  var content = figma.createFrame();
  content.name = "toast-content";
  content.layoutMode = "VERTICAL";
  content.primaryAxisSizingMode = "AUTO";
  content.counterAxisSizingMode = "FIXED";
  content.fills = [];
  content.itemSpacing = resolveSpace(getVar("toast/content-gap")) || 4;
  bindProp(content, "itemSpacing", getVar("toast/content-gap"));
  var title = makeText(
    "Toast Title",
    "toast/title",
    getVar("toast/title/font-size"),
    getVar("toast/title/font-weight"),
    textColor
  );
  var desc = makeText(
    "Toast description message.",
    "toast/description",
    getVar("toast/description/font-size"),
    null,
    textColor
  );
  // wrapping text: fixed width from the column, height follows the lines
  title.textAutoResize = "HEIGHT";
  desc.textAutoResize = "HEIGHT";
  content.appendChild(title);
  content.appendChild(desc);
  comp.appendChild(content);
  content.layoutSizingHorizontal = "FILL";
  title.layoutSizingHorizontal = "FILL";
  desc.layoutSizingHorizontal = "FILL";

  // controls column: close (the Icon set's x) above the action
  var controls = figma.createFrame();
  controls.name = "toast-controls";
  controls.layoutMode = "VERTICAL";
  controls.primaryAxisSizingMode = "AUTO";
  controls.counterAxisSizingMode = "AUTO";
  controls.counterAxisAlignItems = "MAX";
  // close at the top, action at the bottom of the toast, at least toast.controls-gap apart:
  // SPACE_BETWEEN ignores itemSpacing in Figma, so a fixed spacer of that height sits between
  // them; its height counts when the root hugs (a growing spacer made the root ignore it)
  controls.primaryAxisAlignItems = "SPACE_BETWEEN";
  controls.fills = [];
  controls.itemSpacing = 0;

  var closeSize = resolveSpace(getVar("toast/close-size")) || 24;
  var close = figma.createFrame();
  close.name = "toast-close";
  close.layoutMode = "HORIZONTAL";
  close.primaryAxisAlignItems = "CENTER";
  close.counterAxisAlignItems = "CENTER";
  close.primaryAxisSizingMode = "FIXED";
  close.counterAxisSizingMode = "FIXED";
  resizeKeep(close, closeSize, closeSize);
  bindSize(close, getVar("toast/close-size"), getVar("toast/close-size"));
  close.fills = [];
  bindCornerRadius(close, getVar("toast/close-button-radius"));
  var iconSizeVar = getVar("toast/close-button/icon-size");
  close.appendChild(
    makeIcon("x", resolveSpace(iconSizeVar) || 16, closeColor, iconSizeVar)
  );
  controls.appendChild(close);
  var spacer = figma.createFrame();
  spacer.name = "toast-controls-gap";
  spacer.fills = [];
  spacer.resize(1, resolveSpace(getVar("toast/controls-gap")) || 12);
  controls.appendChild(spacer);
  bindSize(spacer, null, getVar("toast/controls-gap"));

  // the action: outlined, in the toast's own text colour (the code's border is currentColor)
  var action = figma.createFrame();
  action.name = "toast-action";
  action.layoutMode = "HORIZONTAL";
  action.primaryAxisAlignItems = "CENTER";
  action.counterAxisAlignItems = "CENTER";
  action.primaryAxisSizingMode = "AUTO";
  action.counterAxisSizingMode = "FIXED";
  var actionH = resolveSpace(getVar("toast/action/height")) || 32;
  resizeKeep(action, 48, actionH);
  action.primaryAxisSizingMode = "AUTO";
  bindSize(action, null, getVar("toast/action/height"));
  action.paddingLeft = resolveSpace(getVar("toast/action/padding-x"));
  action.paddingRight = resolveSpace(getVar("toast/action/padding-x"));
  bindProp(action, "paddingLeft", getVar("toast/action/padding-x"));
  bindProp(action, "paddingRight", getVar("toast/action/padding-x"));
  action.fills = [];
  bindCornerRadius(action, getVar("toast/action/radius"));
  bindStroke(action, textColor, getVar("toast/border-width"));
  action.appendChild(
    makeText(
      "Action",
      "toast/action",
      getVar("toast/action/font-size"),
      getVar("toast/description/font-weight"),
      textColor,
      getVar("toast/action/line-height")
    )
  );
  controls.appendChild(action);
  comp.appendChild(controls);
  controls.layoutSizingVertical = "FILL";
  return comp;
}

function buildToast(x, y) {
  var variants = ["default", "success", "info", "warning", "destructive"];
  var configs = [];
  for (var i = 0; i < variants.length; i++) {
    (function (v) {
      configs.push({
        variantProps: { variant: v },
        buildFn: function () {
          return buildToastVariant(v);
        },
      });
    })(variants[i]);
  }
  var set = buildComponentSet("Toast", configs, "variant", x, y);
  // the close button and the action are optional parts, like the code's ToastClose and ToastAction
  addBooleanProperty(set, "showClose", "toast-close", true);
  addBooleanProperty(set, "showAction", "toast-action", true);
  return set;
}

// ============================================================
// SKELETON — variant (text, title, button, avatar, card)
// ============================================================
// Real skeletonVariants has two axes: variant (shape: default/text/circular/
// rectangular) and size (square sm/md/lg/xl via the skeleton height tokens).
var SKELETON_SIZE_TOKEN = { sm: "text", md: "title", lg: "button", xl: "avatar" };

function buildSkeletonVariant(variantKey, sizeKey) {
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  var sizeVar = getVar("skeleton/height/" + SKELETON_SIZE_TOKEN[sizeKey]);
  var size = resolveSpace(sizeVar) || 16;
  var heightVar = sizeVar;
  var height = size;
  // variant=text adds its own fixed text height on top of the size
  if (variantKey === "text") {
    heightVar = getVar("skeleton/height/text");
    height = resolveSpace(heightVar) || 16;
  }
  resizeKeep(comp, size, height);
  bindProp(comp, "width", sizeVar);
  bindProp(comp, "height", heightVar);
  var radiusVar =
    variantKey === "circular"
      ? getVar("skeleton/rounded-full")
      : variantKey === "rectangular"
        ? getVar("skeleton/rounded-sm")
        : getVar("skeleton/radius");
  bindCornerRadius(comp, radiusVar);
  bindFill(comp, getVar("skeleton/background"));
  return comp;
}

function buildSkeleton(x, y) {
  // Only looks that differ at rest: `rectangular` shares the default radius
  // (rounded-sm = radius), `xl` resolves to the same 40px as `lg`, and
  // text/sm is the same 16x16 box as default/sm.
  var variants = ["default", "text", "circular"];
  var sizes = ["sm", "md", "lg"];
  var configs = [];
  for (var i = 0; i < variants.length; i++) {
    for (var j = 0; j < sizes.length; j++) {
      if (variants[i] === "text" && sizes[j] === "sm") continue;
      (function (variant, size) {
        configs.push({
          variantProps: { variant: variant, size: size },
          buildFn: function () {
            return buildSkeletonVariant(variant, size);
          },
        });
      })(variants[i], sizes[j]);
    }
  }
  return buildComponentSet("Skeleton", configs, "variant", x, y);
}

// ============================================================
// SLIDER — no exposed variant props on the real component (only a
// focus-visible ring on the thumb, not a persistent state); single build
// ============================================================
function buildSliderVariant(disabled) {
  var comp = figma.createComponent();
  comp.layoutMode = "NONE";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  var trackH = resolveSpace(getVar("slider/track-height")) || 8;
  var trackHVar = getVar("slider/track-height");
  var thumbSize = resolveSpace(getVar("slider/thumb-size")) || 24;
  var thumbSizeVar = getVar("slider/thumb-size");
  var totalH = Math.max(trackH, thumbSize);
  resizeKeep(comp, 240, totalH);
  comp.fills = [];

  var track = figma.createFrame();
  track.name = "track";
  resizeKeep(track, 240, trackH);
  track.y = Math.round((totalH - trackH) / 2);
  var sliderTrackRadiusVar = getVar("slider/track-radius");
  if (sliderTrackRadiusVar) {
    try {
      track.setBoundVariable("cornerRadius", sliderTrackRadiusVar);
    } catch (e) {
      track.cornerRadius = 9999;
    }
  } else {
    track.cornerRadius = 9999;
  }
  bindFill(track, getVar("slider/track"));
  comp.appendChild(track);

  var range = figma.createFrame();
  range.name = "range";
  resizeKeep(range, 120, trackH);
  range.y = Math.round((totalH - trackH) / 2);
  if (sliderTrackRadiusVar) {
    try {
      range.setBoundVariable("cornerRadius", sliderTrackRadiusVar);
    } catch (e) {
      range.cornerRadius = 9999;
    }
  } else {
    range.cornerRadius = 9999;
  }
  bindFill(range, getVar("slider/range"));
  comp.appendChild(range);

  var thumb = figma.createFrame();
  thumb.name = "thumb";
  resizeKeep(thumb, thumbSize, thumbSize);
  var thumbSizeVar = getVar("slider/thumb-size");
  if (thumbSizeVar) {
    try {
      thumb.setBoundVariable("width", thumbSizeVar);
    } catch (e) {}
  }
  if (thumbSizeVar) {
    try {
      thumb.setBoundVariable("height", thumbSizeVar);
    } catch (e) {}
  }
  thumb.x = 120 - Math.round(thumbSize / 2);
  thumb.y = Math.round((totalH - thumbSize) / 2);
  var sliderThumbRadiusVar = getVar("slider/thumb-radius");
  if (sliderThumbRadiusVar) {
    try {
      thumb.setBoundVariable("cornerRadius", sliderThumbRadiusVar);
    } catch (e) {
      thumb.cornerRadius = 9999;
    }
  } else {
    thumb.cornerRadius = 9999;
  }
  bindFill(
    thumb,
    pickDisabled(disabled, "slider/thumb", "slider/thumb-background-disabled")
  );
  bindStroke(
    thumb,
    pickDisabled(disabled, "slider/thumb-border", "slider/thumb-border-disabled"),
    getVar("slider/thumb-border-width")
  );
  comp.appendChild(thumb);
  return comp;
}

function buildSlider(x, y) {
  var configs = [
    {
      variantProps: { disabled: "false" },
      buildFn: function () {
        return buildSliderVariant(false);
      },
    },
    {
      variantProps: { disabled: "true" },
      buildFn: function () {
        return buildSliderVariant(true);
      },
    },
  ];
  return buildComponentSet("Slider", configs, "disabled", x, y);
}

// ============================================================
// TOGGLE — size (sm, default, lg) × pressed (true, false)
// ============================================================
// state: "default" or "hover" (Plan 137). Code hovers only an off, enabled toggle (hover:bg-*);
// an on toggle keeps its pressed fill, and there is no active: style.
function buildToggleVariant(variantKey, sizeKey, pressed, disabled, state) {
  var heightVar = getVar("toggle/size/" + sizeKey + "/height");
  var padXVar = getVar("toggle/size/" + sizeKey + "/padding-x");
  var h = resolveSpace(heightVar) || 40;
  var padX = resolveSpace(padXVar) || 12;

  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, 60, h);
  if (heightVar) {
    try {
      comp.setBoundVariable("height", heightVar);
    } catch (e) {}
  }
  comp.paddingLeft = padX;
  bindProp(comp, "paddingLeft", padXVar);
  comp.paddingRight = padX;
  bindProp(comp, "paddingRight", padXVar);
  if (padXVar) {
    try {
      comp.setBoundVariable("paddingLeft", padXVar);
      comp.setBoundVariable("paddingRight", padXVar);
    } catch (e) {}
  }
  bindCornerRadius(comp, getVar("toggle/radius"));

  // Real toggleVariants: "outline" always has a border; "default" never
  // does. data-[state=on] background applies to both variants.
  if (pressed) {
    bindFill(comp, pickDisabled(disabled, "toggle/pressed", "toggle/pressed-disabled"));
  } else if (state === "hover" && getVar("toggle/background-hover")) {
    bindFill(comp, getVar("toggle/background-hover"));
  } else {
    comp.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
  }
  if (variantKey === "outline") {
    bindStroke(comp, pickDisabled(disabled, "toggle/border", "toggle/border-disabled"), null);
  } else {
    clearStrokes(comp);
  }

  var textColor = pressed
    ? getVar("toggle/text-pressed")
    : getVar("toggle/text");
  var label = makeText(
    "Toggle",
    "toggle",
    getVar("toggle/font-size"),
    getVar("toggle/font-weight"),
    textColor
  );
  var toggleSlot = makeIcon("plus", 16, textColor, getVar("icon/size/sm"));
  toggleSlot.name = "icon";
  toggleSlot.visible = false;
  comp.appendChild(toggleSlot);
  var toggleGapVar = getVar("toggle/icon-gap");
  comp.itemSpacing = toggleGapVar ? resolveSpace(toggleGapVar) : 8;
  bindProp(comp, "itemSpacing", toggleGapVar);
  comp.appendChild(label);
  return comp;
}

function buildToggle(x, y) {
  var toggleVariants = ["default", "outline"];
  var sizes = ["sm", "default", "lg"];
  var pressedStates = [false, true];
  var configs = [];
  for (var v = 0; v < toggleVariants.length; v++) {
    for (var i = 0; i < sizes.length; i++) {
      for (var j = 0; j < pressedStates.length; j++) {
        (function (variant, s, p) {
          [false, true].forEach(function (disabled) {
            // hover only where the code hovers: an off, enabled toggle (Plan 137)
            var states = !p && !disabled ? ["default", "hover"] : ["default"];
            states.forEach(function (state) {
              configs.push({
                variantProps: {
                  variant: variant,
                  size: s,
                  pressed: String(p),
                  disabled: String(disabled),
                  state: state,
                },
                buildFn: function () {
                  return buildToggleVariant(variant, s, p, disabled, state);
                },
              });
            });
          });
        })(toggleVariants[v], sizes[i], pressedStates[j]);
      }
    }
  }
  var toggleSet = buildComponentSet("Toggle", configs, "variant", x, y);
  pendingStateSets.push({
    set: toggleSet,
    props: configs.map(function (c) {
      return c.variantProps;
    }),
  });
  addIconSlot(toggleSet, "icon", "plus", "sm");
  return toggleSet;
}

// ============================================================
// BREADCRUMB — state (default, with-ellipsis)
// ============================================================
function buildBreadcrumbVariant(stateKey) {
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "AUTO";
  comp.itemSpacing = resolveSpace(getVar("breadcrumb/list-gap")) || 4;
  bindProp(comp, "itemSpacing", getVar("breadcrumb/list-gap"));
  comp.fills = [];

  var fontSizeVar = getVar("breadcrumb/font-size");
  var items =
    stateKey === "with-ellipsis"
      ? ["Home", "...", "Page", "Current"]
      : ["Home", "Section", "Current"];

  for (var i = 0; i < items.length; i++) {
    if (i > 0) {
      // BreadcrumbSeparator renders a ChevronRight icon at separator.size
      // (not a "/" glyph); same placeholder-chip convention as other icons
      var sepSizeVar = getVar("breadcrumb/separator-size");
      var sepSize = resolveSpace(sepSizeVar) || 14;
      var sep = makeIcon("chevron-right", sepSize, getVar("breadcrumb/text"), sepSizeVar);
      sep.name = "separator-icon";
      comp.appendChild(sep);
    }
    var isLast = i === items.length - 1;
    if (items[i] === "...") {
      // BreadcrumbEllipsis: ellipsis.size box holding a horizontal-dots icon
      var ellSizeVar = getVar("breadcrumb/ellipsis-size");
      var ellSize = resolveSpace(ellSizeVar) || 36;
      var ell = figma.createFrame();
      ell.name = "ellipsis";
      ell.layoutMode = "HORIZONTAL";
      ell.primaryAxisAlignItems = "CENTER";
      ell.counterAxisAlignItems = "CENTER";
      ell.primaryAxisSizingMode = "FIXED";
      ell.counterAxisSizingMode = "FIXED";
      resizeKeep(ell, ellSize, ellSize);
      bindSize(ell, ellSizeVar, ellSizeVar);
      ell.fills = [];
      ell.appendChild(
        makeText(
          "\u2022\u2022\u2022",
          "breadcrumb/item",
          fontSizeVar,
          null,
          getVar("breadcrumb/text")
        )
      );
      comp.appendChild(ell);
      continue;
    }
    var textColor = isLast
      ? getVar("breadcrumb/current")
      : getVar("breadcrumb/link");
    // Only the current (last) crumb is bold — intermediate links use default weight
    var crumb = makeText(
      items[i],
      "breadcrumb/item",
      fontSizeVar,
      isLast ? getVar("breadcrumb/page-font-weight") : null,
      textColor
    );
    comp.appendChild(crumb);
  }
  return comp;
}

function buildBreadcrumb(x, y) {
  var configs = [
    {
      variantProps: { state: "default" },
      buildFn: function () {
        return buildBreadcrumbVariant("default");
      },
    },
    {
      variantProps: { state: "with-ellipsis" },
      buildFn: function () {
        return buildBreadcrumbVariant("with-ellipsis");
      },
    },
  ];
  return buildComponentSet("Breadcrumb", configs, "state", x, y);
}

// ============================================================
// PAGINATION — state (default, with-info)
// ============================================================
// Real anatomy (packages/ui/src/pagination.tsx): Previous pill (chevron +
// "Previous" text) — page number pills, active one filled — an ellipsis
// item for truncated ranges — Next pill ("Next" text + chevron). There is
// no "with-info"/"showing X of Y" element in the real component; that was
// an invented state with no basis in the design system.
function makePaginationEllipsis(itemSize, textColor) {
  var item = figma.createFrame();
  item.layoutMode = "HORIZONTAL";
  item.primaryAxisAlignItems = "CENTER";
  item.counterAxisAlignItems = "CENTER";
  item.primaryAxisSizingMode = "FIXED";
  item.counterAxisSizingMode = "FIXED";
  resizeKeep(item, itemSize, itemSize);
  item.fills = [];
  var dots = makeText(
    "•••",
    "pagination/ellipsis",
    getVar("pagination/item/font-size"),
    getVar("pagination/item/font-weight"),
    textColor
  );
  item.appendChild(dots);
  return item;
}

function buildPaginationVariant(stateKey) {
  var comp = figma.createComponent();
  comp.name = "pagination";
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "AUTO";
  comp.itemSpacing = resolveSpace(getVar("pagination/list-gap")) || 8;
  bindProp(comp, "itemSpacing", getVar("pagination/list-gap"));
  comp.fills = [];

  var itemSize = resolveSpace(getVar("pagination/item/size")) || 40;
  var itemSizeVar = getVar("pagination/item/size");
  var padX = resolveSpace(getVar("pagination/item/padding-x")) || 8;
  var padXVar = getVar("pagination/item/padding-x");
  var itemGap = resolveSpace(getVar("pagination/item/gap")) || 4;
  var itemGapVar = getVar("pagination/item/gap");
  var fontSizeVar = getVar("pagination/item/font-size");
  var fontWeightVar = getVar("pagination/item/font-weight");
  var textColor = getVar("pagination/text");

  function makeNavPill(label, isPrevious) {
    var pill = figma.createFrame();
    pill.layoutMode = "HORIZONTAL";
    pill.primaryAxisAlignItems = "CENTER";
    pill.counterAxisAlignItems = "CENTER";
    pill.primaryAxisSizingMode = "AUTO";
    pill.counterAxisSizingMode = "FIXED";
    resizeKeep(pill, 1, itemSize);
    pill.paddingLeft = padX;
    bindProp(pill, "paddingLeft", padXVar);
    pill.paddingRight = padX;
    bindProp(pill, "paddingRight", padXVar);
    // Previous is pl-(pagination.ellipsis-padding-left) and Next is
    // pr-(pagination.ellipsis-padding-right) in code: the edge next to the icon is
    // padded less than the item padding-x (the tokens are named for the ellipsis)
    var edgePadVar = getVar(
      isPrevious
        ? "pagination/ellipsis-padding-left"
        : "pagination/ellipsis-padding-right"
    );
    if (edgePadVar) {
      var edgePad = resolveSpace(edgePadVar);
      var edgeSide = isPrevious ? "paddingLeft" : "paddingRight";
      pill[edgeSide] = edgePad;
      bindProp(pill, edgeSide, edgePadVar);
    }
    pill.itemSpacing = itemGap;
    bindProp(pill, "itemSpacing", itemGapVar);
    pill.fills = [];
    bindCornerRadius(pill, getVar("pagination/item/radius"));

    var chevronSize = resolveSpace(getVar("pagination/icon-size")) || 16;
    var chevronSizeVar = getVar("pagination/icon-size");
    var chevron = makeIcon(
      isPrevious ? "chevron-left" : "chevron-right",
      chevronSize,
      textColor,
      chevronSizeVar
    );

    var text = makeText(
      label,
      "pagination/nav",
      fontSizeVar,
      fontWeightVar,
      textColor
    );
    if (isPrevious) {
      pill.appendChild(chevron);
      pill.appendChild(text);
    } else {
      pill.appendChild(text);
      pill.appendChild(chevron);
    }
    return pill;
  }

  comp.appendChild(makeNavPill("Previous", true));

  var pageSpec =
    stateKey === "with-many-pages"
      ? ["1", "…", "4", "5", "6", "…", "20"]
      : ["1", "2", "3"];
  var activePage = stateKey === "with-many-pages" ? "5" : "2";

  for (var i = 0; i < pageSpec.length; i++) {
    if (pageSpec[i] === "…") {
      comp.appendChild(makePaginationEllipsis(itemSize, textColor));
      continue;
    }
    var item = figma.createFrame();
    item.layoutMode = "HORIZONTAL";
    item.primaryAxisAlignItems = "CENTER";
    item.counterAxisAlignItems = "CENTER";
    item.primaryAxisSizingMode = "FIXED";
    item.counterAxisSizingMode = "FIXED";
    resizeKeep(item, itemSize, itemSize);
    var itemSizeVar = getVar("pagination/item/size");
    if (itemSizeVar) {
      try {
        item.setBoundVariable("width", itemSizeVar);
        item.setBoundVariable("height", itemSizeVar);
      } catch (e) {}
    }
    bindCornerRadius(item, getVar("pagination/item/radius"));

    var isActive = pageSpec[i] === activePage;
    if (isActive) {
      bindFill(item, getVar("pagination/active"));
    } else {
      item.fills = [];
    }
    var pageColor = isActive
      ? getVar("pagination/text-active")
      : getVar("pagination/text");
    var label = makeText(
      pageSpec[i],
      "pagination/item",
      fontSizeVar,
      fontWeightVar,
      pageColor
    );
    item.appendChild(label);
    comp.appendChild(item);
  }

  comp.appendChild(makeNavPill("Next", false));

  return comp;
}

function buildPagination(x, y) {
  var configs = [
    {
      variantProps: { state: "default" },
      buildFn: function () {
        return buildPaginationVariant("default");
      },
    },
    {
      variantProps: { state: "with-many-pages" },
      buildFn: function () {
        return buildPaginationVariant("with-many-pages");
      },
    },
  ];
  return buildComponentSet("Pagination", configs, "state", x, y);
}

// ============================================================
// TABLE — state (default, with-selection)
// ============================================================
function makeTableCheckboxCell(checked, rowHeight) {
  var checkboxSize = resolveSpace(getVar("checkbox/size/md")) || 16;
  var checkboxSizeVar = getVar("checkbox/size/md");
  var cell = figma.createFrame();
  cell.layoutMode = "HORIZONTAL";
  cell.primaryAxisAlignItems = "CENTER";
  cell.counterAxisAlignItems = "CENTER";
  cell.primaryAxisSizingMode = "FIXED";
  cell.counterAxisSizingMode = "FIXED";
  resizeKeep(cell, 40, rowHeight);
  cell.fills = [];

  var box = figma.createFrame();
  resizeKeep(box, checkboxSize, checkboxSize);
  bindCornerRadius(box, getVar("checkbox/border/radius"));
  if (checked) {
    bindFill(box, getVar("checkbox/background-checked"));
    bindStroke(box, getVar("checkbox/border-checked"), null);
  } else {
    box.fills = [];
    bindStroke(box, getVar("checkbox/border/color"), null);
  }
  cell.appendChild(box);
  return cell;
}

function buildTableVariant(stateKey) {
  var withSelection = stateKey === "with-selection";
  var withFooter = stateKey === "with-footer";
  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, withSelection ? 520 : 480, 200);
  comp.fills = [];
  // Real Table (packages/ui/src/table.tsx) has no outer border — only the
  // header row's bottom border, applied below

  var padX = resolveSpace(getVar("table/cell/padding-x")) || 24;
  var padXVar = getVar("table/cell/padding-x");
  var padY = resolveSpace(getVar("table/cell/padding-y")) || 16;
  var padYVar = getVar("table/cell/padding-y");
  var headerH = resolveSpace(getVar("table/header/height")) || 48;
  var headerHVar = getVar("table/header/height");
  var fontSizeVar = getVar("table/header/font-size");
  var headers = ["Name", "Status", "Date", "Amount"];

  // Header row
  var headerRow = figma.createFrame();
  headerRow.layoutMode = "HORIZONTAL";
  headerRow.primaryAxisSizingMode = "AUTO";
  headerRow.counterAxisSizingMode = "FIXED";
  resizeKeep(headerRow, withSelection ? 520 : 480, headerH);
  headerRow.fills = [];
  bindStroke(headerRow, getVar("table/border"), null);
  headerRow.strokeTopWeight = 0;
  headerRow.strokeLeftWeight = 0;
  headerRow.strokeRightWeight = 0;
  headerRow.strokeBottomWeight = 1;
  headerRow.strokeAlign = "INSIDE";

  if (withSelection) {
    headerRow.appendChild(makeTableCheckboxCell(false, headerH));
  }

  for (var h = 0; h < headers.length; h++) {
    var cell = figma.createFrame();
    cell.layoutMode = "HORIZONTAL";
    cell.primaryAxisAlignItems = "MIN";
    cell.counterAxisAlignItems = "CENTER";
    cell.primaryAxisSizingMode = "FIXED";
    cell.counterAxisSizingMode = "FIXED";
    resizeKeep(cell, 120, headerH);
    cell.paddingLeft = padX;
    bindProp(cell, "paddingLeft", padXVar);
    cell.paddingRight = padX;
    bindProp(cell, "paddingRight", padXVar);
    cell.fills = [];
    var headerLabel = makeText(
      headers[h],
      "table/header",
      fontSizeVar,
      getVar("table/header/font-weight"),
      getVar("table/header-text")
    );
    cell.appendChild(headerLabel);
    headerRow.appendChild(cell);
  }
  comp.appendChild(headerRow);

  // Data rows
  var rows = [
    ["Alice", "Active", "2025-01-01", "$100"],
    ["Bob", "Inactive", "2025-01-02", "$200"],
  ];
  var cellFontSizeVar = getVar("table/cell/font-size");
  for (var r = 0; r < rows.length; r++) {
    var row = figma.createFrame();
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisSizingMode = "AUTO";
    row.counterAxisSizingMode = "FIXED";
    resizeKeep(row, withSelection ? 520 : 480, headerH);
    // body rows hug their cells in code: cell padding plus line height, plus the rule
    row.counterAxisSizingMode = "AUTO";
    row.fills = [];

    // TableRow: border-b on every row but the last (tbody last-child has
    // none), hover is a pseudo-class and stays out, and a selected row
    // (data-state=selected, set when its checkbox is checked) fills with
    // table.row-selected. The "with-selection" variant shows the first row
    // selected; the story itself ships all rows unchecked.
    var selectedRow = withSelection && r === 0;
    if (selectedRow) bindFill(row, getVar("table/row-selected"));
    if (r < rows.length - 1 || withFooter) {
      bindStroke(row, getVar("table/border"), getVar("table/border-width"));
      row.strokeTopWeight = 0;
      row.strokeLeftWeight = 0;
      row.strokeRightWeight = 0;
      row.strokeBottomWeight = resolveSpace(getVar("table/border-width")) || 1;
      row.strokeAlign = "INSIDE";
      // the stroke counts in the row's height (strokes are included in layout), as the rule does in code
    }

    if (withSelection) {
      row.appendChild(makeTableCheckboxCell(selectedRow, headerH));
    }

    for (var c = 0; c < rows[r].length; c++) {
      var dataCell = figma.createFrame();
      dataCell.layoutMode = "HORIZONTAL";
      dataCell.primaryAxisAlignItems = "MIN";
      dataCell.counterAxisAlignItems = "CENTER";
      dataCell.primaryAxisSizingMode = "FIXED";
      dataCell.counterAxisSizingMode = "FIXED";
      resizeKeep(dataCell, 120, headerH);
      dataCell.counterAxisSizingMode = "AUTO";
      dataCell.paddingTop = padY;
      bindProp(dataCell, "paddingTop", padYVar);
      dataCell.paddingBottom = padY;
      bindProp(dataCell, "paddingBottom", padYVar);
      dataCell.paddingLeft = padX;
      bindProp(dataCell, "paddingLeft", padXVar);
      dataCell.paddingRight = padX;
      bindProp(dataCell, "paddingRight", padXVar);
      dataCell.fills = [];
      var cellLabel = makeText(
        rows[r][c],
        "table/cell",
        cellFontSizeVar,
        null,
        getVar("table/header-text")
      );
      dataCell.appendChild(cellLabel);
      row.appendChild(dataCell);
    }
    comp.appendChild(row);
  }

  // TableFooter: footer-background fill, bolder text, top border
  if (withFooter) {
    var footerRow = figma.createFrame();
    footerRow.name = "table-footer";
    footerRow.layoutMode = "HORIZONTAL";
    footerRow.primaryAxisSizingMode = "AUTO";
    footerRow.counterAxisSizingMode = "FIXED";
    resizeKeep(footerRow, 480, headerH);
    footerRow.counterAxisSizingMode = "AUTO";
    bindFill(footerRow, getVar("table/footer-background"));
    bindStroke(footerRow, getVar("table/border"), getVar("table/border-width"));
    footerRow.strokeBottomWeight = 0;
    footerRow.strokeLeftWeight = 0;
    footerRow.strokeRightWeight = 0;
    footerRow.strokeTopWeight = resolveSpace(getVar("table/border-width")) || 1;
    footerRow.strokeAlign = "INSIDE";
    var footerCells = ["Total", "", "", "$300"];
    for (var fc = 0; fc < footerCells.length; fc++) {
      var footerCell = figma.createFrame();
      footerCell.layoutMode = "HORIZONTAL";
      footerCell.primaryAxisAlignItems = "MIN";
      footerCell.counterAxisAlignItems = "CENTER";
      footerCell.primaryAxisSizingMode = "FIXED";
      footerCell.counterAxisSizingMode = "FIXED";
      resizeKeep(footerCell, 120, headerH);
      footerCell.counterAxisSizingMode = "AUTO";
      footerCell.paddingTop = padY;
      bindProp(footerCell, "paddingTop", padYVar);
      footerCell.paddingBottom = padY;
      bindProp(footerCell, "paddingBottom", padYVar);
      footerCell.paddingLeft = padX;
      bindProp(footerCell, "paddingLeft", padXVar);
      footerCell.paddingRight = padX;
      bindProp(footerCell, "paddingRight", padXVar);
      footerCell.fills = [];
      if (footerCells[fc]) {
        footerCell.appendChild(
          makeText(
            footerCells[fc],
            "table/cell",
            cellFontSizeVar,
            getVar("table/footer-font-weight"),
            getVar("table/header-text")
          )
        );
      }
      footerRow.appendChild(footerCell);
    }
    comp.appendChild(footerRow);
  }

  // TableCaption: caption-bottom, caption colour, margin above
  if (!withSelection) {
    var captionWrap = figma.createFrame();
    captionWrap.name = "table-caption";
    captionWrap.layoutMode = "VERTICAL";
    captionWrap.primaryAxisSizingMode = "AUTO";
    captionWrap.counterAxisSizingMode = "AUTO";
    captionWrap.fills = [];
    captionWrap.paddingTop = resolveSpace(getVar("table/caption-margin-top")) || 16;
    bindProp(captionWrap, "paddingTop", getVar("table/caption-margin-top"));
    captionWrap.appendChild(
      makeText(
        "A list of your recent invoices.",
        "table/caption",
        getVar("table/caption-font-size"),
        null,
        getVar("table/caption")
      )
    );
    comp.appendChild(captionWrap);
  }
  return comp;
}

function buildTable(x, y) {
  var configs = [
    {
      variantProps: { state: "default" },
      buildFn: function () {
        return buildTableVariant("default");
      },
    },
    {
      variantProps: { state: "with-selection" },
      buildFn: function () {
        return buildTableVariant("with-selection");
      },
    },
    {
      variantProps: { state: "with-footer" },
      buildFn: function () {
        return buildTableVariant("with-footer");
      },
    },
  ];
  return buildComponentSet("Table", configs, "state", x, y);
}

// ============================================================
// SHEET — side (left, right) × size (sm, md, lg)
// ============================================================
function buildSheetVariant(sideKey, sizeKey) {
  var widthVar = getVar("sheet/content/width/" + sizeKey);
  var width = resolveSpace(widthVar) || 256;
  var pad = resolveSpace(getVar("sheet/content/padding")) || 32;
  var padVar = getVar("sheet/content/padding");

  // Real sheetContentVariants (packages/ui/src/sheet.tsx): top/bottom are
  // full-width with auto (content-driven) height — the size token's
  // compound variants only apply to left/right, which are full-height with
  // a size-driven fixed width. Size has no effect on top/bottom at all.
  var isHorizontal = sideKey === "top" || sideKey === "bottom";
  var panelWidth = isHorizontal ? 480 : width;
  var panelHeight = 400;

  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = isHorizontal ? "AUTO" : "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, panelWidth, isHorizontal ? 1 : panelHeight);
  if (widthVar && !isHorizontal) {
    try {
      comp.setBoundVariable("width", widthVar);
    } catch (e) {}
  }
  comp.paddingTop = pad;
  bindProp(comp, "paddingTop", padVar);
  comp.paddingBottom = pad;
  bindProp(comp, "paddingBottom", padVar);
  comp.paddingLeft = pad;
  bindProp(comp, "paddingLeft", padVar);
  comp.paddingRight = pad;
  bindProp(comp, "paddingRight", padVar);
  comp.itemSpacing = resolveSpace(getVar("sheet/header/gap")) || 8;
  bindProp(comp, "itemSpacing", getVar("sheet/header/gap"));
  bindFill(comp, getVar("sheet/content/background"));
  applyEffectStyle(comp, "shadow/lg");
  // the edge facing the page carries the border in code (border-l for a right sheet, ...)
  strokeOneSide(
    comp,
    { right: "left", left: "right", top: "bottom", bottom: "top" }[sideKey],
    getVar("sheet/content/border"),
    getVar("sheet/border-width")
  );

  var titleFontSizeVar = getVar("sheet/title/font-size");
  var titleWeightVar = getVar("sheet/title/font-weight");
  var title = makeText(
    "Sheet Title",
    "sheet/title",
    titleFontSizeVar,
    titleWeightVar,
    getVar("sheet/title/text")
  );
  var desc = makeText(
    "Sheet description text goes here.",
    "sheet/description",
    getVar("sheet/description/font-size"),
    null,
    getVar("sheet/description/text")
  );
  comp.appendChild(title);
  comp.appendChild(desc);

  // SheetContent always renders its close button, absolutely positioned
  // top-right (sheet.close-button-offset), same chip convention as Dialog
  var sheetCloseSizeVar = getVar("sheet/close-button.icon-size");
  var sheetCloseSize = resolveSpace(sheetCloseSizeVar) || 16;
  var sheetCloseOffsetVar = getVar("sheet/close-button-offset");
  var sheetCloseOffset = resolveSpace(sheetCloseOffsetVar) || 16;
  var sheetClose = makeIcon("x", sheetCloseSize, getVar("sheet/title/text"), sheetCloseSizeVar);
  sheetClose.name = "close-button";
  bindOpacity(sheetClose, getVar("sheet/close-button.opacity"));
  comp.appendChild(sheetClose);
  try {
    sheetClose.layoutPositioning = "ABSOLUTE";
    sheetClose.x = panelWidth - sheetCloseOffset - sheetCloseSize;
    sheetClose.y = sheetCloseOffset;
  } catch (e) {}
  return comp;
}

function buildSheet(x, y) {
  // `side` only changes which screen edge the panel docks to; drawn on its
  // own the left and right panels look the same, so only size is a variant.
  var sizes = ["sm", "md", "lg"];
  var configs = [];
  for (var j = 0; j < sizes.length; j++) {
    (function (size) {
      configs.push({
        variantProps: { size: size },
        buildFn: function () {
          return buildSheetVariant("right", size);
        },
      });
    })(sizes[j]);
  }
  return buildComponentSet("Sheet", configs, "size", x, y);
}

// ============================================================
// HOVER CARD — size (sm, md, lg)
// ============================================================
function buildHoverCardVariant(sizeKey) {
  var widthVar = getVar("hover-card/content/width/" + sizeKey);
  var width = resolveSpace(widthVar) || 240;
  var pad = resolveSpace(getVar("hover-card/content-padding")) || 24;
  var padVar = getVar("hover-card/content-padding");

  var comp = buildOverlaySurface(
    width,
    100,
    getVar("hover-card/background"),
    getVar("hover-card/border"),
    getVar("hover-card/content-radius"),
    "shadow/md"
  );
  if (widthVar) {
    try {
      comp.setBoundVariable("width", widthVar);
    } catch (e) {}
  }
  comp.paddingTop = pad;
  bindProp(comp, "paddingTop", padVar);
  comp.paddingBottom = pad;
  bindProp(comp, "paddingBottom", padVar);
  comp.paddingLeft = pad;
  bindProp(comp, "paddingLeft", padVar);
  comp.paddingRight = pad;
  bindProp(comp, "paddingRight", padVar);
  comp.itemSpacing = 0; // content flows as written, no gap in code

  var title = makeText(
    "Hover Card Title",
    "hover-card/title",
    slotTextSize(),
    null,
    getVar("hover-card/text")
  );
  var body = makeText(
    "Hover card content text.",
    "hover-card/body",
    slotTextSize(),
    null,
    getVar("hover-card/text")
  );
  comp.appendChild(title);
  comp.appendChild(body);
  return comp;
}

function buildHoverCard(x, y) {
  var sizes = ["sm", "md", "lg"];
  var configs = [];
  for (var i = 0; i < sizes.length; i++) {
    (function (s) {
      configs.push({
        variantProps: { size: s },
        buildFn: function () {
          return buildHoverCardVariant(s);
        },
      });
    })(sizes[i]);
  }
  return buildComponentSet("Hover Card", configs, "size", x, y);
}

// ============================================================
// COLLAPSIBLE — state (open, closed)
// ============================================================
function buildCollapsibleVariant(stateKey) {
  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, 280, 40);
  // the root has no box of its own in code: collapsible.background and collapsible.radius
  // belong to CollapsibleContent, drawn only when open (below)
  comp.fills = [];

  var trigger = figma.createFrame();
  trigger.layoutMode = "HORIZONTAL";
  trigger.primaryAxisAlignItems = "SPACE_BETWEEN";
  trigger.counterAxisAlignItems = "CENTER";
  trigger.primaryAxisSizingMode = "AUTO";
  trigger.counterAxisSizingMode = "AUTO";
  trigger.fills = [];
  var trigLabel = makeText(
    "Collapsible Header",
    "collapsible/trigger",
    slotTextSize(),
    null,
    slotTextColor()
  );
  try {
    trigLabel.layoutSizingHorizontal = "FILL";
  } catch (e) {}
  trigger.appendChild(trigLabel);
  comp.appendChild(trigger);

  if (stateKey === "open") {
    var content = figma.createFrame();
    content.layoutMode = "VERTICAL";
    content.primaryAxisSizingMode = "AUTO";
    content.counterAxisSizingMode = "AUTO";
    content.paddingTop = 0;
    // CollapsibleContent: rounded-(--space-collapsible-radius) bg-(--color-collapsible-background)
    bindCornerRadius(content, getVar("collapsible/radius"));
    bindFill(content, getVar("collapsible/background"));
    var bodyText = makeText(
      "Collapsible content text.",
      "collapsible/body",
      slotTextSize(),
      null,
      slotTextColor()
    );
    content.appendChild(bodyText);
    comp.appendChild(content);
  }
  return comp;
}

function buildCollapsible(x, y) {
  var configs = [
    {
      variantProps: { open: "false" },
      buildFn: function () {
        return buildCollapsibleVariant("closed");
      },
    },
    {
      variantProps: { open: "true" },
      buildFn: function () {
        return buildCollapsibleVariant("open");
      },
    },
  ];
  return buildComponentSet("Collapsible", configs, "open", x, y);
}

// ============================================================
// SCROLLBAR — orientation (vertical, horizontal)
// ============================================================
function buildScrollbarVariant(orientation) {
  var comp = figma.createComponent();
  var w = resolveSpace(getVar("scrollbar/width")) || 8;
  var wVar = getVar("scrollbar/width");
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisAlignItems = "MIN";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  if (orientation === "vertical") {
    resizeKeep(comp, w, 200);
  } else {
    resizeKeep(comp, 200, w);
    comp.layoutMode = "HORIZONTAL";
  }
  comp.fills = [];
  // The track in code: rounded (scrollbar.radius), padded (scrollbar.padding) on every side,
  // with a transparent border on its leading edge (border-l, or border-t when horizontal)
  bindCornerRadius(comp, getVar("scrollbar/radius"));
  var trackPadVar = getVar("scrollbar/padding");
  var trackPad = resolveSpace(trackPadVar) || 1;
  ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].forEach(
    function (side) {
      comp[side] = trackPad;
      bindProp(comp, side, trackPadVar);
    }
  );
  transparentBorder(comp, getVar("scrollbar/border-width"));
  // read the weight first: once one side differs, strokeWeight reads back as figma.mixed
  var leadWeight = comp.strokeWeight;
  comp.strokeTopWeight = orientation === "vertical" ? 0 : leadWeight;
  comp.strokeLeftWeight = orientation === "vertical" ? leadWeight : 0;
  comp.strokeRightWeight = 0;
  comp.strokeBottomWeight = 0;

  var thumb = figma.createFrame();
  var thumbMinH = resolveSpace(getVar("scrollbar/thumb-min-height")) || 40;
  var thumbMinHVar = getVar("scrollbar/thumb-min-height");
  // the thumb fills the track across (flex-1 inside the padding and border), min-height along
  if (orientation === "vertical") {
    resizeKeep(thumb, 1, thumbMinH);
  } else {
    resizeKeep(thumb, thumbMinH, 1);
  }
  var scrollRadiusVar = getVar("scrollbar/thumb-radius");
  if (scrollRadiusVar) {
    try {
      thumb.setBoundVariable("cornerRadius", scrollRadiusVar);
    } catch (e) {
      thumb.cornerRadius = 9999;
    }
  } else {
    thumb.cornerRadius = 9999;
  }
  bindFill(thumb, getVar("scrollbar/thumb"));
  comp.appendChild(thumb);
  thumb.layoutAlign = "STRETCH"; // fill the track across its padding
  return comp;
}

function buildScrollbar(x, y) {
  var configs = [
    {
      variantProps: { orientation: "vertical" },
      buildFn: function () {
        return buildScrollbarVariant("vertical");
      },
    },
    {
      variantProps: { orientation: "horizontal" },
      buildFn: function () {
        return buildScrollbarVariant("horizontal");
      },
    },
  ];
  return buildComponentSet("Scrollbar", configs, "orientation", x, y);
}

// ============================================================
// CONTEXT MENU — state (default, hover)
// ============================================================
function buildContextMenuVariant(stateKey) {
  var minWidth = resolveSpace(getVar("context-menu/content/min-width")) || 192;
  var minWidthVar = getVar("context-menu/content/min-width");
  var pad = resolveSpace(getVar("context-menu/content/padding")) || 4;
  var padVar = getVar("context-menu/content/padding");

  var comp = buildOverlaySurface(
    minWidth,
    160,
    getVar("contextmenu/background"),
    getVar("contextmenu/border"),
    getVar("context-menu/content-radius"),
    "shadow/md"
  );
  comp.paddingTop = pad;
  bindProp(comp, "paddingTop", padVar);
  comp.paddingBottom = pad;
  bindProp(comp, "paddingBottom", padVar);
  comp.paddingLeft = pad;
  bindProp(comp, "paddingLeft", padVar);
  comp.paddingRight = pad;
  bindProp(comp, "paddingRight", padVar);
  comp.itemSpacing = 0; // real items stack flush, no gap between them

  var items = ["Menu Item", "Menu Item", "Menu Item"];
  var padX = resolveSpace(getVar("context-menu/item/padding-x")) || 8;
  var padXVar = getVar("context-menu/item/padding-x");
  var padY = resolveSpace(getVar("context-menu/item/padding-y")) || 4;
  var padYVar = getVar("context-menu/item/padding-y");
  var fontSizeVar = getVar("context-menu/item-font-size");

  addMenuLabel(comp, "My Account", {
    styleName: "context-menu/item",
    fontSizeVar: fontSizeVar,
    weightVar: getVar("context-menu/label-font-weight"),
    colorVar: getVar("contextmenu/label"),
    padX: padX,
    padXVar: padXVar,
    padY: padY,
    padYVar: padYVar,
  });

  for (var i = 0; i < items.length; i++) {
    var item = figma.createFrame();
    item.layoutMode = "HORIZONTAL";
    item.primaryAxisAlignItems = "MIN"; // items are left aligned
    item.counterAxisAlignItems = "CENTER";
    item.primaryAxisSizingMode = "AUTO";
    item.counterAxisSizingMode = "AUTO";
    item.paddingTop = padY;
    bindProp(item, "paddingTop", padYVar);
    item.paddingBottom = padY;
    bindProp(item, "paddingBottom", padYVar);
    item.paddingLeft = padX;
    bindProp(item, "paddingLeft", padXVar);
    item.paddingRight = padX;
    bindProp(item, "paddingRight", padXVar);
    bindCornerRadius(item, getVar("context-menu/item-radius"));
    if (stateKey === "hover" && i === 0) {
      bindFill(item, getVar("contextmenu/item-hover"));
    } else {
      item.fills = [];
    }
    var textColor =
      stateKey === "hover" && i === 0
        ? getVar("contextmenu/item-text-hover")
        : getVar("contextmenu/text");
    var label = makeText(
      items[i],
      "context-menu/item",
      fontSizeVar,
      null,
      textColor
    );
    item.appendChild(label);
    if (i === 0) {
      item.primaryAxisAlignItems = "SPACE_BETWEEN";
      addMenuShortcut(item, "\u2318[", {
        styleName: "context-menu/shortcut",
        fontSizeVar: getVar("context-menu/shortcut-font-size"),
        colorVar: getVar("contextmenu/shortcut"),
      });
    }
    comp.appendChild(item);
    try {
      stretch(item);
    } catch (e) {}
    if (i === 1) {
      addMenuSeparator(comp, {
        colorVar: getVar("contextmenu/separator"),
        heightVar: null,
        marginYVar: getVar("context-menu/separator-margin-y"),
      });
    }
  }
  return comp;
}

function buildContextMenu(x, y) {
  var configs = [
    {
      variantProps: { state: "default" },
      buildFn: function () {
        return buildContextMenuVariant("default");
      },
    },
    {
      variantProps: { state: "hover" },
      buildFn: function () {
        return buildContextMenuVariant("hover");
      },
    },
  ];
  return buildComponentSet("Context Menu", configs, "state", x, y);
}

// ============================================================
// MENUBAR — state (default, open)
// ============================================================
function buildMenubarVariant(stateKey) {
  var h = resolveSpace(getVar("menubar/root/height")) || 40;
  var hVar = getVar("menubar/root/height");
  var pad = resolveSpace(getVar("menubar/root/padding")) || 4;
  var padVar = getVar("menubar/root/padding");
  // outer frame stacks the bar and, when open, the menu content under it
  var outer = figma.createComponent();
  outer.layoutMode = "VERTICAL";
  outer.primaryAxisSizingMode = "AUTO";
  outer.counterAxisSizingMode = "AUTO";
  var sideOffsetVar = getVar("menubar/content-side-offset");
  outer.itemSpacing = sideOffsetVar ? resolveSpace(sideOffsetVar) : 8;
  bindProp(outer, "itemSpacing", sideOffsetVar);
  outer.fills = [];
  var comp = figma.createFrame();
  comp.name = "bar";
  outer.appendChild(comp);
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, 400, h);
  comp.paddingLeft = pad;
  bindProp(comp, "paddingLeft", padVar);
  comp.paddingRight = pad;
  bindProp(comp, "paddingRight", padVar);
  // the bar in code is p-(menubar.root.padding) on all four sides and rounded like a trigger
  comp.paddingTop = pad;
  bindProp(comp, "paddingTop", padVar);
  comp.paddingBottom = pad;
  bindProp(comp, "paddingBottom", padVar);
  bindCornerRadius(comp, getVar("menubar/trigger-radius"));
  comp.itemSpacing = resolveSpace(getVar("menubar/list-gap")) || 4;
  bindProp(comp, "itemSpacing", getVar("menubar/list-gap"));
  bindFill(comp, getVar("menubar/background"));
  bindStroke(comp, getVar("menubar/border"), null);

  var trigPadX = resolveSpace(getVar("menubar/trigger/padding-x")) || 12;
  var trigPadXVar = getVar("menubar/trigger/padding-x");
  var trigPadY = resolveSpace(getVar("menubar/trigger/padding-y")) || 4;
  var trigPadYVar = getVar("menubar/trigger/padding-y");
  var menus = ["File", "Edit", "View"];
  var fontSizeVar = getVar("menubar/item-font-size");
  var fontWeightVar = getVar("menubar/trigger/font-weight");

  for (var i = 0; i < menus.length; i++) {
    var trig = figma.createFrame();
    trig.layoutMode = "HORIZONTAL";
    trig.primaryAxisAlignItems = "CENTER";
    trig.counterAxisAlignItems = "CENTER";
    trig.primaryAxisSizingMode = "AUTO";
    trig.counterAxisSizingMode = "AUTO";
    trig.paddingTop = trigPadY;
    bindProp(trig, "paddingTop", trigPadYVar);
    trig.paddingBottom = trigPadY;
    bindProp(trig, "paddingBottom", trigPadYVar);
    trig.paddingLeft = trigPadX;
    bindProp(trig, "paddingLeft", trigPadXVar);
    trig.paddingRight = trigPadX;
    bindProp(trig, "paddingRight", trigPadXVar);
    bindCornerRadius(trig, getVar("menubar/trigger-radius"));
    if (stateKey === "open" && i === 0) {
      bindFill(trig, getVar("menubar/trigger-open"));
    } else {
      trig.fills = [];
    }
    var textColor =
      stateKey === "open" && i === 0
        ? getVar("menubar/trigger-text-open")
        : getVar("menubar/content-text");
    var label = makeText(
      menus[i],
      "menubar/trigger",
      fontSizeVar,
      fontWeightVar,
      textColor
    );
    trig.appendChild(label);
    comp.appendChild(trig);
  }
    if (stateKey === "open") {
    // MenubarContent: content-background/border, shadow, label + items with
    // shortcuts + separator (same shared parts as the other menus)
    var mPadVar = getVar("menubar/checkbox-padding");
    var mPad = resolveSpace(mPadVar) || 4;
    var mItemPadX = resolveSpace(getVar("menubar/item/padding-x")) || 8;
    var mItemPadXVar = getVar("menubar/item/padding-x");
    var mItemPadY = resolveSpace(getVar("menubar/item-padding-y")) || 4;
    var mItemPadYVar = getVar("menubar/item-padding-y");
    var panel = buildOverlaySurface(
      resolveSpace(getVar("menubar/content-min-width")) || 192,
      100,
      getVar("menubar/content-background"),
      getVar("menubar/content-border"),
      getVar("menubar/trigger-radius"),
      "shadow/md",
      true
    );
    panel.name = "content";
    panel.primaryAxisSizingMode = "AUTO";
    bindProp(panel, "width", getVar("menubar/content-min-width"));
    panel.paddingTop = mPad;
    bindProp(panel, "paddingTop", mPadVar);
    panel.paddingBottom = mPad;
    bindProp(panel, "paddingBottom", mPadVar);
    panel.paddingLeft = mPad;
    bindProp(panel, "paddingLeft", mPadVar);
    panel.paddingRight = mPad;
    bindProp(panel, "paddingRight", mPadVar);
    panel.itemSpacing = 0; // real items stack flush, no gap between them
    addMenuLabel(panel, "Actions", {
      styleName: "menubar/item",
      fontSizeVar: fontSizeVar,
      weightVar: getVar("menubar/label-font-weight"),
      colorVar: getVar("menubar/label"),
      padX: mItemPadX,
      padXVar: mItemPadXVar,
      padY: mItemPadY,
      padYVar: mItemPadYVar,
    });
    var mItems = [
      ["New Tab", "\u2318T"],
      ["New Window", "\u2318N"],
      ["Print", "\u2318P"],
    ];
    for (var mi = 0; mi < mItems.length; mi++) {
      var mItem = figma.createFrame();
      mItem.name = "menu-item";
      mItem.layoutMode = "HORIZONTAL";
      mItem.primaryAxisAlignItems = "SPACE_BETWEEN";
      mItem.counterAxisAlignItems = "CENTER";
      mItem.primaryAxisSizingMode = "FIXED";
      mItem.counterAxisSizingMode = "AUTO";
      mItem.fills = [];
      mItem.paddingLeft = mItemPadX;
      bindProp(mItem, "paddingLeft", mItemPadXVar);
      mItem.paddingRight = mItemPadX;
      bindProp(mItem, "paddingRight", mItemPadXVar);
      mItem.paddingTop = mItemPadY;
      bindProp(mItem, "paddingTop", mItemPadYVar);
      mItem.paddingBottom = mItemPadY;
      bindProp(mItem, "paddingBottom", mItemPadYVar);
      bindCornerRadius(mItem, getVar("menubar/item-radius"));
      mItem.appendChild(
        makeText(
          mItems[mi][0],
          "menubar/item",
          fontSizeVar,
          null,
          getVar("menubar/content-text")
        )
      );
      addMenuShortcut(mItem, mItems[mi][1], {
        styleName: "menubar/shortcut",
        fontSizeVar: getVar("menubar/shortcut-font-size"),
        colorVar: getVar("menubar/shortcut"),
      });
      panel.appendChild(mItem);
      try {
        stretch(mItem);
      } catch (e) {}
      if (mi === 1) {
        addMenuSeparator(panel, {
          colorVar: getVar("menubar/separator"),
          heightVar: getVar("menubar/separator-height"),
          marginYVar: getVar("menubar/separator-margin-y"),
        });
      }
    }
    outer.appendChild(panel);
  }
  return outer;
}

function buildMenubar(x, y) {
  var configs = [
    {
      variantProps: { state: "default" },
      buildFn: function () {
        return buildMenubarVariant("default");
      },
    },
    {
      variantProps: { state: "open" },
      buildFn: function () {
        return buildMenubarVariant("open");
      },
    },
  ];
  return buildComponentSet("Menubar", configs, "state", x, y);
}

// ============================================================
// NAVIGATION MENU — state (default, active)
// ============================================================
function buildNavigationVariant(stateKey) {
  // Outer frame stacks the trigger row and, when open, the content viewport
  // (the real viewport sits under the list at top-full + margin-top).
  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisAlignItems = "MIN";
  comp.counterAxisAlignItems = "MIN";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "AUTO";
  comp.itemSpacing = resolveSpace(getVar("navigation-menu/indicator-margin-top")) || 6;
  bindProp(comp, "itemSpacing", getVar("navigation-menu/indicator-margin-top"));
  comp.fills = [];

  var list = figma.createFrame();
  list.name = "list";
  list.layoutMode = "HORIZONTAL";
  list.primaryAxisAlignItems = "CENTER";
  list.counterAxisAlignItems = "CENTER";
  list.primaryAxisSizingMode = "AUTO";
  list.counterAxisSizingMode = "AUTO";
  list.itemSpacing = resolveSpace(getVar("navigation-menu/list-gap")) || 4;
  bindProp(list, "itemSpacing", getVar("navigation-menu/list-gap"));
  list.fills = [];
  comp.appendChild(list);

  var padX = resolveSpace(getVar("navigation-menu/trigger-padding-x")) || 16;
  var padXVar = getVar("navigation-menu/trigger-padding-x");
  var padY = resolveSpace(getVar("navigation-menu/trigger-padding-y")) || 8;
  var padYVar = getVar("navigation-menu/trigger-padding-y");
  var triggerHeightVar = getVar("navigation-menu/trigger.height");
  var fontSizeVar = getVar("navigation-menu/trigger-font-size");
  var fontWeightVar = getVar("navigation-menu/trigger/font-weight");
  var items = ["Home", "About", "Products", "Contact"];
  // Products is a NavigationMenuTrigger (label + chevron); the rest are links
  var TRIGGER_INDEX = 2;

  for (var i = 0; i < items.length; i++) {
    var trig = figma.createFrame();
    trig.layoutMode = "HORIZONTAL";
    trig.primaryAxisAlignItems = "CENTER";
    trig.counterAxisAlignItems = "CENTER";
    trig.primaryAxisSizingMode = "AUTO";
    trig.counterAxisSizingMode = "AUTO";
    trig.paddingTop = padY;
    bindProp(trig, "paddingTop", padYVar);
    trig.paddingBottom = padY;
    bindProp(trig, "paddingBottom", padYVar);
    trig.paddingLeft = padX;
    bindProp(trig, "paddingLeft", padXVar);
    trig.paddingRight = padX;
    bindProp(trig, "paddingRight", padXVar);
    bindCornerRadius(trig, getVar("navigation-menu/trigger-radius"));

    // Rest background is navigation.background (not transparent); the active
    // page link swaps to navigation.active, an open trigger to navigation.open
    var isActive = stateKey === "active" && i === 0;
    var isOpen = stateKey === "open" && i === TRIGGER_INDEX;
    if (isActive) {
      bindFill(trig, getVar("navigation/active"));
    } else if (isOpen) {
      bindFill(trig, getVar("navigation/open"));
    } else {
      bindFill(trig, getVar("navigation/background"));
    }

    // data-[active] only swaps the background — the real component pairs a
    // text-color change only with :focus, not with the active-page state
    var textColor = getVar("navigation/content-text");
    var label = makeText(
      items[i],
      "navigation-menu/item",
      fontSizeVar,
      fontWeightVar,
      textColor
    );
    trig.appendChild(label);

    if (i === TRIGGER_INDEX) {
      trig.itemSpacing = resolveSpace(getVar("navigation-menu/indicator-margin-left")) || 4;
      bindProp(trig, "itemSpacing", getVar("navigation-menu/indicator-margin-left"));
      var chevSize = resolveSpace(getVar("navigation-menu/trigger.icon-size")) || 12;
      var chev = makeIcon(
        "chevron-down",
        chevSize,
        textColor,
        getVar("navigation-menu/trigger.icon-size")
      );
      // chevron rotates 180 when open
      if (isOpen) chev.rotation = 180;
      trig.appendChild(chev);
    }
    list.appendChild(trig);
  }

  if (stateKey === "open") {
    var viewport = figma.createFrame();
    viewport.name = "viewport";
    viewport.layoutMode = "VERTICAL";
    viewport.primaryAxisSizingMode = "AUTO";
    viewport.counterAxisSizingMode = "FIXED";
    resizeKeep(viewport, 280, 100);
    // code's viewport has no padding or gap of its own (Plan 217)
    bindCornerRadius(viewport, getVar("navigation-menu/trigger-radius"));
    bindFill(viewport, getVar("navigation/content-background"));
    bindStroke(viewport, getVar("navigation/content-border"), null);
    applyEffectStyle(viewport, "shadow/lg");
    var linkLabels = ["Overview", "Pricing", "Changelog"];
    // Plan 217: each link is a padded row, as navigationMenuLinkStyle draws it in code
    var linkPadX = getVar("navigation-menu/link-padding-x");
    var linkPadY = getVar("navigation-menu/link-padding-y");
    var linkRadius = getVar("navigation-menu/link-radius");
    for (var k = 0; k < linkLabels.length; k++) {
      var linkRow = figma.createFrame();
      linkRow.name = "link";
      linkRow.layoutMode = "HORIZONTAL";
      linkRow.primaryAxisSizingMode = "FIXED";
      linkRow.counterAxisSizingMode = "AUTO";
      linkRow.fills = [];
      bindPadding(linkRow, linkPadY, linkPadX, linkPadY, linkPadX);
      bindCornerRadius(linkRow, linkRadius);
      linkRow.appendChild(
        makeText(
          linkLabels[k],
          "navigation-menu/item",
          fontSizeVar,
          fontWeightVar,
          getVar("navigation/content-text")
        )
      );
      viewport.appendChild(linkRow);
      try {
        linkRow.layoutSizingHorizontal = "FILL";
      } catch (e) {}
    }
    comp.appendChild(viewport);
  }
  return comp;
}

function buildNavigationMenu(x, y) {
  var configs = [
    {
      variantProps: { state: "default" },
      buildFn: function () {
        return buildNavigationVariant("default");
      },
    },
    {
      variantProps: { state: "active" },
      buildFn: function () {
        return buildNavigationVariant("active");
      },
    },
    {
      variantProps: { state: "open" },
      buildFn: function () {
        return buildNavigationVariant("open");
      },
    },
  ];
  return buildComponentSet("Navigation Menu", configs, "state", x, y);
}

// ============================================================
// COMMAND — state (empty, with-results)
// ============================================================
function buildCommandVariant(stateKey) {
  var inputH = resolveSpace(getVar("command/input/height")) || 40;
  var inputHVar = getVar("command/input/height");
  // Real Command root has no outer border (only rounded + bg) — the border
  // lives on the search input wrapper as a bottom rule instead
  var comp = buildOverlaySurface(
    320,
    stateKey === "with-results" ? 200 : 80,
    getVar("command/background"),
    null,
    getVar("command/content-radius"),
    "shadow/md"
  );
  comp.itemSpacing = 0;
  comp.primaryAxisSizingMode = "AUTO"; // grows with the group/empty content

  // Search input area
  var inputArea = figma.createFrame();
  inputArea.layoutMode = "HORIZONTAL";
  inputArea.primaryAxisAlignItems = "MIN"; // text and icon sit left
  inputArea.counterAxisAlignItems = "CENTER";
  inputArea.primaryAxisSizingMode = "AUTO";
  inputArea.counterAxisSizingMode = "FIXED";
  resizeKeep(inputArea, 320, inputH);
  var inputPadXVar = getVar("command/item-padding-x");
  inputArea.paddingLeft = inputPadXVar ? resolveSpace(inputPadXVar) : 12;
  inputArea.paddingRight = inputArea.paddingLeft;
  bindProp(inputArea, "paddingLeft", inputPadXVar);
  bindProp(inputArea, "paddingRight", inputPadXVar);
  inputArea.fills = [];
  bindStroke(inputArea, getVar("command/border"), null);
  try {
    inputArea.strokeTopWeight = 0;
    inputArea.strokeLeftWeight = 0;
    inputArea.strokeRightWeight = 0;
  } catch (e) {}
  // SearchIcon chip: input.icon.size, dimmed by input.icon.opacity, then the
  // item-indicator-margin-right gap before the placeholder
  var searchIconSizeVar = getVar("command/input.icon.size");
  var searchIconSize = resolveSpace(searchIconSizeVar) || 16;
  var searchIcon = makeIcon("search", searchIconSize, getVar("command/text"), searchIconSizeVar);
  bindOpacity(searchIcon, getVar("command/input.icon.opacity"));
  inputArea.itemSpacing =
    resolveSpace(getVar("command/item-indicator-margin-right")) || 8;
  bindProp(inputArea, "itemSpacing", getVar("command/item-indicator-margin-right"));
  inputArea.appendChild(searchIcon);
  var placeholder = makeText(
    "Search...",
    "command/input",
    getVar("command/item-font-size"),
    null,
    getVar("command/placeholder")
  );
  try {
    placeholder.layoutSizingHorizontal = "FILL";
  } catch (e) {}
  inputArea.appendChild(placeholder);
  comp.appendChild(inputArea);
  stretch(inputArea); // the search row spans the whole palette

  // CommandEmpty: centred muted message with empty-padding-y
  if (stateKey === "empty") {
    var emptyWrap = figma.createFrame();
    emptyWrap.name = "empty";
    emptyWrap.layoutMode = "HORIZONTAL";
    emptyWrap.primaryAxisAlignItems = "CENTER";
    emptyWrap.counterAxisAlignItems = "CENTER";
    emptyWrap.primaryAxisSizingMode = "FIXED";
    emptyWrap.counterAxisSizingMode = "AUTO";
    resizeKeep(emptyWrap, 320, 40);
    emptyWrap.fills = [];
    var emptyPadY = resolveSpace(getVar("command/empty-padding-y")) || 24;
    emptyWrap.paddingTop = emptyPadY;
    bindProp(emptyWrap, "paddingTop", getVar("command/empty-padding-y"));
    emptyWrap.paddingBottom = emptyPadY;
    bindProp(emptyWrap, "paddingBottom", getVar("command/empty-padding-y"));
    emptyWrap.appendChild(
      makeText(
        "No results found.",
        "command/item",
        getVar("command/item-font-size"),
        null,
        getVar("command/empty")
      )
    );
    comp.appendChild(emptyWrap);
    try {
      stretch(emptyWrap);
    } catch (e) {}
  }

  if (stateKey === "with-results") {
    var list = figma.createFrame();
    list.layoutMode = "VERTICAL";
    list.primaryAxisSizingMode = "AUTO";
    list.counterAxisSizingMode = "AUTO";
    var groupPadVar = getVar("command/group.padding");
    var groupPad = resolveSpace(groupPadVar) || 4;
    list.paddingTop = groupPad;
    bindProp(list, "paddingTop", groupPadVar);
    list.paddingBottom = groupPad;
    bindProp(list, "paddingBottom", groupPadVar);
    list.paddingLeft = groupPad;
    bindProp(list, "paddingLeft", groupPadVar);
    list.paddingRight = groupPad;
    bindProp(list, "paddingRight", groupPadVar);
    list.itemSpacing = 0; // real items stack flush, no gap between them
    list.fills = [];

    // CommandGroup heading (cmdk-group-heading): muted, own padding + size
    addMenuLabel(list, "Suggestions", {
      styleName: "command/group-heading",
      fontSizeVar: getVar("command/group-heading-font-size"),
      weightVar: getVar("command/group.heading-font-weight"),
      colorVar: getVar("command/group-heading"),
      padX: resolveSpace(getVar("command/group-heading-padding-x")) || 8,
      padXVar: getVar("command/group-heading-padding-x"),
      padY: resolveSpace(getVar("command/group-heading-padding-y")) || 6,
      padYVar: getVar("command/group-heading-padding-y"),
    });

    var itemPadX = resolveSpace(getVar("command/item-padding-x")) || 12;
    var itemPadXVar = getVar("command/item-padding-x");
    var itemPadY = resolveSpace(getVar("command/item-padding-y")) || 4;
    var itemPadYVar = getVar("command/item-padding-y");
    var items = ["Calendar", "Search", "Settings"];
    var fontSizeVar = getVar("command/item-font-size");

    for (var i = 0; i < items.length; i++) {
      // CommandSeparator between the two groups
      if (i === 2) {
        addMenuSeparator(list, {
          colorVar: getVar("command/separator"),
          heightVar: null,
          marginYVar: null,
        });
      }
      var item = figma.createFrame();
      item.layoutMode = "HORIZONTAL";
      item.primaryAxisAlignItems = "MIN"; // items are left aligned
      item.counterAxisAlignItems = "CENTER";
      item.primaryAxisSizingMode = "AUTO";
      item.counterAxisSizingMode = "AUTO";
      item.paddingTop = itemPadY;
      bindProp(item, "paddingTop", itemPadYVar);
      item.paddingBottom = itemPadY;
      bindProp(item, "paddingBottom", itemPadYVar);
      item.paddingLeft = itemPadX;
      bindProp(item, "paddingLeft", itemPadXVar);
      item.paddingRight = itemPadX;
      bindProp(item, "paddingRight", itemPadXVar);
      bindCornerRadius(item, getVar("command/item-radius"));
      if (i === 0) {
        bindFill(item, getVar("command/item-selected"));
      } else {
        item.fills = [];
      }
      var textColor =
        i === 0 ? getVar("command/item-text-selected") : getVar("command/text");
      var label = makeText(
        items[i],
        "command/item",
        fontSizeVar,
        null,
        textColor
      );
      item.appendChild(label);
      if (i === 2) {
        // CommandShortcut: ml-auto, shortcut size (own token, with the 0.1em tracking), shortcut colour
        item.primaryAxisAlignItems = "SPACE_BETWEEN";
        addMenuShortcut(item, "\u2318S", {
          styleName: "command/shortcut",
          fontSizeVar: getVar("command/shortcut-font-size"),
          colorVar: getVar("command/shortcut"),
        });
      }
      list.appendChild(item);
      try {
        stretch(item);
      } catch (e) {}
    }
    comp.appendChild(list);
    stretch(list);
  }
  return comp;
}

function buildCommand(x, y) {
  var configs = [
    {
      variantProps: { state: "empty" },
      buildFn: function () {
        return buildCommandVariant("empty");
      },
    },
    {
      variantProps: { state: "with-results" },
      buildFn: function () {
        return buildCommandVariant("with-results");
      },
    },
  ];
  return buildComponentSet("Command", configs, "state", x, y);
}

// ============================================================
// RESIZABLE — orientation (horizontal, vertical)
// ============================================================
function buildResizableVariant(orientation) {
  var comp = figma.createComponent();
  comp.layoutMode = orientation === "horizontal" ? "HORIZONTAL" : "VERTICAL";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, 320, 200);
  comp.fills = [];
  comp.itemSpacing = 0;

  // ResizablePanel itself has no background styling (just flex-1) — panels
  // are left transparent, matching the real unstyled component
  var panel1 = figma.createFrame();
  panel1.layoutMode = "VERTICAL";
  panel1.primaryAxisSizingMode = "FIXED";
  panel1.counterAxisSizingMode = "FIXED";
  if (orientation === "horizontal") {
    resizeKeep(panel1, 150, 200);
  } else {
    resizeKeep(panel1, 320, 90);
  }
  panel1.fills = [];

  // Handle is a plain thin bar (bg only, no border) — the bordered grip-box
  // overlay only appears when `withHandle` is set, which the default demo
  // (and every real usage in this repo's stories) doesn't use
  var handleW = resolveSpace(getVar("resizable/handle-width")) || 12;
  var handleWVar = getVar("resizable/handle-width");
  var handleH = resolveSpace(getVar("resizable/handle-height")) || 16;
  var handleHVar = getVar("resizable/handle-height");
  var handle = figma.createFrame();
  handle.layoutMode = "HORIZONTAL";
  handle.primaryAxisAlignItems = "CENTER";
  handle.counterAxisAlignItems = "CENTER";
  handle.primaryAxisSizingMode = "FIXED";
  handle.counterAxisSizingMode = "FIXED";
  if (orientation === "horizontal") {
    resizeKeep(handle, handleW, 200);
  } else {
    resizeKeep(handle, 320, handleH);
  }
  bindFill(handle, getVar("resizable/handle"));

  var panel2 = figma.createFrame();
  panel2.layoutMode = "VERTICAL";
  panel2.primaryAxisSizingMode = "FIXED";
  panel2.counterAxisSizingMode = "FIXED";
  if (orientation === "horizontal") {
    resizeKeep(panel2, 158, 200);
  } else {
    resizeKeep(panel2, 320, 90);
  }
  panel2.fills = [];

  comp.appendChild(panel1);
  comp.appendChild(handle);
  comp.appendChild(panel2);
  return comp;
}

function buildResizable(x, y) {
  var configs = [
    {
      variantProps: { direction: "horizontal" },
      buildFn: function () {
        return buildResizableVariant("horizontal");
      },
    },
    {
      variantProps: { direction: "vertical" },
      buildFn: function () {
        return buildResizableVariant("vertical");
      },
    },
  ];
  return buildComponentSet("Resizable", configs, "direction", x, y);
}

// ============================================================
// FORM — state (default, error)
// Shows label + input + hint/error message
// ============================================================
function buildFormVariant(stateKey, requiredFlag) {
  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, 280, 80);
  comp.itemSpacing = resolveSpace(getVar("form/label-gap")) || 8;
  bindProp(comp, "itemSpacing", getVar("form/label-gap"));
  comp.fills = [];

  var labelFontSizeVar = getVar("label/font-size/md");
  var labelWeightVar = getVar("form/label-font-weight");
  var labelColor =
    stateKey === "error"
      ? getVar("form/label-error-text")
      : getVar("form/label");
  var label = makeText(
    "Field Label",
    "form/label",
    labelFontSizeVar,
    labelWeightVar,
    labelColor
  );
  if (requiredFlag) {
    // FormLabel shows "*" (form.required-color) after the text only when the
    // FormField is `required`, separated by form.error-margin
    var labelRow = figma.createFrame();
    labelRow.name = "label-row";
    labelRow.layoutMode = "HORIZONTAL";
    labelRow.primaryAxisSizingMode = "AUTO";
    labelRow.counterAxisSizingMode = "AUTO";
    labelRow.fills = [];
    labelRow.itemSpacing = resolveSpace(getVar("form/error-margin")) || 4;
    bindProp(labelRow, "itemSpacing", getVar("form/error-margin"));
    labelRow.appendChild(label);
    labelRow.appendChild(
      makeText(
        "*",
        "form/label",
        labelFontSizeVar,
        labelWeightVar,
        getVar("form/required-color")
      )
    );
    comp.appendChild(labelRow);
  } else {
    comp.appendChild(label);
  }

  // Input placeholder
  var inputFrame = figma.createFrame();
  inputFrame.layoutMode = "HORIZONTAL";
  inputFrame.primaryAxisAlignItems = "MIN"; // input text is left aligned
  inputFrame.counterAxisAlignItems = "CENTER";
  inputFrame.primaryAxisSizingMode = "FIXED";
  inputFrame.counterAxisSizingMode = "AUTO";
  resizeKeep(inputFrame, 280, 40);
  inputFrame.paddingTop = 8;
  inputFrame.paddingBottom = 8;
  inputFrame.paddingLeft = 16;
  inputFrame.paddingRight = 16;
  // Mirrors the real Input (md): bind its padding tokens
  bindProp(inputFrame, "paddingTop", getVar("input/padding-y/md"));
  bindProp(inputFrame, "paddingBottom", getVar("input/padding-y/md"));
  bindProp(inputFrame, "paddingLeft", getVar("input/padding-x"));
  bindProp(inputFrame, "paddingRight", getVar("input/padding-x"));
  bindCornerRadius(inputFrame, getVar("input/radius"));
  bindFill(inputFrame, getVar("input/default/background"));
  bindStroke(
    inputFrame,
    stateKey === "error"
      ? getVar("input/border-error")
      : getVar("input/border"),
    null
  );
  var inputLabel = makeText(
    "Enter value...",
    "form/input",
    getVar("input/font-size/md"),
    null,
    getVar("input/placeholder")
  );
  inputFrame.appendChild(inputLabel);
  comp.appendChild(inputFrame);

  // Hint or error message
  var msgFontSizeVar =
    stateKey === "error"
      ? getVar("form/error-font-size")
      : getVar("form/description-font-size");
  var msgColor =
    stateKey === "error" ? getVar("form/error") : getVar("form/description");
  var msg = makeText(
    stateKey === "error" ? "This field is required." : "Helper text goes here.",
    "form/message",
    msgFontSizeVar,
    null,
    msgColor
  );
  comp.appendChild(msg);
  return comp;
}

function buildForm(x, y) {
  var states = ["default", "error"];
  var requiredFlags = [false, true];
  var configs = [];
  for (var i = 0; i < states.length; i++) {
    for (var j = 0; j < requiredFlags.length; j++) {
      (function (state, requiredFlag) {
        configs.push({
          variantProps: { error: String(state === "error"), required: String(requiredFlag) },
          buildFn: function () {
            return buildFormVariant(state, requiredFlag);
          },
        });
      })(states[i], requiredFlags[j]);
    }
  }
  return buildComponentSet("Form", configs, "error", x, y);
}

// ============================================================
// TOGGLE GROUP — orientation (horizontal, vertical)
// ============================================================
function buildToggleGroupVariant(orientation) {
  var comp = figma.createComponent();
  comp.layoutMode = orientation === "horizontal" ? "HORIZONTAL" : "VERTICAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "AUTO";
  comp.itemSpacing = resolveSpace(getVar("toggle-group/gap")) || 4;
  bindProp(comp, "itemSpacing", getVar("toggle-group/gap"));
  comp.fills = [];

  var padX = resolveSpace(getVar("toggle-group/item-padding-x")) || 12;
  var padXVar = getVar("toggle-group/item-padding-x");
  var h = resolveSpace(getVar("toggle-group/item-height")) || 40;
  var hVar = getVar("toggle-group/item-height");
  var fontSizeVar = getVar("toggle-group/item-font-size");
  var fontWeightVar = getVar("toggle-group/item-font-weight");
  var items = ["B", "I", "U"];

  for (var i = 0; i < items.length; i++) {
    var item = figma.createFrame();
    item.layoutMode = "HORIZONTAL";
    item.primaryAxisAlignItems = "CENTER";
    item.counterAxisAlignItems = "CENTER";
    item.primaryAxisSizingMode = "AUTO";
    item.counterAxisSizingMode = "FIXED";
    resizeKeep(item, 40, h);
    item.paddingLeft = padX;
    bindProp(item, "paddingLeft", padXVar);
    item.paddingRight = padX;
    bindProp(item, "paddingRight", padXVar);
    bindCornerRadius(item, getVar("toggle-group/item-radius"));
    if (i === 0) {
      bindFill(item, getVar("toggle/pressed"));
    } else {
      item.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
    }
    var textColor =
      i === 0 ? getVar("toggle/text-pressed") : getVar("toggle/text");
    var label = makeText(
      items[i],
      "toggle-group/item",
      fontSizeVar,
      fontWeightVar,
      textColor
    );
    item.appendChild(label);
    comp.appendChild(item);
  }
  return comp;
}

function buildToggleGroup(x, y) {
  var configs = [
    {
      variantProps: { orientation: "horizontal" },
      buildFn: function () {
        return buildToggleGroupVariant("horizontal");
      },
    },
    {
      variantProps: { orientation: "vertical" },
      buildFn: function () {
        return buildToggleGroupVariant("vertical");
      },
    },
  ];
  return buildComponentSet("Toggle Group", configs, "orientation", x, y);
}

// ============================================================
// CALENDAR — state (default, with-selection)
// ============================================================
function buildCalendarVariant(stateKey) {
  var cellSize = resolveSpace(getVar("calendar/day/size")) || 32;
  var cellSizeVar = getVar("calendar/day/size");
  var pad = resolveSpace(getVar("calendar/container-padding")) || 12;
  var padVar = getVar("calendar/container-padding");

  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "AUTO";
  comp.paddingTop = pad;
  bindProp(comp, "paddingTop", padVar);
  comp.paddingBottom = pad;
  bindProp(comp, "paddingBottom", padVar);
  comp.paddingLeft = pad;
  bindProp(comp, "paddingLeft", padVar);
  comp.paddingRight = pad;
  bindProp(comp, "paddingRight", padVar);
  comp.itemSpacing = resolveSpace(getVar("calendar/container-gap")) || 8;
  bindProp(comp, "itemSpacing", getVar("calendar/container-gap"));
  // Real Calendar root has no background class at all — just padding
  comp.fills = [];

  // Header row: prev-month nav button, month label, next-month nav button
  var header = figma.createFrame();
  header.layoutMode = "HORIZONTAL";
  header.primaryAxisAlignItems = "SPACE_BETWEEN";
  header.counterAxisAlignItems = "CENTER";
  header.primaryAxisSizingMode = "FIXED";
  header.counterAxisSizingMode = "AUTO";
  resizeKeep(header, 7 * cellSize, 32);
  header.fills = [];

  var navButtonSize = resolveSpace(getVar("calendar/nav/button-size")) || 28;
  var navButtonSizeVar = getVar("calendar/nav/button-size");
  function makeCalendarNavButton(dir) {
    var btn = figma.createFrame();
    btn.layoutMode = "HORIZONTAL";
    btn.primaryAxisAlignItems = "CENTER";
    btn.counterAxisAlignItems = "CENTER";
    btn.primaryAxisSizingMode = "FIXED";
    btn.counterAxisSizingMode = "FIXED";
    resizeKeep(btn, navButtonSize, navButtonSize);
    btn.fills = [];
    bindCornerRadius(btn, getVar("calendar/nav-button-radius"));
    bindStroke(btn, getVar("calendar/nav-border"), null);
    // calendar.nav-button.opacity (0.5): the arrows sit back until hovered
    bindOpacity(btn, getVar("calendar/nav-button/opacity"));
    var iconSize = resolveSpace(getVar("calendar/nav/icon-size")) || 16;
    var iconSizeVar = getVar("calendar/nav/icon-size");
    var icon = makeIcon(
      dir === "left" ? "chevron-left" : "chevron-right",
      iconSize,
      getVar("calendar/header-text"),
      iconSizeVar
    );
    btn.appendChild(icon);
    return btn;
  }
  header.appendChild(makeCalendarNavButton("left"));
  var monthLabel = makeText(
    "May 2025",
    "calendar/header",
    getVar("calendar/header-font-size"),
    getVar("calendar/header-font-weight"),
    getVar("calendar/header-text")
  );
  header.appendChild(monthLabel);
  header.appendChild(makeCalendarNavButton("right"));
  comp.appendChild(header);

  // Day headers
  var dayHeaders = figma.createFrame();
  dayHeaders.layoutMode = "HORIZONTAL";
  dayHeaders.primaryAxisSizingMode = "AUTO";
  dayHeaders.counterAxisSizingMode = "AUTO";
  dayHeaders.fills = [];
  var days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  for (var d = 0; d < days.length; d++) {
    var dayHead = figma.createFrame();
    dayHead.layoutMode = "HORIZONTAL";
    dayHead.primaryAxisAlignItems = "CENTER";
    dayHead.counterAxisAlignItems = "CENTER";
    dayHead.primaryAxisSizingMode = "FIXED";
    dayHead.counterAxisSizingMode = "FIXED";
    resizeKeep(dayHead, cellSize, cellSize);
    dayHead.fills = [];
    var dLabel = makeText(
      days[d],
      "calendar/day-header",
      getVar("calendar/day-font-size"),
      getVar("calendar/day-header-font-weight"),
      getVar("calendar/header-text")
    );
    dayHead.appendChild(dLabel);
    dayHeaders.appendChild(dayHead);
  }
  comp.appendChild(dayHeaders);

  // 4 weeks of day cells
  var nums = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28,
  ];
  for (var row = 0; row < 4; row++) {
    var week = figma.createFrame();
    week.layoutMode = "HORIZONTAL";
    week.primaryAxisSizingMode = "AUTO";
    week.counterAxisSizingMode = "AUTO";
    week.fills = [];
    for (var col = 0; col < 7; col++) {
      var dayNum = nums[row * 7 + col];
      var cell = figma.createFrame();
      cell.layoutMode = "HORIZONTAL";
      cell.primaryAxisAlignItems = "CENTER";
      cell.counterAxisAlignItems = "CENTER";
      cell.primaryAxisSizingMode = "FIXED";
      cell.counterAxisSizingMode = "FIXED";
      resizeKeep(cell, cellSize, cellSize);
      cell.cornerRadius = 9999;
      bindProp(cell, "cornerRadius", getVar("calendar/nav-button-radius"));
      var isSelected = stateKey === "with-selection" && dayNum === 15;
      if (isSelected) {
        bindFill(cell, getVar("calendar/day-selected"));
      } else {
        cell.fills = [];
      }
      var dayColor = isSelected
        ? getVar("calendar/day-text-selected")
        : getVar("calendar/header-text");
      var numLabel = makeText(
        String(dayNum),
        "calendar/day",
        getVar("calendar/day-font-size"),
        getVar("calendar/day/font-weight"),
        dayColor
      );
      cell.appendChild(numLabel);
      week.appendChild(cell);
    }
    comp.appendChild(week);
  }
  return comp;
}

function buildCalendar(x, y) {
  var configs = [
    {
      variantProps: { state: "default" },
      buildFn: function () {
        return buildCalendarVariant("default");
      },
    },
    {
      variantProps: { state: "with-selection" },
      buildFn: function () {
        return buildCalendarVariant("with-selection");
      },
    },
  ];
  return buildComponentSet("Calendar", configs, "state", x, y);
}

// ============================================================
// ALERT DIALOG — one variant (state=default), see buildAlertDialog
// ============================================================
function buildAlertDialogVariant() {
  var pad = resolveSpace(getVar("alert-dialog/content-padding")) || 24;
  var padVar = getVar("alert-dialog/content-padding");
  // width is alert-dialog.content-max-width in code (the dialog is w-full, capped by it)
  var comp = buildOverlaySurface(
    resolveSpace(getVar("alert-dialog/content-max-width")) || 512,
    220,
    getVar("dialog/background"),
    getVar("dialog/border"),
    getVar("alert-dialog/content-radius"),
    "shadow/lg"
  );
  comp.paddingTop = pad;
  bindProp(comp, "paddingTop", padVar);
  comp.paddingBottom = pad;
  bindProp(comp, "paddingBottom", padVar);
  comp.paddingLeft = pad;
  bindProp(comp, "paddingLeft", padVar);
  comp.paddingRight = pad;
  bindProp(comp, "paddingRight", padVar);
  comp.itemSpacing = resolveSpace(getVar("alert-dialog/content-gap")) || 16;
  bindProp(comp, "itemSpacing", getVar("alert-dialog/content-gap"));

  var header = figma.createFrame();
  header.layoutMode = "VERTICAL";
  header.primaryAxisSizingMode = "AUTO";
  header.counterAxisSizingMode = "AUTO";
  header.itemSpacing = resolveSpace(getVar("alert-dialog/header-gap")) || 8;
  bindProp(header, "itemSpacing", getVar("alert-dialog/header-gap"));
  header.fills = [];

  // the title keeps the dialog title colour; destructive is the action button's variant
  var titleColor = getVar("dialog/title");
  var title = makeText(
    "Are you sure?",
    "alert-dialog/title",
    getVar("alert-dialog/title-font-size"),
    getVar("alert-dialog/title-font-weight"),
    titleColor
  );
  var desc = makeText(
    "This action cannot be undone.",
    "alert-dialog/description",
    getVar("alert-dialog/description-font-size"),
    null,
    getVar("dialog/description")
  );
  header.appendChild(title);
  header.appendChild(desc);
  comp.appendChild(header);

  var footer = figma.createFrame();
  footer.layoutMode = "HORIZONTAL";
  footer.primaryAxisAlignItems = "MAX";
  footer.counterAxisAlignItems = "CENTER";
  footer.primaryAxisSizingMode = "AUTO";
  footer.counterAxisSizingMode = "AUTO";
  footer.itemSpacing = resolveSpace(getVar("alert-dialog/footer-gap")) || 8;
  bindProp(footer, "itemSpacing", getVar("alert-dialog/footer-gap"));
  footer.layoutWrap = "WRAP";
  footer.counterAxisSpacing = resolveSpace(getVar("alert-dialog/footer-gap")) || 8;
  bindProp(footer, "counterAxisSpacing", getVar("alert-dialog/footer-gap"));
  footer.fills = [];
  footer.name = "alert-dialog-row";
  // AlertDialogCancel / AlertDialogAction render as Buttons; an optional extra is hidden by
  // default. applyOverlayProperties wires the booleans and exposes the instances.
  var extraBtn = makeButtonFrame("Learn more", "secondary", "md");
  extraBtn.name = "extra-button";
  var cancelBtn = makeButtonFrame("Cancel", "outline", "md");
  cancelBtn.name = "cancel-button";
  var actionBtn = makeButtonFrame("Continue", "default", "md");
  actionBtn.name = "action-button";
  footer.appendChild(extraBtn);
  footer.appendChild(cancelBtn);
  footer.appendChild(actionBtn);
  comp.appendChild(footer);
  footer.layoutAlign = "STRETCH";
  return comp;
}

function buildAlertDialog(x, y) {
  // One variant. Alert Dialog has no variant props in code (destructive is the action
  // button's variant, chosen through the exposed Button), but the set keeps a one-option
  // State axis because the Plugin API rejects setProperties on a set with no variant axis.
  var configs = [
    {
      variantProps: { state: "default" },
      buildFn: function () {
        return buildAlertDialogVariant();
      },
    },
  ];
  return buildComponentSet("Alert Dialog", configs, "state", x, y);
}

// ============================================================
// CAROUSEL — state (default, start, end)
// ============================================================
// The track scrolls one slide at a time and the buttons disable at either end:
//   default = somewhere in the middle (both buttons on)
//   start   = first slide (previous disabled)
//   end     = last slide (next disabled)
function buildCarouselVariant(stateKey) {
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, 400, 200);
  comp.fills = [];

  // Slide row: the slides sit item-spacing apart. A slide is a real Card (the story renders
  // each slide in a Card), so its fill, border, radius and padding come from the card tokens.
  var slideFrame = figma.createFrame();
  slideFrame.layoutMode = "HORIZONTAL";
  slideFrame.primaryAxisSizingMode = "FIXED";
  slideFrame.counterAxisSizingMode = "AUTO";
  resizeKeep(slideFrame, 320, 200);
  slideFrame.itemSpacing = resolveSpace(getVar("carousel/item-spacing")) || 16;
  bindProp(slideFrame, "itemSpacing", getVar("carousel/item-spacing"));
  slideFrame.fills = [];
  var slideCard = instanceFromSet("Card", "interaction=default");
  if (slideCard) {
    slideCard.name = "slide";
    try {
      var cardParts = slideCard.children;
      // CardContent only: no header, no footer
      cardParts[0].visible = false;
      cardParts[1].characters = "Slide content";
      cardParts[2].visible = false;
    } catch (e) {
      console.warn("carousel slide card: " + e.message);
    }
    slideFrame.appendChild(slideCard);
    try {
      slideCard.layoutSizingHorizontal = "FILL";
    } catch (e) {}
  } else {
    var slideLabel = makeText(
      "Slide content",
      "carousel/slide",
      slotTextSize(),
      null,
      slotTextColor()
    );
    slideFrame.appendChild(slideLabel);
  }
  comp.appendChild(slideFrame);

  // CarouselPrevious / CarouselNext: round buttons absolutely placed at
  // -left/-right button-offset, each with a chevron at button.icon-size
  var btnSize = resolveSpace(getVar("carousel/button.size")) || 32;
  var btnOffset = resolveSpace(getVar("carousel/button.offset")) || 48;
  function makeCarouselNav(dir, disabled) {
    var btn = figma.createFrame();
    btn.name = dir === "left" ? "previous" : "next";
    btn.layoutMode = "HORIZONTAL";
    btn.primaryAxisAlignItems = "CENTER";
    btn.counterAxisAlignItems = "CENTER";
    btn.primaryAxisSizingMode = "FIXED";
    btn.counterAxisSizingMode = "FIXED";
    resizeKeep(btn, btnSize, btnSize);
    bindSize(btn, getVar("carousel/button.size"), getVar("carousel/button.size"));
    bindCornerRadius(btn, getVar("carousel/button-rounded-full"));
    bindFill(
      btn,
      getVar("carousel/nav-background")
    );
    bindStroke(
      btn,
      getVar("carousel/nav-border"),
      null
    );
    var iconSizeVar = getVar("carousel/button.icon-size");
    btn.appendChild(
      makeIcon(
        dir === "left" ? "chevron-left" : "chevron-right",
        resolveSpace(iconSizeVar) || 16,
        getVar("color/foreground/default"),
        iconSizeVar
      )
    );
    // the disabled button keeps its colours and dims (Plan 223)
    if (disabled) btn.opacity = DISABLED_OPACITY;
    return btn;
  }
  // button sits button.offset outside the slide edge, so the gap between
  // the button and the slide is offset minus the button size
  comp.itemSpacing = Math.max(0, btnOffset - btnSize);
  comp.primaryAxisSizingMode = "AUTO"; // [previous] [slide] [next]
  comp.insertChild(0, makeCarouselNav("left", stateKey === "start"));
  comp.appendChild(makeCarouselNav("right", stateKey === "end"));
  return comp;
}

function buildCarousel(x, y) {
  var configs = ["default", "start", "end"].map(function (state) {
    return {
      variantProps: { state: state },
      buildFn: function () {
        return buildCarouselVariant(state);
      },
    };
  });
  return buildComponentSet("Carousel", configs, "state", x, y);
}

// ============================================================
// FEATURE GRID — columns (2, 3)
// ============================================================
function buildFeatureGridVariant(columns) {
  var itemPad = resolveSpace(getVar("feature-grid/item-padding")) || 24;
  var itemPadVar = getVar("feature-grid/item-padding");
  var iconSize = resolveSpace(getVar("feature-grid/icon-container-size")) || 48;
  var iconSizeVar = getVar("feature-grid/icon-container-size");
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "AUTO";
  comp.itemSpacing = resolveSpace(getVar("feature-grid/container-gap")) || 32;
  bindProp(comp, "itemSpacing", getVar("feature-grid/container-gap"));
  comp.fills = [];

  for (var i = 0; i < columns; i++) {
    var item = figma.createFrame();
    item.layoutMode = "VERTICAL";
    item.primaryAxisSizingMode = "AUTO";
    item.counterAxisSizingMode = "FIXED";
    resizeKeep(item, 200, 120);
    item.paddingTop = itemPad;
    bindProp(item, "paddingTop", itemPadVar);
    item.paddingBottom = itemPad;
    bindProp(item, "paddingBottom", itemPadVar);
    item.paddingLeft = itemPad;
    bindProp(item, "paddingLeft", itemPadVar);
    item.paddingRight = itemPad;
    bindProp(item, "paddingRight", itemPadVar);
    item.itemSpacing = resolveSpace(getVar("feature-grid/item-gap")) || 16;
    bindProp(item, "itemSpacing", getVar("feature-grid/item-gap"));
    bindCornerRadius(item, getVar("feature-grid/item-radius"));
    bindStroke(item, getVar("feature-grid/item/border-color"), null);
    setStrokeOpacity(item, 0.1); // border-(--color-...)/10
    bindFill(item, getVar("card/background")); // the real item uses the card background

    var icon = figma.createFrame();
    resizeKeep(icon, iconSize, iconSize);
    bindCornerRadius(icon, getVar("feature-grid/icon-radius"));
    // real icon tile: card background, border at 5%, feature-grid.icon-shadow
    // (= shadow.sm); it held a hardcoded lavender fill before
    icon.name = "icon";
    bindFill(icon, getVar("card/background"));
    bindStroke(icon, getVar("feature-grid/item/border-color"), null);
    setStrokeOpacity(icon, 0.05);
    applyEffectStyle(icon, "shadow/sm");
    item.appendChild(icon);

    var title = makeText(
      "Feature Title",
      "feature-grid/title",
      getVar("feature-grid/title-font-size"),
      getVar("feature-grid/title/font-weight"),
      getVar("feature-grid/title/text"),
      getVar("typography/line-height/tight")
    );
    var desc = makeText(
      "Feature description.",
      "feature-grid/description",
      getVar("feature-grid/description-font-size"),
      null,
      getVar("feature-grid/description-text"),
      getVar("typography/line-height/relaxed")
    );
    item.appendChild(title);
    item.appendChild(desc);
    comp.appendChild(item);
  }
  return comp;
}

function buildFeatureGrid(x, y) {
  var configs = [
    {
      variantProps: { columns: "2" },
      buildFn: function () {
        return buildFeatureGridVariant(2);
      },
    },
    {
      variantProps: { columns: "3" },
      buildFn: function () {
        return buildFeatureGridVariant(3);
      },
    },
  ];
  return buildComponentSet("Feature Grid", configs, "columns", x, y);
}

// ============================================================
// CARD GRID — columns (2, 3)
// Pattern-level composition: a row of Card-shaped children laid out with
// card-grid gap/padding tokens. Mirrors the Feature Grid convention of
// drawing simplified placeholder cells rather than nesting real components.
// ============================================================
function buildCardGridVariant(columns) {
  var gapVar = getVar("card-grid/gap-horizontal");
  var itemPadVar = getVar("card-grid/item-padding");
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "AUTO";
  comp.itemSpacing = resolveSpace(gapVar) || 24;
  bindProp(comp, "itemSpacing", gapVar);
  comp.fills = [];

  for (var i = 0; i < columns; i++) {
    // the grid holds Card components in code; place instances of the Card set, with only
    // the title and description showing (the story's cards have no content or footer)
    var cardInstance = instanceFromSet("Card", "interaction=default");
    if (cardInstance) {
      cardInstance.name = "card";
      try {
        var cardTexts = cardInstance.findAll(function (n) {
          return n.type === "TEXT";
        });
        for (var ct = 0; ct < cardTexts.length; ct++) {
          if (cardTexts[ct].name === "title") cardTexts[ct].characters = "Card Title";
          if (cardTexts[ct].name === "description") cardTexts[ct].characters = "Card description text";
        }
        var cardPieces = cardInstance.findAll(function (n) {
          return n.name === "content" || n.name === "card-footer";
        });
        for (var cp = 0; cp < cardPieces.length; cp++) cardPieces[cp].visible = false;
      } catch (e) {
        console.warn("card grid instance: " + e.message);
      }
      comp.appendChild(cardInstance);
      continue;
    }
    var card = figma.createFrame();
    card.name = "card";
    card.layoutMode = "VERTICAL";
    card.primaryAxisSizingMode = "AUTO";
    card.counterAxisSizingMode = "FIXED";
    resizeKeep(card, 180, 120);
    var pad = resolveSpace(itemPadVar) || 16;
    card.paddingTop = pad;
    bindProp(card, "paddingTop", itemPadVar);
    card.paddingBottom = pad;
    bindProp(card, "paddingBottom", itemPadVar);
    card.paddingLeft = pad;
    bindProp(card, "paddingLeft", itemPadVar);
    card.paddingRight = pad;
    bindProp(card, "paddingRight", itemPadVar);
    card.itemSpacing = resolveSpace(getVar("card/gap")) || 8;
    bindProp(card, "itemSpacing", getVar("card/gap"));
    bindCornerRadius(card, getVar("card/radius"));
    bindFill(card, getVar("card/background"));
    bindStroke(card, getVar("card/border"), null);

    var title = makeText(
      "Card Title",
      "card-grid/title",
      getVar("card/header/title/font-size"),
      getVar("card/title/font-weight"),
      getVar("card/header/title/color"),
      getVar("card/title/line-height"),
      getVar("card/title/letter-spacing")
    );
    var desc = makeText(
      "Card description text",
      "card-grid/description",
      getVar("card/header/description/font-size"),
      null,
      getVar("card/header/description/color"),
      getVar("card/header/description/line-height")
    );
    card.appendChild(title);
    card.appendChild(desc);
    comp.appendChild(card);
  }
  return comp;
}

function buildCardGrid(x, y) {
  var configs = [
    {
      variantProps: { columns: "2" },
      buildFn: function () {
        return buildCardGridVariant(2);
      },
    },
    {
      variantProps: { columns: "3" },
      buildFn: function () {
        return buildCardGridVariant(3);
      },
    },
  ];
  return buildComponentSet("Card Grid", configs, "columns", x, y);
}

// ============================================================
// COMPOSITIONS (packages/ui/src/compositions)
// SiteHeader, SiteFooter, PageLayout, SectionHero, SectionFeatures. They
// are real components with their own tokens, so they get builders like any
// other. Drawn at desktop width (container padding-x-lg); responsive
// breakpoints are not represented. Child controls (buttons, badges, cards)
// are drawn as plain frames from the same tokens, never as nested
// components, which would add stray main components to the file.
// ============================================================

var COMPOSITION_WIDTH = 960;

function makeButtonFrame(label, variantKey, sizeKey) {
  var buttonInstance = instanceFromSet(
    "Button",
    "variant=" + variantKey + ", size=" + sizeKey + ", disabled=false, state=default",
    label
  );
  if (buttonInstance) {
    buttonInstance.name = "button";
    return buttonInstance;
  }
  var tv = buttonTokenVariant(variantKey);
  var f = figma.createFrame();
  f.name = "button";
  f.layoutMode = "HORIZONTAL";
  f.primaryAxisAlignItems = "CENTER";
  f.counterAxisAlignItems = "CENTER";
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  bindPadding(
    f,
    getVar("button/padding-y/" + sizeKey),
    getVar("button/padding-x/" + sizeKey),
    getVar("button/padding-y/" + sizeKey),
    getVar("button/padding-x/" + sizeKey)
  );
  bindCornerRadius(f, getVar("button/radius"));
  var bg = getVar("button/" + tv + "/background");
  if (bg) bindFill(f, bg);
  else f.fills = [];
  var border = getVar("button/" + tv + "/border");
  if (border) bindStroke(f, border, getVar("button/border-width"));
  else clearStrokes(f);
  f.appendChild(
    makeText(
      label,
      "button/label/" + sizeKey,
      getVar("button/font-size/" + sizeKey),
      getVar("button/font-weight"),
      getVar("button/" + tv + "/text"),
      getVar("button/line-height")
    )
  );
  return f;
}

function makeBadgeFrame(label, variantKey, sizeKey) {
  var badgeInstance = instanceFromSet(
    "Badge",
    "variant=" + variantKey + ", size=" + sizeKey + ", interaction=default",
    label
  );
  if (badgeInstance) {
    badgeInstance.name = "badge";
    return badgeInstance;
  }
  var f = figma.createFrame();
  f.name = "badge";
  f.layoutMode = "HORIZONTAL";
  f.primaryAxisAlignItems = "CENTER";
  f.counterAxisAlignItems = "CENTER";
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  bindPadding(
    f,
    getVar("badge/padding-y/" + sizeKey),
    getVar("badge/padding-x/" + sizeKey),
    getVar("badge/padding-y/" + sizeKey),
    getVar("badge/padding-x/" + sizeKey)
  );
  bindCornerRadius(f, getVar("badge/radius"));
  var bg = getVar("badge/" + variantKey + "/background");
  if (bg) bindFill(f, bg);
  else f.fills = [];
  var border = getVar("badge/" + variantKey + "/border");
  if (border) bindStroke(f, border, getVar("badge/border-width"));
  else clearStrokes(f);
  f.appendChild(
    makeText(
      label,
      "badge/label/" + sizeKey,
      getVar("badge/font-size/" + sizeKey),
      getVar("badge/font-weight"),
      getVar("badge/" + variantKey + "/text"),
      getVar("badge/line-height")
    )
  );
  return f;
}

// A transparent auto-layout frame; direction "H" or "V"
function makeStack(name, dir, gapVar) {
  var f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir === "H" ? "HORIZONTAL" : "VERTICAL";
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = [];
  if (gapVar) {
    f.itemSpacing = resolveSpace(gapVar);
    bindProp(f, "itemSpacing", gapVar);
  }
  return f;
}

// Append text to an auto-layout parent, then let it fill the width and grow
// in height so it wraps. FILL is only valid once the node has a parent.
function appendWrapped(parent, t) {
  parent.appendChild(t);
  try {
    t.textAutoResize = "HEIGHT";
    t.layoutSizingHorizontal = "FILL";
  } catch (e) {}
  return t;
}

// Only one side of a frame's border
function strokeOneSide(node, side, colorVar, widthVar) {
  if (!colorVar) return;
  bindStroke(node, colorVar, widthVar);
  var w = resolveSpace(widthVar) || 1;
  try {
    node.strokeTopWeight = side === "top" ? w : 0;
    node.strokeBottomWeight = side === "bottom" ? w : 0;
    node.strokeLeftWeight = side === "left" ? w : 0;
    node.strokeRightWeight = side === "right" ? w : 0;
  } catch (e) {}
}

function setPadX(node, v) {
  node.paddingLeft = resolveSpace(v);
  bindProp(node, "paddingLeft", v);
  node.paddingRight = resolveSpace(v);
  bindProp(node, "paddingRight", v);
}

function setPadY(node, v) {
  node.paddingTop = resolveSpace(v);
  bindProp(node, "paddingTop", v);
  node.paddingBottom = resolveSpace(v);
  bindProp(node, "paddingBottom", v);
}

// ---- SITE HEADER: variant (default, transparent) × size (default, sm) ----
function buildSiteHeaderVariant(variantKey, sizeKey) {
  var comp = figma.createComponent();
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "SPACE_BETWEEN";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  var hVar = getVar(
    sizeKey === "sm" ? "site-header/height-sm" : "site-header/height"
  );
  resizeKeep(comp, COMPOSITION_WIDTH, resolveSpace(hVar) || 64);
  bindProp(comp, "height", hVar);
  setPadX(comp, getVar("site-header/container.padding-x-lg"));
  if (variantKey === "transparent") {
    // bg-transparent, border-b border-transparent
    comp.fills = [];
  } else {
    bindFill(comp, getVar("site-header/background"));
    strokeOneSide(comp, "bottom", getVar("site-header/border"), null);
  }

  var fg = getVar("color/foreground/default");
  var logoGap = getVar("site-header/logo.gap");
  var logo = makeStack("logo", "H", logoGap);
  logo.counterAxisAlignItems = "CENTER";
  logo.appendChild(
    makeText(
      "Logo",
      "site-header/logo",
      getVar("site-header/logo.font-size"),
      getVar("site-header/logo.font-weight"),
      fg
    )
  );
  comp.appendChild(logo);

  // NavigationMenuList of NavigationMenuLink items (nav-link tokens)
  var nav = makeStack("navigation", "H", getVar("navigation-menu/list-gap"));
  nav.counterAxisAlignItems = "CENTER";
  var links = ["Features", "Pricing", "Docs", "About"];
  for (var i = 0; i < links.length; i++) {
    var link = figma.createFrame();
    link.name = "nav-link";
    link.layoutMode = "HORIZONTAL";
    link.primaryAxisAlignItems = "CENTER";
    link.counterAxisAlignItems = "CENTER";
    link.primaryAxisSizingMode = "AUTO";
    link.counterAxisSizingMode = "FIXED";
    var linkH = getVar("site-header/nav-link.height");
    resizeKeep(link, 40, resolveSpace(linkH) || 36);
    bindProp(link, "height", linkH);
    setPadX(link, getVar("site-header/nav-link.padding-x"));
    bindCornerRadius(link, getVar("site-header/nav-link.radius"));
    bindFill(link, getVar("site-header/nav-link.background"));
    link.appendChild(
      makeText(
        links[i],
        "site-header/nav-link",
        getVar("site-header/nav-link.font-size"),
        getVar("site-header/nav-link.font-weight"),
        fg
      )
    );
    nav.appendChild(link);
  }
  comp.appendChild(nav);

  // Actions: ghost sm + default sm button
  var actions = makeStack("actions", "H", getVar("site-header/actions-gap"));
  actions.counterAxisAlignItems = "CENTER";
  actions.appendChild(makeButtonFrame("Sign In", "ghost", "sm"));
  actions.appendChild(makeButtonFrame("Get Started", "default", "sm"));
  comp.appendChild(actions);
  return comp;
}

function buildSiteHeader(x, y) {
  var variants = ["default", "transparent"];
  var sizes = ["default", "sm"];
  var configs = [];
  for (var i = 0; i < variants.length; i++) {
    for (var j = 0; j < sizes.length; j++) {
      (function (variant, size) {
        configs.push({
          variantProps: { variant: variant, size: size },
          buildFn: function () {
            return buildSiteHeaderVariant(variant, size);
          },
        });
      })(variants[i], sizes[j]);
    }
  }
  return buildComponentSet("Site Header", configs, "variant", x, y);
}

// ---- SITE FOOTER: variant (default, minimal) ----
function buildSiteFooterVariant(variantKey) {
  var isDefault = variantKey === "default";
  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, COMPOSITION_WIDTH, 100);
  setPadX(comp, getVar("site-footer/container.padding-x-lg"));
  setPadY(comp, getVar("site-footer/container.padding-y"));
  bindFill(
    comp,
    getVar(isDefault ? "site-footer/background-muted" : "site-footer/background")
  );
  strokeOneSide(comp, "top", getVar("site-footer/border"), null);
  var colMarginVar = getVar("site-footer/columns.margin-bottom");
  comp.itemSpacing = resolveSpace(colMarginVar);
  bindProp(comp, "itemSpacing", colMarginVar);

  var textVar = getVar("site-footer/text");
  var fontSizeVar = getVar("site-footer/font-size");
  var innerW =
    COMPOSITION_WIDTH -
    2 * (resolveSpace(getVar("site-footer/container.padding-x-lg")) || 32);

  if (isDefault) {
    // grid lg:grid-cols-5: brand cell + link columns
    var gapVar = getVar("site-footer/columns.gap");
    var gap = resolveSpace(gapVar) || 32;
    var cellW = Math.floor((innerW - 4 * gap) / 5);
    var row = makeStack("columns", "H", gapVar);
    row.counterAxisAlignItems = "MIN";

    var brand = makeStack("brand", "V", getVar("site-footer/logo.margin-bottom"));
    brand.primaryAxisSizingMode = "AUTO";
    brand.counterAxisSizingMode = "FIXED";
    resizeKeep(brand, cellW, 10);
    brand.appendChild(
      makeText(
        "Logo",
        "site-footer/logo",
        getVar("site-footer/logo.font-size"),
        getVar("site-footer/logo.font-weight"),
        getVar("color/foreground/default")
      )
    );
    appendWrapped(brand, makeText(
          "Building amazing experiences with modern design systems.",
          "site-footer",
          fontSizeVar,
          null,
          textVar
        ));
    row.appendChild(brand);

    var columns = [
      ["Product", ["Features", "Pricing", "Changelog"]],
      ["Company", ["About", "Careers", "Contact"]],
      ["Legal", ["Privacy", "Terms", "Security"]],
    ];
    for (var c = 0; c < columns.length; c++) {
      var col = makeStack(
        "column",
        "V",
        getVar("site-footer/column.title.margin-bottom")
      );
      col.counterAxisSizingMode = "FIXED";
      resizeKeep(col, cellW, 10);
      col.appendChild(
        makeText(
          columns[c][0],
          "site-footer/column/title",
          getVar("site-footer/column.title.font-size"),
          getVar("site-footer/column.title.font-weight"),
          getVar("color/foreground/default")
        )
      );
      var list = makeStack("links", "V", getVar("site-footer/column-links-gap"));
      for (var l = 0; l < columns[c][1].length; l++) {
        list.appendChild(
          makeText(
            columns[c][1][l],
            "site-footer/link",
            getVar("site-footer/link.font-size"),
            null,
            getVar("site-footer/link.text")
          )
        );
      }
      col.appendChild(list);
      row.appendChild(col);
    }
    comp.appendChild(row);
    try {
      stretch(row);
    } catch (e) {}

    // Separator above the bottom bar (separator-margin-bottom below it)
    var sepWrap = makeStack("separator", "V", null);
    sepWrap.paddingBottom = resolveSpace(getVar("site-footer/separator-margin-bottom"));
    bindProp(sepWrap, "paddingBottom", getVar("site-footer/separator-margin-bottom"));
    var line = figma.createFrame();
    line.name = "line";
    var lineH = getVar("separator/height-horizontal");
    resizeKeep(line, 10, resolveSpace(lineH) || 1);
    bindProp(line, "height", lineH);
    bindFill(line, getVar("separator/color"));
    sepWrap.appendChild(line);
    comp.appendChild(sepWrap);
    try {
      stretch(sepWrap);
      stretch(line);
    } catch (e) {}
  }

  // Bottom bar: copyright left, social links right
  var bottom = makeStack("bottom-bar", "H", getVar("site-footer/bottom-gap"));
  bottom.primaryAxisAlignItems = "SPACE_BETWEEN";
  bottom.counterAxisAlignItems = "CENTER";
  bottom.counterAxisSizingMode = "AUTO";
  bottom.appendChild(
    makeText(
      "© 2026 All rights reserved.",
      "site-footer",
      fontSizeVar,
      null,
      textVar
    )
  );
  var social = makeStack("social", "H", getVar("site-footer/social-gap"));
  var socials = ["Twitter", "GitHub"];
  for (var sIdx = 0; sIdx < socials.length; sIdx++) {
    social.appendChild(
      makeText(
        socials[sIdx],
        "site-footer/link",
        getVar("site-footer/link.font-size"),
        null,
        getVar("site-footer/link.text")
      )
    );
  }
  bottom.appendChild(social);
  comp.appendChild(bottom);
  try {
    stretch(bottom);
  } catch (e) {}
  return comp;
}

function buildSiteFooter(x, y) {
  var variants = ["default", "minimal"];
  var configs = [];
  for (var i = 0; i < variants.length; i++) {
    (function (variant) {
      configs.push({
        variantProps: { variant: variant },
        buildFn: function () {
          return buildSiteFooterVariant(variant);
        },
      });
    })(variants[i]);
  }
  return buildComponentSet("Site Footer", configs, "variant", x, y);
}

// ---- PAGE LAYOUT: variant (default, full-width, centered) × sidebar ----
// Header and footer are slots, so they are drawn as labelled placeholder
// strips; the skip link is sr-only until focused and is not drawn.
function makeLayoutSlot(name, heightVar, fallbackH) {
  var slot = figma.createFrame();
  slot.name = name;
  slot.layoutMode = "HORIZONTAL";
  slot.primaryAxisAlignItems = "CENTER";
  slot.counterAxisAlignItems = "CENTER";
  slot.primaryAxisSizingMode = "FIXED";
  slot.counterAxisSizingMode = "FIXED";
  resizeKeep(slot, COMPOSITION_WIDTH, resolveSpace(heightVar) || fallbackH);
  bindProp(slot, "height", heightVar);
  slot.fills = [];
  slot.appendChild(
    makeText(
      name,
      "site-footer/link",
      getVar("site-footer/link.font-size"),
      null,
      getVar("color/foreground/muted")
    )
  );
  return slot;
}

function buildPageLayoutVariant(variantKey, sidebarKey) {
  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, COMPOSITION_WIDTH, 100);
  comp.itemSpacing = 0;
  bindFill(comp, getVar("color/background/default"));

  comp.appendChild(makeLayoutSlot("Header", getVar("site-header/height"), 64));

  var body = figma.createFrame();
  body.name = "body";
  body.layoutMode = "HORIZONTAL";
  body.primaryAxisSizingMode = "FIXED";
  body.counterAxisSizingMode = "FIXED";
  resizeKeep(body, COMPOSITION_WIDTH, 320);
  body.fills = [];
  body.itemSpacing = 0;

  function makeSidebar(side) {
    var aside = figma.createFrame();
    aside.name = "sidebar";
    aside.layoutMode = "VERTICAL";
    aside.primaryAxisAlignItems = "CENTER";
    aside.counterAxisAlignItems = "CENTER";
    aside.primaryAxisSizingMode = "FIXED";
    aside.counterAxisSizingMode = "FIXED";
    var wVar = getVar("page-layout/sidebar-width");
    resizeKeep(aside, resolveSpace(wVar) || 224, 320);
    bindProp(aside, "width", wVar);
    aside.fills = [];
    // sidebar on the left has border-r, on the right border-l
    strokeOneSide(
      aside,
      side === "left" ? "right" : "left",
      getVar("page-layout/sidebar-border"),
      null
    );
    aside.appendChild(
      makeText(
        "Sidebar",
        "site-footer/link",
        getVar("site-footer/link.font-size"),
        null,
        getVar("color/foreground/muted")
      )
    );
    return aside;
  }

  if (sidebarKey === "left") body.appendChild(makeSidebar("left"));

  var main = figma.createFrame();
  main.name = "main";
  main.layoutMode = "VERTICAL";
  main.primaryAxisAlignItems = "CENTER";
  main.counterAxisAlignItems = "CENTER";
  main.primaryAxisSizingMode = "FIXED";
  main.counterAxisSizingMode = "FIXED";
  main.fills = [];
  setPadY(main, getVar("page-layout/main.padding-y"));
  // full-width has no horizontal padding or container; the others use the
  // container padding, and centered also caps the width
  if (variantKey !== "full-width") {
    setPadX(main, getVar("page-layout/main.padding-x-lg"));
  }
  var sidebarW =
    sidebarKey === "none"
      ? 0
      : resolveSpace(getVar("page-layout/sidebar-width")) || 224;
  var mainW = COMPOSITION_WIDTH - sidebarW;
  if (variantKey === "centered") {
    var maxVar = getVar("page-layout/main.max-width-centered");
    mainW = Math.min(mainW, resolveSpace(maxVar) || mainW);
  }
  resizeKeep(main, mainW, 320);
  main.appendChild(
    makeText(
      "Main content",
      "site-footer/link",
      getVar("site-footer/link.font-size"),
      null,
      getVar("color/foreground/default")
    )
  );
  body.appendChild(main);
  try {
    // main is flex-1: it takes the space the sidebar leaves
    main.layoutGrow = variantKey === "centered" ? 0 : 1;
  } catch (e) {}

  if (sidebarKey === "right") body.appendChild(makeSidebar("right"));
  comp.appendChild(body);

  comp.appendChild(makeLayoutSlot("Footer", getVar("site-header/height"), 64));
  return comp;
}

function buildPageLayout(x, y) {
  // full-width matches default at the 960px frame (the container never hits
  // its max width), and centered only differs with no sidebar.
  var variants = ["default", "centered"];
  var sidebars = ["none", "left", "right"];
  var configs = [];
  for (var i = 0; i < variants.length; i++) {
    for (var j = 0; j < sidebars.length; j++) {
      if (variants[i] === "centered" && sidebars[j] !== "none") continue;
      (function (variant, sidebar) {
        configs.push({
          variantProps: { variant: variant, sidebar: sidebar },
          buildFn: function () {
            return buildPageLayoutVariant(variant, sidebar);
          },
        });
      })(variants[i], sidebars[j]);
    }
  }
  return buildComponentSet("Page Layout", configs, "variant", x, y);
}

// ---- SECTION HERO: variant (default, gradient, centered) ----
// bg-gradient-to-br from-primary/10 via-default to-primary-muted/10.
// A bound variable carries no alpha, so the stops stay opaque and bound, and
// the 10% comes from the paint opacity on an overlay above the default
// background. (Via is the default background, so over it the result matches
// the CSS: faint primary at the corners, clear in the middle.)
function makeHeroGradient(comp) {
  bindFill(comp, getVar("section-hero/background"));
  var from = getVar("section-hero/gradient.from");
  var via = getVar("section-hero/gradient.via");
  var to = getVar("section-hero/gradient.to");
  try {
    var stop = function (pos, v) {
      var col = resolvedPaintColor(v, comp, { r: 0.8, g: 0.8, b: 0.8 });
      var st = { position: pos, color: { r: col.r, g: col.g, b: col.b, a: 1 } };
      if (v) st.boundVariables = { color: figma.variables.createVariableAlias(v) };
      return st;
    };
    var overlay = figma.createFrame();
    overlay.name = "gradient";
    overlay.fills = [
      {
        type: "GRADIENT_LINEAR",
        opacity: 0.1,
        gradientTransform: [
          [0.5, 0.5, 0],
          [-0.5, 0.5, 0.5],
        ],
        gradientStops: [stop(0, from), stop(0.5, via), stop(1, to)],
      },
    ];
    comp.appendChild(overlay);
    overlay.layoutPositioning = "ABSOLUTE";
    overlay.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
    overlay.x = 0;
    overlay.y = 0;
    resizeKeep(overlay, COMPOSITION_WIDTH, 100);
    return overlay;
  } catch (e) {
    console.error("hero gradient failed: " + e.message);
    return null;
  }
}

function buildSectionHeroVariant(variantKey) {
  var centered = variantKey === "centered";
  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, COMPOSITION_WIDTH, 100);
  comp.counterAxisAlignItems = centered ? "CENTER" : "MIN";
  setPadY(comp, getVar("section-hero/padding-y-md"));
  setPadX(comp, getVar("section-hero/container.padding-x-lg"));
  var overlay = null;
  if (variantKey === "gradient") overlay = makeHeroGradient(comp);
  else bindFill(comp, getVar("section-hero/background"));

  var innerW =
    COMPOSITION_WIDTH -
    2 * (resolveSpace(getVar("section-hero/container.padding-x-lg")) || 32);
  // the content column fills the container (centered caps it at max-width);
  // it hugs its height, so text wraps inside the fixed width
  var contentW = centered
    ? Math.min(
        resolveSpace(getVar("section-hero/layout.max-width-centered")) || 640,
        innerW
      )
    : innerW;
  var content = makeStack("content", "V", getVar("section-hero/content-gap"));
  content.counterAxisAlignItems = centered ? "CENTER" : "MIN";
  content.counterAxisSizingMode = "FIXED";
  resizeKeep(content, contentW, 10);
  comp.appendChild(content);

  content.appendChild(makeBadgeFrame("New release", "outline", "md"));

  var title = makeText(
    "The design system that closes the gap",
    "section-hero/title/lg",
    getVar("section-hero/title.font-size-lg"),
    getVar("section-hero/title.font-weight"),
    getVar("color/foreground/default")
  );
  appendWrapped(content, title);

  var descMax = resolveSpace(getVar("section-hero/description.max-width")) || 560;
  var desc = makeText(
    "Tokens, components and documentation that stay in sync from Figma to code.",
    "section-hero/description/md",
    getVar("section-hero/description.font-size-md"),
    null,
    getVar("section-hero/description-text")
  );
  content.appendChild(desc);
  try {
    desc.textAutoResize = "HEIGHT";
    resizeKeep(desc, Math.min(descMax, contentW), desc.height);
  } catch (e) {}
  if (centered) {
    try {
      title.textAlignHorizontal = "CENTER";
      desc.textAlignHorizontal = "CENTER";
    } catch (e) {}
  }

  var actions = makeStack("actions", "H", getVar("section-hero/actions-gap"));
  actions.appendChild(makeButtonFrame("Get started", "default", "lg"));
  actions.appendChild(makeButtonFrame("Learn more", "outline", "lg"));
  content.appendChild(actions);

  if (overlay) {
    // behind the content, and as tall as the finished section
    comp.insertChild(0, overlay);
    resizeKeep(overlay, comp.width, comp.height);
  }
  return comp;
}

function buildSectionHero(x, y) {
  var variants = ["default", "gradient", "centered"];
  var configs = [];
  for (var i = 0; i < variants.length; i++) {
    (function (variant) {
      configs.push({
        variantProps: { variant: variant },
        buildFn: function () {
          return buildSectionHeroVariant(variant);
        },
      });
    })(variants[i]);
  }
  return buildComponentSet("Section Hero", configs, "variant", x, y);
}

// ---- SECTION FEATURES: variant (default, cards, grid) × columns (2, 3, 4) ----
// The Section Features icon tile: icon-background at 10%, rounded, icon-text glyph. Used by the
// feature columns and, hidden, by the Card (an instance cannot take new children, so the Card
// carries the icon row and a Section Features card turns it on).
function makeFeatureIconTile() {
  var iconSizeVar = getVar("section-features/icon.size");
  var tile = figma.createFrame();
  tile.name = "icon";
  tile.layoutMode = "HORIZONTAL";
  tile.primaryAxisAlignItems = "CENTER";
  tile.counterAxisAlignItems = "CENTER";
  tile.primaryAxisSizingMode = "FIXED";
  tile.counterAxisSizingMode = "FIXED";
  var iconSize = resolveSpace(iconSizeVar) || 48;
  resizeKeep(tile, iconSize, iconSize);
  bindSize(tile, iconSizeVar, iconSizeVar);
  bindCornerRadius(tile, getVar("section-features/icon.radius"));
  bindFill(tile, getVar("section-features/icon-background"));
  applyFillAlpha(tile, 0.1); // bg-(--color-section-features-icon-background)/10
  var glyph = figma.createFrame();
  glyph.name = "icon-glyph";
  resizeKeep(glyph, Math.round(iconSize / 2), Math.round(iconSize / 2));
  glyph.cornerRadius = 4;
  bindFill(glyph, getVar("section-features/icon-text"));
  tile.appendChild(glyph);

  return tile;
}


function buildSectionFeaturesVariant(variantKey, columns) {
  var comp = figma.createComponent();
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "FIXED";
  resizeKeep(comp, COMPOSITION_WIDTH, 100);
  setPadY(comp, getVar("section-features/padding-y-md"));
  setPadX(comp, getVar("section-features/container.padding-x-lg"));
  bindFill(
    comp,
    getVar(
      variantKey === "cards"
        ? "section-features/background-muted"
        : "section-features/background"
    )
  );
  var headerMarginVar = getVar("section-features/header.margin-bottom");
  comp.itemSpacing = resolveSpace(headerMarginVar);
  bindProp(comp, "itemSpacing", headerMarginVar);
  comp.counterAxisAlignItems = "CENTER";

  var innerW =
    COMPOSITION_WIDTH -
    2 * (resolveSpace(getVar("section-features/container.padding-x-lg")) || 32);

  // header: centred title + description, capped at header.max-width
  var header = makeStack("header", "V", getVar("section-features/title.margin-bottom"));
  header.counterAxisAlignItems = "CENTER";
  header.counterAxisSizingMode = "FIXED";
  resizeKeep(header, 
    Math.min(resolveSpace(getVar("section-features/header.max-width")) || 640, innerW),
    10
  );
  var title = makeText(
    "Everything you need",
    "section-features/title/lg",
    getVar("section-features/title.font-size-lg"),
    getVar("section-features/title.font-weight"),
    getVar("color/foreground/default")
  );
  appendWrapped(header, title);
  var headerDesc = makeText(
    "A short description of what the product does well.",
    "section-features/description",
    getVar("section-features/description-font-size"),
    null,
    getVar("section-features/description-text")
  );
  appendWrapped(header, headerDesc);
  try {
    title.textAlignHorizontal = "CENTER";
    headerDesc.textAlignHorizontal = "CENTER";
  } catch (e) {}
  comp.appendChild(header);

  // grid: two rows of `columns` items
  var gapVar = getVar("section-features/grid-gap");
  var gap = resolveSpace(gapVar) || 32;
  var itemW = Math.floor((innerW - gap * (columns - 1)) / columns);
  var grid = makeStack("grid", "V", gapVar);
  var titles = ["Fast", "Accessible", "Token driven", "Documented", "Tested", "Themeable", "Typed", "Composable"];
  for (var r = 0; r < 2; r++) {
    var row = makeStack("row", "H", gapVar);
    row.counterAxisAlignItems = "MIN";
    for (var c = 0; c < columns; c++) {
      var idx = r * columns + c;
      var isCard = variantKey === "cards";
      // the cards variant holds Card components in code: place an instance of the Card set
      // (Plan 218) and fall back to a drawn frame only when the set is missing
      var cardInst = isCard ? instanceFromSet("Card", "interaction=default") : null;
      var item = cardInst || makeStack(isCard ? "card" : "feature", "V", getVar("section-features/item-gap"));
      if (cardInst) item.name = "card";
      item.counterAxisSizingMode = "FIXED";
      resizeKeep(item, itemW, 10);
      if (isCard && !cardInst) {
        // real Card: card tokens
        var cardPad = getVar("card/padding");
        item.paddingTop = resolveSpace(cardPad);
        bindProp(item, "paddingTop", cardPad);
        item.paddingBottom = resolveSpace(cardPad);
        bindProp(item, "paddingBottom", cardPad);
        item.paddingLeft = resolveSpace(cardPad);
        bindProp(item, "paddingLeft", cardPad);
        item.paddingRight = resolveSpace(cardPad);
        bindProp(item, "paddingRight", cardPad);
        bindCornerRadius(item, getVar("card/radius"));
        bindFill(item, getVar("card/background"));
        bindStroke(item, getVar("card/border"), null);
        applyEffectStyle(item, "shadow/sm");
      }
      if (cardInst) {
        // CardHeader (icon row + title), CardContent (description); no CardDescription and no
        // CardFooter, like the UI's cards variant. An instance cannot take new children, so the
        // icon row is the Card's own hidden "feature-icon" layer, turned on here.
        try {
          var cardHeader = cardInst.children[0];
          var cardTitle = cardHeader.children.find(function (c) { return c.type === "TEXT" && c.name === "title"; });
          var cardDescription = cardHeader.children.find(function (c) { return c.type === "TEXT" && c.name === "description"; });
          var featureIcon = cardHeader.children.find(function (c) { return c.name === "feature-icon"; });
          var cardContent = cardInst.children[1];
          var cardFooter = cardInst.children[2];
          if (featureIcon) featureIcon.visible = true;
          else console.warn("section features: Card has no feature-icon layer");
          cardTitle.characters = titles[idx % titles.length];
          cardTitle.fontSize = resolveFontSize(getVar("section-features/item.title.font-size"));
          cardDescription.visible = false;
          cardContent.characters = "A short description of this feature and why it matters.";
          cardFooter.visible = false;
        } catch (e) {
          console.warn("section features card instance: " + e.message);
        }
        row.appendChild(item);
        continue;
      }
      var tile = makeFeatureIconTile();
      item.appendChild(tile);

      appendWrapped(item, makeText(
            titles[idx % titles.length],
            "section-features/item/title",
            getVar("section-features/item.title.font-size"),
            getVar("section-features/item.title.font-weight"),
            getVar("color/foreground/default")
          ));
      appendWrapped(item, makeText(
            "A short description of this feature and why it matters.",
            "section-features/description",
            getVar("section-features/description-font-size"),
            null,
            getVar("section-features/item-text")
          ));
      row.appendChild(item);
    }
    grid.appendChild(row);
  }
  comp.appendChild(grid);
  return comp;
}

function buildSectionFeatures(x, y) {
  // `grid` has the same background and layout as `default`
  var variants = ["default", "cards"];
  var columnCounts = [2, 3, 4];
  var configs = [];
  for (var i = 0; i < variants.length; i++) {
    for (var j = 0; j < columnCounts.length; j++) {
      (function (variant, cols) {
        configs.push({
          variantProps: { variant: variant, columns: String(cols) },
          buildFn: function () {
            return buildSectionFeaturesVariant(variant, cols);
          },
        });
      })(variants[i], columnCounts[j]);
    }
  }
  return buildComponentSet("Section Features", configs, "variant", x, y);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  figma.notify("Wylie Dog Builder v39: Starting...");
  try {
    await loadFonts();
    await initialize();

    // Plan 208: text styles come from Token Bridge. Stop before building
    // anything when the file has none.
    if (Object.keys(styleByFontSizeToken).length === 0) {
      figma.notify(
        "No Token Bridge text styles in this file. Run Token Bridge first: Pull with Text styles ticked, then run this builder again. Nothing was built.",
        { error: true, timeout: 10000 }
      );
      console.error(
        "Builder stopped: no text styles with a fontSizeToken link. Pull with Text styles ticked in Token Bridge first."
      );
      figma.closePlugin();
      return;
    }

    // Generate Figma styles from tokens before building components
    figma.notify("Generating effect styles...");
    await generateEffectStyles();

    var xCursor = 100;
    var Y = 100;
    var built = [];

    var components = [
      {
        name: "Icon",
        build: function () {
          return buildIcon(xCursor, Y);
        },
      },
      {
        name: "Button",
        build: function () {
          return buildButton(xCursor, Y);
        },
      },
      {
        name: "Badge",
        build: function () {
          return buildBadge(xCursor, Y);
        },
      },
      {
        name: "Input",
        build: function () {
          return buildInput(xCursor, Y);
        },
      },
      {
        name: "Alert",
        build: function () {
          return buildAlert(xCursor, Y);
        },
      },
      {
        name: "Card",
        build: function () {
          return buildCard(xCursor, Y);
        },
      },
      {
        name: "Avatar",
        build: function () {
          return buildAvatar(xCursor, Y);
        },
      },
      {
        name: "Checkbox",
        build: function () {
          return buildCheckbox(xCursor, Y);
        },
      },
      {
        name: "Radio",
        build: function () {
          return buildRadio(xCursor, Y);
        },
      },
      {
        name: "Switch",
        build: function () {
          return buildSwitch(xCursor, Y);
        },
      },
      {
        name: "Separator",
        build: function () {
          return buildSeparator(xCursor, Y);
        },
      },
      {
        name: "Label",
        build: function () {
          return buildLabel(xCursor, Y);
        },
      },
      {
        name: "Textarea",
        build: function () {
          return buildTextarea(xCursor, Y);
        },
      },
      {
        name: "Progress",
        build: function () {
          return buildProgress(xCursor, Y);
        },
      },
      {
        name: "Dropdown Menu",
        build: function () {
          return buildDropdownMenu(xCursor, Y);
        },
      },
      {
        name: "Select",
        build: function () {
          return buildSelect(xCursor, Y);
        },
      },
      {
        name: "Popover",
        build: function () {
          return buildPopover(xCursor, Y);
        },
      },
      {
        name: "Tooltip",
        build: function () {
          return buildTooltip(xCursor, Y);
        },
      },
      {
        name: "Dialog",
        build: function () {
          return buildDialog(xCursor, Y);
        },
      },
      {
        name: "Tabs",
        build: function () {
          return buildTabs(xCursor, Y);
        },
      },
      {
        name: "Accordion",
        build: function () {
          return buildAccordion(xCursor, Y);
        },
      },
      {
        name: "Toast",
        build: function () {
          return buildToast(xCursor, Y);
        },
      },
      {
        name: "Skeleton",
        build: function () {
          return buildSkeleton(xCursor, Y);
        },
      },
      {
        name: "Slider",
        build: function () {
          return buildSlider(xCursor, Y);
        },
      },
      {
        name: "Toggle",
        build: function () {
          return buildToggle(xCursor, Y);
        },
      },
      {
        name: "Breadcrumb",
        build: function () {
          return buildBreadcrumb(xCursor, Y);
        },
      },
      {
        name: "Pagination",
        build: function () {
          return buildPagination(xCursor, Y);
        },
      },
      {
        name: "Table",
        build: function () {
          return buildTable(xCursor, Y);
        },
      },
      {
        name: "Sheet",
        build: function () {
          return buildSheet(xCursor, Y);
        },
      },
      {
        name: "Hover Card",
        build: function () {
          return buildHoverCard(xCursor, Y);
        },
      },
      {
        name: "Collapsible",
        build: function () {
          return buildCollapsible(xCursor, Y);
        },
      },
      {
        name: "Scrollbar",
        build: function () {
          return buildScrollbar(xCursor, Y);
        },
      },
      {
        name: "Context Menu",
        build: function () {
          return buildContextMenu(xCursor, Y);
        },
      },
      {
        name: "Menubar",
        build: function () {
          return buildMenubar(xCursor, Y);
        },
      },
      {
        name: "Navigation Menu",
        build: function () {
          return buildNavigationMenu(xCursor, Y);
        },
      },
      {
        name: "Command",
        build: function () {
          return buildCommand(xCursor, Y);
        },
      },
      {
        name: "Resizable",
        build: function () {
          return buildResizable(xCursor, Y);
        },
      },
      {
        name: "Form",
        build: function () {
          return buildForm(xCursor, Y);
        },
      },
      {
        name: "Toggle Group",
        build: function () {
          return buildToggleGroup(xCursor, Y);
        },
      },
      {
        name: "Calendar",
        build: function () {
          return buildCalendar(xCursor, Y);
        },
      },
      {
        name: "Alert Dialog",
        build: function () {
          return buildAlertDialog(xCursor, Y);
        },
      },
      {
        name: "Carousel",
        build: function () {
          return buildCarousel(xCursor, Y);
        },
      },
      {
        name: "Feature Grid",
        build: function () {
          return buildFeatureGrid(xCursor, Y);
        },
      },
      {
        name: "Card Grid",
        build: function () {
          return buildCardGrid(xCursor, Y);
        },
      },
      {
        name: "Site Header",
        build: function () {
          return buildSiteHeader(xCursor, Y);
        },
      },
      {
        name: "Site Footer",
        build: function () {
          return buildSiteFooter(xCursor, Y);
        },
      },
      {
        name: "Page Layout",
        build: function () {
          return buildPageLayout(xCursor, Y);
        },
      },
      {
        name: "Section Hero",
        build: function () {
          return buildSectionHero(xCursor, Y);
        },
      },
      {
        name: "Section Features",
        build: function () {
          return buildSectionFeatures(xCursor, Y);
        },
      },
    ];

    for (var ci = 0; ci < components.length; ci++) {
      var entry = components[ci];
      try {
        console.log("Building " + entry.name + "...");
        var set = entry.build();
        applyContentProperties(set);
        applyOverlayProperties(set);
        applyDisabledOpacity(set);
        xCursor += set.width + 100;
        built.push(set);
        console.log(entry.name + " OK — " + set.children.length + " variants");
      } catch (e) {
        console.error(entry.name + " FAILED: " + e.message);
        figma.notify(entry.name + " failed: " + e.message, {
          error: true,
          timeout: 5000,
        });
        // Continue building remaining components instead of aborting
      }
    }

    console.log("Named " + nameDefaultLayers(built) + " default-named layers");
    var sections = arrangeInSections(built);
    console.log("Arranged " + built.length + " sets in " + sections.length + " sections");
    var effectResult = await applyPendingEffectStyles();
    figma.notify("Applying text styles...");
    var styleResult = await applyPendingTextStyles();
    figma.notify("Wiring hover and press transitions...");
    var stateResult = await applyStateReactions();
    fitSetsAndSections(built, sections);
    reapplyFillAlphas();
    reapplyCardInstanceTileAlphas();

    figma.viewport.scrollAndZoomIntoView(built);

    var styleCount = Object.keys(styleByFontSizeToken).length;
    if (unstyledLayers.length > 0) {
      console.warn(
        "Layers with no Token Bridge text style (" +
          unstyledLayers.length +
          "):\n" +
          unstyledLayers
            .map(function (u) {
              return "  " + u.layer + " — " + u.token;
            })
            .join("\n")
      );
    }
    figma.notify(
      "v39 complete. " +
        built.length +
        " components, " +
        styleCount +
        " Token Bridge text styles found, " +
        styleResult.applied +
        " layers styled, " +
        unstyledLayers.length +
        " with no style (see console)" +
        (styleResult.failed ? " (" + styleResult.failed + " failed)" : "") +
        ". " +
        (stateResult.skipped
          ? "State transitions NOT wired: " + stateResult.skipped
          : stateResult.wired + " state transitions wired") +
        ".",
      { timeout: 8000 }
    );
  } catch (err) {
    console.error(err);
    figma.notify("Error: " + err.message, { error: true });
  }
  figma.closePlugin();
}

main();
