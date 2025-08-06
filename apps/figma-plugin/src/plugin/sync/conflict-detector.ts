// Conflict detection system for identifying sync conflicts
import type { ExportData } from '../variables/processor';
import type { 
  TokenConflict, 
  ConflictDetectionResult, 
  ProcessedTokenWithSync,
  ExportDataWithSync,
  TokenEntry
} from './types';
import { SyncMetadataManager } from './metadata-manager';

export class ConflictDetector {
  private metadataManager = new SyncMetadataManager();

  /**
   * Main conflict detection entry point
   */
  detectConflicts(
    localTokens: ExportData[],
    remoteTokens: ExportData[]
  ): ConflictDetectionResult {
    console.log('🔍 Starting conflict detection...');
    
    // Convert to sync-aware format
    const localWithSync = this.metadataManager.addSyncMetadataToExportData(localTokens, 'local');
    const remoteWithSync = this.metadataManager.addSyncMetadataToExportData(remoteTokens, 'remote');
    
    // Create lookup maps for efficient comparison
    const localMap = this.createTokenMap(localWithSync);
    const remoteMap = this.createTokenMap(remoteWithSync);
    
    const conflicts: TokenConflict[] = [];
    
    // Detect changes in existing tokens
    for (const [tokenPath, localEntry] of localMap) {
      const remoteEntry = remoteMap.get(tokenPath);
      
      if (remoteEntry) {
        const conflict = this.compareTokens(tokenPath, localEntry, remoteEntry);
        if (conflict) conflicts.push(conflict);
      } else {
        // Token deleted remotely
        conflicts.push(this.createDeletionConflict(tokenPath, localEntry));
      }
    }
    
    // Detect new remote tokens
    for (const [tokenPath, remoteEntry] of remoteMap) {
      if (!localMap.has(tokenPath)) {
        conflicts.push(this.createAdditionConflict(tokenPath, remoteEntry));
      }
    }
    
    const summary = this.generateConflictSummary(conflicts);
    
    console.log(`🔍 Conflict detection complete: ${conflicts.length} conflicts found`);
    console.log(`   Auto-resolvable: ${summary.autoResolvable}, Manual: ${summary.requiresManualReview}`);
    
    return {
      conflicts,
      summary,
      localTokenCount: localMap.size,
      remoteTokenCount: remoteMap.size
    };
  }

  /**
   * Create a map of token paths to token entries for efficient lookup
   */
  private createTokenMap(exportData: ExportDataWithSync[]): Map<string, TokenEntry> {
    const tokenMap = new Map<string, TokenEntry>();
    
    for (const data of exportData) {
      for (const [collectionName, collection] of Object.entries(data)) {
        for (const [tokenName, token] of Object.entries(collection.variables)) {
          const tokenPath = `${collectionName}.${tokenName}`;
          tokenMap.set(tokenPath, {
            token,
            collection: collectionName,
            path: tokenPath
          });
        }
      }
    }
    
    return tokenMap;
  }

  /**
   * Compare two tokens and detect conflicts
   */
  private compareTokens(
    tokenPath: string,
    localEntry: TokenEntry,
    remoteEntry: TokenEntry
  ): TokenConflict | null {
    const { token: localToken } = localEntry;
    const { token: remoteToken } = remoteEntry;
    
    // Quick hash comparison first
    if (!this.metadataManager.hasTokenChanged(localToken, remoteToken)) {
      return null; // No conflict
    }
    
    // Detect specific type of conflict
    if (localToken.$type !== remoteToken.$type) {
      return this.createTypeChangeConflict(tokenPath, localEntry, remoteEntry);
    }
    
    if (this.isValueDifferent(localToken.$value, remoteToken.$value)) {
      return this.createValueChangeConflict(tokenPath, localEntry, remoteEntry);
    }
    
    // Check valuesByMode if present
    if (localToken.valuesByMode || remoteToken.valuesByMode) {
      if (this.hasModeValueConflicts(localToken, remoteToken)) {
        return this.createValueChangeConflict(tokenPath, localEntry, remoteEntry);
      }
    }
    
    return null;
  }

  /**
   * Create a value change conflict
   */
  private createValueChangeConflict(
    tokenPath: string,
    localEntry: TokenEntry,
    remoteEntry: TokenEntry
  ): TokenConflict {
    const localValue = this.getDisplayValue(localEntry.token);
    const remoteValue = this.getDisplayValue(remoteEntry.token);
    
    return {
      type: 'value-change',
      severity: this.assessSeverity(localEntry.token, remoteEntry.token),
      tokenName: tokenPath,
      collectionName: localEntry.collection,
      localToken: localEntry.token,
      remoteToken: remoteEntry.token,
      description: `Value changed: "${localValue}" → "${remoteValue}"`,
      autoResolvable: this.isAutoResolvable(localEntry.token, remoteEntry.token),
      suggestedResolution: this.suggestResolution(localEntry.token, remoteEntry.token),
      conflictId: this.generateConflictId(tokenPath, 'value-change')
    };
  }

  /**
   * Create a type change conflict
   */
  private createTypeChangeConflict(
    tokenPath: string,
    localEntry: TokenEntry,
    remoteEntry: TokenEntry
  ): TokenConflict {
    return {
      type: 'type-change',
      severity: 'high',
      tokenName: tokenPath,
      collectionName: localEntry.collection,
      localToken: localEntry.token,
      remoteToken: remoteEntry.token,
      description: `Type changed: ${localEntry.token.$type} → ${remoteEntry.token.$type}`,
      autoResolvable: false,
      suggestedResolution: 'manual',
      conflictId: this.generateConflictId(tokenPath, 'type-change')
    };
  }

