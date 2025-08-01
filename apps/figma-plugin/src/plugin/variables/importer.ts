// Token import utilities for W3C DTCG format to Figma Variables conversion

import type { ProcessedCollection, ProcessedToken, ExportData } from './processor';

export interface ImportResult {
  success: boolean;
  message: string;
  collectionsCreated: number;
  variablesCreated: number;
  errors: string[];
}

export interface ImportOptions {
  mergeStrategy: 'replace' | 'merge' | 'preserve';
  createMissingModes: boolean;
  preserveExistingVariables: boolean;
}

// Map W3C DTCG types to Figma types
const W3C_TO_FIGMA_TYPE_MAP: Record<string, string> = {
  'color': 'COLOR',
  'fontSize': 'FLOAT',
  'fontWeight': 'STRING',
  'fontFamily': 'STRING', 
  'lineHeight': 'STRING',
  'letterSpacing': 'FLOAT',
  'spacing': 'FLOAT',
  'sizing': 'FLOAT',
  'borderRadius': 'FLOAT',
  'borderWidth': 'FLOAT',
  'dimension': 'FLOAT',
  'shadow': 'STRING',
  'boolean': 'BOOLEAN'
};

// Map W3C DTCG types to Figma scopes
const W3C_TO_FIGMA_SCOPES_MAP: Record<string, string[]> = {
  'color': ['ALL_SCOPES'],
  'fontSize': ['FONT_SIZE'],
  'fontWeight': ['FONT_WEIGHT'],
  'fontFamily': ['FONT_FAMILY'],
  'lineHeight': ['LINE_HEIGHT'],
  'letterSpacing': ['LETTER_SPACING'],
  'spacing': ['GAP', 'PADDING'],
  'sizing': ['WIDTH', 'HEIGHT'],
  'borderRadius': ['CORNER_RADIUS'],
  'borderWidth': ['STROKE_WIDTH'],
  'dimension': ['GAP', 'PADDING'],
  'shadow': ['EFFECT'],
  'boolean': ['ALL_SCOPES']
};

/**
 * Convert hex color to Figma RGB format (0-1 range)
 */
function hexToFigmaRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  
  return { r, g, b };
}

/**
 * Parse numeric value from string (e.g., "16px" -> 16)
 */
