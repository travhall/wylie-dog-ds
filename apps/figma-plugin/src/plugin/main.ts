// Plugin main entry point
import { processCollectionsForExport } from "./variables/processor";
import {
  importMultipleCollections,
  parseTokenFile,
  validateTokenStructure,
  validateTokenReferences,
} from "./variables/importer";
import { GitHubClient } from "./github/client";

console.log("Plugin starting...");

// Helper function to communicate loading state to UI
function setLoading(loading: boolean, message?: string) {
  figma.ui.postMessage({
    type: "loading-state",
    loading,
    message,
  });
}

// GitHub client instance
let githubClient = new GitHubClient();

figma.showUI(__html__, {
  width: 400,
  height: 600,
  title: "Token Bridge",
});

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

          // Get variables one by one with error handling
          const variables = [];
          console.log(
            "Processing",
            collection.variableIds.length,
            "variable IDs..."
          );

          for (let i = 0; i < collection.variableIds.length; i++) {
            const id = collection.variableIds[i];
            console.log(
              `Processing variable ${i + 1}/${collection.variableIds.length}: ${id}`
            );

            try {
              const variable = await figma.variables.getVariableByIdAsync(id);
              console.log(
                "Variable result:",
                variable ? "found" : "null",
                variable ? variable.name : "undefined"
              );

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
                console.log("Added variable:", variable.name);
              } else {
                console.warn("Variable returned null for ID:", id);
              }
            } catch (err) {
              console.error("Error processing variable:", id, err);
            }
          }

          console.log("Processed", variables.length, "variables successfully");

          figma.ui.postMessage({
            type: "collection-details-loaded",
            collection: {
              id: collection.id,
              name: collection.name,
              modes: collection.modes,
              variables: variables,
            },
          });
        } catch (error: unknown) {
          console.error("Error getting collection details:", error);
          figma.ui.postMessage({
            type: "error",
            message: `Failed to load collection details: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
        break;

      case "export-tokens":
        console.log(
          "Exporting tokens for collections:",
          msg.selectedCollectionIds
        );
        try {
          setLoading(true, "Processing tokens...");

          // Get all collections with their variables
          const collections =
            await figma.variables.getLocalVariableCollectionsAsync();
          const collectionsWithVariables = [];

          for (const collection of collections) {
            // Only process selected collections
            if (!msg.selectedCollectionIds.includes(collection.id)) {
              continue;
            }

            console.log(`Processing collection: ${collection.name}`);
            const variables = [];

            // Get variables for this collection
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

          console.log(
            `Processing ${collectionsWithVariables.length} collections for export`
          );

          // Process collections into token format
          const syncExportData = await processCollectionsForExport(
            collectionsWithVariables,
            msg.selectedCollectionIds
          );

          setLoading(false);

          // Send processed tokens back to UI
          figma.ui.postMessage({
            type: "tokens-exported",
            syncExportData: syncExportData,
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
            // Continue with import but warn user
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
        // Load saved GitHub configuration from storage
        try {
          const config = await figma.clientStorage.getAsync("github-config");
          figma.ui.postMessage({
            type: "github-config-loaded",
            config: config || null,
          });
        } catch (error) {
          console.error("Failed to load GitHub config:", error);
          figma.ui.postMessage({
            type: "github-config-loaded",
            config: null,
          });
        }
        break;

      case "test-github-config":
        console.log("Testing GitHub configuration:", msg.config);
        try {
          setLoading(true, "Testing GitHub connection...");

          // Initialize GitHub client with provided config
          await githubClient.initialize(msg.config);

          // Validate repository access
          const validation = await githubClient.validateRepository();

          if (!validation.valid) {
            throw new Error(validation.error || "Repository validation failed");
          }

          // Save configuration if successful
          await figma.clientStorage.setAsync("github-config", msg.config);

          setLoading(false);
          figma.ui.postMessage({
            type: "github-config-tested",
            success: true,
            config: msg.config,
          });

          console.log("GitHub configuration tested successfully");
        } catch (error: unknown) {
          console.error("GitHub config test failed:", error);
          setLoading(false);
          figma.ui.postMessage({
            type: "github-config-tested",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
        break;

      case "github-sync-tokens":
        console.log(
          "Syncing tokens to GitHub for collections:",
          msg.selectedCollectionIds
        );
        try {
          setLoading(true, "Syncing tokens to GitHub...");

          // Check if GitHub is configured
          const config = await figma.clientStorage.getAsync("github-config");
          if (!config) {
            throw new Error(
              "GitHub not configured. Please configure GitHub integration first."
            );
          }

          // Initialize GitHub client
          await githubClient.initialize(config);

          // Get collections and process for export (reuse existing logic)
          const collections =
            await figma.variables.getLocalVariableCollectionsAsync();
          const collectionsWithVariables = [];

          for (const collection of collections) {
            if (!msg.selectedCollectionIds.includes(collection.id)) {
              continue;
            }

            console.log(
              `Processing collection for GitHub sync: ${collection.name}`
            );
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
                console.error(
                  "Error processing variable for GitHub sync:",
                  variableId,
                  err
                );
              }
            }

            collectionsWithVariables.push({
              id: collection.id,
              name: collection.name,
              modes: collection.modes,
              variables: variables,
            });
          }

          // Debug collections data structure
          console.log(
            "Debug collectionsWithVariables:",
            collectionsWithVariables.length
          );
          console.log(
            "Collections structure:",
            collectionsWithVariables.map((c) => ({
              name: c.name,
              id: c.id,
              variableCount: c.variables?.length || 0,
            }))
          );
          console.log("Selected IDs:", msg.selectedCollectionIds);

          // Process collections into token format
          const syncExportData = await processCollectionsForExport(
            collectionsWithVariables,
            msg.selectedCollectionIds
          );

          // Validate export data before syncing
          if (
            !syncExportData ||
            !Array.isArray(syncExportData) ||
            syncExportData.length === 0
          ) {
            throw new Error(
              "Failed to process collections for export. No valid token data generated."
            );
          }

          console.log(
            "Export data ready for GitHub sync:",
            syncExportData.length,
            "collections"
          );

          // Sync to GitHub
          const syncResult = await githubClient.syncTokens(
            syncExportData,
            `Update design tokens from Figma (${new Date().toISOString().split("T")[0]})`
          );

          setLoading(false);

          figma.ui.postMessage({
            type: "github-sync-complete",
            result: syncResult,
          });

          if (syncResult.success) {
            console.log("GitHub sync completed successfully");
          } else {
            console.error("GitHub sync failed:", syncResult.error);
          }
        } catch (error: unknown) {
          console.error("Error syncing to GitHub:", error);
          setLoading(false);
          figma.ui.postMessage({
            type: "github-sync-complete",
            result: {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          });
        }
        break;

      case "pull-from-github":
        console.log("Pulling tokens from GitHub...");
        try {
          setLoading(true, "Pulling tokens from GitHub...");

          // Check if GitHub is configured
          const config = await figma.clientStorage.getAsync("github-config");
          if (!config) {
            throw new Error(
              "GitHub not configured. Please configure GitHub integration first."
            );
          }

          // Initialize GitHub client
          await githubClient.initialize(config);

          // Pull tokens from GitHub
          const pullResult = await githubClient.pullTokens();

          if (!pullResult.success || !pullResult.tokens || pullResult.tokens.length === 0) {
            throw new Error(pullResult.error || "No token files found in GitHub repository");
          }

          const files = pullResult.tokens.map((tokenData: any, index: number) => ({
            filename: `tokens-${index}.json`,
            content: JSON.stringify(tokenData),
          }));

          // Use existing import pipeline
          const allTokenData = [];
          const adapterResults: any[] = [];

          for (const file of files) {
            console.log(`Processing pulled file: ${file.filename}`);

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
                throw new Error(
                  `Invalid token structure in ${file.filename}: ${validation.errors.join(", ")}`
                );
              }

              // Add to collection for global processing
              if (Array.isArray(tokenData)) {
                allTokenData.push.apply(allTokenData, tokenData);
              } else {
                allTokenData.push(tokenData);
              }
            } catch (fileError: unknown) {
              throw new Error(
                `Failed to process ${file.filename}: ${fileError instanceof Error ? fileError.message : "Unknown error"}`
              );
            }
          }

          // Import tokens using existing pipeline
          setLoading(true, "Importing tokens...");
          const globalResult = await importMultipleCollections(allTokenData, {
            mergeStrategy: "merge",
            createMissingModes: true,
            preserveExistingVariables: false,
          });

          setLoading(false);

          // Send results back to UI
          figma.ui.postMessage({
            type: "tokens-pulled-and-imported",
            result: globalResult,
            pulledTokens: pullResult.tokens,
            adapterResults: adapterResults,
          });
        } catch (error: unknown) {
          console.error("Error pulling from GitHub:", error);
          setLoading(false);
          figma.ui.postMessage({
            type: "github-pull-error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
        break;

      case "get-github-sync-status":
        try {
          const config = await figma.clientStorage.getAsync("github-config");
          if (!config) {
            figma.ui.postMessage({
              type: "github-sync-status",
              status: null,
              configured: false,
            });
            break;
          }

          await githubClient.initialize(config);

          const status = await githubClient.getSyncStatus();

          figma.ui.postMessage({
            type: "github-sync-status",
            status: status,
            configured: true,
          });
        } catch (error: unknown) {
          figma.ui.postMessage({
            type: "github-sync-status",
            status: null,
            configured: true,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
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

console.log("Plugin initialized");
