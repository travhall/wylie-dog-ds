import { Layout, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PatternCard } from "@/components/pattern-card";

export default function LayoutPatternsPage() {
  return (
    <div className="relative mx-auto max-w-7xl space-y-12 p-4 lg:p-8 xl:p-12">
      <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link
          href="/patterns"
          className="inline-flex items-center gap-2 text-sm text-(--color-text-secondary) hover:text-(--color-interactive-primary) transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          All Patterns
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-(--color-interactive-primary)/10 rounded-2xl">
            <Layout className="h-8 w-8 text-(--color-interactive-primary)" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
              Layout Patterns
            </h1>
            <p className="text-(--color-text-secondary) mt-1">
              1 pattern — Page shell and structural layout compositions
            </p>
          </div>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed max-w-2xl pt-2">
          Foundational page scaffolding patterns that establish the visual
          hierarchy and structural skeleton for applications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PatternCard
          name="Layout Patterns"
          description="Complete page layout composition including header, main content area, footer, and sidebar variants. Demonstrates responsive behavior across breakpoints."
          components={["PageLayout", "SiteHeader", "SiteFooter", "Separator"]}
          storybookPath="/story/patterns-layout-patterns--default"
        />
      </div>
    </div>
  );
}
