# File-Specific Configuration Implementation Plan

## Token Bridge - Per-File Storage Architecture

**Version:** 1.0
**Date:** 2025-12-27
**Status:** Ready for Implementation

---

## Executive Summary

Token Bridge currently stores all configuration globally using `figma.clientStorage`, which is user-scoped across all Figma files. This creates a critical usability issue: users working with multiple design system files must reconfigure GitHub settings every time they switch files.

This document outlines a comprehensive plan to implement **file-specific configuration storage** using Figma's `setPluginData` / `getPluginData` API, enabling each Figma file to maintain its own independent GitHub repository configuration.

### Key Findings

1. **Cannot use `figma.fileKey`**: The `enablePrivatePluginApi` flag that exposes `figma.fileKey` only works for private plugins and during development. It **cannot be used in public community plugins** for security reasons. ([Source](https://forum.figma.com/archive-21/setting-enableprivatepluginapi-to-true-on-a-community-published-plugin-30444))

2. **Solution: Document Plugin Data**: Figma provides `setPluginData` / `getPluginData` APIs for storing plugin-specific data directly in the document. This data:
   - Is stored **with the Figma file** (not user-scoped)
   - Persists across sessions and users
   - Is private to the plugin (other plugins cannot access it)
   - Has a 100KB limit per key
   - Is commonly stored on `figma.root` for file-level settings ([Source](https://www.figma.com/plugin-docs/api/properties/nodes-setplugindata/))

3. **Hybrid Storage Model**: Use document plugin data for file-specific config and `clientStorage` for user preferences.

---

## Current Architecture

### Storage Mechanism

**Location:** `apps/figma-plugin/src/plugin/main.ts:407-544`
**Technology:** `figma.clientStorage` (user-level, persistent across all files)

**Current Storage Keys:**

```typescript
// GitHub Configuration (GLOBAL - needs to be FILE-SPECIFIC)
"github-config" → JSON {
  owner: string,
  repo: string,
  branch: string,
  tokenPath: string,
  authMethod?: "oauth" | "pat",
  accessToken?: string,
  syncMode: "direct" | "pull-request",
  isWylieDogProject?: boolean
}

// OAuth Tokens (GLOBAL - should remain GLOBAL for convenience)
"oauth_access_token" → string
"oauth_refresh_token" → string
"oauth_expires_at" → number
"oauth_scope" → string
"oauth_provider" → "github" | "gitlab" | "bitbucket"
"oauth_session_id" → string
"pkce_verifier" → string

// UI Preferences (GLOBAL - should remain GLOBAL)
"advanced-mode" → boolean
"has-seen-onboarding" → boolean
```

### Message Flow for Configuration

1. **UI loads** → `usePluginMessages.ts:465` sends `"get-github-config"`
2. **Plugin receives** → `main.ts:407-442` retrieves from `clientStorage`
3. **Plugin responds** → Posts `"github-config-loaded"` message to UI
4. **UI updates state** → `usePluginMessages.ts:319-334` sets config in state

**Files Involved:**

- `apps/figma-plugin/src/plugin/main.ts` - Plugin message handlers
- `apps/figma-plugin/src/plugin/oauth/token-storage.ts` - OAuth token management
- `apps/figma-plugin/src/plugin/oauth/handler.ts` - OAuth flow orchestration
- `apps/figma-plugin/src/ui/hooks/usePluginMessages.ts` - UI message coordination
- `apps/figma-plugin/src/ui/components/GitHubConfig.tsx` - Configuration form
- `apps/figma-plugin/src/ui/hooks/domain/useGitHubSync.ts` - Sync operations
- `apps/figma-plugin/src/shared/types/index.ts` - Type definitions

---

## Problem Statement

### Current Behavior (Broken)

1. User opens `design-system-alpha.fig`
2. Configures Token Bridge for `company/alpha-tokens` repo
3. Opens `design-system-beta.fig`
4. **Configuration is still pointing to `company/alpha-tokens`** ❌
5. User must reconfigure for `company/beta-tokens`
6. Returns to `design-system-alpha.fig`
7. **Configuration is now pointing to `company/beta-tokens`** ❌

### Expected Behavior (Fixed)

1. User opens `design-system-alpha.fig`
2. Configures Token Bridge for `company/alpha-tokens` repo
3. Configuration is **saved to the Figma file itself** ✅
4. Opens `design-system-beta.fig`
5. **No configuration exists** - user configures for `company/beta-tokens` ✅
6. Configuration is **saved to this specific file** ✅
7. Returns to `design-system-alpha.fig`
8. **Configuration is still `company/alpha-tokens`** ✅

---

## Solution Architecture

### Hybrid Storage Model

| Data Type            | Current Storage          | New Storage                         | Rationale                                           |
| -------------------- | ------------------------ | ----------------------------------- | --------------------------------------------------- |
| **GitHub Config**    | `clientStorage` (global) | `figma.root.setPluginData()` (file) | Each file syncs to different repo                   |
| **OAuth Tokens**     | `clientStorage` (global) | `clientStorage` (global)            | Same GitHub account across files, avoid duplication |
| **UI Preferences**   | `clientStorage` (global) | `clientStorage` (global)            | Consistent UX across files                          |
| **Onboarding State** | `clientStorage` (global) | `clientStorage` (global)            | Show once per user, not per file                    |

### Storage Implementation

#### File-Specific Storage (NEW)

```typescript
// Store GitHub config in document
figma.root.setPluginData("github-config", JSON.stringify(config));

// Retrieve GitHub config from document
const configJson = figma.root.getPluginData("github-config");
const config = configJson ? JSON.parse(configJson) : null;

// Check if file has configuration
const hasConfig = figma.root.getPluginData("github-config") !== "";
```

**Benefits:**

- ✅ Data stored **with the Figma file**
- ✅ Persists when file is shared/duplicated
- ✅ Each file maintains independent configuration
- ✅ No file key or private API required
- ✅ Available in all public plugins

**Limitations:**

- ⚠️ 100KB limit per key (sufficient for config JSON)
- ⚠️ Data is visible to users who inspect the file
- ⚠️ Shared with team members who access the file

#### User-Level Storage (UNCHANGED)

```typescript
// OAuth tokens remain in clientStorage
await figma.clientStorage.setAsync("oauth_access_token", token);
const token = await figma.clientStorage.getAsync("oauth_access_token");

// User preferences remain in clientStorage
await figma.clientStorage.setAsync("advanced-mode", true);
const advancedMode = await figma.clientStorage.getAsync("advanced-mode");
```

---

## Implementation Plan

### Phase 1: Create Storage Abstraction Layer

**Goal:** Centralize all storage logic to make the transition clean and maintainable.

#### 1.1 Create File Storage Module

**New File:** `apps/figma-plugin/src/plugin/storage/file-storage.ts`

```typescript
/**
 * File-specific storage using Figma's document plugin data API
 * Stores configuration directly in the Figma file
 */

import type { GitHubConfig } from "../../shared/types";

const PLUGIN_DATA_KEYS = {
  GITHUB_CONFIG: "github-config",
  FILE_VERSION: "storage-version", // For future migrations
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
}

/**
 * Singleton instance
 */
export const fileConfigStorage = new FileConfigStorage();
```

#### 1.2 Create User Storage Module

**New File:** `apps/figma-plugin/src/plugin/storage/user-storage.ts`

```typescript
/**
 * User-level storage using Figma's clientStorage API
 * Stores user preferences and OAuth tokens (shared across all files)
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
```

**Note:** OAuth token storage (`apps/figma-plugin/src/plugin/oauth/token-storage.ts`) already uses `clientStorage` correctly and requires no changes.

#### 1.3 Create Migration Module

**New File:** `apps/figma-plugin/src/plugin/storage/migration.ts`

```typescript
/**
 * Data migration utilities for transitioning from global to file-specific storage
 */

import { fileConfigStorage } from "./file-storage";
import type { GitHubConfig } from "../../shared/types";

const MIGRATION_KEYS = {
  OLD_GLOBAL_CONFIG: "github-config", // Old clientStorage key
  MIGRATION_COMPLETE: "migration-to-file-storage-complete",
} as const;

export class StorageMigration {
  /**
   * Migrate global GitHub config to file-specific storage
   * Only runs once per file
   */
  async migrateGlobalToFileStorage(): Promise<{
    migrated: boolean;
    hadGlobalConfig: boolean;
  }> {
    try {
      // Check if this file already has config (already migrated or configured)
      const hasFileConfig = await fileConfigStorage.hasGitHubConfig();
      if (hasFileConfig) {
        console.log("File already has configuration, skipping migration");
        return { migrated: false, hadGlobalConfig: false };
      }

      // Check for old global config in clientStorage
      const globalConfigJson = await figma.clientStorage.getAsync(
        MIGRATION_KEYS.OLD_GLOBAL_CONFIG
      );

      if (!globalConfigJson) {
        console.log("No global config found to migrate");
        return { migrated: false, hadGlobalConfig: false };
      }

      // Parse global config
      let globalConfig: GitHubConfig;
      if (typeof globalConfigJson === "string") {
        globalConfig = JSON.parse(globalConfigJson);
      } else {
        globalConfig = globalConfigJson;
      }

      // Migrate to file storage
      await fileConfigStorage.setGitHubConfig(globalConfig);
      console.log("✅ Migrated global config to file storage:", globalConfig);

      // Post message to UI to inform user
      figma.ui.postMessage({
        type: "migration-complete",
        message:
          "Your GitHub configuration has been migrated to be file-specific. Each Figma file can now have its own repository settings!",
      });

      return { migrated: true, hadGlobalConfig: true };
    } catch (error) {
      console.error("Migration failed:", error);
      return { migrated: false, hadGlobalConfig: false };
    }
  }

  /**
   * Clear old global config after successful migration
   * (Optional - can be called after user acknowledges migration)
   */
  async clearOldGlobalConfig(): Promise<void> {
    try {
      await figma.clientStorage.deleteAsync(MIGRATION_KEYS.OLD_GLOBAL_CONFIG);
      console.log("Cleared old global config from clientStorage");
    } catch (error) {
      console.error("Failed to clear old global config:", error);
    }
  }
}

/**
 * Singleton instance
 */
export const storageMigration = new StorageMigration();
```

---

### Phase 2: Update Plugin Message Handlers

**Goal:** Replace `clientStorage` calls with new storage abstraction layer.

#### 2.1 Update `main.ts` Message Handlers

**File:** `apps/figma-plugin/src/plugin/main.ts`

**Changes Required:**

1. **Import storage modules** (add to top of file):

```typescript
import { fileConfigStorage } from "./storage/file-storage";
import { userPreferencesStorage } from "./storage/user-storage";
import { storageMigration } from "./storage/migration";
```

2. **Add migration on plugin initialization** (after `figma.showUI()`):

```typescript
figma.showUI(__html__, {
  width: 400,
  height: 600,
  title: "Token Bridge",
});

// Run migration on startup
storageMigration.migrateGlobalToFileStorage().catch((error) => {
  console.error("Migration error:", error);
});
```

3. **Replace `get-github-config` handler** (lines 407-442):

```typescript
case "get-github-config":
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
  break;
```

4. **Replace `save-github-config` handler** (lines 468-487):

```typescript
case "save-github-config":
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
      error: error instanceof Error ? error.message : "Failed to save configuration",
    });
  }
  break;
```

5. **Add new `clear-github-config` handler** (optional, for UX):

```typescript
case "clear-github-config":
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
      error: error instanceof Error ? error.message : "Failed to clear configuration",
    });
  }
  break;
```

6. **Update `get-advanced-mode` handler** (lines 489-503):

```typescript
case "get-advanced-mode":
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
  break;
```

7. **Update `save-advanced-mode` handler** (lines 506-513):

```typescript
case "save-advanced-mode":
  try {
    await userPreferencesStorage.setAdvancedMode(msg.advancedMode);
    console.log("Advanced mode preference saved:", msg.advancedMode);
  } catch (error) {
    console.error("Error saving advanced mode:", error);
  }
  break;
```

8. **Update `get-onboarding-state` handler** (lines 515-532):

```typescript
case "get-onboarding-state":
  try {
    const hasSeenOnboarding = await userPreferencesStorage.getHasSeenOnboarding();

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
  break;
```

9. **Update `save-onboarding-state` handler** (lines 534-544):

```typescript
case "save-onboarding-state":
  try {
    await userPreferencesStorage.setHasSeenOnboarding(msg.hasSeenOnboarding);
    console.log("Onboarding state saved:", msg.hasSeenOnboarding);
  } catch (error) {
    console.error("Error saving onboarding state:", error);
  }
  break;
```

**OAuth token storage** (`token-storage.ts`) requires **no changes** - it already uses `clientStorage` correctly.

---

### Phase 3: Update UI Components (Optional Enhancements)

**Goal:** Add UI indicators to show file-specific configuration status.

#### 3.1 Handle Migration Message

**File:** `apps/figma-plugin/src/ui/hooks/usePluginMessages.ts`

**Add new message handler** (inside `switch` statement in `handleMessage`, around line 241):

```typescript
case "migration-complete":
  console.log("Migration complete:", msg.message);
  setSuccessMessage(msg.message);
  setTimeout(() => setSuccessMessage(null), 8000); // Show for 8 seconds
  break;
```

#### 3.2 Add File Configuration Indicator (Optional)

**File:** `apps/figma-plugin/src/ui/components/GitHubConfig.tsx`

**Add indicator at top of form** (after line 85, inside the component):

```typescript
// Show current file indicator
<div style={{
  padding: "8px 12px",
  backgroundColor: "rgba(0, 122, 255, 0.1)",
  borderRadius: "4px",
  marginBottom: "16px",
  fontSize: "13px",
  color: "#0a5fcc"
}}>
  ℹ️ Configuration is saved to this Figma file
</div>
```

#### 3.3 Add Clear Configuration Option (Optional)

**File:** `apps/figma-plugin/src/ui/components/GitHubConfig.tsx`

**Add clear button** (near the save/cancel buttons):

```typescript
const handleClear = async () => {
  if (confirm("Clear GitHub configuration for this file? You can reconfigure it later.")) {
    parent.postMessage(
      { pluginMessage: { type: "clear-github-config" } },
      "*"
    );
    onClose();
  }
};

// In JSX:
<button onClick={handleClear} style={{ marginLeft: "8px", color: "#d73a49" }}>
  Clear Configuration
</button>
```

---

### Phase 4: Testing & Validation

#### 4.1 Manual Testing Checklist

**Test Case 1: Fresh File (No Configuration)**

- [ ] Open a new Figma file with no prior Token Bridge configuration
- [ ] Open Token Bridge plugin
- [ ] Should show setup wizard / configuration screen
- [ ] Configure GitHub repo settings
- [ ] Verify configuration saves successfully
- [ ] Close and reopen plugin
- [ ] Verify configuration persists

**Test Case 2: Existing File (Migration)**

- [ ] Configure Token Bridge with global config (pre-update version)
- [ ] Update plugin to new version
- [ ] Open Token Bridge
- [ ] Should see migration success message
- [ ] Verify old configuration is now saved to file
- [ ] Make a change and verify it saves to file storage

**Test Case 3: Multi-File Workflow**

- [ ] Open `file-A.fig` and configure for `repo-A`
- [ ] Verify sync works with `repo-A`
- [ ] Open `file-B.fig` in another tab
- [ ] Configure for `repo-B`
- [ ] Verify sync works with `repo-B`
- [ ] Switch back to `file-A.fig`
- [ ] Verify configuration is still `repo-A` (not overwritten)
- [ ] Switch back to `file-B.fig`
- [ ] Verify configuration is still `repo-B`

**Test Case 4: File Duplication**

- [ ] Configure `file-A.fig` for `repo-A`
- [ ] Duplicate the Figma file
- [ ] Open duplicated file
- [ ] Verify configuration is inherited from original
- [ ] Change configuration in duplicate
- [ ] Verify original file configuration is unchanged

**Test Case 5: Team Sharing**

- [ ] Configure Token Bridge in a file
- [ ] Share file with team member
- [ ] Team member opens file
- [ ] Verify configuration is present (shared via file)
- [ ] Team member authenticates with their own OAuth
- [ ] Verify team member can sync to same repo

**Test Case 6: OAuth Token Sharing**

- [ ] Authenticate with GitHub OAuth in `file-A.fig`
- [ ] Open `file-B.fig`
- [ ] Verify OAuth tokens are still valid (not file-specific)
- [ ] Should not need to re-authenticate

**Test Case 7: User Preferences**

- [ ] Enable advanced mode in `file-A.fig`
- [ ] Open `file-B.fig`
- [ ] Verify advanced mode is still enabled (user preference, not file-specific)

**Test Case 8: Clear Configuration**

- [ ] Configure Token Bridge
- [ ] Click "Clear Configuration" button
- [ ] Verify configuration is removed
- [ ] Close and reopen plugin
- [ ] Verify setup wizard appears

#### 4.2 Edge Cases

- [ ] **Very long config values**: Test with long repo names, paths (ensure <100KB limit)
- [ ] **Special characters**: Test repo names with hyphens, underscores, dots
- [ ] **Malformed JSON**: Ensure graceful error handling if `figma.root.getPluginData()` returns invalid JSON
- [ ] **Concurrent edits**: Two users editing same file - ensure no config corruption
- [ ] **Plugin updates**: Ensure future migrations can be detected via storage version

#### 4.3 Automated Tests (Future)

**Unit Tests:**

- Test `FileConfigStorage` methods (get, set, clear, hasConfig)
- Test `UserPreferencesStorage` methods
- Test migration logic with various scenarios

**Integration Tests:**

- Test message flow from UI → Plugin → Storage → Plugin → UI
- Test migration triggering on plugin initialization

---

### Phase 5: Documentation & Communication

#### 5.1 Update README

**File:** `apps/figma-plugin/README.md`

**Add section:**

```markdown
## File-Specific Configuration

Token Bridge now stores configuration **per-file** rather than globally. This means:

- Each Figma file can sync to a different GitHub repository
- Switching between files automatically loads the correct configuration
- Configuration is saved with the file and shared with team members
- OAuth tokens remain user-specific (not shared with team)

### Migration from Global Configuration

If you used Token Bridge before version X.X.X, your existing configuration will be automatically migrated to the current file when you first open the plugin. The migration happens once per file and requires no user action.
```

#### 5.2 Release Notes

**Version X.X.X - File-Specific Configuration**

**Breaking Changes:**

- Configuration is now stored per-file instead of globally
- Each Figma file maintains its own GitHub repository settings

**New Features:**

- Seamless multi-file workflows - no more reconfiguration when switching files
- Automatic migration from global to file-specific storage
- Configuration is shared when file is duplicated or shared with team

**What This Means:**

- ✅ Work on multiple design systems without constant reconfiguration
- ✅ Each file "remembers" its own repository settings
- ✅ OAuth authentication remains user-specific (you don't re-authenticate per file)
- ✅ User preferences (advanced mode, onboarding state) remain global

#### 5.3 User Communication

**In-App Migration Message:**

When migration occurs, show a dismissible success message:

```
🎉 Configuration Updated!

Token Bridge now saves configuration per-file instead of globally. This means each Figma file can sync to a different repository without constant reconfiguration.

Your existing settings have been automatically migrated to this file.

[Learn More] [Dismiss]
```

---

## Technical Considerations

### Data Size Limits

- `figma.root.setPluginData()` has a **100KB limit per key**
- Typical `GitHubConfig` JSON is ~200-500 bytes
- Leaves ample room for future expansion

**Example:**

```json
{
  "owner": "company",
  "repo": "design-tokens",
  "branch": "main",
  "tokenPath": "packages/tokens/io/processed",
  "authMethod": "oauth",
  "syncMode": "pull-request",
  "isWylieDogProject": false
}
```

Size: ~180 bytes

### Security & Privacy

**Plugin Data Security:**

- Data stored with `setPluginData` is **private to the plugin ID**
- Other plugins **cannot** read this data ([Source](https://www.figma.com/plugin-docs/api/properties/nodes-setplugindata/))
- Data is stored "privately for stability, not security" - users can inspect it with effort
- **Do not store OAuth tokens or personal access tokens in plugin data**

**OAuth Token Security:**

- OAuth tokens remain in `figma.clientStorage` (encrypted at rest by Figma)
- Tokens are **not** shared across users
- Tokens are **not** stored in the file

### Performance

**Plugin Data vs. clientStorage:**

- `figma.root.getPluginData()` is **synchronous** (blocking)
- `figma.clientStorage.getAsync()` is **asynchronous** (non-blocking)
- Plugin data reads are fast (<1ms) since data is in memory
- No performance degradation expected

**Migration Impact:**

- Migration runs **once per file** on first plugin open
- Takes <10ms for typical config size
- Non-blocking - plugin remains responsive

### Backward Compatibility

**Migration Strategy:**

1. Check if file already has config → skip migration
2. Check if global config exists → migrate to file
3. Clear global config (optional, after user confirmation)

**Rollback Plan:**
If issues arise, we can:

1. Re-enable global storage in a hotfix
2. Copy file-specific config back to global storage
3. Provide migration path forward again

---

## File Modification Summary

### New Files (3)

1. `apps/figma-plugin/src/plugin/storage/file-storage.ts` (~150 LOC)
2. `apps/figma-plugin/src/plugin/storage/user-storage.ts` (~60 LOC)
3. `apps/figma-plugin/src/plugin/storage/migration.ts` (~100 LOC)

### Modified Files (2-3)

1. `apps/figma-plugin/src/plugin/main.ts`
   - Add imports for new storage modules
   - Replace 8 message handlers with storage abstraction calls
   - Add migration trigger on initialization
   - **Estimated changes:** ~50 LOC modified, ~10 LOC added

2. `apps/figma-plugin/src/ui/hooks/usePluginMessages.ts`
   - Add `migration-complete` message handler
   - **Estimated changes:** ~5 LOC added

3. `apps/figma-plugin/src/ui/components/GitHubConfig.tsx` (optional)
   - Add file indicator UI
   - Add clear configuration button
   - **Estimated changes:** ~20 LOC added (optional)

### No Changes Required (3)

1. `apps/figma-plugin/src/plugin/oauth/token-storage.ts` - Already correct ✅
2. `apps/figma-plugin/src/plugin/oauth/handler.ts` - No storage changes needed ✅
3. `apps/figma-plugin/src/shared/types/index.ts` - Types remain the same ✅

**Total Estimated Changes:** ~310 LOC new, ~75 LOC modified

---

## Risk Assessment

### Low Risk ✅

- **API Compatibility**: `setPluginData` / `getPluginData` available in all Figma plugin API versions
- **Public Plugin Compatibility**: No private APIs required
- **Backward Compatibility**: Automatic migration handles existing users
- **Performance**: No performance impact (synchronous API is faster for small data)

### Medium Risk ⚠️

- **Data Loss on Migration**: If migration fails, user must reconfigure
  - **Mitigation**: Comprehensive error handling, keep global config until user confirms migration
- **Team Confusion**: Users may not understand file-specific config
  - **Mitigation**: Clear in-app messaging, documentation, release notes
- **100KB Limit**: Future config expansion could hit limit
  - **Mitigation**: Monitor config size, use compression if needed

### Negligible Risk

- **Security**: OAuth tokens remain secure in `clientStorage`
- **Multi-user Editing**: Figma handles concurrent plugin data writes gracefully

---

## Success Criteria

### Functional Requirements

- ✅ Each Figma file maintains independent GitHub configuration
- ✅ Switching files loads correct configuration automatically
- ✅ OAuth tokens remain user-specific (not file-specific)
- ✅ User preferences remain global (not file-specific)
- ✅ Existing users migrate automatically without data loss

### User Experience Requirements

- ✅ No manual migration steps required
- ✅ Clear messaging when migration occurs
- ✅ Configuration shared when file is duplicated/shared
- ✅ Seamless multi-file workflow

### Technical Requirements

- ✅ No breaking changes to plugin API
- ✅ No performance degradation
- ✅ Comprehensive error handling
- ✅ Support for future storage migrations

---

## Timeline Estimate

| Phase       | Description                    | Estimated Effort |
| ----------- | ------------------------------ | ---------------- |
| **Phase 1** | Storage abstraction layer      | 2-3 hours        |
| **Phase 2** | Update plugin message handlers | 1-2 hours        |
| **Phase 3** | UI enhancements (optional)     | 1 hour           |
| **Phase 4** | Testing & validation           | 2-3 hours        |
| **Phase 5** | Documentation                  | 1 hour           |
| **Total**   |                                | **7-10 hours**   |

---

## Implementation Sequence

1. ✅ **Create storage modules** (Phase 1)
   - `file-storage.ts`
   - `user-storage.ts`
   - `migration.ts`

2. ✅ **Update plugin handlers** (Phase 2)
   - Replace `clientStorage` calls in `main.ts`
   - Add migration trigger

3. ✅ **Test migration** (Phase 4.1)
   - Test with existing global config
   - Verify automatic migration works

4. ✅ **Test multi-file workflow** (Phase 4.1)
   - Configure multiple files
   - Verify independent configurations

5. ✅ **Add UI enhancements** (Phase 3)
   - Migration message
   - File indicator (optional)

6. ✅ **Final testing** (Phase 4.2)
   - Edge cases
   - Team sharing scenarios

7. ✅ **Documentation** (Phase 5)
   - Update README
   - Write release notes

---

## References

### Figma Plugin API Documentation

- [setPluginData API](https://www.figma.com/plugin-docs/api/properties/nodes-setplugindata/) - Store plugin-specific data on nodes
- [getPluginData API](https://developers.figma.com/docs/plugins/api/properties/nodes-setplugindata/) - Retrieve plugin-specific data
- [figma.clientStorage API](https://www.figma.com/plugin-docs/api/figma-clientStorage/) - User-level persistent storage
- [Plugin Manifest](https://www.figma.com/plugin-docs/manifest/) - Plugin configuration reference

### Community Resources

- [Figma Forum: setPluginData Best Practices](https://forum.figma.com/t/how-to-handle-plugin-data-change-by-another-user-private-data-stored-by-setplugindata/42242)
- [Figma Forum: Efficient User Data Storage](https://forum.figma.com/t/what-is-the-most-efficient-way-to-save-users-data-in-plugins/45085)
- [Evil Martians: Next-Level Figma Plugins](https://evilmartians.com/chronicles/how-to-make-next-level-figma-plugins-auth-routing-storage-and-more)

### Private Plugin API (Not Applicable)

- [enablePrivatePluginApi Discussion](https://forum.figma.com/archive-21/setting-enableprivatepluginapi-to-true-on-a-community-published-plugin-30444) - Why we **cannot** use `figma.fileKey`
- [Private Plugin API Limitations](https://forum.figma.com/t/setting-enableprivatepluginapi-to-true-on-a-community-published-plugin/1699) - Public plugins are restricted

---

## Appendix: Storage API Comparison

| Feature           | `clientStorage`                | `setPluginData`             |
| ----------------- | ------------------------------ | --------------------------- |
| **Scope**         | User-level (global)            | File-level (document)       |
| **Persistence**   | Across all files               | Within specific file        |
| **Sharing**       | Private to user                | Shared with team            |
| **API Type**      | Async                          | Sync                        |
| **Size Limit**    | 5MB total                      | 100KB per key               |
| **Use Case**      | User preferences, OAuth tokens | File-specific configuration |
| **Public Plugin** | ✅ Yes                         | ✅ Yes                      |
| **Team Sync**     | ❌ No                          | ✅ Yes                      |

---

## Conclusion

This implementation plan provides a **comprehensive, low-risk solution** to Token Bridge's file-specific configuration problem using Figma's native `setPluginData` API. The hybrid storage model balances file-specific configuration with user convenience (shared OAuth tokens and preferences).

**Key Achievements:**

- ✅ Solves multi-file workflow problem
- ✅ Uses public API (no private plugin restrictions)
- ✅ Automatic migration for existing users
- ✅ Clean, maintainable architecture
- ✅ Estimated 7-10 hours implementation time

**Next Steps:**

1. Review and approve this plan
2. Begin Phase 1 implementation
3. Iterate based on testing feedback

---

## Implementation Status

**Status:** ✅ **COMPLETED**
**Completed:** 2025-12-27
**Plan Version:** 2.0 (Final)

### What Was Implemented

✅ **File-specific storage** - Using `figma.root.setPluginData()` API
✅ **Storage abstraction layer** - `file-storage.ts` and `user-storage.ts` modules
✅ **Independent file configurations** - Each file maintains its own GitHub repo settings
✅ **User-level preferences** - OAuth tokens, onboarding, advanced mode remain global
✅ **UI indicators** - Clear messaging that config is file-specific
✅ **Sync tab always accessible** - Users can configure GitHub anytime

### What Was NOT Implemented

❌ **Migration from global storage** - No existing users, so migration was removed entirely

- File: `migration.ts` was created then deleted
- Users simply configure each file as needed

### Deviations from Original Plan

1. **Migration disabled** - Original plan included complex migration logic, but since there are no existing users, all migration code was removed
2. **Sync tab UX fix** - Added critical fix to make Sync tab always enabled, allowing access to configuration UI
3. **Simplified approach** - Removed all unnecessary complexity, focused on core functionality

---

**Plan Status:** ✅ **IMPLEMENTATION COMPLETE**
**Last Updated:** 2025-12-27
**Original Plan Version:** 1.0
**Final Status Version:** 2.0
