import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@wyliedog/ui/badge";
import { Check, X, AlertCircle, Info } from "lucide-react";

const meta: Meta<typeof Badge> = {
  title: "Components/Content Display/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Compact status indicators and labels for displaying metadata, counts, or categorical information. **Accessibility:** Use semantic colors and consider adding visually hidden text for context when badges convey important information through color alone.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "success",
        "warning",
        "destructive",
        "outline",
      ],
      description: "Visual style variant of the badge",
      table: {
        type: {
          summary:
            '"default" | "secondary" | "success" | "warning" | "destructive" | "outline"',
        },
        category: "Appearance",
      },
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Size variant of the badge",
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: '"md"' },
        category: "Appearance",
      },
    },
    interactive: {
      control: "boolean",
      description:
        'Enables hover, focus, and disabled state styling using per-variant tokens. When `true` and `asChild` is `false`, also adds `role="button"` and `tabIndex={0}`. Use `asChild` when the badge needs to be a real `<button>` or `<a>`.',
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Behavior",
      },
    },
    asChild: {
      control: "boolean",
      description:
        "Merges badge styles onto the immediate child element. Use with `<a>` or `<button>` for proper interactive semantics.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Behavior",
      },
    },
  },
  args: {
    variant: "default",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Badge" },
  parameters: {
    docs: {
      description: {
        story: "Default badge style for general-purpose labeling.",
      },
    },
  },
};

export const SizeVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Three sizes for different interface densities. `sm` for tight spaces like table cells, `md` (default) for most contexts, `lg` for prominent status labels.",
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-8 text-xs font-mono text-gray-400">sm</div>
        <div className="flex gap-2 items-center">
          <Badge size="sm">Default</Badge>
          <Badge size="sm" variant="secondary">
            Secondary
          </Badge>
          <Badge size="sm" variant="success">
            Success
          </Badge>
          <Badge size="sm" variant="warning">
            Warning
          </Badge>
          <Badge size="sm" variant="destructive">
            Destructive
          </Badge>
          <Badge size="sm" variant="outline">
            Outline
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 text-xs font-mono text-gray-400">md</div>
        <div className="flex gap-2 items-center">
          <Badge size="md">Default</Badge>
          <Badge size="md" variant="secondary">
            Secondary
          </Badge>
          <Badge size="md" variant="success">
            Success
          </Badge>
          <Badge size="md" variant="warning">
            Warning
          </Badge>
          <Badge size="md" variant="destructive">
            Destructive
          </Badge>
          <Badge size="md" variant="outline">
            Outline
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 text-xs font-mono text-gray-400">lg</div>
        <div className="flex gap-2 items-center">
          <Badge size="lg">Default</Badge>
          <Badge size="lg" variant="secondary">
            Secondary
          </Badge>
          <Badge size="lg" variant="success">
            Success
          </Badge>
          <Badge size="lg" variant="warning">
            Warning
          </Badge>
          <Badge size="lg" variant="destructive">
            Destructive
          </Badge>
          <Badge size="lg" variant="outline">
            Outline
          </Badge>
        </div>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All available badge variants for different semantic meanings and visual hierarchy.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story: "Badges can include icons for additional visual context.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>
        <Check className="mr-1 h-3 w-3" />
        Verified
      </Badge>
      <Badge variant="secondary">
        <Info className="mr-1 h-3 w-3" />
        Info
      </Badge>
      <Badge variant="destructive">
        <X className="mr-1 h-3 w-3" />
        Error
      </Badge>
      <Badge variant="outline">
        <AlertCircle className="mr-1 h-3 w-3" />
        Warning
      </Badge>
    </div>
  ),
};

