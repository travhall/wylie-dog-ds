#!/usr/bin/env node

/**
 * Demo Token Generator Script
 * Generates a simplified demo token file from Wylie Dog tokens
 * for educational purposes and quick onboarding
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the source primitive tokens
const primitiveTokensPath = path.join(
  __dirname,
  "../../../packages/tokens/io/sync/primitive.json"
);

const primitiveTokens = JSON.parse(
  fs.readFileSync(primitiveTokensPath, "utf-8")
);

// Extract a subset of tokens for demo purposes
const createDemoTokens = () => {
  const primitive = primitiveTokens[0].primitive;
  const demoVariables = {};

  // Select a subset of useful demo tokens
  const tokensToInclude = [
    // Grays (full scale)
    "color.gray.50",
    "color.gray.100",
    "color.gray.200",
    "color.gray.300",
    "color.gray.400",
    "color.gray.500",
    "color.gray.600",
    "color.gray.700",
    "color.gray.800",
    "color.gray.900",
    "color.gray.950",
    // Blue (primary color)
    "color.blue.50",
    "color.blue.100",
    "color.blue.200",
    "color.blue.300",
    "color.blue.400",
    "color.blue.500",
    "color.blue.600",
    "color.blue.700",
    "color.blue.800",
    "color.blue.900",
    "color.blue.950",
    // Green (success color)
    "color.green.500",
    "color.green.600",
    "color.green.700",
    // Red (error color)
    "color.red.500",
    "color.red.600",
    "color.red.700",
    // Spacing
    "spacing.1",
    "spacing.2",
    "spacing.4",
    "spacing.8",
    "spacing.12",
    "spacing.16",
    "spacing.24",
    // Font sizes
    "font-size.xs",
    "font-size.sm",
    "font-size.md",
    "font-size.lg",
    "font-size.xl",
    "font-size.2xl",
  ];

  // Extract tokens
  for (const tokenName of tokensToInclude) {
    if (primitive.variables[tokenName]) {
      demoVariables[tokenName] = primitive.variables[tokenName];
    }
  }

  return [
    {
      "demo-tokens": {
        modes: [
          {
            modeId: "mode:demo:default",
            name: "Default",
          },
        ],
        variables: demoVariables,
      },
    },
  ];
};

// Generate demo tokens
const demoTokens = createDemoTokens();

// Write to data directory
const outputPath = path.join(__dirname, "../src/plugin/data/demo-tokens.json");

// Ensure directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(demoTokens, null, 2));

console.log("✅ Generated demo tokens successfully!");
console.log(`   Location: ${outputPath}`);
console.log(
  `   Token count: ${Object.keys(demoTokens[0]["demo-tokens"].variables).length}`
);
