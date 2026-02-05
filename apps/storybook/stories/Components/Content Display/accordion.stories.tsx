import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@wyliedog/ui/accordion";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Checkbox } from "@wyliedog/ui/checkbox";
import { Button } from "@wyliedog/ui/button";

const meta: Meta<typeof Accordion> = {
  title: "Components/Content Display/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Collapsible content sections built on Radix UI primitives with full accessibility support, keyboard navigation, and smooth animations.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "radio",
      options: ["single", "multiple"],
      description: "Whether only one or multiple items can be open at once",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "single" },
      },
    },
    collapsible: {
      control: "boolean",
      description: "When type is single, allows closing all items",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {
    type: "single",
    collapsible: true,
  },
  render: (args) => (
    <div className="w-96">
      <Accordion className="w-full" {...args}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern and uses Radix UI
            primitives for full accessibility support including proper focus
            management and keyboard navigation.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that you can customize with your
            own CSS or by using design tokens from the Wylie Dog design system.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is it animated?</AccordionTrigger>
          <AccordionContent>
            Yes. The accordion includes smooth expand and collapse animations
            using CSS transitions and transforms for optimal performance.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const SingleCollapsible: Story = {
  args: {},
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Getting Started</AccordionTrigger>
        <AccordionContent>
          Install the package using npm, yarn, or pnpm. Then import the
          components and start building your accordion interface.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Customization</AccordionTrigger>
        <AccordionContent>
          The accordion can be customized using CSS variables, Tailwind classes,
          or by overriding the default design tokens in your theme.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Best Practices</AccordionTrigger>
        <AccordionContent>
          Use clear, descriptive trigger text. Keep content concise but
          informative. Consider the information hierarchy when organizing
          accordion items.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Single mode with collapsible option allows all items to be closed.",
      },
    },
  },
};

export const Multiple: Story = {
  args: {},
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="features">
        <AccordionTrigger>Key Features</AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-1 list-disc list-inside">
            <li>Fully accessible with ARIA support</li>
            <li>Keyboard navigation</li>
            <li>Smooth animations</li>
            <li>Customizable styling</li>
            <li>Single or multiple expand modes</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="usage">
        <AccordionTrigger>Usage Examples</AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-1 list-disc list-inside">
            <li>FAQ sections</li>
            <li>Product feature lists</li>
            <li>Settings panels</li>
            <li>Documentation navigation</li>
            <li>Form field groups</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="technical">
        <AccordionTrigger>Technical Details</AccordionTrigger>
        <AccordionContent>
          Built on Radix UI Accordion primitive with TypeScript support,
          customizable animations, and design token integration for consistent
          theming.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "Multiple mode allows several items to be open simultaneously.",
      },
    },
  },
};

export const FAQ: Story = {
  args: {},
  render: () => (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
        <p className="text-(--color-text-secondary)">
          Find answers to common questions about our service.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="pricing">
          <AccordionTrigger>What are your pricing plans?</AccordionTrigger>
          <AccordionContent>
            We offer three pricing tiers: Basic ($9/month), Pro ($29/month), and
            Enterprise (custom pricing). Each plan includes different features
            and usage limits. You can upgrade or downgrade at any time.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="trial">
          <AccordionTrigger>Do you offer a free trial?</AccordionTrigger>
          <AccordionContent>
            Yes! We offer a 14-day free trial for all new accounts. No credit
            card required. You'll have access to all Pro features during the
            trial period.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="support">
          <AccordionTrigger>
            What kind of support do you provide?
          </AccordionTrigger>
          <AccordionContent>
            We provide email support for all plans, live chat for Pro and
            Enterprise, and dedicated account management for Enterprise
            customers. Our support team typically responds within 24 hours.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="integrations">
          <AccordionTrigger>What integrations are available?</AccordionTrigger>
          <AccordionContent>
            We integrate with popular tools including Slack, Zapier, Google
            Workspace, Microsoft 365, Salesforce, and many others. We also
            provide a REST API for custom integrations.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="security">
          <AccordionTrigger>How do you handle data security?</AccordionTrigger>
          <AccordionContent>
            We take security seriously with SOC 2 Type II compliance, end-to-end
            encryption, regular security audits, and GDPR compliance. All data
            is encrypted at rest and in transit.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A complete FAQ section demonstrating real-world accordion usage.",
      },
    },
  },
};

