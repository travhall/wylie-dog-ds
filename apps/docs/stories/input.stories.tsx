import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@wyliedog/ui/input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Enter text..." },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <label htmlFor="email" className="text-sm font-medium text-neutral-700">
        Email Address
      </label>
      <Input 
        id="email"
        type="email" 
        placeholder="your@email.com" 
      />
    </div>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <label htmlFor="username" className="text-sm font-medium text-neutral-700">
        Username
      </label>
      <Input 
        id="username"
        variant="error" 
        placeholder="Enter username"
        defaultValue="invalid username!"
      />
      <p className="text-sm text-error-700">Username must be at least 3 characters long</p>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Small Input</label>
        <Input size="sm" placeholder="Small input (h-8)" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Medium Input</label>
        <Input size="md" placeholder="Medium input (h-10)" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Large Input</label>
        <Input size="lg" placeholder="Large input (h-12)" />
      </div>
    </div>
  ),
};

export const InputTypes: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Text</label>
        <Input type="text" placeholder="Enter text" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Email</label>
        <Input type="email" placeholder="email@example.com" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Password</label>
        <Input type="password" placeholder="••••••••" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Number</label>
        <Input type="number" placeholder="123" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Search</label>
        <Input type="search" placeholder="Search..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">URL</label>
        <Input type="url" placeholder="https://example.com" />
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="w-80 space-y-4">
      <div className="space-y-2">
        <label htmlFor="firstName" className="text-sm font-medium text-neutral-700">
          First Name *
        </label>
        <Input id="firstName" placeholder="John" required />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="lastName" className="text-sm font-medium text-neutral-700">
          Last Name *
        </label>
        <Input id="lastName" placeholder="Doe" required />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="emailForm" className="text-sm font-medium text-neutral-700">
          Email Address *
        </label>
        <Input id="emailForm" type="email" placeholder="john@example.com" required />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium text-neutral-700">
          Phone Number
        </label>
        <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="company" className="text-sm font-medium text-neutral-700">
          Company
        </label>
        <Input id="company" placeholder="Acme Corp" />
      </div>
      
      <button 
        type="submit"
        className="w-full bg-primary-500 text-white py-2 px-4 rounded hover:bg-primary-600 transition-colors"
      >
        Submit Form
      </button>
    </form>
  ),
};
