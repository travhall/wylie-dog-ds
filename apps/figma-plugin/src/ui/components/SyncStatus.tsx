import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { Icon } from "./common/Icon";
import type { ConflictAwareGitHubClient } from "../../plugin/sync/conflict-aware-github-client";
import { checkSyncStatus as runSyncStatusCheck } from "../utils/check-sync-status";
import { DiffReview } from "./DiffReview";
import type { SyncDiff } from "../../plugin/sync/sync-diff";
import {
  TEXT_STYLE_DEFINITIONS_HINT,
  describePlanWork,
} from "../../plugin/variables/text-style-definitions";

interface SyncStatusProps {
  githubClient: ConflictAwareGitHubClient;
  githubConfigured: boolean;
  onRefresh?: () => void;
  /** Sync tab "Text styles" is ticked: the status also looks at the definitions. */
  includeTextStyles?: boolean;
}

interface SyncStatusData {
  upToDate: boolean;
  /** False until a Push or Pull sets the baseline; counts are then unknown. */
  hasBaseline: boolean;
  /** Changed in Figma since the last sync. */
  toPush: number;
  /** Changed on GitHub since the last sync. */
  toPull: number;
  /** Changed on both sides to different values. */
  conflicts: number;
  renamed: number;
  /** Plain Figma-vs-GitHub difference count (the no-baseline number). */
  differences: number;
  /** Per-token overview behind the "Review changes" button. */
  diff?: SyncDiff;
  lastSync?: string;
  checking?: boolean;
  checked?: boolean;
  error?: string;
}

