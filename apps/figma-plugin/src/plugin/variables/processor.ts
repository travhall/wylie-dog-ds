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
 * @deprecated Use rgbToOklch for export - kept for reference/debugging
 */
function rgbToHex(color: { r: number; g: number; b: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Apply sRGB gamma correction (linear to sRGB)
 * Input: linear RGB value (0-1)
 * Output: sRGB value (0-1)
 */
function linearToSrgb(value: number): number {
  if (value <= 0.0031308) {
    return value * 12.92;
  }
  return 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

/**
 * Remove sRGB gamma correction (sRGB to linear)
 * Input: sRGB value (0-1)
 * Output: linear RGB value (0-1)
 */
function srgbToLinear(value: number): number {
  if (value <= 0.04045) {
    return value / 12.92;
  }
  return Math.pow((value + 0.055) / 1.055, 2.4);
}

/**
 * Convert linear sRGB to XYZ (D65 illuminant)
 */
function linearSrgbToXyz(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  // sRGB to XYZ matrix (D65)
  const x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = 0.0193339 * r + 0.119192 * g + 0.9503041 * b;
  return [x, y, z];
}

/**
 * Convert XYZ to OKLab
 */
function xyzToOklab(x: number, y: number, z: number): [number, number, number] {
  // XYZ to LMS matrix
  const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
  const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
  const s = 0.0482003018 * x + 0.2643662691 * y + 0.6338517028 * z;

  // Cube root
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // LMS to OKLab
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  return [L, a, b];
}

/**
 * Convert OKLab to OKLCH (cylindrical coordinates)
 */
function oklabToOklch(
  L: number,
  a: number,
  b: number
): [number, number, number] {
  const C = Math.sqrt(a * a + b * b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

/**
 * Convert Figma RGB color (0-1 range) to OKLCH format
 * Matches the precision used in token files: L/C with 3 decimals, H with 2 decimals
 */
function rgbToOklch(color: { r: number; g: number; b: number }): string {
  // Figma uses linear RGB, convert to sRGB first then to linear for XYZ
  // Actually, Figma variables are already in sRGB gamma space (0-1 range)
  // Convert sRGB to linear RGB
  const linearR = srgbToLinear(color.r);
  const linearG = srgbToLinear(color.g);
  const linearB = srgbToLinear(color.b);

  // Convert linear RGB to XYZ
  const [x, y, z] = linearSrgbToXyz(linearR, linearG, linearB);

  // Convert XYZ to OKLab
  const [L, a, b] = xyzToOklab(x, y, z);

  // Convert OKLab to OKLCH
  const [l, c, h] = oklabToOklch(L, a, b);

  // Format with precision matching token files
  // L: 3 decimal places (e.g., 0.500)
  // C: 3 decimal places (e.g., 0.103)
  // H: 2 decimal places (e.g., 83.64)
  // Special case: if chroma is near zero (grayscale), set hue to 0
  const lRounded = parseFloat(l.toFixed(3));
  const cRounded = parseFloat(c.toFixed(3));
  const hRounded = c < 0.001 ? 0 : parseFloat(h.toFixed(2));

  return `oklch(${lRounded} ${cRounded} ${hRounded})`;
}

/**
 * Round a number to a specified precision, removing floating point errors
 * E.g., 0.05000000074505806 → 0.05
 */
function roundToPrecision(value: number, precision: number = 4): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
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
      // W3C DTCG Spec: All dimensional values should use "dimension" type
      // Legacy types like borderRadius, borderWidth, sizing, spacing are not official

      // Spacing is the only dimensional type that remains separate in some implementations
      if (
        scopes.includes("GAP") ||
        scopes.includes("PADDING") ||
        (scopes.includes("SPACING") &&
          !variableName.toLowerCase().includes("border") &&
          !variableName.toLowerCase().includes("radius")) ||
        (variableName.toLowerCase().includes("spacing") &&
          !variableName.toLowerCase().includes("border")) ||
        (variableName.toLowerCase().includes("space") &&
          !variableName.toLowerCase().includes("border"))
      ) {
        return "spacing";
      }

      // Border-radius and border-width MUST use "dimension" per W3C DTCG spec
      if (
        scopes.includes("BORDER_RADIUS") ||
        variableName.toLowerCase().includes("radius") ||
        variableName.toLowerCase().includes("borderwidth") ||
        (variableName.toLowerCase().includes("border") &&
          (variableName.toLowerCase().includes("width") ||
            variableName.toLowerCase().includes("radius")))
      ) {
        return "dimension";
      }

      // Sizing/dimensions should use "dimension" type
      if (
        scopes.includes("WIDTH") ||
        scopes.includes("HEIGHT") ||
        variableName.toLowerCase().includes("size") ||
        variableName.toLowerCase().includes("height")
      ) {
        return "dimension";
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
 *
 * @param value - The numeric value from Figma
 * @param tokenType - The W3C DTCG token type
 * @param variableName - Optional variable name for context-aware formatting
 */
function formatNumericValue(
  value: number,
  tokenType: string,
  variableName?: string
): string | number {
  // Round to remove floating-point errors (e.g., 0.05000000074505806 → 0.05)
  const roundedValue = roundToPrecision(value, 4);

  switch (tokenType) {
    case "fontSize":
    case "paragraphSpacing":
    case "spacing":
    case "borderRadius":
    case "sizing":
    case "borderWidth":
      return `${roundedValue}px`;

    case "letterSpacing":
      // Letter-spacing/tracking tokens use em units for relative scaling
      // This matches CSS best practices and the W3C DTCG spec
      return `${roundedValue}em`;

    case "dimension":
      // Check if this is a tracking/letter-spacing token by name
      // These should use em units even when typed as "dimension"
      if (
        variableName &&
        (variableName.toLowerCase().includes("tracking") ||
          variableName.toLowerCase().includes("letterspacing") ||
          variableName.toLowerCase().includes("letter-spacing"))
      ) {
        return `${roundedValue}em`;
      }
      return `${roundedValue}px`;

    case "lineHeight":
      return `${roundedValue}%`;

    case "fontWeight":
      // Font weights are unitless integers
      return Math.round(roundedValue);

    case "number":
      // CRITICAL: These must remain as numbers (not strings)
      // - opacity: 0-1 decimal values
      // - z-index: integer values
      // Round to clean up floating-point errors
      return roundedValue;

    default:
      return roundedValue.toString();
  }
}

/**
 * Process a single variable across all modes into W3C DTCG token format
 */
function processVariable(variable: any, modes: any[]): ProcessedToken {
  // Check for stored original type first
  const storedType = variable.originalType;
  const inferredType = getW3CTokenType(
    variable.resolvedType,
    variable.scopes,
    variable.name
  );

  // Convert legacy Tokens Studio types to W3C DTCG standard
  let tokenType = storedType || inferredType;

  // Legacy type conversion (Tokens Studio → W3C DTCG)
  if (
    tokenType === "borderRadius" ||
    tokenType === "borderWidth" ||
    tokenType === "sizing"
  ) {
    tokenType = "dimension";
    console.log(
      `🔄 Converting legacy type "${storedType}" → "dimension" for ${variable.name}`
    );
  }

  // Special case: spacing used for border properties should be dimension
  if (
    tokenType === "spacing" &&
    (variable.name.toLowerCase().includes("border") ||
      variable.name.toLowerCase().includes("radius"))
  ) {
    tokenType = "dimension";
    console.log(
      `🔄 Converting spacing → dimension for border token ${variable.name}`
    );
  }

  // Fix duration tokens misclassified as fontFamily
  if (
    tokenType === "fontFamily" &&
    (variable.name.toLowerCase().includes("duration") ||
      variable.name.toLowerCase().includes("transition") ||
      variable.name.toLowerCase().includes("animation"))
  ) {
    tokenType = "duration";
    console.log(`🔄 Converting fontFamily → duration for ${variable.name}`);
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
            // Export colors in OKLCH format to match token file format
            processedValue = rgbToOklch(value);
          }
          break;
        case "FLOAT":
          // Pass variable name for context-aware formatting (e.g., tracking → em)
          processedValue = formatNumericValue(value, tokenType, variable.name);
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
