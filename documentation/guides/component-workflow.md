# Component Development Workflow

This guide explains the automated component generation workflow and best practices for developing new components in the Wylie Dog Design System.

## Table of Contents

- [Quick Start](#quick-start)
- [Component Generator](#component-generator)
- [Component Development](#component-development)
- [Story Development](#story-development)
- [Testing](#testing)
- [Build & Export](#build--export)
- [Best Practices](#best-practices)

---

## Quick Start

### Generating a New Component

```bash
# Generate a complete component scaffold
pnpm generate:component my-component

# Example: Creating a rating component
pnpm generate:component rating
```

This single command creates:

- ✅ Component file with TypeScript types
- ✅ Test file with accessibility checks
- ✅ Storybook story with multiple examples
- ✅ Updated build configuration
- ✅ Updated package exports
- ✅ Formatted and linted code

---

## Component Generator

### What Gets Generated

The component generator creates a complete, production-ready scaffold:

#### 1. Component File (`packages/ui/src/<name>.tsx`)

```tsx
import React from "react";
import { cn } from "./lib/utils";

export interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default";
}

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-background text-foreground",
    };

    return (
      <div
        className={cn("relative", variants[variant], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Rating.displayName = "Rating";
```

**Key Features:**

- React.forwardRef for ref forwarding
- TypeScript interface extending HTML attributes
- Variant system with cn() utility
- displayName for debugging

#### 2. Test File (`packages/ui/src/__tests__/<name>.test.tsx`)

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { Rating } from "../rating";

expect.extend(toHaveNoViolations);

describe("Rating", () => {
  it("renders without crashing", () => {
    render(<Rating aria-label="Test rating" />);
    const element = screen.getByLabelText("Test rating");
    expect(element).toBeInTheDocument();
  });

  it("passes accessibility audit", async () => {
    const { container } = render(<Rating aria-label="Test rating" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Includes:**

- Basic rendering tests
- Accessibility audits with jest-axe
- Ref forwarding tests
- Custom className tests

#### 3. Storybook Story (`apps/storybook/stories/<name>.stories.tsx`)

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Rating } from "@wyliedog/ui/rating";

const meta: Meta<typeof Rating> = {
  title: "3. Components/Rating",
  component: Rating,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Rating component description.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual style variant",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Rating content",
  },
};
```

**Features:**

- Storybook 10.x patterns
- Autodocs enabled
- Centered layout
- ArgTypes with controls

#### 4. Build Configuration Updates

**tsup.config.ts:**

```typescript
entry: {
  // ... existing entries
  "rating": "src/rating.tsx",
}
```

**package.json exports:**

```json
{
  "./rating": {
    "types": "./src/rating.tsx",
    "import": "./dist/rating.mjs",
    "require": "./dist/rating.js"
  }
}
```

---

## Component Development

### Architecture Requirements

All components in the Wylie Dog Design System follow these patterns:

#### 1. **Single Source of Truth**

```
packages/ui/src/           ← SSOT for all components
├── button.tsx
├── rating.tsx
└── tooltip.tsx
```

**Never:**

- ❌ Create components in `apps/storybook`
- ❌ Create components in `apps/showcase`
- ❌ Duplicate component logic

**Always:**

- ✅ Define components in `packages/ui/src/`
- ✅ Import from `@wyliedog/ui/<component>`

#### 2. **TypeScript Patterns**

```tsx
// ✅ Extend HTML attributes for proper typing
export interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary";
  size?: "sm" | "md" | "lg";
}

// ✅ Use forwardRef for ref handling
export const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ variant = "default", ...props }, ref) => {
    return <div ref={ref} {...props} />;
  }
);

// ✅ Set displayName for debugging
Component.displayName = "Component";
```

#### 3. **Variant System**

```tsx
const variants = {
  default: "bg-background text-foreground",
  primary: "bg-primary text-primary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

// Apply with cn() utility
className={cn(
  "base-classes",
  variants[variant],
  sizes[size],
  className
)}
```

#### 4. **Design Tokens**

Use CSS custom properties from the token system:

```tsx
// ✅ Use design tokens (Tailwind 4 modern syntax)
"bg-(--color-button-primary-background)";
"hover:bg-(--color-button-primary-background-hover)";
"text-(--color-button-primary-text)";

// ❌ Avoid hardcoded colors
"bg-blue-500";
"hover:bg-blue-600";
```

#### 5. **Accessibility**

```tsx
// Required:
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management

// Example:
<button
  aria-label="Close dialog"
  aria-disabled={disabled}
  disabled={disabled}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  Close
</button>
```

---

## Story Development

### Storybook 10.x Best Practices

#### 1. **Meta Configuration**

```tsx
const meta: Meta<typeof Component> = {
  // Organization
  title: "3. Components/Category/Component",
  component: Component,

  // Layout & Docs
  parameters: {
    layout: "centered", // or "padded", "fullscreen"
    docs: {
      description: {
        component: "Clear, concise component description.",
      },
    },
  },

  // Auto-generate documentation
  tags: ["autodocs"],

  // Interactive controls
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary"],
      description: "Visual style variant",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
      },
    },
  },
};
```

#### 2. **Story Types**

**Basic Story (with args):**

```tsx
export const Default: Story = {
  args: {
    variant: "default",
    children: "Button text",
  },
};
```

**Render Story (custom rendering):**

```tsx
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Component variant="default">Default</Component>
      <Component variant="primary">Primary</Component>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates all available variants.",
      },
    },
  },
};
```

#### 3. **Story Categories**

Every component should have these basic stories:

1. **Default** - Basic usage
2. **AllVariants** - Visual showcase of all variants
3. **Interactive** - Real-world usage example
4. **States** - Different states (hover, disabled, active)
5. **Composition** - Usage with other components (if applicable)

#### 4. **Story Organization**

```
3. Components/
  ├── Inputs/
  │   ├── Button
  │   ├── Input
  │   └── Select
  ├── Layout/
  │   ├── Card
  │   └── Container
  └── Feedback/
      ├── Alert
      └── Toast
