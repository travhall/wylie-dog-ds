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
    <div style={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ margin: "0", fontSize: "16px", fontWeight: "bold" }}>
          GitHub Configuration
        </h2>
        <button
          onClick={onClose}
          style={{
            padding: "4px 8px",
            backgroundColor: "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          ✕
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "8px 12px",
            marginBottom: "16px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "4px",
            color: "#c33",
            fontSize: "12px",
          }}
        >
          ❌ {error}
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#374151",
          }}
        >
          Sync Mode
        </label>
        <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
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
              style={{ marginRight: "6px" }}
            />
            <span style={{ fontSize: "12px" }}>Direct Sync</span>
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
              style={{ marginRight: "6px" }}
            />
            <span style={{ fontSize: "12px" }}>Pull Request Mode</span>
          </label>
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#6b7280",
            lineHeight: "1.4",
            padding: "8px",
            backgroundColor:
              config.syncMode === "direct" ? "#f0f9ff" : "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
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

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "4px",
            color: "#374151",
          }}
        >
          Repository Owner <span style={{ color: "#ef4444" }}>*</span>
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
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "4px",
            color: "#374151",
          }}
        >
          Repository Name <span style={{ color: "#ef4444" }}>*</span>
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
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        />
        {/* Repository Structure Suggestions - Quick Win #8 */}
        {config.repo &&
          getRepositoryStructureSuggestions(config.repo).length > 0 && (
            <div
              style={{
                marginTop: "8px",
                padding: "8px",
                backgroundColor: "#f0f9ff",
                border: "1px solid #bfdbfe",
                borderRadius: "4px",
                fontSize: "10px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "4px",
                  color: "#1d4ed8",
                }}
              >
                💡 Repository Insights:
              </div>
              {getRepositoryStructureSuggestions(config.repo).map(
                (suggestion, index) => (
                  <div
                    key={index}
                    style={{ marginBottom: "2px", color: "#1e40af" }}
                  >
                    {suggestion}
                  </div>
                )
              )}
            </div>
          )}
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "4px",
              color: "#374151",
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
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "4px",
              color: "#374151",
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
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "4px",
            color: "#374151",
          }}
        >
          Personal Access Token <span style={{ color: "#ef4444" }}>*</span>
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
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        />
        <div
          style={{
            fontSize: "10px",
            color: "#6b7280",
            marginTop: "4px",
            lineHeight: "1.4",
          }}
        >
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            style={{ color: "#3b82f6", textDecoration: "underline" }}
          >
            Create a token
          </a>{" "}
          with 'repo' permissions
        </div>
      </div>

      <div
        style={{
          padding: "12px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "4px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            marginBottom: "4px",
            color: "#0369a1",
          }}
        >
          📁 Token File Organization
        </div>
        <div style={{ fontSize: "10px", color: "#0c4a6e", lineHeight: "1.4" }}>
          Each collection will be saved as a separate file:
          <br />
          <code
            style={{
              backgroundColor: "#e0f2fe",
              padding: "2px 4px",
              borderRadius: "2px",
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
          gap: "8px",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f9fafb",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "12px",
            color: "#374151",
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
            padding: "8px 16px",
            backgroundColor: loading ? "#cbd5e1" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor:
              loading || !config.owner || !config.repo || !config.accessToken
                ? "not-allowed"
                : "pointer",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {loading ? "Testing..." : "Save & Test"}
        </button>
      </div>
    </div>
  );
}
