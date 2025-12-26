import { useState } from "preact/hooks";

interface OnboardingModalProps {
  onClose: () => void;
  onImportLocal: () => void;
  onGenerateDemo: () => void;
  onImportFigmaVariables: () => void;
  onImportFromGitHub: () => void;
  hasFigmaVariables: boolean;
}

export const OnboardingModal = ({
  onClose,
  onImportLocal,
  onGenerateDemo,
  onImportFigmaVariables,
  onImportFromGitHub,
  hasFigmaVariables,
}: OnboardingModalProps) => {
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
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "480px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1f2937",
            }}
          >
            Token Bridge
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#6b7280",
              padding: "0",
              lineHeight: "1",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Subtitle */}
        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          Choose an option below to get started.
        </p>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Import from GitHub */}
          <button
            onClick={onImportFromGitHub}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0284c7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#0ea5e9";
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              Import from GitHub
            </div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>
              Requires GitHub access and token.
            </div>
          </button>

          {/* Import Existing Figma Tokens */}
          <button
            onClick={hasFigmaVariables ? onImportFigmaVariables : undefined}
            disabled={!hasFigmaVariables}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: hasFigmaVariables ? "#f3f4f6" : "#e5e7eb",
              color: hasFigmaVariables ? "#1f2937" : "#9ca3af",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: hasFigmaVariables ? "pointer" : "not-allowed",
              textAlign: "left",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (hasFigmaVariables) {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
              }
            }}
            onMouseLeave={(e) => {
              if (hasFigmaVariables) {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              Import Existing Figma Variables
            </div>
            <div style={{ fontSize: "12px" }}>
              {hasFigmaVariables
                ? "Convert your existing Variables to tokens"
                : "Your Figma file does not contain Variables"}
            </div>
          </button>

          {/* Import Local Tokens */}
          <button
            onClick={onImportLocal}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "#f3f4f6",
              color: "#1f2937",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e5e7eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "4px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Import Local Tokens
              <span
                style={{
                  fontSize: "10px",
                  color: "#0ea5e9",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Show format guidelines
                  alert("Format guidelines coming soon!");
                }}
              >
                Format Guidelines →
              </span>
            </div>
            <div style={{ fontSize: "12px" }}>
              Import existing token files from your computer
            </div>
          </button>

          {/* Generate Demo Tokens */}
          <button
            onClick={onGenerateDemo}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "#f3f4f6",
              color: "#1f2937",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e5e7eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              Generate Demo Tokens
            </div>
            <div style={{ fontSize: "12px" }}>
              Start with pre-built, compliant tokens
            </div>
          </button>
        </div>

        {/* Footer hint */}
        <div
          style={{
            marginTop: "24px",
            padding: "12px",
            backgroundColor: "#f0f9ff",
            borderRadius: "6px",
            fontSize: "11px",
            color: "#0369a1",
          }}
        >
          💡 <strong>New to design tokens?</strong> Try "Generate Demo Tokens"
          to see examples in W3C DTCG format.
        </div>
      </div>
    </div>
  );
};
