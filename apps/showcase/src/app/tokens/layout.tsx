"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@wyliedog/ui/lib/utils";
import { LayoutGrid, Palette, Ruler, Type, Maximize2 } from "lucide-react";

export default function TokensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/tokens", icon: LayoutGrid },
    { label: "Colors", href: "/tokens/colors", icon: Palette },
    { label: "Spacing", href: "/tokens/spacing", icon: Ruler },
    { label: "Typography", href: "/tokens/typography", icon: Type },
    { label: "Borders", href: "/tokens/borders", icon: Maximize2 },
  ];

  return (
    <div className="space-y-8 py-12">
      {/* Segment Navigation */}
      <div className="flex justify-center">
        <nav className="inline-flex items-center glass p-1.5 rounded-2xl border-(--color-border-primary)/10 shadow-xl relative z-20">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative",
                  isActive
                    ? "text-(--color-interactive-primary) shadow-[0_0_20px_rgba(var(--color-interactive-primary-rgb),0.2)]"
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
