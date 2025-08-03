// Enhanced validation for Token Bridge - focus on production readiness
import type { ProcessedToken, ExportData } from './processor';
import { extractReferences } from './reference-resolver';

export interface ValidationReport {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: ValidationStats;
}

export interface ValidationError {
  type: 'missing_reference' | 'circular_dependency' | 'type_mismatch' | 'invalid_format';
  token: string;
  reference?: string;
  message: string;
  suggestion?: string;
}

export interface ValidationWarning {
  type: 'empty_value' | 'naming_convention' | 'unused_token';
  token: string;
  message: string;
  suggestion?: string;
}

export interface ValidationStats {
  totalTokens: number;
  totalReferences: number;
  collectionsProcessed: number;
  referenceChainDepth: number;
}

/**
 * Comprehensive validation before import to catch issues early
 */
export function validateTokensForImport(tokenData: ExportData[]): ValidationReport {
  const report: ValidationReport = {
    valid: true,
    errors: [],
    warnings: [],
    stats: {
      totalTokens: 0,
      totalReferences: 0,
      collectionsProcessed: tokenData.length,
      referenceChainDepth: 0
    }
  };

  // Build global token map
  const allTokens = new Map<string, { token: ProcessedToken; collection: string }>();
  const allReferences = new Map<string, Set<string>>(); // token → references it uses
  
  // First pass: catalog all tokens
  for (const collection of tokenData) {
    for (const [collectionName, data] of Object.entries(collection)) {
      for (const [tokenName, token] of Object.entries(data.variables)) {
        allTokens.set(tokenName, { token, collection: collectionName });
        report.stats.totalTokens++;
        
        // Track references
        const references = extractReferences(token);
        if (references.size > 0) {
          allReferences.set(tokenName, new Set(
            Array.from(references.values()).map(ref => ref.referencePath)
          ));
          report.stats.totalReferences += references.size;
        }
      }
    }
  }

  // Second pass: validate references
  for (const [tokenName, referencedTokens] of Array.from(allReferences)) {
    const tokenInfo = allTokens.get(tokenName);
    if (!tokenInfo) continue;

    for (const referencedToken of referencedTokens) {
      // Check if referenced token exists
      if (!allTokens.has(referencedToken)) {
        report.errors.push({
          type: 'missing_reference',
          token: tokenName,
          reference: referencedToken,
          message: `Token "${tokenName}" references missing token "{${referencedToken}}"`,
          suggestion: findSimilarToken(referencedToken, allTokens)
        });
        report.valid = false;
      } else {
        // Check type compatibility with valid cross-references
        const referencedTokenInfo = allTokens.get(referencedToken);
        if (referencedTokenInfo && !isValidTypeReference(tokenInfo.token.$type, referencedTokenInfo.token.$type)) {
          report.warnings.push({
            type: 'type_mismatch',
            token: tokenName,
            message: `Type mismatch: ${tokenInfo.token.$type} references ${referencedTokenInfo.token.$type}`,
            suggestion: 'Verify this reference is intentional'
          });
        }
      }
    }
  }

  // Check for circular dependencies
  const circularDeps = detectCircularDependencies(allReferences);
  for (const cycle of circularDeps) {
    report.errors.push({
      type: 'circular_dependency',
      token: cycle.join(' → '),
      message: `Circular dependency detected: ${cycle.join(' → ')}`,
      suggestion: 'Break the cycle by removing one reference'
    });
    report.valid = false;
  }

  // Check for empty shadow values (noticed in your files)
  for (const [tokenName, tokenInfo] of allTokens) {
    if (tokenInfo.token.$type === 'shadow' && !tokenInfo.token.$value) {
      report.warnings.push({
        type: 'empty_value',
        token: tokenName,
        message: 'Shadow token has empty value',
        suggestion: 'Add shadow definition or remove token'
      });
    }
  }

  // Validate naming conventions
  for (const [tokenName, tokenInfo] of allTokens) {
    if (!isValidTokenName(tokenName)) {
      report.warnings.push({
        type: 'naming_convention',
        token: tokenName,
        message: 'Token name doesn\'t follow naming conventions',
        suggestion: 'Use lowercase with dots as separators (e.g., color.primary.500)'
      });
    }
  }

  // Calculate reference chain depth
  report.stats.referenceChainDepth = calculateMaxReferenceDepth(allReferences);

  return report;
}

/**
 * Find similar token names for suggestions
 */
function findSimilarToken(target: string, allTokens: Map<string, any>): string | undefined {
  const tokenNames = Array.from(allTokens.keys());
  
  // Simple similarity check - look for partial matches
  const similar = tokenNames.find(name => {
    const targetParts = target.split('.');
    const nameParts = name.split('.');
    
    // Check if most parts match
    const matches = targetParts.filter(part => 
      nameParts.some(namePart => namePart.includes(part))
    );
    
    return matches.length >= Math.min(targetParts.length - 1, 2);
  });

  return similar ? `Did you mean "{${similar}}"?` : undefined;
}

/**
 * Detect circular dependencies in reference chains
 */
