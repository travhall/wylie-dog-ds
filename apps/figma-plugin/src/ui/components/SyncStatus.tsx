import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { Icon } from "./common/Icon";
import type { ConflictAwareGitHubClient } from "../../plugin/sync/conflict-aware-github-client";
import type { ExportData } from "../../plugin/variables/processor";

interface SyncStatusProps {
  githubClient: ConflictAwareGitHubClient;
  githubConfigured: boolean;
  onRefresh?: () => void;
}

interface SyncStatusData {
  upToDate: boolean;
  localChanges: number;
  remoteChanges: number;
  lastSync?: string;
  checking?: boolean;
  checked?: boolean;
  error?: string;
}

export function SyncStatus({
  githubClient,
  githubConfigured,
  onRefresh,
}: SyncStatusProps) {
  const [status, setStatus] = useState<SyncStatusData>({
    upToDate: true,
    localChanges: 0,
    remoteChanges: 0,
    checking: false,
    checked: false,
  });

  const checkSyncStatus = async () => {
    if (!githubConfigured) return;

    setStatus((prev) => ({ ...prev, checking: true, error: undefined }));

    try {
      // Request local tokens from the plugin thread, then diff against remote.
      const localTokens = await new Promise<ExportData[]>((resolve) => {
        const handler = (event: MessageEvent) => {
          const type = event.data.pluginMessage?.type;
          if (type === "local-tokens-exported") {
            window.removeEventListener("message", handler);
            resolve(event.data.pluginMessage.localTokens || []);
          } else if (type === "local-tokens-error") {
            window.removeEventListener("message", handler);
            resolve([]);
          }
        };
        window.addEventListener("message", handler);

        parent.postMessage(
          { pluginMessage: { type: "get-local-tokens" } },
          "*"
        );

        // Timeout after 10 seconds
        setTimeout(() => {
          window.removeEventListener("message", handler);
          resolve([]);
        }, 10000);
      });

      const syncStatus = await githubClient.getSyncStatus(localTokens);
      // Preserve lastSync — it's sourced from the `last-sync-loaded` message
      // (plugin-thread storage), not from getSyncStatus (which runs UI-side and
      // can't read figma.clientStorage).
      setStatus((prev) => ({
        upToDate: syncStatus.upToDate,
        localChanges: syncStatus.localChanges,
        remoteChanges: syncStatus.remoteChanges,
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
    if (!status.upToDate) return "Changes detected";
    return "Up to date";
  };

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

      {status.error ? (
        <div style={{ color: "var(--error)", fontSize: "var(--font-size-xs)" }}>
          {status.error}
        </div>
      ) : (
        <div style={{ color: "var(--text-secondary)" }}>
          <div>Last sync: {formatLastSync(status.lastSync)}</div>
          {!status.upToDate &&
            (status.localChanges > 0 || status.remoteChanges > 0) && (
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "var(--font-size-xs)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {status.localChanges > 0 && (
                  <span style={{ color: "var(--warning)" }}>
                    <Icon name="check" size={10} color="var(--warning)" />{" "}
                    {status.localChanges} local
                  </span>
                )}
                {status.localChanges > 0 && status.remoteChanges > 0 && (
                  <span style={{ color: "var(--text-tertiary)" }}>•</span>
                )}
                {status.remoteChanges > 0 && (
                  <span style={{ color: "var(--info)" }}>
                    <Icon name="download" size={10} color="var(--info)" />{" "}
                    {status.remoteChanges} remote
                  </span>
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
