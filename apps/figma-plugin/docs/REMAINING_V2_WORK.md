# Token Bridge v2 - Remaining Enhancement Work

**Created:** 2025-12-26
**Status:** Planning Document
**Completion:** 40% of v2 plan implemented

---

## Executive Summary

This document outlines the **remaining 60% of work** from the Token Bridge v2 Enhancement Plan. The original plan proposed comprehensive UX improvements to make Token Bridge more accessible to designers while maintaining its technical sophistication.

**What's Already Complete (40%):**

- ✅ Progressive disclosure (Advanced/Simple modes)
- ✅ Enhanced error messaging
- ✅ State management refactoring (hooks extracted)
- ✅ Accessibility improvements (85/100 WCAG score)
- ✅ Professional documentation structure

**What Remains (60%):**
Six major features that will significantly improve the first-time user experience and streamline common workflows.

---

## Outstanding Features

### 1. Onboarding Modal Redesign (Phase 1)

**Current State:**

- `FirstRunOnboarding` component exists but shows a simple "getting started" message
- Doesn't match the v2 plan's four-path wireframe design
- No clear guidance for different user types (GitHub users, existing variable users, etc.)

**Target Design:**

```
┌─────────────────────────────────────────────┐
│ Token Bridge                            [×] │
├─────────────────────────────────────────────┤
│                                             │
│  Choose an option below to get started.     │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │   Import from GitHub         [PRIMARY] │
│  │   Requires GitHub access and token.   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │   Import Existing Figma Variables [BTN]│
│  │   Convert Variables to design tokens  │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │   Import Local Tokens        [PRIMARY] │
│  │   Import existing token files         │
│  │   Format Guidelines →                 │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │   Generate Demo Tokens       [PRIMARY] │
│  │   Start with pre-built tokens         │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

**Implementation Tasks:**

1. **Update FirstRunOnboarding Component**
   - File: `src/ui/components/FirstRunOnboarding.tsx`
   - Replace current design with four-path wireframe
   - Add state detection (e.g., disable "Import Existing Variables" if none exist)
   - Professional styling with CSS variables
   - Full accessibility (ARIA, keyboard navigation)

2. **Hook Up Action Handlers**
   - Connect to existing import workflows
   - Trigger SetupWizard for GitHub path
   - Trigger ExistingTokensImporter for Variables path
   - Trigger FormatGuidelinesDialog for Local Import
   - Trigger DemoTokensGenerator for Demo Tokens

**Success Criteria:**

- ✅ Modal shows on first plugin launch
- ✅ All four paths functional
- ✅ State-aware (disables unavailable options)
- ✅ Can be dismissed and re-shown from help menu

**Estimated Effort:** 1-2 days

---

### 2. Generate Demo Tokens (Phase 2)

**Purpose:** Allow users to try the plugin immediately without needing external token files.

**Current State:**

- No demo token generation
- Users must have existing tokens to try the plugin
- High barrier to entry for evaluation

**Implementation Plan:**

#### 2a. Build Script for Demo Tokens

**File:** `scripts/generate-demo-tokens.js`

**Purpose:** Generate demo tokens at build time from `@wyliedog/tokens`

**Implementation:**

```javascript
// scripts/generate-demo-tokens.js
const fs = require("fs");
const path = require("path");

// Import Wylie Dog tokens (available in monorepo)
// Note: This is build-time only, not included in plugin bundle
const tokens = {
  // Manually define demo tokens inspired by Wylie Dog
  // Don't import the package directly to avoid bundling issues
};

