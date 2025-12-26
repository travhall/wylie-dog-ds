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
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: "12px",
          }}
        >
          Scanning for Figma Variables...
        </div>
        <div
          style={{
            display: "inline-block",
            width: "24px",
            height: "24px",
            border: "3px solid #e5e7eb",
            borderTopColor: "#0ea5e9",
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
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "16px",
          }}
        >
          📭
        </div>
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1f2937",
          }}
        >
          No Variables Found
        </h3>
        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "13px",
            color: "#6b7280",
          }}
        >
          This Figma file doesn't contain any Variables to convert.
        </p>
        <button
          onClick={onCancel}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f3f4f6",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
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
        padding: "24px",
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#1f2937",
        }}
      >
        Found {detection.totalVariables} Variables
      </h3>

      <div
        style={{
          marginBottom: "20px",
          padding: "12px",
          backgroundColor: "#f0f9ff",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#0369a1",
        }}
      >
        💡 <strong>Conversion Preview:</strong> Your Variables will be converted
        to W3C DTCG format tokens and can be exported as JSON.
      </div>

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <h4
          style={{
            margin: "0 0 8px 0",
            fontSize: "13px",
            fontWeight: "bold",
            color: "#374151",
          }}
        >
          Collections to Convert:
        </h4>
        <ul
          style={{
            margin: 0,
            padding: "0 0 0 20px",
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          {detection.collections.map((col: any) => (
            <li key={col.id} style={{ marginBottom: "4px" }}>
              <strong>{col.name}</strong> ({col.variableIds.length} variables)
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          onClick={handleConvert}
          style={{
            flex: 1,
            padding: "10px 16px",
            backgroundColor: "#0ea5e9",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          Convert to W3C DTCG Format
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 16px",
            backgroundColor: "#f3f4f6",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
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
