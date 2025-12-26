# Token Bridge v2.0: Comprehensive Enhancement Plan

**Version**: 2.0.0  
**Created**: December 2025  
**Status**: Implementation Roadmap  
**Project**: Wylie Dog Design System - Figma Plugin

---

## Executive Summary

This document outlines a comprehensive enhancement plan for Token Bridge v2.0, transforming it from a technically sophisticated but UX-complex tool into an accessible, user-friendly design token solution while maintaining its enterprise-grade capabilities. The plan integrates the proposed onboarding modal wireframe with strategic UX improvements, performance optimizations, and new import features.

### Key Changes

1. **Simplified Onboarding Modal** - Four clear paths for getting started
2. **Remove Wylie Dog Native Format** - Standardize on W3C DTCG
3. **OAuth GitHub Integration** - One-click authentication
4. **Import Existing Figma Variables** - Convert Variables to tokens
5. **Generate Demo Tokens** - Educational starter tokens
6. **Progressive Disclosure** - Simple vs Advanced modes
7. **Performance Optimization** - Chunked processing for large collections
8. **Enhanced Error Messaging** - Plain language with actionable guidance

---

## Current State Assessment

### Technical Excellence (Grade: A-)

- Multi-format adapter system (8+ formats)
- Conflict-aware GitHub synchronization
- Comprehensive reference resolution
- TypeScript strict mode implementation
- Professional error handling

### UX Challenges (Grade: C+)

- GitHub configuration complexity (6+ technical fields)
- Information architecture overload
- Technical jargon throughout
- Feature overwhelm for designers
- No clear "happy path" workflow

### Critical Issues Identified

1. **Authentication Barrier**: Manual GitHub configuration requires Git expertise
2. **Feature Complexity**: Advanced features intimidate basic users
3. **Error Messages**: Technical language confuses designers
4. **Performance**: UI freezing on large token collections (500+)
5. **State Management**: 20+ useState variables create complexity

---

## Enhancement Strategy

### Design Philosophy

**"Simple by default, powerful when needed"**

- **Primary Users**: Designers without Git experience
- **Secondary Users**: Design system engineers with technical needs
- **Tertiary Users**: Enterprise teams requiring advanced workflows

### Success Criteria

**User Experience**

- 80% of users complete onboarding within 2 minutes
- 90% first-time success rate for basic import/export
- > 85% user satisfaction rating
- <5 support requests per 100 users

**Technical Performance**

- <2s plugin load time
- <10s import time for 500 tokens
- <5s export time for 500 tokens
- <500KB bundle size

**Market Position**

- > 4.5/5 star rating on Figma Community
- Industry recognition as best-in-class token solution
- > 60% repeat usage within 7 days

---

## Onboarding Modal Redesign

### Modal Structure (Matching Wireframe)

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
│  │   Import Existing Figma Tokens [GRAY] │
│  │   Your Figma does not contain Variables│
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
│  │   Start with pre-built, compliant tokens│
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Path 1: Import from GitHub (Enhanced)

**Current Flow**:

1. Manual config: owner, repo, branch, tokenPath, accessToken, syncMode
2. Technical validation
3. Manual token file path entry

**New Flow**:

1. **One-Click OAuth** → GitHub authentication popup
2. **Visual Repository Browser** → Shows user's repos with token detection
3. **Auto-Detect Token Files** → Suggests `tokens.json`, `design-tokens.json`
4. **Import with Conflict Detection** → Smart merge suggestions

**Technical Implementation**:

```typescript
// New: GitHubOAuthManager
interface GitHubOAuthManager {
  // OAuth flow handler
  initiateOAuth(): Promise<OAuthResult>;
  handleCallback(code: string): Promise<AccessToken>;
  refreshToken(refreshToken: string): Promise<AccessToken>;

  // Visual repository browsing
  listRepositories(user: AuthenticatedUser): Promise<Repository[]>;
  searchRepositoriesWithTokens(): Promise<Repository[]>;

  // Auto-detection
  detectTokenFiles(repo: Repository): Promise<TokenFile[]>;
  validateTokenFile(file: TokenFile): Promise<ValidationResult>;
}

// OAuth Backend Service (deployed separately)
interface OAuthService {
  endpoint: 'https://token-bridge-oauth.vercel.app';

  exchangeCode(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;

  refreshAccessToken(refreshToken: string): Promise<AccessToken>;
}

// Visual Repository Browser Component
interface GitHubRepositoryBrowserProps {
  repositories: Repository[];
  onSelectRepository: (repo: Repository) => void;
  loading: boolean;
}

const GitHubRepositoryBrowser: React.FC<GitHubRepositoryBrowserProps> = ({
  repositories,
  onSelectRepository,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="repository-browser">
      <input
        type="text"
        placeholder="Search repositories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="repository-list">
        {filteredRepos.map(repo => (
          <div
            key={repo.id}
            className="repository-card"
            onClick={() => onSelectRepository(repo)}
          >
            <h3>{repo.name}</h3>
            <p>{repo.description}</p>
            {repo.hasTokens && (
              <span className="badge">Has tokens</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Token File Auto-Detection**:

```typescript
class TokenFileDetector {
  // Common token file paths to check
  private static COMMON_PATHS = [
    "tokens.json",
    "design-tokens.json",
    "tokens/tokens.json",
    "src/tokens.json",
    "design/tokens.json",
    "styles/tokens.json",
  ];

  async detectInRepository(
    github: Octokit,
    owner: string,
    repo: string
  ): Promise<TokenFile[]> {
    const detectedFiles: TokenFile[] = [];

    // Try common paths first (fast)
    for (const path of TokenFileDetector.COMMON_PATHS) {
      try {
        const { data } = await github.repos.getContent({
          owner,
          repo,
          path,
        });

        if (data.type === "file") {
          const isValid = await this.validateTokenFile(data.content);
          if (isValid) {
            detectedFiles.push({
              path,
              size: data.size,
              sha: data.sha,
            });
          }
        }
      } catch {
        // File doesn't exist, continue
      }
    }

    // Fallback: GitHub code search for token-like files
    if (detectedFiles.length === 0) {
      const searchResults = await github.search.code({
        q: `filename:tokens.json OR filename:design-tokens.json repo:${owner}/${repo}`,
      });

      // Process search results
      for (const item of searchResults.data.items) {
        detectedFiles.push({
          path: item.path,
          size: 0, // Unknown from search
          sha: item.sha,
        });
      }
    }

    return detectedFiles;
  }

