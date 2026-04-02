import { test, expect } from "@playwright/test";

test.describe("Proposals List View", () => {
  // API intercepts are handled globally via MSW in src/mocks/handlers.ts

  test("should display correct status badges for different mocked proposals", async ({
    page,
  }) => {
    await page.goto("/proposals");

    await expect(page.getByText(/Mock Active Proposal/i).first()).toBeVisible();
    await expect(
      page.getByText(/Mock Defeated Proposal/i).first()
    ).toBeVisible();
    await expect(
      page.getByText(/Mock Pending\/Draft Proposal/i).first()
    ).toBeVisible();
  });
});
