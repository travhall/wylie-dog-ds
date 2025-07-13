import { converter, formatHex } from 'culori';
import { writeFile, readFile } from 'fs/promises';

/**
 * Convert hex color to OKLCH format
 */
export function convertHexToOklch(hex) {
  try {
    const oklch = converter('oklch')(hex);
    // Format OKLCH manually since formatOklch might not be available
    const { l, c, h } = oklch;
    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h ? h.toFixed(2) : 0})`;
  } catch (error) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
}

/**
 * Convert OKLCH color to hex format
 */
export function convertOklchToHex(oklch) {
  try {
    const hex = converter('hex')(oklch);
    return formatHex(hex);
  } catch (error) {
    throw new Error(`Invalid oklch color: ${oklch}`);
  }
}

/**
 * Generate color scale from base color
 */
export function generateColorScale(baseHex, steps = 10) {
  const baseOklch = converter('oklch')(baseHex);
  const scale = [];
  
  for (let i = 0; i < steps; i++) {
    const lightness = 0.95 - (i * 0.85 / (steps - 1));
    const oklchColor = {
      ...baseOklch,
      l: lightness
    };
    
    // Format OKLCH manually
    const color = `oklch(${oklchColor.l.toFixed(3)} ${oklchColor.c.toFixed(3)} ${oklchColor.h ? oklchColor.h.toFixed(2) : 0})`;
    
    scale.push({
      step: (i + 1) * (100 / steps),
      value: color,
      hex: convertOklchToHex(color)
    });
  }
  
  return scale;
}

/**
 * Validate color contrast ratio
 */
export function validateColorContrast(color1, color2, minRatio = 4.5) {
  // Simplified contrast calculation
  const rgb1 = converter('rgb')(color1);
  const rgb2 = converter('rgb')(color2);
  
  const getLuminance = (rgb) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return {
    ratio,
    passes: ratio >= minRatio
  };
}
