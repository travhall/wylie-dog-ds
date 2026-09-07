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
          description="Full-featured site header with logo, navigation menu, command search, and responsive mobile sheet. Adapts from desktop to mobile with a hamburger trigger."
          components={["NavigationMenu", "Button", "Command", "Sheet"]}
          storybookPath="/story/patterns-navigation-patterns-site-header--default"
        />
        <PatternCard
          name="Site Footer"
          description="Multi-column site footer with link groups, dividers, and copyright. Collapses gracefully to a single column on small screens."
          components={["Separator", "NavigationMenu"]}
          storybookPath="/story/patterns-navigation-patterns-site-footer--default"
        />
      </div>
    </div>
  );
}
