import { h } from "preact";
import type { ComponentChildren } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { Icon } from "./common/Icon";
import { ColorSwatch, isColorValue } from "./common/ColorSwatch";
import type {
  DiffKind,
  DiffRow,
  SyncDiff,
  TokenView,
} from "../../plugin/sync/sync-diff";

export interface DiffReviewProps {
  diff: SyncDiff;
  /** Branch the sync targets, for the button label. */
  branch?: string;
  /** Push only: sync mode is "pull request", so nothing lands on the branch. */
  prMode?: boolean;
  /** Absent for the read-only overview. */
  onConfirm?: () => void;
  /** Pull: open the per-token conflict list instead. */
  onAdvanced?: () => void;
  /** Pull: push Figma's own edits first. */
  onPushFirst?: () => void;
  onClose: () => void;
}

const PAGE_SIZE = 100;
const FILTER_THRESHOLD = 8;

const KIND_ORDER: DiffKind[] = ["removed", "changed", "renamed", "added"];

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function destinationName(diff: SyncDiff): string {
  return diff.direction === "pull" ? "Figma" : "GitHub";
}

function groupTitle(kind: DiffKind, diff: SyncDiff): string {
  const dest = destinationName(diff);
  switch (kind) {
    case "removed":
      return `Will be removed from ${dest}`;
    case "changed":
      return `Will be changed on ${dest}`;
    case "renamed":
      return `Will be renamed on ${dest}`;
    case "added":
      return `Will be added to ${dest}`;
  }
}

function sideLabel(row: DiffRow, diff: SyncDiff): string | null {
  if (row.side === "unknown") return null;
  if (row.side === "both") return "Changed on both sides";
  if (diff.direction === "pull" && row.overwritesFigma) {
    return "Overwrites your Figma edit";
  }
  if (diff.direction === "overview") {
    return row.side === "local" ? "Figma edit" : "GitHub edit";
  }
  return null;
}

function ValueView({ view }: { view: TokenView }) {
  const code = {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size-xs)",
    color: "var(--text-primary)",
    wordBreak: "break-all" as const,
    display: "flex",
    alignItems: "center",
  };
  if (view.modes) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {view.modes.map(({ mode, value }) => (
          <code key={mode} style={code}>
            {isColorValue(value) && <ColorSwatch value={value} />}
            <span style={{ color: "var(--text-tertiary)" }}>{mode}:</span>
            &nbsp;{value}
          </code>
        ))}
      </div>
    );
  }
  return (
    <code style={code}>
      {isColorValue(view.value) && <ColorSwatch value={view.value} />}
      {view.value}
    </code>
  );
}

