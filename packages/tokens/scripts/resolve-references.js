#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
import { convertOklchToHex } from './color-utils.js';

/**
 * Resolve W3C token references manually before Style Dictionary processing
 * This handles {color.blue.500} -> actual values
 */
async function resolveTokenReferences() {
  console.log('🔄 Resolving W3C token references...');

  try {
    // Load all token files
    const primitive = JSON.parse(await readFile('../src/primitive.json', 'utf-8'));
    const semantic = JSON.parse(await readFile('../src/semantic.json', 'utf-8')); 
    const component = JSON.parse(await readFile('../src/component.json', 'utf-8'));

    // Create a flat lookup map from primitive tokens
    const tokenLookup = {};
    flattenTokens(primitive, '', tokenLookup);
    flattenTokens(semantic, '', tokenLookup);
    
    console.log(`📋 Created lookup with ${Object.keys(tokenLookup).length} tokens`);

    // Resolve references in semantic tokens
    const resolvedSemantic = resolveReferences(semantic, tokenLookup);
    await writeFile('../src/semantic.resolved.json', JSON.stringify(resolvedSemantic, null, 2));

    // Re-add semantic tokens to lookup for component resolution
    flattenTokens(resolvedSemantic, '', tokenLookup);

    // Resolve references in component tokens  
    const resolvedComponent = resolveReferences(component, tokenLookup);
    await writeFile('../src/component.resolved.json', JSON.stringify(resolvedComponent, null, 2));

    console.log('✅ Token references resolved successfully');
    console.log('📁 Generated files:');
    console.log('  - src/semantic.resolved.json');
    console.log('  - src/component.resolved.json');

  } catch (error) {
    console.error('❌ Reference resolution failed:', error.message);
    process.exit(1);
  }
}

/**
 * Flatten token object into lookup map
 */
function flattenTokens(obj, prefix, lookup) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && value.$value !== undefined) {
      lookup[path] = value.$value;
    } else if (value && typeof value === 'object' && !value.$value) {
      flattenTokens(value, path, lookup);
    }
  }
}

/**
 * Recursively resolve token references
 */
function resolveReferences(obj, lookup) {
  if (Array.isArray(obj)) {
    return obj.map(item => resolveReferences(item, lookup));
  }
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const resolved = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$value' && typeof value === 'string' && value.includes('{') && value.includes('}')) {
      // Resolve reference
      const refMatch = value.match(/\{([^}]+)\}/);
      if (refMatch) {
        const refPath = refMatch[1];
        if (lookup[refPath]) {
          resolved[key] = lookup[refPath];
          console.log(`🔗 Resolved {${refPath}} → ${lookup[refPath]}`);
        } else {
          console.warn(`⚠️  Reference not found: {${refPath}}`);
          resolved[key] = value; // Keep original if not found
        }
      } else {
        resolved[key] = value;
      }
    } else if (typeof value === 'object') {
      resolved[key] = resolveReferences(value, lookup);
    } else {
      resolved[key] = value;
    }
  }
  
  return resolved;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resolveTokenReferences();
}

export { resolveTokenReferences };
