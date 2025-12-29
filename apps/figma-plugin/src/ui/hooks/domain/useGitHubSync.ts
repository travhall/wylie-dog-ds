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
 */
export function useGitHubSync(
  githubClient: ConflictAwareGitHubClient,
  actions: PluginMessageActions,
  pendingExportData?: ExportData[]
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
          actions.setPendingTokensForConflictResolution(exportData);
          actions.setShowConflictResolution(true);
          actions.setLoading(false);
          actions.setLoadingMessage("");
          actions.setProgressSteps([]);
          return;
        }

        actions.setLoadingMessage("Saving to GitHub...");
        actions.setProgressStep(3);

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
      }
    },
    [githubClient, actions]
  );

  /**
   * Pull tokens from GitHub
   */
  const handleGitHubPull = useCallback(async () => {
    try {
      actions.setLoading(true);
      actions.setLoadingMessage("Pulling tokens from GitHub...");
      actions.setProgressSteps([]); // Clear progress steps - use simple loading

      // Use simple pullTokens() - skip broken conflict detection
      const pullResult = await githubClient.pullTokens();

      actions.setLoadingMessage("Importing tokens...");

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
        actions.setError(pullResult.error || "GitHub pull failed");
      }
    } catch (error: any) {
      console.error("GitHub pull error:", error);
      // Handle error directly
      actions.setLoading(false);
      actions.setProgressSteps([]);
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

        const resolvedTokens = githubClient.applyConflictResolutions(
          pendingExportData || [],
          resolutions
        );

        // Continue with sync using resolved tokens
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
      } catch (error: any) {
        console.error("Conflict resolution error:", error);
        actions.setError(`Failed to resolve conflicts: ${error.message}`);
      } finally {
        actions.setLoading(false);
        actions.setConflicts([]);
        actions.setPendingTokensForConflictResolution([]);
      }
    },
    [githubClient, actions, pendingExportData]
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
