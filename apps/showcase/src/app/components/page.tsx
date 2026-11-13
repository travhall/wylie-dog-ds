import Link from "next/link";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Card } from "@wyliedog/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@wyliedog/ui/breadcrumb";
import {
  ButtonPreview,
  CheckboxPreview,
  FormPreview,
  InputPreview,
  LabelPreview,
  RadioGroupPreview,
  SelectPreview,
  SliderPreview,
  SwitchPreview,
  TextareaPreview,
  TogglePreview,
  ToggleGroupPreview,
} from "./inputs/control-previews";
import {
  AccordionPreview,
  AlertPreview,
  AvatarPreview,
  BadgePreview,
  CalendarPreview,
  CardPreview,
  CarouselPreview,
  ProgressPreview,
  SkeletonPreview,
  TablePreview,
  ToastPreview,
} from "./inputs/content-previews";
import {
  AspectRatioPreview,
  CollapsiblePreview,
  ResizablePreview,
  ScrollAreaPreview,
  SeparatorPreview,
  BreadcrumbPreview,
  CommandPreview,
  MenubarPreview,
  NavigationMenuPreview,
  PaginationPreview,
  TabsPreview,
} from "./inputs/layout-nav-previews";
import {
  AlertDialogPreview,
  ContextMenuPreview,
  DialogPreview,
  DropdownMenuPreview,
  HoverCardPreview,
  PopoverPreview,
  SheetPreview,
  TooltipPreview,
} from "./inputs/overlay-previews";
import { SectionSubnav } from "@/components/section-subnav";
import { getShowcaseMeta, getStoryDocsUrl } from "@/lib/showcase-metadata";

