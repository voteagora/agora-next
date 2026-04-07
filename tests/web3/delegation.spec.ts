import { test, expect } from "@playwright/test";

test.describe("Delegation Actions Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/delegates");
  });

  test("DELEGATION-001: /delegates page delegate button on a delegate info card in grid view", async ({
    page,
  }) => {
    // Prompts user to login when the user is not logged in
    await page
      .locator('[data-testid="delegate-card"] button', { hasText: "Delegate" })
      .first()
      .click();
    await expect(
      page.locator('text="Connect Wallet"').or(page.locator('text="Sign In"'))
    ).toBeVisible();
  });

  test("DELEGATION-002: /delegates page delegate button on a delegate row in list view", async ({
    page,
  }) => {
    await page
      .locator('[data-testid="delegate-row"] button', { hasText: "Delegate" })
      .first()
      .click();
    await expect(
      page.locator('text="Connect Wallet"').or(page.locator('text="Sign In"'))
    ).toBeVisible();
  });

  test("DELEGATION-003: /delegates page undelegate button on a delegate info card in grid view", async ({
    page,
  }) => {
    test.skip(
      true,
      "Requires Synpress authentication flow - button reads undelegate when user is logged in"
    );
  });

  test("DELEGATION-004: /delegates page undelegate button on a delegate row in list view", async ({
    page,
  }) => {
    test.skip(
      true,
      "Requires Synpress authentication flow - button reads undelegate when user is logged in"
    );
  });

  test("DELEGATION-005: delegates/0xaddress page delegate button", async ({
    page,
  }) => {
    await page.goto("/delegates/0x1234567890123456789012345678901234567890");
    // Button is present for logged out users to prompt connect wallet
    await page.getByRole("button", { name: "Delegate" }).first().click();
    await expect(
      page.locator('text="Connect Wallet"').or(page.locator('text="Sign In"'))
    ).toBeVisible();
  });

  test("DELEGATION-006: delegates/0xaddress page undelegate button", async ({
    page,
  }) => {
    test.skip(
      true,
      "Requires Synpress authentication flow - button reads Undelegate if user is logged in"
    );
  });

  test("DELEGATION-007: delegation prompt offers full delegation", async ({
    page,
  }) => {
    // Note: controlled by delegationModel in src/lib/tenant/configs/contracts/
    test.skip(true, "Requires Synpress authentication flow");
  });

  test("DELEGATION-008: delegation prompt offers partial delegation", async ({
    page,
  }) => {
    // Note: controlled by delegationModel in src/lib/tenant/configs/contracts/
    test.skip(true, "Requires Synpress authentication flow");
  });
});
