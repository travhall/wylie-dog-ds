/**
 * GitHub Sync Hook
 *
 * Encapsulates all GitHub synchronization logic
 * Handles config testing, push, pull, and conflict resolution
 */

import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import type { GitHubConfig } from "../../../shared/types";
import type { ConflictAwareGitHubClient } from "../../../plugin/sync/conflict-aware-github-client";
import type { ExportData } from "../../../plugin/variables/processor";
import type {
  TokenConflict,
  ConflictResolution,
} from "../../../plugin/sync/types";
import type { PluginMessageActions } from "../usePluginMessages";
import { Result } from "../../../shared/result";
import { PUSH_STEPS, PULL_STEPS } from "../../components/ProgressFeedback";
import { hashTokens } from "../../../plugin/sync/sync-baseline";
import type {
  SyncBaseline,
  TokenHashes,
} from "../../../plugin/sync/sync-baseline";
import {
  buildPullSummaryFromDiff,
  buildSyncDiff,
  conflictsForRows,
} from "../../../plugin/sync/sync-diff";
import type { SyncDiff } from "../../../plugin/sync/sync-diff";
import type { SyncChangeSummary } from "../../../plugin/sync/change-summary";
import { setPendingRemoteHashes } from "../../utils/pending-sync-hashes";
import { requestLocalExport } from "../../utils/check-sync-status";

/**
 * The review shown before a Push or Pull writes anything (plan 200). The
 * component that renders it lives in App; this hook owns what each button does.
 */
export interface SyncReview {
  diff: SyncDiff;
  /** Absent when there is nothing to confirm. */
  onConfirm?: () => void;
  /** Pull: resolve token by token in the conflict list instead. */
  onAdvanced?: () => void;
  /** Pull: push Figma's own edits first. */
  onPushFirst?: () => void;
  /** Pull with nothing to change and no baseline yet: record the sync. */
  onMarkSynced?: () => void;
  onClose: () => void;
}

export interface GitHubSyncOptions {
  /** Called with what a Pull is about to change; shown once the import lands. */
  onPullSummary?: (summary: SyncChangeSummary) => void;
  /** Start a Push of the selected collections (for "Push first"). */
  onRequestPush?: () => void;
}

/** Message for a repo path that has no token files yet (first ever push). */
const NO_FILES_YET = /No JSON files found/;

/**
 * Hash what GitHub holds right now. Taken after a successful push so the
 * baseline's GitHub side comes from the same pipeline the status check reads
 * later; null (fetch failed) just means no baseline is recorded this time.
 */
