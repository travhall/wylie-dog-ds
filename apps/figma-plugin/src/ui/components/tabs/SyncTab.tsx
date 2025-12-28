import { h } from "preact";
import { SyncStatus } from "../SyncStatus";
import type { GitHubConfig } from "../../../shared/types";

interface SyncTabProps {
  githubConfig: GitHubConfig | null;
  onConfigureGitHub: () => void;
  onQuickSync: () => void;
  onPullFromGitHub: () => void;
  onPushToGitHub: () => void;
  loading: boolean;
  selectedCollections: Set<string>;
}

/**
 * SyncTab - GitHub synchronization hub
 * Shows connection status and provides sync actions
 */
export function SyncTab({
  githubConfig,
  onConfigureGitHub,
  onQuickSync,
  onPullFromGitHub,
  onPushToGitHub,
  loading,
  selectedCollections,
}: SyncTabProps) {
  const isConnected = githubConfig !== null;
  const hasSelections = selectedCollections.size > 0;

  return (
    <div
      role="tabpanel"
      id="sync-panel"
      aria-labelledby="sync-tab"
      style={{
        padding: "var(--space-4) 0",
      }}
    >
      <h3
        style={{
          margin: "0 0 var(--space-2) 0",
          fontSize: "var(--font-size-md)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--text-primary)",
        }}
      >
        GitHub Sync
      </h3>
      <p
        style={{
          margin: "0 0 var(--space-6) 0",
          fontSize: "var(--font-size-sm)",
          color: "var(--text-secondary)",
          lineHeight: "var(--line-height-relaxed)",
        }}
      >
        Bi-directional token synchronization with GitHub
      </p>

      {/* GitHub Connection Status */}
      {isConnected ? (
        <div
          style={{
            padding: "var(--space-4)",
            marginBottom: "var(--space-4)",
            backgroundColor: "var(--success-light)",
            border: "1px solid var(--success)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-2)",
            }}
          >
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--text-primary)",
              }}
            >
              ✅ Connected to GitHub
            </div>
            <button
              onClick={onConfigureGitHub}
              style={{
                padding: "var(--space-1) var(--space-2)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--text-secondary)",
                backgroundColor: "transparent",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "var(--transition-base)",
              }}
            >
              Settings
            </button>
          </div>
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            <div>
              <strong>Repository:</strong> {githubConfig.owner}/
              {githubConfig.repo}
            </div>
            <div>
              <strong>Branch:</strong> {githubConfig.branch}
            </div>
            <div
              style={{
                marginTop: "var(--space-2)",
                paddingTop: "var(--space-2)",
                borderTop: "1px solid var(--success)",
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                fontStyle: "italic",
              }}
            >
              💡 This configuration is saved to this Figma file
            </div>
            <div>
              <strong>Path:</strong> {githubConfig.tokenPath}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "var(--space-6)",
            marginBottom: "var(--space-4)",
            backgroundColor: "var(--surface-secondary)",
            border: "2px dashed var(--border-default)",
            borderRadius: "var(--radius-lg)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-lg)",
              marginBottom: "var(--space-2)",
            }}
          >
            Not connected to GitHub
          </div>
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              marginBottom: "var(--space-4)",
            }}
          >
            Connect to enable bi-directional sync with conflict detection
            <div
              style={{
                marginTop: "var(--space-2)",
                fontStyle: "italic",
              }}
            >
              💡 Each Figma file can sync to a different repository
            </div>
          </div>
          <button
            onClick={onConfigureGitHub}
            style={{
              padding: "var(--space-3) var(--space-6)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-inverse)",
              backgroundColor: "var(--accent-primary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "var(--transition-base)",
            }}
          >
            Connect to GitHub
          </button>
        </div>
      )}

      {/* Sync Actions */}
      {isConnected && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          {/* Quick Sync */}
          <SyncAction
            icon="🔄"
            title="Smart Sync"
            description="Automatic conflict detection and resolution"
            buttonLabel="Sync Now"
            onClick={onQuickSync}
            disabled={loading || !hasSelections}
            variant="primary"
            badge={
              hasSelections ? `${selectedCollections.size} selected` : undefined
            }
          />

          {/* Pull Only */}
          <SyncAction
            icon="⬇️"
            title="Pull from GitHub"
            description="Import tokens from repository (overwrites local)"
            buttonLabel="Pull"
            onClick={onPullFromGitHub}
            disabled={loading}
          />

          {/* Push Only */}
          <SyncAction
            icon="⬆️"
            title="Push to GitHub"
            description="Export selected tokens to repository"
            buttonLabel="Push"
            onClick={onPushToGitHub}
            disabled={loading || !hasSelections}
            badge={
              hasSelections ? `${selectedCollections.size} selected` : undefined
            }
          />
        </div>
      )}
    </div>
  );
}

interface SyncActionProps {
  icon: string;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  badge?: string;
}

function SyncAction({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
  disabled = false,
  variant = "secondary",
  badge,
}: SyncActionProps) {
  const isPrimary = variant === "primary";

  return (
    <div
      style={{
        padding: "var(--space-4)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--surface-primary)",
        transition: "var(--transition-base)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "var(--space-3)",
        }}
      >
        <div
          style={{
            fontSize: "var(--font-size-2xl)",
            lineHeight: 1,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              marginBottom: "var(--space-1)",
            }}
          >
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--text-primary)",
              }}
            >
              {title}
            </div>
            {badge && (
              <span
                style={{
                  padding: "2px var(--space-2)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--accent-primary)",
                  backgroundColor: "var(--info-light)",
                  border: "1px solid var(--accent-primary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
              marginBottom: "var(--space-3)",
            }}
          >
            {description}
          </div>
          <button
            onClick={onClick}
            disabled={disabled}
            style={{
              padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              color:
                isPrimary && !disabled
                  ? "var(--text-inverse)"
                  : "var(--text-secondary)",
              backgroundColor:
                isPrimary && !disabled
                  ? "var(--accent-primary)"
                  : disabled
                    ? "var(--surface-secondary)"
                    : "transparent",
              border: `1px solid ${isPrimary && !disabled ? "var(--accent-primary)" : "var(--border-default)"}`,
              borderRadius: "var(--radius-md)",
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "var(--transition-base)",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
