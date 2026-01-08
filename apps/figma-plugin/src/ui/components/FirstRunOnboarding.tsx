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
              <div
                aria-hidden="true"
                style={{
                  width: "32px",
                  height: "32px",
                  color: "var(--accent-secondary)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
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
              <div
                aria-hidden="true"
                style={{
                  width: "32px",
                  height: "32px",
                  color: "var(--text-primary)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M12 9.75v13.5"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 12M9 3.75h6m-6 0v2.25m6-2.25h2.088a2.25 2.25 0 012.15 1.588L21.65 12M12 6.75h.008v.008H12V6.75z"
                  />
                  {/* Simplified Cloud Upload Icon */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M12 9.75V16.5"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5"
                  />
                </svg>
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
              <div
                aria-hidden="true"
                style={{
                  width: "32px",
                  height: "32px",
                  color: "var(--text-primary)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
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

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <button
            onClick={() =>
              window.open(
                "https://github.com/wylie-dog-ds/apps/figma-plugin/blob/main/docs/README.md",
                "_blank"
              )
            }
            style={{
              background: "none",
              border: "none",
              color: "var(--text-tertiary)",
              fontSize: "var(--font-size-xs)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Read Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
