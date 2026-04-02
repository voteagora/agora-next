import { test, expect } from "@playwright/test";

test.describe("Delegates List & Delegation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/delegates*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 2,
          delegates: [
            {
              address: "whale.eth",
              votingPower: "1000000",
              numOfDelegators: "50",
            },
            {
              address: "dust.eth",
              votingPower: "0",
              numOfDelegators: "0",
            }
          ]
        }),
      });
    });

    await page.route("**/api/delegate/tx*", async (route, request) => {
      if (request.method() === "POST") {
        return await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, transactionHash: "0xdel123" })
        });
      }
      return route.continue();
    });
  });

  test("renders delegates and simulates delegation click", async ({ page }) => {
    await page.goto("/delegates");
    await expect(page.getByText("whale.eth")).toBeVisible();
    await expect(page.getByText("dust.eth")).toBeVisible();

    const delegateButton = page.getByRole("button", { name: /Delegate/i }).first();
    if (await delegateButton.isVisible()) {
        await delegateButton.click();
    }
  });
});
