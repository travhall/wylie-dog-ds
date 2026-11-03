import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { contrastRatio } from "@wyliedog/tokens/color";
import { Badge } from "@wyliedog/ui/badge";

const meta: Meta = {
  title: "Foundations/Color Contrast",
  parameters: {
    docs: {
      description: {
        component:
          "Semantic color pairs rendered from their live CSS variables, with the WCAG 2.2 AA contrast ratio measured from the colors on screen in the active theme.",
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
  /** Caption text token — defaults to --color-foreground-faint. Override when
   * bgToken doesn't share the page's light/dark polarity (e.g. the inverse
   * background), since --color-foreground-faint assumes a page-background context. */
  captionToken?: string;
}

const contrastSamples: ContrastSample[] = [
  {
    label: "Default text on the page",
    textToken: "--color-foreground-default",
    bgToken: "--color-background-default",
    sampleText: "The quick brown fox jumps over the lazy dog",
    usage: "Body copy, headings",
  },
  {
    label: "Muted text on the page",
    textToken: "--color-foreground-muted",
    bgToken: "--color-background-default",
    sampleText: "Supporting description and metadata",
    usage: "Captions, helper text, placeholders",
  },
  {
    label: "Default text on a muted surface",
    textToken: "--color-foreground-default",
    bgToken: "--color-background-muted",
    sampleText: "Content on card or panel surface",
    usage: "Cards, sidebars, secondary surfaces",
  },
  {
    label: "Inverse text on inverse background",
    textToken: "--color-foreground-inverse",
    bgToken: "--color-background-inverse",
    sampleText: "Inverted surface text",
    usage: "Tooltips, dark banners",
    captionToken: "--color-foreground-inverse",
  },
  {
    label: "Danger text on the page",
    textToken: "--color-foreground-danger-muted",
    bgToken: "--color-background-default",
    sampleText: "Error message text",
    usage: "Validation errors, destructive alert text",
  },
  {
    label: "Link text on the page",
    textToken: "--color-foreground-link",
    bgToken: "--color-background-default",
    sampleText: "Link and action text",
    usage: "Links, focus labels, interactive affordances",
  },
];

/** Rendered colors can arrive as `oklch(...)` or, in some engines, `rgb(...)`. */
function toCssColor(value: string): string | null {
  if (value.startsWith("oklch(")) return value;
  const rgb = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(value);
  if (!rgb || (rgb[4] !== undefined && Number(rgb[4]) === 0)) return null;
  return `#${[rgb[1], rgb[2], rgb[3]]
    .map((c) => Number(c).toString(16).padStart(2, "0"))
    .join("")}`;
}

function useMeasuredRatio(
  textRef: React.RefObject<HTMLElement | null>,
  backgroundRef: React.RefObject<HTMLElement | null>
) {
  const [ratio, setRatio] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const measure = () => {
      if (!textRef.current || !backgroundRef.current) return;
      const fg = toCssColor(getComputedStyle(textRef.current).color);
      const bg = toCssColor(
        getComputedStyle(backgroundRef.current).backgroundColor
      );
      setRatio(fg && bg ? contrastRatio(fg, bg) : null);
    };
    measure();
    // The theme is a class on <html>; measure again when the toolbar changes it.
    const observer = new MutationObserver(measure);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [textRef, backgroundRef]);

  return ratio;
}

function ContrastSampleCard({ sample }: { sample: ContrastSample }) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const sampleRef = React.useRef<HTMLParagraphElement>(null);
  const ratio = useMeasuredRatio(sampleRef, cardRef);
  const required = sample.isLargeText ? 3 : 4.5;
  const passes = ratio !== null && ratio >= required;

  return (
    <div
      ref={cardRef}
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
          ref={sampleRef}
          className={sample.isLargeText ? "text-lg font-semibold" : "text-sm"}
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
      {ratio === null ? (
        <Badge variant="outline" className="shrink-0">
          …
        </Badge>
      ) : (
        <Badge
          variant={passes ? "success" : "destructive"}
          className="shrink-0"
          data-ratio={ratio.toFixed(2)}
        >
          {passes ? "AA" : "FAIL"} · {ratio.toFixed(2)}:1
        </Badge>
      )}
    </div>
  );
}

export const ColorContrastCheck: Story = {
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Semantic token pairs rendered using their actual CSS variable values — swatches use `style={{ color: 'var(--token)' }}` so the colors shown are exactly what the tokens resolve to in the active theme. Each badge is measured from the rendered colors, not declared: WCAG 2.2 AA requires 4.5:1 for normal text and 3:1 for large text (18px+ or 14px+ bold). Switch the Theme toolbar to measure the pairs in dark mode too.",
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
          14px+ bold). Each ratio is measured from the colors rendered below in
          the active theme — toggle the Theme toolbar to measure dark mode too.
        </p>
      </div>

      <div className="grid gap-3">
        {contrastSamples.map((sample) => (
          <ContrastSampleCard key={sample.label} sample={sample} />
        ))}
      </div>

      <p className="text-xs text-(--color-foreground-faint)">
        The ratios are computed in the browser from the colors on screen, so a
        token change that breaks a pair turns its badge red. The full list of
        declared pairs, checked in both modes, is in{" "}
        <code>scripts/contrast-pairs.json</code>.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const badges = canvas.getAllByText(/^(AA|FAIL) · /);
      expect(badges).toHaveLength(contrastSamples.length);
      for (const badge of badges) expect(badge).toHaveTextContent(/^AA · /);
    });
  },
};
