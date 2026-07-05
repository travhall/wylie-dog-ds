// Shared types for plugin communication
import type { MergeStrategy } from "../../plugin/variables/importer";

export interface VariableCollection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variableIds: string[];
}

export interface DesignToken {
  id: string;
  name: string;
  type: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  value: unknown;
  description?: string;
}

export interface PluginMessage {
  type: string;
  files?: Array<{ filename: string; content: string }>;
  collectionIds?: string[];
  selectedCollectionIds?: string[];
  collectionId?: string;
  operation?: string;
  hasSeenOnboarding?: boolean;
  advancedMode?: boolean;
  resolutions?: unknown;
  originalTokens?: unknown;
  mergeStrategy?: MergeStrategy;
  config?: GitHubConfig;
  result?: {
    success?: boolean;
    error?: string;
    commitUrl?: string;
    noChanges?: boolean;
  };
}

export interface ExportOptions {
  format: "json" | "css" | "js";
  colorFormat: "hex" | "rgb" | "oklch";
  selectedCollections: string[];
  includeMetadata?: boolean;
  resolveAliases?: boolean;
}

export type SyncMode = "direct" | "pull-request";

export interface GitHubConfig {
  /**
   * Which source-control host this config targets. Absent = "github" (the only
   * provider today). The provider registry (plugin/providers) switches on this.
   */
  provider?: "github" | "gitlab" | "bitbucket";
  owner: string;
  repo: string;
  branch: string;
  /** Path in the repo where token files live, e.g. "tokens" or "packages/tokens/io/sync" */
  tokenPath: string;
  /**
   * Optional explicit list of token filenames, comma-separated.
   * e.g. "primitive.json, semantic.json, components.json"
   * Leave blank to auto-discover all .json files at tokenPath.
   */
  tokenFiles?: string;
  authMethod?: "pat";
  accessToken?: string;
  syncMode: SyncMode;
  isWylieDogProject?: boolean;
}

/**
 * Provider-neutral alias for GitHubConfig. New multi-provider code should use
 * this name; the shape is identical (for GitLab, `owner` = namespace/group,
 * `repo` = project). Kept as an alias so existing GitHub code keeps compiling.
 */
export type RepoConfig = GitHubConfig;

// Re-export ConflictResolution from sync types for convenience
export type { ConflictResolution } from "../../plugin/sync/types";
