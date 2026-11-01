import manifest from "@wyliedog/tokens/manifest.json";
import { contrastRatio, wcagLevel } from "@/lib/contrast";
import { getColorModes } from "@/lib/token-values";

/*
 * Foreground and background pairs from the semantic layer with their real
 * contrast in Light and Dark. Values come from the built token CSS, so the
 * ratios on this page cannot drift from the tokens.
 */

const ground = [
  ["default", "default"],
  ["muted", "default"],
  ["faint", "default"],
  ["link", "default"],
] as const;
const solid = [
  "primary",
  "secondary",
  "accent",
  "info",
  "success",
  "warning",
  "danger",
  "inverse",
] as const;
const tint = ["primary", "info", "success", "warning", "danger"] as const;

const background = manifest.semantics.background as Record<string, unknown>;
const foreground = manifest.semantics.foreground as Record<string, unknown>;

interface Pair {
  fg: string;
  bg: string;
  light: number;
  dark: number;
}

function toPair(fgName: string, bgName: string): Pair | null {
  const fg = `--color-foreground-${fgName}`;
  const bg = `--color-background-${bgName}`;
  if (!(`color-foreground-${fgName}` in foreground)) return null;
  if (!(`color-background-${bgName}` in background)) return null;
  try {
    const f = getColorModes(fg);
    const b = getColorModes(bg);
    return {
      fg,
      bg,
      light: contrastRatio(f.light, b.light),
      dark: contrastRatio(f.dark, b.dark),
    };
  } catch {
    return null;
  }
}

function pairs(): Pair[] {
  const list: Array<Pair | null> = [
    ...ground.map(([f, b]) => toPair(f, b)),
    ...solid.map((r) => toPair(r, r)),
    ...tint.map((r) => toPair(`${r}-muted`, `${r}-muted`)),
  ];
  return list.filter((p): p is Pair => p !== null);
}

function Ratio({ mode, value }: { mode: string; value: number }) {
  const level = wcagLevel(value);
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-(--color-foreground-muted)">{mode}</span>
      <span className="font-mono text-(--color-foreground-default)">
        {value.toFixed(2)}:1
      </span>
      <span
        className={
          level
            ? "font-semibold text-(--color-foreground-success-muted)"
            : "font-semibold text-(--color-foreground-danger-muted)"
        }
      >
        {level ?? "Below AA"}
      </span>
    </span>
  );
}

export function ColorPairs() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pairs().map((pair) => (
        <li
          key={`${pair.fg}-${pair.bg}`}
          className="overflow-hidden rounded-xl border border-(--color-border-default) bg-(--color-background-default)"
        >
          <div
            className="px-5 py-6 text-lg font-semibold"
            style={{ background: `var(${pair.bg})`, color: `var(${pair.fg})` }}
          >
            Aa The quick brown fox
          </div>
          <div className="space-y-2 px-5 py-4 text-sm">
            <p className="break-all font-mono text-xs text-(--color-foreground-muted)">
              {pair.fg}
              <br />
              on {pair.bg}
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <Ratio mode="Light" value={pair.light} />
              <Ratio mode="Dark" value={pair.dark} />
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
