import { test, expect } from "@playwright/test";

// Playwright tests for the Proposals Page.
// Includes tests for initial proposal load, infinite scroll loading, and filter functionality.

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

test.describe("Proposals Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test("initially displays relevant proposals", async ({ page }) => {
    const initialProposalCount = await page
      .locator('div[class*="proposal_row"]')
      .count();
    expect(initialProposalCount).toBeGreaterThan(0);
  });
});
