import { h } from "preact";
import type { Collection, CollectionDetails } from "../../App";

interface TokensTabProps {
  collections: Collection[];
  selectedCollections: Set<string>;
  onToggleCollection: (id: string) => void;
  onViewDetails: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  loading: boolean;
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
}: TokensTabProps) {
  const hasCollections = collections.length > 0;
  const hasSelections = selectedCollections.size > 0;

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

      {/* Collection list */}
      {loading ? (
        <div
          style={{
            padding: "var(--space-8)",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          Loading collections...
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
    </div>
  );
}
