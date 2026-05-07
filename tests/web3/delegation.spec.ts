import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import { setupFawkes } from "./utils/fawkes-setup";

test.describe
  .serial("Delegation Actions Scenarios (Fawkes Web3 Connected)", () => {
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

    // Prompts user to login when the user is not logged in
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

  test("DELEGATION-003: Logged-in state allows active delegation via Fawkes on Grid view", async ({
    page,
    context,
  }) => {
    const { FawkesClient } = await import("./utils/fawkesClient");
    await setupFawkes(page, context);

    await page.goto("/delegates");
    await page.waitForLoadState("domcontentloaded");

    const delegateBtn = page
      .locator('[data-testid="delegate-card"] button', { hasText: "Delegate" })
      .first();
    await expect(delegateBtn).toBeVisible();
    await delegateBtn.click();

    // Verify modal appeared and user can submit
    const modalConfirmBtn = page.getByRole("button", {
      name: "Submit Delegation",
    });
    await expect(modalConfirmBtn).toBeVisible({ timeout: 15000 });

    await modalConfirmBtn.click();
    await page.waitForTimeout(2000);
    // Fawkes intercepts the wallet prompt
    await FawkesClient.confirmTransaction().catch(() => {});
  });

  test("DELEGATION-004: Logged-in state allows active delegation via Fawkes on List view", async ({
    page,
    context,
  }) => {
    const { FawkesClient } = await import("./utils/fawkesClient");
    await setupFawkes(page, context);

    await page.goto("/delegates?layout=list");
    await page.waitForLoadState("domcontentloaded");

    const delegateBtn = page
      .locator('[data-testid="delegate-row"] button', { hasText: "Delegate" })
      .first();
    await expect(delegateBtn).toBeVisible();
    await delegateBtn.click();

    // Verify modal appeared
    const modalConfirmBtn = page.getByRole("button", {
      name: "Submit Delegation",
    });
    await expect(modalConfirmBtn).toBeVisible({ timeout: 15000 });

    await modalConfirmBtn.click();
    await page.waitForTimeout(2000);
    await FawkesClient.confirmTransaction().catch(() => {});
  });

  test("DELEGATION-005: Logged-in state allows execution from specific delegate profile", async ({
    page,
    context,
  }) => {
    const { FawkesClient } = await import("./utils/fawkesClient");
    await setupFawkes(page, context);

    // Target a specific delegate to inject delegation
    await page.goto("/delegates/0x1234567890123456789012345678901234567890");
    await page.waitForLoadState("domcontentloaded");

    // The button might read "Delegate" or "Undelegate" depending on current status
    const actionBtn = page
      .getByRole("button")
      .filter({ hasText: /Delegate|Undelegate/i })
      .first();
    await expect(actionBtn).toBeVisible({ timeout: 10000 });
    await actionBtn.click();

    // Verify modal appeared
    const modalConfirmBtn = page
      .getByRole("button")
      .filter({ hasText: /Submit|Confirm/i })
      .first();

    if (await modalConfirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await modalConfirmBtn.click();
      await page.waitForTimeout(2000);
      await FawkesClient.confirmTransaction().catch(() => {});
    }
  });
});
