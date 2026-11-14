import { h } from "preact";
import { Icon } from "../../common/Icon";

export interface SelectableCollection {
  id: string;
  name: string;
  variableCount: number;
}

interface CollectionSelectorProps {
  collections: SelectableCollection[];
  selected: Set<string>;
  /** Names of collections that changed in Figma since the last sync. */
  changedNames?: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

const linkButton = {
  color: "var(--accent-primary)",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
  fontSize: "var(--font-size-xs)",
} as const;

/** The collections a Push sends: tick the ones to push. */
export function CollectionSelector({
  collections,
  selected,
  changedNames,
  onToggle,
  onSelectAll,
  onClear,
}: CollectionSelectorProps) {
  if (collections.length === 0) return null;
  return (
    <div style={{ padding: "12px 12px 8px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontWeight: "var(--font-weight-semibold)",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-primary)",
          }}
        >
          Collections to push
        </span>
        <span style={{ fontSize: "var(--font-size-xs)" }}>
          <button onClick={onSelectAll} style={linkButton}>
            Select all
          </button>
          <span style={{ margin: "0 6px", color: "var(--border-strong)" }}>
            ·
          </span>
          <button onClick={onClear} style={linkButton}>
            Clear
          </button>
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {collections.map((collection) => {
          const isSelected = selected.has(collection.id);
          const changed = changedNames?.has(collection.name) ?? false;
          return (
            <div
              key={collection.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 4px",
                borderRadius: 3,
                cursor: "pointer",
              }}
              onClick={() => onToggle(collection.id)}
            >
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
                {isSelected && <Icon name="check" size={10} color="#fff" />}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-family-mono)",
                  fontSize: "var(--font-size-sm)",
                  flex: 1,
                  color: "var(--text-primary)",
                }}
              >
                {collection.name}
              </span>
              {changed && (
                <span
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--warning)",
                  }}
                >
                  changed in Figma
                </span>
              )}
              <span
                style={{
                  fontFamily: "var(--font-family-mono)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-tertiary)",
                }}
              >
                {collection.variableCount}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
