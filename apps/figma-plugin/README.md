# Token Bridge - Figma Plugin

**Synchronize design tokens between Figma Variables and a GitHub repository**

[![Tests](https://github.com/travishall/wylie-dog-ds/workflows/Figma%20Plugin%20Tests/badge.svg)](https://github.com/travishall/wylie-dog-ds/actions)
[![Version](https://img.shields.io/badge/version-0.2.0-blue)](CHANGELOG.md)

---

## Overview

Token Bridge moves design tokens between Figma Variables and token JSON files in a GitHub repository. It exports Figma variables to JSON, pushes them to GitHub (directly or as a pull request), pulls them back with conflict detection, and imports token files in several common formats.

### Key Features

- **Push and pull with GitHub** - Authenticate with a personal access token; push directly to a branch or open a pull request; pull remote changes into Figma variables
- **Conflict detection** - Compares local variables with remote files and lets you keep the Figma value, keep the GitHub value, or choose a value by hand, per token or in bulk
- **Import with format detection** - Detects W3C DTCG, Tokens Studio, Style Dictionary (flat and nested) and Wylie Dog native files, with a generic fallback, and shows a transformation summary before importing
- **Export** - Downloads one JSON file per variable collection, or pushes them to the repository
- **Safe export** - Variables the exporter cannot represent are left out and listed in a dismissible notice (see [docs/API.md](docs/API.md))
- **Two tabs** - **Tokens** (browse collections, export) and **Sync** (GitHub, import from file, pull and push)
- **Accessibility and dark mode** - Keyboard navigation and a dark theme that follows the system color scheme

---

## Quick Start

### Installation

```bash
# Install dependencies (from repo root)
pnpm install

# Navigate to plugin
cd apps/figma-plugin

# Build, then rebuild on change (reload the plugin in Figma to pick up changes)
pnpm dev
```

### Load in Figma

1. Open the Figma desktop app
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select `manifest.json` from `apps/figma-plugin/`
4. Plugin appears in **Plugins** → **Development** → **Token Bridge**

---

## Supported Token Formats

Import auto-detects the format of a file. Detection is a heuristic score per format; the adapter with the highest score is used, and a transformation summary is shown before anything is imported.

| Format                      | Import | Export | Notes                                          |
| --------------------------- | ------ | ------ | ---------------------------------------------- |
| **W3C DTCG**                | ✅     | -      | Standard nested format with `$type` / `$value` |
| **Wylie Dog native**        | ✅     | ✅     | The format of `packages/tokens/io/sync/*.json` |
| **Tokens Studio**           | ✅     | -      | Flat and grouped exports                       |
| **Style Dictionary Flat**   | ✅     | -      | Flat dot-notation keys                         |
| **Style Dictionary Nested** | ✅     | -      | Hierarchical structure                         |
| **Generic JSON**            | ✅     | -      | Fallback when nothing else matches             |

Export always writes the Wylie Dog native format: one `<collection>.json` file per selected collection (a download holds the collection object; a push to GitHub wraps it in an array, as in `packages/tokens/io/sync/*.json`). The adapters live in `src/plugin/variables/adapters/`; see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Authentication

Token Bridge authenticates with a GitHub personal access token (PAT). There is no server component; the plugin talks to the GitHub API directly.

1. Create a token at [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens). The setup screen links to a pre-scoped form.
2. Grant the classic `repo` scope, or for a fine-grained token, **Contents: Read and write**
3. Paste the token into the plugin when connecting to GitHub

You can revoke the token at any time from GitHub settings. See [Security](#security) for where it is stored.

---

## Features

### Conflict Resolution

When you pull, the plugin compares your Figma variables with the remote token files. Each difference is a conflict with a type and a severity:

- `value-change` - the same token has a different value or description
- `type-change` - the token's type differs
- `addition` / `deletion` - a token exists on only one side

For each conflict you can **Keep Local** (the Figma value) or **Take Remote** (the GitHub value). Batch buttons apply one choice to every conflict, and the list is virtualized so large conflict sets stay responsive. The detection logic is in `src/plugin/sync/`.

### Sync Modes

The repository configuration includes a sync mode:

- `direct` - commit the token files straight to the configured branch
- `pull-request` - push to a new branch and open a pull request

### Skipped Variables

Native `EASING` and `TIMING` variables, composed colors and anything that aliases them cannot be exported yet. After an export or push, a notice lists what was skipped, grouped by collection with the reason. Details are in [docs/API.md](docs/API.md).

### Dark Mode

The UI defines its colors as CSS variables in `src/ui/index.html` and switches them with `@media (prefers-color-scheme: dark)`, so it follows the operating system setting. There is no manual theme toggle.

### Other

- **Onboarding** - Guided first-run setup for new files
- **Help menu** - Links to documentation and issues, and a reset option
- **Error handling** - Errors show contextual help links based on their type
- **Loading states** - Skeletons while collections load

---

## Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - Development workflow, code style, PR guidelines
- **[Architecture](docs/ARCHITECTURE.md)** - Technical deep-dive into plugin architecture
- **[API](docs/API.md)** - Message contract between the UI and the plugin thread
- **[Testing](docs/TESTING.md)** - Test setup, writing tests, CI/CD configuration
- **[Source control providers](docs/SOURCE_CONTROL_PROVIDERS.md)** - Provider design (GitHub only today)
- **[Changelog](CHANGELOG.md)** - Version history and release notes

---

## Development

### Project Structure

```text
apps/figma-plugin/
├── src/
│   ├── plugin/           # Plugin thread (Figma API access)
│   │   ├── handlers/     # Message handlers (registry in handlers/index.ts)
│   │   ├── sync/         # Conflict detection & resolution
│   │   ├── variables/    # Export, import and format adapters
│   │   ├── github/       # GitHub client
│   │   ├── storage/      # Configuration persistence
│   │   └── main.ts       # Entry point & message routing
│   ├── ui/               # UI thread (Preact components)
│   │   ├── components/   # UI components (tabs, modals, onboarding)
│   │   ├── hooks/        # State & logic hooks
│   │   ├── state/        # Context + reducer pattern
│   │   └── App.tsx       # Main application
│   └── shared/           # Shared types & utilities
├── docs/                 # Documentation
├── dist/                 # Build output (plugin.js, UI bundled into one HTML file)
└── manifest.json         # Figma plugin manifest
```

### Scripts

```bash
# Development
pnpm dev                # Clean, build, then rebuild on change
pnpm build              # Production build (plugin and UI)
pnpm build:watch        # Rebuild on change

# Testing
pnpm test               # Single run (vitest run)
pnpm test:run           # Same as test; used by CI
pnpm test:coverage      # Coverage report (60% thresholds)
pnpm test:ui            # Interactive Vitest UI

# Quality
pnpm lint               # ESLint, zero warnings allowed
pnpm typecheck          # TypeScript validation
```

### Testing

- **Vitest** with **@testing-library/preact** and jsdom
- Coverage thresholds in `vitest.config.ts`: 60% for lines, functions, branches and statements
- CI (`.github/workflows/figma-plugin-test.yml`) runs typecheck, lint, tests and coverage, uploads coverage to Codecov and comments on pull requests

Behavior that depends on the live Figma API (variable creation, client storage, the UI inside Figma) is not covered by automated tests; see [docs/TESTING.md](docs/TESTING.md).

---

## Architecture Highlights

### Two-Thread Model

Figma plugins run in two separate JavaScript contexts.

**Plugin thread** (`src/plugin/main.ts`)

- ✅ Full Figma API access
- ✅ Token processing, validation and conflict detection
- ✅ GitHub sync preparation and token storage
- ❌ No UI rendering

**UI thread** (`src/ui/App.tsx`)

- ✅ Preact UI with hooks
- ✅ Network requests to the GitHub API
- ✅ State management (Context + Reducer)
- ❌ No direct Figma API

The two threads communicate with messages. The plugin side routes them through a handler registry (`src/plugin/handlers/index.ts`); the message contract is in [docs/API.md](docs/API.md).

### Format Adapter System

```text
JSON input → format detection → adapter → normalization → Figma variables
```

- Wylie Dog native and W3C DTCG adapters are registered at start-up; the others are imported on demand (the plugin build is a single bundle, so this does not reduce its size)
- References are resolved across collections, and collections are imported in dependency order
- A transformation log reports what the adapter changed

### Result Pattern

Fallible operations return a result object instead of throwing (`src/shared/result.ts`):

```typescript
type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E; suggestions?: string[] };
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full technical documentation.

---

## Usage

### Connect a repository

The repository settings the plugin stores for a file:

| Field        | Meaning                                                                       |
| ------------ | ----------------------------------------------------------------------------- |
| `owner`      | GitHub user or organization                                                   |
| `repo`       | Repository name                                                               |
| `branch`     | Branch to read from and push to                                               |
| `tokenPath`  | Folder in the repo that holds the token files, e.g. `packages/tokens/io/sync` |
| `tokenFiles` | Optional comma-separated file names; empty means every `.json` in the path    |
| `syncMode`   | `direct` or `pull-request`                                                    |

### Import a token file

1. Go to the **Sync** tab and choose **Import from file**
2. Select a token file; the plugin detects the format
3. Review the transformation summary
4. Confirm the import

### Export tokens

1. Go to the **Tokens** tab and select the collections to export
2. Choose **Download** for one JSON file per collection, or push to GitHub
3. Save the files in your repository (this repo keeps them in `packages/tokens/io/sync/`)

See also [documentation/guides/FIGMA-IMPORT-GUIDE.md](../../documentation/guides/FIGMA-IMPORT-GUIDE.md) for importing this repo's tokens.

---

## Security

### Authentication Security

- **Personal access tokens**: GitHub PAT authentication only
- **Token storage**: The personal access token is stored per Figma user in `figma.clientStorage` (key `github-access-token`) and is never written to the file. The file's plugin data holds only repo settings (owner, repo, branch, token path, sync mode). Collaborators therefore enter their own token once per Figma account: when someone opens a file that already has repo settings but they have no token, the Sync tab shows "Add your GitHub token" with the repository prefilled. Files saved by older versions that still hold a token in plugin data are migrated automatically the first time they are opened (token moved to your `clientStorage` if you have none, then removed from the file). Disconnecting GitHub also deletes your stored token. Revoke a token from GitHub settings if you believe it was exposed by an older file
- **Network access**: The manifest allows only `api.github.com`, `raw.githubusercontent.com` and Google Fonts domains

### Data Validation

- **Structure validation** of token files before import
- **Validation report** with errors and warnings for token structure and references

---

## Requirements

The plugin is developed and run from the Figma **desktop app** (importing a plugin from a manifest requires it). Node.js and pnpm requirements are listed in the repository root `README.md`.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development environment, code style, and pull request process.

### Quick Contribution Checklist

- [ ] Run `pnpm typecheck` (no TypeScript errors)
- [ ] Run `pnpm lint` (no ESLint warnings)
- [ ] Run `pnpm test` (all tests passing)
- [ ] Run `pnpm test:coverage` (stay above the 60% thresholds)
- [ ] Test manually in the Figma desktop app
- [ ] Update documentation if needed
- [ ] Add tests for new functionality

---

## Roadmap

GitHub is the only implemented provider, and PAT is the only authentication method. See [docs/PLAN.md](docs/PLAN.md) and [docs/SOURCE_CONTROL_PROVIDERS.md](docs/SOURCE_CONTROL_PROVIDERS.md) for what is intentionally deferred. Shipped history is in [CHANGELOG.md](CHANGELOG.md).

---

## License

See [LICENSE](../../LICENSE) in the repository root.

---

## Support

- **Documentation**: guides in the `docs/` folder
- **Issues**: [GitHub Issues](https://github.com/travishall/wylie-dog-ds/issues) for bug reports
- **Changelog**: [CHANGELOG.md](CHANGELOG.md) for version history

---

**Built with Preact, TypeScript and Vite**
