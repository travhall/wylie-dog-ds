import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, screen } from "storybook/test";
import { useState } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "@wyliedog/ui/menubar";

const meta: Meta<typeof Menubar> = {
  title: "Components/Navigation/Menubar",
  component: Menubar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A horizontal menu bar with dropdown menus, commonly used for application navigation and actions. Built on Radix UI primitives with full accessibility including keyboard navigation (Arrow keys, Enter, Escape) and ARIA attributes. Includes MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarShortcut, MenubarCheckboxItem, MenubarRadioGroup, and MenubarRadioItem subcomponents for creating rich, desktop-style menu experiences similar to native applications.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the menubar container",
      table: {
        type: { summary: "string" },
        category: "Styling",
      },
    },
    loop: {
      control: "boolean",
      description:
        "Whether keyboard navigation should loop from last to first item",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Behavior",
      },
    },
    dir: {
      control: "radio",
      options: ["ltr", "rtl"],
      description:
        "The reading direction for the menubar (left-to-right or right-to-left)",
      table: {
        type: { summary: '"ltr" | "rtl"' },
        defaultValue: { summary: '"ltr"' },
        category: "Appearance",
      },
    },
    children: {
      control: false,
      description:
        "Menubar content, typically multiple MenubarMenu components with triggers and content",
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
          "Browser-style menubar with File, Edit, and View menus including keyboard shortcuts.",
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          "Minimal website navigation menubar with a single dropdown menu.",
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          "Desktop application-style menubar with app, file, tools, and help menus.",
      },
    },
  },
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

export const WithCheckboxesAndRadio: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Menubar with checkbox items for toggleable view options and a radio group for mutually exclusive theme selection.",
      },
    },
  },
  render: () => {
    const [showStatusBar, setShowStatusBar] = useState(true);
    const [showPanel, setShowPanel] = useState(false);
    const [theme, setTheme] = useState("system");

    return (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Panels</MenubarLabel>
            <MenubarSeparator />
            <MenubarCheckboxItem
              checked={showStatusBar}
              onCheckedChange={setShowStatusBar}
            >
              Status Bar
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={showPanel}
              onCheckedChange={setShowPanel}
            >
              Activity Panel
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Appearance</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Theme</MenubarLabel>
            <MenubarSeparator />
            <MenubarRadioGroup value={theme} onValueChange={setTheme}>
              <MenubarRadioItem value="light">Light</MenubarRadioItem>
              <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              <MenubarRadioItem value="system">System</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
  },
};

export const WithSubmenus: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Menubar with nested submenus for hierarchical navigation — a common pattern in text editors and IDEs.",
      },
    },
  },
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Open Recent</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>project-alpha.md</MenubarItem>
              <MenubarItem>design-tokens.json</MenubarItem>
              <MenubarItem>README.md</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Clear Recent</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Save <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Export As</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF</MenubarItem>
              <MenubarItem>HTML</MenubarItem>
              <MenubarItem>Markdown</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Interactive tests covering menubar open/close via click, arrow key navigation within a menu, and Escape key dismissal.",
      },
    },
  },
  render: () => (
    <Menubar>
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
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Zoom In</MenubarItem>
          <MenubarItem>Zoom Out</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Menus are initially closed
    expect(
      screen.queryByRole("menuitem", { name: /undo/i })
    ).not.toBeInTheDocument();

    // Test 2: Clicking "Edit" trigger opens the menu
    const editTrigger = canvas.getByRole("menuitem", { name: /edit/i });
    await userEvent.click(editTrigger);

    await new Promise((resolve) => setTimeout(resolve, 300));

    // Test 3: Menu items are visible
    expect(screen.getByRole("menuitem", { name: /undo/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /redo/i })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /^cut$/i })
    ).toBeInTheDocument();

    // Test 4: Arrow Down navigates to first item
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /undo/i })).toHaveFocus();

    // Test 5: Arrow Down again moves focus
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /redo/i })).toHaveFocus();

    // Test 6: Escape closes the menu
    await userEvent.keyboard("{Escape}");
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(
      screen.queryByRole("menuitem", { name: /undo/i })
    ).not.toBeInTheDocument();
  },
};
