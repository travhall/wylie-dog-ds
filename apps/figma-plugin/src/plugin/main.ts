// Plugin main entry point
import { processCollectionsForExport } from "./variables/processor";
import {
  importMultipleCollections,
  parseTokenFile,
  validateTokenStructure,
  validateTokenReferences,
} from "./variables/importer";
import { fileConfigStorage } from "./storage/file-storage";
import { userPreferencesStorage } from "./storage/user-storage";

// GitHub operations moved to UI thread - no imports here

console.log("Plugin starting...");

// Helper function to communicate loading state to UI
function setLoading(loading: boolean, message?: string) {
  figma.ui.postMessage({
    type: "loading-state",
    loading,
    message,
  });
}

// Helper function for chunked processing - Quick Win #5
async function processInChunks<T, R>(
  items: T[],
  processFn: (item: T, index: number) => Promise<R>,
  chunkSize: number = 50,
  onProgress?: (current: number, total: number, message?: string) => void
): Promise<R[]> {
  const results: R[] = [];
  const total = items.length;

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map((item, chunkIndex) => processFn(item, i + chunkIndex))
    );

    results.push(...chunkResults);

    // Update progress
    const current = Math.min(i + chunkSize, total);
    if (onProgress) {
      onProgress(current, total, `Processing ${current}/${total} items...`);
    }

    // Allow UI updates between chunks
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return results;
}

figma.showUI(__html__, {
  width: 400,
  height: 600,
  title: "Token Bridge",
});

// Migration disabled - needs complete redesign
// The current approach has fatal flaws that break existing functionality
// TODO: Redesign migration strategy before re-enabling

