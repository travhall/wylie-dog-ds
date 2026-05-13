"use client";

import { useState, useEffect } from "react";

const SECTIONS = [
  { n: "01", label: "Color", id: "color" },
  { n: "02", label: "Typography", id: "typography" },
  { n: "03", label: "Spacing", id: "spacing" },
  { n: "04", label: "Radius", id: "radius" },
  { n: "05", label: "Elevation", id: "elevation" },
  { n: "06", label: "Motion", id: "motion" },
];

export function TokensSubnav({ total }: { total: number }) {
  const [active, setActive] = useState("color");

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

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-14 z-30 border-b border-(--color-border-primary) bg-(--color-background-primary)/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Token categories"
          className="flex items-center gap-1 overflow-x-auto py-2 text-sm"
        >
          {SECTIONS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-md px-3 py-1.5 whitespace-nowrap text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
              style={
                active === item.id
                  ? {
                      background: "var(--color-background-secondary)",
                      color: "var(--color-text-primary)",
                    }
                  : undefined
              }
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-tertiary) mr-1.5">
                {item.n}
              </span>
              {item.label}
            </a>
          ))}
          <span className="ml-auto hidden md:flex font-mono text-[11px] text-(--color-text-tertiary) shrink-0 pl-4">
            {total.toLocaleString()} tokens · v1.4.0
          </span>
        </nav>
      </div>
    </div>
  );
}
