# Token Bridge Architecture

**Version**: 1.0
**Last Updated**: December 26, 2025

---

## Overview

Token Bridge is a Figma plugin that enables bi-directional synchronization of design tokens between Figma Variables and code repositories (currently GitHub, with more providers planned).

### Core Capabilities

- **Import** tokens from JSON files or GitHub into Figma Variables
- **Export** Figma Variables to multiple token formats (W3C DTCG, Style Dictionary, Tokens Studio, etc.)
- **Sync** with GitHub repositories with conflict detection and resolution
- **Transform** between 7+ token formats with confidence-based auto-detection

---

## High-Level Architecture

### Two-Thread Model

Figma plugins run in a sandboxed two-thread architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Figma Desktop App                    │
├──────────────────────────┬──────────────────────────────┤
│     Plugin Thread        │        UI Thread             │
│   (src/plugin/main.ts)   │    (src/ui/App.tsx)          │
│                          │                              │
│  ✅ Figma API access     │  ❌ No Figma API access      │
│  ✅ File operations      │  ✅ Preact UI rendering      │
│  ✅ Network calls        │  ✅ User interactions        │
│  ❌ No UI rendering      │  ❌ No Figma API             │
│                          │                              │
│  • Process tokens        │  • Display UI                │
│  • GitHub sync           │  • Handle clicks             │
│  • Conflict detection    │  • Show feedback             │
│  • Format transformation │  • Collect user input        │
└──────────────────────────┴──────────────────────────────┘
              ↕                        ↕
         postMessage bus (40+ message types)
```

**Key Constraint:** Threads communicate **only** via `postMessage` - no shared memory.

---

## Directory Structure

```
apps/figma-plugin/
├── src/
│   ├── plugin/                    # Plugin Thread
│   │   ├── main.ts                # Entry point, message router
│   │   ├── github/
│   │   │   └── client.ts          # GitHub API wrapper
│   │   ├── sync/
│   │   │   ├── conflict-aware-github-client.ts
│   │   │   ├── conflict-detector.ts
│   │   │   ├── conflict-resolver.ts
│   │   │   ├── metadata-manager.ts
│   │   │   └── types.ts
│   │   └── variables/
│   │       ├── processor.ts       # Token → Figma Variable conversion
│   │       ├── format-adapter-manager.ts
│   │       └── adapters/          # 7 format adapters
│   │           ├── w3c-dtcg.ts
│   │           ├── style-dictionary.ts
│   │           ├── tokens-studio.ts
│   │           └── ...
│   ├── ui/                        # UI Thread
│   │   ├── App.tsx                # Main application (~1,500 lines)
│   │   ├── index.html             # Entry point + inline CSS
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── TabBar.tsx     # Main navigation
│   │   │   ├── tabs/
│   │   │   │   ├── TokensTab.tsx
│   │   │   │   ├── ImportTab.tsx
│   │   │   │   ├── ExportTab.tsx
│   │   │   │   └── SyncTab.tsx
│   │   │   ├── GitHubConfig.tsx
│   │   │   ├── QuickGitHubSetup.tsx
│   │   │   ├── ConflictResolutionDisplay.tsx
│   │   │   ├── ValidationDisplay.tsx
│   │   │   ├── ProgressFeedback.tsx
│   │   │   ├── EnhancedErrorDisplay.tsx
│   │   │   ├── SetupWizard.tsx
│   │   │   ├── FirstRunOnboarding.tsx
│   │   │   └── ContextualHelp.tsx
│   │   ├── hooks/                 # (To be created in Phase 3)
│   │   │   ├── usePluginMessages.ts
│   │   │   ├── useUIState.ts
│   │   │   └── useTheme.ts
│   │   └── utils/
│   │       └── parseGitHubUrl.ts
│   └── shared/                    # Shared between threads
│       ├── types/
│       │   └── index.ts           # TypeScript interfaces
│       ├── error-handler.ts       # Error classification
│       ├── result.ts              # Result<T, E> pattern
│       └── result-handler.ts      # Result helpers
├── manifest.json                  # Figma plugin metadata
├── vite.config.ts                 # Build configuration
├── vitest.config.ts               # Test configuration
└── package.json
```

---

## Core Systems

### 1. Message Bus

**40+ message types** enable communication between threads:

```typescript
// Message flow example: Import tokens
┌─────────────┐                    ┌──────────────┐
│  UI Thread  │                    │ Plugin Thread│
└─────────────┘                    └──────────────┘
      │                                    │
      │  1. postMessage({                 │
      │     type: "import-tokens",        │
      │     file: {...}                   │
      │  })                                │
      ├───────────────────────────────────>│
      │                                    │ 2. Validate format
      │                                    │ 3. Transform tokens
      │                                    │ 4. Create Figma Variables
      │                                    │
      │  5. postMessage({                 │
      │     type: "import-complete",      │
      │     collections: [...]            │
      │  })                                │
      │<───────────────────────────────────┤
      │                                    │
   6. Update UI