export const SettingsPanel: Story = {
  args: {},
  render: () => (
    <div className="w-full max-w-lg space-y-4">
      <h3 className="text-lg font-semibold">Account Settings</h3>

      <Accordion type="multiple" className="w-full">
        <AccordionItem value="profile">
          <AccordionTrigger>Profile Information</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input id="display-name" type="text" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  id="settings-email"
                  type="email"
                  defaultValue="john@example.com"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notifications">
          <AccordionTrigger>Notifications</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notif" className="font-normal">
                  Email notifications
                </Label>
                <Checkbox id="email-notif" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notif" className="font-normal">
                  Push notifications
                </Label>
                <Checkbox id="push-notif" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notif" className="font-normal">
                  SMS notifications
                </Label>
                <Checkbox id="sms-notif" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="privacy">
          <AccordionTrigger>Privacy & Security</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="public-profile" className="font-normal">
                  Make profile public
                </Label>
                <Checkbox id="public-profile" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="two-factor" className="font-normal">
                  Two-factor authentication
                </Label>
                <Checkbox id="two-factor" defaultChecked />
              </div>
              <Button variant="link" className="p-0 h-auto text-sm">
                Change password
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Settings panel with multiple sections that can be open simultaneously.",
      },
    },
  },
};

export const ProductFeatures: Story = {
  args: {},
  render: () => (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Product Features</h2>
        <p className="text-(--color-text-secondary)">
          Explore what makes our platform special
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="analytics">
          <AccordionTrigger>
            <span className="flex items-center gap-3">
              📊 Advanced Analytics
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <p>
                Get deep insights into your data with our comprehensive
                analytics suite.
              </p>
              <ul className="space-y-1 list-disc list-inside text-sm text-(--color-text-secondary)">
                <li>Real-time dashboards</li>
                <li>Custom report builder</li>
                <li>Data export in multiple formats</li>
                <li>Automated insights and recommendations</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="collaboration">
          <AccordionTrigger>
            <span className="flex items-center gap-3">
              👥 Team Collaboration
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <p>Work together seamlessly with powerful collaboration tools.</p>
              <ul className="space-y-1 list-disc list-inside text-sm text-(--color-text-secondary)">
                <li>Real-time commenting and feedback</li>
                <li>Version control and history</li>
                <li>Team workspace management</li>
                <li>Role-based access controls</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="automation">
          <AccordionTrigger>
            <span className="flex items-center gap-3">
              ⚡ Workflow Automation
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <p>Automate repetitive tasks and streamline your workflows.</p>
              <ul className="space-y-1 list-disc list-inside text-sm text-(--color-text-secondary)">
                <li>Drag-and-drop workflow builder</li>
                <li>Trigger-based automation</li>
                <li>Integration with popular tools</li>
                <li>Custom scripting support</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="security">
          <AccordionTrigger>
            <span className="flex items-center gap-3">
              🔒 Enterprise Security
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <p>Bank-level security to protect your sensitive data.</p>
              <ul className="space-y-1 list-disc list-inside text-sm text-(--color-text-secondary)">
                <li>End-to-end encryption</li>
                <li>SOC 2 Type II compliance</li>
                <li>GDPR and CCPA compliance</li> {/* cSpell:ignore CCPA */}
                <li>Regular security audits</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Product features showcase with rich content and visual elements.",
      },
    },
  },
};

