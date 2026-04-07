import { test, expect } from "@playwright/test";

/**
 * Live API proposals tests — no MSW mocks.
 * The server at port 3001 fetches real data from the DAO Node.
 * Assertions are intentionally generic so they work regardless of
 * which specific proposals the API returns at runtime.
 */
test.describe("Proposals List (Live API)", () => {
  test("should render the proposals page with the page heading", async ({
    page,
  }) => {
    await page.goto("/proposals");

    await expect(page.getByText(/All Proposals/i).first()).toBeVisible();
  });

  test("should render at least one proposal link from the API", async ({
    page,
  }) => {
    await page.goto("/proposals");

    // Wait until at least one proposal card link is visible
    const firstProposalLink = page
      .locator('a[href^="/proposals/"]')
      .first();
    await expect(firstProposalLink).toBeVisible();
  });

  test("should default to Relevant filter", async ({ page }) => {
    await page.goto("/proposals");

    await expect(page.getByText(/Relevant/i).first()).toBeVisible();
  });

  test("should open filter dropdown and show Everything option", async ({
    page,
  }) => {
    await page.goto("/proposals");

    const filterButton = page
      .getByRole("button")
      .filter({ hasText: /Relevant/i });
    await filterButton.click();

    await expect(page.getByText(/Everything/i).first()).toBeVisible();
  });

  test("should navigate to proposal detail from the list", async ({ page }) => {
    await page.goto("/proposals");

    // Get the href of the first proposal link so we can assert the URL later
    const firstProposalLink = page.locator('a[href^="/proposals/"]').first();
    await expect(firstProposalLink).toBeVisible();

    const href = await firstProposalLink.getAttribute("href");
    expect(href).toMatch(/^\/proposals\/.+/);

    await firstProposalLink.click();

    // Confirm navigation to the proposal detail page
    await expect(page).toHaveURL(new RegExp(`/proposals/[^/]+`));
  });
});
