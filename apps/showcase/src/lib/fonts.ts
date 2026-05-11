/**
 * Showcase font configuration — matches the HTML prototype design spec.
 * Manrope: primary sans-serif
 * Besley: editorial serif (headings, wordmark)
 * JetBrains Mono: monospace (labels, code, token values)
 */

import { Manrope, Besley, JetBrains_Mono } from "next/font/google";

export const sansFont = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const serifFont = Besley({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const allFonts = [sansFont, serifFont, monoFont];
export const fontVariables = allFonts.map((f) => f.variable).join(" ");
