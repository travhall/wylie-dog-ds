import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "@wyliedog/ui/switch";
import { Label } from "@wyliedog/ui/label";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: 'Switch component for binary choices, built on Radix UI with smooth animations and full accessibility support. Perfect for settings and feature toggles.'
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "The size of the switch",
    },
    disabled: {
      control: "boolean",
      description: "Whether the switch is disabled",
    },
    checked: {
      control: "boolean",
      description: "Whether the switch is checked/on",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
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
  render: (args) => (
    <div className="flex items-center space-x-3">
      <Switch id="checked-switch" {...args} />
      <Label htmlFor="checked-switch">Dark mode enabled</Label>
    </div>
  ),
};

export const Disabled: Story = {
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
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Switch id="small-switch" size="sm" />
        <Label htmlFor="small-switch" size="sm">Small switch</Label>
      </div>
      <div className="flex items-center space-x-3">
        <Switch id="medium-switch" size="md" />
        <Label htmlFor="medium-switch" size="md">Medium switch (default)</Label>
      </div>
      <div className="flex items-center space-x-3">
        <Switch id="large-switch" size="lg" />
        <Label htmlFor="large-switch" size="lg">Large switch</Label>
      </div>
    </div>
  ),
};

export const SettingsPanel: Story = {
  render: () => (
    <div className="w-80 space-y-6 p-6 border border-neutral-200 rounded-lg">
      <h3 className="text-lg font-semibold">Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notifications">Push notifications</Label>
            <p className="text-xs text-neutral-600">Receive notifications on your device</p>
          </div>
          <Switch id="notifications" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-digest">Email digest</Label>
            <p className="text-xs text-neutral-600">Weekly summary of activity</p>
          </div>
          <Switch id="email-digest" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dark-mode">Dark mode</Label>
            <p className="text-xs text-neutral-600">Use dark theme interface</p>
          </div>
          <Switch id="dark-mode" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="analytics">Usage analytics</Label>
            <p className="text-xs text-neutral-600">Help improve our service</p>
          </div>
          <Switch id="analytics" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="beta">Beta features</Label>
            <p className="text-xs text-neutral-600">Access experimental features</p>
          </div>
          <Switch id="beta" disabled />
        </div>
      </div>
    </div>
  ),
};

export const FeatureToggles: Story = {
  render: () => (
    <div className="space-y-6">
      {/* App Features */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">App Features</h3>
        <div className="grid gap-3">
          <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-md">
            <div>
              <Label htmlFor="offline-mode">Offline mode</Label>
              <p className="text-xs text-neutral-600">Work without internet connection</p>
            </div>
            <Switch id="offline-mode" size="sm" />
          </div>
          
          <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-md">
            <div>
              <Label htmlFor="auto-save">Auto-save</Label>
              <p className="text-xs text-neutral-600">Automatically save your work</p>
            </div>
            <Switch id="auto-save" size="sm" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-md">
            <div>
              <Label htmlFor="sync">Cloud sync</Label>
              <p className="text-xs text-neutral-600">Sync data across devices</p>
            </div>
            <Switch id="sync" size="sm" defaultChecked />
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Privacy</h3>
        <div className="grid gap-3">
          <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-md">
            <div>
              <Label htmlFor="location">Location services</Label>
              <p className="text-xs text-neutral-600">Allow location-based features</p>
            </div>
            <Switch id="location" size="sm" />
          </div>
          
          <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-md">
            <div>
              <Label htmlFor="telemetry">Usage telemetry</Label>
              <p className="text-xs text-neutral-600">Share usage data to improve service</p>
            </div>
            <Switch id="telemetry" size="sm" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-md">
            <div>
              <Label htmlFor="marketing">Marketing emails</Label>
              <p className="text-xs text-neutral-600">Receive promotional content</p>
            </div>
            <Switch id="marketing" size="sm" />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const InteractiveDemo: Story = {
  render: () => {
    return (
      <div className="space-y-6">
        <div className="p-6 border border-neutral-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Quick Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="wifi" size="sm">Wi-Fi</Label>
                <Switch id="wifi" size="sm" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="bluetooth" size="sm">Bluetooth</Label>
                <Switch id="bluetooth" size="sm" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="airplane" size="sm">Airplane mode</Label>
                <Switch id="airplane" size="sm" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="do-not-disturb" size="sm">Do not disturb</Label>
                <Switch id="do-not-disturb" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="low-power" size="sm">Low power mode</Label>
                <Switch id="low-power" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hotspot" size="sm">Personal hotspot</Label>
                <Switch id="hotspot" size="sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border border-neutral-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor">Two-factor authentication</Label>
                <p className="text-xs text-neutral-600">Add an extra layer of security</p>
              </div>
              <Switch id="two-factor" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="session-timeout">Auto logout</Label>
                <p className="text-xs text-neutral-600">Automatically log out after inactivity</p>
              </div>
              <Switch id="session-timeout" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="login-alerts">Login alerts</Label>
                <p className="text-xs text-neutral-600">Get notified of new sign-ins</p>
              </div>
              <Switch id="login-alerts" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    );
  },
};