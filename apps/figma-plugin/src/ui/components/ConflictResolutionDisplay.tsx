import { useState } from "preact/hooks";
import type {
  TokenConflict,
  ConflictResolution,
} from "../../plugin/sync/types";

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

  // Helper to get display value that shows mode-specific changes
  const getDisplayValue = (token: any) => {
    if (!token) return "undefined";

    // If token has valuesByMode, show which modes have values
    if (token.valuesByMode && Object.keys(token.valuesByMode).length > 0) {
      const modes = Object.entries(token.valuesByMode)
        .map(([mode, value]) => `${mode}: ${value}`)
        .join(", ");
      return modes;
    }

    return token.$value || "undefined";
  };

  // Helper to detect which modes changed
  const getChangedModes = (localToken: any, remoteToken: any) => {
    if (!localToken?.valuesByMode || !remoteToken?.valuesByMode) {
      return null;
    }

    const changed: string[] = [];
    const allModes = new Set([
      ...Object.keys(localToken.valuesByMode),
      ...Object.keys(remoteToken.valuesByMode),
    ]);

    for (const mode of allModes) {
      const localValue = localToken.valuesByMode[mode];
      const remoteValue = remoteToken.valuesByMode[mode];
      if (localValue !== remoteValue) {
        changed.push(mode);
      }
    }

    return changed.length > 0 ? changed : null;
  };

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

  return (
    <div
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-4)",
            paddingBottom: "var(--space-3)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0",
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--text-primary)",
              }}
            >
              🔄 Sync Conflicts Detected
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

        {/* Batch Actions */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            marginBottom: "var(--space-4)",
            padding: "var(--space-3)",
            backgroundColor: "var(--surface-secondary)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-default)",
          }}
        >
          <button
            onClick={() => handleBatchResolve("take-local")}
            style={{
              flex: 1,
              padding: "var(--space-2) var(--space-3)",
              backgroundColor: "var(--accent-primary)",
              color: "var(--text-inverse)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-bold)",
              transition: "var(--transition-base)",
            }}
          >
            📍 Keep All Local Changes (
            {resolutions.size === 0 ? conflicts.length : "..."})
          </button>
          <button
            onClick={() => handleBatchResolve("take-remote")}
            style={{
              flex: 1,
              padding: "var(--space-2) var(--space-3)",
              backgroundColor: "var(--success)",
              color: "var(--text-inverse)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-bold)",
              transition: "var(--transition-base)",
            }}
          >
            📥 Accept All Remote Changes (
            {resolutions.size === 0 ? conflicts.length : "..."})
          </button>
        </div>

        {/* Summary Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "var(--space-2)",
            marginBottom: "var(--space-4)",
          }}
        >
          {Object.entries(groupedConflicts).map(
            ([type, conflicts]) =>
              conflicts.length > 0 && (
                <div
                  key={type}
                  style={{
                    padding: "var(--space-2)",
                    backgroundColor:
                      type === "deletion"
                        ? "var(--error-light)"
                        : "var(--info-light)",
                    borderRadius: "var(--radius-sm)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "var(--font-size-md)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    {conflicts.length}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-secondary)",
                      textTransform: "capitalize",
                    }}
                  >
                    {type.replace("-", " ")}
                  </div>
                </div>
              )
          )}
        </div>

        {/* Conflicts List */}
        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            marginBottom: "var(--space-4)",
          }}
        >
          {conflicts.map((conflict) => (
            <ConflictItem
              key={conflict.conflictId}
              conflict={conflict}
              resolution={resolutions.get(conflict.conflictId)}
              onResolve={(resolution) =>
                handleResolution(conflict.conflictId, resolution)
              }
              showAdvanced={showAdvanced}
            />
          ))}
        </div>

        {/* Progress Indicator */}
        <div
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
          <span style={{ fontSize: "var(--font-size-lg)" }}>
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
              {conflict.collectionName} • {conflict.type}
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
              📍 Local Value
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
              📥 Remote Value
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
            transition: "var(--transition-base)",
          }}
        >
          📍 Keep Local
        </button>
        <button
          onClick={() => handleResolve("take-remote")}
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
            transition: "var(--transition-base)",
          }}
        >
          📥 Take Remote
        </button>
      </div>
    </div>
  );
}
