import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

await register(StyleDictionary);

/**
 * Token type → CSS variable configuration
 * Maps token types to their CSS variable prefix and any path prefixes to strip
 */
const TOKEN_TYPE_CONFIG = {
  color: {
    prefix: "color",
    stripPrefixes: ["color-"],
  },
  spacing: {
    prefix: "spacing",
    stripPrefixes: ["spacing-"],
    // Special handling for border tokens within spacing type
    specialCases: {
      "border-radius-": { prefix: "border-radius" },
      "border-width-": { prefix: "border-width" },
    },
  },
  dimension: {
    prefix: "spacing",
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
    stripPrefixes: ["transition-duration-"],
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
 * Font family contract pattern values
 */
const FONT_FAMILY_CONTRACTS = {
  sans: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)",
  serif: "var(--font-serif, ui-serif, serif)",
  mono: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)",
};

/**
 * Generate CSS variable name and value for a token
 */
function generateCSSVariable(token, name) {
  const config = TOKEN_TYPE_CONFIG[token.$type];

  if (!config) {
    // Unknown type - use generic naming
    return { varName: `--${name}`, value: token.$value };
  }

  let cleanName = name;
  let prefix = config.prefix;
  let value = token.$value;

  // Check for special cases first (e.g., border-radius within spacing type)
  if (config.specialCases) {
    for (const [pattern, override] of Object.entries(config.specialCases)) {
      if (name.startsWith(pattern)) {
        cleanName = name.replace(new RegExp(`^${pattern}`), "");
        prefix = override.prefix;
        return { varName: `--${prefix}-${cleanName}`, value };
      }
    }
  }

  // Strip known prefixes to avoid double-prefixing
  for (const stripPrefix of config.stripPrefixes) {
    if (cleanName.startsWith(stripPrefix)) {
      cleanName = cleanName.slice(stripPrefix.length);
      break;
    }
  }

  // Handle font family contract pattern
  if (token.$type === "fontFamily") {
    for (const [fontType, contractValue] of Object.entries(FONT_FAMILY_CONTRACTS)) {
      if (name.includes(fontType)) {
        value = contractValue;
        break;
      }
    }
    return { varName: `--${name}`, value };
  }

  return { varName: `--${prefix}-${cleanName}`, value };
}

// Register format for semantic/component tokens (& primitives when included) in @theme
StyleDictionary.registerFormat({
  name: "css/semantic",
  format: function ({ dictionary, options }) {
    const themeVariables = [];
    const baseVariables = [];

    dictionary.allTokens.forEach((token) => {
      // Clean path: remove duplicate segments like "Color.Color"
      const cleanPath = token.path.filter((segment, index, arr) => {
        if (segment === "Color" && arr[index - 1] === "Color") return false;
        return true;
      });

      const name = cleanPath.join("-").toLowerCase();
      const { varName, value, extras } = generateCSSVariable(token, name);

      themeVariables.push(`  ${varName}: ${value};`);
      baseVariables.push(`    ${varName}: ${value};`);
    });

    if (options.mode === "dark") {
      return `/**
 * Dark mode semantic and component tokens
 * Applied via .dark class
 */

.dark {
${themeVariables.join("\n")}
}`;
    } else {
      return `/**
 * Light mode semantic and component tokens
 * These are in @theme for Tailwind utility generation
 */

@theme inline {
${themeVariables.join("\n")}
}

@layer base {
  :root {
${baseVariables.join("\n")}
  }
}`;
    }
  },
});

