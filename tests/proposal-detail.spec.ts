import { test, expect } from "@playwright/test";

test.describe("Proposal Detail & Voting Flow", () => {
  // API intercepts are handled globally via MSW in src/mocks/handlers.ts

  test("should allow interacting with vote buttons on an Active proposal", async ({
    page,
  }) => {
    await page.goto("/proposals/test-active");
    await expect(
      page.getByText(/Mock Active Proposal for Voting/i).first()
    ).toBeVisible();

    const forButton = page.getByRole("button", { name: /Vote For/i });
    if (await forButton.isVisible()) {
      await forButton.click();
    }
  });
});
