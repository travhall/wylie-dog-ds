import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import { RadioGroup, RadioGroupItem } from "@wyliedog/ui/radio-group";
import { Label } from "@wyliedog/ui/label";

const meta: Meta<typeof RadioGroup> = {
  title: "3. Components/Forms/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Radio button group for single selection from multiple options. Built on Radix UI primitives with full accessibility support and keyboard navigation.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout orientation of the radio group",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "vertical" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the entire group is disabled",
    },
    required: {
      control: "boolean",
      description: "Whether selection is required",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <Label htmlFor="option3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup
      orientation="horizontal"
      defaultValue="small"
      className="flex gap-6"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="small" id="size-small" />
        <Label htmlFor="size-small">Small</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="medium" id="size-medium" />
        <Label htmlFor="size-medium">Medium</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="large" id="size-large" />
        <Label htmlFor="size-large">Large</Label>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Horizontal layout for compact space usage.",
      },
    },
  },
};

export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="standard" className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="basic" id="plan-basic" />
          <Label htmlFor="plan-basic" className="font-medium">
            Basic Plan
          </Label>
        </div>
        <p className="text-sm text-neutral-600 ml-6">
          Perfect for individuals. Includes 5GB storage and basic features.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="standard" id="plan-standard" />
          <Label htmlFor="plan-standard" className="font-medium">
            Standard Plan
          </Label>
        </div>
        <p className="text-sm text-neutral-600 ml-6">
          Great for small teams. Includes 50GB storage and collaboration tools.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="premium" id="plan-premium" />
          <Label htmlFor="plan-premium" className="font-medium">
            Premium Plan
          </Label>
        </div>
        <p className="text-sm text-neutral-600 ml-6">
          For growing businesses. Unlimited storage and advanced analytics.
        </p>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Radio groups with additional descriptive text for each option.",
      },
    },
  },
};

export const WithPricing: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Your Plan</h3>
      <RadioGroup defaultValue="pro" className="space-y-3">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="starter" id="price-starter" />
            <div>
              <Label htmlFor="price-starter" className="font-medium">
                Starter
              </Label>
              <p className="text-sm text-neutral-600">For individuals</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">$9/month</div>
            <div className="text-sm text-neutral-600">billed monthly</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="pro" id="price-pro" />
            <div>
              <Label htmlFor="price-pro" className="font-medium">
                Pro
              </Label>
              <p className="text-sm text-neutral-600">For small teams</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">$29/month</div>
            <div className="text-sm text-neutral-600">billed monthly</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="enterprise" id="price-enterprise" />
            <div>
              <Label htmlFor="price-enterprise" className="font-medium">
                Enterprise
              </Label>
              <p className="text-sm text-neutral-600">
                For large organizations
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">Custom</div>
            <div className="text-sm text-neutral-600">contact sales</div>
          </div>
        </div>
      </RadioGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Pricing plan selection with rich card layout.",
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="font-medium text-neutral-700">Normal States</h4>
        <RadioGroup defaultValue="selected">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unselected" id="normal-unselected" />
            <Label htmlFor="normal-unselected">Unselected</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="selected" id="normal-selected" />
            <Label htmlFor="normal-selected">Selected</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-neutral-700">Disabled States</h4>
        <RadioGroup defaultValue="disabled-selected">
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="disabled-unselected"
              id="disabled-unselected"
              disabled
            />
            <Label htmlFor="disabled-unselected">Disabled Unselected</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="disabled-selected"
              id="disabled-selected"
              disabled
            />
            <Label htmlFor="disabled-selected">Disabled Selected</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All possible states of radio button items.",
      },
    },
  },
};

