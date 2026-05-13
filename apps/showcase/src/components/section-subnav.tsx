"use client";

import { useState, useEffect } from "react";

export interface SubnavSection {
  n: string;
  label: string;
  id: string;
  count?: number;
}

interface SectionSubnavProps {
  sections: SubnavSection[];
  label: string;
  meta?: string;
  defaultActive?: string;
}

export function SectionSubnav({
  sections,
  label,
  meta,
  defaultActive,
}: SectionSubnavProps) {
  const [active, setActive] = useState(defaultActive ?? sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (intersecting.length > 0) {
          setActive(intersecting[0].target.id);
        }
      },
      { rootMargin: "-104px 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="sticky top-14 z-30 border-b border-(--color-border-primary) bg-(--color-background-primary)/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label={label}
          className="flex items-center gap-1 overflow-x-auto py-2 text-sm"
        >
          {sections.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 whitespace-nowrap text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
              style={
                active === item.id
                  ? {
                      background: "var(--color-background-secondary)",
                      color: "var(--color-text-primary)",
                    }
                  : undefined
              }
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary) mr-0.5">
                {item.n}
              </span>
              {item.label}
              {item.count !== undefined && (
                <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                  {item.count}
                </span>
              )}
            </a>
          ))}
          {meta && (
            <span className="ml-auto hidden md:flex font-mono text-[11px] text-(--color-text-tertiary) shrink-0 pl-4">
              {meta}
            </span>
          )}
        </nav>
      </div>
    </div>
  );
}
