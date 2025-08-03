// Generic Fallback Adapter - Handles flat token structures
import type {
  FormatAdapter,
  FormatDetectionResult,
  NormalizationResult,
  StructureInfo,
  TransformationLog,
} from "../format-adapter";
import { TokenFormatType } from "../format-adapter";
import type { ProcessedToken } from "../processor";

export class GenericAdapter implements FormatAdapter {
  name = "Generic Fallback";

  detect(data: any): FormatDetectionResult {
    let confidence = 0;
    const warnings: string[] = [];

    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      confidence += 0.1;

      const keys = Object.keys(data);
      if (keys.length === 0) {
        return {
          format: TokenFormatType.CUSTOM_FLAT,
          confidence: 0,
          structure: this.analyzeStructure(data),
          warnings,
        };
      }

      // Enhanced detection for flat token structures
      let flatTokenLikeCount = 0;
      let referenceCount = 0;

      for (const [key, value] of Object.entries(data)) {
        // Skip metadata properties
        if (key.startsWith("$")) continue;

        if (this.looksLikeToken(value)) {
          flatTokenLikeCount++;

          // Bonus confidence for @ references (common in custom formats)
          if (typeof value === "string" && value.startsWith("@")) {
            referenceCount++;
          }
        }
      }

      const tokenRatio = flatTokenLikeCount / keys.length;

      if (tokenRatio > 0.5) {
        confidence += 0.4; // Higher confidence for good token ratio

        if (tokenRatio > 0.8) {
          confidence += 0.3; // Even higher for mostly tokens
        }

        // Strong bonus for @ references (indicates custom flat token system)
        if (referenceCount > 0) {
          confidence += 0.3;
          warnings.push(
            "Detected @ reference format - will normalize to {token.name}"
          );
        }

        // Check for flat naming patterns
        if (
          keys.some(
            (k) =>
              k.includes("_") &&
              (k.includes("color") ||
                k.includes("space") ||
                k.includes("text") ||
                k.includes("brand") ||
                k.includes("neutral"))
          )
        ) {
          confidence += 0.2;
        }
      }

      warnings.push(
        "Using generic fallback adapter - may not preserve all token properties"
      );
    }

