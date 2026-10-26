import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { Button } from "@wyliedog/ui/button";
import contrastConfig from "../../../../../scripts/contrast-pairs.json";
import { PageIntro, Section, TokenTable } from "./foundations-ui";
import { darkTokenValue, tokensByPrefix } from "./token-data";

const meta: Meta = {
  title: "Foundations/Focus",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The keyboard focus indicator: a two-tone outline with a halo, expressed as five tokens. Shown on a real Button, with the contrast pairs the project checks.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const colorTokens = tokensByPrefix("--color-focus-");
const sizeTokens = tokensByPrefix("--space-focus-");

interface ContrastPair {
  foreground: string;
  backgrounds: string[];
  kind: "text" | "non-text";
  note?: string;
}

const focusPairs = (contrastConfig.pairs as ContrastPair[]).filter((pair) =>
  pair.foreground.startsWith("color.focus.")
);
const thresholds = contrastConfig.thresholds as Record<string, number>;

/** `color.focus.ring` or `menubar.item-highlighted` as its CSS variable. */
function pairVariable(name: string): string {
  const path = name.replaceAll(".", "-");
  return name.startsWith("color.") ? `--${path}` : `--color-${path}`;
}

/** sRGB channels of any CSS colour, via a canvas pixel. */
function toRgb(color: string): [number, number, number] {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return [0, 0, 0];
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue];
}

function luminance([red, green, blue]: [number, number, number]): number {
  const channel = (value: number) => {
    const scaled = value / 255;
    return scaled <= 0.04045
      ? scaled / 12.92
      : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
  );
}

