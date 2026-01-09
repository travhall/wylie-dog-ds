/**
 * Token Handlers
 *
 * Handles token import, export, and validation operations.
 */

import { processCollectionsForExport } from "../variables/processor";
import {
  importMultipleCollections,
  parseTokenFile,
  validateTokenStructure,
  validateTokenReferences,
} from "../variables/importer";
import { setLoading, processInChunks, sendError } from "./utils";

/**
 * Validate import without actually importing - returns preview data
 */
export async function handleValidateImport(msg: any): Promise<void> {
  console.log("Validating import for files:", msg.files?.length || 0);

  try {
    if (!msg.files || msg.files.length === 0) {
      throw new Error("No files provided for validation");
    }

    // Parse all files with format adaptation (same as import)
    const allTokenData = [];
    const adapterResults: any[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    let totalTokens = 0;

    for (const file of msg.files) {
      console.log(`Validating file: ${file.filename}`);

      try {
        // Parse with format adapter
        const parseResult = await parseTokenFile(file.content);
        const tokenData = parseResult.data;

        if (parseResult.adapterResult) {
          adapterResults.push(
            Object.assign(
              {
                filename: file.filename,
              },
              parseResult.adapterResult
            )
          );
        }

        // Validate structure
        const validation = validateTokenStructure(tokenData);
        if (!validation.valid) {
          validation.errors.forEach((error) => errors.push(error));
        }

        // Count tokens
        if (Array.isArray(tokenData)) {
          tokenData.forEach((collection) => {
            const collectionObj = Object.values(collection)[0] as any;
            if (collectionObj?.variables) {
              totalTokens += Object.keys(collectionObj.variables).length;
            }
          });
          allTokenData.push(...tokenData);
        } else {
          const collectionObj = Object.values(tokenData)[0] as any;
          if (collectionObj?.variables) {
            totalTokens += Object.keys(collectionObj.variables).length;
          }
          allTokenData.push(tokenData);
        }
      } catch (fileError: unknown) {
        console.error(`Error validating file ${file.filename}:`, fileError);
        errors.push(
          `Failed to validate ${file.filename}: ${fileError instanceof Error ? fileError.message : "Unknown error"}`
        );
      }
    }

    // Validate references
    const referenceValidation = validateTokenReferences(allTokenData);
    if (referenceValidation.missingReferences.length > 0) {
      if (referenceValidation.missingReferences.length > 10) {
        warnings.push(
          `${referenceValidation.missingReferences.length} missing references detected. These will be created during import.`
        );
      } else {
        referenceValidation.missingReferences.forEach((ref) => {
          warnings.push(`Missing reference: ${ref}`);
        });
      }
    }

    // Build transformation summary
    const transformations: any[] = [];
    adapterResults.forEach((result) => {
      if (result.normalization?.transformations) {
        result.normalization.transformations.forEach((t: any) => {
          const existing = transformations.find((x) => x.type === t.type);
          if (existing) {
            existing.count++;
            if (t.description && !existing.examples.includes(t.description)) {
              existing.examples.push(t.description);
            }
          } else {
            transformations.push({
              type: t.type,
              count: 1,
              examples: t.description ? [t.description] : [],
            });
          }
        });
      }
    });

    // Get format with highest confidence
    const primaryFormat =
      adapterResults.length > 0
        ? adapterResults[0].detection?.format || "Unknown"
        : "Unknown";
    const confidence =
      adapterResults.length > 0
        ? adapterResults[0].detection?.confidence || 0
        : 0;

    // Send validation result
    figma.ui.postMessage({
      type: "import-validated",
      summary: {
        format: primaryFormat,
        confidence: confidence,
        collectionsFound: allTokenData.length,
        tokensToImport: totalTokens,
        transformations: transformations.map((t) => ({
          type: t.type,
          description: t.examples[0] || t.type.replace(/-/g, " "),
          before: "",
          after: "",
        })),
        warnings,
        errors,
      },
      // Store files for actual import after confirmation
      pendingFiles: msg.files,
    });

    console.log("Validation complete:", {
      collections: allTokenData.length,
      tokens: totalTokens,
      warnings: warnings.length,
      errors: errors.length,
    });
  } catch (error: unknown) {
    console.error("Error validating import:", error);
    figma.ui.postMessage({
      type: "import-validation-error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Import tokens from JSON files
 */
export async function handleImportTokens(msg: any): Promise<void> {
  console.log("Importing tokens from files:", msg.files?.length || 0);

  try {
    setLoading(true, "Parsing token files with format detection...");

    if (!msg.files || msg.files.length === 0) {
      throw new Error("No files provided for import");
    }

    // Parse all files with format adaptation
    const allTokenData = [];
    const adapterResults: any[] = [];

    for (const file of msg.files) {
      console.log(`Parsing file: ${file.filename}`);

      try {
        // Parse with format adapter
        const parseResult = await parseTokenFile(file.content);
        const tokenData = parseResult.data;

        if (parseResult.adapterResult) {
          adapterResults.push(
            Object.assign(
              {
                filename: file.filename,
              },
              parseResult.adapterResult
            )
          );
          console.log(
            `✨ File ${file.filename} processed with ${parseResult.adapterResult.detection.format} format adapter`
          );
        }

        // Validate structure (fallback validation)
        const validation = validateTokenStructure(tokenData);
        if (!validation.valid) {
          console.error(
            `Validation failed for ${file.filename}:`,
            validation.errors
          );
          throw new Error(
            `Invalid token structure in ${file.filename}: ${validation.errors.join(", ")}`
          );
        }

        console.log(`File ${file.filename} validated successfully`);

        // Add to collection for global processing
        if (Array.isArray(tokenData)) {
          allTokenData.push.apply(allTokenData, tokenData);
        } else {
          allTokenData.push(tokenData);
        }
      } catch (fileError: unknown) {
        console.error(`Error processing file ${file.filename}:`, fileError);
        throw new Error(
          `Failed to process ${file.filename}: ${fileError instanceof Error ? fileError.message : "Unknown error"}`
        );
      }
    }

    // Validate references across all collections
    setLoading(true, "Validating token references...");
    const referenceValidation = validateTokenReferences(allTokenData);

    if (referenceValidation.missingReferences.length > 0) {
      console.warn(
        "Missing references detected:",
        referenceValidation.missingReferences
      );

      // If we have critical missing references, fail the import
      if (referenceValidation.missingReferences.length > 10) {
        throw new Error(
          `Too many missing references (${referenceValidation.missingReferences.length}). Please ensure all referenced tokens are included:\n${referenceValidation.missingReferences.slice(0, 5).join("\n")}${referenceValidation.missingReferences.length > 5 ? "\n... and more" : ""}`
        );
      } else {
        console.log(
          "Proceeding with import despite missing references - they will be created as needed"
        );
      }
    }

    // Use new global import function for cross-collection reference resolution
    setLoading(true, "Importing tokens with reference resolution...");
    console.log(
      `🚀 Starting global import with ${allTokenData.length} collections`
    );

    const globalResult = await importMultipleCollections(allTokenData, {
      mergeStrategy: "merge",
      createMissingModes: true,
      preserveExistingVariables: false,
    });

    console.log("🎉 Global import result:", globalResult);

    // Check if import was successful despite reference issues
    if (
      !globalResult.success &&
      referenceValidation.missingReferences.length > 0
    ) {
      // Enhance error message with reference information
      const enhancedError = `${globalResult.message}\n\nReference Issues:\n${referenceValidation.missingReferences.slice(0, 3).join("\n")}${referenceValidation.missingReferences.length > 3 ? "\n... and more" : ""}\n\nTip: Make sure all referenced tokens are in the same import or in existing collections.`;
      globalResult.message = enhancedError;
    }

    setLoading(false);

    // Send results back to UI including format adapter information
    figma.ui.postMessage({
      type: "tokens-imported",
      result: globalResult,
      results: [globalResult], // Convert to array format for UI compatibility
      referenceValidation: referenceValidation,
      validationReport: globalResult.validationReport, // Include enhanced validation
      adapterResults: adapterResults, // Include format adaptation results
    });

    console.log("Global import completed:", globalResult);
  } catch (error: unknown) {
    console.error("Error importing tokens:", error);
    setLoading(false);
    figma.ui.postMessage({
      type: "import-error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Export tokens to JSON files
 */
export async function handleExportTokens(msg: any): Promise<void> {
  console.log("Exporting tokens for collections:", msg.collectionIds);

  try {
    if (!msg.collectionIds || msg.collectionIds.length === 0) {
      throw new Error("No collections selected for export");
    }

    setLoading(true, "Loading collections...");

    // Get all collections with their variables
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();
    const selectedCollections = collections.filter((c) =>
      msg.collectionIds.includes(c.id)
    );

    if (selectedCollections.length === 0) {
      throw new Error("Selected collections not found");
    }

    const collectionsWithVariables = [];

    setLoading(true, `Processing ${selectedCollections.length} collections...`);

    for (let i = 0; i < selectedCollections.length; i++) {
      const collection = selectedCollections[i];
      console.log(
        `Processing collection ${i + 1}/${selectedCollections.length}: ${collection.name}`
      );
      setLoading(
        true,
        `Processing ${collection.name} (${collection.variableIds.length} variables)...`
      );

      // Process variables in chunks for this collection
      const variables = await processInChunks(
        collection.variableIds,
        async (variableId: string) => {
          try {
            const variable =
              await figma.variables.getVariableByIdAsync(variableId);
            if (variable) {
              return {
                id: variable.id,
                name: variable.name,
                description: variable.description || "",
                resolvedType: variable.resolvedType,
                scopes: variable.scopes,
                valuesByMode: variable.valuesByMode,
                remote: variable.remote,
                key: variable.key,
              };
            }
            return null;
          } catch (err) {
            console.error("Error processing variable:", variableId, err);
            return null;
          }
        },
        75, // Smaller chunks for export to provide more progress updates
        (current, total) => {
          setLoading(
            true,
            `Processing ${collection.name}: ${current}/${total} variables...`
          );
        }
      );

      // Filter out null results
      const validVariables = variables.filter((v) => v !== null);

      collectionsWithVariables.push({
        id: collection.id,
        name: collection.name,
        modes: collection.modes,
        variables: validVariables,
      });
    }

    setLoading(true, "Converting to token format...");
    console.log(
      `Processing ${collectionsWithVariables.length} collections for export`
    );

    // Process collections into token format
    const exportData = await processCollectionsForExport(
      collectionsWithVariables,
      msg.collectionIds
    );

    // Transform to downloadable files format
    const downloadableFiles = exportData.map((data) => {
      const collectionName = Object.keys(data)[0];
      return {
        filename: `${collectionName}.json`,
        content: JSON.stringify(data, null, 2),
      };
    });

    setLoading(false);

    // Send processed tokens back to UI
    figma.ui.postMessage({
      type: "tokens-exported",
      exportData: downloadableFiles,
    });

    console.log("Export completed successfully");
  } catch (error: unknown) {
    console.error("Error exporting tokens:", error);
    setLoading(false);
    sendError(
      `Failed to export tokens: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get local tokens for conflict detection
 */
export async function handleGetLocalTokens(msg: any): Promise<void> {
  try {
    console.log("📍 Exporting local tokens for conflict detection...");
    setLoading(true, "Reading local variables...");

    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();
    console.log(`Found ${collections.length} local collections`);

    const collectionsWithVariables = [];

    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i];
      console.log(
        `Processing collection ${i + 1}/${collections.length}: ${collection.name}`
      );

      // Process variables in chunks
      const variables = await processInChunks(
        collection.variableIds,
        async (variableId: string) => {
          try {
            const variable =
              await figma.variables.getVariableByIdAsync(variableId);
            if (variable) {
              return {
                id: variable.id,
                name: variable.name,
                description: variable.description || "",
                resolvedType: variable.resolvedType,
                scopes: variable.scopes,
                valuesByMode: variable.valuesByMode,
                remote: variable.remote,
                key: variable.key,
              };
            }
            return null;
          } catch (err) {
            console.error("Error processing variable:", variableId, err);
            return null;
          }
        },
        100
      );

      const validVariables = variables.filter((v) => v !== null);

      collectionsWithVariables.push({
        id: collection.id,
        name: collection.name,
        modes: collection.modes,
        variables: validVariables,
      });
    }

    setLoading(true, "Converting to token format...");

    // Convert to token format using processor
    const exportData = await processCollectionsForExport(
      collectionsWithVariables,
      collections.map((c) => c.id)
    );

    setLoading(false);

    figma.ui.postMessage({
      type: "local-tokens-exported",
      localTokens: exportData,
    });

    console.log("✅ Local tokens exported for conflict detection");
  } catch (error: unknown) {
    console.error("Error exporting local tokens:", error);
    setLoading(false);
    figma.ui.postMessage({
      type: "local-tokens-error",
      error:
        error instanceof Error
          ? error.message
          : "Failed to export local tokens",
    });
  }
}
