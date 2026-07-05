import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeatureGrid } from "@wyliedog/ui/feature-grid";
import { Rocket, Palette, ShieldCheck, Settings } from "lucide-react";

const meta: Meta<typeof FeatureGrid> = {
  title: "Components/Layout & Structure/Feature Grid",
  component: FeatureGrid,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Renders a responsive grid of feature items, each with an icon, title, description, and optional badge. Built for marketing and landing-page feature sections.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    features: {
      control: "object",
      description:
        "Array of `FeatureItem` objects: `{ icon, title, description, badge?, badgeVariant? }`.",
      table: {
        type: {
          summary: "FeatureItem[]",
        },
        defaultValue: { summary: "[]" },
        category: "Content",
      },
    },
    columns: {
      control: "object",
      description:
        "Responsive column configuration per breakpoint, e.g. `{ sm: 1, md: 2, lg: 3, xl: 4 }`.",
      table: {
        type: {
          summary: "{ sm?: number; md?: number; lg?: number; xl?: number }",
        },
        defaultValue: { summary: "{ sm: 1, md: 2, lg: 3, xl: 4 }" },
        category: "Layout",
      },
    },
    gap: {
      control: "text",
      description: "Gap utility class applied between grid items.",
      table: {
        type: { summary: "string" },
        defaultValue: {
          summary: "gap-(--space-feature-grid-container-gap)",
        },
        category: "Layout",
      },
    },
    centered: {
      control: "boolean",
      description: "Centers grid items within their cell when true.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Layout",
      },
    },
    variant: {
      control: "select",
      options: ["default", "compact", "spacious"],
      description:
        "Visual style variant controlling spacing between feature items.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
        category: "Appearance",
      },
    },
    className: {
      control: "text",
      description: "Additional CSS classes for custom styling.",
      table: {
        type: { summary: "string" },
        category: "Styling",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default four-item feature grid with icons, badges, and descriptive copy.",
      },
    },
  },
  render: () => (
    <FeatureGrid
      aria-label="Product features"
      columns={{ sm: 1, md: 2, lg: 4 }}
      features={[
        {
          icon: (
            <Rocket className="h-5 w-5 text-(--color-interactive-primary)" />
          ),
          title: "Fast Performance",
          description:
            "Lightning-fast load times and smooth interactions for the best user experience.",
          badge: "Popular",
          badgeVariant: "default",
        },
        {
          icon: (
            <Palette className="h-5 w-5 text-(--color-interactive-primary)" />
          ),
          title: "Beautiful Design",
          description:
            "A modern, clean interface that adapts perfectly to any screen size.",
          badge: "New",
          badgeVariant: "success",
        },
        {
          icon: (
            <ShieldCheck className="h-5 w-5 text-(--color-interactive-primary)" />
          ),
          title: "Secure & Reliable",
          description:
            "Enterprise-grade security with a 99.9% uptime guarantee.",
        },
        {
          icon: (
            <Settings className="h-5 w-5 text-(--color-interactive-primary)" />
          ),
          title: "Easy to Customize",
          description:
            "Flexible configuration options to match your specific needs.",
          badge: "Flexible",
          badgeVariant: "secondary",
        },
      ]}
    />
  ),
};

export const CompactTwoColumn: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Compact variant with a smaller two-item, two-column layout and tighter spacing.",
      },
    },
  },
  render: () => (
    <FeatureGrid
      aria-label="Compact feature highlights"
      variant="compact"
      columns={{ sm: 1, md: 2 }}
      features={[
        {
          icon: (
            <Rocket className="h-5 w-5 text-(--color-interactive-primary)" />
          ),
          title: "Quick Setup",
          description: "Get started in minutes with sensible defaults.",
        },
        {
          icon: (
            <ShieldCheck className="h-5 w-5 text-(--color-interactive-primary)" />
          ),
          title: "Built-in Safety",
          description: "Validation and error handling included out of the box.",
        },
      ]}
    />
  ),
};
