interface ProgressStepProps {
  steps: ProgressStep[];
  currentStep: number;
  loading: boolean;
}

interface ProgressStep {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

export function ProgressFeedback({ steps, currentStep, loading }: ProgressStepProps) {
  if (!loading || steps.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      zIndex: 2000,
      minWidth: '300px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
        {steps[currentStep]?.icon} {steps[currentStep]?.label}
      </div>
      
      {steps[currentStep]?.description && (
        <div style={{ fontSize: '12px', marginBottom: '16px', opacity: 0.8 }}>
          {steps[currentStep].description}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: index <= currentStep ? '#10b981' : '#374151',
              transition: 'background-color 0.3s ease'
            }}
          />
        ))}
      </div>

      <div style={{ fontSize: '11px', opacity: 0.6 }}>
        Step {currentStep + 1} of {steps.length}
      </div>
    </div>
  );
}

export const SYNC_STEPS: ProgressStep[] = [
  {
    id: 'loading-local',
    label: 'Loading Local Tokens',
    icon: '📍',
    description: 'Reading current Figma variables...'
  },
  {
    id: 'fetching-remote',
    label: 'Fetching Remote Tokens',
    icon: '📥',
    description: 'Downloading from GitHub repository...'
  },
  {
    id: 'detecting-conflicts',
    label: 'Detecting Conflicts',
    icon: '🔍',
    description: 'Comparing local and remote changes...'
  },
  {
    id: 'analyzing',
    label: 'Analyzing Changes',
    icon: '🧠',
    description: 'Determining resolution strategies...'
  }
];

export const PULL_STEPS: ProgressStep[] = [
  {
    id: 'fetching',
    label: 'Fetching Remote Tokens',
    icon: '📥',
    description: 'Downloading from GitHub repository...'
  },
  {
    id: 'checking-conflicts',
    label: 'Checking for Conflicts',
    icon: '🔍',
    description: 'Comparing with local variables...'
  },
  {
    id: 'preparing',
    label: 'Preparing Import',
    icon: '⚙️',
    description: 'Processing token format...'
  }
];

export const PUSH_STEPS: ProgressStep[] = [
  {
    id: 'exporting',
    label: 'Exporting Tokens',
    icon: '📤',
    description: 'Converting Figma variables to JSON...'
  },
  {
    id: 'checking-remote',
    label: 'Checking Remote Changes',
    icon: '🔍',
    description: 'Looking for conflicts...'
  },
  {
    id: 'uploading',
    label: 'Uploading to GitHub',
    icon: '☁️',
    description: 'Syncing with repository...'
  }
];
