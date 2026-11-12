import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import { Button, buttonVariants } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import {
  ArrowRightIcon,
  CheckIcon,
  HeartIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

// The icon control: a glyph by name, turned into the component by `mapping`. Any lucide-react icon
// (or any component that renders an SVG) works as the `icon` prop; this is the short list.
const ICONS = {
  None: undefined,
  Plus: PlusIcon,
  Heart: HeartIcon,
  Check: CheckIcon,
  "Arrow Right": ArrowRightIcon,
  Trash: Trash2Icon,
};

const meta: Meta<typeof Button> = {
  title: "Components/Inputs & Controls/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `Versatile button component for user actions. Supports multiple variants, sizes, loading states, and full keyboard accessibility.

**Use it for** actions: submit, save, open, delete. Use a link for navigation.

- One \`default\` (primary) button per view. Pair it with \`secondary\` or \`outline\` for the other actions.
- Use \`destructive\` only for actions that remove something, and confirm them with an Alert Dialog.
- Use \`loading\` while an action runs; the button is disabled (not clickable) until it finishes, so it takes the same dimmed look as a disabled button, with the spinner shown.
- A disabled button keeps its colours and dims to 60% with a \`not-allowed\` cursor. Say why it is disabled when that is not obvious.
- Add an icon before the label with \`icon\`. The button sizes it (12px in sm, 16px in md and lg, 24px in the icon-only button), draws its stroke and hides it from assistive technology. While \`loading\` the spinner takes its place.
- An icon-only button (\`size="icon"\`) needs an \`aria-label\`.
- \`type\` defaults to \`"button"\`, so a button in a form does not submit it; set \`type="submit"\` on the one that should. \`loading\` also sets \`aria-busy\`.
- \`size="md"\` is the same as \`size="default"\`.

**Don't** use a button to move to another page, or stack several primary buttons side by side.`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "outline",
        "ghost",
        "link",
        "destructive",
      ],
      description: "The visual style variant of the button",
      table: {
        type: {
          summary:
            '"default" | "secondary" | "outline" | "ghost" | "link" | "destructive"',
        },
        defaultValue: { summary: '"default"' },
        category: "Appearance",
      },
    },
    size: {
      control: "radio",
      options: ["default", "sm", "md", "lg", "icon"],
      description: "The size variant of the button",
      table: {
        type: { summary: '"default" | "sm" | "md" | "lg" | "icon"' },
        defaultValue: { summary: '"default"' },
        category: "Appearance",
      },
    },
    icon: {
      control: "select",
      options: Object.keys(ICONS),
      mapping: ICONS,
      description:
        "An icon before the label: a lucide-react icon or any component that renders an SVG. The button sizes it (12px in sm, 16px in md and lg, 24px in the icon-only button), draws its stroke and hides it from assistive technology; the spinner takes its place while loading. The control lists a short set of glyphs.",
      table: { type: { summary: "React.ElementType" }, category: "Content" },
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "State",
      },
    },
    loading: {
      control: "boolean",
      description: "Whether the button is in a loading state",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "State",
      },
    },
  },
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    disabled: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // an icon-only button has no label: give it a glyph and a name when none is chosen
  render: ({ children, ...args }) =>
    args.size === "icon" ? (
      <Button icon={HeartIcon} aria-label="Favourite" {...args}>
        {null}
      </Button>
    ) : (
      <Button {...args}>{children}</Button>
    ),
  parameters: {
    docs: {
      description: {
        story: "Basic button usage with default variant and size.",
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "All available button variants for different use cases and visual hierarchy.",
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" icon={HeartIcon} aria-label="Favourite" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Size variants for different interface densities and use cases.",
      },
    },
  },
};

export const WithIcon: Story = {
  args: { children: "Button", icon: "Plus" as unknown as React.ElementType },
  parameters: {
    docs: {
      description: {
        story:
          "An icon before the label with the `icon` prop, driven by the variant, size and icon controls. The Figma comparison renders the library's Show Icon state from this story.",
      },
    },
  },
};

