import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@wyliedog/ui/badge";

const meta: Meta = {
  title: "Foundations/Color Contrast",
  parameters: {
    docs: {
      description: {
        component:
          "Semantic colour pairs rendered from their live CSS variables, with the WCAG 2.2 AA contrast targets they are designed for.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

interface ContrastSample {
  label: string;
  textToken: string;
  bgToken: string;
  sampleText: string;
  usage: string;
  isLargeText?: boolean;
  compliant: boolean;
  /** Caption text token — defaults to --color-foreground-faint. Override when
   * bgToken doesn't share the page's light/dark polarity (e.g. the inverse
   * background), since --color-foreground-faint assumes a page-background context. */
  captionToken?: string;
}

const contrastSamples: ContrastSample[] = [
  {
    label: "Primary text on primary background",
    textToken: "--color-foreground-default",
    bgToken: "--color-background-default",
    sampleText: "The quick brown fox jumps over the lazy dog",
    usage: "Body copy, headings",
    compliant: true,
  },
  {
    label: "Secondary text on primary background",
    textToken: "--color-foreground-muted",
    bgToken: "--color-background-default",
    sampleText: "Supporting description and metadata",
    usage: "Captions, helper text, placeholders",
    compliant: true,
  },
  {
    label: "Primary text on secondary background",
    textToken: "--color-foreground-default",
    bgToken: "--color-background-muted",
    sampleText: "Content on card or panel surface",
    usage: "Cards, sidebars, secondary surfaces",
    compliant: true,
  },
  {
    label: "Inverse text on inverse background",
    textToken: "--color-foreground-inverse",
    bgToken: "--color-background-inverse",
    sampleText: "Inverted surface text",
    usage: "Tooltips, dark banners",
    compliant: true,
    captionToken: "--color-foreground-inverse",
  },
  {
    label: "Danger status on primary background",
    textToken: "--color-foreground-danger-muted",
    bgToken: "--color-background-default",
    sampleText: "Error message text",
    usage: "Validation errors, destructive alert text",
    compliant: true,
  },
  {
    label: "Info/link text on primary background",
    textToken: "--color-foreground-info-muted",
    bgToken: "--color-background-default",
    sampleText: "Link and action text",
    usage: "Links, focus labels, interactive affordances",
    compliant: true,
  },
];

export const ColorContrastCheck: Story = {
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Semantic token pairs rendered using their actual CSS variable values — swatches use `style={{ color: 'var(--token)' }}` so the colors shown are exactly what the tokens resolve to in the active theme. WCAG 2.2 AA requires 4.5:1 for normal text and 3:1 for large text (18px+ or 14px+ bold). Run the Accessibility panel to verify computed ratios.",
      },
    },
  },
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-(--color-foreground-default)">
          Color contrast — semantic token pairs
        </h2>
        <p className="text-sm text-(--color-foreground-muted)">
          WCAG 2.2 AA: 4.5:1 for normal text · 3:1 for large text (18px+ or
          14px+ bold). Each swatch renders using the actual CSS variable —
          toggle the Theme toolbar to verify dark-mode contrast too.
        </p>
      </div>

      <div className="grid gap-3">
        {contrastSamples.map((sample) => (
          <div
            key={sample.label}
            className="flex items-center justify-between gap-4 rounded-lg border border-(--color-border-default) p-4"
            style={{ backgroundColor: `var(${sample.bgToken})` }}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p
                className="font-mono text-xs truncate"
                style={{
                  color: `var(${sample.captionToken ?? "--color-foreground-muted"})`,
                  opacity: sample.captionToken ? 0.7 : 1,
                }}
              >
                {sample.textToken}
                <span className="mx-1">on</span>
                {sample.bgToken}
              </p>
              <p
                className={
                  sample.isLargeText ? "text-lg font-semibold" : "text-sm"
                }
                style={{ color: `var(${sample.textToken})` }}
              >
                {sample.sampleText}
                {sample.isLargeText && (
                  <span className="ml-2 text-xs font-normal opacity-70">
                    (large text)
                  </span>
                )}
              </p>
              <p
                className="text-xs"
                style={{
                  color: `var(${sample.captionToken ?? "--color-foreground-faint"})`,
                  opacity: sample.captionToken ? 0.7 : 1,
                }}
              >
                {sample.usage}
              </p>
            </div>
            <Badge
              variant={sample.compliant ? "success" : "destructive"}
              className="shrink-0"
            >
              {sample.compliant ? "AA" : "FAIL"}
            </Badge>
          </div>
        ))}
      </div>

      <p className="text-xs text-(--color-foreground-faint)">
        Compliance labels reflect design intent. Open the Accessibility panel in
        Storybook to measure computed contrast ratios against live rendered
        colors.
      </p>
    </div>
  ),
};