export function SyncStatus({
  githubClient,
  githubConfigured,
  onRefresh,
  includeTextStyles = false,
}: SyncStatusProps) {
  const [status, setStatus] = useState<SyncStatusData>({
    upToDate: true,
    hasBaseline: false,
    toPush: 0,
    toPull: 0,
    conflicts: 0,
    renamed: 0,
    differences: 0,
    checking: false,
    checked: false,
  });

  const [showReview, setShowReview] = useState(false);

  const checkSyncStatus = async () => {
    if (!githubConfigured) return;

    setStatus((prev) => ({ ...prev, checking: true, error: undefined }));

    try {
      // Figma export + baseline come from the plugin thread, then the client
      // diffs against GitHub and classifies which side changed.
      const syncStatus = await runSyncStatusCheck(
        githubClient,
        includeTextStyles
      );
      // Preserve lastSync — it's sourced from the `last-sync-loaded` message
      // (plugin-thread storage), not from getSyncStatus (which runs UI-side and
      // can't read figma.clientStorage).
      setStatus((prev) => ({
        upToDate: syncStatus.upToDate,
        hasBaseline: syncStatus.hasBaseline,
        toPush: syncStatus.toPush,
        toPull: syncStatus.toPull,
        conflicts: syncStatus.conflicts,
        renamed: syncStatus.renamedLocal + syncStatus.renamedRemote,
        differences: syncStatus.differences,
        diff: syncStatus.diff,
        lastSync: prev.lastSync,
        checking: false,
        checked: true,
      }));
    } catch (error) {
      console.error("Failed to check sync status:", error);
      setStatus((prev) => ({
        ...prev,
        checking: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check sync status",
      }));
    }
  };

  // Last-sync time lives in plugin-thread storage; the UI receives it via the
  // `last-sync-loaded` message (on request, and pushed after each sync).
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.pluginMessage?.type === "last-sync-loaded") {
        const ts = event.data.pluginMessage.timestamp;
        setStatus((prev) => ({ ...prev, lastSync: ts ?? undefined }));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    if (githubConfigured) {
      // Only fetch the cached last-sync time here (cheap, no network). The
      // status diff runs on demand (Refresh) so opening the Sync tab never
      // fires a GitHub pull on the shared client — which could race an
      // in-flight push/pull the user just started.
      parent.postMessage({ pluginMessage: { type: "get-last-sync" } }, "*");
    }
  }, [githubConfigured]);

  if (!githubConfigured) {
    return (
      <div
        style={{
          padding: "8px 12px",
          background: "var(--surface-secondary)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-default)",
          fontSize: "var(--font-size-xs)",
          color: "var(--text-tertiary)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon name="github" size={12} color="var(--text-tertiary)" /> Connect
          a repository to see sync status
        </span>
      </div>
    );
  }

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return "Never";

    try {
      const date = new Date(lastSync);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  const getStatusColor = () => {
    if (status.error) return "var(--error)";
    if (status.checking) return "var(--warning)";
    if (!status.upToDate) return "var(--warning)";
    return "var(--success)";
  };

  const getStatusIconName = () => {
    if (status.error) return "close" as const;
    if (status.checking) return "sync" as const;
    if (!status.upToDate) return "warning" as const;
    return "check" as const;
  };

  const getStatusText = () => {
    if (status.error) return "Error checking status";
    if (status.checking) return "Checking sync status…";
    if (!status.upToDate) {
      return status.hasBaseline ? "Changes detected" : "Differences found";
    }
    return "Up to date";
  };

  const definitions = status.diff?.textStyles.definitions;
  const linkedStyleCount = status.diff?.textStyles.changes.length ?? 0;

  return (
    <div
      style={{
        padding: "10px 12px",
        background: "var(--surface-secondary)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-default)",
        fontSize: "var(--font-size-xs)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: "var(--font-weight-semibold)",
            color: getStatusColor(),
          }}
        >
          <Icon name={getStatusIconName()} size={12} color={getStatusColor()} />
          <span>{getStatusText()}</span>
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {status.checked && status.diff && !status.checking && (
            <button
              onClick={() => setShowReview(true)}
              aria-label="Review changes"
              style={{
                padding: "2px 8px",
                background: "var(--surface-tertiary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "var(--font-size-xs)",
                color: "var(--text-primary)",
              }}
            >
              Review changes
            </button>
          )}
          <button
            onClick={() => {
              checkSyncStatus();
              onRefresh?.();
            }}
            disabled={status.checking}
            aria-label="Refresh sync status"
            style={{
              padding: "2px 8px",
              background: "var(--surface-tertiary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              cursor: status.checking ? "not-allowed" : "pointer",
              fontSize: "var(--font-size-xs)",
              color: "var(--text-primary)",
            }}
          >
            {status.checking ? "…" : "Refresh"}
          </button>
        </div>
      </div>

      {status.error ? (
        <div style={{ color: "var(--error)", fontSize: "var(--font-size-xs)" }}>
          {status.error}
        </div>
      ) : (
        <div style={{ color: "var(--text-secondary)" }}>
          <div>Last sync: {formatLastSync(status.lastSync)}</div>
          {!status.upToDate &&
            !status.hasBaseline &&
            status.differences > 0 && (
              <div style={{ marginTop: "4px" }}>
                <div
                  title="Figma and GitHub differ, but there is no record of the last sync to say which side changed."
                  style={{ color: "var(--warning)" }}
                >
                  {status.differences}{" "}
                  {status.differences === 1 ? "difference" : "differences"},
                  direction unknown
                </div>
                <div
                  style={{
                    color: "var(--text-tertiary)",
                    marginTop: "2px",
                  }}
                >
                  Pull once to set a baseline.
                </div>
              </div>
            )}
          {!status.upToDate &&
            status.hasBaseline &&
            status.toPush + status.toPull + status.conflicts > 0 && (
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "var(--font-size-xs)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                {status.toPush > 0 && (
                  <span
                    style={{ color: "var(--warning)" }}
                    title="Changed in Figma since the last sync (Push sends these to GitHub)"
                  >
                    <Icon name="upload" size={10} color="var(--warning)" />{" "}
                    {status.toPush} to push
                  </span>
                )}
                {status.toPush > 0 && status.toPull > 0 && (
                  <span style={{ color: "var(--text-tertiary)" }}>•</span>
                )}
                {status.toPull > 0 && (
                  <span
                    style={{ color: "var(--info)" }}
                    title="Changed on GitHub since the last sync (Pull brings these into Figma)"
                  >
                    <Icon name="download" size={10} color="var(--info)" />{" "}
                    {status.toPull} to pull
                  </span>
                )}
                {(status.toPush > 0 || status.toPull > 0) &&
                  status.conflicts > 0 && (
                    <span style={{ color: "var(--text-tertiary)" }}>•</span>
                  )}
                {status.conflicts > 0 && (
                  <span
                    style={{ color: "var(--error)" }}
                    title="Changed on both sides to different values"
                  >
                    <Icon name="warning" size={10} color="var(--error)" />{" "}
                    {status.conflicts}{" "}
                    {status.conflicts === 1 ? "conflict" : "conflicts"}
                  </span>
                )}
              </div>
            )}
          {(status.diff?.settingsCount ?? 0) > 0 && (
            <div
              title="Figma's picker scopes differ from the current rules. Pull sets them; Push never does."
              style={{ color: "var(--info)", marginTop: "4px" }}
            >
              {status.diff?.settingsCount}{" "}
              {status.diff?.settingsCount === 1 ? "variable's" : "variables'"}{" "}
              picker scopes will change on Pull
            </div>
          )}
          {linkedStyleCount > 0 && (
            <div
              title="Linked text styles differ from their tokens. Pull updates them; Push never does."
              style={{ color: "var(--info)", marginTop: "4px" }}
            >
              {linkedStyleCount}{" "}
              {linkedStyleCount === 1 ? "text style's" : "text styles'"} line
              height or letter spacing will change on Pull
            </div>
          )}
          {(definitions?.creates.length ?? 0) +
            (definitions?.updates.length ?? 0) >
            0 && (
            <div
              title="Text styles come from the definitions file in the repo. Pull writes them; Push never does."
              style={{ color: "var(--info)", marginTop: "4px" }}
            >
              {describePlanWork(definitions)} on Pull
            </div>
          )}
          {definitions?.status === "absent" && (
            <div style={{ color: "var(--text-tertiary)", marginTop: "4px" }}>
              No text style definitions found on this branch (
              {TEXT_STYLE_DEFINITIONS_HINT} next to the token files)
            </div>
          )}
          {!status.upToDate && status.hasBaseline && status.renamed > 0 && (
            <div style={{ color: "var(--text-tertiary)", marginTop: "2px" }}>
              Includes {status.renamed} renamed
            </div>
          )}
        </div>
      )}
      {showReview && status.diff && (
        <DiffReview diff={status.diff} onClose={() => setShowReview(false)} />
      )}
    </div>
  );
}
