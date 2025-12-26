import { useState } from "preact/hooks";
import type { GitHubConfig } from "../../shared/types";
import { parseGitHubUrl } from "../utils/parseGitHubUrl";

interface QuickGitHubSetupProps {
  onConfigSaved: (config: GitHubConfig) => void;
  onShowAdvanced: () => void;
  onClose: () => void;
}

/**
 * Simplified GitHub setup for 80% of users
 * Transforms simple inputs into full GitHubConfig
 */
export function QuickGitHubSetup({
  onConfigSaved,
  onShowAdvanced,
  onClose,
}: QuickGitHubSetupProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setUrlError(null);
      return;
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setUrlError("Invalid GitHub URL. Try: github.com/owner/repo");
    } else {
      setUrlError(null);
    }
  };

  const handleUrlChange = (value: string) => {
    setRepoUrl(value);
    validateUrl(value);
    setError(null);
  };

  const handleConnect = async () => {
    // Validation
    if (!repoUrl.trim() || !accessToken.trim()) {
      setError("Please fill in both repository URL and access token");
      return;
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      setError("Invalid GitHub repository URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Transform to full GitHubConfig with smart defaults
      const config: GitHubConfig = {
        owner: parsed.owner,
        repo: parsed.repo,
        branch: "main", // Default to main
        tokenPath: "tokens", // Default path
        accessToken: accessToken.trim(),
        syncMode: "direct", // Default to direct sync (bi-directional)
      };

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

      // Note: Actual save happens when test succeeds (handled in App.tsx message listener)
      // We pass the config up so it can be saved on success
      onConfigSaved(config);
    } catch (err) {
      console.error("Failed to connect to GitHub:", err);
      setError("Failed to connect. Please check your inputs.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "var(--space-4)",
        backgroundColor: "var(--surface-primary)",
      }}
    >
      {/* Header */}
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
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--text-primary)",
          }}
        >
          Connect to GitHub
        </h2>
        <button
          onClick={onClose}
          style={{
            padding: "var(--space-1) var(--space-2)",
            backgroundColor: "var(--surface-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            transition: "var(--transition-base)",
          }}
        >
          ✕
        </button>
      </div>

      <p
        style={{
          margin: "0 0 var(--space-6) 0",
          fontSize: "var(--font-size-sm)",
          color: "var(--text-secondary)",
          lineHeight: "var(--line-height-relaxed)",
        }}
      >
        Sync your design tokens with GitHub in two simple steps
      </p>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: "var(--space-3)",
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

      {/* Repository URL Input */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            marginBottom: "var(--space-2)",
            color: "var(--text-primary)",
          }}
        >
          Repository URL
          <span
            title="Enter the full GitHub repository URL (e.g., https://github.com/owner/repo)"
            style={{
              marginLeft: "var(--space-1)",
              cursor: "help",
              fontSize: "var(--font-size-xs)",
              color: "var(--info)",
            }}
          >
            ℹ️
          </span>
        </label>
        <input
          type="text"
          value={repoUrl}
          onInput={(e) => handleUrlChange((e.target as HTMLInputElement).value)}
          placeholder="https://github.com/owner/repo"
          style={{
            width: "100%",
            padding: "var(--space-2)",
            fontSize: "var(--font-size-sm)",
            fontFamily: "var(--font-family-base)",
            border: `1px solid ${urlError ? "var(--error)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--surface-primary)",
            color: "var(--text-primary)",
            transition: "var(--transition-base)",
          }}
          disabled={loading}
        />
        {urlError && (
          <div
            style={{
              marginTop: "var(--space-1)",
              fontSize: "var(--font-size-xs)",
              color: "var(--error)",
            }}
          >
            {urlError}
          </div>
        )}
        <div
          style={{
            marginTop: "var(--space-1)",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
          }}
        >
          Example: github.com/your-org/design-tokens
        </div>
      </div>

      {/* Personal Access Token Input */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            marginBottom: "var(--space-2)",
            color: "var(--text-primary)",
          }}
        >
          Personal Access Token
          <span
            title="Required GitHub permissions: repo (full control of private repositories)"
            style={{
              marginLeft: "var(--space-1)",
              cursor: "help",
              fontSize: "var(--font-size-xs)",
              color: "var(--info)",
            }}
          >
            ℹ️
          </span>
        </label>
        <input
          type="password"
          value={accessToken}
          onInput={(e) => {
            setAccessToken((e.target as HTMLInputElement).value);
            setError(null);
          }}
          placeholder="ghp_••••••••••••••••••••••••••••••••"
          style={{
            width: "100%",
            padding: "var(--space-2)",
            fontSize: "var(--font-size-sm)",
            fontFamily: "'SF Mono', 'Monaco', 'Courier', monospace",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--surface-primary)",
            color: "var(--text-primary)",
            transition: "var(--transition-base)",
          }}
          disabled={loading}
        />
        <div
          style={{
            marginTop: "var(--space-2)",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
          }}
        >
          Need a token?{" "}
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=Figma%20Token%20Bridge"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--accent-primary)",
              textDecoration: "none",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            Create one →
          </a>
        </div>
      </div>

      {/* Info Box - Defaults */}
      <div
        style={{
          padding: "var(--space-3)",
          marginBottom: "var(--space-4)",
          backgroundColor: "var(--info-light)",
          border: "1px solid var(--info)",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--font-size-xs)",
          color: "var(--text-secondary)",
          lineHeight: "var(--line-height-relaxed)",
        }}
      >
        <div
          style={{
            fontWeight: "var(--font-weight-medium)",
            marginBottom: "var(--space-1)",
            color: "var(--text-primary)",
          }}
        >
          ℹ️ Quick setup uses smart defaults:
        </div>
        <ul style={{ margin: "0", paddingLeft: "var(--space-5)" }}>
          <li>
            Branch: <code>main</code>
          </li>
          <li>
            Token path: <code>tokens/</code>
          </li>
          <li>Sync mode: Bi-directional (with conflict detection)</li>
        </ul>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          marginTop: "var(--space-6)",
        }}
      >
        <button
          onClick={handleConnect}
          disabled={loading || !!urlError || !repoUrl || !accessToken}
          style={{
            flex: "1",
            padding: "var(--space-3)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--text-inverse)",
            backgroundColor:
              loading || urlError
                ? "var(--border-default)"
                : "var(--accent-primary)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: loading || urlError ? "not-allowed" : "pointer",
            transition: "var(--transition-base)",
            boxShadow: loading || urlError ? "none" : "var(--shadow-sm)",
          }}
        >
          {loading ? "Connecting..." : "Connect"}
        </button>
        <button
          onClick={onShowAdvanced}
          disabled={loading}
          style={{
            padding: "var(--space-3)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--text-secondary)",
            backgroundColor: "transparent",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            transition: "var(--transition-base)",
          }}
        >
          Advanced
        </button>
      </div>
    </div>
  );
}
