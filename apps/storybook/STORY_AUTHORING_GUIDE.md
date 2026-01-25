# Story Authoring Guide

This guide defines the standards and best practices for writing Storybook stories in the Wylie Dog Design System.

## Quick Reference

```typescript
import type { Meta, StoryObj } from "@storybook/react-vite"; // Always use react-vite
import { within, userEvent, expect } from "storybook/test"; // For play functions
import { ComponentName } from "@wyliedog/ui/component-name";

const meta: Meta<typeof ComponentName> = {
  title: "Components/Category/ComponentName",
  component: ComponentName,
  parameters: {
    layout: "centered", // or "padded" | "fullscreen"
    docs: {
      description: {
        component: "Clear description of purpose and key features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    /* ... */
  },
};

export default meta;
type Story = StoryObj<typeof meta>;
```

---

## Required Elements

### 1. Type Imports

Always import from `@storybook/react-vite`, not `@storybook/react`:

```typescript
// ✅ Correct
import type { Meta, StoryObj } from "@storybook/react-vite";

// ❌ Wrong
import type { Meta, StoryObj } from "@storybook/react";
```

### 2. Meta Configuration

Every story file must include a complete meta configuration:

```typescript
const meta: Meta<typeof ComponentName> = {
  // Required: Title matching sidebar hierarchy
  title: "Components/Inputs & Controls/Button",

  // Required: Component reference for autodocs
  component: ComponentName,

  // Required: Parameters with docs description
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Description of the component purpose, features, and accessibility notes.",
      },
    },
  },

  // Required: Enable automatic documentation
  tags: ["autodocs"],

  // Required: ArgTypes for all controllable props
  argTypes: {
    /* ... */
  },
};
```

### 3. ArgTypes Structure

All props should have complete argTypes definitions:

```typescript
argTypes: {
  variant: {
    control: "select",                    // Control type
    options: ["default", "primary"],      // Available options
    description: "The visual style variant",
    table: {
      type: { summary: '"default" | "primary"' },
      defaultValue: { summary: '"default"' },
      category: "Appearance",             // Groups in docs table
    },
  },
  size: {
    control: "radio",
    options: ["sm", "md", "lg"],
    description: "The size of the component",
    table: {
      type: { summary: '"sm" | "md" | "lg"' },
      defaultValue: { summary: '"md"' },
      category: "Appearance",
    },
  },
  disabled: {
    control: "boolean",
    description: "Whether the component is disabled",
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
      category: "State",
    },
  },
  className: {
    control: "text",
    description: "Additional CSS classes for custom styling",
    table: {
      type: { summary: "string" },
      category: "Styling",
    },
  },
},
```

**ArgType Categories:**

- `Appearance` - Visual variants, sizes, colors
- `State` - Disabled, loading, error states
- `Content` - Children, labels, text content
- `Behavior` - Event handlers, controlled state
- `Styling` - className, style props

### 4. Story-Level Descriptions

Every story should have a description:

```typescript
export const Default: Story = {
  args: {
    /* ... */
  },
  parameters: {
    docs: {
      description: {
        story: "Basic usage with default props.",
      },
    },
  },
};
```

---

## Standard Story Types

Each component should include these standard stories (where applicable):

### 1. Default

Basic usage with minimal configuration.

```typescript
export const Default: Story = {
  args: {
    children: "Button",
  },
  parameters: {
    docs: {
      description: {
        story: "Basic usage with default props.",
      },
    },
  },
};
```

### 2. AllVariants

All visual variants displayed together.

```typescript
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available variants for comparison.",
      },
    },
  },
};
```

### 3. AllSizes (if applicable)

All size variants displayed together.

```typescript
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Size variants for different contexts.",
      },
    },
  },
};
```

### 4. States

Normal, disabled, loading, error states.

```typescript
export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button>Normal</Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Component states including disabled and loading.",
      },
    },
  },
};
```

### 5. WithInteractions

Play function for automated testing.

```typescript
export const WithInteractions: Story = {
  args: {
    children: "Click Me",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button");
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(button).toHaveFocus();
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive story with automated tests.",
      },
    },
  },
};
```

### 6. UsageExample

Real-world context demonstration.

```typescript
export const UsageExample: Story = {
  render: () => (
    <div className="w-96 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Form Section</h3>
      <Button className="mt-4">Submit</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world usage in context.",
      },
    },
  },
};
```

---

## Styling Guidelines

### Use Semantic Color Tokens

Always use semantic color tokens, never hardcoded colors:

```typescript
// ✅ Correct - Semantic tokens
<p className="text-(--color-text-secondary)">Description</p>
<div className="border-(--color-border-primary)">Content</div>
<span className="text-(--color-text-success)">Success</span>

// ✅ Also acceptable - Tailwind semantic classes
<p className="text-muted-foreground">Description</p>

// ❌ Wrong - Hardcoded colors
<p className="text-gray-600">Description</p>
<div className="border-gray-300">Content</div>
```

### Common Token Mappings

