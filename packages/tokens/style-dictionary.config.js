import StyleDictionary from 'style-dictionary';

// Register Tailwind 4 @theme format
StyleDictionary.registerFormat({
  name: 'css/tailwind-theme',
  format: function({ dictionary }) {
    const variables = [];
    
    dictionary.allTokens.forEach(token => {
      const name = token.path.join('-');
      
      if (token.$type === 'color') {
        variables.push(`  --color-${name}: ${token.$value};`);
      } else if (token.$type === 'spacing') {
        variables.push(`  --spacing-${name}: ${token.$value};`);
      } else if (token.$type === 'fontSize') {
        variables.push(`  --font-size-${name}: ${token.$value};`);
      } else if (token.$type === 'fontWeight') {
        variables.push(`  --font-weight-${name}: ${token.$value};`);
      } else if (token.$type === 'fontFamily') {
        const families = Array.isArray(token.$value) ? token.$value.join(', ') : token.$value;
        variables.push(`  --font-family-${name}: ${families};`);
      } else if (token.$type === 'borderRadius') {
        variables.push(`  --radius-${name}: ${token.$value};`);
      } else if (token.$type === 'boxShadow') {
        variables.push(`  --shadow-${name}: ${token.$value};`);
      } else if (token.$type === 'blur') {
        variables.push(`  --blur-${name}: ${token.$value};`);
      } else if (token.$type === 'duration') {
        variables.push(`  --duration-${name}: ${token.$value};`);
      } else if (token.$type === 'cubicBezier') {
        variables.push(`  --ease-${name}: ${token.$value};`);
      } else {
        variables.push(`  --${name}: ${token.$value};`);
      }
    });
    
    return `@theme {\n${variables.join('\n')}\n}`;
  }
});

// Style Dictionary configuration
const sd = new StyleDictionary({
  source: [
    'src/primitive.json',
    'src/semantic.json', 
    'src/component.json'
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.css',
        format: 'css/tailwind-theme'
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.generated.ts',
        format: 'javascript/es6'
      }]
    }
  }
});

// Build tokens
await sd.buildAllPlatforms();

console.log('✅ Built design tokens for Tailwind 4');