/* ─── Reusable comp card ─────────────────────────────────────── */
function CompCard({
  name,
  desc,
  href,
  preview,
  decorative = false,
  live = false,
}: {
  name: string;
  desc: string;
  href: string;
  preview: React.ReactNode;
  decorative?: boolean;
  /** Real components: not a mock, so no `data-mock` and no `aria-hidden`. */
  live?: boolean;
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
        className="relative bg-(--color-background-muted) border-b border-(--color-border-default) min-h-48 flex-1 flex items-center justify-center overflow-hidden p-4"
        style={dotGrid}
      >
        <div
          data-mock={live ? undefined : true}
          aria-hidden={live ? undefined : decorative || undefined}
          className="relative z-10 flex items-center justify-center w-full h-full"
        >
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
          className="mt-2 inline-flex min-h-8 items-center gap-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint) hover:text-(--color-foreground-primary-muted) transition-colors"
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
  title,
  desc,
  count,
}: {
  title: string;
  desc: string;
  count: number;
}) {
  return (
    <header className="grid lg:grid-cols-12 gap-6 mb-10">
      <div className="lg:col-span-5">
        <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
          Category
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
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* left */}
            <div className="lg:col-span-6">
              <Badge
                variant="outline"
                className="gap-2 rounded-full bg-(--color-background-default)/60 px-3 py-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)"
              >
                Components
                <span className="text-(--color-foreground-faint)">·</span>
                <span className="text-(--color-foreground-faint)">
                  @wyliedog/ui v{meta.versions.ui}
                </span>
              </Badge>

              <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-[4.25rem] font-semibold tracking-tight leading-[0.98] text-(--color-foreground-default)">
                {meta.components.count} components. <br />
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
                    <dt className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
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
                  className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)"
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
                  <Card className="gap-0 p-5 shadow-none">
                    {/* Avatar + badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-grid place-items-center rounded-full font-semibold text-xs"
                          style={{
                            background: "var(--color-background-info-muted)",
                            color: "var(--color-foreground-info-muted)",
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
                          <p className="text-xs text-(--color-foreground-faint)">
                            Lead, Design Systems
                          </p>
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
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
                            background: "var(--color-background-accent)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Input */}
                    <label className="mt-5 block text-xs font-medium text-(--color-foreground-muted)">
                      Search components
                    </label>
                    <div
                      className="mt-1 flex items-center gap-2 h-8.5 rounded-[0.625rem] border px-2.5 text-sm"
                      style={{
                        borderColor: "var(--color-focus-ring)",
                        boxShadow:
                          "0 0 0 2px var(--color-focus-halo), 0 0 0 4px var(--color-focus-ring)",
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
                        <p className="text-xs text-(--color-foreground-faint)">
                          render every story in both themes
                        </p>
                      </div>
                      <span
                        className="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full"
                        style={{
                          background: "var(--color-background-accent)",
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
                  </Card>

                  {/* component tag strip */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint) mr-1">
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
                        className="inline-flex items-center rounded-full border border-(--color-border-default) bg-(--color-background-default) px-2 py-0.5 font-mono text-xs text-(--color-foreground-muted)"
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
            label: "Content Display",
            id: "content-display",
            count: categoryCount("Content-Display"),
          },
          {
            label: "Feedback & Status",
            id: "feedback",
            count: categoryCount("Feedback-Status"),
          },
          {
            label: "Inputs & Controls",
            id: "inputs",
            count: categoryCount("Inputs-Controls"),
          },
          {
            label: "Layout & Structure",
            id: "layout",
            count: categoryCount("Layout-Structure"),
          },
          {
            label: "Navigation",
            id: "navigation",
            count: categoryCount("Navigation"),
          },
          {
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
            title="Content Display"
            desc="Surfaces that present information — cards, tables, calendars, carousels. Compose them; don't customize them."
            count={categoryCount("Content-Display")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CompCard
              live
              name="Accordion"
              desc="Vertically stacked sections that expand one at a time or independently."
              href="accordion"
              preview={<AccordionPreview />}
            />

            <CompCard
              live
              name="Avatar"
              desc="Image with a fallback for initials or an icon, in four sizes (sm to xl)."
              href="avatar"
              preview={<AvatarPreview />}
            />

            <CompCard
              live
              name="Badge"
              desc="Small status pill — default, secondary, outline, success, warning, info, destructive, in three sizes."
              href="badge"
              preview={<BadgePreview />}
            />

            <CompCard
              live
              name="Calendar"
              desc="Single date, multiple dates, or a date range, with month navigation."
              href="calendar"
              preview={<CalendarPreview />}
            />

            <CompCard
              live
              name="Card"
              desc="A surface with header, title, description, content and footer slots, plus an optional interactive (hover) state."
              href="card"
              preview={<CardPreview />}
            />

            <CompCard
              live
              name="Carousel"
              desc="Slider with previous and next controls for cycling through items."
              href="carousel"
              preview={<CarouselPreview />}
            />

            <CompCard
              live
              name="Table"
              desc="Semantic table parts — header, body, footer, row, head, cell, caption — in a horizontally scrollable wrapper."
              href="table"
              preview={<TablePreview />}
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
            title="Feedback & Status"
            desc="Tell the user what's happening — is it loading, did it work, did something go wrong? All four states map to the same role tokens."
            count={categoryCount("Feedback-Status")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CompCard
              live
              name="Alert"
              desc="Inline status banner — default, success, warning, destructive."
              href="alert"
              preview={<AlertPreview />}
            />

            <CompCard
              live
              name="Progress"
              desc="Linear progress bar with default, success, warning and destructive variants."
              href="progress"
              preview={<ProgressPreview />}
            />

            <CompCard
              live
              name="Skeleton"
              desc="Placeholder shapes — default, text, circular, rectangular — with a pulse animation."
              href="skeleton"
              preview={<SkeletonPreview />}
            />

            <CompCard
              live
              name="Toast"
              desc="Transient notifications with default, success, warning and destructive variants and auto-dismiss."
              href="toast"
              preview={<ToastPreview />}
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
            title="Inputs & Controls"
            desc="The shape of every form. They share sizes, the focus ring and error styling, and the Form wrappers connect labels and messages to them."
            count={categoryCount("Inputs-Controls")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CompCard
              live
              name="Button"
              desc="Six variants (default, secondary, outline, ghost, link, destructive), sm to lg sizes plus an icon size, and a loading state."
              href="button"
              preview={<ButtonPreview />}
            />

            <CompCard
              live
              name="Checkbox"
              desc="Checked, unchecked and indeterminate states in three sizes."
              href="checkbox"
              preview={<CheckboxPreview />}
            />

            <CompCard
              live
              name="Form"
              desc="Field wrappers that tie labels, descriptions and error messages to inputs with matching ids and aria attributes."
              href="form"
              preview={<FormPreview />}
            />

            <CompCard
              live
              name="Input"
              desc="Text-style input for any native type, with sm to lg sizes and error and success states."
              href="input"
              preview={<InputPreview />}
            />

            <CompCard
              live
              name="Label"
              desc="Accessible label with a required marker, an error state and three sizes."
              href="label"
              preview={<LabelPreview />}
            />

            <CompCard
              live
              name="Radio Group"
              desc="Single-select cluster with horizontal or vertical orientation."
              href="radio-group"
              preview={<RadioGroupPreview />}
            />

            <CompCard
              live
              name="Select"
              desc="Dropdown with groups, separators and keyboard navigation, in three sizes."
              href="select"
              preview={<SelectPreview />}
            />

            <CompCard
              live
              name="Slider"
              desc="Single-value or range slider, horizontal or vertical, with optional thumb labels."
              href="slider"
              preview={<SliderPreview />}
            />

            <CompCard
              live
              name="Switch"
              desc="Boolean toggle in three sizes with accessible labeling."
              href="switch"
              preview={<SwitchPreview />}
            />

            <CompCard
              live
              name="Textarea"
              desc="Multi-line input with three sizes, a resize option, and error and success states."
              href="textarea"
              preview={<TextareaPreview />}
            />

            {/* cSpell:ignore pressable */}
            <CompCard
              live
              name="Toggle"
              desc="A two-state pressable button — the foundation for Toggle Group."
              href="toggle"
              preview={<TogglePreview />}
            />

            <CompCard
              live
              name="Toggle Group"
              desc="Single or multi-select group of toggles."
              href="toggle-group"
              preview={<ToggleGroupPreview />}
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
            title="Layout & Structure"
            desc="The shape of the page itself — aspect, scroll, split, collapse. Headless utilities you compose around your content."
            count={categoryCount("Layout-Structure")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CompCard
              live
              name="Aspect Ratio"
              desc="Maintain a fixed ratio for media or canvases regardless of viewport."
              href="aspect-ratio"
              preview={<AspectRatioPreview />}
            />

            <CompCard
              live
              name="Collapsible"
              desc="A single open/closed disclosure region — the building block of Accordion."
              href="collapsible"
              preview={<CollapsiblePreview />}
            />

            <CompCard
              live
              name="Resizable"
              desc="Split panes with drag handles — horizontal, vertical, nested."
              href="resizable"
              preview={<ResizablePreview />}
            />

            <CompCard
              live
              name="Scroll Area"
              desc="Custom-styled scrollbars (Radix Scroll Area)."
              href="scroll-area"
              preview={<ScrollAreaPreview />}
            />

            <CompCard
              live
              name="Separator"
              desc="Horizontal or vertical divider, optionally purely decorative."
              href="separator"
              preview={<SeparatorPreview />}
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
            title="Navigation"
            desc="Way finding — from a single breadcrumb to a global command palette. They share the same focus-ring token."
            count={categoryCount("Navigation")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <CompCard
              live
              name="Breadcrumb"
              desc="Navigation trail with a customizable separator and an ellipsis item for long paths."
              href="breadcrumb"
              preview={<BreadcrumbPreview />}
            />

            <CompCard
              live
              name="Command"
              desc="Searchable command list — input, groups, items, shortcuts and an empty state."
              href="command"
              preview={<CommandPreview />}
            />

            <CompCard
              live
              name="Menubar"
              desc="Application-style top bar with cascading menus and keyboard shortcuts."
              href="menubar"
              preview={<MenubarPreview />}
            />

            <CompCard
              live
              name="Navigation Menu"
              desc="Multi-level top nav with mega-menu panels and viewport positioning."
              href="navigation-menu"
              preview={<NavigationMenuPreview />}
            />

            <CompCard
              live
              name="Pagination"
              desc="Page links with previous and next controls, an ellipsis and an active state."
              href="pagination"
              preview={<PaginationPreview />}
            />

            <CompCard
              live
              name="Tabs"
              desc="Tabbed content panels in three sizes (Radix Tabs)."
              href="tabs"
              preview={<TabsPreview />}
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
            title="Overlays & Popovers"
            desc="Anything that floats above the page — modal, sheet, popover, tooltip. All eight go through Radix's portal and share focus-trap and dismiss behavior."
            count={categoryCount("Overlays-Popovers")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CompCard
              live
              name="Alert Dialog"
              desc="Confirmation modal for destructive actions — cannot be dismissed by overlay click."
              href="alert-dialog"
              preview={<AlertDialogPreview />}
            />

            <CompCard
              live
              name="Context Menu"
              desc="Right-click menu with sub-items, checkboxes, and shortcut hints."
              href="context-menu"
              preview={<ContextMenuPreview />}
            />

            <CompCard
              live
              name="Dialog"
              desc="Modal panel with header, footer, and overlay — the workhorse modal."
              href="dialog"
              preview={<DialogPreview />}
            />

            <CompCard
              live
              name="Dropdown Menu"
              desc="Trigger-anchored menu with checkboxes, radios, and submenus."
              href="dropdown-menu"
              preview={<DropdownMenuPreview />}
            />

            <CompCard
              live
              name="Hover Card"
              desc="Rich preview on hover — useful for user profiles, link previews."
              href="hover-card"
              preview={<HoverCardPreview />}
            />

            <CompCard
              live
              name="Popover"
              desc="Trigger-anchored floating panel with full content and close button."
              href="popover"
              preview={<PopoverPreview />}
            />

            <CompCard
              live
              name="Sheet"
              desc="Side drawer that slides in from any edge — with overlay and focus trap."
              href="sheet"
              preview={<SheetPreview />}
            />

            <CompCard
              live
              name="Tooltip"
              desc="Keyboard and pointer-triggered label — never interactive content."
              href="tooltip"
              preview={<TooltipPreview />}
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
                <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
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
