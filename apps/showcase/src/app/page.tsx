import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import { Progress } from "@wyliedog/ui/progress";
import { getShowcaseMeta } from "@/lib/showcase-metadata";

export default function ShowcasePage() {
  const meta = getShowcaseMeta();

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-(--color-border-primary)">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: messaging */}
            <div className="lg:col-span-7">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-(--color-border-primary) px-3 py-1"
                style={{
                  background:
                    "color-mix(in oklch, var(--color-background-primary) 60%, transparent)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: "var(--color-success, oklch(60% 0.14 155))",
                  }}
                />
                <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-secondary)">
                  v1.4.0 · stable
                </span>
                <span className="text-(--color-text-tertiary)">·</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                  react 19 · tailwind 4
                </span>
              </div>

              <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.98]">
                The design system{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  that closes the gap
                </span>{" "}
                between design and code.
              </h1>

              <p className="mt-6 max-w-xl text-lg sm:text-xl text-(--color-text-secondary)">
                A typed React component library, an OKLCH token system, and a
                pattern catalog — shared across every surface we ship.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/components">
                  <Button
                    size="lg"
                    className="h-11 rounded-md px-5 font-semibold gap-2"
                  >
                    Browse components
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Button>
                </Link>
                <Link href="/tokens">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 rounded-md px-5 font-semibold"
                  >
                    Explore tokens
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: live component cluster */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* floating tag */}
                <div className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                  </svg>
                  Live components
                </div>

                <div className="glass rounded-2xl p-5 sm:p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]">
                  {/* Project card */}
                  <div
                    className="rounded-lg border border-(--color-border-primary) p-5"
                    style={{ background: "var(--color-background-primary)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-(--color-text-tertiary)">
                          Project
                        </p>
                        <h3 className="mt-1 text-base font-semibold">
                          Migration to v1.4
                        </h3>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          background:
                            "color-mix(in oklch, oklch(60% 0.14 155) 18%, transparent)",
                          color: "oklch(60% 0.14 155)",
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: "oklch(60% 0.14 155)" }}
                        />
                        On track
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-(--color-text-secondary)">
                          68 of 100 components migrated
                        </span>
                        <span className="font-mono text-(--color-text-tertiary)">
                          68%
                        </span>
                      </div>
                      <Progress value={68} className="h-1.5" />
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[
                          {
                            initials: "EM",
                            bg: "oklch(78% 0.13 35)",
                            fg: "oklch(20% 0.05 35)",
                          },
                          {
                            initials: "JR",
                            bg: "oklch(78% 0.13 155)",
                            fg: "oklch(20% 0.05 155)",
                          },
                          {
                            initials: "AK",
                            bg: "oklch(78% 0.13 274)",
                            fg: "oklch(20% 0.05 274)",
                          },
                        ].map((a) => (
                          <span
                            key={a.initials}
                            className="grid h-7 w-7 place-items-center rounded-full border-2 text-[10px] font-semibold"
                            style={{
                              borderColor: "var(--color-background-primary)",
                              background: a.bg,
                              color: a.fg,
                            }}
                          >
                            {a.initials}
                          </span>
                        ))}
                        <span
                          className="grid h-7 w-7 place-items-center rounded-full border-2 text-[10px] font-semibold text-(--color-text-secondary)"
                          style={{
                            borderColor: "var(--color-background-primary)",
                            background: "var(--color-background-secondary)",
                          }}
                        >
                          +4
                        </span>
                      </div>
                      <button className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary) transition-colors">
                        View team
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Second row: Switch + Select */}
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div
                      className="rounded-lg border border-(--color-border-primary) p-3"
                      style={{ background: "var(--color-background-primary)" }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold">Auto-deploy</p>
                          <p className="text-[11px] text-(--color-text-tertiary)">
                            on merge to main
                          </p>
                        </div>
                        {/* Switch visual */}
                        <span
                          className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full"
                          style={{
                            background: "var(--color-interactive-primary)",
                          }}
                        >
                          <span
                            className="inline-block h-4 w-4 translate-x-4 rounded-full"
                            style={{
                              background: "var(--color-text-inverse, white)",
                            }}
                          />
                        </span>
                      </div>
                    </div>
                    <div
                      className="rounded-lg border border-(--color-border-primary) p-3"
                      style={{ background: "var(--color-background-primary)" }}
                    >
                      <p className="text-xs font-semibold">Theme</p>
                      <div className="mt-1.5 flex h-7 items-center justify-between rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) px-2 text-xs">
                        <span>System</span>
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3 text-(--color-text-tertiary)"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corner annotation */}
                <div className="absolute -bottom-3 right-6 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
                  5 components rendered
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-t border-(--color-border-primary)">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Components",
                  value: meta.components.count,
                  sub: `across ${meta.components.categories} categories`,
                },
                {
                  label: "Tokens",
                  value: meta.tokens.total.toLocaleString(),
                  sub: "primitive · semantic · component",
                },
                {
                  label: "Accessibility",
                  value: "WCAG 2.2",
                  sub: "AA verified",
                },
                {
                  label: "Patterns",
                  value: meta.patterns.count,
                  sub: "reference compositions",
                },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`px-2 py-6 lg:py-7 ${i < 3 ? "lg:border-r border-(--color-border-primary)" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""}`}
                >
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 flex items-baseline gap-2">
                    <span className="font-serif text-3xl sm:text-4xl font-semibold">
                      {stat.value}
                    </span>
                    <span className="text-xs text-(--color-text-tertiary)">
                      {stat.sub}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── 01 · TOKENS ───────────────────────────────────────────────────── */}
      <section className="border-b border-(--color-border-primary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Left */}
            <div className="lg:col-span-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                01 · Tokens
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
                An OKLCH-native token system.
              </h2>
              <p className="mt-4 text-(--color-text-secondary)">
                Three tiers — primitives, semantic, and component — so a single
                source of truth flows from{" "}
                <span className="font-mono text-xs">--color-blue-500</span> to{" "}
                <span className="font-mono text-xs">
                  --color-button-primary-background
                </span>
                . Light and dark are mirror twins of the same contract.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { label: "Colors", href: "/tokens/colors" },
                  { label: "Spacing", href: "/tokens/spacing" },
                  { label: "Typography", href: "/tokens/typography" },
                  { label: "Borders", href: "/tokens/borders" },
                ].map((l) => (
                  <Link key={l.href} href={l.href}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-md px-3 text-xs font-medium"
                    >
                      {l.label}
                    </Button>
                  </Link>
                ))}
              </div>
              <Link
                href="/tokens"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "var(--color-interactive-primary)" }}
              >
                Open the token explorer
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>

            {/* Right */}
            <div className="lg:col-span-8 space-y-3">
              {/* Color ramp */}
              <div
                className="rounded-lg border border-(--color-border-primary) p-5"
                style={{ background: "var(--color-background-primary)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                    interactive · primary
                  </p>
                  <p className="font-mono text-[11px] text-(--color-text-tertiary)">
                    oklch(L C 274)
                  </p>
                </div>
                <div className="grid grid-cols-11 gap-1">
                  {[
                    { stop: "50", l: "98%", c: "0.02" },
                    { stop: "100", l: "94%", c: "0.05" },
                    { stop: "200", l: "88%", c: "0.09" },
                    { stop: "300", l: "80%", c: "0.13" },
                    { stop: "400", l: "70%", c: "0.16" },
                    { stop: "500", l: "54%", c: "0.18", active: true },
                    { stop: "600", l: "46%", c: "0.18" },
                    { stop: "700", l: "38%", c: "0.16" },
                    { stop: "800", l: "30%", c: "0.13" },
                    { stop: "900", l: "22%", c: "0.09" },
                    { stop: "950", l: "15%", c: "0.05" },
                  ].map((s) => (
                    <div
                      key={s.stop}
                      className={`aspect-[3/4] rounded${s.active ? " ring-2 ring-offset-2" : ""}`}
                      style={{
                        background: `oklch(${s.l} ${s.c} 274)`,
                        ...(s.active
                          ? ({
                              "--tw-ring-color":
                                "var(--color-interactive-primary)",
                              "--tw-ring-offset-color":
                                "var(--color-background-primary)",
                            } as React.CSSProperties)
                          : {}),
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-11 gap-1 font-mono text-[9px] text-(--color-text-tertiary) text-center">
                  {[
                    "50",
                    "100",
                    "200",
                    "300",
                    "400",
                    "500",
                    "600",
                    "700",
                    "800",
                    "900",
                    "950",
                  ].map((s) => (
                    <span
                      key={s}
                      className={
                        s === "500" ? "text-(--color-text-primary)" : ""
                      }
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {/* Type scale */}
                <div
                  className="rounded-lg border border-(--color-border-primary) p-5"
                  style={{ background: "var(--color-background-primary)" }}
                >
                  <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                    type scale
                  </p>
                  <div className="mt-3 space-y-2">
                    {[
                      {
                        label: "Display",
                        tag: "--font-size-3xl · 30/36",
                        serif: true,
                        size: "text-3xl",
                      },
                      {
                        label: "Heading",
                        tag: "--font-size-xl · 20/28",
                        size: "text-xl font-semibold",
                      },
                      {
                        label: "Body",
                        tag: "--font-size-base · 16/24",
                        size: "text-base",
                      },
                      {
                        label: "code()",
                        tag: "--font-size-xs · mono",
                        mono: true,
                        size: "text-xs",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-baseline justify-between gap-3"
                      >
                        <span
                          className={`leading-none ${row.serif ? "font-serif text-3xl font-semibold" : row.mono ? "font-mono text-xs" : row.size}`}
                        >
                          {row.label}
                        </span>
                        <span className="font-mono text-[10px] text-(--color-text-tertiary) shrink-0">
                          {row.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spacing */}
                <div
                  className="rounded-lg border border-(--color-border-primary) p-5"
                  style={{ background: "var(--color-background-primary)" }}
                >
                  <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                    spacing
                  </p>
                  <div className="mt-3 space-y-2">
                    {[
                      { step: "0.5", px: "4px", w: 4 },
                      { step: "2", px: "16px", w: 16 },
                      { step: "4", px: "32px", w: 32 },
                      { step: "8", px: "64px", w: 64 },
                    ].map((row) => (
                      <div key={row.step} className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-(--color-text-tertiary) w-10">
                          {row.step}
                        </span>
                        <div
                          className="h-2 rounded-sm"
                          style={{
                            width: row.w,
                            background: "var(--color-interactive-primary)",
                          }}
                        />
                        <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                          {row.px}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 · COMPONENTS ───────────────────────────────────────────────── */}
      <section className="border-b border-(--color-border-primary) bg-(--color-background-secondary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                02 · Components
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
                {meta.components.count} typed React components.
              </h2>
              <p className="mt-3 text-(--color-text-secondary)">
                Headless primitives, fully composable, accessible by default.
                Every component ships with TypeScript types, Storybook stories,
                and a Figma counterpart.
              </p>
            </div>
            <Link href="/components">
              <Button
                variant="outline"
                className="h-9 rounded-md px-3.5 text-sm font-medium gap-1.5"
              >
                All components
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Foundations/Button */}
            <Link
              href="/components/content-display"
              className="group rounded-lg border border-(--color-border-primary) p-5 flex flex-col hover:border-(--color-border-strong) hover:bg-(--color-background-primary) transition-all"
              style={{ background: "var(--color-background-primary)" }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                  Foundations
                </p>
                <span className="font-mono text-[11px] text-(--color-text-tertiary)">
                  12
                </span>
              </div>
              <h3 className="mt-2 font-semibold">Button</h3>
              <p className="text-sm text-(--color-text-secondary) mt-0.5">
                Primary, secondary, outline, ghost, destructive.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className="inline-flex h-8 items-center rounded-md px-3 text-xs font-semibold"
                  style={{
                    background: "var(--color-interactive-primary)",
                    color: "var(--color-text-inverse, white)",
                  }}
                >
                  Save changes
                </span>
                <span className="inline-flex h-8 items-center rounded-md border border-(--color-border-strong) px-3 text-xs font-semibold text-(--color-text-primary)">
                  Cancel
                </span>
                <span className="inline-flex h-8 items-center rounded-md px-3 text-xs font-semibold text-(--color-text-secondary) hover:bg-(--color-background-secondary) transition-colors">
                  Skip
                </span>
              </div>
            </Link>

            {/* Forms/Input */}
            <Link
              href="/components/inputs"
              className="group rounded-lg border border-(--color-border-primary) p-5 flex flex-col hover:border-(--color-border-strong) hover:bg-(--color-background-primary) transition-all"
              style={{ background: "var(--color-background-primary)" }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                  Forms
                </p>
                <span className="font-mono text-[11px] text-(--color-text-tertiary)">
                  14
                </span>
              </div>
              <h3 className="mt-2 font-semibold">Input</h3>
              <p className="text-sm text-(--color-text-secondary) mt-0.5">
                Text, email, password, search, file.
              </p>
              <div className="mt-5 space-y-2">
                <label className="block text-[11px] font-medium text-(--color-text-secondary)">
                  Email
                </label>
                <div className="flex h-9 items-center gap-2 rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) px-3">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 text-(--color-text-tertiary)"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                  <span className="text-xs text-(--color-text-primary)">
                    travis@wyliedog.dev
                  </span>
                </div>
              </div>
            </Link>

            {/* Navigation/Tabs */}
            <Link
              href="/components/navigation"
              className="group rounded-lg border border-(--color-border-primary) p-5 flex flex-col hover:border-(--color-border-strong) hover:bg-(--color-background-primary) transition-all"
              style={{ background: "var(--color-background-primary)" }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                  Navigation
                </p>
                <span className="font-mono text-[11px] text-(--color-text-tertiary)">
                  9
                </span>
              </div>
              <h3 className="mt-2 font-semibold">Tabs</h3>
              <p className="text-sm text-(--color-text-secondary) mt-0.5">
                Underline, contained, vertical orientations.
              </p>
              <div className="mt-5">
                <div className="flex border-b border-(--color-border-primary) text-xs">
                  <span
                    className="-mb-px border-b-2 px-3 py-2 font-medium"
                    style={{
                      borderColor: "var(--color-interactive-primary)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Overview
                  </span>
                  <span className="px-3 py-2 text-(--color-text-tertiary)">
                    Activity
                  </span>
                  <span className="px-3 py-2 text-(--color-text-tertiary)">
                    Members
                  </span>
                </div>
              </div>
            </Link>

            {/* Overlays/Dialog */}
            <Link
              href="/components/overlays"
              className="group rounded-lg border border-(--color-border-primary) p-5 flex flex-col hover:border-(--color-border-strong) hover:bg-(--color-background-primary) transition-all"
              style={{ background: "var(--color-background-primary)" }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                  Overlays
                </p>
                <span className="font-mono text-[11px] text-(--color-text-tertiary)">
                  8
                </span>
              </div>
              <h3 className="mt-2 font-semibold">Dialog</h3>
              <p className="text-sm text-(--color-text-secondary) mt-0.5">
                Modal, sheet, popover, tooltip, hover card.
              </p>
              <div className="mt-5 relative h-[110px]">
                <div className="absolute inset-x-2 top-2 rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) p-3 opacity-60">
                  <div className="h-2 w-20 rounded-full bg-(--color-background-secondary)" />
                  <div className="mt-2 h-2 w-32 rounded-full bg-(--color-background-secondary)" />
                </div>
                <div
                  className="absolute inset-x-0 top-6 rounded-md border border-(--color-border-strong) p-3 shadow-lg"
                  style={{ background: "var(--color-background-primary)" }}
                >
                  <p className="text-xs font-semibold">Delete project?</p>
                  <p className="text-[11px] text-(--color-text-tertiary) mt-0.5">
                    This cannot be undone.
                  </p>
                  <div className="mt-2 flex justify-end gap-1.5">
                    <span className="inline-flex h-6 items-center rounded border border-(--color-border-strong) px-2 text-[10px] font-medium">
                      Cancel
                    </span>
                    <span
                      className="inline-flex h-6 items-center rounded px-2 text-[10px] font-semibold"
                      style={{
                        background: "oklch(58% 0.2 25)",
                        color: "white",
                      }}
                    >
                      Delete
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Data Display/Table */}
            <Link
              href="/components/content-display"
              className="group rounded-lg border border-(--color-border-primary) p-5 flex flex-col hover:border-(--color-border-strong) hover:bg-(--color-background-primary) transition-all"
              style={{ background: "var(--color-background-primary)" }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                  Data Display
                </p>
                <span className="font-mono text-[11px] text-(--color-text-tertiary)">
                  11
                </span>
              </div>
              <h3 className="mt-2 font-semibold">Table</h3>
              <p className="text-sm text-(--color-text-secondary) mt-0.5">
                Sortable, sticky headers, dense or comfortable.
              </p>
              <div className="mt-5 rounded-md border border-(--color-border-primary) overflow-hidden text-xs">
                <div className="grid grid-cols-3 bg-(--color-background-secondary) px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                  <span>Name</span>
                  <span>Role</span>
                  <span className="text-right">Status</span>
                </div>
                <div className="grid grid-cols-3 px-3 py-2 border-t border-(--color-border-primary)">
                  <span>Elena Mori</span>
                  <span className="text-(--color-text-secondary)">Lead</span>
                  <span className="text-right">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                      style={{
                        background:
                          "color-mix(in oklch, oklch(60% 0.14 155) 18%, transparent)",
                        color: "oklch(60% 0.14 155)",
                      }}
                    >
                      Active
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-3 px-3 py-2 border-t border-(--color-border-primary)">
                  <span>Jude Reyes</span>
                  <span className="text-(--color-text-secondary)">Eng</span>
                  <span className="text-right text-(--color-text-tertiary)">
                    —
                  </span>
                </div>
              </div>
            </Link>

            {/* Feedback/Alert */}
            <Link
              href="/components/feedback"
              className="group rounded-lg border border-(--color-border-primary) p-5 flex flex-col hover:border-(--color-border-strong) hover:bg-(--color-background-primary) transition-all"
              style={{ background: "var(--color-background-primary)" }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                  Feedback
                </p>
                <span className="font-mono text-[11px] text-(--color-text-tertiary)">
                  8
                </span>
              </div>
              <h3 className="mt-2 font-semibold">Alert</h3>
              <p className="text-sm text-(--color-text-secondary) mt-0.5">
                Default, success, warning, destructive.
              </p>
              <div className="mt-5 space-y-1.5">
                <div
                  className="flex items-start gap-2 rounded-md border px-3 py-2"
                  style={{
                    borderColor:
                      "color-mix(in oklch, oklch(60% 0.14 155) 35%, transparent)",
                    background:
                      "color-mix(in oklch, oklch(60% 0.14 155) 10%, transparent)",
                  }}
                >
                  <span
                    className="grid h-4 w-4 mt-px place-items-center rounded-full shrink-0"
                    style={{
                      background: "oklch(60% 0.14 155)",
                      color: "white",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-2.5 w-2.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold">Build passed</p>
                    <p className="text-[10px] text-(--color-text-secondary)">
                      3,402 tests · 1m 14s
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 03 · PATTERNS ─────────────────────────────────────────────────── */}
      <section className="border-b border-(--color-border-primary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                03 · Patterns
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
                From components to compositions.
              </h2>
              <p className="mt-3 text-(--color-text-secondary)">
                {meta.patterns.count} reference patterns that show how the
                primitives compose into the screens you actually ship — auth
                flows, form compositions, layout shells, page compositions, and
                more.
              </p>
            </div>
            <Link href="/patterns">
              <Button
                variant="outline"
                className="h-9 rounded-md px-3.5 text-sm font-medium gap-1.5"
              >
                All patterns
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Button>
            </Link>
          </div>

          {/* 3 large pattern cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Layout */}
            <Link
              href="/patterns/layout"
              className="group rounded-xl border border-(--color-border-primary) overflow-hidden flex flex-col hover:border-(--color-border-strong) transition-all"
              style={{ background: "var(--color-background-primary)" }}
            >
              <div className="relative aspect-[16/10] grid-bg overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "color-mix(in oklch, var(--color-interactive-primary) 8%, transparent)",
                  }}
                />
                <div className="absolute inset-3 flex gap-2">
                  <div className="w-1/4 rounded-md glass-dark p-2 space-y-1">
                    <div className="h-1.5 w-2/3 rounded-full bg-(--color-background-secondary)" />
                    <div className="h-1.5 w-1/2 rounded-full bg-(--color-background-secondary)" />
                    <div
                      className="h-1.5 w-3/4 rounded-full"
                      style={{ background: "var(--color-interactive-primary)" }}
                    />
                    <div className="h-1.5 w-1/2 rounded-full bg-(--color-background-secondary)" />
                  </div>
                  <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-1.5">
                    <div className="rounded-md glass-dark" />
                    <div className="rounded-md glass-dark" />
                    <div className="col-span-2 row-span-2 rounded-md glass-dark p-2 flex items-end gap-1">
                      {[33, 50, 67, 50, 75, 100, 67].map((h, i) => (
                        <div
                          key={i}
                          className="w-2 rounded-sm"
                          style={{
                            height: `${h}%`,
                            background: "var(--color-interactive-primary)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                    Layout
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-(--color-text-tertiary) group-hover:text-(--color-interactive-primary) transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </div>
                <h3 className="mt-2 font-semibold">Layout Patterns</h3>
                <p className="text-sm text-(--color-text-secondary) mt-0.5">
                  Page shell, sidebar, content area — collapses to a sheet below
                  lg.
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {["Card", "NavigationMenu", "Sheet"].map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center rounded-full border border-(--color-border-primary) px-2 py-0.5 font-mono text-[10px] text-(--color-text-secondary)"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </Link>

            {/* Auth */}
            <Link
              href="/patterns/auth"
              className="group rounded-xl border border-(--color-border-primary) overflow-hidden flex flex-col hover:border-(--color-border-strong) transition-all"
              style={{ background: "var(--color-background-primary)" }}
            >
              <div className="relative aspect-[16/10] grid-bg overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "color-mix(in oklch, var(--color-interactive-primary) 8%, transparent)",
                  }}
                />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="w-3/4 rounded-md glass-dark p-3 space-y-2">
                    <div className="h-2 w-1/3 rounded-full bg-(--color-background-secondary)" />
                    <div className="h-5 rounded border border-(--color-border-primary) bg-(--color-background-primary)" />
                    <div className="h-5 rounded border border-(--color-border-primary) bg-(--color-background-primary)" />
                    <div
                      className="h-5 rounded"
                      style={{ background: "var(--color-interactive-primary)" }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                    Form
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-(--color-text-tertiary) group-hover:text-(--color-interactive-primary) transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </div>
                <h3 className="mt-2 font-semibold">Login &amp; Registration</h3>
                <p className="text-sm text-(--color-text-secondary) mt-0.5">
                  Sign-in, registration, social auth. Same schema, three
                  layouts.
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {["Form", "Input", "+3"].map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center rounded-full border border-(--color-border-primary) px-2 py-0.5 font-mono text-[10px] text-(--color-text-secondary)"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <Link
              href="/patterns/navigation"
              className="group rounded-xl border border-(--color-border-primary) overflow-hidden flex flex-col hover:border-(--color-border-strong) transition-all"
              style={{ background: "var(--color-background-primary)" }}
            >
              <div className="relative aspect-[16/10] grid-bg overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "color-mix(in oklch, var(--color-interactive-primary) 8%, transparent)",
                  }}
                />
                <div className="absolute inset-0 grid place-items-center px-4">
                  <div className="w-full rounded-md glass-dark p-2.5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3 text-(--color-text-tertiary)"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                      <div className="h-2 w-1/3 rounded-full bg-(--color-background-secondary)" />
                      <span className="ml-auto kbd kbd-sm">esc</span>
                    </div>
                    <div className="h-px w-full bg-(--color-border-primary)" />
                    <div
                      className="rounded p-1"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-interactive-primary) 18%, transparent)",
                      }}
                    >
                      <div
                        className="h-1.5 w-1/2 rounded-full"
                        style={{
                          background: "var(--color-interactive-primary)",
                        }}
                      />
                    </div>
                    <div className="h-1.5 w-2/3 rounded-full bg-(--color-background-secondary) ml-1" />
                    <div className="h-1.5 w-1/2 rounded-full bg-(--color-background-secondary) ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                    Navigation
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-(--color-text-tertiary) group-hover:text-(--color-interactive-primary) transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </div>
                <h3 className="mt-2 font-semibold">Site Header</h3>
                <p className="text-sm text-(--color-text-secondary) mt-0.5">
                  Sticky nav, search trigger, theme toggle — used on this very
                  page.
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {["NavigationMenu", "Command", "+2"].map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center rounded-full border border-(--color-border-primary) px-2 py-0.5 font-mono text-[10px] text-(--color-text-secondary)"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </div>

          {/* Row 2: 6 small cards */}
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-6 gap-2">
            {[
              {
                cat: "Data",
                label: "Card Grid",
                sub: "Paginated · filterable",
                href: "/patterns/data",
              },
              {
                cat: "Data",
                label: "Feature Grid",
                sub: "2×2 · 3×2 · 4×1",
                href: "/patterns/data",
              },
              {
                cat: "Form",
                label: "Form Compositions",
                sub: "Multi-field · stepped",
                href: "/patterns/forms",
              },
              {
                cat: "Form",
                label: "Form Validation",
                sub: "Error · async · success",
                href: "/patterns/forms",
              },
              {
                cat: "Feedback",
                label: "Error Boundary",
                sub: "Page · component scope",
                href: "/patterns/feedback",
              },
              {
                cat: "Responsive",
                label: "Responsive Patterns",
                sub: "Mobile · tablet · desktop",
                href: "/patterns/responsive",
              },
            ].map((p) => (
              <Link
                key={p.label}
                href={p.href}
                className="rounded-lg border border-(--color-border-primary) p-4 hover:border-(--color-border-strong) transition-all"
                style={{ background: "var(--color-background-primary)" }}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                  {p.cat}
                </span>
                <p className="mt-2 text-sm font-semibold">{p.label}</p>
                <p className="text-xs text-(--color-text-tertiary) mt-0.5">
                  {p.sub}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 · TOKEN BRIDGE ─────────────────────────────────────────────── */}
      <section className="border-b border-(--color-border-primary) bg-(--color-background-secondary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Messaging */}
            <div className="lg:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                04 · Figma plugin
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
                Token Bridge keeps Figma and code{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  in sync
                </span>
                .
              </h2>
              <p className="mt-4 text-(--color-text-secondary)">
                Pull the latest tokens into Figma as variables, or push your
                edits back to a pull request. No more drift between the file
                you're designing in and the code that ships.
              </p>

              <ul className="mt-6 space-y-3 text-sm">
                {[
                  {
                    bold: "Two-way sync.",
                    rest: "Figma variables ↔ CSS custom properties ↔ Tailwind theme.",
                  },
                  {
                    bold: "Mode-aware.",
                    rest: "Light, dark, and high-contrast collections map to a single token contract.",
                  },
                  {
                    bold: "Opens a PR.",
                    rest: "Designer-side edits land in GitHub with a diff and a reviewer assigned.",
                  },
                ].map((item) => (
                  <li key={item.bold} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-interactive-primary) 18%, transparent)",
                        color: "var(--color-interactive-primary)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    <span>
                      <span className="font-medium text-(--color-text-primary)">
                        {item.bold}
                      </span>{" "}
                      <span className="text-(--color-text-secondary)">
                        {item.rest}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="h-10 rounded-md px-4 font-semibold gap-2"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path d="M8 24a4 4 0 0 0 4-4v-4H8a4 4 0 1 0 0 8zm-4-12a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4zm0-8a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4zm8-4h4a4 4 0 1 1 0 8h-4V0zm8 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                  </svg>
                  Open in Figma
                </Button>
                <Link href="/plugin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-md px-4 gap-1.5"
                  >
                    Read the docs
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Button>
                </Link>
              </div>
              <p className="mt-5 font-mono text-[11px] text-(--color-text-tertiary)">
                Free · v0.9 beta · 12,400 installs in Figma Community
              </p>
            </div>

            {/* Plugin window */}
            <div className="lg:col-span-7">
              <div className="relative">
                <div className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
                  <span className="relative flex h-1.5 w-1.5">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                      style={{ background: "oklch(60% 0.14 155)" }}
                    />
                    <span
                      className="relative inline-flex h-1.5 w-1.5 rounded-full"
                      style={{ background: "oklch(60% 0.14 155)" }}
                    />
                  </span>
                  Connected to main
                </div>

                <div
                  className="rounded-xl border border-(--color-border-primary) overflow-hidden shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]"
                  style={{ background: "var(--color-background-primary)" }}
                >
                  {/* Title bar */}
                  <div className="flex items-center gap-2 border-b border-(--color-border-primary) bg-(--color-background-secondary) px-3 py-2">
                    <div className="flex gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: "oklch(70% 0.18 25)" }}
                      />
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: "oklch(80% 0.15 85)" }}
                      />
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: "oklch(70% 0.16 145)" }}
                      />
                    </div>
                    <div className="flex-1 text-center font-mono text-[11px] text-(--color-text-tertiary)">
                      Token Bridge · wyliedog/ui · main
                    </div>
                    <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                      v0.9.2
                    </span>
                  </div>

                  {/* Two-pane body */}
                  <div className="grid grid-cols-12">
                    {/* Sidebar */}
                    <div className="col-span-4 border-r border-(--color-border-primary) p-3 space-y-1 bg-(--color-background-primary)">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary) px-2 py-1">
                        Collections
                      </p>
                      {[
                        {
                          icon: "circle",
                          label: "Color",
                          count: 186,
                          active: true,
                        },
                        { icon: "lines", label: "Spacing", count: 28 },
                        { icon: "type", label: "Typography", count: 42 },
                        { icon: "rect", label: "Radius", count: 12 },
                        { icon: "plus", label: "Shadow", count: 9 },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${item.active ? "font-medium" : "text-(--color-text-secondary) hover:text-(--color-text-primary)"}`}
                          style={
                            item.active
                              ? {
                                  background:
                                    "color-mix(in oklch, var(--color-interactive-primary) 14%, transparent)",
                                  color: "var(--color-interactive-primary)",
                                }
                              : {}
                          }
                        >
                          <span className="font-mono text-[10px]">
                            {item.label}
                          </span>
                          <span className="ml-auto font-mono text-[10px]">
                            {item.count}
                          </span>
                        </div>
                      ))}
                      <div className="mt-4 pt-3 border-t border-(--color-border-primary)">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary) px-2 py-1">
                          Modes
                        </p>
                        {["Light", "Dark"].map((mode) => (
                          <div
                            key={mode}
                            className="px-2 py-1 text-xs flex items-center justify-between"
                          >
                            <span className="text-(--color-text-secondary)">
                              {mode}
                            </span>
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: "oklch(60% 0.14 155)" }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Diff list */}
                    <div className="col-span-8 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">
                          Pending sync · 3 changes
                        </p>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px]"
                          style={{
                            background:
                              "color-mix(in oklch, oklch(72% 0.15 75) 18%, transparent)",
                            color: "oklch(72% 0.15 75)",
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: "oklch(72% 0.15 75)" }}
                          />
                          ahead by 3
                        </span>
                      </div>

                      {/* Modified */}
                      <div className="rounded-md border border-(--color-border-primary) p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-[10px] rounded px-1.5 py-0.5"
                            style={{
                              background:
                                "color-mix(in oklch, oklch(72% 0.15 75) 18%, transparent)",
                              color: "oklch(72% 0.15 75)",
                            }}
                          >
                            M
                          </span>
                          <span className="font-mono text-xs">
                            color/interactive/primary
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="flex items-center gap-2 rounded border border-(--color-border-primary) px-2 py-1.5">
                            <span
                              className="h-4 w-4 rounded shrink-0"
                              style={{ background: "oklch(58% 0.16 274)" }}
                            />
                            <span className="font-mono text-(--color-text-tertiary) line-through">
                              oklch(58% .16 274)
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-2 rounded border px-2 py-1.5"
                            style={{
                              borderColor:
                                "color-mix(in oklch, var(--color-interactive-primary) 50%, transparent)",
                              background:
                                "color-mix(in oklch, var(--color-interactive-primary) 8%, transparent)",
                            }}
                          >
                            <span
                              className="h-4 w-4 rounded shrink-0"
                              style={{ background: "oklch(54% 0.18 274)" }}
                            />
                            <span className="font-mono text-(--color-text-primary)">
                              oklch(54% .18 274)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Added */}
                      <div className="rounded-md border border-(--color-border-primary) p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-[10px] rounded px-1.5 py-0.5"
                            style={{
                              background:
                                "color-mix(in oklch, oklch(60% 0.14 155) 18%, transparent)",
                              color: "oklch(60% 0.14 155)",
                            }}
                          >
                            +
                          </span>
                          <span className="font-mono text-xs">
                            color/surface/elevated
                          </span>
                          <span className="ml-auto font-mono text-[10px] text-(--color-text-tertiary)">
                            new in v1.4
                          </span>
                        </div>
                      </div>

                      {/* Modified radius */}
                      <div className="rounded-md border border-(--color-border-primary) p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-[10px] rounded px-1.5 py-0.5"
                            style={{
                              background:
                                "color-mix(in oklch, oklch(72% 0.15 75) 18%, transparent)",
                              color: "oklch(72% 0.15 75)",
                            }}
                          >
                            M
                          </span>
                          <span className="font-mono text-xs">radius/lg</span>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-[11px]">
                          <span className="font-mono text-(--color-text-tertiary) line-through">
                            12px
                          </span>
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3 w-3 text-(--color-text-tertiary)"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                          <span className="font-mono text-(--color-text-primary)">
                            14px
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-(--color-border-primary) pt-3 mt-3">
                        <div className="flex items-center gap-2 text-[11px] text-(--color-text-tertiary) font-mono">
                          last synced 4m ago
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 items-center rounded-md border border-(--color-border-strong) px-2.5 text-[11px] font-medium cursor-pointer hover:bg-(--color-background-secondary) transition-colors">
                            Discard
                          </span>
                          <span
                            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold"
                            style={{
                              background: "var(--color-interactive-primary)",
                              color: "var(--color-text-inverse, white)",
                            }}
                          >
                            Open PR
                            <svg
                              viewBox="0 0 24 24"
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="6" cy="6" r="2" />
                              <circle cx="18" cy="18" r="2" />
                              <path d="M6 8v8a4 4 0 0 0 4 4h6" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-3 right-6 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  3 tokens · ready to push
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-(--color-border-primary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="glass rounded-2xl p-8 lg:p-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <div className="flex-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight">
                See it in action.
              </h2>
              <p className="mt-2 text-(--color-text-secondary) max-w-xl">
                Every component on this page is rendered with the live library —
                explore the full set of states, props, and accessibility
                behaviors in Storybook.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link href="https://storybook.wyliedog.dev">
                <Button
                  size="sm"
                  className="h-10 rounded-md px-4 font-semibold gap-1.5"
                >
                  Open Storybook
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </Button>
              </Link>
              <Link href="/components">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-md px-4"
                >
                  Browse components
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
