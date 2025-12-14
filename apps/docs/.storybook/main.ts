import type { StorybookConfig } from "@storybook/react-vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const config: StorybookConfig = {
  stories: ["../stories/*.stories.tsx", "../stories/**/*.stories.tsx"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-docs",
  ],

  framework: {
    name: "@storybook/react-vite",
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
    };
  },
};

export default config;