function detectCircularDependencies(
  references: Map<string, Set<string>>
): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(token: string, path: string[]): void {
    if (recursionStack.has(token)) {
      // Found a cycle
      const cycleStart = path.indexOf(token);
      cycles.push(path.slice(cycleStart).concat(token));
      return;
    }

    if (visited.has(token)) return;

    visited.add(token);
    recursionStack.add(token);

    const refs = references.get(token);
    if (refs) {
      for (const ref of refs) {
        dfs(ref, path.concat([token]));
      }
    }

    recursionStack.delete(token);
  }

  for (const token of references.keys()) {
    if (!visited.has(token)) {
      dfs(token, []);
    }
  }

  return cycles;
}

/**
 * Calculate maximum reference chain depth
 */
function calculateMaxReferenceDepth(
  references: Map<string, Set<string>>
): number {
  const depths = new Map<string, number>();

  function getDepth(token: string, visited = new Set<string>()): number {
    if (visited.has(token)) return 0; // Circular reference
    if (depths.has(token)) return depths.get(token)!;

    const refs = references.get(token);
    if (!refs || refs.size === 0) {
      depths.set(token, 0);
      return 0;
    }

    visited.add(token);
    const depthArray = Array.from(refs).map(ref => getDepth(ref, visited));
    const maxDepth = Math.max.apply(Math, depthArray) + 1;
    visited.delete(token);

    depths.set(token, maxDepth);
    return maxDepth;
  }

  let maxDepth = 0;
  for (const token of references.keys()) {
    maxDepth = Math.max(maxDepth, getDepth(token));
  }

  return maxDepth;
}

/**
 * Check if a type reference is valid (allows common cross-type references)
 */
function isValidTypeReference(fromType: string, toType: string): boolean {
  // Exact type match is always valid
  if (fromType === toType) return true;
  
  // Valid cross-references in design tokens
  const validCrossReferences: Record<string, string[]> = {
    'dimension': ['spacing', 'fontSize', 'borderRadius'],
    'sizing': ['spacing', 'dimension'],
    'fontFamily': ['fontSize'], // Composite typography tokens
    'fontWeight': ['fontSize'],
    'lineHeight': ['fontSize'],
    'letterSpacing': ['fontSize']
  };
  
  const allowedTypes = validCrossReferences[fromType];
  return allowedTypes ? allowedTypes.includes(toType) : false;
}

/**
 * Validate token naming conventions (updated to allow numbers and hyphens)
 */
function isValidTokenName(tokenName: string): boolean {
  // Allow lowercase letters, numbers, dots, and hyphens
  // Examples: color.gray.50, typography.body-large, spacing.2xl
  const namePattern = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)*$/;
  return namePattern.test(tokenName);
}

/**
 * Additional validation for specific token types
 */
export function validateTokenValue(token: ProcessedToken): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (token.$type) {
    case 'color':
      if (!isValidColorValue(token.$value)) {
        errors.push({
          type: 'invalid_format',
          token: token.name || 'unknown',
          message: 'Invalid color format',
          suggestion: 'Use hex (#ffffff), rgb(255,255,255), or oklch format'
        });
      }
      break;

    case 'dimension':
    case 'fontSize':
    case 'spacing':
      if (!isValidDimensionValue(token.$value)) {
        errors.push({
          type: 'invalid_format',
          token: token.name || 'unknown',
          message: 'Invalid dimension format',
          suggestion: 'Use pixel values (16px) or numeric values (16)'
        });
      }
      break;

    case 'shadow':
      if (token.$value && !isValidShadowValue(token.$value)) {
        errors.push({
          type: 'invalid_format',
          token: token.name || 'unknown',
          message: 'Invalid shadow format',
          suggestion: 'Use CSS shadow syntax or shadow object format'
        });
      }
      break;
  }

  return errors;
}

function isValidColorValue(value: any): boolean {
  if (typeof value === 'string') {
    // Check hex, rgb, oklch formats
    const hexPattern = /^#[0-9a-fA-F]{6}$/;
    const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
    const oklchPattern = /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/;
    
    return hexPattern.test(value) || rgbPattern.test(value) || oklchPattern.test(value);
  }
  
  if (typeof value === 'object' && value !== null) {
    // Check RGB object format
    return typeof value.r === 'number' && 
           typeof value.g === 'number' && 
           typeof value.b === 'number';
  }
  
  return false;
}

function isValidDimensionValue(value: any): boolean {
  if (typeof value === 'number') return true;
  if (typeof value === 'string') {
    // Check for pixel values or numeric strings
    const pxPattern = /^\d+(\.\d+)?px$/;
    const numPattern = /^\d+(\.\d+)?$/;
    return pxPattern.test(value) || numPattern.test(value);
  }
  return false;
}

function isValidShadowValue(value: any): boolean {
  if (typeof value === 'string') {
    // Basic shadow string validation
    return value.length > 0 && !value.startsWith('{');
  }
  
  if (typeof value === 'object' && value !== null) {
    // Shadow object validation
    return typeof value.offsetX !== 'undefined' ||
           typeof value.offsetY !== 'undefined' ||
           typeof value.blur !== 'undefined';
  }
  
  return false;
}
