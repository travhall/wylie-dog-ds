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
        backgroundColor: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--surface-primary)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5)",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-4)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-weight-bold)",
              color: valid ? "var(--success)" : "var(--error)",
            }}
          >
            {valid ? "✅ Validation Passed" : "❌ Validation Failed"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "var(--font-size-2xl)",
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "var(--transition-base)",
            }}
          >
            ×
          </button>
        </div>

        {/* Statistics */}
        <div
          style={{
            backgroundColor: "var(--surface-secondary)",
            padding: "var(--space-3)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-4)",
          }}
        >
          <h3
            style={{
              margin: "0 0 var(--space-2) 0",
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
            }}
          >
            📊 Statistics
          </h3>
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              lineHeight: "var(--line-height-relaxed)",
              color: "var(--text-secondary)",
            }}
          >
            <div>Total Tokens: {stats.totalTokens}</div>
            <div>Total References: {stats.totalReferences}</div>
            <div>Collections: {stats.collectionsProcessed}</div>
            <div>Max Reference Depth: {stats.referenceChainDepth}</div>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div style={{ marginBottom: "var(--space-4)" }}>
            <h3
              style={{
                margin: "0 0 var(--space-2) 0",
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--error)",
              }}
            >
              ❌ Errors ({errors.length})
            </h3>
            <div style={{ maxHeight: "200px", overflow: "auto" }}>
              {errors.map((error, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "var(--error-light)",
                    border: "1px solid var(--error)",
                    borderRadius: "var(--radius-sm)",
                    padding: "var(--space-2)",
                    marginBottom: "var(--space-1)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--error)",
                    }}
                  >
                    {error.token}
                  </div>
                  <div style={{ color: "var(--text-primary)" }}>
                    {error.message}
                  </div>
                  {error.suggestion && (
                    <div
                      style={{
                        color: "var(--text-secondary)",
                        fontStyle: "italic",
                        marginTop: "var(--space-1)",
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
          <div style={{ marginBottom: "var(--space-4)" }}>
            <h3
              style={{
                margin: "0 0 var(--space-2) 0",
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--warning)",
              }}
            >
              ⚠️ Warnings ({warnings.length})
            </h3>
            <div style={{ maxHeight: "200px", overflow: "auto" }}>
              {warnings.map((warning, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "var(--warning-light)",
                    border: "1px solid var(--warning)",
                    borderRadius: "var(--radius-sm)",
                    padding: "var(--space-2)",
                    marginBottom: "var(--space-1)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--warning)",
                    }}
                  >
                    {warning.token}
                  </div>
                  <div style={{ color: "var(--text-primary)" }}>
                    {warning.message}
                  </div>
                  {warning.suggestion && (
                    <div
                      style={{
                        color: "var(--text-secondary)",
                        fontStyle: "italic",
                        marginTop: "var(--space-1)",
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
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-2)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "var(--space-2) var(--space-4)",
              backgroundColor: "var(--accent-primary)",
              color: "var(--text-inverse)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              transition: "var(--transition-base)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--accent-primary-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-primary)";
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
