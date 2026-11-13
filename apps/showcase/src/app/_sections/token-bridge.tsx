import manifest from "@wyliedog/tokens/manifest.json";
import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import { getShowcaseMeta } from "@/lib/showcase-metadata";
import { getAlias, primitiveVar } from "@/lib/token-values";

export function TokenBridgeSection() {
  const meta = getShowcaseMeta();

  const primary = getAlias("color.background.primary");

  const primaryRamp = (
    manifest.primitives.colors as Record<
      string,
      Record<string, { value: string }>
    >
  )[primary.palette];

  const previousStep = String(Number(primary.step) - 100);

  return (
    <section className="border-b border-(--color-border-default) bg-(--color-background-muted)">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Messaging */}
          <div className="lg:col-span-5">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Figma plugin
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
              Token Bridge keeps Figma and code{" "}
              <span style={{ color: "var(--color-foreground-primary-muted)" }}>
                in sync
              </span>
              .
            </h2>
            <p className="mt-4 text-(--color-foreground-muted)">
              Pull the latest tokens into Figma as variables, or push your edits
              back to a pull request. No more drift between the file you&apos;re
              designing in and the code that ships.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              {[
                {
                  bold: "Two-way sync.",
                  rest: "Pull token files from GitHub into Figma variables, and push Figma edits back to the repository.",
                },
                {
                  bold: "Mode-aware.",
                  rest: "The semantic and component collections carry Light and Dark modes, matching the token files.",
                },
                {
                  bold: "Opens a PR.",
                  rest: "In pull-request mode, Figma edits land in GitHub as a branch and a pull request you can review.",
                },
              ].map((item) => (
                <li key={item.bold} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                    style={{
                      background:
                        "color-mix(in oklch, var(--color-background-primary) 18%, transparent)",
                      color: "var(--color-foreground-primary-muted)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  </span>
                  <span>
                    <span className="font-medium text-(--color-foreground-default)">
                      {item.bold}
                    </span>{" "}
                    <span className="text-(--color-foreground-muted)">
                      {item.rest}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-2">
              <Link href="/plugin">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-md px-4 gap-1.5"
                >
                  How it works
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
            </div>
            <p className="mt-5 font-mono text-xs text-(--color-foreground-faint)">
              v{meta.versions.plugin} · development build
            </p>
          </div>

          {/* Plugin window */}
          <div className="lg:col-span-7">
            <div className="relative">
              <div className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)">
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                    style={{
                      background: "var(--color-foreground-success-muted)",
                    }}
                  />
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{
                      background: "var(--color-foreground-success-muted)",
                    }}
                  />
                </span>
                Connected to main
              </div>

              <div
                className="rounded-xl border border-(--color-border-default) overflow-hidden shadow-(--shadow-xl)"
                style={{ background: "var(--color-background-default)" }}
              >
                {/* Title bar */}
                <div className="flex items-center gap-2 border-b border-(--color-border-default) bg-(--color-background-muted) px-3 py-2">
                  <div className="flex gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "var(--color-background-danger)" }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: "var(--color-background-warning)",
                      }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: "var(--color-background-success)",
                      }}
                    />
                  </div>
                  <div className="flex-1 text-center font-mono text-xs text-(--color-foreground-faint)">
                    Token Bridge · wyliedog/ui · main
                  </div>
                  <span className="font-mono text-xs text-(--color-foreground-faint)">
                    v{meta.versions.plugin}
                  </span>
                </div>

                {/* Two-pane body */}
                <div className="grid grid-cols-12">
                  {/* Sidebar */}
                  <div className="col-span-4 border-r border-(--color-border-default) p-3 space-y-1 bg-(--color-background-default)">
                    <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint) px-2 py-1">
                      Collections
                    </p>
                    {[
                      {
                        icon: "circle",
                        label: "Primitives",
                        count: meta.tokens.primitive,
                        active: true,
                      },
                      {
                        icon: "lines",
                        label: "Semantic",
                        count: meta.tokens.semantic,
                      },
                      {
                        icon: "rect",
                        label: "Components",
                        count: meta.tokens.component,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${item.active ? "font-medium" : "text-(--color-foreground-muted) hover:text-(--color-foreground-default)"}`}
                        style={
                          item.active
                            ? {
                                background:
                                  "color-mix(in oklch, var(--color-background-primary) 14%, transparent)",
                                color: "var(--color-foreground-primary-muted)",
                              }
                            : {}
                        }
                      >
                        <span className="font-mono text-xs">{item.label}</span>
                        <span className="ml-auto font-mono text-xs">
                          {item.count}
                        </span>
                      </div>
                    ))}
                    <div className="mt-4 pt-3 border-t border-(--color-border-default)">
                      <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint) px-2 py-1">
                        Modes
                      </p>
                      {["Light", "Dark"].map((mode) => (
                        <div
                          key={mode}
                          className="px-2 py-1 text-xs flex items-center justify-between"
                        >
                          <span className="text-(--color-foreground-muted)">
                            {mode}
                          </span>
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              background:
                                "var(--color-foreground-success-muted)",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Diff list */}
                  <div className="col-span-8 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">
                        Pending sync · 3 changes
                      </p>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs"
                        style={{
                          background:
                            "color-mix(in oklch, var(--color-foreground-warning-muted) 18%, transparent)",
                          color: "var(--color-foreground-warning-muted)",
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: "var(--color-foreground-warning-muted)",
                          }}
                        />
                        ahead by 3
                      </span>
                    </div>

                    {/* Modified */}
                    <div className="rounded-md border border-(--color-border-default) p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-xs rounded px-1.5 py-0.5"
                          style={{
                            background:
                              "color-mix(in oklch, var(--color-foreground-warning-muted) 18%, transparent)",
                            color: "var(--color-foreground-warning-muted)",
                          }}
                        >
                          M
                        </span>
                        <span className="font-mono text-xs">
                          color/background/primary
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 rounded border border-(--color-border-default) px-2 py-1.5">
                          <span
                            className="h-4 w-4 rounded shrink-0"
                            style={{
                              background: `var(--color-${primary.palette}-${previousStep})`,
                            }}
                          />
                          <span className="font-mono text-(--color-foreground-faint) line-through">
                            {primaryRamp[previousStep].value}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2 rounded border px-2 py-1.5"
                          style={{
                            borderColor:
                              "color-mix(in oklch, var(--color-background-primary) 50%, transparent)",
                            background:
                              "color-mix(in oklch, var(--color-background-primary) 8%, transparent)",
                          }}
                        >
                          <span
                            className="h-4 w-4 rounded shrink-0"
                            style={{
                              background: `var(${primitiveVar(primary)})`,
                            }}
                          />
                          <span className="font-mono text-(--color-foreground-default)">
                            {primaryRamp[primary.step].value}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Added */}
                    <div className="rounded-md border border-(--color-border-default) p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-xs rounded px-1.5 py-0.5"
                          style={{
                            background: "var(--color-background-success-muted)",
                            color: "var(--color-foreground-success-muted)",
                          }}
                        >
                          +
                        </span>
                        <span className="font-mono text-xs">
                          color/surface/elevated
                        </span>
                        <span className="ml-auto font-mono text-xs text-(--color-foreground-faint)">
                          new in v1.4
                        </span>
                      </div>
                    </div>

                    {/* Modified radius */}
                    <div className="rounded-md border border-(--color-border-default) p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-xs rounded px-1.5 py-0.5"
                          style={{
                            background:
                              "color-mix(in oklch, var(--color-foreground-warning-muted) 18%, transparent)",
                            color: "var(--color-foreground-warning-muted)",
                          }}
                        >
                          M
                        </span>
                        <span className="font-mono text-xs">radius/lg</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="font-mono text-(--color-foreground-faint) line-through">
                          12px
                        </span>
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3 text-(--color-foreground-faint)"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                        <span className="font-mono text-(--color-foreground-default)">
                          14px
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-(--color-border-default) pt-3 mt-3">
                      <div className="flex items-center gap-2 text-xs text-(--color-foreground-faint) font-mono">
                        last synced 4m ago
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 items-center rounded-md border border-(--color-border-default) px-2.5 text-xs font-medium cursor-pointer hover:bg-(--color-background-muted) transition-colors">
                          Discard
                        </span>
                        <span
                          className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold"
                          style={{
                            background: "var(--color-background-primary)",
                            color: "var(--color-foreground-primary)",
                          }}
                        >
                          Open PR
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="6" cy="6" r="2" />
                            <circle cx="18" cy="18" r="2" />
                            <path d="M6 8v8a4 4 0 0 0 4 4h6" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-3 right-6 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                3 tokens · ready to push
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
