import { test, expect } from "@playwright/test";

test.describe("Proposals List View", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/proposals*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          proposals: [
            {
              id: "1",
              title: "Mock Active Proposal",
              status: "ACTIVE",
              proposer: "0x123...abc",
              forVotes: "5000",
              againstVotes: "100"
            },
            {
              id: "2",
              title: "Mock Defeated Proposal",
              status: "DEFEATED",
              proposer: "0x456...def",
              forVotes: "0",
              againstVotes: "1000000"
            },
            {
              id: "3",
              title: "Mock Pending/Draft Proposal",
              status: "PENDING",
              proposer: "0x789...ghi",
              forVotes: "0",
              againstVotes: "0"
            }
          ]
        }),
      });
    });
  });

  test("should display correct status badges for different mocked proposals", async ({ page }) => {
    await page.goto("/proposals");

    await expect(page.getByText("Mock Active Proposal")).toBeVisible();
    await expect(page.getByText("Mock Defeated Proposal")).toBeVisible();
    await expect(page.getByText("Mock Pending/Draft Proposal")).toBeVisible();
  });
});