export const FormExamples: Story = {
  render: () => (
    <div className="max-w-md space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Delivery Options</h3>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Shipping Method</Label>
          <RadioGroup defaultValue="standard">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="shipping-standard" />
                <Label htmlFor="shipping-standard">Standard Shipping</Label>
              </div>
              <span className="text-sm text-neutral-600">3-5 days</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="express" id="shipping-express" />
                <Label htmlFor="shipping-express">Express Shipping</Label>
              </div>
              <span className="text-sm text-neutral-600">1-2 days</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="overnight" id="shipping-overnight" />
                <Label htmlFor="shipping-overnight">Overnight</Label>
              </div>
              <span className="text-sm text-neutral-600">Next day</span>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Method</h3>

        <div className="space-y-3">
          <Label className="text-sm font-medium" required>
            Select Payment
          </Label>
          <RadioGroup>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credit" id="payment-credit" />
              <Label htmlFor="payment-credit">Credit Card</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="debit" id="payment-debit" />
              <Label htmlFor="payment-debit">Debit Card</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paypal" id="payment-paypal" />
              <Label htmlFor="payment-paypal">PayPal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="apple" id="payment-apple" />
              <Label htmlFor="payment-apple">Apple Pay</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notification Preferences</h3>

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            How would you like to be notified?
          </Label>
          <RadioGroup defaultValue="email">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="notify-email" />
              <Label htmlFor="notify-email">Email only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sms" id="notify-sms" />
              <Label htmlFor="notify-sms">SMS only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="notify-both" />
              <Label htmlFor="notify-both">Both email and SMS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="notify-none" />
              <Label htmlFor="notify-none">No notifications</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Common form scenarios using radio groups for single selection.",
      },
    },
  },
};

export const Survey: Story = {
  render: () => (
    <div className="max-w-lg space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Customer Satisfaction Survey</h3>
        <p className="text-neutral-600">Help us improve our service</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="font-medium">
            How satisfied are you with our product?
          </Label>
          <RadioGroup>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="very-satisfied" id="satisfaction-very" />
              <Label htmlFor="satisfaction-very">Very satisfied</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="satisfied" id="satisfaction-satisfied" />
              <Label htmlFor="satisfaction-satisfied">Satisfied</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="neutral" id="satisfaction-neutral" />
              <Label htmlFor="satisfaction-neutral">Neutral</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="dissatisfied"
                id="satisfaction-dissatisfied"
              />
              <Label htmlFor="satisfaction-dissatisfied">Dissatisfied</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="very-dissatisfied"
                id="satisfaction-very-dissatisfied"
              />
              <Label htmlFor="satisfaction-very-dissatisfied">
                Very dissatisfied
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="font-medium">
            How often do you use our product?
          </Label>
          <RadioGroup>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="frequency-daily" />
              <Label htmlFor="frequency-daily">Daily</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="frequency-weekly" />
              <Label htmlFor="frequency-weekly">Weekly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="frequency-monthly" />
              <Label htmlFor="frequency-monthly">Monthly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rarely" id="frequency-rarely" />
              <Label htmlFor="frequency-rarely">Rarely</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="font-medium">
            Would you recommend us to a friend?
          </Label>
          <RadioGroup>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="definitely" id="recommend-definitely" />
              <Label htmlFor="recommend-definitely">Definitely</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="probably" id="recommend-probably" />
              <Label htmlFor="recommend-probably">Probably</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="maybe" id="recommend-maybe" />
              <Label htmlFor="recommend-maybe">Maybe</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="probably-not"
                id="recommend-probably-not"
              />
              <Label htmlFor="recommend-probably-not">Probably not</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="definitely-not"
                id="recommend-definitely-not"
              />
              <Label htmlFor="recommend-definitely-not">Definitely not</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Multi-question survey demonstrating radio groups for collecting user feedback.",
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <p className="text-sm text-neutral-600">
          Use Tab to navigate, Arrow keys to select within group, Space to
          select.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="font-medium" required>
            Preferred Contact Method
          </Label>
          <RadioGroup
            aria-labelledby="contact-method-label"
            defaultValue="email"
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="email"
                id="contact-email"
                aria-describedby="email-description"
              />
              <Label htmlFor="contact-email">Email</Label>
            </div>
            <p id="email-description" className="text-xs text-neutral-600 ml-6">
              We'll send updates to your email address
            </p>

            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="phone"
                id="contact-phone"
                aria-describedby="phone-description"
              />
              <Label htmlFor="contact-phone">Phone</Label>
            </div>
            <p id="phone-description" className="text-xs text-neutral-600 ml-6">
              We'll call you during business hours
            </p>

            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="mail"
                id="contact-mail"
                aria-describedby="mail-description"
              />
              <Label htmlFor="contact-mail">Postal Mail</Label>
            </div>
            <p id="mail-description" className="text-xs text-neutral-600 ml-6">
              We'll send physical letters to your address
            </p>
          </RadioGroup>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates comprehensive accessibility features including ARIA attributes and keyboard navigation.",
      },
    },
  },
};

