import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import { Card } from "@wyliedog/ui/card";
import manifest from "@wyliedog/tokens/manifest.json";
import { describeAlias, getAlias, primitiveVar } from "@/lib/token-values";

export function TypographySection() {
  const primary = getAlias("color.background.primary");

  const primaryRamp = (
    manifest.primitives.colors as Record<
      string,
      Record<string, { value: string }>
    >
  )[primary.palette];

  return (
    <section
      id="typography"
      className="border-b border-(--color-border-default) bg-(--color-background-muted) scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Typography
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
              A pairing that ships{" "}
              <span style={{ color: "var(--color-foreground-primary-muted)" }}>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <article className="lg:col-span-8 rounded-xl border border-(--color-border-default) bg-(--color-background-default) overflow-hidden">
            <div className="flex items-center justify-between px-8 py-3 border-b border-(--color-border-default) bg-(--color-background-muted)">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                <span>Wylie Dog Field Notes</span>
                <span>·</span>
                <span>Issue 14</span>
              </div>
              <span className="font-mono text-xs text-(--color-foreground-faint)">
                8 min read
              </span>
            </div>
            <div className="px-8 py-10 lg:px-12 lg:py-12">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-(--color-foreground-faint)">
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
                    background: "var(--color-background-primary-muted)",
                    color: "var(--color-foreground-primary-muted)",
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
                  className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    background:
                      "color-mix(in oklch, var(--color-background-primary) 12%, transparent)",
                    color: "var(--color-foreground-primary-muted)",
                  }}
                >
                  Engineering
                </span>
              </div>
              <p className="mt-6 text-base text-(--color-foreground-muted) leading-relaxed">
                Every design system eventually hits the same wall: your color
                ramp made sense when it was just a handful of HEX values, but
                somewhere between the third palette expansion and the dark mode
                sprint, the math stopped working.
              </p>
              <p className="mt-4 text-base text-(--color-foreground-muted) leading-relaxed">
                OKLCH fixes this because perceptual lightness is a first-class
                axis. When you step from{" "}
                <code className="font-mono text-sm px-1 py-0.5 rounded bg-(--color-background-muted) text-(--color-foreground-default)">
                  {primaryRamp[primary.step].value}
                </code>{" "}
                to{" "}
                <code className="font-mono text-sm px-1 py-0.5 rounded bg-(--color-background-muted) text-(--color-foreground-default)">
                  {primaryRamp["900"].value}
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
              <Card
                key={group.label}
                className="gap-0 rounded-xl p-5 shadow-none"
              >
                <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint) mb-3">
                  {group.label}
                </p>
                {group.samples.map((s) => (
                  <div key={s.text} className={s.cls}>
                    {s.text}
                  </div>
                ))}
              </Card>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
