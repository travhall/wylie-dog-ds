// Style Dictionary Flat Format Adapter - Handles flat token objects
import type {
  FormatAdapter,
  FormatDetectionResult,
  NormalizationResult,
  StructureInfo,
  TransformationLog,
} from "../format-adapter";
import { TokenFormatType } from "../format-adapter";
import type { ExportData, ProcessedToken } from "../processor";

/** Loosely-typed Style Dictionary token (both `value`/`$value` conventions). */
type LooseSDToken = {
  $value?: unknown;
  value?: unknown;
  $type?: unknown;
  type?: unknown;
  $description?: unknown;
  description?: unknown;
  comment?: unknown;
};

export class StyleDictionaryFlatAdapter implements FormatAdapter {
  name = "Style Dictionary Flat Format";

  detect(data: unknown): FormatDetectionResult {
    let confidence = 0;
    const warnings: string[] = [];

    // Check for flat object structure (not array)
    if (typeof data === "object" && !Array.isArray(data) && data !== null) {
      confidence += 0.2;
      const record = data as Record<string, unknown>;

      // Look for hierarchical keys like 'color.primary.500'
      const keys = Object.keys(record);
      const hierarchicalKeys = keys.filter((key) => key.includes("."));
      if (hierarchicalKeys.length > 0) {
        confidence += 0.3;
      }

      // Check for Style Dictionary token structure
      const sampleTokens = keys.slice(0, 5);
      let validTokenCount = 0;

      for (const key of sampleTokens) {
        const token = record[key] as LooseSDToken | null;
        if (token && typeof token === "object") {
          // Check for value property (Style Dictionary format)
          if (token.value !== undefined || token.$value !== undefined) {
            validTokenCount++;
          }
        }
      }

      if (validTokenCount > 0) {
        confidence += (validTokenCount / sampleTokens.length) * 0.5;
      }

      // Additional heuristics
      if (keys.some((key) => key.startsWith("color."))) confidence += 0.1;
      if (keys.some((key) => key.startsWith("spacing."))) confidence += 0.1;
      if (keys.some((key) => key.startsWith("typography."))) confidence += 0.1;
    }

    return {
      format: TokenFormatType.STYLE_DICTIONARY_FLAT,
      confidence: Math.min(confidence, 1.0),
      structure: this.analyzeStructure(data),
      warnings,
    };
  }