```

**Key Message Types:**

**Collections & Variables:**

- `load-collections` / `collections-loaded`
- `load-collection-detail` / `collection-detail-loaded`
- `select-collection` / `deselect-collection`

**Import:**

- `import-tokens` / `import-complete`
- `import-existing-variables` / `existing-import-complete`

**Export:**

- `export-selected` / `export-complete`
- `download-file`

**GitHub Sync:**

- `setup-github` / `github-configured`
- `github-pull` / `pull-complete`
- `github-push` / `push-complete`
- `sync-with-github` / `sync-complete`

**Validation:**

- `validate-tokens` / `validation-complete`

**Conflicts:**

- `resolve-conflicts` / `conflicts-resolved`

**Errors:**

- `error` (with `PluginError` payload)

---

### 2. State Management

**Current Pattern (App.tsx):**

```typescript
// 20+ useState calls in App.tsx
const [collections, setCollections] = useState<Collection[]>([]);
const [selectedCollections, setSelectedCollections] = useState<Set<string>>(
  new Set()
);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<PluginError | null>(null);
// ... 16 more state variables
```

**Planned Pattern (Phase 3):**

```typescript
// UI State - Reducer pattern
interface UIState {
  currentTab: TabId;
  selectedCollectionIds: Set<string>;
  showModal: string | null;
  loading: boolean;
}

const [state, dispatch] = useReducer(uiReducer, initialState);

// Plugin Communication State - Custom hook
const { collections, error, sendMessage } = usePluginMessages();
```

---

### 3. Format Adapter System

**Confidence-Based Auto-Detection:**

When importing tokens, the system tries all 7 adapters and ranks by confidence:

```typescript
// Simplified adapter flow
const results = await Promise.all([
  W3CDTCGAdapter.tryParse(json), // Confidence: 0.95
  StyleDictionaryAdapter.tryParse(json), // Confidence: 0.40
  TokensStudioAdapter.tryParse(json), // Confidence: 0.20
  // ... 4 more adapters
]);

// Use highest confidence adapter
const bestMatch = results.sort((a, b) => b.confidence - a.confidence)[0];
if (bestMatch.confidence > 0.7) {
  return bestMatch.tokens;
}
```

**Supported Formats:**

1. **W3C DTCG** - Design Tokens Community Group standard
2. **Style Dictionary** - Amazon's token format
3. **Tokens Studio** - Popular Figma plugin format
4. **Generic JSON** - Flat key-value pairs
5. **Nested JSON** - Hierarchical structure
6. **Figma Variables** - Native format
7. **Legacy Formats** - Backwards compatibility

**Format Transformation:**

```
JSON Input → Adapter → Normalized Format → Processor → Figma Variables
                                                             ↓
                                                      Store in Document
