import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import { Checkbox } from "@wyliedog/ui/checkbox";
import { Label } from "@wyliedog/ui/label";

const meta: Meta<typeof Checkbox> = {
  title: "3. Components/Forms/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Checkbox component built on Radix UI primitives with full accessibility support, keyboard navigation, and customizable styling.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "The size of the checkbox",
    },
    error: {
      control: "boolean",
      description: "Whether the checkbox should show error styling",
    },
    disabled: {
      control: "boolean",
      description: "Whether the checkbox is disabled",
    },
    checked: {
      control: "boolean",
      description: "Whether the checkbox is checked",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox id="default-checkbox" {...args} />
      <Label htmlFor="default-checkbox">Accept terms and conditions</Label>
    </div>
  ),
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox id="checked-checkbox" {...args} />
      <Label htmlFor="checked-checkbox">Newsletter subscription</Label>
    </div>
  ),
};

export const WithError: Story = {
  args: {
    error: true,
  },
  render: (args) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox id="error-checkbox" {...args} />
        <Label htmlFor="error-checkbox" error required>
          I agree to the terms of service
        </Label>
      </div>
      <p className="text-xs text-red-600 ml-6">This field is required</p>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="small-checkbox" size="sm" />
        <Label htmlFor="small-checkbox" size="sm">
          Small checkbox
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="medium-checkbox" size="md" />
        <Label htmlFor="medium-checkbox" size="md">
          Medium checkbox (default)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="large-checkbox" size="lg" />
        <Label htmlFor="large-checkbox" size="lg">
          Large checkbox
        </Label>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700">Normal States</h4>
        <div className="flex items-center space-x-2">
          <Checkbox id="unchecked" />
          <Label htmlFor="unchecked">Unchecked</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="checked" defaultChecked />
          <Label htmlFor="checked">Checked</Label>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700">
          Disabled States
        </h4>
        <div className="flex items-center space-x-2">
          <Checkbox id="disabled-unchecked" disabled />
          <Label htmlFor="disabled-unchecked">Disabled unchecked</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="disabled-checked" disabled defaultChecked />
          <Label htmlFor="disabled-checked">Disabled checked</Label>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700">Error States</h4>
        <div className="flex items-center space-x-2">
          <Checkbox id="error-unchecked" error />
          <Label htmlFor="error-unchecked" error>
            Error unchecked
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="error-checked" error defaultChecked />
          <Label htmlFor="error-checked" error>
            Error checked
          </Label>
        </div>
      </div>
    </div>
  ),
};

