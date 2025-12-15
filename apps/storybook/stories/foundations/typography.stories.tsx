import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "2. Foundations/Typography",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Typography system demonstrating the type scale, hierarchy, and OKLCH color integration for text elements.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScale: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold mb-2">Heading 1</h1>
        <p className="text-sm text-gray-600 font-mono">text-5xl / 48px</p>
      </div>

      <div>
        <h2 className="text-4xl font-bold mb-2">Heading 2</h2>
        <p className="text-sm text-gray-600 font-mono">text-4xl / 36px</p>
      </div>

      <div>
        <h3 className="text-3xl font-bold mb-2">Heading 3</h3>
        <p className="text-sm text-gray-600 font-mono">text-3xl / 30px</p>
      </div>

      <div>
        <h4 className="text-2xl font-bold mb-2">Heading 4</h4>
        <p className="text-sm text-gray-600 font-mono">text-2xl / 24px</p>
      </div>

      <div>
        <h5 className="text-xl font-bold mb-2">Heading 5</h5>
        <p className="text-sm text-gray-600 font-mono">text-xl / 20px</p>
      </div>

      <div>
        <h6 className="text-lg font-bold mb-2">Heading 6</h6>
        <p className="text-sm text-gray-600 font-mono">text-lg / 18px</p>
      </div>

      <div>
        <p className="text-base mb-2">Body Large (Base)</p>
        <p className="text-sm text-gray-600 font-mono">text-base / 16px</p>
      </div>

      <div>
        <p className="text-sm mb-2">Body Small</p>
        <p className="text-sm text-gray-600 font-mono">text-sm / 14px</p>
      </div>

      <div>
        <p className="text-xs mb-2">Caption</p>
        <p className="text-sm text-gray-600 font-mono">text-xs / 12px</p>
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-xl font-light mb-1">Light Weight</p>
        <p className="text-sm text-gray-600 font-mono">font-light / 300</p>
      </div>

      <div>
        <p className="text-xl font-normal mb-1">Normal Weight</p>
        <p className="text-sm text-gray-600 font-mono">font-normal / 400</p>
      </div>

      <div>
        <p className="text-xl font-medium mb-1">Medium Weight</p>
        <p className="text-sm text-gray-600 font-mono">font-medium / 500</p>
      </div>

      <div>
        <p className="text-xl font-semibold mb-1">Semibold Weight</p>
        <p className="text-sm text-gray-600 font-mono">font-semibold / 600</p>
      </div>

      <div>
        <p className="text-xl font-bold mb-1">Bold Weight</p>
        <p className="text-sm text-gray-600 font-mono">font-bold / 700</p>
      </div>
    </div>
  ),
};

export const LineHeights: Story = {
  render: () => (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h4 className="text-lg font-semibold mb-2">Tight (leading-tight)</h4>
        <p className="leading-tight text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">Normal (leading-normal)</h4>
        <p className="leading-normal text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">
          Relaxed (leading-relaxed)
        </h4>
        <p className="leading-relaxed text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">Loose (leading-loose)</h4>
        <p className="leading-loose text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>
    </div>
  ),
};

export const TextColors: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-gray-900 text-lg mb-1">Primary Text</p>
        <p className="text-sm text-gray-600 font-mono">text-gray-900</p>
      </div>

      <div>
        <p className="text-gray-700 text-lg mb-1">Secondary Text</p>
        <p className="text-sm text-gray-600 font-mono">text-gray-700</p>
      </div>

      <div>
        <p className="text-gray-500 text-lg mb-1">Muted Text</p>
        <p className="text-sm text-gray-600 font-mono">text-gray-500</p>
      </div>

      <div>
        <p className="text-blue-600 text-lg mb-1">Link Text</p>
        <p className="text-sm text-gray-600 font-mono">text-blue-600</p>
      </div>

      <div>
        <p className="text-red-600 text-lg mb-1">Error Text</p>
        <p className="text-sm text-gray-600 font-mono">text-red-600</p>
      </div>

      <div>
        <p className="text-green-600 text-lg mb-1">Success Text</p>
        <p className="text-sm text-gray-600 font-mono">text-green-600</p>
      </div>
    </div>
  ),
};

export const TypographyHierarchy: Story = {
  render: () => (
    <div className="max-w-4xl space-y-6">
      <article className="prose prose-gray max-w-none">
        <h1>The Future of Design Systems</h1>
        <p className="lead text-xl text-gray-600">
          How OKLCH color science and modern web technologies are
          revolutionizing the way we build consistent user interfaces.
        </p>

        <h2>Introduction</h2>
        <p>
          Design systems have evolved significantly over the past decade. What
          started as simple style guides have transformed into sophisticated,
          token-driven architectures that enable teams to build cohesive
          experiences at scale.
        </p>

        <h3>Color Revolution</h3>
        <p>
          Traditional design systems relied on RGB and HSL color spaces, which
          don't account for human perception. OKLCH (Oklch) provides
          perceptually uniform colors, ensuring that color relationships remain
          consistent across different contexts and devices.
        </p>

        <blockquote>
          "OKLCH enables mathematical color generation that maintains perceptual
          uniformity—something impossible with traditional color spaces."
        </blockquote>

        <h4>Key Benefits</h4>
        <ul>
          <li>
            <strong>Perceptual uniformity:</strong> Colors appear equally bright
            to human eyes
          </li>
          <li>
            <strong>Extended gamut:</strong> 30% more colors than sRGB
          </li>
          <li>
            <strong>Mathematical precision:</strong> Algorithmic color
            generation
          </li>
          <li>
            <strong>Future-ready:</strong> Aligns with emerging web standards
          </li>
        </ul>

        <h5>Implementation Details</h5>
        <p>
          Implementing OKLCH in production requires careful consideration of
          browser support, fallback strategies, and design tool integration.
        </p>

        <h6>Browser Support</h6>
        <p>
          Modern browsers now support OKLCH natively, with 93% coverage as of
          2024. This makes OKLCH a viable choice for production applications.
        </p>
      </article>
    </div>
  ),
};

export const CodeTypography: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-3">Inline Code</h4>
        <p>
          Use the{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
            useState
          </code>{" "}
          hook to manage state in React components.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-3">Code Block</h4>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <code className="font-mono text-sm">
            {`function Button({ children, variant = "primary" }) {
  return (
    <button className={\`btn btn-\${variant}\`}>
      {children}
    </button>
  );
}`}
          </code>
        </pre>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-3">Terminal Output</h4>
        <pre className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
          {`$ npm install @wyliedog/ui
+ @wyliedog/ui@1.0.0
added 1 package from 1 contributor
✨ Done in 2.34s`}
        </pre>
      </div>
    </div>
  ),
};

export const ResponsiveTypography: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2">
          Responsive Heading
        </h1>
        <p className="text-sm text-gray-600 font-mono">
          text-2xl md:text-4xl lg:text-5xl
        </p>
      </div>

      <div>
        <p className="text-sm md:text-base lg:text-lg mb-2">
          This paragraph adapts its size based on screen size. On mobile it's
          smaller, on tablet it's medium, and on desktop it's larger for better
          readability.
        </p>
        <p className="text-sm text-gray-600 font-mono">
          text-sm md:text-base lg:text-lg
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            Mobile First
          </h3>
          <p className="text-sm md:text-base text-gray-700">
            Typography scales up from mobile to larger screens, ensuring
            readability across all devices.
          </p>
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            Flexible Layout
          </h3>
          <p className="text-sm md:text-base text-gray-700">
            Text size and layout adjust automatically to provide optimal reading
            experience on any device.
          </p>
        </div>
      </div>
    </div>
  ),
};
