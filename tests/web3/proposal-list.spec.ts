import { test, expect } from "@playwright/test";

test.describe("Proposal List Page Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/proposals");
  });

  test("PROP-001: Proposal list page has Learn more about the voting process banner", async ({
    page,
  }) => {
    // Note: controlled by proposals-page-info-banner in src/lib/tenant/configs/ui/
    await expect(
      page.locator('text="Learn more about the voting process"')
    ).toBeVisible();
  });

  test("PROP-002: Create Proposal button visibility", async ({ page }) => {
    // Button is not visible if the user is not logged in / visible if logged in.
    test.skip(
      true,
      "Requires Synpress authentication flow or logged out strict check"
    );
  });

  test("PROP-003: Create Proposal button popup", async ({ page }) => {
    // Note: controlled by safe-proposal-choice in src/lib/tenant/configs/ui/
    test.skip(true, "Requires Synpress authentication flow");
  });

  test("PROP-004: Proposal Choose Proposal Flow pop up interactions", async ({
    page,
  }) => {
    // Note: controlled by safe-proposal-choice in src/lib/tenant/configs/ui/
    test.skip(true, "Requires Synpress authentication flow");
  });

  test("PROP-005: Proposal List filter includes Relevant and Everything", async ({
    page,
  }) => {
    await page.locator('[data-testid="proposal-filter-dropdown"]').click();
    await expect(page.locator('text="Relevant"')).toBeVisible();
    await expect(page.locator('text="Everything"')).toBeVisible();
  });

  test("PROP-006: Proposal List filter Temp Check Option", async ({ page }) => {
    // Note: controlled by has-eas-oodao in src/lib/tenant/configs/ui/
    await page.locator('[data-testid="proposal-filter-dropdown"]').click();
    await expect(page.locator('text="Temp Check"')).toBeVisible();
  });
});
