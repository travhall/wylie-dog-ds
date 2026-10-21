import manifest from "@wyliedog/tokens/manifest.json";
import React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@wyliedog/ui/button";
import { getShowcaseMeta } from "@/lib/showcase-metadata";

export default function ArchitecturePage() {
  const meta = getShowcaseMeta();
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-(--color-border-default)">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left */}
            <div className="lg:col-span-5">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-(--color-border-default) px-3 py-1"
                style={{
                  background:
                    "color-mix(in oklch, var(--color-background-default) 60%, transparent)",
                }}
              >
                <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-muted)">
                  01 · Architecture
                </span>
                <span className="text-(--color-foreground-faint)">·</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                  pnpm workspaces
                </span>
              </div>

              <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-[4.25rem] font-semibold tracking-tight leading-[0.98]">
                The monorepo that{" "}
                <span
                  style={{ color: "var(--color-primary-foreground-subtle)" }}
                >
                  ships everything
                </span>
                .
              </h1>

              <p className="mt-6 max-w-lg text-lg text-(--color-foreground-muted) leading-relaxed">
                Two packages, two apps, one cascade. Tokens flow into UI, UI
                flows into Storybook and the public showcase — all wired at
                install time, no copy-paste between repos.
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
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint)">
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
                <div className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-muted)">
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

                <div className="glass rounded-2xl p-5 sm:p-7 shadow-(--shadow-lg,0_12px_28px_-8px_rgba(0,0,0,0.18))">
                  {/* SVG edges */}
                  <div className="relative" style={{ height: "360px" }}>
                    <svg
                      viewBox="0 0 560 360"
                      className="absolute inset-0 w-full h-full"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <style>{`
                        .edge-line {
                          stroke: color-mix(in oklch, var(--color-primary-background-default) 55%, transparent);
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
                        fill="var(--color-primary-background-default)"
                      />
                      <polygon
                        points="116,90 124,90 120,82"
                        fill="var(--color-primary-background-default)"
                      />
                      <polygon
                        points="436,90 444,90 440,82"
                        fill="var(--color-primary-background-default)"
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
                            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint)">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  background: "var(--color-fiery-coral-400)",
                                }}
                              />
                              App
                            </span>
                            <span className="font-mono text-[10px] text-(--color-foreground-faint)">
                              {meta.versions.storybook}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-(--color-foreground-default)">
                            apps/storybook
                          </p>
                          <p className="font-mono text-[10px] text-(--color-foreground-muted) mt-0.5">
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
                            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint)">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: "var(--color-blue-400)" }}
                              />
                              App
                            </span>
                            <span className="font-mono text-[10px] text-(--color-foreground-faint)">
                              Next.js 16
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-(--color-foreground-default)">
                            apps/showcase
                          </p>
                          <p className="font-mono text-[10px] text-(--color-foreground-muted) mt-0.5">
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
                            borderColor: "var(--color-primary-border-default)",
                            background: "var(--color-background-default)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider"
                              style={{
                                color: "var(--color-primary-foreground-subtle)",
                              }}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  background:
                                    "var(--color-primary-background-default)",
                                }}
                              />
                              Package · components
                            </span>
                            <span className="font-mono text-[10px] text-(--color-foreground-faint)">
                              v{meta.versions.ui}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-(--color-foreground-default)">
                            packages/ui
                          </p>
                          <p className="font-mono text-[10px] text-(--color-foreground-muted) mt-0.5">
                            42 React components on Radix
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
                            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint)">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  background:
                                    "var(--color-primary-background-default)",
                                }}
                              />
                              Package · tokens
                            </span>
                            <span className="font-mono text-[10px] text-(--color-foreground-faint)">
                              v{meta.versions.tokens}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-(--color-foreground-default)">
                            packages/tokens
                          </p>
                          <p className="font-mono text-[10px] text-(--color-foreground-muted) mt-0.5">
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
                          <p className="font-mono text-[9px] uppercase tracking-wider text-(--color-foreground-faint)">
                            Figma plugin
                          </p>
                          <p className="text-[11px] font-semibold mt-0.5 leading-tight text-(--color-foreground-default)">
                            Token Bridge
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-(--color-border-default) flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint)">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block h-px w-6"
                        style={{
                          borderTop:
                            "1.4px dashed var(--color-primary-background-default)",
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
                          background: "var(--color-success-foreground-subtle)",
                        }}
                      />
                      <span className="text-(--color-foreground-muted)">
                        workspace dependencies
                      </span>
                    </span>
                  </div>
                </div>

                <div className="absolute -bottom-3 right-6 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-muted)">
                  4 nodes · 3 edges
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 01 · WORKSPACES ── */}
      <section
        id="packages"
        className="border-b border-(--color-border-default)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                01 · Workspaces
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
              <div className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                    Repo layout
                  </p>
                  <span className="font-mono text-[10px] text-(--color-foreground-faint)">
                    pnpm-workspace.yaml
                  </span>
                </div>
                <div className="font-mono text-[12px] leading-[1.65] text-(--color-foreground-muted)">
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
                      style={{ paddingLeft: `${row.indent * 16}px` }}
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
                        <span className="ml-auto font-mono text-[10px] text-(--color-foreground-faint)">
                          {row.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint) mb-2">
                    pnpm-workspace.yaml
                  </p>
                  <div className="rounded-md border border-(--color-border-default) bg-(--color-background-subtle) p-3 font-mono text-[11px] leading-relaxed">
                    <div className="text-(--color-foreground-muted)">
                      <span
                        style={{
                          color: "var(--color-primary-foreground-subtle)",
                        }}
                      >
                        packages
                      </span>
                      :
                    </div>
                    <div className="pl-4 text-(--color-foreground-muted)">
                      -{" "}
                      <span style={{ color: "var(--color-green-700)" }}>
                        &quot;packages/*&quot;
                      </span>
                    </div>
                    <div className="pl-4 text-(--color-foreground-muted)">
                      -{" "}
                      <span style={{ color: "var(--color-green-700)" }}>
                        &quot;apps/*&quot;
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
                  iconColor: "var(--color-fiery-coral-600)",
                  iconBg:
                    "color-mix(in oklch, var(--color-fiery-coral-400) 22%, transparent)",
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
                  iconColor: "var(--color-blue-700)",
                  iconBg:
                    "color-mix(in oklch, var(--color-blue-400) 22%, transparent)",
                  desc: "The page you're reading. A Next.js App Router site that consumes @wyliedog/ui as its only component dependency — the marketing site eats its own design system.",
                  meta: [
                    ["Stack", `Next.js ${meta.stack.next} · App Router`],
                    ["Consumes", "@wyliedog/ui"],
                    ["Deploy", "wyliedog.com"],
                  ],
                  footer: "Counts and token values are read from the repo",
                },
              ].map((card) => (
                <article
                  key={card.name}
                  className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5 flex flex-col hover:border-(--color-border-default)/60 hover:bg-(--color-background-subtle) transition-all"
                >
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="grid h-8 w-8 place-items-center rounded-md"
                        style={{
                          background:
                            card.iconBg ??
                            "color-mix(in oklch, var(--color-primary-background-default) 18%, transparent)",
                          color:
                            card.iconColor ??
                            "var(--color-primary-background-default)",
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
                    <span className="font-mono text-[10px] text-(--color-foreground-faint) mt-1">
                      {card.version}
                    </span>
                  </header>

                  <p className="mt-4 text-sm text-(--color-foreground-muted) leading-relaxed">
                    {card.desc}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                    {card.meta.map(([k, v]) => (
                      <React.Fragment key={k}>
                        <dt className="font-mono uppercase tracking-wider text-(--color-foreground-faint)">
                          {k}
                        </dt>
                        <dd className="text-(--color-foreground-muted)">{v}</dd>
                      </React.Fragment>
                    ))}
                  </dl>

                  <footer className="pt-4 border-t border-(--color-border-default) mt-5 flex items-center gap-2 text-[11px] font-mono text-(--color-foreground-faint)">
                    {card.footerDot && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: "var(--color-success-foreground-subtle)",
                        }}
                      />
                    )}
                    {card.footer}
                  </footer>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 · TOKEN PIPELINE ── */}
      <section className="border-b border-(--color-border-default) bg-(--color-background-subtle)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 mb-10">
            <div className="lg:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                02 · Token pipeline
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
                From JSON to{" "}
                <span
                  style={{ color: "var(--color-primary-foreground-subtle)" }}
                >
                  CSS variables
                </span>
                , in three tiers.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-(--color-foreground-muted) text-lg leading-relaxed">
                Source files describe the design intent in human terms. Style
                Dictionary expands them into raw values, role aliases, and
                component-specific surfaces — all emitted as a single{" "}
                <span className="font-mono text-sm">tokens.css</span> that
                Tailwind 4 reads at build time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              {
                stage: "01 · source",
                path: "packages/tokens/io/sync/",
                title: "primitive.json (excerpt)",
                content: (
                  <div className="mt-3 rounded-md border border-(--color-border-default) bg-(--color-background-default) p-3 font-mono text-[11px] leading-relaxed">
                    {[
                      { indent: 0, rest: "{" },
                      { indent: 1, key: "primitive", rest: ": {" },
                      { indent: 2, key: "variables", rest: ": {" },
                      { indent: 3, key: "color.blue.600", rest: ": {" },
                      { indent: 4, key: "$type", rest: ': "color",' },
                      {
                        indent: 4,
                        key: "$value",
                        rest: `: "${manifest.primitives.colors.blue["600"].value}"`,
                      },
                      { indent: 3, rest: "}" },
                      { indent: 2, rest: "}" },
                      { indent: 1, rest: "}" },
                      { indent: 0, rest: "}" },
                    ].map((line, i) => (
                      <div
                        key={i}
                        className="text-(--color-foreground-muted)"
                        style={{ paddingLeft: `${line.indent * 0.75}rem` }}
                      >
                        {line.key && (
                          <span
                            style={{
                              color: "var(--color-primary-foreground-subtle)",
                            }}
                          >
                            &quot;{line.key}&quot;
                          </span>
                        )}
                        {line.rest}
                      </div>
                    ))}
                  </div>
                ),
                footer: `${meta.tokens.primitive} primitive entries`,
              },
              {
                stage: "02 · transform",
                path: "style-dictionary.config.js",
                title: "build pipeline",
                content: (
                  <ul className="mt-3 space-y-2 text-[11px] font-mono">
                    {[
                      "parse JSON refs",
                      "resolve alias chains",
                      "tokens-studio transforms",
                      "custom CSS formats",
                    ].map((step, i) => (
                      <li key={step} className="flex items-center gap-2">
                        <span
                          className="grid h-4 w-4 place-items-center rounded text-[10px]"
                          style={{
                            background:
                              "color-mix(in oklch, var(--color-primary-background-default) 18%, transparent)",
                            color: "var(--color-primary-foreground-subtle)",
                          }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-(--color-foreground-muted)">
                          {step}
                        </span>
                      </li>
                    ))}
                    <li className="mt-3 flex items-center gap-2 rounded-md border border-(--color-border-default) px-2 py-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: "var(--color-success-foreground-subtle)",
                        }}
                      />
                      <span className="text-(--color-foreground-muted)">
                        style-dictionary build
                      </span>
                    </li>
                  </ul>
                ),
                footer: `${meta.tokens.total} vars emitted`,
              },
              {
                stage: "03 · output",
                path: "packages/tokens/dist/",
                title: "tokens.css",
                content: (
                  <div className="mt-3 rounded-md border border-(--color-border-default) bg-(--color-background-default) p-3 font-mono text-[11px] leading-relaxed">
                    <div className="text-(--color-foreground-faint) italic">
                      {"/* primitive */"}
                    </div>
                    <div>
                      <span
                        style={{
                          color: "var(--color-primary-foreground-subtle)",
                        }}
                      >
                        --color-blue-600
                      </span>
                      <span className="text-(--color-foreground-muted)">
                        : {manifest.primitives.colors.blue["600"].value};
                      </span>
                    </div>
                    <div className="mt-1 text-(--color-foreground-faint) italic">
                      {"/* semantic */"}
                    </div>
                    <div>
                      <span
                        style={{
                          color: "var(--color-primary-foreground-subtle)",
                        }}
                      >
                        --color-primary-background-default
                      </span>
                      <span className="text-(--color-foreground-muted)">
                        :{" "}
                        {
                          manifest.semantics.primary[
                            "color-primary-background-default"
                          ].value
                        }
                        ;
                      </span>
                    </div>
                    <div className="mt-1 text-(--color-foreground-faint) italic">
                      {"/* component */"}
                    </div>
                    <div>
                      <span
                        style={{
                          color: "var(--color-primary-foreground-subtle)",
                        }}
                      >
                        --color-button-primary-background
                      </span>
                      <span className="text-(--color-foreground-muted)">
                        :{" "}
                        {
                          manifest.components.button[
                            "button-primary-background"
                          ].value
                        }
                        ;
                      </span>
                    </div>
                  </div>
                ),
                footer: `${meta.tokens.primitive} primitive · ${meta.tokens.semantic} semantic · ${meta.tokens.component} component`,
              },
              {
                stage: "04 · consume",
                path: "JSX · Tailwind 4",
                title: "Button.tsx",
                content: (
                  <div className="mt-3">
                    <div className="rounded-md border border-(--color-border-default) bg-(--color-background-default) p-3 font-mono text-[11px] leading-relaxed">
                      <div className="text-(--color-foreground-muted)">
                        {"<"}button
                      </div>
                      <div className="pl-3 text-(--color-foreground-muted)">
                        className=&quot;
                      </div>
                      <div
                        className="pl-6"
                        style={{
                          color: "var(--color-primary-foreground-subtle)",
                        }}
                      >
                        bg-(--color-button-primary-background)
                      </div>
                      <div
                        className="pl-6"
                        style={{
                          color: "var(--color-primary-foreground-subtle)",
                        }}
                      >
                        text-(--color-inverse-foreground-default)
                      </div>
                      <div className="pl-6 text-(--color-foreground-muted)">
                        px-4 h-10
                      </div>
                      <div className="pl-3 text-(--color-foreground-muted)">
                        &quot;&gt;
                      </div>
                      <div className="pl-3 text-(--color-foreground-muted)">
                        Save changes
                      </div>
                      <div className="text-(--color-foreground-muted)">
                        {"<"}/button&gt;
                      </div>
                    </div>
                    <div className="mt-2 rounded-md border border-(--color-border-default) bg-(--color-background-default) p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint) mb-2">
                        render
                      </p>
                      <Button size="sm">Save changes</Button>
                    </div>
                  </div>
                ),
                footer: null,
              },
            ].map((stage) => (
              <div
                key={stage.stage}
                className="relative rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5 pt-7"
              >
                <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-(--color-background-default) border border-(--color-border-default) rounded-full font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint)">
                  {stage.stage}
                </div>
                <span className="font-mono text-[10px] text-(--color-foreground-faint)">
                  {stage.path}
                </span>
                <h3 className="mt-1 font-semibold text-sm text-(--color-foreground-default)">
                  {stage.title}
                </h3>
                {stage.content}
                {stage.footer && (
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-(--color-foreground-faint)">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    </svg>
                    {stage.footer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 grid lg:grid-cols-3 gap-6">
            {[
              [
                "Tier 1 · primitive",
                "Raw OKLCH ramps. --color-blue-600 doesn't know what it'll be used for — it just is.",
              ],
              [
                "Tier 2 · semantic",
                "Role aliases. --color-primary-background-default maps to --color-blue-600 in both light and dark, and re-resolves under any future theme.",
              ],
              [
                "Tier 3 · component",
                "Surface-specific. --color-button-primary-background points at the semantic role — never at the primitive directly.",
              ],
            ].map(([label, desc]) => (
              <div key={label}>
                <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                  {label}
                </p>
                <p className="mt-2 text-sm text-(--color-foreground-muted) leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 · BUILD FLOW ── */}
      <section
        id="build-flow"
        className="border-b border-(--color-border-default)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 mb-10">
            <div className="lg:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                03 · Build flow
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
                One command, four artifacts.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-(--color-foreground-muted) text-lg leading-relaxed">
                Turbo orchestrates the graph. Tokens build first, UI rebuilds
                against the new CSS, and Storybook + Showcase pick up the
                changes through their workspace symlinks. No package republishes
                — everything resolves through pnpm.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Terminal */}
            <div className="lg:col-span-5">
              <div
                className="rounded-xl overflow-hidden shadow-lg"
                style={{
                  background: "var(--color-polar-night-950)",
                  color: "var(--color-polar-night-50)",
                  border:
                    "1px solid color-mix(in oklch, var(--color-border-default) 60%, transparent)",
                }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2"
                  style={{
                    background: "var(--color-gray-900)",
                    borderBottom: "1px solid var(--color-black-bear-700)",
                  }}
                >
                  <div className="flex gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "var(--color-red-400)" }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "var(--color-yellow-400)" }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "var(--color-green-500)" }}
                    />
                  </div>
                  <span
                    className="ml-2 font-mono text-[11px]"
                    style={{ color: "var(--color-gray-500)" }}
                  >
                    ~/wyliedog · main
                  </span>
                  <span
                    className="ml-auto font-mono text-[10px]"
                    style={{ color: "var(--color-gray-500)" }}
                  >
                    zsh
                  </span>
                </div>
                <div className="px-4 py-4 font-mono text-[12px] leading-[1.65] space-y-0.5">
                  <div>
                    <span style={{ color: "var(--color-green-500)" }}>$</span>{" "}
                    pnpm{" "}
                    <span style={{ color: "var(--color-blue-400)" }}>
                      build
                    </span>
                  </div>
                  <div style={{ color: "var(--color-gray-500)" }}>
                    turbo run build
                  </div>
                  <div className="mt-2">
                    <span style={{ color: "var(--color-green-500)" }}>▸</span>{" "}
                    <span style={{ color: "var(--color-fiery-coral-200)" }}>
                      @wyliedog/tokens#build
                    </span>{" "}
                    <span style={{ color: "var(--color-gray-500)" }}>
                      style-dictionary
                    </span>
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "var(--color-gray-500)" }}
                  >
                    → dist/tokens.css{" "}
                    <span style={{ color: "var(--color-green-500)" }}>
                      {meta.tokens.total} vars
                    </span>
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "var(--color-gray-500)" }}
                  >
                    → dist/index.js
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "var(--color-gray-500)" }}
                  >
                    → dist/manifest.json
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "var(--color-green-500)" }}
                  >
                    ✓ done
                  </div>
                  <div className="mt-1">
                    <span style={{ color: "var(--color-green-500)" }}>▸</span>{" "}
                    <span style={{ color: "var(--color-fiery-coral-200)" }}>
                      @wyliedog/ui#build
                    </span>{" "}
                    <span style={{ color: "var(--color-gray-500)" }}>
                      tailwind + tsup
                    </span>
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "var(--color-gray-500)" }}
                  >
                    → dist/index.css
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "var(--color-green-500)" }}
                  >
                    ✓ done · one entry per component (.js · .cjs · .d.ts)
                  </div>
                  <div className="mt-1">
                    <span style={{ color: "var(--color-green-500)" }}>▸</span>{" "}
                    <span style={{ color: "var(--color-fiery-coral-200)" }}>
                      @wyliedog/storybook#build
                    </span>
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "var(--color-green-500)" }}
                  >
                    ✓ build:css, then storybook build
                  </div>
                  <div className="mt-1">
                    <span style={{ color: "var(--color-green-500)" }}>▸</span>{" "}
                    <span style={{ color: "var(--color-fiery-coral-200)" }}>
                      @wyliedog/showcase#build
                    </span>
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "var(--color-green-500)" }}
                  >
                    ✓ next build
                  </div>
                  <div className="mt-1">
                    <span style={{ color: "var(--color-green-500)" }}>$</span>{" "}
                    <span
                      className="inline-block w-1.5 h-3 align-middle"
                      style={{ background: "var(--color-polar-night-50)" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Build flowchart */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-(--color-border-default) bg-(--color-background-default) p-6 shadow-sm">
                <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint) mb-5">
                  Build dependency graph
                </p>
                <ol className="relative space-y-5">
                  <span
                    className="absolute left-3.75 top-3 bottom-3 w-px"
                    style={{
                      background:
                        "linear-gradient(to bottom, color-mix(in oklch, var(--color-primary-background-default) 70%, transparent), color-mix(in oklch, var(--color-primary-background-default) 70%, transparent) 70%, var(--color-border-default))",
                    }}
                  />
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
                          background: "var(--color-primary-background-default)",
                          color: "var(--color-inverse-foreground-default)",
                        }}
                      >
                        {step.n}
                      </span>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-(--color-foreground-default)">
                          {step.title}
                        </h3>
                        <span className="font-mono text-[10px] text-(--color-foreground-faint)">
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
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 · COMPONENT LAYER ── */}
      <section className="border-b border-(--color-border-default) bg-(--color-background-subtle)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                04 · Component layer
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
                Every component, the same five layers.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-(--color-foreground-muted) text-lg leading-relaxed">
                No bespoke component shapes. Components in{" "}
                <span className="font-mono text-sm">@wyliedog/ui</span> are{" "}
                <span className="font-mono text-sm">forwardRef</span> wrappers,
                {` ${meta.stack.radixBackedComponents} of them around a Radix primitive`}
                , with CVA driving variants, Tailwind classes backed by tokens,
                and an <span className="font-mono text-sm">asChild</span> escape
                hatch through Slot where it applies. The excerpt below is
                simplified.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Code panel */}
            <div className="lg:col-span-7">
              <div
                className="rounded-xl overflow-hidden border border-(--color-border-default) shadow-sm"
                style={{ background: "var(--color-polar-night-950)" }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2.5 border-b"
                  style={{
                    background: "var(--color-gray-900)",
                    borderColor: "var(--color-black-bear-700)",
                  }}
                >
                  <div className="flex gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "var(--color-red-400)" }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "var(--color-yellow-400)" }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "var(--color-green-500)" }}
                    />
                  </div>
                  <span
                    className="ml-2 font-mono text-[11px]"
                    style={{ color: "var(--color-gray-500)" }}
                  >
                    Button.tsx
                  </span>
                </div>
                <div className="px-4 py-4 font-mono text-[11px] leading-[1.8] overflow-x-auto">
                  <div>
                    <span style={{ color: "var(--color-blue-400)" }}>
                      import
                    </span>{" "}
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      {"{ forwardRef }"}
                    </span>{" "}
                    <span style={{ color: "var(--color-blue-400)" }}>from</span>{" "}
                    <span style={{ color: "var(--color-green-500)" }}>
                      &quot;react&quot;
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-blue-400)" }}>
                      import
                    </span>{" "}
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      {"{ Slot }"}
                    </span>{" "}
                    <span style={{ color: "var(--color-blue-400)" }}>from</span>{" "}
                    <span style={{ color: "var(--color-green-500)" }}>
                      &quot;@radix-ui/react-slot&quot;
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-blue-400)" }}>
                      import
                    </span>{" "}
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      {"{ cva, type VariantProps }"}
                    </span>{" "}
                    <span style={{ color: "var(--color-blue-400)" }}>from</span>{" "}
                    <span style={{ color: "var(--color-green-500)" }}>
                      &quot;class-variance-authority&quot;
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-blue-400)" }}>
                      import
                    </span>{" "}
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      {"{ cn }"}
                    </span>{" "}
                    <span style={{ color: "var(--color-blue-400)" }}>from</span>{" "}
                    <span style={{ color: "var(--color-green-500)" }}>
                      &quot;./lib/utils&quot;
                    </span>
                  </div>
                  <div className="mt-3">
                    <span style={{ color: "var(--color-blue-400)" }}>
                      const
                    </span>{" "}
                    <span style={{ color: "var(--color-yellow-400)" }}>
                      buttonVariants
                    </span>{" "}
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      =
                    </span>{" "}
                    <span style={{ color: "var(--color-blue-400)" }}>cva</span>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      (
                    </span>
                  </div>
                  <div className="pl-4">
                    <span style={{ color: "var(--color-green-500)" }}>
                      &quot;inline-flex items-center justify-center rounded-md
                      font-medium&quot;
                    </span>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      ,
                    </span>
                  </div>
                  <div className="pl-4">
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      {"{"}
                    </span>
                  </div>
                  <div className="pl-8">
                    <span style={{ color: "var(--color-yellow-400)" }}>
                      variants
                    </span>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      : {"{"}
                    </span>
                  </div>
                  <div className="pl-12">
                    <span style={{ color: "var(--color-yellow-400)" }}>
                      variant
                    </span>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      : {"{"}
                    </span>
                  </div>
                  <div className="pl-16">
                    <span style={{ color: "var(--color-yellow-400)" }}>
                      default
                    </span>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      :
                    </span>{" "}
                    <span style={{ color: "var(--color-green-500)" }}>
                      &quot;bg-(--color-primary-background-default)
                      text-(--color-inverse-foreground-default)&quot;
                    </span>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      ,
                    </span>
                  </div>
                  <div className="pl-16">
                    <span style={{ color: "var(--color-yellow-400)" }}>
                      outline
                    </span>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      :
                    </span>{" "}
                    <span style={{ color: "var(--color-green-500)" }}>
                      &quot;border border-(--color-border-default)
                      bg-transparent&quot;
                    </span>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      ,
                    </span>
                  </div>
                  <div className="pl-12">
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      {"},"}
                    </span>
                  </div>
                  <div className="pl-8">
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      {"}"}
                    </span>
                  </div>
                  <div className="pl-4">
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      {"}"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      )
                    </span>
                  </div>
                  <div className="mt-3">
                    <span style={{ color: "var(--color-blue-400)" }}>
                      export const
                    </span>{" "}
                    <span style={{ color: "var(--color-yellow-400)" }}>
                      Button
                    </span>{" "}
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      = forwardRef&lt;
                    </span>
                    <span style={{ color: "var(--color-fiery-coral-400)" }}>
                      HTMLButtonElement
                    </span>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      ,
                    </span>{" "}
                    <span style={{ color: "var(--color-fiery-coral-400)" }}>
                      ButtonProps
                    </span>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      &gt;(
                    </span>
                  </div>
                  <div className="pl-4">
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      ({"{"}
                    </span>{" "}
                    <span style={{ color: "var(--color-yellow-400)" }}>
                      className, variant, size, asChild, ...props
                    </span>{" "}
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      {"}"}, ref) =&gt; {"{"}
                    </span>
                  </div>
                  <div className="pl-8">
                    <span style={{ color: "var(--color-blue-400)" }}>
                      const
                    </span>{" "}
                    <span style={{ color: "var(--color-yellow-400)" }}>
                      Comp
                    </span>{" "}
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      =
                    </span>{" "}
                    <span style={{ color: "var(--color-yellow-400)" }}>
                      asChild
                    </span>{" "}
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      ?
                    </span>{" "}
                    <span style={{ color: "var(--color-fiery-coral-400)" }}>
                      Slot
                    </span>{" "}
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      :
                    </span>{" "}
                    <span style={{ color: "var(--color-green-500)" }}>
                      &quot;button&quot;
                    </span>
                  </div>
                  <div className="pl-8">
                    <span style={{ color: "var(--color-blue-400)" }}>
                      return
                    </span>{" "}
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      &lt;
                    </span>
                    <span style={{ color: "var(--color-fiery-coral-400)" }}>
                      Comp
                    </span>{" "}
                    <span style={{ color: "var(--color-yellow-400)" }}>
                      ref
                    </span>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      ={"{"}ref{"}"}
                    </span>{" "}
                    <span style={{ color: "var(--color-yellow-400)" }}>
                      className
                    </span>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      ={"{"}cn(buttonVariants({"{"} variant, size {"}"}),
                      className){"}"}
                    </span>{" "}
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      {"{"} ...props {"}"} /&gt;
                    </span>
                  </div>
                  <div className="pl-4">
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      {"}"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-polar-night-50)" }}>
                      )
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer list */}
            <div className="lg:col-span-5 space-y-3">
              {[
                {
                  n: "①",
                  title: "forwardRef-first wrapper types",
                  desc: "Every component accepts a ref, enabling integration with form libraries and animation tools without wrapper divs.",
                },
                {
                  n: "②",
                  title: "CVA variants, compact type strings",
                  desc: "Class variance authority keeps variant logic co-located with the component, generating precise TypeScript types automatically.",
                },
                {
                  n: "③",
                  title: "className merges, static class strings",
                  desc: "cn() merges caller className last so any consumer can override without !important or specificity battles.",
                },
                {
                  n: "④",
                  title: "Base classes: component + token",
                  desc: "Base styles use semantic token variables — bg-(--color-primary-background-default) — so every component automatically respects the active theme.",
                },
                {
                  n: "⑤",
                  title: "asChild via @radix-ui/react-slot",
                  desc: "Pass asChild to render any element or component as the root, preserving all Radix accessibility behavior without an extra DOM node.",
                },
              ].map((layer) => (
                <div
                  key={layer.n}
                  className="flex gap-3 rounded-lg border border-(--color-border-default) bg-(--color-background-default) p-4"
                >
                  <span
                    className="shrink-0 font-mono text-sm font-semibold"
                    style={{ color: "var(--color-primary-foreground-subtle)" }}
                  >
                    {layer.n}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-(--color-foreground-default)">
                      {layer.title}
                    </p>
                    <p className="mt-1 text-sm text-(--color-foreground-muted) leading-relaxed">
                      {layer.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-b border-(--color-border-default)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="glass rounded-2xl p-8 lg:p-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <div className="flex-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight">
                Everything wires together at install time.
              </h2>
              <p className="mt-2 text-(--color-foreground-muted) max-w-xl">
                Two packages. One install. Everything flows through the
                Figma-to-git path, and ends up in the same place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <a
                href="https://wyliedogstorybook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="h-10 rounded-md px-4 font-semibold gap-1.5"
                >
                  Open Storybook
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </Button>
              </a>
              <Link href="/plugin">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-md px-4"
                >
                  Token Bridge to Figma →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
