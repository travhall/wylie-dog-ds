import { getPatternDocsPath } from "@/lib/showcase-metadata";
import { Navigation as NavigationIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PatternCard } from "@/components/pattern-card";

export default function NavigationPatternsPage() {
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
            <NavigationIcon className="h-8 w-8 text-(--color-interactive-primary)" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
              Navigation Patterns
            </h1>
            <p className="text-(--color-text-secondary) mt-1">
              2 patterns — Site Header and Site Footer
            </p>
          </div>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed max-w-2xl pt-2">
          Responsive navigation compositions for the top and bottom of pages,
          with menus, search, actions, and link groups.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PatternCard
          name="Site Header"
          description="Header with logo, navigation links and actions, sticky with a backdrop blur; default and transparent variants."
          components={["SiteHeader", "Button"]}
          storybookPath={getPatternDocsPath("site-header") ?? "/"}
        />
        <PatternCard
          name="Site Footer"
          description="Footer with logo, navigation columns, social links and copyright; default and minimal variants with a responsive grid."
          components={["SiteFooter"]}
          storybookPath={getPatternDocsPath("site-footer") ?? "/"}
        />
      </div>
    </div>
  );
}