```

---

### 4. Conflict Detection & Resolution

**Three-Way Merge:**

```
Local Tokens (Figma) ─┐
                      ├─→ Conflict Detector ─→ Conflicts[]
Remote Tokens (GitHub)─┘

Conflict Types:
- value-change: Token value modified in both places
- addition: Token added in both places with different values
- deletion: Token deleted in one place, modified in other
- name-conflict: Different tokens with same name
```

**Conflict Resolution UI:**

```
┌─────────────────────────────────────┐
│ Sync Conflicts Detected (3)        │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ color.primary                   │ │
│ │ Local: #FF0000                  │ │
│ │ Remote: #00FF00                 │ │
│ │ [Keep Local] [Take Remote]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Resolve All: Local] [Resolve All: Remote]
│ [Cancel] [Apply Resolutions (3)]   │
└─────────────────────────────────────┘
```

**Resolution Strategies:**

- **take-local**: Keep Figma version
- **take-remote**: Accept GitHub version
- **manual**: User chooses per-conflict

---

### 5. Error Handling

**Result<T, E> Pattern:**

```typescript
// Avoid throwing exceptions, use Result type
type Result<T, E = PluginError> =
  | { success: true; value: T }
  | { success: false; error: E };

// Usage
const result = await importTokens(file);
if (!result.success) {
  displayError(result.error);
  return;
}
processTokens(result.value);
```

**Error Classification:**

```typescript
enum ErrorType {
  VALIDATION = "validation", // Token format errors
  NETWORK = "network", // GitHub API failures
  GITHUB = "github", // Repository access errors
  PERMISSION = "permission", // Auth errors
  FIGMA_API = "figma-api", // Figma plugin API errors
  CONFLICT = "conflict", // Sync conflicts
  UNKNOWN = "unknown",
}

interface PluginError {
  type: ErrorType;
  message: string;
  details?: string;
  recoverable: boolean;
  timestamp: number;
}
```

**Error Display Hierarchy:**

1. **Validation errors** → ValidationDisplay component
2. **Conflicts** → ConflictResolutionDisplay component
3. **Recoverable errors** → EnhancedErrorDisplay with retry
4. **Fatal errors** → EnhancedErrorDisplay with close action

---

### 6. GitHub Sync

**Conflict-Aware Client:**

```typescript
class ConflictAwareGitHubClient {
  async syncTokens(config: GitHubConfig, localTokens: ExportData[]) {
    // 1. Fetch remote tokens
    const remote = await this.pullTokens(config);

    // 2. Detect conflicts
    const conflicts = ConflictDetector.detect(localTokens, remote);

    // 3. If conflicts, pause and show UI
    if (conflicts.length > 0) {
      return { hasConflicts: true, conflicts };
    }

    // 4. No conflicts, proceed with merge
    const merged = await this.mergeTokens(localTokens, remote);

    // 5. Push to GitHub
    await this.pushTokens(config, merged);

    return { hasConflicts: false };
  }
}
```

**Sync Modes:**

- **Direct**: Push/pull directly to branch
- **Pull Request**: Create PR for review (safer for teams)

**Metadata Tracking:**

```typescript
interface SyncMetadata {
  lastModified: number;
  source: "figma" | "github";
  commitSha?: string;
  conflictResolution?: "local" | "remote" | "manual";
}
```

---

## Data Flow Examples

### Import Flow

```
1. User selects file
   ↓
2. UI → Plugin: "import-tokens" message
   ↓
3. Plugin: Try all format adapters
   ↓
4. Plugin: Select best adapter (highest confidence)
   ↓
5. Plugin: Normalize token format
   ↓
6. Plugin: Create Figma Variables
   ↓
7. Plugin: Store in document
   ↓
8. Plugin → UI: "import-complete" message
   ↓
9. UI: Show success message & refresh collections
```

### Export Flow

```
1. User selects collections
   ↓
2. UI → Plugin: "export-selected" message
   ↓
3. Plugin: Read Figma Variables
   ↓