// Register hierarchical JS format for Storybook
StyleDictionary.registerFormat({
  name: "javascript/hierarchical",
  format: function ({ dictionary }) {
    const hierarchical = {
      color: {},
      spacing: {},
      shadow: {},
      borderRadius: {},
      fontSize: {},
      fontWeight: {},
      lineHeight: {},
      duration: {},
    };

    dictionary.allTokens.forEach((token) => {
      // Clean path: remove duplicate segments like "Color.Color"
      const cleanPath = token.path.filter((segment, index, arr) => {
        if (segment === "Color" && arr[index - 1] === "Color") return false;
        return true;
      });

      const pathKey = cleanPath.slice(1).join("-").toLowerCase() || cleanPath[0]?.toLowerCase();
      const firstSegment = cleanPath[0]?.toLowerCase();

      // Route by token type
      switch (token.$type) {
        case "color":
          // Handle nested color tokens: color.gray.50 -> { gray: { 50: value } }
          if (firstSegment === "color" && cleanPath[1] && cleanPath[2]) {
            const colorName = cleanPath[1].toLowerCase();
            const shade = cleanPath[2];
            if (!hierarchical.color[colorName]) {
              hierarchical.color[colorName] = {};
            }
            hierarchical.color[colorName][shade] = token.$value;
          }
          // Handle semantic colors: color.primary -> { primary: { base: value } }
          else if (firstSegment === "color" && cleanPath[1]) {
            const colorName = cleanPath[1].toLowerCase();
            const shade = cleanPath[2] || "base";
            if (!hierarchical.color[colorName]) {
              hierarchical.color[colorName] = {};
            }
            hierarchical.color[colorName][shade] = token.$value;
          }
          break;

        case "shadow":
          // Handle shadow.sm, shadow.md, etc.
          if (firstSegment === "shadow" && cleanPath[1]) {
            hierarchical.shadow[cleanPath[1].toLowerCase()] = token.$value;
          }
          break;

        case "spacing":
        case "dimension":
          // Handle spacing tokens and dimension tokens used for spacing
          if (firstSegment === "spacing" || firstSegment === "border-radius" || firstSegment === "border-width") {
            if (firstSegment === "border-radius") {
              hierarchical.borderRadius[pathKey.replace("border-radius-", "")] = token.$value;
            } else {
              hierarchical.spacing[pathKey.replace("spacing-", "")] = token.$value;
            }
          } else if (pathKey) {
            hierarchical.spacing[pathKey] = token.$value;
          }
          break;

        case "fontSize":
          if (cleanPath[1]) {
            const key = cleanPath.slice(1).join("-").toLowerCase().replace("typography-font-size-", "");
            hierarchical.fontSize[key] = token.$value;
          }
          break;

        case "fontWeight":
          if (cleanPath[1]) {
            const key = cleanPath.slice(1).join("-").toLowerCase().replace("typography-font-weight-", "");
            hierarchical.fontWeight[key] = token.$value;
          }
          break;

        case "lineHeight":
          if (cleanPath[1]) {
            const key = cleanPath.slice(1).join("-").toLowerCase().replace("typography-line-height-", "");
            hierarchical.lineHeight[key] = token.$value;
          }
          break;

        case "duration":
          if (cleanPath[1]) {
            const key = cleanPath.slice(1).join("-").toLowerCase().replace("transition-duration-", "");
            hierarchical.duration[key] = token.$value;
          }
          break;
      }
    });

    // Filter out empty categories
    const nonEmptyCategories = Object.entries(hierarchical)
      .filter(([_, tokens]) => Object.keys(tokens).length > 0);

    return `/**
 * Do not edit directly, this file was auto-generated.
 */

${nonEmptyCategories
  .map(
    ([category, tokens]) =>
      `export const ${category} = ${JSON.stringify(tokens, null, 2)};`
  )
  .join("\n\n")}`;
  },
});

