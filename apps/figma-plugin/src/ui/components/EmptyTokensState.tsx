import { h } from "preact";

interface EmptyTokensStateProps {
  onImportFile: () => void;
  onGenerateDemoTokens: () => void;
  onSetupGitHub: () => void;
  githubConfigured: boolean;
}

/**
 * Enhanced empty state for Tokens tab
 * Provides clear paths to get started
 */
export function EmptyTokensState({
  onImportFile,
  onGenerateDemoTokens,
  onSetupGitHub,
  githubConfigured,
}: EmptyTokensStateProps) {
  return (
    <div
      style={{
        padding: "var(--space-4) 0",
      }}
    >
      <div
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--text-primary)",
          marginBottom: "var(--space-2)",
        }}
      >
        🚀 Get Started with Token Bridge
      </div>

      <p
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--text-secondary)",
          marginBottom: "var(--space-4)",
          lineHeight: "var(--line-height-relaxed)",
        }}
      >
        No token collections found. Choose an option below to begin:
      </p>

      {/* Action Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          maxWidth: "360px",
          margin: "0 auto",
        }}
      >
        {/* Import Tokens */}
        <button
          onClick={onImportFile}
          style={{
            padding: "var(--space-4)",
            backgroundColor: "var(--surface-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            cursor: "pointer",
            textAlign: "left",
            transition: "var(--transition-base)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-primary)";
            e.currentTarget.style.backgroundColor = "var(--surface-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.backgroundColor = "var(--surface-secondary)";
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
              marginBottom: "var(--space-1)",
            }}
          >
            📥 Import Existing Tokens
          </div>
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            Upload JSON token files from your design system
          </div>
        </button>

        {/* Sync from GitHub */}
        <button
          onClick={onSetupGitHub}
          style={{
            padding: "var(--space-4)",
            backgroundColor: githubConfigured
              ? "var(--success-light)"
              : "var(--surface-secondary)",
            border: `1px solid ${githubConfigured ? "var(--success)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-lg)",
            cursor: "pointer",
            textAlign: "left",
            transition: "var(--transition-base)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-primary)";
            e.currentTarget.style.backgroundColor = githubConfigured
              ? "var(--success-light)"
              : "var(--surface-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = githubConfigured
              ? "var(--success)"
              : "var(--border-default)";
            e.currentTarget.style.backgroundColor = githubConfigured
              ? "var(--success-light)"
              : "var(--surface-secondary)";
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
              marginBottom: "var(--space-1)",
            }}
          >
            🔄 {githubConfigured ? "Pull from" : "Connect to"} GitHub
          </div>
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            {githubConfigured
              ? "Pull tokens from your connected repository"
              : "Sync tokens with your GitHub repository"}
          </div>
        </button>

        {/* Generate Demo Tokens */}
        <button
          onClick={onGenerateDemoTokens}
          style={{
            padding: "var(--space-4)",
            backgroundColor: "var(--surface-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            cursor: "pointer",
            textAlign: "left",
            transition: "var(--transition-base)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-primary)";
            e.currentTarget.style.backgroundColor = "var(--surface-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.backgroundColor = "var(--surface-secondary)";
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
              marginBottom: "var(--space-1)",
            }}
          >
            🎨 Try Demo Tokens
          </div>
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            See Token Bridge in action with example tokens
          </div>
        </button>
      </div>
    </div>
  );
}
