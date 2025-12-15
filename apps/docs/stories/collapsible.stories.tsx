import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@wyliedog/ui/collapsible";
import { Button } from "@wyliedog/ui/button";
import { ChevronDownIcon, PlusIcon, MinusIcon } from "lucide-react";

const meta: Meta<typeof Collapsible> = {
  title: "3. Components/Layout/Collapsible",
  component: Collapsible,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Collapsible component for showing and hiding content sections. Built on Radix UI primitives with smooth animations and flexible trigger options.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    defaultOpen: {
      control: "boolean",
      description: "Whether the collapsible is open by default",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the collapsible is disabled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Collapsible className="w-full max-w-md space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">
          @peduarte starred 3 repositories
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDownIcon className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
        @radix-ui/primitives
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
          @radix-ui/colors
        </div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
          @stitches/react
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

//cSpell: ignore peduarte

export const WithCustomTrigger: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full max-w-md space-y-2"
      >
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">Advanced Settings</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <MinusIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle advanced settings</span>
            </Button>
          </CollapsibleTrigger>
        </div>

        <div className="rounded-md border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Enable notifications</label>
            <input type="checkbox" defaultChecked />
          </div>

          <CollapsibleContent className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto-save changes</label>
              <input type="checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Dark mode</label>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Beta features</label>
              <input type="checkbox" />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Custom trigger with plus/minus icons and controlled state.",
      },
    },
  },
};

export const FAQ: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>

      <div className="space-y-2">
        <Collapsible className="rounded-lg border">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50">
            <span className="font-medium">What is your refund policy?</span>
            <ChevronDownIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <p className="text-sm text-neutral-600">
                We offer a 30-day money-back guarantee for all our products. If
                you're not satisfied with your purchase, you can request a full
                refund within 30 days of your order date.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="rounded-lg border">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50">
            <span className="font-medium">How do I track my order?</span>
            <ChevronDownIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <p className="text-sm text-neutral-600">
                Once your order ships, you'll receive a tracking number via
                email. You can use this number on our tracking page or the
                carrier's website to monitor your package's progress.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="rounded-lg border">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50">
            <span className="font-medium">Do you ship internationally?</span>
            <ChevronDownIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <p className="text-sm text-neutral-600">
                Yes, we ship to over 50 countries worldwide. Shipping costs and
                delivery times vary by location. International orders may be
                subject to customs duties and taxes.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "FAQ section with multiple collapsible items.",
      },
    },
  },
};

export const NestedContent: Story = {
  render: () => (
    <div className="w-full max-w-lg space-y-4">
      <h3 className="text-lg font-semibold">Project Structure</h3>

      <Collapsible className="rounded-lg border">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50">
          <span className="font-medium">📁 src</span>
          <ChevronDownIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2">
            <div className="text-sm text-neutral-600">📄 index.ts</div>

            <Collapsible className="ml-4 rounded border">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-left hover:bg-neutral-50">
                <span className="text-sm font-medium">📁 components</span>
                <ChevronDownIcon className="h-3 w-3 transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-1">
                  <div className="text-xs text-neutral-600">📄 Button.tsx</div>
                  <div className="text-xs text-neutral-600">📄 Input.tsx</div>
                  <div className="text-xs text-neutral-600">📄 Modal.tsx</div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible className="ml-4 rounded border">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-left hover:bg-neutral-50">
                <span className="text-sm font-medium">📁 utils</span>
                <ChevronDownIcon className="h-3 w-3 transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-1">
                  <div className="text-xs text-neutral-600">📄 helpers.ts</div>
                  <div className="text-xs text-neutral-600">
                    📄 constants.ts
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Nested collapsible sections for hierarchical content.",
      },
    },
  },
};

export const FormSections: Story = {
  render: () => (
    <div className="w-full max-w-lg space-y-4">
      <h3 className="text-lg font-semibold">Account Settings</h3>

      <div className="space-y-3">
        <Collapsible defaultOpen className="rounded-lg border">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50">
            <span className="font-medium">Personal Information</span>
            <ChevronDownIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="rounded-lg border">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50">
            <span className="font-medium">Notification Preferences</span>
            <ChevronDownIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email notifications</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push notifications</span>
                <input type="checkbox" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS notifications</span>
                <input type="checkbox" />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="rounded-lg border">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50">
            <span className="font-medium">Privacy Settings</span>
            <ChevronDownIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Profile visibility</span>
                <select className="text-sm border rounded px-2 py-1">
                  <option>Public</option>
                  <option>Private</option>
                  <option>Friends only</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Activity status</span>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Form sections with collapsible groups for better organization.",
      },
    },
  },
};

export const ProductFeatures: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      <h3 className="text-xl font-bold">Premium Plan Features</h3>

      <div className="grid gap-3">
        <Collapsible className="rounded-lg border">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <span className="font-medium">Advanced Analytics</span>
            </div>
            <ChevronDownIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <p className="text-sm text-neutral-600 mb-3">
                Get deep insights into your data with comprehensive analytics
                tools.
              </p>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Real-time dashboard with custom widgets</li>
                <li>• Historical data analysis and trends</li>
                <li>• Automated reports and scheduling</li>
                <li>• Custom metrics and KPI tracking</li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="rounded-lg border">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🤝</span>
              <span className="font-medium">Team Collaboration</span>
            </div>
            <ChevronDownIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <p className="text-sm text-neutral-600 mb-3">
                Work together seamlessly with powerful collaboration features.
              </p>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Real-time editing and comments</li>
                <li>• Role-based permissions and access control</li>
                <li>• Team workspaces and project organization</li>
                <li>• Activity feeds and notifications</li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="rounded-lg border">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔒</span>
              <span className="font-medium">Enterprise Security</span>
            </div>
            <ChevronDownIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <p className="text-sm text-neutral-600 mb-3">
                Bank-level security to protect your sensitive information.
              </p>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• End-to-end encryption for all data</li>
                <li>• SOC 2 Type II compliance</li>
                <li>• Single sign-on (SSO) integration</li>
                <li>• Advanced audit logs and monitoring</li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Product feature showcase with rich content and visual elements.",
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <p className="text-sm text-neutral-600">
          Use Tab to navigate, Enter/Space to toggle, proper ARIA attributes.
        </p>
      </div>

      <Collapsible className="rounded-lg border">
        <CollapsibleTrigger
          className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50"
          aria-describedby="keyboard-help"
        >
          <span className="font-medium">Keyboard Navigation</span>
          <ChevronDownIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <p className="text-sm text-neutral-600">
              Full keyboard support with Tab navigation, Enter/Space activation,
              and proper focus management for screen readers and assistive
              technologies.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <p id="keyboard-help" className="text-xs text-neutral-600">
        Press Tab to focus the trigger, then Enter or Space to toggle
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates comprehensive accessibility features and keyboard navigation.",
      },
    },
  },
};
