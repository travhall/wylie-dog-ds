import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@wyliedog/ui/button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline"],
      description: "The visual style of the button",
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "The size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { 
    children: "Primary Button",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: { 
    variant: "secondary", 
    children: "Secondary Button" 
  },
};

export const Outline: Story = {
  args: { 
    variant: "outline", 
    children: "Outline Button" 
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button>Normal</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex gap-4">
        <Button variant="secondary">Normal Secondary</Button>
        <Button variant="secondary" disabled>Disabled Secondary</Button>
      </div>
      <div className="flex gap-4">
        <Button variant="outline">Normal Outline</Button>
        <Button variant="outline" disabled>Disabled Outline</Button>
      </div>
    </div>
  ),
};

export const ButtonGroup: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-neutral-700">Action Group</h4>
        <div className="flex gap-2">
          <Button>Save</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-neutral-700">Navigation Group</h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button size="sm">Next</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-neutral-700">Toolbar</h4>
        <div className="flex gap-1">
          <Button variant="outline" size="sm">Edit</Button>
          <Button variant="outline" size="sm">Copy</Button>
          <Button variant="outline" size="sm">Delete</Button>
        </div>
      </div>
    </div>
  ),
};

export const ButtonsInForms: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Email Address
        </label>
        <input 
          type="email" 
          placeholder="your@email.com"
          className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Password
        </label>
        <input 
          type="password" 
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <Button className="w-full">Sign In</Button>
        <Button variant="outline" className="w-full">Create Account</Button>
      </div>
      
      <div className="text-center">
        <Button variant="outline" size="sm">Forgot Password?</Button>
      </div>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </span>
      </Button>
      <Button variant="secondary" disabled>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </span>
      </Button>
    </div>
  ),
};
