import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";

const meta: Meta = {
  title: "Foundations/Design Tokens/Token Usage",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "How to use design tokens in the Wylie Dog design system. Demonstrates the relationship between primitive and semantic tokens, dark mode adaptation, and the full color token map.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

// ============================================================================
// STORY 1: SemanticVsPrimitive
// ============================================================================

export const SemanticVsPrimitive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Semantic tokens reference primitive tokens and adapt automatically to light/dark themes. Use semantic tokens in components — never reach for primitives directly.",
      },
    },
  },
  render: () => {
    const examples = [
      {
        category: "Text",
        token: "--color-text-primary",
        primitive: "gray.900 / gray.50",
        visual: "var(--color-text-primary)",
        type: "text",
        label: "The quick brown fox",
      },
      {
        category: "Text",
        token: "--color-text-secondary",
        primitive: "gray.600 / gray.400",
        visual: "var(--color-text-secondary)",
        type: "text",
        label: "Secondary description text",
      },
      {
        category: "Background",
        token: "--color-background-primary",
        primitive: "white / gray.950",
        visual: "var(--color-background-primary)",
        type: "bg",
        label: "Page background",
      },
      {
        category: "Background",
        token: "--color-background-secondary",
        primitive: "gray.50 / gray.900",
        visual: "var(--color-background-secondary)",
        type: "bg",
        label: "Secondary surface",
      },
      {
        category: "Border",
        token: "--color-border-primary",
        primitive: "gray.200 / gray.700",
        visual: "var(--color-border-primary)",
        type: "border",
        label: "Default border",
      },
      {
        category: "Interactive",
        token: "--color-interactive-primary",
        primitive: "blue.600 / blue.400",
        visual: "var(--color-interactive-primary)",
        type: "bg",
        label: "Primary action",
      },
      {
        category: "Status",
        token: "--color-status-success",
        primitive: "green.600 / green.400",
        visual: "var(--color-status-success)",
        type: "bg",
        label: "Success state",
      },
      {
        category: "Status",
        token: "--color-status-danger",
        primitive: "red.600 / red.400",
        visual: "var(--color-status-danger)",
        type: "bg",
        label: "Danger/error state",
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Semantic vs Primitive Tokens
          </h2>
          <p className="text-sm text-(--color-text-secondary) mb-4">
            Semantic tokens map to primitive values and automatically adapt
            between light and dark themes. Always prefer semantic tokens in your
            components.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-(--color-border-primary)">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border-primary) bg-(--color-background-secondary)">
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">Token Name</th>
                <th className="text-left p-3 font-medium">CSS Variable</th>
                <th className="text-left p-3 font-medium">
                  Primitive Reference
                </th>
                <th className="text-left p-3 font-medium">Visual Result</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((ex) => (
                <tr
                  key={ex.token}
                  className="border-b border-(--color-border-secondary) last:border-0"
                >
                  <td className="p-3 text-(--color-text-secondary) font-medium text-xs">
                    {ex.category}
                  </td>
                  <td className="p-3">
                    <code className="text-xs font-mono bg-(--color-background-secondary) px-1.5 py-0.5 rounded">
                      {ex.token}
                    </code>
                  </td>
                  <td className="p-3">
                    <code className="text-xs font-mono text-(--color-text-secondary)">
                      var({ex.token})
                    </code>
                  </td>
                  <td className="p-3 text-xs text-(--color-text-tertiary) font-mono">
                    {ex.primitive}
                  </td>
                  <td className="p-3">
                    {ex.type === "text" && (
                      <span
                        className="text-sm font-medium"
                        style={{ color: `var(${ex.token})` }}
                      >
                        {ex.label}
                      </span>
                    )}
                    {ex.type === "bg" && (
                      <div
                        className="w-24 h-8 rounded border border-(--color-border-secondary) flex items-center justify-center text-xs"
                        style={{ backgroundColor: `var(${ex.token})` }}
                      >
                        {ex.label}
                      </div>
                    )}
                    {ex.type === "border" && (
                      <div
                        className="w-24 h-8 rounded flex items-center justify-center text-xs text-(--color-text-secondary)"
                        style={{ border: `2px solid var(${ex.token})` }}
                      >
                        {ex.label}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-6 text-sm">
              <div className="flex-1">
                <p className="font-medium text-(--color-status-danger) mb-1">
                  Avoid: Primitive tokens
                </p>
                <code className="block bg-(--color-background-secondary) p-2 rounded text-xs font-mono">
                  color: var(--color-gray-900);
                </code>
              </div>
              <div className="flex-1">
                <p className="font-medium text-(--color-status-success) mb-1">
                  Prefer: Semantic tokens
                </p>
                <code className="block bg-(--color-background-secondary) p-2 rounded text-xs font-mono">
                  color: var(--color-text-primary);
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
};

// ============================================================================
// STORY 2: DarkModeTokenDiff
// ============================================================================

export const DarkModeTokenDiff: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The same semantic tokens resolve to different values in light and dark mode. Toggle the Theme toolbar above to compare. This story renders both modes side-by-side for reference.",
      },
    },
  },
  render: () => {
    const tokens = [
      "--color-background-primary",
      "--color-background-secondary",
      "--color-text-primary",
      "--color-text-secondary",
      "--color-border-primary",
      "--color-interactive-primary",
    ];

    const DemoCard = ({ theme }: { theme: "light" | "dark" }) => (
      <div
        data-theme={theme}
        className={theme === "dark" ? "dark" : ""}
        style={{ colorScheme: theme }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span
                className={`w-3 h-3 rounded-full ${theme === "light" ? "bg-yellow-400" : "bg-slate-700 border border-slate-500"}`}
              />
              {theme === "light" ? "Light Mode" : "Dark Mode"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tokens.map((token) => (
              <div key={token} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border border-(--color-border-secondary) shrink-0"
                  style={{ backgroundColor: `var(${token})` }}
                />
                <code className="text-xs font-mono text-(--color-text-secondary) truncate">
                  {token}
                </code>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Dark Mode Token Adaptation
          </h2>
          <p className="text-sm text-(--color-text-secondary)">
            Semantic tokens resolve to different values in light vs dark themes.
            Use the Theme toolbar to toggle the global theme.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <DemoCard theme="light" />
          <DemoCard theme="dark" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-(--color-text-secondary)">
              The CSS custom properties in{" "}
              <code className="font-mono text-xs bg-(--color-background-secondary) px-1 py-0.5 rounded">
                :root
              </code>{" "}
              and{" "}
              <code className="font-mono text-xs bg-(--color-background-secondary) px-1 py-0.5 rounded">
                .dark
              </code>{" "}
              scopes define the token values for each theme. Components never
              need conditional logic — the token value switches automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  },
};

// ============================================================================
// STORY 3: ColorTokenMap
// ============================================================================

export const ColorTokenMap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All semantic color tokens organized by category. Each swatch shows the token name, a color preview, and its use-case category.",
      },
    },
  },
  render: () => {
    const tokenGroups = [
      {
        category: "Background",
        description: "Surface colors for page and container backgrounds",
        tokens: [
          { name: "--color-background-primary", label: "Primary" },
          { name: "--color-background-secondary", label: "Secondary" },
          { name: "--color-background-tertiary", label: "Tertiary" },
          { name: "--color-background-inverse", label: "Inverse" },
        ],
      },
      {
        category: "Text",
        description: "Typography colors for content hierarchy",
        tokens: [
          { name: "--color-text-primary", label: "Primary" },
          { name: "--color-text-secondary", label: "Secondary" },
          { name: "--color-text-tertiary", label: "Tertiary" },
          { name: "--color-text-inverse", label: "Inverse" },
        ],
      },
      {
        category: "Border",
        description: "Border and outline colors",
        tokens: [
          { name: "--color-border-primary", label: "Primary" },
          { name: "--color-border-secondary", label: "Secondary" },
          { name: "--color-border-focus", label: "Focus" },
        ],
      },
      {
        category: "Interactive",
        description: "Colors for interactive elements and actions",
        tokens: [
          { name: "--color-interactive-primary", label: "Primary" },
          { name: "--color-accent-hover", label: "Accent Hover" },
        ],
      },
      {
        category: "Status",
        description: "Semantic colors for feedback states",
        tokens: [
          { name: "--color-status-success", label: "Success" },
          { name: "--color-status-warning", label: "Warning" },
          { name: "--color-status-danger", label: "Danger" },
          { name: "--color-status-info", label: "Info" },
        ],
      },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Color Token Map
          </h2>
          <p className="text-sm text-(--color-text-secondary)">
            All semantic{" "}
            <code className="font-mono text-xs bg-(--color-background-secondary) px-1 py-0.5 rounded">
              --color-*
            </code>{" "}
            tokens, organized by category. These tokens adapt automatically to
            the active theme.
          </p>
        </div>

        {tokenGroups.map((group) => (
          <div key={group.category} className="space-y-3">
            <div>
              <h3 className="font-semibold">{group.category}</h3>
              <p className="text-sm text-(--color-text-secondary)">
                {group.description}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {group.tokens.map((token) => (
                <div
                  key={token.name}
                  className="rounded-lg border border-(--color-border-secondary) overflow-hidden"
                >
                  <div
                    className="h-16 w-full"
                    style={{ backgroundColor: `var(${token.name})` }}
                  />
                  <div className="p-2 bg-(--color-background-primary)">
                    <p className="text-xs font-medium text-(--color-text-primary)">
                      {token.label}
                    </p>
                    <code className="text-xs font-mono text-(--color-text-tertiary) break-all">
                      {token.name}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
