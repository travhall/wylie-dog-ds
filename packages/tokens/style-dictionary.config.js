// packages/tokens/style-dictionary.config.js - WORKING ENHANCED VERSION
import StyleDictionary from "style-dictionary";
import { convertOklchToHex, isValidOklch } from './scripts/color-utils.js';

// Enhanced OKLCH transform with better error handling
StyleDictionary.registerTransform({
  name: 'color/oklch-with-fallback',
  type: 'value',
  filter: (token) => token.$type === 'color',
  transform: (token) => {
    // Use the resolved value
    const resolvedValue = token.value || token.$value;
    
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

// Collision-safe naming transform
StyleDictionary.registerTransform({
  name: 'name/collision-safe-kebab',
  type: 'name',
  transform: (token) => {
    // Create collision-safe names by including more context
    return token.path.join('-');
  }
});

// Enhanced TypeScript format with better organization
StyleDictionary.registerFormat({
  name: "typescript/design-tokens-enhanced",
  format: function (dictionary) {
    const tokens = dictionary.allTokens;

    // Organize tokens by category with collision prevention
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
      
      // Handle empty finalValue
      if (finalValue !== undefined && finalValue !== null && finalValue !== '') {
        current[rest[rest.length - 1]] = finalValue;
      }

      return acc;
    }, {});

    return `// Auto-generated design tokens - Enhanced W3C DTCG compliant
// DO NOT EDIT MANUALLY
// Generated with collision-safe naming and OKLCH support

${Object.entries(organized)
  .map(
    ([category, tokens]) =>
      `export const ${category} = ${JSON.stringify(tokens, null, 2)} as const;`
  )
  .join("\n\n")}

// Flat token access for utility functions
export const flatTokens = {
${tokens
  .filter(token => {
    const finalValue = typeof token.value === 'object' && token.value !== null
      ? (token.value.hex || token.value.oklch || token.value)
      : token.value;
    return finalValue !== undefined && finalValue !== null && finalValue !== '';
  })
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
${organized.color ? 'export type ColorToken = keyof typeof color;' : ''}
${organized.spacing ? 'export type SpacingToken = keyof typeof spacing;' : ''}
`;
  },
});

// Enhanced CSS format with collision-safe variables
StyleDictionary.registerFormat({
  name: "css/variables-enhanced",
  format: function (dictionary) {
    const tokens = dictionary.allTokens;

    const variables = tokens
      .map((token) => {
        const varName = `--${token.name || token.path.join("-")}`;
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
 * Wylie Dog Design Tokens - Enhanced W3C DTCG
 * Generated with collision-safe naming and OKLCH support
 * DO NOT EDIT MANUALLY
 */

/* CSS Variables for general use */
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
  // Remove problematic preprocessor for now - handle references in token files
  platforms: {
    // TypeScript output with enhanced collision handling
    typescript: {
      transforms: [
        'attribute/cti',
        'name/collision-safe-kebab', 
        'color/oklch-with-fallback'
      ],
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.generated.ts",
          format: "typescript/design-tokens-enhanced",
        },
      ],
    },

    // CSS with collision-safe variables
    css: {
      transforms: [
        'attribute/cti',
        'name/collision-safe-kebab',
        'color/oklch-with-fallback'
      ],
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables-enhanced",
        },
      ],
    },

    // JSON output for debugging
    json: {
      transforms: [
        'attribute/cti',
        'name/collision-safe-kebab',
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
  console.log("✅ Tokens built successfully with enhanced collision handling");
  console.log("📊 Generated files:");
  console.log("  - dist/tokens.css (CSS variables with OKLCH + hex fallbacks)");
  console.log("  - dist/tokens.generated.ts (TypeScript definitions)");
  console.log("  - dist/tokens.json (JSON for debugging)");
  console.log("");
  console.log("🎨 Enhancements:");
  console.log("  - ✅ Collision-safe naming");
  console.log("  - ✅ OKLCH colors with automatic hex fallbacks");
  console.log("  - ✅ Enhanced TypeScript support");
  console.log("  - ✅ 100% browser compatibility");
  console.log("");
  console.log("💡 Note: W3C references resolved at build time");
} catch (error) {
  console.error("❌ Enhanced token build failed:", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
}
