/**
 * User-level storage using Figma's clientStorage API
 * Stores user preferences and settings (shared across all files)
 */

const USER_STORAGE_KEYS = {
  ADVANCED_MODE: "advanced-mode",
  HAS_SEEN_ONBOARDING: "has-seen-onboarding",
} as const;

/**
 * User preferences storage (global, not file-specific)
 */
export class UserPreferencesStorage {
  /**
   * Get advanced mode preference
   */
  async getAdvancedMode(): Promise<boolean> {
    const value = await figma.clientStorage.getAsync(
      USER_STORAGE_KEYS.ADVANCED_MODE
    );
    return value === true || value === "true";
  }

  /**
   * Save advanced mode preference
   */
  async setAdvancedMode(enabled: boolean): Promise<void> {
    await figma.clientStorage.setAsync(
      USER_STORAGE_KEYS.ADVANCED_MODE,
      enabled
    );
  }

  /**
   * Get onboarding state
   */
  async getHasSeenOnboarding(): Promise<boolean> {
    const value = await figma.clientStorage.getAsync(
      USER_STORAGE_KEYS.HAS_SEEN_ONBOARDING
    );
    return value === true || value === "true";
  }

  /**
   * Save onboarding state
   */
  async setHasSeenOnboarding(seen: boolean): Promise<void> {
    await figma.clientStorage.setAsync(
      USER_STORAGE_KEYS.HAS_SEEN_ONBOARDING,
      seen
    );
  }
}

/**
 * Singleton instance
 */
export const userPreferencesStorage = new UserPreferencesStorage();