export const WithInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates real user interactions with radio groups including mouse clicks, arrow key navigation, Space key selection, and Tab navigation. Tests single selection behavior where only one option can be selected at a time.",
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Shipping Method</h3>
        <Label className="text-sm">Choose your delivery speed</Label>

        <RadioGroup defaultValue="standard">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="standard" id="shipping-standard" />
            <Label htmlFor="shipping-standard">Standard (3-5 days)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="express" id="shipping-express" />
            <Label htmlFor="shipping-express">Express (1-2 days)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="overnight" id="shipping-overnight" />
            <Label htmlFor="shipping-overnight">Overnight (Next day)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pickup" id="shipping-pickup" />
            <Label htmlFor="shipping-pickup">Store Pickup (Today)</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Find all radio buttons
    const standardRadio = canvas.getByRole("radio", {
      name: /standard \(3-5 days\)/i,
    });
    const expressRadio = canvas.getByRole("radio", {
      name: /express \(1-2 days\)/i,
    });
    const overnightRadio = canvas.getByRole("radio", {
      name: /overnight \(next day\)/i,
    });
    const pickupRadio = canvas.getByRole("radio", {
      name: /store pickup \(today\)/i,
    });

    expect(standardRadio).toBeInTheDocument();
    expect(expressRadio).toBeInTheDocument();
    expect(overnightRadio).toBeInTheDocument();
    expect(pickupRadio).toBeInTheDocument();

    // Test 2: Verify initial state (standard is selected by default)
    expect(standardRadio).toHaveAttribute("data-state", "checked");
    expect(expressRadio).toHaveAttribute("data-state", "unchecked");
    expect(overnightRadio).toHaveAttribute("data-state", "unchecked");
    expect(pickupRadio).toHaveAttribute("data-state", "unchecked");

    // Test 3: Click express with mouse
    await userEvent.click(expressRadio);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(expressRadio).toHaveAttribute("data-state", "checked");
    expect(standardRadio).toHaveAttribute("data-state", "unchecked");

    // Test 4: Focus on radio group and use arrow keys
    await userEvent.click(expressRadio);
    expect(expressRadio).toHaveFocus();

    // Test 5: Arrow Down to next option
    await userEvent.keyboard("{ArrowDown}");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(overnightRadio).toHaveAttribute("data-state", "checked");
    expect(overnightRadio).toHaveFocus();
    expect(expressRadio).toHaveAttribute("data-state", "unchecked");

    // Test 6: Arrow Down again
    await userEvent.keyboard("{ArrowDown}");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(pickupRadio).toHaveAttribute("data-state", "checked");
    expect(pickupRadio).toHaveFocus();
    expect(overnightRadio).toHaveAttribute("data-state", "unchecked");

    // Test 7: Arrow Down wraps to first option
    await userEvent.keyboard("{ArrowDown}");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(standardRadio).toHaveAttribute("data-state", "checked");
    expect(standardRadio).toHaveFocus();
    expect(pickupRadio).toHaveAttribute("data-state", "unchecked");

    // Test 8: Arrow Up to previous option
    await userEvent.keyboard("{ArrowUp}");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(pickupRadio).toHaveAttribute("data-state", "checked");
    expect(pickupRadio).toHaveFocus();
    expect(standardRadio).toHaveAttribute("data-state", "unchecked");

    // Test 9: Arrow Right (should work same as Arrow Down)
    await userEvent.keyboard("{ArrowRight}");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(standardRadio).toHaveAttribute("data-state", "checked");
    expect(standardRadio).toHaveFocus();

    // Test 10: Arrow Left (should work same as Arrow Up)
    await userEvent.keyboard("{ArrowLeft}");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(pickupRadio).toHaveAttribute("data-state", "checked");
    expect(pickupRadio).toHaveFocus();

    // Test 11: Click to select specific option
    await userEvent.click(overnightRadio);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(overnightRadio).toHaveAttribute("data-state", "checked");
    expect(pickupRadio).toHaveAttribute("data-state", "unchecked");

    // Test 12: Space key should select focused item
    await userEvent.click(expressRadio);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await userEvent.keyboard(" ");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(expressRadio).toHaveAttribute("data-state", "checked");

    // Test 13: Verify only one option is selected
    const checkedRadios = [
      standardRadio,
      expressRadio,
      overnightRadio,
      pickupRadio,
    ].filter((radio) => radio.getAttribute("data-state") === "checked");
    expect(checkedRadios).toHaveLength(1);
  },
};
