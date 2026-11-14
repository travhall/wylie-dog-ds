import { h } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { SetupWizard } from "../SetupWizard";
import { ImportPreview } from "../ImportPreview";
import { CollectionSelector } from "./sync/CollectionSelector";
import { SyncActionCards } from "./sync/SyncActionCards";
import { SyncStatus } from "../SyncStatus";
import { Icon } from "../common/Icon";
import { useUIContext } from "../../state";
import type { GitHubConfig } from "../../../shared/types";
import { needsGitHubToken } from "../../../shared/github-config";
import type { Collection } from "../../hooks/usePluginMessages";
import type { ConflictAwareGitHubClient } from "../../../plugin/sync/conflict-aware-github-client";
import type { ImportPreviewSummary } from "../ImportPreview";
import { saveTextStylesChoice } from "../../hooks/useTextStylesChoice";
import type { TextStylesAvailability } from "../../utils/check-sync-status";
import { describeAvailableTextStyles } from "../../../plugin/variables/text-style-definitions";

interface SyncTabProps {
  githubClient: ConflictAwareGitHubClient;
  githubConfig: GitHubConfig | null;
  githubConfigured: boolean;
  collections: Collection[];
  loading: boolean;
  onPushToGitHub: () => void;
  onPullFromGitHub: () => void;
  onImportFile: () => void;
  onGitHubConfigComplete: (config: GitHubConfig) => void;
  /** Clear this file's repo settings; the user's token is kept */
  onDisconnect: () => void;
  /** Delete the user's token (shared by all their files) */
  onForgetToken: () => void;
  importPreview?: ImportPreviewSummary;
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
  githubClient,
  githubConfig,
  githubConfigured,
  collections,
  loading,
  onPushToGitHub,
  onPullFromGitHub,
  onImportFile,
  onGitHubConfigComplete,
  onDisconnect,
  onForgetToken,
  importPreview,
  onConfirmImport,
  onCancelImport,
}: SyncTabProps) {
  const { state: uiState, dispatch } = useUIContext();
  const selectedCollections = uiState.selectedCollections;

  const [showEditConfig, setShowEditConfig] = useState(false);

  // Collections the last status check found changed in Figma (null: unknown)
  const [changedInFigma, setChangedInFigma] =
    useState<ReadonlySet<string> | null>(null);
  const collectionsRef = useRef(collections);
  collectionsRef.current = collections;
  const handleChecked = useCallback(
    (changed: string[] | null) => {
      if (changed === null) {
        setChangedInFigma(null);
        return;
      }
      setChangedInFigma(new Set(changed));
      dispatch({
        type: "PRESELECT_COLLECTIONS",
        ids: collectionsRef.current
          .filter((c) => changed.includes(c.name))
          .map((c) => c.id),
      });
    },
    [dispatch]
  );

  // Why Push is off, in a sentence (null while something is ticked)
  const pushHint =
    selectedCollections.size > 0
      ? null
      : changedInFigma !== null && changedInFigma.size === 0
        ? "Nothing changed in Figma since the last sync. Tick a collection to push it anyway."
        : "Tick the collections to push.";
  // An error's "Edit setup" button asks for the setup; open it once per request
  const seenSetupRequests = useRef(uiState.editSetupRequests);
  useEffect(() => {
    if (uiState.editSetupRequests === seenSetupRequests.current) return;
    seenSetupRequests.current = uiState.editSetupRequests;
    setShowEditConfig(true);
  }, [uiState.editSetupRequests]);
  const [confirmForget, setConfirmForget] = useState(false);

  // What GitHub's definitions file offers, from the last Refresh (plan 207)
  const [textStylesOffer, setTextStylesOffer] =
    useState<TextStylesAvailability | null>(null);
  // Refresh answers after the user may have clicked: read the latest choice
  const uiStateRef = useRef(uiState);
  uiStateRef.current = uiState;

  /**
   * First run: styles on offer and none managed here yet means the file is
   * new to them, so the box starts ticked. Weighed once, never over a choice
   * (stored or made here). A default-on is stored like a click, so it survives
   * the reload and is not re-decided once the file does have managed styles.
   */
  const handleTextStylesAvailability = (
    availability: TextStylesAvailability | null
  ) => {
    setTextStylesOffer(availability);
    const { textStylesChosen, textStylesDefaultChecked } = uiStateRef.current;
    if (!availability || textStylesChosen || textStylesDefaultChecked) return;
    const value = availability.managedExisting === 0;
    dispatch({ type: "APPLY_TEXT_STYLES_DEFAULT", value });
    if (value) saveTextStylesChoice(true);
  };
  // File has repo settings (shared) but this user has no token (per user)
  const needsToken = needsGitHubToken(githubConfig);

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
            {needsToken ? "Add your GitHub token" : "Connect GitHub"}
          </div>
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            {needsToken
              ? `This file syncs with ${githubConfig.owner}/${githubConfig.repo}. Tokens are stored per Figma user and are not saved in the file, so enter your own to continue.`
              : "Set up bi-directional token sync with your repository."}
          </div>
        </div>

        <SetupWizard
          initialConfig={needsToken ? githubConfig : undefined}
          onComplete={onGitHubConfigComplete}
          onClose={() => {}}
        />

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
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          {[
            { label: "Edit", onClick: () => setShowEditConfig(true) },
            { label: "Disconnect", onClick: onDisconnect },
            { label: "Forget token", onClick: () => setConfirmForget(true) },
          ].map(({ label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-xs)",
                color: "var(--accent-primary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {confirmForget && (
        <div
          role="alertdialog"
          aria-label="Forget your GitHub token"
          style={{
            padding: "8px 12px",
            background: "var(--error-light)",
            borderBottom: "1px solid var(--border-default)",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-primary)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span>
            This removes your token from every Figma file you use with this
            plugin. Files stay connected to their repository but will ask for a
            token again.
          </span>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => {
                setConfirmForget(false);
                onForgetToken();
              }}
              style={{
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--error)",
                background: "transparent",
                border: "1px solid var(--error)",
                borderRadius: "var(--radius-md)",
                padding: "4px 12px",
                cursor: "pointer",
              }}
            >
              Forget token
            </button>
            <button
              onClick={() => setConfirmForget(false)}
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                background: "transparent",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                padding: "4px 12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sync status — in-sync / drift / last-synced at a glance */}
      <div style={{ padding: "12px 12px 0" }}>
        <SyncStatus
          // A different repository, branch or folder is a different sync: start
          // the card over (no old differences, last sync read again, checked again)
          key={`${githubConfig?.owner}/${githubConfig?.repo}@${githubConfig?.branch}:${githubConfig?.tokenPath}`}
          githubClient={githubClient}
          githubConfigured={githubConfigured}
          onFailureAction={() => dispatch({ type: "REQUEST_EDIT_SETUP" })}
          onChecked={handleChecked}
          autoCheck={!loading}
          includeTextStyles={uiState.includeTextStyles}
          onTextStylesAvailability={handleTextStylesAvailability}
        />
      </div>

      {/* Collections to push */}
      <CollectionSelector
        collections={collections.map((c) => ({
          id: c.id,
          name: c.name,
          variableCount: c.variableIds.length,
        }))}
        selected={selectedCollections}
        changedNames={changedInFigma ?? undefined}
        onToggle={(id) => dispatch({ type: "TOGGLE_COLLECTION", id })}
        onSelectAll={() =>
          dispatch({
            type: "SELECT_ALL_COLLECTIONS",
            ids: collections.map((c) => c.id),
          })
        }
        onClear={() => dispatch({ type: "DESELECT_ALL_COLLECTIONS" })}
      />

      {/* Styles: what else a Pull creates and keeps in line (plan 206) */}
      <div style={{ padding: "4px 12px 8px" }}>
        <div
          style={{
            fontWeight: "var(--font-weight-semibold)",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          Styles
        </div>
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "2px 4px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={uiState.includeTextStyles}
            onChange={(e) => {
              const value = (e.target as HTMLInputElement).checked;
              dispatch({ type: "SET_INCLUDE_TEXT_STYLES", value });
              saveTextStylesChoice(value);
            }}
            style={{ marginTop: 2 }}
          />
          <span>
            <span
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-sm)",
                color: "var(--text-primary)",
              }}
            >
              Text styles
            </span>
            <span
              style={{
                display: "block",
                fontSize: "var(--font-size-xs)",
                color: "var(--text-tertiary)",
                marginTop: 2,
              }}
            >
              Pull creates and updates them from the definitions in your repo.
              Push never touches styles.
            </span>
            {!uiState.includeTextStyles &&
              (textStylesOffer?.available ?? 0) > 0 && (
                <span
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--info)",
                    marginTop: 2,
                  }}
                >
                  {describeAvailableTextStyles(
                    textStylesOffer?.available ?? 0,
                    true
                  )}
                </span>
              )}
          </span>
        </label>
      </div>

      {/* Push and Pull */}
      <SyncActionCards
        loading={loading}
        selectedCount={selectedCollections.size}
        pushHint={pushHint}
        onPush={onPushToGitHub}
        onPull={onPullFromGitHub}
      />

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
