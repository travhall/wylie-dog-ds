// Figma variable scope inference.
//
// Scopes decide which property pickers (fill, text fill, stroke...) list a
// variable. A variable left on ALL_SCOPES appears in every picker of its type,
// so every token gets a scope, inferred from its name (the type is often
// "number" on purpose, see documentation/reference/figma-gateway.md).
//
// An empty list ([]) is valid and hides the variable from every picker.
// Owner decisions (Plan 201, 2026-10-25):
// - line-height and tracking/letter-spacing are hidden (Plans 201 and 204):
//   the tokens are percentages (100, 125, 137.5) and em fractions (-0.05em),
//   but Figma binds both properties as pixels, so LINE_HEIGHT would give a
//   100px line height and LETTER_SPACING -0.05px. Figma shows them as percent
//   text-style properties generated from the tokens (figma-gateway.md).
// - opacity is hidden (Plan 217, owner decision): the tokens are fractions (0.7)
//   but a bound opacity variable is read as a percent, so 0.7 would draw at
//   0.7%. The builder sets the number instead of binding it.
// - primitive colors (color.blue.600) are hidden: designers bind semantic and
//   component variables, not the raw palette.
// - z-index (and the semantic layer.* roles), duration, easing, scale, shadow value
//   strings and the semantic focus dimensions are hidden: no Figma property binds them.
// - shadow blur, offset and spread are EFFECT_FLOAT.
// No real variable is left on ALL_SCOPES (Plan 217, owner decision D1). A new
// component color whose name has no property word keeps ALL_SCOPES in this
// function and fails scopes.test.ts, so it gets a word or a rule.

// Map W3C DTCG types to Figma scopes with enhanced typography support
const W3C_TO_FIGMA_SCOPES_MAP: Record<string, string[]> = {
  // color is name-based, see inferScopesForColor
  color: ["ALL_SCOPES"],
  fontSize: ["FONT_SIZE"],
  fontWeight: ["FONT_WEIGHT"],
  fontFamily: ["FONT_FAMILY"],
  // hidden: Figma binds both as pixels (see the header)
  lineHeight: [],
  letterSpacing: [],
  spacing: ["GAP", "WIDTH_HEIGHT"],
  sizing: ["WIDTH_HEIGHT"],
  borderRadius: ["CORNER_RADIUS"],
  borderWidth: ["STROKE_FLOAT"],
  // dimension type requires name-based scope inference (see inferScopesForDimension)
  dimension: ["ALL_SCOPES"],
  // CSS-only values no Figma property can bind
  shadow: [],
  duration: [],
  cubicBezier: [],
  boolean: ["ALL_SCOPES"],
  // Add fallbacks for common token types
  number: ["ALL_SCOPES"],
  string: ["ALL_SCOPES"],
  text: ["ALL_SCOPES"],
  font: ["FONT_FAMILY"],
  size: ["FONT_SIZE"],
};

const FILL_SCOPES = ["FRAME_FILL", "SHAPE_FILL"];
// Text, and vector icons (which are shapes)
const FOREGROUND_SCOPES = ["TEXT_FILL", "SHAPE_FILL"];
const STROKE_SCOPES = ["STROKE_COLOR"];
// The focus indicator is an outline (a stroke) plus a halo (a shadow)
const FOCUS_BORDER_SCOPES = ["STROKE_COLOR", "EFFECT_COLOR"];

// Property words in component token names. Stroke words are checked first
// ("border-color" is a border). A bare "color" is not a word: it takes its
// scope from the segment before it (see inferScopesForComponentColor).
const STROKE_WORDS = ["border", "ring", "outline", "stroke"];
// Words for the part of the UI that carries a text color
const FOREGROUND_WORDS = [
  "text",
  "label",
  "foreground",
  "placeholder",
  "link",
  "icon",
  "title",
  "description",
  "caption",
  "shortcut",
  "heading",
  "empty",
  "current",
  "error",
  "required",
  "close",
];
// A state word is the last resort, after every segment has been scanned for a
// property word (label.disabled-color is text). With none ("day-hover",
// "trigger-open") the token is a fill: text and border states carry "text" or
// "border" (Plan 217)
const STATE_WORDS = [
  "hover",
  "pressed",
  "selected",
  "highlighted",
  "active",
  "open",
  "disabled",
];
const FILL_WORDS = [
  "background",
  "fill",
  "track",
  "thumb",
  "indicator",
  "overlay",
  "range",
  "separator",
  "handle",
  "gradient",
];

/**
 * Infer Figma scopes for dimension tokens based on token name
 * Per W3C DTCG spec, dimension type encompasses border-radius, border-width, sizing, spacing
 */
function inferScopesForDimension(tokenName: string): string[] {
  const lowerName = tokenName.toLowerCase();

  // Border radius tokens
  if (lowerName.includes("radius") || lowerName.includes("border-radius")) {
    return ["CORNER_RADIUS"];
  }

  // Border width tokens
  if (
    lowerName.includes("border-width") ||
    lowerName.includes("borderwidth") ||
    (lowerName.includes("border") && lowerName.includes("width"))
  ) {
    return ["STROKE_FLOAT"];
  }

  // Sizing tokens (width/height)
  if (
    lowerName.includes("width") ||
    lowerName.includes("height") ||
    lowerName.includes("size") ||
    lowerName.includes("sizing")
  ) {
    return ["WIDTH_HEIGHT"];
  }

  // Spacing/gap tokens (default for dimension)
  if (
    lowerName.includes("spacing") ||
    lowerName.includes("space") ||
    lowerName.includes("gap") ||
    lowerName.includes("padding")
  ) {
    return ["GAP"];
  }

  // Default to GAP for unmatched dimension tokens
  return ["GAP"];
}

