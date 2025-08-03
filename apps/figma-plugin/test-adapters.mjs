#!/usr/bin/env node

// Format Adapter Testing Script
// Tests the new format adapters with sample files

import { FormatAdapterManager } from './src/plugin/variables/format-adapter-manager.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testFormatAdapters() {
  console.log('🧪 Testing Format Adapter Layer Implementation\n');
  
  const manager = new FormatAdapterManager();
  
  // Organized test files
  const testFiles = [
    // Native Wylie Dog formats
    { name: 'Native Wylie Dog - Basic', file: 'test-data/formats/native-wylie/basic.json' },
    
    // Style Dictionary formats
    { name: 'Style Dictionary - Flat', file: 'test-data/formats/style-dictionary/flat.json' },
    { name: 'Style Dictionary - Nested', file: 'test-data/formats/style-dictionary/nested.json' },
    
    // Tokens Studio formats  
    { name: 'Tokens Studio - Basic', file: 'test-data/formats/tokens-studio/basic.json' },
    { name: 'Tokens Studio - Proper', file: 'test-data/formats/tokens-studio/proper.json' },
    
    // Material Design formats
    { name: 'Material Design - Basic', file: 'test-data/formats/material-design/basic.json' },
    { name: 'Material Design - Proper', file: 'test-data/formats/material-design/proper.json' },
    
    // W3C DTCG format
    { name: 'W3C DTCG - Compliant', file: 'test-data/formats/w3c-dtcg/compliant.json' },
    
    // CSS Variables formats
    { name: 'CSS Variables - Basic', file: 'test-data/formats/css-variables/basic.json' },
    { name: 'CSS Variables - Proper', file: 'test-data/formats/css-variables/proper.json' },
    
    // Generic format
    { name: 'Generic Format', file: 'test-data/formats/generic/basic.json' },
    
    // Figma API format
    { name: 'Figma Variables API Export', file: 'test-data/formats/figma-api/variables-export.json' },
    
    // Framework formats
    { name: 'Chakra UI Theme', file: 'test-data/formats/frameworks/chakra-ui.json' },
    { name: 'Ant Design Tokens', file: 'test-data/formats/frameworks/ant-design.json' },
    { name: 'SCSS Variables', file: 'test-data/formats/frameworks/scss-variables.json' },
    
    // Complex token types
    { name: 'Complex Typography', file: 'test-data/complex-tokens/typography.json' },
    { name: 'Complex Shadows & Borders', file: 'test-data/complex-tokens/shadows-borders.json' },
    
    // Edge cases
    { name: 'Circular References', file: 'test-data/edge-cases/circular-references.json' },
    { name: 'Invalid References', file: 'test-data/edge-cases/invalid-references.json' },
    { name: 'Minimal Structure', file: 'test-data/edge-cases/minimal-structure.json' },
    { name: 'Mixed Conventions', file: 'test-data/edge-cases/mixed-conventions.json' },
    { name: 'Empty Collections', file: 'test-data/edge-cases/empty-collections.json' }
  ];
  
  let passCount = 0;
  let failCount = 0;
  
  for (const testFile of testFiles) {
    try {
      console.log(`\n📁 Testing: ${testFile.name}`);
      console.log(`   File: ${testFile.file}`);
      
      const filePath = join(__dirname, testFile.file);
      const content = readFileSync(filePath, 'utf8');
      
      // Test format detection only (lightweight)
      const detection = manager.detectFormatOnly(content);
      
      if (detection) {
        console.log(`   ✅ Format: ${detection.format}`);
        console.log(`   📊 Confidence: ${(detection.confidence * 100).toFixed(1)}%`);
        console.log(`   📈 Tokens: ${detection.structure.tokenCount}`);
        console.log(`   🔗 References: ${detection.structure.referenceCount}`);
        
        if (detection.warnings.length > 0) {
          console.log(`   ⚠️  Warnings: ${detection.warnings.length}`);
          detection.warnings.forEach(warning => {
            console.log(`      • ${warning}`);
          });
        }
        
        passCount++;
      } else {
        console.log(`   ❌ Failed to detect format`);
        failCount++;
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n🎉 Format detection testing complete!');
  console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed`);
  
  console.log('\n📋 Supported Formats:');
  const supportedFormats = manager.getSupportedFormats();
  supportedFormats.forEach(format => {
    console.log(`   • ${format}`);
  });
  
  console.log('\n📁 Test Organization:');
  console.log('   • formats/ - Major token format variants');
  console.log('   • complex-tokens/ - Advanced token types');
  console.log('   • edge-cases/ - Error handling and edge cases');
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  testFormatAdapters().catch(console.error);
}

export { testFormatAdapters };