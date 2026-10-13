# Token Bridge Architecture

## Overview

Token Bridge is a Figma plugin that enables bi-directional synchronization of design tokens between Figma variables and GitHub repositories. It supports multiple token formats (W3C DTCG, Tokens Studio, Style Dictionary) through an adapter system and handles complex conflict resolution scenarios.

## Core Architecture

The plugin follows Figma's dual-context architecture with a clear separation of concerns:

### 1. Two-Thread Model

Figma plugins run in two separate JavaScript contexts that communicate via a message bus:

- **Plugin Thread (`src/plugin/`)**:
  - Runs in a strict sandbox with access to the Figma API (`figma.variables`, `figma.clientStorage`).
  - Handles all document operations (reading/writing variables, collections).
  - Manages file I/O and persistence.
  - **No UI access**, **limited network access**.

- **UI Thread (`src/ui/`)**:
  - Runs in an iframe with a full browser environment.
  - Renders the UI using **Preact**.
  - Handles user interactions and state management.
  - Performs network requests to GitHub (`@octokit/rest`).
  - **No direct access to Figma document**.

### 2. Message Bus Protocol

Communication happens via `postMessage`. A **handler registry** in `src/plugin/handlers/index.ts` maps each message `type` to a handler. See `API.md` for the message list.

**Protocol Flow:**

1. UI sends message: `parent.postMessage({ pluginMessage: { type: 'import-tokens', ... } }, '*')`
2. Plugin receives in `main.ts` -> `routeMessage(msg)`
3. Router dispatches to specific handler (e.g., `handleImportTokens`)
4. Handler executes logic (using `figma.*` APIs)
5. Handler responds: `figma.ui.postMessage({ type: 'tokens-imported', ... })`

**Handler Modules (`src/plugin/handlers/`):**

- `token-handlers.ts`: Import/Export/Validation logic.
- `collection-handlers.ts`: Collection CRUD operations.
- `github-handlers.ts`: Prepares data for GitHub sync (actual sync happens in UI).
- `storage-handlers.ts`: Reads and writes the GitHub config (saved in the Figma file's plugin data via `plugin/storage/file-storage.ts`), onboarding state, advanced-mode preference and last-sync time (`figma.clientStorage` via `plugin/storage/user-storage.ts`).
- `utility-handlers.ts`: Cross-cutting concerns (Demo tokens, cancellation).

### 3. State Management (UI)

The UI uses a **Context + Reducer** pattern (`src/ui/state/`) to manage state without prop drilling.

- **`UIContext`**: Provides global access to state and dispatch.
- **`uiReducer`**: Handles state transitions (e.g., switching tabs, updating selections).
- **`usePluginMessages`** (`src/ui/hooks/`): Custom hook that bridges the message bus with UI state.
- **`useGitHubSync`** (`src/ui/hooks/domain/`): Specialized hook for the GitHub sync lifecycle.

## Key Systems

### Format Adapter Pattern

To support multiple token formats without tight coupling, we use the Adapter Pattern:

- **`FormatAdapter` Interface** (`variables/format-adapter.ts`): `name`, `detect`, `normalize` and `validate`.
- **`FormatAdapterManager`**: Detects the input format and picks the matching adapter.
- **Registered at startup**: `W3CDTCGAdapter` (the recommended format) and `WylieDogNativeAdapter` (the `@wyliedog/tokens` format).
- **Loaded on demand** when detection needs them: Style Dictionary (flat and nested), Tokens Studio, and `GenericAdapter` as the fallback.

### Conflict Detection & Resolution

Bi-directional sync requires robust conflict handling:

1. **Detection**: `ConflictDetector` compares Local (Figma) and Remote (GitHub) tokens.
2. **Resolution Strategy** (`ConflictResolutionStrategy` in `sync/types.ts`):
   - `take-local`: Overwrite remote with local value.
   - `take-remote`: Overwrite local with remote value.
   - `manual`: The user chooses in the conflict UI.
   - `smart-merge` is declared in the type but nothing in `src/` implements or uses it yet.
3. **Execution**: `ConflictResolver` applies the chosen resolutions.

### GitHub Integration

- **Authentication**: Personal Access Token only (`authMethod: "pat"`). OAuth was removed; see `SOURCE_CONTROL_PROVIDERS.md`.
- **Token storage**: `FileConfigStorage` (`plugin/storage/file-storage.ts`) splits `GitHubConfig` on save. Repo settings go to the file via `figma.root.setPluginData("github-config", ...)`; `accessToken` goes to per-user `figma.clientStorage` (key `github-access-token`) and is merged back in on read, so the UI still receives the full config. Legacy files with a token in plugin data are migrated on first read (token moved to `clientStorage` if the user has none, then stripped from the file). `clear-github-config` removes both. A config loaded without this user's token (`needsGitHubToken` in `shared/github-config.ts`) leaves `githubConfigured` false, and `SyncTab` shows an "Add your GitHub token" wizard prefilled with the repo settings. Covered by `plugin/storage/__tests__/file-storage.test.ts`; not yet confirmed in a live Figma session.
- **Sync**: `GitHubClient` (`plugin/github/client.ts`, the only `@octokit/rest` consumer) is constructed and used from the UI. `ConflictAwareGitHubClient` (`plugin/sync/`) extends it with conflict detection, resolution and sync metadata.
- **Storage seam**: `plugin/storage/storage-adapter.ts` defines `StorageAdapter` (`listFiles`, `fetchFile`, `pushFiles`). `GitHubClient` has a "StorageAdapter implementation" section but does not declare `implements`.
- **Conflict Awareness**: The client fetches the latest state before pushing to detect race conditions.

## Directory Structure

```
apps/figma-plugin/
├── src/
│   ├── plugin/           # Plugin Thread
│   │   ├── handlers/     # Message Handlers (Modular)
│   │   ├── github/       # GitHubClient, project detection
│   │   ├── storage/      # StorageAdapter, file + user storage
│   │   ├── sync/         # Conflict detection, resolution, metadata
│   │   ├── variables/    # Token Format Adapters, importer
│   │   ├── utils/        # Network proxy
│   │   └── main.ts       # Entry Point
│   ├── ui/               # UI Thread
│   │   ├── components/   # Preact Components
│   │   ├── hooks/        # usePluginMessages, domain hooks
│   │   ├── state/        # Reducer & Context
│   │   ├── utils/
│   │   └── App.tsx       # UI Root
│   └── shared/           # Shared types, Result, error handling
```

## Testing Strategy

- **Unit Tests (`vitest`)**:
  - Adapters and Utilities are tested extensively in isolation.
  - Figma API is mocked (`src/__tests__/mocks/figma.ts`) to test plugin logic without the Figma environment.
- **Component Tests**: UI components tested using `@testing-library/preact`.
- **Integration Tests**: Critical flows like Format Detection are tested end-to-end within the unit test harness.
