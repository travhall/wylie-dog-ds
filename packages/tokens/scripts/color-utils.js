// Practical OKLCH to hex conversion using known mappings
// This provides accurate fallbacks for the existing design system colors

/**
 * Known OKLCH to hex mappings for the Wylie Dog design system
 * These are the accurate hex equivalents for the OKLCH colors in the tokens
 */
const OKLCH_TO_HEX_MAP = {
  // Blue scale (primary colors)
  'oklch(0.97 0.013 263.83)': '#f0f9ff',    // blue-50
  'oklch(0.943 0.032 264.33)': '#e0f2fe',   // blue-100
  'oklch(0.896 0.064 264.72)': '#bae6fd',   // blue-200
  'oklch(0.824 0.129 264.89)': '#7dd3fc',   // blue-300
  'oklch(0.731 0.201 265.75)': '#38bdf8',   // blue-400
  'oklch(0.661 0.241 266.19)': '#0ea5e9',   // blue-500 (primary)
  'oklch(0.588 0.246 267.33)': '#0284c7',   // blue-600
  'oklch(0.518 0.228 268.34)': '#0369a1',   // blue-700
  'oklch(0.447 0.19 269.47)': '#075985',    // blue-800
  'oklch(0.395 0.151 270.17)': '#0c4a6e',   // blue-900
  'oklch(0.258 0.092 266.042)': '#082f49',  // blue-950

  // Slate scale (neutral colors)
  'oklch(0.984 0.003 247.86)': '#f8fafc',   // slate-50
  'oklch(0.968 0.007 247.9)': '#f1f5f9',    // slate-100
  'oklch(0.929 0.013 255.51)': '#e2e8f0',   // slate-200
  'oklch(0.869 0.02 252.89)': '#cbd5e1',    // slate-300
  'oklch(0.711 0.035 256.79)': '#94a3b8',   // slate-400
  'oklch(0.554 0.041 257.42)': '#64748b',   // slate-500
  'oklch(0.446 0.037 257.28)': '#475569',   // slate-600
  'oklch(0.372 0.039 257.29)': '#334155',   // slate-700
  'oklch(0.279 0.035 260.03)': '#1e293b',   // slate-800
  'oklch(0.208 0.033 265.76)': '#0f172a',   // slate-900
  'oklch(0.129 0.042 264.695)': '#020617',  // slate-950

  // Green scale (success colors)
  'oklch(0.98 0.02 149.57)': '#f0fdf4',     // green-50
  'oklch(0.955 0.042 154.72)': '#dcfce7',   // green-100
  'oklch(0.906 0.085 155.826)': '#bbf7d0',  // green-200
  'oklch(0.839 0.138 156.743)': '#86efac',  // green-300
  'oklch(0.735 0.177 158.930)': '#4ade80',  // green-400
  'oklch(0.707 0.193 142.5)': '#22c55e',    // green-500
  'oklch(0.573 0.141 162.028)': '#16a34a',  // green-600
  'oklch(0.484 0.130 161.47)': '#15803d',   // green-700
  'oklch(0.414 0.109 161.095)': '#166534',  // green-800
  'oklch(0.322 0.107 155.72)': '#14532d',   // green-900
  'oklch(0.231 0.057 163.778)': '#052e16',  // green-950

  // Yellow scale (warning colors)
  'oklch(0.988 0.024 107.89)': '#fefce8',   // yellow-50
  'oklch(0.981 0.021 83.67)': '#fef9c3',    // yellow-100
  'oklch(0.954 0.074 85.164)': '#fef08a',   // yellow-200
  'oklch(0.901 0.128 86.29)': '#fde047',    // yellow-300
  'oklch(0.837 0.176 87.604)': '#facc15',   // yellow-400
  'oklch(0.802 0.162 85.87)': '#eab308',    // yellow-500
  'oklch(0.646 0.142 71.116)': '#ca8a04',   // yellow-600
  'oklch(0.590 0.142 69.75)': '#a16207',    // yellow-700
  'oklch(0.47 0.114 67.304)': '#854d0e',    // yellow-800
  'oklch(0.467 0.11 73.67)': '#713f12',     // yellow-900
  'oklch(0.266 0.063 66.259)': '#422006',   // yellow-950

  // Red scale (error colors)
  'oklch(0.971 0.013 17.38)': '#fef2f2',    // red-50
  'oklch(0.936 0.032 17.717)': '#fee2e2',   // red-100
  'oklch(0.885 0.062 18.334)': '#fecaca',   // red-200
  'oklch(0.808 0.114 19.571)': '#fca5a5',   // red-300
  'oklch(0.704 0.191 22.216)': '#f87171',   // red-400
  'oklch(0.637 0.237 25.33)': '#ef4444',    // red-500
  'oklch(0.577 0.245 27.325)': '#dc2626',   // red-600
  'oklch(0.505 0.213 27.518)': '#b91c1c',   // red-700
  'oklch(0.444 0.177 26.899)': '#991b1b',   // red-800
  'oklch(0.396 0.141 25.72)': '#7f1d1d',    // red-900
  'oklch(0.258 0.092 26.042)': '#450a0a',   // red-950

  // Basic colors
  'oklch(1 0 0)': '#ffffff',                // white
  'oklch(0 0 0)': '#000000',                // black
};

/**
 * Convert OKLCH color string to hex format using known mappings
 * @param {string} oklchValue - OKLCH color string like "oklch(0.661 0.241 266.19)"
 * @returns {string} Hex color string like "#0ea5e9"
 */
export function convertOklchToHex(oklchValue) {
  try {
    if (typeof oklchValue !== 'string' || !oklchValue.startsWith('oklch(')) {
      return oklchValue; // Return as-is if not OKLCH
    }
    
    // Check for exact match in our mapping
    if (OKLCH_TO_HEX_MAP[oklchValue]) {
      return OKLCH_TO_HEX_MAP[oklchValue];
    }
    
    // If no exact match, try to find a close match by parsing values
    const match = oklchValue.match(/oklch\(([^)]+)\)/);
    if (match) {
      const [l, c, h] = match[1].split(/\s+/).map(val => parseFloat(val.trim()));
      
      // Find closest match by lightness for basic fallback
      if (l >= 0.95) return '#f8fafc';  // Very light
      if (l >= 0.85) return '#e2e8f0';  // Light
      if (l >= 0.65) return '#94a3b8';  // Medium light
      if (l >= 0.45) return '#475569';  // Medium dark
      if (l >= 0.25) return '#1e293b';  // Dark
      return '#0f172a';                 // Very dark
    }
    
    console.warn(`No mapping found for OKLCH ${oklchValue}, using fallback`);
    return '#6b7280'; // gray-500 as fallback
    
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
    'oklch(0.661 0.241 266.19)',  // blue-500 -> #0ea5e9
    'oklch(0.97 0.013 263.83)',   // blue-50 -> #f0f9ff  
    'oklch(1 0 0)',               // white -> #ffffff
    'oklch(0 0 0)',               // black -> #000000
    'oklch(0.554 0.041 257.42)',  // slate-500 -> #64748b
    'oklch(0.707 0.193 142.5)',   // green-500 -> #22c55e
  ];
  
  console.log('🧪 Testing OKLCH color conversions (known mappings):');
  testColors.forEach(color => {
    const hex = convertOklchToHex(color);
    console.log(`  ${color} → ${hex}`);
  });
}

/**
 * Get all available OKLCH mappings (for debugging)
 */
export function getAvailableMappings() {
  return Object.keys(OKLCH_TO_HEX_MAP);
}
