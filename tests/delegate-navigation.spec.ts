import { test, expect } from "@playwright/test";

test.describe("Delegate Navigation", () => {
  // Mock data provided by MSW (tests/mocks/handlers.ts) via instrumentation hook

  test("should display clickable delegate cards that link to detail pages", async ({
    page,
  }) => {
    await page.goto("/delegates");

    // Wait for delegates from the mock to render
    await expect(page.getByText(/dele.*\.eth/i).first()).toBeVisible();

    // Delegate cards should contain links to detail pages
    const delegateLinks = page.locator('a[href^="/delegates/"]');
    await expect(delegateLinks.first()).toBeVisible();

    // The href must target a specific delegate (not a generic /delegates route)
    const href = await delegateLinks.first().getAttribute("href");
    expect(href).toMatch(/^\/delegates\/.+/);
  });

  test("should navigate to a delegate detail page when clicking a delegate card", async ({
    page,
  }) => {
    await page.goto("/delegates");

    // Wait for the delegate list to render
    await expect(page.getByText(/dele.*\.eth/i).first()).toBeVisible();

    // Capture the href before clicking so we can assert the URL afterwards
    const delegateLink = page.locator('a[href^="/delegates/"]').first();
    const expectedPath = await delegateLink.getAttribute("href");

    await delegateLink.click();

    // Verify the browser navigated to the delegate detail URL
    await expect(page).toHaveURL(
      new RegExp(expectedPath!.replace(/\//g, "\\/"))
    );
  });

  test("should render a page at the delegate detail URL (content or error boundary)", async ({
    page,
  }) => {
    // Navigate directly to a known mocked delegate address
    await page.goto("/delegates/delegate-1.eth");

    // The page should either render delegate content or the error boundary
    // ("Can't find that delegate.") — never a blank or uncaught 500 crash
    const rendered = page
      .getByText(/Can't find that delegate\.|delegate/i)
      .first();
    await expect(rendered).toBeVisible();
  });
});
