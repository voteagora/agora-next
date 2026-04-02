import { test, expect } from "@playwright/test";

test.describe("Closed/Defeated Proposal View", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/proposals/test-defeated*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          proposal: {
            id: "test-defeated",
            title: "Mock Defeated Proposal",
            status: "DEFEATED",
            proposer: "0x222...",
            forVotes: "500",
            againstVotes: "100000"
          }
        }),
      });
    });
  });

  test("should completely hide voting buttons on a defeated proposal", async ({ page }) => {
    await page.goto("/proposals/test-defeated");
    await expect(page.getByText("Mock Defeated Proposal")).toBeVisible();

    const forButton = page.getByRole("button", { name: /Vote For/i });
    await expect(forButton).toHaveCount(0);
  });
});
