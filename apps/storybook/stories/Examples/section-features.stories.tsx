import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionFeatures } from "@wyliedog/ui/compositions/section-features";

const meta: Meta<typeof SectionFeatures> = {
  title: "Examples/Page Compositions/Features Section",
  component: SectionFeatures,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Real-world features section composition for showcasing product features and benefits. This Tier 2 pattern component displays features in a grid layout with optional badges, supporting multiple column configurations and style variants.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "cards"],
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
    title: "Features Section",
    description: "Discover what makes our platform exceptional",
    features: [
      {
        title: "Lightning Fast",
        description:
          "Built for speed and performance with optimized loading times",
        badge: "Popular",
      },
      {
        title: "Secure by Default",
        description: "Enterprise-grade security with built-in protection",
        badge: "New",
      },
      {
        title: "Easy Integration",
        description:
          "Seamlessly integrate with your existing tools and workflows",
      },
    ],
    columns: 3,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Variant</h3>
        <SectionFeatures
          title="Default Style"
          description="Clean and minimal feature presentation"
          features={[
            {
              title: "Feature One",
              description: "Description for the first feature",
            },
            {
              title: "Feature Two",
              description: "Description for the second feature",
            },
          ]}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Cards Variant</h3>
        <SectionFeatures
          variant="cards"
          title="Cards Style"
          description="Feature cards with enhanced visual hierarchy"
          features={[
            {
              title: "Card Feature One",
              description: "Description for card feature one",
              badge: "Pro",
            },
            {
              title: "Card Feature Two",
              description: "Description for card feature two",
              badge: "Beta",
            },
          ]}
        />
      </div>
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
      <SectionFeatures
        title="Interactive Demo"
        description="Explore our comprehensive feature set"
        features={[
          {
            title: "Real-time Collaboration",
            description: "Work together seamlessly with your team in real-time",
            badge: "Featured",
          },
          {
            title: "Advanced Analytics",
            description:
              "Get detailed insights and analytics to optimize your workflow",
            badge: "Premium",
          },
          {
            title: "Custom Workflows",
            description: "Tailor the platform to match your specific needs",
          },
          {
            title: "24/7 Support",
            description: "Get help whenever you need it from our expert team",
            badge: "Available",
          },
        ]}
        columns={2}
      />
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
