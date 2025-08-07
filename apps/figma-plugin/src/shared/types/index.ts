// Shared types for plugin communication
export interface VariableCollection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variableIds: string[];
}

export interface DesignToken {
  id: string;
  name: string;
  type: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  value: any;
  description?: string;
}

export interface PluginMessage {
  type: string;
  [key: string]: any;
}

export interface ExportOptions {
  format: 'json' | 'css' | 'js';
  colorFormat: 'hex' | 'rgb' | 'oklch';
  selectedCollections: string[];
  includeMetadata?: boolean;
  resolveAliases?: boolean;
}

export type SyncMode = 'direct' | 'pull-request';

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  tokenPath: string;
  authMethod?: 'oauth' | 'pat';
  accessToken?: string;
  syncMode: SyncMode;
}
