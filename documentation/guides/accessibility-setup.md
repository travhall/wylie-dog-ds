# Setting Up Automated Accessibility Testing

## Dependencies to Add

```bash
# Testing dependencies
pnpm add -D @testing-library/react @testing-library/jest-dom jest-axe @axe-core/react vitest jsdom

# Storybook accessibility addon
pnpm add -D @storybook/addon-a11y

# ESLint accessibility rules
pnpm add -D eslint-plugin-jsx-a11y
```

## Next Steps (In Priority Order)

### Step 1: Configure Vitest for Accessibility Testing

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test-setup.ts"],
  },
});
```

### Step 2: Create Accessibility Test Utils

```typescript
// test-utils/accessibility.ts
import { axe, toHaveNoViolations } from "jest-axe";
import { render } from "@testing-library/react";

expect.extend(toHaveNoViolations);

export const renderWithA11yTest = async (component: React.ReactElement) => {
  const { container } = render(component);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  return { container };
};
```

### Step 3: Add ESLint Accessibility Rules

```json
// .eslintrc.js additions
{
  "extends": ["plugin:jsx-a11y/recommended"],
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error"
  }
}
```

### Step 4: Update Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:a11y": "vitest --run --reporter=verbose test/**/*.a11y.test.tsx",
    "test:coverage": "vitest --coverage",
    "lint:a11y": "eslint src/**/*.tsx --ext .tsx --config .eslintrc.a11y.js"
  }
}
```
