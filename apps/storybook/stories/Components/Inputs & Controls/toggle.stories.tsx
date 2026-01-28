import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toggle } from "@wyliedog/ui/toggle";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  MicIcon,
  MicOffIcon,
  VolumeXIcon,
  Volume2Icon,
  WifiIcon,
  WifiOffIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";

const meta: Meta<typeof Toggle> = {
  title: "Components/Inputs & Controls/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Boolean toggle button for on/off states. Built on Radix UI primitives with support for variants, sizes, and icons.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: ["default", "outline"],
      description: "Visual style variant",
    },
    size: {
      control: "radio",
      options: ["sm", "default", "lg"],
      description: "Size variant",
    },
    pressed: {
      control: "boolean",
      description: "Whether the toggle is pressed/active",
    },
    disabled: {
      control: "boolean",
      description: "Whether the toggle is disabled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Toggle",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle variant="default">Default</Toggle>
      <Toggle variant="outline">Outline</Toggle>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Available visual variants for different interface styles.",
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle size="sm">Small</Toggle>
      <Toggle size="default">Default</Toggle>
      <Toggle size="lg">Large</Toggle>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Size variants for different interface densities.",
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle aria-label="Toggle bold">
        <BoldIcon className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <ItalicIcon className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Toggle buttons with icons for compact interfaces.",
      },
    },
  },
};

export const TextFormatting: Story = {
  render: () => {
    const [bold, setBold] = React.useState(false);
    const [italic, setItalic] = React.useState(false);
    const [underline, setUnderline] = React.useState(false);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-1 p-2 border rounded-lg">
          <Toggle
            pressed={bold}
            onPressedChange={setBold}
            aria-label="Toggle bold"
            size="sm"
          >
            <BoldIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={italic}
            onPressedChange={setItalic}
            aria-label="Toggle italic"
            size="sm"
          >
            <ItalicIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={underline}
            onPressedChange={setUnderline}
            aria-label="Toggle underline"
            size="sm"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="p-4 border rounded-lg">
          <p
            className={`text-lg ${bold ? "font-bold" : ""} ${italic ? "italic" : ""} ${underline ? "underline" : ""}`}
          >
            This text will be formatted based on the toggle states above.
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Text formatting toolbar with multiple independent toggles.",
      },
    },
  },
};

export const MediaControls: Story = {
  render: () => {
    const [muted, setMuted] = React.useState(false);
    const [micMuted, setMicMuted] = React.useState(true);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-4 bg-neutral-900 text-white rounded-lg">
          <span className="text-sm">Audio Controls:</span>
          <Toggle
            pressed={muted}
            onPressedChange={setMuted}
            aria-label="Toggle speaker mute"
            className="text-white hover:bg-neutral-700 data-[state=on]:bg-red-600"
          >
            {muted ? (
              <VolumeXIcon className="h-4 w-4" />
            ) : (
              <Volume2Icon className="h-4 w-4" />
            )}
          </Toggle>
          <Toggle
            pressed={micMuted}
            onPressedChange={setMicMuted}
            aria-label="Toggle microphone mute"
            className="text-white hover:bg-neutral-700 data-[state=on]:bg-red-600"
          >
            {micMuted ? (
              <MicOffIcon className="h-4 w-4" />
            ) : (
              <MicIcon className="h-4 w-4" />
            )}
          </Toggle>
        </div>

        <div className="text-sm text-(--color-text-secondary)">
          Speaker: {muted ? "Muted" : "Active"} | Microphone:{" "}
          {micMuted ? "Muted" : "Active"}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Media control toggles with dynamic icons and state feedback.",
      },
    },
  },
};

export const Settings: Story = {
  render: () => {
    const [wifi, setWifi] = React.useState(true);
    const [notifications, setNotifications] = React.useState(true);
    const [location, setLocation] = React.useState(false);
    const [analytics, setAnalytics] = React.useState(false);

    return (
      <div className="space-y-4 max-w-md">
        <h3 className="text-lg font-semibold">System Settings</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {wifi ? (
                <WifiIcon className="h-5 w-5" />
              ) : (
                <WifiOffIcon className="h-5 w-5" />
              )}
              <span className="font-medium">Wi-Fi</span>
            </div>
            <Toggle pressed={wifi} onPressedChange={setWifi} />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <div>
                <div className="font-medium">Notifications</div>
                <div className="text-sm text-(--color-text-secondary)">
                  Push notifications and alerts
                </div>
              </div>
            </div>
            <Toggle
              pressed={notifications}
              onPressedChange={setNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">📍</span>
              <div>
                <div className="font-medium">Location Services</div>
                <div className="text-sm text-(--color-text-secondary)">
                  Share location data
                </div>
              </div>
            </div>
            <Toggle pressed={location} onPressedChange={setLocation} />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <div>
                <div className="font-medium">Analytics</div>
                <div className="text-sm text-(--color-text-secondary)">
                  Usage data collection
                </div>
              </div>
            </div>
            <Toggle pressed={analytics} onPressedChange={setAnalytics} />
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Settings panel with labeled toggles for system preferences.",
      },
    },
  },
};

export const ViewToggle: Story = {
  render: () => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="space-y-4 max-w-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <div className="flex items-center gap-2">
            <input
              type={showPassword ? "text" : "password"}
              defaultValue="secretpassword123"
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <Toggle
              pressed={showPassword}
              onPressedChange={setShowPassword}
              aria-label="Toggle password visibility"
              variant="outline"
              size="sm"
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </Toggle>
          </div>
        </div>

        <p className="text-xs text-(--color-text-secondary)">
          Click the eye icon to {showPassword ? "hide" : "show"} password
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Password visibility toggle with contextual icon changes.",
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="font-medium">Normal States</h4>
        <div className="flex items-center gap-2">
          <Toggle>Off</Toggle>
          <Toggle pressed>On</Toggle>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Disabled States</h4>
        <div className="flex items-center gap-2">
          <Toggle disabled>Disabled Off</Toggle>
          <Toggle disabled pressed>
            Disabled On
          </Toggle>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Outline Variant</h4>
        <div className="flex items-center gap-2">
          <Toggle variant="outline">Off</Toggle>
          <Toggle variant="outline" pressed>
            On
          </Toggle>
          <Toggle variant="outline" disabled>
            Disabled
          </Toggle>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All possible states and variants of the toggle component.",
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <p className="text-sm text-(--color-text-secondary)">
          Toggle buttons support keyboard navigation, screen readers, and proper
          ARIA states.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Toggle
            aria-label="Enable dark mode"
            aria-describedby="dark-mode-description"
          >
            🌙 Dark Mode
          </Toggle>
          <p
            id="dark-mode-description"
            className="text-sm text-(--color-text-secondary)"
          >
            Switch to dark theme
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Toggle
            aria-label="Enable high contrast mode"
            aria-describedby="contrast-description"
          >
            ⚡ High Contrast
          </Toggle>
          <p
            id="contrast-description"
            className="text-sm text-(--color-text-secondary)"
          >
            Increase visual contrast
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Toggle
            aria-label="Enable large text mode"
            aria-describedby="text-description"
          >
            🔍 Large Text
          </Toggle>
          <p
            id="text-description"
            className="text-sm text-(--color-text-secondary)"
          >
            Increase font sizes
          </p>
        </div>
      </div>

      <p className="text-xs text-(--color-text-secondary)">
        Use Tab to navigate, Space or Enter to toggle
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates comprehensive accessibility features including ARIA labels and descriptions.",
      },
    },
  },
};
