// Tokens Studio Format Adapter - Enhanced cross-collection reference resolution
import type {
  FormatAdapter,
  FormatDetectionResult,
  NormalizationResult,
  StructureInfo,
  TransformationLog,
} from "../format-adapter";
import { TokenFormatType } from "../format-adapter";
import type { ProcessedToken } from "../processor";

export class TokensStudioAdapter implements FormatAdapter {
  name = "Tokens Studio Format";

  detect(data: any): FormatDetectionResult {
    let confidence = 0;
    const warnings: string[] = [];

    if (typeof data === "object" && !Array.isArray(data) && data !== null) {
      confidence += 0.2;

      // Look for Tokens Studio specific metadata
      if (data.$themes || data.$metadata || data["$themes"]) {
        confidence += 0.4;
      }

      // Check for token sets (common in Tokens Studio)
      const keys = Object.keys(data);
      const hasTokenSets = keys.some(
        (key) =>
          data[key] &&
          typeof data[key] === "object" &&
          !key.startsWith("$") &&
          Object.values(data[key]).some(
            (token: any) =>
              token &&
              typeof token === "object" &&
              (token.value !== undefined || token.$value !== undefined)
          )
      );

      if (hasTokenSets) {
        confidence += 0.3;
      }

      // Enhanced pattern detection for Tokens Studio
      const sampleTokens = this.getSampleTokens(data);
      let tokensStudioPatterns = 0;

      for (const token of sampleTokens) {
        if (token && typeof token === "object") {
          // Tokens Studio often has both value and resolved value
          if (token.value !== undefined && token.rawValue !== undefined) {
            tokensStudioPatterns++;
          }
          // Or uses specific reference patterns
          if (typeof token.value === "string" && token.value.startsWith("{")) {
            tokensStudioPatterns++;
          }
          // Check for type property (common in Tokens Studio)
          if (token.type !== undefined) {
            tokensStudioPatterns++;
          }
        }
      }

      if (tokensStudioPatterns > 0) {
        confidence +=
          (tokensStudioPatterns / Math.min(sampleTokens.length, 5)) * 0.1;
      }
    }

    return {
      format: TokenFormatType.TOKENS_STUDIO_FLAT,
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
      console.log("🔄 Tokens Studio: Starting normalization");

      // Extract token sets and build comprehensive reference map
      const tokenSets = this.extractTokenSets(data, transformations);

      if (Object.keys(tokenSets).length === 0) {
        errors.push("No valid token sets found in Tokens Studio data");
        return {
          data: [],
          transformations,
          warnings,
          errors,
          success: false,
        };
      }

      console.log(`📦 Found ${Object.keys(tokenSets).length} token sets`);

      // Build comprehensive reference map BEFORE processing tokens
      const referenceMap = this.buildEnhancedReferenceMap(tokenSets);
      console.log(`🗺️  Built reference map with ${referenceMap.size} mappings`);

      // Transform each token set with enhanced reference resolution
      const normalizedCollections: any[] = [];

      for (const [setName, tokens] of Object.entries(tokenSets)) {
        console.log(
          `🔄 Processing token set: ${setName} (${Object.keys(tokens).length} tokens)`
        );
        const collection = this.transformTokenSet(
          setName,
          tokens,
          transformations,
          referenceMap
        );
        normalizedCollections.push(collection);
      }

      console.log("✅ Tokens Studio: Normalization complete");

      return {
        data: normalizedCollections,
        transformations,
        warnings,
        errors,
        success: true,
      };
    } catch (error) {
      console.error("❌ Tokens Studio: Normalization failed:", error);
      errors.push(
        `Tokens Studio normalization failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
    return this.detect(data).confidence > 0.4;
  }

  private extractTokenSets(
    data: any,
    transformations: TransformationLog[]
  ): Record<string, any> {
    const tokenSets: Record<string, any> = {};

    // Skip metadata and theme objects
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith("$") || !value || typeof value !== "object") {
        continue;
      }

      // Check if this looks like a token set
      if (this.isTokenSet(value)) {
        tokenSets[key] = value;
      }
    }

    if (Object.keys(tokenSets).length > 0) {
      transformations.push({
        type: "structure",
        description: "Extracted token sets from Tokens Studio format",
        before: "Tokens Studio grouped structure",
        after: "Collection-based structure",
      });
    }

    return tokenSets;
  }

  private isTokenSet(data: any): boolean {
    if (!data || typeof data !== "object") return false;

    // Check if object contains token-like properties
    const values = Object.values(data);
    const tokenLikeCount = values.filter(
      (value) =>
        value &&
        typeof value === "object" &&
        ((value as any).value !== undefined ||
          (value as any).$value !== undefined)
    ).length;

    return tokenLikeCount > 0;
  }

  private buildEnhancedReferenceMap(
    tokenSets: Record<string, any>
  ): Map<string, string> {
    const referenceMap = new Map<string, string>();

    console.log("🔍 Building enhanced reference map...");
    console.log("Token sets found:", Object.keys(tokenSets));

    // Build comprehensive mappings for cross-collection references
    for (const [setName, tokens] of Object.entries(tokenSets)) {
      console.log(
        `Processing set: ${setName} with tokens:`,
        Object.keys(tokens)
      );

      for (const tokenName of Object.keys(tokens)) {
        const fullPath = `${setName}.${tokenName}`;

        // 1. Direct full path mapping
        referenceMap.set(tokenName, fullPath);
        console.log(`✅ Mapped: ${tokenName} -> ${fullPath}`);

        // 2. CRITICAL: Map token name without collection prefix for cross-references
        // This maps "color.accent" -> "Semantic.color.accent"
        referenceMap.set(tokenName, fullPath);
        console.log(`✅ Cross-ref mapping: ${tokenName} -> ${fullPath}`);

        // 2. Simple name mapping (last part after final dot)
        const simpleName = this.getSimpleTokenName(tokenName);
        if (simpleName !== tokenName && !referenceMap.has(simpleName)) {
          referenceMap.set(simpleName, fullPath);
          console.log(`✅ Mapped simple: ${simpleName} -> ${fullPath}`);
        }

        // 3. Hierarchical path mapping (for nested tokens)
        if (tokenName.includes(".")) {
          // Map the full hierarchical path
          referenceMap.set(tokenName, fullPath);
          console.log(`✅ Mapped hierarchical: ${tokenName} -> ${fullPath}`);

          // Map shorter versions of the path (working backwards)
          const parts = tokenName.split(".");
          for (let i = 1; i < parts.length; i++) {
            const partialPath = parts.slice(i).join(".");
            if (!referenceMap.has(partialPath)) {
              referenceMap.set(partialPath, fullPath);
              console.log(`✅ Mapped partial: ${partialPath} -> ${fullPath}`);
            }
          }

          // Also map the full path without dots for edge cases
          const pathWithoutFirstPart = parts.slice(1).join(".");
          if (pathWithoutFirstPart && !referenceMap.has(pathWithoutFirstPart)) {
            referenceMap.set(pathWithoutFirstPart, fullPath);
            console.log(
              `✅ Mapped path without first: ${pathWithoutFirstPart} -> ${fullPath}`
            );
          }
        }
      }
    }

    console.log(
      `✅ Reference map built with ${referenceMap.size} total mappings`
    );
    console.log("📋 All mappings:", Array.from(referenceMap.entries()));

    return referenceMap;
  }

  private areTokensSimilar(token1: string, token2: string): boolean {
    // Check if tokens are conceptually similar (same category/purpose)
    const parts1 = token1.toLowerCase().split(".");
    const parts2 = token2.toLowerCase().split(".");

    // If they share the same last part (e.g., "accent")
    if (parts1[parts1.length - 1] === parts2[parts2.length - 1]) {
      return true;
    }

    // If they share similar category terms
    const categories = [
      "color",
      "background",
      "text",
      "primary",
      "secondary",
      "accent",
    ];
    const shared = categories.filter(
      (cat) =>
        token1.toLowerCase().includes(cat) && token2.toLowerCase().includes(cat)
    );

    return shared.length > 0;
  }

  private transformTokenSet(
    setName: string,
    tokens: any,
    transformations: TransformationLog[],
    referenceMap: Map<string, string>
  ): any {
    const variables: Record<string, ProcessedToken> = {};

    for (const [tokenName, tokenData] of Object.entries(tokens)) {
      const processedToken = this.transformToken(
        tokenName,
        tokenData,
        transformations,
        referenceMap,
        setName
      );
      variables[tokenName] = processedToken;
    }

    return {
      [setName]: {
        modes: [{ modeId: "default", name: "Default" }],
        variables,
      },
    };
  }

  private transformToken(
    tokenName: string,
    tokenData: any,
    transformations: TransformationLog[],
    referenceMap: Map<string, string>,
    currentSet: string
  ): ProcessedToken {
    const token = tokenData as any;

    // Extract value (Tokens Studio can have multiple value properties)
    let value = token.$value ?? token.value ?? token.rawValue ?? token;
    let type = token.$type ?? token.type;
    const description =
      token.$description ?? token.description ?? token.comment;

    // Handle Tokens Studio specific value resolution
    if (token.value !== undefined && token.rawValue !== undefined) {
      // Use resolved value if available, but preserve references if they exist
      if (typeof token.rawValue === "string" && token.rawValue.includes("{")) {
        value = token.rawValue; // Keep reference for resolution
      } else {
        value = token.value; // Use resolved value
      }

      transformations.push({
        type: "value-resolution",
        description: `Resolved Tokens Studio value for ${currentSet}.${tokenName}`,
        before: `rawValue: ${token.rawValue}`,
        after: `value: ${value}`,
      });
    }

    // Enhanced cross-collection reference resolution
    if (typeof value === "string" && value.includes("{")) {
      const fixedValue = this.fixCrossCollectionReferences(
        value,
        referenceMap,
        transformations,
        `${currentSet}.${tokenName}`
      );
      if (fixedValue !== value) {
        value = fixedValue;
      }
    }

    // Infer type if not provided
    if (!type) {
      type = this.inferType(value);
      transformations.push({
        type: "type-inference",
        description: `Inferred type for ${currentSet}.${tokenName}`,
        before: "No type specified",
        after: type,
      });
    }

    // Normalize property names
    if (token.value !== undefined && token.$value === undefined) {
      transformations.push({
        type: "property-normalization",
        description: `Converted "value" to "$value" for ${currentSet}.${tokenName}`,
        before: '"value"',
        after: '"$value"',
      });
    }

    return {
      $type: type,
      $value: value,
      $description: description,
    };
  }

  private fixCrossCollectionReferences(
    value: string,
    referenceMap: Map<string, string>,
    transformations: TransformationLog[],
    tokenPath: string
  ): string {
    // Enhanced reference resolution with multiple fallback strategies
    return value.replace(/\{([^}]+)\}/g, (match, refToken) => {
      console.log(`🔍 Resolving reference: ${refToken} in token: ${tokenPath}`);

      // Strategy 1: Direct mapping
      if (referenceMap.has(refToken)) {
        const fullPath = referenceMap.get(refToken)!;
        const newRef = `{${fullPath}}`;

        console.log(`✅ Direct mapping: ${refToken} -> ${fullPath}`);

        transformations.push({
          type: "cross-collection-reference",
          description: `Fixed cross-collection reference in ${tokenPath}`,
          before: match,
          after: newRef,
        });

        return newRef;
      }

      // Strategy 2: Search all mappings for partial matches
      for (const [key, fullPath] of referenceMap.entries()) {
        if (
          key === refToken ||
          key.endsWith("." + refToken) ||
          key.endsWith(refToken)
        ) {
          const newRef = `{${fullPath}}`;

          console.log(`✅ Partial match: ${refToken} -> ${fullPath}`);

          transformations.push({
            type: "cross-collection-reference",
            description: `Fixed cross-collection reference via search in ${tokenPath}`,
            before: match,
            after: newRef,
          });

          return newRef;
        }
      }

      console.log(`❌ No mapping found for: ${refToken}`);
      console.log(`Available keys:`, Array.from(referenceMap.keys()));

      return match;
    });
  }

  private getTokenSimilarityScore(token1: string, token2: string): number {
    // Simple similarity scoring based on shared terms
    const parts1 = token1.toLowerCase().split(".");
    const parts2 = token2.toLowerCase().split(".");

    const sharedParts = parts1.filter((part) => parts2.includes(part));
    const totalParts = Math.max(parts1.length, parts2.length);

    return sharedParts.length / totalParts;
  }

  private getSimpleTokenName(tokenPath: string): string {
    const parts = tokenPath.split(".");
    return parts[parts.length - 1];
  }

  private inferType(value: any): string {
    if (typeof value === "string") {
      // Colors (hex, rgb, hsl)
      if (value.match(/^#[0-9a-fA-F]{3,6}$/)) return "color";
      if (value.match(/^rgb\(/)) return "color";
      if (value.match(/^hsl\(/)) return "color";

      // Dimensions
      if (value.match(/^\d+(\.\d+)?(px|rem|em|%)$/)) return "dimension";

      // Font sizes
      if (
        value.match(/^\d+(\.\d+)?px$/) &&
        parseFloat(value) >= 8 &&
        parseFloat(value) <= 200
      ) {
        return "fontSize";
      }

      // Numbers as strings
      if (value.match(/^\d+(\.\d+)?$/)) return "number";

      // References - infer from context
      if (value.includes("{")) {
        const lowerValue = value.toLowerCase();
        if (lowerValue.includes("color") || lowerValue.includes("background"))
          return "color";
        if (lowerValue.includes("space") || lowerValue.includes("size"))
          return "dimension";
        return "string";
      }
    }

    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";

    return "string";
  }

  private getSampleTokens(data: any): any[] {
    const tokens: any[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith("$")) continue;

      if (value && typeof value === "object") {
        const setTokens = Object.values(value).slice(0, 3);
        tokens.push(...setTokens);

        if (tokens.length >= 5) break;
      }
    }

    return tokens.slice(0, 5);
  }

  private analyzeStructure(data: any): StructureInfo {
    let tokenCount = 0;
    let referenceCount = 0;
    let hasCollections = false;

    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      for (const [key, value] of Object.entries(data)) {
        if (!key.startsWith("$") && value && typeof value === "object") {
          hasCollections = true;
          const setTokens = Object.values(value);
          tokenCount += setTokens.length;

          // Count references
          for (const token of setTokens) {
            if (token && typeof token === "object") {
              const tokenValue = (token as any).value ?? (token as any).$value;
              if (typeof tokenValue === "string" && tokenValue.includes("{")) {
                referenceCount++;
              }
            }
          }
        }
      }
    }

    return {
      hasCollections,
      hasModes: false,
      hasArrayWrapper: false,
      tokenCount,
      referenceCount,
      propertyFormat: "mixed",
      namingConvention: "mixed",
      referenceFormat: "curly-brace",
    };
  }
}
