# Token Bridge - Figma Plugin

**Bi-directional design token synchronization between Figma and code repositories**

[![Tests](https://github.com/travishall/wylie-dog-ds/workflows/Figma%20Plugin%20Tests/badge.svg)](https://github.com/travishall/wylie-dog-ds/actions)

---

## Overview

Token Bridge is a Figma plugin that enables seamless synchronization of design tokens between Figma Variables and code repositories. Import tokens from JSON files or GitHub, export to multiple formats, and sync with automatic conflict detection.

### Key Features

- **🔄 Bi-directional Sync** - Keep Figma and code in sync with conflict detection
- **📦 Multiple Formats** - Import/export W3C DTCG, Style Dictionary, Tokens Studio, and more
- **🌙 Dark Mode** - Automatic theme detection with CSS variables
- **⚡ Smart Import** - Confidence-based format detection and auto-transformation
- **🎯 Tab Navigation** - Organized UI: Tokens | Import | Export | Sync
- **✅ Testing** - Comprehensive test coverage with Vitest + Testing Library

---

## Quick Start

### Installation

```bash
# Install dependencies (from repo root)
pnpm install

# Navigate to plugin
cd apps/figma-plugin

# Start development
pnpm dev
```

### Load in Figma

1. Open Figma Desktop App
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select `manifest.json` from `apps/figma-plugin/`
4. Plugin appears in **Plugins** → **Development** → **Token Bridge**

---

## Supported Token Formats

| Format                      | Import | Export | Description                 |
| --------------------------- | ------ | ------ | --------------------------- |
| **W3C DTCG**                | ✅     | ✅     | Standards-compliant format  |
| **Tokens Studio**           | ✅     | ✅     | Popular Figma plugin export |
| **Material Design**         | ✅     | ✅     | Google Material tokens      |
| **Style Dictionary Flat**   | ✅     | ✅     | Amazon Style Dictionary     |
| **Style Dictionary Nested** | ✅     | ✅     | Hierarchical structure      |
| **Wylie Dog Native**        | ✅     | ✅     | Native plugin format        |
| **CSS Variables**           | ✅     | ✅     | CSS custom properties       |
| **Generic JSON**            | ✅     | ❌     | Fallback for unknown format |

---

## Features

### Intelligent Format Detection

Automatically detects token format using confidence-based matching:

```typescript
// Try all adapters, pick best match
const results = await Promise.all([
  W3CDTCGAdapter.tryParse(json), // 95% confidence
  StyleDictionaryAdapter.tryParse(json), // 40% confidence
  TokensStudioAdapter.tryParse(json), // 20% confidence
]);

// Use highest confidence (W3C DTCG in this case)
```

### GitHub Sync with Conflict Detection

Three-way merge with manual conflict resolution:

```
Local Tokens (Figma) ─┐
                      ├─→ Conflict Detector ─→ Resolution UI
Remote Tokens (GitHub)─┘
```

**Sync Modes:**

- **Direct**: Push/pull directly to branch
- **Pull Request**: Create PR for team review (recommended)

### Dark Mode Support

Automatic theme detection using Figma's CSS variables:

```css
:root {
  --text-primary: light-dark(#111827, #e5e7eb);
  --surface-primary: light-dark(#ffffff, #1e1e1e);
  /* 100+ design tokens */
}
```

### Tab-Based Navigation

Clean mental model with progressive disclosure:

```
┌─────────────────────────────────┐
│ Token Bridge      [☀️] [⚙️]     │
├─────────────────────────────────┤
│ [Tokens] [Import] [Export] [Sync]
├─────────────────────────────────┤
│ (Active tab content)            │
└─────────────────────────────────┘
```

---

## Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - Development workflow, code style, PR guidelines
- **[Architecture](docs/ARCHITECTURE.md)** - Technical deep-dive into plugin architecture
- **[Testing](docs/TESTING.md)** - Test setup, writing tests, CI/CD
- **[Plan](docs/PLAN.md)** - UX enhancement roadmap and implementation plan
- **[Status](docs/STATUS.md)** - Current progress and next steps
- **[GitHub Config](docs/GITHUB_CONFIG.md)** - How GitHub configuration works

---

## Development

### Project Structure

```
apps/figma-plugin/
├── src/
│   ├── plugin/           # Plugin thread (Figma API access)
│   │   ├── main.ts       # Entry point
│   │   ├── github/       # GitHub sync logic
│   │   ├── sync/         # Conflict detection
│   │   └── variables/    # Token processing
│   ├── ui/               # UI thread (Preact components)
│   │   ├── App.tsx       # Main application
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Helper functions
│   └── shared/           # Shared types & utilities
├── docs/                 # Documentation
├── dist/                 # Build output
└── manifest.json         # Figma plugin manifest
```

### NPM Scripts

```bash
# Development
pnpm dev                # Watch mode (rebuilds on change)
pnpm build              # Production build

# Testing
pnpm test               # Run tests (watch mode)
pnpm test:run           # Single run (CI)
pnpm test:coverage      # With coverage report
pnpm test:ui            # Interactive test UI

# Quality
pnpm lint               # ESLint
pnpm type-check         # TypeScript
```

### Testing

Comprehensive test coverage with Vitest + Testing Library:

```typescript
// Unit test example
describe("parseGitHubUrl", () => {
  it("should parse standard GitHub URLs", () => {
    expect(parseGitHubUrl("https://github.com/user/repo"))
      .toEqual({ owner: "user", repo: "repo" });
  });
});

// Component test example
describe("TabBar", () => {
  it("should switch tabs on click", () => {
    const onChange = vi.fn();
    render(<TabBar activeTab="tokens" onTabChange={onChange} />);

    fireEvent.click(screen.getByRole("tab", { name: /import/i }));

    expect(onChange).toHaveBeenCalledWith("import");
  });
});
```

See [docs/TESTING.md](docs/TESTING.md) for full testing guide.

---

## Architecture Highlights

### Two-Thread Model

Figma plugins run in two separate JavaScript contexts:

**Plugin Thread** (`src/plugin/main.ts`)

- ✅ Figma API access
- ✅ Token processing
- ✅ GitHub sync
- ❌ No UI rendering

**UI Thread** (`src/ui/App.tsx`)

- ✅ Preact UI
- ✅ User interactions
- ❌ No Figma API

**Communication:** Message bus via `postMessage` (40+ message types)

### Format Adapter System

Confidence-based detection with 7+ supported formats:

```
JSON Input → Adapter → Normalized Format → Processor → Figma Variables
```

Each adapter returns a confidence score (0-1). Highest score wins.

### Result<T> Pattern

Type-safe error handling without exceptions:

```typescript
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

// Usage
const result = await importTokens(file);
if (!result.success) {
  showError(result.error);
  return;
}
processTokens(result.value);
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete technical documentation.

---

## Usage Examples

### Import Tokens Studio Format

```json
{
  "Core": {
    "color.primary.500": {
      "value": "#3b82f6",
      "type": "color"
    }
  },
  "Semantic": {
    "color.accent": {
      "value": "{Core.color.primary.500}",
      "type": "color"
    }
  }
}
```

**Steps:**

1. Click **Import** tab
2. Select **Import File** option
3. Choose `tokens-studio-export.json`
4. Plugin auto-detects format
5. Review transformation feedback
6. Import to Figma Variables

### Sync with GitHub

```typescript
// Quick setup (simplified UI)
{
  repoUrl: "https://github.com/user/repo",
  accessToken: "ghp_xxxxxxxxxxxxx"
  // Auto: branch=main, tokenPath=tokens/, syncMode=direct
}

// Advanced setup (full control)
{
  owner: "user",
  repo: "repo",
  branch: "develop",
  tokenPath: "design-system/tokens",
  accessToken: "ghp_xxxxxxxxxxxxx",
  syncMode: "pull-request" // Creates PR instead of direct push
}
```

**Steps:**

1. Click **Sync** tab
2. Choose **Setup GitHub**
3. Enter repository URL and token
4. Click **Sync Now**
5. Resolve any conflicts (if detected)
6. Confirm merge

### Export to W3C DTCG Format

**Steps:**

1. Click **Export** tab
2. Select collections to export
3. Choose **W3C DTCG** format
4. Click **Download**
5. Save `tokens.json` to your codebase

**Output:**

```json
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": "#3b82f6"
    }
  }
}
```

---

## Performance

- **Bundle Size**: 234 KB (UI) + 150 KB (plugin) = ~384 KB total
- **Load Time**: <2 seconds (plugin launch to interactive)
- **Import Speed**: ~1 second for 500+ tokens
- **Chunked Processing**: Large datasets with progress feedback

---

## Security

### GitHub Tokens

- Stored in `figma.clientStorage` (encrypted by Figma)
- User-scoped (not shared across team members)
- Transmitted over HTTPS only
- Minimum permissions recommended (repo scope)

### Validation

- Token structure validation before import
- Reference resolution with circular dependency detection
- Type inference with fallbacks
- Comprehensive error reporting

---

## Browser Compatibility

**Figma Desktop App** (Required)

- macOS 10.15+
- Windows 10+

**Figma Web** (Not Supported)

- Plugins require desktop app for full functionality

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

### Quick Contribution Checklist

- [ ] Run `pnpm type-check` (no errors)
- [ ] Run `pnpm lint` (no warnings)
- [ ] Run `pnpm test:run` (all passing)
- [ ] Test manually in Figma
- [ ] Update docs if needed
- [ ] Add tests for new code

---

## Roadmap

### Completed ✅

- ✅ Tab-based navigation
- ✅ Dark mode support
- ✅ CSS variable system
- ✅ Automated testing
- ✅ Multi-format import/export
- ✅ GitHub sync with conflict detection
- ✅ Quick GitHub setup wizard

### In Progress 🚧

- 🚧 State management refactor (reduce App.tsx complexity)
- 🚧 Enhanced help system
- 🚧 Accessibility improvements

### Planned 📋

- **Multiple Sync Providers**: GitLab, Bitbucket, Azure DevOps, Generic URL
- **OAuth GitHub**: One-click authentication
- **Enhanced Conflict Resolution**: Smarter merge strategies
- **Token Versioning**: Change history and rollback

---

## License

See [LICENSE](../../LICENSE) file in repository root.

---

## Questions?

- **Documentation**: Check `docs/` folder
- **Issues**: [GitHub Issues](https://github.com/travishall/wylie-dog-ds/issues)
- **Discussions**: [GitHub Discussions](https://github.com/travishall/wylie-dog-ds/discussions)

---

**Built with ❤️ using Preact, TypeScript, and Vite**
