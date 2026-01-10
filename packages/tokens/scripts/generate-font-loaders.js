// scripts/generate-font-loaders.js
import fs from 'fs';
import path from 'path';

/**
 * Generates Next.js font loader configuration from design tokens
 * Reads font family tokens with $extensions.com.wyliedog.fontSource metadata
 * and creates TypeScript files for Next.js font loading
 */

/**
 * Parse @fontSource(...) pattern from $description field
 * Example: @fontSource(provider:google,weights:400-700,subsets:latin,display:swap)
 */
function parseFontSourceDescription(description) {
  if (!description || typeof description !== 'string') return null;

  const match = description.match(/@fontSource\((.*)\)/);
  if (!match) return null;

  const content = match[1];
  const config = {};

  // Split by commas, but handle nested arrays
  let currentKey = '';
  let currentValue = '';
  let depth = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '[') depth++;
    if (char === ']') depth--;

    if (char === ':' && depth === 0 && !currentKey) {
      currentKey = currentValue.trim();
      currentValue = '';
    } else if (char === ',' && depth === 0) {
      // End of key:value pair
      if (currentKey) {
        config[currentKey] = parseValue(currentKey, currentValue.trim());
        currentKey = '';
        currentValue = '';
      }
    } else {
      currentValue += char;
    }
  }

  // Handle last pair
  if (currentKey && currentValue) {
    config[currentKey] = parseValue(currentKey, currentValue.trim());
  }

  return Object.keys(config).length > 0 ? config : null;
}

/**
 * Parse individual values based on key
 */
function parseValue(key, value) {
  // Handle arrays (e.g., weights:400-700-800)
  if (key === 'weights' && value.includes('-')) {
    return value.split('-').map(Number);
  }

  if (key === 'subsets') {
    return value.includes('-') ? value.split('-') : [value];
  }

  // Handle JSON arrays (e.g., fonts:[{...},{...}])
  if (key === 'fonts' && value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn(`Failed to parse fonts array: ${value}`);
      return [];
    }
  }

  // Handle booleans
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Handle numbers
  if (!isNaN(value) && value !== '') return Number(value);

  // Return as string
  return value;
}

/**
 * Format JavaScript object without quoted keys for Next.js font config
 */
function formatJSObject(obj, indent = 2) {
  const indentStr = ' '.repeat(indent);
  const entries = Object.entries(obj).map(([key, value]) => {
    let formattedValue;
    if (Array.isArray(value)) {
      if (value.every(v => typeof v === 'string' || typeof v === 'number')) {
        // Simple array of primitives
        formattedValue = `[${value.map(v => JSON.stringify(v)).join(', ')}]`;
      } else {
        // Complex array
        formattedValue = JSON.stringify(value, null, 2);
      }
    } else if (typeof value === 'object' && value !== null) {
      formattedValue = formatJSObject(value, indent + 2);
    } else {
      formattedValue = JSON.stringify(value);
    }
    return `${indentStr}${key}: ${formattedValue}`;
  });
  return `{\n${entries.join(',\n')}\n${' '.repeat(indent - 2)}}`;
}

