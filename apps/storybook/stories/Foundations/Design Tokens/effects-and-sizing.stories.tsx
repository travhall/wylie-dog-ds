import type { Meta, StoryObj } from "@storybook/react-vite";
import { Star } from "lucide-react";
import { PageIntro, Section, TokenTable } from "./foundations-ui";
import { tokensByPrefix } from "./token-data";

const meta: Meta = {
  title: "Foundations/Effects & Sizing",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Opacity, stacking order and icon sizes, read from the built tokens. Each family has a shared scale and, where it applies, named roles that alias it.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const isStep = (row: { key: string }) => /^\d+$/.test(row.key);

const opacityScale = tokensByPrefix("--opacity-").filter(isStep);
const opacityRoles = [
  ...tokensByPrefix("--opacity-").filter((row) => !isStep(row)),
  ...tokensByPrefix("--state-opacity-"),
];

const zScale = tokensByPrefix("--z-index-").filter(isStep);
const zLayers = tokensByPrefix("--z-index-")
  .filter((row) => !isStep(row))
  .sort((a, b) => parseFloat(a.value) - parseFloat(b.value));

const iconSizes = tokensByPrefix("--space-icon-size-");

function opacityPercent(value: string): string {
  return `${Math.round(parseFloat(value) * 100)}%`;
}

function OpacitySwatch({ value }: { value: string }) {
  return (
    <div className="size-12 rounded-md border border-(--color-border-muted) bg-(--color-background-default)">
      <div
        className="size-full rounded-md bg-(--color-background-primary)"
        style={{ opacity: value }}
      />
    </div>
  );
}

const opacityValue = (row: { value: string }) => (
  <span>
    {row.value}{" "}
    <span className="text-(--color-foreground-muted)">
      ({opacityPercent(row.value)})
    </span>
  </span>
);

export const Opacity: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The opacity scale and the roles that alias it. Each swatch is the primary background drawn at the token opacity over the page background.",
      },
    },
  },
  render: () => (
    <div>
      <PageIntro title="Effects & Sizing">
        <p>
          {opacityScale.length} opacity steps, {zScale.length} stacking steps
          with {zLayers.length} named layers, and {iconSizes.length} icon sizes.
        </p>
      </PageIntro>
      <Section title="Opacity scale">
        <TokenTable
          caption="Opacity scale tokens"
          rows={opacityScale}
          specimen={(row) => <OpacitySwatch value={row.value} />}
          renderValue={opacityValue}
        />
      </Section>
      <Section
        title="Opacity roles"
        description="Named for what they express: interactive states, muted and subtle content, overlays and scrims."
      >
        <TokenTable
          caption="Opacity role tokens"
          rows={opacityRoles}
          specimen={(row) => <OpacitySwatch value={row.value} />}
          renderValue={opacityValue}
        />
      </Section>
    </div>
  ),
};

export const ZIndex: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The stacking order. The diagram draws each named layer at its real z-index, so higher layers sit on top of lower ones.",
      },
    },
  },
  render: () => (
    <div>
      <Section
        title="Stacking order"
        description="Named layers from lowest to highest. Each card is drawn with the token z-index."
      >
        <div
          aria-hidden="true"
          className="relative mb-4 h-96 max-w-3xl overflow-hidden rounded-md border border-(--color-border-default) bg-(--color-background-muted)"
        >
          {zLayers.map((layer, index) => (
            <div
              key={layer.variable}
              className="absolute w-56 rounded-md border border-(--color-border-emphasis) bg-(--color-background-raised) px-3 py-2 font-mono text-xs text-(--color-foreground-default) shadow-(--shadow-md)"
              style={{
                zIndex: layer.value,
                left: `${index * 6}%`,
                top: `${index * 8}%`,
              }}
            >
              {layer.key} · {layer.value}
            </div>
          ))}
        </div>
        <TokenTable
          caption="Named z-index layers"
          rows={zLayers}
          specimenLabel="Layer"
          specimen={(row) => (
            <span className="font-mono text-(--color-foreground-default)">
              {row.value}
            </span>
          )}
        />
      </Section>
      <Section title="Stacking scale">
        <TokenTable
          caption="Z-index scale tokens"
          rows={zScale}
          specimenLabel="Level"
          specimen={(row) => (
            <span className="font-mono text-(--color-foreground-default)">
              {row.value}
            </span>
          )}
        />
      </Section>
    </div>
  ),
};

export const IconSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The shared icon size scale. Each icon is drawn at the token size.",
      },
    },
  },
  render: () => (
    <Section title="Icon sizes">
      <TokenTable
        caption="Icon size tokens"
        rows={iconSizes}
        specimenLabel="Icon"
        specimen={(row) => (
          <Star
            aria-hidden="true"
            className="text-(--color-foreground-default)"
            style={{ width: row.value, height: row.value }}
          />
        )}
      />
    </Section>
  ),
};
