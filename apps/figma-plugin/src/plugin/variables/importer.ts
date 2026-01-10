// Token import utilities for W3C DTCG format to Figma Variables conversion
// ENHANCED VERSION: Includes Format Adapter Layer for multi-format support

import type {
  ProcessedCollection,
  ProcessedToken,
  ExportData,
} from "./processor";
import {
  VariableRegistry,
  parseTokenReference,
  isTokenReference,
  createImportOrder,
  extractReferences,
} from "./reference-resolver";
import {
  validateTokensForImport,
  type ValidationReport,
  validateTokenValue,
} from "./validation";
import { FormatAdapterManager } from "./format-adapter-manager";
import type { AdapterProcessResult } from "./format-adapter";
import { converter as culoriConverter, parse as culoriParse } from "culori";

export interface ImportResult {
  success: boolean;
  message: string;
  collectionsCreated: number;
  variablesCreated: number;
  errors: string[];
  unresolvedReferences: string[];
}

export interface ImportOptions {
  mergeStrategy: "replace" | "merge" | "preserve";
  createMissingModes: boolean;
  preserveExistingVariables: boolean;
}

export interface GlobalImportResult {
  success: boolean;
  message: string;
  collectionsProcessed: number;
  totalVariablesCreated: number;
  totalReferencesResolved: number;
  errors: string[];
  unresolvedReferences: string[];
  validationReport?: ValidationReport;
}

// Map W3C DTCG types to Figma types with enhanced typography support
const W3C_TO_FIGMA_TYPE_MAP: Record<string, string> = {
  color: "COLOR",
  fontSize: "FLOAT",
  fontWeight: "STRING",
  fontFamily: "STRING",
  lineHeight: "FLOAT",
  letterSpacing: "FLOAT",
  spacing: "FLOAT",
  sizing: "FLOAT",
  borderRadius: "FLOAT",
  borderWidth: "FLOAT",
  dimension: "FLOAT",
  shadow: "STRING",
  boolean: "BOOLEAN",
  // Add fallbacks for common token types
  number: "FLOAT",
  string: "STRING",
  text: "STRING",
  font: "STRING",
  size: "FLOAT",
};

// Map W3C DTCG types to Figma scopes with enhanced typography support
const W3C_TO_FIGMA_SCOPES_MAP: Record<string, string[]> = {
  color: ["ALL_SCOPES"],
  fontSize: ["FONT_SIZE"],
  fontWeight: ["FONT_WEIGHT"],
  fontFamily: ["FONT_FAMILY"],
  lineHeight: ["LINE_HEIGHT"],
  letterSpacing: ["LETTER_SPACING"],
  spacing: ["GAP"],
  sizing: ["WIDTH", "HEIGHT"],
  borderRadius: ["CORNER_RADIUS"],
  borderWidth: ["STROKE_WIDTH"],
  dimension: ["GAP"],
  shadow: ["EFFECT"],
  boolean: ["ALL_SCOPES"],
  // Add fallbacks for common token types
  number: ["ALL_SCOPES"],
  string: ["ALL_SCOPES"],
  text: ["ALL_SCOPES"],
  font: ["FONT_FAMILY"],
  size: ["FONT_SIZE"],
};

const convertToRgb = culoriConverter("rgb");

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function expandShortHex(hex: string): string {
  if (hex.length !== 4) return hex;
  return (
    "#" +
    hex
      .slice(1)
      .split("")
      .map((char) => char + char)
      .join("")
  );
}

/**
 * Convert a color value (hex, rgb(a), hsl(a), oklch, etc.) to Figma RGB format
 */
function convertColorToFigmaRgb(
  value: unknown
): { r: number; g: number; b: number } | null {
  if (!value) return null;

  if (
    typeof value === "object" &&
    value !== null &&
    "r" in value &&
    "g" in value &&
    "b" in value
  ) {
    const rgbValue = value as { r: number; g: number; b: number };
    return {
      r: clamp01(rgbValue.r),
      g: clamp01(rgbValue.g),
      b: clamp01(rgbValue.b),
    };
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  // Hex support (#fff or #ffffff)
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    const hex = trimmed.length === 4 ? expandShortHex(trimmed) : trimmed;
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return { r: clamp01(r), g: clamp01(g), b: clamp01(b) };
  }

  // Use culori to parse any other CSS color (rgb/rgba/hsl/hsla/oklch/etc.)
  const culoriColor = culoriParse(trimmed);
  if (culoriColor) {
    const rgb = convertToRgb(culoriColor);
    if (rgb) {
      return {
        r: clamp01(rgb.r),
        g: clamp01(rgb.g),
        b: clamp01(rgb.b),
      };
    }
  }

  return null;
}

