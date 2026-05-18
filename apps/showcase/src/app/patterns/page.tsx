import React from "react";
import Link from "next/link";
import { getShowcaseMeta } from "@/lib/showcase-metadata";

/* ─── Pattern card ───────────────────────────────────────────── */
function PatCard({
  title,
  desc,
  tags,
  preview,
  full = false,
}: {
  title: string;
  desc: string;
  tags: string[];
  preview: React.ReactNode;
  full?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) overflow-hidden flex flex-col hover:border-(--color-interactive-primary) transition-all${full ? " md:col-span-2" : ""}`}
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="relative bg-(--color-background-secondary) border-b border-(--color-border-primary) overflow-hidden flex place-content-center grow"
        style={{
          minHeight: 280,
          padding: 20,
        }}
      >
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklch, var(--color-text-primary) 8%, transparent) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="relative flex items-center justify-center">
          {preview}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-(--color-text-primary)">
            {title}
          </h3>
          <a
            href="https://wyliedogstorybook.com"
            className="font-mono text-[10px] text-(--color-text-tertiary) hover:text-(--color-interactive-primary) transition-colors"
          >
            View ↗
          </a>
        </div>
        <p className="text-sm text-(--color-text-secondary) mt-1 leading-relaxed">
          {desc}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-full border border-(--color-border-primary) bg-(--color-background-primary) font-mono text-[10px] text-(--color-text-secondary)"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

/* ─── Category header ────────────────────────────────────────── */
function CatHeader({
  num,
  count,
  title,
  desc,
}: {
  num: string;
  count: number;
  title: string;
  desc: string;
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
            Category {num}
          </span>
          <span className="font-mono text-[11px] text-(--color-text-tertiary)">
            ·
          </span>
          <span className="font-mono text-[11px] text-(--color-text-tertiary)">
            {count} pattern{count !== 1 ? "s" : ""}
          </span>
        </div>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-(--color-text-secondary)">{desc}</p>
      </div>
    </header>
  );
}

export default function PatternsPage() {
  const meta = getShowcaseMeta();
  return (
    <div className="min-h-screen bg-(--color-background-primary)">
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-(--color-border-primary)">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklch, var(--color-text-primary) 14%, transparent) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklch, var(--color-interactive-primary) 22%, transparent) 0%, transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--color-border-primary) bg-(--color-surface-primary)/60 px-3 py-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-secondary)">
                04 · Patterns
              </span>
              <span className="text-(--color-text-tertiary)">·</span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                @wyliedog/ui v1.4
              </span>
            </div>

            <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.98] text-(--color-text-primary)">
              Complete UI solutions,{" "}
              <span style={{ color: "var(--color-interactive-primary)" }}>
                not just components.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-(--color-text-secondary) text-balance">
              Patterns are higher-order compositions — assembled from
              primitives, wired to the same token system, and tested against the
              same accessibility checklist. When the tokens move, every pattern
              moves with them.
            </p>
          </div>

          {/* relationship diagram */}
          <div className="mt-12 flex flex-col lg:flex-row gap-3">
            {/* INPUTS — takes 2/4 cols */}
            <div className="md:col-span-2 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5 grow">
              <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                inputs
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) p-3">
                  <p className="text-xs font-semibold text-(--color-text-primary)">
                    Components
                  </p>
                  <p className="font-mono text-[10px] text-(--color-text-tertiary) mt-1">
                    42 typed primitives
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {["Button", "Input", "Card"].map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center px-1.5 py-px rounded-full border border-(--color-border-primary) font-mono text-[9px] text-(--color-text-secondary) bg-(--color-background-primary)"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) p-3">
                  <p className="text-xs font-semibold text-(--color-text-primary)">
                    Tokens
                  </p>
                  <p className="font-mono text-[10px] text-(--color-text-tertiary) mt-1">
                    340 OKLCH values
                  </p>
                  <div className="mt-3 flex gap-1">
                    {[
                      "oklch(0.54 0.18 274)",
                      "oklch(0.60 0.14 155)",
                      "oklch(0.75 0.17 85)",
                      "oklch(0.62 0.18 29)",
                    ].map((c) => (
                      <span
                        key={c}
                        className="h-4 w-4 rounded"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center w-16">
              <svg
                viewBox="0 0 80 24"
                className="w-16 h-6 text-fg-tertiary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 12h70M62 4l10 8-10 8" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* COMPOSED INTO — Patterns */}
            <div
              className="rounded-xl border-2 p-5 grow"
              style={{
                borderColor: "var(--color-interactive-primary)",
                background:
                  "color-mix(in oklch, var(--color-interactive-primary) 6%, var(--color-background-primary))",
              }}
            >
              <p
                className="font-mono text-[10px] uppercase tracking-wider"
                style={{ color: "var(--color-interactive-primary)" }}
              >
                composed into
              </p>
              <p className="mt-3 font-serif text-2xl font-semibold text-(--color-text-primary)">
                Patterns
              </p>
              <p className="text-xs text-(--color-text-secondary) mt-1">
                {meta.patterns.count} reference compositions across {meta.patterns.categories} categories.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-1">
                {[22, 18, 14].map((opacity, i) => (
                  <div
                    key={i}
                    className="h-6 rounded"
                    style={{
                      background: `color-mix(in oklch, var(--color-interactive-primary) ${opacity}%, transparent)`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center w-16">
              <svg
                viewBox="0 0 80 24"
                className="w-16 h-6 text-fg-tertiary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 12h70M62 4l10 8-10 8" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* SHIPPED AS — Pages */}
            <div className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5 grow">
              <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                shipped as
              </p>
              <p className="mt-3 font-serif text-2xl font-semibold text-(--color-text-primary)">
                Pages
              </p>
              <p className="text-xs text-(--color-text-secondary) mt-1">
                Real product surfaces, end-to-end.
              </p>
              <div className="mt-3 space-y-1">
                <div className="h-1.5 w-3/4 rounded-full bg-(--color-background-secondary)" />
                <div className="h-1.5 w-full rounded-full bg-(--color-background-secondary)" />
                <div className="h-1.5 w-2/3 rounded-full bg-(--color-background-secondary)" />
              </div>
            </div>
          </div>
        </div>

        {/* stats strip */}
        <div className="relative border-t border-(--color-border-primary) bg-(--color-background-primary)/60 backdrop-blur-sm">
          <div className="mx-auto max-w-330 px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Patterns",
                  value: String(meta.patterns.count),
                  sub: "reference compositions",
                },
                {
                  label: "Categories",
                  value: String(meta.patterns.categories),
                  sub: "auth, data, layout, a11y…",
                },
                {
                  label: "Composable",
                  value: "100%",
                  sub: "built from primitives",
                },
                {
                  label: "Accessible",
                  value: "WCAG 2.2",
                  sub: "AA targeted",
                },
              ].map(({ label, value, sub }, i) => (
                <div
                  key={label}
                  className={`px-2 py-6 lg:py-7 ${i < 3 ? "lg:border-r border-(--color-border-primary)" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} ${i > 0 ? "lg:pl-8" : ""}`}
                >
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                    {label}
                  </dt>
                  <dd className="mt-1 flex items-baseline gap-2">
                    <span className="font-serif text-3xl sm:text-4xl font-semibold text-(--color-text-primary)">
                      {value}
                    </span>
                    <span className="text-xs text-(--color-text-tertiary)">
                      {sub}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          01 — AUTHENTICATION
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-auth"
        className="border-b border-(--color-border-primary)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="01"
            count={2}
            title="Authentication"
            desc="Sign-in, sign-up, and account recovery. The hard parts — validation states, async submission, error recovery, social SSO — are wired up so product teams don't re-invent the flow on every new surface."
          />
          <div className="grid md:grid-cols-2 gap-4">
            <PatCard
              title="Login & Registration"
              desc="Sign-in form, registration flow, social auth options. Same schema, three layouts — page, modal, and drawer."
              tags={["Form", "Input", "Button", "Separator", "Link"]}
              preview={
                <div
                  className="mx-auto max-w-[320px] rounded-lg bg-(--color-surface-primary) border border-(--color-border-primary) p-5"
                  style={{ boxShadow: "var(--shadow-md)" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="grid h-6 w-6 place-items-center rounded"
                      style={{ background: "var(--color-interactive-primary)" }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        style={{ color: "var(--color-text-inverse)" }}
                      >
                        <path d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7z" />
                        <circle cx="12" cy="11" r="1.5" fill="currentColor" />
                      </svg>
                    </span>
                    <span className="font-serif text-sm font-semibold text-(--color-text-primary)">
                      Wylie Dog
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-lg font-semibold leading-tight text-(--color-text-primary)">
                    Welcome back
                  </h3>
                  <p className="text-[11px] text-(--color-text-tertiary)">
                    Sign in to continue to your workspace.
                  </p>
                  <div className="mt-4 space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-medium text-(--color-text-secondary) mb-1">
                        Email
                      </label>
                      <div className="flex items-center h-7 border border-(--color-border-primary) rounded-md px-2 text-[11px] bg-(--color-surface-primary) text-(--color-text-primary)">
                        elena@wyliedog.dev
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-medium text-(--color-text-secondary)">
                          Password
                        </label>
                        <a
                          className="font-mono text-[9px]"
                          style={{ color: "var(--color-interactive-primary)" }}
                        >
                          Forgot?
                        </a>
                      </div>
                      <div className="flex items-center justify-between h-7 border border-(--color-border-primary) rounded-md px-2 text-[11px] bg-(--color-surface-primary)">
                        <span className="tracking-[0.3em] text-(--color-text-tertiary)">
                          ••••••••
                        </span>
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3 text-(--color-text-tertiary)"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                    </div>
                    <button
                      className="w-full h-7.5 flex items-center justify-center rounded-md text-[11px] font-semibold"
                      style={{
                        background: "var(--color-interactive-primary)",
                        color: "var(--color-text-inverse)",
                      }}
                    >
                      Sign in
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="h-px flex-1"
                      style={{ background: "var(--color-border-primary)" }}
                    />
                    <span className="font-mono text-[9px] uppercase text-(--color-text-tertiary)">
                      or continue with
                    </span>
                    <span
                      className="h-px flex-1"
                      style={{ background: "var(--color-border-primary)" }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {["G", "GH", ""].map((label, i) => (
                      <button
                        key={i}
                        className="flex items-center justify-center h-7 border border-(--color-border-strong) rounded-md text-[11px] font-semibold text-(--color-text-primary)"
                      >
                        {i === 0 ? (
                          "G"
                        ) : i === 1 ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3 w-3"
                            fill="currentColor"
                          >
                            <path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2c-3.34.73-4.04-1.6-4.04-1.6-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.78.84 1.24 1.9 1.24 3.22 0 4.6-2.81 5.62-5.48 5.91.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .3z" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3 w-3"
                            fill="currentColor"
                          >
                            <path d="M16.36 1.43c0 1.14-.42 2.21-1.27 2.97-.84.77-1.86 1.21-2.95 1.13-.02-1.14.45-2.25 1.26-3 .82-.76 1.94-1.21 2.96-1.1zM20.5 17.26c-.3.7-.65 1.34-1.07 1.93-.56.79-1.02 1.34-1.38 1.65-.55.5-1.15.76-1.79.78-.46 0-1.02-.13-1.66-.4-.65-.27-1.24-.4-1.79-.4-.57 0-1.18.13-1.84.4-.66.27-1.19.41-1.59.43-.62.03-1.23-.24-1.83-.79-.39-.34-.86-.91-1.42-1.7-.59-.85-1.08-1.83-1.46-2.96-.41-1.22-.62-2.4-.62-3.54 0-1.31.28-2.44.85-3.39.45-.76 1.04-1.36 1.79-1.8.74-.44 1.55-.66 2.42-.68.49 0 1.13.15 1.94.45.8.3 1.32.45 1.55.45.17 0 .75-.18 1.74-.53.94-.32 1.73-.46 2.38-.41 1.77.14 3.1.84 3.98 2.1-1.58.96-2.36 2.3-2.35 4.04.01 1.35.51 2.48 1.49 3.37.44.42.94.74 1.49.97-.12.34-.25.67-.39.99z" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-center text-[10px] text-(--color-text-tertiary)">
                    No account?{" "}
                    <span
                      className="font-medium"
                      style={{ color: "var(--color-interactive-primary)" }}
                    >
                      Create one
                    </span>
                  </p>
                </div>
              }
            />

            <PatCard
              title="Password Recovery"
              desc="Forgot-password entry, throttled resend, magic-link return state. Handles all five edge cases auth audits flag: expired token, used token, mismatched email, rate-limit, and SSO-only accounts."
              tags={["Form", "Input", "Alert", "Button"]}
              preview={
                <div className="grid grid-cols-2 gap-3 max-w-115 mx-auto">
                  <div
                    className="rounded-lg bg-(--color-surface-primary) border border-(--color-border-primary) p-4"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    <span className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                      step 1
                    </span>
                    <h4 className="mt-1 font-serif text-sm font-semibold leading-tight text-(--color-text-primary)">
                      Reset password
                    </h4>
                    <p className="text-[10px] text-(--color-text-tertiary) mt-0.5">
                      We&apos;ll send a link.
                    </p>
                    <div className="mt-3 space-y-2">
                      <label className="block text-[10px] font-medium text-(--color-text-secondary)">
                        Email
                      </label>
                      <div className="flex items-center h-7 border border-(--color-border-primary) rounded-md px-2 text-[11px] bg-(--color-surface-primary) text-(--color-text-tertiary)">
                        elena@…
                      </div>
                      <button
                        className="w-full h-7 flex items-center justify-center rounded-md text-[11px] font-semibold"
                        style={{
                          background: "var(--color-interactive-primary)",
                          color: "var(--color-text-inverse)",
                        }}
                      >
                        Send reset link
                      </button>
                    </div>
                  </div>
                  <div
                    className="rounded-lg bg-(--color-surface-primary) border-2 p-4"
                    style={{
                      borderColor: "var(--color-success)",
                      boxShadow: "var(--shadow-md)",
                    }}
                  >
                    <span
                      className="font-mono text-[9px] uppercase tracking-wider"
                      style={{ color: "var(--color-success)" }}
                    >
                      step 2 · sent
                    </span>
                    <div
                      className="mt-2 grid h-9 w-9 place-items-center rounded-full"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-success) 18%, transparent)",
                        color: "var(--color-success)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                      </svg>
                    </div>
                    <h4 className="mt-2 font-serif text-sm font-semibold leading-tight text-(--color-text-primary)">
                      Check your inbox
                    </h4>
                    <p className="text-[10px] text-(--color-text-tertiary) mt-0.5">
                      Link valid for 15 min.
                    </p>
                    <div className="mt-3 flex items-center gap-1">
                      <span className="font-mono text-[10px] text-(--color-text-secondary) truncate">
                        e****@wyliedog.dev
                      </span>
                    </div>
                    <button className="mt-2 inline-flex h-6 items-center gap-1 text-[11px] text-(--color-text-secondary)">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
                      </svg>
                      Resend in 0:42
                    </button>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          02 — DATA DISPLAY
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-data"
        className="border-b border-(--color-border-primary) bg-(--color-background-secondary)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="02"
            count={2}
            title="Data display"
            desc="Browseable grids and showcase grids. Both share the same card primitive but differ in density and what they ask the user to do next."
          />
          <div className="grid md:grid-cols-2 gap-4">
            <PatCard
              title="Card Grid"
              desc="Responsive grid of data cards with pagination, filtering, and empty states. Reflows 4 → 3 → 2 → 1 columns across our breakpoints."
              tags={["Card", "Badge", "Pagination", "Avatar"]}
              preview={
                <div className="space-y-2 max-w-105 mx-auto">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-(--color-text-tertiary)">
                      Showing 3 of 248
                    </span>
                    <span className="inline-flex h-5 items-center rounded border border-(--color-border-primary) bg-(--color-surface-primary) px-1.5 font-mono text-[9px] text-(--color-text-secondary)">
                      grid · 3 cols
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        name: "Helios Workspace",
                        members: 12,
                        status: "active",
                        statusColor: "var(--color-success)",
                        price: "$42/mo",
                        bg: "linear-gradient(135deg, oklch(78% 0.13 35), oklch(70% 0.16 25))",
                      },
                      {
                        name: "Atlas Studio",
                        members: 5,
                        status: "active",
                        statusColor: "var(--color-success)",
                        price: "$24/mo",
                        bg: "linear-gradient(135deg, oklch(78% 0.13 274), oklch(68% 0.17 250))",
                      },
                      {
                        name: "Northwind Co.", //cSpell:ignore Northwind
                        members: 28,
                        status: "trial",
                        statusColor: "var(--color-warning)",
                        price: "14d left",
                        bg: "linear-gradient(135deg, oklch(78% 0.13 155), oklch(70% 0.14 130))",
                      },
                    ].map(
                      ({ name, members, status, statusColor, price, bg }) => (
                        <div
                          key={name}
                          className="rounded-md bg-(--color-surface-primary) border border-(--color-border-primary) p-2.5"
                        >
                          <div
                            className="aspect-4/3 rounded mb-2"
                            style={{ background: bg }}
                          />
                          <p className="text-[10px] font-semibold leading-tight text-(--color-text-primary)">
                            {name}
                          </p>
                          <p className="font-mono text-[9px] text-(--color-text-tertiary) mt-0.5">
                            {members} members
                          </p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span
                              className="inline-flex items-center gap-0.5 rounded-full px-1 py-px font-mono text-[8px]"
                              style={{
                                background: `color-mix(in oklch, ${statusColor} 18%, transparent)`,
                                color: statusColor,
                              }}
                            >
                              ● {status}
                            </span>
                            <span className="font-mono text-[8px] text-(--color-text-tertiary)">
                              {price}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1 pt-1">
                    <span className="font-mono text-[9px] text-(--color-text-tertiary)">
                      1
                    </span>
                    <span
                      className="grid h-4 w-4 place-items-center rounded font-mono text-[9px]"
                      style={{
                        background: "var(--color-interactive-primary)",
                        color: "var(--color-text-inverse)",
                      }}
                    >
                      2
                    </span>
                    <span className="font-mono text-[9px] text-(--color-text-tertiary)">
                      3 … 83
                    </span>
                  </div>
                </div>
              }
            />

            <PatCard
              title="Feature Grid"
              desc="Marketing-grade feature showcase: 2×2, 3×2, or 4×1 layouts with iconography, titles, and one-line benefit copy. Designed to be skimmed."
              tags={["Card", "Icon", "Heading", "Text"]}
              preview={
                <div className="grid grid-cols-2 gap-2 max-w-105 mx-auto">
                  {[
                    {
                      color: "var(--color-interactive-primary)",
                      icon: "M13 2 3 14h9l-1 8 10-12h-9z",
                      title: "Lightning fast",
                      sub: "Edge-rendered. 38ms p95.",
                    },
                    {
                      color: "var(--color-success)",
                      icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
                      title: "SOC 2 Type II",
                      sub: "Audited yearly.",
                    },
                    {
                      color: "var(--color-warning)",
                      icon: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7v5l3 2",
                      title: "24/7 monitoring",
                      sub: "Status & alerts built in.",
                    },
                    {
                      color: "var(--color-destructive)",
                      icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
                      title: "Human support",
                      sub: "Median reply 4 min.",
                    },
                  ].map(({ color, icon, title, sub }) => (
                    <div
                      key={title}
                      className="rounded-md bg-(--color-surface-primary) border border-(--color-border-primary) p-3"
                    >
                      <span
                        className="grid h-7 w-7 place-items-center rounded"
                        style={{
                          background: `color-mix(in oklch, ${color} 14%, transparent)`,
                          color,
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d={icon} />
                        </svg>
                      </span>
                      <p className="mt-2 text-[11px] font-semibold leading-tight text-(--color-text-primary)">
                        {title}
                      </p>
                      <p className="text-[10px] text-(--color-text-tertiary) mt-0.5">
                        {sub}
                      </p>
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          03 — FEEDBACK
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-feedback"
        className="border-b border-(--color-border-primary)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="03"
            count={1}
            title="Feedback"
            desc="When something fails, the pattern catches it. Error states aren't an afterthought — they're designed as carefully as the happy path."
          />
          <div className="grid md:grid-cols-2 gap-4">
            <PatCard
              full
              title="Error Boundary Patterns"
              desc="Page-level and component-scoped error states with recovery UI. Captures the error, auto-saves the user's in-flight work, and offers a non-destructive path back to a working state — without unmounting the whole tree."
              tags={["Alert", "Button", "Card", "Icon", "Code"]}
              preview={
                <div className="grid lg:grid-cols-2 gap-3 max-w-160 mx-auto">
                  <div className="rounded-lg bg-(--color-surface-primary) border border-(--color-border-primary) p-4">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-destructive) 14%, transparent)",
                        color: "var(--color-destructive)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v5M12 16h.01" />
                      </svg>
                    </span>
                    <h4 className="mt-3 font-serif text-base font-semibold leading-tight text-(--color-text-primary)">
                      Something broke on our end
                    </h4>
                    <p className="text-[11px] text-(--color-text-secondary) mt-1">
                      The team has been pinged. Your work was auto-saved 12s
                      ago.
                    </p>
                    <div className="mt-3 rounded border border-(--color-border-primary) bg-(--color-background-secondary) p-2 font-mono text-[9px] text-(--color-text-tertiary)">
                      error.id&nbsp;&nbsp;
                      <span className="text-(--color-text-secondary)">
                        err_8f3a2b1c
                      </span>
                    </div>
                    <div className="mt-3 flex gap-1.5">
                      <button
                        className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[11px] font-semibold"
                        style={{
                          background: "var(--color-interactive-primary)",
                          color: "var(--color-text-inverse)",
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
                        </svg>
                        Try again
                      </button>
                      <button className="inline-flex h-7 items-center rounded-md border border-(--color-border-primary) px-2.5 text-[11px] font-semibold text-(--color-text-primary)">
                        Go to dashboard
                      </button>
                    </div>
                  </div>
                  <div className="rounded-lg bg-(--color-surface-primary) border border-(--color-border-primary) p-4">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                      component-scoped
                    </p>
                    <div
                      className="mt-2 rounded-md border bg-(--color-background-primary) p-3"
                      style={{
                        borderColor:
                          "color-mix(in oklch, var(--color-destructive) 40%, transparent)",
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className="grid h-4 w-4 mt-px place-items-center rounded"
                          style={{ color: "var(--color-destructive)" }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.4}
                          >
                            <path d="M12 2 2 22h20z" />
                            <path d="M12 9v5M12 18h.01" />
                          </svg>
                        </span>
                        <div className="flex-1">
                          <p className="text-[11px] font-semibold text-(--color-text-primary)">
                            Chart failed to render
                          </p>
                          <p className="text-[10px] text-(--color-text-tertiary) mt-0.5">
                            RangeError: data points exceed buffer.
                          </p>
                          <button
                            className="mt-2 inline-flex h-5 items-center rounded px-1.5 font-mono text-[9px]"
                            style={{
                              background:
                                "color-mix(in oklch, var(--color-destructive) 14%, transparent)",
                              color: "var(--color-destructive)",
                            }}
                          >
                            Retry isolated
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="font-mono text-[9px] mt-3 text-(--color-text-tertiary)">
                      <span style={{ color: "var(--color-success)" }}>●</span>{" "}
                      rest of the page still works
                    </p>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          04 — FORMS
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-forms"
        className="border-b border-(--color-border-primary) bg-(--color-background-secondary)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="04"
            count={2}
            title="Forms"
            desc="Form composition and validation are the largest source of bespoke UI in any product. These patterns close the gap so teams stop reinventing field groupings, error display, and async submit states."
          />
          <div className="grid md:grid-cols-2 gap-4">
            <PatCard
              title="Form Compositions"
              desc="Multi-field forms, field groupings, and step indicators. Standard layout primitives so a 30-field settings page reads like a 5-field one."
              tags={["Form", "Input", "Switch", "Stepper", "Fieldset"]}
              preview={
                <div
                  className="mx-auto max-w-90 rounded-lg bg-(--color-surface-primary) border border-(--color-border-primary) p-4"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-serif text-sm font-semibold text-(--color-text-primary)">
                      Workspace settings
                    </p>
                    <span className="ml-auto font-mono text-[9px] text-(--color-text-tertiary)">
                      Step 2 of 3
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                      General
                    </p>
                    <div className="mt-1.5 space-y-2 rounded-md border border-(--color-border-primary) p-2.5">
                      <div>
                        <label className="block text-[10px] font-medium text-(--color-text-secondary) mb-1">
                          Name
                        </label>
                        <div className="flex items-center h-7 border border-(--color-border-primary) rounded-md px-2 text-[11px] bg-(--color-surface-primary) text-(--color-text-primary)">
                          Helios Workspace
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-(--color-text-secondary) mb-1">
                          URL
                        </label>
                        <div className="flex items-center h-7 border border-(--color-border-primary) rounded-md px-2 text-[11px] bg-(--color-surface-primary)">
                          <span className="font-mono text-(--color-text-tertiary)">
                            wyliedog.dev/
                          </span>
                          <span className="font-mono text-(--color-text-primary)">
                            helios
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                      Billing
                    </p>
                    <div className="mt-1.5 space-y-2 rounded-md border border-(--color-border-primary) p-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-semibold text-(--color-text-primary)">
                            Annual billing
                          </p>
                          <p className="text-[9px] text-(--color-text-tertiary)">
                            Save 20%
                          </p>
                        </div>
                        <span
                          className="relative inline-flex h-4 w-7 items-center rounded-full"
                          style={{
                            background: "var(--color-interactive-primary)",
                          }}
                        >
                          <span
                            className="inline-block h-3 w-3 translate-x-3 rounded-full"
                            style={{ background: "var(--color-text-inverse)" }}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <button className="inline-flex h-7 items-center px-2.5 text-[11px] font-semibold text-(--color-text-secondary)">
                      Back
                    </button>
                    <button
                      className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[11px] font-semibold"
                      style={{
                        background: "var(--color-interactive-primary)",
                        color: "var(--color-text-inverse)",
                      }}
                    >
                      Continue
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              }
            />

            <PatCard
              title="Form Validation Patterns"
              desc="Error, async, and success states with consistent messaging. Validation fires on blur, runs async checks against the server, and recovers when the user corrects."
              tags={["Input", "Form", "Icon", "Progress", "Text"]}
              preview={
                <div
                  className="mx-auto max-w-90 rounded-lg bg-(--color-surface-primary) border border-(--color-border-primary) p-4 space-y-3"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <div>
                    <label className="block text-[10px] font-medium text-(--color-text-secondary) mb-1">
                      Email
                    </label>
                    <div
                      className="flex items-center justify-between h-7 border rounded-md px-2 text-[11px]"
                      style={{
                        borderColor: "var(--color-destructive)",
                        background:
                          "color-mix(in oklch, var(--color-destructive) 6%, var(--color-surface-primary))",
                      }}
                    >
                      <span className="text-(--color-text-primary)">
                        elena@wyl
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        style={{ color: "var(--color-destructive)" }}
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v5M12 16h.01" />
                      </svg>
                    </div>
                    <p
                      className="mt-1 text-[10px]"
                      style={{ color: "var(--color-destructive)" }}
                    >
                      Invalid email format. Expected name@domain.com.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-(--color-text-secondary) mb-1">
                      Workspace URL
                    </label>
                    <div className="flex items-center justify-between h-7 border border-(--color-border-primary) rounded-md px-2 text-[11px] bg-(--color-surface-primary)">
                      <span className="text-(--color-text-primary)">
                        acme-co
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] text-(--color-text-tertiary)">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M21 12a9 9 0 1 1-9-9" />
                        </svg>
                        checking…
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-(--color-text-secondary) mb-1">
                      Password
                    </label>
                    <div
                      className="flex items-center justify-between h-7 border rounded-md px-2 text-[11px] bg-(--color-surface-primary)"
                      style={{ borderColor: "var(--color-success)" }}
                    >
                      <span className="tracking-[0.3em] text-(--color-text-tertiary)">
                        ••••••••••••
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        style={{ color: "var(--color-success)" }}
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="h-1 w-6 rounded-full"
                          style={{ background: "var(--color-success)" }}
                        />
                      ))}
                      <span
                        className="ml-1 text-[10px]"
                        style={{ color: "var(--color-success)" }}
                      >
                        Strong
                      </span>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          05 — LAYOUT
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-layout"
        className="border-b border-(--color-border-primary)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="05"
            count={1}
            title="Layout"
            desc="The page shell — what holds every product surface together. One layout primitive wired for sidebar, content, and overlay regions, with responsive collapse built in."
          />
          <PatCard
            full
            title="Layout Patterns"
            desc="Page shell, sidebar, content area, and responsive breakpoints. The sidebar collapses to a sheet below lg; the content area never exceeds a 1280px reading measure."
            tags={["Sidebar", "NavigationMenu", "Container", "Sheet", "Card"]}
            preview={
              <div
                className="mx-auto max-w-180 rounded-lg overflow-hidden border border-(--color-border-primary) bg-(--color-surface-primary)"
                style={{ boxShadow: "var(--shadow-md)" }}
              >
                <div className="flex items-center gap-2 px-3 py-2 border-b border-(--color-border-primary) bg-(--color-background-secondary)">
                  <div className="flex gap-1">
                    {[
                      "oklch(70% 0.18 25)",
                      "oklch(80% 0.15 85)",
                      "oklch(70% 0.16 145)",
                    ].map((c, i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] text-(--color-text-tertiary) ml-2">
                    helios.wyliedog.dev/projects
                  </span>
                  <span className="ml-auto inline-flex h-4 items-center rounded border border-(--color-border-primary) bg-(--color-surface-primary) px-1 font-mono text-[8px] text-(--color-text-secondary)">
                    ⌘K
                  </span>
                </div>
                <div className="grid grid-cols-12 h-55">
                  <aside className="col-span-3 border-r border-(--color-border-primary) p-3 bg-(--color-background-primary)">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="grid h-4 w-4 place-items-center rounded"
                        style={{
                          background: "var(--color-interactive-primary)",
                        }}
                      />
                      <span className="text-[10px] font-serif font-semibold text-(--color-text-primary)">
                        Helios
                      </span>
                    </div>
                    <div className="mt-3 space-y-0.5">
                      <div
                        className="flex items-center gap-1.5 rounded px-1.5 py-1 text-[10px] font-medium"
                        style={{
                          background:
                            "color-mix(in oklch, var(--color-interactive-primary) 14%, transparent)",
                          color: "var(--color-interactive-primary)",
                        }}
                      >
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ background: "currentColor" }}
                        />
                        Projects
                      </div>
                      {["Tasks", "Members", "Reports"].map((s) => (
                        <div
                          key={s}
                          className="flex items-center gap-1.5 rounded px-1.5 py-1 text-[10px] text-(--color-text-secondary)"
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </aside>
                  <main className="col-span-9 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-serif font-semibold text-(--color-text-primary)">
                        Projects
                      </p>
                      <button
                        className="inline-flex h-5.5 items-center rounded-md px-2 text-[10px] font-semibold"
                        style={{
                          background: "var(--color-interactive-primary)",
                          color: "var(--color-text-inverse)",
                        }}
                      >
                        + New
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {[60, 30, 85].map((w, i) => (
                        <div
                          key={i}
                          className="rounded border border-(--color-border-primary) p-2"
                        >
                          <div className="h-1.5 w-3/4 rounded-full bg-(--color-background-tertiary)" />
                          <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-(--color-background-tertiary)" />
                          <div
                            className="mt-2 h-1 w-full rounded-full"
                            style={{
                              background: "var(--color-background-tertiary)",
                            }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${w}%`,
                                background:
                                  i === 2
                                    ? "var(--color-success)"
                                    : "var(--color-interactive-primary)",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded border border-(--color-border-primary)">
                      <div className="grid grid-cols-4 px-2 py-1 bg-(--color-background-secondary) font-mono text-[8px] uppercase tracking-wider text-(--color-text-tertiary)">
                        <span>Name</span>
                        <span>Owner</span>
                        <span>Due</span>
                        <span className="text-right">Status</span>
                      </div>
                      {[
                        {
                          name: "Migration v1.4",
                          owner: "EM",
                          due: "Jun 12",
                          status: "on track",
                          color: "var(--color-success)",
                        },
                        {
                          name: "Token bridge",
                          owner: "JR",
                          due: "Jun 18",
                          status: "at risk",
                          color: "var(--color-warning)",
                        },
                      ].map(({ name, owner, due, status, color }) => (
                        <div
                          key={name}
                          className="grid grid-cols-4 px-2 py-1 border-t border-(--color-border-primary) text-[9px] text-(--color-text-primary)"
                        >
                          <span>{name}</span>
                          <span className="text-(--color-text-secondary)">
                            {owner}
                          </span>
                          <span className="text-(--color-text-secondary)">
                            {due}
                          </span>
                          <span className="text-right">
                            <span
                              className="inline-block rounded px-1 font-mono text-[8px]"
                              style={{
                                background: `color-mix(in oklch, ${color} 18%, transparent)`,
                                color,
                              }}
                            >
                              {status}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </main>
                </div>
              </div>
            }
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          06 — NAVIGATION
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-nav"
        className="border-b border-(--color-border-primary) bg-(--color-background-secondary)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="06"
            count={2}
            title="Navigation"
            desc="Header and footer for marketing surfaces — the bookends of every public page. Used on this site too, so they're self-eating dog food."
          />
          <div className="grid md:grid-cols-2 gap-4">
            <PatCard
              title="Site Header"
              desc="Sticky header with logo, primary nav, search trigger, and theme toggle. Blurs the content beneath on scroll. Used as the header on this very page."
              tags={["NavigationMenu", "Button", "Command", "ToggleGroup"]}
              preview={
                <div
                  className="mx-auto max-w-105 rounded-lg overflow-hidden border border-(--color-border-primary) bg-(--color-surface-primary)"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <div
                    className="flex items-center gap-2 px-3 py-2 border-b border-(--color-border-primary)"
                    style={{
                      background:
                        "color-mix(in oklch, var(--color-surface-primary) 80%, transparent)",
                    }}
                  >
                    <span
                      className="grid h-4 w-4 place-items-center rounded"
                      style={{ background: "var(--color-interactive-primary)" }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-2.5 w-2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        style={{ color: "var(--color-text-inverse)" }}
                      >
                        <path d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7z" />
                      </svg>
                    </span>
                    <span className="font-serif text-[11px] font-semibold text-(--color-text-primary)">
                      Wylie Dog
                    </span>
                    <nav className="ml-3 flex items-center gap-0.5 text-[9px]">
                      <span
                        className="rounded px-1.5 py-0.5 font-medium text-(--color-text-primary)"
                        style={{
                          background: "var(--color-background-secondary)",
                        }}
                      >
                        Home
                      </span>
                      <span className="rounded px-1.5 py-0.5 text-(--color-text-secondary)">
                        Docs
                      </span>
                      <span className="rounded px-1.5 py-0.5 text-(--color-text-secondary)">
                        Pricing
                      </span>
                    </nav>
                    <div className="ml-auto flex items-center gap-1">
                      <span className="inline-flex h-4 items-center gap-1 rounded border border-(--color-border-primary) px-1 font-mono text-[8px] text-(--color-text-tertiary)">
                        ⌘K
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-4 bg-(--color-background-secondary)">
                    <div className="space-y-1.5">
                      <div className="h-2 w-3/4 rounded-full bg-(--color-background-tertiary)" />
                      <div className="h-2 w-full rounded-full bg-(--color-background-tertiary)" />
                      <div className="h-2 w-2/3 rounded-full bg-(--color-background-tertiary)" />
                    </div>
                    <div className="mt-2 font-mono text-[9px] text-(--color-text-tertiary) flex items-center gap-1">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-2.5 w-2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                      sticky · blurs on scroll
                    </div>
                  </div>
                </div>
              }
            />

            <PatCard
              title="Site Footer"
              desc="Multi-column footer with brand block, sitemap columns, legal links, and a live status indicator. Collapses to two columns on mobile, brand stacked above."
              tags={["Separator", "Link", "Badge", "Heading"]}
              preview={
                <div
                  className="mx-auto max-w-105 rounded-lg overflow-hidden border border-(--color-border-primary) bg-(--color-surface-primary)"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <div className="p-3">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-1">
                        <span
                          className="grid h-4 w-4 place-items-center rounded"
                          style={{
                            background: "var(--color-interactive-primary)",
                          }}
                        />
                        <p className="mt-1.5 font-serif text-[10px] font-semibold text-(--color-text-primary)">
                          Wylie Dog
                        </p>
                        <p className="text-[8px] text-(--color-text-tertiary) mt-0.5 leading-tight">
                          The shared system for everything we ship.
                        </p>
                      </div>
                      {[
                        {
                          heading: "Product",
                          items: ["Tokens", "Components", "Patterns"],
                        },
                        {
                          heading: "Tools",
                          items: ["Storybook", "Figma plugin", "CLI"],
                        },
                        {
                          heading: "Legal",
                          items: ["Privacy", "Terms", "Security"],
                        },
                      ].map(({ heading, items }) => (
                        <div key={heading}>
                          <p className="font-mono text-[7px] uppercase tracking-wider text-(--color-text-tertiary)">
                            {heading}
                          </p>
                          <ul className="mt-1 space-y-0.5 text-[9px] text-(--color-text-secondary)">
                            {items.map((i) => (
                              <li key={i}>{i}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-(--color-border-primary) flex items-center justify-between">
                      <span className="font-mono text-[8px] text-(--color-text-tertiary)">
                        © 2026 Wylie Dog
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[8px] text-(--color-text-tertiary)">
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ background: "var(--color-success)" }}
                        />
                        All systems operational
                      </span>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          07 — PAGE COMPOSITIONS
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-page"
        className="border-b border-(--color-border-primary)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="07"
            count={3}
            title="Page compositions"
            desc="Pre-assembled marketing surfaces — the big building blocks of a public page. Each section composes lower-order patterns; the page composition wires them together end-to-end."
          />
          <div className="grid md:grid-cols-3 gap-4">
            <PatCard
              title="Section: Hero"
              desc="Headline, lead, CTAs, optional eyebrow badge. Three layout variants: centered, split, and asymmetric."
              tags={["Heading", "Button", "Badge"]}
              preview={
                <div
                  className="rounded-lg overflow-hidden border border-(--color-border-primary) bg-(--color-background-primary)"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <div
                    className="relative p-4"
                    style={{
                      background:
                        "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklch, var(--color-interactive-primary) 22%, transparent) 0%, transparent 60%)",
                    }}
                  >
                    <span className="inline-flex items-center gap-1 rounded-full border border-(--color-border-primary) bg-(--color-background-primary) px-1.5 py-0.5 font-mono text-[8px] text-(--color-text-secondary)">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: "var(--color-success)" }}
                      />
                      v1.4 just shipped
                    </span>
                    <p className="mt-2 font-serif text-base font-semibold leading-[1.1] text-(--color-text-primary)">
                      Build faster.
                      <br />
                      Ship calmer.
                    </p>
                    <p className="text-[9px] text-(--color-text-secondary) mt-1.5 leading-tight">
                      The shared system that finally keeps brand and product in
                      sync.
                    </p>
                    <div className="mt-2 flex gap-1">
                      <span
                        className="inline-flex h-5 items-center rounded-md px-2 text-[9px] font-semibold text-white"
                        style={{
                          background: "var(--color-interactive-primary)",
                        }}
                      >
                        Start free
                      </span>
                      <span className="inline-flex h-5 items-center rounded-md border border-(--color-border-primary) px-2 text-[9px] font-semibold text-(--color-text-primary)">
                        Docs
                      </span>
                    </div>
                  </div>
                </div>
              }
            />

            <PatCard
              title="Section: Features"
              desc="Features / benefits with optional icons and supporting copy. Two-column, three-up row, or alternating screenshot+text variants."
              tags={["Heading", "Icon", "Card", "Text"]}
              preview={
                <div
                  className="rounded-lg overflow-hidden border border-(--color-border-primary) bg-(--color-background-primary) p-3"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <p className="font-mono text-[8px] uppercase tracking-wider text-(--color-text-tertiary)">
                    Why teams choose us
                  </p>
                  <p className="mt-1 font-serif text-sm font-semibold leading-tight text-(--color-text-primary)">
                    Three pillars,
                    <br />
                    one promise.
                  </p>
                  <div className="mt-3 space-y-2">
                    {[
                      {
                        color: "var(--color-interactive-primary)",
                        label: "Token-driven",
                        sub: "Change one variable, every surface updates.",
                      },
                      {
                        color: "oklch(0.60 0.14 155)",
                        label: "Accessible by default",
                        sub: "WCAG 2.2 AA across every state.",
                      },
                      {
                        color: "oklch(0.75 0.17 85)",
                        label: "Typed end-to-end",
                        sub: "No prop guesswork in your IDE.",
                      },
                    ].map(({ color, label, sub }) => (
                      <div key={label} className="flex items-start gap-2">
                        <span
                          className="grid h-5 w-5 shrink-0 place-items-center rounded"
                          style={{
                            background: `color-mix(in oklch, ${color} 14%, transparent)`,
                            color,
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.4}
                          >
                            <path d="m5 12 5 5L20 7" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-[10px] font-semibold leading-tight text-(--color-text-primary)">
                            {label}
                          </p>
                          <p className="text-[9px] text-(--color-text-tertiary) leading-tight">
                            {sub}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              }
            />

            <PatCard
              title="Page Layout"
              desc="Full page assembly — header, hero, features, CTA, footer — wired together with consistent rhythm and section spacing."
              tags={["Header", "Hero", "Features", "CTA", "Footer"]}
              preview={
                <div
                  className="rounded-lg overflow-hidden border border-(--color-border-primary) bg-(--color-background-primary)"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  {/* header strip */}
                  <div className="h-3 border-b border-(--color-border-primary) flex items-center px-2 gap-1 bg-(--color-background-secondary)">
                    <span className="h-1 w-6 rounded-full bg-(--color-background-tertiary)" />
                    <span className="ml-auto h-1 w-3 rounded-full bg-(--color-background-tertiary)" />
                  </div>
                  {/* hero */}
                  <div
                    className="p-2 border-b border-(--color-border-primary)"
                    style={{
                      background:
                        "radial-gradient(ellipse at top, color-mix(in oklch, var(--color-interactive-primary) 18%, transparent), transparent)",
                    }}
                  >
                    <div className="h-1.5 w-2/3 rounded-full bg-(--color-background-tertiary)" />
                    <div className="mt-1 h-1.5 w-1/2 rounded-full bg-(--color-background-tertiary)" />
                    <div className="mt-1.5 flex gap-1">
                      <span
                        className="h-2 w-8 rounded-sm"
                        style={{
                          background: "var(--color-interactive-primary)",
                        }}
                      />
                      <span className="h-2 w-6 rounded-sm bg-(--color-background-tertiary)" />
                    </div>
                  </div>
                  {/* features */}
                  <div className="grid grid-cols-3 gap-1 p-2 border-b border-(--color-border-primary)">
                    {[
                      "var(--color-interactive-primary)",
                      "oklch(0.60 0.14 155)",
                      "oklch(0.75 0.17 85)",
                    ].map((color, i) => (
                      <div
                        key={i}
                        className="rounded border border-(--color-border-primary) p-1.5 space-y-1"
                      >
                        <span
                          className="block h-2 w-2 rounded"
                          style={{ background: color }}
                        />
                        <div className="h-1 w-3/4 rounded-full bg-(--color-background-tertiary)" />
                        <div className="h-1 w-full rounded-full bg-(--color-background-tertiary)" />
                      </div>
                    ))}
                  </div>
                  {/* cta */}
                  <div className="p-2 border-b border-(--color-border-primary) bg-(--color-background-secondary)">
                    <div className="rounded border border-(--color-border-primary) bg-(--color-background-primary) p-1.5 flex items-center justify-between">
                      <div className="h-1.5 w-16 rounded-full bg-(--color-background-tertiary)" />
                      <span
                        className="h-2.5 w-8 rounded-sm"
                        style={{
                          background: "var(--color-interactive-primary)",
                        }}
                      />
                    </div>
                  </div>
                  {/* footer */}
                  <div className="p-2 grid grid-cols-4 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1 rounded-full bg-(--color-background-tertiary)"
                      />
                    ))}
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          08 — RESPONSIVE
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-responsive"
        className="border-b border-(--color-border-primary) bg-(--color-background-secondary)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="08"
            count={1}
            title="Responsive"
            desc={`Breakpoint-aware layout decisions. Not just "shrink the desktop" — structural reflows that pick the right pattern for each surface size.`}
          />
          <PatCard
            full
            title="Responsive Patterns"
            desc="Structural reflows for sidebar, table, and filter UIs across breakpoints — not pure shrink-to-fit. Each pattern declares which alternate component it morphs into at each step."
            tags={["Sidebar", "Sheet", "Table", "Card", "Tabs"]}
            preview={
              <div>
                <div className="grid grid-cols-12 gap-3 max-w-205 mx-auto">
                  {/* mobile */}
                  <div className="col-span-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                        sm · 375
                      </span>
                      <span className="font-mono text-[9px] text-(--color-text-tertiary)">
                        1 col
                      </span>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-(--color-border-primary) bg-(--color-background-primary) aspect-3/5 p-1.5 space-y-1">
                      <div className="h-3 rounded bg-(--color-background-tertiary)" />
                      <div
                        className="rounded p-1.5"
                        style={{
                          background:
                            "color-mix(in oklch, var(--color-interactive-primary) 10%, transparent)",
                        }}
                      >
                        <div className="h-1 w-3/4 rounded-full bg-(--color-background-tertiary)" />
                        <div className="mt-1 h-1 w-1/2 rounded-full bg-(--color-background-tertiary)" />
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="rounded border border-(--color-border-primary) h-5"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* tablet */}
                  <div className="col-span-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                        md · 768
                      </span>
                      <span className="font-mono text-[9px] text-(--color-text-tertiary)">
                        2 col
                      </span>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-(--color-border-primary) bg-(--color-background-primary) aspect-4/5 p-2 space-y-1.5">
                      <div className="h-3 rounded bg-(--color-background-tertiary)" />
                      <div
                        className="rounded p-2"
                        style={{
                          background:
                            "color-mix(in oklch, var(--color-interactive-primary) 10%, transparent)",
                        }}
                      >
                        <div className="h-1.5 w-2/3 rounded-full bg-(--color-background-tertiary)" />
                        <div className="mt-1 h-1.5 w-1/2 rounded-full bg-(--color-background-tertiary)" />
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="rounded border border-(--color-border-primary) h-6"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* desktop */}
                  <div className="col-span-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="rounded px-1.5 py-0.5 font-mono text-[9px]"
                        style={{
                          background: "var(--color-interactive-primary)",
                          color: "var(--color-text-inverse)",
                        }}
                      >
                        lg · 1280
                      </span>
                      <span className="font-mono text-[9px] text-(--color-text-tertiary)">
                        sidebar + 3 col
                      </span>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-(--color-border-primary) bg-(--color-background-primary) aspect-5/4 p-2">
                      <div className="h-3 rounded bg-(--color-background-tertiary) mb-1.5" />
                      <div className="grid grid-cols-4 gap-1.5">
                        <div className="col-span-1 space-y-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="rounded h-1.5 bg-(--color-background-tertiary)"
                            />
                          ))}
                          <div
                            className="rounded h-1.5"
                            style={{
                              background: "var(--color-interactive-primary)",
                            }}
                          />
                        </div>
                        <div className="col-span-3 space-y-1">
                          <div
                            className="rounded p-1.5"
                            style={{
                              background:
                                "color-mix(in oklch, var(--color-interactive-primary) 10%, transparent)",
                            }}
                          >
                            <div className="h-1.5 w-1/2 rounded-full bg-(--color-background-tertiary)" />
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="rounded border border-(--color-border-primary) h-6"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* decision strip */}
                <div className="mt-4 mx-auto max-w-205 rounded-md border border-(--color-border-primary) bg-(--color-background-primary) px-3 py-2 grid grid-cols-3 gap-3 text-[10px]">
                  {[
                    {
                      label: "Below md",
                      desc: "Sidebar → drawer. Tabs → segmented control. Tables → cards.",
                    },
                    {
                      label: "md → lg",
                      desc: "Sidebar compact. 2-up content. Sticky filters.",
                    },
                    {
                      label: "lg and up",
                      desc: "Full sidebar. 3-up content. Inline filters.",
                    },
                  ].map(({ label, desc }) => (
                    <div key={label}>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                        {label}
                      </span>
                      <p className="mt-0.5 text-[10px] text-(--color-text-secondary)">
                        {desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            }
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          09 — ACCESSIBILITY
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-accessibility"
        className="border-b border-(--color-border-primary) bg-(--color-background-secondary)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="09"
            count={1}
            title="Accessibility"
            desc="Every component ships WCAG 2.2 AA–verified. These patterns demonstrate the practices behind that claim — focus management, error announcement, keyboard navigation, and visible focus rings backed by the token system."
          />
          <div className="grid md:grid-cols-2 gap-4">
            <PatCard
              full
              title="Accessibility Patterns"
              desc={`Reference implementations for focus rings, live regions, error announcement, keyboard navigation, and skip links. Built with the token system — --color-interactive-primary drives every focus indicator so a single token change updates the entire a11y surface.`}
              tags={["Form", "Alert", "Input", "Button", "Dialog"]}
              preview={
                <div className="grid md:grid-cols-3 gap-3 max-w-205 mx-auto">
                  {/* Focus ring demo */}
                  <div className="rounded-lg bg-(--color-background-primary) border border-(--color-border-primary) p-4">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                      Focus management
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                      <button
                        className="w-full h-7 flex items-center justify-center rounded-md text-[11px] font-semibold"
                        style={{
                          background: "var(--color-interactive-primary)",
                          color: "var(--color-text-inverse)",
                          boxShadow:
                            "0 0 0 3px color-mix(in oklch, var(--color-interactive-primary) 30%, transparent)",
                        }}
                      >
                        Focused button
                      </button>
                      <div
                        className="flex items-center h-7 border rounded-md px-2 text-[11px] text-(--color-text-tertiary)"
                        style={{
                          borderColor: "var(--color-interactive-primary)",
                          boxShadow:
                            "0 0 0 3px color-mix(in oklch, var(--color-interactive-primary) 22%, transparent)",
                        }}
                      >
                        Focused input
                      </div>
                      <p className="text-[10px] text-(--color-text-tertiary)">
                        3px offset ring · OKLCH token
                      </p>
                    </div>
                  </div>
                  {/* Error announcement */}
                  <div className="rounded-lg bg-(--color-background-primary) border border-(--color-border-primary) p-4">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                      Error announcement
                    </p>
                    <div className="mt-3 space-y-2">
                      <div>
                        <label className="block text-[10px] font-medium text-(--color-text-secondary) mb-1">
                          Email{" "}
                          <span
                            style={{ color: "oklch(0.62 0.18 29)" }}
                            aria-hidden
                          >
                            *
                          </span>
                        </label>
                        <div
                          className="flex items-center h-7 border rounded-md px-2 text-[11px]"
                          style={{
                            borderColor: "oklch(0.62 0.18 29)",
                            background:
                              "color-mix(in oklch, oklch(0.62 0.18 29) 6%, var(--color-background-primary))",
                          }}
                        >
                          <span className="text-(--color-text-primary)">
                            elena@wyl
                          </span>
                        </div>
                        <p
                          className="mt-1 flex items-center gap-1 text-[10px]"
                          style={{ color: "oklch(0.62 0.18 29)" }}
                          role="alert"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3 w-3 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.4}
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v5M12 16h.01" />
                          </svg>
                          Invalid email format
                        </p>
                      </div>
                      <p className="font-mono text-[9px] text-(--color-text-tertiary)">
                        role=&quot;alert&quot; · aria-describedby
                      </p>
                    </div>
                  </div>
                  {/* Keyboard nav */}
                  <div className="rounded-lg bg-(--color-background-primary) border border-(--color-border-primary) p-4">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-(--color-text-tertiary)">
                      Keyboard navigation
                    </p>
                    <div className="mt-3 space-y-1.5">
                      <div
                        className="flex items-center justify-between rounded px-2 py-1.5 text-[11px]"
                        style={{
                          background:
                            "color-mix(in oklch, var(--color-interactive-primary) 12%, transparent)",
                          color: "var(--color-interactive-primary)",
                        }}
                      >
                        <span>Option one</span>
                        <kbd className="font-mono text-[9px]">↑ ↓</kbd>
                      </div>
                      {["Option two", "Option three"].map((opt) => (
                        <div
                          key={opt}
                          className="flex items-center justify-between rounded px-2 py-1.5 text-[11px] text-(--color-text-secondary)"
                        >
                          {opt}
                        </div>
                      ))}
                      <p className="font-mono text-[9px] text-(--color-text-tertiary) mt-2">
                        roving tabIndex · Arrow keys
                      </p>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY ──────────────────────────────────────────── */}
      <section className="border-b border-(--color-border-primary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                Philosophy
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.05] text-(--color-text-primary)">
                A component is a primitive.{" "}
                <span style={{ color: "var(--color-interactive-primary)" }}>
                  A pattern is a decision.
                </span>
              </h2>
              <p className="mt-5 text-(--color-text-secondary)">
                Components answer &quot;what&quot;. Patterns answer &quot;when,
                how, and in what order&quot;. Two teams shipping the same Input
                on the same Card with the same Button can still produce two
                different sign-in forms — that&apos;s the inconsistency patterns
                exist to eliminate.
              </p>
            </div>
            <div className="md:col-span-7 space-y-3">
              {[
                {
                  num: "01",
                  color: "var(--color-interactive-primary)",
                  title: "Use a pattern when the answer is already known.",
                  body: "Sign-in flows, error boundaries, responsive sidebars — these have all been designed before. Reach for the pattern; spend your novelty budget on the product, not the plumbing.",
                  tokenFlow: false,
                },
                {
                  num: "02",
                  color: "oklch(0.60 0.14 155)",
                  title:
                    "Build from scratch when the problem is genuinely new.",
                  body: "If no pattern fits, compose from components instead of bending a near-miss pattern out of shape. Then nominate the result for inclusion — that's how the catalog grows.",
                  tokenFlow: false,
                },
                {
                  num: "03",
                  color: "oklch(0.75 0.17 85)",
                  title: "Patterns stay in sync via the token layer.",
                  body: null,
                  tokenFlow: true,
                },
              ].map(({ num, color, title, body, tokenFlow }) => (
                <div
                  key={num}
                  className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-6"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded font-mono text-xs font-semibold"
                      style={{
                        background: `color-mix(in oklch, ${color} 14%, transparent)`,
                        color,
                      }}
                    >
                      {num}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-(--color-text-primary)">
                        {title}
                      </h3>
                      {body && (
                        <p className="text-sm text-(--color-text-secondary) mt-1">
                          {body}
                        </p>
                      )}
                      {tokenFlow && (
                        <>
                          <p className="text-sm text-(--color-text-secondary) mt-1">
                            When{" "}
                            <code className="font-mono text-xs">
                              --color-interactive-primary
                            </code>{" "}
                            moves, every button, badge, and focus ring across
                            every pattern moves with it — no pattern-by-pattern
                            refactor required.
                          </p>
                          <div className="mt-4 flex items-center gap-2 rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) px-3 py-2.5">
                            {["tokens", "components"].map((label) => (
                              <React.Fragment key={label}>
                                <span className="font-mono text-[10px] text-(--color-text-secondary)">
                                  {label}
                                </span>
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-3 w-3 text-(--color-text-tertiary)"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                              </React.Fragment>
                            ))}
                            <span
                              className="font-mono text-[10px]"
                              style={{
                                color: "var(--color-interactive-primary)",
                              }}
                            >
                              patterns
                            </span>
                            <svg
                              viewBox="0 0 24 24"
                              className="h-3 w-3 text-(--color-text-tertiary)"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                            <span className="font-mono text-[10px] text-(--color-text-secondary)">
                              your pages
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ──────────────────────────────────────────── */}
      <section className="border-b border-(--color-border-primary)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="glass rounded-2xl p-8 lg:p-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <div className="flex-1">
              <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
                Ready to build?
              </p>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-(--color-text-primary)">
                See every pattern live in Storybook.
              </h2>
              <p className="mt-2 text-(--color-text-secondary) max-w-lg">
                Each pattern ships with full states, controls, and copy-paste
                source. The Storybook mirrors what you see on this page — minus
                the pixel gap.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href="https://wyliedogstorybook.com"
                className="inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-sm font-semibold"
                style={{
                  background: "var(--color-interactive-primary)",
                  color: "var(--color-text-inverse)",
                }}
              >
                View in Storybook
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
              <Link
                href="/components"
                className="inline-flex h-10 items-center rounded-md border border-(--color-border-primary) px-4 text-sm font-semibold text-(--color-text-primary) hover:bg-(--color-background-secondary) transition-colors"
              >
                Browse components →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
