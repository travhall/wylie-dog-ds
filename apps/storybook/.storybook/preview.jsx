import "../stories/globals.css";
import { themeManager } from "./theme-sync";

let hasInitializedTheme = false;
let hasSyncedGlobals = false;

const syncGlobalsWithPreferredChoice = (context, currentChoice) => {
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
export const globalTypes = {
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
    },
  },
};

// Theme decorator - applies theme class to document root
export const decorators = [
  (Story, context) => {
    const themeChoice = context.globals.theme || "system";

    if (typeof window !== "undefined") {
      if (!hasInitializedTheme) {
        themeManager.init(themeChoice);
        hasInitializedTheme = true;
        syncGlobalsWithPreferredChoice(context, themeChoice);
      } else {
        themeManager.setChoice(themeChoice);
      }
    }

    return <Story />;
  },
];

export const parameters = {
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
