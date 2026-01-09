import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import type {
  Collection,
  CollectionDetails,
} from "../../hooks/usePluginMessages";
import { EmptyTokensState } from "../EmptyTokensState";
import { CollectionSkeleton } from "../common/Skeleton";
import { TokenBrowser } from "../TokenBrowser";

interface TokensTabProps {
  collections: Collection[];
  selectedCollections: Set<string>;
  onToggleCollection: (id: string) => void;
  onViewDetails: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  loading: boolean;
  // Collection details for TokenBrowser
  selectedCollection?: CollectionDetails | null;
  // Enhanced empty state actions
  onImportFile?: () => void;
  onGenerateDemoTokens?: () => void;
  onSetupGitHub?: () => void;
  githubConfigured?: boolean;
  // Export actions
  onDownloadJSON?: () => void;
  onPushToGitHub?: () => void;
}

/**
 * TokensTab - Displays and manages token collections
 * Primary actions: Select collections, view details
 */
export function TokensTab({
  collections,
  selectedCollections,
  onToggleCollection,
  onViewDetails,
  onSelectAll,
  onDeselectAll,
  loading,
  selectedCollection,
  onImportFile,
  onGenerateDemoTokens,
  onSetupGitHub,
  githubConfigured = false,
  onDownloadJSON,
  onPushToGitHub,
}: TokensTabProps) {
  const hasCollections = collections.length > 0;
  const hasSelections = selectedCollections.size > 0;

  // State for TokenBrowser modal
  const [browserCollection, setBrowserCollection] = useState<{
    name: string;
    tokens: Record<string, any>;
    modes: Array<{ modeId: string; name: string }>;
  } | null>(null);

  // Helper to convert Figma RGB (0-1) to hex
  const rgbToHex = (color: { r: number; g: number; b: number }): string => {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  // Transform Variable[] to ProcessedToken format for TokenBrowser
  const prepareTokensForBrowser = (collectionDetails: CollectionDetails) => {
    const tokens: Record<string, any> = {};

    collectionDetails.variables.forEach((variable) => {
      // Infer W3C DTCG type from Figma type
      let $type = "string";
      switch (variable.resolvedType) {
        case "COLOR":
          $type = "color";
          break;
        case "FLOAT":
          // Infer from scopes
          if (variable.scopes.includes("FONT_SIZE")) {
            $type = "fontSize";
          } else if (variable.scopes.includes("LINE_HEIGHT")) {
            $type = "lineHeight";
          } else if (variable.scopes.includes("LETTER_SPACING")) {
            $type = "letterSpacing";
          } else if (
            variable.scopes.includes("GAP") ||
            variable.scopes.includes("PADDING") ||
            variable.scopes.includes("SPACING")
          ) {
            $type = "spacing";
          } else if (
            variable.scopes.includes("WIDTH") ||
            variable.scopes.includes("HEIGHT")
          ) {
            $type = "dimension";
          } else if (variable.scopes.includes("CORNER_RADIUS")) {
            $type = "borderRadius";
          } else {
            $type = "number";
          }
          break;
        case "STRING":
          if (variable.scopes.includes("FONT_FAMILY")) {
            $type = "fontFamily";
          } else if (variable.scopes.includes("FONT_WEIGHT")) {
            $type = "fontWeight";
          } else {
            $type = "string";
          }
          break;
        case "BOOLEAN":
          $type = "boolean";
          break;
      }

      // Use first mode's value (or enhance later to support mode selection)
      const firstModeId = collectionDetails.modes[0]?.modeId;
      let $value = firstModeId ? variable.valuesByMode[firstModeId] : null;

      // Convert Figma color format to hex for display
      if (
        $type === "color" &&
        $value &&
        typeof $value === "object" &&
        "r" in $value
      ) {
        $value = rgbToHex($value);
      }

      // Add px suffix for spacing/dimension values if needed
      if (
        ($type === "spacing" ||
          $type === "dimension" ||
          $type === "fontSize") &&
        typeof $value === "number"
      ) {
        $value = `${$value}px`;
      }

      tokens[variable.name] = {
        $type,
        $value,
        $description: variable.description,
      };
    });

    return tokens;
  };

  // Handle view details click
  const handleViewDetails = (collectionId: string) => {
    onViewDetails(collectionId);
  };

  // Open TokenBrowser when selectedCollection is loaded
  useEffect(() => {
    if (selectedCollection) {
      const tokens = prepareTokensForBrowser(selectedCollection);
      setBrowserCollection({
        name: selectedCollection.name,
        tokens,
        modes: selectedCollection.modes,
      });
    }
  }, [selectedCollection]);

  return (
    <div
      role="tabpanel"
      id="tokens-panel"
      aria-labelledby="tokens-tab"
      style={{
        padding: "var(--space-4) 0",
      }}
    >
      {/* Header with bulk actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-4)",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--text-primary)",
          }}
        >
          Token Collections ({collections.length})
        </h3>
        {hasCollections && (
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              onClick={onSelectAll}
              disabled={loading}
              style={{
                padding: "var(--space-1) var(--space-2)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--text-secondary)",
                backgroundColor: "transparent",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "var(--transition-base)",
              }}
            >
              Select All
            </button>
            <button
              onClick={onDeselectAll}
              disabled={loading || !hasSelections}
              style={{
                padding: "var(--space-1) var(--space-2)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--text-secondary)",
                backgroundColor: "transparent",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                cursor: loading || !hasSelections ? "not-allowed" : "pointer",
                transition: "var(--transition-base)",
                opacity: hasSelections ? 1 : 0.5,
              }}
            >
              Deselect All
            </button>
          </div>
        )}
      </div>

      {/* Export actions - show when selections exist */}
      {hasSelections && onDownloadJSON && onPushToGitHub && (
        <div
          style={{
            marginBottom: "var(--space-4)",
            padding: "var(--space-3)",
            backgroundColor: "var(--info-light)",
            border: "1px solid var(--info)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              marginBottom: "var(--space-2)",
            }}
          >
            {selectedCollections.size} collection
            {selectedCollections.size !== 1 ? "s" : ""} selected
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              onClick={onDownloadJSON}
              disabled={loading}
              style={{
                flex: 1,
                padding: "var(--space-2) var(--space-3)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--text-inverse)",
                backgroundColor: "var(--accent-primary)",
                border: "none",
                borderRadius: "var(--radius-md)",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "var(--transition-base)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor =
                    "var(--accent-primary-hover)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-primary)";
              }}
            >
              💾 Download JSON
            </button>
            <button
              onClick={onPushToGitHub}
              disabled={loading || !githubConfigured}
              style={{
                flex: 1,
                padding: "var(--space-2) var(--space-3)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                color:
                  loading || !githubConfigured
                    ? "var(--text-tertiary)"
                    : "var(--text-inverse)",
                backgroundColor:
                  loading || !githubConfigured
                    ? "var(--surface-secondary)"
                    : "var(--accent-primary)",
                border: "none",
                borderRadius: "var(--radius-md)",
                cursor:
                  loading || !githubConfigured ? "not-allowed" : "pointer",
                transition: "var(--transition-base)",
                opacity: loading || !githubConfigured ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading && githubConfigured) {
                  e.currentTarget.style.backgroundColor =
                    "var(--accent-primary-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (githubConfigured) {
                  e.currentTarget.style.backgroundColor =
                    "var(--accent-primary)";
                }
              }}
            >
              📤 {githubConfigured ? "Push to GitHub" : "Connect GitHub"}
            </button>
          </div>
        </div>
      )}

      {/* Collection list */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <CollectionSkeleton />
          <CollectionSkeleton />
          <CollectionSkeleton />
        </div>
      ) : hasCollections ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          {collections.map((collection) => {
            const isSelected = selectedCollections.has(collection.id);
            return (
              <div
                key={collection.id}
                onClick={() => onToggleCollection(collection.id)}
                style={{
                  padding: "var(--space-3)",
                  border: `2px solid ${isSelected ? "var(--accent-primary)" : "var(--border-default)"}`,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: isSelected
                    ? "var(--info-light)"
                    : "var(--surface-primary)",
                  cursor: "pointer",
                  transition: "var(--transition-base)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      {collection.name}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {collection.variableIds.length} tokens •{" "}
                      {collection.modes.length} mode
                      {collection.modes.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(collection.id);
                    }}
                    style={{
                      padding: "var(--space-1) var(--space-3)",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-medium)",
                      color: "var(--accent-primary)",
                      backgroundColor: "transparent",
                      border: "1px solid var(--accent-primary)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      transition: "var(--transition-base)",
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : onImportFile && onGenerateDemoTokens && onSetupGitHub ? (
        <EmptyTokensState
          onImportFile={onImportFile}
          onGenerateDemoTokens={onGenerateDemoTokens}
          onSetupGitHub={onSetupGitHub}
          githubConfigured={githubConfigured}
        />
      ) : (
        <div
          style={{
            padding: "var(--space-8)",
            textAlign: "center",
            color: "var(--text-secondary)",
            backgroundColor: "var(--surface-secondary)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-lg)",
              marginBottom: "var(--space-2)",
            }}
          >
            No token collections found
          </div>
          <div style={{ fontSize: "var(--font-size-xs)" }}>
            Create variable collections in Figma to get started
          </div>
        </div>
      )}

      {/* Selection summary */}
      {hasSelections && (
        <div
          style={{
            marginTop: "var(--space-4)",
            padding: "var(--space-3)",
            backgroundColor: "var(--info-light)",
            border: "1px solid var(--info)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
          }}
        >
          <strong style={{ color: "var(--text-primary)" }}>
            {selectedCollections.size}
          </strong>{" "}
          collection{selectedCollections.size !== 1 ? "s" : ""} selected
        </div>
      )}

      {/* TokenBrowser Modal */}
      {browserCollection && (
        <TokenBrowser
          collectionName={browserCollection.name}
          tokens={browserCollection.tokens}
          modes={browserCollection.modes}
          onClose={() => setBrowserCollection(null)}
        />
      )}
    </div>
  );
}
