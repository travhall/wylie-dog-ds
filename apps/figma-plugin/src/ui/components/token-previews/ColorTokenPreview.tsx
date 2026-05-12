import { h } from "preact";
import { Icon } from "../common/Icon";

interface ColorTokenPreviewProps {
  value: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Visual preview for color tokens
 * Displays a color swatch with border
 */
export function ColorTokenPreview({
  value,
  size = "md",
}: ColorTokenPreviewProps) {
  const sizes = {
    sm: "24px",
    md: "32px",
    lg: "48px",
  };

  // Handle different color formats
  let displayValue = value;

  // If it's a reference, show a placeholder
  if (typeof value === "string" && value.includes("{")) {
    return (
      <div
        title={`Reference: ${value}`}
        style={{
          width: sizes[size],
          height: sizes[size],
          borderRadius: "var(--radius-sm)",
          border: "2px dashed var(--border-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "var(--font-size-xs)",
          color: "var(--text-tertiary)",
          backgroundColor: "var(--surface-secondary)",
        }}
      >
        <Icon name="arrow-right" size={10} color="var(--text-tertiary)" />
      </div>
    );
  }

  return (
    <div
      title={`Color: ${displayValue}`}
      style={{
        width: sizes[size],
        height: sizes[size],
        backgroundColor: displayValue,
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-sm)",
        flexShrink: 0,
      }}
    />
  );
}
