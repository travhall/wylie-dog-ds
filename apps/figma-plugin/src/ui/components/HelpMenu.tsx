import { h } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";

interface HelpMenuProps {
  onReset?: () => void;
}

export function HelpMenu({ onReset }: HelpMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const openLink = (url: string) => {
    window.open(url, "_blank");
    setIsOpen(false);
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Help"
        aria-haspopup="true"
        aria-expanded={isOpen}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "var(--space-2)",
          borderRadius: "var(--radius-sm)",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "var(--transition-base)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--surface-secondary)";
          e.currentTarget.style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        <span style={{ fontSize: "var(--font-size-lg)" }}>❓</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "var(--space-1)",
            backgroundColor: "var(--surface-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            minWidth: "180px",
            zIndex: 100,
            padding: "var(--space-1) 0",
            overflow: "hidden",
            transformOrigin: "top right",
            animation: "scaleIn 0.1s ease-out",
          }}
        >
          {/* Documentation Link */}
          <button
            role="menuitem"
            onClick={() =>
              openLink(
                "https://github.com/wylie-dog-ds/apps/figma-plugin/blob/main/docs/README.md"
              )
            }
            className="menu-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              width: "100%",
              padding: "var(--space-2) var(--space-3)",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-primary)",
              transition: "background-color 0.1s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--surface-secondary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <span>📚</span> Documentation
          </button>

          {/* Report Issue */}
          <button
            role="menuitem"
            onClick={() =>
              openLink(
                "https://github.com/wylie-dog-ds/apps/figma-plugin/issues/new"
              )
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              width: "100%",
              padding: "var(--space-2) var(--space-3)",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-primary)",
              transition: "background-color 0.1s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--surface-secondary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <span>🐛</span> Report an Issue
          </button>

          {onReset && (
            <>
              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--border-default)",
                  margin: "var(--space-1) 0",
                }}
              />
              <button
                role="menuitem"
                onClick={() => handleAction(onReset)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  width: "100%",
                  padding: "var(--space-2) var(--space-3)",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--error)",
                  transition: "background-color 0.1s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--error-light)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span>🔄</span> Reset Plugin
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