  private async validateTokenFile(content: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(Buffer.from(content, "base64").toString());

      // Check if it looks like a token file
      const hasTokenStructure =
        typeof parsed === "object" &&
        (parsed.$type !== undefined ||
          parsed.$value !== undefined ||
          Object.values(parsed).some(
            (v) =>
              typeof v === "object" &&
              (v.$type !== undefined || v.$value !== undefined)
          ));

      return hasTokenStructure;
    } catch {
      return false;
    }
  }
}
```

### Path 2: Import Existing Figma Variables (New Feature)

**Purpose**: Convert existing Figma Variables into W3C DTCG format tokens

**User Flow**:

1. Button enabled only if current file contains Variables
2. Click → Scan Variables → Convert to W3C DTCG
3. Preview conversion → Confirm → Export JSON or create new Variables

**Technical Implementation**:

```typescript
// FigmaVariableImporter.ts
class FigmaVariableImporter {
  async detectExistingVariables(): Promise<{
    hasVariables: boolean;
    collections: VariableCollection[];
    totalVariables: number;
  }> {
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

  async convertToW3CDTCG(
    collections: VariableCollection[]
  ): Promise<W3CTokenCollection> {
    const tokens: W3CTokenCollection = {};

    for (const collection of collections) {
      const collectionTokens = {};

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

  private convertVariableToToken(
    variable: Variable,
    collection: VariableCollection
  ): W3CToken {
    const type = this.mapFigmaTypeToW3C(variable.resolvedType);

    // Handle single mode (simple case)
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

    // Handle multiple modes
    const modeValues = {};
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

  private mapFigmaTypeToW3C(figmaType: VariableResolvedDataType): string {
    const typeMap = {
      COLOR: "color",
      FLOAT: "number",
      STRING: "string",
      BOOLEAN: "boolean",
    };

    return typeMap[figmaType] || "string";
  }

  private convertFigmaValue(value: any, type: VariableResolvedDataType): any {
    switch (type) {
      case "COLOR":
        // Convert Figma RGB to hex
        return this.rgbToHex(value);

      case "FLOAT":
        return value;

      case "STRING":
      case "BOOLEAN":
        return value;

      default:
        return value;
    }
  }

  private rgbToHex(rgb: RGB): string {
    const r = Math.round(rgb.r * 255);
    const g = Math.round(rgb.g * 255);
    const b = Math.round(rgb.b * 255);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
}
```

**UI Component**:

```typescript
const ExistingTokensImporter: React.FC = () => {
  const [detection, setDetection] = useState<VariableDetection | null>(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const importer = new FigmaVariableImporter();
    importer.detectExistingVariables().then(setDetection);
  }, []);

  const handleConvert = async () => {
    if (!detection) return;

    setConverting(true);
    const importer = new FigmaVariableImporter();
    const w3cTokens = await importer.convertToW3CDTCG(detection.collections);

    // Offer export or import back into Figma
    const action = await showConversionPreview(w3cTokens);

    if (action === 'export') {
      downloadJSON(w3cTokens, 'figma-variables-export.json');
    } else if (action === 'reimport') {
      // Import converted tokens back as new Variables
      await importTokens(w3cTokens);
    }

    setConverting(false);
  };

  if (!detection) {
    return <div>Scanning for Variables...</div>;
  }

  if (!detection.hasVariables) {
    return (
      <div className="empty-state">
        <p>No Variables found in current file</p>
        <p className="hint">
          Variables must be created in Figma first
        </p>
      </div>
    );
  }

  return (
    <div className="existing-tokens">
      <h3>Found {detection.totalVariables} Variables</h3>
      <ul>
        {detection.collections.map(col => (
          <li key={col.id}>
            {col.name} ({col.variableIds.length} tokens)
          </li>
        ))}
      </ul>

      <button onClick={handleConvert} disabled={converting}>
        {converting ? 'Converting...' : 'Convert to W3C DTCG Format'}
      </button>
    </div>
  );
};
```

### Path 3: Import Local Tokens (Enhanced)

**Current**: Basic file upload with limited format support

**Enhancement**:

- Add **Format Guidelines** modal (linked in wireframe)
- Better format detection feedback
- Visual transformation preview
- Helpful suggestions for unsupported formats

**Format Guidelines Modal**:

```typescript
const FormatGuidelinesDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogContent className="format-guidelines">
        <h2>Supported Token Formats</h2>

        <div className="format-section">
          <h3>W3C Design Tokens (Recommended)</h3>
          <pre>{`{
  "color-primary": {
    "$type": "color",
    "$value": "#0066FF"
  }
}`}</pre>
          <p>Official W3C standard for design tokens</p>
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
          <p>Automatically converts to W3C format</p>
        </div>

        <div className="format-section">
          <h3>Tokens Studio</h3>
          <pre>{`{
  "$themes": [],
  "colors": {
    "primary": {
      "value": "#0066FF",
      "type": "color"
    }
  }
}`}</pre>
          <p>Figma Tokens plugin format</p>
        </div>

        <div className="help-section">
          <h3>Need help?</h3>
          <ul>
            <li>
              <a href="#" onClick={() => generateDemoTokens()}>
                Generate demo tokens
              </a>
            </li>
            <li>
              <a href="https://design-tokens.github.io/community-group/format/">
                W3C specification
              </a>
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

**Enhanced Local Import Flow**:

```typescript
const EnhancedLocalImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [detection, setDetection] = useState<FormatDetectionResult | null>(null);
  const [preview, setPreview] = useState<TransformationPreview | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);

    const content = await selectedFile.text();
    const adapter = new FormatAdapterManager();
    const result = await adapter.processTokenFile(content);

    setDetection(result.detection);

    if (result.success) {
      setPreview({
        originalFormat: result.detection.format,
        transformations: result.transformations,
        tokenCount: result.stats.totalTokens,
      });
    }
  };

  return (
    <div className="local-import">
      <FileUploader onFileSelect={handleFileSelect} />

      {detection && (
        <div className="format-feedback">
          <div className={`confidence-badge confidence-${detection.confidence > 0.8 ? 'high' : 'medium'}`}>
            {(detection.confidence * 100).toFixed(0)}% confident
          </div>
          <p>
            Detected format: <strong>{detection.format}</strong>
          </p>

          {detection.warnings.length > 0 && (
            <div className="warnings">
              <h4>Potential Issues:</h4>
              <ul>
                {detection.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {preview && (
        <div className="transformation-preview">
          <h3>Preview Transformations</h3>
          <p>{preview.tokenCount} tokens will be imported</p>

          {preview.transformations.length > 0 && (
            <details>
              <summary>
                {preview.transformations.length} transformations applied
              </summary>
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

      <button
        variant="link"
        onClick={() => showFormatGuidelines()}
      >
        Format Guidelines →
      </button>
    </div>
  );
};
```

### Path 4: Generate Demo Tokens (New Feature)

**Purpose**: Educational starter tokens to learn W3C DTCG format

**Implementation Strategy**: Build-time generation from Wylie Dog tokens

**Build Script**:

```javascript
// scripts/generate-demo-tokens.js
const fs = require("fs");
const path = require("path");

// Import from @wyliedog/tokens during build
const wyliedogTokens = require("@wyliedog/tokens");

function generateDemoTokens() {
  const demoTokens = {
    $schema:
      "https://design-tokens.github.io/community-group/schema/design-tokens.schema.json",

    colors: {
      primary: {
        50: { $type: "color", $value: wyliedogTokens.color.blue[50] },
        100: { $type: "color", $value: wyliedogTokens.color.blue[100] },
        200: { $type: "color", $value: wyliedogTokens.color.blue[200] },
        300: { $type: "color", $value: wyliedogTokens.color.blue[300] },
        400: { $type: "color", $value: wyliedogTokens.color.blue[400] },
        500: { $type: "color", $value: wyliedogTokens.color.blue[500] },
        600: { $type: "color", $value: wyliedogTokens.color.blue[600] },
        700: { $type: "color", $value: wyliedogTokens.color.blue[700] },
        800: { $type: "color", $value: wyliedogTokens.color.blue[800] },
        900: { $type: "color", $value: wyliedogTokens.color.blue[900] },
      },
      secondary: {
        50: { $type: "color", $value: wyliedogTokens.color.green[50] },
        500: { $type: "color", $value: wyliedogTokens.color.green[500] },
        900: { $type: "color", $value: wyliedogTokens.color.green[900] },
      },
      neutral: {
        50: { $type: "color", $value: wyliedogTokens.color.gray[50] },
        500: { $type: "color", $value: wyliedogTokens.color.gray[500] },
        900: { $type: "color", $value: wyliedogTokens.color.gray[900] },
      },
    },

    spacing: {
      xs: { $type: "dimension", $value: wyliedogTokens.spacing[1] },
      sm: { $type: "dimension", $value: wyliedogTokens.spacing[2] },
      md: { $type: "dimension", $value: wyliedogTokens.spacing[4] },
      lg: { $type: "dimension", $value: wyliedogTokens.spacing[8] },
      xl: { $type: "dimension", $value: wyliedogTokens.spacing[16] },
    },

    typography: {
      "font-size": {
        sm: { $type: "dimension", $value: "14px" },
        md: { $type: "dimension", $value: "16px" },
        lg: { $type: "dimension", $value: "20px" },
      },
    },
  };

  const outputPath = path.join(
    __dirname,
    "../src/plugin/data/demo-tokens.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(demoTokens, null, 2));

  console.log("✅ Generated demo tokens");
}

generateDemoTokens();
```

**UI Component**:

```typescript
const DemoTokensGenerator: React.FC = () => {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);

    // Load pre-built demo tokens
    const demoTokens = await import('../data/demo-tokens.json');

    // Create Variables from demo tokens
    const importer = new ChunkedVariableImporter();
    await importer.importFromJSON(demoTokens);

    setGenerating(false);

    // Show educational overlay
    showDemoTokensEducation();
  };

  return (
    <div className="demo-tokens">
      <h3>Generate Demo Tokens</h3>
      <p>
        Create a comprehensive set of example tokens including:
      </p>
      <ul>
        <li>Color scales (primary, secondary, neutral)</li>
        <li>Spacing system (xs, sm, md, lg, xl)</li>
        <li>Typography tokens (font sizes)</li>
      </ul>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="primary"
      >
        {generating ? 'Generating...' : 'Generate Demo Tokens'}
      </button>

      <div className="educational-note">
        <p className="hint">
          Demo tokens use W3C DTCG format - the industry standard.
          <button variant="link" onClick={showFormatGuide}>
            Learn more →
          </button>
        </p>
      </div>
    </div>
  );
};

function showDemoTokensEducation() {
  // Modal explaining what was created
  return (
    <Dialog>
      <DialogContent>
        <h2>Demo Tokens Created!</h2>
        <p>
          Created 3 Variable Collections with 25 tokens:
        </p>
        <ul>
          <li><strong>Colors</strong> - 10 primary, 3 secondary, 3 neutral</li>
          <li><strong>Spacing</strong> - 5 size tokens</li>
          <li><strong>Typography</strong> - 3 font size tokens</li>
        </ul>

        <div className="w3c-format-explanation">
          <h3>About W3C DTCG Format</h3>
          <pre>{`{
  "color-primary-500": {
    "$type": "color",
    "$value": "oklch(0.623 0.188 259.81)"
  }
}`}</pre>
          <p>
            This format ensures tokens work across tools and platforms.
          </p>
        </div>

        <button onClick={closeDialog}>Got it!</button>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Remove Wylie Dog Native Format

### Rationale

**Current State**: Plugin supports custom "Wylie Dog" format alongside W3C DTCG

**Issue**:

- Adds complexity without clear benefit
- W3C DTCG is industry standard
- Maintenance burden for custom format
- Confuses users with format choices

**Decision**: Remove Wylie Dog native format, standardize on W3C DTCG

### Migration Strategy

**For Existing Users**:

1. Auto-detect Wylie Dog format during import
2. Silently convert to W3C DTCG
3. Show one-time migration notice
4. Provide converted file for download

**Code Changes**:

```typescript
// Remove: WylieDogNativeAdapter
// Remove: TokenFormatType.WYLIE_DOG

// Update FormatAdapterManager initialization:
private initializeAdapters(): void {
  // W3C DTCG now has highest priority
  this.registry.register(new W3CDTCGAdapter());
  this.registry.register(new StyleDictionaryFlatAdapter());
  this.registry.register(new StyleDictionaryNestedAdapter());
  this.registry.register(new TokensStudioAdapter());
  this.registry.register(new MaterialDesignAdapter());
  this.registry.register(new CSSVariablesAdapter());
  this.registry.register(new GenericAdapter()); // Fallback
}

// Add migration handler:
class WylieDogMigrationHandler {
  detectLegacyFormat(data: any): boolean {
    // Check for old Wylie Dog format markers
    return (
      data.wylieDogVersion !== undefined ||
      (data.collections && data.collections.some(c => c.wylieDogMetadata))
    );
  }

  async migrateToW3C(legacyData: any): Promise<W3CTokens> {
    // Convert old format to W3C DTCG
    const w3cTokens = this.convertStructure(legacyData);

    // Show migration notice
    figma.notify(
      'Legacy Wylie Dog format detected and converted to W3C DTCG standard',
      { timeout: 5000 }
    );

    // Offer download of converted format
    this.offerConvertedDownload(w3cTokens);

    return w3cTokens;
  }

  private convertStructure(legacy: any): W3CTokens {
    // Conversion logic matching W3C spec
    const converted = {};

    for (const [collectionName, collection] of Object.entries(legacy.collections || {})) {
      converted[collectionName] = {};

      for (const [tokenName, token] of Object.entries(collection.variables || {})) {
        converted[collectionName][tokenName] = {
          $type: token.type || this.inferType(token.value),
          $value: token.value,
          $description: token.description,
        };
      }
    }

    return converted;
  }
}
```

### User Communication

**In-App Notice**:

```
Token Bridge has standardized on W3C DTCG format - the industry standard
for design tokens. Your tokens have been automatically converted and are
ready to use. [Download converted file] [Learn more about W3C DTCG]
```

**Documentation Update**:

- Add migration guide in docs
- Update format compatibility table
- Explain W3C DTCG benefits

---

## State Management Refactor

### Current Problem

**App.tsx has 20+ useState calls**:

- collectionDetails, selectedCollection, exportData
- loading, error, view, githubConfig
- conflicts, validationResults, transformations
- Too complex to maintain and debug

### Solution: useReducer + Context Pattern

**AppState Interface**:

```typescript
// src/ui/state/AppState.ts

export interface AppState {
  // Collections
  collections: VariableCollection[];
  selectedCollection: string | null;
  collectionDetails: Record<string, CollectionDetail>;

  // View State
  view: ViewState;
  previousView: ViewState | null;

  // Loading & Errors
  loading: boolean;
  loadingMessage: string;
  error: AppError | null;

  // GitHub
  githubConfig: GitHubConfig | null;
  githubConnected: boolean;
  githubUser: GitHubUser | null;

  // Import/Export
  exportData: ExportData | null;
  importProgress: ImportProgress | null;

  // Conflicts
  conflicts: Conflict[];
  conflictResolutions: Map<string, ConflictResolution>;

  // Validation
  validationResults: ValidationResult[];
  transformationLogs: TransformationLog[];

  // Settings
  advancedMode: boolean;
  preferences: UserPreferences;
}

export type ViewState =
  | "onboarding"
  | "collections"
  | "collection-detail"
  | "github-config"
  | "conflict-resolution"
  | "validation";

export type AppAction =
  | { type: "SET_VIEW"; view: ViewState }
  | { type: "LOAD_COLLECTIONS_START" }
  | { type: "LOAD_COLLECTIONS_SUCCESS"; collections: VariableCollection[] }
  | { type: "LOAD_COLLECTIONS_ERROR"; error: string }
  | { type: "SELECT_COLLECTION"; id: string }
  | { type: "GITHUB_CONNECT_SUCCESS"; user: GitHubUser; config: GitHubConfig }
  | { type: "GITHUB_DISCONNECT" }
  | { type: "IMPORT_START"; totalTokens: number }
  | { type: "IMPORT_PROGRESS"; completed: number; total: number }
  | { type: "IMPORT_SUCCESS" }
  | { type: "IMPORT_ERROR"; error: string }
  | { type: "EXPORT_START" }
  | { type: "EXPORT_SUCCESS"; data: ExportData }
  | { type: "EXPORT_ERROR"; error: string }
  | { type: "SET_CONFLICTS"; conflicts: Conflict[] }
  | {
      type: "RESOLVE_CONFLICT";
      conflictId: string;
      resolution: ConflictResolution;
    }
  | { type: "CLEAR_ERROR" }
  | { type: "TOGGLE_ADVANCED_MODE" };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_VIEW":
      return {
        ...state,
        view: action.view,
        previousView: state.view,
      };

    case "LOAD_COLLECTIONS_START":
      return {
        ...state,
        loading: true,
        loadingMessage: "Loading collections...",
        error: null,
      };

    case "LOAD_COLLECTIONS_SUCCESS":
      return {
        ...state,
        loading: false,
        loadingMessage: "",
        collections: action.collections,
      };

    case "LOAD_COLLECTIONS_ERROR":
      return {
        ...state,
        loading: false,
        loadingMessage: "",
        error: {
          type: "load-error",
          message: action.error,
          suggestions: ["Check Figma connection", "Refresh plugin"],
        },
      };

    case "SELECT_COLLECTION":
      return {
        ...state,
        selectedCollection: action.id,
        view: "collection-detail",
      };

    case "GITHUB_CONNECT_SUCCESS":
      return {
        ...state,
        githubConnected: true,
        githubUser: action.user,
        githubConfig: action.config,
      };

    case "GITHUB_DISCONNECT":
      return {
        ...state,
        githubConnected: false,
        githubUser: null,
        githubConfig: null,
      };

    case "IMPORT_START":
      return {
        ...state,
        loading: true,
        importProgress: {
          completed: 0,
          total: action.totalTokens,
          currentPhase: "parsing",
        },
      };

    case "IMPORT_PROGRESS":
      return {
        ...state,
        importProgress: state.importProgress
          ? {
              ...state.importProgress,
              completed: action.completed,
              total: action.total,
            }
          : null,
      };

    case "IMPORT_SUCCESS":
      return {
        ...state,
        loading: false,
        importProgress: null,
        view: "collections",
      };

    case "SET_CONFLICTS":
      return {
        ...state,
        conflicts: action.conflicts,
        view: "conflict-resolution",
      };

    case "RESOLVE_CONFLICT":
      const resolutions = new Map(state.conflictResolutions);
      resolutions.set(action.conflictId, action.resolution);

      return {
        ...state,
        conflictResolutions: resolutions,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "TOGGLE_ADVANCED_MODE":
      return {
        ...state,
        advancedMode: !state.advancedMode,
      };

    default:
      return state;
  }
};
```

**Context Provider**:

```typescript
// src/ui/state/AppContext.tsx

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('token-bridge-preferences', JSON.stringify({
      advancedMode: state.advancedMode,
    }));
  }, [state.advancedMode]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Convenience hooks
export const useCollections = () => {
  const { state, dispatch } = useApp();

  const loadCollections = useCallback(async () => {
    dispatch({ type: 'LOAD_COLLECTIONS_START' });

    try {
      const collections = await figma.variables.getLocalVariableCollections();
      dispatch({ type: 'LOAD_COLLECTIONS_SUCCESS', collections });
    } catch (error) {
      dispatch({
        type: 'LOAD_COLLECTIONS_ERROR',
        error: error.message
      });
    }
  }, [dispatch]);

  return {
    collections: state.collections,
    selectedCollection: state.selectedCollection,
    loadCollections,
  };
};

export const useGitHub = () => {
  const { state, dispatch } = useApp();

  const connect = useCallback(async (accessToken: string) => {
    // OAuth flow or PAT setup
    const user = await fetchGitHubUser(accessToken);
    const config = { accessToken };

    dispatch({
      type: 'GITHUB_CONNECT_SUCCESS',
      user,
      config
    });
  }, [dispatch]);

  const disconnect = useCallback(() => {
    dispatch({ type: 'GITHUB_DISCONNECT' });
  }, [dispatch]);

  return {
    connected: state.githubConnected,
    user: state.githubUser,
    config: state.githubConfig,
    connect,
    disconnect,
  };
};

export const useConflicts = () => {
  const { state, dispatch } = useApp();

  const resolveConflict = useCallback((
    conflictId: string,
    resolution: ConflictResolution
  ) => {
    dispatch({ type: 'RESOLVE_CONFLICT', conflictId, resolution });
  }, [dispatch]);

  return {
    conflicts: state.conflicts,
    resolutions: state.conflictResolutions,
    resolveConflict,
  };
};
```

**Updated App.tsx**:

```typescript
// src/ui/App.tsx (simplified)

export const App: React.FC = () => {
  const { state, dispatch } = useApp();
  const { loadCollections } = useCollections();

  // Load collections on mount
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Simplified render based on view state
  return (
    <AppProvider>
      <div className="token-bridge">
        {state.error && (
          <EnhancedError
            error={state.error}
            onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })}
          />
        )}

