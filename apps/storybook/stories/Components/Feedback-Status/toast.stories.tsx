import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastTitle,
} from "@wyliedog/ui/toast";
import { Button } from "@wyliedog/ui/button";
import { useState } from "react";

const meta: Meta<typeof Toast> = {
  title: "Components/Feedback & Status/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Non-intrusive notification system for displaying temporary messages to users.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "success", "warning"],
      description: "The visual style variant of the toast notification",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
        category: "Appearance",
      },
    },
  },
  args: {
    variant: "default",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default toast notification with a title and description. Use the controls panel to switch between variants.",
      },
    },
  },
  render: (args) => (
    <Toast variant={args.variant}>
      <ToastTitle>Notification</ToastTitle>
      <ToastDescription>Your changes have been saved.</ToastDescription>
    </Toast>
  ),
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story: "Toast notification with an undo action button.",
      },
    },
  },
  render: () => (
    <Toast>
      <ToastTitle>Email sent</ToastTitle>
      <ToastDescription>
        Your message has been sent successfully.
      </ToastDescription>
      <ToastAction>Undo</ToastAction>
    </Toast>
  ),
};

export const ErrorToast: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Destructive toast variant for displaying error messages with a retry action.",
      },
    },
  },
  render: () => (
    <Toast variant="destructive">
      <ToastTitle>Error!</ToastTitle>
      <ToastDescription>
        Something went wrong. Please try again.
      </ToastDescription>
      <ToastAction>Retry</ToastAction>
    </Toast>
  ),
};

export const SuccessToast: Story = {
  parameters: {
    docs: {
      description: {
        story: "Success toast variant for positive confirmation messages.",
      },
    },
  },
  render: () => (
    <Toast variant="success">
      <ToastTitle>Success!</ToastTitle>
      <ToastDescription>Operation completed successfully.</ToastDescription>
    </Toast>
  ),
};

export const WarningToast: Story = {
  parameters: {
    docs: {
      description: {
        story: "Warning toast variant for cautionary notifications.",
      },
    },
  },
  render: () => (
    <Toast variant="warning">
      <ToastTitle>Warning</ToastTitle>
      <ToastDescription>
        Please review your changes before continuing.
      </ToastDescription>
    </Toast>
  ),
};

export const SimpleMessage: Story = {
  parameters: {
    docs: {
      description: {
        story: "Minimal toast with only a description and no title.",
      },
    },
  },
  render: () => (
    <Toast>
      <ToastDescription>File uploaded successfully</ToastDescription>
    </Toast>
  ),
};

export const Triggered: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="space-y-4">
        <Button
          onClick={() => setVisible(true)}
        >
          Show Toast
        </Button>
        {visible && (
          <Toast role="status">
            <ToastTitle>Scheduled</ToastTitle>
            <ToastDescription>Your event has been saved.</ToastDescription>
            <ToastAction onClick={() => setVisible(false)}>Dismiss</ToastAction>
          </Toast>
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /show toast/i });
    await userEvent.click(button);
    await new Promise(r => setTimeout(r, 300));
    expect(document.querySelector('[role="status"]')).toBeTruthy();
  },
  parameters: {
    docs: { description: { story: 'Toasts are triggered imperatively via a button click. This example uses local state since useToast/Toaster are not exported from the package — mount toast markup directly.' } },
  },
};

export const LongMessage: Story = {
  parameters: {
    docs: {
      description: {
        story: "Toast with extended description text and a view action button.",
      },
    },
  },
  render: () => (
    <Toast>
      <ToastTitle>Upload Complete</ToastTitle>
      <ToastDescription>
        Your document has been successfully uploaded to the server. It will be
        processed within the next few minutes and you'll receive an email
        confirmation once it's ready.
      </ToastDescription>
      <ToastAction>View</ToastAction>
    </Toast>
  ),
};