```

Use the `title` field to organize:

```tsx
title: "3. Components/Inputs/Button";
```

---

## Testing

### Test Requirements

Every component must have:

1. ✅ Basic rendering test
2. ✅ Accessibility audit (jest-axe)
3. ✅ Ref forwarding test
4. ✅ Custom className test
5. ✅ Variant tests (if applicable)

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run accessibility tests only
pnpm test:a11y
```

### Writing Additional Tests

```tsx
describe("Component", () => {
  // User interactions
  it("handles click events", async () => {
    const handleClick = vi.fn();
    render(<Component onClick={handleClick} />);

    const element = screen.getByRole("button");
    await userEvent.click(element);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Keyboard navigation
  it("supports keyboard navigation", async () => {
    render(<Component />);
    const element = screen.getByRole("button");

    element.focus();
    expect(element).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    // Assert behavior
  });

  // Conditional rendering
  it("renders loading state", () => {
    render(<Component loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
```

---

## Build & Export

### Build Process

The build process is automated through Turborepo:

```bash
# Build everything
pnpm build

# Build UI package only
pnpm --filter @wyliedog/ui build

# Build with watch mode (development)
pnpm --filter @wyliedog/ui dev
```

### Build Pipeline

```
1. build-tokens (Style Dictionary)
   ↓
2. build:styles (Tailwind CSS)
   ↓
3. build:components (tsup)
   ↓
4. Generated outputs:
   - dist/*.js (CJS)
   - dist/*.mjs (ESM)
   - dist/*.d.ts (Types)
   - dist/index.css (Styles)
```

### Import Patterns

**In apps (Storybook, Showcase):**

```tsx
// ✅ Per-component imports (tree-shakeable)
import { Button } from "@wyliedog/ui/button";
import { Card } from "@wyliedog/ui/card";

// ✅ Import styles once in root
import "@wyliedog/ui/styles";
```

**In packages/ui (internal):**

```tsx
// ✅ Relative imports within package
import { cn } from "./lib/utils";

// ❌ Never import from @wyliedog/ui within ui package
import { Button } from "@wyliedog/ui/button"; // Circular dependency!
```

---

## Best Practices

### Component Design

#### 1. **Composition Over Configuration**

```tsx
// ✅ Good: Composable sub-components
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card>

// ❌ Avoid: Too many props
<Card
  title="Title"
  content="Content"
  showHeader
  showFooter
/>
```

