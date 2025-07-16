import StyleDictionary from "style-dictionary";

// Register comprehensive TypeScript format
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
      current[rest[rest.length - 1]] = token.value;

      return acc;
    }, {});

    return `// Auto-generated design tokens
// DO NOT EDIT MANUALLY

${Object.entries(organized)
  .map(
    ([category, tokens]) =>
      `export const ${category} = ${JSON.stringify(tokens, null, 2)} as const;`
  )
  .join("\n\n")}

// Flat token access for utility functions  
export const flatTokens = {
${tokens
  .map((token) => `  '${token.path.join("-")}': '${token.value}'`)
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
`;
  },
});

// Register CSS format with dual output for Storybook + Tailwind v4
StyleDictionary.registerFormat({
  name: "css/dual-output",
  format: function (dictionary) {
    const tokens = dictionary.allTokens;

    const variables = tokens
      .map((token) => {
        const varName = `--${token.path.join("-")}`;
        const value = token.value;
        return `  ${varName}: ${value};`;
      })
      .join("\n");

    return `/* CSS Variables for Storybook and general use */
:root {
${variables}
}

/* Tailwind v4 Theme Variables */
@theme {
${variables}
}`;
  },
});

// Filter functions to avoid collisions
StyleDictionary.registerFilter({
  name: "primitive-tokens",
  filter: (token) => token.filePath.includes("primitive.json"),
});

StyleDictionary.registerFilter({
  name: "semantic-tokens",
  filter: (token) => token.filePath.includes("semantic.json"),
});

StyleDictionary.registerFilter({
  name: "component-tokens",
  filter: (token) => token.filePath.includes("component.json"),
});

const sd = new StyleDictionary({
  source: ["src/**/*.json"],
  platforms: {
    // Comprehensive TypeScript output
    typescript: {
      transformGroup: "js",
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.generated.ts",
          format: "typescript/design-tokens",
        },
      ],
    },

    // CSS with dual output: :root for Storybook + @theme for Tailwind v4
    css: {
      transformGroup: "css",
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.css",
          format: "css/dual-output",
        },
      ],
    },

    // Separate outputs to debug collisions
    // debug: {
    //   transformGroup: "js",
    //   buildPath: "debug/",
    //   files: [
    //     {
    //       destination: "primitive.json",
    //       format: "json",
    //       filter: "primitive-tokens",
    //     },
    //     {
    //       destination: "semantic.json",
    //       format: "json",
    //       filter: "semantic-tokens",
    //     },
    //     {
    //       destination: "component.json",
    //       format: "json",
    //       filter: "component-tokens",
    //     },
    //   ],
    // },
  },
});

// Build with error handling
try {
  await sd.buildAllPlatforms();
  console.log("✅ Tokens built successfully");
} catch (error) {
  console.error("❌ Token build failed:", error.message);
  process.exit(1);
}
