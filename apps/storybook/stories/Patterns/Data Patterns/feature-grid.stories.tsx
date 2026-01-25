import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeatureGrid } from "@wyliedog/ui/feature-grid";

const meta: Meta<typeof FeatureGrid> = {
  title: "Patterns/Data Patterns/Feature Grid",
  component: FeatureGrid,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Feature Grid component for displaying a grid of features with icons, titles, and descriptions.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "spacious"],
      description: "The visual style variant",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
      },
    },
    features: {
      control: "object",
      description: "Array of feature items to display",
    },
    columns: {
      control: "object",
      description: "Responsive column configuration",
    },
    gap: {
      control: "text",
      description: "Gap between grid items",
    },
    centered: {
      control: "boolean",
      description: "Whether to center grid items",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    features: [
      {
        icon: "🚀",
        title: "Fast Performance",
        description:
          "Lightning-fast load times and smooth interactions for the best user experience.",
        badge: "Popular",
        badgeVariant: "default" as const,
      },
      {
        icon: "🎨",
        title: "Beautiful Design",
        description:
          "Modern, clean interface that adapts perfectly to any screen size.",
        badge: "New",
        badgeVariant: "success" as const,
      },
      {
        icon: "🔒",
        title: "Secure & Reliable",
        description: "Enterprise-grade security with 99.9% uptime guarantee.",
      },
      {
        icon: "⚙️",
        title: "Easy to Customize",
        description:
          "Flexible configuration options to match your specific needs.",
        badge: "Flexible",
        badgeVariant: "secondary" as const,
      },
    ],
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    gap: "gap-8",
    centered: false,
    variant: "default",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Variant</h3>
        <FeatureGrid
          features={[
            {
              icon: "🌟",
              title: "Feature One",
              description: "Description for feature one with default styling.",
            },
            {
              icon: "🎯",
              title: "Feature Two",
              description: "Description for feature two with default styling.",
            },
          ]}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Compact Variant</h3>
        <FeatureGrid
          variant="compact"
          features={[
            {
              icon: "💡",
              title: "Compact Feature",
              description: "Tighter spacing for more content density.",
            },
            {
              icon: "📱",
              title: "Mobile Optimized",
              description: "Perfect for mobile-first designs.",
            },
          ]}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Spacious Variant</h3>
        <FeatureGrid
          variant="spacious"
          features={[
            {
              icon: "🎨",
              title: "Spacious Design",
              description: "More breathing room for elegant presentations.",
            },
            {
              icon: "✨",
              title: "Premium Feel",
              description: "Luxurious spacing for high-end applications.",
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
    <div className="space-y-8">
      <FeatureGrid
        features={[
          {
            icon: "🚀",
            title: "Interactive Demo",
            description:
              "Hover over these cards to see the smooth animations and effects in action.",
            badge: "Interactive",
            badgeVariant: "default" as const,
          },
          {
            icon: "🎯",
            title: "Responsive Grid",
            description:
              "The grid automatically adjusts columns based on screen size for optimal viewing.",
            badge: "Responsive",
            badgeVariant: "success" as const,
          },
          {
            icon: "⚙️",
            title: "Customizable",
            description:
              "Easily modify columns, gaps, and styling to match your design system.",
            badge: "Flexible",
            badgeVariant: "secondary" as const,
          },
          {
            icon: "🔒",
            title: "Type Safe",
            description:
              "Built with TypeScript for excellent developer experience and error prevention.",
            badge: "TypeScript",
            badgeVariant: "warning" as const,
          },
          {
            icon: "📱",
            title: "Mobile First",
            description:
              "Designed with mobile devices in mind, scaling up beautifully to desktop.",
          },
          {
            icon: "✨",
            title: "Accessible",
            description:
              "Built with accessibility best practices to ensure usability for all users.",
            badge: "A11y",
            badgeVariant: "default",
          },
        ]}
        columns={{ sm: 1, md: 2, lg: 3 }}
        centered={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Interactive example demonstrating common usage patterns with hover effects and responsive behavior.",
      },
    },
  },
};
