import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

// Register tokens-studio transforms for better reference resolution
await register(StyleDictionary);

// Register Tailwind 4 @theme format with improved naming
StyleDictionary.registerFormat({
  name: "css/tailwind-theme",
  format: function ({ dictionary }) {
    const variables = [];

    dictionary.allTokens.forEach((token) => {
      // Clean up token path to avoid duplicated prefixes
      const cleanPath = token.path.filter((segment, index, arr) => {
        // Remove duplicate "Color" prefixes and normalize casing
        if (segment === "Color" && arr[index - 1] === "Color") return false;
        return true;
      });
      
      const name = cleanPath.join("-").toLowerCase();

      if (token.$type === "color") {
        // Remove "color-" prefix if path already starts with "color"
        const colorName = name.startsWith("color-") ? name.slice(6) : name;
        variables.push(`  --color-${colorName}: ${token.$value};`);
      } else if (token.$type === "spacing") {
        variables.push(`  --spacing-${name}: ${token.$value};`);
      } else if (token.$type === "fontSize") {
        variables.push(`  --font-size-${name}: ${token.$value};`);
      } else if (token.$type === "fontWeight") {
        variables.push(`  --font-weight-${name}: ${token.$value};`);
      } else if (token.$type === "fontFamily") {
        const families = Array.isArray(token.$value)
          ? token.$value.join(", ")
          : token.$value;
        variables.push(`  --font-family-${name}: ${families};`);
      } else if (token.$type === "borderRadius") {
        variables.push(`  --radius-${name}: ${token.$value};`);
      } else if (token.$type === "boxShadow") {
        variables.push(`  --shadow-${name}: ${token.$value};`);
      } else if (token.$type === "blur") {
        variables.push(`  --blur-${name}: ${token.$value};`);
      } else if (token.$type === "duration") {
        variables.push(`  --duration-${name}: ${token.$value};`);
      } else if (token.$type === "cubicBezier") {
        variables.push(`  --ease-${name}: ${token.$value};`);
      } else {
        variables.push(`  --${name}: ${token.$value};`);
      }
    });

    return `@theme {\n${variables.join("\n")}\n}`;
  },
});

// Style Dictionary configuration with tokens-studio transforms
const sd = new StyleDictionary({
  source: ["src/primitive.json", "src/semantic.json", "src/component.json"],
  platforms: {
    css: {
      transformGroup: "tokens-studio", // Use tokens-studio transform group
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.css",
          format: "css/tailwind-theme",
        },
      ],
    },
    js: {
      transformGroup: "tokens-studio", // Use tokens-studio transform group
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.generated.ts",
          format: "javascript/es6",
        },
      ],
    },
  },
});

// Build tokens
await sd.buildAllPlatforms();

console.log("✅ Built design tokens for Tailwind 4");