// Register manifest format for rich metadata exports
StyleDictionary.registerFormat({
  name: "json/manifest",
  format: function ({ dictionary }) {
    const manifest = {
      primitives: {
        colors: {},
        spacing: {},
        borderRadius: {},
        borderWidth: {},
        typography: {
          family: {},
          size: {},
          weight: {},
          lineHeight: {},
        },
      },
      semantics: {
        background: {},
        surface: {},
        text: {},
        border: {},
        interactive: {},
        status: {},
        other: {},
      },
      components: {},
    };

    dictionary.allTokens.forEach((token) => {
      const cleanPath = token.path.filter((segment, index, arr) => {
        if (segment === "Color" && arr[index - 1] === "Color") return false;
        return true;
      });

      const name = cleanPath.join("-").toLowerCase();
      const variableName = `--${token.$type === "color" ? "color-" : ""}${name.replace(/^color-/, "")}`;

      const tokenEntry = {
        name: token.name,
        path: token.path,
        value: token.$value,
        type: token.$type,
        variable: `var(${variableName})`,
        description: token.$description || "",
        ...(token.$extensions && { extensions: token.$extensions }),
      };

      const isPrimitive = token.filePath.includes("primitive");
      const isSemantic = token.filePath.includes("semantic");
      const isComponent = token.filePath.includes("component");

      if (isPrimitive) {
        if (
          token.$type === "color" &&
          cleanPath[0] === "color" &&
          cleanPath[1]
        ) {
          const group = cleanPath[1].toLowerCase();
          const shade = cleanPath[2] || "base";
          if (!manifest.primitives.colors[group])
            manifest.primitives.colors[group] = {};
          manifest.primitives.colors[group][shade] = tokenEntry;
        } else if (token.$type === "spacing") {
          manifest.primitives.spacing[name] = tokenEntry;
        } else if (name.startsWith("border-radius")) {
          manifest.primitives.borderRadius[name] = tokenEntry;
        } else if (name.startsWith("border-width")) {
          manifest.primitives.borderWidth[name] = tokenEntry;
        } else if (name.startsWith("typography")) {
          if (name.includes("family"))
            manifest.primitives.typography.family[name] = tokenEntry;
          else if (name.includes("size"))
            manifest.primitives.typography.size[name] = tokenEntry;
          else if (name.includes("weight"))
            manifest.primitives.typography.weight[name] = tokenEntry;
          else if (name.includes("line-height"))
            manifest.primitives.typography.lineHeight[name] = tokenEntry;
        }
      } else if (isSemantic) {
        if (token.$type === "color") {
          const group = cleanPath[1]?.toLowerCase() || "other";
          if (manifest.semantics[group]) {
            manifest.semantics[group][name] = tokenEntry;
          } else {
            manifest.semantics.other[name] = tokenEntry;
          }
        }
      } else if (isComponent) {
        const component = cleanPath[0].toLowerCase();
        if (!manifest.components[component])
          manifest.components[component] = {};
        manifest.components[component][name] = tokenEntry;
      }
    });

    return JSON.stringify(manifest, null, 2);
  },
});

// Build light mode semantic/component tokens
const lightSd = new StyleDictionary({
  source: [
    "io/processed/primitive.json",
    "io/processed/semantic-light.json",
    "io/processed/component-light.json",
  ],
  platforms: {
    css: {
      transformGroup: "tokens-studio",
      buildPath: "dist/",
      options: { mode: "light" },
      files: [
        {
          destination: "semantic-light.css",
          format: "css/semantic",
        },
      ],
    },
    js: {
      transformGroup: "tokens-studio",
      buildPath: "dist/",
      files: [
        {
          destination: "index.js",
          format: "javascript/es6",
        },
        {
          destination: "hierarchical.js",
          format: "javascript/hierarchical",
        },
        {
          destination: "manifest.json",
          format: "json/manifest",
        },
      ],
    },
  },
});

// Build dark mode semantic/component tokens
const darkSd = new StyleDictionary({
  source: [
    "io/processed/primitive.json",
    "io/processed/semantic-dark.json",
    "io/processed/component-dark.json",
  ],
  platforms: {
    css: {
      transformGroup: "tokens-studio",
      buildPath: "dist/",
      options: { mode: "dark" },
      files: [
        {
          destination: "semantic-dark.css",
          format: "css/semantic",
          filter: (token) => {
            // Only output semantic/component tokens, not primitives
            return (
              token.filePath.includes("semantic") ||
              token.filePath.includes("component")
            );
          },
        },
      ],
    },
  },
});

// Build all platforms
await lightSd.buildAllPlatforms();
await darkSd.buildAllPlatforms();

// Combine CSS files into tokens.css
import { readFile, writeFile } from "fs/promises";
const lightCSS = await readFile("dist/semantic-light.css", "utf8");
const darkCSS = await readFile("dist/semantic-dark.css", "utf8");
await writeFile("dist/tokens.css", `${lightCSS}\n\n${darkCSS}`);

console.log("✅ Built design tokens:");
console.log("   - dist/tokens.css (light + dark)");
console.log("   - dist/semantic-light.css (standalone)");
console.log("   - dist/semantic-dark.css (standalone)");
console.log("   - dist/index.js (JS tokens)");
console.log("   - dist/hierarchical.js (hierarchical JS tokens)");
