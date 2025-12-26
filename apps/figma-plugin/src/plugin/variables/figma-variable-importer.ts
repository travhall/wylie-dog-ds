/**
 * Figma Variable Importer
 * Converts existing Figma Variables into W3C DTCG format tokens
 */

export interface VariableDetection {
  hasVariables: boolean;
  collections: VariableCollection[];
  totalVariables: number;
}

export interface ConversionResult {
  success: boolean;
  data: any[]; // W3C DTCG format (same as ExportData[])
  stats: {
    totalCollections: number;
    totalVariables: number;
    totalModes: number;
  };
  warnings: string[];
}

export class FigmaVariableImporter {
  /**
   * Detect existing variables in the current Figma file
   */
  async detectExistingVariables(): Promise<VariableDetection> {
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();

    let totalVariables = 0;
    for (const collection of collections) {
      totalVariables += collection.variableIds.length;
    }

    return {
      hasVariables: totalVariables > 0,
      collections,
      totalVariables,
    };
  }

  /**
   * Convert Figma Variables to W3C DTCG format
   */
  async convertToW3CDTCG(
    collections: VariableCollection[]
  ): Promise<ConversionResult> {
    const result: any[] = [];
    const warnings: string[] = [];
    let totalVariables = 0;
    let totalModes = 0;

    try {
      for (const collection of collections) {
        const collectionData: any = {
          modes: collection.modes.map((mode) => ({
            modeId: mode.modeId,
            name: mode.name,
          })),
          variables: {},
        };

        totalModes += collection.modes.length;

        // Process each variable in the collection
        for (const variableId of collection.variableIds) {
          const variable =
            await figma.variables.getVariableByIdAsync(variableId);
          if (!variable) {
            warnings.push(`Variable ${variableId} not found`);
            continue;
          }

          const token = this.convertVariableToToken(variable, collection);
          collectionData.variables[variable.name] = token;
          totalVariables++;
        }

        // Wrap in collection name
        result.push({
          [collection.name]: collectionData,
        });
      }

      return {
        success: true,
        data: result,
        stats: {
          totalCollections: collections.length,
          totalVariables,
          totalModes,
        },
        warnings,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        stats: {
          totalCollections: 0,
          totalVariables: 0,
          totalModes: 0,
        },
        warnings: [
          ...warnings,
          `Conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      };
    }
  }

  /**
   * Convert a single Figma Variable to W3C DTCG token format
   */
  private convertVariableToToken(
    variable: Variable,
    collection: VariableCollection
  ): any {
    const type = this.mapFigmaTypeToW3C(variable.resolvedType);

    // Handle single mode (simple case)
    if (collection.modes.length === 1) {
      const modeId = collection.modes[0].modeId;
      const value = this.convertFigmaValue(
        variable.valuesByMode[modeId],
        variable.resolvedType,
        variable
      );

      const token: any = {
        $type: type,
        $value: value,
      };

      if (variable.description) {
        token.$description = variable.description;
      }

      return token;
    }

    // Handle multiple modes - use valuesByMode structure
    const valuesByMode: Record<string, any> = {};
    for (const mode of collection.modes) {
      const value = this.convertFigmaValue(
        variable.valuesByMode[mode.modeId],
        variable.resolvedType,
        variable
      );
      valuesByMode[mode.name] = value;
    }

    const token: any = {
      $type: type,
      valuesByMode,
    };

    if (variable.description) {
      token.$description = variable.description;
    }

    return token;
  }

  /**
   * Map Figma variable types to W3C DTCG types
   */
  private mapFigmaTypeToW3C(figmaType: VariableResolvedDataType): string {
    const typeMap: Record<string, string> = {
      COLOR: "color",
      FLOAT: "dimension",
      STRING: "string",
      BOOLEAN: "boolean",
    };

    return typeMap[figmaType] || "string";
  }

  /**
   * Convert Figma variable values to W3C DTCG format
   */
  private convertFigmaValue(
    value: any,
    type: VariableResolvedDataType,
    variable: Variable
  ): any {
    // Handle variable aliases
    if (typeof value === "object" && value.type === "VARIABLE_ALIAS") {
      return `{${value.id}}`;
    }

    switch (type) {
      case "COLOR":
        return this.convertColor(value);

      case "FLOAT":
        // Return as string with px unit for dimensions
        return `${value}px`;

      case "STRING":
      case "BOOLEAN":
        return value;

      default:
        return value;
    }
  }

  /**
   * Convert Figma RGB color to OKLCH format
   */
  private convertColor(rgb: RGB | RGBA): string {
    // For now, convert to hex as fallback
    // TODO: Consider using culori for proper OKLCH conversion
    const r = Math.round((rgb.r || 0) * 255);
    const g = Math.round((rgb.g || 0) * 255);
    const b = Math.round((rgb.b || 0) * 255);

    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

    // Include alpha if present
    if ("a" in rgb && rgb.a !== undefined && rgb.a < 1) {
      const a = Math.round(rgb.a * 255);
      return hex + a.toString(16).padStart(2, "0");
    }

    return hex;
  }
}
