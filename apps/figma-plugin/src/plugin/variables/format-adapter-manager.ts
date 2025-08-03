// Format Adapter Manager - Main orchestrator for format detection and normalization
import type { 
  AdapterProcessResult, 
  ProcessingStats,
  FormatDetectionResult,
  TransformationLog
} from './format-adapter';
import { FormatDetectorRegistry } from './format-detectors';
import { ReferenceNormalizer } from './reference-normalizer';

// Import all adapters
import { WylieDogNativeAdapter } from './adapters/wylie-dog-native';
import { StyleDictionaryFlatAdapter } from './adapters/style-dictionary-flat';
import { StyleDictionaryNestedAdapter } from './adapters/style-dictionary-nested';
import { TokensStudioAdapter } from './adapters/tokens-studio';
import { MaterialDesignAdapter } from './adapters/material-design';
import { W3CDTCGAdapter } from './adapters/w3c-dtcg';
import { CSSVariablesAdapter } from './adapters/css-variables';
import { GenericAdapter } from './adapters/generic';

export class FormatAdapterManager {
  private registry = new FormatDetectorRegistry();

  constructor() {
    this.initializeAdapters();
  }

  private initializeAdapters(): void {
    console.log('🏗️  Initializing format adapters...');
    
    // Register adapters in priority order (highest confidence first)
    this.registry.register(new WylieDogNativeAdapter());        // Highest priority - native format
    this.registry.register(new W3CDTCGAdapter());               // High priority - standards compliant
    this.registry.register(new TokensStudioAdapter());         // Popular plugin format
    this.registry.register(new GenericAdapter());              // MOVED UP - before other adapters
    this.registry.register(new CSSVariablesAdapter());          // CSS custom properties format
    this.registry.register(new MaterialDesignAdapter());       // Google Material Design
    this.registry.register(new StyleDictionaryNestedAdapter()); // Hierarchical Style Dictionary
    this.registry.register(new StyleDictionaryFlatAdapter());  // Flat Style Dictionary
    
    console.log(`✅ Registered ${this.registry.getRegistrySize()} format adapters`);
  }

  async processTokenFile(content: string): Promise<AdapterProcessResult> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Format Adapter: Starting token file processing');
      
      // Parse JSON
      const rawData = JSON.parse(content);
      console.log('📄 JSON parsed successfully');
      
      // Detect format
      const detection = this.registry.detectFormat(rawData);
      console.log(`🔍 Format detected: ${detection.format} (${(detection.confidence * 100).toFixed(1)}% confidence)`);
      
      if (detection.confidence < 0.2) {
        return this.createErrorResult(
          'Unknown or unsupported token format',
          ['Try exporting in W3C DTCG format', 'Check file structure matches expected patterns'],
          detection
        );
      }

      // Find appropriate adapter
      const adapters = this.registry.getAllAdapters();
      const adapter = adapters.find(a => a.detect(rawData).format === detection.format);
      
      if (!adapter) {
        return this.createErrorResult(
          `No adapter available for format: ${detection.format}`,
          ['Contact support for custom format assistance'],
          detection
        );
      }

      console.log(`🔧 Using adapter: ${adapter.name}`);

      // Normalize data
      const normalization = adapter.normalize(rawData);
      console.log(`📝 Normalization result: ${normalization.success ? 'success' : 'failed'}`);
      
      if (!normalization.success) {
        return this.createErrorResult(
          'Failed to normalize token data',
          normalization.errors,
          detection,
          normalization.transformations
        );
      }

      // Apply reference normalization
      console.log('🔗 Applying reference normalization...');
      const processedData = this.normalizeAllReferences(normalization.data);

      const processingTime = Date.now() - startTime;
      console.log(`⏱️  Processing completed in ${processingTime.toFixed(2)}ms`);

