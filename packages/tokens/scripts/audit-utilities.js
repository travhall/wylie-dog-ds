#!/usr/bin/env node
/**
 * Utility Audit Script
 *
 * Scans UI components to find hardcoded Tailwind utilities that should be tokenized.
 * Identifies values like colors, spacing, font sizes, opacity, letter-spacing, etc.
 * that are using Tailwind defaults instead of design tokens.
 *
 * Usage:
 *   node scripts/audit-utilities.js [options]
 *
 * Options:
 *   --component <name>   Audit a specific component
 *   --verbose            Show all matches including allowed utilities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UI_SRC_DIR = path.resolve(__dirname, '../../ui/src');

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  component: null,
  verbose: args.includes('--verbose'),
};

const componentArgIndex = args.indexOf('--component');
if (componentArgIndex !== -1 && args[componentArgIndex + 1]) {
  options.component = args[componentArgIndex + 1];
}

// Utilities that are structural/layout and should be kept as-is
const ALLOWED_UTILITIES = new Set([
  // Layout & Display
  'flex', 'inline-flex', 'grid', 'inline-grid', 'block', 'inline-block', 'inline', 'hidden',
  'contents', 'flow-root', 'list-item',

  // Positioning
  'absolute', 'relative', 'fixed', 'sticky', 'static',
  'inset-0', 'inset-x-0', 'inset-y-0', 'top-0', 'right-0', 'bottom-0', 'left-0',

  // Flexbox & Grid alignment
  'items-start', 'items-center', 'items-end', 'items-baseline', 'items-stretch',
  'justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly',
  'self-start', 'self-center', 'self-end', 'self-stretch', 'self-auto',
  'place-items-center', 'place-content-center',
  'flex-row', 'flex-col', 'flex-row-reverse', 'flex-col-reverse',
  'flex-wrap', 'flex-nowrap', 'flex-wrap-reverse',
  'flex-1', 'flex-auto', 'flex-initial', 'flex-none',
  'grow', 'grow-0', 'shrink', 'shrink-0',

  // Sizing
  'w-full', 'w-auto', 'w-screen', 'w-min', 'w-max', 'w-fit',
  'h-full', 'h-auto', 'h-screen', 'h-min', 'h-max', 'h-fit',
  'min-w-0', 'min-w-full', 'min-w-min', 'min-w-max', 'min-w-fit',
  'min-h-0', 'min-h-full', 'min-h-screen', 'min-h-min', 'min-h-max', 'min-h-fit',
  'max-w-none', 'max-w-full', 'max-w-min', 'max-w-max', 'max-w-fit',
  'max-h-none', 'max-h-full', 'max-h-screen', 'max-h-min', 'max-h-max', 'max-h-fit',

  // Overflow
  'overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll',
  'overflow-x-auto', 'overflow-x-hidden', 'overflow-x-visible', 'overflow-x-scroll',
  'overflow-y-auto', 'overflow-y-hidden', 'overflow-y-visible', 'overflow-y-scroll',

  // Transitions & Animations
  'transition', 'transition-all', 'transition-colors', 'transition-opacity',
  'transition-shadow', 'transition-transform', 'transition-none',
  'ease-linear', 'ease-in', 'ease-out', 'ease-in-out',
  'animate-in', 'animate-out', 'animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce',

  // Transforms
  'transform', 'transform-none', 'transform-gpu',
  'origin-center', 'origin-top', 'origin-bottom', 'origin-left', 'origin-right',
  'translate-x-0', 'translate-y-0', '-translate-x-0', '-translate-y-0',
  'rotate-0', 'scale-100',

  // Visibility & Pointer
  'visible', 'invisible', 'collapse',
  'pointer-events-none', 'pointer-events-auto',
  'select-none', 'select-text', 'select-all', 'select-auto',
  'touch-none', 'touch-auto', 'touch-manipulation',

  // Cursor
  'cursor-default', 'cursor-pointer', 'cursor-wait', 'cursor-text',
  'cursor-move', 'cursor-not-allowed', 'cursor-grab', 'cursor-grabbing',

  // Text alignment & wrapping
  'text-left', 'text-center', 'text-right', 'text-justify',
  'whitespace-normal', 'whitespace-nowrap', 'whitespace-pre', 'whitespace-pre-line', 'whitespace-pre-wrap',
  'break-normal', 'break-words', 'break-all', 'break-keep',
  'truncate', 'text-ellipsis', 'text-clip',
  'wrap-break-word',

  // Font style & weight (structural)
  'font-normal', 'font-medium', 'font-semibold', 'font-bold',
  'italic', 'not-italic',
  'uppercase', 'lowercase', 'capitalize', 'normal-case',
  'underline', 'overline', 'line-through', 'no-underline',

  // List style
  'list-none', 'list-disc', 'list-decimal',
  'list-inside', 'list-outside',

  // Table
  'table', 'table-auto', 'table-fixed', 'table-caption', 'table-cell',
  'table-column', 'table-column-group', 'table-footer-group', 'table-header-group',
  'table-row-group', 'table-row', 'border-collapse', 'border-separate',

  // Border style
  'border', 'border-t', 'border-r', 'border-b', 'border-l',
  'border-x', 'border-y',
  'border-solid', 'border-dashed', 'border-dotted', 'border-double', 'border-none',
  'border-transparent', 'border-l-transparent', 'border-t-transparent',

  // Outline
  'outline', 'outline-none', 'outline-dashed', 'outline-dotted', 'outline-double',

  // Ring
  'ring', 'ring-inset',

  // Aspect ratio
  'aspect-auto', 'aspect-square', 'aspect-video',

  // Object fit & position
  'object-contain', 'object-cover', 'object-fill', 'object-none', 'object-scale-down',
  'object-bottom', 'object-center', 'object-left', 'object-right', 'object-top',

  // Z-index (structural)
  'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50', 'z-auto',

  // Screen reader
  'sr-only', 'not-sr-only',

  // SVG
  'fill-current', 'stroke-current',

  // Misc structural
  'appearance-none', 'resize-none', 'resize', 'resize-x', 'resize-y',
  'scroll-auto', 'scroll-smooth',
  'snap-start', 'snap-end', 'snap-center', 'snap-align-none',
  'snap-none', 'snap-x', 'snap-y', 'snap-both', 'snap-mandatory', 'snap-proximity',
  'will-change-auto', 'will-change-scroll', 'will-change-contents', 'will-change-transform',

  // Focus utilities (structural)
  'focus:outline-none', 'focus-visible:outline-none',

  // Leading (keep leading-none for line-height reset)
  'leading-none',

  // Vertical alignment
  'align-baseline', 'align-top', 'align-middle', 'align-bottom', 'align-text-top', 'align-text-bottom',
]);

// Patterns that indicate tokenized values (should be skipped)
const TOKEN_PATTERNS = [
  /\(--[a-z-]+\)/, // Tailwind 4 token syntax: bg-(--color-xxx)
  /\[var\(--[a-z-]+\)\]/, // Arbitrary value with CSS var
  /\[--[a-z-]+\]/, // Direct CSS var reference
];

// Patterns that should be tokenized (these are hardcoded values)
const SHOULD_TOKENIZE_PATTERNS = [
  // Colors (hardcoded)
  { pattern: /\b(bg|text|border|ring|outline|fill|stroke|from|via|to|accent|caret|decoration)-(black|white|transparent|current|inherit)/g, category: 'color', severity: 'low' },
  { pattern: /\b(bg|text|border|ring|outline|fill|stroke|from|via|to|accent|caret|decoration)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/g, category: 'color', severity: 'high' },

  // Spacing (hardcoded px values)
  { pattern: /\b(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y|inset|top|right|bottom|left)-(\d+\.?\d*|\[\d+px\])/g, category: 'spacing', severity: 'high' },
  { pattern: /\b(w|h|min-w|min-h|max-w|max-h)-(\d+\.?\d*|\[\d+px\])/g, category: 'sizing', severity: 'high' },

  // Font size (hardcoded)
  { pattern: /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/g, category: 'font-size', severity: 'high' },

  // Font weight (should use semantic weights from tokens)
  // Note: font-medium, font-semibold, font-bold are allowed as structural

  // Letter spacing
  { pattern: /\btracking-(tighter|tight|normal|wide|wider|widest)/g, category: 'letter-spacing', severity: 'high' },

  // Line height (except leading-none which is structural)
  { pattern: /\bleading-(tight|snug|normal|relaxed|loose|\d+)/g, category: 'line-height', severity: 'medium' },

  // Border radius
  { pattern: /\brounded-(none|sm|md|lg|xl|2xl|3xl|full)/g, category: 'border-radius', severity: 'high' },
  { pattern: /\brounded(?:-(t|r|b|l|tl|tr|br|bl))?-?(none|sm|md|lg|xl|2xl|3xl|full)?(?!\()/g, category: 'border-radius', severity: 'medium' },

  // Border width
  { pattern: /\bborder-(0|2|4|8)/g, category: 'border-width', severity: 'high' },

  // Shadow
  { pattern: /\bshadow-(sm|md|lg|xl|2xl|inner|none)/g, category: 'shadow', severity: 'high' },
  { pattern: /\bshadow(?!\-)/g, category: 'shadow', severity: 'medium' },

  // Opacity
  { pattern: /\bopacity-(\d+)/g, category: 'opacity', severity: 'medium' },

  // Ring width
  { pattern: /\bring-(\d+)/g, category: 'ring-width', severity: 'medium' },

  // Ring offset
  { pattern: /\bring-offset-(\d+)/g, category: 'ring-offset', severity: 'medium' },

  // Duration
  { pattern: /\bduration-(\d+)/g, category: 'duration', severity: 'medium' },

  // Delay
  { pattern: /\bdelay-(\d+)/g, category: 'delay', severity: 'low' },

  // Blur
  { pattern: /\bblur-(none|sm|md|lg|xl|2xl|3xl)/g, category: 'blur', severity: 'low' },

  // Backdrop blur
  { pattern: /\bbackdrop-blur-(none|sm|md|lg|xl|2xl|3xl)/g, category: 'backdrop-blur', severity: 'low' },

  // Divide
  { pattern: /\bdivide-(x|y)-(\d+)/g, category: 'divide', severity: 'medium' },

  // Underline offset
  { pattern: /\bunderline-offset-(\d+)/g, category: 'underline-offset', severity: 'low' },

  // Z-index (high values should be tokenized)
  { pattern: /\bz-(\d{3,})/g, category: 'z-index', severity: 'low' },
];

// Find files recursively
function findFiles(dir, pattern, results = []) {
  if (!fs.existsSync(dir)) return results;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
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

// Check if a utility is allowed (structural)
function isAllowedUtility(utility) {
  // Remove any state prefixes (hover:, focus:, etc.)
  const baseUtility = utility.replace(/^(hover|focus|focus-visible|focus-within|active|disabled|group-hover|data-\[[^\]]+\]):/, '');
  return ALLOWED_UTILITIES.has(baseUtility);
}

// Check if a utility uses a token
function usesToken(utility) {
  return TOKEN_PATTERNS.some(pattern => pattern.test(utility));
}

// Extract class names from content
function extractClassNames(content) {
  const classNames = [];

  // Match className={cn(...)} patterns
  const cnPattern = /cn\s*\(\s*([^)]+(?:\([^)]*\)[^)]*)*)\s*\)/g;
  let match;

  while ((match = cnPattern.exec(content)) !== null) {
    const cnContent = match[1];
    // Extract string literals
    const stringPattern = /"([^"]+)"|'([^']+)'|`([^`]+)`/g;
    let stringMatch;
    while ((stringMatch = stringPattern.exec(cnContent)) !== null) {
      const classes = stringMatch[1] || stringMatch[2] || stringMatch[3];
      classNames.push(...classes.split(/\s+/).filter(Boolean));
    }
  }

  // Also match direct className="..." patterns
  const directPattern = /className\s*=\s*["']([^"']+)["']/g;
  while ((match = directPattern.exec(content)) !== null) {
    classNames.push(...match[1].split(/\s+/).filter(Boolean));
  }

  return classNames;
}

// Audit a single file
function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const componentName = path.basename(filePath, '.tsx');

  const issues = [];
  const classNames = extractClassNames(content);

  for (const className of classNames) {
    // Skip if it uses a token
    if (usesToken(className)) continue;

    // Skip if it's an allowed structural utility
    if (isAllowedUtility(className)) continue;

    // Check against patterns that should be tokenized
    for (const { pattern, category, severity } of SHOULD_TOKENIZE_PATTERNS) {
      pattern.lastIndex = 0; // Reset regex state
      if (pattern.test(className)) {
        issues.push({
          className,
          category,
          severity,
          component: componentName,
        });
        break;
      }
    }
  }

  return {
    component: componentName,
    file: path.relative(UI_SRC_DIR, filePath),
    issues,
    totalClasses: classNames.length,
  };
}

// Main audit function
function runAudit() {
  console.log('\n\x1b[1mUI Component Utility Audit\x1b[0m');
  console.log('─'.repeat(60));
  console.log('Scanning for hardcoded values that should be tokenized...\n');

  const componentFiles = findFiles(UI_SRC_DIR, '.tsx');
  const results = [];
  const categorySummary = {};

  for (const filePath of componentFiles) {
    const componentName = path.basename(filePath, '.tsx');

    // Filter by component if specified
    if (options.component && componentName !== options.component) {
      continue;
    }

    const result = auditFile(filePath);
    if (result.issues.length > 0) {
      results.push(result);

      // Build category summary
      for (const issue of result.issues) {
        if (!categorySummary[issue.category]) {
          categorySummary[issue.category] = [];
        }
        categorySummary[issue.category].push({
          className: issue.className,
          component: issue.component,
          severity: issue.severity,
        });
      }
    }
  }

  // Sort results by issue count
  results.sort((a, b) => b.issues.length - a.issues.length);

  // Print results by component
  console.log('\x1b[1mIssues by Component\x1b[0m');
  console.log('─'.repeat(60));

  if (results.length === 0) {
    console.log('\x1b[32m✓ No hardcoded utilities found!\x1b[0m\n');
  } else {
    for (const result of results) {
      const highCount = result.issues.filter(i => i.severity === 'high').length;
      const mediumCount = result.issues.filter(i => i.severity === 'medium').length;
      const lowCount = result.issues.filter(i => i.severity === 'low').length;

      console.log(`\n\x1b[33m${result.component}.tsx\x1b[0m (${result.issues.length} issues)`);

      // Group by category
      const byCategory = {};
      for (const issue of result.issues) {
        if (!byCategory[issue.category]) {
          byCategory[issue.category] = [];
        }
        byCategory[issue.category].push(issue.className);
      }

      for (const [category, classes] of Object.entries(byCategory)) {
        const uniqueClasses = [...new Set(classes)];
        console.log(`  ${category}: ${uniqueClasses.join(', ')}`);
      }
    }
  }

  // Print category summary
  console.log('\n\x1b[1mSummary by Category\x1b[0m');
  console.log('─'.repeat(60));

  const sortedCategories = Object.entries(categorySummary)
    .sort((a, b) => b[1].length - a[1].length);

  for (const [category, issues] of sortedCategories) {
    const uniqueValues = [...new Set(issues.map(i => i.className))];
    const highCount = issues.filter(i => i.severity === 'high').length;

    const severityIndicator = highCount > 0 ? '\x1b[31m●\x1b[0m' : '\x1b[33m○\x1b[0m';
    console.log(`${severityIndicator} ${category}: ${issues.length} occurrences (${uniqueValues.length} unique values)`);

    if (options.verbose) {
      console.log(`    Values: ${uniqueValues.slice(0, 10).join(', ')}${uniqueValues.length > 10 ? '...' : ''}`);
    }
  }

  // Print totals
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const highSeverity = Object.values(categorySummary).flat().filter(i => i.severity === 'high').length;
  const mediumSeverity = Object.values(categorySummary).flat().filter(i => i.severity === 'medium').length;

  console.log('\n\x1b[1mTotals\x1b[0m');
  console.log('─'.repeat(60));
  console.log(`  Components with issues: ${results.length}`);
  console.log(`  Total hardcoded utilities: ${totalIssues}`);
  console.log(`  High severity: ${highSeverity}`);
  console.log(`  Medium severity: ${mediumSeverity}`);
  console.log(`  Low severity: ${totalIssues - highSeverity - mediumSeverity}`);

  // Recommendations
  console.log('\n\x1b[1mRecommendations\x1b[0m');
  console.log('─'.repeat(60));

  if (categorySummary['letter-spacing']) {
    console.log('• Create letter-spacing tokens for tracking values');
  }
  if (categorySummary['opacity']) {
    console.log('• Create opacity tokens for disabled states, hover states, etc.');
  }
  if (categorySummary['spacing'] || categorySummary['sizing']) {
    console.log('• Replace hardcoded spacing/sizing with component tokens');
  }
  if (categorySummary['shadow']) {
    console.log('• Create shadow tokens for elevation levels');
  }
  if (categorySummary['border-radius']) {
    console.log('• Ensure all border-radius values use tokens');
  }
  if (categorySummary['duration']) {
    console.log('• Create animation duration tokens');
  }

  console.log('');

  return totalIssues > 0 ? 1 : 0;
}

// Run the audit
process.exit(runAudit());
