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
function groupTokensByComponent(tokenNames) {
  const grouped = {};

  for (const name of tokenNames) {
    // Extract component name (first segment before the dot)
    const componentName = name.split('.')[0];
    if (!grouped[componentName]) {
      grouped[componentName] = [];
    }
    grouped[componentName].push(name);
  }

  return grouped;
}

// Scan UI components for token references
function scanComponentTokenUsage() {
  const usage = {};
  const componentFiles = findFiles(UI_SRC_DIR, '.tsx');

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

      // Convert CSS variable to token name
      const tokenName = cssVarToTokenName(cssVar);
      if (tokenName && !usage[componentName].tokensUsed.includes(tokenName)) {
        usage[componentName].tokensUsed.push(tokenName);
      }
    }
  }

  return usage;
}

// Convert CSS variable name to token name
// Example: --font-size-card-header-title-font-size -> card.header.title.font-size
function cssVarToTokenName(cssVar) {
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

  // Preserve known hyphenated suffixes that are part of token names
  // These are type-related suffixes that should stay hyphenated
  const preservedSuffixes = [
    'font-size', 'font-weight', 'line-height', 'letter-spacing',
    'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
    'padding-x', 'padding-y', 'margin-top', 'margin-bottom',
    'border-radius', 'border-width', 'max-width', 'min-width'
  ];

  // Convert hyphens to dots, but preserve known suffixes
  // Strategy: work backwards from the end to find preserved suffixes
  for (const suffix of preservedSuffixes) {
    if (name.endsWith(suffix)) {
      const prefix = name.slice(0, -(suffix.length + 1)); // -1 for the hyphen before suffix
      if (prefix) {
        return prefix.replace(/-/g, '.') + '.' + suffix;
      }
      return suffix;
    }
  }

  // No preserved suffix found, convert all hyphens to dots
  return name.replace(/-/g, '.');
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
  const componentUsage = scanComponentTokenUsage();
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

  for (const [component, definedTokens] of Object.entries(componentGroups)) {
    const usage = componentUsage[component];
    const usedCount = usage ? usage.tokensUsed.filter(t => definedTokens.includes(t)).length : 0;
    const coverage = definedTokens.length > 0 ? Math.round((usedCount / definedTokens.length) * 100) : 0;

    results.details.componentCoverage[component] = {
      defined: definedTokens.length,
      used: usedCount,
      coverage: `${coverage}%`,
    };

    const statusIcon = coverage === 100 ? '✓' : coverage >= 80 ? '○' : '✗';
    if (options.verbose || coverage < 100) {
      console.log(`  ${statusIcon} ${component}: ${usedCount}/${definedTokens.length} tokens used (${coverage}%)`);
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
