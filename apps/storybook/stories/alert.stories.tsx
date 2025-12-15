import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert, AlertTitle, AlertDescription } from "@wyliedog/ui/alert";

const meta: Meta<typeof Alert> = {
  title: "3. Components/Feedback/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Alert component for displaying important messages to users. Includes support for different variants (default, destructive, warning, success) and compound components for structured content.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "warning", "success"],
      description: "The visual style variant of the alert",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Default Alert</AlertTitle>
      <AlertDescription>
        This is a default alert message with informational content.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Something went wrong! Please check your input and try again.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        This action cannot be undone. Please proceed with caution.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert variant="success">
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully!
      </AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="w-[600px] space-y-4">
      <Alert>
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>
          This is a default alert with informational content.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertTitle>Error Alert</AlertTitle>
        <AlertDescription>
          Something went wrong! Please check your input and try again.
        </AlertDescription>
      </Alert>

      <Alert variant="warning">
        <AlertTitle>Warning Alert</AlertTitle>
        <AlertDescription>
          This action cannot be undone. Please proceed with caution.
        </AlertDescription>
      </Alert>

      <Alert variant="success">
        <AlertTitle>Success Alert</AlertTitle>
        <AlertDescription>
          Your changes have been saved successfully!
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <Alert>
        <AlertDescription>
          A simple alert message without a title.
        </AlertDescription>
      </Alert>

      <Alert variant="warning">
        <AlertDescription>
          Warning message without a title - just the description.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <div className="w-[600px]">
      <Alert variant="warning">
        <AlertTitle>Storage Limit Warning</AlertTitle>
        <AlertDescription>
          You have used 95% of your available storage space. Your account will
          be suspended if you exceed 100%. Consider upgrading your plan or
          removing unused files. You can manage your storage in the account
          settings page or contact support for assistance with data migration
          options.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const InFormContext: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <h3 className="text-lg font-semibold">User Registration</h3>

      <Alert variant="destructive">
        <AlertTitle>Form Validation Error</AlertTitle>
        <AlertDescription>
          Please correct the following errors before submitting:
          <ul className="mt-2 list-disc list-inside text-sm">
            <li>Email address is required</li>
            <li>Password must be at least 8 characters</li>
            <li>Terms of service must be accepted</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="mt-1 w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Create a password"
          />
        </div>

        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Create Account
        </button>
      </div>
    </div>
  ),
};
