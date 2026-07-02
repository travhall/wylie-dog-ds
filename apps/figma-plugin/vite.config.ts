import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  // Debug logging (console.log/debug/info) is stripped from builds by default.
  // console.warn/error are always kept. Set PLUGIN_DEBUG=true to retain debug
  // logs for local troubleshooting: `PLUGIN_DEBUG=true pnpm build`.
  const keepDebugLogs = process.env.PLUGIN_DEBUG === "true";
  const droppableConsole = ["console.log", "console.debug", "console.info"];

  if (mode === "ui") {
    // Build UI as single file for Figma
    return {
      plugins: [
        react({ jsxImportSource: "preact" }),
        viteSingleFile({
          useRecommendedBuildConfig: true,
          removeViteModuleLoader: true,
        }),
      ],
      build: {
        target: "es2017",
        outDir: "dist",
        emptyOutDir: false,
        rollupOptions: {
          input: "src/ui/index.html",
          output: {
            entryFileNames: "ui.js",
            assetFileNames: "ui.html",
          },
        },
        minify: "terser",
        terserOptions: {
          compress: {
            drop_console: false,
            drop_debugger: false,
            pure_funcs: keepDebugLogs ? [] : droppableConsole,
          },
        },
        sourcemap: false,
      },
      resolve: {
        alias: {
          react: "preact/compat",
          "react-dom": "preact/compat",
        },
      },
      define: {
        "process.env.NODE_ENV": JSON.stringify(mode),
      },
    };
  }

  // Build plugin
  return {
    plugins: [],
    build: {
      target: "es2017", // Target ES2017 for better Figma compatibility
      outDir: "dist",
      emptyOutDir: false,
      rollupOptions: {
        input: "src/plugin/main.ts",
        output: {
          entryFileNames: "plugin.js",
          format: "iife",
        },
      },
      minify: true,
      sourcemap: false,
    },
    esbuild: {
      target: "es2017", // Match build target for consistency
      // Drop debug logs (keep warn/error) unless PLUGIN_DEBUG=true.
      pure: keepDebugLogs ? [] : droppableConsole,
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
  };
});
