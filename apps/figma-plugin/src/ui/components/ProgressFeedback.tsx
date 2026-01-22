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
  console.log("📊 ProgressFeedback render:", {
    loading,
    stepsLength: steps.length,
    currentStep,
    loadingMessage,
  });

  if (!loading) return null;

  // Simple loading screen when no steps are defined
  if (steps.length === 0) {
    return (
      <>
        {/* Backdrop with blur effect */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(2px)",
            zIndex: 1999,
            animation: "fadeIn 0.2s ease",
          }}
        />

        {/* Loading card */}
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "var(--surface-primary)",
            color: "var(--text-primary)",
            padding: "var(--space-6)",
            borderRadius: "var(--radius-lg)",
            zIndex: 2000,
            minWidth: "280px",
            textAlign: "center",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
            animation: "slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Enhanced spinner */}
          <div
            style={{
              position: "relative",
              width: "48px",
              height: "48px",
              margin: "0 auto var(--space-4)",
            }}
          >
            {/* Outer ring */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                border: "3px solid var(--surface-tertiary)",
                borderTop: "3px solid var(--accent-primary)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            {/* Inner ring */}
            <div
              style={{
                position: "absolute",
                width: "70%",
                height: "70%",
                top: "15%",
                left: "15%",
                border: "3px solid transparent",
                borderTop: "3px solid var(--accent-secondary)",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite reverse",
              }}
            />
            {/* Center dot */}
            <div
              style={{
                position: "absolute",
                width: "12px",
                height: "12px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "var(--accent-primary)",
                borderRadius: "50%",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
          </div>

          {/* Loading message */}
          <div
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
              marginBottom: "var(--space-2)",
            }}
          >
            {loadingMessage || "Processing..."}
          </div>

          {/* Subtext */}
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
              opacity: 0.7,
            }}
          >
            This may take a moment
          </div>
        </div>

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              50% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.8); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideInUp {
              from {
                opacity: 0;
                transform: translate(-50%, -40%);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -50%);
              }
            }
          `}
        </style>
      </>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(2px)",
          zIndex: 1999,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Progress card */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "var(--surface-primary)",
          color: "var(--text-primary)",
          padding: "var(--space-6)",
          borderRadius: "var(--radius-lg)",
          zIndex: 2000,
          minWidth: "320px",
          textAlign: "center",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
          animation: "slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
                border:
                  index === currentStep ? "2px solid var(--info)" : "none",
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

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translate(-50%, -40%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}
      </style>
    </>
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
    label: "Pulling from GitHub",
    icon: "📥",
    description: "Downloading tokens from repository...",
    estimatedDuration: 3,
  },
  {
    id: "preparing",
    label: "Preparing Import",
    icon: "⚙️",
    description: "Processing token format...",
    estimatedDuration: 1,
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
