// Variable reference resolution system for Token Bridge

export interface TokenReference {
  originalValue: string;        // "{color.gray.50}"
  referencePath: string;        // "color.gray.50"
  figmaVariableName: string;    // "color/gray/50"
}

export interface VariableWithReferences {
  variable: Variable;
  tokenName: string;
  references: Map<string, TokenReference>; // modeId → reference
}

export class VariableRegistry {
  private tokenToVariableMap = new Map<string, string>(); // tokenName → variableId
  private variablesToResolve: VariableWithReferences[] = [];

  register(tokenName: string, variableId: string): void {
    this.tokenToVariableMap.set(tokenName, variableId);
    console.log(`Registry: ${tokenName} → ${variableId}`);
  }

  addPendingResolution(
    variable: Variable, 
    tokenName: string,
    references: Map<string, TokenReference>
  ): void {
    this.variablesToResolve.push({
      variable,
      tokenName,
      references
    });
  }

  resolve(tokenReference: string): string | null {
    // Remove curly braces and convert to token name
    const cleanReference = tokenReference.replace(/[{}]/g, '');
    const variableId = this.tokenToVariableMap.get(cleanReference);
    
    if (variableId) {
      console.log(`Resolved ${tokenReference} → ${variableId}`);
    } else {
      console.warn(`Failed to resolve: ${tokenReference}`);
    }
    
    return variableId || null;
  }

  async resolveAllReferences(): Promise<{ resolved: number; unresolved: string[] }> {
    let resolvedCount = 0;
    const unresolvedReferences: string[] = [];

    console.log(`Resolving references for ${this.variablesToResolve.length} variables`);

    for (const item of this.variablesToResolve) {
      console.log(`Resolving references for: ${item.tokenName}`);
      
      for (const [modeId, reference] of Array.from(item.references.entries())) {
        const referencedVariableId = this.resolve(reference.originalValue);
        
        if (referencedVariableId) {
          try {
            // Create Figma variable alias
            item.variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: referencedVariableId
            });
            resolvedCount++;
            console.log(`✅ Resolved ${item.tokenName} mode ${modeId}: ${reference.originalValue}`);
          } catch (error) {
            console.error(`Failed to set alias for ${item.tokenName}:`, error);
            unresolvedReferences.push(`${item.tokenName}.${modeId}: ${reference.originalValue}`);
          }
        } else {
          unresolvedReferences.push(`${item.tokenName}.${modeId}: ${reference.originalValue}`);
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
  if (typeof value !== 'string' || !value.startsWith('{') || !value.endsWith('}')) {
    return null;
  }

  const referencePath = value.slice(1, -1); // Remove {}
  const figmaVariableName = referencePath.replace(/\./g, '/');

  return {
    originalValue: value,
    referencePath,
    figmaVariableName
  };
}

export function isTokenReference(value: any): boolean {
  return typeof value === 'string' && value.startsWith('{') && value.endsWith('}');
}

export function extractReferences(token: any): Map<string, TokenReference> {
  const references = new Map<string, TokenReference>();

  // Check primary $value
  if (isTokenReference(token.$value)) {
    const ref = parseTokenReference(token.$value);
    if (ref) {
      references.set('default', ref);
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

export function createImportOrder(collections: any[]): string[] {
  // Analyze dependencies and return import order
  const collectionDeps = new Map<string, Set<string>>();
  const collectionNames = collections.map(c => Object.keys(c)[0]);

  // Build dependency graph
  for (const collection of collections) {
    const collectionName = Object.keys(collection)[0];
    const deps = new Set<string>();

    for (const [tokenName, token] of Object.entries(collection[collectionName].variables)) {
      const references = extractReferences(token);
      
      for (const ref of Array.from(references.values())) {
        // Determine which collection this reference belongs to
        const refCollection = inferCollectionFromReference(ref.referencePath, collectionNames);
        if (refCollection && refCollection !== collectionName) {
          deps.add(refCollection);
        }
      }
    }

    collectionDeps.set(collectionName, deps);
  }

  // Topological sort
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(name: string): void {
    if (visiting.has(name)) {
      console.warn(`Circular dependency detected involving: ${name}`);
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

  for (const name of collectionNames) {
    visit(name);
  }

  console.log('Import order:', sorted);
  return sorted;
}

function inferCollectionFromReference(referencePath: string, collectionNames: string[]): string | null {
  // Simple heuristic: check if reference path starts with collection name
  for (const collectionName of collectionNames) {
    if (referencePath.startsWith(collectionName.toLowerCase())) {
      return collectionName;
    }
  }

  // Fallback: assume primitives for basic tokens
  if (referencePath.startsWith('color.') || referencePath.startsWith('spacing.') || referencePath.startsWith('typography.')) {
    return collectionNames.find(name => name.toLowerCase().includes('primitive')) || collectionNames[0];
  }

  return null;
}
