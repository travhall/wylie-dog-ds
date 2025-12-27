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
}

export class ConflictAwareGitHubClient extends GitHubClient {
  private conflictDetector = new ConflictDetector();
  private conflictResolver = new ConflictResolver();
  private metadataManager = new SyncMetadataManager();

  /**
   * Pull tokens with automatic conflict detection
   */
  async pullTokensWithConflictDetection(): Promise<ConflictAwarePullResult> {
    try {
      console.log("🔍 Starting conflict-aware pull...");

      // Get current local tokens first
      const localTokens = await this.getCurrentLocalTokens();
      console.log(`📍 Found ${localTokens.length} local collections`);

      // Pull remote tokens using parent class
      const pullResult = await super.pullTokens();
      if (!pullResult.success || !pullResult.tokens) {
        return {
          ...pullResult,
          requiresConflictResolution: false,
        };
      }

      console.log(`📥 Pulled ${pullResult.tokens.length} remote collections`);

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
   */
  async syncTokensWithConflictDetection(
    exportData: ExportData[],
    commitMessage?: string
  ): Promise<ConflictAwareSyncResult> {
    try {
      console.log("🚀 Starting conflict-aware sync...");

      // First, check for remote changes that might conflict
      const pullResult = await this.pullTokensWithConflictDetection();

      if (pullResult.requiresConflictResolution) {
        console.log("⚠️ Remote conflicts detected, sync blocked");
        return {
          success: false,
          error: `${pullResult.conflicts?.length} conflicts detected with remote changes`,
          conflicts: pullResult.conflicts,
          requiresConflictResolution: true,
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
   */
  async getCurrentLocalTokens(): Promise<ExportData[]> {
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
  async getSyncStatus(): Promise<{
    upToDate: boolean;
    localChanges: number;
    remoteChanges: number;
    lastSync?: string;
  }> {
    try {
      const pullResult = await this.pullTokensWithConflictDetection();

      return {
        upToDate: !pullResult.requiresConflictResolution,
        localChanges: 0, // TODO: implement proper local change detection
        remoteChanges: 0, // TODO: implement proper remote change detection
        lastSync: await this.getLastSyncTime(),
      };
    } catch (error) {
      console.error("Failed to get sync status:", error);
      return {
        upToDate: false,
        localChanges: 0,
        remoteChanges: 0,
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
