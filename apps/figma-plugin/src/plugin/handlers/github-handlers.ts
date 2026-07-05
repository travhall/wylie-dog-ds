/**
 * GitHub Handlers
 *
 * Handles GitHub sync operations (forwarded to UI thread where fetch is available).
 */

import { processCollectionsForExport } from "../variables/processor";
import { setLoading, processInChunks } from "./utils";
import type { PluginMessage } from "../../shared/types";

/**
 * Sync tokens to GitHub (prepare data and forward to UI)
 */
export async function handleGitHubSyncTokens(
  msg: PluginMessage
): Promise<void> {
  try {
    setLoading(true, "Exporting tokens for GitHub sync...");

    // Get collection IDs from message (handles both collectionIds and selectedCollectionIds for backwards compatibility)
    const collectionIds = msg.collectionIds || msg.selectedCollectionIds;

    if (!collectionIds) {
      throw new Error("No collection IDs provided");
    }

    // Get ALL collections to build reference map, but only export selected ones
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();
    const allCollectionsWithVariables = [];

    // Fetch all collections for reference resolution
    for (const collection of collections) {
      const variables = [];
      for (const variableId of collection.variableIds) {
        try {
          const variable =
            await figma.variables.getVariableByIdAsync(variableId);
          if (variable) {
            const originalType =
              variable.getPluginData("originalType") || undefined;
            if (originalType) {
              console.log(
                `🔧 HANDLER: ${variable.name} has originalType="${originalType}"`
              );
            }
            variables.push({
              id: variable.id,
              name: variable.name,
              description: variable.description || "",
              resolvedType: variable.resolvedType,
              scopes: variable.scopes,
              valuesByMode: variable.valuesByMode,
              remote: variable.remote,
              key: variable.key,
              originalType: originalType,
            });
          }
        } catch (err) {
          console.error("Error processing variable:", variableId, err);
        }
      }

      allCollectionsWithVariables.push({
        id: collection.id,
        name: collection.name,
        modes: collection.modes,
        variables: variables,
      });
    }

    // Process with ALL collections for reference map, but only export selected ones
    const exportData = await processCollectionsForExport(
      allCollectionsWithVariables,
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
}

/**
 * Pull tokens from GitHub (forward to UI thread)
 */
export async function handleGitHubPullTokens(
  msg: PluginMessage
): Promise<void> {
  console.log("Forwarding GitHub pull to UI thread...");
  // Forward to UI thread where fetch is available
  figma.ui.postMessage({
    type: "github-pull-tokens",
  });
}

/**
 * Pull tokens with conflict detection (forward to UI thread)
 */
export async function handleGitHubPullWithConflicts(
  msg: PluginMessage
): Promise<void> {
  console.log("Forwarding GitHub pull with conflict detection to UI thread...");
  figma.ui.postMessage({
    type: "github-pull-with-conflicts",
  });
}

/**
 * Resolve conflicts (forward to UI thread)
 */
export async function handleResolveConflicts(
  msg: PluginMessage
): Promise<void> {
  console.log("Forwarding conflict resolution to UI thread...");
  figma.ui.postMessage({
    type: "resolve-conflicts",
    resolutions: msg.resolutions,
    originalTokens: msg.originalTokens,
  });
}

/**
 * Test GitHub configuration - No longer used (UI handles this directly)
 * Kept for backwards compatibility
 */
export async function handleTestGitHubConfig(
  msg: PluginMessage
): Promise<void> {
  console.log("GitHub config test - handled in UI thread");
}

/**
 * Handle GitHub sync completion notification from UI
 */
export async function handleGitHubSyncComplete(
  msg: PluginMessage
): Promise<void> {
  console.log("GitHub sync completed:", msg.result);
  setLoading(false);

  // If sync was successful, log success
  if (msg.result?.success) {
    console.log("✅ GitHub sync successful");
    if (msg.result.commitUrl) {
      console.log("📝 Commit URL:", msg.result.commitUrl);
    }
    if (msg.result.noChanges) {
      console.log("ℹ️ No changes detected - nothing to commit");
    }
  } else if (msg.result?.error) {
    console.error("❌ GitHub sync failed:", msg.result.error);
  }
}