function parseNumericValue(value: string): number {
  const parsed = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Convert token value to Figma format based on type
 */
function convertTokenValueToFigma(token: ProcessedToken, figmaType: string): any {
  const value = token.$value;
  
  switch (figmaType) {
    case 'COLOR':
      if (typeof value === 'string' && value.startsWith('#')) {
        return hexToFigmaRgb(value);
      }
      return { r: 0, g: 0, b: 0 }; // Fallback black
      
    case 'FLOAT':
      return parseNumericValue(value);
      
    case 'STRING':
    case 'BOOLEAN':
    default:
      return value;
  }
}

/**
 * Create or find variable collection by name
 */
async function ensureVariableCollection(
  collectionName: string, 
  modes: Array<{ modeId: string; name: string }>
): Promise<VariableCollection> {
  // Check if collection already exists
  const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = existingCollections.find(c => c.name === collectionName);
  
  if (!collection) {
    // Create new collection
    collection = figma.variables.createVariableCollection(collectionName);
    console.log(`Created new variable collection: ${collectionName}`);
  }
  
  // Handle modes - remove default mode if we have custom modes
  if (modes && modes.length > 0) {
    const existingModeNames = collection.modes.map(m => m.name);
    let hasDefaultMode = collection.modes.length === 1 && collection.modes[0].name === "Mode 1";
    
    // Add new modes first
    for (const modeData of modes) {
      if (!existingModeNames.includes(modeData.name)) {
        try {
          collection.addMode(modeData.name);
          console.log(`Added mode "${modeData.name}" to collection "${collectionName}"`);
        } catch (error) {
          console.warn(`Failed to add mode "${modeData.name}":`, error);
        }
      }
    }
    
    // Remove default "Mode 1" if we added custom modes
    if (hasDefaultMode && modes.length > 0) {
      try {
        const defaultMode = collection.modes.find(m => m.name === "Mode 1");
        if (defaultMode && collection.modes.length > 1) {
          collection.removeMode(defaultMode.modeId);
          console.log(`Removed default "Mode 1" from collection "${collectionName}"`);
        }
      } catch (error) {
        console.warn(`Failed to remove default mode:`, error);
      }
    }
  }
  
  return collection;
}

/**
 * Create or update a variable in a collection
 */
async function createOrUpdateVariable(
  collection: VariableCollection,
  tokenName: string,
  token: ProcessedToken,
  options: ImportOptions
): Promise<Variable | null> {
  try {
    const figmaType = W3C_TO_FIGMA_TYPE_MAP[token.$type] || 'STRING';
    const scopes = W3C_TO_FIGMA_SCOPES_MAP[token.$type] || ['ALL_SCOPES'];
    
    // Convert dot notation back to Figma naming
    // e.g., "color.primary.500" -> "color/primary/500"
    const figmaName = tokenName.replace(/\./g, '/');
    
    // Check if variable already exists
    const existingVariables = collection.variableIds.map(id => figma.variables.getVariableById(id)).filter(Boolean);
    let variable = existingVariables.find(v => v?.name === figmaName);
    
    if (variable && !options.preserveExistingVariables) {
      // Update existing variable
      console.log(`Updating existing variable: ${figmaName}`);
    } else if (!variable) {
      // Create new variable
      variable = figma.variables.createVariable(figmaName, collection, figmaType as VariableResolvedDataType);
      console.log(`Created new variable: ${figmaName} (${figmaType})`);
      
      // Set scopes
      variable.scopes = scopes as VariableScope[];
      
      // Set description if provided
      if (token.$description) {
        variable.description = token.$description;
      }
    } else {
      console.log(`Preserving existing variable: ${figmaName}`);
      return variable;
    }
    
    // Set values for all modes
    if (token.valuesByMode) {
      // Multi-mode token
      for (const [modeName, modeValue] of Object.entries(token.valuesByMode)) {
        const mode = collection.modes.find(m => m.name === modeName);
        if (mode) {
          const figmaValue = convertTokenValueToFigma(Object.assign({}, token, { $value: modeValue }), figmaType);
          variable.setValueForMode(mode.modeId, figmaValue);
          console.log(`Set value for ${figmaName} in mode "${modeName}"`);
        }
      }
    } else {
      // Single-mode token - use default mode
      const defaultMode = collection.modes[0];
      const figmaValue = convertTokenValueToFigma(token, figmaType);
      variable.setValueForMode(defaultMode.modeId, figmaValue);
      console.log(`Set value for ${figmaName} in default mode`);
    }
    
    return variable;
    
  } catch (error) {
    console.error(`Error creating/updating variable ${tokenName}:`, error);
    return null;
  }
}

/**
 * Import a single collection from processed tokens
 */
export async function importCollection(
  collectionName: string,
  collectionData: ProcessedCollection,
  options: ImportOptions = {
    mergeStrategy: 'merge',
    createMissingModes: true,
    preserveExistingVariables: false
  }
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    collectionsCreated: 0,
    variablesCreated: 0,
    errors: []
  };
  
  try {
    console.log(`Starting import of collection: ${collectionName}`);
    console.log(`Collection data:`, JSON.stringify(collectionData, null, 2));
    
    // Ensure collection exists with proper modes
    const collection = await ensureVariableCollection(
      collectionName, 
      collectionData.modes || [{ modeId: 'default', name: 'Default' }]
    );
    
    if (!collection) {
      throw new Error(`Failed to create or find collection: ${collectionName}`);
    }
    
    result.collectionsCreated = 1;
    
    // Import variables
    let variableCount = 0;
    const tokenEntries = Object.entries(collectionData.variables);
    console.log(`Processing ${tokenEntries.length} tokens for collection ${collectionName}`);
    
    for (const [tokenName, token] of tokenEntries) {
      console.log(`Processing token: ${tokenName}`, token);
      try {
        const variable = await createOrUpdateVariable(collection, tokenName, token, options);
        if (variable) {
          variableCount++;
          console.log(`Successfully created/updated variable: ${tokenName} (${variableCount}/${tokenEntries.length})`);
        } else {
          console.warn(`Variable creation returned null for: ${tokenName}`);
        }
      } catch (error) {
        const errorMsg = `Failed to import token ${tokenName}: ${error.message}`;
        result.errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }
    
    result.variablesCreated = variableCount;
    result.success = true;
    result.message = `Successfully imported ${variableCount}/${tokenEntries.length} variables to collection "${collectionName}"`;
    
    console.log(`Import complete: ${result.message}`);
    
  } catch (error) {
    result.success = false;
    result.message = `Import failed: ${error.message}`;
    result.errors.push(error.message);
    console.error('Import error:', error);
  }
  
  return result;
}

/**
 * Import multiple collections from export data
 */
export async function importTokenData(
  tokenData: ExportData | ExportData[],
  options: ImportOptions = {
    mergeStrategy: 'merge', 
    createMissingModes: true,
    preserveExistingVariables: false
  }
): Promise<ImportResult[]> {
  const results: ImportResult[] = [];
  
  // Handle both single collection and array of collections
  const collections = Array.isArray(tokenData) ? tokenData : [tokenData];
  
  console.log(`Starting import of ${collections.length} collection(s)`);
  
  for (const collectionData of collections) {
    for (const [collectionName, data] of Object.entries(collectionData)) {
      const result = await importCollection(collectionName, data, options);
      results.push(result);
    }
  }
  
  return results;
}

/**
 * Parse uploaded token file content
 */
export function parseTokenFile(content: string): ExportData | ExportData[] {
  try {
    const parsed = JSON.parse(content);
    
    // Handle array wrapper format
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    // Handle direct object format
    return parsed;
    
  } catch (error) {
    throw new Error(`Invalid JSON format: ${error.message}`);
  }
}

/**
 * Validate token structure before import
 */
export function validateTokenStructure(tokenData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!tokenData) {
    errors.push('Token data is empty or null');
    return { valid: false, errors };
  }
  
  // Handle array format
  const collections = Array.isArray(tokenData) ? tokenData : [tokenData];
  
  for (const collection of collections) {
    if (typeof collection !== 'object') {
      errors.push('Collection data must be an object');
      continue;
    }
    
    for (const [collectionName, data] of Object.entries(collection)) {
      if (typeof data !== 'object' || !data.variables) {
        errors.push(`Collection "${collectionName}" missing variables object`);
        continue;
      }
      
      // Validate variables structure
      for (const [tokenName, token] of Object.entries(data.variables)) {
        if (typeof token !== 'object' || !token.$type || token.$value === undefined) {
          errors.push(`Token "${tokenName}" missing required $type or $value`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
