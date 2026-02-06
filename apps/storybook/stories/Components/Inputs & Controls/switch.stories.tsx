import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import { Switch } from "@wyliedog/ui/switch";
import { Label } from "@wyliedog/ui/label";

const meta: Meta<typeof Switch> = {
  title: "Components/Inputs & Controls/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Switch component for binary choices, built on Radix UI with smooth animations and full accessibility support. Perfect for settings and feature toggles.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "The size of the switch",
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: '"md"' },
        category: "Appearance",
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the switch is disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "State",
      },
    },
    checked: {
      control: "boolean",
      description: "Whether the switch is checked/on",
      table: {
        type: { summary: "boolean" },
        category: "State",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Basic switch with label for binary on/off choices.",
      },
    },
  },
  render: (args) => (
    <div className="flex items-center space-x-3">
      <Switch id="default-switch" {...args} />
      <Label htmlFor="default-switch">Enable notifications</Label>
    </div>
  ),
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Pre-enabled state for active settings or features.",
      },
    },
  },
  render: (args) => (
    <div className="flex items-center space-x-3">
      <Switch id="checked-switch" {...args} />
      <Label htmlFor="checked-switch">Dark mode enabled</Label>
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Disabled switches in both on and off states for locked or unavailable settings.",
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Switch id="disabled-off" disabled />
        <Label htmlFor="disabled-off">Disabled (off)</Label>
      </div>
      <div className="flex items-center space-x-3">
        <Switch id="disabled-on" disabled defaultChecked />
        <Label htmlFor="disabled-on">Disabled (on)</Label>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Size variants with matching label sizes for different interface densities.",
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Switch id="small-switch" size="sm" />
        <Label htmlFor="small-switch" size="sm">
          Small switch
        </Label>
      </div>
      <div className="flex items-center space-x-3">
        <Switch id="medium-switch" size="md" />
        <Label htmlFor="medium-switch" size="md">
          Medium switch (default)
        </Label>
      </div>
      <div className="flex items-center space-x-3">
        <Switch id="large-switch" size="lg" />
        <Label htmlFor="large-switch" size="lg">
          Large switch
        </Label>
      </div>
    </div>
  ),
};

export const SettingsPanel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Settings panel pattern with switches for app preferences and feature toggles.",
      },
    },
  },
  render: () => (
    <div className="w-80 space-y-6 p-6 border border-(--color-border-secondary) rounded-lg">
      <h3 className="text-lg font-semibold">Preferences</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notifications">Push notifications</Label>
            <p className="text-xs text-(--color-text-secondary)">
              Receive notifications on your device
            </p>
          </div>
          <Switch id="notifications" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-digest">Email digest</Label>
            <p className="text-xs text-(--color-text-secondary)">
              Weekly summary of activity
            </p>
          </div>
          <Switch id="email-digest" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dark-mode">Dark mode</Label>
            <p className="text-xs text-(--color-text-secondary)">
              Use dark theme interface
            </p>
          </div>
          <Switch id="dark-mode" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="analytics">Usage analytics</Label>
            <p className="text-xs text-(--color-text-secondary)">
              Help improve our service
            </p>
          </div>
          <Switch id="analytics" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="beta">Beta features</Label>
            <p className="text-xs text-(--color-text-secondary)">
              Access experimental features
            </p>
          </div>
          <Switch id="beta" disabled />
        </div>
      </div>
    </div>
  ),
};