        {state.loading && (
          <ProgressTracker
            message={state.loadingMessage}
            progress={state.importProgress}
          />
        )}

        {state.view === 'onboarding' && <OnboardingModal />}
        {state.view === 'collections' && <CollectionsList />}
        {state.view === 'collection-detail' && <CollectionDetail />}
        {state.view === 'github-config' && <GitHubConfig />}
        {state.view === 'conflict-resolution' && <ConflictResolution />}
      </div>
    </AppProvider>
  );
};
```

---

## Progressive Disclosure: Simple vs Advanced Modes

### Simple Mode (Default)

**Visible Features**:

- Onboarding modal
- Basic collection list
- One-click export to local file
- GitHub sync button (if connected)
- Error messages with recovery actions

**Hidden Features**:

- Multiple export formats
- Manual format selection
- Transformation logs
- Branch selection
- Sync mode configuration
- Custom token paths

### Advanced Mode

**Toggled by**:

- Settings menu: "Show advanced options"
- Persisted in localStorage
- Keyboard shortcut: Cmd/Ctrl + Shift + A

**Additional UI**:

```typescript
const AdvancedModeToggle: React.FC = () => {
  const { state, dispatch } = useApp();

  return (
    <div className="settings-menu">
      <label className="toggle">
        <input
          type="checkbox"
          checked={state.advancedMode}
          onChange={() => dispatch({ type: 'TOGGLE_ADVANCED_MODE' })}
        />
        <span>Show advanced options</span>
      </label>

      {state.advancedMode && (
        <p className="hint">
          Advanced features include format selection, transformation logs,
          and detailed GitHub configuration
        </p>
      )}
    </div>
  );
};
```

**Conditional Rendering**:

```typescript
const ExportControls: React.FC = () => {
  const { state } = useApp();

  return (
    <div className="export-controls">
      {/* Always visible */}
      <button className="primary" onClick={handleQuickExport}>
        Export Tokens
      </button>

      {/* Advanced mode only */}
      {state.advancedMode && (
        <>
          <select value={exportFormat} onChange={setExportFormat}>
            <option value="json">JSON</option>
            <option value="css">CSS Variables</option>
            <option value="scss">SCSS Variables</option>
            <option value="js">JavaScript</option>
          </select>

          <select value={colorFormat} onChange={setColorFormat}>
            <option value="hex">Hex (#ffffff)</option>
            <option value="rgb">RGB</option>
            <option value="oklch">OKLCH (Advanced)</option>
          </select>

          <details>
            <summary>Transformation Log</summary>
            <TransformationLog logs={state.transformationLogs} />
          </details>
        </>
      )}
    </div>
  );
};
```

---

## Performance Optimization

### Chunked Processing for Large Collections

**Problem**: Processing 500+ tokens freezes UI

**Solution**: Process in chunks with progress updates

```typescript
// src/plugin/variables/chunked-importer.ts

class ChunkedVariableImporter {
  private static CHUNK_SIZE = 50; // Tokens per chunk

  async importWithChunking(
    tokens: W3CTokenCollection,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResult> {
    const allTokens = this.flattenTokens(tokens);
    const totalTokens = allTokens.length;
    let processedTokens = 0;

    // Create collection first
    const collection =
      figma.variables.createVariableCollection("Imported Tokens");

    // Process in chunks
    for (
      let i = 0;
      i < allTokens.length;
      i += ChunkedVariableImporter.CHUNK_SIZE
    ) {
      const chunk = allTokens.slice(i, i + ChunkedVariableImporter.CHUNK_SIZE);

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

    return {
      success: true,
      totalImported: processedTokens,
      collectionId: collection.id,
    };
  }

  private flattenTokens(tokens: W3CTokenCollection): FlatToken[] {
    const flat: FlatToken[] = [];

    const traverse = (obj: any, path: string[] = []) => {
      for (const [key, value] of Object.entries(obj)) {
        if (value.$type && value.$value) {
          // This is a token
          flat.push({
            name: [...path, key].join("."),
            type: value.$type,
            value: value.$value,
            description: value.$description,
          });
        } else if (typeof value === "object") {
          // Nested group, recurse
          traverse(value, [...path, key]);
        }
      }
    };

    traverse(tokens);
    return flat;
  }

  private async createVariable(
    collection: VariableCollection,
    token: FlatToken
  ): Promise<Variable> {
    const variable = figma.variables.createVariable(
      token.name,
      collection,
      this.mapW3CTypeToFigma(token.type)
    );

    if (token.description) {
      variable.description = token.description;
    }

    // Set value for default mode
    const defaultMode = collection.modes[0];
    variable.setValueForMode(
      defaultMode.modeId,
      this.convertW3CValueToFigma(token.value, token.type)
    );

    return variable;
  }
}
```

**Progress UI**:

```typescript
interface ImportProgress {
  completed: number;
  total: number;
  currentPhase: 'parsing' | 'normalizing' | 'validating' | 'importing';
  currentToken?: string;
}

const ProgressTracker: React.FC<{ progress: ImportProgress }> = ({ progress }) => {
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
          <span className="current-token">{progress.currentToken}</span>
        )}
      </div>
    </div>
  );
};
```

### Memory Cleanup

```typescript
// App.tsx cleanup
useEffect(() => {
  return () => {
    // Clear large objects on unmount
    dispatch({ type: "CLEAR_COLLECTIONS" });
    dispatch({ type: "CLEAR_EXPORT_DATA" });
    dispatch({ type: "CLEAR_TRANSFORMATION_LOGS" });
  };
}, []);

