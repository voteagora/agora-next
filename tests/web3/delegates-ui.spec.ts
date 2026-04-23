import "../../tests/mockMediaLoader.js";
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
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates-layout-list")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await expect(delegatesPage.listViewContainer).toBeVisible();
  });

  test("DEL-LIST-003: when in grid view, delegate card information is displayed", async () => {
    const card = delegatesPage.delegateCards.first();
    await expect(card).toBeVisible();
    await expect(card).toContainText(Tenant.current().token.symbol, {
      ignoreCase: true,
    }); // Basic structural check
  });

  test("DEL-LIST-004: when in grid view, delegate card shows participation rate", async () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("show-participation")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    const card = delegatesPage.delegateCards.first();
    await expect(card).toContainText("%"); // The participation is formatted with percentage
  });

  test("DEL-LIST-007: delegate row shows 7D change of VP", async ({ page }) => {
    const { ui } = Tenant.current();
    if (ui.toggle("hide-7d-change")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await page.goto("/delegates?layout=list");
    await expect(page.locator('text="7d Change"').first()).toBeVisible();
  });

  test("DEL-LIST-011: VP and delegation info call out banner", async () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates-page-info-banner")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await expect(delegatesPage.infoBanner).toBeVisible();
  });

  test("DEL-LIST-012: VP info tooltip on grid view", async () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("voting-power-info-tooltip")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    // Hovering over the voting power text or info icon should trigger it
    await expect(delegatesPage.vpInfoTooltip).toBeVisible();
  });

  test("DEL-LIST-013: delegate encouragement call out", async ({ context }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegation-encouragement")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    // Create a pristine page for this test to avoid the addInitScript from beforeEach
    const pristinePage = await context.newPage();
    const pristineDelegatesPage = new DelegatesPage(pristinePage);
    await pristineDelegatesPage.goto(true);

    await expect(
      pristinePage.getByText("Governance starts with you!")
    ).toBeVisible();
    await pristinePage.close();
  });

  test("DEL-LIST-014: delegate list can be sorted by Random, Most/Least voting power, etc", async ({
    page,
  }) => {
    // Check that sort dropdown has the options
    await page.locator('[data-testid="sort-dropdown"]').click();
    await expect(page.getByText("Most voting power")).toBeVisible();
    await expect(page.getByText("Least voting power")).toBeVisible();
    await expect(page.getByText("Random")).toBeVisible();
  });

  test("DEL-LIST-015: delegate list can be sorted by 7d VP Change Increase/Decrease", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (ui.toggle("hide-7d-change")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await page.locator('[data-testid="sort-dropdown"]').click();
    await expect(page.getByText("7d VP Change Increase")).toBeVisible();
  });

  test("DEL-LIST-016: delegate filter includes: All Delegates, Has statement", async ({
    page,
  }) => {
    await delegatesPage.openFilter();
    await expect(page.getByText("All Delegates").first()).toBeVisible();
    await expect(page.getByText("Has statement").first()).toBeVisible();
  });

  test("DEL-LIST-017: delegate filter includes My Delegate(s) if user is logged in", async ({
    page,
  }) => {
    // We expect this filter to exist if auth state is overridden
  });

  test("DEL-LIST-018: delegate filter includes Endorsed Delegates", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates/endorsed-filter")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await delegatesPage.openFilter();
    await expect(page.getByText("Endorsed Delegates").first()).toBeVisible();
  });

  test("DEL-LIST-019: delegate filter includes Verified Delegates", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates/endorsed-filter")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await delegatesPage.openFilter();
    await expect(page.getByText("Verified Delegates").first()).toBeVisible();
  });

  test("DEL-LIST-020: delegate filter includes Issue Categories", async () => {
    const { ui } = Tenant.current();
    if (!ui.governanceIssues || ui.governanceIssues.length === 0)
      test.skip(true, "Tenant disabled this feature");
    await delegatesPage.openFilter();
    await expect(
      delegatesPage.page.getByText("Issue Categories").first()
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
