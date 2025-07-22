import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entryPoints: [
    "src/button.tsx", 
    "src/badge.tsx", 
    "src/card.tsx", 
    "src/input.tsx",
    "src/label.tsx",
    "src/textarea.tsx",
    "src/checkbox.tsx",
    "src/switch.tsx",
    "src/select.tsx"
  ],
  format: ["cjs", "esm"],
  dts: true,
  external: ["react"],
  ...options,
}));
