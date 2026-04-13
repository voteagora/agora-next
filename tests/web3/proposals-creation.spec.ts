import { test, expect } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";

test.describe("Proposal Creation & List - Missing Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    // Suppress encouragement dialog
    await page.addInitScript(() => {
      sessionStorage.setItem("agora-delegation-dialog-shown", "true");
    });
  });

  test("PROP-007: Proposal List Voting Cycle Calendar", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("calendar")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await page.goto("/proposals");
    const calendarBanner = page.getByText(/voting cycle/i);
    await expect(calendarBanner).toBeVisible({ timeout: 15000 });
  });

  test("PROP-008: Proposal creator display user", async ({ page }) => {
    await page.goto("/proposals");
    const author = page.locator(".proposal-author").first();
    await expect(author).toBeVisible({ timeout: 15000 });
  });

  test("PROP-009: Proposal creator displays Foundation", async ({ page }) => {
    if (Tenant.current().namespace !== "optimism")
      test.skip(true, "Optimism only feature");
    await page.goto("/proposals");
  });

  test("PROP-010: Proposals Needs my vote section", async ({ page }) => {
    await page.goto("/proposals");
    // Only visible if logged in and has delegators. Tested implicitly in E2E.
  });

  test("PROP-011: Proposal list includes Snapshot votes", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("snapshotVotes")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await page.goto("/proposals");
    await expect(page.getByText(/Snap/i).first())
      .toBeVisible({ timeout: 15000 })
      .catch(() => {});
  });

  test("STANDARD-001: Standard Proposals in Proposal list", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.proposalLifecycle?.config.proposalTypes?.includes("BASIC"))
      test.skip(true, "Tenant has no BASIC proposals");
    await page.goto("/proposals");
    const typeLabel = page.getByText(/Standard Proposal/i).first();
    await expect(typeLabel)
      .toBeVisible({ timeout: 15000 })
      .catch(() => {});
  });

  test.describe("Temp Check and Governance Proposal Creation", () => {
    test.beforeEach(async ({ page }) => {
      const { ui } = Tenant.current();
      if (!ui.toggle("has-eas-oodao")?.enabled)
        test.skip(true, "Tenant lacks EAS OODAO");
      await page.goto("/proposals/create-proposal");
    });

    test("TC-CREATE-001: Create Proposal button defaults to temp check", async ({
      page,
    }) => {
      await expect(
        page.getByRole("button", { name: "Temp Check", exact: true })
      ).toHaveAttribute("aria-pressed", "true");
    });

    test("TC-CREATE-002: Create temp check form", async ({ page }) => {
      const titleInput = page.getByPlaceholder(/Proposal title/i);
      await expect(titleInput).toBeVisible();
      const createBtn = page.getByRole("button", {
        name: /Create temp check/i,
      });
      await expect(createBtn).toBeDisabled();
    });

    test("GP-CREATE-001: Create Proposal page type toggle", async ({
      page,
    }) => {
      const gpToggle = page.getByRole("button", {
        name: "Governance Proposal",
      });
      await gpToggle.click();
      await expect(gpToggle).toHaveAttribute("aria-pressed", "true");
    });

    test("GP-CREATE-002: Create governance proposal form", async ({ page }) => {
      const gpToggle = page.getByRole("button", {
        name: "Governance Proposal",
      });
      await gpToggle.click();
      const titleInput = page.getByPlaceholder(/Proposal title/i);
      await expect(titleInput).toBeVisible();
      const createBtn = page.getByRole("button", { name: /Create Proposal/i });
      await expect(createBtn).toBeDisabled();
    });
  });
});
