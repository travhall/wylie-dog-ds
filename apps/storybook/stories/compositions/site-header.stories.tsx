import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteHeader } from "@wyliedog/ui/compositions/site-header";

const meta: Meta<typeof SiteHeader> = {
  title: "4. Patterns/SiteHeader",
  component: SiteHeader,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Site Header composition pattern combining multiple primitives. This is a Tier 2 pattern component.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual style variant",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Site Header content",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <SiteHeader>Default</SiteHeader>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available variants for different use cases.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => (
    <div className="space-y-4">
      <SiteHeader>
        Interactive example - customize this story to demonstrate real-world
        usage
      </SiteHeader>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Interactive example demonstrating common usage patterns.",
      },
    },
  },
};
