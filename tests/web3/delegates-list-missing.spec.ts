import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";

test.describe("Delegates List Page - Missing Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    // Suppress encouragement dialog and set grid view off
    await page.addInitScript(() => {
      sessionStorage.setItem("agora-delegation-dialog-shown", "true");
      localStorage.setItem("viewToggle", "list");
    });
    await page.goto("/delegates");
    await page.waitForLoadState("domcontentloaded");
  });

  test("DEL-LIST-005: when in list view, delegate information is displayed", async ({
    page,
  }) => {
    const listContainer = page.getByTestId("delegates-list-container");
    await expect(listContainer).toBeVisible({ timeout: 15000 });
    const firstRow = listContainer.locator("> div").first();
    await expect(firstRow).toBeVisible();

    // Check address/ENS
    await expect(
      firstRow.getByText(/0x[a-fA-F0-9]{4}...[a-fA-F0-9]{4}|.eth/)
    ).toBeVisible();
    // Check VP formatting
    await expect(firstRow.getByText(/[0-9]+(\.[0-9]+)?(k|M)?/i)).toBeVisible();
  });

  test("DEL-LIST-006: when in list view, delegate row shows participation rate", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("show-participation")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    const listContainer = page.getByTestId("delegates-list-container");
    await expect(listContainer).toBeVisible({ timeout: 15000 });
    const firstRow = listContainer.locator("> div").first();
    await expect(
      firstRow.getByText(/%\s*voted/i).or(firstRow.getByText(/Inactive/i))
    ).toBeVisible();
  });

  test("DEL-LIST-008: delegate search by ENS or Address", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search by Address or ENS Name/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("0x0000000000000000000000000000000000000000");
    await page.waitForTimeout(1000); // Wait for debounce
  });

  test("DEL-LIST-009: delegate row in list view is clickable", async ({
    page,
  }) => {
    const listContainer = page.getByTestId("delegates-list-container");
    await expect(listContainer).toBeVisible({ timeout: 15000 });
    const firstRow = listContainer.locator("> div a").first();
    const href = await firstRow.getAttribute("href");
    expect(href).toContain("/delegates/");
  });

  test("DEL-LIST-010: delegate info card in grid view is clickable", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("viewToggle", "grid");
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const gridContainer = page.getByTestId("delegates-grid-container");
    await expect(gridContainer).toBeVisible({ timeout: 15000 });
    const firstCard = gridContainer.locator("> div a").first();
    const href = await firstCard.getAttribute("href");
    expect(href).toContain("/delegates/");
  });
});
