import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@wyliedog/ui/alert-dialog";
import { Button } from "@wyliedog/ui/button";

const meta: Meta<typeof AlertDialog> = {
  title: "3. Components/Overlays/AlertDialog",
  component: AlertDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Modal confirmation dialogs for destructive or important actions. Built on Radix UI primitives with proper focus management and accessibility support.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive">Delete Account</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const DestructiveAction: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Project</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this project? This will permanently
            remove all files, settings, and collaboration history. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Keep Project</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive">Delete Forever</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Confirmation dialog for destructive actions with clear consequences.",
      },
    },
  },
};

export const SaveChanges: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Save Document</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save Changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes to this document. Would you like to save
            your changes before continuing?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Don't Save</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button>Save Changes</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: "Confirmation dialog for saving important changes.",
      },
    },
  },
};

export const LogoutConfirmation: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">Sign Out</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign Out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to sign out? Any unsaved work will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Stay Signed In</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button>Sign Out</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: "Session termination confirmation with data loss warning.",
      },
    },
  },
};

export const SubscriptionCancel: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Cancel Subscription</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
          <AlertDialogDescription>
            Your subscription will be cancelled immediately and you'll lose
            access to premium features. You can resubscribe at any time, but any
            remaining time on your current plan will not be refunded.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Keep Subscription</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive">Cancel Now</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: "Subscription cancellation with billing implications.",
      },
    },
  },
};

export const DataExport: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Export All Data</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Export Your Data</AlertDialogTitle>
          <AlertDialogDescription>
            This will create a complete backup of all your data including
            documents, settings, and user information. The export may take
            several minutes to complete. You'll receive an email when it's ready
            for download.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button>Start Export</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Confirmation for time-consuming operations with clear expectations.",
      },
    },
  },
};

export const MultipleActions: Story = {
  render: () => (
    <div className="flex gap-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete All</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Items</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all 47 items in your trash. This
              action cannot be undone and will free up 2.3 GB of storage space.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive">Delete All</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Restore All</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore All Items</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all 47 items from trash to their original
              locations. Some items may be renamed if conflicts exist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button>Restore All</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Multiple independent alert dialogs for different actions.",
      },
    },
  },
};

export const UnsavedChanges: Story = {
  render: () => (
    <div className="space-y-4 p-4 max-w-md">
      <div className="space-y-2">
        <label className="text-sm font-medium">Document Title</label>
        <input
          type="text"
          defaultValue="My Important Document"
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Content</label>
        <textarea
          defaultValue="This document contains important information..."
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
        />
      </div>

      <div className="flex gap-2">
        <Button variant="outline">Save Draft</Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost">Close</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes to "My Important Document". Do you want
                to save your changes before closing?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Keep Editing</Button>
              </AlertDialogCancel>
              <div className="flex gap-2">
                <AlertDialogAction asChild>
                  <Button variant="ghost">Close Without Saving</Button>
                </AlertDialogAction>
                <AlertDialogAction asChild>
                  <Button>Save & Close</Button>
                </AlertDialogAction>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world form scenario with unsaved changes confirmation.",
      },
    },
  },
};

export const BulkOperations: Story = {
  render: () => (
    <div className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Selected Items (3)</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
            <input type="checkbox" checked readOnly />
            <span>Project Alpha - Draft.docx</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
            <input type="checkbox" checked readOnly />
            <span>Meeting Notes - Q4.pdf</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
            <input type="checkbox" checked readOnly />
            <span>Budget Spreadsheet.xlsx</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Selected</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete 3 Items</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete these 3 items? They will be
                moved to trash and can be restored within 30 days.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive">Move to Trash</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Share Selected</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Share 3 Items</AlertDialogTitle>
              <AlertDialogDescription>
                This will create a shared folder containing the 3 selected
                items. Recipients will be able to view and download these files.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button>Create Share Link</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Bulk operations with contextual confirmation dialogs.",
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <p className="text-sm text-neutral-600">
          Alert dialogs trap focus, support Escape key, and provide clear
          actions. Tab to navigate, Enter/Space to activate, Escape to cancel.
        </p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button aria-describedby="delete-help">Delete Account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent
          role="alertdialog"
          aria-labelledby="delete-title"
          aria-describedby="delete-description"
        >
          <AlertDialogHeader>
            <AlertDialogTitle id="delete-title">
              Permanently Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription id="delete-description">
              This action is irreversible. Your account, all data, and
              subscription will be permanently removed. You will not be able to
              recover this information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" aria-label="Cancel account deletion">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                aria-label="Confirm permanent account deletion"
              >
                Delete Forever
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p id="delete-help" className="text-xs text-neutral-600">
        This action will permanently remove your account and cannot be undone.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates comprehensive accessibility features including ARIA attributes and focus management.",
      },
    },
  },
};

export const WithInteractions: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Project</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this project? This action cannot be
            undone and will permanently remove all project data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive">Delete</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Alert dialog is initially closed
    const alertDialog = canvas.queryByRole("alertdialog");
    expect(alertDialog).not.toBeInTheDocument();

    // Test 2: Find and click the trigger button to open
    const triggerButton = canvas.getByRole("button", {
      name: /delete project/i,
    });
    expect(triggerButton).toBeInTheDocument();
    await userEvent.click(triggerButton);

    // Wait for dialog animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Test 3: Alert dialog is visible with correct content
    const openDialog = canvas.getByRole("alertdialog");
    expect(openDialog).toBeInTheDocument();

    const dialogTitle = canvas.getByRole("heading", {
      name: /delete project/i,
    });
    expect(dialogTitle).toBeInTheDocument();

    const dialogDescription = canvas.getByText(
      /are you sure you want to delete this project/i
    );
    expect(dialogDescription).toBeInTheDocument();

    // Test 4: Tab key navigation within dialog (focus trap)
    const cancelButton = canvas.getByRole("button", { name: /^cancel$/i });
    const deleteButton = canvas.getByRole("button", { name: /^delete$/i });

    // Cancel button should be auto-focused
    expect(cancelButton).toHaveFocus();

    // Tab to delete button
    await userEvent.tab();
    expect(deleteButton).toHaveFocus();

    // Tab should wrap back to cancel (focus trap)
    await userEvent.tab();
    expect(cancelButton).toHaveFocus();

    // Shift+Tab back to delete button
    await userEvent.tab({ shift: true });
    expect(deleteButton).toHaveFocus();

    // Test 5: Escape key closes the dialog
    await userEvent.keyboard("{Escape}");

    // Wait for close animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Dialog should be closed
    const closedDialog = canvas.queryByRole("alertdialog");
    expect(closedDialog).not.toBeInTheDocument();

    // Test 6: Open again and test cancel button
    await userEvent.click(triggerButton);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const reopenedDialog = canvas.getByRole("alertdialog");
    expect(reopenedDialog).toBeInTheDocument();

    // Click cancel button
    const cancelBtn = canvas.getByRole("button", { name: /^cancel$/i });
    await userEvent.click(cancelBtn);

    await new Promise((resolve) => setTimeout(resolve, 300));

    // Verify dialog is closed
    const finalClosedDialog = canvas.queryByRole("alertdialog");
    expect(finalClosedDialog).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive interaction test demonstrating alert dialog functionality including opening, closing, focus trap, keyboard navigation (Tab, Escape), and mouse interactions. Uses play functions to simulate real user interactions. View the Interactions panel to see the automated test execution.",
      },
    },
  },
};
