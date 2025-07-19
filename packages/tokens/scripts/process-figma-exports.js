import { readFile, writeFile } from 'fs/promises';
import { convertHexToOklch } from './color-utils.js';

async function processExports() {
  try {
    // Read primitive and process  
    const primitive = JSON.parse(await readFile('figma-exports/primitive.json', 'utf8'));
    const primitiveTokens = primitive[0].primitive.modes.Value;
    await writeFile('src/primitive.json', JSON.stringify(flattenTokens(primitiveTokens), null, 2));
    
    // Read semantic and process both light and dark
    const semantic = JSON.parse(await readFile('figma-exports/semantic.json', 'utf8'));
    const semanticLight = semantic[0].semantic.modes.Light;
    await writeFile('src/semantic.json', JSON.stringify(flattenTokens(semanticLight), null, 2));
    
    // Read component and process
    const component = JSON.parse(await readFile('figma-exports/component.json', 'utf8'));
    const componentLight = component[0].component.modes.Light;
    await writeFile('src/component.json', JSON.stringify(flattenTokens(componentLight), null, 2));
    
    console.log('✅ Processed all exports');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function flattenTokens(obj) {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value.$type && value.$value !== undefined) {
      result[key] = {
        $type: value.$type === 'float' ? 'dimension' : value.$type,
        $value: value.$type === 'color' ? convertHexToOklch(value.$value) : value.$value
      };
    } else {
      result[key] = flattenTokens(value);
    }
  }
  
  return result;
}

processExports();
