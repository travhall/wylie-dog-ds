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
  - Performs network requests (GitHub API via `fetch`).
  - **No direct access to Figma document**.

### 2. Message Bus Protocol (New)

Communication happens via `postMessage`. We've implemented a **Handler Registry Pattern** to manage complexity.

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
- `storage-handlers.ts`: Manages configuration and user preferences.
- `utility-handlers.ts`: Cross-cutting concerns (Demo tokens, cancellation).

### 3. State Management (UI)

The UI uses a **Context + Reducer** pattern to manage state effectively without prop drilling.

- **`UIContext`**: Provides global access to state and dispatch.
- **`uiReducer`**: Handles state transitions (e.g., switching tabs, updating selections).
- **`usePluginMessages`**: Custom hook that bridges the message bus with React state.
- **`useGitHubSync`**: Specialized hook for managing the complex GitHub sync lifecycle.

## Key Systems

### Format Adapter Pattern

To support multiple token formats without tight coupling, we use the Adapter Pattern:

- **`FormatAdapter` Interface**: Defines `detect`, `parse`, and `stringify` methods.
- **`FormatAdapterManager`**: Orchestrates detection and selects the best adapter based on confidence scores.
- **Implemented Adapters**:
  - `W3CDTCGAdapter`: Standard W3C format.
  - `TokensStudioAdapter`: Tokens Studio (Figma Tokens) format.
  - `StyleDictionaryAdapter`: Standard Style Dictionary format.

### Conflict Detection & Resolution

Bi-directional sync requires robust conflict handling:

1. **Detection**: `ConflictDetector` compares Local (Figma) and Remote (GitHub) tokens.
2. **Resolution Strategy**:
   - `take-local`: Overwrite remote with local value.
   - `take-remote`: Overwrite local with remote value.
   - `merge`: Combine properties (where applicable).
3. **Execution**: Resolutions are applied batched to ensure atomicity.

### GitHub Integration

- **Authentication**: Personal Access Tokens (stored securely in `figma.clientStorage`).
- **Sync**: Uses `@octokit/rest` in the UI thread.
- **Conflict Awareness**: The client fetches the latest state before pushing to detect race conditions.

## Directory Structure

```
apps/figma-plugin/
├── src/
│   ├── plugin/           # Plugin Thread
│   │   ├── handlers/     # Message Handlers (Modular)
│   │   ├── sync/         # Conflict Detection Logic
│   │   ├── variables/    # Token Format Adapters
│   │   └── main.ts       # Entry Point
│   ├── ui/               # UI Thread
│   │   ├── components/   # Preact Components
│   │   ├── hooks/        # State & Logic Hooks
│   │   ├── state/        # Reducer & Context
│   │   └── App.tsx       # UI Root
│   └── shared/           # Shared Types & Constants
```

## Testing Strategy

- **Unit Tests (`vitest`)**:
  - Adapters and Utilities are tested extensively in isolation.
  - Figma API is mocked (`src/__tests__/mocks/figma.ts`) to test plugin logic without the Figma environment.
- **Component Tests**: UI components tested using `@testing-library/preact`.
- **Integration Tests**: Critical flows like Format Detection are tested end-to-end within the unit test harness.
