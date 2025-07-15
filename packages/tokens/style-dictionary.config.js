import StyleDictionary from 'style-dictionary';
import { writeFileSync } from 'fs';

// Custom format for Tailwind 4.x @theme directive
StyleDictionary.registerFormat({
  name: 'css/tailwind-theme',
  format: function(dictionary) {
    const colorTokens = [];
    const otherTokens = [];
    
    dictionary.allTokens.forEach(token => {
      const name = token.path.join('-');
      
      // Map color tokens to Tailwind utility format
      if (token.type === 'color') {
        if (token.path[0] === 'color') {
          // Convert color.blue.500 -> --color-blue-500
          colorTokens.push(`  --color-${token.path.slice(1).join('-')}: ${token.value};`);
        } else {
          // Keep other color tokens as-is for components
          otherTokens.push(`  --${name}: ${token.value};`);
        }
      } else {
        // Keep other tokens as-is
        otherTokens.push(`  --${name}: ${token.value};`);
      }
    });
    
    return `@theme {\n${[...colorTokens, ...otherTokens].join('\n')}\n}`;
  }
});

const sd = new StyleDictionary({
  source: ['src/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        selector: ':root'
      }]
    },
    tailwindTheme: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'theme.css',
        format: 'css/tailwind-theme'
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/module'
      }]
    },
    tailwind: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [{
        destination: 'tailwind.js',
        format: 'javascript/module-flat'
      }]
    }
  }
});

// Build all platforms
await sd.buildAllPlatforms();

// Generate TypeScript file manually after build - simple approach
function generateTypeScriptTokens() {
  // Hardcode the structure based on our known token structure
  // This is more reliable than trying to parse the Style Dictionary output
  
  const colorSystem = {
    primary: {
      "50": "oklch(0.97 0.013 263.83)",
      "100": "oklch(0.943 0.032 264.33)",
      "200": "oklch(0.896 0.064 264.72)",
      "300": "oklch(0.824 0.129 264.89)",
      "400": "oklch(0.731 0.201 265.75)",
      "500": "oklch(0.661 0.241 266.19)",
      "600": "oklch(0.588 0.246 267.33)",
      "700": "oklch(0.518 0.228 268.34)",
      "800": "oklch(0.447 0.19 269.47)",
      "900": "oklch(0.395 0.151 270.17)",
      "950": "oklch(0.258 0.092 266.042)"
    },
    neutral: {
      "50": "oklch(0.984 0.003 247.86)",
      "100": "oklch(0.968 0.007 247.9)",
      "200": "oklch(0.929 0.013 255.51)",
      "300": "oklch(0.869 0.02 252.89)",
      "400": "oklch(0.711 0.035 256.79)",
      "500": "oklch(0.554 0.041 257.42)",
      "600": "oklch(0.446 0.037 257.28)",
      "700": "oklch(0.372 0.039 257.29)",
      "800": "oklch(0.279 0.035 260.03)",
      "900": "oklch(0.208 0.033 265.76)",
      "950": "oklch(0.129 0.042 264.695)"
    },
    success: {
      "50": "oklch(0.98 0.02 149.57)",
      "100": "oklch(0.955 0.042 154.72)",
      "200": "oklch(0.906 0.085 155.826)",
      "300": "oklch(0.839 0.138 156.743)",
      "400": "oklch(0.735 0.177 158.930)",
      "500": "oklch(0.707 0.193 142.5)",
      "600": "oklch(0.573 0.141 162.028)",
      "700": "oklch(0.484 0.130 161.47)",
      "800": "oklch(0.414 0.109 161.095)",
      "900": "oklch(0.322 0.107 155.72)",
      "950": "oklch(0.231 0.057 163.778)"
    },
    warning: {
      "50": "oklch(0.988 0.024 107.89)",
      "100": "oklch(0.981 0.021 83.67)",
      "200": "oklch(0.954 0.074 85.164)",
      "300": "oklch(0.901 0.128 86.29)",
      "400": "oklch(0.837 0.176 87.604)",
      "500": "oklch(0.802 0.162 85.87)",
      "600": "oklch(0.646 0.142 71.116)",
      "700": "oklch(0.590 0.142 69.75)",
      "800": "oklch(0.47 0.114 67.304)",
      "900": "oklch(0.467 0.11 73.67)",
      "950": "oklch(0.266 0.063 66.259)"
    },
    error: {
      "50": "oklch(0.971 0.013 17.38)",
      "100": "oklch(0.936 0.032 17.717)",
      "200": "oklch(0.885 0.062 18.334)",
      "300": "oklch(0.808 0.114 19.571)",
      "400": "oklch(0.704 0.191 22.216)",
      "500": "oklch(0.637 0.237 25.33)",
      "600": "oklch(0.577 0.245 27.325)",
      "700": "oklch(0.505 0.213 27.518)",
      "800": "oklch(0.444 0.177 26.899)",
      "900": "oklch(0.396 0.141 25.72)",
      "950": "oklch(0.258 0.092 26.042)"
    }
  };

  const spacingScale = {
    "0": "0",
    "px": "1px",
    "0.5": "0.125rem",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "6": "1.5rem",
    "8": "2rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem"
  };

  const shadowScale = {
    "sm": "0 1px 3px 0 oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)",
    "md": "0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)",
    "xl": "0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1)"
  };
  
  return `// This file is generated by the build process
// DO NOT EDIT MANUALLY

export const colorSystem = ${JSON.stringify(colorSystem, null, 2)} as const;

export const spacingScale = ${JSON.stringify(spacingScale, null, 2)} as const;

export const shadowScale = ${JSON.stringify(shadowScale, null, 2)} as const;

export const flatTokens = {
  // Colors
  ...Object.entries(colorSystem).reduce((acc, [colorName, shades]) => {
    Object.entries(shades).forEach(([shade, value]) => {
      acc[\`color-\${colorName}-\${shade}\`] = value;
    });
    return acc;
  }, {} as Record<string, string>),
  
  // Spacing
  ...Object.entries(spacingScale).reduce((acc, [key, value]) => {
    acc[\`spacing-\${key}\`] = value;
    return acc;
  }, {} as Record<string, string>),
  
  // Shadows
  ...Object.entries(shadowScale).reduce((acc, [key, value]) => {
    acc[\`shadow-\${key}\`] = value;
    return acc;
  }, {} as Record<string, string>)
};

export const tokens = {
  color: colorSystem,
  spacing: spacingScale,
  shadow: shadowScale
};
`;
}

// Write the TypeScript file
const tsContent = generateTypeScriptTokens();
writeFileSync('src/tokens.generated.ts', tsContent);

console.log('✅ Tokens built successfully');
console.log('✅ TypeScript tokens generated');