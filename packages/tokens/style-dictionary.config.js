import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

await register(StyleDictionary);

// Register CSS format with both light and dark modes
StyleDictionary.registerFormat({
  name: "css/tailwind-theme-modes",
  format: function ({ dictionary, options }) {
    const variables = [];

    dictionary.allTokens.forEach((token) => {
      const cleanPath = token.path.filter((segment, index, arr) => {
        if (segment === "Color" && arr[index - 1] === "Color") return false;
        return true;
      });
      
      const name = cleanPath.join("-").toLowerCase();

      if (token.$type === "color") {
        const colorName = name.startsWith("color-") ? name.slice(6) : name;
        variables.push(`  --color-${colorName}: ${token.$value};`);
      } else if (token.$type === "spacing") {
        variables.push(`  --spacing-${name}: ${token.$value};`);
      } else {
        variables.push(`  --${name}: ${token.$value};`);
      }
    });

    const selector = options.mode === 'dark' ? '.dark' : '@theme';
    const prefix = options.mode === 'dark' ? '.dark {\n' : '@theme {\n';
    
    return `${prefix}${variables.join("\n")}\n}`;
  },
});

// Register hierarchical JS format for Storybook
StyleDictionary.registerFormat({
  name: "javascript/hierarchical",
  format: function ({ dictionary }) {
    const hierarchical = {};

    dictionary.allTokens.forEach((token) => {
      const cleanPath = token.path.filter((segment, index, arr) => {
        if (segment === "Color" && arr[index - 1] === "Color") return false;
        return true;
      });

      if (token.$type === "color" && cleanPath[0] === "Color") {
        if (!hierarchical.color) hierarchical.color = {};
        const colorName = cleanPath[1]?.toLowerCase();
        const shade = cleanPath[2];
        
        if (colorName && shade) {
          if (!hierarchical.color[colorName]) hierarchical.color[colorName] = {};
          hierarchical.color[colorName][shade] = token.$value;
        }
      } else if (token.$type === "dimension" && cleanPath[0] === "Spacing") {
        if (!hierarchical.spacing) hierarchical.spacing = {};
        const key = cleanPath[1];
        if (key) {
          hierarchical.spacing[key] = token.$value;
        }
      } else if (token.$type === "boxShadow" && cleanPath[0] === "Shadow") {
        if (!hierarchical.shadow) hierarchical.shadow = {};
        const key = cleanPath[1]?.toLowerCase();
        if (key) {
          hierarchical.shadow[key] = token.$value;
        }
      } else if (token.$type === "spacing") {
        if (!hierarchical.spacing) hierarchical.spacing = {};
        const key = cleanPath.join("-").toLowerCase();
        hierarchical.spacing[key] = token.$value;
      } else if (token.$type === "boxShadow") {
        if (!hierarchical.shadow) hierarchical.shadow = {};
        const key = cleanPath.join("-").toLowerCase();
        hierarchical.shadow[key] = token.$value;
      }
    });

    return `/**
 * Do not edit directly, this file was auto-generated.
 */

${Object.entries(hierarchical).map(([category, tokens]) => 
  `export const ${category} = ${JSON.stringify(tokens, null, 2)};`
).join('\n\n')}

// Empty shadow object for now
export const shadow = {};`;
  },
});

// Build light mode
const lightSd = new StyleDictionary({
  source: ["src/primitive.json", "src/semantic-light.json", "src/component-light.json"],
  platforms: {
    css: {
      transformGroup: "tokens-studio",
      buildPath: "dist/",
      options: { mode: 'light' },
      files: [{
        destination: "tokens.css",
        format: "css/tailwind-theme-modes",
      }],
    },
    js: {
      transformGroup: "tokens-studio",
      buildPath: "dist/",
      files: [{
        destination: "tokens.generated.ts",
        format: "javascript/es6",
      }, {
        destination: "tokens.hierarchical.ts",
        format: "javascript/hierarchical",
      }],
    },
  },
});

// Build dark mode - include primitives for reference resolution but filter output
const darkSd = new StyleDictionary({
  source: ["src/primitive.json", "src/semantic-dark.json", "src/component-dark.json"],
  platforms: {
    css: {
      transformGroup: "tokens-studio",
      buildPath: "dist/",
      options: { mode: 'dark' },
      files: [{
        destination: "tokens-dark.css",
        format: "css/tailwind-theme-modes",
        filter: (token) => {
          // Only output semantic/component tokens, not primitives
          return token.filePath.includes('semantic') || token.filePath.includes('component');
        }
      }],
    },
  },
});

// Build both modes
await lightSd.buildAllPlatforms();
await darkSd.buildAllPlatforms();

// Combine CSS files
import { readFile, writeFile } from 'fs/promises';
const lightCSS = await readFile('dist/tokens.css', 'utf8');
const darkCSS = await readFile('dist/tokens-dark.css', 'utf8');
await writeFile('dist/tokens.css', `${lightCSS}\n\n${darkCSS}`);

console.log("✅ Built design tokens with light and dark modes");
