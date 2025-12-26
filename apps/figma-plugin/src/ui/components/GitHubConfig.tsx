import { useState, useEffect } from "preact/hooks";
import type { GitHubConfig, SyncMode } from "../../shared/types";

interface GitHubConfigProps {
  onConfigSaved: (config: GitHubConfig) => void;
  onClose: () => void;
}

export function GitHubConfig({ onConfigSaved, onClose }: GitHubConfigProps) {
  const [config, setConfig] = useState<GitHubConfig>({
    owner: "",
    repo: "",
    branch: "main",
    tokenPath: "tokens",
    accessToken: "",
    syncMode: "pull-request", // Quick Win #8 - Smart default to safer mode
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  // Enhanced Smart Defaults - Quick Win #8
  const getSmartTokenPath = (repoName: string): string => {
    const commonPatterns = {
      "design-system": "packages/tokens/src",
      "design-tokens": "tokens",
      ds: "design-tokens",
      ui: "tokens",
      components: "src/tokens",
      style: "tokens",
      theme: "tokens",
      monorepo: "packages/design-tokens",
      workspace: "packages/tokens",
    };

    const repoLower = repoName.toLowerCase();

    // Check for monorepo indicators
    if (
      repoLower.includes("mono") ||
      repoLower.includes("workspace") ||
      repoLower.includes("packages")
    ) {
      return "packages/tokens/src";
    }

    for (const [pattern, path] of Object.entries(commonPatterns)) {
      if (repoLower.includes(pattern)) {
        return path;
      }
    }

    return "tokens";
  };

  const getSuggestedBranch = (): string[] => {
    return ["main", "master", "develop", "design-tokens"];
  };

  const getRepositoryStructureSuggestions = (repoName: string): string[] => {
    const suggestions = [];
    const repoLower = repoName.toLowerCase();

    if (repoLower.includes("mono") || repoLower.includes("workspace")) {
      suggestions.push(
        "📦 Detected monorepo - suggested path: packages/tokens/src"
      );
    }

    if (repoLower.includes("design-system") || repoLower.includes("ds")) {
      suggestions.push(
        "🎨 Design system detected - consider organizing by token types"
      );
    }

    if (repoLower.includes("component") || repoLower.includes("ui")) {
      suggestions.push(
        "🧩 Component library - tokens often in src/tokens or tokens/"
      );
    }

    return suggestions;
  };

  // Load saved configuration
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      if (msg.type === "github-config-loaded" && msg.config) {
        console.log("Loading saved GitHub config:", msg.config);
        setConfig({
          owner: msg.config.owner || "",
          repo: msg.config.repo || "",
          branch: msg.config.branch || "main",
          tokenPath: msg.config.tokenPath || "tokens",
          accessToken: msg.config.accessToken || "",
          syncMode: msg.config.syncMode || "direct",
        });
      }
    };

    window.addEventListener("message", handleMessage);
    loadSavedConfig();

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const loadSavedConfig = () => {
    try {
      parent.postMessage(
        {
          pluginMessage: {
            type: "get-github-config",
          },
        },
        "*"
      );
    } catch (err) {
      console.error("Failed to load GitHub config:", err);
    }
  };

  const handleSave = async () => {
    if (!config.owner || !config.repo || !config.accessToken) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Test the configuration
      parent.postMessage(
        {
          pluginMessage: {
            type: "test-github-config",
            config,
          },
        },
        "*"
      );
    } catch (err) {
      console.error("Failed to test GitHub config:", err);
      setError("Failed to test configuration");
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof GitHubConfig,
    value: string | SyncMode
  ) => {
    setConfig((prev) => {
      const newConfig = { ...prev, [field]: value };

      // Smart defaults - Quick Win #8
      if (field === "repo" && typeof value === "string" && value) {
        // Auto-update token path when repo changes if it's still default
        if (!prev.tokenPath || prev.tokenPath === "tokens") {
          newConfig.tokenPath = getSmartTokenPath(value);
        }
      }

      return newConfig;
    });
    setError(null);
  };

  return (
    <div style={{ padding: "var(--space-4)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-4)",
        }}
      >
        <h2
          style={{
            margin: "0",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--text-primary)",
          }}
        >
          GitHub Configuration
        </h2>
        <button
          onClick={onClose}
          style={{
            padding: "var(--space-1) var(--space-2)",
            backgroundColor: "var(--surface-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            transition: "var(--transition-base)",
          }}
        >
          ✕
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "var(--space-2) var(--space-3)",
            marginBottom: "var(--space-4)",
            backgroundColor: "var(--error-light)",
            border: "1px solid var(--error)",
            borderRadius: "var(--radius-md)",
            color: "var(--error)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          ❌ {error}
        </div>
      )}

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--space-2)",
            color: "var(--text-primary)",
          }}
        >
          Sync Mode
        </label>
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            marginBottom: "var(--space-2)",
          }}
        >
          <label
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <input
              type="radio"
              name="syncMode"
              value="direct"
              checked={config.syncMode === "direct"}
              onChange={(e) =>
                handleInputChange(
                  "syncMode",
                  (e.target as HTMLInputElement).value as SyncMode
                )
              }
              style={{ marginRight: "var(--space-2)" }}
            />
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--text-primary)",
              }}
            >
              Direct Sync
            </span>
          </label>
          <label
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <input
              type="radio"
              name="syncMode"
              value="pull-request"
              checked={config.syncMode === "pull-request"}
              onChange={(e) =>
                handleInputChange(
                  "syncMode",
                  (e.target as HTMLInputElement).value as SyncMode
                )
              }
              style={{ marginRight: "var(--space-2)" }}
            />
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--text-primary)",
              }}
            >
              Pull Request Mode
            </span>
          </label>
        </div>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
            padding: "var(--space-2)",
            backgroundColor:
              config.syncMode === "direct"
                ? "var(--info-light)"
                : "var(--surface-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
          }}
        >
          {config.syncMode === "direct" ? (
            <>
              <strong>Direct Sync:</strong> Push/pull directly to configured
              branch. Enables bi-directional sync with conflict resolution.
            </>
          ) : (
            <>
              <strong>Pull Request Mode:</strong> Creates pull requests for
              review. Export only, no pulling from repository.
            </>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--space-1)",
            color: "var(--text-primary)",
          }}
        >
          Repository Owner <span style={{ color: "var(--error)" }}>*</span>
        </label>
        <input
          type="text"
          value={config.owner}
          onChange={(e) =>
            handleInputChange("owner", (e.target as HTMLInputElement).value)
          }
          placeholder="e.g., your-username or org-name"
          style={{
            width: "100%",
            padding: "var(--space-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
            backgroundColor: "var(--surface-primary)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--space-1)",
            color: "var(--text-primary)",
          }}
        >
          Repository Name <span style={{ color: "var(--error)" }}>*</span>
        </label>
        <input
          type="text"
          value={config.repo}
          onChange={(e) =>
            handleInputChange("repo", (e.target as HTMLInputElement).value)
          }
          placeholder="e.g., design-system-tokens"
          style={{
            width: "100%",
            padding: "var(--space-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
            backgroundColor: "var(--surface-primary)",
            color: "var(--text-primary)",
          }}
        />
        {/* Repository Structure Suggestions - Quick Win #8 */}
        {config.repo &&
          getRepositoryStructureSuggestions(config.repo).length > 0 && (
            <div
              style={{
                marginTop: "var(--space-2)",
                padding: "var(--space-2)",
                backgroundColor: "var(--info-light)",
                border: "1px solid var(--info)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-xs)",
              }}
            >
              <div
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  marginBottom: "var(--space-1)",
                  color: "var(--text-primary)",
                }}
              >
                💡 Repository Insights:
              </div>
              {getRepositoryStructureSuggestions(config.repo).map(
                (suggestion, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "2px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {suggestion}
                  </div>
                )
              )}
            </div>
          )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginBottom: "var(--space-4)",
        }}
      >
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              marginBottom: "var(--space-1)",
              color: "var(--text-primary)",
            }}
          >
            Branch
          </label>
          <input
            type="text"
            value={config.branch}
            onChange={(e) =>
              handleInputChange("branch", (e.target as HTMLInputElement).value)
            }
            placeholder="main"
            style={{
              width: "100%",
              padding: "var(--space-2)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
              backgroundColor: "var(--surface-primary)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              marginBottom: "var(--space-1)",
              color: "var(--text-primary)",
            }}
          >
            Token Path
          </label>
          <input
            type="text"
            value={config.tokenPath}
            onChange={(e) =>
              handleInputChange(
                "tokenPath",
                (e.target as HTMLInputElement).value
              )
            }
            placeholder="tokens"
            style={{
              width: "100%",
              padding: "var(--space-2)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
              backgroundColor: "var(--surface-primary)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--space-1)",
            color: "var(--text-primary)",
          }}
        >
          Personal Access Token <span style={{ color: "var(--error)" }}>*</span>
        </label>
        <input
          type="password"
          value={config.accessToken}
          onChange={(e) =>
            handleInputChange(
              "accessToken",
              (e.target as HTMLInputElement).value
            )
          }
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          style={{
            width: "100%",
            padding: "var(--space-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
            backgroundColor: "var(--surface-primary)",
            color: "var(--text-primary)",
          }}
        />
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            marginTop: "var(--space-1)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            style={{
              color: "var(--accent-primary)",
              textDecoration: "underline",
            }}
          >
            Create a token
          </a>{" "}
          with 'repo' permissions
        </div>
      </div>

      <div
        style={{
          padding: "var(--space-3)",
          backgroundColor: "var(--info-light)",
          border: "1px solid var(--info)",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--space-4)",
        }}
      >
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--space-1)",
            color: "var(--text-primary)",
          }}
        >
          📁 Token File Organization
        </div>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Each collection will be saved as a separate file:
          <br />
          <code
            style={{
              backgroundColor: "var(--surface-secondary)",
              padding: "2px var(--space-1)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
            }}
          >
            {config.tokenPath}/primitive.json
            <br />
            {config.tokenPath}/semantic-light.json
          </code>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: "var(--surface-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            fontWeight: "var(--font-weight-medium)",
            transition: "var(--transition-base)",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={
            loading || !config.owner || !config.repo || !config.accessToken
          }
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: loading
              ? "var(--surface-secondary)"
              : "var(--accent-primary)",
            color: loading ? "var(--text-tertiary)" : "var(--text-inverse)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor:
              loading || !config.owner || !config.repo || !config.accessToken
                ? "not-allowed"
                : "pointer",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            transition: "var(--transition-base)",
            opacity:
              loading || !config.owner || !config.repo || !config.accessToken
                ? 0.5
                : 1,
          }}
        >
          {loading ? "Testing..." : "Save & Test"}
        </button>
      </div>
    </div>
  );
}
