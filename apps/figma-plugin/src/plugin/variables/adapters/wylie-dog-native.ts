// Native Wylie Dog Format Adapter - Handles current expected format
import type {
  FormatAdapter,
  FormatDetectionResult,
  NormalizationResult,
  StructureInfo,
  TransformationLog,
} from "../format-adapter";
import { TokenFormatType } from "../format-adapter";

export class WylieDogNativeAdapter implements FormatAdapter {
  name = "Wylie Dog Native Format";

  detect(data: any): FormatDetectionResult {
    let confidence = 0;
    const warnings: string[] = [];

    // Check for array wrapper with collection objects
    if (Array.isArray(data)) {
      confidence += 0.3;

      // Check for collection structure with variables and modes
      const sampleCollection = data[0];
      if (sampleCollection && typeof sampleCollection === "object") {
        const collectionNames = Object.keys(sampleCollection);

        for (const collectionName of collectionNames) {
          const collection = sampleCollection[collectionName];

          // Check for modes and variables structure
          if (
            collection &&
            collection.modes &&
            Array.isArray(collection.modes) &&
            collection.variables &&
            typeof collection.variables === "object"
          ) {
            confidence += 0.4;

            // Check for W3C DTCG token structure
            const tokens = Object.values(collection.variables);
            if (tokens.length > 0) {
              const validTokens = tokens.filter(
                (token: any) =>
                  token &&
                  typeof token === "object" &&
                  token.$type &&
                  token.$value !== undefined
              );

              if (validTokens.length > 0) {
                confidence += 0.3;
                break;
              }
            }
          }
        }
      }
    }

    return {
      format: TokenFormatType.WYLIE_DOG,
      confidence: Math.min(confidence, 1.0),
      structure: this.analyzeStructure(data),
      warnings,
    };
  }
  normalize(data: any): NormalizationResult {
    const transformations: TransformationLog[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Native format should already be in correct structure
      // Deep clone to prevent mutations
      if (!Array.isArray(data)) {
        errors.push("Native format expects array of collection objects");
        return {
          data: [],
          transformations,
          warnings,
          errors,
          success: false,
        };
      }

      // DEEP CLONE to preserve all fields including $description
      data = JSON.parse(JSON.stringify(data));

      // Minimal validation
      for (let i = 0; i < data.length; i++) {
        const collection = data[i];
        if (!collection || typeof collection !== "object") {
          errors.push(`Collection at index ${i} is not a valid object`);
          continue;
        }

        for (const [collectionName, collectionData] of Object.entries(
          collection
        )) {
          if (
            !collectionData ||
            typeof collectionData !== "object" ||
            !("variables" in collectionData)
          ) {
            errors.push(
              `Collection "${collectionName}" missing variables object`
            );
          }
        }
      }

      if (errors.length > 0) {
        return {
          data: [],
          transformations,
          warnings,
          errors,
          success: false,
        };
      }

      return {
        data: data,
        transformations,
        warnings,
        errors,
        success: true,
      };
    } catch (error) {
      errors.push(
        `Native format processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      return {
        data: [],
        transformations,
        warnings,
        errors,
        success: false,
      };
    }
  }

  validate(data: any): boolean {
    return this.detect(data).confidence > 0.8;
  }

  private analyzeStructure(data: any): StructureInfo {
    let tokenCount = 0;
    let referenceCount = 0;
    let hasCollections = false;
    let hasModes = false;
    let hasArrayWrapper = false;

    if (Array.isArray(data)) {
      hasArrayWrapper = true;

      for (const item of data) {
        if (typeof item === "object" && item !== null) {
          hasCollections = true;

          for (const [, collectionData] of Object.entries(item)) {
            const collection = collectionData as any;

            if (collection.modes && Array.isArray(collection.modes)) {
              hasModes = collection.modes.length > 1;
            }

            if (collection.variables) {
              tokenCount += Object.keys(collection.variables).length;

              // Count references
              for (const token of Object.values(collection.variables)) {
                const tokenObj = token as any;
                if (
                  typeof tokenObj.$value === "string" &&
                  tokenObj.$value.includes("{")
                ) {
                  referenceCount++;
                }
              }
            }
          }
        }
      }
    }

    return {
      hasCollections,
      hasModes,
      hasArrayWrapper,
      tokenCount,
      referenceCount,
      propertyFormat: "$type/$value",
      namingConvention: "dot-notation",
      referenceFormat: "curly-brace",
    };
  }
}
