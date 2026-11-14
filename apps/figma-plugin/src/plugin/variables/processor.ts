// Token processing utilities for Figma Variables to W3C DTCG format conversion

import { converter } from "culori";
import {
  formatCubicBezier,
  isSpringEasing,
  secondsToDuration,
} from "./motion-values";

export interface ProcessedToken {
  $type: string;
  $value: unknown;
  $description?: string;
  name?: string; // Token name for validation purposes
  valuesByMode?: Record<string, unknown>; // For Figma import compatibility
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

/**
 * A raw value read from a Figma variable's `valuesByMode`. Object values are
 * either a VARIABLE_ALIAS reference or an RGB(A) color; every object prop is
 * optional so the exporter's duck-typing checks (`value.type`, `value.r`, …)
 * narrow cleanly without `any`.
 *
 * `color` and `opacity` exist only so Figma's composed-color variable values
 * (`{ color, opacity }`, added in @figma/plugin-typings 1.141) satisfy this
 * type. The exporter does not support them: they fail the `r/g/b` check and
 * are logged as invalid color values.
 */
interface FigmaObjectValue {
  type?: string;
  id?: string;
  r?: number;
  g?: number;
  b?: number;
  a?: number;
  color?: unknown;
  opacity?: unknown;
  // An EASING variable's value (Plan 137)
  easingFunctionCubicBezier?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  easingFunctionSpring?: unknown;
}
type FigmaVariableValue = string | number | boolean | FigmaObjectValue;

/**
 * Minimal shape of a Figma Variable as consumed by the exporter. These are
 * sometimes PLAIN extracted objects (from token-handlers) rather than live
 * Variable instances, so `getPluginData` is optional and `originalType` is a
 * non-standard fallback preserved during extraction.
 */
interface FigmaVariableLike {
  id: string;
  name: string;
  resolvedType: string;
  scopes: string[];
  description?: string;
  valuesByMode: Record<string, FigmaVariableValue>;
  getPluginData?: (key: string) => string;
  originalType?: string;
}

interface FigmaModeLike {
  modeId: string;
  name: string;
}

interface FigmaCollectionLike {
  id: string;
  name: string;
  modes: FigmaModeLike[];
  variables: FigmaVariableLike[];
}

// Global variable reference map for resolving aliases
let variableReferenceMap: Map<string, string> = new Map();

/**
 * A variable the exporter cannot represent as a W3C DTCG token. Exporting it
 * would push a token with no value or a raw Figma object as its value, so it is
 * skipped and reported instead.
 */
export interface UnsupportedVariable {
  id: string;
  name: string;
  collection: string;
  resolvedType: string;
  reason: string;
}

const SUPPORTED_RESOLVED_TYPES = new Set([
  "COLOR",
  "FLOAT",
  "STRING",
  "BOOLEAN",
  // Native motion variables (Plan 137): a duration and a cubic-bezier easing
  "TIMING",
  "EASING",
]);

function isAliasValue(
  value: FigmaVariableValue | undefined
): value is FigmaObjectValue {
  return (
    typeof value === "object" &&
    value !== null &&
    value.type === "VARIABLE_ALIAS"
  );
}

/** Figma composed color: { color, opacity } where one side is an alias. */
function isComposedColor(value: FigmaVariableValue | undefined): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    value.type !== "VARIABLE_ALIAS" &&
    value.r === undefined &&
    (value.color !== undefined || value.opacity !== undefined)
  );
}

function unsupportedReason(variable: FigmaVariableLike): string | null {
  if (!SUPPORTED_RESOLVED_TYPES.has(variable.resolvedType)) {
    return `variables of type ${variable.resolvedType} are not exported`;
  }
  if (
    variable.resolvedType === "EASING" &&
    Object.values(variable.valuesByMode ?? {}).some(
      (value) =>
        typeof value === "object" &&
        value !== null &&
        !isAliasValue(value) &&
        isSpringEasing(value as FigmaObjectValue as never)
    )
  ) {
    return "spring easings cannot be written as a cubic-bezier";
  }
  if (
    variable.resolvedType === "COLOR" &&
    Object.values(variable.valuesByMode ?? {}).some(isComposedColor)
  ) {
    return "composed colors (color plus separate opacity) are not exported yet";
  }
  return null;
}

/**
 * Find variables the exporter cannot represent. A variable that aliases an
 * unsupported one is also reported, because exporting it would leave a
 * reference to a token that is not in the output.
 *
 * Detection looks at every collection (aliases can cross collections);
 * `selectedCollectionIds` only limits what is returned.
 */
