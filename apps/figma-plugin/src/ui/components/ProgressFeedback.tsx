interface ProgressStepProps {
  steps: ProgressStep[];
  currentStep: number;
  loading: boolean;
  progress?: number; // 0-100 percentage for current step
  estimatedTime?: number; // Estimated seconds remaining
  itemsProcessed?: { current: number; total: number }; // For chunked operations
  onCancel?: () => void; // Cancel callback
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
}: ProgressStepProps) {
  if (!loading || steps.length === 0) return null;

  const currentStepData = steps[currentStep];

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: "24px",
        borderRadius: "12px",
        zIndex: 2000,
        minWidth: "320px",
        textAlign: "center",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Main step indicator */}
      <div
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "20px" }}>{currentStepData?.icon}</span>
        <span>{currentStepData?.label}</span>
      </div>

      {/* Step description */}
      {currentStepData?.description && (
        <div
          style={{
            fontSize: "12px",
            marginBottom: "16px",
            opacity: 0.8,
            color: "#e5e7eb",
          }}
        >
          {currentStepData.description}
        </div>
      )}

      {/* Progress bar for current step */}
      {(progress !== undefined || itemsProcessed) && (
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "3px",
              overflow: "hidden",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: `${progress || (itemsProcessed ? (itemsProcessed.current / itemsProcessed.total) * 100 : 0)}%`,
                height: "100%",
                backgroundColor: "#10b981",
                borderRadius: "3px",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {/* Items processed indicator */}
          {itemsProcessed && (
            <div
              style={{
                fontSize: "10px",
                opacity: 0.7,
                color: "#d1d5db",
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
                fontSize: "10px",
                opacity: 0.7,
                color: "#d1d5db",
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
          gap: "8px",
          justifyContent: "center",
          marginBottom: "12px",
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
                  ? "#10b981" // Completed
                  : index === currentStep
                    ? "#3b82f6" // Current
                    : "rgba(255, 255, 255, 0.3)", // Pending
              transition: "all 0.3s ease",
              border: index === currentStep ? "2px solid #60a5fa" : "none",
              boxSizing: "border-box",
            }}
          />
        ))}
      </div>

      {/* Step counter and time estimate */}
      <div
        style={{
          fontSize: "11px",
          opacity: 0.7,
          color: "#d1d5db",
          marginBottom: estimatedTime || onCancel ? "16px" : "0",
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
            padding: "6px 12px",
            backgroundColor: "rgba(239, 68, 68, 0.8)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "bold",
            transition: "background-color 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.8)";
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
