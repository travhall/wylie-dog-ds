# Automated Accessibility Testing (Already Configured)

This infrastructure already exists in the repo — this doc is a map of what's
there and how to extend it, not an install checklist.

## What's already installed

`packages/ui/package.json` already has these as devDependencies:

- `@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event` — component rendering and assertions
- `jest-axe` and `axe-core` — automated axe accessibility audits in Vitest
- `eslint-plugin-jsx-a11y` — static ESLint accessibility rules
- `jsdom` and `vitest` — the test environment and runner

`apps/storybook/package.json` already has `@storybook/addon-a11y` installed
and wired into `.storybook/main.ts`, giving every story a live accessibility
panel.

Not currently installed: `@axe-core/react` (a separate in-browser
runtime-checking package, distinct from the `axe-core` + `jest-axe`
combination already in use here). Only add it if you have a specific need
for its live DOM-mutation-observer checks — the existing `jest-axe`
per-render audits cover the same violations for component tests.

```bash
# Only if you need @axe-core/react's specific live-DOM-observer behavior:
pnpm add -D @axe-core/react
```

## What's already configured

### Vitest

`packages/ui/vitest.config.ts` already sets:

```typescript
test: {
  environment: "jsdom",
  setupFiles: ["./src/test-setup.ts"],
  // ...
}
```

### Global test setup

`packages/ui/src/test-setup.ts` already:

- Extends Vitest's `expect` with `@testing-library/jest-dom` matchers and
  `jest-axe`'s `toHaveNoViolations`
- Runs `cleanup()` after every test
- Mocks `ResizeObserver`, `IntersectionObserver`, `matchMedia`, and the
  pointer-capture / `scrollIntoView` APIs Radix components rely on in jsdom

### ESLint

`eslint-plugin-jsx-a11y` is already wired into the lint config — no separate
`.eslintrc.a11y.js` needed.

### npm scripts

`packages/ui/package.json` already defines:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:a11y": "vitest --run --reporter=verbose src/__tests__/*.a11y.test.tsx src/accessibility-validation.test.tsx",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

## Extending the existing infrastructure

The pattern for a new component's accessibility test — following the
existing examples in `packages/ui/src/__tests__/*.a11y.test.tsx` (e.g.
`button.a11y.test.tsx`, `avatar.a11y.test.tsx`, `alert.a11y.test.tsx`,
`skeleton.a11y.test.tsx`):

```typescript
// packages/ui/src/__tests__/my-component.a11y.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { MyComponent } from "../my-component";

expect.extend(toHaveNoViolations);

describe("MyComponent Accessibility Tests", () => {
  it("should pass accessibility audit", async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should be focusable and activatable with keyboard", () => {
    // Follow the keyboard-interaction pattern in button.a11y.test.tsx
  });
});
```

Run just the new file with:

```bash
pnpm --filter @wyliedog/ui test:a11y
```

For story-level accessibility feedback (contrast, ARIA, landmarks) while
developing in Storybook, use the existing `@storybook/addon-a11y` panel —
no additional setup is needed to see violations for a given story.
