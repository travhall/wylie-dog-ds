import { useState, useEffect } from "preact/hooks";

interface FirstRunOnboardingProps {
  onDemoTokens: () => void;
  onImportVariables: () => void;
  onImportFile: () => void;
  onSetupGitHub: () => void;
  onSkip: () => void;
}

export const FirstRunOnboarding = ({
  onDemoTokens,
  onImportVariables,
  onImportFile,
  onSetupGitHub,
  onSkip,
}: FirstRunOnboardingProps) => {
  const [variableCount, setVariableCount] = useState(0);
  const [hasVariables, setHasVariables] = useState(false);
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    // Request variable detection from plugin
    parent.postMessage(
      {
        pluginMessage: {
          type: "detect-figma-variables",
        },
      },
      "*"
    );

    // Listen for detection result
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (msg && msg.type === "figma-variables-detected") {
        setHasVariables(msg.detection.hasVariables);
        setVariableCount(msg.detection.totalVariables);
        setDetecting(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#ffffff",
        overflowY: "auto",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 24px",
          minHeight: "100%",
        }}
      >
        {/* Welcome Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎨</div>
          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1f2937",
            }}
          >
            Welcome to Token Bridge
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#6b7280",
              maxWidth: "400px",
            }}
          >
            Sync design tokens between Figma and your codebase
          </p>
        </div>

        {/* Options Container */}
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              marginBottom: "8px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            How would you like to start?
          </div>

          {/* Demo Tokens */}
          <button
            onClick={onDemoTokens}
            aria-label="Try demo tokens to explore the plugin"
            style={{
              width: "100%",
              padding: "20px",
              backgroundColor: "#f0f9ff",
              color: "#1f2937",
              border: "2px solid #bae6fd",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e0f2fe";
              e.currentTarget.style.borderColor = "#7dd3fc";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f9ff";
              e.currentTarget.style.borderColor = "#bae6fd";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid #0ea5e9";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
              <div style={{ fontSize: "32px" }}>⚡</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    color: "#0369a1",
                  }}
                >
                  Try Demo Tokens
                </div>
                <div style={{ fontSize: "13px", color: "#0c4a6e" }}>
                  Load pre-built tokens to explore the plugin
                </div>
              </div>
            </div>
          </button>

          {/* Import Existing Variables */}
          <button
            onClick={onImportVariables}
            disabled={!hasVariables || detecting}
            aria-label={`Import existing Figma Variables${hasVariables ? ` (${variableCount} found)` : " (none found)"}`}
            aria-disabled={!hasVariables || detecting}
            style={{
              width: "100%",
              padding: "20px",
              backgroundColor: hasVariables ? "#f3f4f6" : "#fafafa",
              color: hasVariables ? "#1f2937" : "#9ca3af",
              border: `2px solid ${hasVariables ? "#d1d5db" : "#e5e7eb"}`,
              borderRadius: "8px",
              cursor: hasVariables ? "pointer" : "not-allowed",
              textAlign: "left",
              transition: "all 0.2s",
              opacity: detecting ? 0.5 : 1,
              outline: "none",
            }}
            onMouseEnter={(e) => {
              if (hasVariables && !detecting) {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
                e.currentTarget.style.borderColor = "#9ca3af";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 8px rgba(0, 0, 0, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (hasVariables) {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
            onFocus={(e) => {
              if (hasVariables && !detecting) {
                e.currentTarget.style.outline = "2px solid #0ea5e9";
                e.currentTarget.style.outlineOffset = "2px";
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
              <div style={{ fontSize: "32px" }}>📦</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  Import Existing Variables
                  {detecting && " (Detecting...)"}
                  {!detecting && hasVariables && ` (${variableCount})`}
                  {!detecting && !hasVariables && " (None found)"}
                </div>
                <div style={{ fontSize: "13px" }}>
                  {hasVariables
                    ? "Convert your existing Figma Variables to tokens"
                    : "Your file doesn't contain Variables"}
                </div>
              </div>
            </div>
          </button>

          {/* Import Token File */}
          <button
            onClick={onImportFile}
            aria-label="Import token file from your computer"
            style={{
              width: "100%",
              padding: "20px",
              backgroundColor: "#f3f4f6",
              color: "#1f2937",
              border: "2px solid #d1d5db",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e5e7eb";
              e.currentTarget.style.borderColor = "#9ca3af";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid #0ea5e9";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
              <div style={{ fontSize: "32px" }}>📁</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  Import Token File
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  Upload JSON from your computer
                </div>
              </div>
            </div>
          </button>

          {/* Set Up GitHub Sync */}
          <button
            onClick={onSetupGitHub}
            aria-label="Set up GitHub repository integration"
            style={{
              width: "100%",
              padding: "20px",
              backgroundColor: "#f3f4f6",
              color: "#1f2937",
              border: "2px solid #d1d5db",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e5e7eb";
              e.currentTarget.style.borderColor = "#9ca3af";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid #0ea5e9";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
              <div style={{ fontSize: "32px" }}>🔧</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  Set Up GitHub Sync
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  Configure repository integration
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Skip Button */}
        <button
          onClick={onSkip}
          aria-label="Skip onboarding and start fresh"
          style={{
            marginTop: "32px",
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "#6b7280",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
            textDecoration: "underline",
            transition: "all 0.2s ease",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6b7280";
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid #0ea5e9";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          Skip - Start Fresh
        </button>
      </div>
    </div>
  );
};
