import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@wyliedog/ui/command";
import { Button } from "@wyliedog/ui/button";
import {
  FileIcon,
  FolderIcon,
  UserIcon,
  SettingsIcon,
  CalendarIcon,
  SearchIcon,
  CommandIcon,
  PlusIcon,
} from "lucide-react";

const meta: Meta<typeof Command> = {
  title: "3. Components/Navigation/Command",
  component: Command,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Command palette interface for quick actions and navigation. Features search, keyboard shortcuts, and grouped commands. Built on cmdk with full accessibility including keyboard navigation (Arrow keys, Enter, Escape) and ARIA attributes. Includes CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, and CommandShortcut subcomponents for building powerful command-k style interfaces similar to Spotlight, VS Code Command Palette, or Raycast. Perfect for application-wide search and action execution.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the command container",
      table: {
        type: { summary: "string" },
      },
    },
    value: {
      control: "text",
      description: "The controlled selected value of the command item",
      table: {
        type: { summary: "string" },
      },
    },
    defaultValue: {
      control: "text",
      description:
        "The default selected value of the command item (uncontrolled)",
      table: {
        type: { summary: "string" },
      },
    },
    onValueChange: {
      control: false,
      description: "Callback fired when the selected value changes",
      table: {
        type: { summary: "(value: string) => void" },
      },
    },
    filter: {
      control: false,
      description:
        "Custom filter function for command items, receives (value, search) and returns a score (0-1)",
      table: {
        type: { summary: "(value: string, search: string) => number" },
      },
    },
    shouldFilter: {
      control: "boolean",
      description:
        "Whether to filter items based on search input (set to false for custom filtering)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    loop: {
      control: "boolean",
      description:
        "Whether keyboard navigation should loop from last to first item",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    children: {
      control: false,
      description:
        "Command content including CommandInput, CommandList with groups and items",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-112.5">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar
          </CommandItem>
          <CommandItem>
            <SearchIcon className="mr-2 h-4 w-4" />
            Search Emoji
          </CommandItem>
          <CommandItem>
            <CommandIcon className="mr-2 h-4 w-4" />
            Command Menu
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const FileSearch: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-125">
      <CommandInput placeholder="Search files and folders..." />
      <CommandList>
        <CommandEmpty>No files found.</CommandEmpty>
        <CommandGroup heading="Recent Files">
          <CommandItem>
            <FileIcon className="mr-2 h-4 w-4" />
            project-report.pdf
            <CommandShortcut>2m ago</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <FileIcon className="mr-2 h-4 w-4" />
            meeting-notes.md
            <CommandShortcut>1h ago</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <FileIcon className="mr-2 h-4 w-4" />
            budget-2024.xlsx
            <CommandShortcut>3h ago</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Folders">
          <CommandItem>
            <FolderIcon className="mr-2 h-4 w-4" />
            Documents
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <FolderIcon className="mr-2 h-4 w-4" />
            Downloads
            <CommandShortcut>⌘L</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <FolderIcon className="mr-2 h-4 w-4" />
            Desktop
            <CommandShortcut>⌘⇧D</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "File search command palette with recent files and folder navigation.",
      },
    },
  },
};

export const QuickActions: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-112.5">
      <CommandInput placeholder="What would you like to do?" />
      <CommandList>
        <CommandEmpty>No actions found.</CommandEmpty>
        <CommandGroup heading="Create">
          <CommandItem>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Document
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Folder
            <CommandShortcut>⇧⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Project
            <CommandShortcut>⌘⇧P</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem>
            Go to Dashboard
            <CommandShortcut>⌘1</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Go to Projects
            <CommandShortcut>⌘2</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Go to Team
            <CommandShortcut>⌘3</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Go to Settings
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Tools">
          <CommandItem>Export Data</CommandItem>
          <CommandItem>Import Files</CommandItem>
          <CommandItem>Generate Report</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Quick actions command palette with create, navigation, and tool commands.",
      },
    },
  },
};

