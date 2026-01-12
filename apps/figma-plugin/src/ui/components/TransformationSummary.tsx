import { h } from "preact";

interface TransformationSummaryProps {
  summary: {
    format: string;
    collectionsImported: number;
    tokensImported: number;
    transformations: {
      type: string;
      count: number;
      examples?: string[];
    }[];
    warnings?: string[];
  };
  onClose: () => void;
  onViewCollections?: () => void;
}

/**
 * TransformationSummary - Shows what happened after import completes
 * Features:
 * - Success state with statistics
 * - Transformation breakdown
 * - Optional warnings
 * - Link to view imported collections
 */
export function TransformationSummary({
  summary,
  onClose,
  onViewCollections,
}: TransformationSummaryProps) {
  const hasWarnings = summary.warnings && summary.warnings.length > 0;
  const hasTransformations = summary.transformations.length > 0;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "var(--space-4)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--surface-primary)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "var(--space-4)",
            borderBottom: "1px solid var(--border-default)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "var(--space-2)",
            }}
          >
            ✅
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
              marginBottom: "var(--space-1)",
            }}
          >
            Import Complete!
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
            }}
          >
            Your tokens have been successfully imported
          </p>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "var(--space-4)",
          }}
        >
          {/* Statistics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-2)",
              marginBottom: "var(--space-4)",
            }}
          >
            <div
              style={{
                padding: "var(--space-3)",
                backgroundColor: "var(--info-light)",
                border: "1px solid var(--info)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
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
                {summary.collectionsImported}
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                }}
              >
                Collection{summary.collectionsImported !== 1 ? "s" : ""}
              </div>
            </div>

            <div
              style={{
                padding: "var(--space-3)",
                backgroundColor: "var(--info-light)",
                border: "1px solid var(--info)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
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
                {summary.tokensImported}
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                }}
              >
                Token{summary.tokensImported !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Format Info */}
          <div
            style={{
              marginBottom:
                hasTransformations || hasWarnings ? "var(--space-3)" : 0,
              padding: "var(--space-2)",
              backgroundColor: "var(--surface-secondary)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              textAlign: "center",
            }}
          >
            Imported from:{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {summary.format}
            </strong>
          </div>

          {/* Transformations */}
          {hasTransformations && (
            <div
              style={{
                marginBottom: hasWarnings ? "var(--space-3)" : 0,
                padding: "var(--space-3)",
                backgroundColor: "var(--surface-secondary)",
                border: "1px solid var(--border-default)",
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
                🔄 Transformations Applied
              </div>
              {summary.transformations.map((t, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--text-secondary)",
                    marginBottom:
                      i < summary.transformations.length - 1
                        ? "var(--space-1)"
                        : 0,
                  }}
                >
                  • {t.count} {t.type.replace(/-/g, " ")}
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {hasWarnings && (
            <div
              style={{
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
                ⚠️ Notes
              </div>
              {summary.warnings?.map((warning, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "#92400e",
                    marginBottom:
                      i < (summary.warnings?.length || 0) - 1
                        ? "var(--space-1)"
                        : 0,
                  }}
                >
                  • {warning}
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
            onClick={onClose}
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
            Close
          </button>
          {onViewCollections && (
            <button
              onClick={() => {
                onViewCollections();
                onClose();
              }}
              style={{
                padding: "var(--space-2) var(--space-4)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--text-inverse)",
                backgroundColor: "var(--accent-primary)",
                border: "none",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
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
              View Collections →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
