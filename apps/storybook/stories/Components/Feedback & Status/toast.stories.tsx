import type { Meta, StoryObj } from "@storybook/react-vite";
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
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Toast>
      <ToastTitle>Success!</ToastTitle>
      <ToastDescription>Your changes have been saved.</ToastDescription>
    </Toast>
  ),
};

export const WithAction: Story = {
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
  render: () => (
    <Toast variant="success">
      <ToastTitle>Success!</ToastTitle>
      <ToastDescription>Operation completed successfully.</ToastDescription>
    </Toast>
  ),
};

export const WarningToast: Story = {
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
  render: () => (
    <Toast>
      <ToastDescription>File uploaded successfully</ToastDescription>
    </Toast>
  ),
};

export const LongMessage: Story = {
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
