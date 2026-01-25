import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, screen } from "storybook/test";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@wyliedog/ui/dropdown-menu";
import { Button } from "@wyliedog/ui/button";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/Overlays & Popovers/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Dropdown menu component for displaying a menu of actions or options. Supports checkboxes, radio groups, and keyboard navigation.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controlled open state of the dropdown",
      table: {
        type: { summary: "boolean" },
      },
    },
    modal: {
      control: "boolean",
      description: "Whether dropdown behaves as a modal (traps focus)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckboxes: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Settings</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Display Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Status Bar</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={false}>
          Activity Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked>Panel</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithRadioGroup: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Theme</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="light">
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithInteractions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Account Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Menu is initially closed
    const menuItems = screen.queryByRole("menuitem", { name: /profile/i });
    expect(menuItems).not.toBeInTheDocument();

    // Test 2: Find and click the trigger button to open menu
    const triggerButton = canvas.getByRole("button", { name: /menu/i });
    expect(triggerButton).toBeInTheDocument();
    await userEvent.click(triggerButton);

    // Wait for menu animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Test 3: Menu is visible with all items
    const profileItem = screen.getByRole("menuitem", { name: /profile/i });
    const settingsItem = screen.getByRole("menuitem", { name: /settings/i });
    const billingItem = screen.getByRole("menuitem", { name: /billing/i });
    const logoutItem = screen.getByRole("menuitem", { name: /logout/i });

    expect(profileItem).toBeInTheDocument();
    expect(settingsItem).toBeInTheDocument();
    expect(billingItem).toBeInTheDocument();
    expect(logoutItem).toBeInTheDocument();

    // Test 4: Arrow key navigation
    // First item should be focused or we can navigate to it
    await userEvent.keyboard("{ArrowDown}");
    expect(profileItem).toHaveFocus();

    // Navigate down to next item
    await userEvent.keyboard("{ArrowDown}");
    expect(settingsItem).toHaveFocus();

    // Navigate down to next item
    await userEvent.keyboard("{ArrowDown}");
    expect(billingItem).toHaveFocus();

    // Arrow Up to go back
    await userEvent.keyboard("{ArrowUp}");
    expect(settingsItem).toHaveFocus();

    // Test 5: Enter key to select
    await userEvent.keyboard("{Enter}");

    // Wait for menu to close
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Menu should be closed after selection
    const closedMenu = screen.queryByRole("menuitem", { name: /settings/i });
    expect(closedMenu).not.toBeInTheDocument();

    // Test 6: Open menu again and test Escape key
    await userEvent.click(triggerButton);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const reopenedMenu = screen.getByRole("menuitem", { name: /profile/i });
    expect(reopenedMenu).toBeInTheDocument();

    // Press Escape to close
    await userEvent.keyboard("{Escape}");
    await new Promise((resolve) => setTimeout(resolve, 300));

    const escapedMenu = screen.queryByRole("menuitem", { name: /profile/i });
    expect(escapedMenu).not.toBeInTheDocument();

    // Test 7: Open menu and click an item
    await userEvent.click(triggerButton);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const billingMenuItem = screen.getByRole("menuitem", { name: /billing/i });
    expect(billingMenuItem).toBeInTheDocument();

    await userEvent.click(billingMenuItem);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Menu should close after clicking
    const finalClosedMenu = screen.queryByRole("menuitem", {
      name: /billing/i,
    });
    expect(finalClosedMenu).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive interaction test demonstrating dropdown menu functionality including opening, closing, arrow key navigation (ArrowDown, ArrowUp), Enter key selection, Escape key closing, and mouse click interactions. Uses play functions to simulate real user interactions. View the Interactions panel to see the automated test execution.",
      },
    },
  },
};
