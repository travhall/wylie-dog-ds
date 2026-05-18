"use client";
import { useState } from "react";
import { Button } from "@wyliedog/ui/button";

const curves = [
  {
    label: "Standard",
    token: "--ease-standard",
    bezier: "0.2, 0, 0, 1",
    path: "M0,60 C12,60 0,0 60,0",
    desc: "Persistent elements",
  },
  {
    label: "Emphasized",
    token: "--ease-emphasized",
    bezier: "0.2, 0, 0, 1.4",
    path: "M0,60 C12,60 0,-8 60,0",
    desc: "Key moments",
  },
  {
    label: "Decelerate",
    token: "--ease-decelerate",
    bezier: "0, 0, 0.2, 1",
    path: "M0,60 C0,60 36,0 60,0",
    desc: "Elements entering",
  },
  {
    label: "Accelerate",
    token: "--ease-accelerate",
    bezier: "0.4, 0, 1, 1",
    path: "M0,60 C24,60 60,60 60,0",
    desc: "Elements leaving",
  },
];

const durations = [120, 200, 320, 600];

export function MotionPreview() {
  const [curveIdx, setCurveIdx] = useState(0);
  const [dur, setDur] = useState(320);
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
                    borderColor: "var(--color-interactive-primary)",
                    background:
                      "color-mix(in oklch, var(--color-interactive-primary) 6%, var(--color-background-primary))",
                  }
                : {
                    borderColor: "var(--color-border-primary)",
                    background: "var(--color-background-primary)",
                  }
            }
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-(--color-text-primary)">
                {curve.label}
              </span>
              <span
                className="h-2 w-2 rounded-full transition-colors"
                style={{
                  background:
                    curveIdx === i
                      ? "var(--color-interactive-primary)"
                      : "var(--color-border-primary)",
                }}
              />
            </div>
            <svg
              viewBox="0 0 60 60"
              className="w-full"
              style={{ height: "60px" }}
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="60"
                x2="60"
                y2="60"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-(--color-border-primary)"
              />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="60"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-(--color-border-primary)"
              />
              <path
                d={curve.path}
                fill="none"
                stroke="var(--color-interactive-primary)"
                strokeWidth="1.5"
              />
            </svg>
            <div className="mt-3 space-y-0.5">
              <p className="font-mono text-[10px] text-(--color-text-tertiary)">
                {curve.token}
              </p>
              <p
                className="font-mono text-[10px]"
                style={{ color: "var(--color-interactive-primary)" }}
              >
                cubic-bezier({curve.bezier})
              </p>
              <p className="text-[11px] text-(--color-text-tertiary)">
                {curve.desc}
              </p>
            </div>
          </Button>
        ))}
      </div>

      {/* Live preview */}
      <div className="lg:col-span-5 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border-primary)">
          <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
            Live preview
          </span>
          <div className="flex items-center gap-1 rounded-full border border-(--color-border-primary) bg-(--color-background-secondary) p-0.5">
            {durations.map((ms) => (
              <Button
                key={ms}
                onClick={() => setDur(ms)}
                variant="ghost"
                className="h-auto rounded-full px-2 py-0.5 font-mono text-[10px] font-medium transition-colors"
                style={
                  dur === ms
                    ? {
                        background: "var(--color-interactive-primary)",
                        color: "var(--color-text-inverse)",
                      }
                    : { color: "var(--color-text-tertiary)" }
                }
              >
                {ms}ms
              </Button>
            ))}
          </div>
        </div>
        <div
          className="flex-1 flex items-center justify-center p-6 overflow-hidden"
          style={{ minHeight: "200px" }}
        >
          <div
            key={`${curveIdx}-${dur}`}
            className="w-full max-w-xs rounded-xl border border-(--color-border-primary) bg-(--color-background-secondary) p-4 shadow-md"
            style={{
              animation: `slideIn ${dur}ms cubic-bezier(${c.bezier}) both`,
            }}
          >
            <style>{`
              @keyframes slideIn {
                from { opacity: 0; transform: translateY(16px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <div className="flex items-center gap-3">
              <span
                className="h-8 w-8 rounded-md grid place-items-center shrink-0"
                style={{ background: "var(--color-interactive-primary)" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-(--color-text-inverse)"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-(--color-text-primary)">
                  New PR ready to review
                </p>
                <p className="text-xs text-(--color-text-tertiary)">
                  feat/token-refresh · 3 files changed
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-(--color-border-primary) bg-(--color-background-secondary) px-4 py-2.5 font-mono text-[10px] text-(--color-text-tertiary)">
          animation: tile-rise{" "}
          <span className="text-(--color-text-secondary)">{dur}ms</span>{" "}
          cubic-bezier(
          <span className="text-(--color-text-secondary)">{c.bezier}</span>)
        </div>
      </div>
    </div>
  );
}
