import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleGroup, ToggleGroupItem } from "@wyliedog/ui/toggle-group";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  ListIcon,
  ImageIcon,
  LinkIcon,
  Code2Icon,
} from "lucide-react";

const meta: Meta<typeof ToggleGroup> = {
  title: "3. Components/Inputs/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Toggle button groups for selecting one or multiple options. Built on Radix UI primitives with full accessibility support and keyboard navigation.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "radio",
      options: ["single", "multiple"],
      description: "Whether only one or multiple items can be selected",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "single" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the entire group is disabled",
    },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout orientation of the toggle group",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "horizontal" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="center">
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeftIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenterIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRightIcon className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={["bold", "italic"]}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        <BoldIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <ItalicIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <UnderlineIcon className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Multiple selection mode allows several items to be selected simultaneously.",
      },
    },
  },
};

export const WithText: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="list">
      <ToggleGroupItem value="card">Card View</ToggleGroupItem>
      <ToggleGroupItem value="list">List View</ToggleGroupItem>
      <ToggleGroupItem value="grid">Grid View</ToggleGroupItem>
    </ToggleGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Toggle group with text labels for view switching.",
      },
    },
  },
};

export const TextFormatting: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Text Style</h4>
        <ToggleGroup type="multiple">
          <ToggleGroupItem value="bold" aria-label="Bold">
            <BoldIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <ItalicIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <UnderlineIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Text Alignment</h4>
        <ToggleGroup type="single" defaultValue="left">
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeftIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenterIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRightIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" aria-label="Justify">
            <AlignJustifyIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Rich text editor toolbar with formatting options.",
      },
    },
  },
};

export const Vertical: Story = {
  render: () => (
    <ToggleGroup type="single" orientation="vertical" className="flex-col">
      <ToggleGroupItem value="home" className="w-full justify-start">
        Home
      </ToggleGroupItem>
      <ToggleGroupItem value="about" className="w-full justify-start">
        About
      </ToggleGroupItem>
      <ToggleGroupItem value="services" className="w-full justify-start">
        Services
      </ToggleGroupItem>
      <ToggleGroupItem value="contact" className="w-full justify-start">
        Contact
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Vertical orientation for sidebar navigation or vertical toolbars.",
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Normal State</h4>
        <ToggleGroup type="single">
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
          <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">With Selection</h4>
        <ToggleGroup type="single" defaultValue="option2">
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
          <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Disabled State</h4>
        <ToggleGroup type="single" disabled>
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
          <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Individual Disabled Items</h4>
        <ToggleGroup type="single">
          <ToggleGroupItem value="option1">Available</ToggleGroupItem>
          <ToggleGroupItem value="option2" disabled>
            Disabled
          </ToggleGroupItem>
          <ToggleGroupItem value="option3">Available</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Different states including normal, selected, and disabled options.",
      },
    },
  },
};

export const FilterControls: Story = {
  render: () => (
    <div className="space-y-6 max-w-lg">
      <h3 className="text-lg font-semibold">Filter Products</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Categories</h4>
          <ToggleGroup type="multiple" defaultValue={["electronics"]}>
            <ToggleGroupItem value="electronics">Electronics</ToggleGroupItem>
            <ToggleGroupItem value="clothing">Clothing</ToggleGroupItem>
            <ToggleGroupItem value="books">Books</ToggleGroupItem>
            <ToggleGroupItem value="home">Home & Garden</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Price Range</h4>
          <ToggleGroup type="single" defaultValue="medium">
            <ToggleGroupItem value="low">$0-$50</ToggleGroupItem>
            <ToggleGroupItem value="medium">$50-$200</ToggleGroupItem>
            <ToggleGroupItem value="high">$200+</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Features</h4>
          <ToggleGroup type="multiple">
            <ToggleGroupItem value="free-shipping">
              Free Shipping
            </ToggleGroupItem>
            <ToggleGroupItem value="prime">Prime Eligible</ToggleGroupItem>
            <ToggleGroupItem value="sale">On Sale</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Product filtering interface with multiple toggle groups.",
      },
    },
  },
};

