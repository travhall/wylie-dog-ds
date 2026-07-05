import { h } from "preact";
import { Icon } from "../common/Icon";

interface TypographyTokenPreviewProps {
  value: unknown;
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
        <Icon name="arrow-right" size={11} color="var(--text-tertiary)" />
        <span style={{ fontFamily: "var(--font-mono)" }}>ref</span>
      </div>
    );
  }

  // Handle composite typography token
  if (typeof value === "object" && value !== null) {
    const { fontFamily, fontSize, fontWeight, lineHeight } = value as {
      fontFamily?: string;
      fontSize?: string | number;
      fontWeight?: string | number;
      lineHeight?: string | number;
    };
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
          <span style={{ fontSize: value as string | number }}>Aa</span>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {value as string | number}
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
          <span style={{ fontFamily: value as string, fontSize: "16px" }}>
            Aa
          </span>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
            }}
          >
            {typeof value === "string" ? value : (value as string[])[0]}
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
          <span
            style={{ fontWeight: value as string | number, fontSize: "16px" }}
          >
            Aa
          </span>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {value as string | number}
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
          {value as string | number}
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
