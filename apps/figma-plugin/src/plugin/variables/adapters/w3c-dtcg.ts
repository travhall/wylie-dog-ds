// W3C DTCG Format Adapter - Handles W3C compliant design token formats
import type { 
  FormatAdapter, 
  FormatDetectionResult, 
  NormalizationResult, 
  StructureInfo,
  TransformationLog
} from '../format-adapter';
import { TokenFormatType } from '../format-adapter';
import type { ProcessedToken } from '../processor';

export class W3CDTCGAdapter implements FormatAdapter {
  name = 'W3C DTCG Format';

  detect(data: any): FormatDetectionResult {
    let confidence = 0;
    const warnings: string[] = [];

    // Check for flat object structure with W3C compliance markers
    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      confidence += 0.2;

      const keys = Object.keys(data);
      let w3cCompliantTokens = 0;

      // Check for W3C DTCG token structure ($type and $value)
      for (const key of keys.slice(0, 10)) {
        const token = data[key];
        if (token && typeof token === 'object') {
          if (token.$type && token.$value !== undefined) {
            w3cCompliantTokens++;
          }
        }
      }

      if (w3cCompliantTokens > 0) {
        confidence += (w3cCompliantTokens / Math.min(keys.length, 10)) * 0.6;
      }

      // Check for W3C DTCG specific metadata
      if (data.$schema || data.$description || data.$extensions) {
        confidence += 0.2;
      }
    }

    return {
      format: TokenFormatType.W3C_DTCG_FLAT,
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
      console.log('🔄 W3C DTCG: Starting normalization');

      // W3C DTCG format is close to our expected format
      // Main transformation is organizing into collections
      const collections = this.organizeIntoCollections(data);
      
      transformations.push({
        type: 'structure',
        description: 'Organized W3C DTCG tokens into collections',
        before: 'Flat W3C structure',
        after: 'Collection-based structure'
      });

      const normalizedCollections: any[] = [];

      for (const [collectionName, tokens] of Object.entries(collections)) {
        const collection = this.transformCollection(collectionName, tokens);
        normalizedCollections.push(collection);
      }

      console.log('✅ W3C DTCG: Normalization complete');

      return {
        data: normalizedCollections,
        transformations,
        warnings,
        errors,
        success: true
      };
    } catch (error) {
      console.error('❌ W3C DTCG: Normalization failed:', error);
      errors.push(`W3C DTCG normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    return this.detect(data).confidence > 0.6;
  }

  private organizeIntoCollections(data: any): Record<string, any> {
    const collections: Record<string, any> = {};

    for (const [tokenPath, tokenData] of Object.entries(data)) {
      // Skip metadata fields
      if (tokenPath.startsWith('$')) continue;

      // Group by top-level category
      const parts = tokenPath.split('.');
      const collectionName = parts[0] || 'default';

      if (!collections[collectionName]) {
        collections[collectionName] = {};
      }

      collections[collectionName][tokenPath] = tokenData;
    }

    return collections;
  }

  private transformCollection(name: string, tokens: any): any {
    const variables: Record<string, ProcessedToken> = {};

    for (const [tokenPath, tokenData] of Object.entries(tokens)) {
      // W3C DTCG tokens should already be in correct format
      const token = tokenData as any;
      variables[tokenPath] = {
        $type: token.$type,
        $value: token.$value,
        $description: token.$description
      };
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

  private analyzeStructure(data: any): StructureInfo {
    let tokenCount = 0;
    let referenceCount = 0;

    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const keys = Object.keys(data).filter(key => !key.startsWith('$'));
      tokenCount = keys.length;

      // Count references
      for (const token of Object.values(data)) {
        if (token && typeof token === 'object') {
          const value = (token as any).$value;
          if (typeof value === 'string' && value.includes('{')) {
            referenceCount++;
          }
        }
      }
    }

    return {
      hasCollections: false,
      hasModes: false,
      hasArrayWrapper: false,
      tokenCount,
      referenceCount,
      propertyFormat: '$type/$value',
      namingConvention: 'dot-notation',
      referenceFormat: 'curly-brace'
    };
  }
}