async function fetchRemoteHashes(
  client: ConflictAwareGitHubClient
): Promise<TokenHashes | null> {
  try {
    const result = await client.pullTokens();
    return result.success && result.tokens ? hashTokens(result.tokens) : null;
  } catch {
    return null;
  }
}

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
    ExportData[] | { local: ExportData[]; remote: ExportData[] },
  conflictOperationType?: "push" | "pull" | null,
  onSyncSuccess?: () => void, // Callback for successful sync (e.g., clear selection)
  options: GitHubSyncOptions = {}
) {
  const [review, setReview] = useState<SyncReview | null>(null);
  const closeReview = useCallback(() => setReview(null), []);
  // Latest options without making every handler depend on them.
  const optionsRef = useRef(options);
  optionsRef.current = options;
  // Ref to hold the pull handler so handleGitHubConfigTest can call it
  // without creating a circular dependency
  const pullHandlerRef = useRef<() => Promise<void>>();

  /**
   * Save GitHub configuration after wizard completes.
   *
   * The wizard steps (AccessTokenStep, RepositoryStep) already validated the
   * token and repo directly against the GitHub API, so no plugin round-trip is
   * needed here — just persist and auto-pull.
   */
  const handleGitHubConfigTest = useCallback(
    async (config: GitHubConfig): Promise<Result<boolean>> => {
      actions.setLoading(true);
      actions.setError(null);

      // Persist config to Figma file storage
      parent.postMessage(
        { pluginMessage: { type: "save-github-config", config } },
        "*"
      );

      actions.setGithubConfig(config);
      actions.setGithubConfigured(true);
      actions.setLoading(false);
      actions.setSuccessMessage("GitHub connected! Pulling your tokens now…");
      setTimeout(() => actions.setSuccessMessage(null), 5000);

      // Auto-pull after a short delay so UI can update first
      setTimeout(() => {
        pullHandlerRef.current?.();
      }, 400);

      return { success: true, data: true };
    },
    [actions]
  );

  /**
   * Write Figma's tokens to GitHub. This is the unchanged push: the same
   * `syncTokens(exportData)` call as before, now reached only after the review.
   */
  const performPush = useCallback(
    async (exportData: ExportData[]) => {
      try {
        actions.setLoading(true);
        actions.setProgressSteps(PUSH_STEPS);
        actions.setProgressStep(2);
        actions.setLoadingMessage("Saving to GitHub...");

        // CRITICAL: Force render before heavy work
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(undefined))
        );

        const syncResult = await githubClient.syncTokens(exportData);

        // A direct push leaves GitHub equal to Figma: remember that as the
        // baseline. A pull request leaves the branch untouched, so it doesn't.
        if (syncResult.success && !syncResult.pullRequestUrl) {
          setPendingRemoteHashes(await fetchRemoteHashes(githubClient));
        }

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

        // Clear loading state in UI after sync
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
      } catch (error: unknown) {
        console.error("GitHub sync error:", error);
        const message =
          error instanceof Error ? error.message : "GitHub sync failed";
        parent.postMessage(
          {
            pluginMessage: {
              type: "github-sync-complete",
              result: {
                success: false,
                error: message,
              },
            },
          },
          "*"
        );

        // Clear loading state and show error in UI
        actions.setLoading(false);
        actions.setLoadingMessage("");
        actions.setError(message);
      }
    },
    [githubClient, actions, onSyncSuccess]
  );

  /**
   * Push: compare with GitHub, send real conflicts (GitHub changes Figma lacks)
   * to the per-token list, otherwise show what the push will change and wait
   * for confirmation. `confirmed` re-checks right before writing, in case
   * GitHub moved while the review was open.
   */
  const handleGitHubSync = useCallback(
    async (
      exportData: ExportData[],
      baseline?: SyncBaseline | null,
      confirmed = false
    ) => {
      try {
        actions.setLoading(true);
        actions.setProgressSteps(PUSH_STEPS);
        actions.setProgressStep(0);
        actions.setLoadingMessage("Preparing your tokens...");

        // CRITICAL: Force render before heavy work
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(undefined))
        );

        actions.setProgressStep(1);
        actions.setLoadingMessage("Checking for changes...");
        const remote = await githubClient.pullTokens();
        let remoteTokens: ExportData[];
        if (remote.success && remote.tokens) {
          remoteTokens = remote.tokens;
        } else if (remote.error && NO_FILES_YET.test(remote.error)) {
          // First push to an empty path: everything is new on GitHub.
          remoteTokens = [];
        } else {
          actions.setLoading(false);
          actions.setLoadingMessage("");
          actions.setError(remote.error || "Could not read tokens from GitHub");
          return;
        }

        // CRITICAL: Force render before processing result
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(undefined))
        );

        const diff = buildSyncDiff({
          direction: "push",
          baseline,
          localTokens: exportData,
          remoteTokens,
        });

        // Nothing on GitHub yet (first push) means nothing there to overwrite.
        const firstPush = remoteTokens.length === 0;
        if (!firstPush && diff.blocking.length > 0) {
          // GitHub holds changes Figma lacks (or, with no baseline, any
          // difference): pushing would overwrite them, so resolve first.
          actions.setConflicts(
            conflictsForRows(diff.blocking, exportData, remoteTokens)
          );
          actions.setConflictOperationType("push");
          actions.setPendingTokensForConflictResolution({
            local: exportData,
            remote: remoteTokens,
          });
          actions.setShowConflictResolution(true);
          actions.setLoading(false);
          actions.setLoadingMessage("");
          return;
        }

        if (confirmed && diff.rows.length > 0) {
          await performPush(exportData);
          return;
        }

        actions.setLoading(false);
        actions.setLoadingMessage("");
        setReview({
          diff,
          onConfirm:
            diff.rows.length > 0
              ? () => {
                  setReview(null);
                  void handleGitHubSync(exportData, baseline, true);
                }
              : undefined,
          onClose: closeReview,
        });
      } catch (error: unknown) {
        console.error("GitHub sync error:", error);
        const message =
          error instanceof Error ? error.message : "GitHub sync failed";
        actions.setLoading(false);
        actions.setLoadingMessage("");
        actions.setError(message);
      }
    },
    // Confirm re-enters this handler, which reads the latest closure itself.
    [githubClient, actions, performPush, closeReview]
  );

  /** Import GitHub's tokens into Figma. Unchanged: "replace", all of them. */
  const performPull = useCallback(
    (tokens: ExportData[], diff: SyncDiff) => {
      actions.setLoading(true);
      actions.setProgressSteps(PULL_STEPS);
      actions.setProgressStep(2);
      actions.setLoadingMessage("Importing tokens to Figma...");

      const files = [
        {
          filename: "remote-tokens.json",
          content: JSON.stringify(tokens, null, 2),
        },
      ];

      // What this pull changes, shown once the import lands (plan 169).
      optionsRef.current.onPullSummary?.(buildPullSummaryFromDiff(diff));

      // Once the import lands, the plugin records these as GitHub's side of
      // the sync baseline (usePluginMessages sends them with record-last-sync).
      setPendingRemoteHashes(hashTokens(tokens));

      parent.postMessage(
        {
          pluginMessage: {
            type: "import-tokens",
            files: files,
            // Use "replace" strategy to delete orphaned variables
            // This ensures bi-directional sync: tokens deleted in code are deleted in Figma
            mergeStrategy: "replace",
          },
        },
        "*"
      );

      // Don't clear loading/progress here - import-validated handler will do it
      // This keeps the loading animation visible during import
    },
    [actions]
  );

  /**
   * Pull: fetch GitHub's tokens, compare with Figma, and show what will change
   * (including what will be deleted or overwritten) before importing. Advanced
   * opens the per-token conflict list instead.
   */
  const handleGitHubPull = useCallback(async () => {
    console.log("PULL: Starting GitHub pull operation");
    try {
      actions.setLoading(true);
      actions.setProgressSteps(PULL_STEPS);
      actions.setProgressStep(0);
      actions.setLoadingMessage("Pulling tokens from GitHub...");

      // CRITICAL: Force render before heavy work
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(undefined))
      );

      const pullResult = await githubClient.pullTokens();
      if (!pullResult.success || !pullResult.tokens) {
        actions.setLoading(false);
        actions.setLoadingMessage("");
        actions.setError(pullResult.error || "GitHub pull failed");
        return;
      }
      const remoteTokens = pullResult.tokens;

      actions.setProgressStep(1);
      actions.setLoadingMessage("Comparing with Figma...");
      const local = await requestLocalExport();
      if (local.failed) {
        actions.setLoading(false);
        actions.setLoadingMessage("");
        actions.setError(
          "Could not read Figma's variables, so Pull can't show what it would change. Try again."
        );
        return;
      }

      const diff = buildSyncDiff({
        direction: "pull",
        baseline: local.baseline,
        localTokens: local.localTokens,
        remoteTokens,
      });

      actions.setLoading(false);
      actions.setLoadingMessage("");
      setReview({
        diff,
        onConfirm:
          diff.rows.length > 0
            ? () => {
                setReview(null);
                performPull(remoteTokens, diff);
              }
            : undefined,
        onAdvanced: () => {
          const conflicts = conflictsForRows(
            diff.rows,
            local.localTokens,
            remoteTokens
          );
          setReview(null);
          if (conflicts.length === 0) {
            performPull(remoteTokens, diff);
            return;
          }
          actions.setConflicts(conflicts);
          actions.setConflictOperationType("pull");
          actions.setPendingTokensForConflictResolution({
            local: local.localTokens,
            remote: remoteTokens,
          });
          actions.setShowConflictResolution(true);
        },
        onPushFirst: () => {
          setReview(null);
          optionsRef.current.onRequestPush?.();
        },
        // Nothing differs but there is no record of a sync yet: let the user
        // record this state so future changes show which side moved.
        onMarkSynced:
          diff.rows.length === 0 && !diff.hasBaseline
            ? () => {
                setReview(null);
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: "record-last-sync",
                      remoteHashes: hashTokens(remoteTokens),
                    },
                  },
                  "*"
                );
              }
            : undefined,
        onClose: closeReview,
      });
    } catch (error: unknown) {
      console.error("GitHub pull error:", error);
      // Handle error directly
      actions.setLoading(false);
      actions.setLoadingMessage("");
      actions.setError(
        error instanceof Error ? error.message : "GitHub pull failed"
      );
    }
  }, [githubClient, actions, performPull, closeReview]);

  // Keep the ref current so handleGitHubConfigTest can invoke pull
  pullHandlerRef.current = handleGitHubPull;

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
          console.log("Resuming push after conflict resolution...");
          actions.setLoadingMessage("Pushing resolved tokens to GitHub...");

          const syncResult = await githubClient.syncTokens(resolvedTokens);

          actions.setLoading(false);
          actions.setLoadingMessage("");

          if (syncResult.success) {
            // No baseline is recorded here: where the user took GitHub's side,
            // Figma still differs from what was just pushed, so claiming the
            // two agree would hide that change.
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
          console.log("Importing resolved tokens to Figma...");

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
                // Use "replace" strategy to delete orphaned variables
                // This ensures bi-directional sync: tokens deleted in code are deleted in Figma
                mergeStrategy: "replace",
              },
            },
            "*"
          );

          // Don't show success toast - validation modal will provide feedback
          // Loading state will be cleared when import completes
        }
      } catch (error: unknown) {
        console.error("Conflict resolution error:", error);
        const message = error instanceof Error ? error.message : String(error);
        actions.setError(`Failed to resolve conflicts: ${message}`);
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
    review,
  };
}
