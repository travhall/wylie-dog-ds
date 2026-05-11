import { h } from "preact";
import { useRef, useEffect } from "preact/hooks";

export type TabId = "tokens" | "sync";

export interface Tab {
  id: TabId;
  label: string;
  count?: number;
  disabled?: boolean;
}

const DEFAULT_TABS: Tab[] = [
  { id: "tokens", label: "Tokens" },
  { id: "sync", label: "Sync" },
];

const TAB_ARIA_LABELS: Record<TabId, string> = {
  tokens: "View tokens",
  sync: "Sync and import",
};

interface TabBarProps {
  tabs?: Tab[];
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  githubConnected?: boolean;
}

/**
 * TabBar — navigation between plugin sections.
 * Supports keyboard navigation (Arrow keys, Home, End).
 * Renders edge-to-edge; no outer padding.
 */
export function TabBar({
  tabs,
  activeTab,
  onTabChange,
  githubConnected = false,
}: TabBarProps) {
  const resolvedTabs = (tabs ?? DEFAULT_TABS).map((tab) => ({
    ...tab,
    disabled: tab.disabled ?? false,
  }));

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, resolvedTabs.length);
  }, [resolvedTabs.length]);

  const handleKeyDown = (e: KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case "ArrowLeft":
        newIndex =
          currentIndex > 0 ? currentIndex - 1 : resolvedTabs.length - 1;
        break;
      case "ArrowRight":
        newIndex =
          currentIndex < resolvedTabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = resolvedTabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const tab = resolvedTabs[newIndex];
    if (tab && !tab.disabled) {
      onTabChange(tab.id);
      tabRefs.current[newIndex]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Main Navigation"
      style={{
        display: "flex",
        borderBottom: "1px solid var(--border-default)",
        background: "var(--surface-primary)",
        padding: "0 8px",
        flexShrink: 0,
      }}
    >
      {resolvedTabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            aria-disabled={isDisabled}
            id={`tab-${tab.id}`}
            aria-label={TAB_ARIA_LABELS[tab.id] ?? tab.label}
            tabIndex={isActive ? 0 : -1}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            onKeyDown={(e) => !isDisabled && handleKeyDown(e, index)}
            disabled={isDisabled}
            style={{
              height: 32,
              padding: "0 4px",
              margin: "0 4px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${isActive ? "var(--accent-primary)" : "transparent"}`,
              color: isDisabled
                ? "var(--text-tertiary)"
                : isActive
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              fontFamily: "var(--font-family-base)",
              fontSize: "var(--font-size-base)",
              fontWeight: isActive
                ? "var(--font-weight-semibold)"
                : "var(--font-weight-medium)",
              cursor: isDisabled ? "not-allowed" : "pointer",
              transition: "var(--transition-fast)",
              outline: "none",
            }}
          >
            {tab.label}

            {/* Count badge */}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-family-mono)",
                  fontSize: "var(--font-size-xs)",
                  background: isActive
                    ? "var(--accent-primary)"
                    : "var(--surface-tertiary)",
                  color: isActive ? "#fff" : "var(--text-secondary)",
                  padding: "1px 6px",
                  borderRadius: 999,
                  lineHeight: 1.4,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
