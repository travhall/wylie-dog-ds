import { h } from "preact";
import { useState } from "preact/hooks";
import { SetupWizard } from "../SetupWizard";
import { ImportPreview } from "../ImportPreview";
import { Icon } from "../common/Icon";
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
 * Sub-view B: Configured → connection strip + side-by-side Push/Pull cards
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
  const hasSelections = selectedCollections.size > 0;

  const [showEditConfig, setShowEditConfig] = useState(false);
  const [confirmingPull, setConfirmingPull] = useState(false);

  // Import preview active
  if (importPreview && onConfirmImport && onCancelImport) {
    return (
      <div
        role="tabpanel"
        id="sync-panel"
        aria-labelledby="tab-sync"
        style={{ padding: 12 }}
      >
        <ImportPreview
          summary={importPreview}
          onConfirm={onConfirmImport}
          onCancel={onCancelImport}
        />
      </div>
    );
  }

  // Sub-view A: Not configured
  if (!githubConfigured && !showEditConfig) {
    return (
      <div
        role="tabpanel"
        id="sync-panel"
        aria-labelledby="tab-sync"
        style={{
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Connect GitHub
          </div>
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            Set up bi-directional token sync with your repository.
          </div>
        </div>

        <SetupWizard onComplete={onGitHubConfigComplete} onClose={() => {}} />

        <div
          style={{
            paddingTop: 12,
            borderTop: "1px solid var(--border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-tertiary)",
              fontFamily: "var(--font-family-mono)",
            }}
          >
            or
          </span>
          <button
            onClick={onImportFile}
            disabled={loading}
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
              background: "transparent",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: 0,
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Icon name="upload" size={12} />
            Import from file
          </button>
          <span style={{ width: 14 }} />
        </div>
      </div>
    );
  }

  // Sub-view C: Editing config
  if (showEditConfig) {
    return (
      <div
        role="tabpanel"
        id="sync-panel"
        aria-labelledby="tab-sync"
        style={{
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => setShowEditConfig(false)}
            style={{
              padding: "4px 12px",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--text-secondary)",
              background: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            ← Cancel
          </button>
          <div
            style={{
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
            }}
          >
            Edit GitHub Configuration
          </div>
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

  // Sub-view B: Configured
  return (
    <div
      role="tabpanel"
      id="sync-panel"
      aria-labelledby="tab-sync"
      style={{ display: "flex", flexDirection: "column", flex: 1 }}
    >
      {/* Connection strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--surface-secondary)",
          padding: "8px 12px",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
            flex: 1,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--success)",
              flexShrink: 0,
            }}
          />
          {githubConfig ? (
            <span
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-sm)",
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {githubConfig.owner}/{githubConfig.repo}
              <span style={{ color: "var(--text-tertiary)" }}>
                {" "}
                / {githubConfig.branch}
              </span>
            </span>
          ) : (
            <span
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-sm)",
                color: "var(--text-primary)",
              }}
            >
              Connected
            </span>
          )}
        </div>
        <button
          onClick={() => setShowEditConfig(true)}
          style={{
            fontFamily: "var(--font-family-mono)",
            fontSize: "var(--font-size-xs)",
            color: "var(--accent-primary)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
          }}
        >
          Edit
        </button>
      </div>

      {/* Collection selector */}
      {collections.length > 0 && (
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
              Collections
            </span>
            <span style={{ fontSize: "var(--font-size-xs)" }}>
              <button
                onClick={() =>
                  dispatch({
                    type: "SELECT_ALL_COLLECTIONS",
                    ids: collections.map((c) => c.id),
                  })
                }
                style={{
                  color: "var(--accent-primary)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "var(--font-size-xs)",
                }}
              >
                Select all
              </button>
              <span
                style={{
                  margin: "0 6px",
                  color: "var(--border-strong)",
                }}
              >
                ·
              </span>
              <button
                onClick={() => dispatch({ type: "DESELECT_ALL_COLLECTIONS" })}
                style={{
                  color: "var(--accent-primary)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "var(--font-size-xs)",
                }}
              >
                Clear
              </button>
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {collections.map((collection) => {
              const isSelected = selectedCollections.has(collection.id);
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
                  onClick={() =>
                    dispatch({ type: "TOGGLE_COLLECTION", id: collection.id })
                  }
                >
                  {/* Custom checkbox */}
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
                  <span
                    style={{
                      fontFamily: "var(--font-family-mono)",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {collection.variableIds.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Push / Pull action cards — side by side */}
      <div
        style={{
          padding: "8px 12px 4px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {/* Push card */}
        <div
          style={{
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            background: "var(--surface-primary)",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Icon name="upload" size={20} color="var(--accent-primary)" />
          <div>
            <div
              style={{
                fontWeight: "var(--font-weight-semibold)",
                fontSize: "var(--font-size-base)",
                color: "var(--text-primary)",
              }}
            >
              Push
            </div>
            <div
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
              }}
            >
              Figma → GitHub
            </div>
          </div>
          <button
            onClick={onPushToGitHub}
            disabled={loading || !hasSelections}
            style={{
              height: 28,
              borderRadius: "var(--radius-sm)",
              border: `1px solid ${loading || !hasSelections ? "var(--border-default)" : "var(--accent-primary)"}`,
              background:
                loading || !hasSelections
                  ? "var(--surface-secondary)"
                  : "var(--accent-primary)",
              color:
                loading || !hasSelections ? "var(--text-tertiary)" : "#fff",
              fontFamily: "var(--font-family-base)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              cursor: loading || !hasSelections ? "not-allowed" : "pointer",
              opacity: loading || !hasSelections ? 0.5 : 1,
              transition: "var(--transition-fast)",
            }}
          >
            {hasSelections ? `Push ${selectedCollections.size}` : "Push"}
          </button>
        </div>

        {/* Pull card */}
        <div
          style={{
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            background: "var(--surface-primary)",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Icon name="download" size={20} color="var(--accent-primary)" />
          <div>
            <div
              style={{
                fontWeight: "var(--font-weight-semibold)",
                fontSize: "var(--font-size-base)",
                color: "var(--text-primary)",
              }}
            >
              Pull
            </div>
            <div
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
              }}
            >
              GitHub → Figma
            </div>
          </div>

          {confirmingPull ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Warning notice */}
              <div
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
                <span
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--text-secondary)",
                    lineHeight: "var(--line-height-relaxed)",
                  }}
                >
                  Overwrites local Figma variables.
                </span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => {
                    onPullFromGitHub();
                    setConfirmingPull(false);
                  }}
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
                    cursor: "pointer",
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmingPull(false)}
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
          ) : (
            <button
              onClick={() => setConfirmingPull(true)}
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
          )}
        </div>
      </div>

      {/* Import from file footer */}
      <div style={{ flex: 1 }} />
      <div
        style={{
          borderTop: "1px solid var(--border-default)",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-family-mono)",
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
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            background: "transparent",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: 0,
            opacity: loading ? 0.5 : 1,
          }}
        >
          <Icon name="upload" size={12} />
          Import from file
        </button>
        <span style={{ width: 14 }} />
      </div>
    </div>
  );
}
