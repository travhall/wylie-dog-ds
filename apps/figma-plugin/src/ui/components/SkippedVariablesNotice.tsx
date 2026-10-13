import { h } from "preact";
import { useState } from "preact/hooks";
import { Icon } from "./common/Icon";
import type { UnsupportedVariable } from "../../plugin/variables/processor";

interface SkippedVariablesNoticeProps {
  skipped: UnsupportedVariable[];
  onDismiss: () => void;
}

function groupByCollection(
  skipped: UnsupportedVariable[]
): Array<[string, UnsupportedVariable[]]> {
  const groups = new Map<string, UnsupportedVariable[]>();
  for (const variable of skipped) {
    const group = groups.get(variable.collection) ?? [];
    group.push(variable);
    groups.set(variable.collection, group);
  }
  return Array.from(groups);
}

export function SkippedVariablesNotice({
  skipped,
  onDismiss,
}: SkippedVariablesNoticeProps) {
  const [expanded, setExpanded] = useState(false);
  const count = skipped.length;
  const listId = "skipped-variables-list";

  const linkButtonStyle = {
    background: "none",
    border: "none",
    padding: "var(--space-1)",
    cursor: "pointer",
    color: "var(--text-secondary)",
    fontSize: "var(--font-size-sm)",
    textDecoration: "underline",
    borderRadius: "var(--radius-sm)",
  };

  return (
    <div
      role="status"
      style={{
        margin: "0 12px 12px",
        padding: "var(--space-3)",
        backgroundColor: "var(--warning-light)",
        border: "1px solid var(--warning)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--font-size-sm)",
        color: "var(--text-primary)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "var(--space-2)",
        }}
      >
        <Icon name="warning" size={14} color="var(--warning)" />
        <div style={{ flex: 1 }}>
          <strong>
            {count} variable{count === 1 ? " was" : "s were"} skipped
          </strong>
          <div style={{ color: "var(--text-secondary)" }}>
            Token Bridge can't export these variable types yet; they were left
            out of the files and the pull request.
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss skipped variables notice"
          style={linkButtonStyle}
        >
          Dismiss
        </button>
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={listId}
        style={{ ...linkButtonStyle, marginTop: "var(--space-2)" }}
      >
        {expanded ? "Hide list" : "Show list"}
      </button>

      {expanded && (
        <div id={listId} style={{ marginTop: "var(--space-2)" }}>
          {groupByCollection(skipped).map(([collection, variables]) => (
            <section key={collection} aria-label={collection}>
              <h3
                style={{
                  margin: "var(--space-2) 0 var(--space-1)",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                {collection}
              </h3>
              <ul style={{ margin: 0, paddingLeft: "var(--space-4)" }}>
                {variables.map((variable) => (
                  <li key={variable.id}>
                    <code>{variable.name}</code> ({variable.resolvedType}):{" "}
                    <span style={{ color: "var(--text-secondary)" }}>
                      {variable.reason}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
