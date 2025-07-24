import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@wyliedog/ui/accordion";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: 'Collapsible content sections built on Radix UI primitives with full accessibility support, keyboard navigation, and smooth animations.'
      }
    }
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
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "single",
    collapsible: true,
  },
  render: (args) => (
    <Accordion className="w-full max-w-md" {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern and uses Radix UI primitives 
          for full accessibility support including proper focus management and keyboard navigation.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that you can customize with your own CSS
          or by using design tokens from the Wylie Dog design system.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. The accordion includes smooth expand and collapse animations using 
          CSS transitions and transforms for optimal performance.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const SingleCollapsible: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Getting Started</AccordionTrigger>
        <AccordionContent>
          Install the package using npm, yarn, or pnpm. Then import the components 
          and start building your accordion interface.
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
          Use clear, descriptive trigger text. Keep content concise but informative. 
          Consider the information hierarchy when organizing accordion items.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "Single mode with collapsible option allows all items to be closed."
      }
    }
  }
};

export const Multiple: Story = {
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
          customizable animations, and design token integration for consistent theming.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "Multiple mode allows several items to be open simultaneously."
      }
    }
  }
};

export const FAQ: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
        <p className="text-neutral-600">Find answers to common questions about our service.</p>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="pricing">
          <AccordionTrigger>What are your pricing plans?</AccordionTrigger>
          <AccordionContent>
            We offer three pricing tiers: Basic ($9/month), Pro ($29/month), and Enterprise 
            (custom pricing). Each plan includes different features and usage limits. 
            You can upgrade or downgrade at any time.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="trial">
          <AccordionTrigger>Do you offer a free trial?</AccordionTrigger>
          <AccordionContent>
            Yes! We offer a 14-day free trial for all new accounts. No credit card required. 
            You'll have access to all Pro features during the trial period.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="support">
          <AccordionTrigger>What kind of support do you provide?</AccordionTrigger>
          <AccordionContent>
            We provide email support for all plans, live chat for Pro and Enterprise, 
            and dedicated account management for Enterprise customers. Our support team 
            typically responds within 24 hours.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="integrations">
          <AccordionTrigger>What integrations are available?</AccordionTrigger>
          <AccordionContent>
            We integrate with popular tools including Slack, Zapier, Google Workspace, 
            Microsoft 365, Salesforce, and many others. We also provide a REST API 
            for custom integrations.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="security">
          <AccordionTrigger>How do you handle data security?</AccordionTrigger>
          <AccordionContent>
            We take security seriously with SOC 2 Type II compliance, end-to-end encryption, 
            regular security audits, and GDPR compliance. All data is encrypted at rest 
            and in transit.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "A complete FAQ section demonstrating real-world accordion usage."
      }
    }
  }
};

export const SettingsPanel: Story = {
  render: () => (
    <div className="w-full max-w-lg space-y-4">
      <h3 className="text-lg font-semibold">Account Settings</h3>
      
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="profile">
          <AccordionTrigger>Profile Information</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <input 
                  type="text" 
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input 
                  type="email" 
                  defaultValue="john@example.com"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <span className="text-sm">Email notifications</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push notifications</span>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS notifications</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="privacy">
          <AccordionTrigger>Privacy & Security</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Make profile public</span>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Two-factor authentication</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                Change password
              </button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Settings panel with multiple sections that can be open simultaneously."
      }
    }
  }
};

export const ProductFeatures: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Product Features</h2>
        <p className="text-neutral-600">Explore what makes our platform special</p>
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
              <p>Get deep insights into your data with our comprehensive analytics suite.</p>
              <ul className="space-y-1 list-disc list-inside text-sm text-neutral-600">
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
              <ul className="space-y-1 list-disc list-inside text-sm text-neutral-600">
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
              <ul className="space-y-1 list-disc list-inside text-sm text-neutral-600">
                <li>Drag-and-drop workflow builder</li>
                <li>Trigger-based automations</li>
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
              <ul className="space-y-1 list-disc list-inside text-sm text-neutral-600">
                <li>End-to-end encryption</li>
                <li>SOC 2 Type II compliance</li>
                <li>GDPR and CCPA compliance</li>
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
        story: "Product features showcase with rich content and visual elements."
      }
    }
  }
};

export const Accessibility: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <p className="text-sm text-neutral-600">
          Use Tab to navigate, Enter/Space to toggle, Arrow keys to move between items.
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
            Proper ARIA attributes, roles, and states ensure compatibility 
            with screen readers and assistive technologies.
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
        story: "Demonstrates the accordion's comprehensive accessibility features and keyboard navigation."
      }
    }
  }
};