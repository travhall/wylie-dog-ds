import "../stories/globals.css";
import { addons } from "storybook/preview-api";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { themeManager } from "./theme-sync";
import type { ThemeChoice } from "./theme-sync";
import type { Preview } from "@storybook/react";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

const preview: Preview = {
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  initialGlobals: {},
};

export default preview;

let hasInitializedTheme = false;
let lastSyncedChoice: string | null = null;
const hasBootstrappedThemeKey = "__WYLIE_STORYBOOK_THEME_BOOTSTRAPPED__";

const THEME_PARAM = "theme";
const isThemeChoice = (value: any): value is ThemeChoice =>
  value === "light" || value === "dark" || value === "system";

const getThemeFromQueryParam = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const globalsParam = params.get("globals");

    if (!globalsParam) {
      return null;
    }

    const decoded = decodeURIComponent(globalsParam);
    const themeEntry = decoded
      .split(";")
      .map((entry) => entry.split(":"))
      .find(([key]) => key === THEME_PARAM);

    if (themeEntry) {
      const [, value] = themeEntry;
      if (isThemeChoice(value)) {
        return value;
      }
    }
  } catch {
    // Ignore malformed query params and fall back to stored/system preference.
  }

  return null;
};

const ensureThemeInitialized = (choice: ThemeChoice = "system") => {
  if (typeof window === "undefined" || hasInitializedTheme) {
    return;
  }

  themeManager.init(choice);
  hasInitializedTheme = true;
};

const bootstrapThemeSync = () => {
  if (typeof window === "undefined") {
    return;
  }

  if ((window as any)[hasBootstrappedThemeKey]) {
    return;
  }

  const initialChoice =
    getThemeFromQueryParam() ?? themeManager.getPreferredChoice();

  ensureThemeInitialized(initialChoice);

  const channel = addons.getChannel();

  const handleGlobalsUpdated = ({
    globals,
  }: {
    globals?: Record<string, any>;
  }) => {
    const nextChoice = globals?.[THEME_PARAM];

    if (isThemeChoice(nextChoice)) {
      themeManager.setChoice(nextChoice);
    }
  };

  // Note: DOCS_RENDERED handler removed - decorator handles theme application
  // for both story and docs pages, preventing redundant DOM manipulation

  channel.on(GLOBALS_UPDATED, handleGlobalsUpdated);

  (window as any)[hasBootstrappedThemeKey] = true;
};

bootstrapThemeSync();

const syncGlobalsWithPreferredChoice = (
  context: any,
  currentChoice: string
) => {
  if (
    typeof window === "undefined" ||
    typeof context.updateGlobals !== "function"
  ) {
    return;
  }

  const preferredChoice = themeManager.getState().choice;

  // Only sync if preference differs from current choice AND we haven't synced this choice yet
  // This allows re-syncing when user changes localStorage preference between sessions
  if (
    preferredChoice &&
    preferredChoice !== currentChoice &&
    lastSyncedChoice !== preferredChoice
  ) {
    context.updateGlobals({ theme: preferredChoice });
    lastSyncedChoice = preferredChoice;
  }
};

// Global types for toolbar controls
export const globalTypes: Preview["globalTypes"] = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: "system",
    toolbar: {
      icon: "circlehollow",
      items: [
        { value: "light", icon: "sun", title: "Light mode" },
        { value: "dark", icon: "moon", title: "Dark mode" },
        { value: "system", icon: "contrast", title: "System preference" },
      ],
      showName: true,
      dynamicTitle: true,
    } as any,
  },
};

// Theme decorator - applies theme class to document root
export const decorators: Preview["decorators"] = [
  (Story, context) => {
    if (typeof window !== "undefined") {
      // Determine theme choice with proper priority:
      // 1. User's toolbar selection (context.globals.theme)
      // 2. Current manager state (already initialized)
      // 3. Stored preference or system default
      const currentState = themeManager.getState();
      const themeChoice =
        context.globals.theme ||
        currentState.choice ||
        themeManager.getPreferredChoice() ||
        "system";

      // Only initialize once, not on every story navigation
      if (!hasInitializedTheme) {
        ensureThemeInitialized(themeChoice);
      }

      // Only update if theme actually changed from current state
      if (currentState.choice !== themeChoice) {
        themeManager.setChoice(themeChoice);
      }

      syncGlobalsWithPreferredChoice(context, themeChoice);
    }

    return <Story />;
  },
];

export const parameters: Preview["parameters"] = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },

  options: {
    storySort: {
      order: [
        "Introduction",
        ["Welcome", "Getting Started", "Using This System"],
        "Foundations",
        [
          "Design Principles",
          "Colors",
          "Typography",
          "Spacing & Layout",
          "Accessibility Guidelines",
        ],
        "Components",
        [
          "Inputs & Controls",
          "Navigation",
          "Layout & Structure",
          "Content Display",
          "Feedback & Status",
          "Overlays & Popovers",
        ],
        "Patterns",
        [
          "Overview",
          "Form Patterns",
          "Authentication Patterns",
          "Data Patterns",
          "Navigation Patterns",
          "Layout Patterns",
          "Feedback Patterns",
          "Page Compositions",
        ],
        "Resources",
        [
          "Getting Started",
          ["Quickstart Tutorial", "Installation"],
          "Theming",
          ["Overview"],
          "Guides",
          ["Composition Patterns", "Component Testing", "Performance"],
        ],
        "Contributing",
        ["Guidelines", "Workflows"],
      ],
    },
  },

  // A11y configuration - manual mode to prevent flickering during theme changes
  a11y: {
    manual: true,
    // 'todo' - show a11y violations in the test UI only
    // 'error' - fail CI on a11y violations
    // 'off' - skip a11y checks entirely
    test: "todo",
  },
};
