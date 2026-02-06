import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "@wyliedog/ui/separator";

const meta: Meta<typeof Separator> = {
  title: "Components/Layout & Structure/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Visual divider for separating content sections. Built on Radix UI with proper ARIA role handling for decorative and semantic separators.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "The orientation of the separator",
      table: {
        type: { summary: '"horizontal" | "vertical"' },
        defaultValue: { summary: '"horizontal"' },
        category: "Appearance",
      },
    },
    decorative: {
      control: "boolean",
      description:
        "Whether the separator is purely decorative (hides from screen readers)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "State",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Horizontal separator dividing a heading from inline navigation links.",
      },
    },
  },
  render: (args) => (
    <div className="w-64">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator {...args} className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  parameters: {
    docs: {
      description: {
        story: "Vertical separator between inline text elements.",
      },
    },
  },
  render: (args) => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>Blog</div>
      <Separator {...args} />
      <div>Docs</div>
      <Separator {...args} />
      <div>Source</div>
    </div>
  ),
};

export const InContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Separators dividing stacked content sections with headings and descriptions.",
      },
    },
  },
  render: () => (
    <div className="max-w-md space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Navigation</h3>
        <p className="text-sm text-(--color-text-secondary)">
          Primary navigation items for the application.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">Settings</h3>
        <p className="text-sm text-(--color-text-secondary)">
          Configuration options and preferences.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">Account</h3>
        <p className="text-sm text-(--color-text-secondary)">
          User account management and profile settings.
        </p>
      </div>
    </div>
  ),
};

export const InLists: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Separators grouping related items in a sidebar-style menu list.",
      },
    },
  },
  render: () => (
    <div className="w-64 space-y-1">
      <div className="px-3 py-2 text-sm hover:bg-(--color-background-secondary) rounded">
        Profile
      </div>
      <div className="px-3 py-2 text-sm hover:bg-(--color-background-secondary) rounded">
        Settings
      </div>
      <Separator className="my-1" />
      <div className="px-3 py-2 text-sm hover:bg-(--color-background-secondary) rounded">
        Team
      </div>
      <div className="px-3 py-2 text-sm hover:bg-(--color-background-secondary) rounded">
        Billing
      </div>
      <Separator className="my-1" />
      <div className="px-3 py-2 text-sm hover:bg-(--color-background-secondary) rounded">
        Logout
      </div>
    </div>
  ),
};
