// Conflict resolution system for applying user decisions
import type { ExportData } from "../variables/processor";
import type {
  TokenConflict,
  ConflictResolution,
  ProcessedTokenWithSync,
  ExportDataWithSync,
} from "./types";
import { SyncMetadataManager } from "./metadata-manager";

export class ConflictResolver {
  private metadataManager = new SyncMetadataManager();

  /**
   * Apply conflict resolutions to merge local and remote tokens
   */
  resolveConflicts(
    localTokens: ExportData[],
    remoteTokens: ExportData[],
    resolutions: ConflictResolution[]
  ): ExportData[] {
    console.log(`🔧 Applying ${resolutions.length} conflict resolutions...`);

    // Convert to sync-aware format
    const localWithSync = this.metadataManager.addSyncMetadataToExportData(
      localTokens,
      "local"
    );
    const remoteWithSync = this.metadataManager.addSyncMetadataToExportData(
      remoteTokens,
      "remote"
    );

    // Create resolution lookup map
    const resolutionMap = new Map<string, ConflictResolution>();
    resolutions.forEach((resolution) => {
      resolutionMap.set(resolution.conflictId, resolution);
    });

    // Start with local tokens as base
    const resolved = this.deepClone(localWithSync);

    // Apply each resolution
    for (const resolution of resolutions) {
      this.applyResolution(resolved, remoteWithSync, resolution);
    }

    // Convert back to standard format (remove sync metadata for compatibility)
    const result = this.stripSyncMetadata(resolved);

    console.log("✅ Conflict resolution complete");
    return result;
  }

  /**
   * Apply a single conflict resolution
   */
  private applyResolution(
    resolvedTokens: ExportDataWithSync[],
    remoteTokens: ExportDataWithSync[],
    resolution: ConflictResolution
  ): void {
    const {
      conflictId,
      resolution: strategy,
      token: manualToken,
      manualValue,
    } = resolution;

    // Parse conflict ID to get token path info
    const pathInfo = this.parseConflictId(conflictId);
    if (!pathInfo) {
      console.warn(`Invalid conflict ID: ${conflictId}`);
      return;
    }

    const { tokenPath, collectionName, tokenName } = pathInfo;

    switch (strategy) {
      case "take-local":
        // Keep existing local token (no action needed)
        console.log(`📍 Keeping local version of ${tokenPath}`);
        break;

      case "take-remote":
        this.applyRemoteToken(
          resolvedTokens,
          remoteTokens,
          collectionName,
          tokenName
        );
        console.log(`📥 Applied remote version of ${tokenPath}`);
        break;

      case "manual":
        if (manualToken) {
          this.applyManualToken(
            resolvedTokens,
            collectionName,
            tokenName,
            manualToken
          );
          console.log(`✏️ Applied manual resolution for ${tokenPath}`);
        } else if (manualValue !== undefined) {
          this.applyManualValue(
            resolvedTokens,
            collectionName,
            tokenName,
            manualValue
          );
          console.log(`✏️ Applied manual value for ${tokenPath}`);
        }
        break;

      default:
        console.warn(`Unknown resolution strategy: ${strategy}`);
    }
  }

  /**
   * Apply a remote token to the resolved tokens
   */
  private applyRemoteToken(
    resolvedTokens: ExportDataWithSync[],
    remoteTokens: ExportDataWithSync[],
    collectionName: string,
    tokenName: string
  ): void {
    // Find the remote token
    const remoteToken = this.findToken(remoteTokens, collectionName, tokenName);
    if (!remoteToken) {
      console.warn(`Remote token not found: ${collectionName}.${tokenName}`);
      return;
    }

    // DEBUG: Log description for font-family tokens
    if (remoteToken.$type === "fontFamily") {
      console.log(
        `🔍 [CONFLICT-RESOLVER] Applying remote font-family token: ${collectionName}.${tokenName}`
      );
      console.log(
        `  $description: "${remoteToken.$description || "undefined"}"`
      );
      console.log(`  $value: "${remoteToken.$value}"`);
    }

    // Find or create the collection in resolved tokens
    const collection = this.findOrCreateCollection(
      resolvedTokens,
      collectionName
    );

    // Update with remote token and mark as resolved
    collection.variables[tokenName] = this.metadataManager.updateSyncMetadata(
      remoteToken,
      "remote"
    );
  }

  /**
   * Apply a manually edited token
   */
  private applyManualToken(
    resolvedTokens: ExportDataWithSync[],
    collectionName: string,
    tokenName: string,
    manualToken: ProcessedTokenWithSync
  ): void {
    const collection = this.findOrCreateCollection(
      resolvedTokens,
      collectionName
    );

    // Apply manual token with updated metadata
    collection.variables[tokenName] = this.metadataManager.updateSyncMetadata(
      manualToken,
      "local"
    );
  }

