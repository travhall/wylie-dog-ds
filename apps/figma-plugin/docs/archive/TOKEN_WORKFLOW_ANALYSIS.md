# Token Workflow Analysis & Gaps

**Date**: December 25, 2025
**Status**: 🔴 **WORKFLOW BROKEN** - Not truly bi-directional

---

## Current Workflow (AS-IS)

### 📤 **Figma → Files** (Export/Push)

```
┌─────────────┐
│   Figma     │
│  Variables  │
└──────┬──────┘
       │
       │ 1. User selects collections
       │    in plugin UI
       ▼
┌─────────────────────┐
│ Figma Plugin        │
│ - processor.ts      │
│   converts Variables│
│   to internal format│
└──────┬──────────────┘
       │
       │ 2. Export options:
       ├──► LOCAL DOWNLOAD
       │    - Downloads JSON to user's computer
       │    - User manually places files
       │    - ❌ No automatic sync
       │
       └──► GITHUB PUSH
            - Pushes to GitHub repo
            - ❌ Path: **HARDCODED OR USER-DEFINED**
            - ❌ NOT automatically `packages/tokens/io/sync/`
```

**Current Export Format:**

```json
[
  {
    "collection-name": {
      "modes": [{ "modeId": "...", "name": "..." }],
      "variables": {
        "token.name": {
          "$type": "color",
          "$value": "#ff0000",
          "valuesByMode": { "Light": "#ff0000", "Dark": "#000000" }
        }
      }
    }
  }
]
```

### 📥 **Files → Figma** (Import/Pull)

```
┌─────────────────────┐
│ Token Files         │
│ (User's computer    │
│  or GitHub)         │
└──────┬──────────────┘
       │
       │ 1. User selects files
       │    via file picker or
       │    GitHub pull
       ▼
┌─────────────────────┐
│ Format Adapter Mgr  │
│ - Auto-detects      │
│   format            │
│ - Normalizes to     │
│   internal format   │
└──────┬──────────────┘
       │
       │ 2. Supported formats:
       │    - W3C DTCG
       │    - Wylie Dog (internal)
       │    - Style Dictionary
       │    - Tokens Studio
       │    - etc.
       ▼
┌─────────────┐
│   Figma     │
│  Variables  │
│  (Created)  │
└─────────────┘
```

---

## 🚨 **Critical Gap: Missing `io/sync/` Integration**

### The Problem

The Figma plugin **DOES NOT** automatically sync with `packages/tokens/io/sync/`:

1. **Export (Figma → GitHub)**:
   - Plugin pushes to GitHub
   - BUT: Path is configured by user (e.g., `tokens/` or custom path)
   - NOT hardcoded to `packages/tokens/io/sync/`
   - User could push anywhere

2. **Import (GitHub → Figma)**:
   - Plugin pulls from GitHub
   - User manually selects files or path
   - NOT automatically reading from `io/sync/`

3. **Local Processing**:
   - `packages/tokens/` has `io/sync/` and `io/processed/`
   - `scripts/process-token-io.js` processes tokens
   - BUT: Completely separate from Figma plugin

### Current State

```
Figma Plugin ❌ NOT CONNECTED ❌ packages/tokens/io/sync/

User must manually:
1. Export from Figma → Download JSON
2. Place files in io/sync/
3. Run: pnpm process-io
4. Run: pnpm build

OR

1. Export from Figma → Push to GitHub (custom path)
2. Manually move files to io/sync/ in separate commit
3. Run build scripts
```

---

## 📋 **Token Flow States**

### State 1: `io/sync/` Files (Source of Truth)

- **Location**: `packages/tokens/io/sync/*.json`
- **Format**: Wylie Dog internal (W3C DTCG tokens + Figma structure)
- **Contains**:
  - `primitive.json` - Base tokens
  - `semantic.json` - Semantic tokens with modes
  - `components.json` - Component tokens with modes
- **Purpose**: Single source of truth for design tokens

### State 2: `io/processed/` Files (Build Output)

- **Location**: `packages/tokens/io/processed/*.json`
- **Format**: Flattened by mode for Style Dictionary
- **Contains**:
  - `primitive.json` - Same as sync (no modes)
  - `semantic-light.json` - Light mode only
  - `semantic-dark.json` - Dark mode only
  - `component-light.json` - Light mode only
  - `component-dark.json` - Dark mode only
- **Purpose**: Input for Style Dictionary build

### State 3: `dist/` Files (Final Output)

- **Location**: `packages/tokens/dist/*.css`, `*.js`
- **Format**: CSS variables, JS exports
- **Purpose**: Consumed by apps/packages

---

## 🔧 **Required Fix: True Bi-Directional Workflow**

### Option A: Hardcode `io/sync/` Path (Simplest)

**Changes Required:**

1. **Configure default GitHub path** in plugin:

   ```typescript
   // In GitHubConfig
   const DEFAULT_TOKEN_PATH = "packages/tokens/io/sync/";
   ```

2. **Update GitHub sync** to use this path:

   ```typescript
   // When pushing tokens
   const targetPath = `${DEFAULT_TOKEN_PATH}${collectionName}.json`;
   ```

3. **Update GitHub pull** to read from this path:
   ```typescript
   // When pulling tokens
   const files = await github.getDirectory(DEFAULT_TOKEN_PATH);
   ```

**Pros:**

- Simple to implement
- Enforces convention
- Automatic bi-directional sync

**Cons:**

- Less flexible
- Assumes monorepo structure
- Hardcoded path could be limiting

---

### Option B: Configurable with Smart Defaults (Recommended)

