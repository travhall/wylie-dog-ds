import { h } from "preact";
import { useState } from "preact/hooks";
import { Icon, type IconName } from "./common/Icon";
import {
  ErrorHandler,
  PluginError,
  ErrorType,
} from "../../shared/error-handler";

interface EnhancedErrorDisplayProps {
  error: PluginError | string;
  onDismiss: () => void;
  onRetry?: () => void;
}

const ERROR_ICON_MAP: Record<string, IconName> = {
  [ErrorType.NETWORK_ERROR]: "warning",
  [ErrorType.AUTHENTICATION_ERROR]: "github",
  [ErrorType.REPOSITORY_ERROR]: "file",
  [ErrorType.TOKEN_FORMAT_ERROR]: "file",
  [ErrorType.CONFLICT_ERROR]: "sync",
  [ErrorType.FIGMA_API_ERROR]: "warning",
  [ErrorType.VALIDATION_ERROR]: "warning",
};

export function EnhancedErrorDisplay({
  error,
  onDismiss,
  onRetry,
}: EnhancedErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  const pluginError =
    typeof error === "string"
      ? ErrorHandler.fromException(new Error(error))
      : error;

  // Get user-friendly messages
  const getFriendlyMessage = (error: PluginError): string => {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return "Can't reach GitHub right now. Check your internet connection.";
      case ErrorType.AUTHENTICATION_ERROR:
        return "Couldn't connect to GitHub. Your access token might need updating.";
      case ErrorType.REPOSITORY_ERROR:
        return "Couldn't find that repository. Double-check the name.";
      case ErrorType.TOKEN_FORMAT_ERROR:
        return "This file doesn't look right. It might be in the wrong format.";
      case ErrorType.CONFLICT_ERROR:
        return "Your local and GitHub versions are different. Let's resolve this.";
      case ErrorType.FIGMA_API_ERROR:
        return "Figma had trouble with this. Try reloading the plugin.";
      case ErrorType.VALIDATION_ERROR:
        return "Some tokens need attention. Check what needs fixing below.";
      default:
        return "Something unexpected happened. Don't worry - we can fix this!";
    }
  };

  const getDocsLink = (error: PluginError): string | null => {
    const baseUrl =
      "https://github.com/wylie-dog-ds/apps/figma-plugin/blob/main/docs";
    switch (error.type) {
      case ErrorType.TOKEN_FORMAT_ERROR:
        return `${baseUrl}/FORMATS.md`;
      case ErrorType.AUTHENTICATION_ERROR:
      case ErrorType.REPOSITORY_ERROR:
      case ErrorType.NETWORK_ERROR:
        return `${baseUrl}/SETUP.md`;
      case ErrorType.CONFLICT_ERROR:
        return `${baseUrl}/SYNC.md#conflicts`;
      default:
        return null;
    }
  };

  const friendlyMessage = getFriendlyMessage(pluginError);
  const docsLink = getDocsLink(pluginError);

  return (
    <div
      style={{
        padding: "var(--space-3)",
        marginBottom: "var(--space-4)",
        backgroundColor: "var(--error-light)",
        border: `1px solid ${ErrorHandler.getErrorColor(pluginError.type)}`,
        borderRadius: "var(--radius-md)",
        fontSize: "var(--font-size-sm)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "var(--space-2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            flex: 1,
          }}
        >
          <Icon
            name={ERROR_ICON_MAP[pluginError.type] ?? "warning"}
            size={16}
            color={ErrorHandler.getErrorColor(pluginError.type)}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: "var(--font-weight-semibold)",
                color: ErrorHandler.getErrorColor(pluginError.type),
                marginBottom: "var(--space-1)",
              }}
            >
              {friendlyMessage}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <span>
                {pluginError.recoverable ? "Fixable" : "Needs attention"}
              </span>
              <button
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-primary)",
                  cursor: "pointer",
                  fontSize: "var(--font-size-xs)",
                  textDecoration: "underline",
                  padding: "0",
                  transition: "var(--transition-base)",
                }}
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          style={{
            padding: "var(--space-1) var(--space-2)",
            backgroundColor: "var(--surface-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            marginLeft: "var(--space-2)",
            transition: "var(--transition-base)",
          }}
        >
          <Icon name="close" size={12} color="var(--text-secondary)" />
        </button>
      </div>

      {/* Technical details - progressive disclosure */}
      {showDetails && (
        <div
          style={{
            padding: "var(--space-2)",
            backgroundColor: "var(--surface-secondary)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--space-2)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
              marginBottom: "var(--space-1)",
              color: "var(--text-primary)",
            }}
          >
            Technical Details:
          </div>
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              fontFamily: "monospace",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            {pluginError.message}
          </div>
        </div>
      )}

      {pluginError.suggestions && pluginError.suggestions.length > 0 && (
        <div style={{ marginBottom: "var(--space-2)" }}>
          <div
            style={{
              fontWeight: "var(--font-weight-semibold)",
              marginBottom: "var(--space-1)",
              fontSize: "var(--font-size-xs)",
              color: "var(--text-primary)",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-1)",
              }}
            >
              <Icon name="info" size={12} color="var(--text-primary)" /> Try
              this:
            </span>
          </div>
          <ul
            style={{
              margin: "0",
              paddingLeft: "var(--space-4)",
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            {pluginError.suggestions.slice(0, 3).map((suggestion, index) => (
              <li key={index} style={{ marginBottom: "2px" }}>
                {suggestion}
              </li>
            ))}
            {pluginError.suggestions.length > 3 &&
              showDetails &&
              pluginError.suggestions.slice(3).map((suggestion, index) => (
                <li key={index + 3} style={{ marginBottom: "2px" }}>
                  {suggestion}
                </li>
              ))}
          </ul>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          justifyContent: "flex-end",
        }}
      >
        {docsLink && (
          <button
            onClick={() => window.open(docsLink, "_blank")}
            style={{
              padding: "var(--space-2) var(--space-4)",
              backgroundColor: "var(--surface-primary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              transition: "var(--transition-base)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <Icon name="file" size={13} color="var(--text-primary)" /> Read Docs
          </button>
        )}
        {pluginError.recoverable && onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: "var(--space-2) var(--space-4)",
              backgroundColor: ErrorHandler.getErrorColor(pluginError.type),
              color: "var(--text-inverse)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
              transition: "var(--transition-base)",
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
