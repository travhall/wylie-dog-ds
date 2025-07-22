import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Button } from "@wyliedog/ui/button";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: 'Input component for single-line text input with support for different sizes, types, and error states.'
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "The size of the input",
    },
    error: {
      control: "boolean",
      description: "Whether the input should show error styling",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "url", "tel"],
      description: "The type of input",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { 
    placeholder: "Enter text..." 
  },
  render: (args) => (
    <div className="w-64 space-y-2">
      <Label htmlFor="default-input">Default Input</Label>
      <Input id="default-input" {...args} />
    </div>
  ),
};

export const WithError: Story = {
  args: {
    error: true,
    placeholder: "This field has an error"
  },
  render: (args) => (
    <div className="w-64 space-y-2">
      <Label htmlFor="error-input" error required>Username</Label>
      <Input id="error-input" {...args} />
      <p className="text-xs text-red-600">Username must be at least 3 characters long</p>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="w-64 space-y-2">
        <Label size="sm">Small Input</Label>
        <Input size="sm" placeholder="Small input" />
      </div>
      <div className="w-64 space-y-2">
        <Label size="md">Medium Input (Default)</Label>
        <Input size="md" placeholder="Medium input" />
      </div>
      <div className="w-64 space-y-2">
        <Label size="lg">Large Input</Label>
        <Input size="lg" placeholder="Large input" />
      </div>
    </div>
  ),
};

export const InputTypes: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="text-input">Text</Label>
        <Input id="text-input" type="text" placeholder="Enter text" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-input">Email</Label>
        <Input id="email-input" type="email" placeholder="email@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-input">Password</Label>
        <Input id="password-input" type="password" placeholder="••••••••" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="number-input">Number</Label>
        <Input id="number-input" type="number" placeholder="123" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="search-input">Search</Label>
        <Input id="search-input" type="search" placeholder="Search..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="url-input">URL</Label>
        <Input id="url-input" type="url" placeholder="https://example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tel-input">Phone</Label>
        <Input id="tel-input" type="tel" placeholder="+1 (555) 123-4567" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date-input">Date</Label>
        <Input id="date-input" type="date" />
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="normal-input">Normal State</Label>
        <Input id="normal-input" placeholder="Normal input" className="w-64" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="disabled-input">Disabled State</Label>
        <Input 
          id="disabled-input" 
          disabled 
          placeholder="Disabled input" 
          className="w-64"
          defaultValue="Cannot be edited"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="error-state-input" error>Error State</Label>
        <Input 
          id="error-state-input" 
          error 
          placeholder="Input with error" 
          className="w-64"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="filled-input">With Content</Label>
        <Input 
          id="filled-input"
          className="w-64"
          defaultValue="This input has content"
        />
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="w-96 space-y-6">
      <h3 className="text-lg font-semibold">Registration Form</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="form-first-name" required>First Name</Label>
            <Input id="form-first-name" placeholder="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-last-name" required>Last Name</Label>
            <Input id="form-last-name" placeholder="Doe" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="form-email" required>Email Address</Label>
          <Input id="form-email" type="email" placeholder="john@example.com" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="form-phone">Phone Number</Label>
          <Input id="form-phone" type="tel" placeholder="+1 (555) 123-4567" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="form-company">Company</Label>
          <Input id="form-company" placeholder="Acme Corp" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="form-password" required>Password</Label>
          <Input id="form-password" type="password" placeholder="••••••••" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="form-confirm-password" required>Confirm Password</Label>
          <Input id="form-confirm-password" type="password" placeholder="••••••••" />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button className="flex-1">Create Account</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </div>
    </div>
  ),
};