import { readFile, readdir, stat } from "fs/promises";
import { join, relative, extname } from "path";
import { writeFile } from "fs/promises";

/**
 * Component Token Usage Analyzer
 * Scans all components in packages/ui/src/ and analyzes token usage patterns
 */

class ComponentAnalyzer {
  constructor() {
    this.components = [];
    this.tokenUsage = new Map();
    this.namingPatterns = {
      legacy: [], // bg-[var(--color-*)]
      modern: [], // bg-(--color-*)
      preferred: [], // bg-(--background-*) without color- prefix
    };
    this.cssCustomProperties = new Set();
    this.tailwindPatterns = new Set();
    this.tokenRegistry = new Map();
  }

  /**
   * Load all tokens from processed files for reference
   */
  async loadTokenRegistry() {
    const processedDir = "io/processed";
    const files = [
      "primitive.json",
      "semantic-light.json",
      "semantic-dark.json",
      "component-light.json",
      "component-dark.json",
    ];

    for (const file of files) {
      try {
        const content = await readFile(join(processedDir, file), "utf-8");
        const data = JSON.parse(content);

        let tokens = data;
        // Handle W3C DTCG array format
        if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0];
          const collectionName = Object.keys(firstItem)[0];
          const collection = firstItem[collectionName];
          if (collection.variables) {
            tokens = collection.variables;
          }
        }

        for (const [tokenName, token] of Object.entries(tokens)) {
          this.tokenRegistry.set(tokenName, {
            ...token,
            source: file,
          });
        }
      } catch (error) {
        console.warn(`⚠️  Could not load ${file}: ${error.message}`);
      }
    }

    console.log(`📋 Loaded ${this.tokenRegistry.size} tokens from registry`);
  }

  /**
   * Extract CSS custom properties from className strings
   */
  extractCssVariables(content) {
    const patterns = [
      // Legacy pattern: bg-[var(--color-button-secondary-background)]
      /\[var\(--([a-zA-Z0-9-]+)\)\]/g,
      // Modern pattern: bg-(--color-background-primary)
      /\(--([a-zA-Z0-9-]+)\)/g,
      // Direct CSS: style={{ color: 'var(--color-text-primary)' }}
      /var\(--([a-zA-Z0-9-]+)\)/g,
    ];

    const variables = new Set();

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        variables.add(match[1]);
      }
    }

    return Array.from(variables);
  }

  /**
   * Classify naming patterns
   */
  classifyPattern(cssVar) {
    if (cssVar.startsWith("color-")) {
      // Check if it's in a legacy format
      if (cssVar.match(/^color-[a-z]+-[a-z]+-[a-z]+/)) {
        return "legacy";
      }
      return "modern";
    }

    // Preferred pattern: no color- prefix for abstraction
    if (
      cssVar.startsWith("background-") ||
      cssVar.startsWith("surface-") ||
      cssVar.startsWith("text-") ||
      cssVar.startsWith("border-") ||
      cssVar.startsWith("interactive-")
    ) {
      return "preferred";
    }

    return "unknown";
  }

  /**
   * Find token in registry by CSS variable name
   */
  findTokenByCssVar(cssVar) {
    // Try with color- prefix
    const withColorPrefix = `color.${cssVar.replace(/-/g, ".")}`;
    if (this.tokenRegistry.has(withColorPrefix)) {
      return {
        tokenName: withColorPrefix,
        token: this.tokenRegistry.get(withColorPrefix),
      };
    }

    // Try without color- prefix
    const withoutPrefix = cssVar.replace(/^color-/, "");
    const normalized = `color.${withoutPrefix.replace(/-/g, ".")}`;
    if (this.tokenRegistry.has(normalized)) {
      return {
        tokenName: normalized,
        token: this.tokenRegistry.get(normalized),
      };
    }

    // Try direct match with dots
    const direct = cssVar.replace(/-/g, ".");
    if (this.tokenRegistry.has(direct)) {
      return { tokenName: direct, token: this.tokenRegistry.get(direct) };
    }

    return null;
  }

  /**
   * Recursively scan directory for component files
   */
  async scanDirectory(dir) {
    const files = [];
    const entries = await readdir(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        files.push(...(await this.scanDirectory(fullPath)));
      } else if (
        [".tsx", ".ts", ".jsx", ".js"].includes(extname(fullPath))
      ) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Analyze a single component file
   */
  async analyzeComponent(filePath, uiSrcPath) {
    try {
      const content = await readFile(filePath, "utf-8");
      const relativePath = relative(uiSrcPath, filePath);
      const componentName = relativePath
        .replace(/\.(tsx|ts|jsx|js)$/, "")
        .replace(/\//g, "/");

      const cssVars = this.extractCssVariables(content);
      const tokensUsed = [];
      const unmatchedVars = [];

      for (const cssVar of cssVars) {
        this.cssCustomProperties.add(cssVar);

        const pattern = this.classifyPattern(cssVar);
        if (
          pattern !== "unknown" &&
          !this.namingPatterns[pattern].includes(cssVar)
        ) {
          this.namingPatterns[pattern].push(cssVar);
        }

        const tokenMatch = this.findTokenByCssVar(cssVar);
        if (tokenMatch) {
          tokensUsed.push({
            cssVar: `--${cssVar}`,
            tokenName: tokenMatch.tokenName,
            source: tokenMatch.token.source,
            value: tokenMatch.token.$value,
          });
        } else {
          unmatchedVars.push(`--${cssVar}`);
        }
      }

      const component = {
        name: componentName,
        path: relativePath,
        cssVarsCount: cssVars.length,
        tokensUsed,
        unmatchedVars,
      };

      this.components.push(component);

      // Track token usage
      for (const { tokenName } of tokensUsed) {
        if (!this.tokenUsage.has(tokenName)) {
          this.tokenUsage.set(tokenName, []);
        }
        this.tokenUsage.get(tokenName).push(componentName);
      }

      return component;
    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const totalComponents = this.components.length;
    const totalCssVars = this.cssCustomProperties.size;
    const totalTokensUsed = this.tokenUsage.size;
    const totalTokensAvailable = this.tokenRegistry.size;
    const usagePercentage = (
      (totalTokensUsed / totalTokensAvailable) *
      100
    ).toFixed(1);

    const componentsUsingTokens = this.components.filter(
      (c) => c.tokensUsed.length > 0
    ).length;

    const componentsWithUnmatched = this.components.filter(
      (c) => c.unmatchedVars.length > 0
    );

    let report = `${"=".repeat(80)}\n`;
    report += `COMPONENT TOKEN USAGE ANALYSIS\n`;
    report += `${"=".repeat(80)}\n\n`;

    // Summary
    report += `📊 SUMMARY\n`;
    report += `${"─".repeat(80)}\n`;
    report += `Components Analyzed:      ${totalComponents}\n`;
    report += `Components Using Tokens:  ${componentsUsingTokens}\n`;
    report += `Unique CSS Variables:     ${totalCssVars}\n`;
    report += `Tokens Used:              ${totalTokensUsed} / ${totalTokensAvailable} (${usagePercentage}%)\n`;
    report += `Unmatched Variables:      ${componentsWithUnmatched.reduce((sum, c) => sum + c.unmatchedVars.length, 0)}\n\n`;

    // Naming Pattern Breakdown
    report += `🎨 NAMING PATTERN BREAKDOWN\n`;
    report += `${"─".repeat(80)}\n`;
    report += `Legacy Pattern (bg-[var(--color-*)]):\n`;
    report += `  Count: ${this.namingPatterns.legacy.length}\n`;
    if (this.namingPatterns.legacy.length > 0) {
      report += `  Examples:\n`;
      this.namingPatterns.legacy.slice(0, 5).forEach((v) => {
        report += `    --${v}\n`;
      });
      if (this.namingPatterns.legacy.length > 5) {
        report += `    ... and ${this.namingPatterns.legacy.length - 5} more\n`;
      }
    }
    report += `\n`;

    report += `Modern Pattern (bg-(--color-*)):\n`;
    report += `  Count: ${this.namingPatterns.modern.length}\n`;
    if (this.namingPatterns.modern.length > 0) {
      report += `  Examples:\n`;
      this.namingPatterns.modern.slice(0, 5).forEach((v) => {
        report += `    --${v}\n`;
      });
      if (this.namingPatterns.modern.length > 5) {
        report += `    ... and ${this.namingPatterns.modern.length - 5} more\n`;
      }
    }
    report += `\n`;

    report += `Preferred Pattern (bg-(--background-*) without color- prefix):\n`;
    report += `  Count: ${this.namingPatterns.preferred.length}\n`;
    if (this.namingPatterns.preferred.length > 0) {
      report += `  Examples:\n`;
      this.namingPatterns.preferred.slice(0, 5).forEach((v) => {
        report += `    --${v}\n`;
      });
      if (this.namingPatterns.preferred.length > 5) {
        report += `    ... and ${this.namingPatterns.preferred.length - 5} more\n`;
      }
    }
    report += `\n`;

    // Top Token Usage
    report += `🔥 TOP 10 MOST USED TOKENS\n`;
    report += `${"─".repeat(80)}\n`;
    const sortedUsage = Array.from(this.tokenUsage.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10);

    sortedUsage.forEach(([tokenName, components], index) => {
      report += `${index + 1}. ${tokenName}\n`;
      report += `   Used in ${components.length} component${components.length > 1 ? "s" : ""}: ${components.slice(0, 3).join(", ")}${components.length > 3 ? `, +${components.length - 3} more` : ""}\n`;
    });
    report += `\n`;

    // Unused Tokens
    const unusedTokens = Array.from(this.tokenRegistry.keys()).filter(
      (tokenName) => !this.tokenUsage.has(tokenName)
    );
    report += `🚫 UNUSED TOKENS\n`;
    report += `${"─".repeat(80)}\n`;
    report += `Total Unused: ${unusedTokens.length}\n`;
    if (unusedTokens.length > 0) {
      report += `Examples:\n`;
      unusedTokens.slice(0, 10).forEach((tokenName) => {
        const token = this.tokenRegistry.get(tokenName);
        report += `  ${tokenName} (${token.source})\n`;
      });
      if (unusedTokens.length > 10) {
        report += `  ... and ${unusedTokens.length - 10} more\n`;
      }
    }
    report += `\n`;

    // Components with Unmatched Variables
    if (componentsWithUnmatched.length > 0) {
      report += `⚠️  COMPONENTS WITH UNMATCHED CSS VARIABLES\n`;
      report += `${"─".repeat(80)}\n`;
      report += `These components use CSS variables that don't match any tokens:\n\n`;

      componentsWithUnmatched
        .sort((a, b) => b.unmatchedVars.length - a.unmatchedVars.length)
        .slice(0, 10)
        .forEach((component) => {
          report += `📁 ${component.name}\n`;
          report += `   Path: ${component.path}\n`;
          report += `   Unmatched: ${component.unmatchedVars.length}\n`;
          component.unmatchedVars.slice(0, 5).forEach((cssVar) => {
            report += `     • ${cssVar}\n`;
          });
          if (component.unmatchedVars.length > 5) {
            report += `     ... and ${component.unmatchedVars.length - 5} more\n`;
          }
          report += `\n`;
        });

      if (componentsWithUnmatched.length > 10) {
        report += `... and ${componentsWithUnmatched.length - 10} more components with unmatched variables\n\n`;
      }
    }

    // Recommended Anchor Components
    report += `🎯 RECOMMENDED ANCHOR COMPONENTS\n`;
    report += `${"─".repeat(80)}\n`;
    report += `Based on token usage patterns, these components are good candidates\n`;
    report += `for establishing reference implementations:\n\n`;

    const anchorCandidates = this.components
      .filter((c) => c.tokensUsed.length > 0)
      .sort((a, b) => b.tokensUsed.length - a.tokensUsed.length)
      .slice(0, 5);

    anchorCandidates.forEach((component, index) => {
      report += `${index + 1}. ${component.name}\n`;
      report += `   Tokens Used: ${component.tokensUsed.length}\n`;
      report += `   Unmatched: ${component.unmatchedVars.length}\n`;
      report += `   Path: ${component.path}\n\n`;
    });

    // Coverage by Token Type
    report += `📈 COVERAGE BY TOKEN TYPE\n`;
    report += `${"─".repeat(80)}\n`;

    const tokensByType = {
      primitive: [],
      semantic: [],
      component: [],
    };

    for (const [tokenName, components] of this.tokenUsage.entries()) {
      const token = this.tokenRegistry.get(tokenName);
      if (token.source.includes("primitive")) {
        tokensByType.primitive.push({ tokenName, count: components.length });
      } else if (token.source.includes("semantic")) {
        tokensByType.semantic.push({ tokenName, count: components.length });
      } else if (token.source.includes("component")) {
        tokensByType.component.push({ tokenName, count: components.length });
      }
    }

    const primitiveTotal = Array.from(this.tokenRegistry.entries()).filter(
      ([, token]) => token.source.includes("primitive")
    ).length;
    const semanticTotal = Array.from(this.tokenRegistry.entries()).filter(
      ([, token]) => token.source.includes("semantic")
    ).length;
    const componentTotal = Array.from(this.tokenRegistry.entries()).filter(
      ([, token]) => token.source.includes("component")
    ).length;

    report += `Primitive Tokens:  ${tokensByType.primitive.length} / ${primitiveTotal} used (${((tokensByType.primitive.length / primitiveTotal) * 100).toFixed(1)}%)\n`;
    report += `Semantic Tokens:   ${tokensByType.semantic.length} / ${semanticTotal} used (${((tokensByType.semantic.length / semanticTotal) * 100).toFixed(1)}%)\n`;
    report += `Component Tokens:  ${tokensByType.component.length} / ${componentTotal} used (${((tokensByType.component.length / componentTotal) * 100).toFixed(1)}%)\n\n`;

    // Next Steps
    report += `🎯 NEXT STEPS\n`;
    report += `${"─".repeat(80)}\n`;
    report += `1. Establish naming convention preference:\n`;
    report += `   • Migrate from legacy bg-[var(--*)] to modern bg-(--*) syntax\n`;
    report += `   • Remove 'color-' prefix for abstraction: bg-(--background-primary)\n\n`;

    report += `2. Start with recommended anchor components:\n`;
    anchorCandidates.forEach((c, i) => {
      report += `   ${i + 1}. ${c.name}\n`;
    });
    report += `\n`;

    report += `3. Resolve unmatched CSS variables:\n`;
    report += `   • ${componentsWithUnmatched.length} components have unmatched variables\n`;
    report += `   • Create missing tokens or update references\n\n`;

    report += `4. Address unused tokens:\n`;
    report += `   • ${unusedTokens.length} tokens are not being used\n`;
    report += `   • Determine if they should be used or removed\n\n`;

    report += `${"=".repeat(80)}\n`;

    return report;
  }

  /**
   * Generate JSON data file for programmatic access
   */
  generateJsonData() {
    return {
      summary: {
        totalComponents: this.components.length,
        componentsUsingTokens: this.components.filter(
          (c) => c.tokensUsed.length > 0
        ).length,
        uniqueCssVariables: this.cssCustomProperties.size,
        tokensUsed: this.tokenUsage.size,
        tokensAvailable: this.tokenRegistry.size,
        usagePercentage: (
          (this.tokenUsage.size / this.tokenRegistry.size) *
          100
        ).toFixed(1),
      },
      namingPatterns: {
        legacy: this.namingPatterns.legacy,
        modern: this.namingPatterns.modern,
        preferred: this.namingPatterns.preferred,
      },
      components: this.components.map((c) => ({
        name: c.name,
        path: c.path,
        cssVarsCount: c.cssVarsCount,
        tokensUsed: c.tokensUsed,
        unmatchedVars: c.unmatchedVars,
      })),
      tokenUsage: Object.fromEntries(this.tokenUsage),
      unusedTokens: Array.from(this.tokenRegistry.keys()).filter(
        (tokenName) => !this.tokenUsage.has(tokenName)
      ),
    };
  }
}

/**
 * Main analysis function
 */
async function analyzeComponents() {
  console.log(`🔍 Component Token Usage Analysis\n`);

  const analyzer = new ComponentAnalyzer();

  // Load token registry
  await analyzer.loadTokenRegistry();

  // Scan UI package
  const uiSrcPath = join(process.cwd(), "../ui/src");
  console.log(`📁 Scanning: ${uiSrcPath}\n`);

  const componentFiles = await analyzer.scanDirectory(uiSrcPath);
  console.log(`   Found ${componentFiles.length} component files\n`);

  // Analyze each component
  console.log(`⚙️  Analyzing components...\n`);
  for (const filePath of componentFiles) {
    await analyzer.analyzeComponent(filePath, uiSrcPath);
  }

  // Generate reports
  const report = analyzer.generateReport();
  const jsonData = analyzer.generateJsonData();

  // Output to console
  console.log(report);

  // Save to files
  const reportPath = "io/reports/component-usage-report.txt";
  const jsonPath = "io/reports/component-usage-data.json";

  await writeFile(reportPath, report, "utf-8");
  await writeFile(jsonPath, JSON.stringify(jsonData, null, 2), "utf-8");

  console.log(`💾 Reports saved:`);
  console.log(`   ${reportPath}`);
  console.log(`   ${jsonPath}\n`);
}

// Run analysis when script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeComponents().catch((error) => {
    console.error("❌ Analysis failed with error:", error);
    process.exit(1);
  });
}

export { analyzeComponents, ComponentAnalyzer };
