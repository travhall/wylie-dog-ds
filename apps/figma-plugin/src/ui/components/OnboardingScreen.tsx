import { h } from "preact";

interface OnboardingScreenProps {
  onSetupSync: () => void;
  onImportFile: () => void;
  onImportFigmaVariables: () => void;
  onDemoTokens: () => void;
  onSkip: () => void;
}

/**
 * OnboardingScreen — inline first-run experience.
 * Renders as a regular block (no fixed overlay) that replaces
 * the tab system when showOnboarding is true in App.tsx.
 */
export function OnboardingScreen({
  onSetupSync,
  onImportFile,
  onImportFigmaVariables,
  onDemoTokens,
  onSkip,
}: OnboardingScreenProps) {
  return (
    <div
      style={{
        padding: "var(--space-4) 0",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {/* Heading */}
      <div style={{ marginBottom: "var(--space-2)" }}>
        <h3
          style={{
            margin: "0 0 var(--space-1) 0",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--text-primary)",
          }}
        >
          Welcome to Token Bridge
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          How would you like to get started?
        </p>
      </div>

      {/* Primary: Connect to GitHub */}
      <button
        onClick={onSetupSync}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "var(--space-1)",
          width: "100%",
          padding: "var(--space-4)",
          backgroundColor: "var(--accent-primary)",
          color: "var(--text-inverse)",
          border: "none",
          borderRadius: "var(--radius-lg)",
          cursor: "pointer",
          transition: "var(--transition-base)",
          textAlign: "left",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--accent-primary-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--accent-primary)";
        }}
      >
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
          }}
        >
          🔄 Connect to GitHub
        </div>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            opacity: 0.85,
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Recommended — sync tokens bidirectionally with your repository
        </div>
      </button>

      {/* Secondary options */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        <SecondaryButton
          icon="📁"
          label="Import Token File"
          description="Upload JSON tokens from your local file"
          onClick={onImportFile}
        />
        <SecondaryButton
          icon="🎨"
          label="Import Figma Variables"
          description="Convert existing Figma variables to tokens"
          onClick={onImportFigmaVariables}
        />
      </div>

      {/* Tertiary text links */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "var(--space-4)",
          paddingTop: "var(--space-2)",
        }}
      >
        <button
          onClick={onDemoTokens}
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
          }}
        >
          Try demo tokens
        </button>
        <button
          onClick={onSkip}
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

interface SecondaryButtonProps {
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
}

function SecondaryButton({
  icon,
  label,
  description,
  onClick,
}: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        width: "100%",
        padding: "var(--space-3) var(--space-4)",
        backgroundColor: "var(--surface-primary)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        cursor: "pointer",
        transition: "var(--transition-base)",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--surface-secondary)";
        e.currentTarget.style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--surface-primary)";
        e.currentTarget.style.borderColor = "var(--border-default)";
      }}
    >
      <span style={{ fontSize: "var(--font-size-lg)" }}>{icon}</span>
      <div>
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            marginBottom: "2px",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
          }}
        >
          {description}
        </div>
      </div>
    </button>
  );
}
