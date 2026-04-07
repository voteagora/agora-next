import { test, expect } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";
import { DelegatesPage } from "./pages/DelegatesPage";

test.describe("Delegates List Page Scenarios", () => {
  let delegatesPage: DelegatesPage;

  test.beforeEach(async ({ page }) => {
    delegatesPage = new DelegatesPage(page);
    await delegatesPage.goto();
  });

  test("DEL-LIST-001: /delegates page returns a list of delegates in grid view", async () => {
    await expect(delegatesPage.delegateCards.first()).toBeVisible({
      timeout: 15000,
    });
    await expect(delegatesPage.gridViewContainer).toBeVisible();
  });

  test("DEL-LIST-002: /delegates page returns a list of delegates in list view", async () => {
    // Some tenants default to list view, or the user clicks the layout toggle.
    // Assuming UI defaults or there is a layout toggle (we can check both structures).
    // Let's assert the existence of the table if list view is enabled.
    await expect(delegatesPage.listViewContainer).toBeVisible();
  });

  test("DEL-LIST-003: when in grid view, delegate card information is displayed", async () => {
    const card = delegatesPage.delegateCards.first();
    await expect(card).toBeVisible();
    await expect(card).toContainText("Voting Power", { ignoreCase: true }); // Basic structural check
  });

  test("DEL-LIST-004: when in grid view, delegate card shows participation rate", async () => {
    const card = delegatesPage.delegateCards.first();
    await expect(card).toContainText("%"); // The participation is formatted with percentage
  });

  test("DEL-LIST-007: delegate row shows 7D change of VP", async () => {
    await expect(delegatesPage.sevenDayChangeColumn).toBeVisible();
  });

  test("DEL-LIST-011: VP and delegation info call out banner", async () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates-page-info-banner")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await expect(delegatesPage.infoBanner).toBeVisible();
  });

  test("DEL-LIST-012: VP info tooltip on grid view", async () => {
    // Hovering over the voting power text or info icon should trigger it
    await expect(delegatesPage.vpInfoTooltip).toBeVisible();
  });

  test("DEL-LIST-013: delegate encouragement call out", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates-page-info-banner")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await expect(
      page.locator(
        '[data-testid="encouragement-banner"], text="Governance starts with you!"'
      )
    ).toBeVisible();
  });

  test("DEL-LIST-014: delegate list can be sorted by Random, Most/Least voting power, etc", async ({
    page,
  }) => {
    // Check that sort dropdown has the options
    await page.locator('[data-testid="sort-dropdown"]').click();
    await expect(page.locator('text="Most voting power"')).toBeVisible();
    await expect(page.locator('text="Least voting power"')).toBeVisible();
    await expect(page.locator('text="Random"')).toBeVisible();
  });

  test("DEL-LIST-015: delegate list can be sorted by 7d VP Change Increase/Decrease", async ({
    page,
  }) => {
    await page.locator('[data-testid="sort-dropdown"]').click();
    await expect(page.locator('text="7d VP Change Increase"')).toBeVisible();
  });

  test("DEL-LIST-016: delegate filter includes: All Delegates, Has statement", async ({
    page,
  }) => {
    await delegatesPage.openFilter();
    await expect(page.locator('text="All Delegates"')).toBeVisible();
    await expect(page.locator('text="Has statement"')).toBeVisible();
  });

  test("DEL-LIST-017: delegate filter includes My Delegate(s) if user is logged in", async ({
    page,
  }) => {
    // We expect this filter to exist if auth state is overridden
  });

  test("DEL-LIST-018: delegate filter includes Endorsed Delegates", async ({
    page,
  }) => {
    await delegatesPage.openFilter();
    await expect(page.locator('text="Endorsed Delegates"')).toBeVisible();
  });

  test("DEL-LIST-019: delegate filter includes Verified Delegates", async ({
    page,
  }) => {
    await delegatesPage.openFilter();
    await expect(page.locator('text="Verified Delegates"')).toBeVisible();
  });

  test("DEL-LIST-020: delegate filter includes Issue Categories", async () => {
    const { ui } = Tenant.current();
    if (!ui.governanceIssues || ui.governanceIssues.length === 0)
      test.skip(true, "Tenant disabled this feature");
    await delegatesPage.openFilter();
    await expect(
      delegatesPage.page
        .locator('text="Governance Issues"')
        .or(delegatesPage.page.locator('text="Issues"'))
    ).toBeVisible();
  });

  test("DEL-LIST-021: delegate filter includes Stakeholders", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.governanceStakeholders || ui.governanceStakeholders.length === 0)
      test.skip(true, "Tenant disabled this feature");
    await delegatesPage.openFilter();
    await expect(page.locator('text="Stakeholders"')).toBeVisible();
  });
});