#### 2. **Controlled vs Uncontrolled**

```tsx
// Support both patterns
export const Component = ({
  value, // Controlled
  defaultValue, // Uncontrolled
  onChange,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;

  const currentValue = isControlled ? value : internalValue;

  const handleChange = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return <input value={currentValue} onChange={handleChange} />;
};
```

#### 3. **Variant Naming**

Use semantic names:

```tsx
// ✅ Semantic
variant: "primary" | "secondary" | "destructive";

// ❌ Visual
variant: "blue" | "red" | "green";
```

#### 4. **Size Consistency**

```tsx
// Standard sizes across all components
size: "sm" | "md" | "lg"

// Heights
sm: h-8   (32px)
md: h-10  (40px)
lg: h-12  (48px)
```

### Performance

#### 1. **Memoization**

```tsx
// Only when necessary
const MemoizedComponent = React.memo(Component, (prev, next) => {
  return prev.value === next.value;
});
```

#### 2. **Code Splitting**

Per-component exports enable automatic code splitting:

```tsx
// Only loads Button code
const Button = lazy(() => import("@wyliedog/ui/button"));
```

### Documentation

#### 1. **Component Description**

```tsx
/**
 * Button component for user actions.
 *
 * Supports multiple variants, sizes, and states including
 * loading and disabled. Fully accessible with keyboard support.
 *
 * @example
 * <Button variant="primary" size="lg">
 *   Click me
 * </Button>
 */
export const Button = ...
```

#### 2. **Prop Documentation**

```tsx
export interface ButtonProps {
  /**
   * Visual style variant
   * @default "default"
   */
  variant?: "default" | "primary" | "destructive";

  /**
   * Size variant
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Loading state - disables button and shows loading indicator
   */
  loading?: boolean;
}
```

---

## Workflow Checklist

When creating a new component:

### 1. Generation

- [ ] Run `pnpm generate:component <name>`
- [ ] Verify all files created successfully
- [ ] Check that build configs updated

### 2. Component Development

- [ ] Customize component logic
- [ ] Add variants as needed
- [ ] Implement accessibility features
- [ ] Use design tokens
- [ ] Add prop documentation

### 3. Story Development

- [ ] Update component description
- [ ] Create variant showcase
- [ ] Add interactive examples
- [ ] Add usage patterns
- [ ] Document props in argTypes

### 4. Testing

- [ ] Add component-specific tests
- [ ] Test user interactions
- [ ] Test keyboard navigation
- [ ] Verify accessibility
- [ ] Run full test suite

### 5. Quality Assurance

- [ ] Run `pnpm build` successfully
- [ ] View in Storybook (`pnpm --filter storybook dev`)
- [ ] Test in Showcase app
- [ ] Check bundle size (`pnpm size`)
- [ ] Run linting (`pnpm lint`)

### 6. Documentation

- [ ] Update component JSDoc
- [ ] Add usage examples
- [ ] Document edge cases
- [ ] Update README if needed

---

## Troubleshooting

### Component not appearing in Storybook

1. Check story file is in `apps/storybook/stories/`
2. Verify import path: `@wyliedog/ui/<name>`
3. Restart Storybook dev server
4. Check browser console for errors

### Build errors

1. Verify tsup.config.ts has entry
2. Check package.json has export
3. Run `pnpm build` to see specific error
4. Clear dist and rebuild: `rm -rf packages/ui/dist && pnpm build`

### Type errors

1. Ensure component exports interface
2. Check TypeScript extends correct HTML element
3. Verify ref type matches element type
4. Run `pnpm --filter @wyliedog/ui build` to check types

### Import errors in apps

1. Rebuild ui package: `pnpm --filter @wyliedog/ui build`
2. Check package.json export exists
3. Verify import path uses workspace protocol
4. Restart dev server

---

## Resources

- [Storybook 10 Documentation](https://storybook.js.org/docs)
- [React forwardRef](https://react.dev/reference/react/forwardRef)
- [Vitest Testing](https://vitest.dev/)
- [jest-axe Accessibility Testing](https://github.com/nickcolley/jest-axe)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)

---

**Last Updated:** December 2025
**Maintained by:** Wylie Dog Design System Team