function generateDemoTokens() {
  const demoTokens = {
    $schema:
      "https://design-tokens.github.io/community-group/schema/design-tokens.schema.json",

    color: {
      primary: {
        50: { $type: "color", $value: "#eff6ff" },
        100: { $type: "color", $value: "#dbeafe" },
        200: { $type: "color", $value: "#bfdbfe" },
        300: { $type: "color", $value: "#93c5fd" },
        400: { $type: "color", $value: "#60a5fa" },
        500: { $type: "color", $value: "#3b82f6" },
        600: { $type: "color", $value: "#2563eb" },
        700: { $type: "color", $value: "#1d4ed8" },
        800: { $type: "color", $value: "#1e40af" },
        900: { $type: "color", $value: "#1e3a8a" },
      },
      neutral: {
        50: { $type: "color", $value: "#f9fafb" },
        500: { $type: "color", $value: "#6b7280" },
        900: { $type: "color", $value: "#111827" },
      },
    },

    spacing: {
      xs: { $type: "dimension", $value: "4px" },
      sm: { $type: "dimension", $value: "8px" },
      md: { $type: "dimension", $value: "16px" },
      lg: { $type: "dimension", $value: "32px" },
      xl: { $type: "dimension", $value: "64px" },
    },

    typography: {
      "font-size": {
        xs: { $type: "dimension", $value: "12px" },
        sm: { $type: "dimension", $value: "14px" },
        md: { $type: "dimension", $value: "16px" },
        lg: { $type: "dimension", $value: "20px" },
        xl: { $type: "dimension", $value: "24px" },
      },
    },
  };

  const outputPath = path.join(
    __dirname,
    "../src/plugin/data/demo-tokens.json"
  );

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(demoTokens, null, 2));
  console.log("✅ Generated demo tokens at src/plugin/data/demo-tokens.json");
}

generateDemoTokens();
```

**Update package.json:**

```json
{
  "scripts": {
    "prebuild": "node scripts/generate-demo-tokens.js"
  }
}
```

#### 2b. Demo Token Generator Component

**File:** `src/ui/components/DemoTokensGenerator.tsx` (create new)

**Purpose:** UI component that loads and imports demo tokens

**Implementation:**

```typescript
import { h } from "preact";
import { useState } from "preact/hooks";
import demoTokens from "../../plugin/data/demo-tokens.json";

interface DemoTokensGeneratorProps {
  onImport: () => void;
  onCancel: () => void;
}

export function DemoTokensGenerator({ onImport, onCancel }: DemoTokensGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);

    // Send demo tokens to plugin thread for import
    parent.postMessage({
      pluginMessage: {
        type: "import-tokens",
        files: [{
          filename: "demo-tokens.json",
          content: JSON.stringify(demoTokens, null, 2)
        }]
      }
    }, "*");

    onImport();
  };

  return (
    <div className="demo-tokens-generator">
      <h3>Generate Demo Tokens</h3>
      <p>
        Create a comprehensive set of example tokens to explore Token Bridge features:
      </p>
      <ul>
        <li><strong>Colors:</strong> Primary scale (10 shades) + Neutral (3 shades)</li>
        <li><strong>Spacing:</strong> 5 size tokens (xs, sm, md, lg, xl)</li>
        <li><strong>Typography:</strong> 5 font size tokens</li>
      </ul>

      <div className="info-box">
        <strong>💡 About W3C DTCG Format</strong>
        <p>
          Demo tokens use the W3C Design Tokens Community Group (DTCG) format—the
          industry standard for design tokens.
        </p>
      </div>

      <div className="actions">
        <button onClick={handleGenerate} disabled={generating} className="primary">
          {generating ? "Generating..." : "Generate Demo Tokens"}
        </button>
        <button onClick={onCancel} className="secondary">
          Cancel
        </button>
      </div>
    </div>
  );
}
```

#### 2c. Integration

**Update App.tsx:**

```typescript
const handleGenerateDemoTokens = useCallback(() => {
  dispatch({ type: "COMPLETE_ONBOARDING" });
  setShowDemoTokensGenerator(true);
}, []);

// In render
{showDemoTokensGenerator && (
  <DemoTokensGenerator
    onImport={() => {
      setShowDemoTokensGenerator(false);
      setSuccessMessage("✅ Demo tokens imported! Check the Tokens tab.");
    }}
    onCancel={() => setShowDemoTokensGenerator(false)}
  />
)}
```

**Success Criteria:**

- ✅ Build script generates demo-tokens.json at build time
- ✅ DemoTokensGenerator component imports tokens on click
- ✅ Users can explore plugin features immediately
- ✅ Educational messaging about W3C DTCG format

**Estimated Effort:** 1 day

---

### 3. Import Existing Figma Variables (Phase 3)

**Purpose:** Convert existing Figma Variables to W3C DTCG tokens for export.

**Current State:**

- `ExistingTokensImporter` component exists but is non-functional
- No conversion logic from Figma Variables to tokens
- Missing detection of existing variables

**Implementation Plan:**

#### 3a. Figma Variable Importer Service

**File:** `src/plugin/variables/figma-variable-importer.ts` (create new)

**Purpose:** Detect and convert Figma Variables to W3C DTCG format

**Implementation:**

```typescript
/**
 * Detects existing Figma Variables and converts them to W3C DTCG format
 */