  /**
   * Create a deletion conflict
   */
  private createDeletionConflict(tokenPath: string, localEntry: TokenEntry): TokenConflict {
    return {
      type: 'deletion',
      severity: 'medium',
      tokenName: tokenPath,
      collectionName: localEntry.collection,
      localToken: localEntry.token,
      description: `Token "${tokenPath}" exists locally but was deleted remotely`,
      autoResolvable: false,
      suggestedResolution: 'manual',
      conflictId: this.generateConflictId(tokenPath, 'deletion')
    };
  }

  /**
   * Create an addition conflict
   */
  private createAdditionConflict(tokenPath: string, remoteEntry: TokenEntry): TokenConflict {
    return {
      type: 'addition',
      severity: 'low',
      tokenName: tokenPath,
      collectionName: remoteEntry.collection,
      remoteToken: remoteEntry.token,
      description: `New token "${tokenPath}" added remotely`,
      autoResolvable: true,
      suggestedResolution: 'take-remote',
      conflictId: this.generateConflictId(tokenPath, 'addition')
    };
  }

  /**
   * Check if two values are different
   */
  private isValueDifferent(localValue: any, remoteValue: any): boolean {
    // Handle simple value comparison
    if (typeof localValue !== 'object' && typeof remoteValue !== 'object') {
      return localValue !== remoteValue;
    }
    
    // Handle object comparison (like color objects)
    return JSON.stringify(localValue) !== JSON.stringify(remoteValue);
  }

  /**
   * Check for conflicts in valuesByMode
   */
  private hasModeValueConflicts(
    localToken: ProcessedTokenWithSync,
    remoteToken: ProcessedTokenWithSync
  ): boolean {
    const localModes = localToken.valuesByMode || {};
    const remoteModes = remoteToken.valuesByMode || {};
    
    // Get all unique mode names
    const allModes = new Set([
      ...Object.keys(localModes),
      ...Object.keys(remoteModes)
    ]);
    
    for (const mode of allModes) {
      const localValue = localModes[mode];
      const remoteValue = remoteModes[mode];
      
      if (localValue !== undefined && remoteValue !== undefined) {
        if (this.isValueDifferent(localValue, remoteValue)) {
          return true;
        }
      } else if (localValue !== remoteValue) {
        // One has the mode, the other doesn't
        return true;
      }
    }
    
    return false;
  }

  /**
   * Assess the severity of a conflict
   */
  private assessSeverity(
    localToken: ProcessedTokenWithSync,
    remoteToken: ProcessedTokenWithSync
  ): 'low' | 'medium' | 'high' {
    // Type changes are always high severity
    if (localToken.$type !== remoteToken.$type) {
      return 'high';
    }
    
    // Color changes are medium severity
    if (localToken.$type === 'color') {
      return 'medium';
    }
    
    // Spacing and sizing changes are medium severity
    if (['spacing', 'sizing', 'dimension'].includes(localToken.$type)) {
      return 'medium';
    }
    
    // Everything else is low severity
    return 'low';
  }

  /**
   * Determine if a conflict is auto-resolvable
   */
  private isAutoResolvable(
    localToken: ProcessedTokenWithSync,
    remoteToken: ProcessedTokenWithSync
  ): boolean {
    // Type changes require manual resolution
    if (localToken.$type !== remoteToken.$type) {
      return false;
    }
    
    // Simple value changes can be auto-resolved
    if (typeof localToken.$value !== 'object' && typeof remoteToken.$value !== 'object') {
      return true;
    }
    
    // Complex changes need manual review
    return false;
  }

  /**
   * Suggest a resolution strategy
   */
  private suggestResolution(
    localToken: ProcessedTokenWithSync,
    remoteToken: ProcessedTokenWithSync
  ): 'take-local' | 'take-remote' | 'manual' {
    // If not auto-resolvable, require manual resolution
    if (!this.isAutoResolvable(localToken, remoteToken)) {
      return 'manual';
    }
    
    // Prefer newer changes based on lastModified
    const localModified = localToken.$syncMetadata?.lastModified;
    const remoteModified = remoteToken.$syncMetadata?.lastModified;
    
    if (localModified && remoteModified) {
      return new Date(localModified) > new Date(remoteModified) 
        ? 'take-local' 
        : 'take-remote';
    }
    
    // Default to remote if we can't determine timing
    return 'take-remote';
  }

  /**
   * Get display value for conflict description
   */
  private getDisplayValue(token: ProcessedTokenWithSync): string {
    if (token.valuesByMode && Object.keys(token.valuesByMode).length > 0) {
      const modes = Object.keys(token.valuesByMode);
      return `${modes.length} mode values`;
    }
    
    if (typeof token.$value === 'object') {
      return JSON.stringify(token.$value);
    }
    
    return String(token.$value);
  }

  /**
   * Generate conflict summary statistics
   */
  private generateConflictSummary(conflicts: TokenConflict[]) {
    return {
      total: conflicts.length,
      autoResolvable: conflicts.filter(c => c.autoResolvable).length,
      requiresManualReview: conflicts.filter(c => !c.autoResolvable).length,
      highSeverity: conflicts.filter(c => c.severity === 'high').length
    };
  }

  /**
   * Generate unique conflict ID
   */
  private generateConflictId(tokenPath: string, type: string): string {
    return `conflict_${type}_${tokenPath}_${Date.now()}`;
  }
}
