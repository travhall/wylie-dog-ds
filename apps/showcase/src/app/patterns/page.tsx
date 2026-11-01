import React from "react";
import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import {
  SiteHeaderPreview,
  SiteFooterPreview,
  SectionHeroPreview,
  SectionFeaturesPreview,
  PageLayoutPreview,
  CardGridPreview,
  FeatureGridPreview,
} from "./composition-previews";
import {
  LoginPreview,
  RecoveryPreview,
  ContactFormPreview,
  ValidationPreview,
} from "./form-previews";
import manifest from "@wyliedog/tokens/manifest.json";
import {
  getShowcaseMeta,
  getPatternCategoryCounts,
  getPatternDocsPath,
} from "@/lib/showcase-metadata";

/* ─── Pattern card ───────────────────────────────────────────── */
function PatCard({
  title,
  desc,
  tags,
  preview,
  story,
  full = false,
  decorative = false,
  live = false,
}: {
  title: string;
  desc: string;
  tags: string[];
  preview: React.ReactNode;
  story: string;
  full?: boolean;
  decorative?: boolean;
  /** Real components: not a mock, so no `data-mock` and no `aria-hidden`. */
  live?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border border-(--color-border-default) bg-(--color-background-default) overflow-hidden flex flex-col hover:border-(--color-border-primary) transition-all${full ? " md:col-span-2" : ""}`}
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="relative bg-(--color-background-muted) border-b border-(--color-border-default) overflow-hidden flex place-content-center grow"
        style={{
          minHeight: "17.5rem",
          padding: "1.25rem",
        }}
      >
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklch, var(--color-foreground-default) 8%, transparent) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div
          data-mock={live ? undefined : true}
          aria-hidden={live ? undefined : decorative || undefined}
          className={`relative flex items-center justify-center${live ? " w-full" : ""}`}
        >
          {preview}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-(--color-foreground-default)">
            {title}
          </h3>
          <a
            href={`https://wyliedogstorybook.com/?path=${getPatternDocsPath(story) ?? "/"}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-(--color-foreground-faint) hover:text-(--color-foreground-primary-muted) transition-colors"
          >
            Storybook ↗
          </a>
        </div>
        <p className="text-sm text-(--color-foreground-muted) mt-1 leading-relaxed">
          {desc}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-full border border-(--color-border-default) bg-(--color-background-default) font-mono text-xs text-(--color-foreground-muted)"
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
          <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
            Category {num}
          </span>
          <span className="font-mono text-xs text-(--color-foreground-faint)">
            ·
          </span>
          <span className="font-mono text-xs text-(--color-foreground-faint)">
            {count} pattern{count !== 1 ? "s" : ""}
          </span>
        </div>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-(--color-foreground-muted)">{desc}</p>
      </div>
    </header>
  );
}

