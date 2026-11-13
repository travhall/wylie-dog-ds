import { Card } from "@wyliedog/ui/card";
import { getShowcaseMeta } from "@/lib/showcase-metadata";

export function BuildFlowSection() {
  const meta = getShowcaseMeta();

  return (
    <section
      id="build-flow"
      className="border-b border-(--color-border-default)"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 mb-10">
          <div className="lg:col-span-5">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Build flow
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
              One command, four artifacts.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-(--color-foreground-muted) text-lg leading-relaxed">
              Turbo orchestrates the graph. Tokens build first, UI rebuilds
              against the new CSS, and Storybook + Showcase pick up the changes
              through their workspace symlinks. No package republishes —
              everything resolves through pnpm.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Terminal */}
          <div className="lg:col-span-5">
            <div
              className="dark rounded-xl overflow-hidden shadow-lg"
              style={{
                background: "var(--color-background-default)",
                color: "var(--color-foreground-default)",
                border:
                  "1px solid color-mix(in oklch, var(--color-border-default) 60%, transparent)",
              }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{
                  background: "var(--color-background-muted)",
                  borderBottom: "1px solid var(--color-border-default)",
                }}
              >
                <div className="flex gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--color-background-danger)" }}
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--color-background-warning)" }}
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--color-background-success)" }}
                  />
                </div>
                <span
                  className="ml-2 font-mono text-xs"
                  style={{ color: "var(--color-foreground-faint)" }}
                >
                  ~/wyliedog · main
                </span>
                <span
                  className="ml-auto font-mono text-xs"
                  style={{ color: "var(--color-foreground-faint)" }}
                >
                  zsh
                </span>
              </div>
              <div className="px-4 py-4 font-mono text-[0.75rem] leading-[1.65] space-y-0.5">
                <div>
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    $
                  </span>{" "}
                  pnpm{" "}
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    build
                  </span>
                </div>
                <div style={{ color: "var(--color-foreground-faint)" }}>
                  turbo run build
                </div>
                <div className="mt-2">
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    ▸
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-primary-muted)" }}
                  >
                    @wyliedog/tokens#build
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-faint)" }}>
                    style-dictionary
                  </span>
                </div>
                <div
                  className="pl-4"
                  style={{ color: "var(--color-foreground-faint)" }}
                >
                  → dist/tokens.css{" "}
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    {meta.tokens.total} vars
                  </span>
                </div>
                <div
                  className="pl-4"
                  style={{ color: "var(--color-foreground-faint)" }}
                >
                  → dist/index.js
                </div>
                <div
                  className="pl-4"
                  style={{ color: "var(--color-foreground-faint)" }}
                >
                  → dist/manifest.json
                </div>
                <div
                  className="pl-4"
                  style={{ color: "var(--color-foreground-success-muted)" }}
                >
                  ✓ done
                </div>
                <div className="mt-1">
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    ▸
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-primary-muted)" }}
                  >
                    @wyliedog/ui#build
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-faint)" }}>
                    tailwind + tsup
                  </span>
                </div>
                <div
                  className="pl-4"
                  style={{ color: "var(--color-foreground-faint)" }}
                >
                  → dist/index.css
                </div>
                <div
                  className="pl-4"
                  style={{ color: "var(--color-foreground-success-muted)" }}
                >
                  ✓ done · one entry per component (.js · .cjs · .d.ts)
                </div>
                <div className="mt-1">
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    ▸
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-primary-muted)" }}
                  >
                    @wyliedog/storybook#build
                  </span>
                </div>
                <div
                  className="pl-4"
                  style={{ color: "var(--color-foreground-success-muted)" }}
                >
                  ✓ build:css, then storybook build
                </div>
                <div className="mt-1">
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    ▸
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-primary-muted)" }}
                  >
                    @wyliedog/showcase#build
                  </span>
                </div>
                <div
                  className="pl-4"
                  style={{ color: "var(--color-foreground-success-muted)" }}
                >
                  ✓ next build
                </div>
                <div className="mt-1">
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    $
                  </span>{" "}
                  <span
                    className="inline-block w-1.5 h-3 align-middle"
                    style={{ background: "var(--color-foreground-default)" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Build flowchart */}
          <div className="lg:col-span-7">
            <Card className="gap-0 rounded-2xl p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint) mb-5">
                Build dependency graph
              </p>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="absolute left-3.75 top-3 bottom-3 w-px"
                  style={{
                    background:
                      "linear-gradient(to bottom, color-mix(in oklch, var(--color-background-primary) 70%, transparent), color-mix(in oklch, var(--color-background-primary) 70%, transparent) 70%, var(--color-border-default))",
                  }}
                />
                <ol className="space-y-5">
                  {[
                    {
                      n: "1",
                      title: "Tokens build",
                      meta: "style-dictionary",
                      desc: `Reads JSON source files, resolves aliases, emits tokens.css with all ${meta.tokens.total} custom properties plus JS exports, types and a manifest.`,
                    },
                    {
                      n: "2",
                      title: "UI build",
                      meta: "tailwind + tsup",
                      desc: `Picks up the fresh tokens.css via workspace symlink. tsup builds each of the ${meta.components.count} components as its own ESM and CommonJS entry, so imports are tree-shakeable.`,
                    },
                    {
                      n: "3",
                      title: "Storybook",
                      meta: "build:css + storybook build",
                      desc: "Compiles its own Tailwind sheet and builds the docs, so the stories render against the new token values.",
                    },
                    {
                      n: "4",
                      title: "Showcase",
                      meta: "next build",
                      desc: "Reads token values and counts from the repo, so the public site reflects the new tokens on its next build.",
                    },
                  ].map((step) => (
                    <li key={step.n} className="relative pl-12">
                      <span
                        className="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full font-mono text-xs font-semibold"
                        style={{
                          background: "var(--color-background-primary)",
                          color: "var(--color-foreground-primary)",
                        }}
                      >
                        {step.n}
                      </span>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-(--color-foreground-default)">
                          {step.title}
                        </h3>
                        <span className="font-mono text-xs text-(--color-foreground-faint)">
                          {step.meta}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-(--color-foreground-muted) leading-relaxed">
                        {step.desc}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
