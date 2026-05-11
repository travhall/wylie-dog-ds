"use client";
import { useState } from "react";

const densities = [
  { label: "Compact", rowY: "10px", gap: "8px", avatar: "24px" },
  { label: "Comfortable", rowY: "14px", gap: "12px", avatar: "32px" },
  { label: "Spacious", rowY: "20px", gap: "16px", avatar: "40px" },
];

const members = [
  {
    initials: "AB",
    name: "Akira Brennan",
    email: "akira@compound.co",
    role: "Admin",
    last: "just now",
    status: "active",
  },
  {
    initials: "LG",
    name: "Leila Garza",
    email: "leila@compound.co",
    role: "Editor",
    last: "2h ago",
    status: "active",
  },
  {
    initials: "TP",
    name: "Tom Parker",
    email: "tom@compound.co",
    role: "Viewer",
    last: "4d ago",
    status: "invited",
  },
  {
    initials: "SC",
    name: "Sasha Chen",
    email: "sasha@compound.co",
    role: "Editor",
    last: "1w ago",
    status: "active",
  },
  {
    initials: "MK",
    name: "Min-jun Kim",
    email: "min@compound.co",
    role: "Viewer",
    last: "3w ago",
    status: "inactive",
  },
];

export function SpacingDemo() {
  const [idx, setIdx] = useState(1);
  const d = densities[idx];

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between gap-4 border-b border-(--color-border-primary)"
        style={{ padding: `${d.rowY} 24px` }}
      >
        <div>
          <h3 className="font-semibold text-(--color-text-primary)">
            Team members
          </h3>
          <p className="font-mono text-[10px] text-(--color-text-tertiary) mt-0.5">
            14 active · 3 invited
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) p-0.5">
          {densities.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setIdx(i)}
              className="rounded px-2.5 py-1 text-xs font-medium transition-colors"
              style={
                idx === i
                  ? {
                      background: "var(--color-background-primary)",
                      color: "var(--color-text-primary)",
                    }
                  : { color: "var(--color-text-tertiary)" }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rows */}
      {members.map((m, i) => (
        <div
          key={m.initials}
          className={`flex items-center ${i < members.length - 1 ? "border-b border-(--color-border-primary)" : ""}`}
          style={{ gap: d.gap, padding: `${d.rowY} 24px` }}
        >
          <div
            className="rounded-full grid place-items-center font-mono text-[10px] font-semibold shrink-0 transition-all"
            style={{
              width: d.avatar,
              height: d.avatar,
              background:
                "color-mix(in oklch, var(--color-interactive-primary) 15%, transparent)",
              color: "var(--color-interactive-primary)",
            }}
          >
            {m.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-(--color-text-primary) truncate">
              {m.name}
            </p>
            <p className="font-mono text-[10px] text-(--color-text-tertiary) truncate">
              {m.email}
            </p>
          </div>
          <span className="hidden sm:block text-xs text-(--color-text-secondary) w-16 shrink-0">
            {m.role}
          </span>
          <span className="hidden sm:block font-mono text-[10px] text-(--color-text-tertiary) w-16 shrink-0 text-right">
            {m.last}
          </span>
          <span
            className="shrink-0 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full"
            style={{
              background:
                m.status === "active"
                  ? "color-mix(in oklch, oklch(60% 0.14 155) 18%, transparent)"
                  : m.status === "invited"
                    ? "color-mix(in oklch, var(--color-interactive-primary) 12%, transparent)"
                    : "color-mix(in oklch, var(--color-border-primary) 70%, transparent)",
              color:
                m.status === "active"
                  ? "oklch(45% 0.14 155)"
                  : m.status === "invited"
                    ? "var(--color-interactive-primary)"
                    : "var(--color-text-tertiary)",
            }}
          >
            {m.status}
          </span>
        </div>
      ))}

      {/* Token readout footer */}
      <div className="border-t border-(--color-border-primary) bg-(--color-background-secondary) px-6 py-3 flex flex-wrap items-center gap-5 font-mono text-[10px] text-(--color-text-tertiary)">
        <span>
          <span className="text-(--color-text-secondary)">--space-row-y:</span>{" "}
          {d.rowY}
        </span>
        <span>
          <span className="text-(--color-text-secondary)">--space-gap:</span>{" "}
          {d.gap}
        </span>
        <span>
          <span className="text-(--color-text-secondary)">--space-avatar:</span>{" "}
          {d.avatar}
        </span>
      </div>
    </div>
  );
}