export const IconOnly: Story = {
  args: {
    size: "icon",
    icon: "Heart" as unknown as React.ElementType,
    "aria-label": "Favourite",
    children: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`size="icon"` is a square button with a 24px icon that draws the md stroke. It has no label, so it needs an `aria-label`.',
      },
    },
  },
};

export const IconSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm" icon={PlusIcon}>
        Small
      </Button>
      <Button size="md" icon={PlusIcon}>
        Medium
      </Button>
      <Button size="lg" icon={PlusIcon}>
        Large
      </Button>
      <Button size="icon" icon={PlusIcon} aria-label="Add" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The icon is 12px in sm, 16px in md and lg beside a label, and 24px in the icon-only button; each size has its own glyph token (`button.icon-size.*`, `button.icon-only.icon-size`).",
      },
    },
  },
};

export const AsLink: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <a href="#docs" className={buttonVariants()}>
        Read the docs
      </a>
      <a href="#docs" className={buttonVariants({ variant: "outline" })}>
        Changelog
      </a>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Button always renders a `<button>`. To move to another page, put `buttonVariants` on a real link so you keep link semantics and the same look. Icons inside it are sized by the same rules.",
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button>Normal</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex gap-4">
        <Button variant="secondary">Normal Secondary</Button>
        <Button variant="secondary" disabled>
          Disabled Secondary
        </Button>
      </div>
      <div className="flex gap-4">
        <Button variant="ghost">Normal Ghost</Button>
        <Button variant="ghost" disabled>
          Disabled Ghost
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates normal and disabled states across different button variants.",
      },
    },
  },
};

export const ButtonGroup: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-current/70">Action Group</h4>
        <div className="flex gap-2">
          <Button>Save</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-current/70">
          Navigation Group
        </h4>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            Previous
          </Button>
          <Button size="sm">Next</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-current/70">Toolbar</h4>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            Edit
          </Button>
          <Button variant="ghost" size="sm">
            Copy
          </Button>
          <Button variant="ghost" size="sm">
            Delete
          </Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Common button grouping patterns for actions, navigation, and toolbars.",
      },
    },
  },
};

export const ButtonsInForms: Story = {
  args: {
    size: "default",
  },

  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-input">Email Address</Label>
        <Input id="email-input" type="email" placeholder="your@email.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password-input">Password</Label>
        <Input id="password-input" type="password" placeholder="••••••••" />
      </div>

      <div className="flex flex-col gap-2">
        <Button className="w-full">Sign In</Button>
        <Button variant="ghost" className="w-full">
          Create Account
        </Button>
      </div>

      <div className="text-center">
        <Button variant="ghost" size="sm">
          Forgot Password?
        </Button>
      </div>
    </div>
  ),

  parameters: {
    docs: {
      description: {
        story:
          "Example of buttons used in a form context with different layouts and visual hierarchy.",
      },
    },
  },
};

export const Loading: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button loading>Loading...</Button>
      <Button variant="secondary" loading>
        Processing...
      </Button>
      <Button icon={PlusIcon} loading>
        Adding...
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Loading state with spinner, auto-disabled to prevent multiple submissions and marked `aria-busy`. The spinner takes the icon's place when there is one.",
      },
    },
  },
};

export const WithInteractions: Story = {
  args: {
    children: "Click to Test",
    variant: "default",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the button using accessible query
    const button = canvas.getByRole("button", { name: /click to test/i });

    // Verify button exists
    expect(button).toBeInTheDocument();

    // Simulate user clicking the button
    await userEvent.click(button);

    // Verify button receives focus after click
    expect(button).toHaveFocus();

    // Test keyboard interaction - Space key
    await userEvent.keyboard(" ");

    // Button should still have focus
    expect(button).toHaveFocus();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example of using play functions for automated interaction testing. This story demonstrates clicking and keyboard navigation. View the Interactions panel below to see the test execution.",
      },
    },
  },
};
