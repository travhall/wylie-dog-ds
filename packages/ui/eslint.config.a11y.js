// ESLint flat configuration for accessibility rules
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // Start with recommended rules but override problematic ones
      ...jsxA11y.configs.recommended.rules,
      
      // Disable rules that don't make sense for component libraries
      'jsx-a11y/html-has-lang': 'off', // Components don't render <html>
      'jsx-a11y/iframe-has-title': 'off', // Components don't typically render iframes
      
      // Core accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          labelComponents: ['Label'],
          labelAttributes: ['htmlFor'],
          controlComponents: ['Input', 'Select', 'Textarea'],
          assert: 'either',
          depth: 25,
        },
      ],
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      
      // Design system component-specific adjustments
      'jsx-a11y/anchor-has-content': ['warn', {
        components: ['Link', 'a', 'PaginationLink'],
      }],
      'jsx-a11y/heading-has-content': ['error', {
        components: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      }],
      
      // Allow flexibility for design system components
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'warn', // Warn instead of error for components
      'jsx-a11y/anchor-is-valid': ['error', {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      }],
    },
    settings: {
      'jsx-a11y': {
        components: {
          // Map our custom components to their semantic equivalents
          Button: 'button',
          Input: 'input',
          Select: 'select',
          Textarea: 'textarea',
          Label: 'label',
          Link: 'a',
          Image: 'img',
          // Explicitly map navigation components
          PaginationLink: 'a',
          BreadcrumbLink: 'a',
          // Don't map heading/container components to avoid false positives
          AlertTitle: null,
          CardTitle: null,
          Avatar: null,
          Card: null,
          Alert: null,
        },
      },
    },
  },
];
