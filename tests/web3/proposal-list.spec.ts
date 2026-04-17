import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";
import { setupFawkes } from "./utils/fawkes-setup";

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

  test("PROP-002: Create Proposal button visibility for connected user", async ({
    page,
    context,
  }) => {
    await setupFawkes(page, context);
    await page.goto("/proposals");

    // Create proposal button should be visible when authenticated
    const createBtn = page
      .getByRole("button", { name: /Create Proposal/i })
      .first()
      .or(page.getByRole("link", { name: /Create Proposal/i }).first());

    await expect(createBtn).toBeVisible({ timeout: 15000 });
  });

  test("PROP-003: Create Proposal button popup choice", async ({
    page,
    context,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("safe-proposal-choice")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    await setupFawkes(page, context);
    await page.goto("/proposals");

    const createBtn = page
      .getByRole("button", { name: /Create Proposal/i })
      .first()
      .or(page.getByRole("link", { name: /Create Proposal/i }).first());
    await createBtn.click();

    // Verify popup interaction for Safe proposals if applicable
    const popupText = page.getByText(/Create as/i).first();
    await expect(popupText).toBeVisible({ timeout: 10000 });
  });

  test("PROP-004: Proposal Choose Proposal Flow pop up interactions", async ({
    page,
    context,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("safe-proposal-choice")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    await setupFawkes(page, context);
    await page.goto("/proposals");

    const createBtn = page
      .getByRole("button", { name: /Create Proposal/i })
      .first()
      .or(page.getByRole("link", { name: /Create Proposal/i }).first());
    await createBtn.click();

    // Select the direct governance track if available
    const directTrackBtn = page
      .getByRole("button", { name: /Standard/i })
      .first();
    if (await directTrackBtn.isVisible()) {
      await directTrackBtn.click();
      await expect(page).toHaveURL(/.*create-proposal/);
    }
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
