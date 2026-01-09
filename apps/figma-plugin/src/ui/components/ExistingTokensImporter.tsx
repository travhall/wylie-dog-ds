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
  const [converting, setConverting] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(
    new Set()
  );
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    message: "",
    percentage: 0,
  });

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

    // Listen for detection result and conversion progress
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (msg && msg.type === "figma-variables-detected") {
        setDetection(msg.detection);
        setLoading(false);
        // Select all collections by default
        if (msg.detection && msg.detection.collections) {
          const allIds = msg.detection.collections.map((col: any) => col.id);
          setSelectedCollections(new Set(allIds));
        }
      } else if (msg && msg.type === "conversion-progress") {
        setProgress({
          current: msg.current,
          total: msg.total,
          message: msg.message,
          percentage: msg.percentage,
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (detection && detection.collections) {
      const allIds = detection.collections.map((col: any) => col.id);
      setSelectedCollections(new Set(allIds));
    }
  };

  const deselectAll = () => {
    setSelectedCollections(new Set());
  };

  const handleConvert = () => {
    if (selectedCollections.size === 0) {
      return;
    }

    setConverting(true);
    setProgress({
      current: 0,
      total: 0,
      message: "Starting conversion...",
      percentage: 0,
    });

    // Request conversion with selected collection IDs
    parent.postMessage(
      {
        pluginMessage: {
          type: "convert-figma-variables",
          collectionIds: Array.from(selectedCollections),
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-4)",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--text-primary)",
          }}
        >
          Found {detection.totalVariables} Variables
        </h3>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            onClick={selectAll}
            disabled={converting}
            style={{
              padding: "var(--space-1) var(--space-2)",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              cursor: converting ? "not-allowed" : "pointer",
              transition: "var(--transition-base)",
            }}
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            disabled={converting || selectedCollections.size === 0}
            style={{
              padding: "var(--space-1) var(--space-2)",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              cursor:
                converting || selectedCollections.size === 0
                  ? "not-allowed"
                  : "pointer",
              transition: "var(--transition-base)",
              opacity: selectedCollections.size === 0 ? 0.5 : 1,
            }}
          >
            Deselect All
          </button>
        </div>
      </div>

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
        💡 <strong>Select collections to convert:</strong> Your Variables will
        be converted to W3C DTCG format tokens and can be exported as JSON.
      </div>

      <div
        style={{
          marginBottom: "var(--space-5)",
        }}
      >
        <h4
          style={{
            margin: "0 0 var(--space-3) 0",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--text-primary)",
          }}
        >
          Collections ({selectedCollections.size} of{" "}
          {detection.collections.length} selected):
        </h4>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          {detection.collections.map((col: any) => {
            const isSelected = selectedCollections.has(col.id);
            return (
              <div
                key={col.id}
                onClick={() => !converting && toggleCollection(col.id)}
                style={{
                  padding: "var(--space-3)",
                  border: `2px solid ${isSelected ? "var(--accent-primary)" : "var(--border-default)"}`,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: isSelected
                    ? "var(--info-light)"
                    : "var(--surface-secondary)",
                  cursor: converting ? "not-allowed" : "pointer",
                  transition: "var(--transition-base)",
                  opacity: converting ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                  }}
                >
                  {/* Checkbox */}
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "var(--radius-sm)",
                      border: `2px solid ${isSelected ? "var(--accent-primary)" : "var(--border-default)"}`,
                      backgroundColor: isSelected
                        ? "var(--accent-primary)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "var(--transition-base)",
                    }}
                  >
                    {isSelected && (
                      <span
                        style={{
                          color: "var(--text-inverse)",
                          fontSize: "var(--font-size-xs)",
                          fontWeight: "var(--font-weight-bold)",
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Collection Info */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      {col.name}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {col.variableCount} variable
                      {col.variableCount !== 1 ? "s" : ""} • {col.modes.length}{" "}
                      mode{col.modes.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversion Progress */}
      {converting && progress.total > 0 && (
        <div
          style={{
            marginBottom: "var(--space-5)",
            padding: "var(--space-4)",
            backgroundColor: "var(--surface-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-2)",
            }}
          >
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--text-primary)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              Converting Variables...
            </span>
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--text-secondary)",
              }}
            >
              {progress.percentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "var(--surface-tertiary)",
              borderRadius: "var(--radius-full)",
              overflow: "hidden",
              marginBottom: "var(--space-2)",
            }}
          >
            <div
              style={{
                width: `${progress.percentage}%`,
                height: "100%",
                backgroundColor: "var(--accent-secondary)",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
            }}
          >
            {progress.message}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedCollections.size > 0 && (
        <div
          style={{
            marginBottom: "var(--space-4)",
            padding: "var(--space-3)",
            backgroundColor: "var(--info-light)",
            border: "1px solid var(--info)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
          }}
        >
          <strong style={{ color: "var(--text-primary)" }}>
            {selectedCollections.size}
          </strong>{" "}
          collection{selectedCollections.size !== 1 ? "s" : ""} selected •{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {detection.collections
              .filter((col: any) => selectedCollections.has(col.id))
              .reduce((sum: number, col: any) => sum + col.variableCount, 0)}
          </strong>{" "}
          variable
          {detection.collections
            .filter((col: any) => selectedCollections.has(col.id))
            .reduce((sum: number, col: any) => sum + col.variableCount, 0) !== 1
            ? "s"
            : ""}{" "}
          will be converted
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
        }}
      >
        <button
          onClick={handleConvert}
          disabled={converting || selectedCollections.size === 0}
          style={{
            flex: 1,
            padding: "var(--space-3) var(--space-4)",
            backgroundColor:
              converting || selectedCollections.size === 0
                ? "var(--surface-tertiary)"
                : "var(--accent-secondary)",
            color:
              converting || selectedCollections.size === 0
                ? "var(--text-disabled)"
                : "var(--text-inverse)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor:
              converting || selectedCollections.size === 0
                ? "not-allowed"
                : "pointer",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-bold)",
            transition: "var(--transition-base)",
            opacity: converting || selectedCollections.size === 0 ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!converting && selectedCollections.size > 0) {
              e.currentTarget.style.backgroundColor =
                "var(--accent-secondary-hover)";
            }
          }}
          onMouseLeave={(e) => {
            if (!converting && selectedCollections.size > 0) {
              e.currentTarget.style.backgroundColor = "var(--accent-secondary)";
            }
          }}
        >
          {converting
            ? "Converting..."
            : selectedCollections.size === 0
              ? "Select Collections to Convert"
              : "Convert to W3C DTCG Format"}
        </button>
        <button
          onClick={onCancel}
          disabled={converting}
          style={{
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "var(--surface-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)",
            cursor: converting ? "not-allowed" : "pointer",
            fontSize: "var(--font-size-sm)",
            transition: "var(--transition-base)",
            opacity: converting ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!converting) {
              e.currentTarget.style.backgroundColor = "var(--surface-tertiary)";
            }
          }}
          onMouseLeave={(e) => {
            if (!converting) {
              e.currentTarget.style.backgroundColor =
                "var(--surface-secondary)";
            }
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
