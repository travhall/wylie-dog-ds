import { useState, useEffect } from "preact/hooks";
import type { GitHubConfig, SyncMode } from "../../shared/types";

interface SetupWizardProps {
  onComplete: (config: GitHubConfig) => void;
  onClose: () => void;
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
        const user = await response.json();
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
      <div style={{ marginBottom: "16px" }}>
        <h3
          style={{
            margin: "0 0 8px 0",
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
            style={{ color: "#0066cc", textDecoration: "none" }}
          >
            GitHub Settings
          </a>{" "}
          with "repo" permissions.
        </p>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
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
          type="password"
          value={accessToken}
          onChange={(e) => {
            setAccessToken(e.currentTarget.value);
            setValidationResult(null);
          }}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
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
            style={{
              marginTop: "4px",
              fontSize: "10px",
              color: validationResult.valid ? "#059669" : "#dc2626",
            }}
          >
            {validationResult.valid
              ? "✅ Token is valid"
              : `❌ ${validationResult.error}`}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button
          onClick={handleNext}
          disabled={!accessToken.trim() || isValidating}
          style={{
            padding: "8px 16px",
            backgroundColor:
              !accessToken.trim() || isValidating ? "#cbd5e1" : "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor:
              !accessToken.trim() || isValidating ? "not-allowed" : "pointer",
            fontSize: "12px",
            fontWeight: "bold",
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

        // Auto-select first repo if none specified
        if (!owner && !repo && repos.length > 0) {
          const firstRepo = repos[0];
          const [repoOwner, repoName] = firstRepo.full_name.split("/");
          setOwner(repoOwner);
          setRepo(repoName);
        }
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
      <div style={{ marginBottom: "16px" }}>
        <h3
          style={{
            margin: "0 0 8px 0",
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
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Recent Repositories
          </label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              maxHeight: "120px",
              overflowY: "auto",
            }}
          >
            {suggestedRepos.slice(0, 5).map((suggestedRepo) => (
              <button
                key={suggestedRepo.full_name}
                onClick={() => {
                  const [repoOwner, repoName] =
                    suggestedRepo.full_name.split("/");
                  setOwner(repoOwner);
                  setRepo(repoName);
                  setValidationResult(null);
                }}
                style={{
                  padding: "8px 12px",
                  backgroundColor:
                    `${owner}/${repo}` === suggestedRepo.full_name
                      ? "#e0f2fe"
                      : "#f9fafb",
                  border:
                    "1px solid " +
                    (`${owner}/${repo}` === suggestedRepo.full_name
                      ? "#0891b2"
                      : "#e5e7eb"),
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{suggestedRepo.full_name}</span>
                {suggestedRepo.private && (
                  <span
                    style={{
                      fontSize: "9px",
                      backgroundColor: "#f3f4f6",
                      padding: "2px 4px",
                      borderRadius: "2px",
                    }}
                  >
                    Private
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual repository input */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              Owner
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => {
                setOwner(e.currentTarget.value);
                setValidationResult(null);
              }}
              placeholder="username"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "11px",
              }}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              Repository
            </label>
            <input
              type="text"
              value={repo}
              onChange={(e) => {
                setRepo(e.currentTarget.value);
                setValidationResult(null);
              }}
              placeholder="repository-name"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "11px",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
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
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.currentTarget.value)}
          placeholder="main"
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
            style={{
              marginTop: "4px",
              fontSize: "10px",
              color: validationResult.valid ? "#059669" : "#dc2626",
            }}
          >
            {validationResult.valid
              ? "✅ Repository is accessible"
              : `❌ ${validationResult.error}`}
          </div>
        )}
      </div>

      <div
        style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}
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
          style={{
            padding: "8px 16px",
            backgroundColor:
              !owner.trim() || !repo.trim() || !branch.trim() || isValidating
                ? "#cbd5e1"
                : "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor:
              !owner.trim() || !repo.trim() || !branch.trim() || isValidating
                ? "not-allowed"
                : "pointer",
            fontSize: "12px",
            fontWeight: "bold",
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
      <div style={{ marginBottom: "16px" }}>
        <h3
          style={{
            margin: "0 0 8px 0",
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

      <div style={{ marginBottom: "16px" }}>
        <label
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
          type="text"
          value={tokenPath}
          onChange={(e) => setTokenPath(e.currentTarget.value)}
          placeholder="tokens/"
          style={{
            width: "100%",
            padding: "var(--space-2) var(--space-3)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-sm)",
          }}
        />
        <div
          style={{
            fontSize: "10px",
            color: "var(--text-secondary)",
            marginTop: "2px",
          }}
        >
          Directory path where token files will be stored (e.g., "tokens/",
          "design-system/tokens/")
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "8px",
          }}
        >
          Sync Mode
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              cursor: "pointer",
              gap: "8px",
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
              <div style={{ fontSize: "11px", fontWeight: "bold" }}>
                Pull Request Mode (Recommended)
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.3",
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
              gap: "8px",
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
              <div style={{ fontSize: "11px", fontWeight: "bold" }}>
                Direct Sync
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.3",
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
        style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}
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
            padding: "8px 16px",
            backgroundColor: !tokenPath.trim() ? "#cbd5e1" : "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: !tokenPath.trim() ? "not-allowed" : "pointer",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {isLast ? "Complete Setup ✓" : "Next →"}
        </button>
      </div>
    </div>
  );
}

export function SetupWizard({ onComplete, onClose }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<Partial<GitHubConfig>>({});

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

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--surface-primary)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          width: "90%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ margin: "0", fontSize: "16px", fontWeight: "bold" }}>
              🚀 GitHub Setup Wizard
            </h2>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                marginTop: "2px",
              }}
            >
              Step {currentStep + 1} of {steps.length}:{" "}
              {steps[currentStep].title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "4px 8px",
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              color: "#374151",
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress indicator */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "24px",
            justifyContent: "center",
          }}
        >
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: index <= currentStep ? "#0066cc" : "#e5e7eb",
                borderRadius: "2px",
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
    </div>
  );
}
