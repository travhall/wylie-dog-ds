import { h } from "preact";

interface SpacingTokenPreviewProps {
  value: string | number;
}

/**
 * Visual preview for spacing/dimension tokens
 * Displays a colored bar representing the spacing value
 */
export function SpacingTokenPreview({ value }: SpacingTokenPreviewProps) {
  // Parse the spacing value
  let px = 0;

  if (typeof value === "number") {
    px = value;
  } else if (typeof value === "string") {
    // If it's a reference, show a placeholder
    if (value.includes("{")) {
      return (
        <div
          title={`Reference: ${value}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
          }}
        >
          <span>🔗</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>ref</span>
        </div>
      );
    }

    // Parse px, rem, em values
    const match = value.match(/^([\d.]+)(px|rem|em)?$/);
    if (match) {
      px = parseFloat(match[1]);
      if (match[2] === "rem" || match[2] === "em") {
        px = px * 16; // Convert to px for display (assuming 16px base)
      }
    }
  }

  // Cap display at reasonable width
  const displayWidth = Math.min(Math.max(px, 4), 200);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <div
        title={`${px}px`}
        style={{
          width: `${displayWidth}px`,
          height: "16px",
          backgroundColor: "var(--accent-primary)",
          borderRadius: "2px",
          border: "1px solid var(--accent-primary-hover)",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--text-secondary)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
