/**
 * FigmaVariableImporter
 *
 * Converts existing Figma Variables to W3C DTCG format tokens
 * Handles multiple collections, multiple modes, and all variable types
 */

interface VariableDetectionResult {
  hasVariables: boolean;
  totalVariables: number;
  collections: {
    id: string;
    name: string;
    variableCount: number;
    modes: Array<{ modeId: string; name: string }>;
  }[];
}

interface DTCGToken {
  $type: "color" | "dimension" | "string" | "number" | "boolean";
  $value: string | number | boolean;
  $description?: string;
}

interface DTCGCollection {
  [tokenName: string]: DTCGToken | DTCGTokenGroup;
}

interface DTCGTokenGroup {
  [key: string]: DTCGToken | DTCGTokenGroup;
}

interface ProgressCallback {
  (current: number, total: number, message: string): void;
}

export class FigmaVariableImporter {
  /**
   * Detects if file has any Figma Variables
   */
  static async detectVariables(): Promise<VariableDetectionResult> {
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();

    const collectionsData = await Promise.all(
      collections.map(async (collection) => {
        const variables = await Promise.all(
          collection.variableIds.map((id) =>
            figma.variables.getVariableByIdAsync(id)
          )
        );
        const validVariables = variables.filter(
          (v): v is Variable => v !== null
        );

        return {
          id: collection.id,
          name: collection.name,
          variableCount: validVariables.length,
          modes: collection.modes.map((mode) => ({
            modeId: mode.modeId,
            name: mode.name,
          })),
        };
      })
    );

    const totalVariables = collectionsData.reduce(
      (sum, col) => sum + col.variableCount,
      0
    );

    return {
      hasVariables: totalVariables > 0,
      totalVariables,
      collections: collectionsData,
    };
  }

