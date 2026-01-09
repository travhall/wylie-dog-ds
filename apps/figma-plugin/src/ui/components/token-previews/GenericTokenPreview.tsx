import { h } from "preact";

interface GenericTokenPreviewProps {
  value: any;
  type: string;
}

/**
 * Generic preview for token types without specialized visualization
 * Handles: number, string, boolean, borderRadius, shadow, etc.
 */
export function GenericTokenPreview({ value, type }: GenericTokenPreviewProps) {
  // If it's a reference, show placeholder
  if (typeof value === "string" && value.includes("{")) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "var(--font-size-xs)",
          color: "var(--text-tertiary)",
        }}
      >
        <span>🔗</span>
        <code
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--font-size-xs)",
            padding: "2px 4px",
            backgroundColor: "var(--surface-secondary)",
            borderRadius: "2px",
          }}
        >
          {value}
        </code>
      </div>
    );
  }

  // Special handling for borderRadius
  if (type === "borderRadius" || type === "dimension") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "var(--surface-tertiary)",
            border: "2px solid var(--accent-primary)",
            borderRadius: value,
          }}
        />
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {String(value)}
        </span>
      </div>
    );
  }

  // Format complex objects (like shadows)
  if (typeof value === "object" && value !== null) {
    return (
      <code
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--text-secondary)",
          fontFamily: "var(--font-mono)",
          padding: "4px 6px",
          backgroundColor: "var(--surface-secondary)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-default)",
          maxWidth: "200px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "inline-block",
        }}
        title={JSON.stringify(value, null, 2)}
      >
        {JSON.stringify(value)}
      </code>
    );
  }

  // Simple values
  return (
    <span
      style={{
        fontSize: "var(--font-size-xs)",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {String(value)}
    </span>
  );
}
