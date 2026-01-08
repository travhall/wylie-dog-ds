import { useState, useEffect, useRef } from "preact/hooks";
import type {
  TokenConflict,
  ConflictResolution,
} from "../../plugin/sync/types";
import { useVirtualizer } from "../hooks/useVirtualizer";

interface ConflictResolutionDisplayProps {
  conflicts: TokenConflict[];
  onResolve: (resolutions: ConflictResolution[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConflictResolutionDisplay({
  conflicts,
  onResolve,
  onCancel,
  loading = false,
}: ConflictResolutionDisplayProps) {
  const [resolutions, setResolutions] = useState<
    Map<string, ConflictResolution>
  >(new Map());
  const [showAdvanced, setShowAdvanced] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Focus first actionable element (Cancel button for safety) on mount
    cancelButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  // Helper code remains the same...

  const handleResolution = (
    conflictId: string,
    resolution: ConflictResolution
  ) => {
    const updated = new Map(resolutions);
    updated.set(conflictId, resolution);
    setResolutions(updated);
  };

  const handleBatchResolve = (strategy: "take-local" | "take-remote") => {
    const batchResolutions = new Map(resolutions);

    conflicts.forEach((conflict) => {
      batchResolutions.set(conflict.conflictId, {
        conflictId: conflict.conflictId,
        resolution: strategy,
        token:
          strategy === "take-remote"
            ? conflict.remoteToken
            : conflict.localToken,
      });
    });

    setResolutions(batchResolutions);
  };

  const getConflictsByType = () => {
    const grouped = {
      "value-change": conflicts.filter((c) => c.type === "value-change"),
      addition: conflicts.filter((c) => c.type === "addition"),
      deletion: conflicts.filter((c) => c.type === "deletion"),
      "name-conflict": conflicts.filter((c) => c.type === "name-conflict"),
    };
    return grouped;
  };

  const allResolved = resolutions.size === conflicts.length;
  const groupedConflicts = getConflictsByType();

  // Virtualization setup
  const listRef = useRef<HTMLDivElement>(null);

  // Simple height estimation:
  // Base item (expanded) ~300px, collapsed ~100px.
  // For now, we'll estimate a fixed size, but dealing with dynamic heights
  // without a more complex virtualizer is tricky.
  // A safe bet for a custom hook is to use a fixed estimate or maintain a cache.
  // Our simple hook supports dynamic heights via ResizeObserver internally if we pass the right ref,
  // but let's start with a rough estimate.
  const estimateSize = () => 200; // Average pixel height

  const { virtualItems, totalSize } = useVirtualizer({
    count: conflicts.length,
    getScrollElement: () => listRef.current,
    estimateSize,
    overscan: 5,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-dialog-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "var(--surface-overlay)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-4)",
      }}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: "var(--surface-primary)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5)",
          maxWidth: "600px",
          width: "100%",
          height: "calc(100vh - 48px)", // Fixed height to ensure footer visibility
          maxHeight: "800px",
          display: "flex", // Change to flex column for layout
          flexDirection: "column",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-3)",
            paddingBottom: "var(--space-2)",
            borderBottom: "1px solid var(--border-default)",
            flexShrink: 0, // Prevent header from shrinking
          }}
        >
          <div>
            <h2
              id="conflict-dialog-title"
              style={{
                margin: "0",
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <span aria-hidden="true">🔄</span> Sync Conflicts Detected
            </h2>
            <p
              style={{
                margin: "var(--space-1) 0 0 0",
                fontSize: "var(--font-size-md)",
                color: "var(--text-secondary)",
              }}
            >
              {conflicts.length} conflicts need resolution before syncing
            </p>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-pressed={showAdvanced}
            style={{
              padding: "var(--space-1) var(--space-2)",
              backgroundColor: "var(--surface-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
              transition: "var(--transition-base)",
            }}
          >
            {showAdvanced ? "Simple View" : "Advanced View"}
          </button>
        </div>

        {/* Batch Actions & Stats Bar */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            marginBottom: "var(--space-3)",
            flexShrink: 0,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Batch Buttons */}
          <div style={{ display: "flex", gap: "var(--space-2)", flex: 1 }}>
            <button
              onClick={() => handleBatchResolve("take-local")}
              style={{
                flex: 1,
                padding: "var(--space-2)",
                backgroundColor: "var(--surface-secondary)", // Neutral base
                border: "1px solid var(--accent-primary)", // Color hint
                color: "var(--accent-primary)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-bold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-2)",
                transition: "var(--transition-base)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-primary)";
                e.currentTarget.style.color = "var(--text-inverse)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--surface-secondary)";
                e.currentTarget.style.color = "var(--accent-primary)";
              }}
            >
              <span>📍</span> Keep All Local
            </button>
            <button
              onClick={() => handleBatchResolve("take-remote")}
              style={{
                flex: 1,
                padding: "var(--space-2)",
                backgroundColor: "var(--surface-secondary)",
                border: "1px solid var(--success)",
                color: "var(--success)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-bold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-2)",
                transition: "var(--transition-base)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--success)";
                e.currentTarget.style.color = "var(--text-inverse)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--surface-secondary)";
                e.currentTarget.style.color = "var(--success)";
              }}
            >
              <span>📥</span> Accept All Remote
            </button>
          </div>
        </div>

        {/* Stats Chips */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            marginBottom: "var(--space-3)",
            flexShrink: 0,
            overflowX: "auto",
            paddingBottom: "2px",
          }}
        >
          {Object.entries(groupedConflicts).map(
            ([type, conflicts]) =>
              conflicts.length > 0 && (
                <div
                  key={type}
                  style={{
                    padding: "2px 8px",
                    backgroundColor: "var(--surface-tertiary)",
                    borderRadius: "12px",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <span
                    style={{ fontWeight: "bold", color: "var(--text-primary)" }}
                  >
                    {conflicts.length}
                  </span>
                  <span style={{ textTransform: "capitalize" }}>
                    {type.replace("-", " ")}
                  </span>
                </div>
              )
          )}
        </div>

        {/* Conflicts List (Virtual Scroll) */}
        <div
          ref={listRef}
          role="list"
          aria-label="List of conflicts"
          style={{
            flex: 1, // Take remaining space
            overflowY: "auto",
            marginBottom: "var(--space-3)",
            position: "relative",
            minHeight: 0, // Critical for flex scrolling
          }}
        >
          <div
            style={{
              height: `${totalSize}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualItem) => {
              const conflict = conflicts[virtualItem.index];
              return (
                <div
                  key={conflict.conflictId}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <ConflictItem
                    conflict={conflict}
                    resolution={resolutions.get(conflict.conflictId)}
                    onResolve={(resolution) =>
                      handleResolution(conflict.conflictId, resolution)
                    }
                    showAdvanced={showAdvanced}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Indicator */}
        <div
          role="status"
          aria-live="polite"
          style={{
            marginBottom: "var(--space-4)",
            padding: "var(--space-2)",
            backgroundColor: allResolved
              ? "var(--success-light)"
              : "var(--warning-light)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-sm)",
            textAlign: "center",
          }}
        >
          {allResolved ? (
            <span style={{ color: "var(--success)" }}>
              ✅ All conflicts resolved ({resolutions.size}/{conflicts.length})
            </span>
          ) : (
            <span style={{ color: "var(--warning)" }}>
              ⏳ {resolutions.size}/{conflicts.length} conflicts resolved
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            justifyContent: "flex-end",
          }}
        >
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "var(--space-2) var(--space-4)",
              backgroundColor: "var(--surface-secondary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "var(--font-size-sm)",
              transition: "var(--transition-base)",
            }}
          >
            Cancel Sync
          </button>
          <button
            onClick={() => onResolve(Array.from(resolutions.values()))}
            disabled={!allResolved || loading}
            aria-busy={loading}
            style={{
              padding: "var(--space-2) var(--space-4)",
              backgroundColor:
                allResolved && !loading
                  ? "var(--success)"
                  : "var(--surface-tertiary)",
              color: "var(--text-inverse)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: allResolved && !loading ? "pointer" : "not-allowed",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-bold)",
              transition: "var(--transition-base)",
              opacity: allResolved && !loading ? 1 : 0.5,
            }}
          >
            {loading
              ? "Applying..."
              : `Apply Resolutions (${resolutions.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Individual conflict item component
interface ConflictItemProps {
  conflict: TokenConflict;
  resolution?: ConflictResolution;
  onResolve: (resolution: ConflictResolution) => void;
  showAdvanced: boolean;
}

function ConflictItem({
  conflict,
  resolution,
  onResolve,
  showAdvanced,
}: ConflictItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleResolve = (strategy: "take-local" | "take-remote" | "manual") => {
    onResolve({
      conflictId: conflict.conflictId,
      resolution: strategy,
      token:
        strategy === "take-remote" ? conflict.remoteToken : conflict.localToken,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "value-change":
        return "🔄";
      case "addition":
        return "➕";
      case "deletion":
        return "🗑️";
      case "name-conflict":
        return "🏷️";
      default:
        return "❓";
    }
  };

  return (
    <div
      role="listitem"
      style={{
        marginBottom: "var(--space-3)",
        padding: "var(--space-3)",
        border: `1px solid ${resolution ? "var(--success)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-md)",
        backgroundColor: resolution
          ? "var(--success-light)"
          : "var(--surface-primary)",
        transition: "var(--transition-base)",
      }}
    >
      {/* Conflict Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <span style={{ fontSize: "var(--font-size-lg)" }} aria-hidden="true">
            {getTypeIcon(conflict.type)}
          </span>
          <div>
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--text-primary)",
              }}
            >
              {conflict.tokenName}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--text-secondary)",
              }}
            >
              <span aria-label={`Collection: ${conflict.collectionName}`}>
                {conflict.collectionName}
              </span>
              {" • "}
              <span aria-label={`Conflict Type: ${conflict.type}`}>
                {conflict.type}
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <span
            aria-label={`Severity: ${conflict.severity}`}
            style={{
              padding: "2px var(--space-2)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--text-inverse)",
              backgroundColor: getSeverityColor(conflict.severity),
            }}
          >
            {conflict.severity}
          </span>
          {showAdvanced && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              aria-expanded={showDetails}
              style={{
                padding: "2px var(--space-2)",
                backgroundColor: "var(--surface-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "var(--font-size-xs)",
                transition: "var(--transition-base)",
              }}
            >
              {showDetails ? "Hide" : "Details"}
            </button>
          )}
        </div>
      </div>

      {/* Conflict Description */}
      <p
        style={{
          margin: "0 0 var(--space-3) 0",
          fontSize: "var(--font-size-sm)",
          color: "var(--text-secondary)",
          lineHeight: "var(--line-height-relaxed)",
        }}
      >
        {conflict.description}
      </p>

      {/* Value Comparison */}
      {(conflict.localToken || conflict.remoteToken) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-2)",
            marginBottom: "var(--space-3)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <div
            style={{
              padding: "var(--space-2)",
              backgroundColor: "var(--warning-light)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--warning)",
            }}
          >
            <div
              style={{
                fontWeight: "var(--font-weight-bold)",
                marginBottom: "var(--space-1)",
                color: "var(--text-primary)",
              }}
            >
              <span aria-hidden="true">📍</span> Local Value
            </div>
            <code
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {conflict.localToken?.valuesByMode
                ? Object.entries(conflict.localToken.valuesByMode)
                    .map(([mode, value]) => `${mode}: ${value}`)
                    .join(", ")
                : conflict.localToken?.$value || "undefined"}
            </code>
          </div>
          <div
            style={{
              padding: "var(--space-2)",
              backgroundColor: "var(--info-light)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--info)",
            }}
          >
            <div
              style={{
                fontWeight: "var(--font-weight-bold)",
                marginBottom: "var(--space-1)",
                color: "var(--text-primary)",
              }}
            >
              <span aria-hidden="true">📥</span> Remote Value
            </div>
            <code
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {conflict.remoteToken?.valuesByMode
                ? Object.entries(conflict.remoteToken.valuesByMode)
                    .map(([mode, value]) => `${mode}: ${value}`)
                    .join(", ")
                : conflict.remoteToken?.$value || "undefined"}
            </code>
          </div>
        </div>
      )}

      {/* Advanced Details */}
      {showDetails && showAdvanced && (
        <div
          style={{
            padding: "var(--space-2)",
            backgroundColor: "var(--surface-secondary)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--space-3)",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
          }}
        >
          <div>
            <strong>Conflict ID:</strong> {conflict.conflictId}
          </div>
          <div>
            <strong>Auto-resolvable:</strong>{" "}
            {conflict.autoResolvable ? "Yes" : "No"}
          </div>
          <div>
            <strong>Suggested:</strong> {conflict.suggestedResolution}
          </div>
          {conflict.localToken?.$syncMetadata && (
            <div>
              <strong>Last Modified:</strong>{" "}
              {conflict.localToken.$syncMetadata.lastModified}
            </div>
          )}
        </div>
      )}

      {/* Resolution Buttons */}
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <button
          onClick={() => handleResolve("take-local")}
          aria-label={`Keep Local: ${conflict.tokenName}`}
          title={`Keep Local: ${conflict.tokenName}`}
          style={{
            flex: 1,
            padding: "var(--space-2) var(--space-3)",
            backgroundColor:
              resolution?.resolution === "take-local"
                ? "var(--accent-primary)"
                : "var(--surface-secondary)",
            color:
              resolution?.resolution === "take-local"
                ? "var(--text-inverse)"
                : "var(--text-primary)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            transform:
              resolution?.resolution === "take-local"
                ? "scale(1.02)"
                : "scale(1)",
            boxShadow:
              resolution?.resolution === "take-local"
                ? "0 2px 4px rgba(0,0,0,0.1)"
                : "none",
          }}
        >
          <span aria-hidden="true">
            {resolution?.resolution === "take-local" ? "✅" : "📍"}
          </span>{" "}
          Keep Local
        </button>
        <button
          onClick={() => handleResolve("take-remote")}
          aria-label={`Take Remote: ${conflict.tokenName}`}
          title={`Take Remote: ${conflict.tokenName}`}
          style={{
            flex: 1,
            padding: "var(--space-2) var(--space-3)",
            backgroundColor:
              resolution?.resolution === "take-remote"
                ? "var(--success)"
                : "var(--surface-secondary)",
            color:
              resolution?.resolution === "take-remote"
                ? "var(--text-inverse)"
                : "var(--text-primary)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            transform:
              resolution?.resolution === "take-remote"
                ? "scale(1.02)"
                : "scale(1)",
            boxShadow:
              resolution?.resolution === "take-remote"
                ? "0 2px 4px rgba(0,0,0,0.1)"
                : "none",
          }}
        >
          <span aria-hidden="true">
            {resolution?.resolution === "take-remote" ? "✅" : "📥"}
          </span>{" "}
          Take Remote
        </button>
      </div>
    </div>
  );
}
