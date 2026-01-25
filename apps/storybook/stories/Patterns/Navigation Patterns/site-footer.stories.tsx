import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteFooter } from "@wyliedog/ui/compositions/site-footer";

const meta: Meta<typeof SiteFooter> = {
  title: "Patterns/Navigation Patterns/Site Footer",
  component: SiteFooter,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Real-world site footer composition for page footers with links, copyright, and additional content. This Tier 2 pattern component provides a consistent footer layout across your application.",
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
    className: {
      control: "text",
      description: "Additional CSS classes for custom styling",
      table: {
        type: { summary: "string" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Site Footer content",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <SiteFooter>Default</SiteFooter>
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
      <SiteFooter>
        Interactive example - customize this story to demonstrate real-world
        usage
      </SiteFooter>
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
