import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { Button } from "@wyliedog/ui/button";
import { Label } from "@wyliedog/ui/label";
import { Switch } from "@wyliedog/ui/switch";
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

/** Playback speeds. The token values shown never change; only the demo slows. */
const SPEEDS = [1, 0.5, 0.25] as const;
type Speed = (typeof SPEEDS)[number];

/** Real-time pause at each end of the track, so the end state is readable. */
const HOLD_MS = 600;

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

/**
 * Runs the demo dots forward, holds, runs them back, holds, and repeats while
 * Loop is on. A leg lasts as long as the slowest dot at the chosen speed, so
 * every dot has arrived before the next leg starts.
 */
function usePlayback(longestMs: number) {
  const [speed, setSpeed] = useState<Speed>(1);
  const [loop, setLoop] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [moved, setMoved] = useState(false);
  const loopRef = useRef(loop);
  loopRef.current = loop;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(
      () => {
        if (moved) {
          setMoved(false); // forward leg done: run back
        } else if (loopRef.current) {
          setMoved(true); // back leg done: go again
        } else {
          setPlaying(false); // back leg done: finished
        }
      },
      longestMs / speed + HOLD_MS
    );
    return () => window.clearTimeout(timer);
  }, [playing, moved, speed, longestMs]);

  return {
    speed,
    setSpeed,
    loop,
    setLoop,
    playing,
    moved,
    play: () => {
      setPlaying(true);
      setMoved(true);
    },
    stop: () => {
      setPlaying(false);
      setMoved(false);
    },
  };
}
type Playback = ReturnType<typeof usePlayback>;

/** The duration a demo really runs for: the token value at the chosen speed. */
function scaled(value: string, speed: Speed): string {
  return `${durationMs(value) / speed}ms`;
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

/** Draws a cubic-bezier curve against the straight (linear) diagonal. */
function CurvePlot({ easing }: { easing: string }) {
  const match =
    /cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/.exec(
      easing
    );
  if (!match) return null;
  const [x1, y1, x2, y2] = match.slice(1).map(Number);
  const size = 64;
  const pad = 6;
  const span = size - pad * 2;
  const x = (value: number) => pad + value * span;
  const y = (value: number) => pad + (1 - value) * span;
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 overflow-visible"
    >
      <rect
        x={x(0)}
        y={y(1)}
        width={span}
        height={span}
        className="fill-none stroke-(--color-border-default)"
      />
      <line
        x1={x(0)}
        y1={y(0)}
        x2={x(1)}
        y2={y(1)}
        strokeDasharray="3 3"
        className="stroke-(--color-border-default)"
      />
      <path
        d={`M${x(0)},${y(0)} C${x(x1)},${y(y1)} ${x(x2)},${y(y2)} ${x(1)},${y(1)}`}
        strokeWidth={2}
        strokeLinecap="round"
        className="fill-none stroke-(--color-background-primary)"
      />
    </svg>
  );
}

/**
 * Controls that stay in view while the page scrolls, so the demos can be
 * started, slowed and looped from wherever the tracks are on screen.
 */
function PlaybackBar({
  playback,
  reduced,
}: {
  playback: Playback;
  reduced: boolean;
}) {
  const { speed, setSpeed, loop, setLoop, playing, play, stop } = playback;
  return (
    <div className="sticky top-0 z-10 -mx-2 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-(--color-border-default) bg-(--color-background-default) px-2 py-3">
      <Button
        type="button"
        variant={playing ? "outline" : "default"}
        onClick={playing ? stop : play}
      >
        {playing ? "Stop" : "Play"}
      </Button>
      <div
        role="group"
        aria-label="Playback speed"
        className="flex items-center gap-2"
      >
        {SPEEDS.map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={speed === option ? "default" : "outline"}
            aria-pressed={speed === option}
            onClick={() => setSpeed(option)}
          >
            {option}×
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Switch id="motion-loop" checked={loop} onCheckedChange={setLoop} />
        <Label htmlFor="motion-loop">Loop</Label>
      </div>
      <p role="status" className="text-sm text-(--color-foreground-muted)">
        {reduced
          ? "Reduced motion is on: the dots jump to the end without animating."
          : playing
            ? `Playing at ${speed}× speed`
            : "Press Play. Each dot runs forward and back; the token values below are the real ones."}
      </p>
    </div>
  );
}

function DurationsPage() {
  const reduced = useReducedMotion();
  const playback = usePlayback(longestScaleMs);
  const { speed, moved } = playback;
  const caption = (value: string) => (
    <span className="text-xs text-(--color-foreground-muted)">
      {speed === 1
        ? value
        : `${value}, played at ${scaled(value, speed)} (${speed}×)`}
    </span>
  );
  return (
    <div className="space-y-8">
      <PageIntro title="Motion">
        <p>
          {durationScale.length} duration steps, {durationRoles.length} named
          roles and {easings.length} easing curves. Timing is the token value,
          never typed into the demo.
        </p>
      </PageIntro>
      <PlaybackBar playback={playback} reduced={reduced} />
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
                duration={scaled(row.value, speed)}
                easing={defaultEasing}
              />
              {caption(row.value)}
            </div>
          )}
        />
      </Section>
      <Section
        title="Duration roles"
        description="Components use the named roles, which alias the scale."
      >
        <TokenTable
          caption="Duration role tokens"
          rows={durationRoles}
          specimenLabel="Demo"
          specimen={(row) => (
            <div className="space-y-2">
              <MotionTrack
                moved={moved}
                reduced={reduced}
                duration={scaled(row.value, speed)}
                easing={defaultEasing}
              />
              {caption(row.value)}
            </div>
          )}
        />
      </Section>
    </div>
  );
}

function EasingsPage() {
  const reduced = useReducedMotion();
  const playback = usePlayback(durationMs(demoDuration));
  const { speed, moved } = playback;
  return (
    <div className="space-y-8">
      <PlaybackBar playback={playback} reduced={reduced} />
      <Section
        title="Easing curves"
        description="Each curve is drawn against the straight diagonal (linear). Every demo uses the slow duration so the shape is visible."
      >
        <TokenTable
          caption="Easing tokens"
          rows={easings}
          specimenLabel="Demo"
          specimen={(row) => (
            <div className="flex items-center gap-4">
              <CurvePlot easing={row.value} />
              <MotionTrack
                moved={moved}
                reduced={reduced}
                duration={scaled(demoDuration, speed)}
                easing={row.value}
              />
            </div>
          )}
          renderValue={(row) => <span className="text-xs">{row.value}</span>}
        />
      </Section>
    </div>
  );
}

export const Durations: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The duration scale and the named roles that alias it. Bars are proportional to the longest step. Play runs every dot forward and back with the default easing; Speed slows the demo (the values shown stay the real ones) and Loop repeats it.",
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
          "Easing curves, each drawn as a graph against the linear diagonal. Every demo uses the slow duration so the shape is visible; Play runs all of them together, forward and back, and Speed and Loop work as on the Durations page.",
      },
    },
  },
  render: () => <EasingsPage />,
};
