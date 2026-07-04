import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import type {
  Collection,
  CollectionDetails,
} from "../../hooks/usePluginMessages";
import { EmptyTokensState } from "../EmptyTokensState";
import { CollectionSkeleton } from "../common/Skeleton";
import { TokenBrowser } from "../TokenBrowser";
import { Icon } from "../common/Icon";
import { useUIContext } from "../../state";

interface TokensTabProps {
  collections: Collection[];
  onToggleCollection: (id: string) => void;
  onViewDetails: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  loading: boolean;
  selectedCollection?: CollectionDetails | null;
  onCloseDetails?: () => void;
  onImportFile?: () => void;
  onGenerateDemoTokens?: () => void;
  onSetupGitHub?: () => void;
  githubConfigured?: boolean;
  onDownloadJSON?: () => void;
  onPushToGitHub?: () => void;
}

/** Accent colors cycling across collection cards (light / dark auto via CSS vars) */
const BAR_COLORS = [
  "var(--accent-primary)",
  "var(--success)",
  "var(--warning)",
  "var(--error)",
];

/**
 * TokensTab — displays and manages token collections.
 * Collection cards have a colored left-indicator bar.
 * Export actions surface in a sticky bottom footer when selections > 0.
 */
export function TokensTab({
  collections,
  onToggleCollection,
  onViewDetails,
  onSelectAll,
  onDeselectAll,
  loading,
  selectedCollection,
  onCloseDetails,
  onImportFile,
  onGenerateDemoTokens,
  onSetupGitHub,
  githubConfigured = false,
  onDownloadJSON,
  onPushToGitHub,
}: TokensTabProps) {
  const { state: uiState } = useUIContext();
  const selectedCollections = uiState.selectedCollections;
  const hasCollections = collections.length > 0;
  const hasSelections = selectedCollections.size > 0;

  const [browserCollection, setBrowserCollection] = useState<{
    name: string;
    tokens: Record<string, any>;
    modes: Array<{ modeId: string; name: string }>;
  } | null>(null);

  const rgbToHex = (color: { r: number; g: number; b: number }): string => {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const prepareTokensForBrowser = (collectionDetails: CollectionDetails) => {
    const tokens: Record<string, any> = {};
    collectionDetails.variables.forEach((variable) => {
      let $type = "string";
      switch (variable.resolvedType) {
        case "COLOR":
          $type = "color";
          break;
        case "FLOAT":
          if (variable.scopes.includes("FONT_SIZE")) $type = "fontSize";
          else if (variable.scopes.includes("LINE_HEIGHT"))
            $type = "lineHeight";
          else if (variable.scopes.includes("LETTER_SPACING"))
            $type = "letterSpacing";
          else if (
            variable.scopes.includes("GAP") ||
            variable.scopes.includes("PADDING") ||
            variable.scopes.includes("SPACING")
          )
            $type = "spacing";
          else if (
            variable.scopes.includes("WIDTH") ||
            variable.scopes.includes("HEIGHT")
          )
            $type = "dimension";
          else if (variable.scopes.includes("CORNER_RADIUS"))
            $type = "borderRadius";
          else $type = "number";
          break;
        case "STRING":
          if (variable.scopes.includes("FONT_FAMILY")) $type = "fontFamily";
          else if (variable.scopes.includes("FONT_WEIGHT"))
            $type = "fontWeight";
          else $type = "string";
          break;
        case "BOOLEAN":
          $type = "boolean";
          break;
      }

      const $valuesByMode: Record<string, any> = {};
      collectionDetails.modes.forEach((mode) => {
        let modeValue = variable.valuesByMode[mode.modeId];
        if (
          $type === "color" &&
          modeValue &&
          typeof modeValue === "object" &&
          "r" in modeValue
        ) {
          modeValue = rgbToHex(modeValue);
        }
        if (
          ($type === "spacing" ||
            $type === "dimension" ||
            $type === "fontSize") &&
          typeof modeValue === "number"
        ) {
          modeValue = `${modeValue}px`;
        }
        $valuesByMode[mode.modeId] = modeValue;
      });

      const firstModeId = collectionDetails.modes[0]?.modeId;
      const $value = firstModeId ? $valuesByMode[firstModeId] : null;

      tokens[variable.name] = {
        $type,
        $value,
        $valuesByMode,
        $description: variable.description,
      };
    });
    return tokens;
  };

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
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          borderBottom: "1px solid var(--border-default)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-family-mono)",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
          }}
        >
          {collections.length} collection{collections.length !== 1 ? "s" : ""}
        </span>
        {hasCollections && (
          <div style={{ display: "flex", gap: 6 }}>
            <GhostButton onClick={onSelectAll} disabled={loading}>
              Select all
            </GhostButton>
            <GhostButton
              onClick={onDeselectAll}
              disabled={loading || !hasSelections}
            >
              Clear
            </GhostButton>
          </div>
        )}
      </div>

      {/* Collection list (scrollable) */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {loading ? (
          <>
            <CollectionSkeleton />
            <CollectionSkeleton />
            <CollectionSkeleton />
          </>
        ) : hasCollections ? (
          collections.map((collection, idx) => {
            const isSelected = selectedCollections.has(collection.id);
            const barColor = BAR_COLORS[idx % BAR_COLORS.length];
            return (
              <div
                key={collection.id}
                onClick={() => onToggleCollection(collection.id)}
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  border: `1px solid ${isSelected ? "var(--accent-primary)" : "var(--border-default)"}`,
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  background: isSelected
                    ? "var(--accent-tint)"
                    : "var(--surface-primary)",
                  cursor: "pointer",
                  transition: "var(--transition-fast)",
                }}
              >
                {/* Left color bar */}
                <div
                  style={{
                    width: 4,
                    flexShrink: 0,
                    background: isSelected ? "var(--accent-primary)" : barColor,
                  }}
                />

                {/* Card content */}
                <div
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-family-mono)",
                        fontWeight: "var(--font-weight-medium)",
                        fontSize: "var(--font-size-base)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {collection.name}
                    </span>
                    {/* Checkbox */}
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        flexShrink: 0,
                        border: `1.5px solid ${isSelected ? "var(--accent-primary)" : "var(--border-strong)"}`,
                        background: isSelected
                          ? "var(--accent-primary)"
                          : "transparent",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {isSelected && (
                        <Icon name="check" size={10} color="#fff" />
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-family-mono)",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {collection.variableIds.length} tokens ·{" "}
                      {collection.modes.length} mode
                      {collection.modes.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(collection.id);
                      }}
                      style={{
                        fontFamily: "var(--font-family-mono)",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--accent-primary)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      View →
                    </button>
                  </div>
                </div>
              </div>
            );
          })
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
      </div>

      {/* Sticky export footer — visible when selections > 0 */}
      {hasSelections && onDownloadJSON && onPushToGitHub && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "var(--surface-elevated)",
            borderTop: "1px solid var(--border-default)",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
            }}
          >
            {selectedCollections.size} selected
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={onDownloadJSON}
              disabled={loading}
              style={{
                height: 28,
                padding: "0 10px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                background: "var(--surface-primary)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-family-base)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                cursor: loading ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Icon name="download" size={12} />
              JSON
            </button>
            <button
              onClick={onPushToGitHub}
              disabled={loading || !githubConfigured}
              style={{
                height: 28,
                padding: "0 10px",
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${loading || !githubConfigured ? "var(--border-default)" : "var(--accent-primary)"}`,
                background:
                  loading || !githubConfigured
                    ? "var(--surface-secondary)"
                    : "var(--accent-primary)",
                color:
                  loading || !githubConfigured
                    ? "var(--text-tertiary)"
                    : "#fff",
                fontFamily: "var(--font-family-base)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                cursor:
                  loading || !githubConfigured ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                opacity: loading || !githubConfigured ? 0.5 : 1,
              }}
            >
              <Icon name="github" size={12} />
              {githubConfigured ? "Push" : "Connect GitHub"}
            </button>
          </div>
        </div>
      )}

      {/* TokenBrowser modal */}
      {browserCollection && (
        <TokenBrowser
          collectionName={browserCollection.name}
          tokens={browserCollection.tokens}
          modes={browserCollection.modes}
          onClose={() => {
            setBrowserCollection(null);
            // Clear the parent's selectedCollection too — it's otherwise still
            // set on the next remount (e.g. the tab-switch after a pull
            // completes) and this effect would reopen the modal unprompted.
            onCloseDetails?.();
          }}
        />
      )}
    </div>
  );
}

/** Small ghost button for header bar actions */
function GhostButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: any;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 24,
        padding: "0 8px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-default)",
        background: "var(--surface-primary)",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-family-base)",
        fontSize: "var(--font-size-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}
