import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
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
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
  };
});
