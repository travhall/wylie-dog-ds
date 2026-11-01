/*
 * The brand font stacks, defined once. The manager theme reads them directly and
 * font-faces.ts publishes them as the --font-* variables the design system reads
 * (the Next.js showcase sets the same variables with next/font).
 */
export const fontSans = '"Manrope", ui-sans-serif, system-ui, sans-serif';
export const fontSerif = '"Besley", ui-serif, serif';
export const fontMono =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace';