export const Accessibility: Story = {
  args: {},
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <p className="text-sm text-(--color-text-secondary)">
          Use Tab to navigate, Enter/Space to toggle, Arrow keys to move between
          items.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="keyboard">
          <AccordionTrigger>Keyboard Navigation</AccordionTrigger>
          <AccordionContent>
            Full keyboard support with Tab navigation, Enter/Space activation,
            and arrow key movement between accordion items.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="screen-reader">
          <AccordionTrigger>Screen Reader Support</AccordionTrigger>
          <AccordionContent>
            Proper ARIA attributes, roles, and states ensure compatibility with
            screen readers and assistive technologies.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="focus">
          <AccordionTrigger>Focus Management</AccordionTrigger>
          <AccordionContent>
            Clear focus indicators and logical focus order make the component
            easy to navigate for keyboard-only users.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the accordion's comprehensive accessibility features and keyboard navigation.",
      },
    },
  },
};

export const WithInteractions: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is React?</AccordionTrigger>
        <AccordionContent>
          React is a JavaScript library for building user interfaces. It allows
          developers to create reusable UI components and manage application
          state efficiently.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>What is TypeScript?</AccordionTrigger>
        <AccordionContent>
          TypeScript is a superset of JavaScript that adds static typing. It
          helps catch errors during development and improves code quality.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>What is Tailwind CSS?</AccordionTrigger>
        <AccordionContent>
          Tailwind CSS is a utility-first CSS framework that provides low-level
          utility classes for building custom designs directly in your markup.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: All accordions are initially closed
    const reactContent = canvas.queryByText(/react is a javascript library/i);
    expect(reactContent).not.toBeVisible();

    // Test 2: Click first accordion trigger to open
    const reactTrigger = canvas.getByRole("button", { name: /what is react/i });
    expect(reactTrigger).toBeInTheDocument();
    expect(reactTrigger).toHaveAttribute("data-state", "closed");

    await userEvent.click(reactTrigger);

    // Wait for animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // First accordion should be open
    expect(reactTrigger).toHaveAttribute("data-state", "open");
    const reactContentOpen = canvas.getByText(/react is a javascript library/i);
    expect(reactContentOpen).toBeVisible();

    // Test 3: Click second accordion - first should close (single mode)
    const typescriptTrigger = canvas.getByRole("button", {
      name: /what is typescript/i,
    });
    await userEvent.click(typescriptTrigger);
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(typescriptTrigger).toHaveAttribute("data-state", "open");
    const typescriptContent = canvas.getByText(
      /typescript is a superset of javascript/i
    );
    expect(typescriptContent).toBeVisible();

    // First accordion should be closed
    expect(reactTrigger).toHaveAttribute("data-state", "closed");

    // Test 4: Test Enter key to toggle
    const tailwindTrigger = canvas.getByRole("button", {
      name: /what is tailwind css/i,
    });
    tailwindTrigger.focus();
    expect(tailwindTrigger).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(tailwindTrigger).toHaveAttribute("data-state", "open");
    const tailwindContent = canvas.getByText(
      /tailwind css is a utility-first css framework/i
    );
    expect(tailwindContent).toBeVisible();

    // Test 5: Test Space key to toggle
    await userEvent.keyboard(" ");
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(tailwindTrigger).toHaveAttribute("data-state", "closed");

    // Test 6: Open an accordion and close it with click
    await userEvent.click(reactTrigger);
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(reactTrigger).toHaveAttribute("data-state", "open");
    const reactContentReopened = canvas.getByText(
      /react is a javascript library/i
    );
    expect(reactContentReopened).toBeVisible();

    // Click again to close
    await userEvent.click(reactTrigger);
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(reactTrigger).toHaveAttribute("data-state", "closed");
  },
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive interaction test demonstrating accordion functionality including expand/collapse with mouse clicks, Enter key activation, Space key activation, single-item mode (only one open at a time), state management, and content visibility. Uses play functions to simulate real user interactions. View the Interactions panel to see the automated test execution.",
      },
    },
  },
};