/**
 * Parse numeric value from string or number (e.g., "16px" -> 16)
 */
function parseNumericValue(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const match = value.trim().match(/-?\d+(\.\d+)?/);
    if (match) {
      const parsed = parseFloat(match[0]);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
  }

  if (typeof value === "object" && value !== null) {
    // Handle token payloads like { value: "4px" } or { $value: 4 }
    if ("value" in value) {
      return parseNumericValue((value as { value: unknown }).value);
    }
    if ("$value" in value) {
      return parseNumericValue((value as { $value: unknown }).$value);
    }
  }

  return 0;
}

/**
 * Convert token value to Figma format
 */
function convertTokenValueToFigma(
  token: ProcessedToken,
  figmaType: string
): any {
  const value = token.$value;

  switch (figmaType) {
    case "COLOR": {
      const figmaColor = convertColorToFigmaRgb(value);
      return figmaColor ?? { r: 0, g: 0, b: 0 };
    }

    case "FLOAT": {
      return parseNumericValue(value);
    }

    case "STRING":
    case "BOOLEAN":
    default:
      return value;
  }
}

/**
 * Create or find variable collection by name
 */
async function ensureVariableCollection(
  collectionName: string,
  modes: Array<{ modeId: string; name: string }>
): Promise<VariableCollection> {
  const existingCollections =
    await figma.variables.getLocalVariableCollectionsAsync();
  let collection = existingCollections.find((c) => c.name === collectionName);

  if (!collection) {
    collection = figma.variables.createVariableCollection(collectionName);
    console.log(`Created collection: ${collectionName}`);
  }

  // Handle modes - remove default mode if we have custom modes
  if (modes && modes.length > 0) {
    const existingModeNames = collection.modes.map((m) => m.name);
    let hasDefaultMode =
      collection.modes.length === 1 && collection.modes[0].name === "Mode 1";

    // Add new modes first
    for (const modeData of modes) {
      if (!existingModeNames.includes(modeData.name)) {
        try {
          collection.addMode(modeData.name);
        } catch (error) {
          // Silently continue
        }
      }
    }

    // Remove default "Mode 1" if we added custom modes
    if (hasDefaultMode && modes.length > 0) {
      try {
        const defaultMode = collection.modes.find((m) => m.name === "Mode 1");
        if (defaultMode && collection.modes.length > 1) {
          collection.removeMode(defaultMode.modeId);
        }
      } catch (error) {
        // Silently continue
      }
    }
  }

  return collection;
}

/**
 * Create variable and handle references using proper reference-resolver API
 */