export const StatusIndicators: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use badges to show status across different states and contexts.",
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Account Status</h4>
        <div className="flex flex-wrap gap-2">
          <Badge>Active</Badge>
          <Badge variant="secondary">Pending</Badge>
          <Badge variant="outline">Inactive</Badge>
          <Badge variant="destructive">Suspended</Badge>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Order Status</h4>
        <div className="flex flex-wrap gap-2">
          <Badge>Processing</Badge>
          <Badge variant="secondary">Shipped</Badge>
          <Badge>Delivered</Badge>
          <Badge variant="destructive">Cancelled</Badge>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Priority Levels</h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="destructive">Critical</Badge>
          <Badge>High</Badge>
          <Badge variant="secondary">Medium</Badge>
          <Badge variant="outline">Low</Badge>
        </div>
      </div>
    </div>
  ),
};

export const Counts: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Badges are commonly used to display counts, notifications, or quantities.",
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm">Notifications</span>
        <Badge>3</Badge>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm">Messages</span>
        <Badge variant="destructive">12</Badge>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm">Cart Items</span>
        <Badge variant="secondary">5</Badge>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm">Saved</span>
        <Badge variant="outline">24</Badge>
      </div>
    </div>
  ),
};

export const Categories: Story = {
  parameters: {
    docs: {
      description: {
        story: "Use badges to tag or categorize content.",
      },
    },
  },
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-2">Building a Design System</h4>
        <p className="text-sm text-gray-500 mb-3">
          Learn how to create and maintain a scalable design system.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge>Design</Badge>
          <Badge variant="secondary">React</Badge>
          <Badge variant="outline">TypeScript</Badge>
        </div>
      </div>

      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-2">Accessibility Testing Guide</h4>
        <p className="text-sm text-gray-500 mb-3">
          Essential practices for testing web accessibility.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge>Accessibility</Badge>
          <Badge variant="secondary">Testing</Badge>
          <Badge variant="outline">Best Practices</Badge>
        </div>
      </div>
    </div>
  ),
};

