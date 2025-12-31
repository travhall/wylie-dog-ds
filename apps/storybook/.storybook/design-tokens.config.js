export default {
  // Source files containing design tokens
  sources: [
    '../../../packages/tokens/dist/tokens.css',
  ],

  // Token categories to display
  presenters: [
    {
      type: 'color',
      selector: /^--color-/,
    },
    {
      type: 'spacing',
      selector: /^--spacing-/,
    },
    {
      type: 'font-size',
      selector: /^--font-size-/,
    },
    {
      type: 'shadow',
      selector: /^--shadow-/,
    },
  ],
};