function contrastRatio(first: string, second: string): number {
  const a = luminance(toRgb(first));
  const b = luminance(toRgb(second));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

interface MeasuredRow {
  foreground: string;
  background: string;
  kind: string;
  required: number;
  ratio: number | null;
  note?: string;
}

/** Measures every focus pair with the colours the page currently shows. */
function useMeasuredRows(): MeasuredRow[] {
  const [rows, setRows] = useState<MeasuredRow[]>([]);
  useEffect(() => {
    const root = document.documentElement;
    const measure = () => {
      const styles = getComputedStyle(root);
      const read = (name: string) =>
        styles.getPropertyValue(pairVariable(name)).trim();
      setRows(
        focusPairs.flatMap((pair) =>
          pair.backgrounds.map((background) => {
            const fore = read(pair.foreground);
            const back = read(background);
            return {
              foreground: pair.foreground,
              background,
              kind: pair.kind,
              required: thresholds[pair.kind],
              ratio: fore && back ? contrastRatio(fore, back) : null,
              note: pair.note,
            };
          })
        )
      );
    };
    measure();
    const observer = new MutationObserver(measure);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return rows;
}

function Anatomy() {
  return (
    <div className="flex items-center justify-center rounded-md border border-(--color-border-default) bg-(--color-background-default) p-12">
      <div
        aria-hidden="true"
        className="flex h-12 w-48 items-center justify-center rounded-md bg-(--color-background-primary) text-sm font-medium text-(--color-foreground-primary)"
        style={{
          outline: "solid var(--space-focus-width) var(--color-focus-ring)",
          outlineOffset: "var(--space-focus-offset)",
          boxShadow:
            "0 0 0 calc(var(--space-focus-offset) + var(--space-focus-width) + var(--space-focus-halo-width)) var(--color-focus-halo)",
        }}
      >
        Control
      </div>
    </div>
  );
}

function FocusedButton() {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-md border border-(--color-border-default) bg-(--color-background-default) p-8">
      <Button ref={ref} type="button">
        Focused button
      </Button>
      <Button type="button" variant="outline">
        Press Tab to move here
      </Button>
      <Button type="button" variant="destructive">
        Then here
      </Button>
    </div>
  );
}

function ContrastTable() {
  const rows = useMeasuredRows();
  return (
    <div className="overflow-x-auto rounded-md border border-(--color-border-default)">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          Measured contrast of the focus indicator pairs in the current theme
        </caption>
        <thead className="bg-(--color-background-muted) text-(--color-foreground-default)">
          <tr>
            <th scope="col" className="px-4 py-2 font-semibold">
              Indicator
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              On
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              Required
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              Measured
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              Result
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.foreground}-${row.background}`}
              className="border-t border-(--color-border-default) align-top"
            >
              <td className="px-4 py-3 font-mono text-(--color-foreground-default)">
                {row.foreground}
              </td>
              <td className="px-4 py-3 font-mono text-(--color-foreground-default)">
                {row.background}
              </td>
              <td className="px-4 py-3 font-mono text-(--color-foreground-default)">
                {row.required}:1
              </td>
              <td className="px-4 py-3 font-mono text-(--color-foreground-default)">
                {row.ratio === null ? "n/a" : `${row.ratio.toFixed(2)}:1`}
              </td>
              <td className="px-4 py-3 text-(--color-foreground-default)">
                {row.ratio === null
                  ? "Not measured"
                  : row.ratio >= row.required
                    ? "Pass"
                    : "Fail"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const Indicator: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The anatomy drawn from the focus tokens, then real Buttons. The first Button is focused on load; press Tab to move the indicator.",
      },
    },
  },
  render: () => (
    <div>
      <PageIntro title="Focus">
        <p>
          Keyboard focus is a two-tone outline: the ring colour sits the focus
          offset away from the control, and a halo in the page tone fills the
          gap and extends past the outline so the ring separates from any
          surface behind it.
        </p>
      </PageIntro>
      <Section
        title="Anatomy"
        description="Drawn with the focus tokens: ring, offset, width and halo width."
      >
        <Anatomy />
      </Section>
      <Section
        title="On a real Button"
        description="The Button uses the package focus classes. It shows for keyboard focus only."
      >
        <FocusedButton />
      </Section>
    </div>
  ),
};

export const Tokens: Story = {
  parameters: {
    docs: {
      description: {
        story: "The five focus tokens, with Light and Dark values for colours.",
      },
    },
  },
  render: () => (
    <div className="space-y-10">
      <Section title="Colours">
        <TokenTable
          caption="Focus colour tokens"
          rows={colorTokens}
          specimenLabel="Swatch"
          specimen={(row) => (
            <div
              className="size-10 rounded-md border border-(--color-border-default)"
              style={{ background: `var(${row.variable})` }}
            />
          )}
          renderValue={(row) => (
            <dl className="space-y-1 text-xs">
              <div>
                <dt className="inline text-(--color-foreground-muted)">
                  Light:{" "}
                </dt>
                <dd className="inline">{row.value}</dd>
              </div>
              <div>
                <dt className="inline text-(--color-foreground-muted)">
                  Dark:{" "}
                </dt>
                <dd className="inline">
                  {darkTokenValue(row.variable) ?? "same as Light"}
                </dd>
              </div>
            </dl>
          )}
        />
      </Section>
      <Section title="Sizes">
        <TokenTable
          caption="Focus size tokens"
          rows={sizeTokens}
          specimenLabel="Thickness"
          specimen={(row) => (
            <div
              aria-hidden="true"
              className="w-24 border-solid border-(--color-foreground-default)"
              style={{ borderTopWidth: row.value }}
            />
          )}
        />
      </Section>
    </div>
  ),
};

export const Contrast: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every focus pair declared in scripts/contrast-pairs.json, measured live with the colours of the current theme. The project check runs the same pairs in Light and Dark.",
      },
    },
  },
  render: () => (
    <Section
      title="Measured contrast"
      description="The indicator is non-text UI, so it needs 3:1 against whatever sits next to it. Toggle the theme to measure the other mode. In forced-colors mode the outline is drawn natively and the halo is dropped."
    >
      <ContrastTable />
    </Section>
  ),
};
