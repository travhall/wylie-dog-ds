import { h } from "preact";

interface TypographyTokenPreviewProps {
  value: any;
  tokenType: string;
}

/**
 * Visual preview for typography-related tokens
 * Handles fontSize, fontFamily, fontWeight, lineHeight, letterSpacing
 */
export function TypographyTokenPreview({
  value,
  tokenType,
}: TypographyTokenPreviewProps) {
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
        <span style={{ fontFamily: "var(--font-mono)" }}>ref</span>
      </div>
    );
  }

  // Handle composite typography token
  if (typeof value === "object" && value !== null) {
    const { fontFamily, fontSize, fontWeight, lineHeight } = value;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontFamily: fontFamily || "inherit",
            fontSize: fontSize || "16px",
            fontWeight: fontWeight || "normal",
            lineHeight: lineHeight || "normal",
          }}
        >
          Aa
        </span>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
          }}
        >
          {fontSize} / {fontWeight}
        </span>
      </div>
    );
  }

  // Handle individual typography properties
  switch (tokenType) {
    case "fontSize":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: value }}>Aa</span>
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

    case "fontFamily":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontFamily: value, fontSize: "16px" }}>Aa</span>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
            }}
          >
            {typeof value === "string" ? value : value[0]}
          </span>
        </div>
      );

    case "fontWeight":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontWeight: value, fontSize: "16px" }}>Aa</span>
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

    case "lineHeight":
    case "letterSpacing":
      return (
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {value}
        </span>
      );

    default:
      return (
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
          }}
        >
          {String(value)}
        </span>
      );
  }
}
