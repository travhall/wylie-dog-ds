import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionHero } from "@wyliedog/ui/compositions/section-hero";

const meta: Meta<typeof SectionHero> = {
  title: "4. Patterns/SectionHero",
  component: SectionHero,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Section Hero composition pattern combining multiple primitives. This is a Tier 2 pattern component.",
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
    children: "Section Hero content",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <SectionHero>Default</SectionHero>
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
      <SectionHero>
        Interactive example - customize this story to demonstrate real-world
        usage
      </SectionHero>
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
