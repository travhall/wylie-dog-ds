// The CSS custom property name of a design token: one function, used by the Style
// Dictionary build (style-dictionary.config.js) and by scripts/generate-code-syntax.mjs, so
// the name in the CSS and the name Figma shows as a variable's code syntax cannot diverge
// (Plan 216, Phase E).
//
// The prefix follows the token's type, so `button.padding-x.md` (spacing) is
// `--space-button-padding-x-md`, not `--spacing-...`.

/**
 * Token type -> CSS variable prefix and any path prefixes to strip.
 */
export const TOKEN_TYPE_CONFIG = {
  color: {
    prefix: "color",
    stripPrefixes: ["color-"],
  },
  spacing: {
    prefix: "space",
    stripPrefixes: ["space-"],
    // Special handling for border tokens within spacing type
    specialCases: {
      "border-radius-": { prefix: "border-radius" },
      "border-width-": { prefix: "border-width" },
    },
  },
  dimension: {
    prefix: "space",
    stripPrefixes: [],
    specialCases: {
      "border-radius-": { prefix: "border-radius" },
      "border-width-": { prefix: "border-width" },
    },
  },
  fontSize: {
    prefix: "font-size",
    stripPrefixes: ["typography-font-size-"],
  },
  fontWeight: {
    prefix: "font-weight",
    stripPrefixes: ["typography-font-weight-"],
  },
  lineHeight: {
    prefix: "line-height",
    stripPrefixes: ["typography-line-height-"],
  },
  duration: {
    prefix: "duration",
    stripPrefixes: ["transition-duration-", "duration-"],
  },
  shadow: {
    prefix: "shadow",
    stripPrefixes: ["shadow-"],
  },
  fontFamily: {
    prefix: null, // Handled specially with contract pattern
    stripPrefixes: [],
  },
};

/**
 * 'number' type tokens whose name contains 'font-weight', 'line-height' or 'font-size'
 * follow that type's naming convention. Figma Variables has no native fontWeight type, so
 * these tokens use 'number' in the sync source but still generate --font-weight-* variables.
 */
export function effectiveCssType(token, name) {
  if (token.$type === "number" && name.includes("font-weight")) return "fontWeight";
  if (token.$type === "number" && name.includes("line-height")) return "lineHeight";
  if (token.$type === "number" && name.includes("font-size")) return "fontSize";
  return token.$type;
}

/**
 * The custom property name (with the leading "--") for a token. `name` is the token path
 * joined with hyphens ("button-padding-x-md").
 */
export function cssVariableName(token, name) {
  const config = TOKEN_TYPE_CONFIG[effectiveCssType(token, name)];
  // Unknown type: generic naming
  if (!config) return `--${name}`;

  // Special cases first (border radius and width within the spacing types)
  if (config.specialCases) {
    for (const [pattern, override] of Object.entries(config.specialCases)) {
      if (name.startsWith(pattern)) {
        return `--${override.prefix}-${name.slice(pattern.length)}`;
      }
    }
  }

  // Font families keep their full name (the value is the contract pattern)
  if (token.$type === "fontFamily") return `--${name}`;

  // Strip a known prefix to avoid double-prefixing
  let cleanName = name;
  for (const stripPrefix of config.stripPrefixes) {
    if (cleanName.startsWith(stripPrefix)) {
      cleanName = cleanName.slice(stripPrefix.length);
      break;
    }
  }
  return `--${config.prefix}-${cleanName}`;
}
