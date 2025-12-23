import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Comprehensive token validation script
 * Validates token structure, references, OKLCH values, and semantic chains
 */

class TokenValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.tokenRegistry = new Map();
    this.referenceChains = new Map();
  }

  // OKLCH validation ranges
  static OKLCH_RANGES = {
    lightness: { min: 0, max: 1, warn: { min: 0.05, max: 0.98 } },
    chroma: { min: 0, max: 0.5, warn: { min: 0, max: 0.4 } },
    hue: { min: 0, max: 360 },
  };

  /**
   * Parse OKLCH color string
   */
  parseOklch(value) {
    if (typeof value !== "string" || !value.startsWith("oklch(")) {
      return null;
    }

    const match = value.match(
      /oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*\)/
    );
    if (!match) return null;

    return {
      l: parseFloat(match[1]),
      c: parseFloat(match[2]),
      h: parseFloat(match[3]),
    };
  }

  /**
   * Parse token reference
   */
  parseReference(value) {
    if (typeof value !== "string") return null;
    const match = value.match(/^\{([^}]+)\}$/);
    return match ? match[1] : null;
  }

  /**
   * Validate OKLCH color value
   */
  validateOklchValue(tokenName, value) {
    const oklch = this.parseOklch(value);
    if (!oklch) {
      this.errors.push({
        type: "invalid-oklch-format",
        token: tokenName,
        value,
        message: `Invalid OKLCH format: "${value}"`,
      });
      return false;
    }

    const { l, c, h } = oklch;
    const ranges = TokenValidator.OKLCH_RANGES;

    // Critical errors - values out of valid range
    if (l < ranges.lightness.min || l > ranges.lightness.max) {
      this.errors.push({
        type: "oklch-lightness-invalid",
        token: tokenName,
        value: l,
        message: `Lightness ${l} out of valid range [${ranges.lightness.min}, ${ranges.lightness.max}]`,
      });
    }

    if (c < ranges.chroma.min || c > ranges.chroma.max) {
      this.errors.push({
        type: "oklch-chroma-invalid",
        token: tokenName,
        value: c,
        message: `Chroma ${c} out of valid range [${ranges.chroma.min}, ${ranges.chroma.max}]`,
      });
    }

    if (h < ranges.hue.min || h > ranges.hue.max) {
      this.errors.push({
        type: "oklch-hue-invalid",
        token: tokenName,
        value: h,
        message: `Hue ${h} out of valid range [${ranges.hue.min}, ${ranges.hue.max}]`,
      });
    }

    // Warnings for unusual values
    if (l < ranges.lightness.warn.min || l > ranges.lightness.warn.max) {
      this.warnings.push({
        type: "oklch-lightness-extreme",
        token: tokenName,
        value: l,
        message: `Lightness ${l} is very extreme (nearly black or white). Verify intentional.`,
      });
    }

    if (c > ranges.chroma.warn.max) {
      this.warnings.push({
        type: "oklch-chroma-high",
        token: tokenName,
        value: c,
        message: `Chroma ${c} is very high and may clip in sRGB. Consider P3 display gamut.`,
      });
    }

    // Check precision consistency
    const lPrecision = (l.toString().split(".")[1] || "").length;
    const cPrecision = (c.toString().split(".")[1] || "").length;
    const hPrecision = (h.toString().split(".")[1] || "").length;

    if (lPrecision !== 3 || cPrecision !== 3 || hPrecision !== 2) {
      this.warnings.push({
        type: "oklch-precision-inconsistent",
        token: tokenName,
        value,
        message: `OKLCH precision inconsistent. Expected: oklch(0.000 0.000 0.00), got L:${lPrecision} C:${cPrecision} H:${hPrecision} decimals`,
      });
    }

    return true;
  }

  /**
   * Register a token
   */
  registerToken(tokenName, token, file) {
    if (this.tokenRegistry.has(tokenName)) {
      this.warnings.push({
        type: "duplicate-token",
        token: tokenName,
        files: [this.tokenRegistry.get(tokenName).file, file],
        message: `Token "${tokenName}" defined in multiple files`,
      });
    }
    this.tokenRegistry.set(tokenName, { ...token, file });
  }

  /**
   * Validate token reference exists
   */
  validateReference(tokenName, reference) {
    if (!this.tokenRegistry.has(reference)) {
      this.errors.push({
        type: "broken-reference",
        token: tokenName,
        reference,
        message: `Token "${tokenName}" references non-existent token "{${reference}}"`,
      });
      return false;
    }
    return true;
  }

  /**
   * Resolve reference chain and detect circular references
   */
  resolveReferenceChain(tokenName, visited = new Set()) {
    if (visited.has(tokenName)) {
      this.errors.push({
        type: "circular-reference",
        token: tokenName,
        chain: Array.from(visited).concat(tokenName),
        message: `Circular reference: ${Array.from(visited).join(" → ")} → ${tokenName}`,
      });
      return null;
    }

    const token = this.tokenRegistry.get(tokenName);
    if (!token) return null;

    const reference = this.parseReference(token.$value);
    if (!reference) {
      return { chain: [tokenName], finalValue: token.$value };
    }

    visited.add(tokenName);
    const resolved = this.resolveReferenceChain(reference, visited);
    visited.delete(tokenName);

    if (resolved) {
      return {
        chain: [tokenName, ...resolved.chain],
        finalValue: resolved.finalValue,
      };
    }
    return null;
  }

  /**
   * Validate reference chain depth
   */
  validateReferenceChainDepth(tokenName, maxDepth = 4) {
    const resolved = this.resolveReferenceChain(tokenName);
    if (!resolved) return;

    const depth = resolved.chain.length - 1;
    if (depth > maxDepth) {
      this.warnings.push({
        type: "deep-reference-chain",
        token: tokenName,
        depth,
        maxDepth,
        message: `Reference chain is ${depth} levels deep (max: ${maxDepth}). ${resolved.chain.join(" → ")}`,
      });
    }
    this.referenceChains.set(tokenName, resolved);
  }

  /**
   * Validate semantic token structure
   */
  validateSemanticStructure(tokenName, token) {
    const semanticPrefixes = [
      ".background.",
      ".surface.",
      ".text.",
      ".border.",
      ".interactive.",
    ];

    const isSemantic = semanticPrefixes.some((prefix) =>
      tokenName.includes(prefix)
    );

    if (isSemantic) {
      const reference = this.parseReference(token.$value);
      if (!reference) {
        this.warnings.push({
          type: "semantic-without-reference",
          token: tokenName,
          message: `Semantic token contains raw value instead of reference to primitive`,
        });
      }
    }
  }

  /**
   * Load and validate a token file
   */
  async validateFile(filePath, fileName) {
    try {
      const content = await readFile(filePath, "utf-8");
      const data = JSON.parse(content);

      console.log(`📄 ${fileName}`);

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

      let tokenCount = 0;
      let colorCount = 0;
      let referenceCount = 0;

      for (const [tokenName, token] of Object.entries(tokens)) {
        tokenCount++;

        if (!token.$type) {
          this.errors.push({
            type: "missing-type",
            token: tokenName,
            message: `Missing $type property`,
          });
          continue;
        }

        if (token.$value === undefined) {
          this.errors.push({
            type: "missing-value",
            token: tokenName,
            message: `Missing $value property`,
          });
          continue;
        }

        this.registerToken(tokenName, token, fileName);

        if (token.$type === "color") {
          colorCount++;
          const reference = this.parseReference(token.$value);

          if (reference) {
            referenceCount++;
            this.validateReference(tokenName, reference);
          } else if (
            typeof token.$value === "string" &&
            token.$value.startsWith("oklch")
          ) {
            this.validateOklchValue(tokenName, token.$value);
          } else if (
            typeof token.$value === "string" &&
            token.$value.startsWith("#")
          ) {
            this.warnings.push({
              type: "hex-not-oklch",
              token: tokenName,
              message: `Uses hex instead of OKLCH. Run 'pnpm process-io' to convert`,
            });
          }
        }

        this.validateSemanticStructure(tokenName, token);
      }

      console.log(
        `   ✓ ${tokenCount} tokens (${colorCount} colors, ${referenceCount} refs)`
      );
      return { tokenCount, colorCount, referenceCount };
    } catch (error) {
      this.errors.push({
        type: "file-error",
        file: fileName,
        message: `Failed to load: ${error.message}`,
      });
      return { tokenCount: 0, colorCount: 0, referenceCount: 0 };
    }
  }

  /**
   * Validate all reference chains
   */
  validateAllReferenceChains() {
    console.log(`\n🔗 Validating references...`);
    let chainsValidated = 0;

    for (const tokenName of this.tokenRegistry.keys()) {
      const token = this.tokenRegistry.get(tokenName);
      const reference = this.parseReference(token.$value);
      if (reference) {
        this.validateReferenceChainDepth(tokenName);
        chainsValidated++;
      }
    }

    console.log(`   ✓ ${chainsValidated} reference chains validated`);
  }

  /**
   * Print validation report
   */
  printReport() {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`TOKEN VALIDATION REPORT`);
    console.log(`${"=".repeat(60)}`);

    console.log(`\n📊 Summary:`);
    console.log(`   Tokens: ${this.tokenRegistry.size}`);
    console.log(`   Errors: ${this.errors.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS (${this.errors.length}):`);
      const byType = {};
      for (const error of this.errors) {
        if (!byType[error.type]) byType[error.type] = [];
        byType[error.type].push(error);
      }

      for (const [type, errors] of Object.entries(byType)) {
        console.log(`\n   ${type} (${errors.length}):`);
        for (const error of errors.slice(0, 5)) {
          console.log(`      • ${error.token || error.file}: ${error.message}`);
        }
        if (errors.length > 5) {
          console.log(`      ... and ${errors.length - 5} more`);
        }
      }
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      const byType = {};
      for (const warning of this.warnings) {
        if (!byType[warning.type]) byType[warning.type] = [];
        byType[warning.type].push(warning);
      }

      for (const [type, warnings] of Object.entries(byType)) {
        console.log(`\n   ${type} (${warnings.length}):`);
        for (const warning of warnings.slice(0, 3)) {
          console.log(
            `      • ${warning.token || warning.file}: ${warning.message}`
          );
        }
        if (warnings.length > 3) {
          console.log(`      ... and ${warnings.length - 3} more`);
        }
      }
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(`\n✅ All tokens are valid!`);
    }

    console.log(`\n${"=".repeat(60)}\n`);
    return this.errors.length === 0;
  }
}

/**
 * Main validation function
 */
async function validateTokens() {
  const validator = new TokenValidator();

  console.log(`🔍 Token Validation\n`);

  const processedDir = "io/processed";
  const files = [
    "primitive.json",
    "semantic-light.json",
    "semantic-dark.json",
    "component-light.json",
    "component-dark.json",
  ];

  for (const file of files) {
    await validator.validateFile(join(processedDir, file), file);
  }

  validator.validateAllReferenceChains();

  const isValid = validator.printReport();
  process.exit(isValid ? 0 : 1);
}

// Run validation when script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateTokens().catch((error) => {
    console.error("❌ Validation failed with error:", error);
    process.exit(1);
  });
}

export { validateTokens, TokenValidator };
