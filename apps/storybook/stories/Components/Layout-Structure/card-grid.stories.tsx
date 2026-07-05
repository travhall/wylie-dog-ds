import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardGrid } from "@wyliedog/ui/card-grid";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";

const meta: Meta<typeof CardGrid> = {
  title: "Components/Layout & Structure/Card Grid",
  component: CardGrid,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Responsive grid container for laying out Card components. Supports per-breakpoint column counts, gap, centering, and visual variants (default, compact, spacious, masonry, elevated).",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
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
          summary: "gap-(--space-card-grid-gap-horizontal)",
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
      options: ["default", "compact", "spacious", "masonry", "elevated"],
      description:
        "Visual style variant controlling spacing and layout behavior.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
        category: "Appearance",
      },
    },
    interactive: {
      control: "boolean",
      description:
        "Enables hover scale/translate transitions on direct children.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Behavior",
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
        story: "Default three-card grid with the default column configuration.",
      },
    },
  },
  render: () => (
    <CardGrid aria-label="Project cards" columns={{ sm: 1, md: 2, lg: 3 }}>
      <Card>
        <CardHeader>
          <CardTitle>Design System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-(--color-text-tertiary)">
            Shared tokens and components used across every product surface.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Mobile App</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-(--color-text-tertiary)">
            Cross-platform release currently in active development.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Marketing Site</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-(--color-text-tertiary)">
            Public-facing site rebuilt on the latest component library.
          </p>
        </CardContent>
      </Card>
    </CardGrid>
  ),
};

export const CompactTwoColumn: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Compact variant with a two-column layout and a status badge on each card, useful for dense dashboards.",
      },
    },
  },
  render: () => (
    <CardGrid
      aria-label="Compact task cards"
      variant="compact"
      columns={{ sm: 1, md: 2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Billing Sync</CardTitle>
            <Badge variant="secondary">Queued</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-(--color-text-tertiary)">
            Nightly reconciliation job awaiting the next scheduled run.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Email Digest</CardTitle>
            <Badge variant="success">Complete</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-(--color-text-tertiary)">
            Weekly summary delivered to all subscribed team members.
          </p>
        </CardContent>
      </Card>
    </CardGrid>
  ),
};
