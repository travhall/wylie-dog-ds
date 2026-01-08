import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

await register(StyleDictionary);

// Register format for semantic/component tokens (& primitives when included) in @theme
StyleDictionary.registerFormat({
  name: "css/semantic",
  format: function ({ dictionary, options }) {
    const themeVariables = [];
    const baseVariables = [];

    dictionary.allTokens.forEach((token) => {
      const cleanPath = token.path.filter((segment, index, arr) => {
        if (segment === "Color" && arr[index - 1] === "Color") return false;
        return true;
      });

      const name = cleanPath.join("-").toLowerCase();

      if (token.$type === "color") {
        const colorName = name.startsWith("color-") ? name.slice(6) : name;
        const semanticName = `--color-${colorName}`;
        const line = `  ${semanticName}: ${token.$value};`;
        themeVariables.push(line);
        baseVariables.push(`    ${semanticName}: ${token.$value};`);
      } else if (token.$type === "spacing") {
        const spacingName = `--spacing-${name}`;
        themeVariables.push(`  ${spacingName}: ${token.$value};`);
        baseVariables.push(`    ${spacingName}: ${token.$value};`);
      } else {
        const genericName = `--${name}`;
        themeVariables.push(`  ${genericName}: ${token.$value};`);
        baseVariables.push(`    ${genericName}: ${token.$value};`);
      }
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
    const hierarchical = {};

    dictionary.allTokens.forEach((token) => {
      const cleanPath = token.path.filter((segment, index, arr) => {
        if (segment === "Color" && arr[index - 1] === "Color") return false;
        return true;
      });

      if (token.$type === "color") {
        if (!hierarchical.color) hierarchical.color = {};

        // Handle dot notation like "color.gray.50" -> { gray: { 50: value } }
        if (cleanPath[0] === "color" && cleanPath[1] && cleanPath[2]) {
          const colorName = cleanPath[1].toLowerCase();
          const shade = cleanPath[2];

          if (!hierarchical.color[colorName]) {
            hierarchical.color[colorName] = {};
          }
          hierarchical.color[colorName][shade] = token.$value;
        }
        // Handle semantic colors like "color.primary.base" -> { primary: { base: value } }
        else if (cleanPath[0] === "color" && cleanPath[1]) {
          const colorName = cleanPath[1].toLowerCase();
          const shade = cleanPath[2] || "base";

          if (!hierarchical.color[colorName]) {
            hierarchical.color[colorName] = {};
          }
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

${Object.entries(hierarchical)
  .map(
    ([category, tokens]) =>
      `export const ${category} = ${JSON.stringify(tokens, null, 2)};`
  )
  .join("\n\n")}

// Empty shadow object for now
export const shadow = {};`;
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
      };

      const isPrimitive = token.filePath.includes("primitive");
      const isSemantic = token.filePath.includes("semantic");
      const isComponent = token.filePath.includes("component");

      if (isPrimitive) {
        if (token.$type === "color" && cleanPath[0] === "color" && cleanPath[1]) {
          const group = cleanPath[1].toLowerCase();
          const shade = cleanPath[2] || "base";
          if (!manifest.primitives.colors[group]) manifest.primitives.colors[group] = {};
          manifest.primitives.colors[group][shade] = tokenEntry;
        } else if (token.$type === "spacing") {
          manifest.primitives.spacing[name] = tokenEntry;
        } else if (name.startsWith("border-radius")) {
          manifest.primitives.borderRadius[name] = tokenEntry;
        } else if (name.startsWith("border-width")) {
          manifest.primitives.borderWidth[name] = tokenEntry;
        } else if (name.startsWith("typography")) {
          if (name.includes("family")) manifest.primitives.typography.family[name] = tokenEntry;
          else if (name.includes("size")) manifest.primitives.typography.size[name] = tokenEntry;
          else if (name.includes("weight")) manifest.primitives.typography.weight[name] = tokenEntry;
          else if (name.includes("line-height")) manifest.primitives.typography.lineHeight[name] = tokenEntry;
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
        if (!manifest.components[component]) manifest.components[component] = {};
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
