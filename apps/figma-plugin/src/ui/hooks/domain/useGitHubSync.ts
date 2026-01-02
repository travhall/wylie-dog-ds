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
  conflictOperationType?: "push" | "pull" | null
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
   * Sync tokens to GitHub (push)
   */
  const handleGitHubSync = useCallback(
    async (exportData: ExportData[]) => {
      try {
        actions.setLoading(true);
        actions.setProgressSteps(PUSH_STEPS);
        actions.setProgressStep(0);

        actions.setLoadingMessage("Preparing your tokens...");
        actions.setProgressStep(1);

        actions.setLoadingMessage("Checking for changes...");
        const syncResult =
          await githubClient.syncTokensWithConflictDetection(exportData);
        actions.setProgressStep(2);

        if (syncResult.conflicts && syncResult.conflicts.length > 0) {
          actions.setConflicts(syncResult.conflicts);
          actions.setConflictOperationType("push");
          // For push conflicts, exportData is local, and we need to fetch remote
          // We can get remote from the sync result or re-pull
          // For now, store in the new format to be consistent
          actions.setPendingTokensForConflictResolution({
            local: exportData,
            remote: syncResult.remoteTokens || [], // Need to add this to SyncResult
          });
          actions.setShowConflictResolution(true);
          actions.setLoading(false);
          actions.setLoadingMessage("");
          actions.setProgressSteps([]);
          return;
        }

        actions.setLoadingMessage("Saving to GitHub...");
        actions.setProgressStep(2); // Keep at step 3 (index 2) - don't exceed the 3 defined steps

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
        actions.setProgressSteps([]);
        actions.setProgressStep(0);

        if (syncResult.success) {
          const message = syncResult.pullRequestUrl
            ? "✅ Pull request created! Check GitHub to review"
            : "✅ Saved to GitHub successfully!";
          actions.setSuccessMessage(message);
          setTimeout(() => actions.setSuccessMessage(null), 6000);
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
        actions.setProgressSteps([]);
        actions.setProgressStep(0);
        actions.setError(error.message || "GitHub sync failed");
      }
    },
    [githubClient, actions]
  );

  /**
   * Pull tokens from GitHub with conflict detection
   */
  const handleGitHubPull = useCallback(async () => {
    try {
      actions.setLoading(true);
      actions.setLoadingMessage("Reading local tokens...");
      actions.setProgressSteps(PULL_STEPS);
      actions.setProgressStep(0);

      // Step 1: Request local tokens from plugin thread
      const localTokensPromise = new Promise<ExportData[]>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.pluginMessage?.type === "local-tokens-exported") {
            window.removeEventListener("message", handler);
            resolve(event.data.pluginMessage.localTokens || []);
          } else if (event.data.pluginMessage?.type === "local-tokens-error") {
            window.removeEventListener("message", handler);
            console.warn(
              "Failed to get local tokens, proceeding without conflict detection"
            );
            resolve([]);
          }
        };
        window.addEventListener("message", handler);

        // Request local tokens from plugin thread
        parent.postMessage(
          {
            pluginMessage: {
              type: "get-local-tokens",
            },
          },
          "*"
        );
      });

      const localTokens = await localTokensPromise;

      actions.setLoadingMessage("Pulling tokens from GitHub...");
      actions.setProgressStep(1);

      // Step 2: Pull with conflict detection
      const pullResult =
        await githubClient.pullTokensWithConflictDetection(localTokens);

      actions.setLoadingMessage("Checking for conflicts...");
      actions.setProgressStep(2);

      // Step 3: Handle conflicts if any
      if (pullResult.requiresConflictResolution && pullResult.conflicts) {
        actions.setConflicts(pullResult.conflicts);
        actions.setConflictOperationType("pull");
        // Store BOTH local and remote tokens for conflict resolution
        // Format: { local: [...], remote: [...] }
        actions.setPendingTokensForConflictResolution({
          local: localTokens,
          remote: pullResult.tokens || [],
        });
        actions.setShowConflictResolution(true);
        actions.setLoading(false);
        actions.setLoadingMessage("");
        actions.setProgressSteps([]);
        actions.setProgressStep(0);
        return;
      }

      actions.setLoadingMessage("Preparing import...");
      actions.setProgressStep(3);

      if (pullResult.success && pullResult.tokens) {
        const files = pullResult.tokens.map((tokenCollection, index) => {
          const collectionName =
            Object.keys(tokenCollection)[0] || `collection-${index}`;
          return {
            filename: `${collectionName.toLowerCase().replace(/\s+/g, "-")}.json`,
            content: JSON.stringify([tokenCollection], null, 2),
          };
        });

        parent.postMessage(
          {
            pluginMessage: {
              type: "import-tokens",
              files: files,
            },
          },
          "*"
        );
      } else {
        // Handle pull failure directly
        actions.setLoading(false);
        actions.setProgressSteps([]);
        actions.setProgressStep(0);
        actions.setError(pullResult.error || "GitHub pull failed");
      }
    } catch (error: any) {
      console.error("GitHub pull error:", error);
      // Handle error directly
      actions.setLoading(false);
      actions.setProgressSteps([]);
      actions.setProgressStep(0);
      actions.setError(error.message || "GitHub pull failed");
    }
  }, [githubClient, actions]);

  /**
   * Resolve conflicts and continue with operation
   */
  const handleConflictResolution = useCallback(
    async (resolutions: ConflictResolution[]) => {
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
          } else {
            actions.setError(
              syncResult.error || "Push failed after conflict resolution"
            );
          }
        } else {
          // For pull: import the resolved tokens into Figma
          console.log("📥 Importing resolved tokens to Figma...");
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

          actions.setSuccessMessage("✅ Conflicts resolved and applied!");
          setTimeout(() => actions.setSuccessMessage(null), 3000);
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
