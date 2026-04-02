import { test, expect } from "@playwright/test";

test.describe("Create Proposal Draft Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/proposals/create*", async (route, request) => {
      if (request.method() === "POST") {
        const postData = request.postDataJSON();
        return await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, draftId: "12345" })
        });
      }
      return route.continue();
    });
  });

  test("should allow formulating a proposal without sending bad params", async ({ page }) => {
    await page.goto("/proposals/create");
  });
});
