import { h } from "preact";
import { useRef, useEffect } from "preact/hooks";

export type TabId = "tokens" | "import" | "sync";

export interface Tab {
  id: TabId;
  label: string;
  icon?: string;
  disabled?: boolean;
}

const DEFAULT_TABS: Tab[] = [
  { id: "tokens", label: "Tokens", icon: "🎨" },
  { id: "import", label: "Import", icon: "📥" },
  { id: "sync", label: "Sync", icon: "🔄" },
];

const TAB_ARIA_LABELS: Record<TabId, string> = {
  tokens: "Select tokens",
  import: "Import tokens",
  sync: "Sync with GitHub",
};

interface TabBarProps {
  tabs?: Tab[];
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  githubConnected?: boolean;
}

/**
 * TabBar - Provides clear navigation between plugin sections
 * Supports keyboard navigation (Arrow keys, Home, End)
 */
export function TabBar({
  tabs,
  activeTab,
  onTabChange,
  githubConnected = false,
}: TabBarProps) {
  const resolvedTabs = (tabs ?? DEFAULT_TABS).map((tab) => {
    if (tab.id !== "sync") return tab;
    return {
      ...tab,
      disabled: tab.disabled ?? !githubConnected,
    };
  });

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Update refs array size if tabs change
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
        return; // Don't prevent default for other keys
    }

    e.preventDefault();
    const tab = resolvedTabs[newIndex];
    if (tab && !tab.disabled) {
      onTabChange(tab.id);
      // Focus the new tab button using ref
      tabRefs.current[newIndex]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Main Navigation"
      style={{
        display: "flex",
        gap: "var(--space-1)",
        borderBottom: "2px solid var(--border-default)",
        marginBottom: "var(--space-4)",
        paddingBottom: "0",
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
              position: "relative",
              padding: "var(--space-3)",
              flexGrow: 1,
              fontSize: "var(--font-size-md)",
              fontWeight: isActive
                ? "var(--font-weight-semibold)"
                : "var(--font-weight-semibold)",
              color: isDisabled
                ? "var(--text-tertiary)"
                : isActive
                  ? "var(--accent-primary)"
                  : "var(--text-secondary)",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: `2px solid ${isActive ? "var(--accent-primary)" : "transparent"}`,
              marginBottom: "-2px",
              cursor: isDisabled ? "not-allowed" : "pointer",
              transition: "var(--transition-base)",
              outline: "none",
            }}
          >
            {tab.icon && (
              <span
                style={{ marginRight: "var(--space-1)" }}
                aria-hidden="true"
              >
                {tab.icon}
              </span>
            )}
            {tab.label}

            {/* Focus indicator */}
            <span
              style={{
                position: "absolute",
                inset: "0",
                borderRadius: "var(--radius-sm)",
                boxShadow: isActive
                  ? "0 0 0 2px var(--accent-primary)"
                  : "none",
                opacity: "0",
                transition: "var(--transition-fast)",
                pointerEvents: "none",
              }}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
