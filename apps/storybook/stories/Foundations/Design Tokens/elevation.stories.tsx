import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageIntro, Section, TokenTable } from "./foundations-ui";
import { darkTokenValue, tokensByPrefix } from "./token-data";

const meta: Meta = {
  title: "Foundations/Elevation",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The shadow scale and the component shadow tokens, read from the built tokens. Shadows are heavier in dark mode so they stay visible on dark surfaces.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const COMPONENT_SHADOW = /-shadow$/;

const scale = tokensByPrefix("--shadow-", { exclude: COMPONENT_SHADOW });
const componentShadows = tokensByPrefix("--shadow-").filter((row) =>
  COMPONENT_SHADOW.test(row.variable)
);

/** The scale step a component shadow resolves to, when its value matches one. */
function scaleStepFor(value: string): string | undefined {
  return scale.find((step) => step.value === value)?.key;
}

export const ShadowScale: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Each specimen sets box-shadow to the token itself, so it follows the active theme. The table lists the Light and Dark values.",
      },
    },
  },
  render: () => (
    <div>
      <PageIntro title="Elevation">
        <p>
          {scale.length} shadow steps and {componentShadows.length} component
          shadow tokens. Dark values use a higher opacity because a shadow on a
          dark surface needs more weight to read as depth.
        </p>
      </PageIntro>
      <Section title="Shadow scale">
        <TokenTable
          caption="Shadow scale tokens"
          rows={scale}
          specimenLabel="Elevation"
          specimen={(row) => (
            <div
              className="size-16 rounded-md border border-(--color-border-muted) bg-(--color-background-raised)"
              style={{ boxShadow: `var(${row.variable})` }}
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
    </div>
  ),
};

export const ComponentShadows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Component shadow tokens alias the shared scale. The Scale step column shows which step each one resolves to.",
      },
    },
  },
  render: () => (
    <Section
      title="Component shadows"
      description="Each component names its own shadow token so it can be tuned without touching the others."
    >
      <TokenTable
        caption="Component shadow tokens"
        rows={componentShadows}
        specimenLabel="Scale step"
        specimen={(row) => (
          <code className="font-mono text-(--color-foreground-default)">
            {scaleStepFor(row.value) ?? "custom"}
          </code>
        )}
        renderValue={(row) => <span className="text-xs">{row.value}</span>}
      />
    </Section>
  ),
};
