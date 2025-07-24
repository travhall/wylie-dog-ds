import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@wyliedog/ui/menubar";

const meta: Meta<typeof Menubar> = {
  title: "Components/Menubar",
  component: Menubar,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: "A horizontal menu bar with dropdown menus, commonly used for application navigation and actions."
      }
    }
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Cut <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Copy <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Paste <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Always Show Bookmarks Bar</MenubarItem>
          <MenubarItem>Always Show Full URLs</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Reload <MenubarShortcut>⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Actual Size</MenubarItem>
          <MenubarItem>Zoom In</MenubarItem>
          <MenubarItem>Zoom Out</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const Simple: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Home</MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Products</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Web Apps</MenubarItem>
          <MenubarItem>Mobile Apps</MenubarItem>
          <MenubarItem>Desktop Tools</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>About</MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Contact</MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  ),
};

export const ApplicationMenu: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>MyApp</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>About MyApp</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Settings...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Hide MyApp</MenubarItem>
          <MenubarItem>Hide Others</MenubarItem>
          <MenubarItem>Show All</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Quit MyApp</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Document</MenubarItem>
          <MenubarItem>Open...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Save</MenubarItem>
          <MenubarItem>Save As...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Export</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Tools</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Word Count</MenubarItem>
          <MenubarItem>Character Count</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Spell Check</MenubarItem>
          <MenubarItem>Grammar Check</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Documentation</MenubarItem>
          <MenubarItem>Keyboard Shortcuts</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Report Bug</MenubarItem>
          <MenubarItem>Feature Request</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};