function generateFontLoaders() {
  console.log('🎨 Generating font loaders from design tokens...\n');

  const manifestPath = path.join(process.cwd(), 'dist', 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error('❌ manifest.json not found. Run token build first.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const fontFamilies = manifest.primitives?.typography?.family || {};

  if (Object.keys(fontFamilies).length === 0) {
    console.warn('⚠️  No font family tokens found');
    return;
  }

  // Collect font imports and loader configurations
  const googleFonts = new Set();
  const fontLoaders = [];
  const fontExports = [];
  const cssImports = [];

  Object.entries(fontFamilies).forEach(([key, token]) => {
    // Try to get extensions from:
    // 1. Explicit $extensions field (preferred)
    // 2. Parse from $description field with @fontSource pattern
    let extensions = token.extensions?.['com.wyliedog.fontSource'];

    if (!extensions && token.description) {
      extensions = parseFontSourceDescription(token.description);
    }

    if (!extensions) {
      console.warn(`⚠️  No font source found for ${key} (no $extensions or @fontSource pattern in description), skipping`);
      return;
    }

    // Extract the font type (sans, mono, serif, etc.)
    const type = key.split('-').pop();
    const variableName = `${type}Font`;
    // Strip quotes from font family name if present
    const fontFamily = token.value.replace(/['"]/g, '');
    const cssVariable = `--font-${type}`;

    if (extensions.provider === 'google') {
      // Google Fonts
      const importName = fontFamily.replace(/\s+/g, '_');
      googleFonts.add(importName);

      const config = {
        subsets: extensions.subsets || ['latin'],
        variable: cssVariable,
        display: extensions.display || 'swap',
      };

      // Add weight config if specified
      if (extensions.weights && extensions.weights.length > 0) {
        config.weight = extensions.weights.map(String);
      }

      fontLoaders.push(
        `export const ${variableName} = ${importName}(${formatJSObject(config)});`
      );
      fontExports.push(variableName);

      console.log(`✅ ${type}: ${fontFamily} (Google Fonts)`);
    } else if (extensions.provider === 'local') {
      // Local fonts
      const srcArray = Object.entries(extensions.files || {}).map(([weight, filePath]) => ({
        path: filePath,
        weight,
      }));

      const config = {
        src: srcArray,
        variable: cssVariable,
        display: extensions.display || 'swap',
      };

      fontLoaders.push(
        `export const ${variableName} = localFont(${formatJSObject(config)});`
      );
      fontExports.push(variableName);

      console.log(`✅ ${type}: ${fontFamily} (Local)`);
    } else if (extensions.provider === 'url') {
      // External stylesheet
      cssImports.push(`@import url("${extensions.stylesheet}");`);
      console.log(`✅ ${type}: ${fontFamily} (External URL)`);
    } else {
      console.warn(`⚠️  Unknown provider "${extensions.provider}" for ${key}`);
    }
  });

  // Generate Next.js font loader file
  if (fontLoaders.length > 0) {
    const googleFontImports = Array.from(googleFonts).join(', ');
    const hasLocalFonts = fontLoaders.some(loader => loader.includes('localFont'));

    const nextJsContent = `/**
 * AUTO-GENERATED from design tokens
 * Do not edit this file directly - edit tokens with $extensions instead
 *
 * Font configuration generated from:
 * packages/tokens/io/sync/primitive.json
 */

${googleFontImports ? `import { ${googleFontImports} } from "next/font/google";` : ''}
${hasLocalFonts ? `import localFont from "next/font/local";` : ''}

${fontLoaders.join('\n\n')}

// Array of all font configurations for easy spreading
export const allFonts = [${fontExports.join(', ')}];

// Font variable strings for className concatenation
export const fontVariables = allFonts.map(font => font.variable).join(' ');
`;

    // Output to dist for reference, but apps should copy this to their own directory
    const outputPath = path.join(process.cwd(), 'dist', 'font-loaders.next.ts');
    fs.writeFileSync(outputPath, nextJsContent);
    console.log(`\n📝 Generated: dist/font-loaders.next.ts`);
    console.log(`   ℹ️  Copy this file to your Next.js app (e.g., app/lib/fonts.ts)`);
  }

  // Generate CSS @font-face file for vanilla CSS usage
  if (cssImports.length > 0) {
    const cssContent = `/**
 * AUTO-GENERATED from design tokens
 * Font stylesheet imports
 */

${cssImports.join('\n')}
`;

    const cssOutputPath = path.join(process.cwd(), 'dist', 'fonts.css');
    fs.writeFileSync(cssOutputPath, cssContent);
    console.log(`📝 Generated: dist/fonts.css`);
  }

  console.log('\n✅ Font loader generation complete!');
}

// Run the generator
generateFontLoaders();
