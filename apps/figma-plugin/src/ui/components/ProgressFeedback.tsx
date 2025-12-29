interface ProgressStepProps {
  steps: ProgressStep[];
  currentStep: number;
  loading: boolean;
  progress?: number; // 0-100 percentage for current step
  estimatedTime?: number; // Estimated seconds remaining
  itemsProcessed?: { current: number; total: number }; // For chunked operations
  onCancel?: () => void; // Cancel callback
  loadingMessage?: string; // Simple message for non-stepped loading
}

interface ProgressStep {
  id: string;
  label: string;
  icon: string;
  description?: string;
  estimatedDuration?: number; // Estimated seconds for this step
}

export function ProgressFeedback({
  steps,
  currentStep,
  loading,
  progress,
  estimatedTime,
  itemsProcessed,
  onCancel,
  loadingMessage,
}: ProgressStepProps) {
  if (!loading) return null;

  // Simple loading screen when no steps are defined
  if (steps.length === 0) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "var(--surface-overlay)",
          color: "var(--text-inverse)",
          padding: "var(--space-6)",
          borderRadius: "var(--radius-lg)",
          zIndex: 2000,
          minWidth: "280px",
          textAlign: "center",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Simple spinner animation */}
        <div
          style={{
            fontSize: "32px",
            marginBottom: "var(--space-4)",
            animation: "spin 1s linear infinite",
          }}
        >
          ⏳
        </div>
        <div
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--text-primary)",
          }}
        >
          {loadingMessage || "Loading..."}
        </div>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "var(--surface-overlay)",
        color: "var(--text-inverse)",
        padding: "var(--space-6)",
        borderRadius: "var(--radius-lg)",
        zIndex: 2000,
        minWidth: "320px",
        textAlign: "center",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* Main step indicator */}
      <div
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-bold)",
          marginBottom: "var(--space-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-2)",
        }}
      >
        <span style={{ fontSize: "var(--font-size-2xl)" }}>
          {currentStepData?.icon}
        </span>
        <span>{currentStepData?.label}</span>
      </div>

      {/* Step description */}
      {currentStepData?.description && (
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            marginBottom: "var(--space-4)",
            opacity: 0.8,
            color: "var(--text-primary)",
          }}
        >
          {currentStepData.description}
        </div>
      )}

      {/* Progress bar for current step */}
      {(progress !== undefined || itemsProcessed) && (
        <div style={{ marginBottom: "var(--space-4)" }}>
          <div
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
              marginBottom: "var(--space-2)",
            }}
          >
            <div
              style={{
                width: `${progress || (itemsProcessed ? (itemsProcessed.current / itemsProcessed.total) * 100 : 0)}%`,
                height: "100%",
                backgroundColor: "var(--success)",
                borderRadius: "var(--radius-sm)",
                transition: "var(--transition-base)",
              }}
            />
          </div>

          {/* Items processed indicator */}
          {itemsProcessed && (
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                opacity: 0.7,
                color: "var(--text-secondary)",
              }}
            >
              Processing {itemsProcessed.current} of {itemsProcessed.total}{" "}
              items...
            </div>
          )}

          {/* Progress percentage */}
          {progress !== undefined && !itemsProcessed && (
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                opacity: 0.7,
                color: "var(--text-secondary)",
              }}
            >
              {Math.round(progress)}% complete
            </div>
          )}
        </div>
      )}

      {/* Step indicators */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          justifyContent: "center",
          marginBottom: "var(--space-3)",
        }}
      >
        {steps.map((step, index) => (
          <div
            key={step.id}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor:
                index < currentStep
                  ? "var(--success)" // Completed
                  : index === currentStep
                    ? "var(--accent-primary)" // Current
                    : "rgba(255, 255, 255, 0.3)", // Pending
              transition: "var(--transition-base)",
              border: index === currentStep ? "2px solid var(--info)" : "none",
              boxSizing: "border-box",
            }}
          />
        ))}
      </div>

      {/* Step counter and time estimate */}
      <div
        style={{
          fontSize: "var(--font-size-sm)",
          opacity: 0.7,
          color: "var(--text-secondary)",
          marginBottom: estimatedTime || onCancel ? "var(--space-4)" : "0",
        }}
      >
        Step {currentStep + 1} of {steps.length}
        {estimatedTime && estimatedTime > 0 && (
          <span> • ~{Math.ceil(estimatedTime)}s remaining</span>
        )}
      </div>

      {/* Cancel button */}
      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            padding: "var(--space-2) var(--space-3)",
            backgroundColor: "var(--error)",
            color: "var(--text-inverse)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-bold)",
            transition: "var(--transition-base)",
            opacity: 0.8,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.opacity = "0.8";
          }}
        >
          Cancel Operation
        </button>
      )}
    </div>
  );
}