async function createVariableWithReferences(
  collection: VariableCollection,
  tokenName: string,
  token: ProcessedToken,
  registry: VariableRegistry
): Promise<Variable | null> {
  try {
    const figmaType = W3C_TO_FIGMA_TYPE_MAP[token.$type] || "STRING";
    const scopes = W3C_TO_FIGMA_SCOPES_MAP[token.$type] || ["ALL_SCOPES"];
    const figmaName = tokenName.replace(/\./g, "/");

    // Check if variable already exists
    const existingVariables = [];
    for (const id of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(id);
      if (variable) existingVariables.push(variable);
    }

    let variable = existingVariables.find((v) => v?.name === figmaName);

    if (!variable) {
      variable = figma.variables.createVariable(
        figmaName,
        collection,
        figmaType as VariableResolvedDataType
      );
      variable.scopes = scopes as VariableScope[];
    }

    // Update description for both new and existing variables
    if (token.$description) {
      variable.description = token.$description;
      if (token.$type === "fontFamily") {
        console.log(`✅ SET: ${figmaName} description`);
      }
    } else if (token.$type === "fontFamily") {
      console.log(`❌ MISSING: ${figmaName} has no $description`);
    }

    // Register in registry for reference resolution
    registry.register(tokenName, variable.id);

    // Extract references for this token
    const references = extractReferences(token);

    // Set non-reference values immediately, queue references for later
    if (token.valuesByMode) {
      // Multi-mode token
      const modeReferences = new Map<string, any>();

      for (const [modeName, modeValue] of Object.entries(token.valuesByMode)) {
        const mode = collection.modes.find((m) => m.name === modeName);
        if (!mode) continue;

        if (isTokenReference(modeValue)) {
          // Store reference for later resolution
          const ref = parseTokenReference(modeValue as string);
          if (ref) {
            modeReferences.set(mode.modeId, ref);
          }
        } else {
          // Validate individual token value before setting
          const tokenValidationErrors = validateTokenValue(
            Object.assign({}, token, { $value: modeValue })
          );
          if (tokenValidationErrors.length > 0) {
            console.warn(
              `Token validation warnings for ${tokenName}:`,
              tokenValidationErrors
            );
            // Add to result warnings but continue processing
          }

          // Set immediate value with type validation
          const figmaValue = convertTokenValueToFigma(
            Object.assign({}, token, { $value: modeValue }),
            figmaType
          );

          try {
            variable.setValueForMode(mode.modeId, figmaValue);
          } catch (error) {
            console.error(
              `Failed to set value for ${tokenName} mode ${mode.name}:`,
              error
            );
            console.error(
              `Token type: ${token.$type}, Figma type: ${figmaType}, Value:`,
              modeValue
            );
            // Try to continue with other modes
          }
        }
      }

      // Add pending references if any
      if (modeReferences.size > 0) {
        registry.addPendingResolution(variable, tokenName, modeReferences);
      }
    } else {
      // Single mode token – apply the same value (or reference) to every available mode
      const targetModes =
        collection.modes.length > 0
          ? collection.modes
          : collection.defaultModeId
            ? [{ modeId: collection.defaultModeId, name: "Default" }]
            : [];

      if (targetModes.length === 0) {
        console.warn(
          `Collection "${collection.name}" has no modes; skipping value assignment for ${tokenName}`
        );
        return variable;
      }

      if (isTokenReference(token.$value)) {
        // Queue reference for each mode
        const ref = parseTokenReference(token.$value);
        if (ref) {
          const modeReferences = new Map();
          for (const mode of targetModes) {
            modeReferences.set(mode.modeId, ref);
          }
          registry.addPendingResolution(variable, tokenName, modeReferences);
        }
      } else {
        // Set immediate value for every mode with type validation
        const figmaValue = convertTokenValueToFigma(token, figmaType);

        for (const mode of targetModes) {
          try {
            variable.setValueForMode(mode.modeId, figmaValue);
          } catch (error) {
            console.error(
              `Failed to set value for ${tokenName} mode ${mode.name}:`,
              error
            );
            console.error(
              `Token type: ${token.$type}, Figma type: ${figmaType}, Value:`,
              token.$value
            );
          }
        }
      }
    }

    return variable;
  } catch (error) {
    console.error(
      `Error creating variable ${tokenName}:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Sort tokens within a collection by their dependencies
 * Tokens with no references come first, then tokens that reference them
 */
function sortTokensByDependencies(
  tokenEntries: [string, ProcessedToken][]
): [string, ProcessedToken][] {
  const dependencyMap = new Map<string, Set<string>>();
  const tokenMap = new Map<string, ProcessedToken>();

  // Build dependency graph
  for (const [tokenName, token] of tokenEntries) {
    tokenMap.set(tokenName, token);
    const deps = new Set<string>();

    // Extract references from this token
    const references = extractReferences(token);
    for (const ref of Array.from(references.values())) {
      // Check if reference is to another token in this same collection
      const referencedToken = tokenEntries.find(
        ([name]) => name === ref.referencePath
      );
      if (referencedToken) {
        deps.add(ref.referencePath);
      }
    }

    dependencyMap.set(tokenName, deps);
  }

  // Topological sort
  const sorted: [string, ProcessedToken][] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(tokenName: string): void {
    if (visiting.has(tokenName)) {
      console.warn(`Circular dependency detected in token: ${tokenName}`);
      return;
    }
    if (visited.has(tokenName)) return;

    visiting.add(tokenName);
    const deps = dependencyMap.get(tokenName) || new Set();

    // Visit dependencies first
    for (const dep of Array.from(deps)) {
      if (tokenMap.has(dep)) {
        visit(dep);
      }
    }

    visiting.delete(tokenName);
    visited.add(tokenName);

    const token = tokenMap.get(tokenName);
    if (token) {
      sorted.push([tokenName, token]);
    }
  }

  // Process all tokens
  for (const [tokenName] of tokenEntries) {
    visit(tokenName);
  }

  return sorted;
}

/**
 * Global import function that processes all collections together
 */
export async function importMultipleCollections(
  tokenDataArray: ExportData[],
  options: ImportOptions = {
    mergeStrategy: "merge",
    createMissingModes: true,
    preserveExistingVariables: false,
  }
): Promise<GlobalImportResult> {
  const result: GlobalImportResult = {
    success: false,
    message: "",
    collectionsProcessed: 0,
    totalVariablesCreated: 0,
    totalReferencesResolved: 0,
    errors: [],
    unresolvedReferences: [],
    validationReport: undefined,
  };

  try {
    // ENHANCED VALIDATION - Run comprehensive validation before processing
    const validationReport = validateTokensForImport(tokenDataArray);
    result.validationReport = validationReport;

    // Stop import if critical errors found
    if (!validationReport.valid) {
      result.errors = validationReport.errors.map((e) => e.message);
      result.message = `Import failed validation: ${validationReport.errors.length} critical errors found`;
      return result;
    }

    // Create a single registry for all collections
    const globalRegistry = new VariableRegistry();

    // Analyze all collections to determine import order
    const importOrder = createImportOrder(tokenDataArray);

    // Track all collections by name for ordered processing
    const collectionMap = new Map<
      string,
      { data: ProcessedCollection; name: string }
    >();

    for (const tokenData of tokenDataArray) {
      for (const [collectionName, data] of Object.entries(tokenData)) {
        collectionMap.set(collectionName, { data, name: collectionName });
      }
    }

    // Process all collections in dependency order
    let totalCreated = 0;

    for (const collectionName of importOrder) {
      const collectionInfo = collectionMap.get(collectionName);
      if (!collectionInfo) {
        console.warn(`⚠️  Collection not found in data: ${collectionName}`);
        continue;
      }

      try {
        // Ensure collection exists
        const collection = await ensureVariableCollection(
          collectionName,
          collectionInfo.data.modes || [{ modeId: "default", name: "Default" }]
        );

        // Create all variables in this collection with proper ordering
        const tokenEntries = Object.entries(collectionInfo.data.variables);

        // Sort tokens within collection by dependency order
        const sortedTokenEntries = sortTokensByDependencies(tokenEntries);

        let collectionCreated = 0;

        for (const [tokenName, token] of sortedTokenEntries) {
          const variable = await createVariableWithReferences(
            collection,
            tokenName,
            token,
            globalRegistry
          );
          if (variable) {
            collectionCreated++;
            totalCreated++;
          }
        }
        result.collectionsProcessed++;
      } catch (error) {
        const errorMsg = `Failed to process collection ${collectionName}: ${error instanceof Error ? error.message : error}`;
        console.error(`❌ ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }

    result.totalVariablesCreated = totalCreated;

    // Now resolve all references globally
    const resolveResult = await globalRegistry.resolveAllReferences();
    result.totalReferencesResolved = resolveResult.resolved;
    result.unresolvedReferences = resolveResult.unresolved;

    if (result.unresolvedReferences.length > 0) {
      result.errors.push(
        `${result.unresolvedReferences.length} unresolved references`
      );
    }

    result.success =
      result.errors.length === 0 || result.totalVariablesCreated > 0;
    result.message = result.success
      ? `Successfully imported ${result.totalVariablesCreated} variables (${result.totalReferencesResolved} references resolved) across ${result.collectionsProcessed} collections`
      : `Import failed with ${result.errors.length} errors`;
  } catch (error) {
    result.success = false;
    result.message = `Global import failed: ${error instanceof Error ? error.message : error}`;
    result.errors.push(
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("❌ Global import error:", error);
  }

  return result;
}

/**
 * Legacy wrapper for backward compatibility
 */
export async function importTokenData(
  tokenData: ExportData | ExportData[],
  options: ImportOptions = {
    mergeStrategy: "merge",
    createMissingModes: true,
    preserveExistingVariables: false,
  }
): Promise<ImportResult[]> {
  console.log(`🔄 Using legacy importTokenData, upgrading to global import...`);

  const collections = Array.isArray(tokenData) ? tokenData : [tokenData];
  const globalResult = await importMultipleCollections(collections, options);

  // Convert global result to legacy format
  return [
    {
      success: globalResult.success,
      message: globalResult.message,
      collectionsCreated: globalResult.collectionsProcessed,
      variablesCreated: globalResult.totalVariablesCreated,
      errors: globalResult.errors,
      unresolvedReferences: globalResult.unresolvedReferences,
    },
  ];
}

/**
 * Parse uploaded token file content with format adaptation
 */
export async function parseTokenFile(content: string): Promise<{
  data: ExportData | ExportData[];
  adapterResult?: AdapterProcessResult;
}> {
  // DEBUG: Check fontFamily tokens in raw content string
  const parsed = JSON.parse(content);
  if (Array.isArray(parsed)) {
    const fontFamilies: any[] = [];
    parsed.forEach((coll: any) => {
      Object.entries(coll).forEach(([name, data]: [string, any]) => {
        if (data?.variables) {
          Object.entries(data.variables).forEach(
            ([key, token]: [string, any]) => {
              if (token?.$type === "fontFamily") {
                fontFamilies.push({
                  collection: name,
                  token: key,
                  hasDesc: !!token.$description,
                });
              }
            }
          );
        }
      });
    });
    if (fontFamilies.length > 0) {
      console.log("📄 RAW CONTENT fontFamily tokens:", fontFamilies);
    }
  }

  const adapterManager = new FormatAdapterManager();
  const result = await adapterManager.processTokenFile(content);

  if (!result.success) {
    const errorMessage = `Import failed: ${result.errors.join(", ")}${
      result.suggestions
        ? `\n\nSuggestions:\n${result.suggestions.join("\n")}`
        : ""
    }`;
    throw new Error(errorMessage);
  }

  // Log transformations for user feedback
  if (result.transformations.length > 0) {
    console.log("✨ Applied transformations:", result.transformations);

    // Send to UI for display
    figma.ui.postMessage({
      type: "format-transformations",
      transformations: result.transformations,
      detection: result.detection,
      stats: result.stats,
    });
  }

  console.log(
    `✅ parseTokenFile: Successfully processed with ${result.detection.format} adapter`
  );

  return {
    data: result.data,
    adapterResult: result,
  };
}

/**
 * Validate token structure before import
 */
export function validateTokenStructure(tokenData: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!tokenData) {
    errors.push("Token data is empty or null");
    return { valid: false, errors };
  }

  const collections = Array.isArray(tokenData) ? tokenData : [tokenData];

  for (const collection of collections) {
    if (typeof collection !== "object") {
      errors.push("Collection data must be an object");
      continue;
    }

    for (const [collectionName, data] of Object.entries(collection)) {
      if (typeof data !== "object" || !(data as any)?.variables) {
        errors.push(`Collection "${collectionName}" missing variables object`);
        continue;
      }

      for (const [tokenName, token] of Object.entries(
        (data as any).variables
      )) {
        if (
          typeof token !== "object" ||
          !(token as any)?.$type ||
          (token as any)?.$value === undefined
        ) {
          errors.push(`Token "${tokenName}" missing required $type or $value`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Enhanced validation that checks for reference integrity
 */
export function validateTokenReferences(tokenData: ExportData[]): {
  valid: boolean;
  errors: string[];
  missingReferences: string[];
  circularReferences: string[];
} {
  const errors: string[] = [];
  const missingReferences: string[] = [];
  const circularReferences: string[] = [];

  // Build a map of all available tokens
  const availableTokens = new Set<string>();
  for (const collection of tokenData) {
    for (const [collectionName, data] of Object.entries(collection)) {
      for (const tokenName of Object.keys(
        (data as ProcessedCollection).variables
      )) {
        availableTokens.add(tokenName);
      }
    }
  }

  // Check all references
  for (const collection of tokenData) {
    for (const [collectionName, data] of Object.entries(collection)) {
      for (const [tokenName, token] of Object.entries(
        (data as ProcessedCollection).variables
      )) {
        const references = extractReferences(token);

        for (const ref of Array.from(references.values())) {
          const referencedToken = ref.referencePath;

          if (!availableTokens.has(referencedToken)) {
            missingReferences.push(`${tokenName} → {${referencedToken}}`);
          }
        }
      }
    }
  }

  if (missingReferences.length > 0) {
    errors.push(`Missing references: ${missingReferences.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    missingReferences,
    circularReferences,
  };
}
