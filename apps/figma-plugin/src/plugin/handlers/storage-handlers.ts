/**
 * Storage Handlers
 *
 * Handles configuration and preference storage operations.
 */

import { fileConfigStorage } from "../storage/file-storage";
import { userPreferencesStorage } from "../storage/user-storage";
import type { PluginMessage } from "../../shared/types";

const LAST_SYNC_KEY = "github-last-sync";

/**
 * Return the last successful sync timestamp (from plugin-thread storage) to the
 * UI. The UI can't read figma.clientStorage directly, so it asks via message.
 */
export async function handleGetLastSync(): Promise<void> {
  try {
    const data = await figma.clientStorage.getAsync(LAST_SYNC_KEY);
    figma.ui.postMessage({
      type: "last-sync-loaded",
      timestamp: data?.timestamp ?? null,
    });
  } catch (error) {
    console.error("Error loading last sync time:", error);
    figma.ui.postMessage({ type: "last-sync-loaded", timestamp: null });
  }
}

/**
 * Record "now" as the last successful sync and echo it back so any listening
 * status view updates immediately. Sent by the UI after a successful push/pull.
 */
export async function handleRecordLastSync(): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    await figma.clientStorage.setAsync(LAST_SYNC_KEY, { timestamp });
    figma.ui.postMessage({ type: "last-sync-loaded", timestamp });
  } catch (error) {
    console.error("Error recording last sync time:", error);
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
 * Clear GitHub configuration
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
    await userPreferencesStorage.setAdvancedMode(msg.advancedMode);
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
    await userPreferencesStorage.setHasSeenOnboarding(msg.hasSeenOnboarding);
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
