import { Badge } from "@wyliedog/ui/badge";
import { Button, buttonVariants } from "@wyliedog/ui/button";
import { getShowcaseMeta } from "@/lib/showcase-metadata";

export function HeroSection() {
  const meta = getShowcaseMeta();

  return (
    <section className="relative overflow-hidden border-b border-(--color-border-default)">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 hero-gradient" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left */}
          <div className="lg:col-span-5">
            <Badge
              variant="outline"
              className="gap-2 rounded-full bg-(--color-background-default)/60 px-3 py-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)"
            >
              Architecture
              <span className="text-(--color-foreground-faint)">·</span>
              <span className="text-(--color-foreground-faint)">
                pnpm workspaces
              </span>
            </Badge>

            <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-[4.25rem] font-semibold tracking-tight leading-[0.98]">
              The monorepo that{" "}
              <span style={{ color: "var(--color-foreground-primary-muted)" }}>
                ships everything
              </span>
              .
            </h1>

            <p className="mt-6 max-w-lg text-lg text-(--color-foreground-muted) leading-relaxed">
              Two packages, two apps, one cascade. Tokens flow into UI, UI flows
              into Storybook and the public showcase — all wired at install
              time, no copy-paste between repos.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#packages" className={buttonVariants()}>
                Tour the packages
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a
                href="#build-flow"
                className={buttonVariants({ variant: "outline" })}
              >
                See the build flow
              </a>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                { label: "Packages", value: "2", sub: "+ 2 apps, 2 configs" },
                {
                  label: "Token tiers",
                  value: "3",
                  sub: "primitive → comp.",
                },
                {
                  label: "Components",
                  value: String(meta.components.count),
                  sub: "in @wyliedog/ui",
                },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                    {s.label}
                  </dt>
                  <dd className="mt-1 flex items-baseline gap-1">
                    <span className="font-serif text-2xl font-semibold text-(--color-foreground-default)">
                      {s.value}
                    </span>
                    <span className="text-xs text-(--color-foreground-faint)">
                      {s.sub}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: dependency graph */}
          <div className="lg:col-span-7">
            <div className="relative">
              <div className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="6" cy="6" r="2" />
                  <circle cx="18" cy="18" r="2" />
                  <circle cx="6" cy="18" r="2" />
                  <path d="M6 8v8M8 6h8M8 18h8" />
                </svg>
                Dependency graph
              </div>

              <div className="glass rounded-2xl p-5 sm:p-7 shadow-(--shadow-lg)">
                {/* SVG edges */}
                <div className="relative" style={{ height: "22.5rem" }}>
                  <svg
                    viewBox="0 0 560 360"
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <style>{`
                        .edge-line {
                          stroke: color-mix(in oklch, var(--color-background-primary) 55%, transparent);
                          stroke-width: 1.4; fill: none;
                          stroke-dasharray: 4 4;
                          animation: edge-flow 3s linear infinite;
                        }
                        .edge-line.muted {
                          stroke: var(--color-border-default);
                          animation-duration: 5s;
                        }
                        @keyframes edge-flow { from { stroke-dashoffset: 16; } to { stroke-dashoffset: 0; } }
                      `}</style>
                    <path className="edge-line" d="M 280 296 L 280 232" />
                    <path
                      className="edge-line"
                      d="M 240 168 C 200 130, 150 110, 120 86"
                    />
                    <path
                      className="edge-line"
                      d="M 320 168 C 360 130, 410 110, 440 86"
                    />
                    <path
                      className="edge-line muted"
                      d="M 320 320 C 400 320, 470 290, 510 250"
                    />
                    <polygon
                      points="276,232 284,232 280,224"
                      fill="var(--color-background-primary)"
                    />
                    <polygon
                      points="116,90 124,90 120,82"
                      fill="var(--color-background-primary)"
                    />
                    <polygon
                      points="436,90 444,90 440,82"
                      fill="var(--color-background-primary)"
                    />
                  </svg>

                  {/* Node cards */}
                  <div className="absolute inset-0">
                    {/* apps/storybook */}
                    <div
                      className="absolute"
                      style={{ top: "4%", left: "4%", width: "38%" }}
                    >
                      <div className="rounded-lg border border-(--color-border-default) bg-(--color-background-default) p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                background: "var(--color-background-primary)",
                              }}
                            />
                            App
                          </span>
                          <span className="font-mono text-xs text-(--color-foreground-faint)">
                            {meta.versions.storybook}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-(--color-foreground-default)">
                          apps/storybook
                        </p>
                        <p className="font-mono text-xs text-(--color-foreground-muted) mt-0.5">
                          component docs
                        </p>
                      </div>
                    </div>

                    {/* apps/showcase */}
                    <div
                      className="absolute"
                      style={{ top: "4%", right: "4%", width: "38%" }}
                    >
                      <div className="rounded-lg border border-(--color-border-default) bg-(--color-background-default) p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                background: "var(--color-foreground-link)",
                              }}
                            />
                            App
                          </span>
                          <span className="font-mono text-xs text-(--color-foreground-faint)">
                            Next.js 16
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-(--color-foreground-default)">
                          apps/showcase
                        </p>
                        <p className="font-mono text-xs text-(--color-foreground-muted) mt-0.5">
                          this site
                        </p>
                      </div>
                    </div>

                    {/* packages/ui */}
                    <div
                      className="absolute"
                      style={{ top: "42%", left: "26%", right: "26%" }}
                    >
                      <div
                        className="rounded-xl border-2 p-3.5 shadow-sm"
                        style={{
                          borderColor: "var(--color-border-primary)",
                          background: "var(--color-background-default)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider"
                            style={{
                              color: "var(--color-foreground-primary-muted)",
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                background: "var(--color-background-primary)",
                              }}
                            />
                            Package · components
                          </span>
                          <span className="font-mono text-xs text-(--color-foreground-faint)">
                            v{meta.versions.ui}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-(--color-foreground-default)">
                          packages/ui
                        </p>
                        <p className="font-mono text-xs text-(--color-foreground-muted) mt-0.5">
                          {meta.components.count} React components on Radix
                        </p>
                      </div>
                    </div>

                    {/* packages/tokens */}
                    <div
                      className="absolute"
                      style={{ bottom: "4%", left: "26%", right: "26%" }}
                    >
                      <div className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                background: "var(--color-background-primary)",
                              }}
                            />
                            Package · tokens
                          </span>
                          <span className="font-mono text-xs text-(--color-foreground-faint)">
                            v{meta.versions.tokens}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-(--color-foreground-default)">
                          packages/tokens
                        </p>
                        <p className="font-mono text-xs text-(--color-foreground-muted) mt-0.5">
                          {meta.tokens.total} OKLCH design tokens
                        </p>
                      </div>
                    </div>

                    {/* Token Bridge satellite */}
                    <div
                      className="absolute"
                      style={{ bottom: "24%", right: "1%", width: "18%" }}
                    >
                      <div className="rounded-md border border-dashed border-(--color-border-default) bg-(--color-background-default)/70 p-2">
                        <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                          Figma plugin
                        </p>
                        <p className="text-xs font-semibold mt-0.5 leading-tight text-(--color-foreground-default)">
                          Token Bridge
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-(--color-border-default) flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-px w-6"
                      style={{
                        borderTop:
                          "1.4px dashed var(--color-background-primary)",
                      }}
                    />
                    workspace dep
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-px w-6"
                      style={{
                        borderTop: "1.4px dashed var(--color-border-default)",
                      }}
                    />
                    sync only
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 normal-case">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: "var(--color-foreground-success-muted)",
                      }}
                    />
                    <span className="text-(--color-foreground-muted)">
                      workspace dependencies
                    </span>
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-3 right-6 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)">
                4 nodes · 3 edges
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
