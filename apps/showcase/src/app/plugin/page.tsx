import Link from "next/link";
import { Button, buttonVariants } from "@wyliedog/ui/button";
import { getShowcaseMeta } from "@/lib/showcase-metadata";

export default function PluginPage() {
  const meta = getShowcaseMeta();
  const steps = [
    {
      num: "01",
      label: "JSON source",
      desc: `All ${meta.tokens.total} design tokens live in a single source-of-truth JSON file inside the monorepo — color, type, spacing, radius, elevation, and motion. Every token is OKLCH, every value is intentional.`,
      right: (
        <div className="rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) p-4 font-mono text-xs leading-relaxed text-(--color-text-secondary) overflow-hidden">
          <div className="text-(--color-text-tertiary) mb-2">
            packages/tokens/tokens.json
          </div>
          <div>
            <span className="text-(--color-text-primary)">"color"</span>: {"{"}
          </div>
          <div className="pl-4">
            <span className="text-(--color-text-primary)">"interactive"</span>:{" "}
            {"{"}
          </div>
          <div className="pl-8">
            <span className="text-(--color-text-primary)">"primary"</span>:{" "}
            <span style={{ color: "var(--color-interactive-primary)" }}>
              "oklch(0.54 0.18 274)"
            </span>
          </div>
          <div className="pl-8">
            <span className="text-(--color-text-primary)">"primary-hover"</span>
            :{" "}
            <span style={{ color: "var(--color-interactive-primary)" }}>
              "oklch(0.50 0.18 274)"
            </span>
          </div>
          <div className="pl-4">{"}"}</div>
          <div className="pl-4 text-(--color-text-tertiary)">
            … {meta.tokenSubcategories.colors - 1} more color tokens
          </div>
          <div>{"}"}</div>
        </div>
      ),
    },
    {
      num: "02",
      label: "Trigger the sync",
      desc: "One command reads the token JSON, transforms every value, and opens a connection to the Figma Variables API. No browser plugins, no manual copy-paste, no export steps.",
      right: (
        <div className="rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) overflow-hidden">
          <div className="flex items-center gap-2 border-b border-(--color-border-primary) px-3 py-2 bg-(--color-background-secondary)">
            <div className="flex gap-1">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: "oklch(0.65 0.18 29)" }}
              />
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: "oklch(0.75 0.17 85)" }}
              />
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: "oklch(0.72 0.18 145)" }}
              />
            </div>
            <span className="font-mono text-[10px] text-(--color-text-tertiary)">
              Terminal
            </span>
          </div>
          <div className="p-4 font-mono text-xs text-(--color-text-secondary) space-y-1">
            <div>
              <span className="text-(--color-text-tertiary)">$</span>{" "}
              <span className="text-(--color-text-primary)">
                pnpm sync:figma
              </span>
            </div>
            <div className="text-(--color-text-tertiary)">
              ✓ Loaded {meta.tokens.total} tokens from tokens.json
            </div>
            <div className="text-(--color-text-tertiary)">
              ✓ Connected to Figma Variables API
            </div>
            <div className="text-(--color-text-tertiary)">
              ✓ Mapped {meta.tokenSubcategories.colors} color tokens
            </div>
            <div className="text-(--color-text-tertiary)">
              ✓ Syncing Light + Dark modes…
            </div>
            <div style={{ color: "var(--color-interactive-primary)" }}>
              ✓ Done in 2.1s · {meta.tokens.total}/{meta.tokens.total} synced
            </div>
          </div>
        </div>
      ),
    },
    {
      num: "03",
      label: "Map CSS → Figma hierarchy",
      desc: "Token Bridge translates the flat CSS variable namespace into Figma's three-tier collection structure: Primitives, Semantic, and Components. The mapping is deterministic — no manual configuration.",
      right: (
        <div className="rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) p-4 space-y-2">
          {[
            {
              tier: "P",
              label: "Primitives",
              count: String(meta.tokens.primitive),
              desc: "Raw OKLCH values",
              color: "oklch(0.72 0.15 75)",
            },
            {
              tier: "S",
              label: "Semantic",
              count: String(meta.tokens.semantic),
              desc: "Role-based aliases",
              color: "var(--color-interactive-primary)",
            },
            {
              tier: "C",
              label: "Components",
              count: String(meta.tokens.component),
              desc: "Component-scoped",
              color: "oklch(0.60 0.14 155)",
            },
          ].map((t) => (
            <div key={t.tier} className="flex items-center gap-3">
              <span
                className="h-7 w-7 rounded-md font-mono text-[11px] font-bold flex items-center justify-center shrink-0"
                style={{
                  background: t.color,
                  color: "var(--color-text-on-solid)",
                }}
              >
                {t.tier}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-(--color-text-primary)">
                  {t.label}{" "}
                  <span className="text-(--color-text-tertiary)">
                    · {t.count} tokens
                  </span>
                </div>
                <div className="text-[11px] text-(--color-text-tertiary)">
                  {t.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      num: "04",
      label: "Light + dark modes",
      desc: "Token Bridge writes both modes in a single pass. Every color token gets a Light value and a Dark value. Figma's mode switching reflects your code's theme switching exactly.",
      right: (
        <div className="rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) overflow-hidden text-xs font-mono">
          <div className="grid grid-cols-3 text-[10px] text-(--color-text-tertiary) border-b border-(--color-border-primary)">
            <div className="px-3 py-2">Token</div>
            <div className="px-3 py-2 border-l border-(--color-border-primary)">
              Light
            </div>
            <div className="px-3 py-2 border-l border-(--color-border-primary)">
              Dark
            </div>
          </div>
          {[
            {
              token: "--color-bg-primary",
              light: "oklch(1 0 0)",
              dark: "oklch(0.13 0.01 274)",
            },
            {
              token: "--color-text-primary",
              light: "oklch(0.15 0.01 274)",
              dark: "oklch(0.97 0.004 274)",
            },
            {
              token: "--color-border",
              light: "oklch(0.88 0.008 274)",
              dark: "oklch(0.26 0.01 274)",
            },
          ].map((row) => (
            <div
              key={row.token}
              className="grid grid-cols-3 border-b border-(--color-border-primary) last:border-0 text-[10px]"
            >
              <div className="px-3 py-2 text-(--color-text-primary) truncate">
                {row.token}
              </div>
              <div className="px-3 py-2 border-l border-(--color-border-primary) text-(--color-text-secondary)">
                {row.light}
              </div>
              <div className="px-3 py-2 border-l border-(--color-border-primary) text-(--color-text-secondary)">
                {row.dark}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      num: "05",
      label: "Propagate to components",
      desc: "Once Figma Variables are updated, every component in the Figma library that references those variables reflects the new values instantly — no relinking, no frame-by-frame updates.",
      right: (
        <div className="rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) p-4">
          <div className="text-[10px] text-(--color-text-tertiary) font-mono uppercase tracking-wider mb-3">
            Button · Primary
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-[10px] text-(--color-text-tertiary) mb-2">
                Before
              </div>
              <Button
                className="text-xs"
                style={{ background: "oklch(0.58 0.18 274)" }}
              >
                Get started
              </Button>
            </div>
            <div className="text-(--color-text-tertiary)">→</div>
            <div className="text-center">
              <div className="text-[10px] text-(--color-text-tertiary) mb-2">
                After
              </div>
              <Button
                className="text-xs"
                style={{ background: "oklch(0.54 0.18 274)" }}
              >
                Get started
              </Button>
            </div>
            <div className="flex-1 text-[10px] text-(--color-text-tertiary) leading-relaxed">
              Token updated from{" "}
              <code className="text-(--color-text-secondary)">0.58</code> →{" "}
              <code className="text-(--color-text-secondary)">0.54</code>{" "}
              lightness. Propagated to all {meta.tokens.component}{" "}
              component-scoped references.
            </div>
          </div>
        </div>
      ),
    },
  ];

  const syncs = [
    {
      category: "Color",
      count: meta.tokenSubcategories.colors,
      modes: 2,
      note: "OKLCH · P3 wide gamut",
    },
    {
      category: "Typography",
      count: meta.tokenSubcategories.typography,
      modes: 1,
      note: "Family, size, weight, line-height",
    },
    {
      category: "Spacing",
      count: meta.tokenSubcategories.spacing,
      modes: 1,
      note: "4px base grid",
    },
    {
      category: "Radius",
      count: meta.tokenSubcategories.radii,
      modes: 1,
      note: "None → full",
    },
    {
      category: "Elevation",
      count: meta.tokenSubcategories.shadows,
      modes: 2,
      note: "Shadow scale · light + dark",
    },
    {
      category: "Motion",
      count: meta.tokenSubcategories.motion,
      modes: 1,
      note: "Duration + easing",
    },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-(--color-border-primary)">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: messaging */}
            <div className="md:col-span-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-(--color-border-primary) bg-(--color-background-primary)/60 px-3 py-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-secondary)">
                  05 · Token Bridge
                </span>
                <span className="text-(--color-text-tertiary)">·</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                  v{meta.versions.plugin} · beta
                </span>
              </div>

              <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-[4.5rem] font-semibold text-(--color-text-primary) tracking-tight leading-[0.98]">
                One source of truth.{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  No manual handoff.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg text-(--color-text-secondary)">
                Token Bridge syncs{" "}
                <code className="font-mono text-base">@wyliedog/tokens</code> to
                Figma Variables — so design references the same contract as
                code. When a value moves in the repo, the next sync moves Figma
                with it.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="#install" className={buttonVariants({ size: "lg" })}>
                  Get started
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
                <Link
                  href="/tokens"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  View token reference
                </Link>
              </div>

              {/* Command hint */}
              <div className="mt-8 inline-flex items-center gap-3 rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) px-3 py-2">
                <span className="font-mono text-xs text-(--color-text-tertiary)">
                  $
                </span>
                <span className="font-mono text-xs text-(--color-text-primary)">
                  pnpm sync:figma
                </span>
                <span className="text-(--color-text-tertiary)">·</span>
                <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                  2.1s · {meta.tokens.total} variables
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[10px]"
                  style={{
                    background:
                      "color-mix(in oklch, var(--color-success) 18%, transparent)",
                    color: "var(--color-success)",
                  }}
                >
                  <span className="h-1 w-1 rounded-full bg-current" />
                  synced
                </span>
              </div>
            </div>

            {/* Right: Live Pipeline visualization */}
            <div className="md:col-span-6">
              <div className="relative">
                {/* Live badge */}
                <div className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 glass-dark rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
                  <span className="relative flex h-1.5 w-1.5">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                      style={{ background: "var(--color-success)" }}
                    />
                    <span
                      className="relative h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--color-success)" }}
                    />
                  </span>
                  Live pipeline
                </div>

                <div className="glass rounded-2xl p-5 sm:p-6">
                  {/* 3-node diagram */}
                  <div className="grid grid-cols-3 gap-3 items-stretch">
                    {/* Node 1: tokens source */}
                    <div className="rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) p-3">
                      <p className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                        source
                      </p>
                      <p className="mt-1 font-mono text-[11px] font-semibold text-(--color-text-primary) break-all">
                        @wyliedog/
                        <wbr />
                        tokens
                      </p>
                      <p className="font-mono text-[9px] text-(--color-text-tertiary) mt-0.5">
                        v1.4.0
                      </p>
                      <div className="mt-2.5 space-y-1">
                        {[
                          {
                            swatch: "oklch(0.54 0.18 274)",
                            label: "--color-interactive",
                          },
                          {
                            swatch: "var(--color-success)",
                            label: "--color-success",
                          },
                          {
                            swatch: "var(--color-warning)",
                            label: "--color-warning",
                          },
                        ].map(({ swatch, label }) => (
                          <div
                            key={label}
                            className="flex items-center gap-1.5"
                          >
                            <span
                              className="h-2 w-2 rounded-sm shrink-0"
                              style={{ background: swatch }}
                            />
                            <span className="font-mono text-[9px] text-(--color-text-secondary) truncate">
                              {label}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-sm shrink-0 border border-(--color-border-primary)" />
                          <span className="font-mono text-[9px] text-(--color-text-tertiary)">
                            +183 more
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Node 2: bridge (emphasized) */}
                    <div
                      className="relative rounded-lg border-2 p-3"
                      style={{
                        borderColor: "var(--color-interactive-primary)",
                        background:
                          "color-mix(in oklch, var(--color-interactive-primary) 6%, var(--color-background-primary))",
                      }}
                    >
                      <p
                        className="font-mono text-[9px] uppercase tracking-wider"
                        style={{ color: "var(--color-interactive-primary)" }}
                      >
                        transform
                      </p>
                      <p className="mt-1 font-mono text-[11px] font-semibold text-(--color-text-primary)">
                        Token Bridge
                      </p>
                      <p className="font-mono text-[9px] text-(--color-text-tertiary) mt-0.5">
                        v0.9.2
                      </p>
                      <div className="mt-2.5 space-y-1.5">
                        <div
                          className="h-1 rounded-full overflow-hidden"
                          style={{
                            background:
                              "color-mix(in oklch, var(--color-interactive-primary) 18%, transparent)",
                          }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: "92%",
                              background: "var(--color-interactive-primary)",
                            }}
                          />
                        </div>
                        <p className="font-mono text-[9px] text-(--color-text-secondary)">
                          Mapping … {Math.round(meta.tokens.total * 0.92)}/
                          {meta.tokens.total}
                        </p>
                        <div className="grid grid-cols-3 gap-0.5">
                          <span
                            className="h-0.5 rounded-full"
                            style={{
                              background: "var(--color-interactive-primary)",
                            }}
                          />
                          <span
                            className="h-0.5 rounded-full"
                            style={{
                              background: "var(--color-interactive-primary)",
                            }}
                          />
                          <span
                            className="h-0.5 rounded-full"
                            style={{
                              background:
                                "color-mix(in oklch, var(--color-interactive-primary) 30%, transparent)",
                            }}
                          />
                        </div>
                      </div>
                      {/* outbound arrow circle */}
                      <span
                        className="absolute -right-4.5 top-1/2 -translate-y-1/2 z-10 grid h-4 w-4 place-items-center rounded-full"
                        style={{
                          background: "var(--color-interactive-primary)",
                          color: "var(--color-text-on-solid)",
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-2.5 w-2.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path d="M5 12h12M13 7l5 5-5 5" />
                        </svg>
                      </span>
                    </div>

                    {/* Node 3: figma target */}
                    <div className="rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) p-3">
                      <p className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                        target
                      </p>
                      <p className="mt-1 font-mono text-[11px] font-semibold text-(--color-text-primary)">
                        Figma Variables
                      </p>
                      <p className="font-mono text-[9px] text-(--color-text-tertiary) mt-0.5">
                        Wylie Dog · UI
                      </p>
                      <div className="mt-2.5 space-y-1">
                        {[
                          {
                            label: "Primitives",
                            count: String(meta.tokens.primitive),
                          },
                          {
                            label: "Semantic",
                            count: String(meta.tokens.semantic),
                          },
                          {
                            label: "Components",
                            count: String(meta.tokens.component),
                          },
                        ].map(({ label, count }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between font-mono text-[9px]"
                          >
                            <span className="text-(--color-text-secondary)">
                              {label}
                            </span>
                            <span className="text-(--color-text-tertiary)">
                              {count}
                            </span>
                          </div>
                        ))}
                        <div className="mt-1 pt-1 border-t border-(--color-border-primary) flex items-center justify-between font-mono text-[9px]">
                          <span style={{ color: "var(--color-success)" }}>
                            ● synced
                          </span>
                          <span className="text-(--color-text-tertiary)">
                            4s ago
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mode strip */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[
                      { icon: "sun", label: "Light mode" },
                      { icon: "moon", label: "Dark mode" },
                    ].map(({ icon, label }) => (
                      <div
                        key={label}
                        className="rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) px-3 py-2 flex items-center gap-2"
                      >
                        {icon === "sun" ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5 text-(--color-text-secondary) shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5 text-(--color-text-secondary) shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                          </svg>
                        )}
                        <span className="text-xs text-(--color-text-secondary)">
                          {label}
                        </span>
                        <span className="ml-auto font-mono text-[10px] text-(--color-text-tertiary)">
                          {meta.tokens.total} vars
                        </span>
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: "var(--color-success)" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-b border-(--color-border-primary) bg-(--color-background-primary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-(--color-border-primary)">
            {[
              { value: String(meta.tokens.total), label: "Variables synced" },
              { value: "2.1s", label: "Avg sync time" },
              { value: "0", label: "Manual handoffs" },
              { value: "none", label: "Drift" },
            ].map((stat) => (
              <div key={stat.label} className="px-8 first:pl-0 last:pr-0 py-2">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary) mb-1">
                  {stat.label}
                </dt>
                <dd className="font-serif text-3xl font-semibold text-(--color-text-primary)">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Five steps ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline gap-4 mb-16">
            <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
              How it works
            </span>
            <div className="flex-1 h-px bg-(--color-border-primary)" />
            <span className="font-mono text-[10px] text-(--color-text-tertiary)">
              Five steps from JSON to Figma
            </span>
          </div>

          <div className="space-y-16">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
              >
                {/* Left */}
                <div>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                      {step.num}
                    </span>
                    <div className="h-px w-8 bg-(--color-border-primary)" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-(--color-text-primary) mb-3">
                    {step.label}
                  </h3>
                  <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {/* Right */}
                <div>{step.right}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What syncs ── */}
      <section className="py-24 bg-(--color-background-secondary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline gap-4 mb-12">
            <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
              What syncs
            </span>
            <div className="flex-1 h-px bg-(--color-border-primary)" />
          </div>

          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 text-[10px] font-mono uppercase tracking-wider text-(--color-text-tertiary) border-b border-(--color-border-primary) bg-(--color-background-secondary)">
              <div className="px-5 py-3">Category</div>
              <div className="px-5 py-3 border-l border-(--color-border-primary)">
                Tokens
              </div>
              <div className="px-5 py-3 border-l border-(--color-border-primary)">
                Modes
              </div>
              <div className="px-5 py-3 border-l border-(--color-border-primary)">
                Notes
              </div>
            </div>
            {syncs.map((row) => (
              <div
                key={row.category}
                className="grid grid-cols-4 border-b border-(--color-border-primary) last:border-0 hover:bg-(--color-background-secondary) transition-colors"
              >
                <div className="px-5 py-4 text-sm font-medium text-(--color-text-primary)">
                  {row.category}
                </div>
                <div className="px-5 py-4 border-l border-(--color-border-primary) font-mono text-sm text-(--color-text-secondary)">
                  {row.count}
                </div>
                <div className="px-5 py-4 border-l border-(--color-border-primary) font-mono text-sm text-(--color-text-secondary)">
                  {row.modes}
                </div>
                <div className="px-5 py-4 border-l border-(--color-border-primary) text-xs text-(--color-text-tertiary)">
                  {row.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Terminal / Install ── */}
      <section
        id="install"
        className="border-b border-(--color-border-primary) bg-(--color-background-secondary) py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-10 items-start">
            {/* Terminal (left, dominant) */}
            <div className="md:col-span-8 order-2 md:order-1 space-y-4">
              {/* Terminal window */}
              <div className="rounded-lg overflow-hidden border border-(--color-border-primary)">
                <div
                  className="flex items-center gap-2 px-3 py-2"
                  style={{
                    background: "oklch(0.18 0.01 274)",
                    borderBottom: "1px solid oklch(0.25 0.01 274)",
                  }}
                >
                  <div className="flex gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "oklch(0.65 0.18 29)" }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "oklch(0.75 0.17 85)" }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "oklch(0.72 0.18 145)" }}
                    />
                  </div>
                  <span
                    className="font-mono text-[10px] ml-2"
                    style={{ color: "oklch(0.50 0.01 274)" }}
                  >
                    ~/wyliedog/ui — zsh
                  </span>
                  <span
                    className="ml-auto font-mono text-[10px]"
                    style={{ color: "oklch(0.50 0.01 274)" }}
                  >
                    100×34
                  </span>
                </div>
                <div
                  className="p-5 font-mono text-xs leading-relaxed"
                  style={{ background: "oklch(0.12 0.01 274)" }}
                >
                  <div style={{ color: "oklch(0.72 0.18 145)" }}>
                    <span style={{ color: "oklch(0.55 0.01 274)" }}>
                      ~/wyliedog/ui
                    </span>
                    <span style={{ color: "oklch(0.72 0.18 145)" }}> ❯ </span>
                    <span style={{ color: "oklch(0.90 0.005 274)" }}>
                      pnpm sync:figma
                    </span>
                  </div>
                  <div
                    className="mt-3"
                    style={{ color: "oklch(0.50 0.01 274)" }}
                  >
                    ⏵{" "}
                    <span style={{ color: "oklch(0.90 0.005 274)" }}>
                      @wyliedog/token-bridge
                    </span>{" "}
                    v0.9.2
                  </div>
                  <div style={{ color: "oklch(0.50 0.01 274)" }}>
                    {"  "}↳ Reading{" "}
                    <span style={{ color: "oklch(0.90 0.005 274)" }}>
                      @wyliedog/tokens
                    </span>{" "}
                    <span style={{ color: "var(--color-interactive-primary)" }}>
                      v1.4.0
                    </span>
                  </div>
                  <div style={{ color: "oklch(0.50 0.01 274)" }}>
                    {"  "}↳ Connecting to Figma file{" "}
                    <span style={{ color: "var(--color-interactive-primary)" }}>
                      Wylie Dog · UI
                    </span>
                  </div>
                  <div
                    className="mt-3"
                    style={{ color: "oklch(0.72 0.18 145)" }}
                  >
                    ✓{"  "}
                    <span style={{ color: "oklch(0.90 0.005 274)" }}>
                      Authenticated
                    </span>{" "}
                    <span style={{ color: "oklch(0.50 0.01 274)" }}>
                      as travis@wyliedog.dev
                    </span>
                  </div>
                  <div style={{ color: "oklch(0.72 0.18 145)" }}>
                    ✓{"  "}3 collections discovered{" "}
                    <span style={{ color: "oklch(0.50 0.01 274)" }}>
                      (Primitives, Semantic, Components)
                    </span>
                  </div>
                  <div style={{ color: "oklch(0.72 0.18 145)" }}>
                    ✓{"  "}2 modes confirmed{" "}
                    <span style={{ color: "oklch(0.50 0.01 274)" }}>
                      (Light, Dark)
                    </span>
                  </div>
                  <div
                    className="mt-3"
                    style={{ color: "oklch(0.35 0.01 274)" }}
                  >
                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  </div>
                  <div
                    className="mt-2"
                    style={{ color: "oklch(0.50 0.01 274)" }}
                  >
                    {"  "}Primitives{"          "}
                    <span style={{ color: "oklch(0.72 0.18 145)" }}>✓</span>
                    {"  "}
                    {meta.tokens.primitive} vars{"  "}
                    <span style={{ color: "oklch(0.80 0.17 85)" }}>+2</span>
                    {"  ~0  -0"}
                  </div>
                  <div style={{ color: "oklch(0.50 0.01 274)" }}>
                    {"    └─ palette/blue   "}
                    <span style={{ color: "oklch(0.80 0.17 85)" }}>~1</span>
                    {"  oklch(58 .16 274) → oklch(54 .18 274)</div>"}
                  </div>
                  <div style={{ color: "oklch(0.50 0.01 274)" }}>
                    {"    └─ palette/slate  "}
                    <span style={{ color: "oklch(0.80 0.17 85)" }}>+1</span>
                    {"  slate/25 (new)"}
                  </div>
                  <div
                    className="mt-1"
                    style={{ color: "oklch(0.50 0.01 274)" }}
                  >
                    {"  "}Semantic{"            "}
                    <span style={{ color: "oklch(0.72 0.18 145)" }}>✓</span>
                    {"  "}
                    {meta.tokens.semantic} vars{"  "}
                    <span style={{ color: "oklch(0.80 0.17 85)" }}>+1</span>
                    {"  ~0  -0"}
                  </div>
                  <div style={{ color: "oklch(0.50 0.01 274)" }}>
                    {"    └─ Light mode     "}
                    <span style={{ color: "oklch(0.72 0.18 145)" }}>✓</span>
                    {"  "}
                    {meta.tokens.semantic}
                  </div>
                  <div style={{ color: "oklch(0.50 0.01 274)" }}>
                    {"    └─ Dark mode      "}
                    <span style={{ color: "oklch(0.72 0.18 145)" }}>✓</span>
                    {"  "}
                    {meta.tokens.semantic}
                  </div>
                  <div style={{ color: "oklch(0.50 0.01 274)" }}>
                    {"    └─ surface/elevated "}
                    <span style={{ color: "oklch(0.80 0.17 85)" }}>+1</span>
                    {"  new in v1.4"}
                  </div>
                  <div
                    className="mt-1"
                    style={{ color: "oklch(0.50 0.01 274)" }}
                  >
                    {"  "}Components{"          "}
                    <span style={{ color: "oklch(0.72 0.18 145)" }}>✓</span>
                    {"  "}
                    {meta.tokens.component} vars{"   ~0  ~0  -0"}
                  </div>
                  <div
                    className="mt-3"
                    style={{ color: "oklch(0.35 0.01 274)" }}
                  >
                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  </div>
                  <div
                    className="mt-2"
                    style={{ color: "oklch(0.72 0.18 145)" }}
                  >
                    ✓{"  "}
                    <span style={{ color: "oklch(0.90 0.005 274)" }}>
                      {meta.tokens.total} variables synced
                    </span>{" "}
                    in 2.14s
                  </div>
                  <div style={{ color: "oklch(0.50 0.01 274)" }}>
                    {"    "}3 changes · 0 conflicts · 0 detached layers
                  </div>
                  <div
                    className="mt-2"
                    style={{ color: "oklch(0.50 0.01 274)" }}
                  >
                    {"    "}Open in Figma →{" "}
                    <span style={{ color: "var(--color-interactive-primary)" }}>
                      figma.com/file/wyliedog-ui?variables
                    </span>
                  </div>
                  <div
                    className="mt-3"
                    style={{ color: "oklch(0.72 0.18 145)" }}
                  >
                    <span style={{ color: "oklch(0.55 0.01 274)" }}>
                      ~/wyliedog/ui
                    </span>
                    <span style={{ color: "oklch(0.72 0.18 145)" }}> ❯ </span>
                    <span
                      className="inline-block w-2 h-3.5 align-middle"
                      style={{
                        background: "oklch(0.72 0.18 145)",
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* CI snippet */}
              <div className="rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-(--color-border-primary) bg-(--color-background-secondary)">
                  <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                    .github/workflows/tokens.yml
                  </span>
                  <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                    runs on push to main
                  </span>
                </div>
                <pre className="px-4 py-3 font-mono text-[11.5px] leading-relaxed overflow-x-auto text-(--color-text-secondary)">
                  <span className="text-(--color-text-tertiary)">- </span>
                  <span>name</span>
                  <span className="text-(--color-text-tertiary)">: </span>
                  <span>Sync design tokens to Figma</span>
                  {"\n"}
                  {"  "}
                  <span>if</span>
                  <span className="text-(--color-text-tertiary)">: </span>
                  <span>
                    {
                      "contains(github.event.head_commit.modified, 'packages/tokens')"
                    }
                  </span>
                  {"\n"}
                  {"  "}
                  <span>run</span>
                  <span className="text-(--color-text-tertiary)">: </span>
                  <span style={{ color: "var(--color-interactive-primary)" }}>
                    pnpm sync:figma
                  </span>
                  {"\n"}
                  {"  "}
                  <span>env</span>
                  <span className="text-(--color-text-tertiary)">:</span>
                  {"\n"}
                  {"    "}
                  <span>FIGMA_TOKEN</span>
                  <span className="text-(--color-text-tertiary)">: </span>
                  <span>{"${{ secrets.FIGMA_BRIDGE_TOKEN }}"}</span>
                </pre>
              </div>
            </div>

            {/* Right: messaging */}
            <div className="md:col-span-4 order-1 md:order-2 md:sticky md:top-24">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                For engineers
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-(--color-text-primary) leading-tight">
                One command.{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  No GUI required.
                </span>
              </h2>
              <p className="mt-4 text-sm text-(--color-text-secondary) leading-relaxed">
                Token Bridge runs from anywhere a pnpm script can: your laptop,
                CI, a release workflow, a pre-commit hook. The output is
                diff-able, the auth is keychain-managed, and a dry-run flag
                previews changes before they hit the file.
              </p>

              <div className="mt-6 space-y-2 text-sm">
                {[
                  {
                    label: "install",
                    cmd: "pnpm add -D @wyliedog/token-bridge",
                  },
                  { label: "init", cmd: "pnpm bridge init" },
                  { label: "sync", cmd: "pnpm sync:figma" },
                  { label: "preview", cmd: "pnpm sync:figma --dry-run" },
                ].map(({ label, cmd }) => (
                  <div
                    key={label}
                    className="rounded-md border border-(--color-border-primary) bg-(--color-background-primary) px-3 py-2 flex items-center gap-3"
                  >
                    <span className="font-mono text-[10px] text-(--color-text-tertiary) w-16 shrink-0">
                      {label}
                    </span>
                    <span className="font-mono text-xs text-(--color-text-primary)">
                      {cmd}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xs text-(--color-text-tertiary)">
                Requires Node 20+ and a Figma file with editor access. The
                bridge talks to Figma's REST Variables API — no plugin install.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Figma Variables panel mockup ── */}
      <section id="figma-result" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline gap-4 mb-12">
            <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
              Result in Figma
            </span>
            <div className="flex-1 h-px bg-(--color-border-primary)" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left copy */}
            <div>
              <h2 className="font-serif text-3xl font-semibold text-(--color-text-primary) mb-4">
                Variables panel,
                <br />
                fully populated.
              </h2>
              <p className="text-sm text-(--color-text-secondary) leading-relaxed mb-6">
                After one sync, the Figma Variables panel shows all{" "}
                {meta.tokens.total} tokens organized into three collections with
                Light and Dark modes populated. Designers use real token names —
                not hex codes, not guesses.
              </p>
              <div className="space-y-3 text-sm text-(--color-text-secondary)">
                {[
                  "Tokens are live-linked — update JSON, re-run sync, Figma updates",
                  "Both modes populated in a single pass",
                  "No manual variable creation or relinking required",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span
                      className="mt-1 h-4 w-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-(--color-text-inverse)"
                      style={{ background: "var(--color-interactive-primary)" }}
                    >
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Figma Variables panel mockup */}
            <div className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) shadow-lg overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-(--color-border-primary) px-4 py-3 bg-(--color-background-secondary)">
                <div className="flex gap-1.5">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ background: "oklch(0.65 0.18 29)" }}
                  />
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ background: "oklch(0.75 0.17 85)" }}
                  />
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ background: "oklch(0.72 0.18 145)" }}
                  />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary) ml-2">
                  Figma — Local Variables
                </span>
              </div>

              <div className="flex min-h-85">
                {/* Collections rail */}
                <div className="w-44 border-r border-(--color-border-primary) bg-(--color-background-secondary) p-3 shrink-0">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary) mb-3 px-1">
                    Collections
                  </div>
                  {[
                    { label: "Primitives", count: meta.tokens.primitive },
                    {
                      label: "Semantic",
                      count: meta.tokens.semantic,
                      active: true,
                    },
                    { label: "Components", count: meta.tokens.component },
                  ].map(({ label, count, active }) => (
                    <div
                      key={label}
                      className={`rounded-md px-2 py-2 mb-0.5 ${active ? "text-(--color-interactive-primary)" : "text-(--color-text-secondary)"}`}
                      style={
                        active
                          ? {
                              background:
                                "color-mix(in oklch, var(--color-interactive-primary) 10%, transparent)",
                            }
                          : {}
                      }
                    >
                      <div className="text-[11px] font-medium">{label}</div>
                      <div className="font-mono text-[9px] text-(--color-text-tertiary)">
                        {count} tokens
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 pt-3 border-t border-(--color-border-primary)">
                    <div className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary) mb-2 px-1">
                      Modes
                    </div>
                    {["Light", "Dark"].map((mode) => (
                      <div
                        key={mode}
                        className="flex items-center gap-1.5 px-2 py-1"
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: "oklch(0.60 0.14 155)" }}
                        />
                        <span className="text-[11px] text-(--color-text-secondary)">
                          {mode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Token rows */}
                <div className="flex-1 overflow-hidden">
                  {/* Column headers */}
                  <div className="grid grid-cols-3 text-[9px] font-mono uppercase tracking-wider text-(--color-text-tertiary) border-b border-(--color-border-primary) bg-(--color-background-secondary)">
                    <div className="px-3 py-2">Name</div>
                    <div className="px-3 py-2 border-l border-(--color-border-primary)">
                      Light
                    </div>
                    <div className="px-3 py-2 border-l border-(--color-border-primary)">
                      Dark
                    </div>
                  </div>
                  {[
                    {
                      name: "--color-bg-primary",
                      light: { oklch: "oklch(1 0 0)", swatch: "oklch(1 0 0)" },
                      dark: {
                        oklch: "oklch(0.13 0.01 274)",
                        swatch: "oklch(0.13 0.01 274)",
                      },
                    },
                    {
                      name: "--color-text-primary",
                      light: {
                        oklch: "oklch(0.15 0.01 274)",
                        swatch: "oklch(0.15 0.01 274)",
                      },
                      dark: {
                        oklch: "oklch(0.97 0.004 274)",
                        swatch: "oklch(0.97 0.004 274)",
                      },
                    },
                    {
                      name: "--color-interactive",
                      light: {
                        oklch: "oklch(0.54 0.18 274)",
                        swatch: "oklch(0.54 0.18 274)",
                      },
                      dark: {
                        oklch: "oklch(0.62 0.18 274)",
                        swatch: "oklch(0.62 0.18 274)",
                      },
                    },
                    {
                      name: "--color-border",
                      light: {
                        oklch: "oklch(0.88 0.008 274)",
                        swatch: "oklch(0.88 0.008 274)",
                      },
                      dark: {
                        oklch: "oklch(0.26 0.01 274)",
                        swatch: "oklch(0.26 0.01 274)",
                      },
                    },
                    {
                      name: "--color-success",
                      light: {
                        oklch: "oklch(0.60 0.14 155)",
                        swatch: "oklch(0.60 0.14 155)",
                      },
                      dark: {
                        oklch: "oklch(0.68 0.14 155)",
                        swatch: "oklch(0.68 0.14 155)",
                      },
                    },
                  ].map((row) => (
                    <div
                      key={row.name}
                      className="grid grid-cols-3 border-b border-(--color-border-primary) last:border-0 hover:bg-(--color-background-secondary) transition-colors"
                    >
                      <div className="px-3 py-2.5 font-mono text-[10px] text-(--color-text-primary) truncate">
                        {row.name}
                      </div>
                      <div className="px-3 py-2.5 border-l border-(--color-border-primary) flex items-center gap-1.5">
                        <span
                          className="h-3.5 w-3.5 rounded-sm shrink-0 border border-(--color-border-primary)"
                          style={{ background: row.light.swatch }}
                        />
                        <span className="font-mono text-[9px] text-(--color-text-tertiary) truncate">
                          {row.light.oklch}
                        </span>
                      </div>
                      <div className="px-3 py-2.5 border-l border-(--color-border-primary) flex items-center gap-1.5">
                        <span
                          className="h-3.5 w-3.5 rounded-sm shrink-0 border border-(--color-border-primary)"
                          style={{ background: row.dark.swatch }}
                        />
                        <span className="font-mono text-[9px] text-(--color-text-tertiary) truncate">
                          {row.dark.oklch}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="px-3 py-3 text-[10px] text-(--color-text-tertiary) font-mono">
                    + 119 more semantic tokens
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-b border-(--color-border-primary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="glass rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <div className="flex-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-(--color-text-primary) tracking-tight">
                Keep design and code in sync.
              </h2>
              <p className="mt-2 text-sm text-(--color-text-secondary) leading-relaxed max-w-xl">
                Set it up once, forget it forever. Your designers stop asking
                which value is current, your engineers stop chasing drift, and
                your tokens become the single thing that's actually true.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a href="#install" className={buttonVariants()}>
                Get started
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <Link
                href="/tokens"
                className={buttonVariants({ variant: "outline" })}
              >
                View token reference
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
