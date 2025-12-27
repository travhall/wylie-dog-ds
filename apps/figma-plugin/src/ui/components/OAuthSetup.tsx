import { useState } from "preact/hooks";

type OAuthProvider = "github" | "gitlab" | "bitbucket";

interface OAuthSetupProps {
  onSuccess: (provider: OAuthProvider) => void;
  onCancel: () => void;
}

/**
 * OAuth Setup Component
 * Handles OAuth authentication flow with visual feedback
 */
export function OAuthSetup({ onSuccess, onCancel }: OAuthSetupProps) {
  const [selectedProvider, setSelectedProvider] =
    useState<OAuthProvider>("github");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    setStatus("Opening authentication window...");

    try {
      // Send message to plugin to initiate OAuth
      parent.postMessage(
        {
          pluginMessage: {
            type: "oauth-initiate",
            provider: selectedProvider,
          },
        },
        "*"
      );

      setStatus("Waiting for authorization...");

      // Listen for completion
      const handleMessage = (event: MessageEvent) => {
        const msg = event.data.pluginMessage;

        if (msg?.type === "oauth-success") {
          setStatus("Successfully authenticated!");
          setTimeout(() => {
            onSuccess(selectedProvider);
          }, 1000);
        } else if (msg?.type === "oauth-error") {
          setError(msg.error || "Authentication failed");
          setLoading(false);
          setStatus("");
        }
      };

      window.addEventListener("message", handleMessage);

      // Cleanup listener after 5 minutes
      setTimeout(() => {
        window.removeEventListener("message", handleMessage);
      }, 300000);
    } catch (err: any) {
      setError(err.message || "Failed to initiate OAuth");
      setLoading(false);
      setStatus("");
    }
  };

  const providers = [
    {
      id: "github" as const,
      name: "GitHub",
      icon: "🐙",
      description: "Connect to GitHub repositories",
    },
    {
      id: "gitlab" as const,
      name: "GitLab",
      icon: "🦊",
      description: "Connect to GitLab projects",
    },
    {
      id: "bitbucket" as const,
      name: "Bitbucket",
      icon: "🪣",
      description: "Connect to Bitbucket repositories",
    },
  ];

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
          Connect with OAuth
        </h2>
        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: "var(--space-1) var(--space-2)",
            backgroundColor: "var(--surface-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            opacity: loading ? 0.5 : 1,
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
        Securely authenticate with your Git provider. No need to manually create
        tokens!
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

      {/* Provider Selection */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <label
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            marginBottom: "var(--space-3)",
            color: "var(--text-primary)",
          }}
        >
          Select Provider
        </label>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              disabled={loading}
              style={{
                padding: "var(--space-3)",
                backgroundColor:
                  selectedProvider === provider.id
                    ? "var(--accent-light)"
                    : "var(--surface-secondary)",
                border:
                  selectedProvider === provider.id
                    ? "2px solid var(--accent-primary)"
                    : "2px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                cursor: loading ? "not-allowed" : "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                opacity: loading ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                }}
              >
                <span style={{ fontSize: "24px" }}>{provider.icon}</span>
                <div>
                  <div
                    style={{
                      fontWeight: "var(--font-weight-medium)",
                      color: "var(--text-primary)",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    {provider.name}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {provider.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
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
          ℹ️ How OAuth works:
        </div>
        <ol style={{ margin: "0", paddingLeft: "var(--space-5)" }}>
          <li>Click "Connect" to open your browser</li>
          <li>Authorize Token Bridge on your provider</li>
          <li>Return to Figma - you're done!</li>
        </ol>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
        }}
      >
        <button
          onClick={handleConnect}
          disabled={loading}
          style={{
            flex: "1",
            padding: "var(--space-3)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--text-inverse)",
            backgroundColor: loading
              ? "var(--border-default)"
              : "var(--accent-primary)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "var(--transition-base)",
          }}
        >
          {loading ? "Connecting..." : "Connect"}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: "var(--space-3) var(--space-4)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--text-secondary)",
            backgroundColor: "transparent",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          Cancel
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