  /**
   * Apply a manual value to an existing token
   */
  private applyManualValue(
    resolvedTokens: ExportDataWithSync[],
    collectionName: string,
    tokenName: string,
    manualValue: any
  ): void {
    const collection = this.findOrCreateCollection(
      resolvedTokens,
      collectionName
    );
    const existingToken = collection.variables[tokenName];

    if (existingToken) {
      // Update existing token with manual value
      const updatedToken: ProcessedTokenWithSync = {
        ...existingToken,
        $value: manualValue,
      };

      collection.variables[tokenName] = this.metadataManager.updateSyncMetadata(
        updatedToken,
        "local"
      );
    }
  }

  /**
   * Find a token in the export data
   */
  private findToken(
    exportData: ExportDataWithSync[],
    collectionName: string,
    tokenName: string
  ): ProcessedTokenWithSync | null {
    for (const data of exportData) {
      const collection = data[collectionName];
      if (collection && collection.variables[tokenName]) {
        return collection.variables[tokenName];
      }
    }
    return null;
  }

  /**
   * Find or create a collection in the resolved tokens
   */
  private findOrCreateCollection(
    resolvedTokens: ExportDataWithSync[],
    collectionName: string
  ) {
    // Look for existing collection
    for (const data of resolvedTokens) {
      if (data[collectionName]) {
        return data[collectionName];
      }
    }

    // Create new collection if not found
    const newData: ExportDataWithSync = {
      [collectionName]: {
        variables: {},
      },
    };

    resolvedTokens.push(newData);
    return newData[collectionName];
  }

  /**
   * Parse conflict ID to extract path information
   */
  private parseConflictId(conflictId: string): {
    tokenPath: string;
    collectionName: string;
    tokenName: string;
  } | null {
    // Expected format: conflict_{type}_{collectionName}.{tokenName}_{timestamp}
    // Example: conflict_value_primitive.color.gray.500_1234567890
    const match = conflictId.match(/^conflict_[^_]+_(.+)_\d+$/);
    if (!match) return null;

    const tokenPath = match[1]; // e.g., "primitive.color.gray.500"

    // Split on the FIRST dot to get collection name
    // primitive.color.gray.500 → "primitive" + "color.gray.500"
    const firstDotIndex = tokenPath.indexOf(".");

    if (firstDotIndex === -1) return null;

    const collectionName = tokenPath.substring(0, firstDotIndex); // "primitive"
    const tokenName = tokenPath.substring(firstDotIndex + 1); // "color.gray.500"

    return {
      tokenPath,
      collectionName,
      tokenName,
    };
  }

  /**
   * Strip sync metadata to return standard ExportData format
   */
  private stripSyncMetadata(
    exportDataWithSync: ExportDataWithSync[]
  ): ExportData[] {
    return exportDataWithSync.map((data) => {
      const stripped: ExportData = {};

      for (const [collectionName, collection] of Object.entries(data)) {
        stripped[collectionName] = {
          ...collection,
          variables: Object.fromEntries(
            Object.entries(collection.variables).map(([tokenName, token]) => {
              // DEBUG: Log description for font-family tokens
              if (token.$type === "fontFamily") {
                console.log(
                  `🔍 [CONFLICT-RESOLVER] stripSyncMetadata for ${collectionName}.${tokenName}`
                );
                console.log(
                  `  $description: "${token.$description || "undefined"}"`
                );
              }

              return [
                tokenName,
                {
                  $type: token.$type,
                  $value: token.$value,
                  $description: token.$description,
                  name: token.name,
                  valuesByMode: token.valuesByMode,
                },
              ];
            })
          ),
        };
      }

      return stripped;
    });
  }

  /**
   * Deep clone export data
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Generate automatic resolutions for simple conflicts
   */
  generateAutoResolutions(conflicts: TokenConflict[]): ConflictResolution[] {
    return conflicts
      .filter((conflict) => conflict.autoResolvable)
      .map((conflict) => ({
        conflictId: conflict.conflictId,
        resolution: conflict.suggestedResolution,
        token:
          conflict.suggestedResolution === "take-remote"
            ? conflict.remoteToken
            : conflict.localToken,
      }));
  }

  /**
   * Create batch resolutions with the same strategy
   */
  createBatchResolutions(
    conflicts: TokenConflict[],
    strategy: "take-local" | "take-remote"
  ): ConflictResolution[] {
    return conflicts.map((conflict) => ({
      conflictId: conflict.conflictId,
      resolution: strategy,
      token:
        strategy === "take-remote" ? conflict.remoteToken : conflict.localToken,
    }));
  }
}
