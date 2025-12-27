interface FormatGuidelinesDialogProps {
  onClose: () => void;
}

export const FormatGuidelinesDialog = ({
  onClose,
}: FormatGuidelinesDialogProps) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10001,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="format-guidelines-title"
    >
      <div
        style={{
          backgroundColor: "var(--surface-primary)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
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
            marginBottom: "var(--space-5)",
            paddingBottom: "var(--space-3)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <h2
            id="format-guidelines-title"
            style={{
              margin: 0,
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--text-primary)",
            }}
          >
            Supported Token Formats
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "var(--font-size-2xl)",
              cursor: "pointer",
              color: "var(--text-secondary)",
              padding: "0",
              lineHeight: "1",
              transition: "var(--transition-fast)",
            }}
            aria-label="Close format guidelines"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            ×
          </button>
        </div>

        {/* W3C DTCG Format */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <h3
            style={{
              margin: "0 0 var(--space-2) 0",
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <span>W3C Design Tokens (DTCG)</span>
            <span
              style={{
                fontSize: "var(--font-size-2xs)",
                backgroundColor: "var(--success-light)",
                color: "var(--success)",
                padding: "2px var(--space-2)",
                borderRadius: "var(--radius-sm)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              RECOMMENDED
            </span>
          </h3>
          <pre
            style={{
              margin: "var(--space-2) 0",
              padding: "var(--space-3)",
              backgroundColor: "var(--surface-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-xs)",
              fontFamily: "var(--font-family-mono)",
              overflowX: "auto",
              color: "var(--text-primary)",
            }}
          >{`{
  "color": {
    "primary": {
      "$type": "color",
      "$value": "#0066FF",
      "$description": "Primary brand color"
    }
  },
  "spacing": {
    "md": {
      "$type": "dimension",
      "$value": "16px"
    }
  }
}`}</pre>
          <p
            style={{
              margin: "var(--space-1) 0 0 0",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
            }}
          >
            Official W3C standard for design tokens. This is the native format
            used by Token Bridge.
          </p>
        </div>

        {/* Style Dictionary */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <h3
            style={{
              margin: "0 0 var(--space-2) 0",
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--text-primary)",
            }}
          >
            Style Dictionary
          </h3>
          <pre
            style={{
              margin: "var(--space-2) 0",
              padding: "var(--space-3)",
              backgroundColor: "var(--surface-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-xs)",
              fontFamily: "var(--font-family-mono)",
              overflowX: "auto",
              color: "var(--text-primary)",
            }}
          >{`{
  "color": {
    "primary": {
      "value": "#0066FF",
      "type": "color"
    }
  }
}`}</pre>
          <p
            style={{
              margin: "var(--space-1) 0 0 0",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
            }}
          >
            Automatically converts to W3C format. Supports both flat and nested
            structures.
          </p>
        </div>

        {/* Tokens Studio */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <h3
            style={{
              margin: "0 0 var(--space-2) 0",
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--text-primary)",
            }}
          >
            Tokens Studio (Figma Tokens)
          </h3>
          <pre
            style={{
              margin: "var(--space-2) 0",
              padding: "var(--space-3)",
              backgroundColor: "var(--surface-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-xs)",
              fontFamily: "var(--font-family-mono)",
              overflowX: "auto",
              color: "var(--text-primary)",
            }}
          >{`{
  "$themes": [],
  "colors": {
    "primary": {
      "value": "#0066FF",
      "type": "color"
    }
  }
}`}</pre>
          <p
            style={{
              margin: "var(--space-1) 0 0 0",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
            }}
          >
            Popular Figma Tokens plugin format. Fully supported.
          </p>
        </div>

        {/* Material Design */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <h3
            style={{
              margin: "0 0 var(--space-2) 0",
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--text-primary)",
            }}
          >
            Material Design Tokens
          </h3>
          <pre
            style={{
              margin: "var(--space-2) 0",
              padding: "var(--space-3)",
              backgroundColor: "var(--surface-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-xs)",
              fontFamily: "var(--font-family-mono)",
              overflowX: "auto",
              color: "var(--text-primary)",
            }}
          >{`{
  "palette": {
    "primary": {
      "main": "#0066FF",
      "light": "#3385FF",
      "dark": "#0047B3"
    }
  }
}`}</pre>
          <p
            style={{
              margin: "var(--space-1) 0 0 0",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
            }}
          >
            Material Design token format. Converts palette colors to W3C format.
          </p>
        </div>

        {/* CSS Variables */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <h3
            style={{
              margin: "0 0 var(--space-2) 0",
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--text-primary)",
            }}
          >
            CSS Variables
          </h3>
          <pre
            style={{
              margin: "var(--space-2) 0",
              padding: "var(--space-3)",
              backgroundColor: "var(--surface-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-xs)",
              fontFamily: "var(--font-family-mono)",
              overflowX: "auto",
              color: "var(--text-primary)",
            }}
          >{`{
  "--color-primary": "#0066FF",
  "--spacing-md": "16px",
  "--font-size-base": "14px"
}`}</pre>
          <p
            style={{
              margin: "var(--space-1) 0 0 0",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
            }}
          >
            CSS custom properties format. Auto-detects types from values.
          </p>
        </div>

        {/* Help Section */}
        <div
          style={{
            marginTop: "var(--space-6)",
            padding: "var(--space-4)",
            backgroundColor: "var(--info-light)",
            border: "1px solid var(--info)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <h4
            style={{
              margin: "0 0 var(--space-3) 0",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--accent-secondary)",
            }}
          >
            📚 Need Help?
          </h4>
          <ul
            style={{
              margin: 0,
              padding: "0 0 0 var(--space-5)",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-primary)",
              lineHeight: "1.6",
            }}
          >
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>New to tokens?</strong> Use "Try Demo Tokens" in the
              onboarding modal
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Have existing tokens?</strong> Just import your JSON file
              – we'll auto-detect the format
            </li>
            <li>
              <strong>Need examples?</strong> All formats shown above are ready
              to use
            </li>
          </ul>
        </div>

        {/* Close Button */}
        <div
          style={{
            marginTop: "var(--space-6)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "var(--space-3) var(--space-5)",
              backgroundColor: "var(--accent-secondary)",
              color: "var(--text-inverse)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-bold)",
              transition: "var(--transition-base)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--accent-secondary-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-secondary)";
            }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