  normalize(data: unknown): NormalizationResult {
    const transformations: TransformationLog[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      console.log("🔄 Style Dictionary Flat: Starting normalization");

      // Group tokens by collection prefix
      const collections = this.groupByCollection(data);
      transformations.push({
        type: "structure",
        description: "Grouped flat tokens into collections",
        before: "Flat object structure",
        after: "Collection-based structure",
      });

      console.log(
        `📦 Grouped into ${Object.keys(collections).length} collections`
      );

      // Transform each collection
      const normalizedCollections: ExportData[] = [];

      for (const [collectionName, tokens] of Object.entries(collections)) {
        console.log(
          `🔄 Processing collection: ${collectionName} (${Object.keys(tokens).length} tokens)`
        );
        const collection = this.transformCollection(
          collectionName,
          tokens,
          transformations
        );
        normalizedCollections.push(collection);
      }

      console.log("✅ Style Dictionary Flat: Normalization complete");

      return {
        data: normalizedCollections,
        transformations,
        warnings,
        errors,
        success: true,
      };
    } catch (error) {
      console.error("❌ Style Dictionary Flat: Normalization failed:", error);
      errors.push(
        `Normalization failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
  validate(data: unknown): boolean {
    return this.detect(data).confidence > 0.5;
  }

  private groupByCollection(
    data: unknown
  ): Record<string, Record<string, unknown>> {
    const collections: Record<string, Record<string, unknown>> = {};

    if (typeof data !== "object" || data === null) return collections;

    for (const [tokenPath, tokenData] of Object.entries(data)) {
      // Extract collection name from token path (e.g., 'color.primary.500' → 'color')
      const parts = tokenPath.split(".");
      const collectionName = parts[0] || "default";

      if (!collections[collectionName]) {
        collections[collectionName] = {};
      }

      collections[collectionName][tokenPath] = tokenData;
    }

    return collections;
  }

  private transformCollection(
    name: string,
    tokens: Record<string, unknown>,
    transformations: TransformationLog[]
  ): ExportData {
    const variables: Record<string, ProcessedToken> = {};

    for (const [tokenPath, tokenData] of Object.entries(tokens)) {
      const processedToken = this.transformToken(tokenData, transformations);
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

  private transformToken(
    tokenData: unknown,
    transformations: TransformationLog[]
  ): ProcessedToken {
    // Handle different property naming conventions
    const obj = (
      typeof tokenData === "object" && tokenData !== null ? tokenData : {}
    ) as LooseSDToken;
    const value = obj.$value ?? obj.value ?? tokenData;
    let type = (obj.$type ?? obj.type ?? "") as string;
    const description = (obj.$description ?? obj.description ?? obj.comment) as
      string | undefined;

    // If no type provided, infer it
    if (!type) {
      type = this.inferType(value);
      transformations.push({
        type: "type-inference",
        description: `Inferred type for token`,
        before: "No type specified",
        after: type,
      });
    }

    // Normalize property names if needed
    if (obj.value !== undefined && obj.$value === undefined) {
      transformations.push({
        type: "property-normalization",
        description: 'Converted "value" to "$value"',
        before: '"value"',
        after: '"$value"',
      });
    }

    if (obj.type !== undefined && obj.$type === undefined) {
      transformations.push({
        type: "property-normalization",
        description: 'Converted "type" to "$type"',
        before: '"type"',
        after: '"$type"',
      });
    }

    return {
      $type: type,
      $value: value,
      $description: description,
    };
  }

  private inferType(value: unknown): string {
    if (typeof value === "string") {
      // Hex colors
      if (value.match(/^#[0-9a-fA-F]{6}$/)) return "color";

      // Pixel dimensions
      if (value.match(/^\d+(\.\d+)?(px|rem|em)$/)) return "dimension";

      // Numbers as strings
      if (value.match(/^\d+(\.\d+)?$/)) return "number";

      // CSS variables (references)
      if (value.startsWith("var(") || value.includes("{")) return "reference";
    }

    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";

    return "string";
  }

  private analyzeStructure(data: unknown): StructureInfo {
    let tokenCount = 0;
    let referenceCount = 0;
    let propertyFormat: "type/value" | "$type/$value" | "mixed" | "other" =
      "other";

    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      const record = data as Record<string, unknown>;
      const keys = Object.keys(record);
      tokenCount = keys.length;

      // Analyze property format
      let hasTypeValue = 0;
      let hasDollarTypeValue = 0;

      for (const key of keys.slice(0, 5)) {
        // Sample first 5 tokens
        const token = record[key] as LooseSDToken | null;
        if (token && typeof token === "object") {
          if (token.type !== undefined && token.value !== undefined)
            hasTypeValue++;
          if (token.$type !== undefined && token.$value !== undefined)
            hasDollarTypeValue++;

          // Count references
          const value = token.$value ?? token.value;
          if (
            typeof value === "string" &&
            (value.includes("{") || value.startsWith("var("))
          ) {
            referenceCount++;
          }
        }
      }

      if (hasDollarTypeValue > hasTypeValue) {
        propertyFormat = "$type/$value";
      } else if (hasTypeValue > hasDollarTypeValue) {
        propertyFormat = "type/value";
      } else if (hasTypeValue > 0 || hasDollarTypeValue > 0) {
        propertyFormat = "mixed";
      }
    }

    return {
      hasCollections: false, // Flat structure doesn't have explicit collections
      hasModes: false,
      hasArrayWrapper: false,
      tokenCount,
      referenceCount,
      propertyFormat,
      namingConvention: "dot-notation", // Style Dictionary typically uses dot notation
      referenceFormat: this.detectReferenceFormat(data),
    };
  }

  private detectReferenceFormat(
    data: unknown
  ): "curly-brace" | "css-var" | "sass" | "other" | "none" {
    if (typeof data !== "object" || !data) return "none";

    for (const token of Object.values(data).slice(0, 10)) {
      if (token && typeof token === "object") {
        const t = token as LooseSDToken;
        const value = t.$value ?? t.value;
        if (typeof value === "string") {
          if (value.includes("{") && value.includes("}")) return "curly-brace";
          if (value.includes("var(--")) return "css-var";
          if (value.startsWith("$")) return "sass";
          if (value.includes("@")) return "other";
        }
      }
    }

    return "none";
  }
}
