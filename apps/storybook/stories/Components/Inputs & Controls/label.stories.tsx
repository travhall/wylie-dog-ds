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
    },
    required: {
      control: "boolean",
      description: "Whether to show the required indicator (*)",
    },
    error: {
      control: "boolean",
      description: "Whether the label should show error styling",
    },
    children: {
      control: "text",
      description: "The label text content",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Email Address",
    htmlFor: "email-default",
  },
  render: (args) => (
    <div className="w-64 space-y-2">
      <Label {...args} />
      <Input id="email-default" placeholder="Enter your email" />
    </div>
  ),
};

export const Required: Story = {
  args: {
    children: "Password",
    htmlFor: "password-required",
    required: true,
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
  render: (args) => (
    <div className="w-64 space-y-2">
      <Label {...args} />
      <Input id="username-error" error placeholder="Username is required" />
      <p className="text-xs text-red-600">This field is required</p>
    </div>
  ),
};

export const AllSizes: Story = {
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
