import { useState, useEffect } from "preact/hooks";

interface ExistingTokensImporterProps {
  onImport: () => void;
  onCancel: () => void;
}

export const ExistingTokensImporter = ({
  onImport,
  onCancel,
}: ExistingTokensImporterProps) => {
  const [detection, setDetection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Request variable detection from plugin
    parent.postMessage(
      {
        pluginMessage: {
          type: "detect-figma-variables",
        },
      },
      "*"
    );

    // Listen for detection result
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (msg && msg.type === "figma-variables-detected") {
        setDetection(msg.detection);
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConvert = () => {
    // Request conversion
    parent.postMessage(
      {
        pluginMessage: {
          type: "convert-figma-variables",
        },
      },
      "*"
    );
    onImport();
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "var(--space-10) var(--space-5)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            marginBottom: "var(--space-3)",
          }}
        >
          Scanning for Figma Variables...
        </div>
        <div
          style={{
            display: "inline-block",
            width: "24px",
            height: "24px",
            border: "3px solid var(--border-default)",
            borderTopColor: "var(--accent-secondary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!detection || !detection.hasVariables) {
    return (
      <div
        style={{
          padding: "var(--space-10) var(--space-5)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "var(--space-4)",
          }}
        >
          📭
        </div>
        <h3
          style={{
            margin: "0 0 var(--space-2) 0",
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--text-primary)",
          }}
        >
          No Variables Found
        </h3>
        <p
          style={{
            margin: "0 0 var(--space-6) 0",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
          }}
        >
          This Figma file doesn't contain any Variables to convert.
        </p>
        <button
          onClick={onCancel}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: "var(--surface-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            transition: "var(--transition-base)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-tertiary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-secondary)";
          }}
        >
          Back to Options
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "var(--space-6)",
      }}
    >
      <h3
        style={{
          margin: "0 0 var(--space-4) 0",
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--text-primary)",
        }}
      >
        Found {detection.totalVariables} Variables
      </h3>

      <div
        style={{
          marginBottom: "var(--space-5)",
          padding: "var(--space-3)",
          backgroundColor: "var(--info-light)",
          border: "1px solid var(--info)",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--font-size-sm)",
          color: "var(--text-primary)",
        }}
      >
        💡 <strong>Conversion Preview:</strong> Your Variables will be converted
        to W3C DTCG format tokens and can be exported as JSON.
      </div>

      <div
        style={{
          marginBottom: "var(--space-5)",
        }}
      >
        <h4
          style={{
            margin: "0 0 var(--space-2) 0",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--text-primary)",
          }}
        >
          Collections to Convert:
        </h4>
        <ul
          style={{
            margin: 0,
            padding: "0 0 0 var(--space-5)",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
          }}
        >
          {detection.collections.map((col: any) => (
            <li key={col.id} style={{ marginBottom: "var(--space-1)" }}>
              <strong style={{ color: "var(--text-primary)" }}>
                {col.name}
              </strong>{" "}
              ({col.variableCount} variables, {col.modes.length}{" "}
              {col.modes.length === 1 ? "mode" : "modes"})
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
        }}
      >
        <button
          onClick={handleConvert}
          style={{
            flex: 1,
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "var(--accent-secondary)",
            color: "var(--text-inverse)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-bold)",
            transition: "var(--transition-base)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              "var(--accent-secondary-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent-secondary)";
          }}
        >
          Convert to W3C DTCG Format
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "var(--surface-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            transition: "var(--transition-base)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-tertiary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-secondary)";
          }}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
