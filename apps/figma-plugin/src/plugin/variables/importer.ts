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

// Map W3C DTCG types to Figma types
const W3C_TO_FIGMA_TYPE_MAP: Record<string, string> = {
  color: "COLOR",
  fontSize: "FLOAT",
  fontWeight: "STRING",
  fontFamily: "STRING",
  lineHeight: "STRING",
  letterSpacing: "FLOAT",
  spacing: "FLOAT",
  sizing: "FLOAT",
  borderRadius: "FLOAT",
  borderWidth: "FLOAT",
  dimension: "FLOAT",
  shadow: "STRING",
  boolean: "BOOLEAN",
};

// Map W3C DTCG types to Figma scopes
const W3C_TO_FIGMA_SCOPES_MAP: Record<string, string[]> = {
  color: ["ALL_SCOPES"],
  fontSize: ["FONT_SIZE"],
  fontWeight: ["FONT_WEIGHT"],
  fontFamily: ["FONT_FAMILY"],
  lineHeight: ["LINE_HEIGHT"],
  letterSpacing: ["LETTER_SPACING"],
  spacing: ["GAP", "PADDING"],
  sizing: ["WIDTH", "HEIGHT"],
  borderRadius: ["CORNER_RADIUS"],
  borderWidth: ["STROKE_WIDTH"],
  dimension: ["GAP", "PADDING"],
  shadow: ["EFFECT"],
  boolean: ["ALL_SCOPES"],
};

/**
 * Convert hex color to Figma RGB format (0-1 range)
 */
function hexToFigmaRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  return { r, g, b };
}

/**
 * Parse numeric value from string (e.g., "16px" -> 16)
 */