interface VariableDetection {
  hasVariables: boolean;
  collections: VariableCollection[];
  totalVariables: number;
}

export class FigmaVariableImporter {
  /**
   * Scan for existing Variables in the current file
   */
  async detectExistingVariables(): Promise<VariableDetection> {
    const collections = await figma.variables.getLocalVariableCollections();

    const totalVariables = collections.reduce(
      (sum, col) => sum + col.variableIds.length,
      0
    );

    return {
      hasVariables: totalVariables > 0,
      collections,
      totalVariables,
    };
  }

  /**
   * Convert Figma Variables to W3C DTCG format
   */
  async convertToW3CDTCG(
    collections: VariableCollection[]
  ): Promise<Record<string, any>> {
    const tokens: Record<string, any> = {};

    for (const collection of collections) {
      const collectionTokens: Record<string, any> = {};

      for (const variableId of collection.variableIds) {
        const variable = figma.variables.getVariableById(variableId);
        if (!variable) continue;

        const token = this.convertVariableToToken(variable, collection);
        collectionTokens[variable.name] = token;
      }

      tokens[collection.name] = collectionTokens;
    }

    return tokens;
  }

  /**
   * Convert a single Variable to W3C token
   */
  private convertVariableToToken(
    variable: Variable,
    collection: VariableCollection
  ): any {
    const type = this.mapFigmaTypeToW3C(variable.resolvedType);

    // Simple case: single mode
    if (collection.modes.length === 1) {
      const modeId = collection.modes[0].modeId;
      const value = this.convertFigmaValue(
        variable.valuesByMode[modeId],
        variable.resolvedType
      );

      return {
        $type: type,
        $value: value,
        $description: variable.description || undefined,
      };
    }

    // Multiple modes: create mode-specific values
    const modeValues: Record<string, any> = {};
    for (const mode of collection.modes) {
      const value = this.convertFigmaValue(
        variable.valuesByMode[mode.modeId],
        variable.resolvedType
      );
      modeValues[mode.name] = value;
    }

    return {
      $type: type,
      $value: modeValues,
      $description: variable.description || undefined,
    };
  }

  /**
   * Map Figma variable type to W3C token type
   */
  private mapFigmaTypeToW3C(figmaType: VariableResolvedDataType): string {
    const typeMap: Record<string, string> = {
      COLOR: "color",
      FLOAT: "number",
      STRING: "string",
      BOOLEAN: "boolean",
    };
    return typeMap[figmaType] || "string";
  }

  /**
   * Convert Figma value to W3C format
   */
  private convertFigmaValue(value: any, type: VariableResolvedDataType): any {
    switch (type) {
      case "COLOR":
        // Convert Figma RGB to hex
        return this.rgbToHex(value);

      case "FLOAT":
      case "STRING":
      case "BOOLEAN":
        return value;

      default:
        return value;
    }
  }

