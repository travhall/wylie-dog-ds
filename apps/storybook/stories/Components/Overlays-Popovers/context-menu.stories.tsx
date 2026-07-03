import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, screen } from "storybook/test";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@wyliedog/ui/table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuRadioGroup,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@wyliedog/ui/context-menu";

const meta: Meta<typeof ContextMenu> = {
  title: "Components/Overlays & Popovers/ContextMenu",
  component: ContextMenu,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Right-click context menus with support for submenus, checkboxes, radio groups, and keyboard shortcuts. Built on Radix UI primitives with full accessibility support including ARIA attributes, focus management, and keyboard navigation (Arrow keys, Enter, Escape). Includes ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent, ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, and ContextMenuShortcut subcomponents for creating rich contextual action menus.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    modal: {
      control: "boolean",
      description:
        "Whether the context menu should be modal (blocking interaction with other elements)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "Behavior",
      },
    },
    dir: {
      control: "radio",
      options: ["ltr", "rtl"],
      description:
        "The reading direction for the context menu (left-to-right or right-to-left)",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "ltr" },
        category: "Appearance",
      },
    },
    onOpenChange: {
      control: false,
      description: "Callback fired when the context menu open state changes",
      table: {
        type: { summary: "(open: boolean) => void" },
        category: "Behavior",
      },
    },
    children: {
      control: false,
      description: "Context menu trigger and content components",
      table: {
        type: { summary: "React.ReactNode" },
        category: "Content",
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
          "Basic context menu with navigation actions and keyboard shortcuts.",
      },
    },
  },
  render: () => (
    <div className="flex h-37.5 w-75 items-center justify-center rounded-md border border-dashed text-sm">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-full w-full items-center justify-center">
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem inset>
            Back
            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset disabled>
            Forward
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset>
            Reload
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem inset>
            Print...
            <ContextMenuShortcut>⌘P</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
};

export const WithInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Interaction test — right-clicks the trigger, asserts the menu opens and its items are present.",
      },
    },
  },
  render: () => (
    <div className="flex h-37.5 w-75 items-center justify-center rounded-md border border-dashed text-sm">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-full w-full items-center justify-center">
          Right-click to open menu
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem>Back</ContextMenuItem>
          <ContextMenuItem>Reload</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Print...</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Menu is initially closed
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    // Test 2: Right-click the trigger to open the context menu
    const trigger = canvas.getByText(/right-click to open menu/i);
    await userEvent.pointer({ keys: "[MouseRight]", target: trigger });

    // Wait for the menu to open
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Test 3: Menu is now visible
    const menu = await screen.findByRole("menu");
    expect(menu).toBeInTheDocument();

    // Test 4: At least one menu item is present
    const reloadItem = screen.getByRole("menuitem", { name: /reload/i });
    expect(reloadItem).toBeInTheDocument();
  },
};

export const WithSubmenus: Story = {
  render: () => (
    <div className="flex h-37.5 w-75 items-center justify-center rounded-md border border-dashed text-sm">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-full w-full items-center justify-center">
          Right click for submenu
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem>
            New Tab
            <ContextMenuShortcut>⌘T</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            New Window
            <ContextMenuShortcut>⌘N</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>
            New Private Window
            <ContextMenuShortcut>⇧⌘N</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>
                Save Page As...
                <ContextMenuShortcut>⌘S</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem>Create Shortcut...</ContextMenuItem>
              <ContextMenuItem>Name Window...</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Developer Tools</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem>
            Print...
            <ContextMenuShortcut>⌘P</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Context menu with nested submenus for hierarchical actions.",
      },
    },
  },
};

export const WithCheckboxAndRadio: Story = {
  render: () => (
    <div className="flex h-37.5 w-75 items-center justify-center rounded-md border border-dashed text-sm">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-full w-full items-center justify-center">
          Right click for options
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuLabel>View Options</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked>
            Show Bookmarks Bar
            <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value="comfortable">
            <ContextMenuLabel>Density</ContextMenuLabel>
            <ContextMenuRadioItem value="compact">Compact</ContextMenuRadioItem>
            <ContextMenuRadioItem value="comfortable">
              Comfortable
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="spacious">
              Spacious
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Context menu with checkbox items and radio button groups.",
      },
    },
  },
};

