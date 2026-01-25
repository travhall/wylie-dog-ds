import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@wyliedog/ui/tabs";
import { Button } from "@wyliedog/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";

const meta: Meta<typeof Tabs> = {
  title: "Components/Navigation/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description: "The default active tab",
    },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "The orientation of the tabs",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: "account",
  },
  render: (args) => (
    <Tabs {...args} className="w-(--spacing-1700)">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue="Pedro Duarte" />{" "}
          {/* cSpell:ignore Pedro Duarte */}
        </div>
        <div className="space-y-1">
          <Label htmlFor="username">Username</Label>
          <Input id="username" defaultValue="@peduarte" />{" "}
          {/* cSpell:ignore peduarte */}
        </div>
      </TabsContent>
      <TabsContent value="password" className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="current">Current password</Label>
          <Input id="current" type="password" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new">New password</Label>
          <Input id="new" type="password" />
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const WithCards: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-150">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-(--color-text-secondary)">
              This is the overview tab content. Here you can see a summary of
              your account.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-(--color-text-secondary)">
              View your analytics and performance metrics here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reports" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-(--color-text-secondary)">
              Generate and download reports from this section.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-(--color-text-secondary)">
              Manage your notification preferences here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const WithInteractions: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-(--spacing-1700)">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="home" className="space-y-2">
        <h3 className="text-lg font-semibold">Home Content</h3>
        <p>Welcome to the home tab.</p>
      </TabsContent>
      <TabsContent value="profile" className="space-y-2">
        <h3 className="text-lg font-semibold">Profile Content</h3>
        <p>This is your profile information.</p>
      </TabsContent>
      <TabsContent value="settings" className="space-y-2">
        <h3 className="text-lg font-semibold">Settings Content</h3>
        <p>Manage your settings here.</p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Home tab is initially active
    const homeTab = canvas.getByRole("tab", { name: /home/i });
    const profileTab = canvas.getByRole("tab", { name: /profile/i });
    const settingsTab = canvas.getByRole("tab", { name: /settings/i });

    expect(homeTab).toHaveAttribute("data-state", "active");
    expect(profileTab).toHaveAttribute("data-state", "inactive");
    expect(settingsTab).toHaveAttribute("data-state", "inactive");

    // Home content should be visible
    const homeContent = canvas.getByText(/welcome to the home tab/i);
    expect(homeContent).toBeInTheDocument();

    // Test 2: Click profile tab
    await userEvent.click(profileTab);

    // Wait for transition
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Profile tab should be active
    expect(profileTab).toHaveAttribute("data-state", "active");
    expect(homeTab).toHaveAttribute("data-state", "inactive");

    // Profile content should be visible
    const profileContent = canvas.getByText(
      /this is your profile information/i
    );
    expect(profileContent).toBeInTheDocument();

    // Home content should not be visible
    const hiddenHomeContent = canvas.queryByText(/welcome to the home tab/i);
    expect(hiddenHomeContent).not.toBeInTheDocument();

    // Test 3: Click settings tab
    await userEvent.click(settingsTab);
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(settingsTab).toHaveAttribute("data-state", "active");
    expect(profileTab).toHaveAttribute("data-state", "inactive");

    const settingsContent = canvas.getByText(/manage your settings here/i);
    expect(settingsContent).toBeInTheDocument();

    // Test 4: Arrow key navigation
    // Focus the settings tab first
    settingsTab.focus();
    expect(settingsTab).toHaveFocus();

    // Arrow Left to profile tab
    await userEvent.keyboard("{ArrowLeft}");
    expect(profileTab).toHaveFocus();
    expect(profileTab).toHaveAttribute("data-state", "active");

    await new Promise((resolve) => setTimeout(resolve, 300));
    const profileContent2 = canvas.getByText(
      /this is your profile information/i
    );
    expect(profileContent2).toBeInTheDocument();

    // Arrow Left to home tab
    await userEvent.keyboard("{ArrowLeft}");
    expect(homeTab).toHaveFocus();
    expect(homeTab).toHaveAttribute("data-state", "active");

    await new Promise((resolve) => setTimeout(resolve, 300));
    const homeContent2 = canvas.getByText(/welcome to the home tab/i);
    expect(homeContent2).toBeInTheDocument();

    // Arrow Right to profile tab
    await userEvent.keyboard("{ArrowRight}");
    expect(profileTab).toHaveFocus();
    expect(profileTab).toHaveAttribute("data-state", "active");

    // Arrow Right to settings tab
    await userEvent.keyboard("{ArrowRight}");
    expect(settingsTab).toHaveFocus();
    expect(settingsTab).toHaveAttribute("data-state", "active");

    await new Promise((resolve) => setTimeout(resolve, 300));
    const settingsContent2 = canvas.getByText(/manage your settings here/i);
    expect(settingsContent2).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive interaction test demonstrating tabs functionality including tab switching with mouse clicks, arrow key navigation (ArrowLeft, ArrowRight), focus management, content visibility, and active state tracking. Uses play functions to simulate real user interactions. View the Interactions panel to see the automated test execution.",
      },
    },
  },
};
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-(--color-text-tertiary)">
          Small (sm)
        </h3>
        <Tabs defaultValue="tab1" className="w-(--spacing-1700)">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tab1" size="sm">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" size="sm">
              Tab 2
            </TabsTrigger>
            <TabsTrigger value="tab3" size="sm">
              Tab 3
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-(--color-text-tertiary)">
          Medium (md) - Default
        </h3>
        <Tabs defaultValue="tab1" className="w-(--spacing-1700)">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tab1" size="md">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" size="md">
              Tab 2
            </TabsTrigger>
            <TabsTrigger value="tab3" size="md">
              Tab 3
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-(--color-text-tertiary)">
          Large (lg)
        </h3>
        <Tabs defaultValue="tab1" className="w-(--spacing-1700)">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tab1" size="lg">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" size="lg">
              Tab 2
            </TabsTrigger>
            <TabsTrigger value="tab3" size="lg">
              Tab 3
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
};
