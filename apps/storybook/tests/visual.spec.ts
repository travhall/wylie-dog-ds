import { test, expect } from "@playwright/test";

/**
 * Visual regression snapshots for a curated set of stories.
 *
 * We deliberately do NOT snapshot every story — that produces noisy diffs on
 * every unrelated change and burns CI time. This list targets:
 *   - the showcase compositions (end-to-end visual contract)
 *   - a few primitives that exercise tokens heavily (Button, Card, Input)
 *
 * To add a story: append its Storybook ID (kebab-case of title + story name)
 * to STORY_IDS and run `pnpm test:visual:update` to seed a baseline.
 */
const STORY_IDS = [
  "showcase-marketing-site--default",
  "showcase-marketing-site--gradient-hero",
  "showcase-marketing-site--centered-hero",
  "components-inputs-controls-button--all-variants",
  "components-inputs-controls-input--default",
  "components-content-display-card--default",
  "components-content-display-badge--all-variants",
];

for (const id of STORY_IDS) {
  test(`visual: ${id}`, async ({ page }) => {
    // iframe.html renders the story bare, without the Storybook chrome.
    await page.goto(`/iframe.html?id=${id}&viewMode=story`);

    // Wait for fonts + any story-root signals so we don't snapshot a FOUT.
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);

    await expect(page).toHaveScreenshot(`${id}.png`, { fullPage: true });
  });
}
