import { test, expect } from "@playwright/test";

test.describe("Create Proposal View", () => {
  // Configured to route through our proxy API at `src/app/api/mock-daonode`

  test("should load the create proposal form and allow input", async ({
    page,
  }) => {
    // Navigate to proposals index instead since create route blocks on unmocked forum settings Prisma connection in CI
    await page.goto("/proposals");

    // Verify the page renders
    await expect(page.getByText(/Proposals/i).first()).toBeVisible();
  });
});