**Changes Required:**

1. **Add path configuration** to GitHub setup:

   ```typescript
   interface GitHubConfig {
     // ... existing fields
     tokenSyncPath?: string; // Optional, defaults to "packages/tokens/io/sync/"
   }
   ```

2. **Update Setup Wizard** to ask for token path:
   - Default: `packages/tokens/io/sync/`
   - Allow custom override
   - Validate path exists in repo

3. **Update sync operations** to use configured path

**Pros:**

- Flexible for different repo structures
- Smart defaults for Wylie Dog projects
- Still works for external users

**Cons:**

- More complex configuration
- More UI to build

---

### Option C: Convention-Based Auto-Detection

**Changes Required:**

1. **Auto-detect token directory** on GitHub pull:

   ```typescript
   // Search for common patterns
   const possiblePaths = [
     "packages/tokens/io/sync/",
     "tokens/",
     "design-tokens/",
     "src/tokens/",
   ];

   // Find first that exists
   for (const path of possiblePaths) {
     if (await github.pathExists(path)) {
       return path;
     }
   }
   ```

2. **Remember detected path** for future syncs

**Pros:**

- No configuration needed
- Works with various structures
- Smart automation

**Cons:**

- Could guess wrong
- Unpredictable for users
- More complex logic

---

## 🎯 **Recommended Implementation: Option B**

### Phase 1: Add Path Configuration

1. Update `GitHubConfig` interface
2. Add `tokenSyncPath` field with default: `"packages/tokens/io/sync/"`
3. Update Setup Wizard UI to show this field (optional, with smart default)

### Phase 2: Update GitHub Operations

1. **Push/Export**:

   ```typescript
   // apps/figma-plugin/src/plugin/sync/conflict-aware-github-client.ts

   async pushTokens(collections: ExportData[]): Promise<Result> {
     const basePath = this.config.tokenSyncPath || "packages/tokens/io/sync/";

     const files = collections.map(coll => {
       const name = Object.keys(coll)[0];
       return {
         path: `${basePath}${name}.json`,
         content: JSON.stringify([coll], null, 2)
       };
     });

     // ... push to GitHub
   }
   ```

2. **Pull/Import**:

   ```typescript
   async pullTokens(): Promise<Result> {
     const basePath = this.config.tokenSyncPath || "packages/tokens/io/sync/";

     // List files in directory
     const files = await this.github.getContents(basePath);

     // Filter for .json files
     const tokenFiles = files.filter(f => f.name.endsWith('.json'));

     // Download and parse each
     // ... return normalized tokens
   }
   ```

### Phase 3: Update Build Integration

1. **After GitHub push**, suggest running build:

   ```
   ✅ Tokens pushed to packages/tokens/io/sync/

   💡 Next steps:
   1. cd packages/tokens
   2. pnpm process-io
   3. pnpm build
   ```

2. **Or automate via GitHub Actions**:

   ```yaml
   # .github/workflows/process-tokens.yml
   name: Process Tokens
   on:
     push:
       paths:
         - 'packages/tokens/io/sync/**'

   jobs:
     process:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: pnpm/action-setup@v2
         - run: cd packages/tokens && pnpm process-io && pnpm build
         - run: git add io/processed dist
         - run: git commit -m "chore: process tokens"
         - run: git push
   ```

---

## 📊 **Format Clarification**

### What Users See in Onboarding

Current messaging is confusing. Here's the truth:

| Format Name            | What It Actually Is                               | Where It's Used          |
| ---------------------- | ------------------------------------------------- | ------------------------ |
| **W3C DTCG**           | Pure spec format (`{token: {$type, $value}}`)     | External tools, docs     |
| **Wylie Dog Internal** | W3C tokens + Figma structure (modes, collections) | `io/sync/`, Figma plugin |
| **Style Dictionary**   | Nested object format                              | Alternative input        |
| **Tokens Studio**      | Figma Tokens plugin format                        | Alternative input        |

### The Honest Truth

The files in `packages/tokens/io/sync/` are:

- ✅ W3C DTCG **token structure** (`$type`, `$value`)
- ✅ Figma **collection structure** (modes, array wrapper)
- ✅ Custom **extension** (`valuesByMode` for multi-mode support)

This is **not a proprietary format forcing users to learn something custom**. It's:

- W3C DTCG tokens (standard)
- Wrapped in Figma's export structure (necessary for modes)
- Used internally by your design system

**For external users**:

- They can import pure W3C DTCG (we convert it)
- They can import Style Dictionary (we convert it)
- They can import Tokens Studio (we convert it)
- Format adapter handles all conversions

---

## ✅ **Recommended Action Plan**

### Immediate (This Session)

1. **Update documentation** to clarify formats
2. **Decide on path strategy**: Hardcode or configurable?
3. **Update IMPLEMENTATION_SUMMARY.md** with workflow gaps

### Short-term (Next Session)

4. **Implement chosen path strategy** (Option B recommended)
5. **Add `tokenSyncPath` to GitHubConfig**
6. **Update Setup Wizard** to include path field
7. **Update GitHub sync** operations to use path

### Medium-term

8. **Add GitHub Actions** automation for token processing
9. **Create docs** explaining the full workflow
10. **Add validation** to ensure sync path exists

---

## 🎬 **Decision Required**

**Which option do you prefer for the GitHub sync path?**

- **Option A**: Hardcode `packages/tokens/io/sync/` (simple, opinionated)
- **Option B**: Configurable with smart default (flexible, recommended)
- **Option C**: Auto-detection (complex, magical)

Let me know your preference and I'll implement it immediately.