4. Plugin: Transform to target format (e.g., W3C DTCG)
   ↓
5. Plugin: Generate JSON
   ↓
6. Plugin → UI: "export-complete" with data
   ↓
7. UI: Trigger browser download
```

### GitHub Sync Flow (No Conflicts)

```
1. User clicks "Sync"
   ↓
2. UI → Plugin: "sync-with-github" message
   ↓
3. Plugin: Export local tokens
   ↓
4. Plugin: Fetch remote tokens from GitHub
   ↓
5. Plugin: Detect conflicts (ConflictDetector)
   ↓
6. No conflicts detected
   ↓
7. Plugin: Merge local + remote
   ↓
8. Plugin: Push to GitHub (or create PR)
   ↓
9. Plugin: Import merged tokens to Figma
   ↓
10. Plugin → UI: "sync-complete" message
   ↓
11. UI: Show success message
```

### GitHub Sync Flow (With Conflicts)

```
1. User clicks "Sync"
   ↓
2. UI → Plugin: "sync-with-github"
   ↓
3. Plugin: Export local + fetch remote
   ↓
4. Plugin: Detect conflicts (3 found)
   ↓
5. Plugin → UI: "conflicts-detected" message
   ↓
6. UI: Show ConflictResolutionDisplay
   ↓
7. User resolves each conflict (local/remote)
   ↓
8. UI → Plugin: "resolve-conflicts" with resolutions
   ↓
9. Plugin: Apply resolutions
   ↓
10. Plugin: Merge with resolutions
   ↓
11. Plugin: Push to GitHub
   ↓
12. Plugin → UI: "sync-complete"
   ↓
13. UI: Show success message
```

---

## Build System

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      input:
        mode === "ui"
          ? "src/ui/index.html" // UI thread
          : "src/plugin/main.ts", // Plugin thread
    },
  },
  plugins: [
    viteSingleFile(), // Inline all CSS/JS
  ],
});
```

**Output:**

- `dist/plugin.js` - Plugin thread bundle (~150 KB)
- `dist/ui.html` - Single-file UI with inlined CSS/JS (~234 KB)

**Total Bundle:** ~384 KB (well under 400 KB target)

### Why Single-File Build?

Figma requires plugin UI to be a single HTML file. Vite's `vite-plugin-singlefile` inlines all CSS and JavaScript into one file.

**Constraints:**

- ❌ No external CSS files
- ✅ Use inline `<style>` tags or CSS-in-JS
- ✅ CSS variables defined in `:root` (index.html)
- ✅ Google Fonts via CDN (allowed exception)

---

## Performance Optimizations

### Chunked Processing

Large token sets processed in chunks with progress feedback:

```typescript
// Process 1000+ tokens in batches
async function processTokensInChunks(tokens: Token[]) {
  const CHUNK_SIZE = 100;

  for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
    const chunk = tokens.slice(i, i + CHUNK_SIZE);
    await processChunk(chunk);

    // Update progress UI
    figma.ui.postMessage({
      type: "progress-update",
      current: i + chunk.length,
      total: tokens.length,
    });

    // Yield to prevent blocking
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}
```

### Message Batching

Related messages batched to reduce overhead:

```typescript
// Instead of 100 individual messages
for (const collection of collections) {
  figma.ui.postMessage({ type: "collection-added", collection });
}

// Send one batched message
figma.ui.postMessage({
  type: "collections-loaded",
  collections: collections,
});
```

---

## Security Considerations

### GitHub Tokens

**Storage:**

- Tokens stored in `figma.clientStorage` (encrypted by Figma)
- Scoped to user, not shared across team members
- Not included in file data (stays local)

**Transmission:**

- Tokens sent over HTTPS only
- GitHub API uses Bearer authentication
- Tokens validated before use

**Best Practices:**

- Use fine-grained personal access tokens
- Minimum required permissions (repo scope only)
- Short expiration dates recommended
- Token validation on setup