      return {
        success: true,
        data: processedData.data,
        detection,
        transformations: normalization.transformations.concat(processedData.referenceTransformations),
        warnings: detection.warnings.concat(normalization.warnings).concat(processedData.warnings),
        errors: [],
        processingTime,
        stats: this.generateStats(processedData.data)
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ Format Adapter: Processing failed:', error);
      
      return this.createErrorResult(
        `JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ['Verify file is valid JSON', 'Check for syntax errors'],
        null,
        [],
        processingTime
      );
    }
  }
  private normalizeAllReferences(data: any[]): {
    data: any[];
    referenceTransformations: TransformationLog[];
    warnings: string[];
  } {
    const transformations: TransformationLog[] = [];
    const warnings: string[] = [];

    console.log(`🔗 Processing ${data.length} collections for reference normalization`);

    const processedData = data.map(collection => {
      const processedCollection: any = {};

      for (const [collectionName, collectionData] of Object.entries(collection)) {
        const processedVariables: Record<string, any> = {};

        for (const [tokenName, token] of Object.entries((collectionData as any).variables)) {
          const processedToken = Object.assign({}, token as any);

          // Normalize main value
          if (processedToken.$value) {
            const result = ReferenceNormalizer.normalizeReferences(processedToken.$value);
            processedToken.$value = result.value;
            const newTransformations = result.transformations.map(t => ({
              type: t.type,
              description: `Normalized reference in ${tokenName}.$value`,
              before: t.original,
              after: t.normalized
            }));
            transformations.push.apply(transformations, newTransformations);
          }

          // Normalize valuesByMode if present
          if (processedToken.valuesByMode) {
            processedToken.valuesByMode = {};
            for (const [mode, value] of Object.entries((token as any).valuesByMode)) {
              const result = ReferenceNormalizer.normalizeReferences(value);
              processedToken.valuesByMode[mode] = result.value;
              transformations.push.apply(transformations, result.transformations.map(t => ({
                type: t.type,
                description: `Normalized reference in ${tokenName}.valuesByMode.${mode}`,
                before: t.original,
                after: t.normalized
              })));
            }
          }

          processedVariables[tokenName] = processedToken;
        }

        processedCollection[collectionName] = Object.assign({}, collectionData as any, {
          variables: processedVariables
        });
      }

      return processedCollection;
    });

    console.log(`✅ Reference normalization complete: ${transformations.length} transformations applied`);

    return {
      data: processedData,
      referenceTransformations: transformations,
      warnings
    };
  }

  private createErrorResult(
    message: string,
    suggestions: string[],
    detection?: FormatDetectionResult | null,
    transformations: TransformationLog[] = [],
    processingTime: number = 0
  ): AdapterProcessResult {
    console.error(`❌ ${message}`);
    
    return {
      success: false,
      data: [],
      detection: detection || {
        format: 'unknown' as any,
        confidence: 0,
        structure: this.createEmptyStructure(),
        warnings: []
      },
      transformations,
      warnings: [],
      errors: [message],
      suggestions,
      processingTime,
      stats: this.createEmptyStats()
    };
  }

  private generateStats(data: any[]): ProcessingStats {
    let totalTokens = 0;
    let totalReferences = 0;
    let totalCollections = 0;

    for (const collection of data) {
      for (const [, collectionData] of Object.entries(collection)) {
        totalCollections++;
        totalTokens += Object.keys((collectionData as any).variables).length;
        
        // Count references
        for (const token of Object.values((collectionData as any).variables)) {
          const tokenObj = token as any;
          if (typeof tokenObj.$value === 'string' && tokenObj.$value.includes('{')) {
            totalReferences++;
          }
          if (tokenObj.valuesByMode) {
            for (const value of Object.values(tokenObj.valuesByMode)) {
              if (typeof value === 'string' && value.includes('{')) {
                totalReferences++;
              }
            }
          }
        }
      }
    }

    return {
      totalTokens,
      totalReferences,
      totalCollections,
      averageTokensPerCollection: totalCollections > 0 ? totalTokens / totalCollections : 0
    };
  }

  private createEmptyStructure(): any {
    return {
      hasCollections: false,
      hasModes: false,
      hasArrayWrapper: false,
      tokenCount: 0,
      referenceCount: 0,
      propertyFormat: 'other',
      namingConvention: 'mixed',
      referenceFormat: 'none'
    };
  }

  private createEmptyStats(): ProcessingStats {
    return {
      totalTokens: 0,
      totalReferences: 0,
      totalCollections: 0,
      averageTokensPerCollection: 0
    };
  }

  // Public method to get detection info without full processing
  detectFormatOnly(content: string): FormatDetectionResult | null {
    try {
      const rawData = JSON.parse(content);
      return this.registry.detectFormat(rawData);
    } catch (error) {
      console.error('Format detection failed:', error);
      return null;
    }
  }

  // Get available format types
  getSupportedFormats(): string[] {
    return this.registry.getAllAdapters().map(adapter => adapter.name);
  }
}
