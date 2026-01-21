/**
 * Toast Notification Component
 *
 * Displays temporary success, error, and info messages
 * with smooth animations and auto-dismiss
 */

import { useEffect, useState } from "preact/hooks";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string | null;
  type?: ToastType;
  duration?: number; // milliseconds
  onClose?: () => void;
}

export function Toast({
  message,
  type = "info",
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsExiting(false);

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsExiting(false);
    }
  }, [message, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      if (onClose) onClose();
    }, 300); // Match exit animation duration
  };

  if (!isVisible && !message) return null;

  const getStyles = () => {
    const baseStyles = {
      position: "fixed" as const,
      bottom: "var(--space-6)",
      left: "50%",
      transform: isExiting
        ? "translateX(-50%) translateY(100%)"
        : "translateX(-50%) translateY(0)",
      backgroundColor: "var(--surface-primary)",
      color: "var(--text-primary)",
      padding: "var(--space-4) var(--space-5)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)",
      zIndex: 9999,
      maxWidth: "400px",
      minWidth: "280px",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      opacity: isExiting ? "0" : "1",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      animation: isExiting
        ? "none"
        : "slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "1px solid transparent",
    };

    const typeStyles = {
      success: {
        borderColor: "var(--success)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
      },
      error: {
        borderColor: "var(--error)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
      },
      warning: {
        borderColor: "var(--warning)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
      },
      info: {
        borderColor: "var(--info)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
      default:
        return "ℹ️";
    }
  };

  return (
    <>
      <div style={getStyles()}>
        {/* Icon */}
        <div
          style={{
            fontSize: "var(--font-size-xl)",
            flexShrink: 0,
            animation:
              type === "success" ? "successPulse 0.5s ease-in-out" : "none",
          }}
        >
          {getIcon()}
        </div>

        {/* Message */}
        <div
          style={{
            flex: 1,
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-medium)",
            lineHeight: "1.5",
          }}
        >
          {message}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            flexShrink: 0,
            width: "24px",
            height: "24px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            backgroundColor: "transparent",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--font-size-sm)",
            transition: "var(--transition-base)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-tertiary)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(100%);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
          
          @keyframes successPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
        `}
      </style>
    </>
  );
}

/**
 * Success Toast - Convenience wrapper
 */
export function SuccessToast({
  message,
  onClose,
}: {
  message: string | null;
  onClose?: () => void;
}) {
  return (
    <Toast message={message} type="success" duration={6000} onClose={onClose} />
  );
}

/**
 * Error Toast - Convenience wrapper
 */
export function ErrorToast({
  message,
  onClose,
}: {
  message: string | null;
  onClose?: () => void;
}) {
  return (
    <Toast message={message} type="error" duration={8000} onClose={onClose} />
  );
}