export const FileManagerMenu: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-lg">
      <h3 className="text-lg font-semibold">File Manager</h3>
      <div className="grid grid-cols-3 gap-4">
        <ContextMenu>
          <ContextMenuTrigger className="flex flex-col items-center p-4 border rounded-lg hover:bg-(--color-interactive-hover)">
            <div className="text-4xl mb-2">📁</div>
            <span className="text-sm">Documents</span>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Open</ContextMenuItem>
            <ContextMenuItem>Open in New Window</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Cut</ContextMenuItem>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Rename</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Properties</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <ContextMenu>
          <ContextMenuTrigger className="flex flex-col items-center p-4 border rounded-lg hover:bg-(--color-interactive-hover)">
            <div className="text-4xl mb-2">📄</div>
            <span className="text-sm">Report.pdf</span>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Open</ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Open with</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Adobe Reader</ContextMenuItem>
                <ContextMenuItem>Chrome</ContextMenuItem>
                <ContextMenuItem>Preview</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Choose Application...</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem>Cut</ContextMenuItem>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
            <ContextMenuItem>Rename</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Move to Trash</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <ContextMenu>
          <ContextMenuTrigger className="flex flex-col items-center p-4 border rounded-lg hover:bg-(--color-interactive-hover)">
            <div className="text-4xl mb-2">🖼️</div>
            <span className="text-sm">Photo.jpg</span>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Open</ContextMenuItem>
            <ContextMenuItem>Quick Look</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Email</ContextMenuItem>
                <ContextMenuItem>Messages</ContextMenuItem>
                <ContextMenuItem>AirDrop</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Copy Link</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem>Set as Desktop Picture</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Move to Trash</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "File manager context menus with different actions based on file type.",
      },
    },
  },
};

export const TextEditor: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-lg">
      <h3 className="text-lg font-semibold">Text Editor</h3>
      <ContextMenu>
        <ContextMenuTrigger className="min-h-50 w-full rounded-md border p-4 text-sm">
          <div className="space-y-2">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-gray-400">Right-click anywhere to see options</p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem>
            Undo
            <ContextMenuShortcut>⌘Z</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Redo
            <ContextMenuShortcut>⌘Y</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            Cut
            <ContextMenuShortcut>⌘X</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Copy
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Paste
            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Select All</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Format</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuCheckboxItem>Bold</ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem>Italic</ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem>Underline</ContextMenuCheckboxItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Clear Formatting</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Text editor context menu with formatting options and keyboard shortcuts.",
      },
    },
  },
};

export const DataTable: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <h3 className="text-lg font-semibold">Data Table</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <TableRow>
                  <TableCell>John Doe</TableCell>
                  <TableCell>john@example.com</TableCell>
                  <TableCell>Active</TableCell>
                </TableRow>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>View Profile</ContextMenuItem>
                <ContextMenuItem>Edit User</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Send Message</ContextMenuItem>
                <ContextMenuItem>Reset Password</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Deactivate User</ContextMenuItem>
                <ContextMenuItem className="text-(--color-text-danger)">
                  Delete User
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>

            <ContextMenu>
              <ContextMenuTrigger asChild>
                <TableRow>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>jane@example.com</TableCell>
                  <TableCell>Inactive</TableCell>
                </TableRow>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>View Profile</ContextMenuItem>
                <ContextMenuItem>Edit User</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Send Message</ContextMenuItem>
                <ContextMenuItem>Activate User</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-(--color-text-danger)">
                  Delete User
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-gray-500">
        Right-click on any row to see user actions
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Data table with context-sensitive row actions.",
      },
    },
  },
};

export const ImageGallery: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-lg">
      <h3 className="text-lg font-semibold">Image Gallery</h3>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ContextMenu key={i}>
            <ContextMenuTrigger className="aspect-square bg-(--color-background-secondary) rounded-lg flex items-center justify-center text-2xl hover:bg-(--color-interactive-hover)">
              🖼️
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>View Full Size</ContextMenuItem>
              <ContextMenuItem>Download</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuSub>
                <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem>Copy Link</ContextMenuItem>
                  <ContextMenuItem>Share via Email</ContextMenuItem>
                  <ContextMenuItem>Share to Social</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Add to</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem>Favorites</ContextMenuItem>
                  <ContextMenuItem>Collection</ContextMenuItem>
                  <ContextMenuItem>Album</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
              <ContextMenuItem>Set as Wallpaper</ContextMenuItem>
              <ContextMenuItem>Edit Image</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem className="text-(--color-text-danger)">
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Image gallery with contextual actions for each image.",
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <p className="text-sm text-gray-500">
          Context menus support keyboard navigation. Right-click to open, use
          arrows to navigate, Enter to select, Escape to close.
        </p>
      </div>

      <ContextMenu>
        <ContextMenuTrigger className="flex h-25 w-full items-center justify-center rounded-md border border-dashed text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
          Accessible Context Menu
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuLabel>File Actions</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem>
            Open
            <ContextMenuShortcut>⌘O</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Save
            <ContextMenuShortcut>⌘S</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>
            Save As...
            <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked>
            Auto-save enabled
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            Close
            <ContextMenuShortcut>⌘W</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <p className="text-xs text-gray-500">
        Focus the trigger with Tab, then right-click or use the context menu key
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates comprehensive accessibility features including keyboard navigation and ARIA support.",
      },
    },
  },
};
