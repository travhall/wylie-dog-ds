import { useState, useRef, useEffect } from "preact/hooks";
import type { ComponentChildren } from "preact";

interface ContextualHelpProps {
  children: ComponentChildren;
  title?: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  size?: "sm" | "md" | "lg";
  trigger?: "hover" | "click";
  ariaLabel?: string;
}

export function ContextualHelp({
  children,
  title,
  content,
  position = "top",
  size = "md",
  trigger = "hover",
  ariaLabel,
}: ContextualHelpProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === "click") {
      setIsVisible(!isVisible);
    }
  };

  // Keyboard navigation: Escape to close
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isVisible) {
      setIsVisible(false);
      containerRef.current?.focus();
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isVisible || trigger !== "click") return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, trigger]);

  const sizeStyles = {
    sm: "max-w-48 text-xs p-2",
    md: "max-w-64 text-sm p-3",
    lg: "max-w-80 text-sm p-4",
  };

  const positionStyles = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  const arrowStyles = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-t-4 border-x-transparent border-x-4 border-b-0",
    bottom:
      "bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 border-b-4 border-x-transparent border-x-4 border-t-0",
    left: "left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 border-l-4 border-y-transparent border-y-4 border-r-0",
    right:
      "right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 border-r-4 border-y-transparent border-y-4 border-l-0",
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown as any}
        tabIndex={trigger === "click" ? 0 : undefined}
        role={trigger === "click" ? "button" : undefined}
        aria-label={ariaLabel || title || "Help"}
        aria-expanded={isVisible}
        aria-haspopup="true"
        style={{ cursor: trigger === "click" ? "pointer" : "default" }}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          aria-live="polite"
          className={`absolute z-50 ${positionStyles[position]} ${sizeStyles[size]}`}
          style={{
            backgroundColor: "var(--surface-overlay)",
            color: "var(--text-inverse)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            backdropFilter: "blur(4px)",
            animation: "fadeInUp 0.2s ease-out",
          }}
        >
          {title && (
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "4px",
                color: "#e5e7eb",
                fontSize: size === "sm" ? "10px" : "11px",
              }}
            >
              {title}
            </div>
          )}
          <div
            style={{
              lineHeight: "1.4",
              color: "#d1d5db",
            }}
          >
            {content}
          </div>

          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 ${arrowStyles[position]}`}
            style={{ borderStyle: "solid" }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}

export function HelpIcon({
  content,
  title,
  size = "sm",
  ariaLabel,
}: {
  content: string;
  title?: string;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
}) {
  return (
    <ContextualHelp
      content={content}
      title={title}
      size={size}
      trigger="hover"
      ariaLabel={ariaLabel || title || "Help information"}
    >
      <span
        role="img"
        aria-label={ariaLabel || title || "Help icon"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "14px",
          height: "14px",
          backgroundColor: "var(--color-neutral-500, #6b7280)",
          color: "var(--color-white, white)",
          borderRadius: "50%",
          fontSize: "9px",
          fontWeight: "bold",
          cursor: "help",
          marginLeft: "4px",
          transition: "background-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.backgroundColor =
            "var(--color-neutral-600, #4b5563)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.backgroundColor =
            "var(--color-neutral-500, #6b7280)";
        }}
      >
        ?
      </span>
    </ContextualHelp>
  );
}

// Pre-defined help content for common elements
export const HELP_CONTENT = {
  GITHUB_TOKEN: {
    title: "GitHub Personal Access Token",
    content:
      'Create a token at GitHub Settings > Developer settings > Personal access tokens. Needs "repo" permissions to read/write your repositories.',
  },
  SYNC_MODE: {
    title: "Sync Modes",
    content:
      "Pull Request mode creates PRs for review (safer for teams). Direct sync pushes changes immediately (faster for solo work).",
  },
  TOKEN_PATH: {
    title: "Token Storage Path",
    content:
      'Directory where JSON files will be stored in your repository. Use forward slashes, e.g. "design-tokens/" or "src/tokens/".',
  },
  CONFLICT_RESOLUTION: {
    title: "Conflict Resolution",
    content:
      "When the same token exists in both Figma and GitHub with different values, you need to choose which version to keep.",
  },
  ADVANCED_MODE: {
    title: "Advanced Mode",
    content:
      "Shows detailed information, validation reports, and additional controls for experienced users. Simple mode hides complexity.",
  },
  COLLECTION_SELECTION: {
    title: "Collection Selection",
    content:
      "Choose which variable collections to include in export. Each collection becomes a separate JSON file.",
  },
  FORMAT_DETECTION: {
    title: "Format Detection",
    content:
      "The plugin automatically detects token formats (Style Dictionary, Tokens Studio, W3C DTCG) and converts them to work in Figma.",
  },
  REFERENCE_RESOLUTION: {
    title: "Reference Resolution",
    content:
      "Tokens that reference other tokens (like {color.primary}) are automatically resolved and linked during import.",
  },
};
