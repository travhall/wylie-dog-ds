import { h } from "preact";
import { Icon } from "./common/Icon";
import type { IconName } from "./common/Icon";

interface OnboardingScreenProps {
  onSetupSync: () => void;
  onImportFile: () => void;
  onImportFigmaVariables: () => void;
  onDemoTokens: () => void;
  onSkip: () => void;
}

/**
 * OnboardingScreen — first-run 2×2 card grid.
 * Renders as a block (no overlay) replacing the tab system when
 * showOnboarding is true in App.tsx.
 */
export function OnboardingScreen({
  onSetupSync,
  onImportFile,
  onImportFigmaVariables,
  onDemoTokens,
  onSkip,
}: OnboardingScreenProps) {
  const cards: Array<{
    icon: IconName;
    label: string;
    desc: string;
    onClick: () => void;
    primary?: boolean;
  }> = [
    {
      icon: "github",
      label: "Connect GitHub",
      desc: "Bidirectional sync",
      onClick: onSetupSync,
      primary: true,
    },
    {
      icon: "upload",
      label: "Import File",
      desc: "JSON or W3C format",
      onClick: onImportFile,
    },
    {
      icon: "tokens",
      label: "Import Variables",
      desc: "From this Figma file",
      onClick: onImportFigmaVariables,
    },
    {
      icon: "file",
      label: "Try Demo",
      desc: "Explore with sample data",
      onClick: onDemoTokens,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Welcome heading */}
      <div
        style={{
          padding: "16px 12px 12px",
        }}
      >
        <div
          style={{
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          Welcome to Token Bridge
        </div>
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          How would you like to get started?
        </div>
      </div>

      {/* 2×2 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          padding: "0 12px",
        }}
      >
        {cards.map((card) => (
          <OnboardingCard key={card.label} {...card} />
        ))}
      </div>

      {/* Skip */}
      <div
        style={{
          padding: "12px 12px 16px",
          textAlign: "center",
        }}
      >
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

interface OnboardingCardProps {
  icon: IconName;
  label: string;
  desc: string;
  onClick: () => void;
  primary?: boolean;
}

function OnboardingCard({
  icon,
  label,
  desc,
  onClick,
  primary = false,
}: OnboardingCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 12,
        minHeight: 108,
        border: `1px solid ${primary ? "var(--accent-primary)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-lg)",
        background: primary ? "var(--accent-tint)" : "var(--surface-primary)",
        cursor: "pointer",
        textAlign: "left",
        transition: "var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent-primary)";
        e.currentTarget.style.background = "var(--accent-tint)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = primary
          ? "var(--accent-primary)"
          : "var(--border-default)";
        e.currentTarget.style.background = primary
          ? "var(--accent-tint)"
          : "var(--surface-primary)";
      }}
    >
      <Icon name={icon} size={20} color="var(--accent-primary)" />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          style={{
            fontSize: "var(--font-size-base)",
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
