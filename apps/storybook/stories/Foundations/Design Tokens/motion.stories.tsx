import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Button } from "@wyliedog/ui/button";
import { PageIntro, Section, TokenTable } from "./foundations-ui";
import { durationMs, tokensByPrefix, tokenValue } from "./token-data";

const meta: Meta = {
  title: "Foundations/Motion",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Durations and easing curves, read from the built tokens. The demos run real CSS transitions driven by the token values and stop animating when the system asks for reduced motion.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const durationScale = tokensByPrefix("--duration-").filter((row) =>
  /^\d+$/.test(row.key)
);
const durationRoles = tokensByPrefix("--duration-").filter((row) =>
  /^(instant|fast|normal|slow)$/.test(row.key)
);
const easings = tokensByPrefix("--transition-easing-");

const longestScaleMs = Math.max(
  ...durationScale.map((row) => durationMs(row.value))
);
const defaultEasing = tokenValue("--transition-easing-default") ?? "ease";
const demoDuration = tokenValue("--duration-slow") ?? "0s";

/** True when the user asks the system for reduced motion. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** A dot that travels the length of a track using the given transition. */
function MotionTrack({
  moved,
  reduced,
  duration,
  easing,
}: {
  moved: boolean;
  reduced: boolean;
  duration: string;
  easing: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="relative h-4 w-48 rounded-full bg-(--color-background-muted)"
    >
      <div
        className="absolute top-0 size-4 rounded-full bg-(--color-background-primary)"
        style={{
          left: moved ? "calc(100% - 1rem)" : "0",
          transition: reduced ? "none" : `left ${duration} ${easing}`,
        }}
      />
    </div>
  );
}

function PlayControl({
  moved,
  onToggle,
  reduced,
}: {
  moved: boolean;
  onToggle: () => void;
  reduced: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button type="button" variant="outline" onClick={onToggle}>
        {moved ? "Reset" : "Play"}
      </Button>
      {reduced ? (
        <p className="text-sm text-(--color-foreground-muted)">
          Reduced motion is on: the dots jump to the end without animating.
        </p>
      ) : null}
    </div>
  );
}

function DurationsPage() {
  const [moved, setMoved] = useState(false);
  const reduced = useReducedMotion();
  return (
    <div className="space-y-8">
      <PageIntro title="Motion">
        <p>
          {durationScale.length} duration steps, {durationRoles.length} named
          roles and {easings.length} easing curves. Timing is the token value,
          never typed into the demo.
        </p>
      </PageIntro>
      <PlayControl
        moved={moved}
        onToggle={() => setMoved((value) => !value)}
        reduced={reduced}
      />
      <Section title="Duration scale">
        <TokenTable
          caption="Duration scale tokens"
          rows={durationScale}
          specimenLabel="Timeline"
          specimen={(row) => (
            <div className="space-y-2">
              <div
                aria-hidden="true"
                className="h-2 rounded-full bg-(--color-background-primary)"
                style={{
                  width: `${(durationMs(row.value) / longestScaleMs) * 100}%`,
                }}
              />
              <MotionTrack
                moved={moved}
                reduced={reduced}
                duration={row.value}
                easing={defaultEasing}
              />
            </div>
          )}
        />
      </Section>
      <Section
        title="Duration roles"
        description="Components use the named roles, which alias the scale or set their own value."
      >
        <TokenTable
          caption="Duration role tokens"
          rows={durationRoles}
          specimenLabel="Demo"
          specimen={(row) => (
            <MotionTrack
              moved={moved}
              reduced={reduced}
              duration={row.value}
              easing={defaultEasing}
            />
          )}
        />
      </Section>
    </div>
  );
}

function EasingsPage() {
  const [moved, setMoved] = useState(false);
  const reduced = useReducedMotion();
  return (
    <Section title="Easing curves">
      <PlayControl
        moved={moved}
        onToggle={() => setMoved((value) => !value)}
        reduced={reduced}
      />
      <TokenTable
        caption="Easing tokens"
        rows={easings}
        specimenLabel="Demo"
        specimen={(row) => (
          <MotionTrack
            moved={moved}
            reduced={reduced}
            duration={demoDuration}
            easing={row.value}
          />
        )}
        renderValue={(row) => <span className="text-xs">{row.value}</span>}
      />
    </Section>
  );
}

export const Durations: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The duration scale and the named roles that alias it. Bars are proportional to the longest step; Play runs each duration with the default easing.",
      },
    },
  },
  render: () => <DurationsPage />,
};

export const Easings: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Easing curves. Each demo uses the slow duration so the shape is visible; Play runs all four together.",
      },
    },
  },
  render: () => <EasingsPage />,
};
