import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import { Card } from "@wyliedog/ui/card";
import manifest from "@wyliedog/tokens/manifest.json";
import { describeAlias, getAlias, primitiveVar } from "@/lib/token-values";
import { contrastRatio, parseOklch, wcagLevel } from "@/lib/contrast";

const SERIES_SHARE = [100, 70, 45, 25];

function seriesColor(index: number): string {
  return `color-mix(in oklch, var(--color-background-primary) ${SERIES_SHARE[index]}%, var(--color-background-default))`;
}

export function ColorSection() {
  const primary = getAlias("color.background.primary");

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

  const ramp = manifest.primitives.colors[
    primary.palette as keyof typeof manifest.primitives.colors
  ] as unknown as Record<string, { value: string; variable: string }>;

  const brandRamp = ["50", "100", "300", "500", "600", "700", "900"].map(
    (step) => {
      const token = ramp[step];
      // Contrast is computed against pure white on purpose; white is not a token.
      // eslint-disable-next-line no-restricted-syntax
      const ratio = contrastRatio(token.value, "oklch(1 0 0)");
      return {
        step,
        variable: token.variable,
        lightness: parseOklch(token.value)[0],
        ratio,
        level: wcagLevel(ratio),
        brand: step === primary.step,
      };
    }
  );

  return (
    <section
      id="color"
      className="border-b border-(--color-border-default) scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Color
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
              OKLCH means the ramp{" "}
              <span style={{ color: "var(--color-foreground-primary-muted)" }}>
                is
              </span>{" "}
              the math.
            </h2>
            <p className="mt-3 text-(--color-foreground-muted) leading-relaxed">
              Lightness is a first-class axis, so steps move predictably. Mix
              safely, lighten without muddying, and pick a step by its measured
              contrast, shown below for the brand ramp.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border-default) bg-(--color-background-default) px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: "var(--color-foreground-success-muted)",
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Analytics chart */}
          <div
            data-mock
            className="lg:col-span-8 rounded-xl border border-(--color-border-default) bg-(--color-background-default) overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-(--color-border-default)">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                    Acquisition · Q3 2026
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[0.625rem]"
                    style={{
                      background: "var(--color-background-success-muted)",
                      color: "var(--color-foreground-success-muted)",
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
              <div className="hidden sm:flex items-center gap-1 rounded-md border border-(--color-border-default) bg-(--color-background-muted) p-0.5">
                {["Week", "Month", "Quarter"].map((t, i) => (
                  <Button
                    key={t}
                    variant="ghost"
                    size="sm"
                    className={`h-auto min-h-6 rounded px-2.5 py-1 text-xs font-medium ${
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
                  className="w-10 flex flex-col justify-between font-mono text-[0.625rem] text-(--color-foreground-faint) pr-2 pt-1 pb-6 leading-none"
                  style={{ height: "15rem" }}
                >
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
                <div className="flex-1 relative" style={{ height: "15rem" }}>
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
                              background: seriesColor(ci),
                            }}
                          />
                        ))}
                        {wi === 6 && (
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-(--color-background-default) border border-(--color-border-default) px-2 py-1 text-[0.625rem] font-mono shadow-md">
                            Wk 7 · 1,284
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="absolute left-0 right-0 bottom-0 flex justify-between px-1 font-mono text-[0.625rem] text-(--color-foreground-faint)">
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
                  color: seriesColor(0),
                  label: "primary · 100%",
                  name: "Direct",
                  pct: "42% of new users",
                },
                {
                  color: seriesColor(1),
                  label: "primary · 70%",
                  name: "Referral",
                  pct: "28% of new users",
                },
                {
                  color: seriesColor(2),
                  label: "primary · 45%",
                  name: "Search",
                  pct: "21% of new users",
                },
                {
                  color: seriesColor(3),
                  label: "primary · 25%",
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
                    <span className="font-mono text-[0.625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                      {c.label}
                    </span>
                  </div>
                  <p className="mt-1 font-serif text-xl font-semibold leading-none text-(--color-foreground-default)">
                    {c.name}
                  </p>
                  <p className="mt-1 text-[0.6875rem] text-(--color-foreground-faint)">
                    {c.pct}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Brand ramp + status tones */}
          <div className="lg:col-span-4 space-y-3">
            <Card className="gap-0 rounded-xl p-5 shadow-none">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                  brand ramp · {primary.palette}
                </p>
                <span className="font-mono text-xs text-(--color-foreground-faint)">
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
                              "color-mix(in oklch, var(--color-background-primary) 8%, transparent)",
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
                                "2px solid var(--color-background-primary)",
                              outlineOffset: "2px",
                            }
                          : {}),
                      }}
                    />
                    <span
                      className={`font-mono text-xs w-8 shrink-0 ${r.brand ? "font-semibold text-(--color-foreground-default)" : "text-(--color-foreground-faint)"}`}
                    >
                      {r.step}
                    </span>
                    <span
                      className={`font-mono text-xs ${r.brand ? "text-(--color-foreground-default)" : "text-(--color-foreground-faint)"}`}
                    >
                      {(r.lightness * 100).toFixed(1)}% L
                      {r.brand ? " · brand" : ""}
                    </span>
                    <span className="ml-auto font-mono text-xs">
                      {r.level ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5"
                          style={{
                            background: "var(--color-background-success-muted)",
                            color: "var(--color-foreground-success-muted)",
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
            </Card>

            <Card className="gap-0 rounded-xl p-5 shadow-none">
              <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                status tones
              </p>
              <div className="mt-3 space-y-1.5">
                {[
                  {
                    color: "var(--color-foreground-success-muted)",
                    label: "Deployment succeeded",
                    token: "--color-foreground-success-muted",
                    icon: <path d="m5 12 5 5L20 7" />,
                  },
                  {
                    color: "var(--color-foreground-warning-muted)",
                    label: "Quota approaching limit",
                    token: "--color-foreground-warning-muted",
                    icon: <path d="M12 8v5M12 16v.01" />,
                  },
                  {
                    color: "var(--color-foreground-danger-muted)",
                    label: "Build failed · 2 errors",
                    token: "--color-foreground-danger-muted",
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
                        color: "var(--color-foreground-inverse)",
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
                      <p className="font-mono text-xs text-(--color-foreground-faint)">
                        {s.token}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
