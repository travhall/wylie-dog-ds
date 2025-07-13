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
    return `@theme {\n${dictionary.allTokens.map(token => {
      const name = token.path.join('-');
      return `  --${name}: ${token.value};`;
    }).join('\n')}\n}`;
  }
});

await sd.buildAllPlatforms();
