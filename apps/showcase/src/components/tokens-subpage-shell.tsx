import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CATEGORIES = [
  { n: "01", label: "Color", href: "/tokens/colors" },
  { n: "02", label: "Typography", href: "/tokens/typography" },
  { n: "03", label: "Spacing", href: "/tokens/spacing" },
  { n: "04", label: "Radius", href: "/tokens/borders" },
  { n: "05", label: "Elevation", href: "/tokens/elevation" },
  { n: "06", label: "Motion", href: "/tokens/motion" },
] as const;

interface TokensSubpageShellProps {
  categoryNumber: string;
  categoryLabel: string;
  headline: ReactNode;
  description: string;
  children: ReactNode;
}

export function TokensSubpageShell({
  categoryNumber,
  categoryLabel,
  headline,
  description,
  children,
}: TokensSubpageShellProps) {
  return (
    <div className="relative mx-auto max-w-7xl space-y-16 p-4 lg:p-8 xl:p-12">
      <Link
        href="/tokens"
        className="inline-flex items-center gap-2 text-sm text-(--color-text-secondary) hover:text-(--color-interactive-primary) transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        All Tokens
      </Link>

      <section className="space-y-4">
        <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
          {categoryNumber} · {categoryLabel}
        </span>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-(--color-text-primary)">
          {headline}
        </h1>
        <p className="mt-3 text-lg text-(--color-text-secondary) leading-relaxed">
          {description}
        </p>
      </section>

      <nav
        aria-label="Token categories"
        className="flex items-center gap-1 overflow-x-auto rounded-lg border border-(--color-border-primary) bg-(--color-background-secondary)/30 p-1 text-sm"
      >
        {CATEGORIES.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 whitespace-nowrap text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
            style={
              c.label === categoryLabel
                ? {
                    background: "var(--color-background-primary)",
                    color: "var(--color-text-primary)",
                  }
                : undefined
            }
            aria-current={c.label === categoryLabel ? "page" : undefined}
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary) mr-0.5">
              {c.n}
            </span>
            {c.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
