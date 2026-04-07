import { test, expect } from "@playwright/test";

test.describe("Proposals List View", () => {
  // Configured to route through our proxy API at `src/app/api/mock-daonode`

  test("should load the proposal list and navigate to an active proposal detail", async ({
    page,
  }) => {
    // 1. Visit list
    await page.goto("/proposals");

    // 2. Asserts initial render from Mocked DAO Node Array
    await expect(page.getByText(/Mock Active Proposal/i).first()).toBeVisible();

    // 3. Navigate into the specific active proposal
    // The proposal list items usually wrap the title in an anchored link
    await page.locator('a[href^="/proposals/test-active"]').first().click();
    // 4. Assert Navigation succeeded by waiting for the detail URL
    await expect(page).toHaveURL(/\/proposals\/test-active/);
  });
});
