import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";

test.describe("Delegation Actions Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("agora-delegation-dialog-shown", "true");
    });
  });

  test("DELEGATION-001: Logged-out state prompts connect wallet on Grid view", async ({
    page,
  }) => {
    await page.goto("/delegates");
    await page.waitForLoadState("domcontentloaded");

    await page
      .locator('[data-testid="delegate-card"] button', { hasText: "Delegate" })
      .first()
      .click();
    await expect(
      page.locator('text="Connect Wallet"').or(page.locator('text="Sign In"'))
    ).toBeVisible();
  });

  test("DELEGATION-002: Logged-out state prompts connect wallet on List view", async ({
    page,
  }) => {
    await page.goto("/delegates?layout=list");
    await page.waitForLoadState("domcontentloaded");

    await page
      .locator('[data-testid="delegate-row"] button', { hasText: "Delegate" })
      .first()
      .click();
    await expect(
      page.locator('text="Connect Wallet"').or(page.locator('text="Sign In"'))
    ).toBeVisible();
  });
});
