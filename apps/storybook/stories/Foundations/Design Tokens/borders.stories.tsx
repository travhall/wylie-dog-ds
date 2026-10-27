import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageIntro, Section, TokenTable } from "./foundations-ui";
import { tokensByPrefix } from "./token-data";

const meta: Meta = {
  title: "Foundations/Borders",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Corner radius and border width scales, read from the built tokens. Radius and width are separate scales: a component picks one of each.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const radii = tokensByPrefix("--border-radius-");
const widths = tokensByPrefix("--border-width-");

export const Radius: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The corner radius scale. Each specimen is drawn with the token value itself.",
      },
    },
  },
  render: () => (
    <div>
      <PageIntro title="Borders">
        <p>
          {radii.length} radius steps and {widths.length} border widths. Values
          are rem with the px figure Figma shows beside it.
        </p>
      </PageIntro>
      <Section title="Radius">
        <TokenTable
          caption="Border radius tokens"
          rows={radii}
          specimenLabel="Corner"
          specimen={(row) => (
            <div
              className="size-12 border-2 border-(--color-border-emphasis) bg-(--color-background-muted)"
              style={{ borderRadius: row.value }}
            />
          )}
        />
      </Section>
    </div>
  ),
};

export const Width: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The border width scale. Each specimen is a rule drawn with the token value as its thickness.",
      },
    },
  },
  render: () => (
    <Section title="Width">
      <TokenTable
        caption="Border width tokens"
        rows={widths}
        specimenLabel="Rule"
        specimen={(row) => (
          <div
            className="w-24 border-solid border-(--color-border-emphasis)"
            style={{ borderTopWidth: row.value }}
          />
        )}
      />
    </Section>
  ),
};
