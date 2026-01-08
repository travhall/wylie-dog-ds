import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import { Textarea } from "@wyliedog/ui/textarea";
import { Label } from "@wyliedog/ui/label";

const meta: Meta<typeof Textarea> = {
  title: "3. Components/Forms/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Textarea component for multi-line text input with support for different sizes, error states, and resize behaviors.",
      },
    },
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
      <Label htmlFor="error-textarea" error required>
        Description
      </Label>
      <Textarea id="error-textarea" {...args} />
      <p className="text-xs text-red-600">
        This field is required and must be at least 10 characters
      </p>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="w-96 space-y-2">
        <Label size="sm">Small Textarea</Label>
        <Textarea
          size="sm"
          placeholder="Small textarea for brief comments..."
        />
      </div>
      <div className="w-96 space-y-2">
        <Label size="md">Medium Textarea (Default)</Label>
        <Textarea
          size="md"
          placeholder="Medium textarea for standard input..."
        />
      </div>
      <div className="w-96 space-y-2">
        <Label size="lg">Large Textarea</Label>
        <Textarea
          size="lg"
          placeholder="Large textarea for detailed descriptions..."
        />
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
        <Textarea error placeholder="Textarea with error" className="w-64" />
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
            <Label htmlFor="feedback-name" required>
              Name
            </Label>
            <input
              id="feedback-name"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback-email" required>
              Email
            </Label>
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
          <Label htmlFor="feedback-message" required>
            Message
          </Label>
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

export const WithInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates real user interactions with textarea including typing single and multiline text, clearing content, Tab navigation, Enter key for new lines, and keyboard shortcuts like Ctrl+A for select all.",
      },
    },
  },
  render: () => (
    <div className="w-125 space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description-textarea" required>
            Description
          </Label>
          <Textarea
            id="description-textarea"
            placeholder="Enter a brief description..."
            className="min-h-20"
          />
          <p className="text-xs text-neutral-600">At least 10 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment-textarea">Additional Comments</Label>
          <Textarea
            id="comment-textarea"
            placeholder="Share your thoughts..."
            className="min-h-30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="disabled-textarea">Disabled Field</Label>
          <Textarea
            id="disabled-textarea"
            disabled
            defaultValue="This content cannot be edited"
            className="min-h-20"
          />
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Find all textareas
    const descriptionTextarea = canvas.getByLabelText(/^description$/i);
    const commentTextarea = canvas.getByLabelText(/additional comments/i);
    const disabledTextarea = canvas.getByLabelText(/disabled field/i);

    expect(descriptionTextarea).toBeInTheDocument();
    expect(commentTextarea).toBeInTheDocument();
    expect(disabledTextarea).toBeInTheDocument();
    expect(disabledTextarea).toBeDisabled();

    // Test 2: Click and focus description textarea
    await userEvent.click(descriptionTextarea);
    expect(descriptionTextarea).toHaveFocus();

    // Test 3: Type single line text
    await userEvent.type(descriptionTextarea, "This is a test description");
    expect(descriptionTextarea).toHaveValue("This is a test description");

    // Test 4: Add multiline content with Enter key
    await userEvent.keyboard("{Enter}");
    await userEvent.type(descriptionTextarea, "Second line of text");
    expect(descriptionTextarea).toHaveValue(
      "This is a test description\nSecond line of text"
    );

    // Test 5: Add another line
    await userEvent.keyboard("{Enter}");
    await userEvent.type(descriptionTextarea, "Third line added");
    expect(descriptionTextarea).toHaveValue(
      "This is a test description\nSecond line of text\nThird line added"
    );

    // Test 6: Clear textarea
    await userEvent.clear(descriptionTextarea);
    expect(descriptionTextarea).toHaveValue("");

    // Test 7: Type longer multiline content
    await userEvent.type(
      descriptionTextarea,
      "Line 1{Enter}Line 2{Enter}Line 3"
    );
    expect(descriptionTextarea).toHaveValue("Line 1\nLine 2\nLine 3");

    // Test 8: Select all with keyboard shortcut
    await userEvent.keyboard("{Control>}a{/Control}");
    await userEvent.type(descriptionTextarea, "Replaced content");
    expect(descriptionTextarea).toHaveValue("Replaced content");

    // Test 9: Tab to next textarea
    await userEvent.tab();
    expect(commentTextarea).toHaveFocus();

    // Test 10: Type in comment textarea
    await userEvent.type(
      commentTextarea,
      "Here are my comments:{Enter}1. First point{Enter}2. Second point"
    );
    expect(commentTextarea).toHaveValue(
      "Here are my comments:\n1. First point\n2. Second point"
    );

    // Test 11: Tab to disabled textarea
    await userEvent.tab();
    expect(disabledTextarea).toHaveFocus();

    // Try to type in disabled textarea (should not work)
    const originalValue = disabledTextarea.value;
    await userEvent.type(disabledTextarea, "This should not appear");
    expect(disabledTextarea).toHaveValue(originalValue);

    // Test 12: Verify placeholder visibility
    await userEvent.clear(commentTextarea);
    expect(commentTextarea).toHaveValue("");
    expect(commentTextarea).toHaveAttribute(
      "placeholder",
      "Share your thoughts..."
    );

    // Test 13: Type special characters
    await userEvent.type(
      commentTextarea,
      "Special chars: @#$%{Enter}Numbers: 123"
    );
    expect(commentTextarea).toHaveValue("Special chars: @#$%\nNumbers: 123");
  },
};
