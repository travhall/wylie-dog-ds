import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageLayout } from "@wyliedog/ui/compositions/page-layout";
import { SiteHeader } from "@wyliedog/ui/compositions/site-header";
import { SiteFooter } from "@wyliedog/ui/compositions/site-footer";
import { Heart } from "lucide-react";
import { Button } from "@wyliedog/ui/button";

const meta: Meta<typeof PageLayout> = {
  title: "Patterns/Page Compositions/Page Layout",
  component: PageLayout,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Full-page layout composition combining header, footer, sidebar, and main content area. Supports multiple width variants and optional sidebar positioning for building complete page structures.",
      },
    },
    // Override global a11y config here if needed, e.g. to disable a rule or set a specific ARIA config.
    // a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "full-width", "centered"],
      description: "Controls the main content area width",
      table: {
        type: { summary: '"default" | "full-width" | "centered"' },
        defaultValue: { summary: "default" },
      },
    },
    header: {
      control: false,
      description: "Header content rendered at the top of the page",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    footer: {
      control: false,
      description: "Footer content rendered at the bottom of the page",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    sidebar: {
      control: false,
      description: "Sidebar content, visible on large screens",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    sidebarPosition: {
      control: "select",
      options: ["left", "right"],
      description: "Which side the sidebar appears on",
      table: {
        type: { summary: '"left" | "right"' },
        defaultValue: { summary: "left" },
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

const sampleHeader = (
  <SiteHeader
    logo={
      <a href="/" className="flex items-center space-x-2">
        <Heart className="h-6 w-6 text-(--color-interactive-primary)" />
        <span className="text-xl font-bold">Wylie Dog</span>
      </a>
    }
    navigation={[
      { label: "Components", href: "#" },
      { label: "Docs", href: "#" },
      { label: "Examples", href: "#" },
    ]}
  />
);

const sampleFooter = (
  <SiteFooter
    variant="minimal"
    logo={
      <div className="flex items-center space-x-2">
        <Heart className="h-5 w-5 text-(--color-interactive-primary)" />
        <span className="font-bold">Wylie Dog</span>
      </div>
    }
    copyright={`\u00A9 ${new Date().getFullYear()} Wylie Dog.`}
  />
);

const sampleSidebar = (
  <nav className="space-y-1 p-4">
    <h3 className="mb-3 text-sm font-semibold text-(--color-text-tertiary)">
      Navigation
    </h3>
    {["Dashboard", "Settings", "Profile", "Notifications", "Help"].map(
      (item) => (
        <Button
          key={item}
          variant="ghost"
          className="w-full justify-start"
          onClick={(e) => e.preventDefault()}
        >
          {item}
        </Button>
      )
    )}
  </nav>
);

const sampleContent = (
  <div className="space-y-6 py-8">
    <div>
      <h1 className="text-3xl font-bold">Page Title</h1>
      <p className="mt-2 text-(--color-text-tertiary)">
        This demonstrates a complete page layout with header, content, and
        footer.
      </p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border p-6">
          <h2 className="font-semibold">Card {i}</h2>
          <p className="mt-1 text-sm text-(--color-text-tertiary)">
            Sample content card for layout demonstration.
          </p>
        </div>
      ))}
    </div>
  </div>
);

export const Default: Story = {
  args: {
    header: sampleHeader,
    footer: sampleFooter,
    children: sampleContent,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Standard page layout with header, main content area, and footer.",
      },
    },
  },
};

export const WithSidebar: Story = {
  args: {
    header: sampleHeader,
    footer: sampleFooter,
    sidebar: sampleSidebar,
    sidebarPosition: "left",
    children: sampleContent,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Page layout with a left sidebar for navigation. Sidebar is visible on large screens only.",
      },
    },
  },
};

export const RightSidebar: Story = {
  args: {
    header: sampleHeader,
    footer: sampleFooter,
    sidebar: sampleSidebar,
    sidebarPosition: "right",
    children: sampleContent,
  },
  parameters: {
    docs: {
      description: {
        story: "Page layout with the sidebar positioned on the right side.",
      },
    },
  },
};
