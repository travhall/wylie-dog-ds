import '../stories/globals.css';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  options: {
    storySort: {
      order: [
        '1. Introduction',
        '2. Foundations',
        '3. Components',
        '4. Patterns',
        '5. Guides'
      ],
    },
  },
};
