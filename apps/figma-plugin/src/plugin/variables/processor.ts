// Token processing utilities for Figma Variables to W3C DTCG format conversion

export interface ProcessedToken {
  $type: string;
  $value: any;
  $description?: string;
}

export interface ProcessedCollection {
  [tokenName: string]: ProcessedToken;
}

export interface ExportData {
  [collectionName: string]: ProcessedCollection;
}

/**
 * Convert Figma RGB color (0-1 range) to hex format
 */
function rgbToHex(color: { r: number; g: number; b: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Process a single variable into W3C DTCG token format
 */
function processVariable(variable: any, mode: any): ProcessedToken {
  const value = variable.valuesByMode[mode.modeId];
  
  // Handle variable references/aliases
  if (typeof value === 'object' && value.type === 'VARIABLE_ALIAS') {
    return {
      $type: getTokenType(variable.resolvedType),
      $value: `{variables.${value.id}}`, // Reference syntax
      $description: variable.description || undefined
    };
  }
  
  // Process different variable types
  switch (variable.resolvedType) {
    case 'COLOR':
      return {
        $type: 'color',
        $value: rgbToHex(value),
        $description: variable.description || undefined
      };
      
    case 'FLOAT':
      // Determine if this is spacing, font size, etc. based on scopes
      const tokenType = inferTokenTypeFromScopes(variable.scopes);
      const unit = getUnitForTokenType(tokenType);
      
      return {
        $type: tokenType,
        $value: `${value}${unit}`,
        $description: variable.description || undefined
      };
      
    case 'STRING':
      return {
        $type: 'fontFamily', // Common string use case, could be refined
        $value: value,
        $description: variable.description || undefined
      };
      
    case 'BOOLEAN':
      return {
        $type: 'boolean',
        $value: value,
        $description: variable.description || undefined
      };
      
    default:
      return {
        $type: 'other',
        $value: value,
        $description: variable.description || undefined
      };
  }
}

/**
 * Map Figma variable types to W3C DTCG token types
 */
function getTokenType(figmaType: string): string {
  switch (figmaType) {
    case 'COLOR': return 'color';
    case 'FLOAT': return 'dimension';
    case 'STRING': return 'fontFamily';
    case 'BOOLEAN': return 'boolean';
    default: return 'other';
  }
}

/**
 * Infer semantic token type from Figma variable scopes
 */
function inferTokenTypeFromScopes(scopes: string[]): string {
  if (scopes.includes('FONT_SIZE')) return 'fontSize';
  if (scopes.includes('LINE_HEIGHT')) return 'lineHeight';
  if (scopes.includes('LETTER_SPACING')) return 'letterSpacing';
  if (scopes.includes('PARAGRAPH_SPACING')) return 'paragraphSpacing';
  if (scopes.includes('GAP') || scopes.includes('PADDING') || scopes.includes('SPACING')) return 'spacing';
  if (scopes.includes('BORDER_RADIUS')) return 'borderRadius';
  if (scopes.includes('WIDTH') || scopes.includes('HEIGHT')) return 'sizing';
  
  // Default to dimension for numeric values
  return 'dimension';
}

/**
 * Get appropriate unit for token type
 */
function getUnitForTokenType(tokenType: string): string {
  switch (tokenType) {
    case 'fontSize':
    case 'lineHeight':
    case 'letterSpacing':
    case 'paragraphSpacing':
    case 'spacing':
    case 'borderRadius':
    case 'sizing':
      return 'px';
    default:
      return '';
  }
}

/**
 * Create a clean token name from Figma variable name
 */
function createTokenName(variableName: string): string {
  // Convert from Figma naming to dot notation
  // e.g., "Color/Primary/500" -> "color.primary.500"
  return variableName
    .toLowerCase()
    .replace(/[\/\s]+/g, '.')
    .replace(/[^a-z0-9.-]/g, '');
}

/**
 * Process a variable collection into W3C DTCG format
 */
export async function processCollection(collection: any): Promise<ProcessedCollection> {
  const tokens: ProcessedCollection = {};
  
  console.log(`Processing collection: ${collection.name} with ${collection.variables.length} variables`);
  
  // For now, use the first mode. TODO: Handle multiple modes properly
  const primaryMode = collection.modes[0];
  
  for (const variable of collection.variables) {
    try {
      const tokenName = createTokenName(variable.name);
      const processedToken = processVariable(variable, primaryMode);
      
      // Remove undefined description to keep JSON clean
      if (!processedToken.$description) {
        delete processedToken.$description;
      }
      
      tokens[tokenName] = processedToken;
      console.log(`Processed token: ${tokenName} = ${JSON.stringify(processedToken.$value)}`);
    } catch (error) {
      console.error(`Error processing variable ${variable.name}:`, error);
    }
  }
  
  console.log(`Successfully processed ${Object.keys(tokens).length} tokens from ${collection.name}`);
  return tokens;
}

/**
 * Process multiple collections for export
 */
export async function processCollectionsForExport(
  allCollections: any[], 
  selectedCollectionIds: string[]
): Promise<ExportData[]> {
  const exportData: ExportData[] = [];
  
  console.log(`Processing ${selectedCollectionIds.length} selected collections for export`);
  console.log('Selected collection IDs:', selectedCollectionIds);
  console.log('Available collections:', allCollections.map(c => `${c.name} (${c.id})`));
  
  for (const collectionId of selectedCollectionIds) {
    const collection = allCollections.find(c => c.id === collectionId);
    
    if (!collection) {
      console.warn(`Collection not found: ${collectionId}`);
      continue;
    }
    
    console.log(`Processing collection: ${collection.name} with ${collection.variables && collection.variables.length || 0} variables`);
    
    // Skip collections with no variables
    if (!collection.variables || collection.variables.length === 0) {
      console.warn(`Collection ${collection.name} has no variables, skipping`);
      continue;
    }
    
    try {
      const processedTokens = await processCollection(collection);
      
      // Only add collections that actually have processed tokens
      if (Object.keys(processedTokens).length > 0) {
        // Format for download (matches existing downloadTokenFiles expectation)
        const exportItem: ExportData = {
          [collection.name]: processedTokens
        };
        
        exportData.push(exportItem);
        console.log(`Successfully exported collection: ${collection.name} with ${Object.keys(processedTokens).length} tokens`);
      } else {
        console.warn(`Collection ${collection.name} processed but resulted in 0 tokens`);
      }
    } catch (error) {
      console.error(`Error processing collection ${collection.name}:`, error);
    }
  }
  
  console.log(`Export processing complete. Generated ${exportData.length} files from ${selectedCollectionIds.length} selected collections.`);
  return exportData;
}