  /**
   * Converts all Figma Variables to W3C DTCG format
   * Returns one file per collection per mode
   * Supports chunked processing with progress callbacks for large collections
   * @param onProgress - Optional callback for progress updates
   * @param collectionIds - Optional array of collection IDs to filter by
   */
  static async convertToTokens(
    onProgress?: ProgressCallback,
    collectionIds?: string[] | null
  ): Promise<
    Array<{
      collectionName: string;
      modeName: string;
      tokens: DTCGCollection;
      tokenCount: number;
    }>
  > {
    let collections = await figma.variables.getLocalVariableCollectionsAsync();

    // Filter collections if specific IDs were provided
    if (collectionIds && collectionIds.length > 0) {
      collections = collections.filter((col) => collectionIds.includes(col.id));
    }

    const results: Array<{
      collectionName: string;
      modeName: string;
      tokens: DTCGCollection;
      tokenCount: number;
    }> = [];

    // Calculate total work units (collections × modes)
    const totalWorkUnits = collections.reduce(
      (sum, col) => sum + col.modes.length,
      0
    );
    let completedWorkUnits = 0;

    for (const collection of collections) {
      // Process variables in chunks to avoid blocking UI
      const CHUNK_SIZE = 50;
      const variableIds = collection.variableIds;
      const allVariables: Variable[] = [];

      // Load variables in chunks
      for (let i = 0; i < variableIds.length; i += CHUNK_SIZE) {
        const chunk = variableIds.slice(i, i + CHUNK_SIZE);
        const chunkVariables = await Promise.all(
          chunk.map((id) => figma.variables.getVariableByIdAsync(id))
        );
        allVariables.push(
          ...chunkVariables.filter((v): v is Variable => v !== null)
        );

        // Allow UI to breathe between chunks
        if (variableIds.length > CHUNK_SIZE) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      // Generate tokens for each mode
      for (const mode of collection.modes) {
        const tokens: DTCGCollection = {};
        let tokenCount = 0;

        // Process variables in chunks
        for (let i = 0; i < allVariables.length; i += CHUNK_SIZE) {
          const chunk = allVariables.slice(i, i + CHUNK_SIZE);

          for (const variable of chunk) {
            const token = await this.convertVariableToToken(
              variable,
              mode.modeId
            );
            if (token) {
              // Use variable name as token path
              this.setNestedToken(tokens, variable.name, token);
              tokenCount++;
            }
          }

          // Allow UI to breathe between chunks
          if (allVariables.length > CHUNK_SIZE) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }

        results.push({
          collectionName: collection.name,
          modeName: mode.name,
          tokens,
          tokenCount,
        });

        // Report progress
        completedWorkUnits++;
        if (onProgress) {
          onProgress(
            completedWorkUnits,
            totalWorkUnits,
            `Converting ${collection.name} (${mode.name}): ${tokenCount} tokens`
          );
        }
      }
    }

    return results;
  }

  /**
   * Convert single Figma Variable to DTCG token
   */
  private static async convertVariableToToken(
    variable: Variable,
    modeId: string
  ): Promise<DTCGToken | null> {
    const value = variable.valuesByMode[modeId];
    if (value === undefined) return null;

    // Handle variable aliases (references to other variables)
    if (
      typeof value === "object" &&
      "type" in value &&
      value.type === "VARIABLE_ALIAS"
    ) {
      const aliasedVariable = await figma.variables.getVariableByIdAsync(
        value.id
      );
      if (aliasedVariable) {
        return {
          $type: this.mapVariableType(variable.resolvedType),
          $value: `{${aliasedVariable.name}}`,
          $description: variable.description || undefined,
        };
      }
      return null;
    }

    // Convert based on variable type
    switch (variable.resolvedType) {
      case "COLOR":
        return {
          $type: "color",
          $value: this.rgbToHex(value as RGB | RGBA),
          $description: variable.description || undefined,
        };

      case "FLOAT":
        return {
          $type: "number",
          $value: value as number,
          $description: variable.description || undefined,
        };

      case "STRING":
        return {
          $type: "string",
          $value: value as string,
          $description: variable.description || undefined,
        };

      case "BOOLEAN":
        return {
          $type: "boolean",
          $value: value as boolean,
          $description: variable.description || undefined,
        };

      default:
        console.warn(`Unknown variable type: ${variable.resolvedType}`);
        return null;
    }
  }

  /**
   * Map Figma variable type to DTCG type
   */
  private static mapVariableType(
    type: VariableResolvedDataType
  ): "color" | "dimension" | "string" | "number" | "boolean" {
    switch (type) {
      case "COLOR":
        return "color";
      case "FLOAT":
        return "number";
      case "STRING":
        return "string";
      case "BOOLEAN":
        return "boolean";
      default:
        return "string";
    }
  }

  /**
   * Convert RGB(A) to hex color
   */
  private static rgbToHex(color: RGB | RGBA): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);

    const toHex = (n: number) => n.toString(16).padStart(2, "0");

    if ("a" in color && color.a < 1) {
      const a = Math.round(color.a * 255);
      return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Set nested token using dot-notation path
   * e.g., "color.primary.500" -> { color: { primary: { 500: token } } }
   */
  private static setNestedToken(
    obj: DTCGCollection,
    path: string,
    token: DTCGToken
  ): void {
    // Split by / or . to create nested structure
    const parts = path.split(/[/.]/);
    let current: any = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = token;
  }

  /**
   * Generate downloadable JSON files for export
   */
  static generateDownloadableFiles(
    tokenSets: Array<{
      collectionName: string;
      modeName: string;
      tokens: DTCGCollection;
      tokenCount: number;
    }>
  ): Array<{
    filename: string;
    content: string;
  }> {
    return tokenSets.map((set) => {
      const filename =
        set.modeName === "Mode 1" || set.modeName === "Default"
          ? `${set.collectionName}.json`
          : `${set.collectionName}-${set.modeName}.json`;

      return {
        filename: this.sanitizeFilename(filename),
        content: JSON.stringify(set.tokens, null, 2),
      };
    });
  }

  /**
   * Sanitize filename for download
   */
  private static sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
