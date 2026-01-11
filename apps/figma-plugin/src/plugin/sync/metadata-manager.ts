// Change detection and sync metadata utilities
import type {
  ProcessedToken,
  ProcessedCollection,
  ExportData,
} from "../variables/processor";
import type {
  ProcessedTokenWithSync,
  ProcessedCollectionWithSync,
  ExportDataWithSync,
  SyncMetadata,
} from "./types";

export class SyncMetadataManager {
  /**
   * Generate a hash for a token to detect changes
   */
  generateTokenHash(token: ProcessedToken): string {
    // Create a stable string representation of the token for hashing
    const tokenForHash = {
      $type: token.$type,
      $value: token.$value,
      $description: token.$description,
      valuesByMode: token.valuesByMode,
    };

    // Stringify with sorted keys for consistent hashing
    const sortedKeys = Object.keys(tokenForHash).sort();
    const sortedObj: any = {};
    for (const key of sortedKeys) {
      sortedObj[key] = tokenForHash[key as keyof typeof tokenForHash];
    }

    const tokenString = JSON.stringify(sortedObj);

    // Debug logging for hash generation
    // if (tokenForHash.valuesByMode) {
    //   console.log(`🔐 Generating hash for token with valuesByMode`);
    //   console.log(`  Token string to hash: ${tokenString}`);
    //   console.log(
    //     `  valuesByMode: ${JSON.stringify(tokenForHash.valuesByMode)}`
    //   );
    // }

    const hash = this.simpleHash(tokenString);

    // if (tokenForHash.valuesByMode) {
    //   console.log(`  Generated hash: ${hash}`);
    // }

    return hash;
  }

  /**
   * Add sync metadata to a token
   */
  addSyncMetadata(
    token: ProcessedToken,
    source: "local" | "remote" = "local"
  ): ProcessedTokenWithSync {
    const syncMetadata: SyncMetadata = {
      lastModified: new Date().toISOString(),
      source,
      hash: this.generateTokenHash(token),
      version: 1,
      syncId: this.generateSyncId(),
    };

    return {
      ...token,
      $syncMetadata: syncMetadata,
    };
  }

  /**
   * Add sync metadata to an entire collection
   */
  addSyncMetadataToCollection(
    collection: ProcessedCollection,
    source: "local" | "remote" = "local"
  ): ProcessedCollectionWithSync {
    const enhancedVariables: { [tokenName: string]: ProcessedTokenWithSync } =
      {};

    for (const [tokenName, token] of Object.entries(collection.variables)) {
      enhancedVariables[tokenName] = this.addSyncMetadata(token, source);
    }

    return {
      ...collection,
      variables: enhancedVariables,
    };
  }

  /**
   * Add sync metadata to export data
   */
  addSyncMetadataToExportData(
    exportData: ExportData[],
    source: "local" | "remote" = "local"
  ): ExportDataWithSync[] {
    return exportData.map((data) => {
      const enhanced: ExportDataWithSync = {};

      for (const [collectionName, collection] of Object.entries(data)) {
        enhanced[collectionName] = this.addSyncMetadataToCollection(
          collection,
          source
        );
      }

      return enhanced;
    });
  }

  /**
   * Update sync metadata for a token that has changed
   */
  updateSyncMetadata(
    token: ProcessedTokenWithSync,
    source: "local" | "remote" = "local"
  ): ProcessedTokenWithSync {
    const newHash = this.generateTokenHash(token);
    const currentMetadata = token.$syncMetadata;

    const updatedMetadata: SyncMetadata = {
      lastModified: new Date().toISOString(),
      source,
      hash: newHash,
      version: currentMetadata ? currentMetadata.version + 1 : 1,
      syncId: currentMetadata?.syncId || this.generateSyncId(),
    };

    return {
      ...token,
      $syncMetadata: updatedMetadata,
    };
  }

  /**
   * Check if a token has changed by comparing hashes
   * ALWAYS regenerates hashes from actual token data to avoid stale metadata issues
   */
  hasTokenChanged(
    localToken: ProcessedTokenWithSync,
    remoteToken: ProcessedTokenWithSync
  ): boolean {
    // CRITICAL: Always generate fresh hashes from token data, never trust stored metadata
    // Stored metadata can be stale if the token was modified outside the sync system
    const localHash = this.generateTokenHash(localToken);
    const remoteHash = this.generateTokenHash(remoteToken);

    const hasChanged = localHash !== remoteHash;

    // Debug logging for tokens with valuesByMode
    if (localToken.valuesByMode || remoteToken.valuesByMode) {
      // console.log(`\n🔍 Hash comparison for token with valuesByMode:`);
      // console.log(`  Local hash: ${localHash} (freshly generated)`);
      // console.log(`  Remote hash: ${remoteHash} (freshly generated)`);
      // console.log(`  Has changed: ${hasChanged}`);

      if (hasChanged) {
        // console.log(`  ✅ Change detected!`);
        if (localToken.valuesByMode && remoteToken.valuesByMode) {
          const localDark = localToken.valuesByMode.Dark;
          const remoteDark = remoteToken.valuesByMode.Dark;
          if (localDark !== remoteDark) {
            console.log(
              `    Dark mode differs: "${localDark}" vs "${remoteDark}"`
            );
          }
          const localLight = localToken.valuesByMode.Light;
          const remoteLight = remoteToken.valuesByMode.Light;
          if (localLight !== remoteLight) {
            console.log(
              `    Light mode differs: "${localLight}" vs "${remoteLight}"`
            );
          }
        }
      }
    }

    return hasChanged;
  }

  /**
   * Extract sync metadata from Figma variable descriptions
   * This allows storing metadata in Figma itself
   */
  extractSyncMetadataFromDescription(description: string): SyncMetadata | null {
    try {
      const syncMarker = "<!-- SYNC_METADATA:";
      const startIndex = description.indexOf(syncMarker);

      if (startIndex === -1) return null;

      const endMarker = "-->";
      const endIndex = description.indexOf(endMarker, startIndex);

      if (endIndex === -1) return null;

      const metadataJson = description.substring(
        startIndex + syncMarker.length,
        endIndex
      );

      return JSON.parse(metadataJson);
    } catch (error) {
      console.warn("Failed to extract sync metadata from description:", error);
      return null;
    }
  }

  /**
   * Embed sync metadata into a token description
   */
  embedSyncMetadataInDescription(
    description: string = "",
    metadata: SyncMetadata
  ): string {
    // Remove existing sync metadata if present
    const cleanedDescription =
      this.removeSyncMetadataFromDescription(description);

    const metadataString = `<!-- SYNC_METADATA:${JSON.stringify(metadata)}-->`;

    return cleanedDescription
      ? `${cleanedDescription}\n${metadataString}`
      : metadataString;
  }

  /**
   * Remove sync metadata from description
   */
  private removeSyncMetadataFromDescription(description: string): string {
    const syncMarker = "<!-- SYNC_METADATA:";
    const startIndex = description.indexOf(syncMarker);

    if (startIndex === -1) return description;

    const endMarker = "-->";
    const endIndex = description.indexOf(endMarker, startIndex);

    if (endIndex === -1) return description;

    return description.substring(0, startIndex).trim();
  }

  /**
   * Simple hash function for generating token hashes
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Generate a unique sync ID
   */
  private generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
