import StyleDictionary from "style-dictionary";
import { convertOklchToHex, isValidOklch } from './scripts/color-utils.js';

// Register OKLCH transform with accurate hex fallbacks
StyleDictionary.registerTransform({
  name: 'color/oklch-with-fallback',
  type: 'value',
  filter: (token) => token.$type === 'color',
  transform: (token) => {
    // Use the resolved value
    const resolvedValue = token.value;
    
    if (isValidOklch(resolvedValue)) {
      const hexFallback = convertOklchToHex(resolvedValue);
      return {
        oklch: resolvedValue,
        hex: hexFallback
      };
    }
    return resolvedValue;
  }
});

// Register comprehensive TypeScript format with OKLCH support
StyleDictionary.registerFormat({
  name: "typescript/design-tokens",
  format: function (dictionary) {
    const tokens = dictionary.allTokens;

    // Organize tokens by category
    const organized = tokens.reduce((acc, token) => {
      const [category, ...rest] = token.path;

      if (!acc[category]) acc[category] = {};

      // Build nested structure
      let current = acc[category];
      for (let i = 0; i < rest.length - 1; i++) {
        if (!current[rest[i]]) current[rest[i]] = {};
        current = current[rest[i]];
      }
      
      // Use hex fallback for colors, original value for others
      const finalValue = typeof token.value === 'object' && token.value !== null
        ? (token.value.hex || token.value.oklch || token.value)
        : token.value;
      current[rest[rest.length - 1]] = finalValue;

      return acc;
    }, {});

    return `// Auto-generated design tokens
// DO NOT EDIT MANUALLY
// Generated from W3C DTCG format tokens with OKLCH support

${Object.entries(organized)
  .map(
    ([category, tokens]) =>
      `export const ${category} = ${JSON.stringify(tokens, null, 2)} as const;`
  )
  .join("\n\n")}

// Flat token access for utility functions
export const flatTokens = {
${tokens
  .map((token) => {
    const finalValue = typeof token.value === 'object' && token.value !== null
      ? (token.value.hex || token.value.oklch || token.value)
      : token.value;
    return `  '${token.path.join("-")}': '${finalValue}'`;
  })
  .join(",\n")}
} as const;

// Main tokens export
export const tokens = {
${Object.keys(organized)
  .map((key) => `  ${key}`)
  .join(",\n")}
} as const;

export type TokenPath = keyof typeof flatTokens;
export type ColorToken = keyof typeof color;
export type SpacingToken = keyof typeof spacing;

// Color utilities with OKLCH support
export const colorUtils = {
  getHex: (colorValue: string) => {
    // If it's already a hex color, return it
    if (colorValue.startsWith('#')) return colorValue;
    // If it's an OKLCH color, convert it
    if (colorValue.startsWith('oklch(')) {
      return convertOklchToHex(colorValue);
    }
    return colorValue;
  }
};
`;
  },
});

// Register CSS format with OKLCH + hex fallbacks
StyleDictionary.registerFormat({
  name: "css/variables-with-fallbacks",
  format: function (dictionary) {
    const tokens = dictionary.allTokens;

    const variables = tokens
      .map((token) => {
        const varName = `--${token.path.join("-")}`;
        const value = token.value;
        
        // Handle color tokens with OKLCH + hex fallback
        if (token.$type === 'color' && typeof value === 'object' && value?.oklch && value?.hex) {
          return `  ${varName}: ${value.hex}; /* fallback */\n  ${varName}: ${value.oklch}; /* modern */`;
        }
        
        // Handle other token types or simple values
        const finalValue = typeof value === 'object' ? (value?.hex || value?.oklch || JSON.stringify(value)) : value;
        return `  ${varName}: ${finalValue};`;
      })
      .join("\n");

    return `/* 
 * Wylie Dog Design Tokens with OKLCH + hex fallbacks
 * Generated from W3C DTCG format
 * DO NOT EDIT MANUALLY
 */

/* CSS Variables for Storybook and general use */
:root {
${variables}
}

/* Tailwind v4 Theme Variables */
@theme {
${variables}
}`;
  },
});

const sd = new StyleDictionary({
  source: ["src/**/*.json"],
  // Use basic transforms without tokens-studio for now
  platforms: {
    // TypeScript output with OKLCH support
    typescript: {
      transforms: [
        'attribute/cti',
        'name/kebab', 
        'color/oklch-with-fallback'
      ],
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.generated.ts",
          format: "typescript/design-tokens",
        },
      ],
    },

    // CSS with OKLCH + hex fallbacks
    css: {
      transforms: [
        'attribute/cti',
        'name/kebab',
        'color/oklch-with-fallback'
      ],
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables-with-fallbacks",
        },
      ],
    },

    // JSON output for debugging
    json: {
      transforms: [
        'attribute/cti',
        'name/kebab',
        'color/oklch-with-fallback'
      ],
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.json",
          format: "json/nested",
        },
      ],
    },
  },
});

// Build with enhanced error handling
try {
  await sd.buildAllPlatforms();
  console.log("✅ Tokens built successfully with OKLCH support");
  console.log("📊 Generated files:");
  console.log("  - dist/tokens.css (CSS variables with OKLCH + hex fallbacks)");
  console.log("  - dist/tokens.generated.ts (TypeScript definitions)");
  console.log("  - dist/tokens.json (JSON for debugging)");
  console.log("");
  console.log("🎨 Features:");
  console.log("  - ✅ OKLCH colors with automatic hex fallbacks");
  console.log("  - ✅ 100% browser compatibility");
  console.log("  - ✅ Future-ready for wide-gamut displays");
  console.log("");
  console.log("⚠️  Note: W3C reference resolution needs manual handling");
} catch (error) {
  console.error("❌ Token build failed:", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
}