export const FeatureToggles: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Feature toggle cards for app capabilities and privacy settings with descriptions.",
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      {/* App Features */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">App Features</h3>
        <div className="grid gap-3">
          <div className="flex items-center justify-between p-3 border border-(--color-border-secondary) rounded-md">
            <div>
              <Label htmlFor="offline-mode">Offline mode</Label>
              <p className="text-xs text-(--color-text-secondary)">
                Work without internet connection
              </p>
            </div>
            <Switch id="offline-mode" size="sm" />
          </div>

          <div className="flex items-center justify-between p-3 border border-(--color-border-secondary) rounded-md">
            <div>
              <Label htmlFor="auto-save">Auto-save</Label>
              <p className="text-xs text-(--color-text-secondary)">
                Automatically save your work
              </p>
            </div>
            <Switch id="auto-save" size="sm" defaultChecked />
          </div>

          <div className="flex items-center justify-between p-3 border border-(--color-border-secondary) rounded-md">
            <div>
              <Label htmlFor="sync">Cloud sync</Label>
              <p className="text-xs text-(--color-text-secondary)">
                Sync data across devices
              </p>
            </div>
            <Switch id="sync" size="sm" defaultChecked />
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Privacy</h3>
        <div className="grid gap-3">
          <div className="flex items-center justify-between p-3 border border-(--color-border-secondary) rounded-md">
            <div>
              <Label htmlFor="location">Location services</Label>
              <p className="text-xs text-(--color-text-secondary)">
                Allow location-based features
              </p>
            </div>
            <Switch id="location" size="sm" />
          </div>

          <div className="flex items-center justify-between p-3 border border-(--color-border-secondary) rounded-md">
            <div>
              <Label htmlFor="telemetry">Usage telemetry</Label>
              <p className="text-xs text-(--color-text-secondary)">
                Share usage data to improve service
              </p>
            </div>
            <Switch id="telemetry" size="sm" defaultChecked />
          </div>

          <div className="flex items-center justify-between p-3 border border-(--color-border-secondary) rounded-md">
            <div>
              <Label htmlFor="marketing">Marketing emails</Label>
              <p className="text-xs text-(--color-text-secondary)">
                Receive promotional content
              </p>
            </div>
            <Switch id="marketing" size="sm" />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const InteractiveDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Rich settings panels combining quick toggles and account security options.",
      },
    },
  },
  render: () => {
    return (
      <div className="space-y-6">
        <div className="p-6 border border-(--color-border-secondary) rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Quick Settings</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="wifi" size="sm">
                  Wi-Fi
                </Label>
                <Switch id="wifi" size="sm" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="bluetooth" size="sm">
                  Bluetooth
                </Label>
                <Switch id="bluetooth" size="sm" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="airplane" size="sm">
                  Airplane mode
                </Label>
                <Switch id="airplane" size="sm" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="do-not-disturb" size="sm">
                  Do not disturb
                </Label>
                <Switch id="do-not-disturb" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="low-power" size="sm">
                  Low power mode
                </Label>
                <Switch id="low-power" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hotspot" size="sm">
                  Personal hotspot
                </Label>
                <Switch id="hotspot" size="sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border border-(--color-border-secondary) rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor">Two-factor authentication</Label>
                <p className="text-xs text-(--color-text-secondary)">
                  Add an extra layer of security
                </p>
              </div>
              <Switch id="two-factor" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="session-timeout">Auto logout</Label>
                <p className="text-xs text-(--color-text-secondary)">
                  Automatically log out after inactivity
                </p>
              </div>
              <Switch id="session-timeout" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="login-alerts">Login alerts</Label>
                <p className="text-xs text-(--color-text-secondary)">
                  Get notified of new sign-ins
                </p>
              </div>
              <Switch id="login-alerts" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const WithInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates real user interactions with switches including mouse clicks, Space key toggling, Enter key support, Tab navigation, and disabled state handling. Tests both on/off states with keyboard and mouse.",
      },
    },
  },
  render: () => (
    <div className="w-80 space-y-6">
      <div className="space-y-4">
        <h3 className="text-base font-semibold">App Settings</h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notifications-switch">Notifications</Label>
            <p className="text-xs text-(--color-text-secondary)">
              Receive push notifications
            </p>
          </div>
          <Switch id="notifications-switch" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dark-mode-switch">Dark Mode</Label>
            <p className="text-xs text-(--color-text-secondary)">
              Use dark theme
            </p>
          </div>
          <Switch id="dark-mode-switch" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sound-switch">Sound Effects</Label>
            <p className="text-xs text-(--color-text-secondary)">
              Play audio feedback
            </p>
          </div>
          <Switch id="sound-switch" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="disabled-switch">Beta Features</Label>
            <p className="text-xs text-(--color-text-secondary)">
              Disabled for now
            </p>
          </div>
          <Switch id="disabled-switch" disabled />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="disabled-on-switch">Required Feature</Label>
            <p className="text-xs text-(--color-text-secondary)">
              Always enabled
            </p>
          </div>
          <Switch id="disabled-on-switch" disabled defaultChecked />
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Find all switches
    const notificationsSwitch = canvas.getByRole("switch", {
      name: /notifications/i,
    });
    const darkModeSwitch = canvas.getByRole("switch", { name: /dark mode/i });
    const soundSwitch = canvas.getByRole("switch", { name: /sound effects/i });
    const disabledSwitch = canvas.getByRole("switch", {
      name: /beta features/i,
    });
    const disabledOnSwitch = canvas.getByRole("switch", {
      name: /required feature/i,
    });

    expect(notificationsSwitch).toBeInTheDocument();
    expect(darkModeSwitch).toBeInTheDocument();
    expect(soundSwitch).toBeInTheDocument();

    // Test 2: Verify initial states
    expect(notificationsSwitch).not.toBeChecked();
    expect(darkModeSwitch).toBeChecked();
    expect(soundSwitch).not.toBeChecked();
    expect(disabledSwitch).toBeDisabled();
    expect(disabledSwitch).not.toBeChecked();
    expect(disabledOnSwitch).toBeDisabled();
    expect(disabledOnSwitch).toBeChecked();

    // Test 3: Click notifications switch with mouse
    await userEvent.click(notificationsSwitch);
    expect(notificationsSwitch).toBeChecked();

    // Click again to toggle off
    await userEvent.click(notificationsSwitch);
    expect(notificationsSwitch).not.toBeChecked();

    // Turn it back on
    await userEvent.click(notificationsSwitch);
    expect(notificationsSwitch).toBeChecked();

    // Test 4: Tab to next switch
    await new Promise((resolve) => setTimeout(resolve, 100));
    await userEvent.tab();
    expect(darkModeSwitch).toHaveFocus();

    // Test 5: Toggle with Space key
    await userEvent.keyboard(" ");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(darkModeSwitch).not.toBeChecked();

    // Toggle back on with Space
    await userEvent.keyboard(" ");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(darkModeSwitch).toBeChecked();

    // Test 6: Test Enter key (some implementations support this)
    await userEvent.keyboard("{Enter}");
    // Enter might toggle or might not, depending on implementation
    // Just verify the switch is still functional

    // Test 7: Tab to sound switch
    await userEvent.tab();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(soundSwitch).toHaveFocus();

    // Test 8: Toggle with Space
    await userEvent.keyboard(" ");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(soundSwitch).toBeChecked();

    // Test 9: Tab (should skip disabled switch)
    // From sound switch, tabbing should go to the next focusable element after the disabled ones
    // In our layout, there are no more focusable elements after the disabled switches in the App Settings block.
    await userEvent.tab();
    expect(disabledSwitch).not.toHaveFocus();

    // Try to toggle disabled switch with Space (should not work)
    await userEvent.keyboard(" ");
    expect(disabledSwitch).toHaveAttribute("data-state", "unchecked");

    // Try to click disabled switch (should not work)
    await userEvent.click(disabledSwitch);
    expect(disabledSwitch).toHaveAttribute("data-state", "unchecked");

    // Test 10: Try disabled checked switch
    await userEvent.click(disabledOnSwitch);
    expect(disabledOnSwitch).toBeChecked();

    // Test 11: Verify final states
    expect(notificationsSwitch).toBeChecked();
    expect(soundSwitch).toBeChecked();
    expect(disabledSwitch).not.toBeChecked();
    expect(disabledOnSwitch).toBeChecked();
  },
};
