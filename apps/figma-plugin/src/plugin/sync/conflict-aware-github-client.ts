// Enhanced GitHub client with conflict detection and resolution capabilities
import { GitHubClient } from "../github/client";
import type { SyncResult, PullResult } from "../github/client";
import type { GitHubConfig } from "../../shared/types";
import type { ExportData } from "../variables/processor";
import { ConflictDetector } from "./conflict-detector";
import { ConflictResolver } from "./conflict-resolver";
import { SyncMetadataManager } from "./metadata-manager";
import type {
  TokenConflict,
  ConflictResolution,
  ProcessedTokenWithSync,
} from "./types";

export interface ConflictAwarePullResult extends PullResult {
  conflicts?: TokenConflict[];
  localTokens?: ExportData[];
  requiresConflictResolution?: boolean;
}

export interface ConflictAwareSyncResult extends SyncResult {
  conflicts?: TokenConflict[];
  requiresConflictResolution?: boolean;
  remoteTokens?: ExportData[];
}

export class ConflictAwareGitHubClient extends GitHubClient {
  private conflictDetector = new ConflictDetector();
  private conflictResolver = new ConflictResolver();
  private metadataManager = new SyncMetadataManager();

  /**
   * Pull tokens with automatic conflict detection
   * @param localTokens - Current local tokens from Figma (must be provided from plugin thread)
   */
  async pullTokensWithConflictDetection(
    localTokens?: ExportData[]
  ): Promise<ConflictAwarePullResult> {
    try {
      console.log("🔍 Starting conflict-aware pull...");

      // Pull remote tokens using parent class
      const pullResult = await super.pullTokens();
      if (!pullResult.success || !pullResult.tokens) {
        return {
          ...pullResult,
          requiresConflictResolution: false,
        };
      }

      console.log(`📥 Pulled ${pullResult.tokens.length} remote collections`);

      // Skip conflict detection if there are no local tokens
      if (!localTokens || localTokens.length === 0) {
        console.log("✅ No local tokens provided, skipping conflict detection");
        return {
          ...pullResult,
          requiresConflictResolution: false,
        };
      }

      console.log(`📍 Comparing with ${localTokens.length} local collections`);

      // Detect conflicts between local and remote
      const conflictResult = this.conflictDetector.detectConflicts(
        localTokens,
        pullResult.tokens
      );

      if (conflictResult.conflicts.length > 0) {
        console.log(`🔄 Detected ${conflictResult.conflicts.length} conflicts`);
        return {
          ...pullResult,
          conflicts: conflictResult.conflicts,
          localTokens,
          requiresConflictResolution: true,
        };
      }

      console.log("✅ No conflicts detected, safe to proceed");
      return {
        ...pullResult,
        requiresConflictResolution: false,
      };
    } catch (error) {
      console.error("❌ Conflict-aware pull failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        requiresConflictResolution: false,
      };
    }
  }

  /**
   * Sync tokens with pre-sync conflict detection
   * @param exportData - Tokens to sync to GitHub
   * @param commitMessage - Optional commit message
   */
  async syncTokensWithConflictDetection(
    exportData: ExportData[],
    commitMessage?: string
  ): Promise<ConflictAwareSyncResult> {
    try {
      console.log("🚀 Starting conflict-aware sync...");

      // Check for remote changes that might conflict with what we're pushing
      const pullResult = await this.pullTokensWithConflictDetection(exportData);

      if (pullResult.requiresConflictResolution) {
        console.log("⚠️ Remote conflicts detected, sync blocked");
        return {
          success: false,
          error: `${pullResult.conflicts?.length} conflicts detected with remote changes. Please resolve conflicts before syncing.`,
          conflicts: pullResult.conflicts,
          requiresConflictResolution: true,
          remoteTokens: pullResult.tokens, // Include remote tokens for conflict resolution
        };
      }

      // No conflicts, proceed with normal sync
      console.log("🎯 No conflicts, proceeding with sync...");
      const syncResult = await super.syncTokens(exportData, commitMessage);

      return {
        ...syncResult,
        requiresConflictResolution: false,
      };
    } catch (error) {
      console.error("❌ Conflict-aware sync failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
        requiresConflictResolution: false,
      };
    }
  }

