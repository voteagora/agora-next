import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";
import { FawkesClient } from "./utils/fawkesClient";
import { setupFawkes } from "./utils/fawkes-setup";

test.describe.serial("User Profile Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    // Suppress encouragement dialog
    await page.addInitScript(() => {
      sessionStorage.setItem("agora-delegation-dialog-shown", "true");
    });
  });

  const authenticateWallet = async (page: any, context: any) => {
    await setupFawkes(page, context);
  };

  test("USER-PRO-001: View my profile' link on logged in menu", async ({
    page,
    context,
  }) => {
    await authenticateWallet(page, context);

    const userMenuButton = page.getByTestId("profile-dropdown-button");
    await expect(userMenuButton).toBeVisible({ timeout: 15000 });

    const isExpanded = await userMenuButton.getAttribute("aria-expanded");
    if (isExpanded !== "true") {
      await userMenuButton.click();
      await page.waitForTimeout(1000);
    }

    const profileLink = page.getByRole("link", { name: "View my profile" });
    await expect(profileLink).toBeVisible({ timeout: 10000 });
  });

  test("USER-PRO-002: Edit delegate statement' link on logged in menu", async ({
    page,
    context,
  }) => {
    await authenticateWallet(page, context);

    const userMenuButton = page.getByTestId("profile-dropdown-button");
    await expect(userMenuButton).toBeVisible({ timeout: 15000 });

    const isExpanded = await userMenuButton.getAttribute("aria-expanded");
    if (isExpanded !== "true") {
      await userMenuButton.click();
      await page.waitForTimeout(1000);
    }

    const editStatementLink = page.getByRole("link", {
      name: "Edit delegate statement",
    });
    await expect(editStatementLink).toBeVisible({ timeout: 10000 });
  });

  test("USER-PRO-003: delegates/create page contains a delegate statement editable text box", async ({
    page,
    context,
  }) => {
    await authenticateWallet(page, context);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const statementBox = page.locator("textarea[name='delegateStatement']");
    await expect(statementBox).toBeVisible({ timeout: 15000 });
  });

  test("USER-PRO-004: delegates/create page contains a View Template link", async ({
    page,
    context,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegate-statement-template")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    await authenticateWallet(page, context);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const templateLinks = page.locator("a", { hasText: /template/i });
    await expect(templateLinks.first()).toBeVisible();
  });

  test("USER-PRO-005: delegates/create page allows user to save social links", async ({
    page,
    context,
  }) => {
    await authenticateWallet(page, context);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const twitterInput = page.locator("input[name='twitter']");
    const discordInput = page.locator("input[name='discord']");
    await expect(twitterInput).toBeVisible({ timeout: 15000 });
    await expect(discordInput).toBeVisible({ timeout: 15000 });
  });

  test("USER-PRO-006: delegates/create page code of conduct checkbox", async ({
    page,
    context,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates/code-of-conduct")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    await authenticateWallet(page, context);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const conductLabel = page
      .getByText(/agree with the/i)
      .filter({ hasText: /code of conduct/i });
    await expect(conductLabel.first()).toBeVisible({ timeout: 15000 });
  });

  test("USER-PRO-007: delegates/create page DAO principles checkbox", async ({
    page,
    context,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates/dao-principles")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    await authenticateWallet(page, context);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const principlesLabel = page
      .getByText(/agree with the/i)
      .filter({ hasText: /principles/i });
    await expect(principlesLabel.first()).toBeVisible({ timeout: 15000 });
  });

  test("USER-PRO-008: delegates/create page email subscription checkbox", async ({
    page,
    context,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("email-subscriptions")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    await authenticateWallet(page, context);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const emailPref = page
      .locator("button[role='checkbox']")
      .filter({ hasText: /Notify me/i })
      .or(page.locator("input[name='email']"));
    await expect(emailPref.first()).toBeVisible();
  });
  test("USER-PRO-009: delegates/create page allows user to configure governance issues", async ({
    page,
    context,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.governanceIssues || ui.governanceIssues.length === 0)
      test.skip(true, "Tenant disabled this feature");

    await authenticateWallet(page, context);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const issuesHeader = page.getByRole("heading", {
      name: "Views on top issues",
    });
    await expect(issuesHeader).toBeVisible({ timeout: 15000 });
  });

  test("USER-PRO-010: delegates/create page allows user to configure a represented stakeholder", async ({
    page,
    context,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.governanceStakeholders || ui.governanceStakeholders.length === 0)
      test.skip(true, "Tenant disabled this feature");

    await authenticateWallet(page, context);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const stakeholderHeader = page.getByRole("heading", {
      name: "Top stakeholders",
    });
    await expect(stakeholderHeader).toBeVisible({ timeout: 15000 });
  });
});
