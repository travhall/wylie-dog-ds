import { h } from "preact";
import { useState, useMemo } from "preact/hooks";
import { TokenPreview } from "./token-previews";

interface ProcessedToken {
  $type: string;
  $value: any;
  $description?: string;
}

interface TokenBrowserProps {
  collectionName: string;
  tokens: Record<string, ProcessedToken>;
  modes?: Array<{ modeId: string; name: string }>;
  onClose?: () => void;
}

/**
 * TokenBrowser - Browse and search tokens within a collection
 * Features:
 * - Visual previews for each token type
 * - Search/filter by name
 * - Copy token reference to clipboard
 * - Organized by token type
 */
export function TokenBrowser({
  collectionName,
  tokens,
  modes = [{ modeId: "default", name: "Default" }],
  onClose,
}: TokenBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  // Extract token entries
  const tokenEntries = useMemo(() => {
    return Object.entries(tokens).map(([name, token]) => ({
      name,
      ...token,
    }));
  }, [tokens]);

  // Get unique token types for filter
  const tokenTypes = useMemo(() => {
    const types = new Set<string>();
    tokenEntries.forEach((token) => types.add(token.$type));
    return Array.from(types).sort();
  }, [tokenEntries]);

  // Filter tokens based on search and type filter
  const filteredTokens = useMemo(() => {
    let filtered = tokenEntries;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((token) =>
        token.name.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((token) => token.$type === filterType);
    }

    return filtered;
  }, [tokenEntries, searchQuery, filterType]);

  // Copy token reference to clipboard
  const handleCopyReference = (tokenName: string) => {
    const reference = `{${collectionName}.${tokenName}}`;

    try {
      // Try multiple clipboard methods for Figma plugin compatibility

      // Method 1: Try modern clipboard API (may not work in iframe)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(reference)
          .then(() => {
            setCopiedToken(tokenName);
            setTimeout(() => setCopiedToken(null), 2000);
          })
          .catch(() => {
            // Fall back to Method 2
            fallbackCopy(reference, tokenName);
          });
      } else {
        // Use fallback method
        fallbackCopy(reference, tokenName);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      fallbackCopy(reference, tokenName);
    }
  };

  // Fallback copy method using temporary textarea
  const fallbackCopy = (text: string, tokenName: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-999999px";
      textarea.style.top = "-999999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (successful) {
        setCopiedToken(tokenName);
        setTimeout(() => setCopiedToken(null), 2000);
      } else {
        console.error("Copy command failed");
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
  };

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
        padding: "var(--space-4)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--surface-primary)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "var(--space-4)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-3)",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--text-primary)",
              }}
            >
              {collectionName}
            </h3>
            <button
              onClick={onClose}
              style={{
                padding: "var(--space-1) var(--space-2)",
                fontSize: "var(--font-size-sm)",
                color: "var(--text-secondary)",
                backgroundColor: "transparent",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "var(--transition-base)",
              }}
            >
              ✕ Close
            </button>
          </div>

          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              marginBottom: "var(--space-3)",
            }}
          >
            {tokenEntries.length} token{tokenEntries.length !== 1 ? "s" : ""} •{" "}
            {modes.length} mode{modes.length !== 1 ? "s" : ""}
          </div>

          {/* Search and Filter */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onInput={(e) =>
                setSearchQuery((e.target as HTMLInputElement).value)
              }
              style={{
                flex: 1,
                padding: "var(--space-2)",
                fontSize: "var(--font-size-sm)",
                color: "var(--text-primary)",
                backgroundColor: "var(--surface-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                outline: "none",
              }}
            />
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType((e.target as HTMLSelectElement).value)
              }
              style={{
                padding: "var(--space-2)",
                fontSize: "var(--font-size-sm)",
                color: "var(--text-primary)",
                backgroundColor: "var(--surface-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Types</option>
              {tokenTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Token List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "var(--space-4)",
          }}
        >
          {filteredTokens.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-8)",
                color: "var(--text-secondary)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-size-lg)",
                  marginBottom: "var(--space-2)",
                }}
              >
                No tokens found
              </div>
              <div style={{ fontSize: "var(--font-size-sm)" }}>
                {searchQuery
                  ? "Try a different search query"
                  : "This collection is empty"}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              {filteredTokens.map((token) => (
                <div
                  key={token.name}
                  style={{
                    padding: "var(--space-3)",
                    backgroundColor: "var(--surface-secondary)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    transition: "var(--transition-base)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-primary)";
                    e.currentTarget.style.backgroundColor =
                      "var(--surface-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-default)";
                    e.currentTarget.style.backgroundColor =
                      "var(--surface-secondary)";
                  }}
                >
                  {/* Preview */}
                  <div style={{ flexShrink: 0 }}>
                    <TokenPreview type={token.$type} value={token.$value} />
                  </div>

                  {/* Token Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-medium)",
                        color: "var(--text-primary)",
                        marginBottom: "var(--space-1)",
                        fontFamily: "var(--font-mono)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={token.name}
                    >
                      {token.name}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 6px",
                          backgroundColor: "var(--info-light)",
                          borderRadius: "var(--radius-sm)",
                          marginRight: "var(--space-2)",
                        }}
                      >
                        {token.$type}
                      </span>
                      {token.$description && (
                        <span title={token.$description}>
                          {token.$description.length > 50
                            ? token.$description.substring(0, 50) + "..."
                            : token.$description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyReference(token.name)}
                    style={{
                      padding: "var(--space-2) var(--space-3)",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-medium)",
                      color:
                        copiedToken === token.name
                          ? "var(--success)"
                          : "var(--accent-primary)",
                      backgroundColor: "transparent",
                      border: `1px solid ${copiedToken === token.name ? "var(--success)" : "var(--accent-primary)"}`,
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      transition: "var(--transition-base)",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (copiedToken !== token.name) {
                        e.currentTarget.style.backgroundColor =
                          "var(--accent-primary)";
                        e.currentTarget.style.color = "var(--text-inverse)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (copiedToken !== token.name) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--accent-primary)";
                      }
                    }}
                  >
                    {copiedToken === token.name ? "✓ Copied!" : "📋 Copy Ref"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderTop: "1px solid var(--border-default)",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
          }}
        >
          Showing {filteredTokens.length} of {tokenEntries.length} token
          {tokenEntries.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