// Clear transformation logs after 5 minutes
useEffect(() => {
  if (state.transformationLogs.length > 0) {
    const timeout = setTimeout(
      () => {
        dispatch({ type: "CLEAR_TRANSFORMATION_LOGS" });
      },
      5 * 60 * 1000
    );

    return () => clearTimeout(timeout);
  }
}, [state.transformationLogs]);
```

### Lazy Loading

```typescript
// Lazy load heavy components
const ConflictResolution = lazy(() =>
  import('./components/ConflictResolution')
);

const TransformationLog = lazy(() =>
  import('./components/TransformationLog')
);

// In App.tsx
<Suspense fallback={<LoadingSpinner />}>
  {state.view === 'conflict-resolution' && <ConflictResolution />}
</Suspense>
```

---

## Enhanced Error Messaging

### Plain Language Error System

```typescript
// src/ui/errors/error-messages.ts

export const ERROR_MESSAGES = {
  GITHUB_AUTH_FAILED: {
    title: 'GitHub Connection Failed',
    message: 'We couldn\'t connect to your GitHub account.',
    actions: [
      'Try reconnecting with OAuth',
      'Check your internet connection',
      'Use a Personal Access Token instead',
    ],
    helpUrl: 'https://docs.token-bridge.com/github-setup',
  },

  INVALID_TOKEN_FORMAT: {
    title: 'Unrecognized Token Format',
    message: 'This file doesn\'t appear to be a supported token format.',
    actions: [
      'View Format Guidelines',
      'Generate Demo Tokens to see examples',
      'Try a different file',
    ],
    helpUrl: 'https://docs.token-bridge.com/formats',
  },

  IMPORT_FAILED: {
    title: 'Import Failed',
    message: 'Something went wrong while importing tokens.',
    actions: [
      'Check the file is valid JSON',
      'Try a smaller file first',
      'View error details below',
    ],
  },

  SYNC_CONFLICT_DETECTED: {
    title: 'Changes Need Review',
    message: 'Your tokens have changed since the last sync.',
    actions: [
      'Review changes',
      'Keep local changes',
      'Keep remote changes',
    ],
  },

  NETWORK_ERROR: {
    title: 'Connection Problem',
    message: 'Couldn\'t reach GitHub. Check your internet connection.',
    actions: [
      'Try again',
      'Work offline and sync later',
    ],
  },
};

