/**
 * Utility Handlers
 *
 * Handles utility operations like demo tokens, cancel, and Figma variable detection.
 */

import {
  importMultipleCollections,
  parseTokenFile,
  validateTokenStructure,
  validateTokenReferences,
} from "../variables/importer";
import { setLoading } from "./utils";

/**
 * Generate and import demo tokens
 */
export async function handleGenerateDemoTokens(msg: any): Promise<void> {
  console.log("🎨 Generating demo tokens...");

  try {
    setLoading(true, "Loading demo tokens...");

    // Import demo tokens from pre-generated file
    console.log("📦 Loading demo tokens file...");
    const demoTokens = await import("../data/demo-tokens.json");
    const demoTokenContent = JSON.stringify(demoTokens.default, null, 2);
    console.log("✅ Demo tokens file loaded");

    // Parse with format adapter
    console.log("🔍 Parsing token file...");
    const parseResult = await parseTokenFile(demoTokenContent);
    const tokenData = parseResult.data;
    console.log("✅ Tokens parsed");

    // Validate structure
    console.log("🔍 Validating token structure...");
    const validation = validateTokenStructure(tokenData);
    if (!validation.valid) {
      throw new Error(
        `Invalid demo token structure: ${validation.errors.join(", ")}`
      );
    }
    console.log("✅ Token structure valid");

    // Validate references
    setLoading(true, "Validating token references...");
    const allTokenData = Array.isArray(tokenData) ? tokenData : [tokenData];
    const referenceValidation = validateTokenReferences(allTokenData);
    console.log(
      `✅ References validated (${referenceValidation.missingReferences.length} missing)`
    );

    // Import tokens
    setLoading(true, "Creating variables in Figma...");
    console.log("🚀 Starting import to Figma...");
    const result = await importMultipleCollections(allTokenData);
    console.log(`✅ Import result:`, {
      success: result.success,
      collectionsProcessed: result.collectionsProcessed,
      totalVariablesCreated: result.totalVariablesCreated,
      message: result.message,
    });

    setLoading(false);

    const response = {
      type: "tokens-imported",
      result: {
        success: result.success,
        totalCollectionsCreated: result.collectionsProcessed,
        totalVariablesCreated: result.totalVariablesCreated,
        message: result.message || "Demo tokens imported successfully!",
      },
      validationReport: result.validationReport || {
        valid: validation.valid,
        errors: validation.errors || [],
        warnings: [],
        missingReferences: referenceValidation.missingReferences || [],
        stats: {
          totalTokens: result.totalVariablesCreated || 0,
          totalReferences: 0,
          totalCollections: result.collectionsProcessed || 0,
        },
      },
    };

    console.log("📤 Sending import result to UI:", response);
    figma.ui.postMessage(response);
  } catch (error: unknown) {
    console.error("❌ Error generating demo tokens:", error);
    setLoading(false);
    figma.ui.postMessage({
      type: "error",
      message: `Failed to generate demo tokens: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}

/**
 * Detect existing Figma Variables
 */
export async function handleDetectFigmaVariables(msg: any): Promise<void> {
  console.log("Detecting existing Figma Variables...");

  try {
    const { FigmaVariableImporter } =
      await import("../variables/figma-variable-importer");
    const detection = await FigmaVariableImporter.detectVariables();

    figma.ui.postMessage({
      type: "figma-variables-detected",
      detection: detection,
    });
  } catch (error: unknown) {
    console.error("Error detecting variables:", error);
    figma.ui.postMessage({
      type: "error",
      message: `Failed to detect Figma Variables: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}

/**
 * Convert Figma Variables to W3C DTCG format
 */
export async function handleConvertFigmaVariables(msg: any): Promise<void> {
  console.log("Converting Figma Variables to W3C DTCG format...");

  try {
    setLoading(true, "Converting Figma Variables...");

    const { FigmaVariableImporter } =
      await import("../variables/figma-variable-importer");

    // First detect variables
    const detection = await FigmaVariableImporter.detectVariables();

    if (!detection.hasVariables) {
      throw new Error("No Variables found in current file");
    }

    // Filter collections if specific IDs were provided
    const collectionIds = msg.collectionIds || null;
    if (collectionIds && collectionIds.length > 0) {
      console.log(
        `Converting ${collectionIds.length} of ${detection.collections.length} collections`
      );
    }

    // Convert to W3C DTCG format with progress tracking
    const tokenSets = await FigmaVariableImporter.convertToTokens(
      (current, total, message) => {
        setLoading(
          true,
          message || `Converting ${current}/${total} variables...`
        );
      },
      collectionIds
    );

    setLoading(false);

    figma.ui.postMessage({
      type: "figma-variables-converted",
      tokenSets: tokenSets,
      detection: detection,
    });

    console.log(
      `✅ Converted ${tokenSets.reduce((sum, set) => sum + Object.keys(set.tokens || {}).length, 0)} Figma Variables to ${tokenSets.length} token sets`
    );
  } catch (error: unknown) {
    console.error("Error converting variables:", error);
    setLoading(false);
    figma.ui.postMessage({
      type: "error",
      message: `Failed to convert Figma Variables: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}

/**
 * Cancel ongoing operation
 */
export async function handleCancelOperation(msg: any): Promise<void> {
  console.log("Cancelling operation:", msg.operation);
  setLoading(false);
  figma.ui.postMessage({
    type: "operation-cancelled",
    operation: msg.operation,
  });
}
