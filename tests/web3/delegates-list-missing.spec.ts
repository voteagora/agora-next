import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";
import { delegatesPath } from "./utils/delegatesLayout";

test.describe("Delegates List Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("agora-delegation-dialog-shown", "true");
    });
  });

  test("DEL-LIST-005: when in list view, delegate information is displayed", async ({
    page,
  }) => {
    await page.goto(delegatesPath("list"));
    await page.waitForLoadState("domcontentloaded");

    const listContainer = page.getByTestId("delegates-list-container");
    await expect(listContainer).toBeVisible({ timeout: 15000 });
    const firstRow = page.getByTestId("delegate-row").first();
    await expect(firstRow).toBeVisible();

    await expect(
      firstRow.getByText(/0x[a-fA-F0-9]{2,4}\.\.\.[a-fA-F0-9]{4}|[\w.-]+\.eth\b/i)
    ).toBeVisible();
    await expect(
      firstRow.getByRole("cell").filter({ hasText: /[0-9]+(\.[0-9]+)?(k|M)?/i }).first()
    ).toBeVisible();
  });

  test("DEL-LIST-006: when in list view, delegate row shows participation rate", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("show-participation")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    await page.goto(delegatesPath("list"));
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByTestId("delegates-list-container")).toBeVisible({
      timeout: 15000,
    });
    const firstRow = page.getByTestId("delegate-row").first();
    await expect(
      firstRow
        .getByText(/%\s*voted/i)
        .or(firstRow.getByText(/Inactive/i))
        .or(firstRow.getByRole("cell", { name: /^\d+%$/ }))
    ).toBeVisible();
  });

  test("DEL-LIST-008: delegate search by ENS or Address", async ({ page }) => {
    await page.goto(delegatesPath());
    await page.waitForLoadState("domcontentloaded");

    const searchInput = page.getByPlaceholder(/Exact ENS or address/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("0x0000000000000000000000000000000000000000");
    await page.waitForTimeout(1000);
  });

  test("DEL-LIST-009: delegate row in list view is clickable", async ({
    page,
  }) => {
    await page.goto(delegatesPath("list"));
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByTestId("delegates-list-container")).toBeVisible({
      timeout: 15000,
    });
    const firstRow = page.getByTestId("delegate-row").first();
    await firstRow.click();
    await expect(page).toHaveURL(/\/delegates\/0x[a-fA-F0-9]{40}/i);
  });

  test("DEL-LIST-010: delegate info card in grid view is clickable", async ({
    page,
  }) => {
    await page.goto(delegatesPath("grid"));
    await page.waitForLoadState("domcontentloaded");

    const gridContainer = page.getByTestId("delegates-grid-container");
    await expect(gridContainer).toBeVisible({ timeout: 15000 });
    const firstCard = page.getByTestId("delegate-card").first().locator("a");
    await expect(firstCard).toBeVisible();
    const href = await firstCard.getAttribute("href");
    expect(href).toContain("/delegates/");
  });
});