export const SYNC_STEPS: ProgressStep[] = [
  {
    id: "loading-local",
    label: "Loading Local Tokens",
    icon: "📍",
    description: "Reading current Figma variables...",
    estimatedDuration: 2,
  },
  {
    id: "fetching-remote",
    label: "Fetching Remote Tokens",
    icon: "📥",
    description: "Downloading from GitHub repository...",
    estimatedDuration: 3,
  },
  {
    id: "detecting-conflicts",
    label: "Detecting Conflicts",
    icon: "🔍",
    description: "Comparing local and remote changes...",
    estimatedDuration: 2,
  },
  {
    id: "analyzing",
    label: "Analyzing Changes",
    icon: "🧠",
    description: "Determining resolution strategies...",
    estimatedDuration: 1,
  },
];

export const PULL_STEPS: ProgressStep[] = [
  {
    id: "fetching",
    label: "Fetching Remote Tokens",
    icon: "📥",
    description: "Downloading from GitHub repository...",
    estimatedDuration: 3,
  },
  {
    id: "checking-conflicts",
    label: "Checking for Conflicts",
    icon: "🔍",
    description: "Comparing with local variables...",
    estimatedDuration: 2,
  },
  {
    id: "preparing",
    label: "Preparing Import",
    icon: "⚙️",
    description: "Processing token format and references...",
    estimatedDuration: 2,
  },
  {
    id: "importing",
    label: "Importing to Figma",
    icon: "🎨",
    description: "Creating variables and collections...",
    estimatedDuration: 4,
  },
];

export const PUSH_STEPS: ProgressStep[] = [
  {
    id: "exporting",
    label: "Exporting Tokens",
    icon: "📤",
    description: "Converting Figma variables to JSON...",
    estimatedDuration: 2,
  },
  {
    id: "checking-remote",
    label: "Checking Remote Changes",
    icon: "🔍",
    description: "Looking for conflicts...",
    estimatedDuration: 2,
  },
  {
    id: "uploading",
    label: "Uploading to GitHub",
    icon: "☁️",
    description: "Syncing with repository...",
    estimatedDuration: 3,
  },
];

export const IMPORT_STEPS: ProgressStep[] = [
  {
    id: "parsing",
    label: "Parsing Token Files",
    icon: "📄",
    description: "Reading and validating JSON files...",
    estimatedDuration: 2,
  },
  {
    id: "format-detection",
    label: "Detecting Format",
    icon: "🔍",
    description: "Identifying token format and structure...",
    estimatedDuration: 1,
  },
  {
    id: "validation",
    label: "Validating Tokens",
    icon: "✅",
    description: "Checking references and structure...",
    estimatedDuration: 2,
  },
  {
    id: "importing",
    label: "Creating Variables",
    icon: "🎨",
    description: "Adding to Figma collections...",
    estimatedDuration: 3,
  },
];

export const EXPORT_STEPS: ProgressStep[] = [
  {
    id: "collecting",
    label: "Collecting Variables",
    icon: "📦",
    description: "Reading selected collections...",
    estimatedDuration: 2,
  },
  {
    id: "processing",
    label: "Processing Tokens",
    icon: "⚙️",
    description: "Converting to export format...",
    estimatedDuration: 2,
  },
  {
    id: "preparing",
    label: "Preparing Download",
    icon: "💾",
    description: "Generating JSON files...",
    estimatedDuration: 1,
  },
];
