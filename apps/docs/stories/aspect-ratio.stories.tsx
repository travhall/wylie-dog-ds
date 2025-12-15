import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "@wyliedog/ui/aspect-ratio";

const meta: Meta<typeof AspectRatio> = {
  title: "3. Components/Layout/AspectRatio",
  component: AspectRatio,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: "Maintains consistent aspect ratios for content, useful for images, videos, and responsive layouts."
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    ratio: {
      control: "number",
      description: "The aspect ratio (width / height)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={16 / 9}>
        <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-600">
          16:9 Aspect Ratio
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  render: () => (
    <div className="w-[200px]">
      <AspectRatio ratio={1}>
        <div className="bg-blue-100 w-full h-full flex items-center justify-center text-blue-700">
          1:1 Square
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  render: () => (
    <div className="w-[200px]">
      <AspectRatio ratio={3 / 4}>
        <div className="bg-green-100 w-full h-full flex items-center justify-center text-green-700">
          3:4 Portrait
        </div>
      </AspectRatio>
    </div>
  ),
};

export const CommonRatios: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">16:9 Widescreen</h4>
        <div className="w-[300px]">
          <AspectRatio ratio={16 / 9}>
            <div className="bg-red-100 w-full h-full flex items-center justify-center text-red-700">
              Video/Monitor
            </div>
          </AspectRatio>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">4:3 Traditional</h4>
        <div className="w-[300px]">
          <AspectRatio ratio={4 / 3}>
            <div className="bg-yellow-100 w-full h-full flex items-center justify-center text-yellow-700">
              Old TV/Photo
            </div>
          </AspectRatio>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">1:1 Square</h4>
        <div className="w-[200px]">
          <AspectRatio ratio={1}>
            <div className="bg-purple-100 w-full h-full flex items-center justify-center text-purple-700">
              Instagram
            </div>
          </AspectRatio>
        </div>
      </div>
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div className="w-[400px]">
      <AspectRatio ratio={16 / 9}>
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Photo by Drew Beamer"
          className="rounded-md object-cover w-full h-full"
        />
      </AspectRatio>
    </div>
  ),
};

export const VideoFrame: Story = {
  render: () => (
    <div className="w-[500px]">
      <AspectRatio ratio={16 / 9}>
        <div className="bg-black w-full h-full flex items-center justify-center text-white rounded-md">
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
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }, (_, i) => (
        <AspectRatio key={i} ratio={1} className="bg-gray-100 rounded-lg">
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            Item {i + 1}
          </div>
        </AspectRatio>
      ))}
    </div>
  ),
};