export function findUnsupportedVariables(
  allCollections: FigmaCollectionLike[],
  selectedCollectionIds?: string[]
): UnsupportedVariable[] {
  const found = new Map<string, UnsupportedVariable>();
  const ownerId = new Map<string, string>(); // variable id -> collection id

  for (const collection of allCollections) {
    for (const variable of collection.variables ?? []) {
      const reason = unsupportedReason(variable);
      if (reason) {
        ownerId.set(variable.id, collection.id);
        found.set(variable.id, {
          id: variable.id,
          name: variable.name,
          collection: collection.name,
          resolvedType: variable.resolvedType,
          reason,
        });
      }
    }
  }

  // Cascade through aliases until nothing new is added
  let changed = true;
  while (changed) {
    changed = false;
    for (const collection of allCollections) {
      for (const variable of collection.variables ?? []) {
        if (found.has(variable.id)) continue;
        for (const value of Object.values(variable.valuesByMode ?? {})) {
          if (isAliasValue(value) && value.id && found.has(value.id)) {
            ownerId.set(variable.id, collection.id);
            found.set(variable.id, {
              id: variable.id,
              name: variable.name,
              collection: collection.name,
              resolvedType: variable.resolvedType,
              reason: `aliases "${found.get(value.id)?.name}", which is not exported`,
            });
            changed = true;
            break;
          }
        }
      }
    }
  }

  return [...found.values()].filter(
    (v) =>
      !selectedCollectionIds ||
      selectedCollectionIds.includes(ownerId.get(v.id) ?? "")
  );
}

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

const toOklch = converter("oklch");

/**
 * Convert Figma RGB color (0-1 range) to OKLCH format.
 *
 * Uses culori, the same library the importer uses for OKLCH to RGB, so a colour
 * survives a Pull then Push unchanged. The previous hand-written maths (the
 * 0.4124564 sRGB matrix and the original OKLab constants) was not the inverse
 * of culori's, so every round trip moved 120+ palette colours by up to ~2 degrees
 * of hue, and the shift grew with each trip.
 *
 * Precision matches the token files: L and C with 3 decimals, H with 2.
 * A near-zero chroma (grayscale) has no meaningful hue, so H is set to 0.
 */
