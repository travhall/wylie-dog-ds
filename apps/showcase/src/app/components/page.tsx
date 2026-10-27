import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@wyliedog/ui/breadcrumb";
import { SectionSubnav } from "@/components/section-subnav";
import { getShowcaseMeta, getStoryDocsUrl } from "@/lib/showcase-metadata";

/* ─── Reusable comp card ─────────────────────────────────────── */
function CompCard({
  name,
  desc,
  href,
  preview,
}: {
  name: string;
  desc: string;
  href: string;
  preview: React.ReactNode;
}) {
  const dotGrid = {
    backgroundImage:
      "radial-gradient(color-mix(in oklch, var(--color-foreground-default) 8%, transparent) 1px, transparent 1px)",
    backgroundSize: "16px 16px",
  };
  return (
    <article
      className="rounded-xl border border-(--color-border-muted) bg-(--color-background-default) overflow-hidden flex flex-col hover:border-(--color-border-default) transition-all"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="relative bg-(--color-background-muted) border-b border-(--color-border-default) h-42 flex items-center justify-center overflow-hidden p-4"
        style={dotGrid}
      >
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {preview}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <p className="font-semibold text-sm text-(--color-foreground-default)">
          {name}
        </p>
        <p className="text-xs text-(--color-foreground-muted) leading-relaxed">
          {desc}
        </p>
        <a
          href={getStoryDocsUrl(href)}
          className="mt-2 inline-flex items-center gap-1 font-mono text-[0.625rem] uppercase tracking-wider text-(--color-foreground-faint) hover:text-(--color-foreground-primary-muted) transition-colors"
        >
          Storybook
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      </div>
    </article>
  );
}

/* ─── Section header ─────────────────────────────────────────── */
function SectionHeader({
  num,
  title,
  desc,
  count,
}: {
  num: string;
  title: string;
  desc: string;
  count: number;
}) {
  return (
    <header className="grid lg:grid-cols-12 gap-6 mb-10">
      <div className="lg:col-span-5">
        <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-(--color-foreground-faint)">
          {num} · Category
        </span>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
          {title}
        </h2>
      </div>
      <div className="lg:col-span-7 flex lg:items-end">
        <p className="text-(--color-foreground-muted)">
          {desc}{" "}
          <span className="font-mono text-xs text-(--color-foreground-faint) ml-2">
            {count} components
          </span>
        </p>
      </div>
    </header>
  );
}

/* ─── Mini Avatar ────────────────────────────────────────────── */
function Av({
  bg,
  text,
  size = 40,
  fontSize = 12,
  children,
}: {
  bg: string;
  text: string;
  size?: number;
  fontSize?: number;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-grid place-items-center rounded-full font-semibold border-2 border-(--color-background-default)"
      style={{
        background: bg,
        color: text,
        height: size,
        width: size,
        fontSize,
      }}
    >
      {children}
    </span>
  );
}

