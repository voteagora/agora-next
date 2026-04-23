import { test, expect } from "@playwright/test";

test.describe("Delegates List View", () => {
  // Configured to route through our proxy API at `src/app/api/mock-daonode`

  test("should render delegates correctly from mocked list", async ({
    page,
  }) => {
    // Navigate to delegates page
    await page.goto("/delegates");

    // Assert the mocked returned ENS or account displays
    await expect(page.getByText(/dele.*\.eth/i).first()).toBeVisible();
  });
});
