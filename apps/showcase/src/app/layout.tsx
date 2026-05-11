import type { Metadata } from "next";
import Link from "next/link";
import { fontVariables } from "@/lib/fonts";
import { WylieDogLogo } from "./wyliedoglogo";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wylie Dog Design System",
  description:
    "A typed React component library, an OKLCH token system, and a pattern catalog — shared across every surface we ship.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

const navLinks = [
  { label: "Overview", href: "/" },
  { label: "Architecture", href: "/architecture" },
  { label: "Tokens", href: "/tokens" },
  { label: "Components", href: "/components" },
  { label: "Patterns", href: "/patterns" },
  { label: "Token Bridge", href: "/plugin" },
];

const footerColumns = [
  {
    heading: "Tokens",
    links: [
      { label: "Colors", href: "/tokens/colors" },
      { label: "Spacing", href: "/tokens/spacing" },
      { label: "Typography", href: "/tokens/typography" },
      { label: "Borders", href: "/tokens/borders" },
    ],
  },
  {
    heading: "Components",
    links: [
      { label: "Content Display", href: "/components/content-display" },
      { label: "Inputs & Controls", href: "/components/inputs" },
      { label: "Navigation", href: "/components/navigation" },
      { label: "Overlays & Popovers", href: "/components/overlays" },
      { label: "Layout & Structure", href: "/components/layout" },
      { label: "Feedback & Status", href: "/components/feedback" },
    ],
  },
  {
    heading: "Tools",
    links: [
      { label: "Token Bridge for Figma", href: "/plugin" },
      { label: "Storybook ↗", href: "https://storybook.wyliedog.dev" },
    ],
  },
  {
    heading: "Patterns",
    links: [
      { label: "Layout Patterns", href: "/patterns/layout" },
      { label: "Authentication", href: "/patterns/auth" },
      { label: "Form Compositions", href: "/patterns/forms" },
      { label: "Data Patterns", href: "/patterns/data" },
      { label: "All patterns →", href: "/patterns" },
    ],
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontVariables} font-sans min-h-screen antialiased bg-(--color-background-primary) text-(--color-text-primary)`}
      >
        {/* ── Site Header ── */}
        <header className="sticky top-0 z-40 border-b border-(--color-border-primary) bg-(--color-background-primary)/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
            {/* Wordmark */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span
                className="grid h-7 w-7 place-items-center rounded-md"
                style={{ background: "var(--color-interactive-primary)" }}
              >
                <WylieDogLogo />
              </span>
              <span className="font-serif text-[1.0625rem] font-semibold tracking-tight">
                Wylie Dog
              </span>
            </Link>

            {/* Primary navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </nav>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                aria-label="Search"
                className="grid h-8 w-8 place-items-center rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) text-(--color-text-tertiary) hover:text-(--color-text-secondary) transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>

              <ThemeToggle />

              <Link
                href="https://storybook.wyliedog.dev"
                className="hidden md:flex h-8 items-center gap-1.5 rounded-md border border-(--color-border-primary) px-3 text-sm font-medium text-(--color-text-primary) hover:bg-(--color-background-secondary) transition-colors"
              >
                Storybook
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        {/* ── Page content — full width; each page manages its own containers ── */}
        <main className="min-h-screen">{children}</main>

        {/* ── Site Footer ── */}
        <footer className="border-t border-(--color-border-primary) bg-(--color-background-primary) border-default">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2">
                  <span
                    className="grid h-7 w-7 place-items-center rounded-md shrink-0"
                    style={{ background: "var(--color-interactive-primary)" }}
                  >
                    <WylieDogLogo />
                  </span>
                  <span className="font-serif text-base font-semibold tracking-tight">
                    Wylie Dog
                  </span>
                </div>
                <p className="mt-3 text-sm text-(--color-text-secondary)">
                  The shared design system for everything we ship.
                </p>
              </div>

              {/* Link columns */}
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                    {col.heading}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Copyright */}
            <div className="mt-10 border-t border-(--color-border-primary) pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="font-mono text-[11px] text-(--color-text-tertiary)">
                © 2026 Wylie Dog
              </p>
              <div className="inline-flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--color-success)" }}
                />
                <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary)">
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
