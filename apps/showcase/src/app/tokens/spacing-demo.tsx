"use client";
import { useState } from "react";
import { Button } from "@wyliedog/ui/button";
import { formatSize } from "@/lib/token-units";

// rowY has no exact token at any density (original values were 10px/14px/20px);
// each is rounded down to the nearest real --space-* step so it lines up with
// that density's (already-exact) gap token, preserving the ascending
// Compact < Comfortable < Spacious progression.
const densities = [
  {
    label: "Compact",
    rowY: "0.5rem",
    rowYToken: "--space-100",
    gap: "0.5rem",
    gapToken: "--space-100",
    avatar: "1.5rem",
    avatarToken: "--space-300",
  },
  {
    label: "Comfortable",
    rowY: "0.75rem",
    rowYToken: "--space-150",
    gap: "0.75rem",
    gapToken: "--space-150",
    avatar: "2rem",
    avatarToken: "--space-400",
  },
  {
    label: "Spacious",
    rowY: "1rem",
    rowYToken: "--space-200",
    gap: "1rem",
    gapToken: "--space-200",
    avatar: "2.5rem",
    avatarToken: "--space-500",
  },
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
    <div className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between gap-4 border-b border-(--color-border-default)"
        style={{ padding: `${d.rowY} 1.5rem` }}
      >
        <div>
          <p className="font-semibold text-(--color-foreground-default)">
            Team members
          </p>
          <p className="font-mono text-xs text-(--color-foreground-faint) mt-0.5">
            14 active · 3 invited
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-(--color-border-default) bg-(--color-background-muted) p-0.5">
          {densities.map((opt, i) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => setIdx(i)}
              className="rounded px-2.5 py-1 text-xs font-medium"
              style={
                idx === i
                  ? {
                      background: "var(--color-background-default)",
                      color: "var(--color-foreground-default)",
                    }
                  : { color: "var(--color-foreground-faint)" }
              }
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Rows */}
      {members.map((m, i) => (
        <div
          key={m.initials}
          className={`flex items-center ${i < members.length - 1 ? "border-b border-(--color-border-default)" : ""}`}
          style={{ gap: d.gap, padding: `${d.rowY} 1.5rem` }}
        >
          <div
            className="rounded-full grid place-items-center font-mono text-xs font-semibold shrink-0 transition-all"
            style={{
              width: d.avatar,
              height: d.avatar,
              background:
                "color-mix(in oklch, var(--color-background-primary) 15%, transparent)",
              color: "var(--color-foreground-primary-muted)",
            }}
          >
            {m.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-(--color-foreground-default) truncate">
              {m.name}
            </p>
            <p className="font-mono text-xs text-(--color-foreground-faint) truncate">
              {m.email}
            </p>
          </div>
          <span className="hidden sm:block text-xs text-(--color-foreground-muted) w-16 shrink-0">
            {m.role}
          </span>
          <span className="hidden sm:block font-mono text-xs text-(--color-foreground-faint) w-16 shrink-0 text-right">
            {m.last}
          </span>
          <span
            className="shrink-0 text-xs font-mono font-medium px-2 py-0.5 rounded-full"
            style={{
              background:
                m.status === "active"
                  ? "var(--color-background-success-muted)"
                  : m.status === "invited"
                    ? "var(--color-background-primary-muted)"
                    : "var(--color-background-muted)",
              color:
                m.status === "active"
                  ? "var(--color-foreground-success-muted)"
                  : m.status === "invited"
                    ? "var(--color-foreground-primary-muted)"
                    : "var(--color-foreground-muted)",
            }}
          >
            {m.status}
          </span>
        </div>
      ))}

      {/* Token readout footer */}
      <div className="border-t border-(--color-border-default) bg-(--color-background-muted) px-6 py-3 flex flex-wrap items-center gap-5 font-mono text-xs text-(--color-foreground-faint)">
        <span>
          <span className="text-(--color-foreground-muted)">
            {d.rowYToken}:
          </span>{" "}
          {formatSize(d.rowY)}
        </span>
        <span>
          <span className="text-(--color-foreground-muted)">{d.gapToken}:</span>{" "}
          {formatSize(d.gap)}
        </span>
        <span>
          <span className="text-(--color-foreground-muted)">
            {d.avatarToken}:
          </span>{" "}
          {formatSize(d.avatar)}
        </span>
      </div>
    </div>
  );
}
