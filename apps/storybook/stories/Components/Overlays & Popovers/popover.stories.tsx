import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, screen } from "storybook/test";
import { Popover, PopoverContent, PopoverTrigger } from "@wyliedog/ui/popover";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Separator } from "@wyliedog/ui/separator";
import { Checkbox } from "@wyliedog/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@wyliedog/ui/radio-group";
import { Switch } from "@wyliedog/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wyliedog/ui/select";
import {
  SettingsIcon,
  HelpCircleIcon,
  FilterIcon,
  CalendarIcon,
  MoreHorizontalIcon,
} from "lucide-react";

const meta: Meta<any> = {
  title: "Components/Overlays & Popovers/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Click-triggered content overlays for displaying additional information, forms, or controls. Built on Radix UI primitives with flexible positioning and smooth animations.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
      description: "The preferred side of the trigger to render the popover",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "bottom" },
        category: "Appearance",
      },
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
      description:
        "The preferred alignment of the popover relative to the trigger",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "center" },
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
        story:
          "Basic popover with dimension input fields for layer configuration.",
      },
    },
  },
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-(--color-text-secondary)">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Add User</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Add New User</h4>
            <p className="text-sm text-(--color-text-secondary)">
              Enter the user details below.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select defaultValue="user">
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1">
                Add User
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "Popover with a complete form for data entry.",
      },
    },
  },
};

export const Settings: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <SettingsIcon className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid gap-3">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm font-normal">
                Notifications
              </Label>
              <Switch id="notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="text-sm font-normal">
                Dark Mode
              </Label>
              <Switch id="darkMode" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoSave" className="text-sm font-normal">
                Auto Save
              </Label>
              <Switch id="autoSave" defaultChecked />
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-sm">Language</Label>
              <Select defaultValue="english">
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "Settings panel with toggles and dropdown options.",
      },
    },
  },
};

export const FilterMenu: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-(--color-text-secondary)">
        Filter your search results:
      </p>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Filter Options</h4>
              <p className="text-sm text-(--color-text-secondary)">
                Refine your search results
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="electronics" defaultChecked />
                    <Label
                      htmlFor="electronics"
                      className="text-sm font-normal"
                    >
                      Electronics
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="clothing" />
                    <Label htmlFor="clothing" className="text-sm font-normal">
                      Clothing
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="books" />
                    <Label htmlFor="books" className="text-sm font-normal">
                      Books
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Min" size="sm" />
                  <Input placeholder="Max" size="sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Rating</Label>
                <RadioGroup defaultValue="any">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4plus" id="rating-4" />
                    <Label htmlFor="rating-4" className="text-sm font-normal">
                      4+ Stars
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3plus" id="rating-3" />
                    <Label htmlFor="rating-3" className="text-sm font-normal">
                      3+ Stars
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="any" id="rating-any" />
                    <Label htmlFor="rating-any" className="text-sm font-normal">
                      Any Rating
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                Apply Filters
              </Button>
              <Button size="sm" variant="outline">
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Complex filter interface with multiple input types.",
      },
    },
  },
};

export const Positioning: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div className="space-y-4">
        <p className="text-sm font-medium">Top positioning:</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open (top)</Button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-64">
            <p className="text-sm">
              This popover appears above the trigger button.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">Bottom positioning:</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open (bottom)</Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" className="w-64">
            <p className="text-sm">
              This popover appears below the trigger button.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">Left positioning:</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open (left)</Button>
          </PopoverTrigger>
          <PopoverContent side="left" className="w-64">
            <p className="text-sm">
              This popover appears to the left of the trigger button.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">Right positioning:</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open (right)</Button>
          </PopoverTrigger>
          <PopoverContent side="right" className="w-64">
            <p className="text-sm">
              This popover appears to the right of the trigger button.
            </p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different positioning options for popover placement.",
      },
    },
  },
};

export const DatePicker: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Select Date
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Select Date</h4>
              <Button variant="ghost" size="sm">
                Today
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              <div className="p-2 font-medium text-(--color-text-secondary)">
                S
              </div>
              <div className="p-2 font-medium text-(--color-text-secondary)">
                M
              </div>
              <div className="p-2 font-medium text-(--color-text-secondary)">
                T
              </div>
              <div className="p-2 font-medium text-(--color-text-secondary)">
                W
              </div>
              <div className="p-2 font-medium text-(--color-text-secondary)">
                T
              </div>
              <div className="p-2 font-medium text-(--color-text-secondary)">
                F
              </div>
              <div className="p-2 font-medium text-(--color-text-secondary)">
                S
              </div>

              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 6;
                const isCurrentMonth = day > 0 && day <= 31;
                const isSelected = day === 15;
                return (
                  <Button
                    key={i}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    className={`p-2 h-8 w-8 ${
                      !isCurrentMonth ? "text-(--color-text-tertiary)" : ""
                    }`}
                    disabled={!isCurrentMonth}
                  >
                    {isCurrentMonth ? day : ""}
                  </Button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                Confirm
              </Button>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "Custom date picker implementation using popover.",
      },
    },
  },
};

