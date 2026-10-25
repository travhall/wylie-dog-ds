import { h } from "preact";
import { Icon } from "./common/Icon";
import type { SyncStatusResult } from "../../plugin/sync/conflict-aware-github-client";
import { describeChange, overwrittenByPull } from "../utils/check-sync-status";

export type PullCheck =
  | { phase: "checking" }
  | { phase: "failed" }
  | { phase: "done"; status: SyncStatusResult };

interface PullConfirmProps {
  check: PullCheck;
  onConfirm: () => void;
  onPushFirst: () => void;
  onCancel: () => void;
}

const PREVIEW_COUNT = 5;

/**
 * What a Pull would overwrite, in words. Only a baseline can PROVE Figma has
 * changes GitHub lacks; without one the honest statement is that the sides
 * differ.
 */
function warningFor(check: PullCheck): {
  headline: string;
  names: string[];
  more: number;
  atRisk: boolean;
} {
  if (check.phase === "checking") {
    return {
      headline: "Checking what Pull would overwrite…",
      names: [],
      more: 0,
      atRisk: false,
    };
  }
  if (check.phase === "failed") {
    return {
      headline: "Overwrites local Figma variables.",
      names: [],
      more: 0,
      atRisk: false,
    };
  }

  const { status } = check;
  if (status.hasBaseline) {
    const lost = overwrittenByPull(status);
    if (lost.length === 0) {
      return {
        headline:
          "Overwrites local Figma variables. No Figma changes since the last sync would be lost.",
        names: [],
        more: 0,
        atRisk: false,
      };
    }
    const names = lost.slice(0, PREVIEW_COUNT).map(describeChange);
    return {
      headline: `${lost.length} change${lost.length === 1 ? "" : "s"} made in Figma since the last sync will be overwritten:`,
      names,
      more: lost.length - names.length,
      atRisk: true,
    };
  }

  if (status.differences > 0) {
    return {
      headline: `Figma and GitHub differ in ${status.differences} token${status.differences === 1 ? "" : "s"}, and there is no record of which side changed. Pull replaces Figma's versions with GitHub's.`,
      names: [],
      more: 0,
      atRisk: true,
    };
  }
  return {
    headline: "Overwrites local Figma variables. Figma already matches GitHub.",
    names: [],
    more: 0,
    atRisk: false,
  };
}

/** Confirm step shown before a Pull; lists Figma-side changes it would lose. */
export function PullConfirm({
  check,
  onConfirm,
  onPushFirst,
  onCancel,
}: PullConfirmProps) {
  const { headline, names, more, atRisk } = warningFor(check);
  const checking = check.phase === "checking";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        role="alert"
        style={{
          display: "flex",
          gap: 6,
          padding: "6px 8px",
          borderRadius: "var(--radius-sm)",
          background: "var(--warning-light)",
          border: "1px solid var(--warning)",
          alignItems: "flex-start",
        }}
      >
        <Icon
          name="warning"
          size={12}
          color="var(--warning)"
          style={{ marginTop: 1, flexShrink: 0 }}
        />
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          <div>{headline}</div>
          {names.length > 0 && (
            <ul style={{ margin: "4px 0 0", paddingLeft: 14 }}>
              {names.map((name) => (
                <li
                  key={name}
                  style={{ fontFamily: "var(--font-family-mono)" }}
                >
                  {name}
                </li>
              ))}
              {more > 0 && <li>and {more} more</li>}
            </ul>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={onConfirm}
          disabled={checking}
          style={{
            flex: 1,
            height: 26,
            borderRadius: "var(--radius-sm)",
            background: "var(--warning)",
            color: "#fff",
            border: "none",
            fontFamily: "var(--font-family-base)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            cursor: checking ? "not-allowed" : "pointer",
            opacity: checking ? 0.5 : 1,
          }}
        >
          {atRisk ? "Pull anyway" : "Confirm"}
        </button>
        {atRisk && (
          <button
            onClick={onPushFirst}
            style={{
              height: 26,
              padding: "0 8px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-default)",
              background: "var(--surface-primary)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-family-base)",
              fontSize: "var(--font-size-sm)",
              cursor: "pointer",
            }}
          >
            Push first
          </button>
        )}
        <button
          onClick={onCancel}
          style={{
            height: 26,
            padding: "0 8px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-default)",
            background: "var(--surface-primary)",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-family-base)",
            fontSize: "var(--font-size-sm)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