export const WithModal: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen((open) => !open);
        }
      };

      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }, []);

    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-neutral-600">
            Press{" "}
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-neutral-100 px-1.5 font-mono text-[10px] font-medium text-neutral-600">
              <span className="text-xs">⌘</span>K
            </kbd>{" "}
            to open command palette
          </p>
          <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[20vh] z-50">
            <Command className="rounded-lg border shadow-md w-125 bg-white">
              <CommandInput
                placeholder="Type a command or search..."
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                }}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Quick Actions">
                  <CommandItem onSelect={() => setOpen(false)}>
                    <FileIcon className="mr-2 h-4 w-4" />
                    Create New File
                    <CommandShortcut>⌘N</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => setOpen(false)}>
                    <FolderIcon className="mr-2 h-4 w-4" />
                    Open Folder
                    <CommandShortcut>⌘O</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => setOpen(false)}>
                    <SearchIcon className="mr-2 h-4 w-4" />
                    Search Files
                    <CommandShortcut>⌘F</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                  <CommandItem onSelect={() => setOpen(false)}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile Settings
                  </CommandItem>
                  <CommandItem onSelect={() => setOpen(false)}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Preferences
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Command palette as a modal overlay with keyboard shortcut activation.",
      },
    },
  },
};

export const TeamDirectory: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-112.5">
      <CommandInput placeholder="Search team members..." />
      <CommandList>
        <CommandEmpty>No team members found.</CommandEmpty>
        <CommandGroup heading="Engineering">
          <CommandItem>
            <UserIcon className="mr-2 h-4 w-4" />
            Alex Rivera - Senior Engineer
            <CommandShortcut>online</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <UserIcon className="mr-2 h-4 w-4" />
            Sarah Chen - Frontend Lead
            <CommandShortcut>away</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <UserIcon className="mr-2 h-4 w-4" />
            Mike Johnson - DevOps
            <CommandShortcut>offline</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Design">
          <CommandItem>
            <UserIcon className="mr-2 h-4 w-4" />
            Emma Davis - UX Designer
            <CommandShortcut>online</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <UserIcon className="mr-2 h-4 w-4" />
            James Wilson - Design Lead
            <CommandShortcut>busy</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Product">
          <CommandItem>
            <UserIcon className="mr-2 h-4 w-4" />
            Lisa Thompson - Product Manager
            <CommandShortcut>online</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Team directory search with grouped departments and status indicators.",
      },
    },
  },
};

export const CodeEditor: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-sm">
        <div className="flex items-center justify-between mb-4">
          <span>editor.tsx</span>
          <kbd className="text-xs bg-neutral-700 px-2 py-1 rounded">⌘K</kbd>
        </div>
        <div className="space-y-1 text-neutral-300">
          <div>import React from 'react';</div>
          <div>import {"{ useState }"} from 'react';</div>
          <div></div>
          <div>function Editor() {"{"}</div>
          <div className="ml-4">const [value, setValue] = useState('');</div>
          <div className="ml-4">// Your cursor is here |</div>
          <div>{"}"}</div>
        </div>
      </div>

      <Command className="rounded-lg border shadow-md w-full">
        <CommandInput placeholder="Search commands..." />
        <CommandList>
          <CommandEmpty>No commands found.</CommandEmpty>
          <CommandGroup heading="Editing">
            <CommandItem>
              Format Document
              <CommandShortcut>⇧⌥F</CommandShortcut>
            </CommandItem>
            <CommandItem>
              Find and Replace
              <CommandShortcut>⌘H</CommandShortcut>
            </CommandItem>
            <CommandItem>
              Go to Line
              <CommandShortcut>⌘G</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="View">
            <CommandItem>
              Toggle Sidebar
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              Toggle Terminal
              <CommandShortcut>⌃`</CommandShortcut>
            </CommandItem>
            <CommandItem>
              Zen Mode
              <CommandShortcut>⌘K Z</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Git">
            <CommandItem>Commit Changes</CommandItem>
            <CommandItem>Push to Remote</CommandItem>
            <CommandItem>Create Branch</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Code editor command palette with editing, view, and git commands.",
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <p className="text-sm text-neutral-600">
          Command palette supports full keyboard navigation. Use arrows to
          navigate, Enter to select, Escape to close.
        </p>
      </div>

      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Accessible command search..."
          aria-label="Search for commands"
        />
        <CommandList role="listbox">
          <CommandEmpty>No accessible commands found.</CommandEmpty>
          <CommandGroup heading="Navigation" role="group">
            <CommandItem role="option">
              Go to Home
              <CommandShortcut>⌘H</CommandShortcut>
            </CommandItem>
            <CommandItem role="option">
              Go to Settings
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
            <CommandItem role="option">
              Go to Help
              <CommandShortcut>⌘?</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions" role="group">
            <CommandItem role="option">
              Save Document
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem role="option">
              Print Document
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>

      <p className="text-xs text-neutral-600">
        Screen readers announce group headings and selected items
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates comprehensive accessibility features including ARIA roles and keyboard navigation.",
      },
    },
  },
};
