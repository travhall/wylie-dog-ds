import { useState, useEffect } from "preact/hooks";
import type { GitHubConfig, SyncMode } from "../../shared/types";

interface SetupWizardProps {
  onComplete: (config: GitHubConfig) => void;
  onClose: () => void;
  initialConfig?: GitHubConfig | null; // Pre-populate for editing existing config
}

interface StepProps {
  onNext: (data: Partial<GitHubConfig>) => void;
  onBack: () => void;
  data: Partial<GitHubConfig>;
  isFirst: boolean;
  isLast: boolean;
}

// Step 1: Access Token
function AccessTokenStep({ onNext, data, isFirst }: StepProps) {
  const [accessToken, setAccessToken] = useState(data.accessToken || "");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);

  const validateToken = async (token: string) => {
    if (!token.trim()) return;

    setIsValidating(true);
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (response.ok) {
        setValidationResult({ valid: true });
        return true;
      } else {
        setValidationResult({
          valid: false,
          error: "Invalid token or insufficient permissions",
        });
        return false;
      }
    } catch (error) {
      setValidationResult({ valid: false, error: "Failed to validate token" });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = async () => {
    if (await validateToken(accessToken)) {
      onNext({ accessToken });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h3
          style={{
            margin: "0 0 var(--space-2) 0",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          🔐 GitHub Access Token
        </h3>
        <p
          style={{
            margin: "0",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Create a Personal Access Token at{" "}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent-primary)", textDecoration: "none" }}
            aria-label="GitHub Settings (opens in new tab)"
          >
            GitHub Settings
          </a>{" "}
          with "repo" permissions.
        </p>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          htmlFor="access-token-input"
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-bold)",
            marginBottom: "var(--space-1)",
          }}
        >
          Access Token
        </label>
        <input
          id="access-token-input"
          type="password"
          value={accessToken}
          onChange={(e) => {
            setAccessToken(e.currentTarget.value);
            setValidationResult(null);
          }}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          aria-invalid={validationResult ? !validationResult.valid : undefined}
          aria-describedby={
            validationResult ? "token-validation-msg" : undefined
          }
          style={{
            width: "100%",
            padding: "var(--space-2) var(--space-3)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-sm)",
            fontFamily: "monospace",
          }}
        />

        {validationResult && (
          <div
            id="token-validation-msg"
            role="alert"
            style={{
              marginTop: "var(--space-1)",
              fontSize: "var(--font-size-xs)",
              color: validationResult.valid ? "var(--success)" : "var(--error)",
            }}
          >
            {validationResult.valid
              ? "✅ Token is valid"
              : `❌ ${validationResult.error}`}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={handleNext}
          disabled={!accessToken.trim() || isValidating}
          aria-busy={isValidating}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor:
              !accessToken.trim() || isValidating
                ? "var(--surface-tertiary)"
                : "var(--accent-primary)",
            color: "var(--text-inverse)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor:
              !accessToken.trim() || isValidating ? "not-allowed" : "pointer",
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {isValidating ? "Validating..." : "Next →"}
        </button>
      </div>
    </div>
  );
}

// Step 2: Repository Selection
function RepositoryStep({ onNext, onBack, data }: StepProps) {
  const [owner, setOwner] = useState(data.owner || "");
  const [repo, setRepo] = useState(data.repo || "");
  const [branch, setBranch] = useState(data.branch || "main");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);
  const [suggestedRepos, setSuggestedRepos] = useState<
    Array<{ name: string; full_name: string; private: boolean }>
  >([]);

  useEffect(() => {
    // Auto-populate user repositories
    if (data.accessToken && !owner) {
      fetchUserRepos();
    }
  }, [data.accessToken]);

  const fetchUserRepos = async () => {
    try {
      const response = await fetch(
        "https://api.github.com/user/repos?sort=updated&per_page=10",
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (response.ok) {
        const repos = await response.json();
        setSuggestedRepos(repos);
      }
    } catch (error) {
      console.warn("Failed to fetch repositories:", error);
    }
  };

  const validateRepository = async () => {
    if (!owner.trim() || !repo.trim()) return;

    setIsValidating(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (response.ok) {
        const repoData = await response.json();
        setValidationResult({ valid: true });
        setBranch(branch || repoData.default_branch);
        return true;
      } else {
        setValidationResult({
          valid: false,
          error: "Repository not found or no access",
        });
        return false;
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        error: "Failed to validate repository",
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = async () => {
    if (await validateRepository()) {
      onNext({ owner, repo, branch });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h3
          style={{
            margin: "0 0 var(--space-2) 0",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          📁 Repository Selection
        </h3>
        <p
          style={{
            margin: "0",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Choose the GitHub repository where you want to store your design
          tokens.
        </p>
      </div>

      {/* Suggested repositories */}
      {suggestedRepos.length > 0 && (
        <div style={{ marginBottom: "var(--space-4)" }}>
          <label
            id="recent-repos-label"
            style={{
              display: "block",
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--font-weight-bold)",
              marginBottom: "var(--space-2)",
            }}
          >
            Recent Repositories
          </label>
          <div
            role="listbox"
            aria-labelledby="recent-repos-label"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-1)",
              maxHeight: "120px",
              overflowY: "auto",
            }}
          >
            {suggestedRepos.slice(0, 5).map((suggestedRepo) => {
              const isSelected = `${owner}/${repo}` === suggestedRepo.full_name;
              return (
                <button
                  key={suggestedRepo.full_name}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    const [repoOwner, repoName] =
                      suggestedRepo.full_name.split("/");
                    setOwner(repoOwner);
                    setRepo(repoName);
                    setValidationResult(null);
                  }}
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    backgroundColor: isSelected
                      ? "var(--info-light)"
                      : "var(--surface-secondary)",
                    border: `1px solid ${isSelected ? "var(--accent-secondary)" : "var(--border-default)"}`,
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-sm)",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{suggestedRepo.full_name}</span>
                  {suggestedRepo.private && (
                    <span
                      aria-label="Private repository"
                      style={{
                        fontSize: "var(--font-size-xs)",
                        backgroundColor: "var(--surface-tertiary)",
                        padding: "2px var(--space-1)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      Private
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual repository input */}
      <div style={{ marginBottom: "var(--space-3)" }}>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="owner-input"
              style={{
                display: "block",
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--font-weight-bold)",
                marginBottom: "var(--space-1)",
              }}
            >
              Owner
            </label>
            <input
              id="owner-input"
              type="text"
              value={owner}
              onChange={(e) => {
                setOwner(e.currentTarget.value);
                setValidationResult(null);
              }}
              placeholder="username"
              style={{
                width: "100%",
                padding: "var(--space-2) var(--space-3)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--font-size-sm)",
              }}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label
              htmlFor="repo-input"
              style={{
                display: "block",
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--font-weight-bold)",
                marginBottom: "var(--space-1)",
              }}
            >
              Repository
            </label>
            <input
              id="repo-input"
              type="text"
              value={repo}
              onChange={(e) => {
                setRepo(e.currentTarget.value);
                setValidationResult(null);
              }}
              placeholder="repository-name"
              style={{
                width: "100%",
                padding: "var(--space-2) var(--space-3)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--font-size-sm)",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          htmlFor="branch-input"
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-bold)",
            marginBottom: "var(--space-1)",
          }}
        >
          Branch
        </label>
        <input
          id="branch-input"
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.currentTarget.value)}
          placeholder="main"
          aria-invalid={validationResult ? !validationResult.valid : undefined}
          aria-describedby={
            validationResult ? "repo-validation-msg" : undefined
          }
          style={{
            width: "100%",
            padding: "var(--space-2) var(--space-3)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-sm)",
          }}
        />

        {validationResult && (
          <div
            id="repo-validation-msg"
            role="alert"
            style={{
              marginTop: "var(--space-1)",
              fontSize: "var(--font-size-xs)",
              color: validationResult.valid ? "var(--success)" : "var(--error)",
            }}
          >
            {validationResult.valid
              ? "✅ Repository is accessible"
              : `❌ ${validationResult.error}`}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: "var(--surface-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            transition: "var(--transition-base)",
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={
            !owner.trim() || !repo.trim() || !branch.trim() || isValidating
          }
          aria-busy={isValidating}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor:
              !owner.trim() || !repo.trim() || !branch.trim() || isValidating
                ? "var(--surface-tertiary)"
                : "var(--accent-primary)",
            color: "var(--text-inverse)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor:
              !owner.trim() || !repo.trim() || !branch.trim() || isValidating
                ? "not-allowed"
                : "pointer",
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {isValidating ? "Validating..." : "Next →"}
        </button>
      </div>
    </div>
  );
}

// Step 3: Configuration
function ConfigurationStep({ onNext, onBack, data, isLast }: StepProps) {
  const [tokenPath, setTokenPath] = useState(
    data.tokenPath || "packages/tokens/io/sync/"
  );
  const [syncMode, setSyncMode] = useState<SyncMode>(
    data.syncMode || "pull-request"
  );

  const handleNext = () => {
    onNext({ tokenPath, syncMode });
  };

  return (
    <div>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h3
          style={{
            margin: "0 0 var(--space-2) 0",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          ⚙️ Configuration
        </h3>
        <p
          style={{
            margin: "0",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Configure how tokens will be stored and synchronized.
        </p>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          htmlFor="token-path-input"
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-bold)",
            marginBottom: "var(--space-1)",
          }}
        >
          Token Storage Path
        </label>
        <input
          id="token-path-input"
          type="text"
          value={tokenPath}
          onChange={(e) => setTokenPath(e.currentTarget.value)}
          placeholder="tokens/"
          aria-describedby="path-hint"
          style={{
            width: "100%",
            padding: "var(--space-2) var(--space-3)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-sm)",
          }}
        />
        <div
          id="path-hint"
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            marginTop: "2px",
          }}
        >
          Directory path where token files will be stored (e.g., "tokens/",
          "design-system/tokens/")
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          id="sync-mode-label"
          style={{
            display: "block",
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-bold)",
            marginBottom: "var(--space-2)",
          }}
        >
          Sync Mode
        </label>

        <div
          role="radiogroup"
          aria-labelledby="sync-mode-label"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              cursor: "pointer",
              gap: "var(--space-2)",
            }}
          >
            <input
              type="radio"
              name="syncMode"
              value="pull-request"
              checked={syncMode === "pull-request"}
              onChange={() => setSyncMode("pull-request")}
              style={{ marginTop: "2px" }}
            />
            <div>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                Pull Request Mode (Recommended)
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  lineHeight: "var(--line-height-relaxed)",
                }}
              >
                Creates pull requests for review before merging changes. Safer
                for team environments.
              </div>
            </div>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              cursor: "pointer",
              gap: "var(--space-2)",
            }}
          >
            <input
              type="radio"
              name="syncMode"
              value="direct"
              checked={syncMode === "direct"}
              onChange={() => setSyncMode("direct")}
              style={{ marginTop: "2px" }}
            />
            <div>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                Direct Sync
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  lineHeight: "var(--line-height-relaxed)",
                }}
              >
                Pushes and pulls changes directly to the branch. Faster but
                bypasses review.
              </div>
            </div>
          </label>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: "var(--surface-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            transition: "var(--transition-base)",
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!tokenPath.trim()}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: !tokenPath.trim()
              ? "var(--surface-tertiary)"
              : "var(--success)",
            color: "var(--text-inverse)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: !tokenPath.trim() ? "not-allowed" : "pointer",
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {isLast ? "Complete Setup ✓" : "Next →"}
        </button>
      </div>
    </div>
  );
}

