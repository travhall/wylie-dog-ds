/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1500, // Increased to accommodate axe-core (1.2MB)
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][ext]",
      },
    },
    target: "esnext",
    minify: "esbuild",
  },
  // Optimize dependency handling for better tree-shaking
  optimizeDeps: {
    include: ["react", "react-dom"],
    esbuildOptions: {
      treeShaking: true,
    },
  },
  test: {
    coverage: {
      // Use istanbul instead of v8. v8 collects coverage by dumping raw CDP
      // data from the browser for every JS file Chromium executed (Storybook
      // internals, axe-core, Radix, Lucide, etc.) and piping it back over the
      // addon WebSocket — tens of MB that reliably times out the dev server.
      // Istanbul instruments source files at build time; coverage is just
      // in-memory counters that flush instantly with no large browser→Node
      // transfer. The Coverage checkbox in the Storybook panel works correctly.
      provider: "istanbul",
      // Instrument only the two .storybook helpers that actually execute during
      // tests (theme bootstrap + decorator). main.ts only runs at server startup
      // so it's excluded — including it would add a 0% file and drag the number
      // down. The meaningful component coverage lives in packages/ui:
      //   pnpm --filter @wyliedog/ui test:coverage
      include: [".storybook/preview.tsx", ".storybook/theme-sync.ts"],
    },
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
