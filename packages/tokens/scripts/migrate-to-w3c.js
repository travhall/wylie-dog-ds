#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const TOKEN_FILES = [
  'src/primitive.json',
  'src/semantic.json', 
  'src/component.json'
];

/**
 * Convert legacy token format to W3C DTCG format
 * Changes: value -> $value, type -> $type, adds $description
 */
function convertTokensToW3C(tokens, filename = '') {
  if (Array.isArray(tokens)) {
    return tokens.map(token => convertTokensToW3C(token, filename));
  }
  
  if (typeof tokens !== 'object' || tokens === null) {
    return tokens;
  }
  
  const converted = {};
  
  for (const [key, value] of Object.entries(tokens)) {
    // If this is a token object with value/type
    if (value && typeof value === 'object' && ('value' in value || 'type' in value)) {
      converted[key] = {
        ...(value.value !== undefined && { $value: value.value }),
        ...(value.type !== undefined && { $type: value.type }),
        $description: generateDescription(key, value, filename)
      };
    } else {
      // Recursively convert nested objects
      converted[key] = convertTokensToW3C(value, filename);
    }
  }
  
  return converted;
}

/**
 * Generate appropriate description based on token context
 */
function generateDescription(key, token, filename) {
  const isPrimitive = filename.includes('primitive');
  const isSemantic = filename.includes('semantic');
  const isComponent = filename.includes('component');
  
  // For primitive tokens
  if (isPrimitive) {
    if (token.type === 'color') {
      return `${key} color from the base palette`;
    }
    if (token.type === 'spacing') {
      return `Base spacing value: ${token.value}`;
    }
    if (token.type === 'fontSize') {
      return `Base font size: ${token.value}`;
    }
    if (token.type === 'borderRadius') {
      return `Base border radius: ${token.value}`;
    }
    return `Base ${token.type} token`;
  }
  
  // For semantic tokens
  if (isSemantic) {
    if (token.type === 'color') {
      if (key.includes('primary')) return `Primary brand color - ${key}`;
      if (key.includes('success')) return `Success state color - ${key}`;
      if (key.includes('error')) return `Error state color - ${key}`;
      if (key.includes('warning')) return `Warning state color - ${key}`;
      if (key.includes('neutral')) return `Neutral color - ${key}`;
      return `Semantic color token - ${key}`;
    }
    if (token.type === 'spacing') {
      return `Semantic spacing - ${key}`;
    }
    return `Semantic ${token.type} token`;
  }
  
  // For component tokens
  if (isComponent) {
    return `Component-specific ${token.type} token`;
  }
  
  return `Design token - ${key}`;
}

/**
 * Main migration function
 */
async function migrateToW3C() {
  console.log('🔄 Starting W3C DTCG format migration...');
  
  try {
    for (const file of TOKEN_FILES) {
      console.log(`📝 Converting ${file}...`);
      
      // Read current file
      const content = await readFile(file, 'utf-8');
      const tokens = JSON.parse(content);
      
      // Convert to W3C format
      const converted = convertTokensToW3C(tokens, file);
      
      // Write back with proper formatting
      await writeFile(file, JSON.stringify(converted, null, 2) + '\n');
      
      console.log(`✅ Converted ${file}`);
    }
    
    console.log('🎉 W3C DTCG migration completed successfully!');
    console.log('');
    console.log('Changes made:');
    console.log('- "value" → "$value"');
    console.log('- "type" → "$type"');
    console.log('- Added "$description" fields');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update Style Dictionary config for W3C format');
    console.log('2. Test token build: pnpm run build');
    console.log('3. Verify generated output');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToW3C();
}

export { migrateToW3C, convertTokensToW3C };
