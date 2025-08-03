// CSS Variables Format Adapter - Handles CSS custom properties format
import type { 
  FormatAdapter, 
  FormatDetectionResult, 
  NormalizationResult, 
  StructureInfo,
  TransformationLog
} from '../format-adapter';
import { TokenFormatType } from '../format-adapter';
import type { ProcessedToken } from '../processor';

export class CSSVariablesAdapter implements FormatAdapter {
  name = 'CSS Variables Format';

  detect(data: any): FormatDetectionResult {
    let confidence = 0;
    const warnings: string[] = [];

    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      // Only add base confidence if we find actual CSS variable patterns
      let totalVarCount = 0;
      let totalProps = 0;
      let hasRootSection = false;

      // Check for :root section (strong indicator)
      if (data[':root']) {
        hasRootSection = true;
        confidence += 0.2; // Lower initial confidence
        
        // Check if :root contains CSS variables
        const rootVars = data[':root'];
        if (typeof rootVars === 'object') {
          const varCount = Object.keys(rootVars).filter(key => key.startsWith('--')).length;
          if (varCount > 0) {
            confidence += 0.6; // High confidence for actual CSS vars in :root
            totalVarCount += varCount;
          }
        }
      }

      // Check for CSS variable patterns in any section
      const checkForCSSVars = (obj: any): void => {
        if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            totalProps++;
            if (key.startsWith('--')) {
              totalVarCount++;
            }
            if (typeof value === 'object' && !key.startsWith('--')) {
              checkForCSSVars(value);
            }
          }
        }
      };

      checkForCSSVars(data);

      // Only consider this a CSS variables format if we actually found CSS variables
      if (totalVarCount === 0) {
        // No CSS variables found - this is not a CSS variables file
        confidence = 0;
        if (hasRootSection) {
          warnings.push('Found :root section but no CSS variables (--property)');
        }
      } else {
        // We found actual CSS variables - calculate confidence
        if (!hasRootSection) {
          confidence += 0.1; // Some confidence for CSS vars without :root
        }

        const varRatio = totalVarCount / Math.max(totalProps, 1);
        if (varRatio > 0.5) {
          confidence += 0.2; // Good ratio of CSS variables
        }
        
        // Check for var() references
        let refCount = 0;
        const checkForVarRefs = (obj: any): void => {
          if (typeof obj === 'object' && obj !== null) {
            for (const value of Object.values(obj)) {
              if (typeof value === 'string' && value.includes('var(--')) {
                refCount++;
              } else if (typeof value === 'object') {
                checkForVarRefs(value);
              }
            }
          }
        };
        
        checkForVarRefs(data);
        if (refCount > 0) {
          confidence += 0.1;
        }
      }
    }

    return {
      format: TokenFormatType.CSS_VARIABLES,
      confidence: Math.min(confidence, 1.0),
      structure: this.analyzeStructure(data),
      warnings
    };
  }

  normalize(data: any): NormalizationResult {
    const transformations: TransformationLog[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      console.log('🔄 CSS Variables: Starting normalization');

      // First pass: Extract all CSS variable names for reference mapping
      const allVariables = this.extractAllVariables(data);
      const referenceMap = this.buildCSSReferenceMap(allVariables);

      // Second pass: Extract CSS variable sections with reference mapping
      const sections = this.extractSections(data, transformations, referenceMap);
      
      if (Object.keys(sections).length === 0) {
        errors.push('No CSS variable sections found');
        return {
          data: [],
          transformations,
          warnings,
          errors,
          success: false
        };
      }

      console.log(`📦 Found ${Object.keys(sections).length} CSS variable sections`);

      // Transform each section into a collection
      const normalizedCollections: any[] = [];

      for (const [sectionName, variables] of Object.entries(sections)) {
        console.log(`🔄 Processing section: ${sectionName} (${Object.keys(variables).length} variables)`);
        const collection = this.transformSection(sectionName, variables, transformations);
        normalizedCollections.push(collection);
      }

      console.log('✅ CSS Variables: Normalization complete');

      return {
        data: normalizedCollections,
        transformations,
        warnings,
        errors,
        success: true
      };
    } catch (error) {
      console.error('❌ CSS Variables: Normalization failed:', error);
      errors.push(`CSS Variables normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        data: [],
        transformations,
        warnings,
        errors,
        success: false
      };
    }
  }

  validate(data: any): boolean {
    return this.detect(data).confidence > 0.6;
  }

  private hasVarReferences(data: any): boolean {
    const checkForVarRefs = (value: any): boolean => {
      if (typeof value === 'string') {
        return value.includes('var(--');
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => checkForVarRefs(v));
      }
      return false;
    };

    return checkForVarRefs(data);
  }

  private extractSections(data: any, transformations: TransformationLog[], referenceMap?: Map<string, string>): Record<string, Record<string, string>> {
    const sections: Record<string, Record<string, string>> = {};

    for (const [sectionName, sectionData] of Object.entries(data)) {
      if (typeof sectionData === 'object' && sectionData !== null) {
        const variables = this.extractVariablesFromSection(sectionData, referenceMap);
        if (Object.keys(variables).length > 0) {
          // Normalize section name
          const normalizedName = sectionName === ':root' ? 'Primitives' : 
                                sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
          sections[normalizedName] = variables;
        }
      }
    }

    if (Object.keys(sections).length > 0) {
      transformations.push({
        type: 'structure',
        description: 'Extracted CSS variable sections into collections',
        before: 'CSS variables structure',
        after: 'Collection-based structure'
      });
    }

    return sections;
  }

  private transformSection(sectionName: string, variables: Record<string, string>, transformations: TransformationLog[]): any {
    const processedVariables: Record<string, ProcessedToken> = {};

    for (const [varName, varValue] of Object.entries(variables)) {
      const processedToken = this.transformVariable(varName, varValue, transformations);
      processedVariables[varName] = processedToken;
    }

    return {
      [sectionName]: {
        modes: [{ modeId: 'default', name: 'Default' }],
        variables: processedVariables
      }
    };
  }

  private transformVariable(varName: string, varValue: string, transformations: TransformationLog[]): ProcessedToken {
    let value = varValue;
    let type = this.inferType(varValue);

    // Convert var() references to standard format
    if (varValue.includes('var(--')) {
      const convertedValue = this.convertVarReferences(varValue);
      if (convertedValue !== varValue) {
        value = convertedValue;
        transformations.push({
          type: 'reference-conversion',
          description: `Converted CSS var() reference in ${varName}`,
          before: varValue,
          after: convertedValue
        });
      }
    }

    return {
      $type: type,
      $value: value,
      $description: `CSS variable from --${varName}`
    };
  }

  private inferType(value: string): string {
    if (typeof value !== 'string') return 'string';

    // Skip var() references for type inference
    if (value.includes('var(--')) return 'string';

    // Colors
    if (value.match(/^#[0-9a-fA-F]{6}$/)) return 'color';
    if (value.match(/^rgb\(/)) return 'color';
    if (value.match(/^hsl\(/)) return 'color';

    // Dimensions
    if (value.match(/^\d+(\.\d+)?(px|rem|em|%)$/)) return 'dimension';

    // Font families
    if (value.includes('serif') || value.includes('sans') || value.includes('monospace') || value.includes(',')) {
      return 'fontFamily';
    }

    // Numbers
    if (value.match(/^\d+(\.\d+)?$/)) return 'number';

    return 'string';
  }

  private analyzeStructure(data: any): StructureInfo {
    let tokenCount = 0;
    let referenceCount = 0;
    let hasCollections = false;

    if (typeof data === 'object' && data !== null) {
      // Count sections and variables
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null) {
          hasCollections = true;
          const variables = this.extractVariablesFromSection(value);
          tokenCount += Object.keys(variables).length;
          
          // Count var() references
          for (const varValue of Object.values(variables)) {
            if (varValue.includes('var(--')) {
              referenceCount++;
            }
          }
        }
      }
    }

    return {
      hasCollections,
      hasModes: false,
      hasArrayWrapper: false,
      tokenCount,
      referenceCount,
      propertyFormat: 'other',
      namingConvention: 'kebab-case',
      referenceFormat: 'css-var'
    };
  }

  private extractAllVariables(data: any): Record<string, string> {
    const allVariables: Record<string, string> = {};

    const extractRecursive = (obj: any): void => {
      for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith('--')) {
          // Store the CSS variable name (without --) and its value
          const varName = key.substring(2);
          allVariables[varName] = value as string;
        } else if (typeof value === 'object' && value !== null) {
          extractRecursive(value);
        }
      }
    };

    extractRecursive(data);
    return allVariables;
  }

  private buildCSSReferenceMap(allVariables: Record<string, string>): Map<string, string> {
    const referenceMap = new Map<string, string>();

    // Map CSS variable names to their normalized token names
    for (const varName of Object.keys(allVariables)) {
      // Original name with dashes
      const originalName = varName;
      // Normalized name with dots
      const normalizedName = varName.replace(/-/g, '.');
      
      // Map both formats
      referenceMap.set(originalName, originalName); // Keep original
      referenceMap.set(normalizedName, originalName); // Map normalized back to original
    }

    return referenceMap;
  }

  private extractVariablesFromSection(section: any, referenceMap?: Map<string, string>): Record<string, string> {
    const variables: Record<string, string> = {};

    const extractRecursive = (obj: any, prefix: string = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith('--')) {
          // This is a CSS variable
          const varName = key.substring(2); // Remove --
          const fullName = prefix ? `${prefix}.${varName}` : varName;
          
          // Convert var() references if present
          let processedValue = value as string;
          if (typeof value === 'string' && value.includes('var(--')) {
            processedValue = this.convertVarReferences(value, referenceMap);
          }
          
          variables[fullName] = processedValue;
        } else if (typeof value === 'object' && value !== null) {
          // Nested section
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          extractRecursive(value, newPrefix);
        }
      }
    };

    extractRecursive(section);
    return variables;
  }

  private convertVarReferences(value: string, referenceMap?: Map<string, string>): string {
    // Convert var(--token-name) to {token.name}
    return value.replace(/var\(--([^)]+)\)/g, (match, varName) => {
      // Find the actual token name
      let targetToken = varName;
      
      if (referenceMap) {
        // Use the reference map to find the correct token name
        const normalizedName = varName.replace(/-/g, '.');
        if (referenceMap.has(normalizedName)) {
          targetToken = referenceMap.get(normalizedName)!;
        } else if (referenceMap.has(varName)) {
          targetToken = referenceMap.get(varName)!;
        }
      }
      
      return `{${targetToken}}`;
    });
  }
}