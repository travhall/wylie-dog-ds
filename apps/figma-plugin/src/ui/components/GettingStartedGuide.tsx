/**
 * Getting Started Guide
 *
 * Interactive guide to help new users understand Token Bridge
 * Shows step-by-step instructions for common workflows
 */

import { useState } from "preact/hooks";
import { h } from "preact";

interface GettingStartedGuideProps {
  onClose: () => void;
  onAction: (action: string) => void;
}

type Step =
  | "welcome"
  | "import-tokens"
  | "export-tokens"
  | "setup-github"
  | "sync-workflow";

interface StepData {
  title: string;
  content: h.JSX.Element;
}

export function GettingStartedGuide({
  onClose,
  onAction,
}: GettingStartedGuideProps) {
  const [currentStep, setCurrentStep] = useState<Step>("welcome");

  const steps: Record<Step, StepData> = {
    welcome: {
      title: "Welcome to Token Bridge",
      content: (
        <div>
          <p style={{ marginBottom: "var(--space-4)", lineHeight: "1.6" }}>
            Token Bridge helps you sync design tokens between Figma and your
            codebase. Here's what you can do:
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <button
              onClick={() => setCurrentStep("import-tokens")}
              style={{
                padding: "var(--space-3)",
                backgroundColor: "var(--surface-secondary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-md)",
                textAlign: "left" as const,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  marginBottom: "4px",
                }}
              >
                📥 Import Tokens
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                }}
              >
                Bring tokens from JSON files or GitHub into Figma
              </div>
            </button>

            <button
              onClick={() => setCurrentStep("export-tokens")}
              style={{
                padding: "var(--space-3)",
                backgroundColor: "var(--surface-secondary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-md)",
                textAlign: "left" as const,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  marginBottom: "4px",
                }}
              >
                📤 Export Tokens
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                }}
              >
                Export Figma variables to JSON files
              </div>
            </button>

            <button
              onClick={() => setCurrentStep("setup-github")}
              style={{
                padding: "var(--space-3)",
                backgroundColor: "var(--surface-secondary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-md)",
                textAlign: "left" as const,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  marginBottom: "4px",
                }}
              >
                🔄 GitHub Sync
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                }}
              >
                Keep Figma and GitHub in sync automatically
              </div>
            </button>
          </div>
        </div>
      ),
    },

    "import-tokens": {
      title: "Importing Tokens",
      content: (
        <div>
          <p style={{ marginBottom: "var(--space-3)", lineHeight: "1.6" }}>
            Import design tokens from JSON files into Figma variables.
          </p>
          <div style={{ marginBottom: "var(--space-4)" }}>
            <h4
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "var(--space-2)",
              }}
            >
              Step 1: Prepare Your Tokens
            </h4>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                marginBottom: "var(--space-2)",
              }}
            >
              Token Bridge supports multiple formats:
            </p>
            <ul
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                paddingLeft: "var(--space-4)",
                marginBottom: "var(--space-3)",
              }}
            >
              <li>W3C Design Tokens (DTCG)</li>
              <li>Style Dictionary</li>
              <li>Tokens Studio</li>
              <li>Material Design</li>
              <li>Generic JSON</li>
            </ul>
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <h4
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "var(--space-2)",
              }}
            >
              Step 2: Import
            </h4>
            <ol
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                paddingLeft: "var(--space-4)",
              }}
            >
              <li>
                Go to the <strong>Import</strong> tab
              </li>
              <li>
                Click <strong>Import File</strong>
              </li>
              <li>Select your JSON file(s)</li>
              <li>Plugin auto-detects the format</li>
              <li>Review and import!</li>
            </ol>
          </div>

          <button
            onClick={() => {
              onAction("import");
              onClose();
            }}
            style={{
              width: "100%",
              padding: "var(--space-3)",
              backgroundColor: "var(--color-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Start Importing
          </button>
        </div>
      ),
    },

    "export-tokens": {
      title: "Exporting Tokens",
      content: (
        <div>
          <p style={{ marginBottom: "var(--space-3)", lineHeight: "1.6" }}>
            Export Figma variables to JSON files for use in your codebase.
          </p>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <h4
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "var(--space-2)",
              }}
            >
              Step 1: Select Collections
            </h4>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
              }}
            >
              Go to the <strong>Tokens</strong> tab and select which variable
              collections you want to export.
            </p>
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <h4
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "var(--space-2)",
              }}
            >
              Step 2: Choose Format
            </h4>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
              }}
            >
              In the <strong>Export</strong> tab, select your preferred output
              format (W3C DTCG, Style Dictionary, etc.)
            </p>
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <h4
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "var(--space-2)",
              }}
            >
              Step 3: Download
            </h4>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
              }}
            >
              Click <strong>Download JSON</strong> to save the files to your
              computer.
            </p>
          </div>

          <button
            onClick={() => {
              onAction("export");
              onClose();
            }}
            style={{
              width: "100%",
              padding: "var(--space-3)",
              backgroundColor: "var(--color-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Start Exporting
          </button>
        </div>
      ),
    },

    "setup-github": {
      title: "GitHub Sync Setup",
      content: (
        <div>
          <p style={{ marginBottom: "var(--space-3)", lineHeight: "1.6" }}>
            Connect Token Bridge to your GitHub repository for automatic
            synchronization.
          </p>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <h4
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "var(--space-2)",
              }}
            >
              Step 1: Create Personal Access Token
            </h4>
            <ol
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                paddingLeft: "var(--space-4)",
                marginBottom: "var(--space-2)",
              }}
            >
              <li>Go to GitHub Settings → Developer settings</li>
              <li>Click "Personal access tokens" → "Tokens (classic)"</li>
              <li>
                Generate new token with <strong>repo</strong> scope
              </li>
              <li>Copy the token (you won't see it again!)</li>
            </ol>
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <h4
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "var(--space-2)",
              }}
            >
              Step 2: Configure Plugin
            </h4>
            <ol
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                paddingLeft: "var(--space-4)",
              }}
            >
              <li>
                Go to the <strong>Sync</strong> tab
              </li>
              <li>
                Click <strong>Setup GitHub</strong>
              </li>
              <li>Enter your repository URL</li>
              <li>Paste your personal access token</li>
              <li>Test connection and save</li>
            </ol>
          </div>

          <div
            style={{
              padding: "var(--space-3)",
              backgroundColor: "var(--surface-warning)",
              border: "1px solid var(--border-warning)",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--space-4)",
            }}
          >
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "4px",
              }}
            >
              💡 Pro Tip
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
              }}
            >
              Use <strong>Pull Request mode</strong> for team collaboration.
              Changes go through code review before merging.
            </div>
          </div>

          <button
            onClick={() => {
              onAction("setup-github");
              onClose();
            }}
            style={{
              width: "100%",
              padding: "var(--space-3)",
              backgroundColor: "var(--color-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Setup GitHub Now
          </button>
        </div>
      ),
    },

    "sync-workflow": {
      title: "Sync Workflow",
      content: (
        <div>
          <p style={{ marginBottom: "var(--space-3)", lineHeight: "1.6" }}>
            Keep your design tokens synchronized between Figma and code.
          </p>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <h4
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "var(--space-2)",
              }}
            >
              📤 Push to GitHub
            </h4>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
              }}
            >
              When you update tokens in Figma, push changes to your repository.
              The plugin detects conflicts and helps you resolve them.
            </p>
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <h4
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "var(--space-2)",
              }}
            >
              📥 Pull from GitHub
            </h4>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
              }}
            >
              When developers update tokens in code, pull the latest changes
              into Figma to stay in sync.
            </p>
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <h4
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "var(--space-2)",
              }}
            >
              ⚔️ Conflict Resolution
            </h4>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
              }}
            >
              If the same token is changed in both Figma and GitHub, Token
              Bridge shows a conflict resolution UI where you can choose which
              version to keep.
            </p>
          </div>

          <button
            onClick={() => {
              onAction("sync");
              onClose();
            }}
            style={{
              width: "100%",
              padding: "var(--space-3)",
              backgroundColor: "var(--color-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Go to Sync Tab
          </button>
        </div>
      ),
    },
  };

  const currentStepData = steps[currentStep];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--space-4)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
    >
      <div
        style={{
          backgroundColor: "var(--surface-primary)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          maxWidth: "480px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-4)",
            paddingBottom: "var(--space-3)",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <h2
            id="guide-title"
            style={{
              margin: 0,
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            {currentStepData.title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close guide"
            style={{
              background: "none",
              border: "none",
              fontSize: "var(--font-size-xl)",
              cursor: "pointer",
              color: "var(--text-secondary)",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div>{currentStepData.content}</div>

        {/* Navigation */}
        {currentStep !== "welcome" && (
          <div
            style={{
              marginTop: "var(--space-4)",
              paddingTop: "var(--space-3)",
              borderTop: "1px solid var(--border-primary)",
            }}
          >
            <button
              onClick={() => setCurrentStep("welcome")}
              style={{
                padding: "var(--space-2) var(--space-3)",
                backgroundColor: "transparent",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                fontSize: "var(--font-size-xs)",
              }}
            >
              ← Back to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