/**
 * Scopes for a component color token, from the property word in its name.
 * The last segment names the property ("background-hover"); earlier segments
 * name the part or variant ("checkbox.checked.border"), so they are only
 * consulted when the last one has no property word. A name with no property
 * word ("select.trigger-focus") keeps ALL_SCOPES rather than being guessed.
 * A bare "color" segment is settled by the part before it: a border is a
 * stroke, a title or content is text, a separator is a fill. Any other part
 * (indicator.color is a stroke, a fill elsewhere) stays ALL_SCOPES.
 */
function inferScopesForComponentColor(segments: string[]): string[] {
  for (let i = segments.length - 1; i >= 0; i--) {
    const words = segments[i].split("-");
    if (words.length === 1 && words[0] === "color") {
      const parent = (segments[i - 1] ?? "").split("-");
      if (STROKE_WORDS.some((w) => parent.includes(w))) {
        return [...STROKE_SCOPES];
      }
      if (
        FOREGROUND_WORDS.some((w) => parent.includes(w)) ||
        parent.includes("content")
      ) {
        return [...FOREGROUND_SCOPES];
      }
      if (parent.includes("separator")) return [...FILL_SCOPES];
      return ["ALL_SCOPES"];
    }
    // The offset ring color fills the gap around a ring, neither stroke nor fill
    if (words.includes("offset")) return ["ALL_SCOPES"];
    if (STROKE_WORDS.some((w) => words.includes(w))) return [...STROKE_SCOPES];
    if (FOREGROUND_WORDS.some((w) => words.includes(w))) {
      return [...FOREGROUND_SCOPES];
    }
    if (FILL_WORDS.some((w) => words.includes(w))) return [...FILL_SCOPES];
  }
  const last = segments[segments.length - 1].split("-");
  if (STATE_WORDS.some((w) => last.includes(w))) return [...FILL_SCOPES];
  return ["ALL_SCOPES"];
}

/**
 * Infer Figma scopes for color tokens based on token name.
 * Names are dotted ("color.background.primary"); the Figma name only
 * replaces dots with slashes, so the same rules apply to both.
 */
function inferScopesForColor(tokenName: string): string[] {
  const segments = tokenName.toLowerCase().split(/[./]/);

  if (segments[0] === "color") {
    // Semantic colors are property-first: color.<property>.<token>
    switch (segments[1]) {
      case "background":
        return [...FILL_SCOPES];
      case "foreground":
        return [...FOREGROUND_SCOPES];
      case "border":
        return [...STROKE_SCOPES];
      case "focus":
        // The ring is an outline (a stroke) and the halo is a shadow (an effect)
        return [...FOCUS_BORDER_SCOPES];
      default:
        // Primitive palette (color.blue.600): bound through semantic and
        // component variables, so hidden from every picker
        return [];
    }
  }

  return inferScopesForComponentColor(segments);
}

/**
 * Scopes decided by the property word in a non-color token's name, whatever
 * its type (font size, weight, line height, opacity and z-index are typed
 * number). Returns null when the name carries no such word.
 */
function inferScopesFromName(tokenName: string): string[] | null {
  const name = tokenName.toLowerCase();

  // Percentages and em fractions, but Figma binds both as pixels: hidden
  if (name.includes("line-height")) return [];
  if (name.includes("font-size")) return ["FONT_SIZE"];
  if (name.includes("font-weight")) return ["FONT_WEIGHT"];
  if (name.includes("tracking") || name.includes("letter-spacing")) {
    return [];
  }
  // Fractions (0.7), but Figma reads a bound opacity as a percent: 0.7 becomes 0.7%
  if (name.includes("opacity")) return [];
  if (name.includes("z-index")) return [];
  // The semantic stacking roles (layer.modal, layer.tooltip) alias z-index steps
  // but carry no z-index word in their name
  if (/^layer[./]/.test(name)) return [];
  // A hover scale (1.05) is a transform multiplier; no Figma property binds it
  if (name.includes("scale")) return [];
  // How far a surface travels while it enters or leaves: motion, not a gap or a size
  if (name.includes("distance")) return [];
  // The focus indicator is sized in code, not by a layer property
  if (/^focus[./]/.test(name)) return [];
  if (/^shadow[./](blur|offset|spread)/.test(name)) return ["EFFECT_FLOAT"];
  if (name.includes("border-width") || name.includes("stroke-width")) {
    return ["STROKE_FLOAT"];
  }
  return null;
}

/**
 * Token types Figma stores as TIMING and EASING variables. Figma refuses to set
 * scopes on these ("Cannot set scopes on this variable type") and reports
 * ALL_SCOPES when read, so their scopes can never match the rules and must be
 * left out of scope comparison. The importer skips them for the same reason.
 */
const SCOPELESS_TYPES = new Set(["duration", "cubicBezier"]);

export function canHaveScopes(type: string): boolean {
  return !SCOPELESS_TYPES.has(type);
}

/**
 * Figma scopes for a token of the given W3C type and name.
 */
export function inferScopes(type: string, tokenName: string): string[] {
  if (type === "color") return inferScopesForColor(tokenName);
  const byName = inferScopesFromName(tokenName);
  if (byName) return byName;
  if (type === "dimension") return inferScopesForDimension(tokenName);
  return [...(W3C_TO_FIGMA_SCOPES_MAP[type] || ["ALL_SCOPES"])];
}
