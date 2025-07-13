import { convertOklchToHex } from './color-utils.js';

function validateTokens() {
  const errors = [];
  const warnings = [];
  
  try {
    // Import tokens - use dynamic import since we're in ESM
    import('../dist/tokens.js').then(({ default: tokens }) => {
      // Validate color tokens
      validateColorTokens(tokens, errors);
      
      // Validate token references
      validateTokenReferences(tokens, errors);
      
      // Report results
      if (errors.length > 0) {
        console.error('❌ Token validation failed:');
        errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }
      
      if (warnings.length > 0) {
        console.warn('⚠️ Token validation warnings:');
        warnings.forEach(warning => console.warn(`  - ${warning}`));
      }
      
      console.log('✅ Token validation passed');
    });
  } catch (error) {
    console.error('❌ Failed to load tokens for validation:', error.message);
    process.exit(1);
  }
}

function validateColorTokens(tokens, errors) {
  const colorTokens = flattenTokens(tokens).filter(([path, value]) => 
    path.includes('color') && typeof value === 'string'
  );
  
  colorTokens.forEach(([path, value]) => {
    if (value.startsWith('oklch(')) {
      try {
        convertOklchToHex(value);
      } catch (error) {
        errors.push(`Invalid OKLCH color: ${path} - ${value}`);
      }
    }
  });
}

function validateTokenReferences(tokens, errors) {
  const allTokens = flattenTokens(tokens);
  
  allTokens.forEach(([path, value]) => {
    if (typeof value === 'string' && value.includes('{') && value.includes('}')) {
      const references = value.match(/\{([^}]+)\}/g);
      if (references) {
        references.forEach(ref => {
          const refPath = ref.slice(1, -1);
          if (!getTokenByPath(tokens, refPath)) {
            errors.push(`Broken reference: ${path} -> ${refPath}`);
          }
        });
      }
    }
  });
}

function flattenTokens(obj, prefix = '') {
  let result = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !value.value) {
      result = [...result, ...flattenTokens(value, path)];
    } else {
      result.push([path, value.value || value]);
    }
  }
  
  return result;
}

function getTokenByPath(tokens, path) {
  return path.split('.').reduce((obj, key) => obj?.[key], tokens);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateTokens();
}

export { validateTokens };
