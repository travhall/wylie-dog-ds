import { h } from "preact";
import { useState } from "preact/hooks";

interface TransformationLog {
  type: string;
  description: string;
  before?: string;
  after?: string;
}

interface ImportPreviewProps {
  summary: {
    format: string;
    confidence: number;
    collectionsFound: number;
    tokensToImport: number;
    transformations: TransformationLog[];
    warnings: string[];
    errors: string[];
  };
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ImportPreview - Shows what will happen before importing tokens
 * Features:
 * - Format detection confidence
 * - Collection and token counts
 * - Transformation details
 * - Warnings and errors
 * - Confirm/cancel actions
 */
export function ImportPreview({
  summary,
  onConfirm,
  onCancel,
}: ImportPreviewProps) {
  const [showTransformations, setShowTransformations] = useState(false);

  const hasErrors = summary.errors && summary.errors.length > 0;
  const hasWarnings = summary.warnings && summary.warnings.length > 0;
  const hasTransformations =
    summary.transformations && summary.transformations.length > 0;

  // Group transformations by type
  const transformationsByType = summary.transformations?.reduce(
    (acc, t) => {
      if (!acc[t.type]) {
        acc[t.type] = [];
      }
      acc[t.type].push(t);
      return acc;
    },
    {} as Record<string, TransformationLog[]>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "var(--space-4)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: "var(--surface-primary)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "var(--space-4)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
            }}
          >
            {hasErrors ? "⚠️ Import Preview" : "✨ Ready to Import"}
          </h3>
          <p
            style={{
              margin: "var(--space-2) 0 0 0",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
            }}
          >
            Review what will happen before importing
          </p>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "var(--space-4)",
          }}
        >
          {/* Format Detection */}
          <div
            style={{
              marginBottom: "var(--space-4)",
              padding: "var(--space-3)",
              backgroundColor: "var(--info-light)",
              border: "1px solid var(--info)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--text-primary)",
                marginBottom: "var(--space-2)",
              }}
            >
              📋 Format Detected
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-primary)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                {summary.format}
              </span>
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  padding: "2px 6px",
                  backgroundColor: "var(--surface-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {Math.round(summary.confidence * 100)}% confidence
              </span>
            </div>
          </div>

          {/* Import Summary */}
          <div
            style={{
              marginBottom: "var(--space-4)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-2)",
            }}
          >
            <div
              style={{
                padding: "var(--space-3)",
                backgroundColor: "var(--surface-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--accent-primary)",
                  marginBottom: "var(--space-1)",
                }}
              >
                {summary.collectionsFound}
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                }}
              >
                Collection{summary.collectionsFound !== 1 ? "s" : ""}
              </div>
            </div>

            <div
              style={{
                padding: "var(--space-3)",
                backgroundColor: "var(--surface-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--accent-primary)",
                  marginBottom: "var(--space-1)",
                }}
              >
                {summary.tokensToImport}
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                }}
              >
                Token{summary.tokensToImport !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Transformations */}
          {hasTransformations && (
            <div
              style={{
                marginBottom: "var(--space-4)",
                padding: "var(--space-3)",
                backgroundColor: "var(--surface-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <button
                onClick={() => setShowTransformations(!showTransformations)}
                style={{
                  width: "100%",
                  padding: 0,
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--text-primary)",
                  }}
                >
                  🔄 {summary.transformations.length} Transformation
                  {summary.transformations.length !== 1 ? "s" : ""} Required
                </div>
                <span style={{ color: "var(--text-tertiary)" }}>
                  {showTransformations ? "▼" : "▶"}
                </span>
              </button>

              {showTransformations && (
                <div style={{ marginTop: "var(--space-3)" }}>
                  {Object.entries(transformationsByType).map(([type, logs]) => (
                    <div
                      key={type}
                      style={{
                        marginBottom: "var(--space-2)",
                        padding: "var(--space-2)",
                        backgroundColor: "var(--surface-primary)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "var(--font-size-xs)",
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--text-primary)",
                          marginBottom: "var(--space-1)",
                          textTransform: "capitalize",
                        }}
                      >
                        {type.replace(/-/g, " ")} ({logs.length})
                      </div>
                      <div
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {logs[0].description}
                        {logs.length > 1 && " (+ more)"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Warnings */}
          {hasWarnings && (
            <div
              style={{
                marginBottom: "var(--space-4)",
                padding: "var(--space-3)",
                backgroundColor: "#fffbeb",
                border: "1px solid #fbbf24",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "#92400e",
                  marginBottom: "var(--space-2)",
                }}
              >
                ⚠️ Warnings
              </div>
              {summary.warnings.map((warning, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "#92400e",
                    marginBottom:
                      i < summary.warnings.length - 1 ? "var(--space-1)" : 0,
                  }}
                >
                  • {warning}
                </div>
              ))}
            </div>
          )}

          {/* Errors */}
          {hasErrors && (
            <div
              style={{
                marginBottom: "var(--space-4)",
                padding: "var(--space-3)",
                backgroundColor: "#fef2f2",
                border: "1px solid #ef4444",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "#991b1b",
                  marginBottom: "var(--space-2)",
                }}
              >
                ❌ Errors
              </div>
              {summary.errors.map((error, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "#991b1b",
                    marginBottom:
                      i < summary.errors.length - 1 ? "var(--space-1)" : 0,
                  }}
                >
                  • {error}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "var(--space-4)",
            borderTop: "1px solid var(--border-default)",
            display: "flex",
            gap: "var(--space-2)",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "var(--transition-base)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={hasErrors}
            style={{
              padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              color: hasErrors ? "var(--text-tertiary)" : "var(--text-inverse)",
              backgroundColor: hasErrors
                ? "var(--surface-tertiary)"
                : "var(--accent-primary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: hasErrors ? "not-allowed" : "pointer",
              transition: "var(--transition-base)",
              opacity: hasErrors ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!hasErrors) {
                e.currentTarget.style.backgroundColor =
                  "var(--accent-primary-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (!hasErrors) {
                e.currentTarget.style.backgroundColor = "var(--accent-primary)";
              }
            }}
          >
            {hasErrors ? "Cannot Import" : "✓ Import Tokens"}
          </button>
        </div>
      </div>
    </div>
  );
}
