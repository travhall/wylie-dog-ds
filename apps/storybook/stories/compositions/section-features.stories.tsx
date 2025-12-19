import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionFeatures } from "@wyliedog/ui/compositions/section-features";

const meta: Meta<typeof SectionFeatures> = {
  title: "4. Patterns/SectionFeatures",
  component: SectionFeatures,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Section Features composition pattern combining multiple primitives. This is a Tier 2 pattern component.",
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
    children: "Section Features content",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <SectionFeatures>Default</SectionFeatures>
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
      <SectionFeatures>
        Interactive example - customize this story to demonstrate real-world
        usage
      </SectionFeatures>
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
