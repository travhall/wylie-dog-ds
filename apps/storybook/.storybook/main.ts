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
        // Force full reload instead of HMR for CSS changes
        cssCodeSplit: false,
        chunkSizeWarningLimit: 1500,
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