export default function PatternsPage() {
  const meta = getShowcaseMeta();
  const patternCategoryCount = (dirName: string) =>
    getPatternCategoryCounts().find((c) => c.dirName === dirName)?.count ?? 0;
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
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--color-border-default) bg-(--color-background-default)/60 px-3 py-1">
              <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)">
                04 · Patterns
              </span>
              <span className="text-(--color-foreground-faint)">·</span>
              <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                @wyliedog/ui v{meta.versions.ui}
              </span>
            </div>

            <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.98] text-(--color-foreground-default)">
              Complete UI solutions,{" "}
              <span style={{ color: "var(--color-foreground-primary-muted)" }}>
                not just components.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-(--color-foreground-muted) text-balance">
              Patterns are higher-order compositions — assembled from
              primitives, wired to the same token system, and tested against the
              same accessibility checklist. When the tokens move, every pattern
              moves with them.
            </p>
          </div>

          {/* relationship diagram */}
          <div className="mt-12 flex flex-col lg:flex-row gap-3">
            {/* INPUTS — takes 2/4 cols */}
            <div className="md:col-span-2 rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5 grow">
              <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                inputs
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-(--color-border-default) bg-(--color-background-muted) p-3">
                  <p className="text-xs font-semibold text-(--color-foreground-default)">
                    Components
                  </p>
                  <p className="font-mono text-xs text-(--color-foreground-faint) mt-1">
                    42 typed primitives
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {["Button", "Input", "Card"].map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center px-1.5 py-px rounded-full border border-(--color-border-default) font-mono text-xs text-(--color-foreground-muted) bg-(--color-background-default)"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-(--color-border-default) bg-(--color-background-muted) p-3">
                  <p className="text-xs font-semibold text-(--color-foreground-default)">
                    Tokens
                  </p>
                  <p className="font-mono text-xs text-(--color-foreground-faint) mt-1">
                    {Object.values(manifest.primitives.colors).reduce(
                      (n, g) => n + Object.keys(g).length,
                      0
                    )}{" "}
                    OKLCH colors
                  </p>
                  <div className="mt-3 flex gap-1">
                    {[
                      "var(--color-background-primary)",
                      "var(--color-foreground-success-muted)",
                      "var(--color-foreground-warning-muted)",
                      "var(--color-foreground-danger-muted)",
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
                className="w-16 h-6"
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
                borderColor: "var(--color-border-primary)",
                background:
                  "color-mix(in oklch, var(--color-background-primary) 6%, var(--color-background-default))",
              }}
            >
              <p
                className="font-mono text-xs uppercase tracking-wider"
                style={{ color: "var(--color-foreground-primary-muted)" }}
              >
                composed into
              </p>
              <p className="mt-3 font-serif text-2xl font-semibold text-(--color-foreground-default)">
                Patterns
              </p>
              <p className="text-xs text-(--color-foreground-muted) mt-1">
                {meta.patterns.count} reference compositions across{" "}
                {meta.patterns.categories} categories.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-1">
                {[22, 18, 14].map((opacity, i) => (
                  <div
                    key={i}
                    className="h-6 rounded"
                    style={{
                      background: `color-mix(in oklch, var(--color-background-primary) ${opacity}%, transparent)`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center w-16">
              <svg
                viewBox="0 0 80 24"
                className="w-16 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 12h70M62 4l10 8-10 8" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* SHIPPED AS — Pages */}
            <div className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5 grow">
              <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                shipped as
              </p>
              <p className="mt-3 font-serif text-2xl font-semibold text-(--color-foreground-default)">
                Pages
              </p>
              <p className="text-xs text-(--color-foreground-muted) mt-1">
                Real product surfaces, end-to-end.
              </p>
              <div className="mt-3 space-y-1">
                <div className="h-1.5 w-3/4 rounded-full bg-(--color-background-muted)" />
                <div className="h-1.5 w-full rounded-full bg-(--color-background-muted)" />
                <div className="h-1.5 w-2/3 rounded-full bg-(--color-background-muted)" />
              </div>
            </div>
          </div>
        </div>

        {/* stats strip */}
        <div className="relative border-t border-(--color-border-default) bg-(--color-background-default)/60 backdrop-blur-sm">
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
                  label: "Built from",
                  value: "Primitives",
                  sub: "and the compositions",
                },
                {
                  label: "Accessible",
                  value: "WCAG 2.2",
                  sub: "AA targeted",
                },
              ].map(({ label, value, sub }, i) => (
                <div
                  key={label}
                  className={`px-2 py-6 lg:py-7 ${i < 3 ? "lg:border-r border-(--color-border-default)" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} ${i > 0 ? "lg:pl-8" : ""}`}
                >
                  <dt className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                    {label}
                  </dt>
                  <dd className="mt-1 flex items-baseline gap-2">
                    <span className="font-serif text-3xl sm:text-4xl font-semibold text-(--color-foreground-default)">
                      {value}
                    </span>
                    <span className="text-xs text-(--color-foreground-faint)">
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
        className="border-b border-(--color-border-default)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="01"
            count={patternCategoryCount("Authentication Patterns")}
            title="Authentication"
            desc="Sign-in, registration and account recovery examples, with validation states, error messages and social-auth placeholders."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PatCard
              live
              story="login-registration"
              title="Login & Registration"
              desc="Simple login, login with social auth, a registration form, and a tabbed login and registration form."
              tags={["Card", "Form", "Input", "Button", "Tabs", "Checkbox"]}
              preview={<LoginPreview />}
            />

            <PatCard
              live
              story="password-recovery"
              title="Password Recovery"
              desc="Forgot-password email step, reset-password form, an invalid-link state, and a multi-step recovery flow."
              tags={["Card", "Form", "Input", "Alert", "Button"]}
              preview={<RecoveryPreview />}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          02 — DATA DISPLAY
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-data"
        className="border-b border-(--color-border-default) bg-(--color-background-muted)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="02"
            count={patternCategoryCount("Data Patterns")}
            title="Data display"
            desc="Browseable grids and showcase grids. Both share the same card primitive but differ in density and what they ask the user to do next."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PatCard
              live
              story="card-grid"
              title="Card Grid"
              desc="Responsive grid of cards with default, all-variants and interactive examples. CardGrid takes a column count per breakpoint."
              tags={["CardGrid", "Card", "Badge", "Button"]}
              preview={<CardGridPreview />}
            />

            <PatCard
              live
              story="feature-grid"
              title="Feature Grid"
              desc="A grid of features with icons, titles and short descriptions, with several column configurations."
              tags={["FeatureGrid"]}
              preview={<FeatureGridPreview />}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          03 — FEEDBACK
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-feedback"
        className="border-b border-(--color-border-default)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="03"
            count={patternCategoryCount("Feedback Patterns")}
            title="Feedback"
            desc="When something fails, the pattern catches it. Error states aren't an afterthought — they're designed as carefully as the happy path."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PatCard
              story="error-boundary-patterns"
              full
              title="Error Boundary Patterns"
              desc="Basic and recoverable error boundaries, multiple and granular boundaries, custom fallback UI, and error logging."
              tags={["Alert", "Badge", "Button", "Card"]}
              preview={
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-160 mx-auto">
                  <div className="rounded-lg bg-(--color-background-default) border border-(--color-border-default) p-4">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full"
                      style={{
                        background:
                          "color-mix(in oklch, var(--color-foreground-danger-muted) 14%, transparent)",
                        color: "var(--color-foreground-danger-muted)",
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
                    <p className="mt-3 font-serif text-base font-semibold leading-tight text-(--color-foreground-default)">
                      Something broke on our end
                    </p>
                    <p className="text-[0.6875rem] text-(--color-foreground-muted) mt-1">
                      The team has been pinged. Your work was auto-saved 12s
                      ago.
                    </p>
                    <div className="mt-3 rounded border border-(--color-border-default) bg-(--color-background-muted) p-2 font-mono text-[0.5625rem] text-(--color-foreground-faint)">
                      error.id&nbsp;&nbsp;
                      <span className="text-(--color-foreground-muted)">
                        err_8f3a2b1c
                      </span>
                    </div>
                    <div className="mt-3 flex gap-1.5">
                      <Button
                        size="sm"
                        className="h-7 gap-1 text-[0.6875rem] font-semibold"
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
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[0.6875rem] font-semibold"
                      >
                        Go to dashboard
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg bg-(--color-background-default) border border-(--color-border-default) p-4">
                    <p className="font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                      component-scoped
                    </p>
                    <div
                      className="mt-2 rounded-md border bg-(--color-background-default) p-3"
                      style={{
                        borderColor:
                          "color-mix(in oklch, var(--color-foreground-danger-muted) 40%, transparent)",
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className="grid h-4 w-4 mt-px place-items-center rounded"
                          style={{
                            color: "var(--color-foreground-danger-muted)",
                          }}
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
                          <p className="text-[0.6875rem] font-semibold text-(--color-foreground-default)">
                            Chart failed to render
                          </p>
                          <p className="text-[0.625rem] text-(--color-foreground-faint) mt-0.5">
                            RangeError: data points exceed buffer.
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-5 px-1.5 font-mono text-[0.5625rem]"
                            style={{
                              background:
                                "color-mix(in oklch, var(--color-foreground-danger-muted) 14%, transparent)",
                              color: "var(--color-foreground-danger-muted)",
                            }}
                          >
                            Retry isolated
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="font-mono text-[0.5625rem] mt-3 text-(--color-foreground-faint)">
                      <span
                        style={{
                          color: "var(--color-foreground-success-muted)",
                        }}
                      >
                        ●
                      </span>{" "}
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
        className="border-b border-(--color-border-default) bg-(--color-background-muted)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="04"
            count={patternCategoryCount("Form Patterns")}
            title="Forms"
            desc="Form composition and validation are the largest source of bespoke UI in any product. These patterns close the gap so teams stop reinventing field groupings, error display, and async submit states."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PatCard
              live
              story="form-compositions"
              title="Form Compositions"
              desc="Contact, multi-step, preferences, project-creation, payment and settings forms built from the system's form components."
              tags={["Form", "Input", "Select", "Checkbox", "Switch", "Tabs"]}
              preview={<ContactFormPreview />}
            />

            <PatCard
              live
              story="form-validation-patterns"
              title="Form Validation Patterns"
              desc="Required-field, inline, password-strength, multi-step and async validation using the Form components and controlled state, with no external validation library."
              tags={["Form", "Input", "Textarea", "Alert", "Button"]}
              preview={<ValidationPreview />}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          05 — LAYOUT
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-layout"
        className="border-b border-(--color-border-default)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="05"
            count={patternCategoryCount("Layout Patterns")}
            title="Layout"
            desc="Page-level layouts built from the system's components: a dashboard, a settings page, a landing page and a user profile."
          />
          <PatCard
            story="layout-patterns"
            full
            title="Layout Patterns"
            desc="Dashboard, settings page, landing page and user profile layouts, each composed from cards, inputs and separators."
            tags={["Card", "Avatar", "Badge", "Button", "Input", "Separator"]}
            preview={
              <div
                className="mx-auto max-w-180 rounded-lg overflow-hidden border border-(--color-border-default) bg-(--color-background-default)"
                style={{ boxShadow: "var(--shadow-md)" }}
              >
                <div className="flex items-center gap-2 px-3 py-2 border-b border-(--color-border-default) bg-(--color-background-muted)">
                  <div className="flex gap-1">
                    {[
                      "var(--color-background-danger)",
                      "var(--color-background-warning)",
                      "var(--color-background-success)",
                    ].map((c, i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[0.5625rem] text-(--color-foreground-faint) ml-2">
                    helios.wyliedog.dev/projects
                  </span>
                  <span className="ml-auto inline-flex h-4 items-center rounded border border-(--color-border-default) bg-(--color-background-default) px-1 font-mono text-[0.5rem] text-(--color-foreground-muted)">
                    ⌘K
                  </span>
                </div>
                <div className="grid grid-cols-12 h-55">
                  <aside className="col-span-3 border-r border-(--color-border-default) p-3 bg-(--color-background-default)">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="grid h-4 w-4 place-items-center rounded"
                        style={{
                          background: "var(--color-background-primary)",
                        }}
                      />
                      <span className="text-[0.625rem] font-serif font-semibold text-(--color-foreground-default)">
                        Helios
                      </span>
                    </div>
                    <div className="mt-3 space-y-0.5">
                      <div
                        className="flex items-center gap-1.5 rounded px-1.5 py-1 text-[0.625rem] font-medium"
                        style={{
                          background:
                            "color-mix(in oklch, var(--color-background-primary) 14%, transparent)",
                          color: "var(--color-foreground-primary-muted)",
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
                          className="flex items-center gap-1.5 rounded px-1.5 py-1 text-[0.625rem] text-(--color-foreground-muted)"
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </aside>
                  <div className="col-span-9 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[0.6875rem] font-serif font-semibold text-(--color-foreground-default)">
                        Projects
                      </p>
                      <Button
                        size="sm"
                        className="h-5.5 px-2 text-[0.625rem] font-semibold"
                      >
                        + New
                      </Button>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {[60, 30, 85].map((w, i) => (
                        <div
                          key={i}
                          className="rounded border border-(--color-border-default) p-2"
                        >
                          <div className="h-1.5 w-3/4 rounded-full bg-(--color-background-emphasis)" />
                          <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-(--color-background-emphasis)" />
                          <div
                            className="mt-2 h-1 w-full rounded-full"
                            style={{
                              background: "var(--color-background-emphasis)",
                            }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${w}%`,
                                background:
                                  i === 2
                                    ? "var(--color-foreground-success-muted)"
                                    : "var(--color-background-accent)",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded border border-(--color-border-default)">
                      <div className="grid grid-cols-4 px-2 py-1 bg-(--color-background-muted) font-mono text-[0.5rem] uppercase tracking-wider text-(--color-foreground-faint)">
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
                          color: "var(--color-foreground-success-muted)",
                        },
                        {
                          name: "Token bridge",
                          owner: "JR",
                          due: "Jun 18",
                          status: "at risk",
                          color: "var(--color-foreground-warning-muted)",
                        },
                      ].map(({ name, owner, due, status, color }) => (
                        <div
                          key={name}
                          className="grid grid-cols-4 px-2 py-1 border-t border-(--color-border-default) text-[0.5625rem] text-(--color-foreground-default)"
                        >
                          <span>{name}</span>
                          <span className="text-(--color-foreground-muted)">
                            {owner}
                          </span>
                          <span className="text-(--color-foreground-muted)">
                            {due}
                          </span>
                          <span className="text-right">
                            <span
                              className="inline-block rounded px-1 font-mono text-[0.5rem]"
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
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
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
        className="border-b border-(--color-border-default) bg-(--color-background-muted)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="06"
            count={patternCategoryCount("Navigation Patterns")}
            title="Navigation"
            desc="Header and footer for marketing surfaces — the bookends of every public page. Used on this site too, so they're self-eating dog food."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PatCard
              live
              full
              story="site-header"
              title="Site Header"
              desc="Header with logo, navigation links and actions, sticky with a backdrop blur; default and transparent variants. Used as the header on this site."
              tags={["SiteHeader", "Button"]}
              preview={<SiteHeaderPreview />}
            />

            <PatCard
              live
              full
              story="site-footer"
              title="Site Footer"
              desc="Footer with logo, navigation columns, social links and copyright; default and minimal variants with a responsive grid."
              tags={["SiteFooter"]}
              preview={<SiteFooterPreview />}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          07 — PAGE COMPOSITIONS
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-page"
        className="border-b border-(--color-border-default)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="07"
            count={patternCategoryCount("Page Compositions")}
            title="Page compositions"
            desc="Pre-assembled marketing surfaces — the big building blocks of a public page. Each section composes lower-order patterns; the page composition wires them together end-to-end."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PatCard
              live
              full
              story="section-hero"
              title="Section: Hero"
              desc="Headline, description, action buttons and an optional badge or image, in default, gradient and centered layouts."
              tags={["SectionHero"]}
              preview={<SectionHeroPreview />}
            />

            <PatCard
              live
              full
              story="section-features"
              title="Section: Features"
              desc="Features section built on FeatureGrid, with optional badges, several column configurations and style variants."
              tags={["SectionFeatures"]}
              preview={<SectionFeaturesPreview />}
            />

            <PatCard
              live
              full
              story="page-layout"
              title="Page Layout"
              desc="Full-page layout with header, footer, sidebar and main content, in several width variants with a left or right sidebar."
              tags={["PageLayout", "SiteHeader", "SiteFooter", "Button"]}
              preview={<PageLayoutPreview />}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          08 — RESPONSIVE
          ══════════════════════════════════════════════════════════ */}
      <section
        id="cat-responsive"
        className="border-b border-(--color-border-default) bg-(--color-background-muted)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="08"
            count={patternCategoryCount("Responsive")}
            title="Responsive"
            desc={`Breakpoint-aware layout decisions. Not just "shrink the desktop" — structural reflows that pick the right pattern for each surface size.`}
          />
          <PatCard
            decorative
            story="responsive-patterns"
            full
            title="Responsive Patterns"
            desc="A responsive card grid, navigation and form. Use Storybook's viewport toolbar to compare mobile, tablet and desktop."
            tags={["Card", "CardGrid", "Badge", "Button", "Label"]}
            preview={
              <div>
                <div className="grid grid-cols-12 gap-3 max-w-205 mx-auto">
                  {/* mobile */}
                  <div className="col-span-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                        sm · 375
                      </span>
                      <span className="font-mono text-[0.5625rem] text-(--color-foreground-faint)">
                        1 col
                      </span>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-(--color-border-default) bg-(--color-background-default) aspect-3/5 p-1.5 space-y-1">
                      <div className="h-3 rounded bg-(--color-background-emphasis)" />
                      <div
                        className="rounded p-1.5"
                        style={{
                          background:
                            "color-mix(in oklch, var(--color-background-primary) 10%, transparent)",
                        }}
                      >
                        <div className="h-1 w-3/4 rounded-full bg-(--color-background-emphasis)" />
                        <div className="mt-1 h-1 w-1/2 rounded-full bg-(--color-background-emphasis)" />
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="rounded border border-(--color-border-default) h-5"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* tablet */}
                  <div className="col-span-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                        md · 768
                      </span>
                      <span className="font-mono text-[0.5625rem] text-(--color-foreground-faint)">
                        2 col
                      </span>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-(--color-border-default) bg-(--color-background-default) aspect-4/5 p-2 space-y-1.5">
                      <div className="h-3 rounded bg-(--color-background-emphasis)" />
                      <div
                        className="rounded p-2"
                        style={{
                          background:
                            "color-mix(in oklch, var(--color-background-primary) 10%, transparent)",
                        }}
                      >
                        <div className="h-1.5 w-2/3 rounded-full bg-(--color-background-emphasis)" />
                        <div className="mt-1 h-1.5 w-1/2 rounded-full bg-(--color-background-emphasis)" />
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="rounded border border-(--color-border-default) h-6"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* desktop */}
                  <div className="col-span-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="rounded px-1.5 py-0.5 font-mono text-[0.5625rem]"
                        style={{
                          background: "var(--color-background-primary)",
                          color: "var(--color-foreground-primary)",
                        }}
                      >
                        lg · 1280
                      </span>
                      <span className="font-mono text-[0.5625rem] text-(--color-foreground-faint)">
                        sidebar + 3 col
                      </span>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-(--color-border-default) bg-(--color-background-default) aspect-5/4 p-2">
                      <div className="h-3 rounded bg-(--color-background-emphasis) mb-1.5" />
                      <div className="grid grid-cols-4 gap-1.5">
                        <div className="col-span-1 space-y-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="rounded h-1.5 bg-(--color-background-emphasis)"
                            />
                          ))}
                          <div
                            className="rounded h-1.5"
                            style={{
                              background: "var(--color-background-primary)",
                            }}
                          />
                        </div>
                        <div className="col-span-3 space-y-1">
                          <div
                            className="rounded p-1.5"
                            style={{
                              background:
                                "color-mix(in oklch, var(--color-background-primary) 10%, transparent)",
                            }}
                          >
                            <div className="h-1.5 w-1/2 rounded-full bg-(--color-background-emphasis)" />
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="rounded border border-(--color-border-default) h-6"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* decision strip */}
                <div className="mt-4 mx-auto max-w-205 rounded-md border border-(--color-border-default) bg-(--color-background-default) px-3 py-2 grid grid-cols-3 gap-3 text-[0.625rem]">
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
                      <span className="font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                        {label}
                      </span>
                      <p className="mt-0.5 text-[0.625rem] text-(--color-foreground-muted)">
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
        className="border-b border-(--color-border-default) bg-(--color-background-muted)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <CatHeader
            num="09"
            count={patternCategoryCount("Accessibility")}
            title="Accessibility"
            desc="Components are tested against WCAG 2.2 AA. These patterns show focus management, live-region announcements, a keyboard-only form, color-contrast checks and skip navigation."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PatCard
              story="accessibility-patterns"
              full
              title="Accessibility Patterns"
              desc={`Reference implementations for focus rings, live regions, error announcement, keyboard navigation, and skip links. The shared focus indicator is driven by --color-focus-ring and --color-focus-halo, so a token change updates it everywhere.`}
              tags={[
                "Alert",
                "Badge",
                "Button",
                "Dialog",
                "Input",
                "Label",
                "Select",
              ]}
              preview={
                <div className="grid md:grid-cols-3 gap-3 max-w-205 mx-auto">
                  {/* Focus ring demo */}
                  <div className="rounded-lg bg-(--color-background-default) border border-(--color-border-default) p-4">
                    <p className="font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                      Focus management
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                      <Button
                        className="w-full h-7 text-[0.6875rem] font-semibold"
                        style={{
                          boxShadow:
                            "0 0 0 2px var(--color-focus-halo), 0 0 0 4px var(--color-focus-ring)",
                        }}
                      >
                        Focused button
                      </Button>
                      <div
                        className="flex items-center h-7 border rounded-md px-2 text-[0.6875rem] text-(--color-foreground-faint)"
                        style={{
                          borderColor: "var(--color-focus-ring)",
                          boxShadow:
                            "0 0 0 2px var(--color-focus-halo), 0 0 0 4px var(--color-focus-ring)",
                        }}
                      >
                        Focused input
                      </div>
                      <p className="text-[0.625rem] text-(--color-foreground-faint)">
                        3px offset ring · OKLCH token
                      </p>
                    </div>
                  </div>
                  {/* Error announcement */}
                  <div className="rounded-lg bg-(--color-background-default) border border-(--color-border-default) p-4">
                    <p className="font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                      Error announcement
                    </p>
                    <div className="mt-3 space-y-2">
                      <div>
                        <label className="block text-[0.625rem] font-medium text-(--color-foreground-muted) mb-1">
                          Email{" "}
                          <span
                            style={{
                              color: "var(--color-foreground-danger-muted)",
                            }}
                            aria-hidden
                          >
                            *
                          </span>
                        </label>
                        <div
                          className="flex items-center h-7 border rounded-md px-2 text-[0.6875rem]"
                          style={{
                            borderColor: "var(--color-border-danger)",
                            background:
                              "color-mix(in oklch, var(--color-foreground-danger-muted) 6%, var(--color-background-default))",
                          }}
                        >
                          <span className="text-(--color-foreground-default)">
                            elena@wyl
                          </span>
                        </div>
                        <p
                          className="mt-1 flex items-center gap-1 text-[0.625rem]"
                          style={{
                            color: "var(--color-foreground-danger-muted)",
                          }}
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
                      <p className="font-mono text-[0.5625rem] text-(--color-foreground-faint)">
                        role=&quot;alert&quot; · aria-describedby
                      </p>
                    </div>
                  </div>
                  {/* Keyboard nav */}
                  <div className="rounded-lg bg-(--color-background-default) border border-(--color-border-default) p-4">
                    <p className="font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                      Keyboard navigation
                    </p>
                    <div className="mt-3 space-y-1.5">
                      <div
                        className="flex items-center justify-between rounded px-2 py-1.5 text-[0.6875rem]"
                        style={{
                          background:
                            "color-mix(in oklch, var(--color-background-primary) 12%, transparent)",
                          color: "var(--color-foreground-primary-muted)",
                        }}
                      >
                        <span>Option one</span>
                        <kbd className="font-mono text-[0.5625rem]">↑ ↓</kbd>
                      </div>
                      {["Option two", "Option three"].map((opt) => (
                        <div
                          key={opt}
                          className="flex items-center justify-between rounded px-2 py-1.5 text-[0.6875rem] text-(--color-foreground-muted)"
                        >
                          {opt}
                        </div>
                      ))}
                      <p className="font-mono text-[0.5625rem] text-(--color-foreground-faint) mt-2">
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
      <section className="border-b border-(--color-border-default)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-5">
              <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                Philosophy
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.05] text-(--color-foreground-default)">
                A component is a primitive.{" "}
                <span
                  style={{ color: "var(--color-foreground-primary-muted)" }}
                >
                  A pattern is a decision.
                </span>
              </h2>
              <p className="mt-5 text-(--color-foreground-muted)">
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
                  color: "var(--color-foreground-primary-muted)",
                  title: "Use a pattern when the answer is already known.",
                  body: "Sign-in flows, error boundaries, responsive sidebars — these have all been designed before. Reach for the pattern; spend your novelty budget on the product, not the plumbing.",
                  tokenFlow: false,
                },
                {
                  num: "02",
                  color: "var(--color-foreground-success-muted)",
                  title:
                    "Build from scratch when the problem is genuinely new.",
                  body: "If no pattern fits, compose from components instead of bending a near-miss pattern out of shape. Then nominate the result for inclusion — that's how the catalog grows.",
                  tokenFlow: false,
                },
                {
                  num: "03",
                  color: "var(--color-foreground-warning-muted)",
                  title: "Patterns stay in sync via the token layer.",
                  body: null,
                  tokenFlow: true,
                },
              ].map(({ num, color, title, body, tokenFlow }) => (
                <div
                  key={num}
                  className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-6"
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
                      <h3 className="font-serif text-lg font-semibold text-(--color-foreground-default)">
                        {title}
                      </h3>
                      {body && (
                        <p className="text-sm text-(--color-foreground-muted) mt-1">
                          {body}
                        </p>
                      )}
                      {tokenFlow && (
                        <>
                          <p className="text-sm text-(--color-foreground-muted) mt-1">
                            When{" "}
                            <code className="font-mono text-xs">
                              --color-background-primary
                            </code>{" "}
                            moves, every button, badge, and focus ring across
                            every pattern moves with it — no pattern-by-pattern
                            refactor required.
                          </p>
                          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-(--color-border-default) bg-(--color-background-muted) px-3 py-2.5">
                            {["tokens", "components"].map((label) => (
                              <React.Fragment key={label}>
                                <span className="font-mono text-xs text-(--color-foreground-muted)">
                                  {label}
                                </span>
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-3 w-3 text-(--color-foreground-faint)"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                              </React.Fragment>
                            ))}
                            <span
                              className="font-mono text-xs"
                              style={{
                                color: "var(--color-foreground-primary-muted)",
                              }}
                            >
                              patterns
                            </span>
                            <svg
                              viewBox="0 0 24 24"
                              className="h-3 w-3 text-(--color-foreground-faint)"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                            <span className="font-mono text-xs text-(--color-foreground-muted)">
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
      <section className="border-b border-(--color-border-default)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="glass rounded-2xl p-8 lg:p-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <div className="flex-1">
              <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)">
                Ready to build?
              </p>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-(--color-foreground-default)">
                See every pattern live in Storybook.
              </h2>
              <p className="mt-2 text-(--color-foreground-muted) max-w-lg">
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
                  background: "var(--color-background-primary)",
                  color: "var(--color-foreground-primary)",
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
                className="inline-flex h-10 items-center rounded-md border border-(--color-border-default) px-4 text-sm font-semibold text-(--color-foreground-default) hover:bg-(--color-background-muted) transition-colors"
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
