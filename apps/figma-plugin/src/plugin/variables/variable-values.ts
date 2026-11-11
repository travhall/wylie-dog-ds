// Writing a variable's value is not free in Figma: it re-resolves every paint bound to the
// variable and resets the paint opacity to 100%, which wipes the 10% tint on the Section Features
// icon tiles (a bound colour carries no alpha, so the tint is paint opacity). A Pull used to write
// every value and alias of every variable, changed or not, so every Pull wiped it. A write that
// would leave the value as it is is skipped here instead.

const EPSILON = 1e-6;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const near = (a: number, b: number) =>
  Math.abs(a - b) <= EPSILON * Math.max(1, Math.abs(a), Math.abs(b));

/**
 * Whether writing `next` over `current` would change nothing. Numbers compare with a tolerance
 * (Figma stores float32, so 0.15 reads back as 0.15000000596), colours per channel with a missing
 * alpha meaning opaque, aliases by the variable they point at. Anything else counts as changed.
 */
export function variableValuesEqual(current: unknown, next: unknown): boolean {
  if (current === undefined || current === null) return false;
  if (typeof next === "number" && typeof current === "number")
    return near(current, next);
  if (!isObject(next) || !isObject(current)) return current === next;
  if (next.type === "VARIABLE_ALIAS")
    return current.type === "VARIABLE_ALIAS" && current.id === next.id;
  if (typeof next.r === "number" && typeof current.r === "number") {
    const a = (v: Record<string, unknown>) =>
      typeof v.a === "number" ? v.a : 1;
    return (
      near(current.r, next.r) &&
      near(current.g as number, next.g as number) &&
      near(current.b as number, next.b as number) &&
      near(a(current), a(next))
    );
  }
  return false;
}

/** Sets a mode's value unless it already is that value. Returns whether it wrote. */
export function setValueIfChanged(
  variable: Variable,
  modeId: string,
  value: VariableValue
): boolean {
  if (variableValuesEqual(variable.valuesByMode?.[modeId], value)) return false;
  variable.setValueForMode(modeId, value);
  return true;
}
