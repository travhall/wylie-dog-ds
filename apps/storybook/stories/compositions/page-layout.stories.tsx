import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageLayout } from "@wyliedog/ui/compositions/page-layout";

const meta: Meta<typeof PageLayout> = {
  title: "4. Patterns/PageLayout",
  component: PageLayout,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Page Layout composition pattern combining multiple primitives. This is a Tier 2 pattern component.",
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
    children: "Page Layout content",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <PageLayout>Default</PageLayout>
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
      <PageLayout>
        Interactive example - customize this story to demonstrate real-world
        usage
      </PageLayout>
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
