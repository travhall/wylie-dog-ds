// Conflict detection system for identifying sync conflicts
import type { ExportData } from "../variables/processor";
import type {
  TokenConflict,
  ConflictDetectionResult,
  ProcessedTokenWithSync,
  ExportDataWithSync,
  TokenEntry,
} from "./types";
import { SyncMetadataManager } from "./metadata-manager";
import { parse, formatHex, formatCss, differenceEuclidean } from "culori";

export class ConflictDetector {
  /**
   * Perceptual color-difference tolerance (Euclidean distance in OKLCH).
   * Colors closer than this are treated as identical — absorbs hex↔OKLCH
   * rounding so format-only changes don't register as conflicts.
   */
  static readonly COLOR_TOLERANCE = 0.002;

  private metadataManager = new SyncMetadataManager();

  /**
   * Main conflict detection entry point
   */
  detectConflicts(
    localTokens: ExportData[],
    remoteTokens: ExportData[]
  ): ConflictDetectionResult {
    // Convert to sync-aware format
    const localWithSync = this.metadataManager.addSyncMetadataToExportData(
      localTokens,
      "local"
    );
    const remoteWithSync = this.metadataManager.addSyncMetadataToExportData(
      remoteTokens,
      "remote"
    );

    // Get collection names that exist locally (selected collections)
    const localCollectionNames = new Set(
      localTokens.map((data) => Object.keys(data)[0])
    );

    // Filter remote tokens to only include collections that were selected locally
    // This prevents false conflicts when pushing only a subset of collections
    const filteredRemoteWithSync = remoteWithSync.filter((data) => {
      const collectionName = Object.keys(data)[0];
      return localCollectionNames.has(collectionName);
    });

    // console.log(
    //   `🔍 Comparing ${localCollectionNames.size} selected collections: ${Array.from(localCollectionNames).join(", ")}`
    // );

    // Create lookup maps for efficient comparison
    const localMap = this.createTokenMap(localWithSync);
    const remoteMap = this.createTokenMap(filteredRemoteWithSync);

    const conflicts: TokenConflict[] = [];

    // Detect changes in existing tokens
    for (const [tokenPath, localEntry] of localMap) {
      const remoteEntry = remoteMap.get(tokenPath);

      if (remoteEntry) {
        const conflict = this.compareTokens(tokenPath, localEntry, remoteEntry);
        if (conflict) conflicts.push(conflict);
      } else {
        // Token deleted remotely (only within selected collections)
        conflicts.push(this.createDeletionConflict(tokenPath, localEntry));
      }
    }

    // Detect new remote tokens (only within selected collections)
    for (const [tokenPath, remoteEntry] of remoteMap) {
      if (!localMap.has(tokenPath)) {
        conflicts.push(this.createAdditionConflict(tokenPath, remoteEntry));
      }
    }

    const summary = this.generateConflictSummary(conflicts);

    // console.log(
    //   `🔍 Conflict detection complete: ${conflicts.length} conflicts found`
    // );
    // console.log(
    //   `   Auto-resolvable: ${summary.autoResolvable}, Manual: ${summary.requiresManualReview}`
    // );

    return {
      conflicts,
      summary,
      localTokenCount: localMap.size,
      remoteTokenCount: remoteMap.size,
    };
  }

  /**
   * Create a map of token paths to token entries for efficient lookup
   */
  private createTokenMap(
    exportData: ExportDataWithSync[]
  ): Map<string, TokenEntry> {
    const tokenMap = new Map<string, TokenEntry>();

    for (const data of exportData) {
      for (const [collectionName, collection] of Object.entries(data)) {
        for (const [tokenName, token] of Object.entries(collection.variables)) {
          const tokenPath = `${collectionName}.${tokenName}`;
          tokenMap.set(tokenPath, {
            token,
            collection: collectionName,
            path: tokenPath,
          });
        }
      }
    }

    return tokenMap;
  }

