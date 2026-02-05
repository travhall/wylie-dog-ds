import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";

const meta: Meta<typeof Button> = {
  title: "Components/Inputs & Controls/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Versatile button component for user actions. Supports multiple variants, sizes, loading states, and full keyboard accessibility.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "primary",
        "secondary",
        "outline",
        "ghost",
        "link",
        "destructive",
      ],
      description: "The visual style variant of the button",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
      },
    },
    size: {
      control: "radio",
      options: ["default", "sm", "md", "lg", "icon"],
      description: "The size variant of the button",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    loading: {
      control: "boolean",
      description: "Whether the button is in a loading state",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Primary Button",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline Button",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="primary">Primary</Button>
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
        <h4 className="text-sm font-medium text-(--color-text-secondary)">
          Action Group
        </h4>
        <div className="flex gap-2">
          <Button>Save</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-(--color-text-secondary)">
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
        <h4 className="text-sm font-medium text-(--color-text-secondary)">
          Toolbar
        </h4>
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
      <Button disabled>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-(--color-button-primary-text) border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </span>
      </Button>
      <Button variant="secondary" disabled>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-(--color-button-secondary-text) border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </span>
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Loading state pattern with spinner and disabled state to prevent multiple submissions.",
      },
    },
  },
};

export const WithPlayFunction: Story = {
  args: {
    children: "Click to Test",
    variant: "primary",
  },
  play: async ({ canvasElement, args }) => {
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
