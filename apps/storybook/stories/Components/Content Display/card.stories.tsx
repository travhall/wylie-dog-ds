import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@wyliedog/ui/card";
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
    interactive: {
      control: "boolean",
      description:
        'Enables hover, focus, active, and disabled state styling. When `true` and `asChild` is `false`, also adds `role="button"` and `tabIndex={0}` for keyboard accessibility. Use `asChild` when you need a real `<button>` or `<a>` element.',
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Behavior",
      },
    },
    asChild: {
      control: "boolean",
      description:
        'Merges card styles onto the immediate child element instead of rendering a `<div>`. Use with a `<button>` or `<a>` for proper interactive semantics — e.g. `<Card asChild><a href="/">…</a></Card>`.',
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Behavior",
      },
    },
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
        <p className="text-gray-500">
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
        <p className="text-gray-500">
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
            <p className="text-sm text-gray-500 mt-1">For growing teams</p>
          </div>
          <Badge>Popular</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold">
          $29
          <span className="text-lg text-gray-500">/month</span>
        </div>
        <ul className="space-y-2 text-sm text-gray-500">
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
          <p className="text-gray-500">A simple card with minimal content.</p>
        </CardContent>
      </Card>

      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle className="text-blue-600">Highlighted Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            A card with custom border color for emphasis.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            A card with increased shadow for more prominence.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-100">
        <CardHeader>
          <CardTitle>Subtle Background</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            A card with a subtle background color variation.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const InteractiveCard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Cards with `interactive` enabled respond to hover, focus, and active states using purpose-built tokens. The card gains `role="button"` and `tabIndex={0}` automatically — try navigating with Tab and pressing Enter.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Card interactive>
        <CardHeader>
          <CardTitle>Hover &amp; Focus Me</CardTitle>
          <CardDescription>
            Hover, tab into, or click this card to see state transitions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            Background transitions through hover → focus → active using
            component-scoped tokens.
          </p>
        </CardContent>
      </Card>

      <Card interactive>
        <CardHeader>
          <CardTitle>Another Selection</CardTitle>
          <CardDescription>
            Tab between cards to test focus trap.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            Each card is individually focusable and keyboard-activatable.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const InteractiveAsLink: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use `asChild` to merge card styles onto a real `<a>` element. This gives you proper link semantics (right-click → open in new tab, visited state, screen reader announcement) without wrapping a button inside a div.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Card interactive asChild>
        <a href="#" onClick={(e) => e.preventDefault()}>
          <CardHeader>
            <CardTitle>Linked Card (anchor)</CardTitle>
            <CardDescription>Renders as an &lt;a&gt; element.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">
              Right-click to confirm this is a real anchor. All card tokens
              apply; hover/focus/active states use the interactive token set.
            </p>
          </CardContent>
          <CardFooter>
            <Badge variant="secondary">→ View details</Badge>
          </CardFooter>
        </a>
      </Card>

      <Card interactive asChild>
        <button type="button">
          <CardHeader>
            <CardTitle>Button Card</CardTitle>
            <CardDescription>
              Renders as a &lt;button&gt; element.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">
              Ideal for selection UIs (plan picker, option grid) where a click
              triggers an action rather than navigation.
            </p>
          </CardContent>
        </button>
      </Card>
    </div>
  ),
};