  /**
   * Compare two tokens and detect conflicts
   */
  private compareTokens(
    tokenPath: string,
    localEntry: TokenEntry,
    remoteEntry: TokenEntry
  ): TokenConflict | null {
    const { token: localToken } = localEntry;
    const { token: remoteToken } = remoteEntry;

    // Quick hash comparison first — identical tokens are not conflicts
    const hasChanged = this.metadataManager.hasTokenChanged(
      localToken,
      remoteToken
    );
    if (!hasChanged) {
      return null; // No conflict
    }

    // Check for type changes
    const hasTypeChange = localToken.$type !== remoteToken.$type;

    // Check for value differences (primary $value OR valuesByMode)
    const hasPrimaryValueChange = this.isValueDifferent(
      localToken.$value,
      remoteToken.$value
    );
    const hasModeValueChange =
      (localToken.valuesByMode || remoteToken.valuesByMode) &&
      this.hasModeValueConflicts(localToken, remoteToken);

    // Description changes are meaningful too — e.g. the @fontSource() directive
    // on fontFamily tokens. The change hash already includes $description, so
    // without this check a description-only edit was detected as "changed" yet
    // surfaced no conflict, silently never syncing. See DESCRIPTION_SYNC_BUG.md.
    const hasDescriptionChange = this.hasDescriptionChanged(
      localToken,
      remoteToken
    );

    // If the type changed but nothing else did, this is just metadata
    // normalization (e.g. spacing→dimension) — not a real conflict.
    if (
      hasTypeChange &&
      !hasPrimaryValueChange &&
      !hasModeValueChange &&
      !hasDescriptionChange
    ) {
      return null;
    }

    // Detect specific type of conflict
    if (hasTypeChange) {
      return this.createTypeChangeConflict(tokenPath, localEntry, remoteEntry);
    }

    // If value, mode values, or description differ, create a conflict
    if (hasPrimaryValueChange || hasModeValueChange || hasDescriptionChange) {
      return this.createValueChangeConflict(tokenPath, localEntry, remoteEntry);
    }

    return null;
  }

  /**
   * Create a value change conflict
   */
  private createValueChangeConflict(
    tokenPath: string,
    localEntry: TokenEntry,
    remoteEntry: TokenEntry
  ): TokenConflict {
    const localValue = this.getDisplayValue(localEntry.token);
    const remoteValue = this.getDisplayValue(remoteEntry.token);

    // When the displayed values match, the meaningful change is the
    // description (e.g. a @fontSource() directive), so word it accordingly.
    const description =
      localValue === remoteValue
        ? `Description changed for "${tokenPath}"`
        : `Value changed: "${localValue}" → "${remoteValue}"`;

    return {
      type: "value-change",
      severity: this.assessSeverity(localEntry.token, remoteEntry.token),
      tokenName: tokenPath,
      collectionName: localEntry.collection,
      localToken: localEntry.token,
      remoteToken: remoteEntry.token,
      description,
      autoResolvable: this.isAutoResolvable(
        localEntry.token,
        remoteEntry.token
      ),
      suggestedResolution: this.suggestResolution(
        localEntry.token,
        remoteEntry.token
      ),
      conflictId: this.generateConflictId(tokenPath, "value-change"),
    };
  }

  /**
   * Create a type change conflict
   */
  private createTypeChangeConflict(
    tokenPath: string,
    localEntry: TokenEntry,
    remoteEntry: TokenEntry
  ): TokenConflict {
    return {
      type: "type-change",
      severity: "high",
      tokenName: tokenPath,
      collectionName: localEntry.collection,
      localToken: localEntry.token,
      remoteToken: remoteEntry.token,
      description: `Type changed: ${localEntry.token.$type} → ${remoteEntry.token.$type}`,
      autoResolvable: false,
      suggestedResolution: "manual",
      conflictId: this.generateConflictId(tokenPath, "type-change"),
    };
  }

  /**
   * Create a deletion conflict
   */
  private createDeletionConflict(
    tokenPath: string,
    localEntry: TokenEntry
  ): TokenConflict {
    return {
      type: "deletion",
      severity: "medium",
      tokenName: tokenPath,
      collectionName: localEntry.collection,
      localToken: localEntry.token,
      description: `Token "${tokenPath}" exists locally but was deleted remotely`,
      autoResolvable: false,
      suggestedResolution: "manual",
      conflictId: this.generateConflictId(tokenPath, "deletion"),
    };
  }

  /**
   * Create an addition conflict
   */
  private createAdditionConflict(
    tokenPath: string,
    remoteEntry: TokenEntry
  ): TokenConflict {
    return {
      type: "addition",
      severity: "low",
      tokenName: tokenPath,
      collectionName: remoteEntry.collection,
      remoteToken: remoteEntry.token,
      description: `New token "${tokenPath}" added remotely`,
      autoResolvable: true,
      suggestedResolution: "take-remote",
      conflictId: this.generateConflictId(tokenPath, "addition"),
    };
  }

