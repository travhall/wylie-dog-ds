import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import { Card } from "@wyliedog/ui/card";
import { getAlias, primitiveVar } from "@/lib/token-values";

export function TokensSection() {
  const primary = getAlias("color.background.primary");

  return (
    <section className="border-b border-(--color-border-default)">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left */}
          <div className="lg:col-span-4">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Tokens
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
              An OKLCH-native token system.
            </h2>
            <p className="mt-4 text-(--color-foreground-muted)">
              Three tiers — primitives, semantic, and component — so a single
              source of truth flows from{" "}
              <span className="font-mono text-xs">{primitiveVar(primary)}</span>{" "}
              to{" "}
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
              className="mt-6 inline-flex min-h-6 items-center gap-1.5 text-sm font-semibold max-md:min-h-11"
              style={{ color: "var(--color-foreground-primary-muted)" }}
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
            <Card className="gap-0 p-5 shadow-none">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                  background · primary
                </p>
                <p className="font-mono text-xs text-(--color-foreground-faint)">
                  {`--color-${primary.palette}-*`}
                </p>
              </div>
              <div className="grid grid-cols-11 gap-1">
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
                ]
                  .map((stop) => ({ stop, active: stop === primary.step }))
                  .map((s) => (
                    <div
                      key={s.stop}
                      className={`aspect-3/4 rounded${s.active ? " ring-2 ring-offset-2" : ""}`}
                      style={{
                        background: `var(--color-${primary.palette}-${s.stop})`,
                        ...(s.active
                          ? ({
                              "--tw-ring-color": "var(--color-border-primary)",
                              "--tw-ring-offset-color":
                                "var(--color-background-default)",
                            } as React.CSSProperties)
                          : {}),
                      }}
                    />
                  ))}
              </div>
              <div className="mt-2 grid grid-cols-11 gap-1 font-mono text-xs text-(--color-foreground-faint) text-center">
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
                      s === "500" ? "text-(--color-foreground-default)" : ""
                    }
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Card>

            <div className="grid sm:grid-cols-2 gap-3">
              {/* Type scale */}
              <Card className="gap-0 p-5 shadow-none">
                <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
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
                      <span className="font-mono text-xs text-(--color-foreground-faint) shrink-0">
                        {row.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Spacing */}
              <Card className="gap-0 p-5 shadow-none">
                <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                  spacing
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    { step: "050", px: "4px", w: 4 },
                    { step: "200", px: "16px", w: 16 },
                    { step: "400", px: "32px", w: 32 },
                    { step: "700", px: "64px", w: 64 },
                  ].map((row) => (
                    <div key={row.step} className="flex items-center gap-3">
                      <span className="font-mono text-xs text-(--color-foreground-faint) w-10">
                        {row.step}
                      </span>
                      <div
                        className="h-2 rounded-sm"
                        style={{
                          width: `${row.w / 16}rem`,
                          background: "var(--color-background-primary)",
                        }}
                      />
                      <span className="font-mono text-xs text-(--color-foreground-faint)">
                        {row.px}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