export const MediaControls: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <h3 className="text-lg font-semibold">Media Player</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Playback Speed</h4>
          <ToggleGroup type="single" defaultValue="1x">
            <ToggleGroupItem value="0.5x">0.5x</ToggleGroupItem>
            <ToggleGroupItem value="1x">1x</ToggleGroupItem>
            <ToggleGroupItem value="1.25x">1.25x</ToggleGroupItem>
            <ToggleGroupItem value="1.5x">1.5x</ToggleGroupItem>
            <ToggleGroupItem value="2x">2x</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Audio Options</h4>
          <ToggleGroup type="multiple" defaultValue={["captions"]}>
            <ToggleGroupItem value="captions">Captions</ToggleGroupItem>
            <ToggleGroupItem value="audio-description">
              Audio Description
            </ToggleGroupItem>
            <ToggleGroupItem value="repeat">Repeat</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quality</h4>
          <ToggleGroup type="single" defaultValue="auto">
            <ToggleGroupItem value="auto">Auto</ToggleGroupItem>
            <ToggleGroupItem value="480p">480p</ToggleGroupItem>
            <ToggleGroupItem value="720p">720p</ToggleGroupItem>
            <ToggleGroupItem value="1080p">1080p</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Media player controls with various settings groups.",
      },
    },
  },
};

export const EditorToolbar: Story = {
  render: () => (
    <div className="space-y-4 p-4 border rounded-lg max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Rich Text Editor</h3>
        <div className="flex gap-2">
          <ToggleGroup type="multiple">
            <ToggleGroupItem value="save" aria-label="Auto-save">
              Auto-save
            </ToggleGroupItem>
            <ToggleGroupItem value="preview" aria-label="Live preview">
              Preview
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <ToggleGroup type="multiple">
          <ToggleGroupItem value="bold" aria-label="Bold">
            <BoldIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <ItalicIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <UnderlineIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="w-px h-6 bg-neutral-200" />

        <ToggleGroup type="single" defaultValue="left">
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeftIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenterIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRightIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="w-px h-6 bg-neutral-200" />

        <ToggleGroup type="multiple">
          <ToggleGroupItem value="list" aria-label="Bullet list">
            <ListIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="link" aria-label="Insert link">
            <LinkIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="image" aria-label="Insert image">
            <ImageIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="code" aria-label="Code block">
            <Code2Icon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <textarea
        className="w-full h-32 p-3 border border-neutral-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Start writing..."
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Complete editor toolbar with multiple toggle groups for different functionalities.",
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
          Use Tab to navigate between groups, Arrow keys within groups, Space to
          toggle.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Text Formatting (Multiple Selection)
          </label>
          <ToggleGroup
            type="multiple"
            aria-label="Text formatting options"
            className="border border-neutral-200 rounded-md p-1"
          >
            <ToggleGroupItem
              value="bold"
              aria-label="Make text bold"
              aria-describedby="bold-desc"
            >
              <BoldIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="italic"
              aria-label="Make text italic"
              aria-describedby="italic-desc"
            >
              <ItalicIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="underline"
              aria-label="Underline text"
              aria-describedby="underline-desc"
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <div className="mt-2 space-y-1">
            <p id="bold-desc" className="text-xs text-neutral-600">
              Bold: Ctrl+B
            </p>
            <p id="italic-desc" className="text-xs text-neutral-600">
              Italic: Ctrl+I
            </p>
            <p id="underline-desc" className="text-xs text-neutral-600">
              Underline: Ctrl+U
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            View Mode (Single Selection)
          </label>
          <ToggleGroup
            type="single"
            defaultValue="list"
            aria-label="Choose view mode"
            className="border border-neutral-200 rounded-md p-1"
          >
            <ToggleGroupItem value="list" aria-label="List view mode">
              List
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view mode">
              Grid
            </ToggleGroupItem>
            <ToggleGroupItem value="card" aria-label="Card view mode">
              Card
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
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
