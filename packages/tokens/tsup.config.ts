import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: false, // Don't clean - Style Dictionary puts CSS/JSON in dist/
  external: ["style-dictionary"],
});