| Purpose              | Token                               | Tailwind Alternative    |
| -------------------- | ----------------------------------- | ----------------------- |
| Primary text         | `text-(--color-text-primary)`       | `text-foreground`       |
| Secondary text       | `text-(--color-text-secondary)`     | `text-muted-foreground` |
| Tertiary text        | `text-(--color-text-tertiary)`      | -                       |
| Primary border       | `border-(--color-border-primary)`   | `border-border`         |
| Secondary border     | `border-(--color-border-secondary)` | -                       |
| Primary background   | `bg-(--color-background-primary)`   | `bg-background`         |
| Secondary background | `bg-(--color-background-secondary)` | `bg-muted`              |
| Success              | `text-(--color-text-success)`       | -                       |
| Warning              | `text-(--color-text-warning)`       | -                       |
| Error/Danger         | `text-(--color-text-danger)`        | `text-destructive`      |

---

## Title Hierarchy

Story titles must match the sidebar hierarchy defined in `preview.tsx`:

### Components

```
Components/Inputs & Controls/Button
Components/Inputs & Controls/Input
Components/Navigation/Tabs
Components/Layout & Structure/Separator
Components/Content Display/Card
Components/Feedback & Status/Alert
Components/Overlays & Popovers/Dialog
```

### Patterns

```
Patterns/Form Patterns/LoginForm
Patterns/Authentication Patterns/PasswordRecovery
Patterns/Data Patterns/CardGrid
Patterns/Navigation Patterns/SiteHeader
```

### Foundations

```
Foundations/Design Tokens/Colors
Foundations/Design Tokens/Typography
Foundations/Design Principles/Overview
```

---

## Play Functions

### When to Add Play Functions

Add play functions for:

- Interactive components (buttons, inputs, dialogs)
- Components with keyboard navigation
- Components with focus management
- Form components

### Play Function Structure

```typescript
import { within, userEvent, expect } from "storybook/test";

export const WithInteractions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Find elements
    const button = canvas.getByRole("button", { name: /submit/i });

    // 2. Assert initial state
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    // 3. Perform interactions
    await userEvent.click(button);

    // 4. Assert results
    expect(button).toHaveFocus();

    // 5. Test keyboard navigation
    await userEvent.keyboard("{Tab}");
    await userEvent.keyboard("{Enter}");
  },
};
```

### Common Queries

```typescript
// By role (preferred)
canvas.getByRole("button", { name: /submit/i });
canvas.getByRole("textbox", { name: /email/i });
canvas.getByRole("dialog");
canvas.getByRole("tab", { name: /settings/i });

// By label (for form fields)
canvas.getByLabelText(/email/i);

// By text
canvas.getByText(/welcome/i);

// Query variants (for optional elements)
canvas.queryByRole("dialog"); // Returns null if not found
```

---

## Checklist

Use this checklist when writing or reviewing stories:

### Meta Configuration

- [ ] Uses `@storybook/react-vite` for type imports
- [ ] Title matches sidebar hierarchy
- [ ] Has `docs.description.component`
- [ ] Includes `tags: ["autodocs"]`
- [ ] All props have complete argTypes

### ArgTypes

- [ ] Every controllable prop has an argType
- [ ] Each argType has `description`
- [ ] Each argType has `table.type.summary`
- [ ] Each argType has `table.defaultValue.summary` (if applicable)
- [ ] ArgTypes are categorized (`Appearance`, `State`, `Content`, etc.)

### Stories

- [ ] Has `Default` story
- [ ] Has `AllVariants` story (if multiple variants exist)
- [ ] Has `AllSizes` story (if multiple sizes exist)
- [ ] Has `States` story (if component has states)
- [ ] Each story has `docs.description.story`

### Styling

- [ ] Uses semantic color tokens (not hardcoded colors)
- [ ] Uses design system spacing utilities
- [ ] Dark mode compatible

### Accessibility

- [ ] Interactive stories have play functions
- [ ] Play functions test keyboard navigation
- [ ] Labels are associated with form controls

---

## Linting Rules

The following patterns should be flagged during code review:

### Must Fix

```typescript
// ❌ Wrong import source
import type { Meta } from "@storybook/react";

// ❌ Missing docs description
const meta: Meta = {
  title: "Components/Button",
  component: Button,
  // Missing parameters.docs.description.component
};

// ❌ Hardcoded colors in story renders
<p className="text-gray-600">Text</p>
```

### Should Fix

```typescript
// ⚠️ Incomplete argTypes
argTypes: {
  variant: {
    control: "select",
    options: ["default"],
    // Missing description and table
  },
}

// ⚠️ Missing story description
export const Default: Story = {
  args: { children: "Button" },
  // Missing parameters.docs.description.story
};

// ⚠️ Inconsistent story naming
export const Basic: Story = {};  // Should be "Default"
```

---

## Examples

### Minimal Valid Story

```typescript
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@wyliedog/ui/button";

const meta: Meta<typeof Button> = {
  title: "Components/Inputs & Controls/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Button component for user actions.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary"],
      description: "Visual style variant",
      table: {
        type: { summary: '"default" | "primary"' },
        defaultValue: { summary: '"default"' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Button" },
  parameters: {
    docs: {
      description: {
        story: "Basic button usage.",
      },
    },
  },
};
```

### Complete Story File

See `apps/storybook/stories/Components/Inputs & Controls/button.stories.tsx` for a comprehensive example.

---

## Resources

- [Storybook 10 Documentation](https://storybook.js.org/docs)
- [Writing Stories](https://storybook.js.org/docs/writing-stories)
- [ArgTypes](https://storybook.js.org/docs/api/arg-types)
- [Play Functions](https://storybook.js.org/docs/writing-stories/play-function)
- [Accessibility Testing](https://storybook.js.org/docs/writing-tests/accessibility-testing)
