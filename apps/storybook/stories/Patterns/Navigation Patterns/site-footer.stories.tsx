import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteFooter } from "@wyliedog/ui/compositions/site-footer";
import { Heart, Github, Twitter } from "lucide-react";

const meta: Meta<typeof SiteFooter> = {
  title: "Patterns/Navigation Patterns/Site Footer",
  component: SiteFooter,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Real-world site footer composition for page footers with logo, navigation columns, social links, and copyright. Supports default and minimal variants with responsive grid layout.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "minimal"],
      description: "The visual style variant",
      table: {
        type: { summary: '"default" | "minimal"' },
        defaultValue: { summary: "default" },
      },
    },
    logo: {
      control: false,
      description: "Custom logo element displayed in the footer",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    columns: {
      control: false,
      description: "Footer navigation columns with titles and links",
      table: {
        type: { summary: "FooterColumn[]" },
      },
    },
    copyright: {
      control: "text",
      description:
        "Custom copyright text. Defaults to the current year if omitted.",
      table: {
        type: { summary: "string" },
      },
    },
    socialLinks: {
      control: false,
      description: "Social media links with optional icons",
      table: {
        type: {
          summary:
            "Array<{ label: string; href: string; icon?: React.ReactNode }>",
        },
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

const defaultColumns = [
  {
    title: "Product",
    links: [
      { label: "Components", href: "#components" },
      { label: "Documentation", href: "#docs" },
      { label: "Examples", href: "#examples" },
      { label: "Changelog", href: "#changelog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Getting Started", href: "#getting-started" },
      { label: "Design Tokens", href: "#tokens" },
      { label: "Accessibility", href: "#a11y" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: "#github" },
      { label: "Discussions", href: "#discussions" },
      { label: "Contributing", href: "#contributing" },
    ],
  },
];

const defaultSocialLinks = [
  {
    label: "GitHub",
    href: "#github",
    icon: <Github className="h-5 w-5" />,
  },
  {
    label: "Twitter",
    href: "#twitter",
    icon: <Twitter className="h-5 w-5" />,
  },
];

const defaultLogo = (
  <div className="flex items-center space-x-2">
    <Heart className="h-6 w-6 text-primary" />
    <span className="text-xl font-bold">Wylie Dog</span>
  </div>
);

export const Default: Story = {
  args: {
    logo: defaultLogo,
    columns: defaultColumns,
    socialLinks: defaultSocialLinks,
    copyright: `\u00A9 ${new Date().getFullYear()} Wylie Dog. All rights reserved.`,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Full footer with logo, navigation columns, social links, and copyright.",
      },
    },
  },
};

export const Minimal: Story = {
  args: {
    variant: "minimal",
    logo: defaultLogo,
    copyright: `\u00A9 ${new Date().getFullYear()} Wylie Dog.`,
    socialLinks: defaultSocialLinks,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Minimal variant without navigation columns, suitable for simpler pages.",
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground">
          Default Variant
        </h3>
        <SiteFooter
          logo={defaultLogo}
          columns={defaultColumns}
          socialLinks={defaultSocialLinks}
          copyright={`\u00A9 ${new Date().getFullYear()} Wylie Dog. All rights reserved.`}
        />
      </div>
      <div>
        <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground">
          Minimal Variant
        </h3>
        <SiteFooter
          variant="minimal"
          logo={defaultLogo}
          copyright={`\u00A9 ${new Date().getFullYear()} Wylie Dog.`}
          socialLinks={defaultSocialLinks}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Side-by-side comparison of default and minimal variants.",
      },
    },
  },
};

export const WithCustomContent: Story = {
  args: {
    logo: (
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold">Custom Brand</span>
      </div>
    ),
    columns: [
      {
        title: "Legal",
        links: [
          { label: "Privacy Policy", href: "#privacy" },
          { label: "Terms of Service", href: "#terms" },
          { label: "Cookie Policy", href: "#cookies" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Help Center", href: "#help" },
          { label: "Contact Us", href: "#contact" },
          { label: "Status", href: "#status" },
        ],
      },
    ],
    copyright: `\u00A9 ${new Date().getFullYear()} Custom Brand Inc.`,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Footer with custom branding, fewer columns, and no social links.",
      },
    },
  },
};
