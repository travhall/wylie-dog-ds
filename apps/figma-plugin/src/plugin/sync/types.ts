// Sync-enhanced types that extend existing interfaces
import type { ProcessedToken, ProcessedCollection, ExportData } from '../variables/processor';

export interface SyncMetadata {
  lastModified: string;
  source: 'local' | 'remote';
  hash: string;
  version: number;
  syncId?: string; // Unique identifier for tracking
}

export interface ProcessedTokenWithSync extends ProcessedToken {
  $syncMetadata?: SyncMetadata;
}

export interface ProcessedCollectionWithSync extends Omit<ProcessedCollection, 'variables'> {
  variables: {
    [tokenName: string]: ProcessedTokenWithSync;
  };
}

export interface ExportDataWithSync {
  [collectionName: string]: ProcessedCollectionWithSync;
}

export interface TokenConflict {
  type: 'value-change' | 'name-conflict' | 'deletion' | 'addition' | 'type-change';
  severity: 'low' | 'medium' | 'high';
  tokenName: string;
  collectionName: string;
  localToken?: ProcessedTokenWithSync;
  remoteToken?: ProcessedTokenWithSync;
  description: string;
  autoResolvable: boolean;
  suggestedResolution: 'take-local' | 'take-remote' | 'manual';
  conflictId: string; // Unique identifier for this conflict
}

export interface ConflictResolution {
  conflictId: string;
  resolution: 'take-local' | 'take-remote' | 'manual';
  token?: ProcessedTokenWithSync;
  manualValue?: any; // For manual resolutions
}

export interface ConflictDetectionResult {
  conflicts: TokenConflict[];
  summary: {
    total: number;
    autoResolvable: number;
    requiresManualReview: number;
    highSeverity: number;
  };
  localTokenCount: number;
  remoteTokenCount: number;
}

export interface SyncResult {
  success: boolean;
  pullRequestUrl?: string;
  error?: string;
  filesUpdated?: string[];
  conflicts?: TokenConflict[];
  conflictsResolved?: number;
}

export interface PullResult {
  success: boolean;
  tokens?: ExportData[];
  error?: string;
  lastModified?: string;
  filesFound?: string[];
  conflicts?: TokenConflict[];
  requiresConflictResolution?: boolean;
}

export interface TokenEntry {
  token: ProcessedTokenWithSync;
  collection: string;
  path: string;
}

export type ConflictResolutionStrategy = 'take-local' | 'take-remote' | 'smart-merge' | 'manual';
