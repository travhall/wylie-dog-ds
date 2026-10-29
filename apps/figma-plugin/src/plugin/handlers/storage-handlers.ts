/**
 * Storage Handlers
 *
 * Handles configuration and preference storage operations.
 */

import { fileConfigStorage } from "../storage/file-storage";
import { userPreferencesStorage } from "../storage/user-storage";
import { syncStateStorage } from "../storage/sync-state-storage";
import {
  buildBaseline,
  hashTokens,
  isTokenHashes,
} from "../sync/sync-baseline";
import { exportLocalTokens } from "./token-handlers";
import type { PluginMessage } from "../../shared/types";

/**
 * Return the last successful sync timestamp for THIS file to the UI. It lives
 * in the file's own plugin data (not figma.clientStorage, which is shared by
 * every file the user opens). The UI can't read it directly, so it asks.
 */
export async function handleGetLastSync(): Promise<void> {
  try {
    const config = await fileConfigStorage.getGitHubConfig();
    figma.ui.postMessage({
      type: "last-sync-loaded",
      timestamp: syncStateStorage.loadLastSync(config),
    });
  } catch (error) {
    console.error("Error loading last sync time:", error);
    figma.ui.postMessage({ type: "last-sync-loaded", timestamp: null });
  }
}

/**
 * Record "now" as the last successful sync for this file and echo it back so
 * any listening status view updates immediately. Sent by the UI after a
 * successful push/pull.
 *
 * When the message carries `remoteHashes` (a Push or Pull that left GitHub and
 * Figma in agreement), also record the sync baseline: those hashes are the
 * GitHub side, and the Figma side is hashed here, right now, from the live
 * variables. Without hashes (a pull request, a manual import) the existing
 * baseline is left alone, so Figma-side edits keep showing as changes to push.
 */
export async function handleRecordLastSync(msg?: PluginMessage): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const config = await fileConfigStorage.getGitHubConfig();
    syncStateStorage.saveLastSync(config, timestamp);

    if (msg && isTokenHashes(msg.remoteHashes)) {
      const local = hashTokens(await exportLocalTokens());
      const saved = syncStateStorage.saveBaseline(
        config,
        buildBaseline(local, msg.remoteHashes, timestamp)
      );
      if (!saved) {
        console.warn(
          "Sync baseline was not recorded; status shows differences"
        );
      }
    }

    figma.ui.postMessage({ type: "last-sync-loaded", timestamp });
  } catch (error) {
    console.error("Error recording last sync time:", error);
  }
}

/**
 * Return this file's "Text styles" choice to the UI (plan 207): true, false,
 * or null when the file never chose. It lives in the file's own plugin data,
 * so a plugin reload keeps it.
 */
export function handleGetTextStylesChoice(): void {
  try {
    figma.ui.postMessage({
      type: "text-styles-choice-loaded",
      value: syncStateStorage.loadIncludeTextStyles(),
    });
  } catch (error) {
    console.error("Error loading the Text styles choice:", error);
    figma.ui.postMessage({ type: "text-styles-choice-loaded", value: null });
  }
}

/** Remember the "Text styles" choice for this file. */
export function handleSaveTextStylesChoice(msg: PluginMessage): void {
  try {
    if (typeof msg.includeTextStyles !== "boolean") return;
    syncStateStorage.saveIncludeTextStyles(msg.includeTextStyles);
  } catch (error) {
    console.error("Error saving the Text styles choice:", error);
  }
}

/**
 * Get GitHub configuration
 */
export async function handleGetGitHubConfig(msg: PluginMessage): Promise<void> {
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
}

/**
 * Save GitHub configuration
 */
export async function handleSaveGitHubConfig(
  msg: PluginMessage
): Promise<void> {
  try {
    if (!msg.config) {
      throw new Error("No GitHub configuration provided");
    }
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
        error instanceof Error ? error.message : "Failed to save configuration",
    });
  }
}

/**
 * Forget the user's GitHub token (shared by all of their files)
 */
export async function handleClearGitHubToken(
  msg: PluginMessage
): Promise<void> {
  try {
    await fileConfigStorage.clearGitHubToken();

    figma.ui.postMessage({
      type: "github-token-cleared",
      success: true,
    });
  } catch (error) {
    console.error("Error clearing GitHub token:", error);
    figma.ui.postMessage({
      type: "github-token-cleared",
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove token",
    });
  }
}

/**
 * Disconnect this file: clear its GitHub repo settings (the token stays)
 */
export async function handleClearGitHubConfig(
  msg: PluginMessage
): Promise<void> {
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
}

/**
 * Get advanced mode preference
 */
export async function handleGetAdvancedMode(msg: PluginMessage): Promise<void> {
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
}

/**
 * Save advanced mode preference
 */
export async function handleSaveAdvancedMode(
  msg: PluginMessage
): Promise<void> {
  try {
    await userPreferencesStorage.setAdvancedMode(msg.advancedMode ?? false);
    console.log("Advanced mode preference saved:", msg.advancedMode);
  } catch (error) {
    console.error("Error saving advanced mode:", error);
  }
}

/**
 * Get onboarding state
 */
export async function handleGetOnboardingState(
  msg: PluginMessage
): Promise<void> {
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
}

/**
 * Save onboarding state
 */
export async function handleSaveOnboardingState(
  msg: PluginMessage
): Promise<void> {
  try {
    await userPreferencesStorage.setHasSeenOnboarding(
      msg.hasSeenOnboarding ?? false
    );
    console.log("Onboarding state saved:", msg.hasSeenOnboarding);
  } catch (error) {
    console.error("Error saving onboarding state:", error);
  }
}

/**
 * Check file engagement status
 */
export async function handleCheckFileEngagement(
  msg: PluginMessage
): Promise<void> {
  try {
    const hasEngaged = await fileConfigStorage.hasEngagedWithFile();
    figma.ui.postMessage({
      type: "file-engagement-status",
      hasEngaged,
    });
  } catch (error) {
    console.error("Error checking file engagement:", error);
  }
}

/**
 * Mark file as engaged
 */
export async function handleMarkFileEngaged(msg: PluginMessage): Promise<void> {
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
}
