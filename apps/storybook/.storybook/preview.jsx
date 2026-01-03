import "../stories/globals.css";

// Track theme globally to prevent re-application
let globalTheme = "light";
let isInitialized = false;

// Global types for toolbar controls
export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: "light",
    toolbar: {
      icon: "circlehollow",
      items: [
        { value: "light", icon: "sun", title: "Light mode" },
        { value: "dark", icon: "moon", title: "Dark mode" },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
};

// Theme decorator - applies theme class to document root
export const decorators = [
  (Story, context) => {
    const theme = context.globals.theme || "light";

    // Apply theme synchronously if it changed
    if (globalTheme !== theme) {
      globalTheme = theme;
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      root.setAttribute("data-theme", theme);
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
