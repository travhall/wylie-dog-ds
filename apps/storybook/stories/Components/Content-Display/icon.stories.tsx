import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BellIcon,
  CheckIcon,
  HeartIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";
import { Icon } from "@wyliedog/ui/icon";
import { Button } from "@wyliedog/ui/button";

const meta: Meta<typeof Icon> = {
  title: "Components/Content Display/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Renders any icon component at a token size with the token stroke weight. The glyph comes from the icon library you already use (lucide-react here); the system owns size and stroke, so changing `icon.size.*` or `icon.stroke-width` changes every icon at once. Without `size` the icon keeps the size its caller gives it through `className`, which is how the system's own components size theirs.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: false,
      description:
        "The glyph: a component that renders an SVG and accepts className, such as a lucide-react icon.",
      table: { type: { summary: "React.ElementType" }, category: "Content" },
    },
    size: {
      control: "radio",
      options: ["xs", "sm", "md", "lg", "xl"],
      description:
        "Icon size from the icon.size tokens: xs 12px, sm 16px, md 24px, lg 32px, xl 40px. Omit it to size the icon through className.",
      table: { type: { summary: "string" }, category: "Appearance" },
    },
  },
  args: { icon: HeartIcon, size: "md" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: "The five token sizes, all with the same stroke weight.",
      },
    },
  },
  render: () => (
    <div className="flex items-end gap-6">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon icon={HeartIcon} size={size} />
          <span className="text-xs">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const Glyphs: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Any glyph from the library works; the stroke weight is the same for all of them.",
      },
    },
  },
  render: () => (
    <div className="flex gap-6">
      {[BellIcon, CheckIcon, HeartIcon, PlusIcon, SearchIcon, SettingsIcon].map(
        (Glyph, index) => (
          <Icon key={index} icon={Glyph} size="lg" />
        )
      )}
    </div>
  ),
};

export const InAButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A slot icon in a button: the button's own gap sits between it and the label.",
      },
    },
  },
  render: () => (
    <Button>
      <Icon icon={PlusIcon} size="sm" />
      Add item
    </Button>
  ),
};

export const YourOwnGlyph: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Not tied to lucide: any component that renders an SVG and takes className works.",
      },
    },
  },
  render: () => {
    const Dash = (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        {...props}
      >
        <path d="M4 12h16" />
        <path d="M4 6h10" />
        <path d="M4 18h13" />
      </svg>
    );
    return <Icon icon={Dash} size="lg" />;
  },
};
