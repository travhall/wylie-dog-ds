// Material Design Format Adapter - Handles Material Design token exports
import type { 
  FormatAdapter, 
  FormatDetectionResult, 
  NormalizationResult, 
  StructureInfo,
  TransformationLog
} from '../format-adapter';
import { TokenFormatType } from '../format-adapter';
import type { ProcessedToken } from '../processor';

export class MaterialDesignAdapter implements FormatAdapter {
  name = 'Material Design Format';

  detect(data: any): FormatDetectionResult {
    let confidence = 0;
    const warnings: string[] = [];

    // Check for Material Design specific structure
    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      confidence += 0.2;

      const keys = Object.keys(data);
      
      // Look for Material Design token patterns (sys.*, ref.*, comp.*)
      const materialPatterns = keys.filter(key => 
        key.startsWith('sys.') || 
        key.startsWith('ref.') || 
        key.startsWith('comp.') ||
        key.startsWith('md.sys.') ||
        key.startsWith('md.ref.') ||
        key.startsWith('md.comp.')
      );

      if (materialPatterns.length > 0) {
        confidence += 0.5;
      }

      // Check for Material Design color semantic naming
      const colorTokens = keys.filter(key => 
        key.includes('.color.') && (
          key.includes('.primary') ||
          key.includes('.surface') ||
          key.includes('.on-surface') ||
          key.includes('.outline')
        )
      );

      if (colorTokens.length > 0) {
        confidence += 0.2;
      }

      // Check for Material Design typography patterns
      const typographyTokens = keys.filter(key =>
        key.includes('.typeface.') ||
        key.includes('.type-scale.') ||
        (key.includes('.typography.') && (
          key.includes('.display') ||
          key.includes('.headline') ||
          key.includes('.title') ||
          key.includes('.body') ||
          key.includes('.label')
        ))
      );

      if (typographyTokens.length > 0) {
        confidence += 0.1;
      }
    }

