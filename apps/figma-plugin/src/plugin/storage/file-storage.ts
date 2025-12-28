/**
 * File-specific storage using Figma's document plugin data API
 * Stores configuration directly in the Figma file
 */

import type { GitHubConfig } from "../../shared/types";

const PLUGIN_DATA_KEYS = {
  GITHUB_CONFIG: "github-config",
  FILE_VERSION: "storage-version", // For future migrations
  FILE_ENGAGED: "has-engaged-with-file", // Track if user has interacted with this file
} as const;

/**
 * File-specific GitHub configuration storage
 */
export class FileConfigStorage {
  /**
   * Get GitHub configuration for the current file
   */
  async getGitHubConfig(): Promise<GitHubConfig | null> {
    try {
      const configJson = figma.root.getPluginData(
        PLUGIN_DATA_KEYS.GITHUB_CONFIG
      );

      if (!configJson) {
        return null;
      }

      // Handle both string and object cases (defensive)
      if (typeof configJson === "string") {
        return JSON.parse(configJson);
      }

      return configJson as GitHubConfig;
    } catch (error) {
      console.error("Failed to retrieve GitHub config from file:", error);
      return null;
    }
  }

  /**
   * Save GitHub configuration to the current file
   */
  async setGitHubConfig(config: GitHubConfig): Promise<void> {
    try {
      const configJson = JSON.stringify(config);
      figma.root.setPluginData(PLUGIN_DATA_KEYS.GITHUB_CONFIG, configJson);
      console.log("GitHub config saved to file:", config);
    } catch (error) {
      console.error("Failed to save GitHub config to file:", error);
      throw new Error("Failed to save configuration to file");
    }
  }

  /**
   * Check if the current file has GitHub configuration
   */
  async hasGitHubConfig(): Promise<boolean> {
    const configJson = figma.root.getPluginData(PLUGIN_DATA_KEYS.GITHUB_CONFIG);
    return configJson !== "";
  }

  /**
   * Clear GitHub configuration from the current file
   */
  async clearGitHubConfig(): Promise<void> {
    try {
      figma.root.setPluginData(PLUGIN_DATA_KEYS.GITHUB_CONFIG, "");
      console.log("GitHub config cleared from file");
    } catch (error) {
      console.error("Failed to clear GitHub config from file:", error);
      throw new Error("Failed to clear configuration from file");
    }
  }

  /**
   * Get storage version for future migrations
   */
  async getStorageVersion(): Promise<string> {
    return figma.root.getPluginData(PLUGIN_DATA_KEYS.FILE_VERSION) || "1.0";
  }

  /**
   * Set storage version
   */
  async setStorageVersion(version: string): Promise<void> {
    figma.root.setPluginData(PLUGIN_DATA_KEYS.FILE_VERSION, version);
  }

  /**
   * Check if user has engaged with this file
   * (imported tokens, configured GitHub, etc.)
   */
  async hasEngagedWithFile(): Promise<boolean> {
    const engaged = figma.root.getPluginData(PLUGIN_DATA_KEYS.FILE_ENGAGED);
    return engaged === "true";
  }

  /**
   * Mark that user has engaged with this file
   */
  async markFileEngaged(): Promise<void> {
    figma.root.setPluginData(PLUGIN_DATA_KEYS.FILE_ENGAGED, "true");
    console.log("Marked file as engaged");
  }
}

/**
 * Singleton instance
 */
export const fileConfigStorage = new FileConfigStorage();
