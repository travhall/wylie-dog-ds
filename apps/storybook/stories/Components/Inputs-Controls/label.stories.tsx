import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "@wyliedog/ui/label";
import { Input } from "@wyliedog/ui/input";
import { Checkbox } from "@wyliedog/ui/checkbox";
import { Switch } from "@wyliedog/ui/switch";

const meta: Meta<typeof Label> = {
  title: "Components/Inputs & Controls/Label",
  component: Label,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Label component provides accessible labels for form controls with support for required indicators and error states.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "The size of the label text",
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: '"md"' },
        category: "Appearance",
      },
    },
    required: {
      control: "boolean",
      description: "Whether to show the required indicator (*)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "State",
      },
    },
    error: {
      control: "boolean",
      description: "Whether the label should show error styling",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "State",
      },
    },
    children: {
      control: "text",
      description: "The label text content",
      table: {
        type: { summary: "ReactNode" },
        category: "Content",
      },
    },
  },
  args: {
    size: "md",
    required: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Email Address",
    htmlFor: "email-default",
  },
  parameters: {
    docs: {
      description: {
        story: "Basic label paired with a text input.",
      },
    },
  },
  render: (args) => (
    <div className="w-64 space-y-2">
      <Label {...args} />
      <Input
        id="email-default"
        size={args.size}
        placeholder="Enter your email"
      />
    </div>
  ),
};

export const Required: Story = {
  args: {
    children: "Password",
    htmlFor: "password-required",
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Label with a required field indicator asterisk.",
      },
    },
  },
  render: (args) => (
    <div className="w-64 space-y-2">
      <Label {...args} />
      <Input
        id="password-required"
        type="password"
        placeholder="Enter your password"
      />
    </div>
  ),
};

export const WithError: Story = {
  args: {
    children: "Username",
    htmlFor: "username-error",
    required: true,
    error: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Label with error styling alongside an error input and validation message.",
      },
    },
  },
  render: (args) => (
    <div className="w-64 space-y-2">
      <Label {...args} />
      <Input id="username-error" error placeholder="Username is required" />
      <p className="text-xs text-(--color-status-danger)">
        This field is required
      </p>
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      description: {
        story: "Label size variants (sm, md, lg) paired with matching inputs.",
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div className="w-64 space-y-2">
        <Label size="sm" htmlFor="small-input">
          Small Label
        </Label>
        <Input id="small-input" size="sm" placeholder="Small input" />
      </div>
      <div className="w-64 space-y-2">
        <Label size="md" htmlFor="medium-input">
          Medium Label (Default)
        </Label>
        <Input id="medium-input" size="md" placeholder="Medium input" />
      </div>
      <div className="w-64 space-y-2">
        <Label size="lg" htmlFor="large-input">
          Large Label
        </Label>
        <Input id="large-input" size="lg" placeholder="Large input" />
      </div>
    </div>
  ),
};

export const WithCheckboxes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Labels used alongside checkboxes, including required and error states.",
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="newsletter" />
        <Label htmlFor="newsletter">Subscribe to newsletter</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms" required>
          Accept terms and conditions
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="error-checkbox" error />
        <Label htmlFor="error-checkbox" error>
          This field has an error
        </Label>
      </div>
    </div>
  ),
};

export const WithSwitches: Story = {
  parameters: {
    docs: {
      description: {
        story: "Labels paired with switch toggles in a settings-style layout.",
      },
    },
  },
  render: () => (
    <div className="space-y-4 w-64">
      <div className="flex items-center justify-between">
        <Label htmlFor="notifications">Email notifications</Label>
        <Switch id="notifications" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="dark-mode">Dark mode</Label>
        <Switch id="dark-mode" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="marketing" required>
          Marketing emails
        </Label>
        <Switch id="marketing" />
      </div>
    </div>
  ),
};

export const FormExamples: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Contact form demonstrating labels with various input types including checkboxes.",
      },
    },
  },
  render: () => (
    <div className="max-w-md space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contact Form</h3>

        <div className="space-y-2">
          <Label htmlFor="contact-name" required>
            Full Name
          </Label>
          <Input id="contact-name" placeholder="John Doe" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email" required>
            Email Address
          </Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-phone">Phone Number</Label>
          <Input
            id="contact-phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="contact-consent" />
          <Label htmlFor="contact-consent" required>
            I agree to be contacted via email
          </Label>
        </div>
      </div>
    </div>
  ),
};
