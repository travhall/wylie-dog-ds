import { h } from "preact";
import { Icon } from "../../common/Icon";

interface SyncActionCardsProps {
  loading: boolean;
  /** How many collections are ticked for a Push. */
  selectedCount: number;
  /** Why Push is unavailable, in a sentence; null when it is not. */
  pushHint: string | null;
  onPush: () => void;
  onPull: () => void;
}

const card = {
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-lg)",
  background: "var(--surface-primary)",
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 8,
} as const;

const title = {
  fontWeight: "var(--font-weight-semibold)",
  fontSize: "var(--font-size-base)",
  color: "var(--text-primary)",
} as const;

const explain = {
  fontSize: "var(--font-size-xs)",
  color: "var(--text-secondary)",
  lineHeight: "var(--line-height-relaxed)",
} as const;

/**
 * Push and Pull, each with what it does in a sentence. Both show what will
 * change before anything is written.
 */
export function SyncActionCards({
  loading,
  selectedCount,
  pushHint,
  onPush,
  onPull,
}: SyncActionCardsProps) {
  const hasSelections = selectedCount > 0;
  const pushOff = loading || !hasSelections;
  return (
    <div
      style={{
        padding: "8px 12px 4px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
      }}
    >
      <div style={card}>
        <Icon name="upload" size={20} color="var(--accent-primary)" />
        <div>
          <div style={title}>Push</div>
          <div style={explain}>
            Send the ticked collections from Figma to GitHub. You review the
            changes first.
          </div>
        </div>
        {pushHint && !loading && (
          <div
            id="push-hint"
            role="status"
            style={{ ...explain, color: "var(--text-tertiary)" }}
          >
            {pushHint}
          </div>
        )}
        <button
          onClick={onPush}
          disabled={pushOff}
          aria-describedby={pushHint ? "push-hint" : undefined}
          style={{
            height: 28,
            borderRadius: "var(--radius-sm)",
            border: `1px solid ${pushOff ? "var(--border-default)" : "var(--accent-primary)"}`,
            background: pushOff
              ? "var(--surface-secondary)"
              : "var(--accent-primary)",
            color: pushOff ? "var(--text-tertiary)" : "#fff",
            fontFamily: "var(--font-family-base)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            cursor: pushOff ? "not-allowed" : "pointer",
            opacity: pushOff ? 0.5 : 1,
            transition: "var(--transition-fast)",
          }}
        >
          {hasSelections ? `Push ${selectedCount}` : "Push"}
        </button>
      </div>

      <div style={card}>
        <Icon name="download" size={20} color="var(--accent-primary)" />
        <div>
          <div style={title}>Pull</div>
          <div style={explain}>
            Bring everything in the repository into Figma. You review the
            changes first.
          </div>
        </div>
        <button
          onClick={onPull}
          disabled={loading}
          style={{
            height: 28,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-default)",
            background: "var(--surface-primary)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-family-base)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            transition: "var(--transition-fast)",
          }}
        >
          Pull
        </button>
      </div>
    </div>
  );
}
