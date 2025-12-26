# Bi-Directional Sync Implementation Plan

**Status**: 🟡 Partially Implemented - Needs Completion
**Date**: December 25, 2025

---

## ✅ What's Already Done

1. **Project Detection Utility Created**: `src/plugin/github/project-detector.ts`
   - Detects Wylie Dog Design System structure
   - Auto-suggests `packages/tokens/io/sync/` path
   - Falls back to common paths for non-Wylie Dog projects

2. **GitHubConfig Extended**: Added `isWylieDogProject` field
   - Tracks whether repo is Wylie Dog DS
   - Used to provide smart defaults

3. **GitHub Client Already Uses tokenPath**:
   - `pullTokens()` reads from `config.tokenPath`
   - `syncTokens()` writes to `config.tokenPath`
   - Infrastructure is ready, just need better defaults

---

## 🔧 What Needs to Be Done

### Quick Fix (15 minutes)

**Goal**: Make Wylie Dog repo work bi-directionally out of the box

1. **Update Default Token Path** in Setup Wizard:

   ```typescript
   // In SetupWizard.tsx, Step 3: Token Path
   const [tokenPath, setTokenPath] = useState(
     data.tokenPath || "packages/tokens/io/sync/" // Changed from "tokens/"
   );
   ```

2. **Add Helper Text** to token path field:

   ```tsx
   <p style={{ fontSize: "11px", color: "#0369a1", marginTop: "4px" }}>
     💡 Wylie Dog projects use: <code>packages/tokens/io/sync/</code>
   </p>
   ```

3. **Test with wylie-dog-ds Repo**:
   - Configure plugin with your repo
   - Push tokens → Should go to `packages/tokens/io/sync/`
   - Pull tokens → Should read from `packages/tokens/io/sync/`

---

### Full Implementation (1-2 hours)

**Goal**: Auto-detect project type and provide smart defaults

#### Step 1: Integrate Project Detection

In `SetupWizard.tsx`, after repository validation:

```typescript
// After successful repository validation
const handleNext = async () => {
  if (await validateRepository()) {
    // NEW: Detect project type
    const detection = await detectWylieDogProject(
      githubClient,
      owner,
      repo,
      branch
    );

    onNext({
      owner,
      repo,
      branch,
      isWylieDogProject: detection.isWylieDogProject,
      // Pass recommended path to next step
      recommendedPath: detection.recommendedPath,
    });
  }
};
```

#### Step 2: Use Recommended Path in Token Path Step

```typescript
// Step 3: Token Path
const [tokenPath, setTokenPath] = useState(
  data.recommendedPath || data.tokenPath || "tokens/"
);

// Show detection result
{data.isWylieDogProject && (
  <div style={{
    padding: "8px",
    backgroundColor: "#dcfce7",
    borderRadius: "4px",
    fontSize: "11px",
    marginBottom: "12px"
  }}>
    ✅ Wylie Dog Design System detected!
    <br />
    Using standard path: <code>packages/tokens/io/sync/</code>
  </div>
)}
```

#### Step 3: Save isWylieDogProject Flag

Make sure the final config includes the detection result:

```typescript
// In SetupWizard.tsx main component
const finalConfig: GitHubConfig = {
  owner: wizardData.owner!,
  repo: wizardData.repo!,
  branch: wizardData.branch!,
  tokenPath: wizardData.tokenPath!,
  accessToken: wizardData.accessToken!,
  syncMode: wizardData.syncMode!,
  isWylieDogProject: wizardData.isWylieDogProject, // NEW
};
```

---

## 📝 Setup Instructions Component

Create a simple placeholder component for external users:

```typescript
// src/ui/components/SetupInstructionsDialog.tsx

export const SetupInstructionsDialog = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>🛠️ Token Sync Setup Guide</h2>

        <section>
          <h3>For Wylie Dog Design System Users</h3>
          <ol>
            <li>Configure GitHub with your wylie-dog-ds repo</li>
            <li>Use path: <code>packages/tokens/io/sync/</code></li>
            <li>Tokens sync automatically - no extra setup needed!</li>
          </ol>
        </section>

        <section>
          <h3>For External Users</h3>
          <ol>
            <li>Create a tokens directory in your repo (e.g., <code>tokens/</code>)</li>
            <li>Configure path in Setup Wizard</li>
            <li>Set up processing:</li>
          </ol>

          <h4>Option A: Manual Processing</h4>
          <pre>{`
