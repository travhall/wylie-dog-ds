/**
 * GitHub Sync Hook
 *
 * Encapsulates all GitHub synchronization logic
 * Handles config testing, push, pull, and conflict resolution
 */

import { useCallback, useEffect } from "preact/hooks";
import type { GitHubConfig } from "../../../shared/types";
import type { ConflictAwareGitHubClient } from "../../../plugin/sync/conflict-aware-github-client";
import type { ExportData } from "../../../plugin/variables/processor";
import type {
  TokenConflict,
  ConflictResolution,
} from "../../../plugin/sync/types";
import type { PluginMessageActions } from "../usePluginMessages";
import { ResultHandler, Result } from "../../../shared/result";
import { PUSH_STEPS, PULL_STEPS } from "../../components/ProgressFeedback";

/**
 * Hook for GitHub synchronization operations
 *
 * Automatically registers handlers with usePluginMessages via the actions object
 *
 * @param githubClient - Configured GitHub client instance
 * @param actions - Plugin message actions from usePluginMessages
 * @param pendingExportData - Optional pending export data for conflict resolution
 * @param conflictOperationType - Type of operation that triggered conflicts (push or pull)
 */
export function useGitHubSync(
  githubClient: ConflictAwareGitHubClient,
  actions: PluginMessageActions,
  pendingExportData?:
    | ExportData[]
    | { local: ExportData[]; remote: ExportData[] },
  conflictOperationType?: "push" | "pull" | null,
  onSyncSuccess?: () => void // Callback for successful sync (e.g., clear selection)
) {
  /**
   * Test GitHub configuration
   */
  const handleGitHubConfigTest = useCallback(
    async (config: GitHubConfig): Promise<Result<boolean>> => {
      return ResultHandler.asyncOperation(
        async () => {
          actions.setLoading(true);
          actions.setError(null);

          const initialized = await githubClient.initialize(config);

          if (initialized) {
            const validation = await githubClient.validateRepository();

            if (validation.valid) {
              // Save the configuration
              parent.postMessage(
                {
                  pluginMessage: {
                    type: "save-github-config",
                    config: config,
                  },
                },
                "*"
              );

              actions.setGithubConfig(config);
              actions.setGithubConfigured(true);
              actions.setSuccessMessage("✅ Connected to GitHub successfully!");
              setTimeout(() => actions.setSuccessMessage(null), 5000);
              return true;
            } else {
              throw new Error(
                `Repository validation failed: ${validation.error || "Unknown validation error"}`
              );
            }
          } else {
            throw new Error(
              "Failed to initialize GitHub client. Please check your access token and repository details."
            );
          }
        },
        "GitHub configuration test",
        [
          "Verify your access token has repo permissions",
          "Check that the repository owner and name are correct",
          "Ensure the repository exists and is accessible",
          "Try regenerating your GitHub access token",
        ]
      ).finally(() => {
        actions.setLoading(false);
      });
    },
    [githubClient, actions]
  );

  /**
   * Sync tokens to GitHub (push) - Simple spinner mode
   */
  const handleGitHubSync = useCallback(
    async (exportData: ExportData[]) => {
      try {
        actions.setLoading(true);
        // DON'T set progress steps - use simple spinner mode
        actions.setLoadingMessage("Preparing your tokens...");

        // CRITICAL: Force render before heavy work
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(undefined))
        );

        actions.setLoadingMessage("Checking for changes...");
        const syncResult =
          await githubClient.syncTokensWithConflictDetection(exportData);

        // CRITICAL: Force render before processing result
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(undefined))
        );

        if (syncResult.conflicts && syncResult.conflicts.length > 0) {
          actions.setConflicts(syncResult.conflicts);
          actions.setConflictOperationType("push");
          actions.setPendingTokensForConflictResolution({
            local: exportData,
            remote: syncResult.remoteTokens || [],
          });
          actions.setShowConflictResolution(true);
          actions.setLoading(false);
          actions.setLoadingMessage("");
          return;
        }

        actions.setLoadingMessage("Saving to GitHub...");

        // CRITICAL: Force render before sending message
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(undefined))
        );

        // Send success message back to plugin
        parent.postMessage(
          {
            pluginMessage: {
              type: "github-sync-complete",
              result: syncResult,
            },
          },
          "*"
        );

        // Clear loading state in UI after successful sync
        actions.setLoading(false);
        actions.setLoadingMessage("");

        if (syncResult.success) {
          const message =
            syncResult.message ||
            (syncResult.pullRequestUrl
              ? "✅ Pull request created! Check GitHub to review"
              : "✅ Saved to GitHub successfully!");
          actions.setSuccessMessage(message);
          setTimeout(() => actions.setSuccessMessage(null), 6000);

          // Clear selection after successful sync
          if (onSyncSuccess) {
            onSyncSuccess();
          }
        } else {
          actions.setError(syncResult.error || "GitHub sync failed");
        }
      } catch (error: any) {
        console.error("GitHub sync error:", error);
        parent.postMessage(
          {
            pluginMessage: {
              type: "github-sync-complete",
              result: {
                success: false,
                error: error.message || "GitHub sync failed",
              },
            },
          },
          "*"
        );

        // Clear loading state and show error in UI
        actions.setLoading(false);
        actions.setLoadingMessage("");
        actions.setError(error.message || "GitHub sync failed");
      }
    },
    [githubClient, actions]
  );

  /**
   * Pull tokens from GitHub - Simple mode with spinner (no steps)
   * Pull is an explicit user action to import from GitHub, so overwrite is expected
   */
  const handleGitHubPull = useCallback(async () => {
    console.log("🔽 PULL: Starting GitHub pull operation");
    try {
      actions.setLoading(true);
      // DON'T set progress steps - this makes it use simple spinner mode
      actions.setLoadingMessage("Pulling tokens from GitHub...");

      // CRITICAL: Force render before heavy work
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(undefined))
      );

      // Pull tokens directly from GitHub WITHOUT conflict detection
      const pullResult = await githubClient.pullTokens();

      actions.setLoadingMessage("Preparing import...");

      // CRITICAL: Force render before processing
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(undefined))
      );

      if (pullResult.success && pullResult.tokens) {
        const files = [
          {
            filename: "remote-tokens.json",
            content: JSON.stringify(pullResult.tokens, null, 2),
          },
        ];

        actions.setLoadingMessage("Importing tokens to Figma...");

        // CRITICAL: Force render before sending import message
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(undefined))
        );

        parent.postMessage(
          {
            pluginMessage: {
              type: "import-tokens",
              files: files,
            },
          },
          "*"
        );

        // Don't clear loading/progress here - import-validated handler will do it
        // This keeps the loading animation visible during import
      } else {
        // Handle pull failure directly
        actions.setLoading(false);
        actions.setLoadingMessage("");
        actions.setError(pullResult.error || "GitHub pull failed");
      }
    } catch (error: any) {
      console.error("GitHub pull error:", error);
      // Handle error directly
      actions.setLoading(false);
      actions.setLoadingMessage("");
      actions.setError(error.message || "GitHub pull failed");
    }
  }, [githubClient, actions]);

  /**
   * Resolve conflicts and continue with operation
   */
  const handleConflictResolution = useCallback(
    async (resolutions: ConflictResolution[]) => {
      console.log(
        `🔧 handleConflictResolution called with ${resolutions.length} resolutions`
      );
      console.log(`  conflictOperationType: ${conflictOperationType}`);
      console.log(`  pendingExportData type:`, typeof pendingExportData);
      try {
        actions.setLoading(true);
        actions.setShowConflictResolution(false);

        // Check if we have both local and remote tokens (new format)
        let resolvedTokens: ExportData[];

        if (
          pendingExportData &&
          typeof pendingExportData === "object" &&
          "local" in pendingExportData &&
          "remote" in pendingExportData
        ) {
          // New format: { local: [...], remote: [...] }
          const conflictResolver = new (
            await import("../../../plugin/sync/conflict-resolver")
          ).ConflictResolver();
          resolvedTokens = conflictResolver.resolveConflicts(
            pendingExportData.local,
            pendingExportData.remote,
            resolutions
          );
        } else {
          // Legacy format or push operation: pendingExportData is ExportData[]
          // This shouldn't happen for pull operations anymore, but keep for safety
          resolvedTokens = githubClient.applyConflictResolutions(
            Array.isArray(pendingExportData) ? pendingExportData : [],
            resolutions
          );
        }

        // Handle based on operation type
        if (conflictOperationType === "push") {
          // For push: sync the resolved tokens to GitHub
          console.log("🔄 Resuming push after conflict resolution...");
          actions.setLoadingMessage("Pushing resolved tokens to GitHub...");

          const syncResult = await githubClient.syncTokens(resolvedTokens);

          actions.setLoading(false);
          actions.setLoadingMessage("");

          if (syncResult.success) {
            const message = syncResult.pullRequestUrl
              ? "✅ Pull request created! Check GitHub to review"
              : "✅ Pushed to GitHub successfully!";
            actions.setSuccessMessage(message);
            setTimeout(() => actions.setSuccessMessage(null), 6000);

            // Clear selection after successful conflict resolution & push
            if (onSyncSuccess) {
              onSyncSuccess();
            }
          } else {
            actions.setError(
              syncResult.error || "Push failed after conflict resolution"
            );
          }
        } else {
          // For pull: import the resolved tokens into Figma
          console.log("📥 Importing resolved tokens to Figma...");

          // Keep loading state active - import will complete and show validation modal
          actions.setLoadingMessage("Importing resolved tokens to Figma...");

          parent.postMessage(
            {
              pluginMessage: {
                type: "import-tokens",
                files: resolvedTokens.map((tokenCollection, index) => {
                  const collectionName =
                    Object.keys(tokenCollection)[0] || `collection-${index}`;
                  return {
                    filename: `${collectionName.toLowerCase().replace(/\s+/g, "-")}.json`,
                    content: JSON.stringify([tokenCollection], null, 2),
                  };
                }),
              },
            },
            "*"
          );

          // Don't show success toast - validation modal will provide feedback
          // Loading state will be cleared when import completes
        }
      } catch (error: any) {
        console.error("Conflict resolution error:", error);
        actions.setError(`Failed to resolve conflicts: ${error.message}`);
      } finally {
        actions.setLoading(false);
        actions.setConflicts([]);
        actions.setConflictOperationType(null);
        actions.setPendingTokensForConflictResolution([]);
      }
    },
    [githubClient, actions, pendingExportData, conflictOperationType]
  );

  // Register handlers with usePluginMessages
  useEffect(() => {
    actions.registerGitHubConfigTestHandler(handleGitHubConfigTest);
    actions.registerGitHubSyncHandler(handleGitHubSync);
    actions.registerGitHubPullHandler(handleGitHubPull);
  }, [actions, handleGitHubConfigTest, handleGitHubSync, handleGitHubPull]);

  return {
    handleGitHubConfigTest,
    handleGitHubSync,
    handleGitHubPull,
    handleConflictResolution,
  };
}
