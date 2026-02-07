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
        <p className="text-sm text-(--color-text-secondary) mb-3">
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
        <p className="text-sm text-(--color-text-secondary) mb-3">
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
            <div className="h-10 w-10 rounded-full bg-(--color-interactive-primary)/20 flex items-center justify-center text-sm font-medium">
              JD
            </div>
            <div>
              <p className="font-medium text-sm">John Doe</p>
              <p className="text-xs text-(--color-text-secondary)">
                john@example.com
              </p>
            </div>
          </div>
          <Badge>Admin</Badge>
        </div>

        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-(--color-status-success)/20 flex items-center justify-center text-sm font-medium">
              AS
            </div>
            <div>
              <p className="font-medium text-sm">Alice Smith</p>
              <p className="text-xs text-(--color-text-secondary)">
                alice@example.com
              </p>
            </div>
          </div>
          <Badge variant="secondary">Member</Badge>
        </div>

        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-(--color-accent-hover)/20 flex items-center justify-center text-sm font-medium">
              BJ
            </div>
            <div>
              <p className="font-medium text-sm">Bob Johnson</p>
              <p className="text-xs text-(--color-text-secondary)">
                bob@example.com
              </p>
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
        <p className="text-sm text-(--color-text-secondary)">
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
        <h4 className="text-lg font-semibold mb-4 text-(--color-status-success)">
          ✅ Do
        </h4>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Use semantic variants</p>
            <div className="flex gap-2">
              <Badge>Active</Badge>
              <Badge variant="destructive">Error</Badge>
            </div>
            <p className="text-xs text-(--color-text-secondary)">
              Match variant to meaning
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Keep text concise</p>
            <div className="flex gap-2">
              <Badge>New</Badge>
              <Badge variant="secondary">Beta</Badge>
            </div>
            <p className="text-xs text-(--color-text-secondary)">
              1-2 words is ideal
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Use for metadata</p>
            <div className="p-3 border rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">Premium Plan</span>
                <Badge>Popular</Badge>
              </div>
              <p className="text-xs text-(--color-text-secondary)">$99/month</p>
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
        <h4 className="text-lg font-semibold mb-4 text-(--color-status-danger)">
          ❌ Don't
        </h4>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Misuse semantic colors</p>
            <div className="flex gap-2">
              <Badge variant="destructive">Success</Badge>
              <Badge>Error Message</Badge>
            </div>
            <p className="text-xs text-(--color-text-secondary)">
              Variant doesn't match meaning
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Use long text</p>
            <Badge>This is a very long badge with too much text</Badge>
            <p className="text-xs text-(--color-text-secondary)">
              Badges should be brief
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Use as buttons</p>
            <Badge className="cursor-pointer">Click me</Badge>
            <p className="text-xs text-(--color-text-secondary)">
              Use Button component instead
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
            <p className="text-xs text-(--color-text-secondary)">
              Too many reduces impact
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};
