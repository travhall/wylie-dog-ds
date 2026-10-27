import tokensCss from "@wyliedog/tokens/tokens.css?raw";

/**
 * Reads the built token stylesheet (`@wyliedog/tokens/tokens.css`) so the
 * Foundations pages show exactly what ships. `manifest.json` omits several
 * families (opacity, z-index, icon size, focus, semantic aliases), the
 * stylesheet carries all of them. Light values come from everything before
 * the `.dark` block, dark overrides from the block itself.
 */

export interface TokenRow {
  /** CSS custom property, for example `--border-radius-md`. */
  variable: string;
  /** Part of the name after the family prefix, for example `md`. */
  key: string;
  /** Resolved value as written in the stylesheet. */
  value: string;
}

function parseDeclarations(css: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const match of css.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) {
    if (!found.has(match[1])) {
      found.set(match[1], match[2].trim());
    }
  }
  return found;
}

const darkStart = tokensCss.indexOf("\n.dark {");
const declarations = parseDeclarations(
  darkStart === -1 ? tokensCss : tokensCss.slice(0, darkStart)
);
const darkDeclarations = parseDeclarations(
  darkStart === -1 ? "" : tokensCss.slice(darkStart)
);

/** The dark-mode value of a token, when dark mode overrides it. */
export function darkTokenValue(variable: string): string | undefined {
  return darkDeclarations.get(variable);
}

/** Tokens whose custom property starts with `prefix`, in stylesheet order. */
export function tokensByPrefix(
  prefix: string,
  options: { exclude?: RegExp } = {}
): TokenRow[] {
  const rows: TokenRow[] = [];
  for (const [variable, value] of declarations) {
    if (!variable.startsWith(prefix)) continue;
    if (options.exclude?.test(variable)) continue;
    rows.push({ variable, key: variable.slice(prefix.length), value });
  }
  return rows;
}

/** A single token value, or undefined when the stylesheet has no such token. */
export function tokenValue(variable: string): string | undefined {
  return declarations.get(variable);
}

const REM_IN_PX = 16;
const LARGEST_REAL_LENGTH = 1000;

/**
 * Lengths are authored in rem, Figma shows px: return both, for example
 * `{ rem: "0.5rem", px: "8px" }`. Other values (keywords, ratios) have no
 * second form.
 */
export function lengthParts(value: string): { rem?: string; px?: string } {
  const amount = parseFloat(value);
  if (Number.isNaN(amount)) return {};
  // A huge px value is a sentinel (fully rounded), not a length worth converting.
  if (value.endsWith("px") && amount >= LARGEST_REAL_LENGTH) return {};
  if (value.endsWith("rem")) {
    return { rem: value, px: `${amount * REM_IN_PX}px` };
  }
  if (value.endsWith("px")) {
    return { rem: `${amount / REM_IN_PX}rem`, px: value };
  }
  return {};
}

/** Milliseconds from a duration token such as `150ms` or `0.2s`. */
export function durationMs(value: string): number {
  const amount = parseFloat(value);
  return value.endsWith("ms") ? amount : amount * 1000;
}
