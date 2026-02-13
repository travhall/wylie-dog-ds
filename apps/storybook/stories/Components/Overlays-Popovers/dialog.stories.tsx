import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, screen } from "storybook/test";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@wyliedog/ui/dialog";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Textarea } from "@wyliedog/ui/textarea";
import { Checkbox } from "@wyliedog/ui/checkbox";
import { Separator } from "@wyliedog/ui/separator";
import { useState } from "react";

const meta: Meta<typeof Dialog> = {
  title: "Components/Overlays & Popovers/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Modal dialog component with focus trapping and backdrop. Built on Radix UI primitives with full keyboard and screen reader support.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controlled open state of the dialog",
      table: {
        type: { summary: "boolean" },
        category: "State",
      },
    },
    modal: {
      control: "boolean",
      description:
        "Whether the dialog should be modal (blocks interaction with rest of page)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "Behavior",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Profile editing dialog with form fields and save action.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
            {/* cSpell:ignore Duarte */}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
            {/* cSpell:ignore peduarte */}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Confirmation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Destructive action confirmation dialog with cancel and delete options.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const SimpleAlert: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Simple success notification dialog with a single dismiss button.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Show Alert</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Success!</DialogTitle>
          <DialogDescription>
            Your changes have been saved successfully.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithInteractions: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dialog Test</DialogTitle>
          <DialogDescription>
            This dialog demonstrates focus trapping and keyboard navigation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="test-input" className="text-right">
              Input
            </Label>
            <Input
              id="test-input"
              defaultValue="Test value"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Dialog is initially closed
    const dialogContent = screen.queryByRole("dialog");
    expect(dialogContent).not.toBeInTheDocument();

    // Test 2: Find and click the trigger button to open the dialog
    const triggerButton = canvas.getByRole("button", { name: /open dialog/i });
    expect(triggerButton).toBeInTheDocument();
    await userEvent.click(triggerButton);

    // Wait a moment for dialog animation to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Test 3: Dialog content is visible with correct title
    const openDialog = screen.getByRole("dialog");
    expect(openDialog).toBeInTheDocument();

    const dialogTitle = screen.getByRole("heading", { name: /dialog test/i });
    expect(dialogTitle).toBeInTheDocument();

    const dialogDescription = screen.getByText(
      /this dialog demonstrates focus trapping and keyboard navigation/i
    );
    expect(dialogDescription).toBeInTheDocument();

    // Test 4: Verify input field is accessible within the dialog
    const inputField = screen.getByRole("textbox", { name: /input/i });
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveValue("Test value");

    // Test 5: Tab key navigation works (focus trap)
    // Initially, close button should have focus (set by onOpenAutoFocus)
    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toHaveFocus();

    // Tab to trigger button (should not leave dialog due to focus trap)
    await userEvent.tab();
    // After first tab, focus should move to the next focusable element (Input field)
    expect(inputField).toHaveFocus();

    // Tab to next focusable element (Cancel button)
    await userEvent.tab();
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toHaveFocus();

    // Tab to next element (Confirm button)
    await userEvent.tab();
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    expect(confirmButton).toHaveFocus();

    // Shift+Tab back to Cancel button (reverse focus trap)
    await userEvent.tab({ shift: true });
    expect(cancelButton).toHaveFocus();

    // Test 6: Escape key closes the dialog
    await userEvent.keyboard("{Escape}");

    // Wait for dialog animation to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Dialog should be closed
    const closedDialog = screen.queryByRole("dialog");
    expect(closedDialog).not.toBeInTheDocument();

    // Test 7: Open dialog again and test close button
    await userEvent.click(triggerButton);

    // Wait for dialog animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    const reopenedDialog = screen.getByRole("dialog");
    expect(reopenedDialog).toBeInTheDocument();

    // Click the close button
    const closeBtn = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeBtn);

    // Wait for dialog animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Verify dialog is closed
    const finalClosedDialog = screen.queryByRole("dialog");
    expect(finalClosedDialog).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive interaction test demonstrating dialog functionality including opening, closing, focus management, and keyboard navigation. Uses play functions to simulate real user interactions. View the Interactions panel to see the automated test execution.",
      },
    },
  },
};

export const WithForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Dialog containing a full form with validation. Demonstrates the common pattern of placing a form inside a dialog with cancel and submit actions.",
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const data = new FormData(e.target as HTMLFormElement);
      const newErrors: Record<string, string> = {};
      if (!data.get("dialog-title")) newErrors.title = "Title is required";
      if (!data.get("dialog-desc")) newErrors.desc = "Description is required";
      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) setOpen(false);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create Issue</Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create new issue</DialogTitle>
              <DialogDescription>
                Fill in the details below. All required fields must be completed
                before submitting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dialog-title" required>
                  Title
                </Label>
                <Input
                  id="dialog-title"
                  name="dialog-title"
                  placeholder="Short, descriptive title"
                  className={
                    errors.title ? "border-(--color-border-danger)" : ""
                  }
                />
                {errors.title && (
                  <p
                    role="alert"
                    className="text-sm text-(--color-status-danger)"
                  >
                    {errors.title}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog-desc" required>
                  Description
                </Label>
                <Textarea
                  id="dialog-desc"
                  name="dialog-desc"
                  placeholder="Describe the issue in detail"
                  className={
                    errors.desc ? "border-(--color-border-danger)" : ""
                  }
                />
                {errors.desc && (
                  <p
                    role="alert"
                    className="text-sm text-(--color-status-danger)"
                  >
                    {errors.desc}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="dialog-urgent" name="dialog-urgent" />
                <Label htmlFor="dialog-urgent">Mark as urgent</Label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Create issue</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
};

export const WithScrollableContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Dialog with a long scrollable body. The header and footer remain fixed while the content area scrolls independently — useful for terms, changelogs, and detail views.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Terms</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Please read the full terms before accepting.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 py-4 space-y-4 text-sm text-(--color-text-secondary)">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i}>
              <p className="font-medium text-(--color-text-primary) mb-1">
                {i + 1}.{" "}
                {
                  [
                    "Acceptance of Terms",
                    "Use of Service",
                    "Privacy Policy",
                    "Intellectual Property",
                    "Termination",
                    "Limitation of Liability",
                    "Governing Law",
                    "Changes to Terms",
                  ][i]
                }
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur.
              </p>
            </div>
          ))}
        </div>
        <Separator />
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button variant="outline">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Accept Terms</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const NonClosable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Dialog that cannot be dismissed by clicking the backdrop or pressing Escape. Used for critical flows (onboarding, required agreements) where the user must take an explicit action to proceed.",
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Start Onboarding</Button>
        </DialogTrigger>
        <DialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          // Hide the default close button for truly non-dismissable dialogs
          className="[&>button:last-of-type]:hidden"
        >
          <DialogHeader>
            <DialogTitle>Welcome! Let's get you set up</DialogTitle>
            <DialogDescription>
              Complete these steps to finish setting up your account. You must
              choose an option to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {["Personal account", "Team account", "Enterprise account"].map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full text-left px-4 py-3 rounded-md border border-(--color-border-default) hover:bg-(--color-background-secondary) transition-colors"
                >
                  <p className="font-medium text-sm">{option}</p>
                </button>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  },
};
