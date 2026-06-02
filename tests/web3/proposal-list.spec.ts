import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";

test.describe("Proposal List Page Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/proposals");
  });

  test("PROP-001: Proposal list page has Learn more about the voting process banner", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("proposals-page-info-banner")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await expect(
      page.locator('text="Learn more about the voting process"')
    ).toBeVisible();
  });

  test("PROP-005: Proposal List filter includes Relevant and Everything", async ({
    page,
  }) => {
    await page.locator('[data-testid="proposal-filter-dropdown"]').click();
    await expect(
      page.getByRole("option", { name: "Relevant", exact: false }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Everything", exact: false }).first()
    ).toBeVisible();
  });

  test("PROP-006: Proposal List filter Temp Check Option", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("has-eas-oodao")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await page.locator('[data-testid="proposal-filter-dropdown"]').click();
    await expect(page.locator('text="Temp Check"')).toBeVisible();
  });
});
