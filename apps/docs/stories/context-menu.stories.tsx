import type { Meta, StoryObj } from "@storybook/react-vite";
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
  title: "Components/ContextMenu",
  component: ContextMenu,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: 'Right-click context menus with support for submenus, checkboxes, radio groups, and keyboard shortcuts. Built on Radix UI primitives with full accessibility support.'
      }
    }
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
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

export const WithSubmenus: Story = {
  render: () => (
    <div className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
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
        story: "Context menu with nested submenus for hierarchical actions."
      }
    }
  }
};

export const WithCheckboxAndRadio: Story = {
  render: () => (
    <div className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
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
            <ContextMenuRadioItem value="comfortable">Comfortable</ContextMenuRadioItem>
            <ContextMenuRadioItem value="spacious">Spacious</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Context menu with checkbox items and radio button groups."
      }
    }
  }
};

export const FileManagerMenu: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-lg">
      <h3 className="text-lg font-semibold">File Manager</h3>
      <div className="grid grid-cols-3 gap-4">
        <ContextMenu>
          <ContextMenuTrigger className="flex flex-col items-center p-4 border rounded-lg hover:bg-neutral-50">
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
          <ContextMenuTrigger className="flex flex-col items-center p-4 border rounded-lg hover:bg-neutral-50">
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
          <ContextMenuTrigger className="flex flex-col items-center p-4 border rounded-lg hover:bg-neutral-50">
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
        story: "File manager context menus with different actions based on file type."
      }
    }
  }
};

export const TextEditor: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-lg">
      <h3 className="text-lg font-semibold">Text Editor</h3>
      <ContextMenu>
        <ContextMenuTrigger className="min-h-[200px] w-full rounded-md border p-4 text-sm">
          <div className="space-y-2">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-neutral-500">Right-click anywhere to see options</p>
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
        story: "Text editor context menu with formatting options and keyboard shortcuts."
      }
    }
  }
};

export const DataTable: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <h3 className="text-lg font-semibold">Data Table</h3>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <tr className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-2 text-sm">John Doe</td>
                  <td className="px-4 py-2 text-sm">john@example.com</td>
                  <td className="px-4 py-2 text-sm">Active</td>
                </tr>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>View Profile</ContextMenuItem>
                <ContextMenuItem>Edit User</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Send Message</ContextMenuItem>
                <ContextMenuItem>Reset Password</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Deactivate User</ContextMenuItem>
                <ContextMenuItem className="text-red-600">Delete User</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <tr className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-2 text-sm">Jane Smith</td>
                  <td className="px-4 py-2 text-sm">jane@example.com</td>
                  <td className="px-4 py-2 text-sm">Inactive</td>
                </tr>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>View Profile</ContextMenuItem>
                <ContextMenuItem>Edit User</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Send Message</ContextMenuItem>
                <ContextMenuItem>Activate User</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-red-600">Delete User</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-neutral-600">Right-click on any row to see user actions</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Data table with context-sensitive row actions."
      }
    }
  }
};

export const ImageGallery: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-lg">
      <h3 className="text-lg font-semibold">Image Gallery</h3>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ContextMenu key={i}>
            <ContextMenuTrigger className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center text-2xl hover:bg-neutral-200">
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
              <ContextMenuItem className="text-red-600">Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Image gallery with contextual actions for each image."
      }
    }
  }
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <p className="text-sm text-neutral-600">
          Context menus support keyboard navigation. Right-click to open, use arrows to navigate, Enter to select, Escape to close.
        </p>
      </div>
      
      <ContextMenu>
        <ContextMenuTrigger className="flex h-[100px] w-full items-center justify-center rounded-md border border-dashed text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
      
      <p className="text-xs text-neutral-600">
        Focus the trigger with Tab, then right-click or use the context menu key
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates comprehensive accessibility features including keyboard navigation and ARIA support."
      }
    }
  }
};