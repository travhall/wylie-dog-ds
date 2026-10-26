# Token Bridge - Figma Plugin

**Synchronize design tokens between Figma Variables and a GitHub repository**

[![Tests](https://github.com/travishall/wylie-dog-ds/workflows/Figma%20Plugin%20Tests/badge.svg)](https://github.com/travishall/wylie-dog-ds/actions)
[![Version](https://img.shields.io/badge/version-0.2.0-blue)](CHANGELOG.md)

---

## Overview

Token Bridge moves design tokens between Figma Variables and token JSON files in a GitHub repository. It exports Figma variables to JSON, pushes them to GitHub (directly or as a pull request), pulls them back, shows a per-token review before either one writes, and imports token files in several common formats.

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

### Reviewing a Push or Pull

Push and Pull never write anything until you have seen what they will change. Pressing either one opens a **review** (a modal), and nothing is sent or imported until you confirm it. The review is always shown; when nothing would change it says so and offers only **Close**.

- **What a row shows**: the token name grouped by collection, what happens (changed, added, removed, renamed), old to new value, a colour swatch for colours, every mode when a token has several, and notes when the type or description changed. A filter appears above 8 rows, and long lists load 100 at a time.
- **Push** (Figma to GitHub): lists what GitHub will gain, change or lose. In pull-request sync mode a banner says it opens a pull request and nothing changes on the branch until it is merged, and the button reads "Open pull request" instead of "Push to <branch>". Only changes that would lose something on GitHub block a Push: GitHub edits Figma lacks, or tokens changed on both sides to different values. Those open the per-token conflict list; one-sided Figma edits go straight to the review. With no baseline every difference still opens the conflict list. A first push to an empty path has nothing to protect and goes to the review.
- **Pull** (GitHub to Figma): lists what Figma will gain, change, lose or have overwritten. Variables that exist only in Figma are deleted by a Pull (it uses the "replace" strategy), so they appear under "Will be removed from Figma" and **Pull stays disabled until you tick the acknowledgement**. Edits you made in Figma since the last sync are marked "Overwrites your Figma edit", with a **Push first** shortcut.
- **Picker scopes** (Pull and the overview): scopes are derived from token names, not stored in the token JSON, and every import re-applies them, so a Pull can change them even when no token differs (for example after the scope rules change). The review lists them in a "Picker scopes will change" section, grouped by transition ("42 variables: all pickers → font size") with the variable list behind each group. The plugin thread reports each variable's current scopes beside the tokens (`localScopes` in the `local-tokens-exported` message, never inside the token objects), and the UI compares them, ignoring order, with what `inferScopes` gives the incoming tokens. Pull can be confirmed when there are token rows or scope rows; with neither it says "Nothing to pull". Push never lists scopes and never writes them, and the sync baseline hashes ignore them. On the Sync tab the status stays "Up to date" for tokens and adds a line "N variables' picker scopes will change on Pull", and the overview reads "Tokens match, but N variables' picker scopes differ" instead of "in sync". Scopes are the only setting the token diff cannot see: descriptions, the original type and modes already show as token changes.
- **Text styles** (Pull and the overview): linked text styles whose line height or letter spacing differs from what their tokens give are the second derived setting a Pull writes; they get a "Text styles will change" group in the same review, with styles that have no link listed read-only. Pull can be confirmed when there are token rows, scope rows or text style rows. See [Text styles follow their tokens](#text-styles-follow-their-tokens).
- **Choose per token** (Pull): opens the conflict list, where each difference can **Keep Local** (the Figma value), **Take Remote** (the GitHub value), or be set by hand, per token or in bulk. The list is virtualized. The detection logic is in `src/plugin/sync/`.
- **Changes summary**: when a pull's import finishes, a summary lists every token changed, added or removed in Figma (old and new value, per mode when several). After a per-token pull it also has a collapsed "Kept as in Figma" list.
- **Review changes** button: the status card shows one after Refresh. It opens a read-only overview that names Figma's and GitHub's value side by side, so you can look before choosing Push or Pull.
- **Mark as synced**: if Figma and GitHub already match but no sync is on record, the Pull review offers this to record the current state as the baseline without changing anything.

The review is built from the same comparison as the status card (`src/plugin/sync/sync-diff.ts`), so the numbers agree. What Push and Pull write to GitHub and Figma is unchanged; the review is a gate in front of them.

### Sync status and the sync baseline

The Sync tab tells you which side changed since the last sync, not just that the two sides differ. A plain Figma-versus-GitHub diff cannot do that: a rename in Figma looks the same as a change on GitHub, and it once showed "1 local, 3 remote" for a rename nobody had touched on GitHub.

After every successful **direct Push** or **Pull**, the plugin records a **baseline**: for each token, a hash of how Figma exported it and a hash of how GitHub held it at that moment. Refresh then compares Figma with its own recorded hash and GitHub with its own, so the two export formats are never compared with each other. Each token ends up in one state:

| Figma vs baseline | GitHub vs baseline           | Shown as                        |
| ----------------- | ---------------------------- | ------------------------------- |
| changed           | same                         | **to push** (Push sends it)     |
| same              | changed                      | **to pull** (Pull brings it in) |
| changed           | changed, to different values | **conflict**                    |
| changed           | changed, to the same value   | nothing (converged)             |
| same              | same                         | nothing                         |

- **Labels**: `N to push`, `N to pull`, `N conflicts`. Hover a label for the plain meaning.
- **Renames**: a token removed and a token added on the same side with identical content count once, as a rename ("Includes 1 renamed"). Figma re-points aliases when you rename a variable, so the aliasing tokens show up as their own changes.
- **No baseline yet** (first run, a new file, or you switched repo, branch or token path): the tab shows `N differences, direction unknown` with "Pull once to set a baseline" (or **Mark as synced** in the Pull review if nothing differs). It never guesses push or pull.
- **Pull safety**: the Pull review (see above) lists every Figma-side change a Pull would overwrite and every variable it would delete.
- **What does not move the baseline**: a push that opens a pull request (the branch is untouched), a manual file import, and a push after resolving conflicts and a pull resolved token by token (Figma may still differ from GitHub). Figma edits then keep showing as changes to push, which is the safe direction. Re-run a Push or Pull to reset it.
- **Where it lives**: in the Figma file's own plugin data, one entry per repo, branch, token path and collection (about 60 KB for a 1,000-token collection; Figma allows 100 KB per entry, and a collection that would not fit simply leaves the file without a baseline). It never goes to GitHub. A duplicated file starts with the original's baseline, which is correct at the moment of duplication.
- **Last sync is per file**: it is stored with the baseline, so two Figma files no longer share one "Last sync" time (it used to be a single `figma.clientStorage` key). Files show "Never" until their first Push or Pull after this change; the old shared value is not copied.

The logic is in `src/plugin/sync/sync-baseline.ts` (pure functions) and `src/plugin/storage/sync-state-storage.ts`.

### Sync Modes

The repository configuration includes a sync mode:

- `direct` - commit the token files straight to the configured branch
- `pull-request` - push to a new branch and open a pull request

### Skipped Variables

Native `EASING` and `TIMING` variables, composed colors and anything that aliases them cannot be exported yet. After an export or push, a notice lists what was skipped, grouped by collection with the reason. Details are in [docs/API.md](docs/API.md).

### Variable Scopes

Scopes decide which pickers (fill, text fill, stroke, font size, opacity...) list a variable. A variable left on `ALL_SCOPES` appears in every picker of its type, so every variable gets a scope. They are inferred from the token name by `src/plugin/variables/scopes.ts` and re-applied on every import, so importing or pulling updates scopes on variables that already exist.

| Token                                                                                                                                | Scopes                         |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| `color.background.*`                                                                                                                 | `FRAME_FILL`, `SHAPE_FILL`     |
| `color.foreground.*`                                                                                                                 | `TEXT_FILL`, `SHAPE_FILL`      |
| `color.border.*`                                                                                                                     | `STROKE_COLOR`                 |
| `color.focus.ring`, `color.focus.halo`                                                                                               | `STROKE_COLOR`, `EFFECT_COLOR` |
| Component, name contains `background`, `fill`, `track`, `thumb`, `indicator` or `overlay`                                            | `FRAME_FILL`, `SHAPE_FILL`     |
| Component, name contains `text`, `label`, `foreground`, `placeholder`, `link` or `icon`                                              | `TEXT_FILL`, `SHAPE_FILL`      |
| Component, name contains `border`, `ring`, `outline` or `stroke`                                                                     | `STROKE_COLOR`                 |
| Primitive colours (`color.blue.600`): bound through semantic and component variables, not directly                                   | none (hidden)                  |
| Component name without a property word (`select.trigger-open`, a bare `color`, `ring-offset`): 49 variables, ambiguous until renamed | `ALL_SCOPES`                   |

For component tokens the last name segment is read first (`background-hover`), then earlier ones.

Non-colour variables are scoped by the property word in the name, whatever their `$type` (font size, weight, line height, opacity and z-index are typed `number` on purpose, for Figma Variables compatibility):

| Name contains                                                              | Scopes                         |
| -------------------------------------------------------------------------- | ------------------------------ |
| `font-size`                                                                | `FONT_SIZE`                    |
| `font-weight`                                                              | `FONT_WEIGHT`                  |
| `tracking`, `letter-spacing`                                               | none (hidden), see below       |
| `opacity`                                                                  | `OPACITY`                      |
| `shadow.blur`, `shadow.offset`, `shadow.spread`                            | `EFFECT_FLOAT`                 |
| `radius`                                                                   | `CORNER_RADIUS`                |
| `border-width`                                                             | `STROKE_FLOAT`                 |
| size, width, height, space, gap, padding (spacing and dimension variables) | `WIDTH_HEIGHT` and/or `GAP`    |
| `line-height`                                                              | none (hidden), see below       |
| `z-index`, durations, easings, shadow value strings, `focus.*` dimensions  | none (hidden): CSS-only values |

An empty scope list (`[]`) is valid Figma: the variable still exists and aliases still resolve, but no picker lists it. The importer assigns it as is.

**Line height and letter spacing are hidden on purpose.** The line-height tokens are percentages (100, 125, 137.5) and the tracking tokens are em fractions (`-0.025em`), but Figma binds a number variable to line height or letter spacing as **pixels**: tested in the Token Bridge file, `150` gave a 150px line height and `-0.05` gave -0.05px letter spacing. Figma variables cannot carry a percent, so `LINE_HEIGHT` and `LETTER_SPACING` scopes would only let a designer pick a wrong value. The 6 primitive and 14 component line-height variables and the 6 primitive and 9 component tracking and letter-spacing variables stay in the sync (they are tokens) with an empty scope list.

In Figma both properties are **percent text-style properties generated from the tokens** (decision recorded in [figma-gateway.md](../../documentation/reference/figma-gateway.md), 2026-10-25). The component builder (`wylie-dog-figma-builder/code.js`, owner-run, not in git) writes `lineHeight` as `PERCENT` (125% stays 125%, so 14px text gets 17.5px as in CSS), leaves it `AUTO` where the real component sets no line height, and writes `letterSpacing` as `PERCENT` (em x 100, `-0.025em` becomes -2.5%) where the component has a tracking token. It binds no variable to either property, and it runs in the Token Bridge file only. To change a value, edit the token and Pull: Token Bridge keeps the styles in line with their tokens (see [Text styles follow their tokens](#text-styles-follow-their-tokens)). The builder is a one-time scaffold, not part of the token workflow.

### Text styles follow their tokens

Because a variable cannot hold a percent, a text style records which tokens drive it and Pull keeps it in line (plan 205). Decisions (owner, 2026-10-25):

1. **Link format.** Two shared plugin data keys on the style, namespace `wylie-dog`: `lineHeightToken` and `letterSpacingToken`, the value a dotted token path (`button.line-height`, `card.title.letter-spacing`). Shared plugin data is readable by any plugin. The builder writes the links on every style it creates or refreshes (and clears them where a style has no token); to make a hand-built style token-driven, add the two keys yourself.
2. **Review shape.** A "Text styles" group in the Pull review, beside the picker scopes: "Text styles will change (N)" with one line per style, for example `button/label/sm: line height 100% → 125%`. One review, one confirm.
3. **Styles with no link** are designer-owned and never modified. The review lists them read-only ("N text styles with no token link (not changed)") so you can see what is not token-driven.
4. **Font availability.** After the import the plugin loads each style's font before setting its values. A style whose font is unavailable is skipped and named in the result message ("Updated 3 text styles, skipped 1: ..."); the rest still update and the Pull still completes. A style whose linked token no longer exists (or has a unit that cannot give a percent) is listed in the review and not changed.
5. **Wording.** Mirrors the picker scopes wording: the Sync tab keeps "Up to date" for tokens and adds "N text styles' line height or letter spacing will change on Pull"; the Pull headline reads "Pull will update the line height and letter spacing of N text styles" (or adds it to the token and scope counts); the overview reads "Tokens match, but N text styles' line height or letter spacing differ".

How a value is computed (`plugin/variables/text-style-links.ts`, pure and unit-tested): the token's value is resolved through `{alias}` chains in the tokens the Pull will import, because Figma's variables still hold the old value until the import runs; line height is the token's percent (125 gives 125%); letter spacing is em times 100 (`-0.025em` gives -2.5%). A style already at that percent is not listed. The plugin thread reports every local text style and its links beside the tokens (`textStyles` in the `local-tokens-exported` message, never inside the token objects), the UI compares, and the reviewed changes travel with the `import-tokens` message (`textStyleChanges`) and are applied after a successful import. Push never lists or writes text styles, and the token JSON and baseline hashes ignore them. The advanced per-token conflict path does not update styles; the Sync tab keeps showing them as pending until the next plain Pull.

The builder (`wylie-dog-figma-builder/code.js`, owner-run, not in git) also applies each style to its text layers: the manifest sets `documentAccess: "dynamic-page"`, where the synchronous `node.textStyleId = id` setter fails, so it queues (text layer, style) pairs and applies them with `await node.setTextStyleIdAsync(id)` in one pass at the end of the run, then re-binds font size, weight, family and fill on each layer. After the first run it is not needed again: Token Bridge keeps the styles current. Rerunning it refreshes styles and links but is not part of the token workflow.

Tests build their expectations from the real sync files, so a new token family with no rule fails `scopes.test.ts` instead of silently becoming `ALL_SCOPES`. Behaviour inside Figma is checked by hand: after a pull, open the font size, font weight, line height and letter spacing pickers on a text layer and the opacity field, and confirm each lists only its own variables (line height and letter spacing list none) and that no primitive appears in a fill picker.

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
