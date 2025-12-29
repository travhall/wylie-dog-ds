import { h } from "preact";

interface ImportTabProps {
  onImportFile: () => void;
  onImportFromGitHub: () => void;
  onLoadDemoTokens: () => void;
  onSetupGitHub: () => void;
  onShowFormatGuidelines?: () => void;
  loading: boolean;
  hasGitHubConfig: boolean;
}

/**
 * ImportTab - All token import operations
 * Sources: Local files, GitHub, demo tokens
 */
export function ImportTab({
  onImportFile,
  onImportFromGitHub,
  onLoadDemoTokens,
  onSetupGitHub,
  onShowFormatGuidelines,
  loading,
  hasGitHubConfig,
}: ImportTabProps) {
  return (
    <div
      role="tabpanel"
      id="import-panel"
      aria-labelledby="import-tab"
      style={{
        padding: "var(--space-4) 0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "var(--space-2)",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--text-primary)",
          }}
        >
          Import Tokens
        </h3>
        {onShowFormatGuidelines && (
          <button
            onClick={onShowFormatGuidelines}
            style={{
              padding: "var(--space-1) var(--space-3)",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--accent-secondary)",
              backgroundColor: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "var(--transition-base)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--surface-secondary)";
              e.currentTarget.style.borderColor = "var(--accent-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "var(--border-default)";
            }}
            aria-label="View supported token formats"
          >
            📚 Format Guide
          </button>
        )}
      </div>
      <p
        style={{
          margin: "0 0 var(--space-6) 0",
          fontSize: "var(--font-size-sm)",
          color: "var(--text-secondary)",
          lineHeight: "var(--line-height-relaxed)",
        }}
      >
        Import design tokens from various sources into Figma
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {/* Local File Import */}
        <ImportOption
          icon="📁"
          title="Import from File"
          description="Upload JSON token files from your computer"
          buttonLabel="Choose File"
          onClick={onImportFile}
          disabled={loading}
        />

        {/* GitHub Import */}
        <ImportOption
          icon="🔗"
          title="Pull from GitHub"
          description={
            hasGitHubConfig
              ? "Sync tokens from your connected repository"
              : "Connect to GitHub first to enable"
          }
          buttonLabel={hasGitHubConfig ? "Pull Tokens" : "Connect to GitHub"}
          onClick={hasGitHubConfig ? onImportFromGitHub : onSetupGitHub}
          disabled={loading}
          variant="secondary"
        />

        {/* Demo Tokens */}
        <ImportOption
          icon="✨"
          title="Load Demo Tokens"
          description="Try the plugin with sample design tokens"
          buttonLabel="Load Demo"
          onClick={onLoadDemoTokens}
          disabled={loading}
          variant="secondary"
        />
      </div>
    </div>
  );
}

interface ImportOptionProps {
  icon: string;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

function ImportOption({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
  disabled = false,
  variant = "primary",
}: ImportOptionProps) {
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
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
              marginBottom: "var(--space-1)",
            }}
          >
            {title}
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
