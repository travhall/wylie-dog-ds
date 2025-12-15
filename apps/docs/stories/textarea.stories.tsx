import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "@wyliedog/ui/textarea";
import { Label } from "@wyliedog/ui/label";

const meta: Meta<typeof Textarea> = {
  title: "3. Components/Inputs/Textarea",
  component: Textarea,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: 'Textarea component for multi-line text input with support for different sizes, error states, and resize behaviors.'
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "The size of the textarea",
    },
    error: {
      control: "boolean",
      description: "Whether the textarea should show error styling",
    },
    resize: {
      control: "select",
      options: ["none", "both", "horizontal", "vertical"],
      description: "Resize behavior of the textarea",
    },
    disabled: {
      control: "boolean",
      description: "Whether the textarea is disabled",
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
    placeholder: "Enter your message...",
  },
  render: (args) => (
    <div className="w-96 space-y-2">
      <Label htmlFor="default-textarea">Message</Label>
      <Textarea id="default-textarea" {...args} />
    </div>
  ),
};

export const WithError: Story = {
  args: {
    error: true,
    placeholder: "This field has an error",
  },
  render: (args) => (
    <div className="w-96 space-y-2">
      <Label htmlFor="error-textarea" error required>Description</Label>
      <Textarea id="error-textarea" {...args} />
      <p className="text-xs text-red-600">This field is required and must be at least 10 characters</p>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="w-96 space-y-2">
        <Label size="sm">Small Textarea</Label>
        <Textarea size="sm" placeholder="Small textarea for brief comments..." />
      </div>
      <div className="w-96 space-y-2">
        <Label size="md">Medium Textarea (Default)</Label>
        <Textarea size="md" placeholder="Medium textarea for standard input..." />
      </div>
      <div className="w-96 space-y-2">
        <Label size="lg">Large Textarea</Label>
        <Textarea size="lg" placeholder="Large textarea for detailed descriptions..." />
      </div>
    </div>
  ),
};

export const ResizeOptions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>No Resize</Label>
        <Textarea 
          resize="none" 
          placeholder="This textarea cannot be resized"
          className="w-64" 
        />
      </div>
      <div className="space-y-2">
        <Label>Vertical Resize (Default)</Label>
        <Textarea 
          resize="vertical" 
          placeholder="This textarea can be resized vertically"
          className="w-64" 
        />
      </div>
      <div className="space-y-2">
        <Label>Horizontal Resize</Label>
        <Textarea 
          resize="horizontal" 
          placeholder="This textarea can be resized horizontally"
          className="w-64" 
        />
      </div>
      <div className="space-y-2">
        <Label>Both Directions</Label>
        <Textarea 
          resize="both" 
          placeholder="This textarea can be resized in both directions"
          className="w-64" 
        />
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>Normal State</Label>
        <Textarea placeholder="Normal textarea" className="w-64" />
      </div>
      <div className="space-y-2">
        <Label>Disabled State</Label>
        <Textarea 
          disabled 
          placeholder="Disabled textarea" 
          className="w-64"
          defaultValue="This content cannot be edited"
        />
      </div>
      <div className="space-y-2">
        <Label error>Error State</Label>
        <Textarea 
          error 
          placeholder="Textarea with error" 
          className="w-64"
        />
      </div>
      <div className="space-y-2">
        <Label>With Content</Label>
        <Textarea 
          className="w-64"
          defaultValue="This textarea has some existing content that demonstrates how text flows within the component."
        />
      </div>
    </div>
  ),
};

export const FormExamples: Story = {
  render: () => (
    <div className="max-w-2xl space-y-8">
      {/* Feedback Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Feedback Form</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-name" required>Name</Label>
            <input 
              id="feedback-name"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback-email" required>Email</Label>
            <input 
              id="feedback-email"
              type="email"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="feedback-subject">Subject</Label>
          <input 
            id="feedback-subject"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's this about?"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="feedback-message" required>Message</Label>
          <Textarea 
            id="feedback-message"
            placeholder="Tell us what you think..."
            className="w-full"
          />
        </div>
      </div>

      {/* Comment Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comment Form</h3>
        
        <div className="space-y-2">
          <Label htmlFor="comment">Add a comment</Label>
          <Textarea 
            id="comment"
            size="sm"
            resize="none"
            placeholder="Share your thoughts..."
            className="w-full"
          />
        </div>
        
        <div className="flex justify-between items-center text-xs text-neutral-500">
          <span>0 / 500 characters</span>
          <span>Markdown supported</span>
        </div>
      </div>
    </div>
  ),
};