# After pulling tokens
cd your-project
node scripts/process-tokens.js
npm run build:tokens
          `}</pre>

          <h4>Option B: GitHub Actions (Recommended)</h4>
          <pre>{`
# .github/workflows/process-tokens.yml
name: Process Design Tokens
on:
  push:
    paths:
      - 'tokens/**'
jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run process:tokens
      - run: npm run build
      - run: |
          git config user.name "Token Bot"
          git config user.email "bot@example.com"
          git add .
          git commit -m "Process design tokens"
          git push
          `}</pre>
        </section>

        <section>
          <h3>Token Format</h3>
          <p>The plugin exports tokens in this format:</p>
          <pre>{`
[{
  "collection-name": {
    "modes": [...],
    "variables": {
      "token.name": {
        "$type": "color",
        "$value": "#ff0000"
      }
    }
  }
}]
          `}</pre>
          <p>This uses W3C DTCG token structure with Figma's collection/modes wrapper.</p>
        </section>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
```

---

## 🎨 Update Format Guidelines

Enhance `FormatGuidelinesDialog.tsx` with accurate information:

```typescript
// Add section explaining the "Wylie Dog" format
<div style={{ marginBottom: "24px" }}>
  <h3>Figma Variables Format (Used by Plugin)</h3>
  <pre>{`
[{
  "collection-name": {
    "modes": [{"modeId": "...", "name": "Light"}],
    "variables": {
      "color.primary": {
        "$type": "color",
        "$value": "#0066FF",
        "valuesByMode": {
          "Light": "#0066FF",
          "Dark": "#003380"
        }
      }
    }
  }
}]
  `}</pre>
  <p>
    This is the native format exported by Figma Variables.
    It uses W3C DTCG tokens (<code>$type</code>, <code>$value</code>)
    wrapped in Figma's collection structure to support modes.
  </p>
</div>
```

---

## ✅ Testing Checklist

### Test 1: Wylie Dog Project (Bi-Directional)

- [ ] Configure plugin with `travishall/wylie-dog-ds` repo
- [ ] Default path should be `packages/tokens/io/sync/`
- [ ] Export tokens from Figma
- [ ] Push to GitHub
- [ ] Verify files appear in `packages/tokens/io/sync/`
- [ ] Run `pnpm process-io` in tokens package
- [ ] Verify `io/processed/` gets updated
- [ ] Make changes to tokens in sync dir
- [ ] Pull from GitHub in plugin
- [ ] Verify Figma Variables update

### Test 2: External Project

- [ ] Configure plugin with different repo
- [ ] Set custom path (e.g., `design-tokens/`)
- [ ] Export and push tokens
- [ ] Verify files appear in custom path
- [ ] Pull tokens back
- [ ] Verify import works

---

## 🚀 Quick Start (Immediate Fix)

If you want to test bi-directional sync **right now** with minimal changes:

1. **Manually configure** the plugin with:
   - Owner: `travishall`
   - Repo: `wylie-dog-ds`
   - Branch: `main`
   - Path: `packages/tokens/io/sync/`

2. **Export tokens** from Figma → Push to GitHub

3. **Check GitHub**: Files should be in `packages/tokens/io/sync/`

4. **Run processing** locally:

   ```bash
   cd packages/tokens
   pnpm process-io
   pnpm build
   ```

5. **Pull tokens** back to Figma to verify

This proves the workflow works - we just need to make the path default instead of manual!

---

## 📊 Summary

| Component          | Status           | Notes                         |
| ------------------ | ---------------- | ----------------------------- |
| Project Detection  | ✅ Built         | `project-detector.ts` ready   |
| GitHubConfig Type  | ✅ Updated       | Has `isWylieDogProject` field |
| GitHub Client      | ✅ Ready         | Uses `tokenPath` correctly    |
| Setup Wizard       | 🟡 Needs Update  | Should use smart defaults     |
| Format Guidelines  | 🟡 Needs Content | Placeholder exists            |
| Setup Instructions | ❌ Not Created   | Need placeholder              |
| End-to-End Testing | ❌ Not Done      | Needs manual verification     |

**Recommendation**: Start with Quick Fix (change default path), test it works, then add auto-detection polish later.
