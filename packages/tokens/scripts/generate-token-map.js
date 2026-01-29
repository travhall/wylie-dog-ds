#!/usr/bin/env node
/**
 * Token Map Generator
 *
 * Generates a comprehensive mapping between:
 * - UI components → tokens they should use
 * - Tokens → CSS variables they generate
 * - CSS variables → Tailwind utility syntax
 *
 * Outputs a JSON file and optional markdown documentation.
 *
 * Usage:
 *   node scripts/generate-token-map.js [options]
 *
 * Options:
 *   --component <name>   Generate map for specific component
 *   --markdown           Also output markdown documentation
 *   --output <path>      Custom output path (default: dist/token-map.json)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TOKENS_DIR = path.resolve(__dirname, '../io/sync');
const DIST_DIR = path.resolve(__dirname, '../dist');
const DOCS_DIR = path.resolve(__dirname, '../../../documentation');

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  component: null,
  markdown: args.includes('--markdown'),
  output: null,
};

const componentArgIndex = args.indexOf('--component');
if (componentArgIndex !== -1 && args[componentArgIndex + 1]) {
  options.component = args[componentArgIndex + 1];
}

const outputArgIndex = args.indexOf('--output');
if (outputArgIndex !== -1 && args[outputArgIndex + 1]) {
  options.output = args[outputArgIndex + 1];
}

// Token type to CSS prefix mapping
const TOKEN_TYPE_CSS_PREFIX = {
  color: 'color',
  spacing: 'spacing',
  dimension: 'spacing', // dimensions often map to spacing
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  lineHeight: 'line-height',
  letterSpacing: 'spacing', // letter-spacing uses spacing prefix
  shadow: 'shadow',
  duration: 'duration',
  borderRadius: 'border-radius',
  borderWidth: 'border-width',
};

// Token type to Tailwind utility mapping
const TOKEN_TYPE_TAILWIND_UTILITIES = {
  color: {
    background: 'bg-',
    border: 'border-',
    text: 'text-',
    fill: 'fill-',
    stroke: 'stroke-',
    // Default
    default: 'bg-',
  },
  spacing: {
    padding: 'p-',
    'padding-x': 'px-',
    'padding-y': 'py-',
    'padding-top': 'pt-',
    'padding-bottom': 'pb-',
    'padding-left': 'pl-',
    'padding-right': 'pr-',
    margin: 'm-',
    gap: 'gap-',
    radius: 'rounded-',
    'letter-spacing': 'tracking-',
    default: 'p-',
  },
  fontSize: {
    'font-size': 'text-(length:',
    default: 'text-(length:',
  },
  fontWeight: {
    'font-weight': 'font-',
    default: 'font-',
  },
  lineHeight: {
    'line-height': 'leading-',
    default: 'leading-',
  },
  shadow: {
    shadow: 'shadow-',
    default: 'shadow-',
  },
  duration: {
    duration: 'duration-',
    default: 'duration-',
  },
  dimension: {
    width: 'w-',
    height: 'h-',
    'max-width': 'max-w-',
    'min-width': 'min-w-',
    radius: 'rounded-',
    default: 'size-',
  },
};

// Extract variables from W3C DTCG format (handles various nesting patterns)
function extractVariables(data) {
  // Pattern 1: { "0": { "collectionName": { "variables": {...} } } }
  if (data['0']) {
    const inner = data['0'];
    const collectionKey = Object.keys(inner).find(k => inner[k]?.variables);
    if (collectionKey) {
      return inner[collectionKey].variables;
    }
  }

  // Pattern 2: { "CollectionName": { "variables": {...} } }
  const collectionKey = Object.keys(data).find(k => data[k]?.variables);
  if (collectionKey) {
    return data[collectionKey].variables;
  }

  // Pattern 3: Direct variables object
  if (data.variables) {
    return data.variables;
  }

  // Fallback: assume data is the variables object itself
  return data;
}

// Load component tokens
function loadComponentTokens() {
  const componentsPath = path.join(TOKENS_DIR, 'components.json');
  const data = JSON.parse(fs.readFileSync(componentsPath, 'utf-8'));
  return extractVariables(data);
}

// Extract token metadata
function extractTokenMetadata(tokens, prefix = '') {
  const metadata = [];

  for (const [key, value] of Object.entries(tokens)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object') {
      if (value.$type || value.$value || value.valuesByMode) {
        // This is a token definition
        const tokenType = value.$type || inferTypeFromName(fullKey);
        const cssPrefix = TOKEN_TYPE_CSS_PREFIX[tokenType] || 'custom';
        const cssVariable = `--${cssPrefix}-${fullKey.replace(/\./g, '-')}`;

        metadata.push({
          name: fullKey,
          type: tokenType,
          value: value.$value,
          valuesByMode: value.valuesByMode,
          cssVariable,
          tailwindSyntax: generateTailwindSyntax(fullKey, tokenType, cssVariable),
        });
      } else {
        // Nested object, continue traversing
        metadata.push(...extractTokenMetadata(value, fullKey));
      }
    }
  }

  return metadata;
}

// Infer token type from name if not specified
function inferTypeFromName(name) {
  const nameLower = name.toLowerCase();

  if (nameLower.includes('color') || nameLower.includes('background') ||
      nameLower.includes('border') && !nameLower.includes('radius') && !nameLower.includes('width')) {
    return 'color';
  }
  if (nameLower.includes('font-size') || nameLower.includes('fontsize')) {
    return 'fontSize';
  }
  if (nameLower.includes('font-weight') || nameLower.includes('fontweight')) {
    return 'fontWeight';
  }
  if (nameLower.includes('line-height') || nameLower.includes('lineheight')) {
    return 'lineHeight';
  }
  if (nameLower.includes('shadow')) {
    return 'shadow';
  }
  if (nameLower.includes('duration') || nameLower.includes('animation')) {
    return 'duration';
  }
  if (nameLower.includes('radius')) {
    return 'dimension';
  }
  if (nameLower.includes('padding') || nameLower.includes('margin') ||
      nameLower.includes('gap') || nameLower.includes('spacing')) {
    return 'spacing';
  }

  return 'dimension';
}

// Generate Tailwind syntax for a token
function generateTailwindSyntax(tokenName, tokenType, cssVariable) {
  const parts = tokenName.split('.');
  const lastPart = parts[parts.length - 1];

  // Determine which utility to use based on token name
  const utilities = TOKEN_TYPE_TAILWIND_UTILITIES[tokenType] || {};
  let utilityPrefix = utilities.default || '';

  // Try to match specific utility based on token name
  for (const [pattern, prefix] of Object.entries(utilities)) {
    if (pattern !== 'default' && lastPart.includes(pattern)) {
      utilityPrefix = prefix;
      break;
    }
  }

  // Handle special cases
  if (tokenType === 'color') {
    if (lastPart.includes('background') || lastPart === 'bg') {
      utilityPrefix = 'bg-';
    } else if (lastPart.includes('border')) {
      utilityPrefix = 'border-';
    } else if (lastPart.includes('text') || lastPart.includes('color')) {
      utilityPrefix = 'text-';
    }
  }

  // Generate the full Tailwind class
  // For font-size, we need the type hint syntax
  if (tokenType === 'fontSize') {
    return `text-(length:${cssVariable})`;
  }

  // Standard syntax: utility-(--css-variable)
  return `${utilityPrefix}(${cssVariable})`;
}

// Group tokens by component
function groupByComponent(tokens) {
  const grouped = {};

  for (const token of tokens) {
    const componentName = token.name.split('.')[0];
    if (!grouped[componentName]) {
      grouped[componentName] = {
        name: componentName,
        tokens: [],
      };
    }
    grouped[componentName].tokens.push(token);
  }

  return grouped;
}

// Generate markdown documentation
function generateMarkdown(tokenMap) {
  let md = `# Component Token Map

> Auto-generated by \`generate-token-map.js\`
> Last updated: ${new Date().toISOString()}

This document maps UI components to their design tokens, CSS variables, and Tailwind utility classes.

## Quick Reference

| Component | Token Count | Coverage Status |
|-----------|-------------|-----------------|
`;

  const components = Object.values(tokenMap.components);
  for (const component of components) {
    md += `| ${component.name} | ${component.tokens.length} | - |\n`;
  }

  md += `\n## Component Details\n\n`;

  for (const component of components) {
    md += `### ${component.name}\n\n`;
    md += `| Token | Type | CSS Variable | Tailwind Class |\n`;
    md += `|-------|------|--------------|----------------|\n`;

    for (const token of component.tokens) {
      const shortName = token.name.replace(`${component.name}.`, '');
      md += `| \`${shortName}\` | ${token.type} | \`${token.cssVariable}\` | \`${token.tailwindSyntax}\` |\n`;
    }

    md += `\n`;
  }

  md += `## Token Type Reference

### Color Tokens
- Background: \`bg-(--color-{component}-{property})\`
- Border: \`border-(--color-{component}-{property})\`
- Text: \`text-(--color-{component}-{property})\`

### Spacing Tokens
- Padding: \`p-(--spacing-{component}-{property})\`
- Gap: \`gap-(--spacing-{component}-{property})\`
- Rounded: \`rounded-(--spacing-{component}-{property})\`

### Typography Tokens
- Font Size: \`text-(length:--font-size-{component}-{property})\`
- Font Weight: \`font-(--font-weight-{component}-{property})\`
- Line Height: \`leading-(--line-height-{component}-{property})\`
- Letter Spacing: \`tracking-(--spacing-{component}-{property})\`

### Shadow Tokens
- Shadow: \`shadow-(--shadow-{component}-{property})\`

---

*Note: The \`text-(length:...)\` syntax is Tailwind CSS 4's type hint for disambiguating font-size from color.*
`;

  return md;
}

// Main function
function generateTokenMap() {
  console.log('Loading component tokens...');
  const tokens = loadComponentTokens();

  console.log('Extracting token metadata...');
  const allTokens = extractTokenMetadata(tokens);

  // Filter by component if specified
  let filteredTokens = allTokens;
  if (options.component) {
    filteredTokens = allTokens.filter(t => t.name.startsWith(options.component + '.'));
    console.log(`Filtered to ${options.component}: ${filteredTokens.length} tokens`);
  }

  console.log('Grouping tokens by component...');
  const grouped = groupByComponent(filteredTokens);

  const tokenMap = {
    generated: new Date().toISOString(),
    totalTokens: filteredTokens.length,
    totalComponents: Object.keys(grouped).length,
    components: grouped,
    tokens: filteredTokens,
  };

  // Write JSON output
  const outputPath = options.output || path.join(DIST_DIR, 'token-map.json');
  fs.writeFileSync(outputPath, JSON.stringify(tokenMap, null, 2));
  console.log(`✓ Token map written to: ${outputPath}`);

  // Write markdown if requested
  if (options.markdown) {
    const markdownContent = generateMarkdown(tokenMap);
    const mdPath = path.join(DOCS_DIR, 'tokens', 'component-token-map.md');

    // Ensure directory exists
    const mdDir = path.dirname(mdPath);
    if (!fs.existsSync(mdDir)) {
      fs.mkdirSync(mdDir, { recursive: true });
    }

    fs.writeFileSync(mdPath, markdownContent);
    console.log(`✓ Markdown documentation written to: ${mdPath}`);
  }

  // Print summary
  console.log('\nToken Map Summary:');
  console.log(`  Total tokens: ${tokenMap.totalTokens}`);
  console.log(`  Components: ${tokenMap.totalComponents}`);

  if (options.component) {
    const component = grouped[options.component];
    if (component) {
      console.log(`\n${options.component} tokens:`);
      for (const token of component.tokens) {
        console.log(`  ${token.name}`);
        console.log(`    CSS: ${token.cssVariable}`);
        console.log(`    Tailwind: ${token.tailwindSyntax}`);
      }
    }
  }

  return tokenMap;
}

// Run
generateTokenMap();
