import { h } from "preact";
import { Icon } from "./common/Icon";
import type {
  SyncChangeItem,
  SyncChangeKind,
  SyncChangeSummary,
} from "../../plugin/sync/change-summary";

interface SyncChangesSummaryProps {
  summary: SyncChangeSummary;
  onClose: () => void;
}

const KIND_LABEL: Record<SyncChangeKind, string> = {
  changed: "Changed",
  added: "Added",
  removed: "Removed",
};

const KIND_ORDER: SyncChangeKind[] = ["changed", "added", "removed"];

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function ChangeRow({ item }: { item: SyncChangeItem }) {
  return (
    <li
      style={{
        padding: "var(--space-2) 0",
        borderBottom: "1px solid var(--border-default)",
        fontSize: "var(--font-size-xs)",
        listStyle: "none",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--text-primary)",
          wordBreak: "break-all",
        }}
      >
        <span style={{ color: "var(--text-tertiary)" }}>
          {item.collection} /{" "}
        </span>
        {item.token}
      </div>
      <div style={{ color: "var(--text-secondary)", wordBreak: "break-all" }}>
        {item.from !== undefined && <span>{item.from}</span>}
        {item.from !== undefined && item.to !== undefined && " → "}
        {item.to !== undefined && (
          <span style={{ color: "var(--text-primary)" }}>{item.to}</span>
        )}
        {item.to === undefined && " → removed"}
      </div>
    </li>
  );
}

/**
 * SyncChangesSummary - Lists what a pull changed in Figma.
 * Built from the conflicts the user resolved, so it names every token that
 * differed and what Figma holds now.
 */
export function SyncChangesSummary({
  summary,
  onClose,
}: SyncChangesSummaryProps) {
  const { applied, kept } = summary;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "var(--space-4)",
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-changes-title"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "var(--space-4)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <h3
            id="sync-changes-title"
            style={{
              margin: 0,
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <Icon name="check" size={16} color="var(--success)" />
              {applied.length > 0
                ? `${plural(applied.length, "change")} applied to Figma`
                : "No changes applied to Figma"}
            </span>
          </h3>
          <p
            style={{
              margin: "var(--space-1) 0 0 0",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
            }}
          >
            {kept.length > 0
              ? `${plural(kept.length, "difference")} kept as your Figma version.`
              : "Every difference took the GitHub version."}
          </p>
        </div>

        <div
          style={{
            padding: "var(--space-4)",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {KIND_ORDER.map((kind) => {
            const items = applied.filter((i) => i.kind === kind);
            if (items.length === 0) return null;
            return (
              <section key={kind} style={{ marginBottom: "var(--space-4)" }}>
                <h4
                  style={{
                    margin: "0 0 var(--space-1) 0",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-primary)",
                  }}
                >
                  {KIND_LABEL[kind]} ({items.length})
                </h4>
                <ul style={{ margin: 0, padding: 0 }}>
                  {items.map((item) => (
                    <ChangeRow
                      key={`${item.collection}/${item.token}`}
                      item={item}
                    />
                  ))}
                </ul>
              </section>
            );
          })}

          {kept.length > 0 && (
            <details>
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-primary)",
                }}
              >
                Kept as in Figma ({kept.length})
              </summary>
              <ul style={{ margin: 0, padding: 0 }}>
                {kept.map((item) => (
                  <ChangeRow
                    key={`${item.collection}/${item.token}`}
                    item={item}
                  />
                ))}
              </ul>
            </details>
          )}
        </div>

        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderTop: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--text-inverse)",
              backgroundColor: "var(--accent-primary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
