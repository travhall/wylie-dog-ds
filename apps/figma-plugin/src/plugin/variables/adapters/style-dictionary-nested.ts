// Style Dictionary Nested Format Adapter - Handles hierarchical Style Dictionary exports
import type { 
  FormatAdapter, 
  FormatDetectionResult, 
  NormalizationResult, 
  StructureInfo,
  TransformationLog
} from '../format-adapter';
import { TokenFormatType } from '../format-adapter';
import type { ProcessedToken } from '../processor';

export class StyleDictionaryNestedAdapter implements FormatAdapter {
  name = 'Style Dictionary Nested Format';

  detect(data: any): FormatDetectionResult {
    let confidence = 0;
    const warnings: string[] = [];

    // Check for nested object structure (not flat, not array)
    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      confidence += 0.2;

      // Look for nested structure with categories
      const topLevelKeys = Object.keys(data);
      let nestedStructureCount = 0;
      let tokenCount = 0;

      for (const key of topLevelKeys) {
        const category = data[key];
        if (category && typeof category === 'object' && !Array.isArray(category)) {
          // Check if this category contains nested token objects
          const hasNestedTokens = this.hasNestedTokenStructure(category);
          if (hasNestedTokens) {
            nestedStructureCount++;
            tokenCount += this.countTokensInCategory(category);
          }
        }
      }

      if (nestedStructureCount > 0) {
        confidence += 0.4;
      }

      // Check for Style Dictionary token structure within nested objects
      if (tokenCount > 0) {
        confidence += 0.3;
      }

      // Additional heuristics for Style Dictionary patterns
      if (topLevelKeys.includes('color') || topLevelKeys.includes('size') || topLevelKeys.includes('font')) {
        confidence += 0.1;
      }
    }