export const ActionMenu: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h4 className="font-medium">Project Alpha</h4>
          <p className="text-sm text-(--color-text-secondary)">
            Last updated 2 hours ago
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 h-auto text-sm"
              >
                Edit Project
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 h-auto text-sm"
              >
                Duplicate
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 h-auto text-sm"
              >
                Export
              </Button>
              <Separator className="my-1" />
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 h-auto text-sm"
              >
                Archive
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 h-auto text-sm text-(--color-status-danger) hover:text-(--color-status-danger) hover:bg-(--color-status-danger)/10"
              >
                Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Action menu popover for contextual operations.",
      },
    },
  },
};

export const Help: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="password">Password</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1">
              <HelpCircleIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Password Requirements</h4>
              <ul className="text-sm space-y-1 text-(--color-text-secondary)">
                <li>• At least 8 characters long</li>
                <li>• Contains at least one uppercase letter</li>
                <li>• Contains at least one lowercase letter</li>
                <li>• Contains at least one number</li>
                <li>• Contains at least one special character (!@#$%^&*)</li>
              </ul>
              <p className="text-xs text-(--color-text-tertiary) pt-2">
                A strong password helps protect your account from unauthorized
                access.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Input
        id="password"
        type="password"
        placeholder="Enter your password"
        className="w-64"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Help popover providing contextual assistance for form fields.",
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <p className="text-sm text-(--color-text-secondary)">
          Popovers support keyboard navigation. Use Tab to focus triggers,
          Enter/Space to open, Escape to close, and Tab to navigate within.
        </p>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button aria-describedby="accessible-description">
            Account Settings
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80"
          role="dialog"
          aria-labelledby="settings-title"
        >
          <div className="space-y-4">
            <h4 id="settings-title" className="font-medium">
              Account Settings
            </h4>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  defaultValue="John Doe"
                  aria-describedby="name-help"
                />
                <p
                  id="name-help"
                  className="text-xs text-(--color-text-secondary)"
                >
                  This name will be visible to other users
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email-settings">Email</Label>
                <Input
                  id="email-settings"
                  type="email"
                  defaultValue="john@example.com"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="email-notifications"
                  className="text-sm font-normal"
                >
                  Email Notifications
                </Label>
                <Switch
                  id="email-notifications"
                  defaultChecked
                  aria-describedby="notification-help"
                />
              </div>
              <p
                id="notification-help"
                className="text-xs text-(--color-text-secondary)"
              >
                Receive updates about your account activity
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm">Save Changes</Button>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <p
        id="accessible-description"
        className="text-xs text-(--color-text-secondary)"
      >
        Click to open account settings panel
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates comprehensive accessibility features including ARIA attributes and keyboard navigation.",
      },
    },
  },
};

export const WithInteractions: Story = {
  render: () => (
    <div className="p-8">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">User Information</h4>
              <p className="text-sm text-(--color-text-secondary)">
                Update your profile details below.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  defaultValue="John Doe"
                  className="col-span-2 h-8"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  defaultValue="john@example.com"
                  className="col-span-2 h-8"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Popover is initially closed
    const nameInput = screen.queryByRole("textbox", { name: /name/i });
    expect(nameInput).not.toBeInTheDocument();

    // Test 2: Find and click the trigger to open popover
    const triggerButton = canvas.getByRole("button", { name: /open popover/i });
    expect(triggerButton).toBeInTheDocument();
    await userEvent.click(triggerButton);

    // Wait for popover animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Test 3: Popover content is visible
    const heading = screen.getByRole("heading", { name: /user information/i });
    expect(heading).toBeInTheDocument();

    const description = screen.getByText(/update your profile details below/i);
    expect(description).toBeInTheDocument();

    // Test 4: Input fields are accessible
    const nameField = screen.getByRole("textbox", { name: /name/i });
    const emailField = screen.getByRole("textbox", { name: /email/i });

    expect(nameField).toBeInTheDocument();
    expect(nameField).toHaveValue("John Doe");
    expect(emailField).toBeInTheDocument();
    expect(emailField).toHaveValue("john@example.com");

    // Test 5: Can interact with inputs
    await userEvent.clear(nameField);
    await userEvent.type(nameField, "Jane Smith");
    expect(nameField).toHaveValue("Jane Smith");

    // Test 6: Escape key closes the popover
    await userEvent.keyboard("{Escape}");

    // Wait for close animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Popover should be closed
    const closedHeading = screen.queryByRole("heading", {
      name: /user information/i,
    });
    expect(closedHeading).not.toBeInTheDocument();

    // Test 7: Open popover again to test positioning
    await userEvent.click(triggerButton);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const reopenedHeading = screen.getByRole("heading", {
      name: /user information/i,
    });
    expect(reopenedHeading).toBeInTheDocument();

    // Test 8: Click outside to close (click the trigger button again)
    await userEvent.click(triggerButton);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const finalClosedHeading = screen.queryByRole("heading", {
      name: /user information/i,
    });
    expect(finalClosedHeading).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive interaction test demonstrating popover functionality including opening, closing, positioning, Escape key closing, input field interactions, and click-outside behavior. Tests proper content visibility and accessibility. Uses play functions to simulate real user interactions. View the Interactions panel to see the automated test execution.",
      },
    },
  },
};
