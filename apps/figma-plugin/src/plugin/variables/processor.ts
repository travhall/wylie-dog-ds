// Token processing utilities for Figma Variables to W3C DTCG format conversion

export interface ProcessedToken {
  $type: string;
  $value: any;
  $description?: string;
  name?: string; // Token name for validation purposes
  valuesByMode?: Record<string, any>; // For Figma import compatibility
}

export interface ProcessedCollection {
  modes?: Array<{ modeId: string; name: string }>; // Figma mode metadata
  variables: {
    [tokenName: string]: ProcessedToken;
  };
}

export interface ExportData {
  [collectionName: string]: ProcessedCollection;
}

// Global variable reference map for resolving aliases
let variableReferenceMap: Map<string, string> = new Map();

/**
 * Convert Figma RGB color (0-1 range) to hex format
 */
function rgbToHex(color: { r: number; g: number; b: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Build reference map from all collections to resolve aliases
 */
function buildVariableReferenceMap(allCollections: any[]): void {
  variableReferenceMap.clear();

  for (const collection of allCollections) {
    if (!collection.variables) continue;

    for (const variable of collection.variables) {
      const tokenName = createTokenName(variable.name);
      variableReferenceMap.set(variable.id, tokenName);
    }
  }

  console.log(
    `Built reference map with ${variableReferenceMap.size} variables`
  );
}

/**
 * Get correct W3C DTCG token type based on Figma type and scopes
 */
function getW3CTokenType(
  figmaType: string,
  scopes: string[],
  variableName: string
): string {
  switch (figmaType) {
    case "COLOR":
      return "color";

    case "FLOAT":
      // CRITICAL: Check for unitless number types FIRST

      // Font-weight: unitless numbers (100, 400, 700)
      if (
        variableName.toLowerCase().includes("fontweight") ||
        variableName.toLowerCase().includes("font-weight") ||
        (variableName.toLowerCase().includes("weight") &&
          !variableName.toLowerCase().includes("border"))
      ) {
        return "fontWeight";
      }

      // Z-index: unitless integers for stacking order
      if (
        variableName.toLowerCase().includes("z-index") ||
        variableName.toLowerCase().includes("zindex") ||
        (variableName.toLowerCase().includes("z.") &&
          (variableName.toLowerCase().includes("index") ||
            variableName.toLowerCase().includes("layer")))
      ) {
        return "number";
      }

      // Opacity: unitless 0-1 or 0-100 values
      if (variableName.toLowerCase().includes("opacity")) {
        return "number";
      }

      // Infer semantic type from scopes and name
      if (
        scopes.includes("FONT_SIZE") ||
        variableName.toLowerCase().includes("fontsize")
      ) {
        return "fontSize";
      }
      if (
        scopes.includes("LINE_HEIGHT") ||
        variableName.toLowerCase().includes("lineheight")
      ) {
        return "lineHeight";
      }
      if (
        scopes.includes("LETTER_SPACING") ||
        variableName.toLowerCase().includes("letterspacing")
      ) {
        return "letterSpacing";
      }
      if (
        scopes.includes("PARAGRAPH_SPACING") ||
        variableName.toLowerCase().includes("paragraph")
      ) {
        return "paragraphSpacing";
      }
      if (
        scopes.includes("GAP") ||
        scopes.includes("PADDING") ||
        scopes.includes("SPACING") ||
        variableName.toLowerCase().includes("spacing") ||
        variableName.toLowerCase().includes("space")
      ) {
        return "spacing";
      }
      if (
        scopes.includes("BORDER_RADIUS") ||
        variableName.toLowerCase().includes("radius")
      ) {
        return "borderRadius";
      }
      if (
        scopes.includes("WIDTH") ||
        scopes.includes("HEIGHT") ||
        variableName.toLowerCase().includes("size") ||
        variableName.toLowerCase().includes("height")
      ) {
        return "sizing";
      }
      if (
        variableName.toLowerCase().includes("borderwidth") ||
        variableName.toLowerCase().includes("border")
      ) {
        return "borderWidth";
      }

      // Default to dimension for other numeric values
      return "dimension";

    case "STRING":
      // CRITICAL: Check duration FIRST (before font checks)
      // Duration tokens are stored as strings like "150ms", "0.3s"
      // Also catches animation-duration tokens
      if (
        variableName.toLowerCase().includes("duration") ||
        variableName.toLowerCase().includes("transition") ||
        variableName.toLowerCase().includes("animation")
      ) {
        return "duration";
      }

      // Check for font size first (stored as string like "12px")
      if (variableName.toLowerCase().includes("fontsize")) {
        return "fontSize";
      }
      if (
        variableName.toLowerCase().includes("fontweight") ||
        variableName.toLowerCase().includes("weight")
      ) {
        return "fontWeight";
      }
      if (variableName.toLowerCase().includes("lineheight")) {
        return "lineHeight";
      }
      if (variableName.toLowerCase().includes("letterspacing")) {
        return "letterSpacing";
      }
      if (
        variableName.toLowerCase().includes("fontfamily") ||
        variableName.toLowerCase().includes("font")
      ) {
        return "fontFamily";
      }
      if (variableName.toLowerCase().includes("shadow")) {
        return "shadow";
      }
      return "fontFamily"; // Default for strings

    case "BOOLEAN":
      return "boolean";

    default:
      return "other";
  }
}

/**
 * Format numeric values with appropriate units
 * Returns number for unitless types, string for types with units
 */
function formatNumericValue(value: number, tokenType: string): string | number {
  switch (tokenType) {
    case "fontSize":
    case "letterSpacing":
    case "paragraphSpacing":
    case "spacing":
    case "borderRadius":
    case "sizing":
    case "borderWidth":
    case "dimension":
      return `${value}px`;
    case "lineHeight":
      return `${value}%`;
    case "fontWeight":
    case "number":
      // CRITICAL: These must remain as numbers (not strings)
      // - fontWeight: 100, 200, 300, etc. (numbers)
      // - number (z-index, opacity, etc.): 0, 1, 10, 100 (numbers)
      return value;
    default:
      return value.toString();
  }
}

/**
 * Process a single variable across all modes into W3C DTCG token format
 */
function processVariable(variable: any, modes: any[]): ProcessedToken {
  // Check for stored original type first (preserves round-trip fidelity)
  const storedType = variable.originalType;
  const inferredType = getW3CTokenType(
    variable.resolvedType,
    variable.scopes,
    variable.name
  );
  const tokenType = storedType || inferredType;

  if (storedType !== inferredType) {
    // console.log(
    //   `🔧 EXPORT: ${variable.name} - stored="${storedType || "none"}" inferred="${inferredType}" using="${tokenType}"`
    // );
  }

  const valuesByMode: Record<string, any> = {};
  let primaryValue: any;

  // Process all modes
  for (const mode of modes) {
    const value = variable.valuesByMode[mode.modeId];

    // Skip undefined values
    if (value === undefined || value === null) {
      console.warn(
        `Variable ${variable.name} has no value for mode ${mode.name}`
      );
      continue;
    }

    if (typeof value === "object" && value.type === "VARIABLE_ALIAS") {
      // Handle references - use clean reference format
      const referencedTokenName = variableReferenceMap.get(value.id);
      const cleanReference = referencedTokenName
        ? `{${referencedTokenName}}`
        : `{unknown-reference-${value.id}}`;
      valuesByMode[mode.name] = cleanReference;
    } else {
      // Handle actual values
      let processedValue: any;

      switch (variable.resolvedType) {
        case "COLOR":
          // Validate color object before conversion
          if (
            !value ||
            typeof value !== "object" ||
            value.r === undefined ||
            value.g === undefined ||
            value.b === undefined
          ) {
            console.error(
              `❌ [EXPORT] Invalid color value for ${variable.name}:`,
              value
            );
            processedValue = undefined;
          } else {
            processedValue = rgbToHex(value);
          }
          break;
        case "FLOAT":
          processedValue = formatNumericValue(value, tokenType);
          break;
        case "STRING":
        case "BOOLEAN":
        default:
          processedValue = value;
          break;
      }

      valuesByMode[mode.name] = processedValue;
    }
  }

  // Use first mode as primary value for Style Dictionary compatibility
  primaryValue = valuesByMode[modes[0].name];

  const token: ProcessedToken = {
    $type: tokenType,
    $value: primaryValue,
    $description: variable.description || undefined,
  };

  // Add valuesByMode for Figma compatibility (if multiple modes exist)
  if (modes.length > 1) {
    token.valuesByMode = valuesByMode;
  }

  return token;
}

/**
 * Create a clean token name from Figma variable name
 */
function createTokenName(variableName: string): string {
  // Convert from Figma naming to dot notation
  // e.g., "Color/Primary/500" -> "color.primary.500"
  return variableName
    .toLowerCase()
    .replace(/[\/\s]+/g, ".")
    .replace(/[^a-z0-9.-]/g, "");
}

/**
 * Process a variable collection into W3C DTCG format with Figma mode support
 */
export async function processCollection(
  collection: any
): Promise<ProcessedCollection> {
  const variables: { [tokenName: string]: ProcessedToken } = {};

  console.log(
    `Processing collection: ${collection.name} with ${collection.variables.length} variables and ${collection.modes.length} modes`
  );

  for (const variable of collection.variables) {
    try {
      const tokenName = createTokenName(variable.name);
      const processedToken = processVariable(variable, collection.modes);

      // Remove undefined description to keep JSON clean
      if (!processedToken.$description) {
        delete processedToken.$description;
      }

      variables[tokenName] = processedToken;
    } catch (error) {
      console.error(`Error processing variable ${variable.name}:`, error);
    }
  }

  const result: ProcessedCollection = {
    modes: collection.modes.map((mode: any) => ({
      modeId: mode.modeId,
      name: mode.name,
    })),
    variables,
  };

  console.log(
    `Successfully processed ${Object.keys(variables).length} tokens from ${collection.name}`
  );
  return result;
}

/**
 * Process multiple collections for export
 */
export async function processCollectionsForExport(
  allCollections: any[],
  selectedCollectionIds: string[]
): Promise<ExportData[]> {
  const exportData: ExportData[] = [];

  console.log(
    `Processing ${selectedCollectionIds.length} selected collections for export`
  );
  console.log("Selected collection IDs:", selectedCollectionIds);
  console.log(
    "Available collections:",
    allCollections.map((c) => `${c.name} (${c.id})`)
  );

  // Build reference map first to resolve aliases
  buildVariableReferenceMap(allCollections);

  for (const collectionId of selectedCollectionIds) {
    const collection = allCollections.find((c) => c.id === collectionId);

    if (!collection) {
      console.warn(`Collection not found: ${collectionId}`);
      continue;
    }

    console.log(
      `Processing collection: ${collection.name} with ${(collection.variables && collection.variables.length) || 0} variables`
    );

    // Skip collections with no variables
    if (!collection.variables || collection.variables.length === 0) {
      console.warn(`Collection ${collection.name} has no variables, skipping`);
      continue;
    }

    try {
      const processedTokens = await processCollection(collection);

      // Only add collections that actually have processed tokens
      if (Object.keys(processedTokens.variables).length > 0) {
        // Return clean object without array wrapper for Style Dictionary compatibility
        const exportItem: ExportData = {
          [collection.name]: processedTokens,
        };

        exportData.push(exportItem);
        console.log(
          `Successfully exported collection: ${collection.name} with ${Object.keys(processedTokens.variables).length} tokens`
        );
      } else {
        console.warn(
          `Collection ${collection.name} processed but resulted in 0 tokens`
        );
      }
    } catch (error) {
      console.error(`Error processing collection ${collection.name}:`, error);
    }
  }

  console.log(
    `Export processing complete. Generated ${exportData.length} files from ${selectedCollectionIds.length} selected collections.`
  );
  return exportData;
}
