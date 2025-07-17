import StyleDictionary from "style-dictionary";
import { convertOklchToHex, isValidOklch } from './scripts/color-utils.js';

// Debug: Let's see what tokens look like before transformation
StyleDictionary.registerTransform({
  name: 'debug/log-tokens',
  type: 'value',
  filter: (token) => token.name === 'color-blue-500',
  transform: (token) => {
    console.log('🐛 Debug token color-blue-500:', {
      name: token.name,
      value: token.value,
      original: token.original,
      path: token.path
    });
    return token.value;
  }
});

// Register OKLCH transform with accurate hex fallbacks
StyleDictionary.registerTransform({
  name: 'color/oklch-with-fallback',
  type: 'value',
  filter: (token) => token.$type === 'color',
  transform: (token) => {
    const oklchValue = token.$value || token.value;
    console.log(`🎨 Processing color token ${token.name}: ${oklchValue}`);
    
    if (isValidOklch(oklchValue)) {
      const hexFallback = convertOklchToHex(oklchValue);
      console.log(`✅ Converted ${oklchValue} → ${hexFallback}`);
      return {
        oklch: oklchValue,
        hex: hexFallback
      };
    }
    console.log(`⚠️ Not OKLCH format: ${oklchValue}`);
    return oklchValue;
  }
});

// Simple CSS format for debugging
StyleDictionary.registerFormat({
  name: "css/debug",
  format: function (dictionary) {
    console.log(`🔍 Dictionary has ${dictionary.allTokens.length} tokens`);
    
    const sampleTokens = dictionary.allTokens.slice(0, 5);
    console.log('🔍 Sample tokens:', sampleTokens.map(t => ({
      name: t.name,
      value: t.value,
      type: t.$type,
      path: t.path
    })));
    
    const variables = dictionary.allTokens
      .map((token) => {
        const varName = `--${token.path.join("-")}`;
        const value = token.value;
        
        let finalValue;
        if (typeof value === 'object' && value !== null) {
          finalValue = value.hex || value.oklch || JSON.stringify(value);
        } else {
          finalValue = value || 'undefined';
        }
        
        return `  ${varName}: ${finalValue};`;
      })
      .join("\n");

    return `:root {\n${variables}\n}`;
  },
});

// Test configuration with simpler transforms
const sd = new StyleDictionary({
  source: ["src/**/*.json"],
  log: {
    verbosity: 'verbose'
  },
  platforms: {
    css: {
      transforms: [
        'attribute/cti',
        'name/kebab',
        'debug/log-tokens',
        'color/oklch-with-fallback'
      ],
      buildPath: "dist/",
      files: [
        {
          destination: "debug.css",
          format: "css/debug",
        },
      ],
    },
  },
});

// Build with debugging
try {
  await sd.buildAllPlatforms();
  console.log("✅ Debug build completed");
} catch (error) {
  console.error("❌ Debug build failed:", error.message);
  process.exit(1);
}
