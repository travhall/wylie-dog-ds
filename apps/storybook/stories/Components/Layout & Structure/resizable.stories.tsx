import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@wyliedog/ui/resizable";

// Use bare Meta to document props from sub-components (e.g. autoSaveId)
// that don't exist on the root ResizablePanelGroup element.
const meta: Meta = {
  title: "Components/Layout & Structure/Resizable",
  component: ResizablePanelGroup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Resizable panels with drag handles for creating flexible layouts like IDEs and dashboards. Built on react-resizable-panels with full accessibility including keyboard controls and ARIA attributes. Includes ResizablePanel and ResizableHandle subcomponents for building complex resizable layouts with horizontal and vertical orientations, nested panels, minimum/maximum sizes, and collapsible panels. Perfect for code editors, file managers, and data visualization tools.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    direction: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description:
        "The orientation of the panel group (horizontal splits left-right, vertical splits top-bottom)",
      table: {
        type: { summary: '"horizontal" | "vertical"' },
        defaultValue: { summary: '"horizontal"' },
        category: "Appearance",
      },
    },
    autoSaveId: {
      control: "text",
      description:
        "Unique ID for automatically persisting panel sizes to localStorage",
      table: {
        type: { summary: "string" },
        category: "Behavior",
      },
    },
    className: {
      control: "text",
      description:
        "Additional CSS classes to apply to the panel group container",
      table: {
        type: { summary: "string" },
        category: "Styling",
      },
    },
    onLayout: {
      control: false,
      description:
        "Callback fired when panel sizes change, receives array of panel sizes as percentages",
      table: {
        type: { summary: "(sizes: number[]) => void" },
        category: "Behavior",
      },
    },
    children: {
      control: false,
      description:
        "ResizablePanel components separated by ResizableHandle components",
      table: {
        type: { summary: "React.ReactNode" },
        category: "Content",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  parameters: {
    docs: {
      description: {
        story: "Two-panel horizontal split with draggable divider.",
      },
    },
  },
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-50 items-center justify-center p-6">
          <span className="font-semibold">One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-50 items-center justify-center p-6">
          <span className="font-semibold">Two</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Vertical: Story = {
  parameters: {
    docs: {
      description: {
        story: "Two-panel vertical split with header and content areas.",
      },
    },
  },
  render: () => (
    <ResizablePanelGroup
      direction="vertical"
      className="min-h-125 max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Header</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={75}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const ThreePanels: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Three-panel layout with sidebar, main content, and details panel.",
      },
    },
  },
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-w-4xl rounded-lg border"
    >
      <ResizablePanel defaultSize={25}>
        <div className="flex h-50 items-center justify-center p-6">
          <span className="font-semibold">Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-50 items-center justify-center p-6">
          <span className="font-semibold">Main Content</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25}>
        <div className="flex h-50 items-center justify-center p-6">
          <span className="font-semibold">Details</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const IDELayout: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "IDE-style layout with nested panels: file explorer, editor, terminal, and properties.",
      },
    },
  },
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-w-4xl min-h-50 rounded-lg border"
    >
      <ResizablePanel defaultSize={20} minSize={15}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-center p-3 border-b">
            <span className="font-semibold text-sm">File Explorer</span>
          </div>
          <div className="flex-1 p-3">
            <div className="space-y-1 text-sm">
              <div>📁 src/</div>
              <div className="ml-4">📄 App.tsx</div>
              <div className="ml-4">📄 index.ts</div>
              <div>📁 components/</div>
              <div className="ml-4">📄 Button.tsx</div>
            </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={60}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70}>
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-center p-3 border-b">
                <span className="font-semibold text-sm">Editor</span>
              </div>
              <div className="flex-1 p-3 bg-(--color-background-secondary)">
                <pre className="text-sm">
                  {`function App() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}`}
                </pre>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={30}>
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-center p-3 border-b">
                <span className="font-semibold text-sm">Terminal</span>
              </div>
              <div className="flex-1 p-3 bg-(--color-background-inverse) text-(--color-status-success) font-mono text-sm">
                $ npm run dev
                <br />
                Starting development server...
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={20} minSize={15}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-center p-3 border-b">
            <span className="font-semibold text-sm">Properties</span>
          </div>
          <div className="flex-1 p-3">
            <div className="space-y-2 text-sm">
              <div>
                <strong>Element:</strong> Button
              </div>
              <div>
                <strong>Type:</strong> Component
              </div>
              <div>
                <strong>Size:</strong> Medium
              </div>
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Dashboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Dashboard layout with header, sidebar, main area, and activity feed using nested panel groups.",
      },
    },
  },
  render: () => (
    <ResizablePanelGroup
      direction="vertical"
      className="max-w-4xl min-h-125 rounded-lg border"
    >
      <ResizablePanel defaultSize={20}>
        <div className="flex h-full items-center justify-center p-6 bg-(--color-interactive-primary)/10">
          <span className="font-semibold">Header & Navigation</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={30}>
            <div className="flex h-full items-center justify-center p-6 bg-(--color-interactive-success)/10">
              <span className="font-semibold">Sidebar</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={70}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={60}>
                <div className="flex h-full items-center justify-center p-6">
                  <span className="font-semibold">Main Dashboard</span>
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={40}>
                <div className="flex h-full items-center justify-center p-6 bg-(--color-status-warning)/10">
                  <span className="font-semibold">Activity Feed</span>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
