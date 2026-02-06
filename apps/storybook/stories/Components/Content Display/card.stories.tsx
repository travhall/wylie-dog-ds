import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Button } from "@wyliedog/ui/button";
import { Badge } from "@wyliedog/ui/badge";

const meta: Meta<typeof Card> = {
  title: "Components/Content Display/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Flexible container component for grouping related content. Composed of Card, CardHeader, CardTitle, CardDescription, CardContent, and CardFooter.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes for custom styling",
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
        story: "Basic card with a title and content text.",
      },
    },
  },
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Basic Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-(--color-text-secondary)">
          This is a basic card with a title and some content text.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Card with action buttons and a status badge for interactive content.",
      },
    },
  },
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Project Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-(--color-text-secondary)">
          Track the progress of your current project with this status card.
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">In Progress</Badge>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              View
            </Button>
            <Button size="sm">Edit</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const ProductCard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Product pricing card with features list, badge, and call-to-action button.",
      },
    },
  },
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Premium Plan</CardTitle>
            <p className="text-sm text-(--color-text-secondary) mt-1">
              For growing teams
            </p>
          </div>
          <Badge>Popular</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold">
          $29
          <span className="text-lg text-(--color-text-secondary)">/month</span>
        </div>
        <ul className="space-y-2 text-sm text-(--color-text-secondary)">
          <li>✓ Up to 10 team members</li>
          <li>✓ Advanced analytics</li>
          <li>✓ Priority support</li>
          <li>✓ Custom integrations</li>
        </ul>
        <Button className="w-full">Get Started</Button>
      </CardContent>
    </Card>
  ),
};

export const CardVariations: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Cards with different styling variations including custom borders, shadows, and backgrounds.",
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Simple Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-(--color-text-secondary)">
            A simple card with minimal content.
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary-200">
        <CardHeader>
          <CardTitle className="text-primary-700">Highlighted Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-(--color-text-secondary)">
            A card with custom border color for emphasis.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-(--color-text-secondary)">
            A card with increased shadow for more prominence.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-(--color-background-secondary)">
        <CardHeader>
          <CardTitle>Subtle Background</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-(--color-text-secondary)">
            A card with a subtle background color variation.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};
