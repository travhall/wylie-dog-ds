import { converter, formatHex, parse } from 'culori';

/**
 * Convert hex color to OKLCH format
 * @param {string} hexValue - Hex color string like "#ffffff"
 * @returns {string} OKLCH color string like "oklch(1 0 0)"
 */
export function convertHexToOklch(hexValue) {
  try {
    if (typeof hexValue !== 'string' || !hexValue.startsWith('#')) {
      console.warn(`Invalid hex color: ${hexValue}`);
      return hexValue;
    }

    // Use culori to convert hex to OKLCH
    const oklchConverter = converter('oklch');
    const oklchColor = oklchConverter(hexValue);

    if (!oklchColor) {
      console.warn(`Failed to convert ${hexValue} to OKLCH`);
      return hexValue;
    }

    // Format as oklch(L C H) with proper precision
    const l = oklchColor.l !== undefined ? Math.round(oklchColor.l * 1000) / 1000 : 0;
    const c = oklchColor.c !== undefined ? Math.round(oklchColor.c * 1000) / 1000 : 0;
    const h = oklchColor.h !== undefined ? Math.round(oklchColor.h * 100) / 100 : 0;

    return `oklch(${l} ${c} ${h})`;
  } catch (error) {
    console.warn(`Error converting ${hexValue} to OKLCH:`, error.message);
    return hexValue;
  }
}

/**
 * Convert OKLCH color string to hex format using culori
 * @param {string} oklchValue - OKLCH color string like "oklch(0.661 0.241 266.19)"
 * @returns {string} Hex color string like "#0ea5e9"
 */
export function convertOklchToHex(oklchValue) {
  try {
    if (typeof oklchValue !== 'string' || !oklchValue.startsWith('oklch(')) {
      return oklchValue; // Return as-is if not OKLCH
    }

    // Use culori to parse and convert OKLCH to hex
    const parsed = parse(oklchValue);
    if (!parsed) {
      console.warn(`Failed to parse OKLCH ${oklchValue}`);
      return '#6b7280'; // gray-500 as fallback
    }

    const hex = formatHex(parsed);
    if (!hex) {
      console.warn(`Failed to convert OKLCH ${oklchValue} to hex`);
      return '#6b7280'; // gray-500 as fallback
    }

    return hex;
  } catch (error) {
    console.warn(`Failed to convert OKLCH ${oklchValue}:`, error.message);
    return '#6b7280'; // gray-500 as fallback
  }
}

/**
 * Validate OKLCH color string format
 * @param {string} oklchValue - OKLCH color string
 * @returns {boolean} True if valid OKLCH format
 */
export function isValidOklch(oklchValue) {
  if (typeof oklchValue !== 'string' || !oklchValue.startsWith('oklch(')) {
    return false;
  }
  
  const match = oklchValue.match(/oklch\(([^)]+)\)/);
  if (!match) return false;
  
  const values = match[1].split(/\s+/);
  if (values.length !== 3) return false;
  
  return values.every(val => !isNaN(parseFloat(val.trim())));
}

/**
 * Generate OKLCH with hex fallback object
 * @param {string} oklchValue - OKLCH color string
 * @returns {object} Object with both oklch and hex values
 */
export function generateOklchWithFallback(oklchValue) {
  const hexFallback = convertOklchToHex(oklchValue);
  return {
    oklch: oklchValue,
    hex: hexFallback
  };
}

/**
 * Test color conversion with known values
 */
export function testColorConversion() {
  const testColors = [
    { oklch: 'oklch(0.623 0.188 259.82)', expected: '#3b82f6' },  // blue-500
    { oklch: 'oklch(0.97 0.014 254.66)', expected: '#eff6ff' },   // blue-50
    { oklch: 'oklch(1 0 0)', expected: '#ffffff' },               // white
    { oklch: 'oklch(0 0 0)', expected: '#000000' },               // black
    { oklch: 'oklch(0.554 0.041 257.43)', expected: '#64748b' },  // slate-500
    { oklch: 'oklch(0.723 0.192 149.6)', expected: '#22c55e' },   // green-500
  ];

  console.log('🧪 Testing OKLCH ↔ Hex color conversions:');
  testColors.forEach(({ oklch, expected }) => {
    const hex = convertOklchToHex(oklch);
    const match = hex.toLowerCase() === expected.toLowerCase() ? '✅' : '⚠️';
    console.log(`  ${match} ${oklch} → ${hex} (expected: ${expected})`);
  });
}
/**
 * Validate color contrast between two colors according to WCAG guidelines
 * @param {string} color1 - First color (hex or OKLCH)
 * @param {string} color2 - Second color (hex or OKLCH)
 * @param {number} minRatio - Minimum contrast ratio (default: 4.5 for WCAG AA)
 * @returns {object} Object with ratio, passes boolean, and level
 */
export function validateColorContrast(color1, color2, minRatio = 4.5) {
  try {
    // Convert colors to hex if needed
    const hex1 = color1.startsWith('oklch(') ? convertOklchToHex(color1) : color1;
    const hex2 = color2.startsWith('oklch(') ? convertOklchToHex(color2) : color2;
    
    // Calculate relative luminance
    const getLuminance = (hex) => {
      // Remove # if present
      const cleanHex = hex.replace('#', '');
      
      // Convert hex to RGB
      const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
      const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
      const b = parseInt(cleanHex.substr(4, 2), 16) / 255;
      
      // Apply gamma correction
      const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      const rLinear = toLinear(r);
      const gLinear = toLinear(g);
      const bLinear = toLinear(b);
      
      // Calculate luminance
      return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    };
    
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    
    // Calculate contrast ratio
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    
    // Determine WCAG level
    let level = 'FAIL';
    if (ratio >= 7) level = 'AAA';
    else if (ratio >= 4.5) level = 'AA';
    else if (ratio >= 3) level = 'AA Large';
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      passes: ratio >= minRatio,
      level: level,
      hex1: hex1,
      hex2: hex2
    };
    
  } catch (error) {
    console.warn(`Failed to validate contrast between ${color1} and ${color2}:`, error.message);
    return {
      ratio: 0,
      passes: false,
      level: 'ERROR',
      error: error.message
    };
  }
}

/**
 * Test contrast validation with known color pairs
 */
export function testContrastValidation() {
  const testPairs = [
    ['#000000', '#ffffff'], // Black on white - should pass AAA
    ['#0ea5e9', '#ffffff'], // Blue-500 on white - should pass AA
    ['#64748b', '#ffffff'], // Slate-500 on white - should pass AA
    ['#f8fafc', '#0f172a'], // Slate-50 on slate-900 - should pass AAA
  ];
  
  console.log('🧪 Testing contrast validation:');
  testPairs.forEach(([color1, color2]) => {
    const result = validateColorContrast(color1, color2);
    console.log(`  ${color1} on ${color2}: ${result.ratio}:1 (${result.level})`);
  });
}
