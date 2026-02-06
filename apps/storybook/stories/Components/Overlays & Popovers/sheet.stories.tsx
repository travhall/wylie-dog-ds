import type { Meta, StoryObj } from "@storybook/react-vite";
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

const meta: Meta<typeof Sheet> = {
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
  parameters: {
    docs: {
      description: {
        story: "Right-side sheet panel with a profile editing form.",
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
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
