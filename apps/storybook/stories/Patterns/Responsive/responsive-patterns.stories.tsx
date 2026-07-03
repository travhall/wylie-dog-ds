import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { CardGrid } from "@wyliedog/ui/card-grid";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Label } from "@wyliedog/ui/label";

const meta: Meta = {
  title: "Patterns/Responsive",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Responsive layout patterns demonstrating how components adapt across mobile, tablet, and desktop viewports. Use the viewport toolbar to test at different screen sizes.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// STORY 1: ResponsiveCardGrid — mobile single column
// ============================================================================

export const ResponsiveCardGrid: Story = {
  parameters: {
    viewport: { value: "iphone14" },
    docs: {
      description: {
        story:
          "CardGrid at mobile viewport — single column layout. Cards stack vertically for narrow screens.",
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Product Catalog</h2>
        <p className="text-sm text-gray-500">
          Viewing on mobile — cards stack in a single column.
        </p>
      </div>
      <CardGrid columns={{ sm: 1, md: 2, lg: 3 }}>
        {["Starter Plan", "Pro Plan", "Enterprise Plan"].map((name) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="text-base">{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">
                Everything you need to get started with {name.toLowerCase()}.
              </p>
              <Button size="sm" className="w-full">
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </CardGrid>
    </div>
  ),
};

// ============================================================================
// STORY 2: ResponsiveCardGridDesktop — 3-column desktop view
// ============================================================================

export const ResponsiveCardGridDesktop: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "CardGrid at desktop viewport — three-column layout. Cards spread across the wider viewport.",
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Product Catalog</h2>
        <p className="text-sm text-gray-500">
          Viewing on desktop — cards display in three columns.
        </p>
      </div>
      <CardGrid columns={{ sm: 1, md: 2, lg: 3 }}>
        {["Starter Plan", "Pro Plan", "Enterprise Plan"].map((name) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="text-base">{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">
                Everything you need to get started with {name.toLowerCase()}.
              </p>
              <Button size="sm" className="w-full">
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </CardGrid>
    </div>
  ),
};

// ============================================================================
// STORY 3: ResponsiveNavigation — mobile compact header
// ============================================================================

export const ResponsiveNavigation: Story = {
  parameters: {
    viewport: { value: "iphone14" },
    docs: {
      description: {
        story:
          "Navigation pattern at mobile viewport — items collapse and badges remain visible for status.",
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
        <span className="font-semibold text-gray-900">Wylie Dog DS</span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">v2.0</Badge>
          <Button variant="ghost" size="sm">
            Menu
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">
            On mobile, navigation items collapse into a hamburger-style menu.
            The logo and key badges remain visible.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};

// ============================================================================
// STORY 4: ResponsiveForm — tablet view
// ============================================================================

export const ResponsiveForm: Story = {
  parameters: {
    viewport: { value: "ipad" },
    docs: {
      description: {
        story:
          "Form layout at tablet viewport — fields transition from stacked (mobile) to a two-column grid.",
      },
    },
  },
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold mb-1">Contact Form</h2>
        <p className="text-sm text-gray-500">
          At tablet width, form fields can use a two-column layout.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "First Name", placeholder: "Jane" },
              { label: "Last Name", placeholder: "Doe" },
              { label: "Email", placeholder: "jane@example.com" },
              { label: "Phone", placeholder: "+1 555 000 0000" },
            ].map((field) => (
              <div key={field.label} className="space-y-1">
                <Label>{field.label}</Label>
                <div className="h-9 rounded border border-gray-200 bg-white px-3 flex items-center">
                  <span className="text-sm text-gray-400">
                    {field.placeholder}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="outline">Cancel</Button>
            <Button>Submit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};
