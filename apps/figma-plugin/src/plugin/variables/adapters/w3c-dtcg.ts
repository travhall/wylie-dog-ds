// W3C DTCG Format Adapter - Handles W3C compliant design token formats
import type {
  FormatAdapter,
  FormatDetectionResult,
  NormalizationResult,
  StructureInfo,
  TransformationLog,
} from "../format-adapter";
import { TokenFormatType } from "../format-adapter";
import type { ProcessedToken } from "../processor";

export class W3CDTCGAdapter implements FormatAdapter {
  name = "W3C DTCG Format"; //cSpell:ignore DTCG CDTCG

  detect(data: any): FormatDetectionResult {
    let confidence = 0;
    const warnings: string[] = [];

    // Check for object structure with W3C compliance markers
    if (typeof data === "object" && !Array.isArray(data) && data !== null) {
      confidence += 0.2;

      // Check for W3C DTCG specific metadata
      if (
        data.$schema?.includes("design-tokens") ||
        data.$description ||
        data.$extensions
      ) {
        confidence += 0.3;
      }

      // Recursively check for W3C DTCG token structure ($type and $value)
      const w3cTokenCount = this.countW3CTokens(data);
      if (w3cTokenCount > 0) {
        confidence += 0.5;
      }
    }

    return {
      format: TokenFormatType.W3C_DTCG_FLAT,
      confidence: Math.min(confidence, 1.0),
      structure: this.analyzeStructure(data),
      warnings,
    };
  }

  private countW3CTokens(obj: any, depth = 0): number {
    if (depth > 10) return 0; // Prevent infinite recursion

    let count = 0;

    if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
      // Check if this object is a token
      if (obj.$type && obj.$value !== undefined) {
        return 1;
      }

      // Recursively check children (skip $ metadata keys)
      for (const [key, value] of Object.entries(obj)) {
        if (!key.startsWith("$")) {
          count += this.countW3CTokens(value, depth + 1);
        }
      }
    }

    return count;
  }

  normalize(data: any): NormalizationResult {
    const transformations: TransformationLog[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      console.log("🔄 W3C DTCG: Starting normalization");

      // W3C DTCG format is close to our expected format
      // Main transformation is organizing into collections
      const collections = this.organizeIntoCollections(data);

      transformations.push({
        type: "structure",
        description: "Organized W3C DTCG tokens into collections",
        before: "Flat W3C structure",
        after: "Collection-based structure",
      });

      const normalizedCollections: any[] = [];

      for (const [collectionName, tokens] of Object.entries(collections)) {
        const collection = this.transformCollection(collectionName, tokens);
        normalizedCollections.push(collection);
      }

      console.log("✅ W3C DTCG: Normalization complete");

      return {
        data: normalizedCollections,
        transformations,
        warnings,
        errors,
        success: true,
      };
    } catch (error) {
      console.error("❌ W3C DTCG: Normalization failed:", error);
      errors.push(
        `W3C DTCG normalization failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
    return this.detect(data).confidence > 0.6;
  }

  private organizeIntoCollections(data: any): Record<string, any> {
    const collections: Record<string, any> = {};

    // Recursively flatten the nested W3C DTCG structure
    const flatTokens = this.flattenTokens(data);

    for (const [tokenPath, tokenData] of Object.entries(flatTokens)) {
      // Skip metadata fields
      if (tokenPath.startsWith("$")) continue;

      // Group by top-level category
      const parts = tokenPath.split(".");
      const collectionName = parts[0] || "default";

      if (!collections[collectionName]) {
        collections[collectionName] = {};
      }

      collections[collectionName][tokenPath] = tokenData;
    }

    return collections;
  }

  private flattenTokens(obj: any, prefix = ""): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip metadata fields at root level
      if (!prefix && key.startsWith("$")) continue;

      const path = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        // Check if this is a token (has $type and $value)
        const tokenObj = value as any;
        if (tokenObj.$type && tokenObj.$value !== undefined) {
          flattened[path] = value;
        } else {
          // Recurse into nested groups
          Object.assign(flattened, this.flattenTokens(value, path));
        }
      }
    }

    return flattened;
  }

  private transformCollection(name: string, tokens: any): any {
    const variables: Record<string, ProcessedToken> = {};

    for (const [tokenPath, tokenData] of Object.entries(tokens)) {
      // W3C DTCG tokens should already be in correct format
      const token = tokenData as any;

      // Build the ProcessedToken, only including defined properties
      const processedToken: ProcessedToken = {
        $type: token.$type,
        $value: token.$value,
      };

      // Add optional properties if they exist
      if (token.$description) {
        processedToken.$description = token.$description;
      }

      variables[tokenPath] = processedToken;
    }

    // Create collection structure matching expected format
    // Return the collection data directly with the name as the key
    const collectionData = {
      modes: [{ modeId: "default", name: "Default" }],
      variables,
    };

    return {
      [name]: collectionData,
    };
  }

  private analyzeStructure(data: any): StructureInfo {
    // Use the flattened tokens to get accurate counts
    const flatTokens = this.flattenTokens(data);
    const tokenCount = Object.keys(flatTokens).length;

    let referenceCount = 0;

    // Count references in flattened tokens
    for (const token of Object.values(flatTokens)) {
      if (token && typeof token === "object") {
        const value = (token as any).$value;
        if (typeof value === "string" && value.includes("{")) {
          referenceCount++;
        }
      }
    }

    return {
      hasCollections: tokenCount > 0,
      hasModes: false,
      hasArrayWrapper: false,
      tokenCount,
      referenceCount,
      propertyFormat: "$type/$value",
      namingConvention: "dot-notation",
      referenceFormat: "curly-brace",
    };
  }
}