export const InContext: Story = {
  parameters: {
    docs: {
      description: {
        story: "Examples of badges used in realistic UI contexts.",
      },
    },
  },
  render: () => (
    <div className="space-y-4 max-w-md">
      {/* User list with roles */}
      <div className="border rounded-lg divide-y">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center text-sm font-medium">
              JD
            </div>
            <div>
              <p className="font-medium text-sm">John Doe</p>
              <p className="text-xs text-gray-500">john@example.com</p>
            </div>
          </div>
          <Badge>Admin</Badge>
        </div>

        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-(--color-surface-success) flex items-center justify-center text-sm font-medium">
              AS
            </div>
            <div>
              <p className="font-medium text-sm">Alice Smith</p>
              <p className="text-xs text-gray-500">alice@example.com</p>
            </div>
          </div>
          <Badge variant="secondary">Member</Badge>
        </div>

        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-(--color-background-secondary) flex items-center justify-center text-sm font-medium">
              BJ
            </div>
            <div>
              <p className="font-medium text-sm">Bob Johnson</p>
              <p className="text-xs text-gray-500">bob@example.com</p>
            </div>
          </div>
          <Badge variant="outline">Guest</Badge>
        </div>
      </div>

      {/* Notification with badge */}
      <div className="border rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm">System Updates</h4>
          <Badge variant="destructive">3 New</Badge>
        </div>
        <p className="text-sm text-gray-500">
          Important updates are available for your system.
        </p>
      </div>
    </div>
  ),
};
{
  /* cSpell:ignore Donts */
}
export const DosDonts: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Best practices and common mistakes when using Badge components.",
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-2 gap-8 max-w-4xl">
      <div>
        <h4 className="text-lg font-semibold mb-4 text-green-600">✅ Do</h4>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Use semantic variants</p>
            <div className="flex gap-2">
              <Badge>Active</Badge>
              <Badge variant="destructive">Error</Badge>
            </div>
            <p className="text-xs text-gray-500">Match variant to meaning</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Keep text concise</p>
            <div className="flex gap-2">
              <Badge>New</Badge>
              <Badge variant="secondary">Beta</Badge>
            </div>
            <p className="text-xs text-gray-500">1-2 words is ideal</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Use for metadata</p>
            <div className="p-3 border rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">Premium Plan</span>
                <Badge>Popular</Badge>
              </div>
              <p className="text-xs text-gray-500">$99/month</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Add icons for clarity</p>
            <Badge>
              <Check className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4 text-red-600">❌ Don't</h4>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Misuse semantic colors</p>
            <div className="flex gap-2">
              <Badge variant="destructive">Success</Badge>
              <Badge>Error Message</Badge>
            </div>
            <p className="text-xs text-gray-500">
              Variant doesn't match meaning
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Use long text</p>
            <Badge>This is a very long badge with too much text</Badge>
            <p className="text-xs text-gray-500">Badges should be brief</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Hand-craft interactivity</p>
            <Badge className="cursor-pointer">Click me</Badge>
            <p className="text-xs text-gray-500">
              Use the <code>interactive</code> prop or <code>asChild</code>{" "}
              instead
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Overuse on page</p>
            <div className="flex flex-wrap gap-1">
              <Badge>Tag</Badge>
              <Badge>Tag</Badge>
              <Badge>Tag</Badge>
              <Badge>Tag</Badge>
              <Badge>Tag</Badge>
              <Badge>Tag</Badge>
              <Badge>Tag</Badge>
              <Badge>Tag</Badge>
            </div>
            <p className="text-xs text-gray-500">Too many reduces impact</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const InteractiveBadges: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Badges with `interactive` enabled respond to hover and focus using per-variant tokens. Each variant has its own hover and focus color defined in the token system. Try tabbing through — each badge is individually focusable.",
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3">Interactive — all variants</h4>
        <div className="flex flex-wrap gap-2">
          <Badge interactive>Default</Badge>
          <Badge interactive variant="secondary">
            Secondary
          </Badge>
          <Badge interactive variant="success">
            Success
          </Badge>
          <Badge interactive variant="warning">
            Warning
          </Badge>
          <Badge interactive variant="destructive">
            Destructive
          </Badge>
          <Badge interactive variant="outline">
            Outline
          </Badge>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Disabled state</h4>
        <div className="flex flex-wrap gap-2">
          <Badge
            interactive
            aria-disabled="true"
            className="pointer-events-none opacity-50"
          >
            Default
          </Badge>
          <Badge
            interactive
            variant="destructive"
            aria-disabled="true"
            className="pointer-events-none opacity-50"
          >
            Destructive
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Badges are not form elements so use <code>aria-disabled</code> +{" "}
          <code>pointer-events-none</code> rather than the HTML{" "}
          <code>disabled</code> attribute.
        </p>
      </div>
    </div>
  ),
};

export const InteractiveAsChild: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use `asChild` to merge badge styles onto a real `<a>` or `<button>` element. This gives you correct semantics — link badges navigate, button badges fire click handlers — while keeping the full token-based appearance.",
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3">As anchor links</h4>
        <div className="flex flex-wrap gap-2">
          <Badge interactive asChild>
            <a href="#" onClick={(e) => e.preventDefault()}>
              Documentation
            </a>
          </Badge>
          <Badge interactive asChild variant="secondary">
            <a href="#" onClick={(e) => e.preventDefault()}>
              Changelog
            </a>
          </Badge>
          <Badge interactive asChild variant="outline">
            <a href="#" onClick={(e) => e.preventDefault()}>
              GitHub ↗
            </a>
          </Badge>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">As buttons</h4>
        <div className="flex flex-wrap gap-2">
          <Badge interactive asChild variant="success">
            <button type="button" onClick={() => alert("Approved!")}>
              ✓ Approve
            </button>
          </Badge>
          <Badge interactive asChild variant="destructive">
            <button type="button" onClick={() => alert("Rejected!")}>
              ✕ Reject
            </button>
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Use <code>asChild</code> + <code>&lt;button&gt;</code> when the badge
          triggers an action. This avoids nesting interactive elements.
        </p>
      </div>
    </div>
  ),
};
