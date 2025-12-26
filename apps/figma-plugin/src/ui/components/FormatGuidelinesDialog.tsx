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
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10001,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "600px",
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
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "bold",
              color: "#1f2937",
            }}
          >
            Supported Token Formats
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

        {/* W3C DTCG Format */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "15px",
              fontWeight: "bold",
              color: "#1f2937",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>W3C Design Tokens</span>
            <span
              style={{
                fontSize: "10px",
                backgroundColor: "#dcfce7",
                color: "#166534",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              RECOMMENDED
            </span>
          </h3>
          <pre
            style={{
              margin: "8px 0",
              padding: "12px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "monospace",
              overflowX: "auto",
            }}
          >{`[{
  "collection-name": {
    "modes": [{"modeId": "default", "name": "Default"}],
    "variables": {
      "color-primary": {
        "$type": "color",
        "$value": "#0066FF"
      }
    }
  }
}]`}</pre>
          <p
            style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}
          >
            Official W3C standard for design tokens. This is the native format
            used by Token Bridge.
          </p>
        </div>

        {/* Style Dictionary */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "15px",
              fontWeight: "bold",
              color: "#1f2937",
            }}
          >
            Style Dictionary
          </h3>
          <pre
            style={{
              margin: "8px 0",
              padding: "12px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "monospace",
              overflowX: "auto",
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
            style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}
          >
            Automatically converts to W3C format. Supports both flat and nested
            structures.
          </p>
        </div>

        {/* Tokens Studio */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "15px",
              fontWeight: "bold",
              color: "#1f2937",
            }}
          >
            Tokens Studio (Figma Tokens)
          </h3>
          <pre
            style={{
              margin: "8px 0",
              padding: "12px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "monospace",
              overflowX: "auto",
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
            style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}
          >
            Popular Figma Tokens plugin format. Fully supported.
          </p>
        </div>

        {/* Help Section */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#f0f9ff",
            borderRadius: "6px",
          }}
        >
          <h4
            style={{
              margin: "0 0 12px 0",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#0369a1",
            }}
          >
            📚 Need Help?
          </h4>
          <ul
            style={{
              margin: 0,
              padding: "0 0 0 20px",
              fontSize: "12px",
              color: "#075985",
            }}
          >
            <li style={{ marginBottom: "6px" }}>
              <strong>New to tokens?</strong> Use "Generate Demo Tokens" in the
              onboarding modal
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong>Have existing tokens?</strong> Just import your JSON file
              – we'll auto-detect the format
            </li>
            <li>
              <strong>More formats:</strong> CSS Variables, Material Design, and
              custom formats are also supported
            </li>
          </ul>
        </div>

        {/* Close Button */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
