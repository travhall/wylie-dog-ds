import { defineConfig, devices } from "@playwright/test";

/**
 * Visual regression config.
 *
 * Runs against a locally-served storybook-static build. CI builds Storybook
 * first, serves it on :4173, then executes this suite.
 *
 * Baselines live next to the spec (tests/visual.spec.ts-snapshots/).
 * To seed or update them locally: `pnpm test:visual:update`.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL: process.env.STORYBOOK_URL ?? "http://localhost:4173",
    trace: "on-first-retry",
  },

  // Pin a single browser/viewport for stable pixel diffs. Add more projects
  // only if you need cross-browser coverage — each project multiplies baseline
  // storage and review burden.
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],

  expect: {
    toHaveScreenshot: {
      // Small tolerance for font-rendering jitter; tighten if diffs get noisy.
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    },
  },

  webServer: process.env.CI
    ? undefined
    : {
        command: "pnpm serve storybook-static -l 4173 --no-clipboard",
        url: "http://localhost:4173",
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
