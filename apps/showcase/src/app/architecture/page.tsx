import React from "react";
import Link from "next/link";
import { Button } from "@wyliedog/ui/button";

export default function ArchitecturePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-(--color-border-primary)">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left */}
            <div className="lg:col-span-5">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-(--color-border-primary) px-3 py-1"
                style={{
                  background:
                    "color-mix(in oklch, var(--color-background-primary) 60%, transparent)",
                }}
              >
                <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-secondary)">
                  02 · Architecture
                </span>
                <span className="text-(--color-text-tertiary)">·</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                  pnpm workspaces
                </span>
              </div>

              <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-[4.25rem] font-semibold tracking-tight leading-[0.98]">
                The monorepo that{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  ships everything
                </span>
                .
              </h1>

              <p className="mt-6 max-w-lg text-lg text-(--color-text-secondary) leading-relaxed">
                Two packages, two apps, one cascade. Tokens flow into UI, UI
                flows into Storybook and the public showcase — all wired at
                install time, no copy-paste between repos.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#packages"
                  className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold"
                  style={{
                    background: "var(--color-interactive-primary)",
                    color: "var(--color-text-inverse)",
                  }}
                >
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
                  className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium border border-(--color-border-primary) text-(--color-text-primary) hover:bg-(--color-background-secondary)"
                >
                  See the build flow
                </a>
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                {[
                  { label: "Packages", value: "2", sub: "+ 2 apps" },
                  {
                    label: "Token tiers",
                    value: "3",
                    sub: "primitive → comp.",
                  },
                  { label: "Cold build", value: "11s", sub: "tokens + ui" },
                ].map((s) => (
                  <div key={s.label}>
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                      {s.label}
                    </dt>
                    <dd className="mt-1 flex items-baseline gap-1">
                      <span className="font-serif text-2xl font-semibold text-(--color-text-primary)">
                        {s.value}
                      </span>
                      <span className="text-xs text-(--color-text-tertiary)">
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
                <div className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
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
                          stroke: color-mix(in oklch, var(--color-interactive-primary) 55%, transparent);
                          stroke-width: 1.4; fill: none;
                          stroke-dasharray: 4 4;
                          animation: edge-flow 3s linear infinite;
                        }
                        .edge-line.muted {
                          stroke: var(--color-border-primary);
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
                        fill="var(--color-interactive-primary)"
                      />
                      <polygon
                        points="116,90 124,90 120,82"
                        fill="var(--color-interactive-primary)"
                      />
                      <polygon
                        points="436,90 444,90 440,82"
                        fill="var(--color-interactive-primary)"
                      />
                    </svg>

                    {/* Node cards */}
                    <div className="absolute inset-0">
                      {/* apps/storybook */}
                      <div
                        className="absolute"
                        style={{ top: "4%", left: "4%", width: "38%" }}
                      >
                        <div className="rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: "oklch(72% 0.15 35)" }}
                              />
                              App
                            </span>
                            <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                              10.2.1
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-(--color-text-primary)">
                            apps/storybook
                          </p>
                          <p className="font-mono text-[10px] text-(--color-text-secondary) mt-0.5">
                            component docs
                          </p>
                        </div>
                      </div>

                      {/* apps/showcase */}
                      <div
                        className="absolute"
                        style={{ top: "4%", right: "4%", width: "38%" }}
                      >
                        <div className="rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: "oklch(72% 0.15 200)" }}
                              />
                              App
                            </span>
                            <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                              Next.js 16
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-(--color-text-primary)">
                            apps/showcase
                          </p>
                          <p className="font-mono text-[10px] text-(--color-text-secondary) mt-0.5">
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
                            borderColor: "var(--color-interactive-primary)",
                            background: "var(--color-background-primary)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider"
                              style={{
                                color: "var(--color-interactive-primary)",
                              }}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  background:
                                    "var(--color-interactive-primary)",
                                }}
                              />
                              Package · components
                            </span>
                            <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                              v1.4.0
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-(--color-text-primary)">
                            packages/ui
                          </p>
                          <p className="font-mono text-[10px] text-(--color-text-secondary) mt-0.5">
                            42 React components on Radix
                          </p>
                        </div>
                      </div>

                      {/* packages/tokens */}
                      <div
                        className="absolute"
                        style={{ bottom: "4%", left: "26%", right: "26%" }}
                      >
                        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-3.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: "oklch(72% 0.15 274)" }}
                              />
                              Package · tokens
                            </span>
                            <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                              v1.4.0
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-(--color-text-primary)">
                            packages/tokens
                          </p>
                          <p className="font-mono text-[10px] text-(--color-text-secondary) mt-0.5">
                            340 OKLCH design tokens
                          </p>
                        </div>
                      </div>

                      {/* Token Bridge satellite */}
                      <div
                        className="absolute"
                        style={{ bottom: "24%", right: "1%", width: "18%" }}
                      >
                        <div className="rounded-md border border-dashed border-(--color-border-primary) bg-(--color-background-primary)/70 p-2">
                          <p className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                            Figma plugin
                          </p>
                          <p className="text-[11px] font-semibold mt-0.5 leading-tight text-(--color-text-primary)">
                            Token Bridge
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-(--color-border-primary) flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block h-px w-6"
                        style={{
                          borderTop:
                            "1.4px dashed var(--color-interactive-primary)",
                        }}
                      />
                      workspace dep
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block h-px w-6"
                        style={{
                          borderTop: "1.4px dashed var(--color-border-primary)",
                        }}
                      />
                      sync only
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1.5 normal-case">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: "oklch(60% 0.14 155)" }}
                      />
                      <span className="text-(--color-text-secondary)">
                        graph in sync · 4m ago
                      </span>
                    </span>
                  </div>
                </div>

                <div className="absolute -bottom-3 right-6 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
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
        className="border-b border-(--color-border-primary)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                01 · Workspaces
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
                Two packages, two apps.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-(--color-text-secondary) text-lg leading-relaxed">
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
              <div className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                    Repo layout
                  </p>
                  <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                    pnpm-workspace.yaml
                  </span>
                </div>
                <div className="font-mono text-[12px] leading-[1.65] text-(--color-text-secondary)">
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
                      badge: "10.2",
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
                    { indent: 1, icon: "file", name: "tsconfig.base.json" },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 py-0.5"
                      style={{ paddingLeft: `${row.indent * 16}px` }}
                    >
                      {row.icon === "folder" ? (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5 text-(--color-text-tertiary) shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 7v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-9l-2-3H4a1 1 0 0 0-1 1v1z" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5 text-(--color-text-tertiary) shrink-0"
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
                          row.indent === 0 ? "text-(--color-text-primary)" : ""
                        }
                      >
                        {row.name}
                      </span>
                      {row.badge && (
                        <span className="ml-auto font-mono text-[10px] text-(--color-text-tertiary)">
                          {row.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary) mb-2">
                    pnpm-workspace.yaml
                  </p>
                  <div className="rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) p-3 font-mono text-[11px] leading-relaxed">
                    <div className="text-(--color-text-secondary)">
                      <span
                        style={{ color: "var(--color-interactive-primary)" }}
                      >
                        packages
                      </span>
                      :
                    </div>
                    <div className="pl-4 text-(--color-text-secondary)">
                      -{" "}
                      <span style={{ color: "oklch(50% 0.14 155)" }}>
                        &quot;packages/*&quot;
                      </span>
                    </div>
                    <div className="pl-4 text-(--color-text-secondary)">
                      -{" "}
                      <span style={{ color: "oklch(50% 0.14 155)" }}>
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
                  version: "v1.4.0",
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
                    ["Outputs", "tokens.css · tokens.js · tokens.d.ts"],
                    ["Depended on by", "@wyliedog/ui"],
                  ],
                  footer: "340 tokens · 6 categories",
                },
                {
                  pkg: "@wyliedog/ui",
                  name: "packages/ui",
                  version: "v1.4.0",
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
                  desc: "42 typed React components, each a forwardRef wrapper around a Radix primitive with CVA variants. Imports tokens.css and re-exports it as @wyliedog/ui/styles.",
                  meta: [
                    ["Stack", "React 19 · TS 5.9 · Vite 7"],
                    ["Foundation", "Radix UI · CVA · Slot"],
                    ["Depended on by", "storybook · showcase"],
                  ],
                  footer: "tree-shakeable · subpath exports",
                },
                {
                  pkg: "@wyliedog/storybook",
                  name: "apps/storybook",
                  version: "v10.2.1",
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
                  iconColor: "oklch(58% 0.18 35)",
                  iconBg:
                    "color-mix(in oklch, oklch(72% 0.15 35) 22%, transparent)",
                  desc: "Component documentation and the pattern playground. Every export from @wyliedog/ui has a story; every story is its own a11y harness, prop matrix, and visual diff target.",
                  meta: [
                    ["Stack", "Storybook 10.2 · Vite 7"],
                    ["Consumes", "@wyliedog/ui"],
                    ["Deploy", "storybook.wyliedog.dev · Vercel"],
                  ],
                  footer: "184 stories · 0 a11y warnings",
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
                  iconColor: "oklch(48% 0.16 200)",
                  iconBg:
                    "color-mix(in oklch, oklch(72% 0.15 200) 22%, transparent)",
                  desc: "The page you're reading. A Next.js 16 App Router site that consumes @wyliedog/ui as its only component dependency — the marketing site eats its own design system.",
                  meta: [
                    ["Stack", "Next.js 16 · App Router"],
                    ["Consumes", "@wyliedog/ui"],
                    ["Deploy", "wyliedog.dev · Vercel edge"],
                  ],
                  footer: "Lighthouse 100 · LCP 0.8s",
                },
              ].map((card) => (
                <article
                  key={card.name}
                  className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5 flex flex-col hover:border-(--color-border-primary)/60 hover:bg-(--color-background-secondary) transition-all"
                >
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="grid h-8 w-8 place-items-center rounded-md"
                        style={{
                          background:
                            card.iconBg ??
                            "color-mix(in oklch, var(--color-interactive-primary) 18%, transparent)",
                          color:
                            card.iconColor ??
                            "var(--color-interactive-primary)",
                        }}
                      >
                        {card.icon}
                      </span>
                      <div>
                        <p className="text-xs font-mono text-(--color-text-tertiary)">
                          {card.pkg}
                        </p>
                        <h3 className="font-semibold text-base text-(--color-text-primary)">
                          {card.name}
                        </h3>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-(--color-text-tertiary) mt-1">
                      {card.version}
                    </span>
                  </header>

                  <p className="mt-4 text-sm text-(--color-text-secondary) leading-relaxed">
                    {card.desc}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                    {card.meta.map(([k, v]) => (
                      <React.Fragment key={k}>
                        <dt className="font-mono uppercase tracking-wider text-(--color-text-tertiary)">
                          {k}
                        </dt>
                        <dd className="text-(--color-text-secondary)">{v}</dd>
                      </React.Fragment>
                    ))}
                  </dl>

                  <footer className="pt-4 border-t border-(--color-border-primary) mt-5 flex items-center gap-2 text-[11px] font-mono text-(--color-text-tertiary)">
                    {card.footerDot && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: "oklch(60% 0.14 155)" }}
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
      <section className="border-b border-(--color-border-primary) bg-(--color-background-secondary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 mb-10">
            <div className="lg:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                02 · Token pipeline
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
                From JSON to{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  CSS variables
                </span>
                , in three tiers.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-(--color-text-secondary) text-lg leading-relaxed">
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
                path: "packages/tokens/src/",
                title: "color.primitive.json",
                content: (
                  <div className="mt-3 rounded-md border border-(--color-border-primary) bg-(--color-background-primary) p-3 font-mono text-[11px] leading-relaxed">
                    <div className="text-(--color-text-secondary)">{"{"}</div>
                    <div className="pl-3 text-(--color-text-secondary)">
                      <span
                        style={{ color: "var(--color-interactive-primary)" }}
                      >
                        &quot;color&quot;
                      </span>
                      : {"{"}
                    </div>
                    <div className="pl-6 text-(--color-text-secondary)">
                      <span
                        style={{ color: "var(--color-interactive-primary)" }}
                      >
                        &quot;violet&quot;
                      </span>
                      : {"{"}
                    </div>
                    <div className="pl-9 text-(--color-text-secondary)">
                      <span
                        style={{ color: "var(--color-interactive-primary)" }}
                      >
                        &quot;500&quot;
                      </span>
                      : {"{"}{" "}
                      <span style={{ color: "oklch(50% 0.14 155)" }}>
                        &quot;oklch(54% .18 274)&quot;
                      </span>{" "}
                      {"}"}
                    </div>
                    <div className="pl-6 text-(--color-text-secondary)">
                      {"}"}
                    </div>
                    <div className="pl-3 text-(--color-text-secondary)">
                      {"}"}
                    </div>
                    <div className="text-(--color-text-secondary)">{"}"}</div>
                  </div>
                ),
                footer: "184 primitive entries",
              },
              {
                stage: "02 · transform",
                path: "style-dictionary.config.ts",
                title: "build pipeline",
                content: (
                  <ul className="mt-3 space-y-2 text-[11px] font-mono">
                    {[
                      "parse JSON refs",
                      "resolve alias chains",
                      "attribute/cti naming",
                      "format → css/variables",
                    ].map((step, i) => (
                      <li key={step} className="flex items-center gap-2">
                        <span
                          className="grid h-4 w-4 place-items-center rounded text-[10px]"
                          style={{
                            background:
                              "color-mix(in oklch, var(--color-interactive-primary) 18%, transparent)",
                            color: "var(--color-interactive-primary)",
                          }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-(--color-text-secondary)">
                          {step}
                        </span>
                      </li>
                    ))}
                    <li className="mt-3 flex items-center gap-2 rounded-md border border-(--color-border-primary) px-2 py-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: "oklch(60% 0.14 155)" }}
                      />
                      <span className="text-(--color-text-secondary)">
                        style-dictionary build
                      </span>
                      <span className="ml-auto text-(--color-text-tertiary)">
                        2.4s
                      </span>
                    </li>
                  </ul>
                ),
                footer: "340 vars emitted",
              },
              {
                stage: "03 · output",
                path: "packages/tokens/dist/",
                title: "tokens.css",
                content: (
                  <div className="mt-3 rounded-md border border-(--color-border-primary) bg-(--color-background-primary) p-3 font-mono text-[11px] leading-relaxed">
                    <div className="text-(--color-text-tertiary) italic">
                      {"/* primitive */"}
                    </div>
                    <div>
                      <span
                        style={{ color: "var(--color-interactive-primary)" }}
                      >
                        --color-violet-500
                      </span>
                      <span className="text-(--color-text-secondary)">
                        : oklch(54% .18 274);
                      </span>
                    </div>
                    <div className="mt-1 text-(--color-text-tertiary) italic">
                      {"/* semantic */"}
                    </div>
                    <div>
                      <span
                        style={{ color: "var(--color-interactive-primary)" }}
                      >
                        --color-interactive-primary
                      </span>
                      <span className="text-(--color-text-secondary)">:</span>
                    </div>
                    <div className="pl-4 text-(--color-text-secondary)">
                      var(--color-violet-500);
                    </div>
                    <div className="mt-1 text-(--color-text-tertiary) italic">
                      {"/* component */"}
                    </div>
                    <div>
                      <span
                        style={{ color: "var(--color-interactive-primary)" }}
                      >
                        --color-button-primary-bg
                      </span>
                      <span className="text-(--color-text-secondary)">:</span>
                    </div>
                    <div className="pl-4 text-(--color-text-secondary)">
                      var(--color-interactive-primary);
                    </div>
                  </div>
                ),
                footer: "184 primitive · 112 semantic · 44 component",
              },
              {
                stage: "04 · consume",
                path: "JSX · Tailwind 4",
                title: "Button.tsx",
                content: (
                  <div className="mt-3">
                    <div className="rounded-md border border-(--color-border-primary) bg-(--color-background-primary) p-3 font-mono text-[11px] leading-relaxed">
                      <div className="text-(--color-text-secondary)">
                        {"<"}button
                      </div>
                      <div className="pl-3 text-(--color-text-secondary)">
                        className=&quot;
                      </div>
                      <div
                        className="pl-6"
                        style={{ color: "var(--color-interactive-primary)" }}
                      >
                        bg-(--color-button-primary-bg)
                      </div>
                      <div
                        className="pl-6"
                        style={{ color: "var(--color-interactive-primary)" }}
                      >
                        text-(--color-text-inverse)
                      </div>
                      <div className="pl-6 text-(--color-text-secondary)">
                        px-4 h-10
                      </div>
                      <div className="pl-3 text-(--color-text-secondary)">
                        &quot;&gt;
                      </div>
                      <div className="pl-3 text-(--color-text-secondary)">
                        Save changes
                      </div>
                      <div className="text-(--color-text-secondary)">
                        {"<"}/button&gt;
                      </div>
                    </div>
                    <div className="mt-2 rounded-md border border-(--color-border-primary) bg-(--color-background-primary) p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary) mb-2">
                        render
                      </p>
                      <button
                        className="inline-flex h-9 items-center rounded-md px-3.5 text-xs font-semibold"
                        style={{
                          background: "var(--color-interactive-primary)",
                          color: "var(--color-text-inverse)",
                        }}
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                ),
                footer: null,
              },
            ].map((stage) => (
              <div
                key={stage.stage}
                className="relative rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5 pt-7"
              >
                <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-(--color-background-primary) border border-(--color-border-primary) rounded-full font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                  {stage.stage}
                </div>
                <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                  {stage.path}
                </span>
                <h3 className="mt-1 font-semibold text-sm text-(--color-text-primary)">
                  {stage.title}
                </h3>
                {stage.content}
                {stage.footer && (
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-(--color-text-tertiary)">
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
                "Raw OKLCH ramps. --color-violet-500 doesn't know what it'll be used for — it just is.",
              ],
              [
                "Tier 2 · semantic",
                "Role aliases. --color-interactive-primary maps to violet-500 in light, violet-400 in dark, and re-resolves under any future theme.",
              ],
              [
                "Tier 3 · component",
                "Surface-specific. --color-button-primary-bg points at the semantic role — never at the primitive directly.",
              ],
            ].map(([label, desc]) => (
              <div key={label}>
                <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                  {label}
                </p>
                <p className="mt-2 text-sm text-(--color-text-secondary) leading-relaxed">
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
        className="border-b border-(--color-border-primary)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 mb-10">
            <div className="lg:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                03 · Build flow
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
                One command, four artifacts.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-(--color-text-secondary) text-lg leading-relaxed">
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
                  background: "oklch(18% 0.014 260)",
                  color: "oklch(92% 0.01 260)",
                  border:
                    "1px solid color-mix(in oklch, var(--color-border-primary) 60%, transparent)",
                }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2"
                  style={{
                    background: "oklch(22% 0.014 260)",
                    borderBottom: "1px solid oklch(28% 0.014 260)",
                  }}
                >
                  <div className="flex gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "oklch(70% 0.18 25)" }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "oklch(80% 0.15 85)" }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "oklch(70% 0.16 145)" }}
                    />
                  </div>
                  <span
                    className="ml-2 font-mono text-[11px]"
                    style={{ color: "oklch(60% 0.012 260)" }}
                  >
                    ~/wyliedog · main
                  </span>
                  <span
                    className="ml-auto font-mono text-[10px]"
                    style={{ color: "oklch(60% 0.012 260)" }}
                  >
                    zsh
                  </span>
                </div>
                <div className="px-4 py-4 font-mono text-[12px] leading-[1.65] space-y-0.5">
                  <div>
                    <span style={{ color: "oklch(72% 0.14 155)" }}>$</span> pnpm{" "}
                    <span style={{ color: "oklch(74% 0.14 274)" }}>build</span>
                  </div>
                  <div style={{ color: "oklch(60% 0.012 260)" }}>
                    turbo run build --filter=...^...
                  </div>
                  <div className="mt-2">
                    <span style={{ color: "oklch(72% 0.14 155)" }}>▸</span>{" "}
                    <span style={{ color: "oklch(80% 0.12 35)" }}>
                      @wyliedog/tokens#build
                    </span>{" "}
                    <span style={{ color: "oklch(60% 0.012 260)" }}>
                      style-dictionary
                    </span>
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "oklch(60% 0.012 260)" }}
                  >
                    → dist/tokens.css{" "}
                    <span style={{ color: "oklch(72% 0.14 155)" }}>
                      340 vars
                    </span>
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "oklch(60% 0.012 260)" }}
                  >
                    → dist/tokens.js
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "oklch(60% 0.012 260)" }}
                  >
                    → dist/tokens.d.ts
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "oklch(72% 0.14 155)" }}
                  >
                    ✓ done in 2.4s
                  </div>
                  <div className="mt-1">
                    <span style={{ color: "oklch(72% 0.14 155)" }}>▸</span>{" "}
                    <span style={{ color: "oklch(80% 0.12 35)" }}>
                      @wyliedog/ui#build
                    </span>{" "}
                    <span style={{ color: "oklch(60% 0.012 260)" }}>
                      vite build
                    </span>
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "oklch(60% 0.012 260)" }}
                  >
                    → dist/index.js{" "}
                    <span style={{ color: "oklch(72% 0.14 155)" }}>194 KB</span>
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "oklch(60% 0.012 260)" }}
                  >
                    → dist/index.d.ts
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "oklch(72% 0.14 155)" }}
                  >
                    ✓ done in 8.6s
                  </div>
                  <div className="mt-1">
                    <span style={{ color: "oklch(72% 0.14 155)" }}>▸</span>{" "}
                    <span style={{ color: "oklch(80% 0.12 35)" }}>
                      @wyliedog/storybook#build
                    </span>
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "oklch(72% 0.14 155)" }}
                  >
                    ✓ cached{" "}
                    <span style={{ color: "oklch(60% 0.012 260)" }}>
                      (no input change)
                    </span>
                  </div>
                  <div className="mt-1">
                    <span style={{ color: "oklch(72% 0.14 155)" }}>▸</span>{" "}
                    <span style={{ color: "oklch(80% 0.12 35)" }}>
                      @wyliedog/showcase#build
                    </span>
                  </div>
                  <div
                    className="pl-4"
                    style={{ color: "oklch(72% 0.14 155)" }}
                  >
                    ✓ cached{" "}
                    <span style={{ color: "oklch(60% 0.012 260)" }}>
                      (no input change)
                    </span>
                  </div>
                  <div
                    className="mt-2"
                    style={{ color: "oklch(72% 0.14 155)" }}
                  >
                    Tasks: 4 successful, 4 total
                  </div>
                  <div style={{ color: "oklch(60% 0.012 260)" }}>
                    Time: 11.0s{" "}
                    <span style={{ color: "oklch(72% 0.14 155)" }}>
                      &gt;&gt;&gt;
                    </span>{" "}
                    FULL TURBO
                  </div>
                  <div className="mt-1">
                    <span style={{ color: "oklch(72% 0.14 155)" }}>$</span>{" "}
                    <span
                      className="inline-block w-1.5 h-3 align-middle"
                      style={{ background: "oklch(92% 0.01 260)" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Build flowchart */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-(--color-border-primary) bg-(--color-background-primary) p-6 shadow-sm">
                <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary) mb-5">
                  Build dependency graph
                </p>
                <ol className="relative space-y-5">
                  <span
                    className="absolute left-3.75 top-3 bottom-3 w-px"
                    style={{
                      background:
                        "linear-gradient(to bottom, color-mix(in oklch, var(--color-interactive-primary) 70%, transparent), color-mix(in oklch, var(--color-interactive-primary) 70%, transparent) 70%, var(--color-border-primary))",
                    }}
                  />
                  {[
                    {
                      n: "1",
                      title: "Tokens build",
                      meta: "2.4s · style-dictionary",
                      desc: "Reads JSON source files, resolves aliases, emits tokens.css with all 340 custom properties plus JS and TypeScript types.",
                    },
                    {
                      n: "2",
                      title: "UI build",
                      meta: "8.6s · vite build",
                      desc: "Picks up the fresh tokens.css via workspace symlink. Vite bundles all 42 components into a tree-shakeable ESM output.",
                    },
                    {
                      n: "3",
                      title: "Storybook",
                      meta: "cached · no change",
                      desc: "Turborepo cache hit — no input files changed, no rebuild needed. Stories stay live against the new token values.",
                    },
                    {
                      n: "4",
                      title: "Showcase",
                      meta: "cached · no change",
                      desc: "Next.js build also cached. The public site reflects the new token values without a full rebuild.",
                    },
                  ].map((step) => (
                    <li key={step.n} className="relative pl-12">
                      <span
                        className="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full font-mono text-xs font-semibold"
                        style={{
                          background: "var(--color-interactive-primary)",
                          color: "var(--color-text-inverse)",
                        }}
                      >
                        {step.n}
                      </span>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-(--color-text-primary)">
                          {step.title}
                        </h3>
                        <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                          {step.meta}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-(--color-text-secondary) leading-relaxed">
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
      <section className="border-b border-(--color-border-primary) bg-(--color-background-secondary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                04 · Component layer
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
                Every component, the same five layers.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-(--color-text-secondary) text-lg leading-relaxed">
                No bespoke component shapes. Every export from{" "}
                <span className="font-mono text-sm">@wyliedog/ui</span> is a{" "}
                <span className="font-mono text-sm">forwardRef</span> wrapper
                around a Radix primitive, with CVA drives variants, Tailwind
                drives the prose, and an{" "}
                <span className="font-mono text-sm">asChild</span> escape hatch
                through Slot.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Code panel */}
            <div className="lg:col-span-7">
              <div
                className="rounded-xl overflow-hidden border border-(--color-border-primary) shadow-sm"
                style={{ background: "oklch(18% 0.014 260)" }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2.5 border-b"
                  style={{
                    background: "oklch(22% 0.014 260)",
                    borderColor: "oklch(28% 0.014 260)",
                  }}
                >
                  <div className="flex gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "oklch(70% 0.18 25)" }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "oklch(80% 0.15 85)" }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "oklch(70% 0.16 145)" }}
                    />
                  </div>
                  <span
                    className="ml-2 font-mono text-[11px]"
                    style={{ color: "oklch(60% 0.012 260)" }}
                  >
                    Button.tsx
                  </span>
                </div>
                <div className="px-4 py-4 font-mono text-[11px] leading-[1.8] overflow-x-auto">
                  <div>
                    <span style={{ color: "oklch(72% 0.14 274)" }}>import</span>{" "}
                    <span style={{ color: "oklch(92% 0.01 260)" }}>
                      {"{ forwardRef }"}
                    </span>{" "}
                    <span style={{ color: "oklch(72% 0.14 274)" }}>from</span>{" "}
                    <span style={{ color: "oklch(72% 0.14 155)" }}>
                      &quot;react&quot;
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "oklch(72% 0.14 274)" }}>import</span>{" "}
                    <span style={{ color: "oklch(92% 0.01 260)" }}>
                      {"{ Slot }"}
                    </span>{" "}
                    <span style={{ color: "oklch(72% 0.14 274)" }}>from</span>{" "}
                    <span style={{ color: "oklch(72% 0.14 155)" }}>
                      &quot;@radix-ui/react-slot&quot;
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "oklch(72% 0.14 274)" }}>import</span>{" "}
                    <span style={{ color: "oklch(92% 0.01 260)" }}>
                      {"{ cva, type VariantProps }"}
                    </span>{" "}
                    <span style={{ color: "oklch(72% 0.14 274)" }}>from</span>{" "}
                    <span style={{ color: "oklch(72% 0.14 155)" }}>
                      &quot;class-variance-authority&quot;
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "oklch(72% 0.14 274)" }}>import</span>{" "}
                    <span style={{ color: "oklch(92% 0.01 260)" }}>
                      {"{ cn }"}
                    </span>{" "}
                    <span style={{ color: "oklch(72% 0.14 274)" }}>from</span>{" "}
                    <span style={{ color: "oklch(72% 0.14 155)" }}>
                      &quot;./lib/utils&quot;
                    </span>
                  </div>
                  <div className="mt-3">
                    <span style={{ color: "oklch(72% 0.14 274)" }}>const</span>{" "}
                    <span style={{ color: "oklch(82% 0.14 85)" }}>
                      buttonVariants
                    </span>{" "}
                    <span style={{ color: "oklch(92% 0.01 260)" }}>=</span>{" "}
                    <span style={{ color: "oklch(72% 0.14 274)" }}>cva</span>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>(</span>
                  </div>
                  <div className="pl-4">
                    <span style={{ color: "oklch(72% 0.14 155)" }}>
                      &quot;inline-flex items-center justify-center rounded-md
                      font-medium&quot;
                    </span>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>,</span>
                  </div>
                  <div className="pl-4">
                    <span style={{ color: "oklch(92% 0.01 260)" }}>{"{"}</span>
                  </div>
                  <div className="pl-8">
                    <span style={{ color: "oklch(82% 0.14 85)" }}>
                      variants
                    </span>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>
                      : {"{"}
                    </span>
                  </div>
                  <div className="pl-12">
                    <span style={{ color: "oklch(82% 0.14 85)" }}>variant</span>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>
                      : {"{"}
                    </span>
                  </div>
                  <div className="pl-16">
                    <span style={{ color: "oklch(82% 0.14 85)" }}>default</span>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>:</span>{" "}
                    <span style={{ color: "oklch(72% 0.14 155)" }}>
                      &quot;bg-(--color-interactive-primary)
                      text-(--color-text-inverse)&quot;
                    </span>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>,</span>
                  </div>
                  <div className="pl-16">
                    <span style={{ color: "oklch(82% 0.14 85)" }}>outline</span>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>:</span>{" "}
                    <span style={{ color: "oklch(72% 0.14 155)" }}>
                      &quot;border border-(--color-border-primary)
                      bg-transparent&quot;
                    </span>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>,</span>
                  </div>
                  <div className="pl-12">
                    <span style={{ color: "oklch(92% 0.01 260)" }}>{"},"}</span>
                  </div>
                  <div className="pl-8">
                    <span style={{ color: "oklch(92% 0.01 260)" }}>{"}"}</span>
                  </div>
                  <div className="pl-4">
                    <span style={{ color: "oklch(92% 0.01 260)" }}>{"}"}</span>
                  </div>
                  <div>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>)</span>
                  </div>
                  <div className="mt-3">
                    <span style={{ color: "oklch(72% 0.14 274)" }}>
                      export const
                    </span>{" "}
                    <span style={{ color: "oklch(82% 0.14 85)" }}>Button</span>{" "}
                    <span style={{ color: "oklch(92% 0.01 260)" }}>
                      = forwardRef&lt;
                    </span>
                    <span style={{ color: "oklch(72% 0.14 35)" }}>
                      HTMLButtonElement
                    </span>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>,</span>{" "}
                    <span style={{ color: "oklch(72% 0.14 35)" }}>
                      ButtonProps
                    </span>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>&gt;(</span>
                  </div>
                  <div className="pl-4">
                    <span style={{ color: "oklch(92% 0.01 260)" }}>({"{"}</span>{" "}
                    <span style={{ color: "oklch(82% 0.14 85)" }}>
                      className, variant, size, asChild, ...props
                    </span>{" "}
                    <span style={{ color: "oklch(92% 0.01 260)" }}>
                      {"}"}, ref) =&gt; {"{"}
                    </span>
                  </div>
                  <div className="pl-8">
                    <span style={{ color: "oklch(72% 0.14 274)" }}>const</span>{" "}
                    <span style={{ color: "oklch(82% 0.14 85)" }}>Comp</span>{" "}
                    <span style={{ color: "oklch(92% 0.01 260)" }}>=</span>{" "}
                    <span style={{ color: "oklch(82% 0.14 85)" }}>asChild</span>{" "}
                    <span style={{ color: "oklch(92% 0.01 260)" }}>?</span>{" "}
                    <span style={{ color: "oklch(72% 0.14 35)" }}>Slot</span>{" "}
                    <span style={{ color: "oklch(92% 0.01 260)" }}>:</span>{" "}
                    <span style={{ color: "oklch(72% 0.14 155)" }}>
                      &quot;button&quot;
                    </span>
                  </div>
                  <div className="pl-8">
                    <span style={{ color: "oklch(72% 0.14 274)" }}>return</span>{" "}
                    <span style={{ color: "oklch(92% 0.01 260)" }}>&lt;</span>
                    <span style={{ color: "oklch(72% 0.14 35)" }}>
                      Comp
                    </span>{" "}
                    <span style={{ color: "oklch(82% 0.14 85)" }}>ref</span>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>
                      ={"{"}ref{"}"}
                    </span>{" "}
                    <span style={{ color: "oklch(82% 0.14 85)" }}>
                      className
                    </span>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>
                      ={"{"}cn(buttonVariants({"{"} variant, size {"}"}),
                      className){"}"}
                    </span>{" "}
                    <span style={{ color: "oklch(92% 0.01 260)" }}>
                      {"{"} ...props {"}"} /&gt;
                    </span>
                  </div>
                  <div className="pl-4">
                    <span style={{ color: "oklch(92% 0.01 260)" }}>{"}"}</span>
                  </div>
                  <div>
                    <span style={{ color: "oklch(92% 0.01 260)" }}>)</span>
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
                  desc: "Base styles use semantic token variables — bg-(--color-interactive-primary) — so every component automatically respects the active theme.",
                },
                {
                  n: "⑤",
                  title: "asChild via @radix-ui/react-slot",
                  desc: "Pass asChild to render any element or component as the root, preserving all Radix accessibility behavior without an extra DOM node.",
                },
              ].map((layer) => (
                <div
                  key={layer.n}
                  className="flex gap-3 rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) p-4"
                >
                  <span
                    className="shrink-0 font-mono text-sm font-semibold"
                    style={{ color: "var(--color-interactive-primary)" }}
                  >
                    {layer.n}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-(--color-text-primary)">
                      {layer.title}
                    </p>
                    <p className="mt-1 text-sm text-(--color-text-secondary) leading-relaxed">
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
      <section className="border-b border-(--color-border-primary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="glass rounded-2xl p-8 lg:p-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <div className="flex-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight">
                Everything wires together at install time.
              </h2>
              <p className="mt-2 text-(--color-text-secondary) max-w-xl">
                Two packages. One install. Everything flows through the
                Figma-to-git path, and ends up in the same place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link href="https://storybook.wyliedog.dev">
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
              </Link>
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
