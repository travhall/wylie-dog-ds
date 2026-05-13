"use client";

import { useState, useEffect } from "react";

const SECTIONS = [
  { n: "01", label: "Content Display", id: "content-display", count: 7 },
  { n: "02", label: "Feedback & Status", id: "feedback", count: 4 },
  { n: "03", label: "Inputs & Controls", id: "inputs", count: 13 },
  { n: "04", label: "Layout & Structure", id: "layout", count: 5 },
  { n: "05", label: "Navigation", id: "navigation", count: 6 },
  { n: "06", label: "Overlays & Popovers", id: "overlays", count: 8 },
];

export function ComponentsSubnav({ total }: { total: number }) {
  const [active, setActive] = useState("content-display");

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
          aria-label="Component categories"
          className="flex items-center gap-1 overflow-x-auto py-2 text-sm"
        >
          {SECTIONS.map((item) => (
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
              <span className="font-mono text-[10px] text-(--color-text-tertiary)">
                {item.count}
              </span>
            </a>
          ))}
          <span className="ml-auto shrink-0 font-mono text-[10px] text-(--color-text-tertiary)">
            {total} total
          </span>
        </nav>
      </div>
    </div>
  );
}
