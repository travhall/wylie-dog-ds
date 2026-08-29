/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: [
      // `turbo run test` doesn't depend on `^build`, so packages/ui's dist/
      // isn't guaranteed to exist when this suite runs in CI. Resolve
      // `@wyliedog/ui/*` straight to its TS source (as packages/ui's own
      // tests do) instead of relying on the package.json `exports` map,
      // which points at build output.
      {
        find: /^@wyliedog\/ui\/(.+)$/,
        replacement: `${path.resolve(__dirname, "../../packages/ui/src")}/$1`,
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
