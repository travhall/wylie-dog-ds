// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from "@storybook/react-vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { visualizer } from "rollup-plugin-visualizer";

const __filename = fileURLToPath(import.meta.url);

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/*.stories.tsx",
    "../stories/**/*.stories.tsx",
  ],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("storybook-design-token"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  core: {},

  async viteFinal(config) {
    // Customize the Vite config here
    return {
      ...config,
      define: { "process.env": {} },
      resolve: {
        ...config.resolve,
        alias: [
          ...(Array.isArray(config.resolve?.alias) ? config.resolve.alias : []),
          {
            find: "ui",
            replacement: resolve(__dirname, "../../../packages/ui/"),
          },
        ],
      },
      server: {
        ...config.server,
        hmr:
          config.server?.hmr === false
            ? false
            : {
                ...(typeof config.server?.hmr === "object"
                  ? config.server.hmr
                  : {}),
                overlay: false,
              },
      },
      css: {
        ...config.css,
        devSourcemap: false,
      },
      build: {
        ...config.build,
        // Enable CSS code splitting for better performance
        cssCodeSplit: true,
        chunkSizeWarningLimit: 1500,
        // Manual chunk optimization for better code splitting
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Vendor chunks - split large dependencies
              if (id.includes("node_modules")) {
                // Separate axe-core for a11y testing (lazy loaded)
                if (id.includes("axe-core")) {
                  return "vendor-axe";
                }
                // Separate React and React DOM
                if (id.includes("react") || id.includes("react-dom")) {
                  return "vendor-react";
                }
                // Separate Radix UI primitives into smaller chunks
                if (id.includes("@radix-ui")) {
                  return "vendor-radix";
                }
                // Lucide icons
                if (id.includes("lucide-react")) {
                  return "vendor-lucide";
                }
                // Storybook core packages
                if (
                  id.includes("@storybook/blocks") ||
                  id.includes("@storybook/components")
                ) {
                  return "vendor-storybook-ui";
                }
                // Syntax highlighter
                if (id.includes("react-syntax-highlighter")) {
                  return "vendor-highlighter";
                }
                // All other node_modules
                return "vendor";
              }
            },
          },
        },
      },
      // Optimize dependency pre-bundling
      optimizeDeps: {
        include: [
          "react",
          "react-dom",
          "@radix-ui/react-accordion",
          "@radix-ui/react-alert-dialog",
          "@radix-ui/react-avatar",
          "@radix-ui/react-checkbox",
          "@radix-ui/react-collapsible",
          "@radix-ui/react-dialog",
          "@radix-ui/react-dropdown-menu",
          "@radix-ui/react-label",
          "@radix-ui/react-popover",
          "@radix-ui/react-progress",
          "@radix-ui/react-radio-group",
          "@radix-ui/react-select",
          "@radix-ui/react-separator",
          "@radix-ui/react-slider",
          "@radix-ui/react-switch",
          "@radix-ui/react-tabs",
          "@radix-ui/react-toast",
          "@radix-ui/react-tooltip",
        ],
        exclude: ["axe-core"], // Lazy load a11y testing
      },
      plugins: [
        ...(config.plugins || []),
        // Generate bundle size visualization on build
        process.env.ANALYZE === "true" &&
          visualizer({
            filename: "./storybook-static/bundle-stats.html",
            open: false,
            gzipSize: true,
            brotliSize: true,
            template: "treemap",
          }),
      ].filter(Boolean),
    };
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
