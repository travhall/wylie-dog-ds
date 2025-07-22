import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "@wyliedog/ui/separator";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "The orientation of the separator",
    },
    decorative: {
      control: "boolean",
      description: "Whether the separator is purely decorative",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
  render: (args) => (
    <div className="w-64">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator {...args} className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>Blog</div>
      <Separator {...args} />
      <div>Docs</div>
      <Separator {...args} />
      <div>Source</div>
    </div>
  ),
};

export const InContent: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Navigation</h3>
        <p className="text-sm text-gray-600">
          Primary navigation items for the application.
        </p>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-semibold">Settings</h3>
        <p className="text-sm text-gray-600">
          Configuration options and preferences.
        </p>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-semibold">Account</h3>
        <p className="text-sm text-gray-600">
          User account management and profile settings.
        </p>
      </div>
    </div>
  ),
};

export const InLists: Story = {
  render: () => (
    <div className="w-64 space-y-1">
      <div className="px-3 py-2 text-sm hover:bg-gray-100 rounded">
        Profile
      </div>
      <div className="px-3 py-2 text-sm hover:bg-gray-100 rounded">
        Settings
      </div>
      <Separator className="my-1" />
      <div className="px-3 py-2 text-sm hover:bg-gray-100 rounded">
        Team
      </div>
      <div className="px-3 py-2 text-sm hover:bg-gray-100 rounded">
        Billing
      </div>
      <Separator className="my-1" />
      <div className="px-3 py-2 text-sm hover:bg-gray-100 rounded">
        Logout
      </div>
    </div>
  ),
};