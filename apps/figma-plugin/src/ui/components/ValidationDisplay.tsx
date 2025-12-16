import { h } from "preact";

interface ValidationError {
  type:
    | "missing_reference"
    | "circular_dependency"
    | "type_mismatch"
    | "invalid_format";
  token: string;
  reference?: string;
  message: string;
  suggestion?: string;
}

interface ValidationWarning {
  type: "empty_value" | "naming_convention" | "unused_token";
  token: string;
  message: string;
  suggestion?: string;
}

interface ValidationReport {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: {
    totalTokens: number;
    totalReferences: number;
    collectionsProcessed: number;
    referenceChainDepth: number;
  };
}

interface ValidationDisplayProps {
  validationReport: ValidationReport;
  onClose: () => void;
}

export function ValidationDisplay({
  validationReport,
  onClose,
}: ValidationDisplayProps) {
  const { valid, errors, warnings, stats } = validationReport;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ margin: 0, color: valid ? "#10b981" : "#ef4444" }}>
            {valid ? "✅ Validation Passed" : "❌ Validation Failed"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Statistics */}
        <div
          style={{
            backgroundColor: "#f3f4f6",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600 }}
          >
            📊 Statistics
          </h3>
          <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
            <div>Total Tokens: {stats.totalTokens}</div>
            <div>Total References: {stats.totalReferences}</div>
            <div>Collections: {stats.collectionsProcessed}</div>
            <div>Max Reference Depth: {stats.referenceChainDepth}</div>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: 600,
                color: "#ef4444",
              }}
            >
              ❌ Errors ({errors.length})
            </h3>
            <div style={{ maxHeight: "200px", overflow: "auto" }}>
              {errors.map((error, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "4px",
                    padding: "8px",
                    marginBottom: "4px",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#dc2626" }}>
                    {error.token}
                  </div>
                  <div style={{ color: "#374151" }}>{error.message}</div>
                  {error.suggestion && (
                    <div
                      style={{
                        color: "#6b7280",
                        fontStyle: "italic",
                        marginTop: "4px",
                      }}
                    >
                      💡 {error.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: 600,
                color: "#f59e0b",
              }}
            >
              ⚠️ Warnings ({warnings.length})
            </h3>
            <div style={{ maxHeight: "200px", overflow: "auto" }}>
              {warnings.map((warning, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fed7aa",
                    borderRadius: "4px",
                    padding: "8px",
                    marginBottom: "4px",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#d97706" }}>
                    {warning.token}
                  </div>
                  <div style={{ color: "#374151" }}>{warning.message}</div>
                  {warning.suggestion && (
                    <div
                      style={{
                        color: "#6b7280",
                        fontStyle: "italic",
                        marginTop: "4px",
                      }}
                    >
                      💡 {warning.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
