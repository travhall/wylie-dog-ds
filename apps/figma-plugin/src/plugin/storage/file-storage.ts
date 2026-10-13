/**
 * File-specific storage using Figma's document plugin data API.
 *
 * Repo coordinates (owner/repo/branch/tokenPath/...) live in the file so every
 * collaborator targets the same repo. The personal access token is NEVER
 * written to the file: plugin data travels with the file when it is duplicated
 * or shared. The token lives in per-user figma.clientStorage instead.
 */

import type { GitHubConfig } from "../../shared/types";

const PLUGIN_DATA_KEYS = {
  GITHUB_CONFIG: "github-config",
  FILE_ENGAGED: "has-engaged-with-file", // Track if user has interacted with this file
} as const;

/** clientStorage key for the user's PAT (per Figma user, shared across files) */
export const ACCESS_TOKEN_STORAGE_KEY = "github-access-token";

/**
 * File-specific GitHub configuration storage
 */
export class FileConfigStorage {
  /**
   * Get GitHub configuration for the current file, with the current user's
   * token merged in from clientStorage.
   *
   * Files saved by older versions hold the token in plugin data. On read it is
   * moved to clientStorage (unless this user already has one) and stripped
   * from the file.
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
      const stored: GitHubConfig =
        typeof configJson === "string"
          ? JSON.parse(configJson)
          : (configJson as GitHubConfig);
      const { accessToken: legacyToken, ...fileConfig } = stored;

      let userToken: string | undefined = await figma.clientStorage.getAsync(
        ACCESS_TOKEN_STORAGE_KEY
      );

      if (legacyToken !== undefined) {
        try {
          if (!userToken && legacyToken) {
            await figma.clientStorage.setAsync(
              ACCESS_TOKEN_STORAGE_KEY,
              legacyToken
            );
            userToken = legacyToken;
          }
          // Only strip once the token is safely in (or already in) user storage
          figma.root.setPluginData(
            PLUGIN_DATA_KEYS.GITHUB_CONFIG,
            JSON.stringify(fileConfig)
          );
          console.log("Migrated GitHub access token out of file plugin data");
        } catch (error) {
          console.error("Failed to migrate GitHub access token:", error);
        }
      }

      return userToken ? { ...fileConfig, accessToken: userToken } : fileConfig;
    } catch (error) {
      console.error("Failed to retrieve GitHub config from file:", error);
      return null;
    }
  }

  /**
   * Save GitHub configuration: repo settings to the file, token to the
   * current user's clientStorage.
   */
  async setGitHubConfig(config: GitHubConfig): Promise<void> {
    try {
      const { accessToken, ...fileConfig } = config;
      if (accessToken) {
        await figma.clientStorage.setAsync(
          ACCESS_TOKEN_STORAGE_KEY,
          accessToken
        );
      }
      figma.root.setPluginData(
        PLUGIN_DATA_KEYS.GITHUB_CONFIG,
        JSON.stringify(fileConfig)
      );
      console.log("GitHub config saved to file:", {
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
      });
    } catch (error) {
      console.error("Failed to save GitHub config:", error);
      throw new Error("Failed to save configuration");
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
   * Clear GitHub configuration from the current file and the user's token
   */
  async clearGitHubConfig(): Promise<void> {
    try {
      figma.root.setPluginData(PLUGIN_DATA_KEYS.GITHUB_CONFIG, "");
      await figma.clientStorage.deleteAsync(ACCESS_TOKEN_STORAGE_KEY);
      console.log("GitHub config cleared from file");
    } catch (error) {
      console.error("Failed to clear GitHub config from file:", error);
      throw new Error("Failed to clear configuration from file");
    }
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
