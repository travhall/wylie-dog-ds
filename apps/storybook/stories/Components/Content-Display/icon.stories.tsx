import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
  BoldIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleIcon,
  CircleXIcon,
  EllipsisIcon,
  FileIcon,
  FolderIcon,
  GripVerticalIcon,
  HeartIcon,
  HouseIcon,
  InfoIcon,
  ItalicIcon,
  LinkIcon,
  MapPinIcon,
  MenuIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SlashIcon,
  TriangleAlertIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { Icon } from "@wyliedog/ui/icon";
import { Button } from "@wyliedog/ui/button";

// The glyphs the Figma Icon set draws, by the name Figma gives them. The Icon component takes ANY
// glyph; this list is what the library shows (the picker below and the Glyphs story) and it must
// match the Figma set's `icon` options, which scripts/__tests__/icon-glyphs.test.mjs checks.
const GLYPHS = {
  Heart: HeartIcon,
  "Chevron Down": ChevronDownIcon,
  "Chevron Left": ChevronLeftIcon,
  "Chevron Right": ChevronRightIcon,
  X: XIcon,
  Check: CheckIcon,
  Circle: CircleIcon,
  Search: SearchIcon,
  Ellipsis: EllipsisIcon,
  "Grip Vertical": GripVerticalIcon,
  Minus: MinusIcon,
  "Arrow Right": ArrowRightIcon,
  Plus: PlusIcon,
  User: UserIcon,
  Settings: SettingsIcon,
  Bell: BellIcon,
  Calendar: CalendarIcon,
  House: HouseIcon,
  Link: LinkIcon,
  Folder: FolderIcon,
  File: FileIcon,
  "Map Pin": MapPinIcon,
  Bold: BoldIcon,
  Italic: ItalicIcon,
  Info: InfoIcon,
  "Circle Check": CircleCheckIcon,
  "Triangle Alert": TriangleAlertIcon,
  "Circle X": CircleXIcon,
  Slash: SlashIcon,
  "Chevrons Up Down": ChevronsUpDownIcon,
  "Arrow Left": ArrowLeftIcon,
  Menu: MenuIcon,
  "Align Left": AlignLeftIcon,
  "Align Center": AlignCenterIcon,
  "Align Right": AlignRightIcon,
  "Circle Alert": CircleAlertIcon,
} as const;

const meta: Meta<typeof Icon> = {
  title: "Components/Content Display/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
    docs: {
      // the code shows the glyph the way you import it: icon="Map Pin" becomes icon={MapPinIcon}
      source: {
        transform: (code: string) =>
          code.replace(
            /icon="([^"]+)"/,
            (_: string, name: string) =>
              `icon={${name.replace(/\s+/g, "")}Icon}`
          ),
      },
      description: {
        component:
          "Renders any icon component at a token size with the token stroke weight. The glyph comes from the icon library you already use (lucide-react here); the system owns size and stroke, so changing the icon size or stroke tokens changes every icon at once. Without `size` the icon keeps the size its caller gives it through `className`, which is how the system's own components size theirs.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: "select",
      options: Object.keys(GLYPHS),
      description:
        "The glyph: a component that renders an SVG and accepts className, such as a lucide-react icon. The control lists the glyphs the Figma Icon set draws by name; any other glyph works in code.",
      table: { type: { summary: "React.ElementType" }, category: "Content" },
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description:
        "Icon size from the icon.size tokens: sm 16px, md 24px, lg 32px. Omit it to size the icon through className.",
      table: { type: { summary: "string" }, category: "Appearance" },
    },
  },
  // the picker works with the glyph's name; the story turns it into the component
  args: { icon: "Heart" as unknown as React.ElementType, size: "md" },
  render: ({ icon, ...args }) => {
    const Glyph =
      typeof icon === "string" ? GLYPHS[icon as keyof typeof GLYPHS] : icon;
    return <Icon icon={Glyph} {...args} />;
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: "The three token sizes, all with the same stroke weight.",
      },
    },
  },
  render: () => (
    <div className="flex items-end gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
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
    layout: "padded",
    docs: {
      description: {
        story:
          "The glyphs the Figma Icon set draws, at the same names. Any glyph from your icon library works the same way; the stroke weight is the same for all of them.",
      },
    },
  },
  render: () => (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-6 p-0">
      {Object.entries(GLYPHS).map(([name, Glyph]) => (
        <li key={name} className="flex flex-col items-center gap-2">
          <Icon icon={Glyph} size="lg" aria-hidden="true" />
          <span className="text-center text-xs">{name}</span>
        </li>
      ))}
    </ul>
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
