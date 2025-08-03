#!/usr/bin/env node

// Simple JSON validation test - no imports required
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function analyzeTokenStructure(data) {
  let tokenCount = 0;
  let referenceCount = 0;
  let hasCollections = false;
  let hasModes = false;
  
  function countTokens(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'modes') hasModes = true;
      if (key === 'variables' || key === 'collections') hasCollections = true;
      
      if (value && typeof value === 'object') {
        // Check if this looks like a token
        if (value.$value !== undefined || value.value !== undefined) {
          tokenCount++;
          const tokenValue = value.$value || value.value;
          if (typeof tokenValue === 'string' && tokenValue.includes('{')) {
            referenceCount++;
          }
        }
        countTokens(value, path ? `${path}.${key}` : key);
      } else if (typeof value === 'string' && value.includes('{')) {
        referenceCount++;
      }
    }
  }
  
  countTokens(data);
  
  return { tokenCount, referenceCount, hasCollections, hasModes };
}

async function testJsonFiles() {
  console.log('🧪 JSON Structure Analysis\n');
  
  const testFiles = [
    'test-data/formats/native-wylie/basic.json',
    'test-data/formats/style-dictionary/flat.json',
    'test-data/formats/style-dictionary/nested.json',
    'test-data/formats/tokens-studio/basic.json',
    'test-data/formats/tokens-studio/proper.json',
    'test-data/formats/material-design/basic.json',
    'test-data/formats/material-design/proper.json',
    'test-data/formats/w3c-dtcg/compliant.json',
    'test-data/formats/css-variables/basic.json',
    'test-data/formats/css-variables/proper.json',
    'test-data/formats/generic/basic.json',
    'test-data/formats/figma-api/variables-export.json',
    'test-data/formats/frameworks/chakra-ui.json',
    'test-data/formats/frameworks/ant-design.json',
    'test-data/formats/frameworks/scss-variables.json',
    'test-data/complex-tokens/typography.json',
    'test-data/complex-tokens/shadows-borders.json',
    'test-data/edge-cases/circular-references.json',
    'test-data/edge-cases/invalid-references.json',
    'test-data/edge-cases/minimal-structure.json',
    'test-data/edge-cases/mixed-conventions.json',
    'test-data/edge-cases/empty-collections.json'
  ];
  
  let passCount = 0;
  let failCount = 0;
  
  for (const file of testFiles) {
    try {
      const content = readFileSync(join(__dirname, file), 'utf8');
      const data = JSON.parse(content);
      const analysis = analyzeTokenStructure(data);
      
      console.log(`✅ ${file}`);
      console.log(`   📈 Tokens: ${analysis.tokenCount}`);
      console.log(`   🔗 References: ${analysis.referenceCount}`);
      console.log(`   📦 Collections: ${analysis.hasCollections}`);
      console.log(`   🎨 Modes: ${analysis.hasModes}\n`);
      
      passCount++;
    } catch (error) {
      console.log(`❌ ${file}: ${error.message}\n`);
      failCount++;
    }
  }
  
  console.log(`🎉 Complete: ${passCount} passed, ${failCount} failed`);
}

testJsonFiles().catch(console.error);