export function rgbToOklch(color: { r: number; g: number; b: number }): string {
  // The plugin's local culori typings are loose; the oklch channels are l, c, h.
  const oklch = toOklch({
    mode: "rgb",
    r: color.r,
    g: color.g,
    b: color.b,
  }) as unknown as { l?: number; c?: number; h?: number } | null;
  const chroma = oklch?.c ?? 0;
  const lRounded = parseFloat((oklch?.l ?? 0).toFixed(3));
  const cRounded = parseFloat(chroma.toFixed(3));
  const hRounded = chroma < 0.001 ? 0 : parseFloat((oklch?.h ?? 0).toFixed(2));

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
function buildVariableReferenceMap(
  allCollections: FigmaCollectionLike[]
): void {
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
 * Name checks for typography tokens. Figma names often use separators, so each
 * matches "fontsize", "font-size", "font_size" and "font size" alike.
 */
const nameMatches = (variableName: string, pattern: RegExp): boolean =>
  pattern.test(variableName.toLowerCase());
const isFontSizeName = (name: string) => nameMatches(name, /font[-_ ]?size/);
const isLineHeightName = (name: string) =>
  nameMatches(name, /line[-_ ]?height/);
const isLetterSpacingName = (name: string) =>
  nameMatches(name, /letter[-_ ]?spacing/);

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

    case "TIMING":
      return "duration";

    case "EASING":
      return "cubicBezier";

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
        // Semantic stacking roles: layer/modal, layer/tooltip
        /^layer[/.]/.test(variableName.toLowerCase()) ||
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
      if (scopes.includes("FONT_SIZE") || isFontSizeName(variableName)) {
        return "fontSize";
      }
      // Line heights are percent-valued plain numbers (100 to 200), the same
      // `number` convention packages/tokens uses. Emitting "lineHeight" would
      // append "%" and show every hand-made variable as a change on sync.
      if (scopes.includes("LINE_HEIGHT") || isLineHeightName(variableName)) {
        return "number";
      }
      if (
        scopes.includes("LETTER_SPACING") ||
        isLetterSpacingName(variableName)
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
      if (isFontSizeName(variableName)) {
        return "fontSize";
      }
      if (
        variableName.toLowerCase().includes("fontweight") ||
        variableName.toLowerCase().includes("weight")
      ) {
        return "fontWeight";
      }
      if (isLineHeightName(variableName)) {
        return "lineHeight";
      }
      if (isLetterSpacingName(variableName)) {
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
          isLetterSpacingName(variableName))
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
function processVariable(
  variable: FigmaVariableLike,
  modes: FigmaModeLike[]
): ProcessedToken {
  // Check for the stored original type first. The importer persists it via
  // `setPluginData("originalType", …)`, so it must be READ via getPluginData —
  // reading `variable.originalType` (a non-existent property) always returned
  // undefined, so the export fell back to inferred types (fontSize/lineHeight/
  // letterSpacing) and produced a perpetual type+value mismatch against the
  // repo's `$type: "number"` convention (false "changes detected" on every sync).
  const storedType =
    typeof variable.getPluginData === "function"
      ? variable.getPluginData("originalType") || undefined
      : variable.originalType;
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

  const valuesByMode: Record<string, unknown> = {};
  let primaryValue: unknown;

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
      const referencedTokenName = variableReferenceMap.get(value.id ?? "");
      const cleanReference = referencedTokenName
        ? `{${referencedTokenName}}`
        : `{unknown-reference-${value.id}}`;
      valuesByMode[mode.name] = cleanReference;
    } else {
      // Handle actual values
      let processedValue: unknown;

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
            processedValue = rgbToOklch(
              value as { r: number; g: number; b: number }
            );
          }
          break;
        case "FLOAT":
          // Pass variable name for context-aware formatting (e.g., tracking → em)
          processedValue = formatNumericValue(
            value as number,
            tokenType,
            variable.name
          );
          break;
        case "TIMING":
          // Seconds in Figma, "150ms" in the repo
          processedValue =
            typeof value === "number" ? secondsToDuration(value) : undefined;
          break;
        case "EASING":
          processedValue =
            formatCubicBezier(value as FigmaObjectValue as never) ?? undefined;
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

  // Build token with a stable key order: $type → $value → $description → valuesByMode.
  // Construct in one shot (no post-assignment mutation) so JSON.stringify always
  // serialises the same ordering regardless of whether optional fields are present.
  const token: ProcessedToken = {
    $type: tokenType,
    $value: primaryValue,
    ...(variable.description ? { $description: variable.description } : {}),
    ...(modes.length > 1 ? { valuesByMode } : {}),
  };

  return token;
}

/** Variables the component builder adds for Figma only (not tokens, never exported). */
export const FIGMA_ONLY_PREFIX = "_figma/";

/**
 * Create a clean token name from Figma variable name
 */
export function createTokenName(variableName: string): string {
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
  collection: FigmaCollectionLike,
  skipVariableIds?: ReadonlySet<string>
): Promise<ProcessedCollection> {
  const variables: { [tokenName: string]: ProcessedToken } = {};

  console.log(
    `Processing collection: ${collection.name} with ${collection.variables.length} variables and ${collection.modes.length} modes`
  );

  for (const variable of collection.variables) {
    if (skipVariableIds?.has(variable.id)) continue;
    // Figma-only helpers the component builder adds (shadow colours that follow the mode);
    // they are not tokens and must not be exported
    if (variable.name.startsWith(FIGMA_ONLY_PREFIX)) continue;
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

  // Generate a deterministic semantic modeId from the collection + mode names
  // rather than storing Figma's internal numeric node IDs, which change every
  // time a collection is deleted and recreated (e.g. after a replace-mode pull).
  // The importer only uses mode *names* to match modes, so the stored modeId is
  // metadata-only — making it stable eliminates spurious diffs on every push.
  const toSlug = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  const collectionSlug = toSlug(collection.name);

  const result: ProcessedCollection = {
    modes: collection.modes.map((mode) => ({
      modeId: `mode:${collectionSlug}:${toSlug(mode.name)}`,
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
  allCollections: FigmaCollectionLike[],
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

  // Variables we cannot represent are skipped, never exported half-formed
  const unsupported = findUnsupportedVariables(allCollections);
  const skipVariableIds = new Set(unsupported.map((v) => v.id));
  for (const v of unsupported) {
    console.warn(
      `Skipping variable "${v.name}" in "${v.collection}": ${v.reason}`
    );
  }

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
      const processedTokens = await processCollection(
        collection,
        skipVariableIds
      );

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
