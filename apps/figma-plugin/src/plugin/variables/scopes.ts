// Figma variable scope inference.
//
// Scopes decide which property pickers (fill, text fill, stroke...) list a
// variable. Colour scopes are inferred from the token name; every other type
// keeps its type-based (or, for dimension, name-based) scopes.

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
  shadow: ["ALL_SCOPES"],
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
        // Primitive palette (color.blue.600): stays visible everywhere
        return ["ALL_SCOPES"];
    }
  }

  return inferScopesForComponentColor(segments);
}

/**
 * Figma scopes for a token of the given W3C type and name.
 */
export function inferScopes(type: string, tokenName: string): string[] {
  if (type === "dimension") return inferScopesForDimension(tokenName);
  if (type === "color") return inferScopesForColor(tokenName);
  return [...(W3C_TO_FIGMA_SCOPES_MAP[type] || ["ALL_SCOPES"])];
}
