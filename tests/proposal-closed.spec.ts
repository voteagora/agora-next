import { test, expect } from "@playwright/test";

test.describe("Closed/Defeated Proposal View", () => {
  // Configured to route through our proxy API at `src/app/api/mock-daonode`

  test("should completely hide voting buttons on a defeated proposal and show results", async ({
    page,
  }) => {
    // 1. Visit closed/defeated proposal
    await page.goto("/proposals/test-defeated");
    await expect(
      page.getByText(/Mock Defeated Proposal/i).first()
    ).toBeVisible();

    // 2. Strict UI assertions against Voting buttons to prevent UI hacks
    // The "For" voting button should not exist in the DOM.
    await expect(page.getByRole("button", { name: "For" })).toHaveCount(0);

    // 3. Assert Results panel rendered
    // Results panels typically display percentages or "Against"/"For" labels
    await expect(page.getByText(/Against|For/i).first()).toBeVisible();
  });
});
