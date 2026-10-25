"use client";
import { useState } from "react";
import { Button } from "@wyliedog/ui/button";

const curves = [
  {
    label: "Default",
    token: "--transition-easing-default",
    bezier: "0.4, 0, 0.2, 1",
    path: "M0,60 C12,60 0,0 60,0",
    desc: "Most transitions",
  },
  {
    label: "In",
    token: "--transition-easing-in",
    bezier: "0.4, 0, 1, 1",
    path: "M0,60 C12,60 0,-8 60,0",
    desc: "Exits (accelerate)",
  },
  {
    label: "Out",
    token: "--transition-easing-out",
    bezier: "0, 0, 0.2, 1",
    path: "M0,60 C0,60 36,0 60,0",
    desc: "Entrances (decelerate)",
  },
  {
    label: "In-Out",
    token: "--transition-easing-in-out",
    bezier: "0.4, 0, 0.2, 1",
    path: "M0,60 C24,60 60,60 60,0",
    desc: "Symmetric moves",
  },
];

// The semantic duration tokens: fast, normal and slow (instant is 0ms).
const durations = [150, 250, 400];

export function MotionPreview() {
  const [curveIdx, setCurveIdx] = useState(0);
  const [dur, setDur] = useState(250);
  const c = curves[curveIdx];

  return (
    <div className="grid lg:grid-cols-12 gap-3">
      {/* Curve cards */}
      <div className="lg:col-span-7 grid grid-cols-2 gap-3">
        {curves.map((curve, i) => (
          <Button
            key={curve.label}
            onClick={() => setCurveIdx(i)}
            variant="ghost"
            className="h-auto w-full rounded-xl border p-4 text-left transition-all"
            style={
              curveIdx === i
                ? {
                    borderColor: "var(--color-border-primary)",
                    background:
                      "color-mix(in oklch, var(--color-background-primary) 6%, var(--color-background-default))",
                  }
                : {
                    borderColor: "var(--color-border-default)",
                    background: "var(--color-background-default)",
                  }
            }
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-(--color-foreground-default)">
                {curve.label}
              </span>
              <span
                className="h-2 w-2 rounded-full transition-colors"
                style={{
                  background:
                    curveIdx === i
                      ? "var(--color-background-primary)"
                      : "var(--color-border-default)",
                }}
              />
            </div>
            <svg
              viewBox="0 0 60 60"
              className="w-full"
              style={{ height: "3.75rem" }}
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="60"
                x2="60"
                y2="60"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-(--color-border-default)"
              />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="60"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-(--color-border-default)"
              />
              <path
                d={curve.path}
                fill="none"
                stroke="var(--color-border-primary)"
                strokeWidth="1.5"
              />
            </svg>
            <div className="mt-3 space-y-0.5">
              <p className="font-mono text-[0.625rem] text-(--color-foreground-faint)">
                {curve.token}
              </p>
              <p
                className="font-mono text-[0.625rem]"
                style={{ color: "var(--color-foreground-primary-muted)" }}
              >
                cubic-bezier({curve.bezier})
              </p>
              <p className="text-[0.6875rem] text-(--color-foreground-faint)">
                {curve.desc}
              </p>
            </div>
          </Button>
        ))}
      </div>

      {/* Live preview */}
      <div className="lg:col-span-5 rounded-xl border border-(--color-border-default) bg-(--color-background-default) overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border-default)">
          <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-(--color-foreground-faint)">
            Live preview
          </span>
          <div className="flex items-center gap-1 rounded-full border border-(--color-border-default) bg-(--color-background-muted) p-0.5">
            {durations.map((ms) => (
              <Button
                key={ms}
                onClick={() => setDur(ms)}
                variant="ghost"
                className="h-auto rounded-full px-2 py-0.5 font-mono text-[0.625rem] font-medium transition-colors"
                style={
                  dur === ms
                    ? {
                        background: "var(--color-background-primary)",
                        color: "var(--color-foreground-inverse)",
                      }
                    : { color: "var(--color-foreground-faint)" }
                }
              >
                {ms}ms
              </Button>
            ))}
          </div>
        </div>
        <div
          className="flex-1 flex items-center justify-center p-6 overflow-hidden"
          style={{ minHeight: "12.5rem" }}
        >
          <div
            key={`${curveIdx}-${dur}`}
            className="motion-preview-demo-card w-full max-w-xs rounded-xl border border-(--color-border-default) bg-(--color-background-muted) p-4 shadow-md"
            style={{
              animation: `slideIn ${dur}ms cubic-bezier(${c.bezier}) both`,
            }}
          >
            <style>{`
              @keyframes slideIn {
                from { opacity: 0; transform: translateY(16px); }
                to   { opacity: 1; transform: translateY(0); }
              }
              @media (prefers-reduced-motion: reduce) {
                .motion-preview-demo-card {
                  animation: none !important;
                  opacity: 1 !important;
                  transform: none !important;
                }
              }
            `}</style>
            <div className="flex items-center gap-3">
              <span
                className="h-8 w-8 rounded-md grid place-items-center shrink-0"
                style={{
                  background: "var(--color-background-primary)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-(--color-foreground-inverse)"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-(--color-foreground-default)">
                  New PR ready to review
                </p>
                <p className="text-xs text-(--color-foreground-faint)">
                  feat/token-refresh · 3 files changed
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-(--color-border-default) bg-(--color-background-muted) px-4 py-2.5 font-mono text-[0.625rem] text-(--color-foreground-faint)">
          animation: tile-rise{" "}
          <span className="text-(--color-foreground-muted)">{dur}ms</span>{" "}
          cubic-bezier(
          <span className="text-(--color-foreground-muted)">{c.bezier}</span>)
        </div>
      </div>
    </div>
  );
}
