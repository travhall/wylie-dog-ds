import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "@wyliedog/ui/aspect-ratio";

const meta: Meta<typeof AspectRatio> = {
  title: "Components/Layout & Structure/AspectRatio",
  component: AspectRatio,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Maintains consistent aspect ratios for content, useful for images, videos, and responsive layouts.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    ratio: {
      control: "number",
      description: "The aspect ratio (width / height)",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
        category: "Appearance",
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
        story: "Standard 16:9 widescreen aspect ratio container.",
      },
    },
  },
  render: () => (
    <div className="w-75">
      <AspectRatio ratio={16 / 9}>
        <div className="bg-(--color-background-secondary) w-full h-full flex items-center justify-center text-(--color-text-secondary)">
          16:9 Aspect Ratio
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "1:1 square aspect ratio, ideal for profile images and thumbnails.",
      },
    },
  },
  render: () => (
    <div className="w-50">
      <AspectRatio ratio={1}>
        <div className="bg-(--color-interactive-primary)/20 w-full h-full flex items-center justify-center text-(--color-interactive-primary)">
          1:1 Square
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  parameters: {
    docs: {
      description: {
        story: "3:4 portrait aspect ratio for vertical content.",
      },
    },
  },
  render: () => (
    <div className="w-50">
      <AspectRatio ratio={3 / 4}>
        <div className="bg-(--color-status-success)/20 w-full h-full flex items-center justify-center text-(--color-status-success)">
          3:4 Portrait
        </div>
      </AspectRatio>
    </div>
  ),
};

export const CommonRatios: Story = {
  parameters: {
    docs: {
      description: {
        story: "Comparison of common aspect ratios: 16:9, 4:3, and 1:1.",
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">16:9 Widescreen</h4>
        <div className="w-75">
          <AspectRatio ratio={16 / 9}>
            <div className="bg-(--color-status-danger)/20 w-full h-full flex items-center justify-center text-(--color-status-danger)">
              Video/Monitor
            </div>
          </AspectRatio>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">4:3 Traditional</h4>
        <div className="w-75">
          <AspectRatio ratio={4 / 3}>
            <div className="bg-(--color-status-warning)/20 w-full h-full flex items-center justify-center text-(--color-status-warning)">
              Old TV/Photo
            </div>
          </AspectRatio>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">1:1 Square</h4>
        <div className="w-50">
          <AspectRatio ratio={1}>
            <div className="bg-(--color-accent-hover)/20 w-full h-full flex items-center justify-center text-(--color-accent-hover)">
              Instagram
            </div>
          </AspectRatio>
        </div>
      </div>
    </div>
  ),
};

export const WithImage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Aspect ratio container with a responsive image using object-cover.",
      },
    },
  },
  render: () => (
    <div className="w-100">
      <AspectRatio ratio={16 / 9}>
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Photo by Drew Beamer"
          className="rounded-md object-cover w-full h-full"
        />{" "}
        {/* cSpell:ignore Drew Beamer */}
      </AspectRatio>
    </div>
  ),
};

export const VideoFrame: Story = {
  parameters: {
    docs: {
      description: {
        story: "16:9 video player placeholder with a play button overlay.",
      },
    },
  },
  render: () => (
    <div className="w-125">
      <AspectRatio ratio={16 / 9}>
        <div className="bg-(--color-background-inverse) w-full h-full flex items-center justify-center text-(--color-text-inverse) rounded-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-0 h-0 border-l-4 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"></div>
            </div>
            <p className="text-sm">Video Player</p>
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const ResponsiveGallery: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Responsive grid of square aspect ratio items that reflow across breakpoints.",
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }, (_, i) => (
        <AspectRatio
          key={i}
          ratio={1}
          className="bg-(--color-background-secondary) rounded-lg"
        >
          <div className="w-full h-full flex items-center justify-center text-(--color-text-secondary)">
            Item {i + 1}
          </div>
        </AspectRatio>
      ))}
    </div>
  ),
};
