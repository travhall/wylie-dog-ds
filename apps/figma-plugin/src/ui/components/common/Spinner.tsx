import { h } from "preact";

interface SpinnerProps {
  /** Nominal diameter in px (default 48). */
  size?: number;
}

/**
 * Spinner — the single source of truth for the plugin's loading animation:
 * two counter-rotating arcs with a pulsing center dot. Use this everywhere a
 * loading indicator is needed so every loading screen stays consistent.
 */
export function Spinner({ size = 48 }: SpinnerProps) {
  const ring = Math.max(2, Math.round(size / 16));
  const dot = Math.round(size * 0.25);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Outer ring */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          border: `${ring}px solid var(--surface-tertiary)`,
          borderTop: `${ring}px solid var(--accent-primary)`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      {/* Inner ring (counter-rotating) */}
      <div
        style={{
          position: "absolute",
          width: "70%",
          height: "70%",
          top: "15%",
          left: "15%",
          border: `${ring}px solid transparent`,
          borderTop: `${ring}px solid var(--accent-secondary)`,
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite reverse",
        }}
      />
      {/* Pulsing center dot */}
      <div
        style={{
          position: "absolute",
          width: `${dot}px`,
          height: `${dot}px`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "var(--accent-primary)",
          borderRadius: "50%",
          animation: "pulse 2s ease-in-out infinite",
        }}
      />
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.8); }
          }
        `}
      </style>
    </div>
  );
}