### Validation

**Token Structure:**

```typescript
// Validate before importing
function validateToken(token: any): Result<Token> {
  if (!token.$value) {
    return { success: false, error: "Missing $value" };
  }
  if (!isValidTokenType(token.$type)) {
    return { success: false, error: "Invalid $type" };
  }
  // ... more validation
  return { success: true, value: token };
}
```

**Reference Resolution:**

```typescript
// Prevent circular references
function resolveReferences(tokens: Token[]): Result<Token[]> {
  const visited = new Set<string>();

  for (const token of tokens) {
    if (hasCircularReference(token, visited)) {
      return { success: false, error: "Circular reference detected" };
    }
  }

  return { success: true, value: tokens };
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// src/ui/utils/__tests__/parseGitHubUrl.test.ts
describe("parseGitHubUrl", () => {
  it("should parse standard GitHub URLs", () => {
    expect(parseGitHubUrl("https://github.com/user/repo")).toEqual({
      owner: "user",
      repo: "repo",
    });
  });
});
```

### Component Tests

```typescript
// src/ui/components/__tests__/TabBar.test.tsx
describe("TabBar", () => {
  it("should call onTabChange when tab clicked", () => {
    const mockFn = vi.fn();
    render(<TabBar activeTab="tokens" onTabChange={mockFn} />);

    fireEvent.click(screen.getByRole("tab", { name: /import/i }));

    expect(mockFn).toHaveBeenCalledWith("import");
  });
});
```

### Integration Tests

```typescript
// Test full import flow
describe("Token Import Flow", () => {
  it("should import tokens and create variables", async () => {
    // 1. Mock Figma API
    vi.mocked(figma.variables.createVariable).mockResolvedValue({...});

    // 2. Simulate file upload
    const file = new File([JSON.stringify(tokens)], "tokens.json");

    // 3. Trigger import
    await importTokens(file);

    // 4. Verify variables created
    expect(figma.variables.createVariable).toHaveBeenCalledTimes(5);
  });
});
```

---

## Future Enhancements

### Planned (Phase 3-4)

**State Management Refactor:**

- Extract `usePluginMessages()` hook
- Implement UIState reducer
- Reduce App.tsx to <400 lines

**Help System:**

- Enhanced contextual help
- Getting started guide
- Accessibility improvements

### Roadmap (Phase 5+)

**Multiple Sync Providers:**

- GitLab integration
- Generic URL endpoint
- Local file system sync
- Azure DevOps, Bitbucket

**OAuth GitHub:**

- One-click authentication
- Repository browser
- Auto-detect token files

**Advanced Features:**

- Token versioning
- Change history
- Batch operations
- Custom transformations

---

## Constraints & Limitations

### Figma Platform Constraints

❌ **No DOM APIs in Plugin Thread**

- No `document`, `window`, `fetch` globals
- Must use `figma.*` APIs only

❌ **Network Access Limited**

- Only `api.github.com` and `github.com` allowed
- CDNs blocked (except Google Fonts)

❌ **No External Dependencies in Plugin Thread**

- Bundle size matters (~150 KB target)
- Tree-shaking critical

❌ **Single-File UI Build**

- All CSS/JS must inline into one HTML file
- No external stylesheets

### Design Decisions

**Preact over React:**

- Smaller bundle size (3 KB vs 40 KB)
- Same hooks API
- Faster rendering

**Result<T> over Exceptions:**

- Explicit error handling
- No try-catch pyramids
- Type-safe errors

**Message Bus over Shared State:**

- Required by Figma architecture
- Forces clear boundaries
- Easier to debug

---

## References

- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [W3C Design Tokens Spec](https://design-tokens.github.io/community-group/format/)
- [Preact Documentation](https://preactjs.com/)
- [Vite Documentation](https://vitejs.dev/)

---

**Next:** See [CONTRIBUTING.md](../CONTRIBUTING.md) for development workflow.
