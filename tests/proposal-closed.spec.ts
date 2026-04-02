import { test, expect } from "@playwright/test";

test.describe("Closed/Defeated Proposal View", () => {
  // API intercepts are handled globally via MSW in src/mocks/handlers.ts

  test("should completely hide voting buttons on a defeated proposal", async ({
    page,
  }) => {
    await page.goto("/proposals/test-defeated");
    await expect(
      page.getByText(/Mock Defeated Proposal/i).first()
    ).toBeVisible();

    const forButton = page.getByRole("button", { name: /Vote For/i });
    await expect(forButton).toHaveCount(0);
  });
});
