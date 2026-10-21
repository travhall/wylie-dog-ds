import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import manifest from "@wyliedog/tokens/manifest.json";
import { getShowcaseMeta } from "@/lib/showcase-metadata";
import { contrastRatio, parseOklch, wcagLevel } from "@/lib/contrast";
import { SpacingDemo } from "./spacing-demo";
import { MotionPreview } from "./motion-preview";
import { SectionSubnav } from "@/components/section-subnav";

export default function TokensPage() {
  const meta = getShowcaseMeta();

  const composedSpacingTokens = [
    manifest.components.card["card-padding"],
    manifest.components.input["input-padding-x"],
  ].map((token) => `--space-${token.path.join("-")}: ${token.value}`);

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

  // Real blue ramp from the manifest; contrast is computed against white.
  // --color-primary-background-default resolves to blue-600 in both modes.
  const blue = manifest.primitives.colors.blue as Record<
    string,
    { value: string; variable: string }
  >;
  const brandRamp = ["50", "100", "300", "500", "600", "700", "900"].map(
    (step) => {
      const token = blue[step];
      // Contrast is computed against pure white on purpose; white is not a token.
      // eslint-disable-next-line no-restricted-syntax
      const ratio = contrastRatio(token.value, "oklch(1 0 0)");
      return {
        step,
        variable: token.variable,
        lightness: parseOklch(token.value)[0],
        ratio,
        level: wcagLevel(ratio),
        brand: step === "600",
      };
    }
  );

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-(--color-border-default)">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-(--color-border-default) px-3 py-1"
            style={{
              background:
                "color-mix(in oklch, var(--color-background-default) 60%, transparent)",
            }}
          >
            <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-muted)">
              02 · Tokens
            </span>
            <span className="text-(--color-foreground-faint)">·</span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
              Three-tiered System
            </span>
          </div>

          <div className="mt-5 grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-[5rem] font-semibold tracking-tight leading-[0.96] text-(--color-foreground-default)">
                The contract <br />
                <span
                  style={{ color: "var(--color-primary-background-default)" }}
                >
                  everything
                </span>{" "}
                renders against.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-(--color-foreground-muted) leading-relaxed">
                {meta.tokens.total.toLocaleString()} tokens organized in three
                tiers. Every color, every space, every curve in the system flows
                from this contract — and re-themes when it changes.
              </p>
            </div>

            <div className="lg:col-span-5">
              <dl className="grid grid-cols-3 rounded-xl border border-(--color-border-default) bg-(--color-background-default) overflow-hidden">
                {[
                  { label: "Primitives", value: meta.tokens.primitive },
                  { label: "Semantic", value: meta.tokens.semantic },
                  { label: "Component", value: meta.tokens.component },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className={`px-4 py-4 ${i < 2 ? "border-r border-(--color-border-default)" : ""}`}
                  >
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint)">
                      {s.label}
                    </dt>
                    <dd className="mt-1 font-serif text-2xl font-semibold text-(--color-foreground-default)">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 font-mono text-[11px] text-(--color-foreground-faint)">
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
                  tokenName: "--color-blue-600",
                  tokenVal: manifest.primitives.colors.blue["600"].value,
                  swatch: "var(--color-blue-600)",
                },
                {
                  tier: "Tier 02 · Semantic",
                  count: meta.tokens.semantic,
                  desc: "Roles. The contract every theme must satisfy.",
                  tokenName: "--color-primary-background-default",
                  tokenVal: "→ blue-600 (light and dark)",
                  swatch: "var(--color-primary-background-default)",
                },
                {
                  tier: "Tier 03 · Component",
                  count: meta.tokens.component,
                  desc: "Surfaces. The shape components consume.",
                  tokenName: "--color-button-primary-background",
                  tokenVal: "→ interactive-primary",
                  swatch: "var(--color-primary-background-default)",
                },
              ].map((tier, i) => (
                <div
                  key={tier.tier}
                  className={`relative rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5 ${i === 0 ? "lg:rounded-r-none lg:border-r-0" : i === 1 ? "lg:rounded-none" : "lg:rounded-l-none lg:border-l-0"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint)">
                      {tier.tier}
                    </span>
                    <span className="font-mono text-[10px] text-(--color-foreground-faint)">
                      {tier.count}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-(--color-foreground-muted)">
                    {tier.desc}
                  </p>
                  <div className="mt-4 rounded-lg border border-(--color-border-default) bg-(--color-background-subtle) p-3 font-mono text-[11px] leading-relaxed">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-sm shrink-0"
                        style={{ background: tier.swatch }}
                      />
                      <span className="text-(--color-foreground-muted) truncate">
                        {tier.tokenName}
                      </span>
                    </div>
                    <div className="mt-1 pl-5 text-(--color-foreground-faint) text-[10px]">
                      {tier.tokenVal}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint) shrink-0">
                Renders →
              </span>
              <Button>
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
              </Button>
              <span className="text-xs text-(--color-foreground-faint) hidden sm:inline">
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
        meta={`${meta.tokens.total.toLocaleString()} tokens · v${meta.versions.tokens}`}
      />

      {/* ── 01 · COLOR ── */}
      <section
        id="color"
        className="border-b border-(--color-border-default) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                01 · Color
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
                OKLCH means the ramp{" "}
                <span
                  style={{ color: "var(--color-primary-background-default)" }}
                >
                  is
                </span>{" "}
                the math.
              </h2>
              <p className="mt-3 text-(--color-foreground-muted) leading-relaxed">
                Lightness is a first-class axis, so steps move predictably. Mix
                safely, lighten without muddying, and pick a step by its
                measured contrast, shown below for the brand ramp.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border-default) bg-(--color-background-default) px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-muted)">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: "var(--color-success-foreground-subtle)",
                  }}
                />
                Contrast measured against white
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
            <div className="lg:col-span-8 rounded-xl border border-(--color-border-default) bg-(--color-background-default) overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-(--color-border-default)">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint)">
                      Acquisition · Q3 2026
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px]"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-success-foreground-subtle) 18%, transparent)",
                        color: "var(--color-success-foreground-subtle)",
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
                  <h3 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-(--color-foreground-default)">
                    Cohort retention
                  </h3>
                </div>
                <div className="hidden sm:flex items-center gap-1 rounded-md border border-(--color-border-default) bg-(--color-background-subtle) p-0.5">
                  {["Week", "Month", "Quarter"].map((t, i) => (
                    <Button
                      key={t}
                      variant="ghost"
                      size="sm"
                      className={`h-auto rounded px-2.5 py-1 text-xs font-medium ${
                        i === 0
                          ? "bg-(--color-background-default) text-(--color-foreground-default)"
                          : "text-(--color-foreground-faint)"
                      }`}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="px-6 pt-6 pb-4">
                <div className="flex">
                  <div
                    className="w-10 flex flex-col justify-between font-mono text-[10px] text-(--color-foreground-faint) pr-2 pt-1 pb-6 leading-none"
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
                          className="border-t border-(--color-border-default) opacity-50"
                          style={{ borderStyle: "dashed" }}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-end gap-1.5 px-1 pb-6">
                      {cohortBars.map((bar, wi) => (
                        <div
                          key={wi}
                          className="flex-1 h-full flex flex-col-reverse gap-px relative"
                        >
                          {bar.map((h, ci) => (
                            <div
                              key={ci}
                              className="rounded-sm"
                              style={{
                                height: `${h}%`,
                                background: [
                                  "var(--color-blue-900)",
                                  "var(--color-blue-600)",
                                  "var(--color-blue-400)",
                                  "var(--color-blue-200)",
                                ][ci],
                              }}
                            />
                          ))}
                          {wi === 6 && (
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-(--color-background-default) border border-(--color-border-default) px-2 py-1 text-[10px] font-mono shadow-md">
                              Wk 7 · 1,284
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="absolute left-0 right-0 bottom-0 flex justify-between px-1 font-mono text-[10px] text-(--color-foreground-faint)">
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
                              ? { color: "var(--color-foreground-default)" }
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

              <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-(--color-border-default)">
                {[
                  {
                    color: "var(--color-blue-900)",
                    label: "blue · 900",
                    name: "Direct",
                    pct: "42% of new users",
                  },
                  {
                    color: "var(--color-blue-600)",
                    label: "blue · 600",
                    name: "Referral",
                    pct: "28% of new users",
                  },
                  {
                    color: "var(--color-blue-400)",
                    label: "blue · 400",
                    name: "Search",
                    pct: "21% of new users",
                  },
                  {
                    color: "var(--color-blue-200)",
                    label: "blue · 200",
                    name: "Social",
                    pct: "9% of new users",
                  },
                ].map((c, i) => (
                  <div
                    key={c.name}
                    className={`px-5 py-4 ${i < 3 ? "sm:border-r border-(--color-border-default)" : ""} ${i >= 2 ? "border-t sm:border-t-0 border-(--color-border-default)" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ background: c.color }}
                      />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint)">
                        {c.label}
                      </span>
                    </div>
                    <p className="mt-1 font-serif text-xl font-semibold leading-none text-(--color-foreground-default)">
                      {c.name}
                    </p>
                    <p className="mt-1 text-[11px] text-(--color-foreground-faint)">
                      {c.pct}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand ramp + semantic states */}
            <div className="lg:col-span-4 space-y-3">
              <div className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                    brand ramp · blue
                  </p>
                  <span className="font-mono text-[10px] text-(--color-foreground-faint)">
                    contrast vs white
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
                                "color-mix(in oklch, var(--color-primary-background-default) 8%, transparent)",
                            }
                          : undefined
                      }
                    >
                      <div
                        className="h-7 w-7 rounded-md shrink-0"
                        style={{
                          background: r.variable,
                          ...(r.brand
                            ? {
                                outline:
                                  "2px solid var(--color-primary-background-default)",
                                outlineOffset: "2px",
                              }
                            : {}),
                        }}
                      />
                      <span
                        className={`font-mono text-[10px] w-8 shrink-0 ${r.brand ? "font-semibold text-(--color-foreground-default)" : "text-(--color-foreground-faint)"}`}
                      >
                        {r.step}
                      </span>
                      <span
                        className={`font-mono text-[10px] ${r.brand ? "text-(--color-foreground-default)" : "text-(--color-foreground-faint)"}`}
                      >
                        {(r.lightness * 100).toFixed(1)}% L
                        {r.brand ? " · brand" : ""}
                      </span>
                      <span className="ml-auto font-mono text-[10px]">
                        {r.level ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5"
                            style={{
                              background:
                                "color-mix(in oklch, var(--color-success-foreground-subtle) 18%, transparent)",
                              color: "var(--color-success-foreground-subtle)",
                            }}
                          >
                            {r.level} · {r.ratio.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-(--color-foreground-faint)">
                            {r.ratio.toFixed(2)} : 1
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                  semantic states
                </p>
                <div className="mt-3 space-y-1.5">
                  {[
                    {
                      color: "var(--color-success-foreground-subtle)",
                      label: "Deployment succeeded",
                      token: "--color-success-foreground-subtle",
                      icon: <path d="m5 12 5 5L20 7" />,
                    },
                    {
                      color: "var(--color-warning-foreground-subtle)",
                      label: "Quota approaching limit",
                      token: "--color-warning-foreground-subtle",
                      icon: <path d="M12 8v5M12 16v.01" />,
                    },
                    {
                      color: "var(--color-danger-foreground-subtle)",
                      label: "Build failed · 2 errors",
                      token: "--color-danger-foreground-subtle",
                      icon: <path d="M18 6 6 18M6 6l12 12" />,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-2.5 rounded-md border border-(--color-border-default) px-3 py-2"
                    >
                      <span
                        className="grid h-5 w-5 place-items-center rounded-full shrink-0"
                        style={{
                          background: s.color,
                          color: "var(--color-inverse-foreground-default)",
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
                        <p className="font-medium text-(--color-foreground-default)">
                          {s.label}
                        </p>
                        <p className="font-mono text-[10px] text-(--color-foreground-faint)">
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
        className="border-b border-(--color-border-default) bg-(--color-background-subtle) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                02 · Typography
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
                A pairing that ships{" "}
                <span
                  style={{ color: "var(--color-primary-background-default)" }}
                >
                  long-form
                </span>
                , dashboards, and code.
              </h2>
              <p className="mt-3 text-(--color-foreground-muted) leading-relaxed">
                Besley for editorial moments. Manrope for everything else.
                JetBrains Mono for code and labels.{" "}
                {Object.keys(manifest.primitives.typography.size).length} sizes,{" "}
                {Object.keys(manifest.primitives.typography.weight).length}{" "}
                weights,{" "}
                {Object.keys(manifest.primitives.typography.family).length}{" "}
                families.
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
            <article className="lg:col-span-8 rounded-xl border border-(--color-border-default) bg-(--color-background-default) overflow-hidden">
              <div className="flex items-center justify-between px-8 py-3 border-b border-(--color-border-default) bg-(--color-background-subtle)">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint)">
                  <span>Wylie Dog Field Notes</span>
                  <span>·</span>
                  <span>Issue 14</span>
                </div>
                <span className="font-mono text-[10px] text-(--color-foreground-faint)">
                  8 min read
                </span>
              </div>
              <div className="px-8 py-10 lg:px-12 lg:py-12">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-foreground-faint)">
                  Engineering · April 2026
                </p>
                <h3 className="mt-5 font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.02] text-(--color-foreground-default)">
                  Why we rebuilt the entire color system in a week.
                </h3>
                <p className="mt-5 font-serif text-xl text-(--color-foreground-muted) leading-snug max-w-2xl">
                  Ten months of hex codes, three product redesigns, and one
                  paint-bucket migration later — here is what an OKLCH-native
                  token system actually buys you.
                </p>
                <div className="mt-6 flex items-center gap-3 py-4 border-t border-b border-(--color-border-default)">
                  <div
                    className="h-8 w-8 rounded-full grid place-items-center font-semibold text-xs"
                    style={{
                      background: "var(--color-blue-300)",
                      color: "var(--color-blue-950)",
                    }}
                  >
                    EM
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--color-foreground-default)">
                      Elena Mori
                    </p>
                    <p className="text-xs text-(--color-foreground-faint)">
                      Lead, Design Systems · 10 May 2026
                    </p>
                  </div>
                  <span
                    className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      background:
                        "color-mix(in oklch, var(--color-primary-background-default) 12%, transparent)",
                      color: "var(--color-primary-background-default)",
                    }}
                  >
                    Engineering
                  </span>
                </div>
                <p className="mt-6 text-base text-(--color-foreground-muted) leading-relaxed">
                  Every design system eventually hits the same wall: your color
                  ramp made sense when it was just a handful of HEX values, but
                  somewhere between the third palette expansion and the dark
                  mode sprint, the math stopped working.
                </p>
                <p className="mt-4 text-base text-(--color-foreground-muted) leading-relaxed">
                  OKLCH fixes this because perceptual lightness is a first-class
                  axis. When you step from{" "}
                  <code className="font-mono text-sm px-1 py-0.5 rounded bg-(--color-background-subtle) text-(--color-foreground-default)">
                    {manifest.primitives.colors.blue["600"].value}
                  </code>{" "}
                  to{" "}
                  <code className="font-mono text-sm px-1 py-0.5 rounded bg-(--color-background-subtle) text-(--color-foreground-default)">
                    {manifest.primitives.colors.blue["900"].value}
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
                      cls: "font-serif text-2xl font-semibold text-(--color-foreground-default)",
                    },
                    {
                      text: "Italic emphasis",
                      cls: "font-serif text-base italic text-(--color-foreground-muted)",
                    },
                  ],
                },
                {
                  label: "Sans — Manrope",
                  samples: [
                    {
                      text: "Body text, readable",
                      cls: "font-sans text-base font-medium text-(--color-foreground-default)",
                    },
                    {
                      text: "Secondary label",
                      cls: "font-sans text-sm text-(--color-foreground-muted)",
                    },
                  ],
                },
                {
                  label: "Mono — JetBrains",
                  samples: [
                    {
                      text: "--token-name: value",
                      cls: "font-mono text-sm text-(--color-foreground-default)",
                    },
                    {
                      text: "Code, labels",
                      cls: "font-mono text-xs text-(--color-foreground-faint)",
                    },
                  ],
                },
              ].map((group) => (
                <div
                  key={group.label}
                  className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint) mb-3">
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
        className="border-b border-(--color-border-default) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                03 · Spacing
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
                One scale. Three densities.{" "}
                <span
                  style={{ color: "var(--color-primary-background-default)" }}
                >
                  Same data.
                </span>
              </h2>
              <p className="mt-3 text-(--color-foreground-muted) leading-relaxed">
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
                All {Object.keys(manifest.primitives.spacing).length} spacing
                tokens →
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-3">
            <div className="lg:col-span-8">
              <SpacingDemo />
            </div>

            {/* Spacing scale panel */}
            <div className="lg:col-span-4 rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint) mb-4">
                Scale · --space-*
              </p>
              <div className="space-y-2">
                {[
                  { step: "050", px: 4 },
                  { step: "100", px: 8 },
                  { step: "150", px: 12 },
                  { step: "200", px: 16, inUse: true },
                  { step: "300", px: 24 },
                  { step: "400", px: 32 },
                  { step: "500", px: 40 },
                  { step: "600", px: 48 },
                  { step: "700", px: 64 },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`flex items-center gap-3 rounded-md ${s.inUse ? "px-2 py-1 -mx-2" : ""}`}
                    style={
                      s.inUse
                        ? {
                            background:
                              "color-mix(in oklch, var(--color-primary-background-default) 8%, transparent)",
                          }
                        : undefined
                    }
                  >
                    <span className="font-mono text-[10px] w-4 text-(--color-foreground-faint) shrink-0">
                      {s.step}
                    </span>
                    <div
                      className="relative"
                      style={{ height: "8px", width: "120px" }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 origin-left rounded-sm w-full"
                        style={{
                          background: s.inUse
                            ? "var(--color-primary-background-default)"
                            : "var(--color-border-default)",
                          transform: `scaleX(${Math.min(s.px * 2.5, 120) / 120})`,
                          transition: "transform 0.2s",
                        }}
                      />
                    </div>
                    <span
                      className="font-mono text-[10px] ml-auto shrink-0"
                      style={{
                        color: s.inUse
                          ? "var(--color-primary-background-default)"
                          : "var(--color-foreground-faint)",
                      }}
                    >
                      {s.px}px{s.inUse ? " · in use" : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-(--color-border-default) space-y-1 font-mono text-[10px] text-(--color-foreground-faint)">
                <p className="text-(--color-foreground-muted) mb-2">
                  Composed tokens
                </p>
                {composedSpacingTokens.map((t) => (
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
        className="border-b border-(--color-border-default) bg-(--color-background-subtle) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                04 · Radius
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
                Five corners.{" "}
                <span
                  style={{ color: "var(--color-primary-background-default)" }}
                >
                  Every surface
                </span>{" "}
                already knows which.
              </h2>
              <p className="mt-3 text-(--color-foreground-muted) leading-relaxed">
                Radius isn&apos;t a design decision at use-time — it&apos;s
                encoded in the token. Every component surface resolves to its
                semantic radius automatically.
              </p>
            </div>
            <Link href="/tokens/borders">
              <Button
                variant="outline"
                size="sm"
                className="rounded-md shrink-0"
              >
                All{" "}
                {Object.keys(manifest.primitives.borderRadius).length +
                  Object.keys(manifest.primitives.borderWidth).length}{" "}
                radius and border tokens →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                step: "sm",
                px: "2px",
                surface: "Tags & chips",
                token: "--border-radius-sm",
                preview: (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {["Design", "Systems", "OKLCH"].map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 text-[11px] font-mono border border-(--color-border-default) text-(--color-foreground-muted)"
                        style={{ borderRadius: "var(--border-radius-sm)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ),
              },
              {
                step: "md",
                px: "4px",
                surface: "Buttons & inputs",
                token: "--border-radius-md",
                preview: (
                  <Button
                    size="sm"
                    style={{ borderRadius: "var(--border-radius-md)" }}
                  >
                    Continue
                  </Button>
                ),
              },
              {
                step: "lg",
                px: "8px",
                surface: "Menus & popovers",
                token: "--border-radius-lg",
                preview: (
                  <div
                    className="border border-(--color-border-default) bg-(--color-background-default) w-full shadow-sm text-sm"
                    style={{
                      borderRadius: "var(--border-radius-lg)",
                      overflow: "hidden",
                    }}
                  >
                    {["Edit", "Duplicate", "Archive"].map((item, i) => (
                      <div
                        key={item}
                        className={`px-3 py-2 text-(--color-foreground-muted) text-xs ${i < 2 ? "border-b border-(--color-border-default)" : ""} ${i === 0 ? "text-(--color-foreground-default)" : ""}`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                step: "xl",
                px: "12px",
                surface: "Cards & tiles",
                token: "--border-radius-xl",
                preview: (
                  <div
                    className="border border-(--color-border-default) bg-(--color-background-default) p-3 w-full"
                    style={{ borderRadius: "var(--border-radius-xl)" }}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-wider text-(--color-foreground-faint)">
                      Pro plan
                    </p>
                    <p className="font-serif text-lg font-semibold text-(--color-foreground-default) mt-0.5">
                      $49
                      <span className="text-sm font-sans font-normal text-(--color-foreground-faint)">
                        /mo
                      </span>
                    </p>
                    <div className="mt-2 rounded-full h-1.5 bg-(--color-border-default) overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "68%",
                          background: "var(--color-primary-background-default)",
                        }}
                      />
                    </div>
                    <p className="font-mono text-[9px] text-(--color-foreground-faint) mt-1">
                      68% of limit used
                    </p>
                  </div>
                ),
              },
              {
                step: "2xl",
                px: "16px",
                surface: "Modals & sheets",
                token: "--border-radius-2xl",
                preview: (
                  <div
                    className="border border-(--color-border-default) bg-(--color-background-default) p-3 w-full shadow-md"
                    style={{ borderRadius: "var(--border-radius-2xl)" }}
                  >
                    <p className="text-sm font-semibold text-(--color-foreground-default) mb-2">
                      Invite teammate
                    </p>
                    <div
                      className="rounded-md border border-(--color-border-default) bg-(--color-background-subtle) px-2.5 py-1.5 text-xs text-(--color-foreground-faint) mb-2"
                      style={{ borderRadius: "var(--border-radius-lg)" }}
                    >
                      name@company.com
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        style={{ borderRadius: "var(--border-radius-lg)" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        style={{ borderRadius: "var(--border-radius-lg)" }}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                ),
              },
            ].map((r) => (
              <div
                key={r.step}
                className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5 flex flex-col"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <span className="font-semibold text-(--color-foreground-default)">
                    {r.step}
                  </span>
                  <span className="font-mono text-[10px] text-(--color-foreground-faint)">
                    {r.px}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center py-4">
                  {r.preview}
                </div>
                <div className="mt-4 pt-4 border-t border-(--color-border-default)">
                  <p className="text-xs text-(--color-foreground-muted)">
                    {r.surface}
                  </p>
                  <p className="font-mono text-[10px] text-(--color-foreground-faint) mt-0.5">
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
        className="border-b border-(--color-border-default) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                05 · Elevation
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
                {Object.keys(manifest.semantics.shadow).length} shadow steps —{" "}
                <span
                  style={{ color: "var(--color-primary-background-default)" }}
                >
                  one
                </span>{" "}
                stacking story.
              </h2>
              <p className="mt-3 text-(--color-foreground-muted) leading-relaxed">
                Each step encodes both a shadow value and a semantic z-axis
                role. The scene below reflects honest stacking order.
              </p>
            </div>
            <Link href="/tokens/elevation">
              <Button
                variant="outline"
                size="sm"
                className="rounded-md shrink-0"
              >
                All {Object.keys(manifest.semantics.shadow).length} shadow
                tokens →
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-3">
            {/* Layered scene */}
            <div
              className="lg:col-span-8 rounded-xl border border-(--color-border-default) bg-(--color-background-subtle) overflow-hidden relative grid-bg"
              style={{ minHeight: "480px" }}
            >
              <div
                className="relative w-full h-full p-8"
                style={{ minHeight: "480px" }}
              >
                {/* Base card */}
                <div className="absolute top-10 left-8 w-56 rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-4 shadow-sm">
                  <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-(--color-foreground-muted)">
                    xs · base
                  </div>
                  <p className="font-mono text-[10px] text-(--color-foreground-faint)">
                    packages/ui
                  </p>
                  <p className="font-semibold text-sm text-(--color-foreground-default) mt-1">
                    Button.tsx
                  </p>
                  <div
                    className="mt-2 h-1 rounded-full"
                    style={{
                      background: "var(--color-primary-background-default)",
                      width: "60%",
                    }}
                  />
                </div>
                {/* Popover */}
                <div
                  className="absolute top-8 left-52 w-48 rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-3"
                  style={{ boxShadow: "var(--shadow-md)" }}
                >
                  <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-(--color-foreground-muted)">
                    md · popover
                  </div>
                  {["View changelog", "Copy token", "Open in Figma"].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`px-2 py-1.5 text-xs rounded-md text-(--color-foreground-muted) ${i === 0 ? "bg-(--color-background-subtle) text-(--color-foreground-default)" : ""}`}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
                {/* Toast */}
                <div
                  className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64 rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-3 flex items-center gap-3"
                  style={{ boxShadow: "var(--shadow-lg)" }}
                >
                  <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-(--color-foreground-muted)">
                    lg · toast
                  </div>
                  <span
                    className="h-6 w-6 rounded-full grid place-items-center shrink-0"
                    style={{
                      background: "var(--color-success-foreground-subtle)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 text-(--color-inverse-foreground-default)"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  </span>
                  <p className="text-xs font-medium text-(--color-foreground-default)">
                    Tokens published · v1.4.1
                  </p>
                </div>
                {/* Modal */}
                <div
                  className="absolute bottom-8 right-8 w-56 rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-4"
                  style={{ boxShadow: "var(--shadow-xl)" }}
                >
                  <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-(--color-foreground-muted)">
                    xl · modal
                  </div>
                  <p className="text-sm font-semibold text-(--color-foreground-default) mb-3">
                    Invite teammate
                  </p>
                  <div className="rounded-md border border-(--color-border-default) bg-(--color-background-subtle) px-2.5 py-1.5 text-xs text-(--color-foreground-faint) mb-2">
                    name@company.com
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="flex-1">
                      Cancel
                    </Button>
                    <Button size="sm" className="flex-1">
                      Send invite
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Elevation ladder */}
            <div className="lg:col-span-4 rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint) mb-4">
                Elevation ladder
              </p>
              <div className="space-y-3">
                {[
                  {
                    level: "xs · base",
                    shadow: "0 1px 3px rgba(0,0,0,.08)",
                    role: "Cards, panels",
                    token: "--shadow-base",
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
                      className="h-8 w-8 rounded-lg border border-(--color-border-default) bg-(--color-background-default) shrink-0"
                      style={{ boxShadow: e.shadow }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] text-(--color-foreground-default)">
                        {e.level}
                      </p>
                      <p className="text-[11px] text-(--color-foreground-faint)">
                        {e.role}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-(--color-foreground-faint) shrink-0">
                      {e.token}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 pt-4 border-t border-(--color-border-default) text-[11px] text-(--color-foreground-faint) leading-relaxed">
                Dark mode redefines the same shadow tokens with higher opacity
                (0.3 to 0.4 instead of 0.05 to 0.1).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 06 · MOTION ── */}
      <section
        id="motion"
        className="border-b border-(--color-border-default) bg-(--color-background-subtle) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                06 · Motion
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
                {Object.keys(manifest.semantics.easing).length} curves and{" "}
                {Object.keys(manifest.semantics.duration).length} durations{" "}
                <span
                  style={{ color: "var(--color-primary-background-default)" }}
                >
                  cover everything.
                </span>
              </h2>
              <p className="mt-3 text-(--color-foreground-muted) leading-relaxed">
                A default curve for most transitions, ease-out (decelerate) for
                entrances, ease-in (accelerate) for exits, and ease-in-out for
                symmetric moves. Pick a duration from the scale — the curve does
                the rest.
              </p>
            </div>
            <Link href="/tokens/motion">
              <Button
                variant="outline"
                size="sm"
                className="rounded-md shrink-0"
              >
                All{" "}
                {Object.keys(manifest.semantics.easing).length +
                  Object.keys(manifest.semantics.duration).length +
                  Object.keys(manifest.primitives.duration).length}{" "}
                motion tokens →
              </Button>
            </Link>
          </div>

          <MotionPreview />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-b border-(--color-border-default)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="glass rounded-2xl p-8 lg:p-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <div className="flex-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight">
                Ready to wire tokens into your codebase?
              </h2>
              <p className="mt-2 text-(--color-foreground-muted) max-w-xl">
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
