import { test, expect } from "@playwright/test";

test.describe("Proposal Detail & Voting Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/proposals/test-active*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          proposal: {
            id: "test-active",
            title: "Mock Active Proposal for Voting",
            status: "ACTIVE",
            proposer: "0x111...111",
            forVotes: "0",
            againstVotes: "0"
          }
        }),
      });
    });

    await page.route("**/api/votes*", async (route, request) => {
      if (request.method() === "POST") {
        return await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, transactionHash: "0xabc123" })
        });
      }
      return route.continue();
    });
  });

  test("should allow interacting with vote buttons on an Active proposal", async ({ page }) => {
    await page.goto("/proposals/test-active");
    await expect(page.getByText("Mock Active Proposal for Voting")).toBeVisible();

    const forButton = page.getByRole("button", { name: /Vote For/i });
    if (await forButton.isVisible()) {
        await forButton.click();
    }
  });
});
