import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react({ jsxImportSource: "preact" })],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.config.{ts,js}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "src/__tests__/**",
        "**/*.config.{ts,js}",
        "**/*.d.ts",
        "**/types/**",
      ],
      // Coverage thresholds - enforce minimum coverage
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
    // Performance test configuration
    testTimeout: 10000, // 10s for performance tests
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@plugin": resolve(__dirname, "./src/plugin"),
      "@ui": resolve(__dirname, "./src/ui"),
      "@shared": resolve(__dirname, "./src/shared"),
      "@tests": resolve(__dirname, "./src/__tests__"),
      // Preact compatibility
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
  },
});
