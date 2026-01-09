"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@wyliedog/ui/lib/utils";
import {
  LayoutGrid,
  Box,
  MousePointer2,
  Navigation as NavigationIcon,
  Layers,
  Database,
  AlertCircle,
} from "lucide-react";

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/components", icon: LayoutGrid },
    { label: "Foundations", href: "/components/foundations", icon: Box },
    { label: "Forms", href: "/components/forms", icon: MousePointer2 },
    {
      label: "Navigation",
      href: "/components/navigation",
      icon: NavigationIcon,
    },
    { label: "Overlays", href: "/components/overlays", icon: Layers },
    { label: "Data Display", href: "/components/data-display", icon: Database },
    { label: "Feedback", href: "/components/feedback", icon: AlertCircle },
  ];

  return (
    <div className="space-y-8 py-12">
      {/* Segment Navigation */}
      <div className="flex justify-center sticky top-20 z-30">
        <nav className="inline-flex items-center glass p-1.5 rounded-2xl border-(--color-border-primary)/10 shadow-xl overflow-x-auto max-w-full no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative whitespace-nowrap",
                  isActive
                    ? "text-(--color-interactive-primary)"
                    : "text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-interactive-primary)/5"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-(--color-background-primary) rounded-xl shadow-sm -z-10" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive
                      ? "text-(--color-interactive-primary)"
                      : "opacity-50"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </div>
    </div>
  );
}