  /**
   * Check if two values are different
   * Handles type coercion and normalization
   */
  private isValueDifferent(localValue: unknown, remoteValue: unknown): boolean {
    // Null/undefined handling
    if (localValue == null && remoteValue == null) return false;
    if (localValue == null || remoteValue == null) return true;

    // Type coercion for primitives (handles "100" vs 100)
    if (typeof localValue !== "object" && typeof remoteValue !== "object") {
      // Special case: Color comparison (hex vs oklch)
      if (this.looksLikeColor(localValue) || this.looksLikeColor(remoteValue)) {
        return this.areColorsDifferent(localValue, remoteValue);
      }

      // Try loose equality first (handles "100" === 100)
      if (localValue == remoteValue) return false;

      // Try string comparison (handles whitespace)
      if (String(localValue).trim() === String(remoteValue).trim()) {
        return false;
      }

      // Strict comparison as fallback
      return localValue !== remoteValue;
    }

    // Object comparison - normalize before comparing
    try {
      const normalizedLocal = this.normalizeValue(localValue);
      const normalizedRemote = this.normalizeValue(remoteValue);
      return (
        JSON.stringify(normalizedLocal) !== JSON.stringify(normalizedRemote)
      );
    } catch (e) {
      // Fallback to simple stringify if normalization fails
      return JSON.stringify(localValue) !== JSON.stringify(remoteValue);
    }
  }

  /**
   * Normalize a value for comparison (sort object keys, trim strings)
   */
  private normalizeValue(value: unknown): unknown {
    if (value == null) return value;

    if (typeof value === "string") {
      return value.trim();
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.map((v) => this.normalizeValue(v));
      }

      // Sort object keys for consistent comparison
      const sorted: Record<string, unknown> = {};
      const record = value as Record<string, unknown>;
      Object.keys(record)
        .sort()
        .forEach((key) => {
          sorted[key] = this.normalizeValue(record[key]);
        });
      return sorted;
    }

