// Format Adapter Manager - Main orchestrator for format detection and normalization
import { TokenFormatType } from './format-adapter';
import type { 
  AdapterProcessResult, 
  ProcessingStats,
  FormatDetectionResult,
  TransformationLog,
  FormatAdapter
} from './format-adapter';
import { FormatDetectorRegistry } from './format-detectors';
import { ReferenceNormalizer } from './reference-normalizer';

// Only import essential adapters - others loaded dynamically
import { WylieDogNativeAdapter } from './adapters/wylie-dog-native';
import { GenericAdapter } from './adapters/generic';

export class FormatAdapterManager {
  private registry = new FormatDetectorRegistry();
  private dynamicAdapters = new Map<TokenFormatType, FormatAdapter>();

  constructor() {
    this.initializeCoreAdapters();
  }

  private initializeCoreAdapters(): void {
    console.log('🏗️  Initializing core format adapters...');
    
    // Only register essential adapters immediately - others loaded on demand
    this.registry.register(new WylieDogNativeAdapter());  // Always needed for native format
    // GenericAdapter now loads as true fallback after all specific adapters fail
    
    console.log(`✅ Registered ${this.registry.getRegistrySize()} core adapters`);
  }

  private async loadAdapter(format: TokenFormatType): Promise<FormatAdapter | undefined> {
    // Return if already loaded
    if (this.dynamicAdapters.has(format)) {
      return this.dynamicAdapters.get(format);
    }

    try {
      let AdapterClass: any;
      
      switch (format) {
        case TokenFormatType.W3C_DTCG_FLAT:
          AdapterClass = (await import('./adapters/w3c-dtcg')).W3CDTCGAdapter;
          break;
        case TokenFormatType.TOKENS_STUDIO_FLAT:
        case TokenFormatType.TOKENS_STUDIO_GROUPED:
          AdapterClass = (await import('./adapters/tokens-studio')).TokensStudioAdapter;
          break;
        case TokenFormatType.STYLE_DICTIONARY_FLAT:
          AdapterClass = (await import('./adapters/style-dictionary-flat')).StyleDictionaryFlatAdapter;
          break;
        case TokenFormatType.STYLE_DICTIONARY_NESTED:
          AdapterClass = (await import('./adapters/style-dictionary-nested')).StyleDictionaryNestedAdapter;
          break;
        case TokenFormatType.MATERIAL_DESIGN:
          AdapterClass = (await import('./adapters/material-design')).MaterialDesignAdapter;
          break;
        case TokenFormatType.CSS_VARIABLES:
          AdapterClass = (await import('./adapters/css-variables')).CSSVariablesAdapter;
          break;
        default:
          console.warn(`Unknown format type: ${format}`);
          return undefined;
      }

      if (AdapterClass) {
        const adapter = new AdapterClass();
        this.dynamicAdapters.set(format, adapter);
        this.registry.register(adapter);
        console.log(`📦 Dynamically loaded adapter for format: ${format}`);
        return adapter;
      }
    } catch (error) {
      console.error(`Failed to load adapter for format ${format}:`, error);
      return undefined;
    }

    return undefined;
  }

  async processTokenFile(content: string): Promise<AdapterProcessResult> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Format Adapter: Starting token file processing');
      
      // Parse JSON
      const rawData = JSON.parse(content);
      
      // First pass: detect format with available adapters
      const initialDetection = this.registry.detectFormat(rawData);
      console.log(`🔍 Initial format detection: ${initialDetection.format} (confidence: ${initialDetection.confidence})`);
      
      // If confidence is low and format is unknown, try loading more adapters
      if (initialDetection.confidence < 0.7 && initialDetection.format !== TokenFormatType.WYLIE_DOG) {
        console.log('🔄 Low confidence detection, attempting to load additional adapters...');
        
        // Try to load adapters for common formats
        const formatsToTry: TokenFormatType[] = [
          TokenFormatType.W3C_DTCG_FLAT,
          TokenFormatType.TOKENS_STUDIO_FLAT, 
          TokenFormatType.STYLE_DICTIONARY_FLAT,
          TokenFormatType.STYLE_DICTIONARY_NESTED
        ];
        
        for (const format of formatsToTry) {
          await this.loadAdapter(format);
        }
        
        // Re-run detection with loaded adapters
        const enhancedDetection = this.registry.detectFormat(rawData);
        console.log(`🔍 Enhanced format detection: ${enhancedDetection.format} (confidence: ${enhancedDetection.confidence})`);
        
        if (enhancedDetection.confidence > initialDetection.confidence) {
          return this.processWithDetection(enhancedDetection, rawData, startTime);
        }
        
        // If still low confidence, load GenericAdapter as absolute fallback
        if (enhancedDetection.confidence < 0.3) {
          console.log('🔧 Loading GenericAdapter as final fallback...');
          if (!this.dynamicAdapters.has(TokenFormatType.UNKNOWN)) {
            this.registry.register(new GenericAdapter());
            this.dynamicAdapters.set(TokenFormatType.UNKNOWN, new GenericAdapter());
          }
        }
      }
      
      return this.processWithDetection(initialDetection, rawData, startTime);
      
    } catch (error) {
      console.error('❌ Format Adapter: Processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.createErrorResult(
        `JSON parsing failed: ${errorMessage}`,
        ['Verify file is valid JSON', 'Check for syntax errors'],
        null
      );
    }
  }

  private async processWithDetection(
    detection: FormatDetectionResult, 
    rawData: any, 
    startTime: number
  ): Promise<AdapterProcessResult> {
    if (detection.confidence < 0.3) {
      return this.createErrorResult(
        'Unknown or unsupported token format',
        ['Try exporting in W3C DTCG format', 'Check file structure matches expected patterns'],
        detection
      );
    }

    // Find appropriate adapter (may need to load dynamically)
    let adapter = this.registry.getAdapter(detection.format);
    
    if (!adapter && detection.format !== TokenFormatType.UNKNOWN) {
      // Try to load the adapter dynamically
      adapter = await this.loadAdapter(detection.format);
    }
    
    if (!adapter) {
      return this.createErrorResult(
        `No adapter available for format: ${detection.format}`,
        ['Contact support for custom format assistance'],
        detection
      );
    }

    // Normalize data
    const normalization = adapter.normalize(rawData);
    
    if (!normalization.success) {
      return this.createErrorResult(
        'Failed to normalize token data',
        normalization.errors,
        detection,
        normalization.transformations
      );
    }

    // Apply reference normalization
    const processedData = this.normalizeAllReferences(normalization.data);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Format Adapter: Processing completed in ${processingTime}ms`);

    return {
      success: true,
      data: processedData.data,
      detection,
      transformations: [
        ...normalization.transformations,
        ...processedData.referenceTransformations
      ],
      warnings: [
        ...detection.warnings,
        ...normalization.warnings,
        ...processedData.warnings
      ],
      errors: [],
      processingTime,
      stats: this.generateStats(processedData.data)
    };
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
