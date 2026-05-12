import { h } from "preact";
import { Icon } from "./common/Icon";
import type { IconName } from "./common/Icon";

interface EmptyTokensStateProps {
  onImportFile: () => void;
  onGenerateDemoTokens: () => void;
  onSetupGitHub: () => void;
  githubConfigured: boolean;
}

/**
 * EmptyTokensState — shown in the Tokens tab when no collections exist.
 * Uses the same card pattern as OnboardingScreen.
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
        padding: "16px 0 12px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          No token collections yet
        </div>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Create Figma Variables, import a token file, or pull from GitHub to
          get started.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <EmptyCard
          icon="upload"
          label="Import token file"
          desc="JSON or W3C DTCG format"
          onClick={onImportFile}
        />
        <EmptyCard
          icon={githubConfigured ? "download" : "github"}
          label={githubConfigured ? "Pull from GitHub" : "Connect GitHub"}
          desc={
            githubConfigured
              ? "Pull tokens from your repository"
              : "Set up bidirectional sync"
          }
          onClick={onSetupGitHub}
          accent={githubConfigured}
        />
        <EmptyCard
          icon="file"
          label="Try demo tokens"
          desc="Explore with sample data"
          onClick={onGenerateDemoTokens}
        />
      </div>
    </div>
  );
}

interface EmptyCardProps {
  icon: IconName;
  label: string;
  desc: string;
  onClick: () => void;
  accent?: boolean;
}

function EmptyCard({
  icon,
  label,
  desc,
  onClick,
  accent = false,
}: EmptyCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "10px 12px",
        border: `1px solid ${accent ? "var(--success)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-md)",
        background: accent ? "var(--success-light)" : "var(--surface-primary)",
        cursor: "pointer",
        textAlign: "left",
        transition: "var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent-primary)";
        e.currentTarget.style.background = "var(--accent-tint)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = accent
          ? "var(--success)"
          : "var(--border-default)";
        e.currentTarget.style.background = accent
          ? "var(--success-light)"
          : "var(--surface-primary)";
      }}
    >
      <Icon name={icon} size={16} color="var(--accent-primary)" />
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--text-primary)",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
          }}
        >
          {desc}
        </div>
      </div>
    </button>
  );
}
