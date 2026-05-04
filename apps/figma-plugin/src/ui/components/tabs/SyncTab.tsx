import { h } from "preact";
import { useState } from "preact/hooks";
import { SetupWizard } from "../SetupWizard";
import { ImportPreview } from "../ImportPreview";
import { useUIContext } from "../../state";
import type { GitHubConfig } from "../../../shared/types";
import type { Collection } from "../../hooks/usePluginMessages";

interface SyncTabProps {
  githubConfig: GitHubConfig | null;
  githubConfigured: boolean;
  collections: Collection[];
  loading: boolean;
  onPushToGitHub: () => void;
  onPullFromGitHub: () => void;
  onImportFile: () => void;
  onGitHubConfigComplete: (config: GitHubConfig) => void;
  importPreview?: any;
  onConfirmImport?: () => void;
  onCancelImport?: () => void;
}

/**
 * SyncTab — unified import + sync hub.
 *
 * Sub-view A: Not configured → inline SetupWizard
 * Sub-view B: Configured → connection status + action cards
 * Sub-view C: Edit config → inline SetupWizard with cancel
 */
export function SyncTab({
  githubConfig,
  githubConfigured,
  collections,
  loading,
  onPushToGitHub,
  onPullFromGitHub,
  onImportFile,
  onGitHubConfigComplete,
  importPreview,
  onConfirmImport,
  onCancelImport,
}: SyncTabProps) {
  const { state: uiState, dispatch } = useUIContext();
  const selectedCollections = uiState.selectedCollections;

  const [showEditConfig, setShowEditConfig] = useState(false);
  const [confirmingPull, setConfirmingPull] = useState(false);

  const hasSelections = selectedCollections.size > 0;

  // If import preview is active, show it inline regardless of sub-view
  if (importPreview && onConfirmImport && onCancelImport) {
    return (
      <div
        role="tabpanel"
        id="sync-panel"
        aria-labelledby="tab-sync"
        style={{ padding: "var(--space-4) 0" }}
      >
        <ImportPreview
          summary={importPreview}
          onConfirm={onConfirmImport}
          onCancel={onCancelImport}
        />
      </div>
    );
  }

  // Sub-view A: Not configured — show setup wizard inline
  if (!githubConfigured && !showEditConfig) {
    return (
      <div
        role="tabpanel"
        id="sync-panel"
        aria-labelledby="tab-sync"
        style={{ padding: "var(--space-4) 0" }}
      >
        <div style={{ marginBottom: "var(--space-4)" }}>
          <h3
            style={{
              margin: "0 0 var(--space-1) 0",
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
            }}
          >
            Connect to GitHub
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            Set up bi-directional token sync with your repository.
          </p>
        </div>

        {/* Inline wizard — no modal shell */}
        <SetupWizard
          onComplete={onGitHubConfigComplete}
          onClose={() => {
            // No-op in inline mode — there's nowhere to "close" to.
            // The tab system handles navigation.
          }}
        />

        {/* Secondary: import from file without GitHub */}
        <div
          style={{
            marginTop: "var(--space-4)",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid var(--border-default)",
          }}
        >
          <p
            style={{
              margin: "0 0 var(--space-2) 0",
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
            }}
          >
            Not using GitHub?
          </p>
          <button
            onClick={onImportFile}
            disabled={loading}
            style={{
              padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "var(--transition-base)",
              opacity: loading ? 0.5 : 1,
            }}
          >
            📁 Import from file
          </button>
        </div>
      </div>
    );
  }

  // Sub-view C: Editing existing config
  if (showEditConfig) {
    return (
      <div
        role="tabpanel"
        id="sync-panel"
        aria-labelledby="tab-sync"
        style={{ padding: "var(--space-4) 0" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            marginBottom: "var(--space-4)",
          }}
        >
          <button
            onClick={() => setShowEditConfig(false)}
            style={{
              padding: "var(--space-1) var(--space-3)",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "var(--transition-base)",
            }}
          >
            ← Cancel
          </button>
          <h3
            style={{
              margin: 0,
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
            }}
          >
            Edit GitHub Configuration
          </h3>
        </div>

        <SetupWizard
          initialConfig={githubConfig}
          onComplete={(config) => {
            onGitHubConfigComplete(config);
            setShowEditConfig(false);
          }}
          onClose={() => setShowEditConfig(false)}
        />
      </div>
    );
  }

  // Sub-view B: Configured — show actions
  return (
    <div
      role="tabpanel"
      id="sync-panel"
      aria-labelledby="tab-sync"
      style={{ padding: "var(--space-4) 0" }}
    >
      {/* Connection status card */}
      <div
        style={{
          padding: "var(--space-3) var(--space-4)",
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
            marginBottom: "var(--space-1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--success)",
                display: "inline-block",
              }}
            />
            Connected
          </div>
          <button
            onClick={() => setShowEditConfig(true)}
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
            Edit
          </button>
        </div>
        {githubConfig && (
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            <span style={{ fontWeight: "var(--font-weight-medium)" }}>
              {githubConfig.owner}/{githubConfig.repo}
            </span>{" "}
            · {githubConfig.branch} · {githubConfig.tokenPath}
          </div>
        )}
      </div>

      {/* Collection picker */}
      {collections.length > 0 && (
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            marginBottom: "var(--space-3)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--surface-primary)",
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
              Collections
            </div>
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                fontSize: "var(--font-size-xs)",
              }}
            >
              <button
                onClick={() =>
                  dispatch({
                    type: "SELECT_ALL_COLLECTIONS",
                    ids: collections.map((c) => c.id),
                  })
                }
                style={{
                  color: "var(--accent-primary)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "var(--font-size-xs)",
                }}
              >
                Select all
              </button>
              <button
                onClick={() => dispatch({ type: "DESELECT_ALL_COLLECTIONS" })}
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "var(--font-size-xs)",
                }}
              >
                Deselect all
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-1)",
            }}
          >
            {collections.map((collection) => {
              const isSelected = selectedCollections.has(collection.id);
              return (
                <label
                  key={collection.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-1) 0",
                    cursor: "pointer",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-primary)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      dispatch({ type: "TOGGLE_COLLECTION", id: collection.id })
                    }
                    style={{ cursor: "pointer" }}
                  />
                  {collection.name}
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {collection.variableIds.length} tokens
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Action cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {/* Push to GitHub */}
        <div
          style={{
            padding: "var(--space-4)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--surface-primary)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ fontSize: "var(--font-size-2xl)", lineHeight: 1 }}>
              ⬆️
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
                  Push to GitHub
                </div>
                {hasSelections && (
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
                    {selectedCollections.size} selected
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
                Sync selected collections with conflict detection. Creates a PR
                if conflicts are found.
              </div>
              <button
                onClick={onPushToGitHub}
                disabled={loading || !hasSelections}
                style={{
                  padding: "var(--space-2) var(--space-4)",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  color:
                    !loading && hasSelections
                      ? "var(--text-inverse)"
                      : "var(--text-secondary)",
                  backgroundColor:
                    !loading && hasSelections
                      ? "var(--accent-primary)"
                      : "var(--surface-secondary)",
                  border: `1px solid ${!loading && hasSelections ? "var(--accent-primary)" : "var(--border-default)"}`,
                  borderRadius: "var(--radius-md)",
                  cursor: loading || !hasSelections ? "not-allowed" : "pointer",
                  transition: "var(--transition-base)",
                  opacity: loading || !hasSelections ? 0.5 : 1,
                }}
              >
                Push to GitHub
              </button>
            </div>
          </div>
        </div>

        {/* Pull from GitHub */}
        <div
          style={{
            padding: "var(--space-4)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--surface-primary)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ fontSize: "var(--font-size-2xl)", lineHeight: 1 }}>
              ⬇️
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--text-primary)",
                  marginBottom: "var(--space-1)",
                }}
              >
                Pull from GitHub
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  lineHeight: "var(--line-height-relaxed)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Import tokens from repository (overwrites local tokens).
              </div>

              {!confirmingPull ? (
                <button
                  onClick={() => setConfirmingPull(true)}
                  disabled={loading}
                  style={{
                    padding: "var(--space-2) var(--space-4)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--text-secondary)",
                    backgroundColor: "transparent",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "var(--transition-base)",
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  Pull
                </button>
              ) : (
                <div
                  style={{
                    padding: "var(--space-3)",
                    backgroundColor: "var(--warning-light)",
                    border: "1px solid var(--warning)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-primary)",
                      marginBottom: "var(--space-2)",
                      lineHeight: "var(--line-height-relaxed)",
                    }}
                  >
                    ⚠️ This will overwrite your local tokens with the repository
                    version. This cannot be undone.
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <button
                      onClick={() => setConfirmingPull(false)}
                      style={{
                        padding: "var(--space-1) var(--space-3)",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: "var(--font-weight-medium)",
                        color: "var(--text-secondary)",
                        backgroundColor: "transparent",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        transition: "var(--transition-base)",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onPullFromGitHub();
                        setConfirmingPull(false);
                      }}
                      style={{
                        padding: "var(--space-1) var(--space-3)",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: "var(--font-weight-medium)",
                        color: "var(--text-inverse)",
                        backgroundColor: "var(--warning)",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        transition: "var(--transition-base)",
                      }}
                    >
                      Confirm Pull
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Import from file (secondary) */}
        <div
          style={{
            paddingTop: "var(--space-2)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-tertiary)",
            }}
          >
            or
          </span>
          <button
            onClick={onImportFile}
            disabled={loading}
            style={{
              padding: "var(--space-2) var(--space-3)",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "var(--transition-base)",
              opacity: loading ? 0.5 : 1,
            }}
          >
            📁 Import from file
          </button>
        </div>
      </div>
    </div>
  );
}
