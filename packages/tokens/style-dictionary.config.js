import StyleDictionary from 'style-dictionary';

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

// Custom format for Tailwind 4.x @theme directive
sd.registerFormat({
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

await sd.buildAllPlatforms();
