import Link from "next/link";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { getShowcaseMeta } from "@/lib/showcase-metadata";
import { HeroPreview } from "../hero-preview";

export function HeroSection() {
  const meta = getShowcaseMeta();

  return (
    <section className="relative overflow-hidden border-b border-(--color-border-default)">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 hero-gradient" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: messaging */}
          <div className="lg:col-span-7">
            <Badge
              variant="outline"
              className="gap-2 rounded-full bg-(--color-background-default)/60 px-3 py-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: "var(--color-foreground-success-muted)",
                }}
              />
              v{meta.versions.ui} · not published to npm
              <span className="text-(--color-foreground-faint)">·</span>
              <span className="text-(--color-foreground-faint)">
                react 19 · tailwind 4
              </span>
            </Badge>

            <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.98]">
              The design system{" "}
              <span style={{ color: "var(--color-foreground-primary-muted)" }}>
                that closes the gap
              </span>{" "}
              between design and code.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-(--color-foreground-muted)">
              A typed React component library, an OKLCH token system, and a
              pattern catalog — shared across every surface we ship.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/components">
                <Button className="gap-2">
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
                <Button variant="outline">Explore tokens</Button>
              </Link>
            </div>
          </div>

          {/* Right: live component cluster */}
          <div className="lg:col-span-5">
            <HeroPreview />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative border-t border-(--color-border-default)">
        <div className="mx-auto max-w-330 px-4 sm:px-6 lg:px-8">
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
                sub: "AA targeted",
              },
              {
                label: "Patterns",
                value: meta.patterns.count,
                sub: "reference compositions",
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`px-3 py-6 lg:py-7 ${i < 3 ? "lg:border-r border-(--color-border-default)" : ""} ${i >= 2 ? "border-t border-(--color-border-default) lg:border-t-0" : ""}`}
              >
                <dt className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                  {stat.label}
                </dt>
                <dd className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="font-serif text-3xl sm:text-4xl font-semibold">
                    {stat.value}
                  </span>
                  <span className="text-xs text-(--color-foreground-faint)">
                    {stat.sub}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
