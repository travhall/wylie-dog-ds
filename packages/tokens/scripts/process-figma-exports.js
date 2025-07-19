import { readFile, writeFile } from 'fs/promises';
import { convertHexToOklch } from './color-utils.js';

async function processExports() {
  try {
    // Read primitive and process  
    const primitive = JSON.parse(await readFile('figma-exports/primitive.json', 'utf8'));
    const primitiveTokens = primitive[0].primitive.modes.Value;
    await writeFile('src/primitive.json', JSON.stringify(flattenTokens(primitiveTokens), null, 2));
    
    // Read semantic and process BOTH modes - create separate files
    const semantic = JSON.parse(await readFile('figma-exports/semantic.json', 'utf8'));
    const semanticModes = semantic[0].semantic.modes;
    
    await writeFile('src/semantic-light.json', JSON.stringify(flattenTokens(semanticModes.Light), null, 2));
    await writeFile('src/semantic-dark.json', JSON.stringify(flattenTokens(semanticModes.Dark), null, 2));
    
    // Read component and process BOTH modes - create separate files
    const component = JSON.parse(await readFile('figma-exports/component.json', 'utf8'));
    const componentModes = component[0].component.modes;
    
    await writeFile('src/component-light.json', JSON.stringify(flattenTokens(componentModes.Light), null, 2));
    await writeFile('src/component-dark.json', JSON.stringify(flattenTokens(componentModes.Dark), null, 2));
    
    console.log('✅ Processed all exports with both light and dark modes');
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
