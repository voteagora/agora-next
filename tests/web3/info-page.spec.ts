import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";

test.describe("Info Page and Extra Header Nav", () => {
  test("INFO-001: Info page includes Governor Settings section", async ({
    page,
  }) => {
    await page.goto("/info");
    const { ui } = Tenant.current();
    if (ui.toggle("hide-governor-settings")?.enabled) {
      await expect(page.locator("text=Governor Settings")).toBeHidden();
    } else {
      await expect(page.locator("text=Governor Settings")).toBeVisible();
    }
  });

  test("INFO-002: Info page inludes red View DUNA Member Disclosures link", async ({
    page,
  }) => {
    await page.goto("/info");
    test.skip(true, "Verify red disclosures link for DUNA tenants");
  });

  test("INFO-003: Info page inludes Formation Documents section", async ({
    page,
  }) => {
    await page.goto("/info");
    test.skip(true, "Verify formation documents for DUNA tenants");
  });

  test("HEAD-NAV-007: Header nav bar Financials link", async ({ page }) => {
    await page.goto("/");
    const { ui } = Tenant.current();
    if (ui.toggle("duna/financial-statements")?.enabled) {
      await expect(page.locator('a:has-text("Financials")')).toBeVisible();
    }
  });
});
