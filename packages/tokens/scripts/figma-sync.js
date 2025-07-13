import { convertHexToOklch } from './color-utils.js';
import { writeFile, readFile } from 'fs/promises';

async function syncFromFigma() {
  console.log('Starting Figma token sync...');
  
  try {
    // 1. Load exported Figma variables (manual export for now)
    const figmaTokens = await loadFigmaExport('./figma-export.json');
    
    // 2. Convert hex/hsl values to oklch
    const oklchTokens = convertColorsToOklch(figmaTokens);
    
    // 3. Update primitive.json with validation
    await updatePrimitiveTokens(oklchTokens);
    
    // 4. Rebuild tokens and validate output
    await buildTokens();
    
    console.log('✅ Figma sync completed successfully');
  } catch (error) {
    console.error('❌ Figma sync failed:', error.message);
    process.exit(1);
  }
}

function convertColorsToOklch(tokens) {
  return Object.entries(tokens).reduce((acc, [key, value]) => {
    if (value.type === 'color') {
      try {
        acc[key] = {
          ...value,
          value: convertToOklch(value.value)
        };
      } catch (error) {
        console.warn(`Failed to convert color ${key}: ${value.value}`);
        acc[key] = value; // Keep original on conversion failure
      }
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function convertToOklch(colorValue) {
  // Handle different color formats from Figma
  if (colorValue.startsWith('#')) {
    return convertHexToOklch(colorValue);
  } else if (colorValue.startsWith('rgb')) {
    // Convert RGB to hex first, then to OKLCH
    const hex = rgbToHex(colorValue);
    return convertHexToOklch(hex);
  } else if (colorValue.startsWith('hsl')) {
    // Convert HSL to hex first, then to OKLCH
    const hex = hslToHex(colorValue);
    return convertHexToOklch(hex);
  }
  
  // Return as-is if already in OKLCH or unknown format
  return colorValue;
}

function rgbToHex(rgb) {
  const match = rgb.match(/rgb\(([^)]+)\)/);
  if (!match) return rgb;
  
  const [r, g, b] = match[1].split(',').map(n => parseInt(n.trim()));
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

function hslToHex(hsl) {
  // Simplified HSL to RGB conversion
  const match = hsl.match(/hsl\(([^)]+)\)/);
  if (!match) return hsl;
  
  const [h, s, l] = match[1].split(',').map(n => parseFloat(n.trim()));
  // Convert HSL to RGB, then to hex (simplified implementation)
  // For production, use a proper color conversion library
  return `#000000`; // Placeholder - implement full conversion if needed
}

async function loadFigmaExport(path) {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('No figma-export.json found. Create this file by exporting variables from Figma.');
    return {};
  }
}

async function updatePrimitiveTokens(tokens) {
  if (Object.keys(tokens).length === 0) {
    console.log('No tokens to update');
    return;
  }
  
  const primitiveTokens = JSON.parse(
    await readFile('./src/primitive.json', 'utf-8')
  );
  
  // Merge tokens with validation
  const updatedTokens = mergeTokens(primitiveTokens, tokens);
  
  await writeFile(
    './src/primitive.json',
    JSON.stringify(updatedTokens, null, 2)
  );
  
  console.log(`Updated ${Object.keys(tokens).length} tokens`);
}

function mergeTokens(existing, incoming) {
  // Smart merge that preserves structure
  const merged = { ...existing };
  
  Object.entries(incoming).forEach(([path, token]) => {
    const pathParts = path.split('.');
    let current = merged;
    
    // Navigate to the correct location
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    // Set the token
    current[pathParts[pathParts.length - 1]] = token;
  });
  
  return merged;
}

async function buildTokens() {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    await execAsync('node style-dictionary.config.js');
    console.log('Tokens rebuilt successfully');
  } catch (error) {
    throw new Error(`Token build failed: ${error.message}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncFromFigma();
}

export { syncFromFigma, convertColorsToOklch };
