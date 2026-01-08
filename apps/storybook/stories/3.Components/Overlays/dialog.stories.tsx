import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import {
  Dialog,
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

const meta: Meta<typeof Dialog> = {
  title: "3. Components/Overlays/Dialog",
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
      },
    },
    modal: {
      control: "boolean",
      description:
        "Whether the dialog should be modal (blocks interaction with rest of page)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
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
    const dialogContent = canvas.queryByRole("dialog");
    expect(dialogContent).not.toBeInTheDocument();

    // Test 2: Find and click the trigger button to open the dialog
    const triggerButton = canvas.getByRole("button", { name: /open dialog/i });
    expect(triggerButton).toBeInTheDocument();
    await userEvent.click(triggerButton);

    // Wait a moment for dialog animation to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Test 3: Dialog content is visible with correct title
    const openDialog = canvas.getByRole("dialog");
    expect(openDialog).toBeInTheDocument();

    const dialogTitle = canvas.getByRole("heading", { name: /dialog test/i });
    expect(dialogTitle).toBeInTheDocument();

    const dialogDescription = canvas.getByText(
      /this dialog demonstrates focus trapping and keyboard navigation/i
    );
    expect(dialogDescription).toBeInTheDocument();

    // Test 4: Verify input field is accessible within the dialog
    const inputField = canvas.getByRole("textbox", { name: /input/i });
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveValue("Test value");

    // Test 5: Tab key navigation works (focus trap)
    // Initially, close button should have focus (set by onOpenAutoFocus)
    const closeButton = canvas.getByRole("button", { name: /close/i });
    expect(closeButton).toHaveFocus();

    // Tab to trigger button (should not leave dialog due to focus trap)
    await userEvent.tab();
    // After first tab, focus should move to the next focusable element (Input field)
    expect(inputField).toHaveFocus();

    // Tab to next focusable element (Cancel button)
    await userEvent.tab();
    const cancelButton = canvas.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toHaveFocus();

    // Tab to next element (Confirm button)
    await userEvent.tab();
    const confirmButton = canvas.getByRole("button", { name: /confirm/i });
    expect(confirmButton).toHaveFocus();

    // Shift+Tab back to Cancel button (reverse focus trap)
    await userEvent.tab({ shift: true });
    expect(cancelButton).toHaveFocus();

    // Test 6: Escape key closes the dialog
    await userEvent.keyboard("{Escape}");

    // Wait for dialog animation to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Dialog should be closed
    const closedDialog = canvas.queryByRole("dialog");
    expect(closedDialog).not.toBeInTheDocument();

    // Test 7: Open dialog again and test close button
    await userEvent.click(triggerButton);

    // Wait for dialog animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    const reopenedDialog = canvas.getByRole("dialog");
    expect(reopenedDialog).toBeInTheDocument();

    // Click the close button
    const closeBtn = canvas.getByRole("button", { name: /close/i });
    await userEvent.click(closeBtn);

    // Wait for dialog animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Verify dialog is closed
    const finalClosedDialog = canvas.queryByRole("dialog");
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
