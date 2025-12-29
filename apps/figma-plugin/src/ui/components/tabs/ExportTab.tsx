import { h } from "preact";

interface ExportTabProps {
  selectedCollections: Set<string>;
  onDownloadJSON: () => void;
  onPushToGitHub: () => void;
  onSwitchToTokensTab: () => void;
  onSetupGitHub: () => void;
  loading: boolean;
  hasGitHubConfig: boolean;
}

/**
 * ExportTab - All token export operations
 * Destinations: Local download, GitHub push
 */
export function ExportTab({
  selectedCollections,
  onDownloadJSON,
  onPushToGitHub,
  onSwitchToTokensTab,
  onSetupGitHub,
  loading,
  hasGitHubConfig,
}: ExportTabProps) {
  const hasSelections = selectedCollections.size > 0;

  return (
    <div
      role="tabpanel"
      id="export-panel"
      aria-labelledby="export-tab"
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
        Export Tokens
      </h3>
      <p
        style={{
          margin: "0 0 var(--space-6) 0",
          fontSize: "var(--font-size-sm)",
          color: "var(--text-secondary)",
          lineHeight: "var(--line-height-relaxed)",
        }}
      >
        Export selected token collections
      </p>

      {/* Selection warning */}
      {!hasSelections && (
        <div
          style={{
            padding: "var(--space-3)",
            marginBottom: "var(--space-4)",
            backgroundColor: "var(--warning-light)",
            border: "1px solid var(--warning)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
          }}
        >
          ⚠️ Select token collections from the{" "}
          <button
            onClick={onSwitchToTokensTab}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "var(--accent-primary)",
              fontWeight: "var(--font-weight-bold)",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--accent-primary-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--accent-primary)";
            }}
          >
            Tokens
          </button>{" "}
          tab first
        </div>
      )}

      {/* GitHub setup prompt */}
      {!hasGitHubConfig && (
        <div
          style={{
            padding: "var(--space-3)",
            marginBottom: "var(--space-4)",
            backgroundColor: "var(--info-light)",
            border: "1px solid var(--info)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-2)",
          }}
        >
          <span>💡 Want to push tokens to GitHub?</span>
          <button
            onClick={onSetupGitHub}
            style={{
              padding: "var(--space-1) var(--space-3)",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--text-inverse)",
              backgroundColor: "var(--accent-primary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--accent-primary-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-primary)";
            }}
          >
            Connect
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {/* Download JSON */}
        <ExportOption
          icon="💾"
          title="Download as JSON"
          description="Save token files to your computer"
          buttonLabel="Download"
          onClick={onDownloadJSON}
          disabled={loading || !hasSelections}
          badge={
            hasSelections ? `${selectedCollections.size} selected` : undefined
          }
        />

        {/* Push to GitHub */}
        <ExportOption
          icon="📤"
          title="Push to GitHub"
          description={
            hasGitHubConfig
              ? "Sync tokens to your connected repository"
              : "Connect to GitHub first to enable"
          }
          buttonLabel={hasGitHubConfig ? "Push Tokens" : "Setup Required"}
          onClick={onPushToGitHub}
          disabled={loading || !hasSelections || !hasGitHubConfig}
          badge={
            hasSelections ? `${selectedCollections.size} selected` : undefined
          }
        />
      </div>
    </div>
  );
}

interface ExportOptionProps {
  icon: string;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}

function ExportOption({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
  disabled = false,
  badge,
}: ExportOptionProps) {
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
              color: !disabled ? "var(--text-inverse)" : "var(--text-tertiary)",
              backgroundColor: !disabled
                ? "var(--accent-primary)"
                : "var(--surface-secondary)",
              border: "none",
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
