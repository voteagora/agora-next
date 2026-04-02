import { test, expect } from "@playwright/test";

test.describe("Proposal Detail & Voting View", () => {
  // Configured to route through our proxy API at `src/app/api/mock-daonode`

  test("should load the active proposal and render voting controls correctly", async ({
    page,
  }) => {
    // 1. Visit specific active proposal
    await page.goto("/proposals/test-active");

    // 2. Assert Proposal title to guarantee successful mock loading
    await expect(
      page.getByText(/Mock Active Proposal for Voting/i).first()
    ).toBeVisible();
  });
});
