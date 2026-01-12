import { useState, useEffect } from "preact/hooks";
import type { GitHubConfig } from "../../shared/types";
import { parseGitHubUrl } from "../utils/parseGitHubUrl";

interface QuickGitHubSetupProps {
  onConfigSaved: (config: GitHubConfig) => void;
  onShowAdvanced: () => void;
  onClose: () => void;
}

type AuthMethod = "oauth" | "pat";

/**
 * Simplified GitHub setup for 80% of users
 * Transforms simple inputs into full GitHubConfig
 */
export function QuickGitHubSetup({
  onConfigSaved,
  onShowAdvanced,
  onClose,
}: QuickGitHubSetupProps) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("oauth");
  const [repoUrl, setRepoUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [deviceCode, setDeviceCode] = useState<{
    userCode: string;
    verificationUri: string;
    expiresIn: number;
  } | null>(null);
  const [status, setStatus] = useState<string>("");

  // Listen for OAuth messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;

      if (msg?.type === "oauth-device-code") {
        // Display device code for user
        setDeviceCode({
          userCode: msg.userCode,
          verificationUri: msg.verificationUri,
          expiresIn: msg.expiresIn,
        });
        setStatus("Waiting for authorization...");
      } else if (msg?.type === "oauth-success") {
        setStatus("Successfully authenticated!");

        // Create config with OAuth token
        const parsed = parseGitHubUrl(repoUrl);
        if (parsed && msg.accessToken) {
          const config: GitHubConfig = {
            owner: parsed.owner,
            repo: parsed.repo,
            branch: "main",
            tokenPath: "tokens",
            accessToken: msg.accessToken,
            authMethod: "oauth",
            syncMode: "direct",
          };

          // Save config after short delay for user to see success message
          setTimeout(() => {
            onConfigSaved(config);
          }, 1000);
        }
      } else if (msg?.type === "oauth-error") {
        setError(msg.error || "Authentication failed");
        setLoading(false);
        setStatus("");
        setDeviceCode(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [repoUrl, onConfigSaved]);

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

  const handleOAuthConnect = async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a repository URL");
      return;
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      setError("Invalid GitHub repository URL");
      return;
    }

    setLoading(true);
    setError(null);
    setDeviceCode(null);
    setStatus("Starting authentication...");

    // Initiate OAuth flow
    parent.postMessage(
      {
        pluginMessage: {
          type: "oauth-initiate",
          provider: "github",
          repoUrl: repoUrl.trim(),
        },
      },
      "*"
    );
  };

  const handlePATConnect = async () => {
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
        authMethod: "pat",
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

  const handleConnect =
    authMethod === "oauth" ? handleOAuthConnect : handlePATConnect;

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
          margin: "0 0 var(--space-4) 0",
          fontSize: "var(--font-size-sm)",
          color: "var(--text-secondary)",
          lineHeight: "var(--line-height-relaxed)",
        }}
      >
        Sync your design tokens with GitHub
      </p>

      {/* Auth Method Toggle */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <label
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            marginBottom: "var(--space-2)",
            color: "var(--text-primary)",
          }}
        >
          Authentication Method
        </label>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            onClick={() => setAuthMethod("oauth")}
            disabled={loading}
            style={{
              flex: 1,
              padding: "var(--space-2) var(--space-3)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              color:
                authMethod === "oauth"
                  ? "var(--text-inverse)"
                  : "var(--text-secondary)",
              backgroundColor:
                authMethod === "oauth"
                  ? "var(--accent-primary)"
                  : "var(--surface-secondary)",
              border: `1px solid ${authMethod === "oauth" ? "var(--accent-primary)" : "var(--border-default)"}`,
              borderRadius: "var(--radius-md)",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: loading ? 0.5 : 1,
            }}
          >
            OAuth (Recommended)
          </button>
          <button
            onClick={() => setAuthMethod("pat")}
            disabled={loading}
            style={{
              flex: 1,
              padding: "var(--space-2) var(--space-3)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              color:
                authMethod === "pat"
                  ? "var(--text-inverse)"
                  : "var(--text-secondary)",
              backgroundColor:
                authMethod === "pat"
                  ? "var(--accent-primary)"
                  : "var(--surface-secondary)",
              border: `1px solid ${authMethod === "pat" ? "var(--accent-primary)" : "var(--border-default)"}`,
              borderRadius: "var(--radius-md)",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: loading ? 0.5 : 1,
            }}
          >
            Personal Access Token
          </button>
        </div>
      </div>

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

      {/* Status Display */}
      {status && (
        <div
          style={{
            padding: "var(--space-3)",
            marginBottom: "var(--space-4)",
            backgroundColor: "var(--info-light)",
            border: "1px solid var(--info)",
            borderRadius: "var(--radius-md)",
            color: "var(--info)",
            fontSize: "var(--font-size-sm)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "16px",
              height: "16px",
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          {status}
        </div>
      )}

      {/* Device Code Display */}
      {deviceCode && (
        <div
          style={{
            padding: "var(--space-4)",
            marginBottom: "var(--space-4)",
            backgroundColor: "var(--accent-light)",
            border: "2px solid var(--accent-primary)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--text-primary)",
              marginBottom: "var(--space-3)",
            }}
          >
            🔑 Enter this code on GitHub:
          </div>

          <div
            style={{
              padding: "var(--space-4)",
              backgroundColor: "var(--surface-primary)",
              border: "2px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
              marginBottom: "var(--space-4)",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "var(--font-weight-bold)",
                letterSpacing: "0.25em",
                fontFamily: "monospace",
                color: "var(--accent-primary)",
              }}
            >
              {deviceCode.userCode}
            </div>
          </div>

          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              marginBottom: "var(--space-3)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            1. Visit: <strong>{deviceCode.verificationUri}</strong>
            <br />
            2. Enter the code above
            <br />
            3. Authorize the application
            <br />
            4. Return here - we'll detect it automatically!
          </div>

          <button
            onClick={() => window.open(deviceCode.verificationUri, "_blank")}
            style={{
              width: "100%",
              padding: "var(--space-2)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--text-inverse)",
              backgroundColor: "var(--accent-primary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            Open GitHub →
          </button>
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

      {/* Personal Access Token Input (PAT mode only) */}
      {authMethod === "pat" && (
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
      )}

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
          disabled={
            loading ||
            !!urlError ||
            !repoUrl ||
            (authMethod === "pat" && !accessToken)
          }
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
