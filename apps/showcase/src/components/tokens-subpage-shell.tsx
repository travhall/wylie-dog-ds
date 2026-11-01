import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CATEGORIES = [
  { label: "Color", href: "/tokens/colors" },
  { label: "Typography", href: "/tokens/typography" },
  { label: "Spacing", href: "/tokens/spacing" },
  { label: "Radius", href: "/tokens/borders" },
  { label: "Elevation", href: "/tokens/elevation" },
  { label: "Motion", href: "/tokens/motion" },
] as const;

interface TokensSubpageShellProps {
  categoryLabel: string;
  headline: ReactNode;
  description: string;
  children: ReactNode;
}

export function TokensSubpageShell({
  categoryLabel,
  headline,
  description,
  children,
}: TokensSubpageShellProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <Link
        href="/tokens"
        className="inline-flex items-center gap-2 text-sm text-(--color-foreground-muted) hover:text-(--color-foreground-primary-muted) transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Tokens
      </Link>

      <section className="max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
          {categoryLabel}
        </span>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
          {headline}
        </h1>
        <p className="mt-3 text-(--color-foreground-muted) leading-relaxed">
          {description}
        </p>
      </section>

      <nav
        aria-label="Token categories"
        className="flex items-center gap-1 overflow-x-auto rounded-lg border border-(--color-border-default) bg-(--color-background-muted) p-1 text-sm"
      >
        {CATEGORIES.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 whitespace-nowrap text-(--color-foreground-muted) hover:text-(--color-foreground-default) transition-colors"
            style={
              c.label === categoryLabel
                ? {
                    background: "var(--color-background-default)",
                    color: "var(--color-foreground-default)",
                  }
                : undefined
            }
            aria-current={c.label === categoryLabel ? "page" : undefined}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
