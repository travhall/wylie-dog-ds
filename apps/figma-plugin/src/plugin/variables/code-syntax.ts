/**
 * Code syntax for Figma variables (Plan 216, Phase E).
 *
 * A variable's code syntax is the name a developer uses for it in code; Dev Mode shows it
 * beside the variable. The repo supplies it as a file next to the token folder
 * (`packages/tokens/io/code-syntax/web.json`), generated from the same CSS naming the build
 * uses, so Token Bridge never works a name out itself. Keys are token paths
 * (`button.padding-x.md`), values the usage (`var(--space-button-padding-x-md)`).
 *
 * The parsing is pure; only `applyCodeSyntax` touches `figma`. Applying never fails a Pull:
 * a variable that cannot take a syntax is counted, not thrown.
 */

export type CodeSyntaxMap = Record<string, string>;

export interface CodeSyntaxResult {
  /** Variables whose WEB syntax was set or changed. */
  set: number;
  /** Variables that already had the right syntax. */
  unchanged: number;
  /** Entries in the file with no variable in this file (the variable is not imported). */
  missing: number;
  /** Variables the plugin could not write to. */
  failed: number;
}

/** The WEB syntax map from the parsed file, or null when it is not a code syntax file. */
export function parseCodeSyntax(raw: unknown): CodeSyntaxMap | null {
  if (typeof raw !== "object" || raw === null) return null;
  const file = raw as { platform?: unknown; syntax?: unknown };
  if (file.platform !== "WEB") return null;
  if (typeof file.syntax !== "object" || file.syntax === null) return null;
  const out: CodeSyntaxMap = {};
  for (const [path, value] of Object.entries(file.syntax)) {
    if (typeof value === "string" && value.length > 0) out[path] = value;
  }
  return out;
}

/** The token path of a Figma variable name (`button/padding-x/md` is `button.padding-x.md`). */
export const tokenPathOf = (variableName: string): string =>
  variableName.replace(/\//g, ".");

/** Set the WEB code syntax on every local variable the map names. */
export async function applyCodeSyntax(
  syntax: CodeSyntaxMap
): Promise<CodeSyntaxResult> {
  const result: CodeSyntaxResult = {
    set: 0,
    unchanged: 0,
    missing: 0,
    failed: 0,
  };
  const seen = new Set<string>();
  const variables = await figma.variables.getLocalVariablesAsync();
  for (const variable of variables) {
    const path = tokenPathOf(variable.name);
    const want = syntax[path];
    if (want === undefined) continue;
    seen.add(path);
    if (variable.codeSyntax?.WEB === want) {
      result.unchanged++;
      continue;
    }
    try {
      variable.setVariableCodeSyntax("WEB", want);
      result.set++;
    } catch {
      result.failed++;
    }
  }
  result.missing = Object.keys(syntax).filter((p) => !seen.has(p)).length;
  return result;
}

/** One sentence for the Pull's success message, or null when nothing changed. */
export function describeCodeSyntaxResult(
  result: CodeSyntaxResult
): string | null {
  if (result.set === 0 && result.failed === 0) return null;
  const parts = [
    `Code syntax set on ${result.set} variable${result.set === 1 ? "" : "s"}`,
  ];
  if (result.failed > 0) parts.push(`${result.failed} could not be written`);
  return parts.join("; ");
}
