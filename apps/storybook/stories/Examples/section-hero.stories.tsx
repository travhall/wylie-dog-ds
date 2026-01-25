import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionHero } from "@wyliedog/ui/compositions/section-hero";
import { Code2, Sparkles } from "lucide-react";

const meta: Meta<typeof SectionHero> = {
  title: "Examples/Page Compositions/Hero Section",
  component: SectionHero,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Real-world hero section composition for landing pages with title, description, action buttons, and optional images. Supports multiple layouts (default, gradient, centered) and image positioning for flexible page designs.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "gradient", "centered"],
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
    title: "Build Amazing Products",
    description:
      "The complete design system for modern web applications. Built with React, TypeScript, and Tailwind CSS.",
    primaryAction: {
      label: "Get Started",
      href: "#get-started",
    },
    secondaryAction: {
      label: "View Components",
      href: "#components",
    },
  },
};

export const WithBadge: Story = {
  args: {
    badge: "New Release",
    title: "Introducing v2.0",
    description:
      "Packed with new features, improved performance, and better developer experience. Upgrade today and see the difference.",
    primaryAction: {
      label: "Upgrade Now",
      href: "#upgrade",
    },
    secondaryAction: {
      label: "Read Release Notes",
      href: "#release-notes",
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Hero with a badge to highlight important information.",
      },
    },
  },
};

export const WithImage: Story = {
  args: {
    variant: "default",
    badge: "Production Ready",
    title: "Design System Excellence",
    description:
      "42 components with OKLCH color science and design tokens. Built for production with comprehensive testing and documentation.",
    primaryAction: {
      label: "View Components",
      href: "#components",
    },
    secondaryAction: {
      label: "Read Docs",
      href: "#docs",
    },
    image: (
      <div className="aspect-square rounded-lg bg-linear-to-br from-primary via-secondary to-accent p-8 flex items-center justify-center">
        <div className="text-white text-center">
          <Code2 className="h-24 w-24 mx-auto mb-4" />
          <p className="text-2xl font-bold">42 Components</p>
        </div>
      </div>
    ),
    imagePosition: "right",
  },
  parameters: {
    docs: {
      description: {
        story: "Hero with image positioned to the right of the content.",
      },
    },
  },
};

export const ImageLeft: Story = {
  args: {
    title: "Developer-First Design",
    description:
      "Full TypeScript support, comprehensive documentation, and interactive Storybook examples for every component.",
    primaryAction: {
      label: "Explore Docs",
      href: "#docs",
    },
    image: (
      <div className="aspect-square rounded-lg bg-linear-to-br from-accent via-primary to-secondary p-8 flex items-center justify-center">
        <div className="text-white text-center">
          <Sparkles className="h-24 w-24 mx-auto mb-4" />
          <p className="text-2xl font-bold">Developer DX</p>
        </div>
      </div>
    ),
    imagePosition: "left",
  },
  parameters: {
    docs: {
      description: {
        story: "Hero with image positioned to the left of the content.",
      },
    },
  },
};

export const Gradient: Story = {
  args: {
    variant: "gradient",
    badge: "OKLCH Colors",
    title: "Next-Generation Color Science",
    description:
      "Perceptually uniform colors with P3 gamut support. 30% more colors than traditional sRGB systems.",
    primaryAction: {
      label: "Learn More",
      href: "#colors",
    },
    secondaryAction: {
      label: "View Examples",
      href: "#examples",
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Hero with gradient background for visual impact.",
      },
    },
  },
};

export const Centered: Story = {
  args: {
    variant: "centered",
    title: "Simple. Powerful. Beautiful.",
    description:
      "Everything you need to build modern web applications. Start building today with our production-ready components.",
    primaryAction: {
      label: "Get Started Free",
      href: "#start",
    },
    secondaryAction: {
      label: "Schedule Demo",
      href: "#demo",
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Centered hero layout for maximum impact.",
      },
    },
  },
};

export const CenteredWithImage: Story = {
  args: {
    variant: "centered",
    badge: "Trusted by 10,000+ developers",
    title: "The Complete Design System",
    description:
      "Build beautiful, accessible, and performant applications with confidence. Join thousands of developers building with Wylie Dog.",
    primaryAction: {
      label: "Start Building",
      href: "#start",
    },
    image: (
      <div className="w-full h-64 rounded-lg bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center border border-border">
        <p className="text-xl font-semibold text-muted-foreground">
          Product Screenshot
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Centered hero with image below content.",
      },
    },
  },
};
