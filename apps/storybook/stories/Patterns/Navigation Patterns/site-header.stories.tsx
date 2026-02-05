import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteHeader } from "@wyliedog/ui/compositions/site-header";
import { Button } from "@wyliedog/ui/button";
import { Heart, Menu } from "lucide-react";

const meta: Meta<typeof SiteHeader> = {
  title: "Patterns/Navigation Patterns/Site Header",
  component: SiteHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Real-world site header composition with logo, navigation links, and action buttons. Production-ready with responsive design, sticky positioning, and backdrop blur. Supports default and transparent variants for different page contexts.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "transparent"],
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

const navigation = [
  { label: "Components", href: "#components" },
  { label: "Documentation", href: "#docs" },
  { label: "Examples", href: "#examples" },
  { label: "Pricing", href: "#pricing" },
];

export const Default: Story = {
  args: {
    logo: (
      <a href="/" className="flex items-center space-x-2">
        <Heart className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Wylie Dog</span>
      </a>
    ),
    navigation: navigation,
  },
  render: (args) => (
    <div className="h-100 bg-muted/30">
      <SiteHeader {...args} />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold">Page Content Below Header</h1>
        <p className="mt-4 text-muted-foreground">
          The header is sticky and will stay at the top when scrolling.
        </p>
      </div>
    </div>
  ),
};

export const Transparent: Story = {
  args: {
    variant: "transparent",
    logo: (
      <a href="/" className="flex items-center space-x-2">
        <Heart className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Wylie Dog</span>
      </a>
    ),
    navigation: navigation,
  },
  render: (args) => (
    <div className="h-100 bg-linear-to-br from-primary/20 to-secondary/20">
      <SiteHeader {...args} />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold">
          Transparent Header Over Background
        </h1>
        <p className="mt-4 text-muted-foreground">
          Perfect for hero sections and landing pages.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Transparent variant for use over hero sections and backgrounds.",
      },
    },
  },
};

export const WithCustomActions: Story = {
  args: {
    logo: (
      <a href="/" className="flex items-center space-x-2">
        <Menu className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Custom Logo</span>
      </a>
    ),
    navigation: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "About", href: "#about" },
    ],
    actions: (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          Login
        </Button>
        <Button size="sm">Sign Up</Button>
      </div>
    ),
  },
  render: (args) => (
    <div className="h-100 bg-muted/30">
      <SiteHeader {...args} />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold">Custom Actions Example</h1>
        <p className="mt-4 text-muted-foreground">
          Customize the action buttons to match your brand and use case.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Customize the header actions with your own buttons and components.",
      },
    },
  },
};

export const MinimalNavigation: Story = {
  args: {
    logo: (
      <a href="/" className="flex items-center space-x-2">
        <Heart className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Minimal</span>
      </a>
    ),
    navigation: [
      { label: "Home", href: "#" },
      { label: "About", href: "#about" },
    ],
  },
  render: (args) => (
    <div className="h-75 bg-background">
      <SiteHeader {...args} />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold">Minimal Navigation</h1>
        <p className="mt-4 text-muted-foreground">
          Clean header with fewer navigation items.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Minimal header with just a few navigation links.",
      },
    },
  },
};
