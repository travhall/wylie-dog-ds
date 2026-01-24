import "../stories/globals.css";
import { addons } from "storybook/preview-api";
import { DOCS_RENDERED, GLOBALS_UPDATED } from "storybook/internal/core-events";
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
  initialGlobals: {
    viewport: { value: "ipad", isRotated: false },
  },
};

export default preview;

let hasInitializedTheme = false;
let hasSyncedGlobals = false;
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

  const handleDocsRendered = () => {
    const docsChoice = themeManager.getState().choice;

    if (isThemeChoice(docsChoice)) {
      themeManager.setChoice(docsChoice);
    }
  };

  channel.on(GLOBALS_UPDATED, handleGlobalsUpdated);
  channel.on(DOCS_RENDERED, handleDocsRendered);

  (window as any)[hasBootstrappedThemeKey] = true;
};

bootstrapThemeSync();

const syncGlobalsWithPreferredChoice = (
  context: any,
  currentChoice: string
) => {
  if (
    hasSyncedGlobals ||
    typeof window === "undefined" ||
    typeof context.updateGlobals !== "function"
  ) {
    return;
  }

  const preferredChoice = themeManager.getState().choice;

  if (preferredChoice && preferredChoice !== currentChoice) {
    context.updateGlobals({ theme: preferredChoice });
  }

  hasSyncedGlobals = true;
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
    const themeChoice =
      context.globals.theme ||
      themeManager.getState().choice ||
      themeManager.getPreferredChoice() ||
      "system";

    if (typeof window !== "undefined") {
      ensureThemeInitialized(themeChoice);
      themeManager.setChoice(themeChoice);
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
        "1. Introduction",
        ["Welcome", "Getting Started", "Design Principles"],
        "2. Foundations",
        "3. Components",
        [
          "Actions",
          "Forms",
          "Navigation",
          "Feedback",
          "Overlays",
          "Data Display",
          "Layout",
        ],
        "4. Patterns",
        "5. Guides",
        ["Theming", "Composition Patterns", "Testing", "Accessibility"],
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
