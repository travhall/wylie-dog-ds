import { writeFile } from 'fs/promises';

// Process Variable Importer/Exporter format to Style Dictionary format
function processExport(exportData, mode = 'Light') {
  // Handle array wrapper
  const data = Array.isArray(exportData) ? exportData[0] : exportData;
  
  // Get the collection (primitive, semantic, or component)
  const collectionName = Object.keys(data)[0];
  const collection = data[collectionName];
  
  // Extract tokens from the specified mode
  const tokens = collection.modes[mode] || collection.modes.Value || collection.modes;
  
  return processTokens(tokens);
}

function processTokens(obj) {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value.$type && value.$value !== undefined) {
      // This is a token
      result[key] = {
        $type: mapType(value.$type),
        $value: value.$value,
        $description: value.$description || ''
      };
    } else {
      // This is a group, recurse
      result[key] = processTokens(value);
    }
  }
  
  return result;
}

function mapType(type) {
  const typeMap = {
    'float': 'dimension',
    'string': 'string', // Will handle specific cases in processing
    'color': 'color'
  };
  return typeMap[type] || type;
}

// Process all exports
async function processAllExports() {
  try {
    // Import the export files
    const primitiveData = await import('../exports/primitive-export.json', { assert: { type: 'json' } });
    const semanticData = await import('../exports/semantic-export.json', { assert: { type: 'json' } });
    const componentData = await import('../exports/component-export.json', { assert: { type: 'json' } });
    
    // Process primitive (no modes, just Value)
    const primitive = processExport(primitiveData.default, 'Value');
    
    // Process semantic for Light mode
    const semanticLight = processExport(semanticData.default, 'Light');
    
    // Process semantic for Dark mode  
    const semanticDark = processExport(semanticData.default, 'Dark');
    
    // Process component for Light mode
    const componentLight = processExport(componentData.default, 'Light');
    
    // Write processed files
    await writeFile('src/primitive.json', JSON.stringify(primitive, null, 2));
    await writeFile('src/semantic.json', JSON.stringify(semanticLight, null, 2));
    await writeFile('src/semantic-dark.json', JSON.stringify(semanticDark, null, 2));
    await writeFile('src/component.json', JSON.stringify(componentLight, null, 2));
    
    console.log('✅ Processed all token exports');
    
  } catch (error) {
    console.error('❌ Error processing exports:', error.message);
    process.exit(1);
  }
}

processAllExports();
