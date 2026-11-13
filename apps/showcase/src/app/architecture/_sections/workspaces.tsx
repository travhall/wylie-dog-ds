import React from "react";
import { Card } from "@wyliedog/ui/card";
import { getShowcaseMeta } from "@/lib/showcase-metadata";

export function WorkspacesSection() {
  const meta = getShowcaseMeta();

  return (
    <section id="packages" className="border-b border-(--color-border-default)">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-5">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Workspaces
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
              Two packages, two apps.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-(--color-foreground-muted) text-lg leading-relaxed">
              Each workspace has one job. Tokens publish raw values; UI
              publishes typed components; Storybook documents them; Showcase
              puts them in front of the world. No package reaches across — all
              dependencies flow upward through{" "}
              <span className="font-mono text-sm">@wyliedog/*</span>.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-3 lg:gap-4">
          {/* File tree */}
          <aside className="lg:col-span-4">
            <Card className="gap-0 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                  Repo layout
                </p>
                <span className="font-mono text-xs text-(--color-foreground-faint)">
                  pnpm-workspace.yaml
                </span>
              </div>
              <div className="font-mono text-[0.75rem] leading-[1.65] text-(--color-foreground-muted)">
                {[
                  {
                    indent: 0,
                    icon: "folder",
                    name: "wyliedog/",
                    badge: "root",
                  },
                  { indent: 1, icon: "folder", name: "apps/" },
                  {
                    indent: 2,
                    icon: "folder",
                    name: "storybook/",
                    badge: meta.versions.storybook,
                  },
                  {
                    indent: 2,
                    icon: "folder",
                    name: "showcase/",
                    badge: "Next 16",
                  },
                  { indent: 1, icon: "folder", name: "packages/" },
                  {
                    indent: 2,
                    icon: "folder",
                    name: "tokens/",
                    badge: "style-dict",
                  },
                  {
                    indent: 2,
                    icon: "folder",
                    name: "ui/",
                    badge: "React 19",
                  },
                  { indent: 1, icon: "file", name: "pnpm-workspace.yaml" },
                  { indent: 1, icon: "file", name: "turbo.json" },
                  { indent: 1, icon: "file", name: "package.json" },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 py-0.5"
                    style={{ paddingLeft: `${row.indent}rem` }}
                  >
                    {row.icon === "folder" ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 text-(--color-foreground-faint) shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 7v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-9l-2-3H4a1 1 0 0 0-1 1v1z" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 text-(--color-foreground-faint) shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                    )}
                    <span
                      className={
                        row.indent === 0
                          ? "text-(--color-foreground-default)"
                          : ""
                      }
                    >
                      {row.name}
                    </span>
                    {row.badge && (
                      <span className="ml-auto font-mono text-xs text-(--color-foreground-faint)">
                        {row.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint) mb-2">
                  pnpm-workspace.yaml
                </p>
                <div className="rounded-md border border-(--color-border-default) bg-(--color-background-muted) p-3 font-mono text-xs leading-relaxed">
                  <div className="text-(--color-foreground-muted)">
                    <span
                      style={{
                        color: "var(--color-foreground-primary-muted)",
                      }}
                    >
                      packages
                    </span>
                    :
                  </div>
                  <div className="pl-4 text-(--color-foreground-muted)">
                    -{" "}
                    <span
                      style={{
                        color: "var(--color-foreground-success-muted)",
                      }}
                    >
                      &quot;packages/*&quot;
                    </span>
                  </div>
                  <div className="pl-4 text-(--color-foreground-muted)">
                    -{" "}
                    <span
                      style={{
                        color: "var(--color-foreground-success-muted)",
                      }}
                    >
                      &quot;apps/*&quot;
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* 4 package cards */}
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-3">
            {[
              {
                pkg: "@wyliedog/tokens",
                name: "packages/tokens",
                version: `v${meta.versions.tokens}`,
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                ),
                desc: "The single source of truth. Source JSON files plus a Style Dictionary config that emits tokens.css with primitive, semantic, and component tiers as CSS custom properties.",
                meta: [
                  ["Stack", "Style Dictionary · TypeScript"],
                  ["Outputs", "tokens.css · index.js · manifest.json"],
                  ["Depended on by", "@wyliedog/ui"],
                ],
                footer: `${meta.tokens.total} tokens · 3 tiers`,
              },
              {
                pkg: "@wyliedog/ui",
                name: "packages/ui",
                version: `v${meta.versions.ui}`,
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                ),
                desc: `${meta.components.count} typed React components with CVA variants: ${meta.stack.radixBackedComponents} are built on Radix primitives and the rest are plain forwardRef components. Compiles Tailwind and tokens.css into @wyliedog/ui/styles.`,
                meta: [
                  [
                    "Stack",
                    `React ${meta.stack.react} · TypeScript ${meta.stack.typescript} · tsup`,
                  ],
                  ["Foundation", "Radix UI · CVA · Slot"],
                  ["Depended on by", "storybook · showcase"],
                ],
                footer: "tree-shakeable · subpath exports",
              },
              {
                pkg: "@wyliedog/storybook",
                name: "apps/storybook",
                version: `v${meta.versions.storybook}`,
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H4z" />
                    <path d="M8 9h8M8 13h6" />
                  </svg>
                ),
                iconColor: "var(--color-foreground-primary-muted)",
                iconBg:
                  "color-mix(in oklch, var(--color-background-primary) 22%, transparent)",
                desc: "Component documentation and the pattern playground. Every component in @wyliedog/ui has a story file. Stories run as accessibility tests in the test suite, and a curated set has visual regression baselines.",
                meta: [
                  [
                    "Stack",
                    `Storybook ${meta.versions.storybook} · Vite ${meta.stack.vite}`,
                  ],
                  ["Consumes", "@wyliedog/ui"],
                  ["Deploy", "wyliedogstorybook.com · Netlify"],
                ],
                footer: "Accessibility checks enforced in tests",
                footerDot: true,
              },
              {
                pkg: "@wyliedog/showcase",
                name: "apps/showcase",
                version: "Next 16",
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                  </svg>
                ),
                iconColor: "var(--color-foreground-link)",
                iconBg:
                  "color-mix(in oklch, var(--color-foreground-link) 22%, transparent)",
                desc: "The page you're reading. A Next.js App Router site that consumes @wyliedog/ui as its only component dependency — the marketing site eats its own design system.",
                meta: [
                  ["Stack", `Next.js ${meta.stack.next} · App Router`],
                  ["Consumes", "@wyliedog/ui"],
                  ["Deploy", "wyliedog.com"],
                ],
                footer: "Counts and token values are read from the repo",
              },
            ].map((card) => (
              <Card
                asChild
                key={card.name}
                className="gap-0 rounded-xl p-5 hover:border-(--color-border-default)/60 hover:bg-(--color-background-muted) transition-all shadow-none"
              >
                <article>
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="grid h-8 w-8 place-items-center rounded-md"
                        style={{
                          background:
                            card.iconBg ??
                            "color-mix(in oklch, var(--color-background-primary) 18%, transparent)",
                          color:
                            card.iconColor ?? "var(--color-background-primary)",
                        }}
                      >
                        {card.icon}
                      </span>
                      <div>
                        <p className="text-xs font-mono text-(--color-foreground-faint)">
                          {card.pkg}
                        </p>
                        <h3 className="font-semibold text-base text-(--color-foreground-default)">
                          {card.name}
                        </h3>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-(--color-foreground-faint) mt-1">
                      {card.version}
                    </span>
                  </header>

                  <p className="mt-4 text-sm text-(--color-foreground-muted) leading-relaxed">
                    {card.desc}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    {card.meta.map(([k, v]) => (
                      <React.Fragment key={k}>
                        <dt className="font-mono uppercase tracking-wider text-(--color-foreground-faint)">
                          {k}
                        </dt>
                        <dd className="text-(--color-foreground-muted)">{v}</dd>
                      </React.Fragment>
                    ))}
                  </dl>

                  <footer className="pt-4 border-t border-(--color-border-default) mt-5 flex items-center gap-2 text-xs font-mono text-(--color-foreground-faint)">
                    {card.footerDot && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: "var(--color-foreground-success-muted)",
                        }}
                      />
                    )}
                    {card.footer}
                  </footer>
                </article>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