export default function ComponentsPage() {
  const meta = getShowcaseMeta();
  const categoryCount = (dirName: string) =>
    meta.componentCategories.find((c) => c.dirName === dirName)?.count ?? 0;
  return (
    <div className="min-h-screen bg-(--color-background-default)">
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-(--color-border-default)">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklch, var(--color-foreground-default) 14%, transparent) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklch, var(--color-background-primary) 22%, transparent) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* left */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-(--color-border-default) bg-(--color-background-default)/60 px-3 py-1">
                <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-(--color-foreground-muted)">
                  03 · Components
                </span>
                <span className="text-(--color-foreground-faint)">·</span>
                <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-(--color-foreground-faint)">
                  @wyliedog/ui v{meta.versions.ui}
                </span>
              </div>

              <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-[4.25rem] font-semibold tracking-tight leading-[0.98] text-(--color-foreground-default)">
                {meta.components.count} components.
                <br />
                All tokens.{" "}
                <span
                  style={{ color: "var(--color-foreground-primary-muted)" }}
                >
                  All accessible.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg text-(--color-foreground-muted) text-balance">
                The full Wylie Dog catalog — every component is a typed React
                export, wired to the OKLCH token system, with Radix UI
                primitives underneath where they exist, and tested for{" "}
                <span className="font-mono text-sm">WCAG 2.2 AA</span>.
              </p>

              <dl className="mt-10 flex flex-wrap gap-6 max-w-xl">
                {[
                  { label: "Components", value: String(meta.components.count) },
                  {
                    label: "Categories",
                    value: String(meta.components.categories),
                  },
                  {
                    label: "On Radix",
                    value: `${meta.stack.radixBackedComponents}/${meta.components.count}`,
                  },
                  { label: "Tested for", value: "WCAG 2.2" },
                ].map(({ label, value }) => (
                  <div key={label} className="self-stretch">
                    <dt className="font-mono text-[0.625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                      {label}
                    </dt>
                    <dd className="mt-1 font-serif text-2xl font-semibold text-(--color-foreground-default)">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* right: live composition */}
            <div className="lg:col-span-6">
              <div className="relative">
                <div
                  className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-wider text-(--color-foreground-muted)"
                  style={{
                    background:
                      "color-mix(in oklch, var(--color-background-emphasis) 80%, transparent)",
                    backdropFilter: "blur(12px)",
                    border:
                      "1px solid color-mix(in oklch, var(--color-border-default) 70%, transparent)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: "var(--color-foreground-success-muted)",
                    }}
                  />
                  7 components rendered
                </div>

                <div
                  className="rounded-2xl p-5 sm:p-6"
                  style={{
                    background:
                      "color-mix(in oklch, var(--color-background-default) 70%, transparent)",
                    backdropFilter: "blur(12px)",
                    border:
                      "1px solid color-mix(in oklch, var(--color-border-default) 80%, transparent)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  <div
                    className="rounded-lg border border-(--color-border-default) p-5"
                    style={{ background: "var(--color-background-default)" }}
                  >
                    {/* Avatar + badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-grid place-items-center rounded-full font-semibold text-xs"
                          style={{
                            background: "var(--color-blue-300)",
                            color: "var(--color-blue-950)",
                            height: "2.375rem",
                            width: "2.375rem",
                          }}
                        >
                          EM
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-(--color-foreground-default)">
                            Elena Mori
                          </p>
                          {/* cSpell:ignore Mori */}
                          <p className="text-[0.6875rem] text-(--color-foreground-faint)">
                            Lead, Design Systems
                          </p>
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium"
                        style={{
                          background: "var(--color-background-success-muted)",
                          color: "var(--color-foreground-success-muted)",
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: "var(--color-foreground-success-muted)",
                          }}
                        />
                        Online
                      </span>
                    </div>

                    {/* Separator */}
                    <div
                      className="my-4 h-px"
                      style={{ background: "var(--color-border-default)" }}
                    />

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-(--color-foreground-muted)">
                          v1.4 release readiness
                        </span>
                        <span className="font-mono text-(--color-foreground-faint)">
                          82%
                        </span>
                      </div>
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full"
                        style={{
                          background: "var(--color-background-emphasis)",
                        }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: "82%",
                            background: "var(--color-background-primary)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Input */}
                    <label className="mt-5 block text-[0.6875rem] font-medium text-(--color-foreground-muted)">
                      Search components
                    </label>
                    <div
                      className="mt-1 flex items-center gap-2 h-8.5 rounded-[0.625rem] border px-2.5 text-sm"
                      style={{
                        borderColor: "var(--color-border-primary)",
                        boxShadow:
                          "0 0 0 3px color-mix(in oklch, var(--color-background-primary) 22%, transparent)",
                        background: "var(--color-background-default)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 text-(--color-foreground-faint)"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                      <span className="text-(--color-foreground-default)">
                        Dialog
                      </span>
                      <span className="ml-auto font-mono text-xs px-1.5 py-0.5 rounded border border-(--color-border-default) text-(--color-foreground-muted)">
                        ⌘K
                      </span>
                    </div>

                    {/* Switch row */}
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-(--color-foreground-default)">
                          Dark mode preview
                        </p>
                        <p className="text-[0.6875rem] text-(--color-foreground-faint)">
                          render every story in both themes
                        </p>
                      </div>
                      <span
                        className="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full"
                        style={{
                          background: "var(--color-background-primary)",
                        }}
                      >
                        <span
                          className="inline-block h-4 w-4 translate-x-4 rounded-full"
                          style={{
                            background: "var(--color-foreground-inverse)",
                          }}
                        />
                      </span>
                    </div>

                    {/* Buttons */}
                    <div className="mt-5 flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs font-semibold"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 gap-1 text-xs font-semibold"
                      >
                        Run audit
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  {/* component tag strip */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[0.625rem] uppercase tracking-wider text-(--color-foreground-faint) mr-1">
                      uses
                    </span>
                    {[
                      "Card",
                      "Avatar",
                      "Badge",
                      "Separator",
                      "Progress",
                      "Input",
                      "Switch",
                      "Button",
                    ].map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center rounded-full border border-(--color-border-default) bg-(--color-background-default) px-2 py-0.5 font-mono text-[0.625rem] text-(--color-foreground-muted)"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKY CATEGORY RAIL ───────────────────────────────── */}
      <SectionSubnav
        sections={[
          {
            n: "01",
            label: "Content Display",
            id: "content-display",
            count: categoryCount("Content-Display"),
          },
          {
            n: "02",
            label: "Feedback & Status",
            id: "feedback",
            count: categoryCount("Feedback-Status"),
          },
          {
            n: "03",
            label: "Inputs & Controls",
            id: "inputs",
            count: categoryCount("Inputs-Controls"),
          },
          {
            n: "04",
            label: "Layout & Structure",
            id: "layout",
            count: categoryCount("Layout-Structure"),
          },
          {
            n: "05",
            label: "Navigation",
            id: "navigation",
            count: categoryCount("Navigation"),
          },
          {
            n: "06",
            label: "Overlays & Popovers",
            id: "overlays",
            count: categoryCount("Overlays-Popovers"),
          },
        ]}
        label="Component categories"
        meta={`${meta.components.count} total`}
      />

      {/* ══════════════════════════════════════════════════════════
          01 — CONTENT DISPLAY (7)
          ══════════════════════════════════════════════════════════ */}
      <section
        id="content-display"
        className="border-b border-(--color-border-default) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <SectionHeader
            num="01"
            title="Content Display"
            desc="Surfaces that present information — cards, tables, calendars, carousels. Compose them; don't customize them."
            count={categoryCount("Content-Display")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <CompCard
              name="Accordion"
              desc="Vertically stacked sections that expand one at a time or independently."
              href="accordion"
              preview={
                <div className="w-full max-w-55 rounded-md border border-(--color-border-default) bg-(--color-background-default) overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold border-b border-(--color-border-default) bg-(--color-background-muted)">
                    <span>Shipping</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      style={{
                        color: "var(--color-foreground-primary-muted)",
                        transform: "rotate(180deg)",
                      }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  <div className="px-3 py-2 text-[0.6875rem] text-(--color-foreground-muted)">
                    Free over $50, 2-day delivery on stock items.
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 text-xs border-t border-(--color-border-default)">
                    <span>Returns</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 text-(--color-foreground-faint)"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 text-xs border-t border-(--color-border-default)">
                    <span>Warranty</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 text-(--color-foreground-faint)"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Avatar"
              desc="Image with a fallback for initials or an icon, in four sizes (sm to xl)."
              href="avatar"
              preview={
                <div className="flex items-center gap-3">
                  {[
                    {
                      bg: "var(--color-fiery-coral-300)",
                      color: "var(--color-fiery-coral-950)",
                      init: "EM",
                    },
                    {
                      bg: "var(--color-blue-300)",
                      color: "var(--color-blue-950)",
                      init: "JR",
                    },
                    {
                      bg: "var(--color-green-300)",
                      color: "var(--color-green-950)",
                      init: "AK",
                    },
                  ].map(({ bg, color, init }) => (
                    <span
                      key={init}
                      className="inline-grid place-items-center rounded-full text-xs font-semibold"
                      style={{
                        background: bg,
                        color,
                        height: "2.5rem",
                        width: "2.5rem",
                      }}
                    >
                      {init}
                    </span>
                  ))}
                  <span
                    className="inline-grid place-items-center rounded-full text-[0.6875rem] font-medium"
                    style={{
                      background: "var(--color-background-emphasis)",
                      color: "var(--color-foreground-muted)",
                      height: "2.5rem",
                      width: "2.5rem",
                    }}
                  >
                    +8
                  </span>
                </div>
              }
            />

            <CompCard
              name="Badge"
              desc="Small status pill — default, secondary, outline, success, warning, destructive, in three sizes."
              href="badge"
              preview={
                <div className="flex flex-col gap-2 items-center">
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold"
                      style={{
                        background: "var(--color-background-primary)",
                        color: "var(--color-foreground-primary)",
                      }}
                    >
                      Default
                    </span>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-medium border border-(--color-border-default) text-(--color-foreground-default)">
                      Outline
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium"
                      style={{
                        background: "var(--color-background-success-muted)",
                        color: "var(--color-foreground-success-muted)",
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: "var(--color-foreground-success-muted)",
                        }}
                      />
                      Active
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-medium"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-foreground-warning-muted) 18%, transparent)",
                        color: "var(--color-foreground-warning-muted)",
                      }}
                    >
                      Beta
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-medium"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-foreground-danger-muted) 18%, transparent)",
                        color: "var(--color-foreground-danger-muted)",
                      }}
                    >
                      Deprecated
                    </span>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Calendar"
              desc="Single date, multiple dates, or a date range, with month navigation."
              href="calendar"
              preview={
                <div className="rounded-md border border-(--color-border-default) bg-(--color-background-default) p-2 w-full max-w-55">
                  <div className="flex items-center justify-between text-[0.6875rem] font-semibold pb-1.5 text-(--color-foreground-default)">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 text-(--color-foreground-faint)"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    <span>May 2026</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 text-(--color-foreground-faint)"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 font-mono text-[0.5rem] text-(--color-foreground-faint) text-center">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 mt-1 text-[0.625rem] text-center text-(--color-foreground-default)">
                    {["26", "27", "28", "29", "30", "1", "2"].map((d, i) => (
                      <span
                        key={i}
                        className={
                          i < 4
                            ? "text-(--color-foreground-faint) py-0.5"
                            : "py-0.5"
                        }
                      >
                        {d}
                      </span>
                    ))}
                    {["3", "4", "5", "6", "7", "8", "9"].map((d, i) => (
                      <span key={i} className="py-0.5">
                        {d}
                      </span>
                    ))}
                    <span
                      className="py-0.5 rounded font-semibold"
                      style={{
                        background: "var(--color-background-primary)",
                        color: "var(--color-foreground-primary)",
                      }}
                    >
                      10
                    </span>
                    {["11", "12", "13", "14", "15", "16"].map((d, i) => (
                      <span key={i} className="py-0.5">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              }
            />

            <CompCard
              name="Card"
              desc="A surface with header, title, description, content and footer slots, plus an optional interactive (hover) state."
              href="card"
              preview={
                <div
                  className="w-full max-w-55 rounded-md border border-(--color-border-default) bg-(--color-background-default) p-3"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <p className="text-[0.625rem] font-mono uppercase tracking-wider text-(--color-foreground-faint)">
                    Project
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-(--color-foreground-default)">
                    Migration to v1.4
                  </p>
                  <p className="mt-1 text-[0.625rem] text-(--color-foreground-faint) leading-snug">
                    68 components migrated · 6 outstanding tickets
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {[
                        [
                          "var(--color-fiery-coral-300)",
                          "var(--color-fiery-coral-950)",
                          "EM",
                        ],
                        [
                          "var(--color-blue-300)",
                          "var(--color-blue-950)",
                          "JR",
                        ],
                      ].map(([bg, c, i]) => (
                        <span
                          key={i}
                          className="inline-grid place-items-center rounded-full font-semibold border-[1.5px] border-(--color-background-default) text-[0.5rem]"
                          style={{
                            background: bg,
                            color: c,
                            height: "1.125rem",
                            width: "1.125rem",
                          }}
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                    <span
                      className="ml-auto inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.5625rem] font-medium"
                      style={{
                        background: "var(--color-background-success-muted)",
                        color: "var(--color-foreground-success-muted)",
                      }}
                    >
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{
                          background: "var(--color-foreground-success-muted)",
                        }}
                      />
                      Active
                    </span>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Carousel"
              desc="Slider with previous and next controls for cycling through items."
              href="carousel"
              preview={
                <div className="w-full max-w-57.5 flex items-center gap-2">
                  <Button
                    aria-label="Previous"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full shrink-0"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </Button>
                  <div className="flex-1 grid grid-cols-3 gap-1.5">
                    <div
                      className="aspect-3/4 rounded"
                      style={{ background: "var(--color-fiery-coral-300)" }}
                    />
                    <div
                      className="aspect-3/4 rounded ring-2 ring-(--color-border-primary)"
                      style={{ background: "var(--color-blue-400)" }}
                    />
                    <div
                      className="aspect-3/4 rounded"
                      style={{ background: "var(--color-green-300)" }}
                    />
                  </div>
                  <Button
                    aria-label="Next"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full shrink-0"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Button>
                </div>
              }
            />

            <CompCard
              name="Table"
              desc="Semantic table parts — header, body, footer, row, head, cell, caption — in a horizontally scrollable wrapper."
              href="table"
              preview={
                <div className="w-full max-w-57.5 rounded-md border border-(--color-border-default) bg-(--color-background-default) overflow-hidden text-[0.625rem]">
                  <div
                    className="grid px-2.5 py-1.5 font-mono uppercase tracking-wider text-(--color-foreground-faint) text-[0.5rem] bg-(--color-background-muted)"
                    style={{
                      gridTemplateColumns: "1.4fr 1fr 0.8fr",
                      gap: "0.5rem",
                    }}
                  >
                    <span>Name</span>
                    <span>Role</span>
                    <span className="text-right">Status</span>
                  </div>
                  {[
                    {
                      name: "Elena Mori",
                      role: "Lead",
                      status: "Active",
                      color: "var(--color-foreground-success-muted)",
                    },
                    {
                      name: "Jude Reyes",
                      role: "Eng",
                      status: "—",
                      color: null,
                    },
                    {
                      name: "Ari Klein",
                      role: "Design",
                      status: "Away",
                      color: "var(--color-foreground-warning-muted)",
                    },
                  ].map(({ name, role, status, color }) => (
                    <div
                      key={name}
                      className="grid px-2.5 py-1.5 border-t border-(--color-border-default) items-center"
                      style={{
                        gridTemplateColumns: "1.4fr 1fr 0.8fr",
                        gap: "0.5rem",
                      }}
                    >
                      <span className="text-(--color-foreground-default)">
                        {name}
                      </span>
                      <span className="text-(--color-foreground-muted)">
                        {role}
                      </span>
                      <span className="text-right">
                        {color ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-1 py-0 text-[0.5rem] font-medium"
                            style={{
                              background: color.replace(
                                "--color-foreground-",
                                "--color-background-"
                              ),
                              color,
                            }}
                          >
                            {status}
                          </span>
                        ) : (
                          <span className="text-(--color-foreground-faint)">
                            —
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          02 — FEEDBACK & STATUS (4)
          ══════════════════════════════════════════════════════════ */}
      <section
        id="feedback"
        className="border-b border-(--color-border-default) bg-(--color-background-muted) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <SectionHeader
            num="02"
            title="Feedback & Status"
            desc="Tell the user what's happening — is it loading, did it work, did something go wrong? All four states map to the same role tokens."
            count={categoryCount("Feedback-Status")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <CompCard
              name="Alert"
              desc="Inline status banner — default, success, warning, destructive."
              href="alert"
              preview={
                <div className="w-full max-w-57.5 flex flex-col gap-1.5">
                  {[
                    {
                      color: "var(--color-foreground-success-muted)",
                      msg: "Build passed · 3,402 tests",
                      icon: "m5 12 5 5L20 7",
                    },
                    {
                      color: "var(--color-foreground-warning-muted)",
                      msg: "2 deprecation warnings",
                      icon: "M12 9v4M12 17h.01",
                    },
                    {
                      color: "var(--color-foreground-danger-muted)",
                      msg: "Connection lost · retrying",
                      icon: "M18 6 6 18M6 6l12 12",
                    },
                  ].map(({ color, msg, icon }) => (
                    <div
                      key={msg}
                      className="flex items-start gap-2 rounded-md border px-2.5 py-1.5"
                      style={{
                        borderColor: `color-mix(in oklch, ${color} 35%, transparent)`,
                        background: `color-mix(in oklch, ${color} 10%, transparent)`,
                      }}
                    >
                      <span
                        className="grid h-3.5 w-3.5 mt-px place-items-center rounded-full shrink-0"
                        style={{
                          background: color,
                          color: "var(--color-foreground-inverse)",
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-2 w-2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path d={icon} />
                        </svg>
                      </span>
                      <p className="text-[0.625rem] font-semibold leading-tight text-(--color-foreground-default)">
                        {msg}
                      </p>
                    </div>
                  ))}
                </div>
              }
            />

            <CompCard
              name="Progress"
              desc="Linear progress bar with default, success, warning and destructive variants."
              href="progress"
              preview={
                <div className="w-full max-w-55 flex flex-col gap-3">
                  <div>
                    <div className="flex items-center justify-between text-[0.625rem] mb-1">
                      <span className="text-(--color-foreground-muted)">
                        Uploading
                      </span>
                      <span className="font-mono text-(--color-foreground-faint)">
                        68%
                      </span>
                    </div>
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full"
                      style={{ background: "var(--color-background-emphasis)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "68%",
                          background: "var(--color-background-primary)",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[0.625rem] mb-1">
                      <span className="text-(--color-foreground-muted)">
                        Indexing
                      </span>
                      <span className="font-mono text-(--color-foreground-faint)">
                        indeterminate
                      </span>
                    </div>
                    <div
                      className="relative h-1.5 w-full overflow-hidden rounded-full"
                      style={{ background: "var(--color-background-emphasis)" }}
                    >
                      <div
                        className="absolute h-full w-1/3 rounded-full animate-pulse"
                        style={{
                          background: "var(--color-background-primary)",
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="var(--color-background-emphasis)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="var(--color-border-primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="88"
                        strokeDashoffset="26"
                      />
                    </svg>
                    <span className="font-mono text-[0.625rem] text-(--color-foreground-faint)">
                      circular · 70%
                    </span>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Skeleton"
              desc="Placeholder shapes — default, text, circular, rectangular — with a pulse animation."
              href="skeleton"
              preview={
                <div className="w-full max-w-55 flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-full animate-pulse"
                    style={{ background: "var(--color-background-emphasis)" }}
                  />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div
                      className="h-2 w-3/4 rounded-full animate-pulse"
                      style={{ background: "var(--color-background-emphasis)" }}
                    />
                    <div
                      className="h-2 w-1/2 rounded-full animate-pulse"
                      style={{ background: "var(--color-background-emphasis)" }}
                    />
                    <div
                      className="h-2 w-2/3 rounded-full animate-pulse"
                      style={{ background: "var(--color-background-emphasis)" }}
                    />
                  </div>
                </div>
              }
            />

            <CompCard
              name="Toast"
              desc="Transient notifications with default, success, warning and destructive variants and auto-dismiss."
              href="toast"
              preview={
                <div className="w-full max-w-57.5 flex flex-col gap-1.5 items-end">
                  <div
                    className="rounded-md border border-(--color-border-default) bg-(--color-background-default) p-2 flex items-start gap-2 w-full"
                    style={{ boxShadow: "var(--shadow-md)" }}
                  >
                    <span
                      className="grid h-5 w-5 place-items-center rounded-full shrink-0"
                      style={{
                        background: "var(--color-foreground-success-muted)",
                        color: "var(--color-foreground-inverse)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-2.5 w-2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.625rem] font-semibold text-(--color-foreground-default)">
                        Theme published
                      </p>
                      <p className="text-[0.5625rem] text-(--color-foreground-faint)">
                        v1.4.0 is live in production
                      </p>
                    </div>
                    <Button
                      aria-label="Dismiss"
                      variant="ghost"
                      className="h-3.5 w-3.5 p-0 text-(--color-foreground-faint)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-2.5 w-2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                  <div
                    className="rounded-md border border-(--color-border-default) bg-(--color-background-default) p-2 flex items-start gap-2 w-[90%]"
                    style={{ boxShadow: "var(--shadow-sm)", opacity: 0.7 }}
                  >
                    <span
                      className="h-5 w-5 rounded-full shrink-0"
                      style={{ background: "var(--color-background-emphasis)" }}
                    />
                    <div
                      className="flex-1 h-3 rounded-full"
                      style={{ background: "var(--color-background-emphasis)" }}
                    />
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          03 — INPUTS & CONTROLS (13)
          ══════════════════════════════════════════════════════════ */}
      <section
        id="inputs"
        className="border-b border-(--color-border-default) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <SectionHeader
            num="03"
            title="Inputs & Controls"
            desc="The shape of every form. They share sizes, the focus ring and error styling, and the Form wrappers connect labels and messages to them."
            count={categoryCount("Inputs-Controls")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <CompCard
              name="Button"
              desc="Six variants (default, secondary, outline, ghost, link, destructive), sm to lg sizes plus an icon size, and a loading state."
              href="button"
              preview={
                <div className="flex flex-col gap-2 items-center">
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    <span
                      className="inline-flex h-7 items-center rounded-md px-2.5 text-[0.6875rem] font-semibold"
                      style={{
                        background: "var(--color-background-primary)",
                        color: "var(--color-foreground-primary)",
                      }}
                    >
                      Primary
                    </span>
                    <span className="inline-flex h-7 items-center rounded-md border border-(--color-border-default) px-2.5 text-[0.6875rem] font-semibold text-(--color-foreground-default)">
                      Outline
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    <span className="inline-flex h-7 items-center rounded-md px-2.5 text-[0.6875rem] font-semibold text-(--color-foreground-muted)">
                      Ghost
                    </span>
                    <span
                      className="inline-flex h-7 items-center rounded-md px-2.5 text-[0.6875rem] font-semibold"
                      style={{
                        background:
                          "var(--color-button-destructive-background)",
                        color: "var(--color-button-destructive-text)",
                      }}
                    >
                      Destructive
                    </span>
                  </div>
                  <span
                    className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[0.6875rem] font-semibold"
                    style={{
                      background: "var(--color-background-primary-emphasis)",
                      color: "var(--color-foreground-primary)",
                      boxShadow:
                        "0 0 0 3px color-mix(in oklch, var(--color-background-primary) 25%, transparent)",
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full border-2 border-t-transparent animate-spin"
                      style={{
                        borderColor:
                          "var(--color-foreground-inverse) transparent var(--color-foreground-inverse) var(--color-foreground-inverse)",
                      }}
                    />
                    Loading
                  </span>
                </div>
              }
            />

            <CompCard
              name="Checkbox"
              desc="Checked, unchecked and indeterminate states in three sizes."
              href="checkbox"
              preview={
                <div className="flex flex-col gap-2.5 text-[0.6875rem] text-(--color-foreground-default)">
                  <label className="flex items-center gap-2">
                    <span
                      className="grid h-4 w-4 place-items-center rounded-sm"
                      style={{
                        background: "var(--color-background-primary)",
                        color: "var(--color-foreground-primary)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3.5}
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    Send weekly digest
                  </label>
                  <label className="flex items-center gap-2">
                    <span
                      className="grid h-4 w-4 place-items-center rounded-sm"
                      style={{
                        background: "var(--color-background-primary)",
                        color: "var(--color-foreground-primary)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3.5}
                      >
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                    Notify on every release
                  </label>
                  <label className="flex items-center gap-2 text-(--color-foreground-muted)">
                    <span
                      className="grid h-4 w-4 rounded-sm border"
                      style={{
                        background: "var(--color-background-default)",
                        borderColor: "var(--color-border-default)",
                      }}
                    />
                    Show breaking changes only
                  </label>
                </div>
              }
            />

            <CompCard
              name="Form"
              desc="Field wrappers that tie labels, descriptions and error messages to inputs with matching ids and aria attributes."
              href="form"
              preview={
                <div className="w-full max-w-57.5 flex flex-col gap-1.5">
                  <label className="text-[0.625rem] font-medium text-(--color-foreground-default)">
                    Email
                  </label>
                  <div className="flex items-center h-7.5 border border-(--color-border-default) rounded-md px-2 text-[0.6875rem] bg-(--color-background-default)">
                    <span className="text-(--color-foreground-default)">
                      elena@wyliedog.dev
                    </span>
                  </div>
                  <p
                    className="text-[0.5625rem]"
                    style={{ color: "var(--color-foreground-danger-muted)" }}
                  >
                    Must be a work email address.
                  </p>
                  <label className="text-[0.625rem] font-medium text-(--color-foreground-default) mt-1">
                    Password
                  </label>
                  <div
                    className="flex items-center h-7.5 border rounded-md px-2 text-[0.6875rem] bg-(--color-background-default)"
                    style={{
                      borderColor: "var(--color-border-danger)",
                    }}
                  >
                    <span className="text-(--color-foreground-faint)">
                      ••••••••
                    </span>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Input"
              desc="Text-style input for any native type, with sm to lg sizes and error and success states."
              href="input"
              preview={
                <div className="w-full max-w-57.5 flex flex-col gap-1.5">
                  <div className="flex items-center h-8.5 border border-(--color-border-default) rounded-[0.625rem] px-2.5 gap-2 text-[0.75rem] bg-(--color-background-default)">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 text-(--color-foreground-faint)"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <span className="text-(--color-foreground-faint)">
                      Search components…
                    </span>
                  </div>
                  <div
                    className="flex items-center h-8.5 border rounded-[0.625rem] px-2.5 text-[0.75rem] bg-(--color-background-default)"
                    style={{
                      borderColor: "var(--color-border-primary)",
                      boxShadow:
                        "0 0 0 3px color-mix(in oklch, var(--color-background-primary) 22%, transparent)",
                    }}
                  >
                    <span className="text-(--color-foreground-default)">
                      elena@wyliedog.dev
                    </span>
                  </div>
                  <div className="flex items-center h-8.5 border border-(--color-border-default) rounded-[0.625rem] px-2.5 text-[0.75rem] bg-(--color-background-default) opacity-55">
                    <span className="text-(--color-foreground-faint)">
                      Disabled
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 ml-auto text-(--color-foreground-faint)"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Label"
              desc="Accessible label with a required marker, an error state and three sizes."
              href="label"
              preview={
                <div className="w-full max-w-55 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-semibold text-(--color-foreground-default)">
                      Display name
                    </label>
                    <span
                      style={{ color: "var(--color-foreground-danger-muted)" }}
                    >
                      *
                    </span>
                  </div>
                  <div className="flex items-center h-7.5 border border-(--color-border-default) rounded-md px-2 text-[0.6875rem] bg-(--color-background-default) text-(--color-foreground-faint)">
                    e.g. Elena Mori
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <label className="text-xs font-semibold text-(--color-foreground-default)">
                      Bio
                    </label>
                    <span className="font-mono text-[0.5625rem] text-(--color-foreground-faint)">
                      optional
                    </span>
                  </div>
                  <div className="flex items-start min-h-9.5 border border-(--color-border-default) rounded-md px-2 pt-1.5 text-[0.6875rem] bg-(--color-background-default) text-(--color-foreground-faint)">
                    Tell people who you are.
                  </div>
                </div>
              }
            />

            <CompCard
              name="Radio Group"
              desc="Single-select cluster with horizontal or vertical orientation."
              href="radio-group"
              preview={
                <div className="flex flex-col gap-2 text-[0.6875rem] text-(--color-foreground-default)">
                  <label className="flex items-center gap-2">
                    <span
                      className="grid h-4 w-4 place-items-center rounded-full border-2"
                      style={{
                        borderColor: "var(--color-border-primary)",
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: "var(--color-background-primary)",
                        }}
                      />
                    </span>
                    Light theme
                  </label>
                  <label className="flex items-center gap-2 text-(--color-foreground-muted)">
                    <span
                      className="h-4 w-4 rounded-full border"
                      style={{ borderColor: "var(--color-border-default)" }}
                    />
                    Dark theme
                  </label>
                  <label className="flex items-center gap-2 text-(--color-foreground-muted)">
                    <span
                      className="h-4 w-4 rounded-full border"
                      style={{ borderColor: "var(--color-border-default)" }}
                    />
                    System default
                  </label>
                </div>
              }
            />

            <CompCard
              name="Select"
              desc="Dropdown with groups, separators and keyboard navigation, in three sizes."
              href="select"
              preview={
                <div className="w-full max-w-55 relative">
                  <div className="flex items-center h-8.5 border border-(--color-border-default) rounded-[0.625rem] px-2.5 gap-2 text-[0.75rem] bg-(--color-background-default) text-(--color-foreground-default)">
                    <span className="flex-1">Engineering</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 text-(--color-foreground-faint)"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  <div
                    className="absolute top-full mt-1 left-0 right-0 rounded-md border border-(--color-border-default) bg-(--color-background-default) p-1 z-10"
                    style={{ boxShadow: "var(--shadow-md)" }}
                  >
                    <div
                      className="flex items-center gap-2 rounded px-2 py-1 text-[0.6875rem]"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-background-primary) 12%, transparent)",
                        color: "var(--color-foreground-primary-muted)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-2.5 w-2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                      Engineering
                    </div>
                    <div className="px-2 py-1 text-[0.6875rem] text-(--color-foreground-muted)">
                      Design
                    </div>
                    <div className="px-2 py-1 text-[0.6875rem] text-(--color-foreground-muted)">
                      Operations
                    </div>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Slider"
              desc="Single-value or range slider, horizontal or vertical, with optional thumb labels."
              href="slider"
              preview={
                <div className="w-full max-w-57.5 flex flex-col gap-3">
                  <div>
                    <div className="flex justify-between text-[0.625rem] mb-1.5">
                      <span className="text-(--color-foreground-muted)">
                        Volume
                      </span>
                      <span className="font-mono text-(--color-foreground-faint)">
                        62
                      </span>
                    </div>
                    <div
                      className="relative h-1 rounded-full"
                      style={{ background: "var(--color-background-emphasis)" }}
                    >
                      <div
                        className="absolute h-1 rounded-full"
                        style={{
                          width: "62%",
                          background: "var(--color-background-primary)",
                        }}
                      />
                      <div
                        className="absolute h-3 w-3 rounded-full -mt-1"
                        style={{
                          left: "62%",
                          transform: "translateX(-50%)",
                          background: "var(--color-background-default)",
                          border: "2px solid var(--color-background-primary)",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[0.625rem] mb-1.5">
                      <span className="text-(--color-foreground-muted)">
                        Range
                      </span>
                      <span className="font-mono text-(--color-foreground-faint)">
                        24 – 78
                      </span>
                    </div>
                    <div
                      className="relative h-1 rounded-full"
                      style={{ background: "var(--color-background-emphasis)" }}
                    >
                      <div
                        className="absolute h-1 rounded-full"
                        style={{
                          left: "24%",
                          width: "54%",
                          background: "var(--color-background-primary)",
                        }}
                      />
                      <div
                        className="absolute h-3 w-3 rounded-full -mt-1"
                        style={{
                          left: "24%",
                          transform: "translateX(-50%)",
                          background: "var(--color-background-default)",
                          border: "2px solid var(--color-background-primary)",
                        }}
                      />
                      <div
                        className="absolute h-3 w-3 rounded-full -mt-1"
                        style={{
                          left: "78%",
                          transform: "translateX(-50%)",
                          background: "var(--color-background-default)",
                          border: "2px solid var(--color-background-primary)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Switch"
              desc="Boolean toggle in three sizes with accessible labeling."
              href="switch"
              preview={
                <div className="flex flex-col gap-2.5 text-[0.6875rem] text-(--color-foreground-default)">
                  <div className="flex items-center justify-between gap-3">
                    <span>Auto-deploy</span>
                    <span
                      className="relative inline-flex h-5 w-9 items-center rounded-full"
                      style={{
                        background: "var(--color-background-primary)",
                      }}
                    >
                      <span
                        className="inline-block h-4 w-4 translate-x-4 rounded-full"
                        style={{
                          background: "var(--color-foreground-inverse)",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Beta channel</span>
                    <span
                      className="relative inline-flex h-5 w-9 items-center rounded-full"
                      style={{ background: "var(--color-background-emphasis)" }}
                    >
                      <span
                        className="inline-block h-4 w-4 translate-x-0.5 rounded-full"
                        style={{
                          background: "var(--color-background-default)",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 opacity-55">
                    <span>
                      Telemetry{" "}
                      <span className="font-mono text-[0.5625rem] text-(--color-foreground-faint)">
                        disabled
                      </span>
                    </span>
                    <span
                      className="relative inline-flex h-5 w-9 items-center rounded-full"
                      style={{ background: "var(--color-background-emphasis)" }}
                    >
                      <span
                        className="inline-block h-4 w-4 translate-x-0.5 rounded-full"
                        style={{
                          background: "var(--color-background-default)",
                        }}
                      />
                    </span>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Textarea"
              desc="Multi-line input with three sizes, a resize option, and error and success states."
              href="textarea"
              preview={
                <div
                  className="w-full max-w-57.5 rounded-md border bg-(--color-background-default) px-2.5 py-2 text-[0.6875rem] text-(--color-foreground-default)"
                  style={{
                    borderColor: "var(--color-border-primary)",
                    boxShadow:
                      "0 0 0 3px color-mix(in oklch, var(--color-background-primary) 22%, transparent)",
                    height: "6.25rem",
                  }}
                >
                  <p>
                    Designers can edit tokens directly in Figma; the bridge
                    opens a pull request with the diff.
                  </p>
                  <p className="text-(--color-foreground-faint) mt-1 font-mono text-[0.5625rem]">
                    142 / 280
                  </p>
                </div>
              }
            />

            {/* cSpell:ignore pressable */}
            <CompCard
              name="Toggle"
              desc="A two-state pressable button — the foundation for Toggle Group."
              href="toggle"
              preview={
                <div className="flex gap-1.5">
                  <Button
                    aria-label="Bold"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    style={{
                      background:
                        "color-mix(in oklch, var(--color-background-primary) 18%, transparent)",
                      color: "var(--color-foreground-primary-muted)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path d="M6 4v16M14 6h2a4 4 0 0 1 0 8h-2zM14 14h3a4 4 0 0 1 0 8h-3z" />
                    </svg>
                  </Button>
                  <Button
                    aria-label="Italic"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path d="M19 4h-9M14 20H5M15 4 9 20" />
                    </svg>
                  </Button>
                  <Button
                    aria-label="Text style"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path d="M4 7V4h16M9 20h6M12 4v16" />
                    </svg>
                  </Button>
                </div>
              }
            />

            <CompCard
              name="Toggle Group"
              desc="Single or multi-select group of toggles."
              href="toggle-group"
              preview={
                <div className="flex flex-col gap-2 items-center">
                  <div
                    className="inline-flex rounded-md border border-(--color-border-default) overflow-hidden"
                    style={{ background: "var(--color-background-muted)" }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-3 py-1.5 text-[0.6875rem] font-medium"
                      style={{
                        background: "var(--color-background-default)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      Day
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-3 py-1.5 text-[0.6875rem] font-medium text-(--color-foreground-muted)"
                    >
                      Week
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-3 py-1.5 text-[0.6875rem] font-medium text-(--color-foreground-muted)"
                    >
                      Month
                    </Button>
                  </div>
                  <div className="inline-flex rounded-md border border-(--color-border-default) overflow-hidden">
                    <Button
                      aria-label="Justify"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-8"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-background-primary) 14%, transparent)",
                        color: "var(--color-foreground-primary-muted)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path d="M21 10H3M21 6H3M21 14H3M21 18H3" />
                      </svg>
                    </Button>
                    <Button
                      aria-label="Align right"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-8 text-(--color-foreground-muted)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path d="M21 10H7M21 6H3M21 14H3M21 18H7" />
                      </svg>
                    </Button>
                    <Button
                      aria-label="Align right, narrow"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-8 text-(--color-foreground-muted)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path d="M21 10H10M21 6H3M21 14H3M21 18H10" />
                      </svg>
                    </Button>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          04 — LAYOUT & STRUCTURE (5)
          ══════════════════════════════════════════════════════════ */}
      <section
        id="layout"
        className="border-b border-(--color-border-default) bg-(--color-background-muted) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <SectionHeader
            num="04"
            title="Layout & Structure"
            desc="The shape of the page itself — aspect, scroll, split, collapse. Headless utilities you compose around your content."
            count={categoryCount("Layout-Structure")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <CompCard
              name="Aspect Ratio"
              desc="Maintain a fixed ratio for media or canvases regardless of viewport."
              href="aspect-ratio"
              preview={
                <div className="w-full max-w-50 flex gap-1.5">
                  <div
                    className="aspect-video flex-1 rounded border border-(--color-border-default) flex items-center justify-center font-mono text-[0.5625rem] text-(--color-foreground-muted)"
                    style={{ background: "var(--color-background-emphasis)" }}
                  >
                    16 : 9
                  </div>
                </div>
              }
            />

            <CompCard
              name="Collapsible"
              desc="A single open/closed disclosure region — the building block of Accordion."
              href="collapsible"
              preview={
                <div className="w-full max-w-55">
                  <div className="flex items-center justify-between text-xs font-semibold py-1 text-(--color-foreground-default)">
                    <span>Advanced settings</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      style={{
                        color: "var(--color-foreground-primary-muted)",
                        transform: "rotate(180deg)",
                      }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  <div
                    className="mt-1 space-y-1.5 pl-2 border-l-2"
                    style={{
                      borderColor: "var(--color-border-primary)",
                    }}
                  >
                    <div className="text-[0.625rem] text-(--color-foreground-muted)">
                      → Network timeout
                    </div>
                    <div className="text-[0.625rem] text-(--color-foreground-muted)">
                      → Retry strategy
                    </div>
                    <div className="text-[0.625rem] text-(--color-foreground-muted)">
                      → Cache invalidation
                    </div>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Resizable"
              desc="Split panes with drag handles — horizontal, vertical, nested."
              href="resizable"
              preview={
                <div className="w-full max-w-55 flex h-25 rounded-md border border-(--color-border-default) overflow-hidden bg-(--color-background-default)">
                  <div className="flex-[0_0_38%] grid place-items-center font-mono text-[0.625rem] text-(--color-foreground-faint)">
                    Sidebar
                  </div>
                  <div
                    className="w-1 grid place-items-center cursor-col-resize"
                    style={{ background: "var(--color-border-default)" }}
                  >
                    <div
                      className="h-6 w-1 rounded-full"
                      style={{
                        background: "var(--color-background-primary)",
                      }}
                    />
                  </div>
                  <div
                    className="flex-1 grid place-items-center font-mono text-[0.625rem] text-(--color-foreground-faint)"
                    style={{ background: "var(--color-background-muted)" }}
                  >
                    Main
                  </div>
                </div>
              }
            />

            <CompCard
              name="Scroll Area"
              desc="Custom-styled scrollbars (Radix Scroll Area)."
              href="scroll-area"
              preview={
                <div className="w-full max-w-50 h-27.5 rounded-md border border-(--color-border-default) bg-(--color-background-default) overflow-hidden flex">
                  <div className="flex-1 p-2 text-[0.625rem] leading-relaxed text-(--color-foreground-muted) overflow-hidden">
                    <p className="font-semibold text-(--color-foreground-default)">
                      Changelog
                    </p>
                    <p>v1.4.0 — OKLCH ramps</p>
                    <p>v1.3.2 — Toast variants</p>
                    <p>v1.3.1 — Fix focus ring</p>
                    <p>v1.3.0 — Calendar locales</p>
                    <p className="text-(--color-foreground-faint)">
                      v1.2.4 — Pagination
                    </p>
                  </div>
                  <div
                    className="w-1.5 my-1 mr-1 rounded-full relative"
                    style={{
                      background:
                        "color-mix(in oklch, var(--color-border-default) 50%, transparent)",
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1/3 rounded-full"
                      style={{ background: "var(--color-border-default)" }}
                    />
                  </div>
                </div>
              }
            />

            <CompCard
              name="Separator"
              desc="Horizontal or vertical divider, optionally purely decorative."
              href="separator"
              preview={
                <div className="w-full max-w-55 flex flex-col gap-2 items-center">
                  <p className="text-[0.6875rem] font-semibold text-(--color-foreground-default)">
                    Workspace
                  </p>
                  <div
                    className="h-px w-full"
                    style={{ background: "var(--color-border-default)" }}
                  />
                  <p className="text-[0.625rem] text-(--color-foreground-muted)">
                    Settings · Members · Billing
                  </p>
                  <div className="flex items-center gap-2 w-full">
                    <span
                      className="flex-1 h-px"
                      style={{ background: "var(--color-border-default)" }}
                    />
                    <span className="font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                      or
                    </span>
                    <span
                      className="flex-1 h-px"
                      style={{ background: "var(--color-border-default)" }}
                    />
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          05 — NAVIGATION (6)
          ══════════════════════════════════════════════════════════ */}
      <section
        id="navigation"
        className="border-b border-(--color-border-default) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <SectionHeader
            num="05"
            title="Navigation"
            desc="Way finding — from a single breadcrumb to a global command palette. They share the same focus-ring token."
            count={categoryCount("Navigation")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <CompCard
              name="Breadcrumb"
              desc="Navigation trail with a customizable separator and an ellipsis item for long paths."
              href="breadcrumb"
              preview={
                <Breadcrumb className="text-xs">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Components</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Inputs</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Select</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              }
            />

            <CompCard
              name="Command"
              desc="Searchable command list — input, groups, items, shortcuts and an empty state."
              href="command"
              preview={
                <div
                  className="w-full max-w-65 rounded-md border border-(--color-border-default) bg-(--color-background-default)"
                  style={{ boxShadow: "var(--shadow-md)" }}
                >
                  <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-(--color-border-default)">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 text-(--color-foreground-faint)"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <span className="text-[0.6875rem] text-(--color-foreground-faint)">
                      Type a command…
                    </span>
                    <span className="ml-auto font-mono text-[0.625rem] px-1 py-0.5 rounded border border-(--color-border-default) text-(--color-foreground-muted)">
                      esc
                    </span>
                  </div>
                  <div className="p-1">
                    <div
                      className="rounded px-2 py-1 text-[0.6875rem] flex items-center gap-2"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-background-primary) 14%, transparent)",
                        color: "var(--color-foreground-primary-muted)",
                      }}
                    >
                      Open documentation
                    </div>
                    <div className="px-2 py-1 text-[0.6875rem] text-(--color-foreground-muted)">
                      New token…
                    </div>
                    <div className="px-2 py-1 text-[0.6875rem] text-(--color-foreground-muted)">
                      Toggle theme
                    </div>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Menubar"
              desc="Application-style top bar with cascading menus and keyboard shortcuts."
              href="menubar"
              preview={
                <div className="w-full max-w-65 flex flex-col gap-1">
                  <div className="flex items-center gap-1 rounded-md border border-(--color-border-default) bg-(--color-background-default) px-1 py-1 text-[0.6875rem]">
                    <span
                      className="px-2 py-0.5 rounded font-medium text-(--color-foreground-default)"
                      style={{
                        background: "var(--color-background-muted)",
                      }}
                    >
                      File
                    </span>
                    <span className="px-2 py-0.5 text-(--color-foreground-muted)">
                      Edit
                    </span>
                    <span className="px-2 py-0.5 text-(--color-foreground-muted)">
                      View
                    </span>
                    <span className="px-2 py-0.5 text-(--color-foreground-muted)">
                      Help
                    </span>
                  </div>
                  <div
                    className="rounded-md border border-(--color-border-default) bg-(--color-background-default) p-1 self-start"
                    style={{ boxShadow: "var(--shadow-md)" }}
                  >
                    <div className="flex items-center justify-between gap-4 px-2 py-1 text-[0.6875rem] text-(--color-foreground-default)">
                      <span>New project</span>
                      <span className="font-mono text-[0.625rem] px-1 py-0.5 rounded border border-(--color-border-default) text-(--color-foreground-muted)">
                        ⌘N
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-2 py-1 text-[0.6875rem] text-(--color-foreground-default)">
                      <span>Open</span>
                      <span className="font-mono text-[0.625rem] px-1 py-0.5 rounded border border-(--color-border-default) text-(--color-foreground-muted)">
                        ⌘O
                      </span>
                    </div>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Navigation Menu"
              desc="Multi-level top nav with mega-menu panels and viewport positioning."
              href="navigation-menu"
              preview={
                <div className="w-full max-w-65">
                  <div className="rounded-md border border-(--color-border-default) bg-(--color-background-default) flex items-center px-2 py-1 text-[0.6875rem] gap-1">
                    <span
                      className="px-2 py-0.5 rounded font-medium text-(--color-foreground-default)"
                      style={{
                        background: "var(--color-background-muted)",
                      }}
                    >
                      Products
                    </span>
                    <span className="px-2 py-0.5 text-(--color-foreground-muted)">
                      Solutions
                    </span>
                    <span className="px-2 py-0.5 text-(--color-foreground-muted)">
                      Pricing
                    </span>
                    <span className="px-2 py-0.5 text-(--color-foreground-muted)">
                      Docs
                    </span>
                  </div>
                  <div
                    className="mt-1 rounded-md border border-(--color-border-default) bg-(--color-background-default) p-2 grid grid-cols-2 gap-1.5 text-[0.625rem]"
                    style={{ boxShadow: "var(--shadow-md)", width: "86%" }}
                  >
                    <div
                      className="rounded p-1.5"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-background-primary) 12%, transparent)",
                      }}
                    >
                      <p
                        className="font-semibold"
                        style={{
                          color: "var(--color-foreground-primary-muted)",
                        }}
                      >
                        Tokens
                      </p>
                      <p className="text-(--color-foreground-faint)">
                        {meta.tokens.total} vars
                      </p>
                    </div>
                    <div className="rounded p-1.5">
                      <p className="font-semibold text-(--color-foreground-default)">
                        Components
                      </p>
                      <p className="text-(--color-foreground-faint)">
                        {meta.components.count} React
                      </p>
                    </div>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Pagination"
              desc="Page links with previous and next controls, an ellipsis and an active state."
              href="pagination"
              preview={
                <div className="flex items-center gap-1 text-[0.6875rem]">
                  <Button
                    aria-label="Previous"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 opacity-50"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7">
                    1
                  </Button>
                  <Button size="icon" className="h-7 w-7 font-semibold">
                    2
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7">
                    3
                  </Button>
                  <span className="px-1 text-(--color-foreground-faint)">
                    …
                  </span>
                  <Button variant="outline" size="icon" className="h-7 w-7">
                    12
                  </Button>
                  <Button
                    aria-label="Next"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Button>
                </div>
              }
            />

            <CompCard
              name="Tabs"
              desc="Tabbed content panels in three sizes (Radix Tabs)."
              href="tabs"
              preview={
                <div className="w-full max-w-57.5">
                  <div className="flex border-b border-(--color-border-default) text-xs text-(--color-foreground-default)">
                    <span
                      className="-mb-px border-b-2 px-3 py-1.5 font-medium"
                      style={{
                        borderColor: "var(--color-border-primary)",
                      }}
                    >
                      Overview
                    </span>
                    <span className="px-3 py-1.5 text-(--color-foreground-faint)">
                      Activity
                    </span>
                    <span className="px-3 py-1.5 text-(--color-foreground-faint)">
                      Members
                    </span>
                  </div>
                  <div
                    className="mt-2 rounded-md p-2 text-[0.625rem] text-(--color-foreground-muted)"
                    style={{ background: "var(--color-background-muted)" }}
                  >
                    Migration plan, owners, and current status for v1.4.
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          06 — OVERLAYS & POPOVERS (8)
          ══════════════════════════════════════════════════════════ */}
      <section
        id="overlays"
        className="border-b border-(--color-border-default) bg-(--color-background-muted) scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <SectionHeader
            num="06"
            title="Overlays & Popovers"
            desc="Anything that floats above the page — modal, sheet, popover, tooltip. All eight go through Radix's portal and share focus-trap and dismiss behavior."
            count={categoryCount("Overlays-Popovers")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <CompCard
              name="Alert Dialog"
              desc="Confirmation modal for destructive actions — cannot be dismissed by overlay click."
              href="alert-dialog"
              preview={
                <div
                  className="w-full max-w-57.5 rounded-md border bg-(--color-background-default) p-3"
                  style={{
                    borderColor: "var(--color-border-default)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="grid h-6 w-6 place-items-center rounded-full"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-foreground-danger-muted) 18%, transparent)",
                        color: "var(--color-foreground-danger-muted)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path d="M12 9v4M12 17h.01" />
                        <path d="m12 4 10 16H2z" />
                      </svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-(--color-foreground-default)">
                        Delete project?
                      </p>
                      <p className="text-[0.625rem] text-(--color-foreground-faint) mt-0.5 leading-snug">
                        All migrations, tickets, and tokens will be permanently
                        removed.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-1.5">
                    <span className="inline-flex h-6 items-center rounded border border-(--color-border-default) px-2 text-[0.625rem] font-medium text-(--color-foreground-default)">
                      Cancel
                    </span>
                    <span
                      className="inline-flex h-6 items-center rounded px-2 text-[0.625rem] font-semibold"
                      style={{
                        background:
                          "var(--color-button-destructive-background)",
                        color: "var(--color-button-destructive-text)",
                      }}
                    >
                      Delete
                    </span>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Context Menu"
              desc="Right-click menu with sub-items, checkboxes, and shortcut hints."
              href="context-menu"
              preview={
                <div className="w-full max-w-57.5 relative h-30 rounded-md border border-(--color-border-default) bg-(--color-background-default)">
                  <div
                    className="absolute rounded-md border border-(--color-border-default) bg-(--color-background-default) p-1 text-[0.6875rem]"
                    style={{
                      top: "1.25rem",
                      left: "1.25rem",
                      boxShadow: "var(--shadow-md)",
                      width: "8.125rem",
                    }}
                  >
                    <div
                      className="flex items-center justify-between px-2 py-1 rounded"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-background-primary) 12%, transparent)",
                        color: "var(--color-foreground-primary-muted)",
                      }}
                    >
                      <span>Copy</span>
                      <span className="font-mono text-[0.5625rem]">⌘C</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 text-(--color-foreground-muted)">
                      <span>Paste</span>
                      <span className="font-mono text-[0.5625rem]">⌘V</span>
                    </div>
                    <div
                      className="h-px my-1"
                      style={{ background: "var(--color-border-default)" }}
                    />
                    <div
                      className="px-2 py-1"
                      style={{ color: "var(--color-foreground-danger-muted)" }}
                    >
                      Delete
                    </div>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Dialog"
              desc="Modal panel with header, footer, and overlay — the workhorse modal."
              href="dialog"
              preview={
                <div className="relative w-full max-w-57.5 h-30">
                  <div
                    className="absolute inset-0 rounded-md"
                    style={{
                      background:
                        "color-mix(in oklch, var(--color-foreground-default) 35%, transparent)",
                    }}
                  />
                  <div
                    className="absolute inset-x-2 top-3 rounded-md border bg-(--color-background-default) p-3"
                    style={{
                      borderColor: "var(--color-border-default)",
                      boxShadow: "var(--shadow-xl)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-(--color-foreground-default)">
                        Invite teammates
                      </p>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3 text-(--color-foreground-faint)"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="mt-2 flex items-center h-6.5 border border-(--color-border-default) rounded-md px-2 text-[0.625rem] bg-(--color-background-default) text-(--color-foreground-faint)">
                      name@example.com
                    </div>
                    <div className="mt-2 flex justify-end">
                      <span
                        className="inline-flex h-6 items-center rounded px-2 text-[0.625rem] font-semibold"
                        style={{
                          background: "var(--color-background-primary)",
                          color: "var(--color-foreground-primary)",
                        }}
                      >
                        Send invite
                      </span>
                    </div>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Dropdown Menu"
              desc="Trigger-anchored menu with checkboxes, radios, and submenus."
              href="dropdown-menu"
              preview={
                <div className="flex flex-col gap-1.5 items-start">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-[0.6875rem] font-semibold"
                  >
                    Options
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </Button>
                  <div
                    className="rounded-md border border-(--color-border-default) bg-(--color-background-default) p-1 text-[0.6875rem]"
                    style={{ boxShadow: "var(--shadow-md)", width: "9.375rem" }}
                  >
                    <div className="flex items-center gap-2 px-2 py-1 text-(--color-foreground-default)">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-2.5 w-2.5 text-(--color-foreground-faint)"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4z" />
                      </svg>
                      Edit
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 text-(--color-foreground-default)">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-2.5 w-2.5 text-(--color-foreground-faint)"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Duplicate
                    </div>
                    <div
                      className="h-px my-0.5"
                      style={{ background: "var(--color-border-default)" }}
                    />
                    <div
                      className="flex items-center gap-2 px-2 py-1"
                      style={{ color: "var(--color-foreground-danger-muted)" }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-2.5 w-2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                      Delete
                    </div>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Hover Card"
              desc="Rich preview on hover — useful for user profiles, link previews."
              href="hover-card"
              preview={
                <div className="flex flex-col gap-1.5 items-start">
                  <span
                    className="text-[0.6875rem] font-medium underline"
                    style={{
                      color: "var(--color-foreground-primary-muted)",
                      textDecorationColor:
                        "color-mix(in oklch, var(--color-background-primary) 50%, transparent)",
                    }}
                  >
                    @elena_mori
                  </span>
                  <div
                    className="rounded-md border border-(--color-border-default) bg-(--color-background-default) p-3"
                    style={{
                      boxShadow: "var(--shadow-md)",
                      width: "11.875rem",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-grid place-items-center rounded-full text-xs font-semibold"
                        style={{
                          background: "var(--color-blue-300)",
                          color: "var(--color-blue-950)",
                          height: "2rem",
                          width: "2rem",
                        }}
                      >
                        EM
                      </span>
                      <div>
                        <p className="text-[0.6875rem] font-semibold text-(--color-foreground-default)">
                          Elena Mori
                        </p>
                        <p className="text-[0.625rem] text-(--color-foreground-faint)">
                          Lead, Design Systems
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-[0.625rem] text-(--color-foreground-muted)">
                      Building design systems that scale.
                    </p>
                    <div className="mt-2 flex items-center gap-3 font-mono text-[0.5625rem] text-(--color-foreground-faint)">
                      <span>42 following</span>
                      <span>1.2k followers</span>
                    </div>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Popover"
              desc="Trigger-anchored floating panel with full content and close button."
              href="popover"
              preview={
                <div className="flex flex-col gap-1.5 items-start">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-[0.6875rem] font-semibold"
                  >
                    Filters
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M4 6h16M7 12h10M10 18h4" />
                    </svg>
                  </Button>
                  <div
                    className="rounded-md border border-(--color-border-default) bg-(--color-background-default) p-3 space-y-2"
                    style={{ boxShadow: "var(--shadow-md)", width: "11.25rem" }}
                  >
                    <p className="text-[0.625rem] font-semibold text-(--color-foreground-default)">
                      Filter by status
                    </p>
                    {["Active", "Beta", "Deprecated"].map((s) => (
                      <label
                        key={s}
                        className="flex items-center gap-2 text-[0.6875rem] text-(--color-foreground-muted)"
                      >
                        <span
                          className="grid h-3.5 w-3.5 place-items-center rounded-sm"
                          style={{
                            background:
                              s === "Active"
                                ? "var(--color-background-primary)"
                                : "transparent",
                            border:
                              s === "Active"
                                ? "none"
                                : "1px solid var(--color-border-default)",
                            color: "var(--color-foreground-inverse)",
                          }}
                        >
                          {s === "Active" && (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-2.5 w-2.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path d="m5 12 5 5L20 7" />
                            </svg>
                          )}
                        </span>
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
              }
            />

            <CompCard
              name="Sheet"
              desc="Side drawer that slides in from any edge — with overlay and focus trap."
              href="sheet"
              preview={
                <div
                  className="relative w-full max-w-57.5 h-30 rounded-md overflow-hidden border border-(--color-border-default)"
                  style={{ background: "var(--color-background-muted)" }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "color-mix(in oklch, var(--color-foreground-default) 20%, transparent)",
                    }}
                  />
                  <div
                    className="absolute top-0 right-0 bottom-0 w-2/3 border-l bg-(--color-background-default) p-3"
                    style={{
                      borderColor: "var(--color-border-default)",
                      boxShadow: "var(--shadow-xl)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[0.6875rem] font-semibold text-(--color-foreground-default)">
                        Settings
                      </p>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3 text-(--color-foreground-faint)"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="space-y-1.5">
                      {[75, 100, 50].map((w, i) => (
                        <div
                          key={i}
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${w}%`,
                            background: "var(--color-background-emphasis)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              }
            />

            <CompCard
              name="Tooltip"
              desc="Keyboard and pointer-triggered label — never interactive content."
              href="tooltip"
              preview={
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-[0.6875rem] font-semibold"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v4M12 16h.01" />
                      </svg>
                      Info
                    </Button>
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-[0.625rem] font-medium whitespace-nowrap"
                      style={{
                        background: "var(--color-foreground-default)",
                        color: "var(--color-foreground-inverse)",
                      }}
                    >
                      WCAG 2.2 AA compliant
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                        style={{
                          borderTopColor: "var(--color-foreground-default)",
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[0.625rem] text-(--color-foreground-faint)">
                    <span className="font-mono">hover</span>·
                    <span className="font-mono">focus</span>·
                    <span className="font-mono">touch</span>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ── STACK NOTE FOOTER ───────────────────────────────────── */}
      <section className="border-b border-(--color-border-default) bg-(--color-background-default)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-4 gap-8">
            {[
              {
                label: "Primitive layer",
                value: "Radix UI",
                desc: `${meta.stack.radixBackedComponents} of the ${meta.components.count} components wrap a Radix primitive (headless and accessible); the rest are plain forwardRef components.`,
              },
              {
                label: "Type safety",
                value: "TypeScript",
                desc: "Every prop, variant, and slot is typed. Import the component; your editor knows the API.",
              },
              {
                label: "Styling",
                value: "Tailwind 4",
                desc: "OKLCH CSS vars through Tailwind's CSS custom property syntax. Classes are compiled ahead of time, and every component is its own import.",
              },
              {
                label: "Token contract",
                value: "OKLCH Tokens",
                desc: `${meta.tokens.total} design tokens across 3 tiers. Every color in every component resolves through the token graph.`,
              },
            ].map(({ label, value, desc }) => (
              <div key={label}>
                <p className="font-mono text-[0.625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                  {label}
                </p>
                <p className="mt-1 font-serif text-xl font-semibold text-(--color-foreground-default)">
                  {value}
                </p>
                <p className="mt-2 text-sm text-(--color-foreground-muted) leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