  /**
   * Convert RGB object to hex string
   */
  private rgbToHex(rgb: RGB): string {
    const r = Math.round(rgb.r * 255);
    const g = Math.round(rgb.g * 255);
    const b = Math.round(rgb.b * 255);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
}
```

#### 3b. Update ExistingTokensImporter Component

**File:** `src/ui/components/ExistingTokensImporter.tsx`

**Make it functional:**

```typescript
import { h } from "preact";
import { useState, useEffect } from "preact/hooks";

interface ExistingTokensImporterProps {
  onImport: () => void;
  onCancel: () => void;
}

export function ExistingTokensImporter({ onImport, onCancel }: ExistingTokensImporterProps) {
  const [detection, setDetection] = useState<any>(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    // Request variable detection from plugin thread
    parent.postMessage({
      pluginMessage: { type: "detect-variables" }
    }, "*");

    // Listen for response
    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage?.type === "variables-detected") {
        setDetection(event.data.pluginMessage.detection);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConvert = () => {
    setConverting(true);

    // Request conversion
    parent.postMessage({
      pluginMessage: { type: "convert-variables-to-tokens" }
    }, "*");

    onImport();
  };

  if (!detection) {
    return <div>Scanning for Variables...</div>;
  }

  if (!detection.hasVariables) {
    return (
      <div className="empty-state">
        <p>No Variables found in current file</p>
        <p className="hint">
          Variables must be created in Figma first using the Variables panel.
        </p>
        <button onClick={onCancel}>Close</button>
      </div>
    );
  }

  return (
    <div className="existing-tokens-importer">
      <h3>Found {detection.totalVariables} Variables</h3>
      <p>Convert these to W3C DTCG format tokens:</p>
      <ul>
        {detection.collections.map((col: any) => (
          <li key={col.id}>
            {col.name} ({col.variableIds.length} variables)
          </li>
        ))}
      </ul>

      <div className="actions">
        <button onClick={handleConvert} disabled={converting} className="primary">
          {converting ? "Converting..." : "Convert to Tokens"}
        </button>
        <button onClick={onCancel} className="secondary">
          Cancel
        </button>
      </div>
    </div>
  );
}
```

#### 3c. Plugin Thread Handler

**File:** `src/plugin/main.ts`

**Add message handlers:**

```typescript
// In message handler
case "detect-variables": {
  const importer = new FigmaVariableImporter();
  const detection = await importer.detectExistingVariables();

  figma.ui.postMessage({
    type: "variables-detected",
    detection
  });
  break;
}

case "convert-variables-to-tokens": {
  const importer = new FigmaVariableImporter();
  const collections = await figma.variables.getLocalVariableCollections();
  const tokens = await importer.convertToW3CDTCG(collections);

  // Export as JSON download
  figma.ui.postMessage({
    type: "download-json",
    files: [{
      filename: "figma-variables-export.json",
      content: JSON.stringify(tokens, null, 2)
    }]
  });
  break;
}
```

**Success Criteria:**

- ✅ Detects existing Variables in file
- ✅ Converts Variables to W3C DTCG format
- ✅ Handles multiple collections
- ✅ Handles multiple modes
- ✅ Exports as downloadable JSON

**Estimated Effort:** 2-3 days

---

### 4. Enhanced Local Import (Phase 3)

**Purpose:** Better guidance and feedback when importing local token files.

**Current State:**

- Basic file upload works
- `FormatGuidelinesDialog` component exists but is non-functional
- No format detection feedback
- No transformation preview

**Implementation Plan:**

#### 4a. Make FormatGuidelinesDialog Functional

**File:** `src/ui/components/FormatGuidelinesDialog.tsx`

**Current:** Empty shell
**Target:** Educational modal with format examples

**Implementation:**

```typescript
import { h } from "preact";

interface FormatGuidelinesDialogProps {
  onClose: () => void;
}

export function FormatGuidelinesDialog({ onClose }: FormatGuidelinesDialogProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Supported Token Formats</h2>
          <button onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          <div className="format-section">
            <h3>W3C Design Tokens (Recommended)</h3>
            <pre>{`{
  "color-primary": {
    "$type": "color",
    "$value": "#0066FF",
    "$description": "Primary brand color"
  },
  "spacing-md": {
    "$type": "dimension",
    "$value": "16px"
  }
}`}</pre>
            <p>Official W3C standard for design tokens.</p>
            <a href="https://design-tokens.github.io/community-group/format/" target="_blank">
              View specification →
            </a>
          </div>

          <div className="format-section">
            <h3>Style Dictionary</h3>
            <pre>{`{
  "color": {
    "primary": {
      "value": "#0066FF",
      "type": "color"
    }
  }
}`}</pre>
            <p>Popular token format, automatically converts to W3C.</p>
          </div>

          <div className="format-section">
            <h3>Tokens Studio (Figma Tokens)</h3>
            <pre>{`{
  "$themes": [],
  "colors": {
    "primary": {
      "value": "#0066FF",
      "type": "color"
    }
  }
}`}</pre>
            <p>Format used by Figma Tokens plugin.</p>
          </div>

          <div className="help-section">
            <h3>Need Help?</h3>
            <ul>
              <li>
                <button onClick={() => {/* trigger demo tokens */}}>
                  Generate demo tokens
                </button>
              </li>
              <li>
                <a href="https://docs.token-bridge.com/formats" target="_blank">
                  View full documentation →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="primary">Got it</button>
        </div>
      </div>
    </div>
  );
}
```

#### 4b. Format Detection Feedback

**Enhancement:** Show confidence score and detected format after file upload

**File:** `src/ui/tabs/ImportTab.tsx`

**Add after file selection:**

```typescript
const handleFileSelect = async (file: File) => {
  const content = await file.text();

  // Send to plugin for format detection
  parent.postMessage({
    pluginMessage: {
      type: "detect-format",
      content
    }
  }, "*");
};

// In UI, show detection result
{formatDetection && (
  <div className="format-feedback">
    <div className={`confidence-badge confidence-${formatDetection.confidence > 0.8 ? 'high' : 'medium'}`}>
      {(formatDetection.confidence * 100).toFixed(0)}% confident
    </div>
    <p>
      Detected format: <strong>{formatDetection.format}</strong>
    </p>
    {formatDetection.warnings.length > 0 && (
      <div className="warnings">
        <h4>Potential Issues:</h4>
        <ul>
          {formatDetection.warnings.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>
    )}
  </div>
)}
```

#### 4c. Transformation Preview

**Show what transformations will be applied before import**

**Add to ImportTab:**

```typescript
{preview && (
  <div className="transformation-preview">
    <h3>Preview</h3>
    <p>{preview.tokenCount} tokens will be imported</p>

    {preview.transformations.length > 0 && (
      <details>
        <summary>{preview.transformations.length} transformations</summary>
        <ul>
          {preview.transformations.map((t, i) => (
            <li key={i}>
              <strong>{t.type}:</strong> {t.description}
            </li>
          ))}
        </ul>
      </details>
    )}

    <button onClick={handleImport} className="primary">
      Import Tokens
    </button>
  </div>
)}
```

**Success Criteria:**

- ✅ FormatGuidelinesDialog shows format examples
- ✅ Format detection confidence shown to user
- ✅ Warnings displayed for problematic files
- ✅ Preview shows what will be imported
- ✅ Users understand transformations before import

**Estimated Effort:** 1-2 days

---

### 5. Chunked Processing (Phase 4)

**Purpose:** Handle large token collections (500+) without freezing UI.

**Current State:**

- No chunked processing
- Large imports freeze the plugin
- Poor user experience with big token sets

**Implementation Plan:**

#### 5a. Chunked Variable Importer

**File:** `src/plugin/variables/chunked-importer.ts` (create new)

**Purpose:** Import tokens in chunks with progress updates

**Implementation:**

```typescript
/**
 * Imports tokens in chunks to prevent UI freezing
 */

interface ImportProgress {
  completed: number;
  total: number;
  currentPhase: "parsing" | "validating" | "importing";
  currentToken?: string;
}

export class ChunkedVariableImporter {
  private static CHUNK_SIZE = 50; // Tokens per chunk

  async importWithChunking(
    tokens: any[],
    onProgress?: (progress: ImportProgress) => void
  ): Promise<void> {
    const totalTokens = tokens.length;
    let processedTokens = 0;

    // Create collection
    const collection =
      figma.variables.createVariableCollection("Imported Tokens");

    // Process in chunks
    for (
      let i = 0;
      i < tokens.length;
      i += ChunkedVariableImporter.CHUNK_SIZE
    ) {
      const chunk = tokens.slice(i, i + ChunkedVariableImporter.CHUNK_SIZE);

      // Process chunk
      for (const token of chunk) {
        await this.createVariable(collection, token);
        processedTokens++;

        // Update progress
        onProgress?.({
          completed: processedTokens,
          total: totalTokens,
          currentPhase: "importing",
          currentToken: token.name,
        });
      }

      // Allow UI to update between chunks
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  private async createVariable(
    collection: VariableCollection,
    token: any
  ): Promise<Variable> {
    // Create variable logic (similar to existing importer)
    const variable = figma.variables.createVariable(
      token.name,
      collection,
      this.mapTypeToFigma(token.type)
    );

    if (token.description) {
      variable.description = token.description;
    }

    const defaultMode = collection.modes[0];
    variable.setValueForMode(
      defaultMode.modeId,
      this.convertValue(token.value, token.type)
    );

    return variable;
  }

  private mapTypeToFigma(type: string): VariableResolvedDataType {
    const typeMap: Record<string, VariableResolvedDataType> = {
      color: "COLOR",
      number: "FLOAT",
      dimension: "FLOAT",
      string: "STRING",
      boolean: "BOOLEAN",
    };
    return typeMap[type] || "STRING";
  }

  private convertValue(value: any, type: string): any {
    // Conversion logic
    if (type === "color") {
      return this.hexToRgb(value);
    }
    return value;
  }

  private hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0, g: 0, b: 0 };
  }
}
```

#### 5b. Progress Tracker UI

**File:** `src/ui/components/ProgressFeedback.tsx` (enhance existing)

**Add detailed progress for imports:**

```typescript
interface ImportProgress {
  completed: number;
  total: number;
  currentPhase: string;
  currentToken?: string;
}

export function ProgressFeedback({ progress }: { progress: ImportProgress }) {
  const percentage = (progress.completed / progress.total) * 100;

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h3>Importing Tokens</h3>
        <span>{progress.completed} / {progress.total}</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="progress-details">
        <span className="phase">{progress.currentPhase}</span>
        {progress.currentToken && (
          <span className="current-token">
            Processing: {progress.currentToken}
          </span>
        )}
      </div>
    </div>
  );
}
```

#### 5c. Integration

**Update message handler in plugin thread:**

```typescript
case "import-tokens-chunked": {
  const importer = new ChunkedVariableImporter();

  await importer.importWithChunking(
    msg.tokens,
    (progress) => {
      // Send progress updates to UI
      figma.ui.postMessage({
        type: "import-progress",
        progress
      });
    }
  );

  figma.ui.postMessage({
    type: "import-complete"
  });
  break;
}
```

**Success Criteria:**

- ✅ Handles 500+ tokens without freezing
- ✅ Shows progress bar during import
- ✅ Updates current token being processed
- ✅ UI remains responsive throughout
- ✅ Completes in <20s for 1000 tokens

**Estimated Effort:** 2 days

---

### 6. OAuth GitHub Integration (Phase 2) - OPTIONAL/FUTURE

**Status:** Deferred to future release

**Rationale:**

- Current Personal Access Token (PAT) approach works fine
- OAuth requires backend service deployment (additional complexity)
- Low priority compared to other features
- Can be added later without breaking changes

**If implemented in future:**

- Deploy OAuth backend service (Vercel/Netlify)
- Implement GitHubOAuthManager
- Build visual repository browser
- Add token file auto-detection

**Estimated Effort (if pursued):** 1-2 weeks

---

## Implementation Roadmap

### Phase 1: Core UX Improvements (1 week)

**Goal:** Onboarding and demo tokens

1. Update FirstRunOnboarding with four-path wireframe (2 days)
2. Implement Generate Demo Tokens (build script + component) (1 day)
3. Make FormatGuidelinesDialog functional (1 day)
4. Testing and polish (1 day)

**Deliverables:**

- ✅ New users have clear starting paths
- ✅ Demo tokens available immediately
- ✅ Format guidelines accessible

### Phase 2: Variable Import & Enhanced Feedback (1 week)

**Goal:** Import existing Variables, better format detection

1. Implement FigmaVariableImporter service (2 days)
2. Update ExistingTokensImporter component (1 day)
3. Add format detection feedback to ImportTab (1 day)
4. Add transformation preview (1 day)
5. Testing and polish (1 day)

**Deliverables:**

- ✅ Convert existing Figma Variables to tokens
- ✅ Better feedback on import formats
- ✅ Preview before importing

### Phase 3: Performance & Scale (3-4 days)

**Goal:** Handle large token collections

1. Implement ChunkedVariableImporter (2 days)
2. Enhance ProgressFeedback component (1 day)
3. Performance testing with 500-1000 tokens (1 day)

**Deliverables:**

- ✅ Smooth import of 500+ tokens
- ✅ Real-time progress feedback
- ✅ No UI freezing

---

## Testing Strategy

### Feature Testing

**Onboarding Modal:**

- Test all four paths functional
- Verify state detection (disables unavailable options)
- Test dismissal and re-show
- Keyboard navigation works

**Demo Tokens:**

- Build script runs successfully
- Generated tokens are valid W3C DTCG
- Import works on first click
- Educational messaging clear

**Variable Import:**

- Detects existing Variables correctly
- Converts all variable types (color, number, string, boolean)
- Handles multiple collections
- Handles multiple modes
- Export produces valid JSON

**Format Detection:**

- Confidence scores accurate
- Warnings helpful and actionable
- Preview shows correct token count
- Transformations listed clearly

**Chunked Import:**

- 500 tokens: <10s, no freezing
- 1000 tokens: <20s, no freezing
- Progress updates smooth
- UI remains responsive

### Regression Testing

Ensure existing functionality still works:

- Basic import/export flows
- GitHub sync (existing PAT approach)
- Conflict resolution
- Accessibility features
- Dark mode

---

## Success Metrics

**Onboarding:**

- 80% of new users complete onboarding in <2 minutes
- 90% choose one of the four paths (not dismiss immediately)
- Demo tokens used by 30%+ of new users

**Variable Import:**

- 50%+ of users with existing Variables try the converter
- 90% success rate for conversions
- <5% report issues with converted tokens

**Format Detection:**

- 95% format detection accuracy
- <10% of users need to check format guidelines
- Confidence scores correlate with actual accuracy

**Performance:**

- 500 tokens: <10s import time (target met)
- 1000 tokens: <20s import time (target met)
- 0% freezing reports for large imports

**Overall:**

- User satisfaction: >85%
- First-time success rate: >90%
- Support requests: <5 per 100 users

---

## Non-Goals (Explicitly Out of Scope)

1. **Remove Wylie Dog Native Format**
   - Originally in v2 plan but REMOVED from this scope
   - Format is critical for plugin functionality
   - Not a user-facing format (internal only)

2. **OAuth GitHub Integration**
   - Deferred to future release
   - Current PAT approach sufficient
   - Adds deployment complexity

3. **State Management Refactor Completion**
   - Already 80% complete with extracted hooks
   - Full integration deferred due to circular dependency
   - Current architecture working fine

4. **Additional Sync Providers (GitLab, Bitbucket)**
   - Planned for separate future work
   - Not part of v2 plan completion

---

## Risk Assessment

### Low Risk

- **Demo Tokens Generation:** Straightforward build script
- **FormatGuidelinesDialog:** Simple educational modal
- **Format Detection Feedback:** Existing detection, just expose to UI

### Medium Risk

- **Onboarding Modal Redesign:** Touches first-run experience, needs careful testing
- **Variable Import:** Complex conversion logic, multiple edge cases
- **Chunked Processing:** Performance optimization, needs thorough testing

### High Risk

- **None** - All features are well-scoped with clear implementation paths

### Mitigation Strategies

1. **Incremental Rollout:** Implement and test each phase independently
2. **Feature Flags:** Can disable new features if issues arise
3. **Comprehensive Testing:** Unit tests + manual testing for each feature
4. **User Feedback:** Beta test with 5-10 users before full release

---

## Conclusion

This plan completes the **remaining 60% of Token Bridge v2 enhancements**. The work is scoped into three phases over 2-3 weeks:

**Phase 1 (1 week):** Onboarding + Demo Tokens + Format Guidelines
**Phase 2 (1 week):** Variable Import + Enhanced Feedback
**Phase 3 (3-4 days):** Chunked Processing + Performance

Upon completion:

- ✅ 100% of v2 plan implemented (except deferred OAuth)
- ✅ Significantly improved first-time user experience
- ✅ Better guidance and feedback throughout
- ✅ Handles large token collections smoothly
- ✅ Ready for wider adoption and Figma Community launch

**Next Steps:**

1. Get stakeholder approval on this plan
2. Begin Phase 1 implementation
3. Test and iterate
4. Move to Phase 2, then Phase 3
5. Prepare for Figma Community launch