    return {
      format: TokenFormatType.STYLE_DICTIONARY_NESTED,
      confidence: Math.min(confidence, 1.0),
      structure: this.analyzeStructure(data),
      warnings
    };
  }

  normalize(data: any): NormalizationResult {
    const transformations: TransformationLog[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      console.log('🔄 Style Dictionary Nested: Starting normalization');

      // Flatten nested structure into token paths
      const flattenedTokens = this.flattenNestedStructure(data, transformations);
      
      if (Object.keys(flattenedTokens).length === 0) {
        errors.push('No valid tokens found in nested Structure Dictionary structure');
        return {
          data: [],
          transformations,
          warnings,
          errors,
          success: false
        };
      }

      console.log(`🔄 Flattened ${Object.keys(flattenedTokens).length} tokens`);

      // Group flattened tokens by category
      const collections = this.groupTokensByCategory(flattenedTokens, transformations);
      
      console.log(`📦 Organized into ${Object.keys(collections).length} collections`);

      // Transform each collection
      const normalizedCollections: any[] = [];

      for (const [collectionName, tokens] of Object.entries(collections)) {
        console.log(`🔄 Processing collection: ${collectionName} (${Object.keys(tokens).length} tokens)`);
        const collection = this.transformCollection(collectionName, tokens, transformations);
        normalizedCollections.push(collection);
      }

      console.log('✅ Style Dictionary Nested: Normalization complete');

      return {
        data: normalizedCollections,
        transformations,
        warnings,
        errors,
        success: true
      };
    } catch (error) {
      console.error('❌ Style Dictionary Nested: Normalization failed:', error);
      errors.push(`Style Dictionary Nested normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        data: [],
        transformations,
        warnings,
        errors,
        success: false
      };
    }
  }

  validate(data: any): boolean {
    return this.detect(data).confidence > 0.5;
  }

  private hasNestedTokenStructure(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;

    // Recursively check for token structures
    for (const value of Object.values(obj)) {
      if (value && typeof value === 'object') {
        // Check if this is a token (has value property)
        if ((value as any).value !== undefined || (value as any).$value !== undefined) {
          return true;
        }
        // Recursively check nested objects
        if (this.hasNestedTokenStructure(value)) {
          return true;
        }
      }
    }

    return false;
  }

  private countTokensInCategory(obj: any): number {
    let count = 0;

    const traverse = (current: any) => {
      if (!current || typeof current !== 'object') return;

      for (const value of Object.values(current)) {
        if (value && typeof value === 'object') {
          // Check if this is a token
          if ((value as any).value !== undefined || (value as any).$value !== undefined) {
            count++;
          } else {
            // Recursively count in nested objects
            traverse(value);
          }
        }
      }
    };

    traverse(obj);
    return count;
  }

  private flattenNestedStructure(data: any, transformations: TransformationLog[]): Record<string, any> {
    const flattened: Record<string, any> = {};

    const flatten = (obj: any, path: string[] = []) => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path.concat([key]);

        if (value && typeof value === 'object') {
          // Check if this is a token (leaf node with value)
          if ((value as any).value !== undefined || (value as any).$value !== undefined) {
            const tokenPath = currentPath.join('.');
            flattened[tokenPath] = value;
          } else {
            // Continue traversing nested structure
            flatten(value, currentPath);
          }
        }
      }
    };

    flatten(data);

    transformations.push({
      type: 'structure',
      description: 'Flattened nested Style Dictionary structure',
      before: 'Hierarchical nested objects',
      after: 'Flat token paths'
    });

    return flattened;
  }

  private groupTokensByCategory(tokens: Record<string, any>, transformations: TransformationLog[]): Record<string, any> {
    const collections: Record<string, any> = {};

    for (const [tokenPath, tokenData] of Object.entries(tokens)) {
      // Extract top-level category as collection name
      const pathParts = tokenPath.split('.');
      const collectionName = pathParts[0] || 'default';

      if (!collections[collectionName]) {
        collections[collectionName] = {};
      }

      collections[collectionName][tokenPath] = tokenData;
    }

    transformations.push({
      type: 'grouping',
      description: 'Grouped flattened tokens by top-level category',
      before: 'Mixed token categories',
      after: 'Category-based collections'
    });

    return collections;
  }

  private transformCollection(name: string, tokens: any, transformations: TransformationLog[]): any {
    const variables: Record<string, ProcessedToken> = {};

    for (const [tokenPath, tokenData] of Object.entries(tokens)) {
      const processedToken = this.transformToken(tokenPath, tokenData, transformations);
      variables[tokenPath] = processedToken;
    }

    // Create collection structure matching expected format
    // Return the collection data directly with the name as the key
    const collectionData = {
      modes: [{ modeId: 'default', name: 'Default' }],
      variables
    };

    return {
      [name]: collectionData
    };
  }

  private transformToken(tokenPath: string, tokenData: any, transformations: TransformationLog[]): ProcessedToken {
    const token = tokenData as any;
    
    // Extract value and type
    let value = token.$value ?? token.value ?? token;
    let type = token.$type ?? token.type;
    const description = token.$description ?? token.description ?? token.comment;

    // Infer type if not provided
    if (!type) {
      type = this.inferTypeFromPath(tokenPath, value);
      transformations.push({
        type: 'type-inference',
        description: `Inferred type for ${tokenPath}`,
        before: 'No type specified',
        after: type
      });
    }

    // Handle Style Dictionary specific attributes
    if (token.attributes) {
      const attributes = token.attributes;
      if (attributes.category || attributes.type || attributes.item) {
        transformations.push({
          type: 'attribute-processing',
          description: `Processed Style Dictionary attributes for ${tokenPath}`,
          before: 'Raw attributes object',
          after: 'Normalized structure'
        });
      }
    }

    // Normalize property names
    if (token.value !== undefined && token.$value === undefined) {
      transformations.push({
        type: 'property-normalization',
        description: `Converted "value" to "$value" for ${tokenPath}`,
        before: '"value"',
        after: '"$value"'
      });
    }

    return {
      $type: type,
      $value: value,
      $description: description || this.generateDescriptionFromPath(tokenPath)
    };
  }

  private inferTypeFromPath(tokenPath: string, value: any): string {
    const pathLower = tokenPath.toLowerCase();

    // Type inference based on token path
    if (pathLower.includes('color')) {
      return 'color';
    }
    
    if (pathLower.includes('font') && pathLower.includes('size')) {
      return 'fontSize';
    }
    
    if (pathLower.includes('font') && pathLower.includes('family')) {
      return 'fontFamily';
    }
    
    if (pathLower.includes('font') && pathLower.includes('weight')) {
      return 'fontWeight';
    }
    
    if (pathLower.includes('line') && pathLower.includes('height')) {
      return 'lineHeight';
    }
    
    if (pathLower.includes('letter') && pathLower.includes('spacing')) {
      return 'letterSpacing';
    }
    
    if (pathLower.includes('spacing') || pathLower.includes('space') || pathLower.includes('gap')) {
      return 'spacing';
    }
    
    if (pathLower.includes('size') || pathLower.includes('width') || pathLower.includes('height')) {
      return 'dimension';
    }
    
    if (pathLower.includes('radius') || pathLower.includes('border')) {
      return 'borderRadius';
    }
    
    if (pathLower.includes('shadow') || pathLower.includes('elevation')) {
      return 'shadow';
    }

    // Fallback to value-based inference
    if (typeof value === 'string') {
      if (value.match(/^#[0-9a-fA-F]{6}$/)) return 'color';
      if (value.match(/^\d+(\.\d+)?(px|rem|em|%)$/)) return 'dimension';
      if (value.match(/^\d+(\.\d+)?$/)) return 'number';
    }
    
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    
    return 'string';
  }

  private generateDescriptionFromPath(tokenPath: string): string {
    const parts = tokenPath.split('.');
    
    if (parts.length >= 2) {
      const category = parts[0];
      const subcategory = parts[1];
      return `${category} ${subcategory} token from Style Dictionary`;
    }
    
    return `Style Dictionary token: ${tokenPath}`;
  }

  private analyzeStructure(data: any): StructureInfo {
    let tokenCount = 0;
    let referenceCount = 0;
    let hasCollections = false;
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      hasCollections = Object.keys(data).length > 0;
      
      // Count tokens and references recursively
      const countTokens = (obj: any) => {
        for (const value of Object.values(obj)) {
          if (value && typeof value === 'object') {
            if ((value as any).value !== undefined || (value as any).$value !== undefined) {
              tokenCount++;
              
              const tokenValue = (value as any).$value ?? (value as any).value;
              if (typeof tokenValue === 'string' && (tokenValue.includes('{') || tokenValue.includes('var('))) {
                referenceCount++;
              }
            } else {
              countTokens(value);
            }
          }
        }
      };
      
      countTokens(data);
    }

    return {
      hasCollections,
      hasModes: false,
      hasArrayWrapper: false,
      tokenCount,
      referenceCount,
      propertyFormat: 'mixed', // Style Dictionary can use various formats
      namingConvention: 'dot-notation',
      referenceFormat: this.detectReferenceFormat(data)
    };
  }

  private detectReferenceFormat(data: any): 'curly-brace' | 'css-var' | 'sass' | 'other' | 'none' {
    if (typeof data !== 'object' || !data) return 'none';
    
    const checkReferences = (obj: any): string | null => {
      for (const value of Object.values(obj)) {
        if (value && typeof value === 'object') {
          const tokenValue = (value as any).$value ?? (value as any).value;
          if (typeof tokenValue === 'string') {
            if (tokenValue.includes('{') && tokenValue.includes('}')) return 'curly-brace';
            if (tokenValue.includes('var(--')) return 'css-var';
            if (tokenValue.startsWith('$')) return 'sass';
            if (tokenValue.includes('@')) return 'other';
          }
          
          // Recursively check nested objects
          const nestedResult = checkReferences(value);
          if (nestedResult) return nestedResult;
        }
      }
      return null;
    };
    
    const format = checkReferences(data);
    return format as any || 'none';
  }
}
