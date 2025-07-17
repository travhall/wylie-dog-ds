// packages/tokens/scripts/validate-simple.js
import { readFile } from 'fs/promises';
import { convertOklchToHex, validateColorContrast } from './color-utils.js';

export class SimpleTokenValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.tokens = null;
  }

  async runValidation() {
    console.log('🔍 Running focused token validation...\n');
    
    try {
      await this.loadTokens();
      await this.validateColorValues();
      await this.validateCriticalContrast();
      await this.generateReport();
      
      if (this.errors.length > 0) {
        console.error(`\n❌ Validation failed with ${this.errors.length} critical errors`);
        process.exit(1);
      }
      
      console.log('\n✅ Token validation completed successfully!');
    } catch (error) {
      console.error('❌ Validation script failed:', error.message);
      process.exit(1);
    }
  }

  async loadTokens() {
    try {
      const primitive = JSON.parse(await readFile('src/primitive.json', 'utf-8'));
      const semantic = JSON.parse(await readFile('src/semantic.json', 'utf-8'));
      const component = JSON.parse(await readFile('src/component.json', 'utf-8'));
      
      this.tokens = { primitive, semantic, component };
      console.log('✅ Token files loaded successfully');
    } catch (error) {
      this.errors.push(`Failed to load token files: ${error.message}`);
    }
  }

  async validateColorValues() {
    console.log('🔍 Validating OKLCH color values...');
    
    const primitiveColors = this.extractColors(this.tokens.primitive.color || {});
    
    for (const [path, color] of Object.entries(primitiveColors)) {
      if (color.startsWith('oklch(')) {
        try {
          const hex = convertOklchToHex(color);
          if (!hex || hex === '#6b7280') { // fallback color
            this.warnings.push(`OKLCH color may need better mapping: ${path} = ${color}`);
          }
        } catch (error) {
          this.errors.push(`Invalid OKLCH color: ${path} = ${color}`);
        }
      }
    }
  }

  async validateCriticalContrast() {
    console.log('🔍 Validating critical color contrast...');
    
    // Load the resolved JSON output to get actual values
    const resolvedTokens = JSON.parse(await readFile('dist/tokens.json', 'utf-8'));
    
    const criticalTests = [
      { 
        name: 'Primary button',
        text: resolvedTokens.button.primary.text.oklch || resolvedTokens.button.primary.text.hex || resolvedTokens.button.primary.text,
        bg: resolvedTokens.button.primary.background.oklch || resolvedTokens.button.primary.background.hex || resolvedTokens.button.primary.background
      },
      {
        name: 'Secondary button', 
        text: resolvedTokens.button.secondary.text.oklch || resolvedTokens.button.secondary.text.hex || resolvedTokens.button.secondary.text,
        bg: resolvedTokens.button.secondary.background.oklch || resolvedTokens.button.secondary.background.hex || resolvedTokens.button.secondary.background
      },
      {
        name: 'Success alert',
        text: resolvedTokens.alert.success.text.oklch || resolvedTokens.alert.success.text.hex || resolvedTokens.alert.success.text,
        bg: resolvedTokens.alert.success.background.oklch || resolvedTokens.alert.success.background.hex || resolvedTokens.alert.success.background
      }
    ];

    for (const test of criticalTests) {
      if (test.text && test.bg) {
        const contrast = validateColorContrast(test.text, test.bg);
        if (!contrast.passes) {
          this.errors.push(
            `${test.name} fails contrast: ${contrast.ratio}:1 (needs 4.5:1)`
          );
        } else {
          console.log(`  ✅ ${test.name}: ${contrast.ratio}:1 (${contrast.level})`);
        }
      } else {
        this.warnings.push(`Could not find colors for ${test.name}`);
      }
    }
  }

  extractColors(obj, prefix = '') {
    const colors = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        if (value.$value && value.$type === 'color') {
          colors[path] = value.$value;
        } else if (!value.$value) {
          Object.assign(colors, this.extractColors(value, path));
        }
      }
    }
    
    return colors;
  }

  async generateReport() {
    console.log('\n📊 Focused Token Validation Report');
    console.log('=' .repeat(50));
    
    const primitiveColors = this.extractColors(this.tokens.primitive.color || {});
    console.log(`✅ Total primitive colors: ${Object.keys(primitiveColors).length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Critical Errors:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n💡 Note: W3C references like {color.blue.500} are resolved at build time');
    console.log('   The "broken reference" warnings from the comprehensive validator are expected');
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new SimpleTokenValidator();
  await validator.runValidation();
}
