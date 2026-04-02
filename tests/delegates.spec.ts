import { test, expect } from "@playwright/test";

test.describe("Delegates List & Delegation Flow", () => {
  // API intercepts are handled globally via MSW in src/mocks/handlers.ts

  test("renders delegates and simulates delegation click", async ({ page }) => {
    await page.goto("/delegates");
    await expect(page.getByText(/dele.*\.eth/).first()).toBeVisible();

    const delegateButton = page
      .getByRole("button", { name: /Delegate/i })
      .first();
    if (await delegateButton.isVisible()) {
      await delegateButton.click({ force: true });
    }
  });
});
