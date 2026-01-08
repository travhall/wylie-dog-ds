#!/usr/bin/env node

/**
 * Benchmark Token Generator Script
 * Generates massive datasets for performance testing
 * Usage: node scripts/benchmark-tokens.js [count]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_COUNT = 1000;
const args = process.argv.slice(2);
const count = args[0] ? parseInt(args[0], 10) : DEFAULT_COUNT;

const COLLECTION_NAME = `benchmark-${count}`;
const MODE_NAME = "Default";

console.log(`🚀 Genering ${count} tokens for benchmark...`);

const generateTokens = (totalCount) => {
  const variables = {};
  
  const tokenTypes = ["color", "number", "string", "boolean"];
  const groups = ["core", "brand", "components", "system"];

  for (let i = 0; i < totalCount; i++) {
    const type = tokenTypes[i % tokenTypes.length];
    const group = groups[i % groups.length];
    const index = Math.floor(i / groups.length);
    
    const name = `${group}.${type}.${index}`;
    
    let value;
    let w3cType;

    switch (type) {
      case "color":
        // Generate random hex color
        value = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        w3cType = "color";
        break;
      case "number":
        value = Math.floor(Math.random() * 100);
        w3cType = "number";
        break;
      case "string":
        value = `value-${index}`;
        w3cType = "string";
        break;
      case "boolean":
        value = i % 2 === 0;
        w3cType = "boolean";
        break;
      default:
        value = "unknown";
        w3cType = "string";
    }

    variables[name] = {
      $type: w3cType,
      $value: value,
      $description: `Benchmark token ${i} of type ${type}`
    };
  }

  return [
    {
      [COLLECTION_NAME]: {
        modes: [
          {
            modeId: "mode:benchmark:default",
            name: MODE_NAME,
          },
        ],
        variables,
      },
    },
  ];
};

const tokens = generateTokens(count);

// Write to data directory
const outputPath = path.join(__dirname, `../src/plugin/data/benchmark-${count}.json`);

// Ensure directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));

console.log("✅ Generated benchmark dataset successfully!");
console.log(`   Location: ${outputPath}`);
console.log(`   Token count: ${count}`);
