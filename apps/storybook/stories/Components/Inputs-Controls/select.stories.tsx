import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, screen } from "storybook/test";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@wyliedog/ui/select";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";

// Using bare Meta because `size` lives on SelectTrigger, not the Select root
const meta: Meta = {
  title: "Components/Inputs & Controls/Select",
  component: Select,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Select component built on Radix UI primitives with keyboard navigation, search, and full accessibility support. Includes trigger, content, items, and separator sub-components.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "The size of the select trigger and label",
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: '"md"' },
        category: "Appearance",
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the select is disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "State",
      },
    },
  },
  args: {
    size: "md",
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

type SelectStoryArgs = {
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Basic select with label and placeholder for single-value selection.",
      },
    },
  },
  render: (args) => {
    const { size, disabled } = args as SelectStoryArgs;
    return (
      <div className="w-64 space-y-2">
        <Label htmlFor="default-select" size={size}>
          Choose a country
        </Label>
        <Select disabled={disabled} size={size}>
          <SelectTrigger>
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="de">Germany</SelectItem>
            <SelectItem value="fr">France</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const WithError: Story = {
  parameters: {
    docs: {
      description: {
        story: "Error state with validation message for required selections.",
      },
    },
  },
  render: () => (
    <div className="w-64 space-y-2">
      <Label htmlFor="error-select" error required>
        Choose a category
      </Label>
      <Select>
        <SelectTrigger error>
          <SelectValue placeholder="This field is required" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tech">Technology</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="business">Business</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-(--color-status-danger)">
        Please select a category
      </p>
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Size variants with matching label sizes for different interface densities.",
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div className="w-64 space-y-2">
        <Label size="sm">Small Select</Label>
        <Select size="sm">
          <SelectTrigger>
            <SelectValue placeholder="Small select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xs">Extra Small</SelectItem>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-64 space-y-2">
        <Label size="md">Medium Select (Default)</Label>
        <Select size="md">
          <SelectTrigger>
            <SelectValue placeholder="Medium select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-64 space-y-2">
        <Label size="lg">Large Select</Label>
        <Select size="lg">
          <SelectTrigger>
            <SelectValue placeholder="Large select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
            <SelectItem value="xl">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const WithSeparators: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Using separators to visually group related options within a select.",
      },
    },
  },
  render: () => (
    <div className="w-64 space-y-2">
      <Label>Choose your timezone</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
          <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
          <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
          <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
          <SelectSeparator />
          <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
          <SelectItem value="cet">Central European Time (CET)</SelectItem>
          <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const LongLists: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Selects with many options demonstrating scrollable content areas.",
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="w-64 space-y-2">
        <Label>Choose a language</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
            <SelectItem value="it">Italiano</SelectItem>
            <SelectItem value="pt">Português</SelectItem>
            <SelectItem value="ru">Русский</SelectItem>
            <SelectItem value="ja">日本語</SelectItem>
            <SelectItem value="ko">한국어</SelectItem>
            <SelectItem value="zh">中文</SelectItem>
            <SelectItem value="ar">العربية</SelectItem>
            <SelectItem value="hi">हिन्दी</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-64 space-y-2">
        <Label>Programming language</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="js">JavaScript</SelectItem>
            <SelectItem value="ts">TypeScript</SelectItem>
            <SelectItem value="py">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="cs">C#</SelectItem>
            <SelectItem value="go">Go</SelectItem>
            <SelectItem value="rust">Rust</SelectItem>
            <SelectItem value="php">PHP</SelectItem>
            <SelectItem value="ruby">Ruby</SelectItem>
            <SelectItem value="swift">Swift</SelectItem>
            <SelectItem value="kotlin">Kotlin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const FormExamples: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Real-world form patterns using selects for user profiles and project settings.",
      },
    },
  },
  render: () => (
    <div className="max-w-2xl space-y-8">
      {/* User Profile Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">User Profile</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name" required>
              First Name
            </Label>
            <Input id="first-name" placeholder="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name" required>
              Last Name
            </Label>
            <Input id="last-name" placeholder="Doe" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="fr">France</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Occupation</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developer">Software Developer</SelectItem>
                <SelectItem value="designer">UI/UX Designer</SelectItem>
                <SelectItem value="manager">Product Manager</SelectItem>
                <SelectItem value="analyst">Data Analyst</SelectItem>
                <SelectItem value="marketing">Marketing Specialist</SelectItem>
                <SelectSeparator />
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Project Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Project Settings</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label required>Project Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web Application</SelectItem>
                <SelectItem value="mobile">Mobile App</SelectItem>
                <SelectItem value="desktop">Desktop App</SelectItem>
                <SelectItem value="api">API Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Framework</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="vue">Vue.js</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
                <SelectItem value="svelte">Svelte</SelectItem>
                <SelectSeparator />
                <SelectItem value="next">Next.js</SelectItem>
                <SelectItem value="nuxt">Nuxt.js</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Team Size</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo (1 person)</SelectItem>
                <SelectItem value="small">Small (2-5 people)</SelectItem>
                <SelectItem value="medium">Medium (6-15 people)</SelectItem>
                <SelectItem value="large">Large (16+ people)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const WithInteractions: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Label htmlFor="test-select">Choose a fruit</Label>
      <Select>
        <SelectTrigger id="test-select">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectItem value="grape">Grape</SelectItem>
          <SelectItem value="mango">Mango</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Select is initially closed
    const options = screen.queryByRole("option", { name: /apple/i });
    expect(options).not.toBeInTheDocument();

    // Test 2: Find and click the trigger to open select
    const selectTrigger = canvas.getByRole("combobox");
    expect(selectTrigger).toBeInTheDocument();
    expect(selectTrigger).toHaveTextContent(/select a fruit/i);

    await userEvent.click(selectTrigger);

    // Wait for select animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Test 3: Select is open with all options visible
    const appleOption = screen.getByRole("option", { name: /apple/i });
    const bananaOption = screen.getByRole("option", { name: /banana/i });
    const orangeOption = screen.getByRole("option", { name: /orange/i });
    const grapeOption = screen.getByRole("option", { name: /grape/i });
    const mangoOption = screen.getByRole("option", { name: /mango/i });

    expect(appleOption).toBeInTheDocument();
    expect(bananaOption).toBeInTheDocument();
    expect(orangeOption).toBeInTheDocument();
    expect(grapeOption).toBeInTheDocument();
    expect(mangoOption).toBeInTheDocument();

    // Test 4: Arrow key navigation
    // Navigate down through options
    await userEvent.keyboard("{ArrowDown}");
    expect(appleOption).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    expect(bananaOption).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    expect(orangeOption).toHaveFocus();

    // Navigate up
    await userEvent.keyboard("{ArrowUp}");
    expect(bananaOption).toHaveFocus();

    // Test 5: Enter key to select
    await userEvent.keyboard("{Enter}");

    // Wait for select to close
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Select should be closed
    const closedOption = screen.queryByRole("option", { name: /banana/i });
    expect(closedOption).not.toBeInTheDocument();

    // Selected value should be displayed
    const updatedTrigger = canvas.getByRole("combobox");
    expect(updatedTrigger).toHaveTextContent(/banana/i);

    // Test 6: Open again and test Escape key
    await userEvent.click(updatedTrigger);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const reopenedOption = screen.getByRole("option", { name: /apple/i });
    expect(reopenedOption).toBeInTheDocument();

    // Press Escape to close
    await userEvent.keyboard("{Escape}");
    await new Promise((resolve) => setTimeout(resolve, 300));

    const escapedOption = screen.queryByRole("option", { name: /apple/i });
    expect(escapedOption).not.toBeInTheDocument();

    // Test 7: Open and click an option directly
    await userEvent.click(updatedTrigger);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mangoOpt = screen.getByRole("option", { name: /mango/i });
    expect(mangoOpt).toBeInTheDocument();

    await userEvent.click(mangoOpt);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Select should close and show selected value
    const finalClosedOption = screen.queryByRole("option", { name: /mango/i });
    expect(finalClosedOption).not.toBeInTheDocument();

    const finalTrigger = canvas.getByRole("combobox");
    expect(finalTrigger).toHaveTextContent(/mango/i);
  },
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive interaction test demonstrating select functionality including opening, closing, arrow key navigation (ArrowDown, ArrowUp), Enter key selection, Escape key closing, value display, and mouse click interactions. Uses play functions to simulate real user interactions. View the Interactions panel to see the automated test execution.",
      },
    },
  },
};