    return {
      format: TokenFormatType.MATERIAL_DESIGN,
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
      console.log('🔄 Material Design: Starting normalization');

      // Group Material Design tokens by category
      const collections = this.groupMaterialTokens(data, transformations);
      
      if (Object.keys(collections).length === 0) {
        errors.push('No valid Material Design token collections found');
        return {
          data: [],
          transformations,
          warnings,
          errors,
          success: false
        };
      }

      console.log(`📦 Organized into ${Object.keys(collections).length} collections`);

      // Transform each collection
      const normalizedCollections: any[] = [];

      for (const [collectionName, tokens] of Object.entries(collections)) {
        console.log(`🔄 Processing collection: ${collectionName} (${Object.keys(tokens).length} tokens)`);
        const collection = this.transformCollection(collectionName, tokens, transformations);
        normalizedCollections.push(collection);
      }

      console.log('✅ Material Design: Normalization complete');

      return {
        data: normalizedCollections,
        transformations,
        warnings,
        errors,
        success: true
      };
    } catch (error) {
      console.error('❌ Material Design: Normalization failed:', error);
      errors.push(`Material Design normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  private groupMaterialTokens(data: any, transformations: TransformationLog[]): Record<string, any> {
    const collections: Record<string, any> = {
      'Material Reference': {},
      'Material System': {},
      'Material Components': {}
    };

    for (const [tokenPath, tokenData] of Object.entries(data)) {
      // Determine which collection this token belongs to
      let collectionName = 'Material System'; // Default

      if (tokenPath.startsWith('ref.') || tokenPath.startsWith('md.ref.')) {
        collectionName = 'Material Reference';
      } else if (tokenPath.startsWith('comp.') || tokenPath.startsWith('md.comp.')) {
        collectionName = 'Material Components';
      } else if (tokenPath.startsWith('sys.') || tokenPath.startsWith('md.sys.')) {
        collectionName = 'Material System';
      }

      collections[collectionName][tokenPath] = tokenData;
    }

    // Remove empty collections
    for (const [collectionName, tokens] of Object.entries(collections)) {
      if (Object.keys(tokens).length === 0) {
        delete collections[collectionName];
      }
    }

    transformations.push({
      type: 'structure',
      description: 'Grouped Material Design tokens by semantic category',
      before: 'Flat Material Design structure',
      after: 'Reference/System/Component collections'
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

    // Material Design specific type inference
    if (!type) {
      type = this.inferMaterialType(tokenPath, value);
      transformations.push({
        type: 'type-inference',
        description: `Inferred Material Design type for ${tokenPath}`,
        before: 'No type specified',
        after: type
      });
    }

    // Handle Material Design specific value transformations
    if (this.needsValueTransformation(tokenPath, value)) {
      const originalValue = value;
      value = this.transformMaterialValue(tokenPath, value);
      
      transformations.push({
        type: 'value-transformation',
        description: `Transformed Material Design value for ${tokenPath}`,
        before: originalValue,
        after: value
      });
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
      $description: description || this.generateMaterialDescription(tokenPath)
    };
  }

  private inferMaterialType(tokenPath: string, value: any): string {
    // Material Design specific type inference based on token path
    if (tokenPath.includes('.color.')) {
      return 'color';
    }
    
    if (tokenPath.includes('.typeface.') || tokenPath.includes('.font-family.')) {
      return 'fontFamily';
    }
    
    if (tokenPath.includes('.font-size.') || tokenPath.includes('.type-scale.')) {
      return 'fontSize';
    }
    
    if (tokenPath.includes('.font-weight.')) {
      return 'fontWeight';
    }
    
    if (tokenPath.includes('.line-height.')) {
      return 'lineHeight';
    }
    
    if (tokenPath.includes('.letter-spacing.')) {
      return 'letterSpacing';
    }
    
    if (tokenPath.includes('.spacing.') || tokenPath.includes('.space.')) {
      return 'spacing';
    }
    
    if (tokenPath.includes('.corner.') || tokenPath.includes('.border-radius.')) {
      return 'borderRadius';
    }
    
    if (tokenPath.includes('.elevation.') || tokenPath.includes('.shadow.')) {
      return 'shadow';
    }

    // Fallback to generic type inference
    if (typeof value === 'string') {
      if (value.match(/^#[0-9a-fA-F]{6}$/)) return 'color';
      if (value.match(/^\d+(\.\d+)?(px|rem|em)$/)) return 'dimension';
      if (value.match(/^\d+(\.\d+)?$/)) return 'number';
    }
    
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    
    return 'string';
  }

  private needsValueTransformation(tokenPath: string, value: any): boolean {
    // Check if Material Design specific transformations are needed
    if (typeof value === 'object' && value !== null) {
      // Material Design sometimes uses objects for complex values
      return true;
    }
    
    // Material Design elevation might need transformation
    if (tokenPath.includes('.elevation.') && typeof value === 'number') {
      return true;
    }
    
    return false;
  }

  private transformMaterialValue(tokenPath: string, value: any): any {
    // Handle Material Design elevation
    if (tokenPath.includes('.elevation.') && typeof value === 'number') {
      // Convert elevation number to shadow string
      return this.elevationToShadow(value);
    }
    
    // Handle Material Design composite objects
    if (typeof value === 'object' && value !== null) {
      // Extract primary value from object
      if (value.value !== undefined) return value.value;
      if (value.$value !== undefined) return value.$value;
      if (value.default !== undefined) return value.default;
      
      // Convert object to string representation
      return JSON.stringify(value);
    }
    
    return value;
  }

  private elevationToShadow(elevation: number): string {
    // Material Design elevation to shadow mapping
    const shadowMap: Record<number, string> = {
      0: 'none',
      1: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
      2: '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
      3: '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
      4: '0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22)',
      5: '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)'
    };
    
    return shadowMap[elevation] || `0px ${elevation * 2}px ${elevation * 4}px rgba(0, 0, 0, 0.2)`;
  }

  private generateMaterialDescription(tokenPath: string): string {
    // Generate helpful descriptions for Material Design tokens
    if (tokenPath.includes('ref.')) {
      return 'Material Design reference token';
    }
    if (tokenPath.includes('sys.')) {
      return 'Material Design system token';
    }
    if (tokenPath.includes('comp.')) {
      return 'Material Design component token';
    }
    
    // More specific descriptions
    if (tokenPath.includes('.primary')) {
      return 'Primary brand color token';
    }
    if (tokenPath.includes('.surface')) {
      return 'Surface background color token';
    }
    if (tokenPath.includes('.on-surface')) {
      return 'Text/icon color on surface backgrounds';
    }
    
    return 'Material Design token';
  }

  private analyzeStructure(data: any): StructureInfo {
    let tokenCount = 0;
    let referenceCount = 0;
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const keys = Object.keys(data);
      tokenCount = keys.length;
      
      // Count references in Material Design tokens
      for (const [, tokenData] of Object.entries(data)) {
        if (tokenData && typeof tokenData === 'object') {
          const value = (tokenData as any).$value ?? (tokenData as any).value;
          if (typeof value === 'string' && (value.includes('{') || value.includes('var('))) {
            referenceCount++;
          }
        }
      }
    }

    return {
      hasCollections: false, // Will be organized into collections during normalization
      hasModes: false,
      hasArrayWrapper: false,
      tokenCount,
      referenceCount,
      propertyFormat: 'mixed', // Material Design can use various formats
      namingConvention: 'dot-notation',
      referenceFormat: this.detectReferenceFormat(data)
    };
  }

  private detectReferenceFormat(data: any): 'curly-brace' | 'css-var' | 'sass' | 'other' | 'none' {
    if (typeof data !== 'object' || !data) return 'none';
    
    for (const token of Object.values(data).slice(0, 10)) {
      if (token && typeof token === 'object') {
        const value = (token as any).$value ?? (token as any).value;
        if (typeof value === 'string') {
          if (value.includes('{') && value.includes('}')) return 'curly-brace';
          if (value.includes('var(--')) return 'css-var';
          if (value.startsWith('$')) return 'sass';
          if (value.includes('@')) return 'other';
        }
      }
    }
    
    return 'none';
  }
}
