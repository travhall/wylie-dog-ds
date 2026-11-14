// Variable reference resolution system for Token Bridge

import { setValueIfChanged } from "./variable-values";

export interface TokenReference {
  originalValue: string; // "{color.gray.50}"
  referencePath: string; // "color.gray.50"
  figmaVariableName: string; // "color/gray/50"
}

/**
 * Minimal DTCG-token shape this module reads. Kept local and permissive
 * (`unknown` value positions) so callers passing loosely-typed token objects
 * still assign; only the fields actually accessed here are declared.
 */
interface DtcgToken {
  $value?: unknown;
  valuesByMode?: Record<string, unknown>;
}

/** A single-collection map (collectionName → its token bag). */
interface TokenCollection {
  variables: Record<string, DtcgToken>;
}

export interface VariableWithReferences {
  variable: Variable;
  tokenName: string;
  references: Map<string, TokenReference>; // modeId → reference
}

export class VariableRegistry {
  // tokenName → (collectionId → variableId). Two collections may use the same
  // token name; a reference reaches the variable in its own collection first.
  private tokenToVariableMap = new Map<string, Map<string, string>>();
  private variablesToResolve: VariableWithReferences[] = [];

  register(
    tokenName: string,
    variableId: string,
    collectionId: string = ""
  ): void {
    const holders = this.tokenToVariableMap.get(tokenName) ?? new Map();
    // Delete first so the latest registration is last when iterating
    holders.delete(collectionId);
    holders.set(collectionId, variableId);
    this.tokenToVariableMap.set(tokenName, holders);
  }

  addPendingResolution(
    variable: Variable,
    tokenName: string,
    references: Map<string, TokenReference>
  ): void {
    this.variablesToResolve.push({
      variable,
      tokenName,
      references,
    });
  }

  /**
   * The variable a reference points at. The reference names a token, not a
   * collection, so the collection holding the referring variable is tried
   * first; otherwise the most recently registered holder of that name.
   */
  resolve(
    tokenReference: string,
    fromCollectionId: string = ""
  ): string | null {
    // Remove curly braces and convert to token name
    const cleanReference = tokenReference.replace(/[{}]/g, "");
    const holders = this.tokenToVariableMap.get(cleanReference);
    const variableId =
      holders?.get(fromCollectionId) ??
      Array.from(holders?.values() ?? []).pop();

    if (variableId) {
      // console.log(`Resolved ${tokenReference} → ${variableId}`);
    } else {
      console.warn(`Failed to resolve: ${tokenReference}`);
    }

    return variableId || null;
  }

  async resolveAllReferences(): Promise<{
    resolved: number;
    unresolved: string[];
  }> {
    let resolvedCount = 0;
    const unresolvedReferences: string[] = [];

    console.log(
      `Resolving references for ${this.variablesToResolve.length} variables`
    );

    for (const item of this.variablesToResolve) {
      // console.log(`Resolving references for: ${item.tokenName}`);

      for (const [modeId, reference] of Array.from(item.references.entries())) {
        const referencedVariableId = this.resolve(
          reference.originalValue,
          item.variable.variableCollectionId
        );

        if (referencedVariableId) {
          try {
            // Create Figma variable alias
            setValueIfChanged(item.variable, modeId, {
              type: "VARIABLE_ALIAS",
              id: referencedVariableId,
            });
            resolvedCount++;
            // console.log(
            //   `✅ Resolved ${item.tokenName} mode ${modeId}: ${reference.originalValue}`
            // );
          } catch (error) {
            console.error(`Failed to set alias for ${item.tokenName}:`, error);
            unresolvedReferences.push(
              `${item.tokenName}.${modeId}: ${reference.originalValue}`
            );
          }
        } else {
          unresolvedReferences.push(
            `${item.tokenName}.${modeId}: ${reference.originalValue}`
          );
        }
      }
    }

    return { resolved: resolvedCount, unresolved: unresolvedReferences };
  }

  getRegistrySize(): number {
    return this.tokenToVariableMap.size;
  }

  clear(): void {
    this.tokenToVariableMap.clear();
    this.variablesToResolve = [];
  }
}

export function parseTokenReference(value: string): TokenReference | null {
  if (
    typeof value !== "string" ||
    !value.startsWith("{") ||
    !value.endsWith("}")
  ) {
    return null;
  }

  const referencePath = value.slice(1, -1); // Remove {}
  const figmaVariableName = referencePath.replace(/\./g, "/");

  return {
    originalValue: value,
    referencePath,
    figmaVariableName,
  };
}

export function isTokenReference(value: unknown): value is string {
  return (
    typeof value === "string" && value.startsWith("{") && value.endsWith("}")
  );
}

export function extractReferences(
  token: DtcgToken
): Map<string, TokenReference> {
  const references = new Map<string, TokenReference>();

  // Check primary $value
  if (isTokenReference(token.$value)) {
    const ref = parseTokenReference(token.$value);
    if (ref) {
      references.set("default", ref);
    }
  }

  // Check valuesByMode
  if (token.valuesByMode) {
    for (const [modeName, modeValue] of Object.entries(token.valuesByMode)) {
      if (isTokenReference(modeValue)) {
        const ref = parseTokenReference(modeValue as string);
        if (ref) {
          references.set(modeName, ref);
        }
      }
    }
  }

  return references;
}

export function createImportOrder(
  collections: Array<Record<string, TokenCollection>>
): string[] {
  // Analyze dependencies and return import order
  const collectionDeps = new Map<string, Set<string>>();
  const collectionNames = collections.map((c) => Object.keys(c)[0]);

  // Which collections hold each token name. A reference names a token, so the
  // collections that define it are the ones the referring collection depends on.
  const holders = new Map<string, string[]>();
  for (const collection of collections) {
    const name = Object.keys(collection)[0];
    for (const tokenName of Object.keys(collection[name].variables)) {
      holders.set(tokenName, [...(holders.get(tokenName) ?? []), name]);
    }
  }

  // Build dependency graph
  for (const collection of collections) {
    const collectionName = Object.keys(collection)[0];
    const deps = new Set<string>();

    for (const [tokenName, token] of Object.entries(
      collection[collectionName].variables
    )) {
      const references = extractReferences(token);

      for (const ref of Array.from(references.values())) {
        const defining = holders.get(ref.referencePath) ?? [];
        // A token defined in the referring collection needs no other collection
        if (defining.includes(collectionName)) continue;
        for (const other of defining) deps.add(other);
      }
    }

    collectionDeps.set(collectionName, deps);
  }

  // Sort collections so each comes after the collections it references:
  // those with no dependencies first, then the ones that build on them
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(name: string): void {
    if (visiting.has(name)) {
      // console.warn(`Circular dependency detected involving: ${name}`);
      return;
    }
    if (visited.has(name)) return;

    visiting.add(name);
    const deps = collectionDeps.get(name) || new Set();

    for (const dep of Array.from(deps)) {
      visit(dep);
    }

    visiting.delete(name);
    visited.add(name);
    sorted.push(name);
  }

  // Start with collections that have no dependencies
  const independentCollections = collectionNames.filter((name) => {
    const deps = collectionDeps.get(name) || new Set();
    return deps.size === 0;
  });

  // Visit independent collections first
  for (const name of independentCollections) {
    visit(name);
  }

  // Then visit remaining collections
  for (const name of collectionNames) {
    if (!visited.has(name)) {
      visit(name);
    }
  }

  // console.log("Import order determined:", sorted);
  return sorted;
}
