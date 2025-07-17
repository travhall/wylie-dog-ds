// packages/tokens/scripts/validate-and-cleanup.js
import { readFile, writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import { convertOklchToHex, validateColorContrast } from "./color-utils.js";

export class TokenValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
    this.tokens = null;
  }

  async runFullValidation() {
    console.log("🔍 Starting comprehensive token validation...\n");

    try {
      await this.loadTokens();
      await this.cleanupUnnecessaryFiles();
      await this.validateTokenStructure();
      await this.validateReferences();
      await this.validateColorContrast();
      await this.validateNaming();
      await this.generateReport();

      if (this.errors.length > 0) {
        console.error(
          `\n❌ Validation failed with ${this.errors.length} errors`
        );
        process.exit(1);
      }

      console.log("\n✅ Token validation completed successfully!");
    } catch (error) {
      console.error("❌ Validation script failed:", error.message);
      process.exit(1);
    }
  }

  async loadTokens() {
    try {
      const primitive = JSON.parse(
        await readFile("src/primitive.json", "utf-8")
      );
      const semantic = JSON.parse(await readFile("src/semantic.json", "utf-8"));
      const component = JSON.parse(
        await readFile("src/component.json", "utf-8")
      );

      this.tokens = { primitive, semantic, component };
      console.log("✅ Token files loaded successfully");
    } catch (error) {
      this.errors.push(`Failed to load token files: ${error.message}`);
    }
  }

  async cleanupUnnecessaryFiles() {
    const filesToCheck = [
      "debug-tokens.json.backup",
      "debug-tokens.json",
      "figma-export.json.old",
      "src/tokens.generated.ts", // This should be in dist/, not src/
    ];

    for (const file of filesToCheck) {
      if (existsSync(file)) {
        try {
          const stats = await import("fs").then((fs) => fs.promises.stat(file));
          const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

          if (stats.size > 1024 * 1024) {
            // Files over 1MB
            this.warnings.push(
              `Large unnecessary file found: ${file} (${sizeMB}MB)`
            );
            this.fixes.push(`rm ${file}`);
          } else {
            this.warnings.push(`Unnecessary file found: ${file}`);
            this.fixes.push(`rm ${file}`);
          }
        } catch (error) {
          // File doesn't exist or can't be read
        }
      }
    }
  }

  async validateTokenStructure() {
    console.log("🔍 Validating token structure...");

    const allTokens = this.flattenAllTokens();

    // Check for W3C DTCG compliance
    for (const [path, token] of Object.entries(allTokens)) {
      if (typeof token === "object" && token !== null) {
        if (!token.$value && !this.isContainer(token)) {
          this.errors.push(`Token missing $value: ${path}`);
        }
        if (!token.$type && !this.isContainer(token)) {
          this.warnings.push(`Token missing $type: ${path}`);
        }
        if (!token.$description && !this.isContainer(token)) {
          this.warnings.push(`Token missing $description: ${path}`);
        }
      }
    }
  }

  async validateReferences() {
    console.log("🔍 Validating token references...");

    const allTokens = this.flattenAllTokens();
    const references = this.findReferences(allTokens);

    for (const [tokenPath, referencePath] of references) {
      if (!this.resolveReference(referencePath, allTokens)) {
        this.errors.push(`Broken reference: ${tokenPath} → {${referencePath}}`);
      }
    }

    // Check for circular references
    this.validateCircularReferences(allTokens);
  }

  async validateColorContrast() {
    console.log("🔍 Validating color contrast...");

    const criticalCombinations = [
      ["button.primary.text", "button.primary.background"],
      ["button.secondary.text", "button.secondary.background"],
      ["input.text", "input.background"],
      ["color.text.primary", "color.background.primary"],
    ];

    for (const [textPath, bgPath] of criticalCombinations) {
      const textToken = this.getTokenByPath(textPath);
      const bgToken = this.getTokenByPath(bgPath);

      if (textToken && bgToken) {
        const textColor = this.resolveColorValue(textToken);
        const bgColor = this.resolveColorValue(bgToken);

        if (textColor && bgColor) {
          const contrast = validateColorContrast(textColor, bgColor);
          if (!contrast.passes) {
            this.errors.push(
              `Insufficient contrast: ${textPath} on ${bgPath} - ${contrast.ratio}:1 (needs 4.5:1)`
            );
          }
        }
      }
    }
  }

  async validateNaming() {
    console.log("🔍 Validating naming conventions...");

    const allTokens = this.flattenAllTokens();
    const tokenNames = Object.keys(allTokens);

    // Check for potential naming collisions
    const nameGroups = {};
    for (const name of tokenNames) {
      const baseName = name.split(".").pop();
      if (!nameGroups[baseName]) nameGroups[baseName] = [];
      nameGroups[baseName].push(name);
    }

    for (const [baseName, fullNames] of Object.entries(nameGroups)) {
      if (fullNames.length > 1) {
        this.warnings.push(
          `Potential naming collision: ${baseName} used in ${fullNames.join(", ")}`
        );
      }
    }
  }

  flattenAllTokens() {
    const flattened = {};

    for (const [category, tokens] of Object.entries(this.tokens)) {
      this.flattenTokens(tokens, category, flattened);
    }

    return flattened;
  }

  flattenTokens(obj, prefix = "", result = {}) {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "object" && value !== null && !value.$value) {
        this.flattenTokens(value, path, result);
      } else {
        result[path] = value;
      }
    }

    return result;
  }

  findReferences(tokens) {
    const references = [];

    for (const [path, token] of Object.entries(tokens)) {
      if (
        typeof token === "object" &&
        token.$value &&
        typeof token.$value === "string"
      ) {
        const matches = token.$value.match(/\{([^}]+)\}/g);
        if (matches) {
          for (const match of matches) {
            const refPath = match.slice(1, -1);
            references.push([path, refPath]);
          }
        }
      }
    }

    return references;
  }

  resolveReference(refPath, allTokens) {
    const pathParts = refPath.split(".");
    let current = allTokens;

    for (const part of pathParts) {
      const fullPath = Object.keys(current).find(
        (key) => key.endsWith(`.${part}`) || key === part
      );
      if (fullPath && current[fullPath]) {
        current = current[fullPath];
      } else {
        return null;
      }
    }

    return current;
  }

  validateCircularReferences(tokens) {
    const visited = new Set();
    const recursionStack = new Set();

    for (const [path, token] of Object.entries(tokens)) {
      if (
        this.hasCircularReference(path, token, tokens, visited, recursionStack)
      ) {
        this.errors.push(`Circular reference detected involving: ${path}`);
      }
    }
  }

  hasCircularReference(path, token, allTokens, visited, recursionStack) {
    if (recursionStack.has(path)) return true;
    if (visited.has(path)) return false;

    visited.add(path);
    recursionStack.add(path);

    if (
      typeof token === "object" &&
      token.$value &&
      typeof token.$value === "string"
    ) {
      const matches = token.$value.match(/\{([^}]+)\}/g);
      if (matches) {
        for (const match of matches) {
          const refPath = match.slice(1, -1);
          const referencedToken = this.resolveReference(refPath, allTokens);
          if (
            referencedToken &&
            this.hasCircularReference(
              refPath,
              referencedToken,
              allTokens,
              visited,
              recursionStack
            )
          ) {
            return true;
          }
        }
      }
    }

    recursionStack.delete(path);
    return false;
  }

  getTokenByPath(path) {
    const allTokens = this.flattenAllTokens();
    return allTokens[path];
  }

  resolveColorValue(token) {
    if (typeof token === "object" && token.$value) {
      return token.$value;
    }
    return token;
  }

  isContainer(token) {
    return typeof token === "object" && !token.$value && !token.$type;
  }

  async generateReport() {
    console.log("\n📊 Token Validation Report");
    console.log("=".repeat(50));

    const allTokens = this.flattenAllTokens();
    console.log(`✅ Total tokens: ${Object.keys(allTokens).length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      this.warnings.forEach((warning) => console.log(`  - ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.errors.forEach((error) => console.log(`  - ${error}`));
    }

    if (this.fixes.length > 0) {
      console.log("\n🔧 Suggested Fixes:");
      this.fixes.forEach((fix) => console.log(`  $ ${fix}`));

      // Generate cleanup script
      const cleanupScript = `#!/bin/bash
# Generated cleanup script for Wylie Dog tokens
echo "🧹 Cleaning up unnecessary files..."

${this.fixes.join("\n")}

echo "✅ Cleanup completed!"
`;

      await writeFile("scripts/cleanup.sh", cleanupScript);
      console.log("\n💡 Cleanup script generated: scripts/cleanup.sh");
      console.log(
        "   Run with: chmod +x scripts/cleanup.sh && ./scripts/cleanup.sh"
      );
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new TokenValidator();
  await validator.runFullValidation();
}
