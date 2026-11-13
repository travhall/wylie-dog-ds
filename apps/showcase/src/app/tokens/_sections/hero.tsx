import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Card } from "@wyliedog/ui/card";
import manifest from "@wyliedog/tokens/manifest.json";
import { getShowcaseMeta } from "@/lib/showcase-metadata";
import { describeAlias, getAlias, primitiveVar } from "@/lib/token-values";

export function HeroSection() {
  const meta = getShowcaseMeta();

  const primary = getAlias("color.background.primary");

  const primaryRamp = (
    manifest.primitives.colors as Record<
      string,
      Record<string, { value: string }>
    >
  )[primary.palette];

  return (
    <section className="relative overflow-hidden border-b border-(--color-border-default)">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 hero-gradient" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <Badge
          variant="outline"
          className="gap-2 rounded-full bg-(--color-background-default)/60 px-3 py-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)"
        >
          Tokens
          <span className="text-(--color-foreground-faint)">·</span>
          <span className="text-(--color-foreground-faint)">
            Three-tiered System
          </span>
        </Badge>

        <div className="mt-5 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[5rem] font-semibold tracking-tight leading-[0.96] text-(--color-foreground-default)">
              The contract <br />
              <span style={{ color: "var(--color-foreground-primary-muted)" }}>
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
                  <dt className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                    {s.label}
                  </dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold text-(--color-foreground-default)">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 font-mono text-xs text-(--color-foreground-faint)">
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
                tokenName: primitiveVar(primary),
                tokenVal: primaryRamp[primary.step].value,
                swatch: `var(${primitiveVar(primary)})`,
              },
              {
                tier: "Tier 02 · Semantic",
                count: meta.tokens.semantic,
                desc: "Roles. The contract every theme must satisfy.",
                tokenName: "--color-background-primary",
                tokenVal: `→ ${describeAlias("color.background.primary")}`,
                swatch: "var(--color-background-primary)",
              },
              {
                tier: "Tier 03 · Component",
                count: meta.tokens.component,
                desc: "Surfaces. The shape components consume.",
                tokenName: "--color-button-primary-background",
                tokenVal: "→ background-primary",
                swatch: "var(--color-background-primary)",
              },
            ].map((tier, i) => (
              <Card
                key={tier.tier}
                className={`gap-0 relative rounded-xl p-5 shadow-none ${i === 0 ? "lg:rounded-r-none lg:border-r-0" : i === 1 ? "lg:rounded-none" : "lg:rounded-l-none lg:border-l-0"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                    {tier.tier}
                  </span>
                  <span className="font-mono text-xs text-(--color-foreground-faint)">
                    {tier.count}
                  </span>
                </div>
                <p className="mt-3 text-xs text-(--color-foreground-muted)">
                  {tier.desc}
                </p>
                <div className="mt-4 rounded-lg border border-(--color-border-default) bg-(--color-background-muted) p-3 font-mono text-xs leading-relaxed">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-sm shrink-0"
                      style={{ background: tier.swatch }}
                    />
                    <span className="text-(--color-foreground-muted) truncate">
                      {tier.tokenName}
                    </span>
                  </div>
                  <div className="mt-1 pl-5 text-(--color-foreground-faint) text-xs">
                    {tier.tokenVal}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-3 flex-wrap items-center gap-3 rounded-xl p-4 flex-row shadow-none">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint) shrink-0">
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
          </Card>
        </div>
      </div>
    </section>
  );
}