function Row({ row, diff }: { row: DiffRow; diff: SyncDiff }) {
  const tag = sideLabel(row, diff);
  const name =
    row.kind === "renamed" ? (
      <span>
        {row.fromName}{" "}
        <span aria-label="renamed to" style={{ color: "var(--text-tertiary)" }}>
          →
        </span>{" "}
        {row.toName}
      </span>
    ) : (
      row.toName
    );
  return (
    <li
      style={{
        listStyle: "none",
        padding: "var(--space-2) 0",
        borderBottom: "1px solid var(--border-default)",
        fontSize: "var(--font-size-xs)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--text-primary)",
            wordBreak: "break-all",
          }}
        >
          {name}
        </span>
        {tag && (
          <span
            style={{
              color: "var(--warning)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            {tag}
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          alignItems: "flex-start",
          marginTop: 2,
          flexWrap: "wrap",
        }}
      >
        {row.from && row.kind !== "added" && (
          <div
            style={{
              opacity: row.kind === "removed" ? 1 : 0.75,
              textDecoration: row.kind === "removed" ? "line-through" : "none",
            }}
          >
            <ValueView view={row.from} />
          </div>
        )}
        {row.from && row.to && (
          <span aria-hidden="true" style={{ color: "var(--text-tertiary)" }}>
            →
          </span>
        )}
        {row.to && (
          <div>
            <ValueView view={row.to} />
          </div>
        )}
      </div>
      {row.notes.length > 0 && (
        <div style={{ color: "var(--text-tertiary)", marginTop: 2 }}>
          {row.notes.join(" · ")}
        </div>
      )}
    </li>
  );
}

function headline(diff: SyncDiff): string {
  const n = diff.rows.length;
  if (diff.direction === "pull") {
    return n === 0
      ? "Nothing to pull"
      : `Pull will change ${plural(n, "token")} in Figma`;
  }
  if (diff.direction === "overview") {
    return n === 0
      ? "Figma and GitHub are in sync"
      : `${plural(n, "difference")} between Figma and GitHub`;
  }
  return n === 0
    ? "Nothing to push"
    : `Push will change ${plural(n, "token")} on GitHub`;
}

function emptyMessage(diff: SyncDiff): string {
  if (diff.direction === "pull") {
    return "Figma already matches GitHub, so a Pull would change nothing.";
  }
  if (diff.direction === "overview") {
    return "Figma and GitHub hold the same tokens.";
  }
  return "GitHub already holds everything Figma has, so a Push would change nothing.";
}

/**
 * DiffReview - what a Push or Pull will change, token by token, before it
 * writes anything. Also serves as a read-only overview of the differences.
 */
export function DiffReview({
  diff,
  branch,
  prMode,
  onConfirm,
  onAdvanced,
  onPushFirst,
  onClose,
}: DiffReviewProps) {
  const [filter, setFilter] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [acknowledged, setAcknowledged] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes; Tab stays inside the dialog.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    // Focus the safe action, not the one that writes.
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const needle = filter.trim().toLowerCase();
  const matching = useMemo(
    () =>
      needle
        ? diff.rows.filter((r) =>
            `${r.collection} ${r.fromName} ${r.toName}`
              .toLowerCase()
              .includes(needle)
          )
        : diff.rows,
    [diff.rows, needle]
  );
  const visible = matching.slice(0, limit);

  const needsAck = diff.direction === "pull" && diff.deletions.length > 0;
  const canConfirm = !!onConfirm && diff.rows.length > 0;
  const confirmDisabled = needsAck && !acknowledged;

  const confirmLabel =
    diff.direction === "pull"
      ? "Pull from GitHub"
      : prMode
        ? "Open pull request"
        : `Push to ${branch ?? "GitHub"}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "var(--space-4)",
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="diff-review-title"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div
          style={{
            padding: "var(--space-4)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <h3
            id="diff-review-title"
            style={{
              margin: 0,
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
            }}
          >
            {headline(diff)}
          </h3>
          {diff.hasBaseline && diff.rows.length > 0 && (
            <p
              style={{
                margin: "var(--space-1) 0 0",
                fontSize: "var(--font-size-sm)",
                color: "var(--text-secondary)",
              }}
            >
              {[
                diff.counts.toPush > 0 && `${diff.counts.toPush} to push`,
                diff.counts.toPull > 0 && `${diff.counts.toPull} to pull`,
                diff.counts.conflicts > 0 &&
                  plural(diff.counts.conflicts, "conflict"),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>

        <div style={{ padding: "var(--space-4)", overflowY: "auto", flex: 1 }}>
          {diff.direction === "push" && prMode && (
            <Notice>
              This opens a pull request
              {branch ? ` against ${branch}` : ""}. Nothing changes
              {branch ? ` on ${branch}` : ""} until it is merged.
            </Notice>
          )}
          {!diff.hasBaseline && diff.rows.length > 0 && (
            <Notice>
              There is no record of the last sync, so these are plain
              differences and the direction is unknown. Pull or Push once to set
              a baseline.
            </Notice>
          )}
          {diff.direction === "pull" && diff.overwrites.length > 0 && (
            <Notice>
              {plural(diff.overwrites.length, "change")} made in Figma since the
              last sync will be overwritten. Push first to keep them.
            </Notice>
          )}

          {diff.rows.length === 0 ? (
            <p
              role="status"
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {emptyMessage(diff)}
            </p>
          ) : (
            <>
              {diff.rows.length > FILTER_THRESHOLD && (
                <input
                  type="search"
                  aria-label="Filter tokens"
                  placeholder="Filter by name or collection"
                  value={filter}
                  onInput={(e) => {
                    setFilter((e.target as HTMLInputElement).value);
                    setLimit(PAGE_SIZE);
                  }}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    marginBottom: "var(--space-3)",
                    padding: "var(--space-1) var(--space-2)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface-secondary)",
                    color: "var(--text-primary)",
                    fontSize: "var(--font-size-sm)",
                  }}
                />
              )}
              {matching.length === 0 && (
                <p role="status" style={{ color: "var(--text-secondary)" }}>
                  No tokens match "{filter}".
                </p>
              )}
              {KIND_ORDER.map((kind) => {
                const rows = visible.filter((r) => r.kind === kind);
                if (rows.length === 0) return null;
                const total = matching.filter((r) => r.kind === kind).length;
                const collections = [...new Set(rows.map((r) => r.collection))];
                return (
                  <section
                    key={kind}
                    aria-label={groupTitle(kind, diff)}
                    style={{ marginBottom: "var(--space-4)" }}
                  >
                    <h4
                      style={{
                        margin: "0 0 var(--space-1)",
                        fontSize: "var(--font-size-sm)",
                        color:
                          kind === "removed"
                            ? "var(--error)"
                            : "var(--text-primary)",
                      }}
                    >
                      {groupTitle(kind, diff)} ({total})
                    </h4>
                    {collections.map((collection) => (
                      <div key={collection}>
                        <div
                          style={{
                            fontSize: "var(--font-size-xs)",
                            color: "var(--text-tertiary)",
                            marginTop: "var(--space-2)",
                          }}
                        >
                          {collection}
                        </div>
                        <ul style={{ margin: 0, padding: 0 }}>
                          {rows
                            .filter((r) => r.collection === collection)
                            .map((row) => (
                              <Row key={row.id} row={row} diff={diff} />
                            ))}
                        </ul>
                      </div>
                    ))}
                  </section>
                );
              })}
              {matching.length > visible.length && (
                <button
                  onClick={() => setLimit(limit + PAGE_SIZE)}
                  style={secondaryButton}
                >
                  Show {Math.min(PAGE_SIZE, matching.length - visible.length)}{" "}
                  more ({matching.length - visible.length} hidden)
                </button>
              )}
            </>
          )}

          {needsAck && (
            <label
              style={{
                display: "flex",
                gap: "var(--space-2)",
                alignItems: "flex-start",
                marginTop: "var(--space-3)",
                fontSize: "var(--font-size-sm)",
                color: "var(--text-primary)",
              }}
            >
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) =>
                  setAcknowledged((e.target as HTMLInputElement).checked)
                }
              />
              I understand {plural(diff.deletions.length, "variable")} will be
              deleted from Figma
            </label>
          )}
        </div>

        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderTop: "1px solid var(--border-default)",
            display: "flex",
            gap: "var(--space-2)",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {onAdvanced && diff.rows.length > 0 && (
            <button onClick={onAdvanced} style={secondaryButton}>
              Choose per token…
            </button>
          )}
          {onPushFirst && diff.overwrites.length > 0 && (
            <button onClick={onPushFirst} style={secondaryButton}>
              Push first
            </button>
          )}
          <button ref={closeRef} onClick={onClose} style={secondaryButton}>
            {canConfirm ? "Cancel" : "Close"}
          </button>
          {canConfirm && (
            <button
              onClick={() => {
                if (!confirmDisabled) onConfirm?.();
              }}
              disabled={confirmDisabled}
              style={{
                ...primaryButton,
                opacity: confirmDisabled ? 0.5 : 1,
                cursor: confirmDisabled ? "not-allowed" : "pointer",
              }}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Notice({ children }: { children: ComponentChildren }) {
  return (
    <div
      role="note"
      style={{
        display: "flex",
        gap: "var(--space-2)",
        padding: "var(--space-2)",
        marginBottom: "var(--space-3)",
        borderRadius: "var(--radius-sm)",
        background: "var(--warning-light)",
        border: "1px solid var(--warning)",
        fontSize: "var(--font-size-xs)",
        color: "var(--text-secondary)",
        lineHeight: "var(--line-height-relaxed)",
      }}
    >
      <Icon name="warning" size={12} color="var(--warning)" />
      <span>{children}</span>
    </div>
  );
}

const secondaryButton = {
  height: 28,
  padding: "0 var(--space-3)",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-default)",
  background: "var(--surface-primary)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-family-base)",
  fontSize: "var(--font-size-sm)",
  cursor: "pointer",
};

const primaryButton = {
  ...secondaryButton,
  border: "none",
  background: "var(--accent-primary)",
  color: "var(--text-inverse)",
  fontWeight: "var(--font-weight-semibold)",
};