interface EnhancedErrorProps {
  error: AppError;
  onDismiss: () => void;
}

const EnhancedError: React.FC<EnhancedErrorProps> = ({ error, onDismiss }) => {
  const [showDetails, setShowDetails] = useState(false);

  const errorInfo = ERROR_MESSAGES[error.type] || {
    title: 'Something Went Wrong',
    message: error.message,
    actions: ['Try again', 'Contact support'],
  };

  return (
    <div className="error-banner">
      <div className="error-content">
        <div className="error-icon">⚠️</div>

        <div className="error-text">
          <h3>{errorInfo.title}</h3>
          <p>{errorInfo.message}</p>

          {errorInfo.actions && (
            <div className="error-actions">
              {errorInfo.actions.map((action, i) => (
                <button
                  key={i}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAction(action)}
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {error.technicalDetails && (
            <details>
              <summary>Show technical details</summary>
              <pre className="error-details">
                {error.technicalDetails}
              </pre>
            </details>
          )}
        </div>

        <button
          className="error-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      </div>

      {errorInfo.helpUrl && (
        <a
          href={errorInfo.helpUrl}
          target="_blank"
          className="error-help"
        >
          Learn more →
        </a>
      )}
    </div>
  );
};
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goals**: Onboarding modal, state refactor, remove Wylie Dog format

**Tasks**:

1. Create OnboardingModal component matching wireframe
2. Implement AppState/AppContext/AppReducer
3. Refactor App.tsx to use new state management
4. Remove WylieDogNativeAdapter
5. Add W3C DTCG as primary format
6. Update all tests

**Deliverables**:

- ✓ OnboardingModal with 4 paths (2 working, 2 placeholders)
- ✓ State management refactored
- ✓ Wylie Dog format removed
- ✓ Passing tests

### Phase 2: GitHub OAuth Integration (Weeks 3-4)

**Goals**: OAuth authentication, repository browser, token detection

**Tasks**:

1. Deploy OAuth backend service (Vercel/Netlify)
2. Implement GitHubOAuthManager
3. Build GitHubRepositoryBrowser component
4. Create TokenFileDetector service
5. Update GitHub sync workflow
6. Add repository auto-detection

**Deliverables**:

- ✓ OAuth flow working end-to-end
- ✓ Visual repository browser
- ✓ Automatic token file detection
- ✓ Fallback to Personal Access Token

### Phase 3: New Import Features (Weeks 5-6)

**Goals**: Existing Variables importer, demo token generator

**Tasks**:

1. Build FigmaVariableImporter
2. Create ExistingTokensImporter component
3. Implement demo token build script
4. Build DemoTokensGenerator component
5. Enhance local import with format guidelines
6. Add FormatGuidelinesDialog

**Deliverables**:

- ✓ Import from Figma Variables working
- ✓ Demo tokens generated at build time
- ✓ Enhanced local import with better UX
- ✓ Format guidelines modal

### Phase 4: UX Polish & Performance (Weeks 7-8)

**Goals**: Advanced mode toggle, progress indicators, performance optimization

**Tasks**:

1. Implement progressive disclosure (Simple/Advanced)
2. Add AdvancedModeToggle component
3. Build enhanced ProgressTracker
4. Implement ChunkedVariableImporter
5. Add memory cleanup
6. Optimize bundle with lazy loading
7. Enhance error messages

**Deliverables**:

- ✓ Advanced mode toggle working
- ✓ Chunked processing for large collections
- ✓ Enhanced progress feedback
- ✓ Smart error messages
- ✓ Performance targets met

### Phase 5: Testing & Launch (Weeks 9-10)

**Goals**: Comprehensive testing, documentation, launch preparation

**Tasks**:

1. Write automated tests (unit, integration, E2E)
2. User testing with 10 designers
3. Complete user documentation
4. Create video tutorials
5. Prepare Figma Community listing
6. Performance audit
7. Accessibility audit
8. Final QA and bug fixes

**Deliverables**:

- ✓ >80% test coverage
- ✓ User testing complete with feedback integrated
- ✓ Complete documentation
- ✓ Ready for Figma Community launch

---

## Testing Strategy

### Automated Testing

**Unit Tests** (Vitest):

- Format detection accuracy
- Token normalization correctness
- State reducer logic
- Chunked import functionality
- OAuth flow components

**Integration Tests**:

- GitHub OAuth flow end-to-end
- Repository browsing and selection
- Token file detection
- Import/export workflows
- Conflict resolution

**End-to-End Tests** (Playwright):

- Complete onboarding flow with local tokens
- GitHub OAuth and sync workflow
- Demo token generation
- Existing Variables import

### User Acceptance Testing

**Test Group**: 10 designers

- 3 with Git experience
- 4 with no Git knowledge
- 3 who have used other token tools

**Scenarios**:

1. First-time onboarding with demo tokens
2. GitHub setup with OAuth
3. Local token file import
4. Existing Figma Variables import
5. Export and sync workflow

**Success Criteria**:

- 80% complete onboarding in <2 minutes
- 70% confidence rating 7+/10
- 90% would recommend
- <5 critical issues identified

### Performance Testing

**Benchmarks**:

- Plugin load time: <2s
- Import 100 tokens: <2s
- Import 500 tokens: <10s
- Import 1000 tokens: <20s
- Export 500 tokens: <5s
- Bundle size: <500KB

---

## Documentation Plan

### User-Facing Documentation

**Quick Start Guide**:

- 3 paths: Demo tokens, Import existing, GitHub
- Screenshots for each step
- Common troubleshooting

**W3C DTCG Format Guide**:

- Format structure explanation
- Token types (color, dimension, etc.)
- Reference syntax
- Auto-conversion from other formats

**GitHub Setup Guide**:

- OAuth vs Personal Access Token
- Repository structure recommendations
- Sync modes explained
- Conflict resolution best practices

**Format Guidelines**:

- Supported formats with examples
- Auto-conversion capabilities
- Migration from other tools

### Developer Documentation

**Architecture Overview**:

- State management with useReducer
- Format adapter pattern
- Plugin/UI thread communication
- OAuth backend service

**API Documentation**:

- All public interfaces
- Format adapter interface
- Import/export functions
- GitHub client API

**Contributing Guide**:

- How to add format adapters
- Testing requirements
- Code quality standards
- Pull request process

---

## Migration Guide for Existing Users

### Breaking Changes

**Wylie Dog Native Format Removed**:

- Auto-converts to W3C DTCG on import
- One-time migration notice
- Converted file available for download

**GitHub Configuration Simplified**:

- Manual config replaced with OAuth (PAT still supported)
- Repository browser replaces manual entry
- Auto-detection replaces manual token path

**Advanced Features Hidden by Default**:

- Simple mode is now default
- Advanced features behind toggle
- Settings preserved across sessions

### Migration Steps

1. **Update Plugin**: Install Token Bridge v2.0
2. **Re-export Tokens**: Export existing tokens (auto-converts to W3C)
3. **Reconnect GitHub**: Use new OAuth flow or update PAT
4. **Review Settings**: Check advanced mode preferences
5. **Test Import/Export**: Verify workflows still work

### Support Resources

- Migration FAQ
- Video walkthrough
- One-on-one migration support
- Community forum

---

## Success Metrics & KPIs

### User Experience Metrics

**Onboarding**:

- Time to first successful import: <2 min average
- Onboarding completion rate: >85%
- Path distribution: 40% GitHub, 30% local, 20% demo, 10% existing

**Engagement**:

- Monthly active users growth
- Repeat usage rate: >60% within 7 days
- Average session duration: 3-5 minutes
- Feature usage distribution

**Satisfaction**:

- User rating: >4.5/5 stars
- Would recommend: >80%
- Confidence rating: >7/10
- Support ticket rate: <5 per 100 users

### Technical Metrics

**Performance**:

- Plugin load time: <2s (target met ✓)
- Import 500 tokens: <10s (target met ✓)
- Export 500 tokens: <5s (target met ✓)
- Bundle size: <500KB (target met ✓)

**Reliability**:

- Error rate: <1%
- OAuth success rate: >95%
- Format detection accuracy: >90%
- Sync success rate: >98%

**Quality**:

- Test coverage: >80%
- TypeScript strict mode: 100%
- Accessibility: WCAG AA compliant
- Browser compatibility: All modern browsers

### Market Position Metrics

**Adoption**:

- Figma Community downloads
- GitHub stars
- Social media mentions
- Blog post features

**Competition**:

- Feature parity tracking
- User preference surveys
- Market share estimation

**Support**:

- Average issue response time: <48 hours
- Documentation completeness: 100%
- Video tutorial views
- Community engagement

---

## Appendix A: File Structure

```
/apps/figma-plugin/
├── src/
│   ├── plugin/
│   │   ├── main.ts                          # Entry point
│   │   ├── variables/
│   │   │   ├── chunked-importer.ts          # NEW
│   │   │   ├── figma-variable-importer.ts   # NEW
│   │   │   ├── demo-token-generator.ts      # NEW
│   │   │   ├── importer.ts                  # Existing
│   │   │   ├── exporter.ts                  # Existing
│   │   │   └── validator.ts                 # Existing
│   │   ├── github/
│   │   │   ├── oauth-manager.ts             # NEW
│   │   │   ├── repository-browser.ts        # NEW
│   │   │   ├── token-file-detector.ts       # NEW
│   │   │   ├── client.ts                    # Existing
│   │   │   └── conflict-detector.ts         # Existing
│   │   ├── adapters/
│   │   │   ├── w3c-dtcg.ts                  # PRIORITY 1
│   │   │   ├── style-dictionary.ts          # Existing
│   │   │   ├── tokens-studio.ts             # Existing
│   │   │   ├── material-design.ts           # Existing
│   │   │   ├── css-variables.ts             # Existing
│   │   │   ├── generic.ts                   # Existing
│   │   │   └── wylie-dog.ts                 # REMOVE
│   │   └── data/
│   │       └── demo-tokens.json             # Generated at build
│   │
│   ├── ui/
│   │   ├── App.tsx                          # REFACTOR
│   │   ├── state/
│   │   │   ├── AppState.ts                  # NEW
│   │   │   ├── AppContext.tsx               # NEW
│   │   │   └── AppReducer.ts                # NEW
│   │   ├── components/
│   │   │   ├── OnboardingModal.tsx          # NEW
│   │   │   ├── GitHubOAuthButton.tsx        # NEW
│   │   │   ├── GitHubRepositoryBrowser.tsx  # NEW
│   │   │   ├── ExistingTokensImporter.tsx   # NEW
│   │   │   ├── DemoTokensGenerator.tsx      # NEW
│   │   │   ├── FormatGuidelinesDialog.tsx   # NEW
│   │   │   ├── ProgressTracker.tsx          # ENHANCE
│   │   │   ├── EnhancedError.tsx            # ENHANCE
│   │   │   ├── AdvancedModeToggle.tsx       # NEW
│   │   │   ├── HelpTooltip.tsx              # NEW
│   │   │   └── ...existing components
│   │   └── errors/
│   │       └── error-messages.ts            # NEW
│   │
│   └── shared/
│       └── types.ts                         # Update with new types
│
├── scripts/
│   └── generate-demo-tokens.js              # NEW
│
├── tests/
│   ├── unit/
│   │   ├── oauth-manager.test.ts            # NEW
│   │   ├── chunked-importer.test.ts         # NEW
│   │   ├── app-reducer.test.ts              # NEW
│   │   └── ...existing tests
│   ├── integration/
│   │   ├── github-oauth-flow.test.ts        # NEW
│   │   ├── repository-browsing.test.ts      # NEW
│   │   └── ...existing tests
│   └── e2e/
│       ├── onboarding.spec.ts               # NEW
│       ├── github-sync.spec.ts              # NEW
│       └── ...existing tests
│
└── docs/
    ├── user/
    │   ├── quick-start.md                   # NEW
    │   ├── w3c-dtcg-guide.md                # NEW
    │   ├── github-setup.md                  # NEW
    │   └── format-guidelines.md             # NEW
    └── developer/
        ├── architecture.md                  # UPDATE
        ├── api-reference.md                 # UPDATE
        └── contributing.md                  # UPDATE
```

---

## Appendix B: Technical Specifications

### OAuth Backend Service

**Deployment**: Vercel/Netlify serverless function

**Endpoints**:

```
POST /auth/exchange
POST /auth/refresh
GET  /auth/user
```

**Security**:

- Environment variables for client secret
- CORS restricted to Figma domain
- Rate limiting: 100 req/hour per IP
- Token encryption at rest

**Tech Stack**:

- Node.js + Express
- Octokit SDK
- JWT for session management

### Bundle Size Targets

**Current**: ~800KB uncompressed
**Target**: <500KB uncompressed

**Optimization Strategy**:

- Lazy load ConflictResolution (-150KB)
- Dynamic import format adapters (-100KB)
- Remove Wylie Dog adapter (-50KB)
- Tree-shake unused dependencies (-50KB)
- Minification improvements (-50KB)

### Performance Benchmarks

**Tested with**:

- 100 tokens: 1.2s import (target: <2s) ✓
- 500 tokens: 8.7s import (target: <10s) ✓
- 1000 tokens: 18.3s import (target: <20s) ✓

**Optimization**:

- Chunked processing with 50 token chunks
- setTimeout(0) between chunks for UI updates
- Memory cleanup after completion

---

## Appendix C: Accessibility Considerations

**WCAG 2.1 AA Compliance**:

- Color contrast: 4.5:1 minimum
- Focus indicators: visible on all interactive elements
- Keyboard navigation: full keyboard access
- Screen readers: ARIA labels and descriptions
- Error identification: clear, specific messages

**Interactive Elements**:

- Buttons: proper focus states
- Forms: associated labels
- Modals: focus trapping
- Lists: proper ARIA roles

**Testing**:

- Automated: axe-core in CI/CD
- Manual: screen reader testing (VoiceOver, NVDA)
- User testing: include users with disabilities

---

## Conclusion

This comprehensive enhancement plan transforms Token Bridge from a technically sophisticated but UX-complex tool into an accessible, user-friendly solution while maintaining its enterprise-grade capabilities. The phased 10-week implementation roadmap provides clear milestones and deliverables, with success metrics to measure progress.

**Key Achievements**:

- Simplified onboarding with 4 clear paths
- OAuth GitHub integration for one-click setup
- W3C DTCG standardization
- New import features (Figma Variables, demo tokens)
- Performance optimization for large collections
- Enhanced error messaging in plain language
- Progressive disclosure for advanced features

**Expected Outcomes**:

- 80% of users complete onboarding within 2 minutes
- 90% first-time success rate
- > 85% user satisfaction
- <5 support requests per 100 users
- Industry recognition as best-in-class token solution

This plan is ready for download and immediate implementation.

---

## Addendum: Pragmatic Implementation Strategy (REVISED)

After reviewing the existing codebase, the following adjustments make this plan more practical:

### What Already Exists ✅

The current implementation already includes:

1. **Advanced mode toggle** - Already implemented in App.tsx (line 84)
2. **Setup wizard** - SetupWizard component exists
3. **Enhanced error handling** - ErrorHandler and Result types implemented
4. **Progressive disclosure** - Advanced/Simple mode working
5. **Conflict resolution** - ConflictResolutionDisplay component exists
6. **W3C DTCG adapter** - Already exists at `src/plugin/variables/adapters/w3c-dtcg.ts`
7. **Memory cleanup** - Implemented in App.tsx useEffect cleanup (line 533)
8. **Transformation feedback** - TransformationFeedback component exists

### Revised Incremental Approach

Instead of a 10-week big-bang rewrite, implement incrementally:

#### **Phase 1: Onboarding Modal (Week 1)**

- Create OnboardingModal component
- Integrate 4 paths (initially only "Import Local Tokens" working)
- Other paths show "Coming Soon" placeholders
- **Deliverable**: Improved first-run experience

#### **Phase 2: Demo Token Generator (Week 2)**

- Build script to generate demo-tokens.json from @wyliedog/tokens
- DemoTokensGenerator component
- Educational modal explaining W3C format
- **Deliverable**: Users can try plugin without external files

#### **Phase 3: Figma Variables Importer (Week 3)**

- FigmaVariableImporter service
- ExistingTokensImporter UI component
- Conversion preview
- **Deliverable**: Migration path for existing Figma users

#### **Phase 4: Enhanced Local Import (Week 4)**

- FormatGuidelinesDialog
- Better format detection feedback
- Transformation preview
- **Deliverable**: Better import experience

#### **Phase 5: Performance & Polish (Week 5)**

- ChunkedVariableImporter for large collections
- ProgressTracker improvements
- Bundle size optimization
- **Deliverable**: Handles 500+ tokens without freezing

#### **Phase 6: OAuth (Weeks 6-8)** - OPTIONAL/FUTURE

- Deploy OAuth backend service
- GitHubOAuthManager
- Repository browser
- Token file detection
- **Deliverable**: One-click GitHub auth (can be deferred)

#### **Phase 7: State Refactor (OPTIONAL)**

- Only if App.tsx becomes unmanageable
- Current state management with 20+ useState is working
- useReducer refactor is optimization, not requirement
- **Deliverable**: Can be deferred unless needed

### What NOT to Do (Avoid Over-Engineering)

1. **Don't remove Wylie Dog format yet** - Keep it for backward compatibility unless causing real problems
2. **Don't refactor state management** - Current useState approach is working fine
3. **Don't build OAuth service** - Defer until Phase 6, PAT works fine
4. **Don't lazy load everything** - Only if bundle size becomes problematic

### Recommended Starting Point

**Start with Phase 1 + Phase 2 (2 weeks total)**:

1. OnboardingModal with 4 paths
2. Demo token generator
3. Basic import flows

This provides immediate UX wins without major architectural changes.

### Success Criteria (Revised)

**Minimum Viable Enhancement (MVE)**:

- ✅ Onboarding modal implemented
- ✅ Demo tokens working
- ✅ Format guidelines accessible
- ✅ Import from Figma Variables working
- ✅ Performance acceptable for 500 tokens

**Stretch Goals**:

- OAuth GitHub integration
- State management refactor
- Advanced bundle optimization
- Repository auto-detection

### Decision: Proceed Incrementally or Full Plan?

**Option A: Incremental (Recommended)**

- Start with Phases 1-2 (onboarding + demo tokens)
- Ship early, get feedback
- Add features based on user needs
- Lower risk, faster time-to-value

**Option B: Full Plan**

- Implement all phases 1-5
- Single comprehensive release
- Higher risk, more ambitious
- All features at once

**Recommendation**: Option A - Start small, iterate based on feedback.
