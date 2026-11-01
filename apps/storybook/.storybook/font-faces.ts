/*
 * Brand fonts, self-hosted through @fontsource so the manager, stories and docs
 * never depend on a font CDN at runtime. Imported by the manager and the preview.
 */
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/besley/400.css";
import "@fontsource/besley/500.css";
import "@fontsource/besley/600.css";
import "@fontsource/besley/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import { fontMono, fontSans, fontSerif } from "./font-stacks";

/* The design system reads --font-sans, --font-serif and --font-mono. */
if (typeof document !== "undefined") {
  const root = document.documentElement.style;
  root.setProperty("--font-sans", fontSans);
  root.setProperty("--font-serif", fontSerif);
  root.setProperty("--font-mono", fontMono);
}