// Handle UI messages
figma.ui.onmessage = async (msg) => {
  console.log("Plugin received message:", msg.type);

  try {
    switch (msg.type) {
      case "get-collections":
        console.log("Getting variable collections...");
        const collections =
          await figma.variables.getLocalVariableCollectionsAsync();
        console.log("Found collections:", collections.length);

        figma.ui.postMessage({
          type: "collections-loaded",
          collections: collections.map((c) => ({
            id: c.id,
            name: c.name,
            modes: c.modes,
            variableIds: c.variableIds,
          })),
        });
        break;

      case "get-collection-details":
        console.log("Getting collection details for:", msg.collectionId);
        try {
          // Get all collections first, then find the one we want
          const collections =
            await figma.variables.getLocalVariableCollectionsAsync();
          const collection = collections.find((c) => c.id === msg.collectionId);

          if (!collection) {
            throw new Error("Collection not found");
          }

          console.log(
            "Found collection:",
            collection.name,
            "with",
            collection.variableIds.length,
            "variables"
          );
          setLoading(
            true,
            `Processing ${collection.variableIds.length} variables...`
          );

          // Process variables in chunks - Quick Win #5
          const variables = await processInChunks(
            collection.variableIds,
            async (id: string, index: number) => {
              try {
                const variable = await figma.variables.getVariableByIdAsync(id);
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
                console.error("Error processing variable:", id, err);
                return null;
              }
            },
            100, // Process 100 variables at a time
            (current, total, message) => {
              setLoading(true, message);
            }
          );

          // Filter out null results
          const validVariables = variables.filter((v) => v !== null);

          console.log(
            "Processed",
            validVariables.length,
            "variables successfully"
          );
          setLoading(false);

          figma.ui.postMessage({
            type: "collection-details-loaded",
            collection: {
              id: collection.id,
              name: collection.name,
              modes: collection.modes,
              variables: validVariables,
            },
          });
        } catch (error: unknown) {
          console.error("Error getting collection details:", error);
          setLoading(false);
          figma.ui.postMessage({
            type: "error",
            message: `Failed to load collection details: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
        break;

      case "export-tokens":
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

          setLoading(
            true,
            `Processing ${selectedCollections.length} collections...`
          );

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
            const collectionData = data[collectionName];
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
          figma.ui.postMessage({
            type: "error",
            message: `Failed to export tokens: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
        break;

      case "import-tokens":
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
              console.error(
                `Error processing file ${file.filename}:`,
                fileError
              );
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
        break;

      case "get-github-config":
        try {
          const config = await fileConfigStorage.getGitHubConfig();

          figma.ui.postMessage({
            type: "github-config-loaded",
            config: config,
          });
        } catch (error) {
          console.error("Error loading GitHub config:", error);
          figma.ui.postMessage({
            type: "github-config-loaded",
            config: null,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
        break;

      case "test-github-config":
        // GitHub operations now handled entirely in UI thread
        console.log(
          "GitHub config test request - forwarding to UI storage operation"
        );
        try {
          await figma.clientStorage.setAsync(
            "pending-github-config",
            JSON.stringify(msg.config)
          );
          figma.ui.postMessage({
            type: "test-github-config",
            config: msg.config,
          });
        } catch (error) {
          console.error("Error handling GitHub config test:", error);
          figma.ui.postMessage({
            type: "error",
            message: "Failed to process GitHub configuration test",
          });
        }
        break;

      case "save-github-config":
        try {
          await fileConfigStorage.setGitHubConfig(msg.config);

          figma.ui.postMessage({
            type: "github-config-saved",
            success: true,
          });
        } catch (error) {
          console.error("Error saving GitHub config:", error);
          figma.ui.postMessage({
            type: "github-config-saved",
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to save configuration",
          });
        }
        break;

      case "get-advanced-mode":
        try {
          const advancedMode = await userPreferencesStorage.getAdvancedMode();

          figma.ui.postMessage({
            type: "advanced-mode-loaded",
            advancedMode,
          });
        } catch (error) {
          console.error("Error loading advanced mode:", error);
          figma.ui.postMessage({
            type: "advanced-mode-loaded",
            advancedMode: false,
          });
        }
        break;

      case "save-advanced-mode":
        try {
          await userPreferencesStorage.setAdvancedMode(msg.advancedMode);
          console.log("Advanced mode preference saved:", msg.advancedMode);
        } catch (error) {
          console.error("Error saving advanced mode:", error);
        }
        break;

      case "get-onboarding-state":
        try {
          const hasSeenOnboarding =
            await userPreferencesStorage.getHasSeenOnboarding();

          figma.ui.postMessage({
            type: "onboarding-state-loaded",
            hasSeenOnboarding,
          });
        } catch (error) {
          console.error("Error loading onboarding state:", error);
          figma.ui.postMessage({
            type: "onboarding-state-loaded",
            hasSeenOnboarding: false,
          });
        }
        break;

      case "save-onboarding-state":
        try {
          await userPreferencesStorage.setHasSeenOnboarding(
            msg.hasSeenOnboarding
          );
          console.log("Onboarding state saved:", msg.hasSeenOnboarding);
        } catch (error) {
          console.error("Error saving onboarding state:", error);
        }
        break;

      case "clear-github-config":
        try {
          await fileConfigStorage.clearGitHubConfig();

          figma.ui.postMessage({
            type: "github-config-cleared",
            success: true,
          });
        } catch (error) {
          console.error("Error clearing GitHub config:", error);
          figma.ui.postMessage({
            type: "github-config-cleared",
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to clear configuration",
          });
        }
        break;

      case "check-file-engagement":
        try {
          const hasEngaged = await fileConfigStorage.hasEngagedWithFile();
          figma.ui.postMessage({
            type: "file-engagement-status",
            hasEngaged,
          });
        } catch (error) {
          console.error("Error checking file engagement:", error);
        }
        break;

      case "mark-file-engaged":
        try {
          await fileConfigStorage.markFileEngaged();
          console.log("File marked as engaged");
          // Notify UI that engagement status changed
          figma.ui.postMessage({
            type: "file-engagement-status",
            hasEngaged: true,
          });
        } catch (error) {
          console.error("Error marking file engaged:", error);
        }
        break;

      case "github-sync-tokens":
        try {
          setLoading(true, "Exporting tokens for GitHub sync...");

          // Get collection IDs from message (handles both collectionIds and selectedCollectionIds for backwards compatibility)
          const collectionIds = msg.collectionIds || msg.selectedCollectionIds;

          if (!collectionIds) {
            throw new Error("No collection IDs provided");
          }

          // Get collections and export tokens (same logic as export-tokens)
          const collections =
            await figma.variables.getLocalVariableCollectionsAsync();
          const collectionsWithVariables = [];

          for (const collection of collections) {
            if (!collectionIds.includes(collection.id)) {
              continue;
            }

            const variables = [];
            for (const variableId of collection.variableIds) {
              try {
                const variable =
                  await figma.variables.getVariableByIdAsync(variableId);
                if (variable) {
                  variables.push({
                    id: variable.id,
                    name: variable.name,
                    description: variable.description || "",
                    resolvedType: variable.resolvedType,
                    scopes: variable.scopes,
                    valuesByMode: variable.valuesByMode,
                    remote: variable.remote,
                    key: variable.key,
                  });
                }
              } catch (err) {
                console.error("Error processing variable:", variableId, err);
              }
            }

            collectionsWithVariables.push({
              id: collection.id,
              name: collection.name,
              modes: collection.modes,
              variables: variables,
            });
          }

          const exportData = await processCollectionsForExport(
            collectionsWithVariables,
            collectionIds
          );

          // Forward to UI thread for GitHub operations
          figma.ui.postMessage({
            type: "github-sync-tokens",
            selectedCollectionIds: collectionIds,
            exportData: exportData,
          });
        } catch (error: unknown) {
          console.error("Error preparing GitHub sync:", error);
          setLoading(false);
          figma.ui.postMessage({
            type: "github-sync-complete",
            result: {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to prepare sync data",
            },
          });
        }
        break;

      case "github-pull-tokens":
        console.log("Forwarding GitHub pull to UI thread...");
        // Forward to UI thread where fetch is available
        figma.ui.postMessage({
          type: "github-pull-tokens",
        });
        break;

      case "github-pull-with-conflicts":
        console.log(
          "Forwarding GitHub pull with conflict detection to UI thread..."
        );
        figma.ui.postMessage({
          type: "github-pull-with-conflicts",
        });
        break;

      case "resolve-conflicts":
        console.log("Forwarding conflict resolution to UI thread...");
        figma.ui.postMessage({
          type: "resolve-conflicts",
          resolutions: msg.resolutions,
          originalTokens: msg.originalTokens,
        });
        break;

      case "generate-demo-tokens":
        console.log("🎨 Generating demo tokens...");
        try {
          setLoading(true, "Loading demo tokens...");

          // Import demo tokens from pre-generated file
          console.log("📦 Loading demo tokens file...");
          const demoTokens = await import("./data/demo-tokens.json");
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
          const allTokenData = Array.isArray(tokenData)
            ? tokenData
            : [tokenData];
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
        break;

      case "detect-figma-variables":
        console.log("Detecting existing Figma Variables...");
        try {
          const { FigmaVariableImporter } =
            await import("./variables/figma-variable-importer");
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
        break;

      case "convert-figma-variables":
        console.log("Converting Figma Variables to W3C DTCG format...");
        try {
          setLoading(true, "Converting Figma Variables...");

          const { FigmaVariableImporter } =
            await import("./variables/figma-variable-importer");

          // First detect variables
          const detection = await FigmaVariableImporter.detectVariables();

          if (!detection.hasVariables) {
            throw new Error("No Variables found in current file");
          }

          // Convert to W3C DTCG format with progress tracking
          const tokenSets = await FigmaVariableImporter.convertToTokens(
            (current, total, message) => {
              // Send progress updates to UI
              figma.ui.postMessage({
                type: "conversion-progress",
                current,
                total,
                message,
                percentage: Math.round((current / total) * 100),
              });
            }
          );

          // Generate downloadable files
          const files =
            FigmaVariableImporter.generateDownloadableFiles(tokenSets);

          setLoading(false);

          // Send files to UI for download
          figma.ui.postMessage({
            type: "variables-converted",
            files: files,
            totalTokens: tokenSets.reduce(
              (sum, set) => sum + set.tokenCount,
              0
            ),
            totalCollections: detection.collections.length,
          });

          figma.notify(
            `✅ Converted ${detection.totalVariables} variables from ${detection.collections.length} collections`
          );
        } catch (error: unknown) {
          console.error("Error converting variables:", error);
          setLoading(false);
          figma.ui.postMessage({
            type: "error",
            message: `Failed to convert Figma Variables: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
        break;

      case "github-sync-complete":
        // Acknowledgment message from UI thread after GitHub sync completes
        // No action needed in plugin thread - UI handles the result
        console.log(
          "GitHub sync completed:",
          msg.result?.success ? "✅" : "❌"
        );
        break;

      case "close":
        console.log("Closing plugin...");
        figma.closePlugin();
        break;

      default:
        console.warn("Unknown message type:", msg.type);
        figma.ui.postMessage({
          type: "error",
          message: `Unknown message type: ${msg.type}`,
        });
    }
  } catch (error) {
    console.error("Plugin error:", error);
    figma.ui.postMessage({
      type: "error",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

// Register menu command
figma.on("run", ({ command }) => {
  console.log("Plugin run command:", command);
  if (command === "open-plugin") {
    figma.showUI(__html__, {
      width: 400,
      height: 600,
      title: "Token Bridge",
    });
  }
});

// Real-time variable sync
// Since Figma doesn't provide documentchange events, we use periodic polling
// to detect when variables are added/deleted
let cachedCollectionIds: Set<string> = new Set();
let cachedVariableCount = 0;
let syncInterval: ReturnType<typeof setInterval> | null = null;

async function checkForVariableChanges() {
  try {
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();
    const currentCollectionIds = new Set(collections.map((c) => c.id));
    const currentVariableCount = collections.reduce(
      (sum, c) => sum + c.variableIds.length,
      0
    );

    // Detect changes by comparing IDs and variable counts
    const collectionsChanged =
      cachedCollectionIds.size !== currentCollectionIds.size ||
      ![...cachedCollectionIds].every((id) => currentCollectionIds.has(id));

    const variablesChanged = cachedVariableCount !== currentVariableCount;

    if (collectionsChanged || variablesChanged) {
      console.log(
        "🔄 Variable changes detected - Collections:",
        collections.length,
        "Variables:",
        currentVariableCount
      );

      // Update cache
      cachedCollectionIds = currentCollectionIds;
      cachedVariableCount = currentVariableCount;

      // Notify UI
      figma.ui.postMessage({
        type: "collections-loaded",
        collections: collections.map((c) => ({
          id: c.id,
          name: c.name,
          modes: c.modes,
          variableIds: c.variableIds,
        })),
      });
    }
  } catch (error) {
    console.error("Error checking for variable changes:", error);
  }
}

// Start periodic sync when plugin opens
async function startVariableSync() {
  // Initial load and cache
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  cachedCollectionIds = new Set(collections.map((c) => c.id));
  cachedVariableCount = collections.reduce(
    (sum, c) => sum + c.variableIds.length,
    0
  );

  // Poll every 2 seconds for changes
  syncInterval = setInterval(checkForVariableChanges, 2000);
  console.log("✅ Variable sync started");
}

// Stop sync when plugin closes
figma.on("close", () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log("⏹️ Variable sync stopped");
  }
});

// Start sync immediately
startVariableSync();

console.log("Plugin initialized");
