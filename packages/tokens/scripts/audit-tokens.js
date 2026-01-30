#!/usr/bin/env node
/**
 * Token Audit Script
 *
 * Analyzes token usage across the design system to identify:
 * - Unused tokens (defined but not referenced in components)
 * - Missing tokens (referenced in components but not defined)
 * - Naming convention violations (inconsistent patterns)
 * - Phantom tokens (tokens not grouped with their component)
 * - Duplicate/redundant tokens
 *
 * Usage:
 *   node scripts/audit-tokens.js [options]
 *
 * Options:
 *   --component <name>   Audit a specific component (e.g., --component card)
 *   --json               Output results as JSON
 *   --verbose            Show detailed information
 *   --fix-suggestions    Include suggested fixes for issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TOKENS_DIR = path.resolve(__dirname, '../io/sync');
const UI_SRC_DIR = path.resolve(__dirname, '../../ui/src');
const DIST_DIR = path.resolve(__dirname, '../dist');

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  component: null,
  json: args.includes('--json'),
  verbose: args.includes('--verbose'),
  fixSuggestions: args.includes('--fix-suggestions'),
};

const componentArgIndex = args.indexOf('--component');
if (componentArgIndex !== -1 && args[componentArgIndex + 1]) {
  options.component = args[componentArgIndex + 1];
}

// Utility functions
function log(message, level = 'info') {
  if (options.json) return;
  const prefix = {
    info: '\x1b[36mℹ\x1b[0m',
    success: '\x1b[32m✓\x1b[0m',
    warning: '\x1b[33m⚠\x1b[0m',
    error: '\x1b[31m✗\x1b[0m',
  };
  console.log(`${prefix[level] || ''} ${message}`);
}

function logSection(title) {
  if (options.json) return;
  console.log(`\n\x1b[1m${title}\x1b[0m`);
  console.log('─'.repeat(50));
}

// Recursive file finder (replaces glob)
function findFiles(dir, pattern, results = []) {
  if (!fs.existsSync(dir)) return results;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip test directories
      if (file === '__tests__' || file === 'test' || file === 'node_modules') {
        continue;
      }
      findFiles(filePath, pattern, results);
    } else if (file.endsWith(pattern) && !file.includes('.test.') && !file.includes('.stories.')) {
      results.push(filePath);
    }
  }

  return results;
}

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

// Load and parse token files
function loadTokens() {
  const tokens = {
    primitive: {},
    semantic: {},
    component: {},
  };

  try {
    const componentsPath = path.join(TOKENS_DIR, 'components.json');
    const semanticPath = path.join(TOKENS_DIR, 'semantic.json');
    const primitivePath = path.join(TOKENS_DIR, 'primitive.json');

    if (fs.existsSync(componentsPath)) {
      const data = JSON.parse(fs.readFileSync(componentsPath, 'utf-8'));
      tokens.component = extractVariables(data);
    }

    if (fs.existsSync(semanticPath)) {
      const data = JSON.parse(fs.readFileSync(semanticPath, 'utf-8'));
      tokens.semantic = extractVariables(data);
    }

    if (fs.existsSync(primitivePath)) {
      const data = JSON.parse(fs.readFileSync(primitivePath, 'utf-8'));
      tokens.primitive = extractVariables(data);
    }
  } catch (error) {
    log(`Error loading tokens: ${error.message}`, 'error');
    process.exit(1);
  }

  return tokens;
}

// Extract all token names from component tokens
function extractComponentTokenNames(componentTokens) {
  const tokenNames = [];

  function traverse(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object') {
        if (value.$type || value.$value || value.valuesByMode) {
          // This is a token definition
          tokenNames.push(fullKey);
        } else {
          // Nested object, continue traversing
          traverse(value, fullKey);
        }
      }
    }
  }

  traverse(componentTokens);
  return tokenNames;
}

// Group tokens by component prefix
// Handles hyphenated component names like "hover-card", "context-menu", etc.
function groupTokensByComponent(tokenNames) {
  const grouped = {};

  for (const name of tokenNames) {
    // Extract component name - handles both single names and hyphenated names
    // Token format: "component.property" or "component-name.property"
    // We need to identify the component prefix, which may contain hyphens
    const firstDotIndex = name.indexOf('.');
    const componentName = firstDotIndex > -1 ? name.substring(0, firstDotIndex) : name;

    if (!grouped[componentName]) {
      grouped[componentName] = [];
    }
    grouped[componentName].push(name);
  }

  return grouped;
}

// Scan UI components for token references
function scanComponentTokenUsage(definedTokenNames) {
  const usage = {};
  const componentFiles = findFiles(UI_SRC_DIR, '.tsx');

  // Create a lookup set for defined tokens
  const definedTokenSet = new Set(definedTokenNames);

  for (const filePath of componentFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(UI_SRC_DIR, filePath);
    const componentName = path.basename(filePath, '.tsx');

    // Match Tailwind 4 token references: --(type-token-name)
    // Patterns like: bg-(--color-card-background), gap-(--spacing-card-gap)
    const tokenPattern = /--([a-z]+-[a-z0-9-]+(?:-[a-z0-9-]+)*)/g;
    const matches = content.matchAll(tokenPattern);

    usage[componentName] = {
      file: relativePath,
      tokensUsed: [],
      rawMatches: [],
    };

    for (const match of matches) {
      const cssVar = `--${match[1]}`;
      usage[componentName].rawMatches.push(cssVar);

      // Convert CSS variable to token name, using defined tokens to resolve ambiguity
      const tokenName = cssVarToTokenName(cssVar, definedTokenSet);
      if (tokenName && !usage[componentName].tokensUsed.includes(tokenName)) {
        usage[componentName].tokensUsed.push(tokenName);
      }
    }
  }

  return usage;
}

// Map component file names to token prefixes
// Handles cases where file name differs from token prefix (e.g., hover-card.tsx uses hover-card.* tokens)
function getComponentTokenPrefix(componentFileName) {
  // Direct mapping - file name IS the token prefix for hyphenated components
  return componentFileName;
}

// Convert CSS variable name to token name
// Example: --font-size-card-header-title-font-size -> card.header.title.font-size
// Example: --color-hover-card-background -> hover-card.background
// Example: --font-size-badge-font-size-sm -> badge.font-size.sm
function cssVarToTokenName(cssVar, definedTokenSet = null) {
  // Remove leading --
  let name = cssVar.replace(/^--/, '');

  // Remove type prefix (color-, spacing-, font-size-, etc.)
  const typePrefixes = [
    'color-', 'spacing-', 'font-size-', 'font-weight-',
    'line-height-', 'shadow-', 'border-radius-', 'duration-'
  ];

  for (const prefix of typePrefixes) {
    if (name.startsWith(prefix)) {
      name = name.substring(prefix.length);
      break;
    }
  }

  // Known hyphenated component names that should be preserved
  const hyphenatedComponents = [
    'hover-card', 'context-menu', 'dropdown-menu', 'navigation-menu',
    'radio-group', 'scroll-area', 'aspect-ratio', 'alert-dialog',
    'toggle-group', 'card-grid', 'feature-grid'
  ];

  // Known hyphenated property names that should be preserved
  // These can appear anywhere in the token path, not just at the end
  const preservedTerms = [
    'font-size', 'font-weight', 'line-height', 'letter-spacing',
    'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
    'padding-x', 'padding-y', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
    'margin-x', 'margin-y', 'border-radius', 'border-width', 'border-color',
    'max-width', 'min-width', 'max-height', 'min-height',
    'background-hover', 'background-active', 'background-checked',
    'text-hover', 'text-active', 'text-focus', 'text-disabled', 'text-checked', 'text-pressed', 'text-open', 'text-selected',
    'border-hover', 'border-focus', 'border-checked', 'border-error',
    'close-button', 'item-indicator', 'nav-background', 'nav-border', 'nav-hover', 'nav-text-hover',
    'group-heading', 'item-selected', 'item-text-selected', 'content-text',
    'trigger-focus', 'trigger-text', 'trigger-text-focus', 'trigger-open', 'trigger-text-open',
    'trigger-hover', 'trigger-text-hover', 'trigger-pressed', 'trigger-disabled', 'trigger-text-disabled',
    'icon-hover', 'icon-open', 'icon-disabled', 'content-border', 'content-background',
    'item-focus', 'item-text-focus', 'item-hover', 'item-text-hover',
    'fallback-background', 'fallback-text', 'link-hover',
    'thumb-border', 'track-border', 'header-text', 'footer-background',
    'row-hover', 'row-selected', 'action-hover', 'close-hover',
    'day-hover', 'day-text-hover', 'day-selected', 'day-text-selected',
    'rounded-full', 'rounded-sm', 'required-margin-left',
    'content-radius', 'item-radius', 'separator-margin-x', 'separator-margin-y',
    'list-gap', 'container-gap', 'item-gap', 'item-padding', 'scrollbar-padding'
  ];

  // Check if the name starts with a hyphenated component name
  let componentPrefix = null;
  let restOfName = name;

  for (const comp of hyphenatedComponents) {
    if (name.startsWith(comp + '-')) {
      componentPrefix = comp;
      restOfName = name.substring(comp.length + 1); // +1 for the hyphen
      break;
    }
  }

  // Process restOfName by finding and preserving known terms
  // Strategy: split by hyphens and rejoin, preserving multi-word terms
  const segments = restOfName.split('-');
  const result = [];
  let i = 0;

  while (i < segments.length) {
    // Try to match multi-word preserved terms (longest first)
    let matched = false;

    for (let len = 4; len >= 2; len--) {
      if (i + len <= segments.length) {
        const candidate = segments.slice(i, i + len).join('-');
        if (preservedTerms.includes(candidate)) {
          result.push(candidate);
          i += len;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      result.push(segments[i]);
      i++;
    }
  }

  // Combine with dots
  const convertedRest = result.join('.');

  // Combine component prefix with the rest
  let tokenName;
  if (componentPrefix) {
    tokenName = componentPrefix + '.' + convertedRest;
  } else {
    tokenName = convertedRest;
  }

  // If we have defined tokens, try to find an exact match
  // This handles cases where our heuristic conversion might be wrong
  if (definedTokenSet && !definedTokenSet.has(tokenName)) {
    // Try alternative conversions
    // The raw name after prefix removal
    const rawAfterPrefix = name;

    // Generate alternative token names by trying different segmentation
    const alternatives = generateAlternativeTokenNames(rawAfterPrefix, hyphenatedComponents);

    for (const alt of alternatives) {
      if (definedTokenSet.has(alt)) {
        return alt;
      }
    }
  }

  return tokenName;
}

// Generate alternative token name interpretations
function generateAlternativeTokenNames(rawName, hyphenatedComponents) {
  const alternatives = [];
  const segments = rawName.split('-');

  // Try different ways of splitting hyphens into dots
  // For a name like "checkbox-border-color", try:
  // - checkbox.border.color
  // - checkbox.border-color
  // - checkbox-border.color

  function generateCombinations(segs, index, current) {
    if (index >= segs.length) {
      alternatives.push(current.join('.'));
      return;
    }

    // Option 1: Add this segment as its own dot-separated part
    generateCombinations(segs, index + 1, [...current, segs[index]]);

    // Option 2: Combine with previous segment using hyphen (if there is a previous)
    if (current.length > 0) {
      const prev = current[current.length - 1];
      const combined = prev + '-' + segs[index];
      generateCombinations(segs, index + 1, [...current.slice(0, -1), combined]);
    }
  }

  // Handle hyphenated component prefix
  for (const comp of hyphenatedComponents) {
    if (rawName.startsWith(comp + '-')) {
      const rest = rawName.substring(comp.length + 1);
      const restSegs = rest.split('-');
      const subAlts = [];

      function genSubCombinations(segs, idx, curr) {
        if (idx >= segs.length) {
          subAlts.push(comp + '.' + curr.join('.'));
          return;
        }
        genSubCombinations(segs, idx + 1, [...curr, segs[idx]]);
        if (curr.length > 0) {
          const prev = curr[curr.length - 1];
          genSubCombinations(segs, idx + 1, [...curr.slice(0, -1), prev + '-' + segs[idx]]);
        }
      }

      genSubCombinations(restSegs, 0, []);
      alternatives.push(...subAlts);
      return alternatives;
    }
  }

  generateCombinations(segments, 0, []);
  return alternatives;
}

// Analyze naming conventions
function analyzeNamingConventions(tokenNames) {
  const issues = [];
  const componentGroups = groupTokensByComponent(tokenNames);

  for (const [component, tokens] of Object.entries(componentGroups)) {
    // Check for mixed naming patterns within the same component
    const hasDotsInMiddle = tokens.some(t => {
      const parts = t.split('.');
      return parts.length > 2;
    });
    const hasHyphensInMiddle = tokens.some(t => {
      const parts = t.split('.');
      return parts.some(p => p.includes('-'));
    });

    if (hasDotsInMiddle && hasHyphensInMiddle) {
      const dotExample = tokens.find(t => t.split('.').length > 2);
      const hyphenExample = tokens.find(t => {
        const parts = t.split('.');
        return parts.some(p => p.includes('-'));
      });

      issues.push({
        type: 'mixed-naming',
        component,
        message: `Mixed naming conventions in "${component}" tokens`,
        examples: { dotNotation: dotExample, hyphenNotation: hyphenExample },
        suggestion: 'Standardize on dot notation (e.g., card.header.gap instead of card.header-gap)'
      });
    }
  }

  return issues;
}

// Detect phantom tokens (tokens placed outside their component group)
function detectPhantomTokens(tokenNames, componentTokens) {
  const phantoms = [];
  const componentGroups = groupTokensByComponent(tokenNames);

  // Get line numbers for each token
  const componentsPath = path.join(TOKENS_DIR, 'components.json');
  const fileContent = fs.readFileSync(componentsPath, 'utf-8');
  const lines = fileContent.split('\n');

  const tokenLineNumbers = {};
  for (const token of tokenNames) {
    const searchPattern = `"${token}"`;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchPattern)) {
        tokenLineNumbers[token] = i + 1;
        break;
      }
    }
  }

  // For each component, check if all its tokens are grouped together
  for (const [component, tokens] of Object.entries(componentGroups)) {
    if (tokens.length < 2) continue;

    const lineNums = tokens
      .map(t => ({ token: t, line: tokenLineNumbers[t] }))
      .filter(t => t.line)
      .sort((a, b) => a.line - b.line);

    if (lineNums.length < 2) continue;

    // Find the main group (majority of tokens)
    const mainGroupStart = lineNums[0].line;
    const mainGroupEnd = lineNums[Math.min(lineNums.length - 1, Math.floor(lineNums.length * 0.8))].line;
    const expectedRange = (mainGroupEnd - mainGroupStart) + 100;

    for (const { token, line } of lineNums) {
      const distanceFromGroup = Math.min(
        Math.abs(line - mainGroupStart),
        Math.abs(line - mainGroupEnd)
      );

      if (distanceFromGroup > expectedRange) {
        phantoms.push({
          token,
          line,
          component,
          mainGroupRange: `${mainGroupStart}-${mainGroupEnd}`,
          message: `Token "${token}" at line ${line} is far from main "${component}" group (lines ${mainGroupStart}-${mainGroupEnd})`
        });
      }
    }
  }

  return phantoms;
}

// Find unused tokens
function findUnusedTokens(definedTokens, componentUsage) {
  const allUsedTokens = new Set();

  for (const component of Object.values(componentUsage)) {
    for (const token of component.tokensUsed) {
      allUsedTokens.add(token);
    }
  }

  const unused = definedTokens.filter(token => !allUsedTokens.has(token));
  return unused;
}

// Find missing tokens (referenced but not defined)
function findMissingTokens(definedTokens, componentUsage, componentFilter = null) {
  const definedSet = new Set(definedTokens);
  const missing = [];

  for (const [componentName, component] of Object.entries(componentUsage)) {
    // If filtering by component, only check that component's usage
    if (componentFilter && componentName !== componentFilter) {
      continue;
    }

    for (const token of component.tokensUsed) {
      // If filtering by component, only report missing tokens for that component prefix
      if (componentFilter && !token.startsWith(componentFilter + '.')) {
        continue;
      }

      if (!definedSet.has(token)) {
        missing.push({
          token,
          referencedIn: componentName,
          file: component.file
        });
      }
    }
  }

  return missing;
}

// Main audit function
async function runAudit() {
  const results = {
    summary: {
      totalTokens: 0,
      totalComponents: 0,
      unusedTokens: 0,
      missingTokens: 0,
      namingIssues: 0,
      phantomTokens: 0,
    },
    details: {
      unusedTokens: [],
      missingTokens: [],
      namingIssues: [],
      phantomTokens: [],
      componentCoverage: {},
    }
  };

  log('Loading tokens...', 'info');
  const tokens = loadTokens();

  log('Extracting component token names...', 'info');
  const tokenNames = extractComponentTokenNames(tokens.component);
  results.summary.totalTokens = tokenNames.length;

  // Filter by component if specified
  let filteredTokens = tokenNames;
  if (options.component) {
    filteredTokens = tokenNames.filter(t => t.startsWith(options.component + '.'));
    log(`Filtering to ${options.component} tokens: ${filteredTokens.length} found`, 'info');
  }

  log('Scanning UI components for token usage...', 'info');
  const componentUsage = scanComponentTokenUsage(tokenNames);
  results.summary.totalComponents = Object.keys(componentUsage).length;

  // Run analyses
  logSection('Unused Tokens');
  const unusedTokens = findUnusedTokens(filteredTokens, componentUsage);
  results.details.unusedTokens = unusedTokens;
  results.summary.unusedTokens = unusedTokens.length;

  if (unusedTokens.length === 0) {
    log('No unused tokens found', 'success');
  } else {
    log(`Found ${unusedTokens.length} unused tokens:`, 'warning');
    for (const token of unusedTokens.slice(0, 20)) {
      console.log(`  - ${token}`);
    }
    if (unusedTokens.length > 20) {
      console.log(`  ... and ${unusedTokens.length - 20} more`);
    }
  }

  logSection('Missing Tokens');
  const missingTokens = findMissingTokens(tokenNames, componentUsage, options.component);
  results.details.missingTokens = missingTokens;
  results.summary.missingTokens = missingTokens.length;

  if (missingTokens.length === 0) {
    log('No missing tokens found', 'success');
  } else {
    log(`Found ${missingTokens.length} missing tokens:`, 'error');
    for (const { token, referencedIn } of missingTokens.slice(0, 20)) {
      console.log(`  - ${token} (referenced in ${referencedIn})`);
    }
  }

  logSection('Naming Convention Issues');
  const namingIssues = analyzeNamingConventions(filteredTokens);
  results.details.namingIssues = namingIssues;
  results.summary.namingIssues = namingIssues.length;

  if (namingIssues.length === 0) {
    log('No naming convention issues found', 'success');
  } else {
    log(`Found ${namingIssues.length} naming issues:`, 'warning');
    for (const issue of namingIssues) {
      console.log(`  - ${issue.message}`);
      if (options.verbose && issue.examples) {
        console.log(`    Dot notation: ${issue.examples.dotNotation}`);
        console.log(`    Hyphen notation: ${issue.examples.hyphenNotation}`);
      }
      if (options.fixSuggestions && issue.suggestion) {
        console.log(`    Suggestion: ${issue.suggestion}`);
      }
    }
  }

  logSection('Phantom Tokens');
  const phantomTokens = detectPhantomTokens(filteredTokens, tokens.component);
  results.details.phantomTokens = phantomTokens;
  results.summary.phantomTokens = phantomTokens.length;

  if (phantomTokens.length === 0) {
    log('No phantom tokens found', 'success');
  } else {
    log(`Found ${phantomTokens.length} phantom tokens:`, 'warning');
    for (const phantom of phantomTokens) {
      console.log(`  - ${phantom.message}`);
    }
  }

  // Component coverage summary
  logSection('Component Token Coverage');
  const componentGroups = groupTokensByComponent(filteredTokens);

  for (const [tokenPrefix, definedTokens] of Object.entries(componentGroups)) {
    // Find the component file that uses these tokens
    // Token prefix matches component file name (e.g., "hover-card" tokens in hover-card.tsx)
    const usage = componentUsage[tokenPrefix];

    // Count tokens used - check both from the component's own usage and cross-component usage
    let usedCount = 0;
    const usedTokensInComponent = new Set();

    if (usage) {
      // Direct usage in the matching component file
      for (const token of usage.tokensUsed) {
        if (definedTokens.includes(token)) {
          usedTokensInComponent.add(token);
        }
      }
    }

    // Also check if any other component uses these tokens (e.g., shared tokens)
    for (const [otherComponent, otherUsage] of Object.entries(componentUsage)) {
      for (const token of otherUsage.tokensUsed) {
        if (definedTokens.includes(token)) {
          usedTokensInComponent.add(token);
        }
      }
    }

    usedCount = usedTokensInComponent.size;
    const coverage = definedTokens.length > 0 ? Math.round((usedCount / definedTokens.length) * 100) : 0;

    results.details.componentCoverage[tokenPrefix] = {
      defined: definedTokens.length,
      used: usedCount,
      coverage: `${coverage}%`,
      unusedTokens: definedTokens.filter(t => !usedTokensInComponent.has(t)),
    };

    const statusIcon = coverage === 100 ? '✓' : coverage >= 80 ? '○' : '✗';
    if (options.verbose || coverage < 100) {
      console.log(`  ${statusIcon} ${tokenPrefix}: ${usedCount}/${definedTokens.length} tokens used (${coverage}%)`);
      if (options.verbose && coverage < 100) {
        const unused = definedTokens.filter(t => !usedTokensInComponent.has(t));
        for (const t of unused.slice(0, 5)) {
          console.log(`      - ${t} (unused)`);
        }
        if (unused.length > 5) {
          console.log(`      ... and ${unused.length - 5} more`);
        }
      }
    }
  }

  // Final summary
  logSection('Audit Summary');
  console.log(`  Total component tokens: ${results.summary.totalTokens}`);
  console.log(`  UI components scanned: ${results.summary.totalComponents}`);
  console.log(`  Unused tokens: ${results.summary.unusedTokens}`);
  console.log(`  Missing tokens: ${results.summary.missingTokens}`);
  console.log(`  Naming issues: ${results.summary.namingIssues}`);
  console.log(`  Phantom tokens: ${results.summary.phantomTokens}`);

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  }

  // Exit with error code if issues found
  const hasIssues = results.summary.missingTokens > 0 || results.summary.phantomTokens > 0;
  return hasIssues ? 1 : 0;
}

// Run the audit
runAudit()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Audit failed:', error);
    process.exit(1);
  });
