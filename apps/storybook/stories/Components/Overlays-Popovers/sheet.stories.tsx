import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, screen } from "storybook/test";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@wyliedog/ui/sheet";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";

// Use bare Meta to document props from sub-components (e.g. SheetContent.side)
// that don't exist on the root Sheet (DialogPrimitive.Root) element.
const meta: Meta = {
  title: "Components/Overlays & Popovers/Sheet",
  component: Sheet,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Side drawer overlay component that slides in from any edge of the screen. Commonly used for navigation menus, settings panels, and detailed views.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
      description: "The side from which the sheet slides in",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "right" },
        category: "Appearance",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    side: "right",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Sheet panel with a profile editing form. Use the controls panel to change which side the sheet slides in from.",
      },
    },
  },
  render: (args) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent side={args.side}>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
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
            {/* cSpell:ignore Duarte peduarte */}
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
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const FromLeft: Story = {
  parameters: {
    docs: {
      description: {
        story: "Left-side sheet with navigation menu links.",
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open from Left</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            This sheet slides in from the left side.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <nav className="space-y-2">
            <a
              href="#"
              className="block px-2 py-1 hover:bg-(--color-background-secondary) rounded"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="block px-2 py-1 hover:bg-(--color-background-secondary) rounded"
            >
              Projects
            </a>
            <a
              href="#"
              className="block px-2 py-1 hover:bg-(--color-background-secondary) rounded"
            >
              Team
            </a>
            <a
              href="#"
              className="block px-2 py-1 hover:bg-(--color-background-secondary) rounded"
            >
              Settings
            </a>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const FromTop: Story = {
  parameters: {
    docs: {
      description: {
        story: "Top-edge sheet for notification preference settings.",
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open from Top</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Notification Settings</SheetTitle>
          <SheetDescription>
            Configure your notification preferences.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const FromBottom: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Bottom-edge sheet — a common mobile pattern for action menus, quick settings, and confirmations. Grows upward from the bottom of the viewport.",
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open from Bottom</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Share post</SheetTitle>
          <SheetDescription>
            Choose how you'd like to share this post.
          </SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          <Button variant="outline" className="flex flex-col h-auto gap-1 py-3">
            <span className="text-base">✉️</span>
            <span className="text-xs">Email</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto gap-1 py-3">
            <span className="text-base">💬</span>
            <span className="text-xs">Message</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto gap-1 py-3">
            <span className="text-base">🔗</span>
            <span className="text-xs">Copy link</span>
          </Button>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const WithInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Interactive tests covering open/close via trigger click, Escape key dismissal, and focus management inside the sheet.",
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sheet-name" className="text-right">
              Name
            </Label>
            <Input
              id="sheet-name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Sheet is initially closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Test 2: Clicking the trigger opens the sheet
    const triggerButton = canvas.getByRole("button", { name: /open sheet/i });
    await userEvent.click(triggerButton);

    // Wait for open animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Test 3: Sheet dialog is visible with title and description
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /edit profile/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/make changes to your profile here/i)
    ).toBeInTheDocument();

    // Test 4: Input inside the sheet is accessible
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toBeInTheDocument();
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Jane Doe");
    expect(nameInput).toHaveValue("Jane Doe");

    // Test 5: Escape key closes the sheet
    await userEvent.keyboard("{Escape}");
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Test 6: Trigger regains focus after close
    expect(triggerButton).toHaveFocus();
  },
};