  /**
   * Sync tokens with applied conflict resolutions
   */
  async syncTokensWithResolutions(
    localTokens: ExportData[],
    remoteTokens: ExportData[],
    resolutions: ConflictResolution[],
    commitMessage?: string
  ): Promise<SyncResult> {
    try {
      console.log(`🔧 Applying ${resolutions.length} conflict resolutions...`);

      // Apply conflict resolutions to merge tokens
      const resolvedTokens = this.conflictResolver.resolveConflicts(
        localTokens,
        remoteTokens,
        resolutions
      );

      console.log("✅ Conflicts resolved, syncing merged tokens...");

      // Sync the resolved tokens
      const syncResult = await super.syncTokens(
        resolvedTokens,
        commitMessage || "Sync tokens with conflict resolution"
      );

      if (syncResult.success) {
        console.log("🎉 Conflict resolution sync completed successfully");
      }

      return syncResult;
    } catch (error) {
      console.error("❌ Conflict resolution sync failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Resolution sync failed",
      };
    }
  }

  /**
   * Get current local tokens from Figma variables
   * Note: Only works in plugin thread context where figma API is available
   */
  async getCurrentLocalTokens(): Promise<ExportData[]> {
    // Check if we're in the plugin thread (where figma API exists)
    if (typeof figma === "undefined") {
      // Running in UI thread - cannot access figma API
      // This is expected during conflict detection in UI context
      return [];
    }

    try {
      // Get all local variable collections
      const collections =
        await figma.variables.getLocalVariableCollectionsAsync();
      const exportData: ExportData[] = [];

      for (const collection of collections) {
        const variables: Record<string, any> = {};

        // Process each variable in the collection
        for (const variableId of collection.variableIds) {
          try {
            const variable =
              await figma.variables.getVariableByIdAsync(variableId);
            if (variable) {
              // Convert Figma variable to token format
              const token = this.convertFigmaVariableToToken(
                variable,
                collection
              );
              variables[variable.name.replace(/\//g, ".")] = token;
            }
          } catch (err) {
            console.warn(`Failed to process variable ${variableId}:`, err);
          }
        }

        if (Object.keys(variables).length > 0) {
          exportData.push({
            [collection.name]: {
              modes: collection.modes,
              variables,
            },
          });
        }
      }

      return exportData;
    } catch (error) {
      console.error("Failed to get current local tokens:", error);
      return [];
    }
  }

  /**
   * Convert Figma variable to token format
   */
  private convertFigmaVariableToToken(
    variable: Variable,
    collection: VariableCollection
  ): any {
    // Determine token type based on Figma variable type
    const tokenType = this.mapFigmaTypeToTokenType(variable.resolvedType);

    // Get the default mode value
    const defaultMode = collection.modes[0];
    const value = this.convertFigmaValueToTokenValue(
      variable.valuesByMode[defaultMode.modeId],
      variable.resolvedType
    );

    const token: any = {
      $type: tokenType,
      $value: value,
      $description: variable.description || undefined,
    };

    // Handle multi-mode variables
    if (collection.modes.length > 1) {
      token.valuesByMode = {};
      for (const mode of collection.modes) {
        const modeValue = variable.valuesByMode[mode.modeId];
        if (modeValue !== undefined) {
          token.valuesByMode[mode.name] = this.convertFigmaValueToTokenValue(
            modeValue,
            variable.resolvedType
          );
        }
      }
    }

    return token;
  }

  /**
   * Map Figma variable type to W3C DTCG token type
   */
  private mapFigmaTypeToTokenType(figmaType: VariableResolvedDataType): string {
    switch (figmaType) {
      case "COLOR":
        return "color";
      case "FLOAT":
        return "dimension";
      case "STRING":
        return "string";
      case "BOOLEAN":
        return "boolean";
      default:
        return "string";
    }
  }

  /**
   * Convert Figma value to token value
   */
  private convertFigmaValueToTokenValue(
    value: any,
    type: VariableResolvedDataType
  ): any {
    switch (type) {
      case "COLOR":
        if (typeof value === "object" && value.r !== undefined) {
          // Convert RGB (0-1) to hex
          const r = Math.round(value.r * 255);
          const g = Math.round(value.g * 255);
          const b = Math.round(value.b * 255);
          return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        }
        return value;

      case "FLOAT":
        return `${value}px`;

      default:
        return value;
    }
  }

  /**
   * Apply conflict resolutions to export data
   */
  applyConflictResolutions(
    exportData: ExportData[],
    resolutions: ConflictResolution[]
  ): ExportData[] {
    const resolutionMap = new Map(resolutions.map((r) => [r.conflictId, r]));

    return exportData.map((collection) => {
      const updatedCollection: ExportData = {};

      for (const [collectionName, collectionData] of Object.entries(
        collection
      )) {
        const updatedVariables: { [key: string]: ProcessedTokenWithSync } = {};

        for (const [tokenName, token] of Object.entries(
          collectionData.variables
        )) {
          const tokenPath = `${collectionName}.${tokenName}`;
          const resolution = resolutionMap.get(tokenPath);

          if (resolution && resolution.token) {
            updatedVariables[tokenName] = resolution.token;
          } else {
            updatedVariables[tokenName] = token;
          }
        }

        updatedCollection[collectionName] = {
          ...collectionData,
          variables: updatedVariables,
        };
      }

      return updatedCollection;
    });
  }

  /**
   * Check sync status and detect changes
   */
  async getSyncStatus(localTokens?: ExportData[]): Promise<{
    upToDate: boolean;
    localChanges: number;
    remoteChanges: number;
    lastSync?: string;
    conflicts?: TokenConflict[];
  }> {
    try {
      // If localTokens not provided, we can't detect local changes
      if (!localTokens || localTokens.length === 0) {
        console.log("⚠️ No local tokens provided for sync status check");
        return {
          upToDate: false,
          localChanges: 0,
          remoteChanges: 0,
          lastSync: await this.getLastSyncTime(),
        };
      }

      // Pull remote tokens
      const pullResult = await super.pullTokens();

      if (!pullResult.success || !pullResult.tokens) {
        return {
          upToDate: false,
          localChanges: 0,
          remoteChanges: 0,
          lastSync: await this.getLastSyncTime(),
        };
      }

      // Detect conflicts
      const conflictResult = this.conflictDetector.detectConflicts(
        localTokens,
        pullResult.tokens
      );

      // Calculate change counts
      const localChanges = conflictResult.conflicts.filter(
        (c) => c.type === "value-change" && c.localToken
      ).length;

      const remoteChanges = conflictResult.conflicts.filter(
        (c) =>
          c.type === "value-change" ||
          c.type === "addition" ||
          c.type === "deletion"
      ).length;

      const upToDate = conflictResult.conflicts.length === 0;

      console.log(
        `📊 Sync status: ${localChanges} local changes, ${remoteChanges} remote changes`
      );

      return {
        upToDate,
        localChanges,
        remoteChanges,
        lastSync: await this.getLastSyncTime(),
        conflicts: conflictResult.conflicts,
      };
    } catch (error) {
      console.error("Failed to get sync status:", error);
      return {
        upToDate: false,
        localChanges: 0,
        remoteChanges: 0,
        lastSync: await this.getLastSyncTime(),
      };
    }
  }

  /**
   * Get last sync timestamp from storage
   */
  private async getLastSyncTime(): Promise<string | undefined> {
    try {
      const syncData = await figma.clientStorage.getAsync("github-last-sync");
      return syncData?.timestamp;
    } catch (error) {
      console.error("Error getting last sync time:", error);
      return undefined;
    }
  }
}
