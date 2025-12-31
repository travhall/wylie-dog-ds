import "../stories/globals.css";
import { useEffect } from "react";

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

// Theme decorator
export const decorators = [
  (Story, context) => {
    const theme = context.globals.theme || "light";

    useEffect(() => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      root.setAttribute("data-theme", theme);
    }, [theme]);

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

  a11y: {
    // 'todo' - show a11y violations in the test UI only
    // 'error' - fail CI on a11y violations
    // 'off' - skip a11y checks entirely
    test: "todo",
  },
};
