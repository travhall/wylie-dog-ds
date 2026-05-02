const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production builds use Turbopack (Next.js 16 default — fast).
  // Dev uses webpack (--no-turbopack in dev script) so we can configure
  // watchOptions and prevent Turbopack from watching the entire workspace
  // package directories (src/, node_modules/, dist/) through pnpm symlinks.
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      const workspaceRoot = path.resolve(__dirname, "../..");
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          // Never watch anything inside workspace packages' node_modules
          `${workspaceRoot}/packages/*/node_modules/**`,
          // Never watch test coverage output
          `${workspaceRoot}/packages/*/coverage/**`,
          // Never watch turbo cache
          `${workspaceRoot}/packages/*/.turbo/**`,
          `${workspaceRoot}/apps/*/.turbo/**`,
          // Standard ignores
          `${workspaceRoot}/.git/**`,
          `${workspaceRoot}/node_modules/.cache/**`,
        ],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