export function SetupWizard({
  onComplete,
  onClose,
  initialConfig,
}: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<Partial<GitHubConfig>>(
    initialConfig || {}
  );

  const steps = [
    { component: AccessTokenStep, title: "Access Token" },
    { component: RepositoryStep, title: "Repository" },
    { component: ConfigurationStep, title: "Configuration" },
  ];

  const handleNext = (stepData: Partial<GitHubConfig>) => {
    const newConfig = { ...config, ...stepData };
    setConfig(newConfig);

    if (currentStep === steps.length - 1) {
      onComplete(newConfig as GitHubConfig);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  // Inline rendering — fills its container naturally (no fixed overlay or modal shell)
  return (
    <div aria-labelledby="wizard-title">
      {/* Header */}
      <div
        style={{
          marginBottom: "var(--space-4)",
        }}
      >
        <h2
          id="wizard-title"
          style={{
            margin: "0 0 var(--space-1) 0",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          🚀 GitHub Setup Wizard
        </h2>
        <div
          aria-live="polite"
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
          }}
        >
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </div>
      </div>

      {/* Progress indicator */}
      <div
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label="Setup progress"
        style={{
          display: "flex",
          gap: "var(--space-1)",
          marginBottom: "var(--space-6)",
          justifyContent: "center",
        }}
      >
        {steps.map((_, index) => (
          <div
            key={index}
            style={{
              width: "40px",
              height: "4px",
              backgroundColor:
                index <= currentStep
                  ? "var(--accent-primary)"
                  : "var(--border-default)",
              borderRadius: "var(--radius-sm)",
              transition: "background-color 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Current step */}
      <CurrentStepComponent
        onNext={handleNext}
        onBack={handleBack}
        data={config}
        isFirst={currentStep === 0}
        isLast={currentStep === steps.length - 1}
      />
    </div>
  );
}
