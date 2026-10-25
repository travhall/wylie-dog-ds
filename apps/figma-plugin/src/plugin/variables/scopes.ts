// Figma variable scope inference.
//
// Scopes decide which property pickers (fill, text fill, stroke...) list a
// variable. A variable left on ALL_SCOPES appears in every picker of its type,
// so every token gets a scope, inferred from its name (the type is often
// "number" on purpose, see documentation/reference/figma-gateway.md).
//
// An empty list ([]) is valid and hides the variable from every picker.
// Owner decisions (Plan 201, 2026-10-25):
// - line-height is hidden: the tokens are percentages (100, 125, 137.5) but
//   Figma binds line-height variables as pixels, so LINE_HEIGHT would give a
//   100px line height. How to handle it long term is a separate decision.
// - primitive colours (color.blue.600) are hidden: designers bind semantic and
//   component variables, not the raw palette.
// - z-index, duration, easing, shadow value strings and the semantic focus
//   dimensions are hidden: no Figma property binds them.
// - shadow blur, offset and spread are EFFECT_FLOAT; tracking and
//   letter-spacing are LETTER_SPACING.
// The only variables left on ALL_SCOPES are component colours whose name has
// no property word (see inferScopesForComponentColor).

// Map W3C DTCG types to Figma scopes with enhanced typography support
const W3C_TO_FIGMA_SCOPES_MAP: Record<string, string[]> = {
  // colour is name-based, see inferScopesForColor
  color: ["ALL_SCOPES"],
  fontSize: ["FONT_SIZE"],
  fontWeight: ["FONT_WEIGHT"],
  fontFamily: ["FONT_FAMILY"],
  lineHeight: ["LINE_HEIGHT"],
  letterSpacing: ["LETTER_SPACING"],
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
// ("border-color" is a border). A bare "color" is deliberately not a word:
// separator.color is a fill, checkbox.border.color a stroke, card.title.color
// text, so it is ambiguous and stays ALL_SCOPES.
const STROKE_WORDS = ["border", "ring", "outline", "stroke"];
const FOREGROUND_WORDS = [
  "text",
  "label",
  "foreground",
  "placeholder",
  "link",
  "icon",
];
const FILL_WORDS = [
  "background",
  "fill",
  "track",
  "thumb",
  "indicator",
  "overlay",
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
 * Scopes for a component colour token, from the property word in its name.
 * The last segment names the property ("background-hover"); earlier segments
 * name the part or variant ("checkbox.checked.border"), so they are only
 * consulted when the last one has no property word. A name with no property
 * word ("select.trigger-focus") keeps ALL_SCOPES rather than being guessed.
 */
function inferScopesForComponentColor(segments: string[]): string[] {
  for (let i = segments.length - 1; i >= 0; i--) {
    const words = segments[i].split("-");
    // A bare "color" names no property; the parent segment cannot settle it
    // either (indicator.color is a stroke, separator.color a fill)
    if (words.length === 1 && words[0] === "color") return ["ALL_SCOPES"];
    // The offset ring colour fills the gap around a ring, neither stroke nor fill
    if (words.includes("offset")) return ["ALL_SCOPES"];
    if (STROKE_WORDS.some((w) => words.includes(w))) return [...STROKE_SCOPES];
    if (FOREGROUND_WORDS.some((w) => words.includes(w))) {
      return [...FOREGROUND_SCOPES];
    }
    if (FILL_WORDS.some((w) => words.includes(w))) return [...FILL_SCOPES];
  }
  return ["ALL_SCOPES"];
}

/**
 * Infer Figma scopes for colour tokens based on token name.
 * Names are dotted ("color.background.primary"); the Figma name only
 * replaces dots with slashes, so the same rules apply to both.
 */
function inferScopesForColor(tokenName: string): string[] {
  const segments = tokenName.toLowerCase().split(/[./]/);

  if (segments[0] === "color") {
    // Semantic colours are property-first: color.<property>.<token>
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
 * Scopes decided by the property word in a non-colour token's name, whatever
 * its type (font size, weight, line height, opacity and z-index are typed
 * number). Returns null when the name carries no such word.
 */
function inferScopesFromName(tokenName: string): string[] | null {
  const name = tokenName.toLowerCase();

  // Percentages, but Figma binds line height as pixels: hidden for now
  if (name.includes("line-height")) return [];
  if (name.includes("font-size")) return ["FONT_SIZE"];
  if (name.includes("font-weight")) return ["FONT_WEIGHT"];
  if (name.includes("tracking") || name.includes("letter-spacing")) {
    return ["LETTER_SPACING"];
  }
  if (name.includes("opacity")) return ["OPACITY"];
  if (name.includes("z-index")) return [];
  // The focus indicator is sized in code, not by a layer property
  if (/^focus[./]/.test(name)) return [];
  if (/^shadow[./](blur|offset|spread)/.test(name)) return ["EFFECT_FLOAT"];
  if (name.includes("border-width")) return ["STROKE_FLOAT"];
  return null;
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
