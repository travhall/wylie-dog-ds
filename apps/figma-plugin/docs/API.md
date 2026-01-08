# Token Bridge API Reference

This document outlines the message protocol used for communication between the UI thread and the Plugin thread.

## Message Protocol

Communications are asynchronous. The UI sends a request, and the Plugin responds with one or more messages (e.g., progress updates, then final result).

### 1. Token Operations

#### Import Tokens

- **Request**: `{ type: 'import-tokens', files: [{ filename: string, content: string }] }`
- **Response**:
  - `{ type: 'loading-state', loading: true, message: 'Parsing...' }`
  - `{ type: 'tokens-imported', result: SyncResult, ... }`
  - `{ type: 'import-error', error: string }`

#### Export Tokens

- **Request**: `{ type: 'export-tokens', collectionIds: string[] }`
- **Response**:
  - `{ type: 'tokens-exported', exportData: [{ filename: string, content: string }] }`
  - `{ type: 'error', message: string }`

#### Get Local Tokens (for Conflict Detection)

- **Request**: `{ type: 'get-local-tokens' }`
- **Response**:
  - `{ type: 'local-tokens-exported', localTokens: TokenExportData }`

### 2. Collection Operations

#### Get All Collections

- **Request**: `{ type: 'get-collections' }`
- **Response**:
  - `{ type: 'collections-loaded', collections: CollectionSummary[] }`

#### Get Collection Details

- **Request**: `{ type: 'get-collection-details', collectionId: string }`
- **Response**:
  - `{ type: 'collection-details-loaded', collection: CollectionDetails }`

### 3. GitHub Operations

_Note: The Plugin thread handles data preparation, but actual network requests happen in the UI thread._

#### Sync Tokens (Push)

- **Request**: `{ type: 'github-sync-tokens', collectionIds: string[] }`
- **Response**:
  - `{ type: 'github-sync-tokens', exportData: any }` (Data prepared, UI proceeds to push)

#### Pull Tokens

- **Request**: `{ type: 'github-pull-tokens' }`
- **Response**: Returns message to UI to initiate pull.

#### Resolve Conflicts

- **Request**: `{ type: 'resolve-conflicts', resolutions: Resolution[], originalTokens: any }`
- **Response**: Forwards to UI to apply resolutions.

### 4. Configuration & Storage

#### Get/Save GitHub Config

- **Request**: `{ type: 'get-github-config' }` / `{ type: 'save-github-config', config: GitHubConfig }`
- **Response**:
  - `{ type: 'github-config-loaded', config: GitHubConfig }`
  - `{ type: 'github-config-saved', success: boolean }`

#### User Preferences

- **Request**: `{ type: 'get-advanced-mode' }`
- **Response**: `{ type: 'advanced-mode-loaded', advancedMode: boolean }`

### 5. Utility

#### Generate Demo Tokens

- **Request**: `{ type: 'generate-demo-tokens' }`
- **Response**: `{ type: 'tokens-imported', ... }`

#### Cancel Operation

- **Request**: `{ type: 'cancel-operation', operation: string }`
- **Response**: `{ type: 'operation-cancelled' }`

## Hooks API

### `usePluginMessages(githubClient)`

Primary hook for managing plugin communication.

- **Returns**: `[PluginState, PluginActions]`
- **State**: `loading`, `error`, `collections`, `conflicts`, etc.
- **Actions**: `sendMessage`, `setLoading`, `clearError`.

### `useGitHubSync(client, actions, ...)`

Manages the specific lifecycle of GitHub synchronization.

- **Methods**:
  - `handleGitHubPull()`: Initiates pull flow.
  - `handleGitHubSync()`: Initiates push flow.
  - `handleConflictResolution()`: Processes resolved conflicts.

## Format Adapter API

New adapters can be added by implementing the `FormatAdapter` interface:

```typescript
interface FormatAdapter {
  name: string;
  detect(data: any): FormatDetectionResult; // Returns confidence score
  normalize(data: any): NormalizationResult; // Converts to internal format
  validate(data: any): boolean;
}
```
