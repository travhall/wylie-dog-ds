import { useState, useEffect, useRef } from "preact/hooks";

interface FirstRunOnboardingProps {
  onDemoTokens: () => void;
  onImportFile: () => void;
  onSetupGitHub: () => void;
  onSkip: () => void;
}

export const FirstRunOnboarding = ({
  onDemoTokens,
  onImportFile,
  onSetupGitHub,
  onSkip,
}: FirstRunOnboardingProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus trap logic
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Focus first element on mount
    const firstButton = modalRef.current?.querySelector("button");
    firstButton?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "var(--surface-primary)",
        overflowY: "auto",
        zIndex: 10000,
      }}
    >
      <div
        ref={modalRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 24px",
          minHeight: "100%",
        }}
      >
        {/* Welcome Header */}
        <div style={{ marginBottom: "48px" }}>
          <h1
            id="onboarding-title"
            style={{
              margin: "0 0 8px 0",
              fontSize: "20px",
              fontWeight: "bold",
              color: "var(--text-primary)",
            }}
          >
            Welcome to Token Bridge
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "var(--text-secondary)",
              maxWidth: "400px",
            }}
          >
            Sync design tokens between Figma and your codebase
          </p>
        </div>

        {/* Options Container */}
        <div
          role="group"
          aria-label="Getting started options"
          style={{
            width: "100%",
            maxWidth: "480px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            id="start-options-label"
            style={{
              marginBottom: "8px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "var(--text-secondary)",
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
              backgroundColor: "var(--info-light)",
              color: "var(--text-primary)",
              border: "2px solid var(--info)",
              borderRadius: "var(--radius-lg)",
              cursor: "pointer",
              textAlign: "left",
              transition: "var(--transition-base)",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-secondary)";
              e.currentTarget.style.borderColor =
                "var(--accent-secondary-hover)";
              e.currentTarget.style.color = "var(--text-inverse)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--info-light)";
              e.currentTarget.style.borderColor = "var(--info)";
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline =
                "2px solid var(--accent-secondary)";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
              <div style={{ fontSize: "32px" }} aria-hidden="true">
                ⚡
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "var(--font-weight-bold)",
                    marginBottom: "var(--space-1)",
                    color: "var(--accent-secondary)",
                  }}
                >
                  Try Demo Tokens
                </div>
                <div
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Load pre-built tokens to explore the plugin
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
              backgroundColor: "var(--surface-secondary)",
              color: "var(--text-primary)",
              border: "2px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              cursor: "pointer",
              textAlign: "left",
              transition: "var(--transition-base)",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--surface-tertiary)";
              e.currentTarget.style.borderColor = "var(--text-tertiary)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--surface-secondary)";
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline =
                "2px solid var(--accent-secondary)";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
              <div style={{ fontSize: "32px" }} aria-hidden="true">
                📁
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "var(--font-weight-bold)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Import Token File
                </div>
                <div
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-secondary)",
                  }}
                >
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
              backgroundColor: "var(--surface-secondary)",
              color: "var(--text-primary)",
              border: "2px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              cursor: "pointer",
              textAlign: "left",
              transition: "var(--transition-base)",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--surface-tertiary)";
              e.currentTarget.style.borderColor = "var(--text-tertiary)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--surface-secondary)";
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline =
                "2px solid var(--accent-secondary)";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
              <div style={{ fontSize: "32px" }} aria-hidden="true">
                🔧
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "var(--font-weight-bold)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Set Up GitHub Sync
                </div>
                <div
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-secondary)",
                  }}
                >
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
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: "transparent",
            color: "var(--text-secondary)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            textDecoration: "underline",
            transition: "var(--transition-base)",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid var(--accent-secondary)";
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
