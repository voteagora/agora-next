import { test, expect } from "@playwright/test";
import { getMockTenant } from "./helpers/mockTenant";

/**
 * Header Navigation Tests
 *
 * These tests verify that the correct nav links are present in the header
 * based on each tenant's toggle/feature configuration defined in
 * src/lib/tenant/configs/ui/.
 *
 * Toggle-controlled links are conditionally rendered by Navbar.jsx reading
 * the active tenant's TenantUI config.  Tests that require a disabled toggle
 * are skipped automatically so they don't produce false failures on tenants
 * that have not enabled the feature.
 *
 * Tests are run against the locally running dev server (baseURL: http://127.0.0.1:3000).
 */
test.describe("Header Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ──────────────────────────────────────────────────────────────
  // HEAD-NAV-001 – Voters link  (always present when delegates toggle is on)
  // ──────────────────────────────────────────────────────────────
  test("HEAD-NAV-001: Voters link is present and links to /delegates", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    if (!ui.toggle("delegates")?.enabled) {
      test.skip(true, "Tenant has delegates toggle disabled");
    }

    const votersLink = page.getByTestId("nav-delegates");

    await expect(votersLink).toBeVisible();
    await expect(votersLink).toHaveAttribute("href", "/delegates");
  });

  // ──────────────────────────────────────────────────────────────
  // HEAD-NAV-002 – Proposals link
  // ──────────────────────────────────────────────────────────────
  test("HEAD-NAV-002: Proposals link is present and links to /proposals", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    if (!ui.toggle("proposals")?.enabled) {
      test.skip(true, "Tenant has proposals toggle disabled");
    }

    const proposalsLink = page.getByTestId("nav-proposals");

    await expect(proposalsLink).toBeVisible();

    // Most tenants point to /proposals; some override with a custom href
    const href = await proposalsLink.getAttribute("href");
    expect(href).toBeTruthy();
    if (!ui.page("proposals")?.href) {
      expect(href).toBe("/proposals");
    }
  });

  // ──────────────────────────────────────────────────────────────
  // HEAD-NAV-003 – Discussions link (controlled by "forums" toggle)
  // ──────────────────────────────────────────────────────────────
  test("HEAD-NAV-003: Discussions link is present and links to /forums when forums toggle is enabled", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    if (!ui.toggle("forums")?.enabled) {
      test.skip(true, "Tenant has forums toggle disabled");
    }

    const discussionsLink = page.getByTestId("nav-forums");

    await expect(discussionsLink).toBeVisible();
    await expect(discussionsLink).toHaveAttribute("href", "/forums");
  });

  // ──────────────────────────────────────────────────────────────
  // HEAD-NAV-004 – Grants link (controlled by "grants" toggle)
  // ──────────────────────────────────────────────────────────────
  test("HEAD-NAV-004: Grants link is present and links to /grants when grants toggle is enabled", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    if (!ui.toggle("grants")?.enabled) {
      test.skip(true, "Tenant has grants toggle disabled");
    }

    const grantsLink = page.getByTestId("nav-grants");

    await expect(grantsLink).toBeVisible();
    await expect(grantsLink).toHaveAttribute("href", "/grants");
  });

  // ──────────────────────────────────────────────────────────────
  // HEAD-NAV-005 – Info link (controlled by "info" toggle)
  // ──────────────────────────────────────────────────────────────
  test("HEAD-NAV-005: Info link is present and links to /info when info toggle is enabled", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    if (!ui.toggle("info")?.enabled) {
      test.skip(true, "Tenant has info toggle disabled");
    }

    const infoLink = page.getByTestId("nav-info");

    await expect(infoLink).toBeVisible();
    await expect(infoLink).toHaveAttribute("href", "/info");
  });

  // ──────────────────────────────────────────────────────────────
  // HEAD-NAV-006 – Governance link (controlled by "coming-soon" toggle)
  // ──────────────────────────────────────────────────────────────
  test("HEAD-NAV-006: Governance link is present and links to /coming-soon when coming-soon toggle is enabled", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    if (!ui.toggle("coming-soon")?.enabled) {
      test.skip(true, "Tenant has coming-soon toggle disabled");
    }

    const governanceLink = page.getByTestId("nav-coming-soon");

    await expect(governanceLink).toBeVisible();
    await expect(governanceLink).toHaveAttribute("href", "/coming-soon");
  });
});