function parseNumericValue(value: string): number {
  const parsed = parseFloat(value.toString().replace(/[^\d.-]/g, ""));
  return isNaN(parsed) ? 0 : parsed;
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
    case "COLOR":
      if (typeof value === "string" && value.startsWith("#")) {
        return hexToFigmaRgb(value);
      }
      return { r: 0, g: 0, b: 0 }; // Fallback

    case "FLOAT":
      return parseNumericValue(value);

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
          console.log(`Added mode "${modeData.name}"`);
        } catch (error) {
          console.warn(`Failed to add mode "${modeData.name}":`, error);
        }
      }
    }

    // Remove default "Mode 1" if we added custom modes
    if (hasDefaultMode && modes.length > 0) {
      try {
        const defaultMode = collection.modes.find((m) => m.name === "Mode 1");
        if (defaultMode && collection.modes.length > 1) {
          collection.removeMode(defaultMode.modeId);
          console.log(`Removed default Mode 1`);
        }
      } catch (error) {
        console.warn(`Failed to remove default mode:`, error);
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
      if (token.$description) variable.description = token.$description;
      console.log(`Created variable: ${figmaName}`);
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

          // Set immediate value
          const figmaValue = convertTokenValueToFigma(
            Object.assign({}, token, { $value: modeValue }),
            figmaType
          );
          variable.setValueForMode(mode.modeId, figmaValue);
        }
      }

      // Add pending references if any
      if (modeReferences.size > 0) {
        registry.addPendingResolution(variable, tokenName, modeReferences);
      }
    } else {
      // Single mode token
      const defaultMode = collection.modes[0];

      if (isTokenReference(token.$value)) {
        // Queue reference for later resolution
        const ref = parseTokenReference(token.$value);
        if (ref) {
          const modeReferences = new Map();
          modeReferences.set(defaultMode.modeId, ref);
          registry.addPendingResolution(variable, tokenName, modeReferences);
        }
      } else {
        // Set immediate value
        const figmaValue = convertTokenValueToFigma(token, figmaType);
        variable.setValueForMode(defaultMode.modeId, figmaValue);
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
    console.log(
      `🚀 Starting global import of ${tokenDataArray.length} collections`
    );

    // ENHANCED VALIDATION - Run comprehensive validation before processing
    console.log("🔍 Running enhanced token validation...");
    const validationReport = validateTokensForImport(tokenDataArray);
    result.validationReport = validationReport;

    console.log(
      `📊 Validation complete: ${validationReport.stats.totalTokens} tokens, ${validationReport.stats.totalReferences} references`
    );
    console.log(
      `⚠️ Validation errors: ${validationReport.errors.length}, warnings: ${validationReport.warnings.length}`
    );

    // Log validation errors and warnings
    if (validationReport.errors.length > 0) {
      console.error("❌ Validation errors found:");
      validationReport.errors.forEach((error) => {
        console.error(`  - ${error.type}: ${error.message}`);
        if (error.suggestion) console.error(`    💡 ${error.suggestion}`);
      });
    }

    if (validationReport.warnings.length > 0) {
      console.warn("⚠️ Validation warnings found:");
      validationReport.warnings.forEach((warning) => {
        console.warn(`  - ${warning.type}: ${warning.message}`);
        if (warning.suggestion) console.warn(`    💡 ${warning.suggestion}`);
      });
    }

    // Stop import if critical errors found
    if (!validationReport.valid) {
      result.errors = validationReport.errors.map((e) => e.message);
      result.message = `Import failed validation: ${validationReport.errors.length} critical errors found`;
      return result;
    }

    console.log("✅ Validation passed, proceeding with import...");
    console.log(
      "📊 Token data structure:",
      tokenDataArray.map((data, i) => `${i}: ${Object.keys(data).join(", ")}`)
    );

    // Create a single registry for all collections
    const globalRegistry = new VariableRegistry();

    // Analyze all collections to determine import order
    const importOrder = createImportOrder(tokenDataArray);
    console.log(`📋 Import order determined: ${importOrder.join(" → ")}`);

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

    console.log(
      `📊 Found collections: ${Array.from(collectionMap.keys()).join(", ")}`
    );

    // Process all collections in dependency order
    let totalCreated = 0;

    for (const collectionName of importOrder) {
      const collectionInfo = collectionMap.get(collectionName);
      if (!collectionInfo) {
        console.warn(`⚠️  Collection not found in data: ${collectionName}`);
        continue;
      }

      console.log(`\n📦 Processing collection: ${collectionName}`);
      console.log(
        `   Variables to process: ${Object.keys(collectionInfo.data.variables).length}`
      );

      try {
        // Ensure collection exists
        const collection = await ensureVariableCollection(
          collectionName,
          collectionInfo.data.modes || [{ modeId: "default", name: "Default" }]
        );

        // Create all variables in this collection
        const tokenEntries = Object.entries(collectionInfo.data.variables);
        let collectionCreated = 0;

        for (const [tokenName, token] of tokenEntries) {
          console.log(`   Creating variable: ${tokenName}`);
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

        console.log(
          `✅ Created ${collectionCreated} variables in ${collectionName}`
        );
        result.collectionsProcessed++;
      } catch (error) {
        const errorMsg = `Failed to process collection ${collectionName}: ${error instanceof Error ? error.message : error}`;
        console.error(`❌ ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }

    console.log(`\n🔗 Resolving all references globally...`);
    console.log(
      `   Registry size: ${globalRegistry.getRegistrySize()} variables registered`
    );
    result.totalVariablesCreated = totalCreated;

    // Now resolve all references globally
    const resolveResult = await globalRegistry.resolveAllReferences();
    result.totalReferencesResolved = resolveResult.resolved;
    result.unresolvedReferences = resolveResult.unresolved;

    if (result.unresolvedReferences.length > 0) {
      console.warn(
        `⚠️  Unresolved references found:`,
        result.unresolvedReferences
      );
      result.errors.push(
        `${result.unresolvedReferences.length} unresolved references`
      );
    }

    result.success =
      result.errors.length === 0 || result.totalVariablesCreated > 0;
    result.message = result.success
      ? `Successfully imported ${result.totalVariablesCreated} variables (${result.totalReferencesResolved} references resolved) across ${result.collectionsProcessed} collections`
      : `Import failed with ${result.errors.length} errors`;

    console.log(`\n🎉 Global import complete:`);
    console.log(`   Collections: ${result.collectionsProcessed}`);
    console.log(`   Variables: ${result.totalVariablesCreated}`);
    console.log(`   References: ${result.totalReferencesResolved}`);
    console.log(`   Unresolved: ${result.unresolvedReferences.length}`);
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
  console.log("🔄 parseTokenFile: Using Format Adapter Manager");

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
