import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import { getShowcaseMeta } from "@/lib/showcase-metadata";
import { SpacingDemo } from "./spacing-demo";
import { MotionPreview } from "./motion-preview";
import { SectionSubnav } from "@/components/section-subnav";

export default function TokensPage() {
  const meta = getShowcaseMeta();

  const cohortBars = [
    [24, 18, 8, 4],
    [26, 20, 10, 6],
    [28, 22, 12, 8],
    [30, 24, 14, 10],
    [32, 26, 16, 11],
    [35, 28, 18, 12],
    [38, 30, 19, 14],
    [41, 32, 21, 14],
    [44, 35, 22, 15],
    [46, 36, 23, 16],
    [50, 38, 25, 18],
    [54, 41, 27, 20],
  ];

  const brandRamp = [
    { step: "50", l: 98, c: 0.02, contrast: "1.04 : 1" },
    { step: "100", l: 94, c: 0.05, contrast: "1.18 : 1" },
    { step: "300", l: 80, c: 0.13, contrast: "2.10 : 1" },
    { step: "500", l: 54, c: 0.18, contrast: null, brand: true },
    { step: "700", l: 38, c: 0.16, contrastBadge: "AAA · 8.4" },
    { step: "900", l: 22, c: 0.09, contrast: "14.2 : 1" },
  ];

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-(--color-border-primary)">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-(--color-border-primary) px-3 py-1"
            style={{
              background:
                "color-mix(in oklch, var(--color-background-primary) 60%, transparent)",
            }}
          >
            <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-secondary)">
              02 · Tokens
            </span>
            <span className="text-(--color-text-tertiary)">·</span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
              Three-tiered System
            </span>
          </div>

          <div className="mt-5 grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-[5rem] font-semibold tracking-tight leading-[0.96] text-(--color-text-primary)">
                The contract <br />
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  everything
                </span>{" "}
                renders against.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-(--color-text-secondary) leading-relaxed">
                {meta.tokens.total.toLocaleString()} tokens organized in three
                tiers. Every color, every space, every curve in the system flows
                from this contract — and re-themes when it changes.
              </p>
            </div>

            <div className="lg:col-span-5">
              <dl className="grid grid-cols-3 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) overflow-hidden">
                {[
                  { label: "Primitives", value: meta.tokens.primitive },
                  { label: "Semantic", value: meta.tokens.semantic },
                  { label: "Component", value: meta.tokens.component },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className={`px-4 py-4 ${i < 2 ? "border-r border-(--color-border-primary)" : ""}`}
                  >
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                      {s.label}
                    </dt>
                    <dd className="mt-1 font-serif text-2xl font-semibold text-(--color-text-primary)">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 font-mono text-[11px] text-(--color-text-tertiary)">
                All {meta.tokens.total.toLocaleString()} tokens are typed. Zero
                hex codes ship in the components package.
              </p>
            </div>
          </div>

          {/* CASCADE LANE */}
          <div className="relative mt-14 lg:mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-0">
              {[
                {
                  tier: "Tier 01 · Primitive",
                  count: meta.tokens.primitive,
                  desc: "Raw values. Never referenced directly by components.",
                  tokenName: "--color-violet-500",
                  tokenVal: "oklch(54% 0.18 274)",
                  swatch: "oklch(54% 0.18 274)",
                },
                {
                  tier: "Tier 02 · Semantic",
                  count: meta.tokens.semantic,
                  desc: "Roles. The contract every theme must satisfy.",
                  tokenName: "--color-interactive-primary",
                  tokenVal: "→ violet-500 (light) · violet-400 (dark)",
                  swatch: "var(--color-interactive-primary)",
                },
                {
                  tier: "Tier 03 · Component",
                  count: meta.tokens.component,
                  desc: "Surfaces. The shape components consume.",
                  tokenName: "--color-button-primary-bg",
                  tokenVal: "→ interactive-primary",
                  swatch: "var(--color-interactive-primary)",
                },
              ].map((tier, i) => (
                <div
                  key={tier.tier}
                  className={`relative rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5 ${i === 0 ? "lg:rounded-r-none lg:border-r-0" : i === 1 ? "lg:rounded-none" : "lg:rounded-l-none lg:border-l-0"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                      {tier.tier}
                    </span>
                    <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                      {tier.count}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-(--color-text-secondary)">
                    {tier.desc}
                  </p>
                  <div className="mt-4 rounded-lg border border-(--color-border-primary) bg-(--color-background-secondary) p-3 font-mono text-[11px] leading-relaxed">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-sm shrink-0"
                        style={{ background: tier.swatch }}
                      />
                      <span className="text-(--color-text-secondary) truncate">
                        {tier.tokenName}
                      </span>
                    </div>
                    <div className="mt-1 pl-5 text-(--color-text-tertiary) text-[10px]">
                      {tier.tokenVal}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary) shrink-0">
                Renders →
              </span>
              <button
                className="inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold"
                style={{
                  background: "var(--color-interactive-primary)",
                  color: "var(--color-text-inverse)",
                }}
              >
                Save changes
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
              </button>
              <span className="text-xs text-(--color-text-tertiary) hidden sm:inline">
                Toggle theme — every reference resolves through the same chain.
              </span>
            </div>
          </div>
        </div>
      </section>

      <SectionSubnav
        sections={[
          { n: "01", label: "Color", id: "color" },
          { n: "02", label: "Typography", id: "typography" },
          { n: "03", label: "Spacing", id: "spacing" },
          { n: "04", label: "Radius", id: "radius" },
          { n: "05", label: "Elevation", id: "elevation" },
          { n: "06", label: "Motion", id: "motion" },
        ]}
        label="Token categories"
        meta={`${meta.tokens.total.toLocaleString()} tokens · v1.4.0`}
      />

      {/* ── 01 · COLOR ── */}
      <section
        id="color"
        className="border-b border-(--color-border-primary) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                01 · Color
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
                OKLCH means the ramp{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  is
                </span>{" "}
                the math.
              </h2>
              <p className="mt-3 text-(--color-text-secondary) leading-relaxed">
                Every brand step is one perceptual lightness apart. Mix safely,
                lighten without muddying, and stay AA-compliant by default.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border-primary) bg-(--color-background-primary) px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "oklch(60% 0.14 155)" }}
                />
                WCAG 2.2 AA · verified
              </span>
              <Link href="/tokens/colors">
                <Button variant="outline" size="sm" className="rounded-md">
                  All color tokens →
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-3">
            {/* Analytics chart */}
            <div className="lg:col-span-8 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-(--color-border-primary)">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                      Acquisition · Q3 2026
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px]"
                      style={{
                        background:
                          "color-mix(in oklch, oklch(60% 0.14 155) 18%, transparent)",
                        color: "oklch(60% 0.14 155)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-2.5 w-2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="m6 14 5-5 4 4 5-5" />
                      </svg>
                      +18.4%
                    </span>
                  </div>
                  <h3 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-(--color-text-primary)">
                    Cohort retention
                  </h3>
                </div>
                <div className="hidden sm:flex items-center gap-1 rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) p-0.5">
                  {["Week", "Month", "Quarter"].map((t, i) => (
                    <button
                      key={t}
                      className="rounded px-2.5 py-1 text-xs font-medium"
                      style={
                        i === 0
                          ? {
                              background: "var(--color-background-primary)",
                              color: "var(--color-text-primary)",
                            }
                          : { color: "var(--color-text-tertiary)" }
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-6 pt-6 pb-4">
                <div className="flex">
                  <div
                    className="w-10 flex flex-col justify-between font-mono text-[10px] text-(--color-text-tertiary) pr-2 pt-1 pb-6 leading-none"
                    style={{ height: "240px" }}
                  >
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                  <div className="flex-1 relative" style={{ height: "240px" }}>
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="border-t border-(--color-border-primary) opacity-50"
                          style={{ borderStyle: "dashed" }}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-end gap-1.5 px-1 pb-6">
                      {cohortBars.map((bar, wi) => (
                        <div
                          key={wi}
                          className="flex-1 flex flex-col-reverse gap-px relative"
                        >
                          {bar.map((h, ci) => (
                            <div
                              key={ci}
                              className="rounded-sm"
                              style={{
                                height: `${h}%`,
                                background: [
                                  "oklch(38% 0.16 274)",
                                  "oklch(54% 0.18 274)",
                                  "oklch(70% 0.16 274)",
                                  "oklch(88% 0.09 274)",
                                ][ci],
                              }}
                            />
                          ))}
                          {wi === 6 && (
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-(--color-background-primary) border border-(--color-border-primary) px-2 py-1 text-[10px] font-mono shadow-md">
                              Wk 7 · 1,284
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="absolute left-0 right-0 bottom-0 flex justify-between px-1 font-mono text-[10px] text-(--color-text-tertiary)">
                      {[
                        "W1",
                        "W2",
                        "W3",
                        "W4",
                        "W5",
                        "W6",
                        "W7",
                        "W8",
                        "W9",
                        "W10",
                        "W11",
                        "W12",
                      ].map((w, i) => (
                        <span
                          key={w}
                          style={
                            i === 6
                              ? { color: "var(--color-text-primary)" }
                              : undefined
                          }
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-(--color-border-primary)">
                {[
                  {
                    color: "oklch(38% 0.16 274)",
                    label: "violet · 700",
                    name: "Direct",
                    pct: "42% of new users",
                  },
                  {
                    color: "oklch(54% 0.18 274)",
                    label: "violet · 500",
                    name: "Referral",
                    pct: "28% of new users",
                  },
                  {
                    color: "oklch(70% 0.16 274)",
                    label: "violet · 300",
                    name: "Search",
                    pct: "21% of new users",
                  },
                  {
                    color: "oklch(88% 0.09 274)",
                    label: "violet · 100",
                    name: "Social",
                    pct: "9% of new users",
                  },
                ].map((c, i) => (
                  <div
                    key={c.name}
                    className={`px-5 py-4 ${i < 3 ? "sm:border-r border-(--color-border-primary)" : ""} ${i >= 2 ? "border-t sm:border-t-0 border-(--color-border-primary)" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ background: c.color }}
                      />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                        {c.label}
                      </span>
                    </div>
                    <p className="mt-1 font-serif text-xl font-semibold leading-none text-(--color-text-primary)">
                      {c.name}
                    </p>
                    <p className="mt-1 text-[11px] text-(--color-text-tertiary)">
                      {c.pct}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand ramp + semantic states */}
            <div className="lg:col-span-4 space-y-3">
              <div className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                    brand ramp · violet
                  </p>
                  <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                    L · 0.18C · 274h
                  </span>
                </div>
                <div className="mt-4 space-y-1">
                  {brandRamp.map((r) => (
                    <div
                      key={r.step}
                      className={`flex items-center gap-3 rounded-md ${r.brand ? "p-1 -mx-1" : ""}`}
                      style={
                        r.brand
                          ? {
                              background:
                                "color-mix(in oklch, var(--color-interactive-primary) 8%, transparent)",
                            }
                          : undefined
                      }
                    >
                      <div
                        className="h-7 w-7 rounded-md shrink-0"
                        style={{
                          background: `oklch(${r.l}% ${r.c} 274)`,
                          ...(r.brand
                            ? {
                                outline:
                                  "2px solid var(--color-interactive-primary)",
                                outlineOffset: "2px",
                              }
                            : {}),
                        }}
                      />
                      <span
                        className={`font-mono text-[10px] w-8 shrink-0 ${r.brand ? "font-semibold text-(--color-text-primary)" : "text-(--color-text-tertiary)"}`}
                      >
                        {r.step}
                      </span>
                      <span
                        className={`font-mono text-[10px] ${r.brand ? "text-(--color-text-primary)" : "text-(--color-text-tertiary)"}`}
                      >
                        {r.l}% L{r.brand ? " · brand" : ""}
                      </span>
                      <span className="ml-auto font-mono text-[10px]">
                        {r.brand ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5"
                            style={{
                              background:
                                "color-mix(in oklch, oklch(60% 0.14 155) 18%, transparent)",
                              color: "oklch(60% 0.14 155)",
                            }}
                          >
                            AA · 4.91
                          </span>
                        ) : r.contrastBadge ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5"
                            style={{
                              background:
                                "color-mix(in oklch, oklch(60% 0.14 155) 18%, transparent)",
                              color: "oklch(60% 0.14 155)",
                            }}
                          >
                            {r.contrastBadge}
                          </span>
                        ) : (
                          <span className="text-(--color-text-tertiary)">
                            {r.contrast}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                  semantic states
                </p>
                <div className="mt-3 space-y-1.5">
                  {[
                    {
                      color: "oklch(60% 0.14 155)",
                      label: "Deployment succeeded",
                      token: "--color-success · 60% L · 155h",
                      icon: <path d="m5 12 5 5L20 7" />,
                    },
                    {
                      color: "oklch(72% 0.15 75)",
                      label: "Quota approaching limit",
                      token: "--color-warning · 72% L · 75h",
                      textColor: "oklch(20% 0.05 75)",
                      icon: <path d="M12 8v5M12 16v.01" />,
                    },
                    {
                      color: "oklch(58% 0.2 25)",
                      label: "Build failed · 2 errors",
                      token: "--color-destructive · 58% L · 25h",
                      icon: <path d="M18 6 6 18M6 6l12 12" />,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-2.5 rounded-md border border-(--color-border-primary) px-3 py-2"
                    >
                      <span
                        className="grid h-5 w-5 place-items-center rounded-full shrink-0"
                        style={{
                          background: s.color,
                          color: s.textColor ?? "var(--color-text-inverse)",
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          {s.icon}
                        </svg>
                      </span>
                      <div className="text-xs">
                        <p className="font-medium text-(--color-text-primary)">
                          {s.label}
                        </p>
                        <p className="font-mono text-[10px] text-(--color-text-tertiary)">
                          {s.token}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 · TYPOGRAPHY ── */}
      <section
        id="typography"
        className="border-b border-(--color-border-primary) bg-(--color-background-secondary) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                02 · Typography
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
                A pairing that ships{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  long-form
                </span>
                , dashboards, and code.
              </h2>
              <p className="mt-3 text-(--color-text-secondary) leading-relaxed">
                Besley for editorial moments. Manrope for everything else.
                JetBrains Mono for code and labels. Eight sizes, four weights,
                three families.
              </p>
            </div>
            <Link href="/tokens/typography">
              <Button
                variant="outline"
                size="sm"
                className="rounded-md self-start lg:self-auto"
              >
                All typography tokens →
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-3">
            <article className="lg:col-span-8 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) overflow-hidden">
              <div className="flex items-center justify-between px-8 py-3 border-b border-(--color-border-primary) bg-(--color-background-secondary)">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                  <span>Wylie Dog Field Notes</span>
                  <span>·</span>
                  <span>Issue 14</span>
                </div>
                <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                  8 min read
                </span>
              </div>
              <div className="px-8 py-10 lg:px-12 lg:py-12">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-text-tertiary)">
                  Engineering · April 2026
                </p>
                <h3 className="mt-5 font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.02] text-(--color-text-primary)">
                  Why we rebuilt the entire color system in a week.
                </h3>
                <p className="mt-5 font-serif text-xl text-(--color-text-secondary) leading-snug max-w-2xl">
                  Ten months of hex codes, three product redesigns, and one
                  paint-bucket migration later — here is what an OKLCH-native
                  token system actually buys you.
                </p>
                <div className="mt-6 flex items-center gap-3 py-4 border-t border-b border-(--color-border-primary)">
                  <div
                    className="h-8 w-8 rounded-full grid place-items-center font-semibold text-xs"
                    style={{
                      background: "oklch(78% 0.13 274)",
                      color: "oklch(20% 0.05 274)",
                    }}
                  >
                    EM
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--color-text-primary)">
                      Elena Mori
                    </p>
                    <p className="text-xs text-(--color-text-tertiary)">
                      Lead, Design Systems · 10 May 2026
                    </p>
                  </div>
                  <span
                    className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      background:
                        "color-mix(in oklch, var(--color-interactive-primary) 12%, transparent)",
                      color: "var(--color-interactive-primary)",
                    }}
                  >
                    Engineering
                  </span>
                </div>
                <p className="mt-6 text-base text-(--color-text-secondary) leading-relaxed">
                  Every design system eventually hits the same wall: your color
                  ramp made sense when it was just a handful of HEX values, but
                  somewhere between the third palette expansion and the dark
                  mode sprint, the math stopped working.
                </p>
                <p className="mt-4 text-base text-(--color-text-secondary) leading-relaxed">
                  OKLCH fixes this because perceptual lightness is a first-class
                  axis. When you step from{" "}
                  <code className="font-mono text-sm px-1 py-0.5 rounded bg-(--color-background-secondary) text-(--color-text-primary)">
                    oklch(54% 0.18 274)
                  </code>{" "}
                  to{" "}
                  <code className="font-mono text-sm px-1 py-0.5 rounded bg-(--color-background-secondary) text-(--color-text-primary)">
                    oklch(38% 0.16 274)
                  </code>
                  , the difference is predictable — not a guess.
                </p>
              </div>
            </article>

            <aside className="lg:col-span-4 space-y-5">
              {[
                {
                  label: "Serif — Besley",
                  samples: [
                    {
                      text: "Display heading",
                      cls: "font-serif text-2xl font-semibold text-(--color-text-primary)",
                    },
                    {
                      text: "Italic emphasis",
                      cls: "font-serif text-base italic text-(--color-text-secondary)",
                    },
                  ],
                },
                {
                  label: "Sans — Manrope",
                  samples: [
                    {
                      text: "Body text, readable",
                      cls: "font-sans text-base font-medium text-(--color-text-primary)",
                    },
                    {
                      text: "Secondary label",
                      cls: "font-sans text-sm text-(--color-text-secondary)",
                    },
                  ],
                },
                {
                  label: "Mono — JetBrains",
                  samples: [
                    {
                      text: "--token-name: value",
                      cls: "font-mono text-sm text-(--color-text-primary)",
                    },
                    {
                      text: "Code, labels",
                      cls: "font-mono text-xs text-(--color-text-tertiary)",
                    },
                  ],
                },
              ].map((group) => (
                <div
                  key={group.label}
                  className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary) mb-3">
                    {group.label}
                  </p>
                  {group.samples.map((s) => (
                    <div key={s.text} className={s.cls}>
                      {s.text}
                    </div>
                  ))}
                </div>
              ))}
            </aside>
          </div>
        </div>
      </section>

      {/* ── 03 · SPACING ── */}
      <section
        id="spacing"
        className="border-b border-(--color-border-primary) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                03 · Spacing
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
                One scale. Three densities.{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  Same data.
                </span>
              </h2>
              <p className="mt-3 text-(--color-text-secondary) leading-relaxed">
                The 4-pixel base scale powers every gap, padding, and inset in
                the system. Switch density on this real members table — every
                gutter, row height, and avatar size re-resolves through the same
                tokens.
              </p>
            </div>
            <Link href="/tokens/spacing">
              <Button
                variant="outline"
                size="sm"
                className="rounded-md shrink-0"
              >
                All 28 spacing tokens →
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-3">
            <div className="lg:col-span-8">
              <SpacingDemo />
            </div>

            {/* Spacing scale panel */}
            <div className="lg:col-span-4 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary) mb-4">
                Scale · 4px base
              </p>
              <div className="space-y-2">
                {[
                  { step: "1", px: 4 },
                  { step: "2", px: 8 },
                  { step: "3", px: 12 },
                  { step: "4", px: 16, inUse: true },
                  { step: "5", px: 20 },
                  { step: "6", px: 24 },
                  { step: "8", px: 32 },
                  { step: "10", px: 40 },
                  { step: "12", px: 48 },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`flex items-center gap-3 rounded-md ${s.inUse ? "px-2 py-1 -mx-2" : ""}`}
                    style={
                      s.inUse
                        ? {
                            background:
                              "color-mix(in oklch, var(--color-interactive-primary) 8%, transparent)",
                          }
                        : undefined
                    }
                  >
                    <span className="font-mono text-[10px] w-4 text-(--color-text-tertiary) shrink-0">
                      {s.step}
                    </span>
                    <div
                      className="rounded-sm"
                      style={{
                        height: "8px",
                        width: `${Math.min(s.px * 2.5, 120)}px`,
                        background: s.inUse
                          ? "var(--color-interactive-primary)"
                          : "var(--color-border-primary)",
                        transition: "width 0.2s",
                      }}
                    />
                    <span
                      className="font-mono text-[10px] ml-auto shrink-0"
                      style={{
                        color: s.inUse
                          ? "var(--color-interactive-primary)"
                          : "var(--color-text-tertiary)",
                      }}
                    >
                      {s.px}px{s.inUse ? " · in use" : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-(--color-border-primary) space-y-1 font-mono text-[10px] text-(--color-text-tertiary)">
                <p className="text-(--color-text-secondary) mb-2">
                  Composed tokens
                </p>
                {[
                  "--space-card-padding: 24px",
                  "--space-input-x: 12px",
                  "--space-stack-sm: 8px",
                ].map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 · RADIUS ── */}
      <section
        id="radius"
        className="border-b border-(--color-border-primary) bg-(--color-background-secondary) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                04 · Radius
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
                Five corners.{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  Every surface
                </span>{" "}
                already knows which.
              </h2>
              <p className="mt-3 text-(--color-text-secondary) leading-relaxed">
                Radius isn't a design decision at use-time — it's encoded in the
                token. Every component surface resolves to its semantic radius
                automatically.
              </p>
            </div>
            <Link href="/tokens/borders">
              <Button
                variant="outline"
                size="sm"
                className="rounded-md shrink-0"
              >
                All 12 radius tokens →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                step: "xs",
                px: "2px",
                surface: "Tags & chips",
                token: "--radius-xs",
                preview: (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {["Design", "Systems", "OKLCH"].map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 text-[11px] font-mono border border-(--color-border-primary) text-(--color-text-secondary)"
                        style={{ borderRadius: "2px" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ),
              },
              {
                step: "sm",
                px: "6px",
                surface: "Buttons & inputs",
                token: "--radius-sm",
                preview: (
                  <button
                    className="inline-flex h-8 items-center px-4 text-sm font-semibold"
                    style={{
                      borderRadius: "6px",
                      background: "var(--color-interactive-primary)",
                      color: "var(--color-text-inverse)",
                    }}
                  >
                    Continue
                  </button>
                ),
              },
              {
                step: "md",
                px: "10px",
                surface: "Menus & popovers",
                token: "--radius-md",
                preview: (
                  <div
                    className="border border-(--color-border-primary) bg-(--color-background-primary) w-full shadow-sm text-sm"
                    style={{ borderRadius: "10px", overflow: "hidden" }}
                  >
                    {["Edit", "Duplicate", "Archive"].map((item, i) => (
                      <div
                        key={item}
                        className={`px-3 py-2 text-(--color-text-secondary) text-xs ${i < 2 ? "border-b border-(--color-border-primary)" : ""} ${i === 0 ? "text-(--color-text-primary)" : ""}`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                step: "lg",
                px: "14px",
                surface: "Cards & tiles",
                token: "--radius-lg",
                preview: (
                  <div
                    className="border border-(--color-border-primary) bg-(--color-background-primary) p-3 w-full"
                    style={{ borderRadius: "14px" }}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                      Pro plan
                    </p>
                    <p className="font-serif text-lg font-semibold text-(--color-text-primary) mt-0.5">
                      $49
                      <span className="text-sm font-sans font-normal text-(--color-text-tertiary)">
                        /mo
                      </span>
                    </p>
                    <div className="mt-2 rounded-full h-1.5 bg-(--color-border-primary) overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "68%",
                          background: "var(--color-interactive-primary)",
                        }}
                      />
                    </div>
                    <p className="font-mono text-[9px] text-(--color-text-tertiary) mt-1">
                      68% of limit used
                    </p>
                  </div>
                ),
              },
              {
                step: "xl",
                px: "20px",
                surface: "Modals & sheets",
                token: "--radius-xl",
                preview: (
                  <div
                    className="border border-(--color-border-primary) bg-(--color-background-primary) p-3 w-full shadow-md"
                    style={{ borderRadius: "20px" }}
                  >
                    <p className="text-sm font-semibold text-(--color-text-primary) mb-2">
                      Invite teammate
                    </p>
                    <div
                      className="rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) px-2.5 py-1.5 text-xs text-(--color-text-tertiary) mb-2"
                      style={{ borderRadius: "8px" }}
                    >
                      name@company.com
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        className="flex-1 rounded-md border border-(--color-border-primary) py-1 text-xs text-(--color-text-secondary)"
                        style={{ borderRadius: "8px" }}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex-1 rounded-md py-1 text-xs font-semibold"
                        style={{
                          borderRadius: "8px",
                          background: "var(--color-interactive-primary)",
                          color: "var(--color-text-inverse)",
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ),
              },
            ].map((r) => (
              <div
                key={r.step}
                className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5 flex flex-col"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <span className="font-semibold text-(--color-text-primary)">
                    {r.step}
                  </span>
                  <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                    {r.px}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center py-4">
                  {r.preview}
                </div>
                <div className="mt-4 pt-4 border-t border-(--color-border-primary)">
                  <p className="text-xs text-(--color-text-secondary)">
                    {r.surface}
                  </p>
                  <p className="font-mono text-[10px] text-(--color-text-tertiary) mt-0.5">
                    {r.token}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 · ELEVATION ── */}
      <section
        id="elevation"
        className="border-b border-(--color-border-primary) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                05 · Elevation
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
                Five shadow steps —{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  one
                </span>{" "}
                stacking story.
              </h2>
              <p className="mt-3 text-(--color-text-secondary) leading-relaxed">
                Each step encodes both a shadow value and a semantic z-axis
                role. The scene below reflects honest stacking order.
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-md shrink-0">
              All 9 shadow tokens →
            </Button>
          </div>

          <div className="grid lg:grid-cols-12 gap-3">
            {/* Layered scene */}
            <div
              className="lg:col-span-8 rounded-xl border border-(--color-border-primary) bg-(--color-background-secondary) overflow-hidden relative grid-bg"
              style={{ minHeight: "480px" }}
            >
              <div
                className="relative w-full h-full p-8"
                style={{ minHeight: "480px" }}
              >
                {/* Base card */}
                <div className="absolute top-10 left-8 w-56 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-4 shadow-sm">
                  <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-(--color-text-secondary)">
                    xs · base
                  </div>
                  <p className="font-mono text-[10px] text-(--color-text-tertiary)">
                    packages/ui
                  </p>
                  <p className="font-semibold text-sm text-(--color-text-primary) mt-1">
                    Button.tsx
                  </p>
                  <div
                    className="mt-2 h-1 rounded-full"
                    style={{
                      background: "var(--color-interactive-primary)",
                      width: "60%",
                    }}
                  />
                </div>
                {/* Popover */}
                <div
                  className="absolute top-8 left-52 w-48 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-3"
                  style={{ boxShadow: "0 4px 12px -2px rgba(0,0,0,0.15)" }}
                >
                  <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-(--color-text-secondary)">
                    md · popover
                  </div>
                  {["View changelog", "Copy token", "Open in Figma"].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`px-2 py-1.5 text-xs rounded-md text-(--color-text-secondary) ${i === 0 ? "bg-(--color-background-secondary) text-(--color-text-primary)" : ""}`}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
                {/* Toast */}
                <div
                  className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-3 flex items-center gap-3"
                  style={{ boxShadow: "0 8px 24px -4px rgba(0,0,0,0.2)" }}
                >
                  <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-(--color-text-secondary)">
                    lg · toast
                  </div>
                  <span
                    className="h-6 w-6 rounded-full grid place-items-center shrink-0"
                    style={{ background: "oklch(60% 0.14 155)" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  </span>
                  <p className="text-xs font-medium text-(--color-text-primary)">
                    Tokens published · v1.4.1
                  </p>
                </div>
                {/* Modal */}
                <div
                  className="absolute bottom-8 right-8 w-56 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-4"
                  style={{ boxShadow: "0 16px 48px -8px rgba(0,0,0,0.28)" }}
                >
                  <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-(--color-text-secondary)">
                    xl · modal
                  </div>
                  <p className="text-sm font-semibold text-(--color-text-primary) mb-3">
                    Invite teammate
                  </p>
                  <div className="rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) px-2.5 py-1.5 text-xs text-(--color-text-tertiary) mb-2">
                    name@company.com
                  </div>
                  <div className="flex gap-1.5">
                    <button className="flex-1 rounded-md border border-(--color-border-primary) py-1.5 text-xs text-(--color-text-secondary)">
                      Cancel
                    </button>
                    <button
                      className="flex-1 rounded-md py-1.5 text-xs font-semibold text-white"
                      style={{ background: "var(--color-interactive-primary)" }}
                    >
                      Send invite
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Elevation ladder */}
            <div className="lg:col-span-4 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary) mb-4">
                Elevation ladder
              </p>
              <div className="space-y-3">
                {[
                  {
                    level: "xs · base",
                    shadow: "0 1px 3px rgba(0,0,0,.08)",
                    role: "Cards, panels",
                    token: "--shadow-xs",
                  },
                  {
                    level: "sm · raised",
                    shadow: "0 2px 8px -1px rgba(0,0,0,.12)",
                    role: "Raised elements",
                    token: "--shadow-sm",
                  },
                  {
                    level: "md · popover",
                    shadow: "0 4px 12px -2px rgba(0,0,0,.15)",
                    role: "Menus, popovers",
                    token: "--shadow-md",
                  },
                  {
                    level: "lg · toast",
                    shadow: "0 8px 24px -4px rgba(0,0,0,.20)",
                    role: "Toasts, drawers",
                    token: "--shadow-lg",
                  },
                  {
                    level: "xl · modal",
                    shadow: "0 16px 48px -8px rgba(0,0,0,.28)",
                    role: "Modals, spotlights",
                    token: "--shadow-xl",
                  },
                ].map((e) => (
                  <div key={e.level} className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) shrink-0"
                      style={{ boxShadow: e.shadow }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] text-(--color-text-primary)">
                        {e.level}
                      </p>
                      <p className="text-[11px] text-(--color-text-tertiary)">
                        {e.role}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-(--color-text-tertiary) shrink-0">
                      {e.token}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 pt-4 border-t border-(--color-border-primary) text-[11px] text-(--color-text-tertiary) leading-relaxed">
                Dark mode: shadows are replaced with border + background-lift.
                Same tokens, different rendering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 06 · MOTION ── */}
      <section
        id="motion"
        className="border-b border-(--color-border-primary) bg-(--color-background-secondary) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                06 · Motion
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
                Four curves and three durations{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  cover everything.
                </span>
              </h2>
              <p className="mt-3 text-(--color-text-secondary) leading-relaxed">
                Standard for persistent UI, emphasized for key moments,
                decelerate for entrances, accelerate for exits. Pick a duration
                from the scale — the curve does the rest.
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-md shrink-0">
              All 11 motion tokens →
            </Button>
          </div>

          <MotionPreview />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-b border-(--color-border-primary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="glass rounded-2xl p-8 lg:p-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <div className="flex-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight">
                Ready to wire tokens into your codebase?
              </h2>
              <p className="mt-2 text-(--color-text-secondary) max-w-xl">
                Install the package or pull tokens straight into Figma with
                Token Bridge — both consume the exact same contract you saw on
                this page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link href="/components">
                <Button
                  size="sm"
                  className="h-10 rounded-md px-4 font-semibold gap-1.5"
                >
                  Browse components
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
              <Link href="/plugin">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-md px-4"
                >
                  Open Token Bridge
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