    return value;
  }

  /**
   * Check if a value looks like a color (hex or oklch format)
   */
  private looksLikeColor(value: unknown): boolean {
    if (typeof value !== "string") return false;
    const str = value.trim();
    return (
      str.startsWith("#") || // hex: #fff, #ffffff
      str.startsWith("oklch(") || // oklch: oklch(0.5 0.1 180)
      str.startsWith("rgb(") || // rgb: rgb(255, 255, 255)
      str.startsWith("hsl(") // hsl: hsl(180, 50%, 50%)
    );
  }

  /**
   * Compare two color values with format normalization
   * Returns true if colors are different, false if they're the same
   */
  private areColorsDifferent(
    localValue: unknown,
    remoteValue: unknown
  ): boolean {
    try {
      // Parse both colors using culori
      const localColor = parse(String(localValue));
      const remoteColor = parse(String(remoteValue));

      // If either failed to parse, fall back to string comparison
      if (!localColor || !remoteColor) {
        console.warn(
          `⚠️ Color parse failed - Local: ${localValue}, Remote: ${remoteValue}`
        );
        return String(localValue).trim() !== String(remoteValue).trim();
      }

      // Calculate perceptual difference (0 = identical, 1 = maximally different)
      // using Euclidean distance in OKLCH space. Tolerance of 0.002 accounts for
      // hex→OKLCH conversion rounding — imperceptible to humans, so colors within
      // it are treated as identical to avoid false conflicts on format changes.
      const diff = differenceEuclidean()(localColor, remoteColor);
      return diff > ConflictDetector.COLOR_TOLERANCE;
    } catch (error) {
      console.error("Color comparison error:", error);
      // Fallback to string comparison on error
      return String(localValue).trim() !== String(remoteValue).trim();
    }
  }

  /**
   * Detect a change in a token's $description. Normalizes away things that are
   * NOT stored on Figma variables and would otherwise produce perpetual false
   * "changes" on every status check:
   *   - the embedded sync-metadata marker
   *   - code-only `@directive(...)` annotations (e.g. `@fontSource(...)`), which
   *     live in the repo for build tooling only — like line-height tokens, they
   *     don't round-trip to Figma, so their presence in the repo isn't a change.
   * Empty/undefined are treated as equivalent.
   */
  private hasDescriptionChanged(
    localToken: ProcessedTokenWithSync,
    remoteToken: ProcessedTokenWithSync
  ): boolean {
    const clean = (d?: string) =>
      (d ?? "")
        .replace(/\s*<!-- SYNC_METADATA:[\s\S]*?-->/, "")
        .replace(/@\w+\([^)]*\)/g, "")
        .trim();
    return clean(localToken.$description) !== clean(remoteToken.$description);
  }

  /**
   * Check for conflicts in valuesByMode
   */
  private hasModeValueConflicts(
    localToken: ProcessedTokenWithSync,
    remoteToken: ProcessedTokenWithSync
  ): boolean {
    const localModes = localToken.valuesByMode || {};
    const remoteModes = remoteToken.valuesByMode || {};

    // Get all unique mode names
    const allModes = new Set([
      ...Object.keys(localModes),
      ...Object.keys(remoteModes),
    ]);

    for (const mode of allModes) {
      const localValue = localModes[mode];
      const remoteValue = remoteModes[mode];

      if (localValue !== undefined && remoteValue !== undefined) {
        if (this.isValueDifferent(localValue, remoteValue)) {
          return true;
        }
      } else if (localValue !== remoteValue) {
        // One has the mode, the other doesn't
        return true;
      }
    }

    return false;
  }

  /**
   * Assess the severity of a conflict
   */
  private assessSeverity(
    localToken: ProcessedTokenWithSync,
    remoteToken: ProcessedTokenWithSync
  ): "low" | "medium" | "high" {
    // Type changes are always high severity
    if (localToken.$type !== remoteToken.$type) {
      return "high";
    }

    // Color changes are medium severity
    if (localToken.$type === "color") {
      return "medium";
    }

    // Spacing and sizing changes are medium severity
    if (["spacing", "sizing", "dimension"].includes(localToken.$type)) {
      return "medium";
    }

    // Everything else is low severity
    return "low";
  }

  /**
   * Determine if a conflict is auto-resolvable
   */
  private isAutoResolvable(
    localToken: ProcessedTokenWithSync,
    remoteToken: ProcessedTokenWithSync
  ): boolean {
    // Type changes require manual resolution
    if (localToken.$type !== remoteToken.$type) {
      return false;
    }

    // Simple value changes can be auto-resolved
    if (
      typeof localToken.$value !== "object" &&
      typeof remoteToken.$value !== "object"
    ) {
      return true;
    }

    // Complex changes need manual review
    return false;
  }

  /**
   * Suggest a resolution strategy
   */
  private suggestResolution(
    localToken: ProcessedTokenWithSync,
    remoteToken: ProcessedTokenWithSync
  ): "take-local" | "take-remote" | "manual" {
    // If not auto-resolvable, require manual resolution
    if (!this.isAutoResolvable(localToken, remoteToken)) {
      return "manual";
    }

    // Prefer newer changes based on lastModified
    const localModified = localToken.$syncMetadata?.lastModified;
    const remoteModified = remoteToken.$syncMetadata?.lastModified;

    if (localModified && remoteModified) {
      return new Date(localModified) > new Date(remoteModified)
        ? "take-local"
        : "take-remote";
    }

    // Default to remote if we can't determine timing
    return "take-remote";
  }

  /**
   * Get display value for conflict description
   */
  private getDisplayValue(token: ProcessedTokenWithSync): string {
    if (token.valuesByMode && Object.keys(token.valuesByMode).length > 0) {
      const modes = Object.keys(token.valuesByMode);
      return `${modes.length} mode values`;
    }

    if (typeof token.$value === "object") {
      return JSON.stringify(token.$value);
    }

    return String(token.$value);
  }

  /**
   * Generate conflict summary statistics
   */
  private generateConflictSummary(conflicts: TokenConflict[]) {
    return {
      total: conflicts.length,
      autoResolvable: conflicts.filter((c) => c.autoResolvable).length,
      requiresManualReview: conflicts.filter((c) => !c.autoResolvable).length,
      highSeverity: conflicts.filter((c) => c.severity === "high").length,
    };
  }

  /**
   * Generate unique conflict ID
   */
  private generateConflictId(tokenPath: string, type: string): string {
    return `conflict_${type}_${tokenPath}`;
  }
}
