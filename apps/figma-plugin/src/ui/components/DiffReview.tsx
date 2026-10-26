import { h } from "preact";
import type { ComponentChildren } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { Icon } from "./common/Icon";
import { ColorSwatch, isColorValue } from "./common/ColorSwatch";
import { describeScopes } from "../../plugin/sync/sync-diff";
import { describeTextStyleChange } from "../../plugin/variables/text-style-links";
import { TEXT_STYLE_DEFINITIONS_HINT } from "../../plugin/variables/text-style-definitions";
import type { TextStylePlan } from "../../plugin/variables/text-style-definitions";
import type {
  DiffKind,
  DiffRow,
  ScopeGroup,
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
  /** Nothing differs and no sync is on record yet: record this state. */
  onMarkSynced?: () => void;
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
  if (diff.direction === "overview") {
    return {
      removed: "Only on GitHub",
      changed: "Different values",
      renamed: "Renamed",
      added: "Only in Figma",
    }[kind];
  }
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
      {diff.direction === "overview" ? (
        // A read-only look: name each side instead of implying a direction.
        // `from` holds GitHub's token and `to` Figma's (see buildSyncDiff).
        <div
          style={{
            marginTop: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {row.to && (
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <span style={{ color: "var(--text-tertiary)", minWidth: 48 }}>
                Figma
              </span>
              <ValueView view={row.to} />
            </div>
          )}
          {row.from && (
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <span style={{ color: "var(--text-tertiary)", minWidth: 48 }}>
                GitHub
              </span>
              <ValueView view={row.from} />
            </div>
          )}
        </div>
      ) : (
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
                textDecoration:
                  row.kind === "removed" ? "line-through" : "none",
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
      )}
      {row.notes.length > 0 && (
        <div style={{ color: "var(--text-tertiary)", marginTop: 2 }}>
          {row.notes.join(" · ")}
        </div>
      )}
    </li>
  );
}

const SETTINGS_LIMIT = 100;

/**
 * Picker scopes a Pull would change (plan 202). Grouped by transition, with
 * the per-variable list behind each group so ~275 changes stay readable.
 */
function SettingsSection({ diff }: { diff: SyncDiff }) {
  return (
    <section
      aria-label="Picker scopes"
      style={{ marginBottom: "var(--space-4)" }}
    >
      <h4
        style={{
          margin: "0 0 var(--space-1)",
          fontSize: "var(--font-size-sm)",
          color: "var(--text-primary)",
        }}
      >
        Picker scopes will change ({diff.settingsCount})
      </h4>
      <p
        style={{
          margin: "0 0 var(--space-2)",
          fontSize: "var(--font-size-xs)",
          color: "var(--text-tertiary)",
        }}
      >
        Scopes decide which property pickers list a variable. They are not
        stored on GitHub; Pull sets them from the current rules.
      </p>
      {diff.settings.map((group) => (
        <ScopeGroupView key={group.id} group={group} />
      ))}
    </section>
  );
}

function ScopeGroupView({ group }: { group: ScopeGroup }) {
  const shown = group.changes.slice(0, SETTINGS_LIMIT);
  return (
    <details style={{ fontSize: "var(--font-size-xs)", marginBottom: 4 }}>
      <summary style={{ cursor: "pointer", color: "var(--text-primary)" }}>
        {plural(group.changes.length, "variable")}: {describeScopes(group.from)}{" "}
        <span aria-label="to" style={{ color: "var(--text-tertiary)" }}>
          →
        </span>{" "}
        {describeScopes(group.to)}
      </summary>
      <ul style={{ margin: "var(--space-1) 0 0", padding: 0 }}>
        {shown.map((c) => (
          <li
            key={`${c.collection}/${c.tokenPath}`}
            style={{
              listStyle: "none",
              fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
              wordBreak: "break-all",
              padding: "1px 0",
            }}
          >
            {c.collection} / {c.tokenPath}
          </li>
        ))}
        {group.changes.length > shown.length && (
          <li style={{ listStyle: "none", color: "var(--text-tertiary)" }}>
            and {group.changes.length - shown.length} more
          </li>
        )}
      </ul>
    </details>
  );
}

const SETTINGS_TEXT_STYLES_LIMIT = 100;

/** "A", "A and B", "A, B and C". */
function joinParts(parts: string[]): string {
  return parts.length < 2
    ? (parts[0] ?? "")
    : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * Linked text styles a Pull would change (plan 205), as their own list, plus
 * linked tokens that cannot give a percent and, read-only, the styles that have
 * no token link at all (designer-owned, never modified).
 */
function TextStylesSection({ diff }: { diff: SyncDiff }) {
  const { changes, problems, unlinked, definitions } = diff.textStyles;
  const hasDefinitions = !!definitions && definitions.status !== "off";
  if (
    diff.direction === "push" ||
    (changes.length === 0 &&
      problems.length === 0 &&
      unlinked.length === 0 &&
      !hasDefinitions)
  ) {
    return null;
  }
  const shown = changes.slice(0, SETTINGS_TEXT_STYLES_LIMIT);
  const listStyle = {
    listStyle: "none",
    fontFamily: "var(--font-mono)",
    color: "var(--text-secondary)",
    wordBreak: "break-all" as const,
    padding: "1px 0",
  };
  const noteStyle = {
    margin: "0 0 var(--space-2)",
    fontSize: "var(--font-size-xs)",
    color: "var(--text-tertiary)",
  };
  return (
    <section
      aria-label="Text styles"
      style={{ marginBottom: "var(--space-4)" }}
    >
      {hasDefinitions && definitions && (
        <TextStyleDefinitionsView
          plan={definitions}
          listStyle={listStyle}
          noteStyle={noteStyle}
        />
      )}
      {changes.length > 0 && (
        <>
          <h4
            style={{
              margin: "0 0 var(--space-1)",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-primary)",
            }}
          >
            Text styles will change ({changes.length})
          </h4>
          <p style={noteStyle}>
            Line height and letter spacing are percent values on text styles,
            because variables cannot hold a percent. Styles linked to a token
            follow it when you Pull.
          </p>
          <ul
            style={{ margin: 0, padding: 0, fontSize: "var(--font-size-xs)" }}
          >
            {shown.map((c) => (
              <li key={c.id} style={listStyle}>
                {c.name}: {describeTextStyleChange(c)}
              </li>
            ))}
            {changes.length > shown.length && (
              <li style={{ listStyle: "none", color: "var(--text-tertiary)" }}>
                and {changes.length - shown.length} more
              </li>
            )}
          </ul>
        </>
      )}
      {problems.length > 0 && (
        <Notice>
          {plural(problems.length, "text style")} will not change because a
          linked token{" "}
          {problems.every((p) => p.reason === "missing")
            ? "no longer exists"
            : "cannot give a percent"}
          :{" "}
          {problems
            .slice(0, 5)
            .map((p) => `${p.name} (${p.token})`)
            .join(", ")}
          {problems.length > 5 ? ` and ${problems.length - 5} more` : ""}
        </Notice>
      )}
      {unlinked.length > 0 && (
        <details
          style={{
            fontSize: "var(--font-size-xs)",
            marginTop: "var(--space-2)",
          }}
        >
          <summary
            style={{ cursor: "pointer", color: "var(--text-secondary)" }}
          >
            {plural(unlinked.length, "text style")} with no token link (not
            changed)
          </summary>
          <ul style={{ margin: "var(--space-1) 0 0", padding: 0 }}>
            {unlinked.slice(0, SETTINGS_TEXT_STYLES_LIMIT).map((u) => (
              <li key={u.id} style={listStyle}>
                {u.name}
              </li>
            ))}
            {unlinked.length > SETTINGS_TEXT_STYLES_LIMIT && (
              <li style={{ listStyle: "none", color: "var(--text-tertiary)" }}>
                and {unlinked.length - SETTINGS_TEXT_STYLES_LIMIT} more
              </li>
            )}
          </ul>
        </details>
      )}
    </section>
  );
}

/**
 * The styles the definitions file creates and updates (plan 206), then, read
 * only, what is left alone: a designer's own style with the same name, and
 * styles whose definition was removed.
 */
function TextStyleDefinitionsView({
  plan,
  listStyle,
  noteStyle,
}: {
  plan: TextStylePlan;
  listStyle: Record<string, string | number>;
  noteStyle: Record<string, string | number>;
}) {
  const headingStyle = {
    margin: "0 0 var(--space-1)",
    fontSize: "var(--font-size-sm)",
    color: "var(--text-primary)",
  };
  const more = (total: number) =>
    total > SETTINGS_TEXT_STYLES_LIMIT ? (
      <li style={{ listStyle: "none", color: "var(--text-tertiary)" }}>
        and {total - SETTINGS_TEXT_STYLES_LIMIT} more
      </li>
    ) : null;

  if (plan.status === "absent") {
    return (
      <Notice>
        No text style definitions found on this branch (
        {TEXT_STYLE_DEFINITIONS_HINT} next to the token files), so Pull will not
        create text styles. Tokens are pulled as usual.
      </Notice>
    );
  }

  return (
    <>
      {plan.creates.length > 0 && (
        <>
          <h4 style={headingStyle}>
            Text styles will be created ({plan.creates.length})
          </h4>
          <p style={noteStyle}>
            Created from the definitions file. Font family, size and weight are
            bound to variables; line height and letter spacing are percent
            values, because variables cannot hold a percent.
          </p>
          <ul
            style={{
              margin: "0 0 var(--space-3)",
              padding: 0,
              fontSize: "var(--font-size-xs)",
            }}
          >
            {plan.creates.slice(0, SETTINGS_TEXT_STYLES_LIMIT).map((c) => (
              <li key={c.name} style={listStyle}>
                {c.name}
              </li>
            ))}
            {more(plan.creates.length)}
          </ul>
        </>
      )}
      {plan.updates.length > 0 && (
        <>
          <h4 style={headingStyle}>
            Text styles will be updated ({plan.updates.length})
          </h4>
          <ul
            style={{
              margin: "0 0 var(--space-3)",
              padding: 0,
              fontSize: "var(--font-size-xs)",
            }}
          >
            {plan.updates.slice(0, SETTINGS_TEXT_STYLES_LIMIT).map((u) => (
              <li key={u.style.id ?? u.style.name} style={listStyle}>
                {u.style.name}: {u.changes.join(", ")}
              </li>
            ))}
            {more(plan.updates.length)}
          </ul>
        </>
      )}
      {plan.unchanged > 0 && (
        <p style={noteStyle}>
          {plural(plan.unchanged, "text style")} already match the definitions.
        </p>
      )}
      {plan.problems.length > 0 && (
        <Notice>
          {plural(plan.problems.length, "text style definition")} will be
          skipped because a token they name{" "}
          {plan.problems.every((p) => p.reason === "missing")
            ? "does not exist"
            : "has no usable value"}
          :{" "}
          {plan.problems
            .slice(0, 5)
            .map((p) => `${p.name} (${p.token})`)
            .join(", ")}
          {plan.problems.length > 5
            ? ` and ${plan.problems.length - 5} more`
            : ""}
        </Notice>
      )}
      {plan.collisions.length > 0 && (
        <Notice>
          {plural(plan.collisions.length, "text style")} already exist with a
          definition's name but are not managed by Token Bridge, so they are
          left alone:{" "}
          {plan.collisions
            .slice(0, 5)
            .map((c) => c.name)
            .join(", ")}
          {plan.collisions.length > 5
            ? ` and ${plan.collisions.length - 5} more`
            : ""}
          . Rename or delete them to let Pull create the managed style.
        </Notice>
      )}
      {plan.removed.length > 0 && (
        <details
          style={{
            fontSize: "var(--font-size-xs)",
            marginBottom: "var(--space-2)",
          }}
        >
          <summary
            style={{ cursor: "pointer", color: "var(--text-secondary)" }}
          >
            {plural(plan.removed.length, "text style")} no longer in the
            definitions (kept, not changed)
          </summary>
          <ul style={{ margin: "var(--space-1) 0 0", padding: 0 }}>
            {plan.removed.slice(0, SETTINGS_TEXT_STYLES_LIMIT).map((r) => (
              <li key={r.id} style={listStyle}>
                {r.name}
              </li>
            ))}
            {more(plan.removed.length)}
          </ul>
        </details>
      )}
    </>
  );
}

function headline(diff: SyncDiff): string {
  const n = diff.rows.length;
  const s = diff.settingsCount;
  const linked = diff.textStyles.changes.length;
  const created = diff.textStyles.definitions?.creates.length ?? 0;
  const updated = diff.textStyles.definitions?.updates.length ?? 0;
  const t = linked + updated;
  const scopes = `${s} ${s === 1 ? "variable's" : "variables'"} picker scopes`;
  const styles = `${linked} ${linked === 1 ? "text style's" : "text styles'"} line height or letter spacing`;
  if (diff.direction === "pull") {
    if (n === 0 && s === 0 && t === 0 && created === 0)
      return "Nothing to pull";
    const extras = [
      s > 0 && `the picker scopes of ${plural(s, "variable")}`,
      linked > 0 &&
        `the line height and letter spacing of ${plural(linked, "text style")}`,
      updated > 0 && `${plural(updated, "managed text style")}`,
    ].filter((x): x is string => !!x);
    const create = created > 0 ? `create ${plural(created, "text style")}` : "";
    if (n === 0 && extras.length === 0) return `Pull will ${create}`;
    const head =
      n === 0
        ? `Pull will update ${joinParts(extras)}`
        : `Pull will change ${joinParts([plural(n, "token"), ...extras])} in Figma`;
    return create ? `${head} and ${create}` : head;
  }
  if (diff.direction === "overview") {
    const parts = [
      s > 0 && scopes,
      linked > 0 && styles,
      created + updated > 0 &&
        `${plural(created + updated, "text style")} to create or update`,
    ].filter((x): x is string => !!x);
    if (n === 0 && parts.length > 0) {
      return `Tokens match, but ${joinParts(parts)} differ`;
    }
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
  onMarkSynced,
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
  const nothing =
    diff.rows.length === 0 &&
    diff.settingsCount === 0 &&
    diff.textStyleCount === 0 &&
    diff.textStyles.problems.length === 0;
  const canConfirm = !!onConfirm && !nothing;
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

          {nothing ? (
            <p
              role="status"
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {emptyMessage(diff)}
              {onMarkSynced &&
                " There is no record of a sync yet: marking them as synced lets future changes show which side moved."}
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
              {diff.rows.length > 0 && matching.length === 0 && (
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
              {diff.settingsCount > 0 && <SettingsSection diff={diff} />}
            </>
          )}
          <TextStylesSection diff={diff} />

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
          {onMarkSynced && diff.rows.length === 0 && (
            <button onClick={onMarkSynced} style={primaryButton}>
              Mark as synced
            </button>
          )}
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