export const CheckboxGroups: Story = {
  render: () => (
    <div className="space-y-6">
      {/* Preferences Group */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Notification Preferences</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="email-notifications" defaultChecked />
            <Label htmlFor="email-notifications">Email notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="sms-notifications" />
            <Label htmlFor="sms-notifications">SMS notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="push-notifications" defaultChecked />
            <Label htmlFor="push-notifications">Push notifications</Label>
          </div>
        </div>
      </div>

      {/* Features Group */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Features</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="dark-mode" />
            <Label htmlFor="dark-mode">Enable dark mode</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="analytics" defaultChecked />
            <Label htmlFor="analytics">Usage analytics</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="beta-features" />
            <Label htmlFor="beta-features">Beta features</Label>
          </div>
        </div>
      </div>

      {/* Required Group */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Legal</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" required>
              Accept terms of service
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="privacy" />
            <Label htmlFor="privacy" required>
              Accept privacy policy
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="marketing" />
            <Label htmlFor="marketing">Receive marketing communications</Label>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const FormExamples: Story = {
  render: () => (
    <div className="max-w-md space-y-8">
      {/* Registration Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Create Account</h3>

        <div className="space-y-2">
          <Label htmlFor="reg-email" required>
            Email
          </Label>
          <input
            id="reg-email"
            type="email"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password" required>
            Password
          </Label>
          <input
            id="reg-password"
            type="password"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-start space-x-2">
            <Checkbox id="reg-terms" className="mt-1" />
            <Label htmlFor="reg-terms" required className="leading-5">
              I agree to the Terms of Service and Privacy Policy
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="reg-newsletter" className="mt-1" />
            <Label htmlFor="reg-newsletter" className="leading-5">
              Send me product updates and marketing emails
            </Label>
          </div>
        </div>
      </div>

      {/* Survey Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Survey</h3>
        <p className="text-sm text-neutral-600">
          What topics interest you? (Select all that apply)
        </p>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="topic-tech" />
            <Label htmlFor="topic-tech">Technology</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="topic-design" />
            <Label htmlFor="topic-design">Design</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="topic-business" />
            <Label htmlFor="topic-business">Business</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="topic-lifestyle" />
            <Label htmlFor="topic-lifestyle">Lifestyle</Label>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const WithInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates real user interactions with checkboxes including mouse clicks, Space key toggling, Tab navigation, and disabled state handling. Tests both checking and unchecking behaviors with keyboard and mouse.",
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Notification Settings</h3>

        <div className="flex items-center space-x-2">
          <Checkbox id="email-check" />
          <Label htmlFor="email-check">Email notifications</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="sms-check" />
          <Label htmlFor="sms-check">SMS notifications</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="push-check" defaultChecked />
          <Label htmlFor="push-check">Push notifications</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="disabled-check" disabled />
          <Label htmlFor="disabled-check">Marketing (disabled)</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="disabled-checked" disabled defaultChecked />
          <Label htmlFor="disabled-checked">
            Terms accepted (disabled, checked)
          </Label>
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Find all checkboxes
    const emailCheckbox = canvas.getByRole("checkbox", {
      name: /email notifications/i,
    });
    const smsCheckbox = canvas.getByRole("checkbox", {
      name: /sms notifications/i,
    });
    const pushCheckbox = canvas.getByRole("checkbox", {
      name: /push notifications/i,
    });
    const disabledCheckbox = canvas.getByRole("checkbox", {
      name: /marketing \(disabled\)/i,
    });
    const disabledCheckedCheckbox = canvas.getByRole("checkbox", {
      name: /terms accepted/i,
    });

    expect(emailCheckbox).toBeInTheDocument();
    expect(smsCheckbox).toBeInTheDocument();
    expect(pushCheckbox).toBeInTheDocument();

    // Test 2: Verify initial states
    expect(emailCheckbox).not.toBeChecked();
    expect(smsCheckbox).not.toBeChecked();
    expect(pushCheckbox).toBeChecked();
    expect(disabledCheckbox).toBeDisabled();
    expect(disabledCheckedCheckbox).toBeDisabled();
    expect(disabledCheckedCheckbox).toBeChecked();

    // Test 3: Click email checkbox with mouse
    await userEvent.click(emailCheckbox);
    expect(emailCheckbox).toBeChecked();

    // Click again to uncheck
    await userEvent.click(emailCheckbox);
    expect(emailCheckbox).not.toBeChecked();

    // Check it again for further tests
    await userEvent.click(emailCheckbox);
    expect(emailCheckbox).toBeChecked();

    // Test 4: Tab navigation
    await userEvent.tab();
    expect(smsCheckbox).toHaveFocus();

    // Test 5: Toggle with Space key
    await userEvent.keyboard(" ");
    expect(smsCheckbox).toBeChecked();

    // Press Space again to uncheck
    await userEvent.keyboard(" ");
    expect(smsCheckbox).not.toBeChecked();

    // Check it again
    await userEvent.keyboard(" ");
    expect(smsCheckbox).toBeChecked();

    // Test 6: Tab to next checkbox
    await userEvent.tab();
    expect(pushCheckbox).toHaveFocus();

    // Test 7: Uncheck with Space (was initially checked)
    await userEvent.keyboard(" ");
    expect(pushCheckbox).not.toBeChecked();

    // Test 8: Tab to disabled checkbox (should receive focus but not toggle)
    await userEvent.tab();
    expect(disabledCheckbox).toHaveFocus();

    // Try to toggle disabled checkbox with Space (should not work)
    await userEvent.keyboard(" ");
    expect(disabledCheckbox).not.toBeChecked();

    // Test 9: Try to click disabled checkbox (should not work)
    await userEvent.click(disabledCheckbox);
    expect(disabledCheckbox).not.toBeChecked();

    // Test 10: Verify final states
    expect(emailCheckbox).toBeChecked();
    expect(smsCheckbox).toBeChecked();
    expect(pushCheckbox).not.toBeChecked();
    expect(disabledCheckbox).not.toBeChecked();
    expect(disabledCheckedCheckbox).toBeChecked();
  },
};
