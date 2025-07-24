import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@wyliedog/ui/resizable";

const meta: Meta<typeof ResizablePanelGroup> = {
  title: "Components/Resizable",
  component: ResizablePanelGroup,
  parameters: { 
    layout: "padded",
    docs: {
      description: {
        component: "Resizable panels with drag handles for creating flexible layouts like IDEs and dashboards."
      }
    }
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">Two</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="vertical"
      className="min-h-[200px] max-w-md rounded-lg border"
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
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-w-4xl rounded-lg border"
    >
      <ResizablePanel defaultSize={25}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">Main Content</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">Details</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const IDELayout: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-w-4xl min-h-[400px] rounded-lg border"
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
              <div className="flex-1 p-3 bg-gray-50">
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
              <div className="flex-1 p-3 bg-black text-green-400 font-mono text-sm">
                $ npm run dev<br />
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
              <div><strong>Element:</strong> Button</div>
              <div><strong>Type:</strong> Component</div>
              <div><strong>Size:</strong> Medium</div>
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Dashboard: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="vertical"
      className="max-w-4xl min-h-[500px] rounded-lg border"
    >
      <ResizablePanel defaultSize={20}>
        <div className="flex h-full items-center justify-center p-6 bg-blue-50">
          <span className="font-semibold">Header & Navigation</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={30}>
            <div className="flex h-full items-center justify-center p-6 bg-green-50">
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
                <div className="flex h-full items-center justify-center p-6 bg-yellow-50">
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