    return {
      format: TokenFormatType.CUSTOM_FLAT,
      confidence: Math.min(confidence, 0.95), // Higher cap for flat structures
      structure: this.analyzeStructure(data),
      warnings,
    };
  }

  normalize(data: any): NormalizationResult {
    const transformations: TransformationLog[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      console.log(
        "🔄 Generic: Starting normalization for flat token structure"
      );

      // Extract tokens directly from flat structure
      const tokens = this.extractFlatTokens(data);

      if (Object.keys(tokens).length === 0) {
        errors.push("No recognizable tokens found in flat structure");
        return {
          data: [],
          transformations,
          warnings,
          errors,
          success: false,
        };
      }

      console.log(`📦 Generic: Extracted ${Object.keys(tokens).length} tokens`);

      transformations.push({
        type: "flat-structure-extraction",
        description: "Converted flat token structure to collection format",
        before: "Flat object with direct key-value pairs",
        after: "Structured token collection",
      });

      const collection = this.createTokenCollection(tokens, transformations);

      console.log("✅ Generic: Normalization completed");

      return {
        data: [collection],
        transformations,
        warnings,
        errors,
        success: true,
      };
    } catch (error) {
      console.error("❌ Generic: Normalization failed:", error);
      errors.push(
        `Generic normalization failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
    return typeof data === "object" && data !== null && !Array.isArray(data);
  }

  private extractFlatTokens(data: any): Record<string, any> {
    const tokens: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      // Skip metadata properties
      if (key.startsWith("$")) continue;

      // Include all non-metadata properties for flat structures
      tokens[key] = value;
    }

    return tokens;
  }

  private looksLikeToken(value: any): boolean {
    if (typeof value === "string") {
      // Color values
      if (value.match(/^#[0-9a-fA-F]{3,6}$/)) return true;
      // Dimension values
      if (value.match(/^\d+(\.\d+)?(px|rem|em|%|vh|vw)?$/)) return true;
      // References (multiple formats)
      if (
        value.includes("{") ||
        value.startsWith("var(") ||
        value.startsWith("@")
      )
        return true;
      // Font families
      if (value.includes(",") || /serif|sans|monospace/i.test(value))
        return true;
    }

    if (typeof value === "number") return true;
    if (typeof value === "boolean") return true;

    // Object with value property
    if (typeof value === "object" && value !== null) {
      return value.value !== undefined || value.$value !== undefined;
    }

    return false;
  }

  private createTokenCollection(
    tokens: Record<string, any>,
    transformations: TransformationLog[]
  ): any {
    const variables: Record<string, ProcessedToken> = {};

    for (const [tokenName, tokenData] of Object.entries(tokens)) {
      const processedToken = this.processToken(
        tokenName,
        tokenData,
        transformations
      );
      variables[tokenName] = processedToken;
    }

    return {
      Tokens: {
        modes: [{ modeId: "default", name: "Default" }],
        variables,
      },
    };
  }

  private processToken(
    tokenName: string,
    tokenData: any,
    transformations: TransformationLog[]
  ): ProcessedToken {
    let value = tokenData;
    let type = "string";
    let description = undefined;

    // Handle object-wrapped tokens
    if (typeof tokenData === "object" && tokenData !== null) {
      value = tokenData.$value ?? tokenData.value ?? tokenData;
      type = tokenData.$type ?? tokenData.type ?? this.inferType(value);
      description =
        tokenData.$description ?? tokenData.description ?? tokenData.comment;

      if (tokenData.value !== undefined && tokenData.$value === undefined) {
        transformations.push({
          type: "property-normalization",
          description: `Converted "value" to "$value" for ${tokenName}`,
          before: "value property",
          after: "$value property",
        });
      }
    } else {
      // Direct value - handle @ references BEFORE type inference
      if (typeof tokenData === "string" && tokenData.startsWith("@")) {
        const referencedToken = tokenData.substring(1); // Remove @
        value = `{${referencedToken}}`;

        transformations.push({
          type: "reference-normalization",
          description: `Normalized @ reference in ${tokenName}`,
          before: tokenData,
          after: value,
        });
      } else {
        value = tokenData;
      }

      // Infer type and create structure
      type = this.inferType(value);

      transformations.push({
        type: "token-structure-creation",
        description: `Created token structure for ${tokenName}`,
        before: `Raw value: ${tokenData}`,
        after: `Structured token with type: ${type}`,
      });
    }

    // Ensure we always return a proper token structure
    return {
      $type: type,
      $value: value,
      $description: description || `Token generated by generic adapter`,
    };
  }

  private inferType(value: any): string {
    if (typeof value === "string") {
      // Handle references first (before color detection)
      if (
        value.includes("{") ||
        value.startsWith("var(") ||
        value.startsWith("@")
      ) {
        // Try to infer type from reference context
        const lowerValue = value.toLowerCase();
        if (
          lowerValue.includes("color") ||
          lowerValue.includes("background") ||
          lowerValue.includes("text")
        ) {
          return "color";
        }
        if (
          lowerValue.includes("space") ||
          lowerValue.includes("spacing") ||
          lowerValue.includes("margin") ||
          lowerValue.includes("padding")
        ) {
          return "dimension";
        }
        if (lowerValue.includes("font") && lowerValue.includes("size")) {
          return "fontSize";
        }
        if (lowerValue.includes("radius")) {
          return "dimension";
        }
        return "string";
      }

      // Color values
      if (value.match(/^#[0-9a-fA-F]{3,6}$/)) return "color";
      if (value.match(/^rgb\(/)) return "color";
      if (value.match(/^hsl\(/)) return "color";

      // Dimension values
      if (value.match(/^\d+(\.\d+)?(px|rem|em|%|vh|vw)$/)) return "dimension";

      // Font families
      if (value.includes(",") || /serif|sans|monospace/i.test(value)) {
        return "fontFamily";
      }

      // Numeric strings
      if (value.match(/^\d+(\.\d+)?$/)) return "number";
    }

    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    return "string";
  }

  private analyzeStructure(data: any): StructureInfo {
    let tokenCount = 0;
    let referenceCount = 0;
    let hasReferences = false;

    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      const entries = Object.entries(data);
      tokenCount = entries.filter(([key]) => !key.startsWith("$")).length;

      // Count references
      for (const [key, value] of entries) {
        if (key.startsWith("$")) continue;

        if (
          typeof value === "string" &&
          (value.includes("{") ||
            value.includes("var(") ||
            value.startsWith("@"))
        ) {
          referenceCount++;
          hasReferences = true;
        }
      }
    }

    return {
      hasCollections: false,
      hasModes: false,
      hasArrayWrapper: Array.isArray(data),
      tokenCount,
      referenceCount,
      propertyFormat: "other",
      namingConvention: "mixed",
      referenceFormat: hasReferences ? "other" : "none",
    };
  }
}
