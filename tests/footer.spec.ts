import { test, expect } from "@playwright/test";
import { getMockTenant } from "./helpers/mockTenant";

/**
 * Footer Tests
 *
 * These tests verify that the correct footer links and supply metrics are
 * present based on each tenant's link and toggle configuration defined in
 * src/lib/tenant/configs/ui/.
 *
 * The footer is rendered by DAOMetricsHeader ( src/components/Metrics/DAOMetricsHeader.jsx )
 * which reads tenant links and toggles at runtime.  Links / metrics guarded by
 * a disabled toggle or absent link config are skipped with test.skip() so they
 * do not produce false failures on tenants that haven't configured the feature.
 *
 * Tests are run against the locally running dev server (baseURL: http://127.0.0.1:3000).
 * The footer is only visible on sm+ breakpoints (hidden sm:flex).
 */
test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    // The footer uses Tailwind's `hidden sm:flex` — ensure a desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    // Navigate to a page that mounts the global layout (and therefore the footer)
    await page.goto("/");

    // In dev mode, Next.js may show an "Unhandled Runtime Error" overlay when the
    // database is unavailable (e.g. during local development without a DB).  Dismiss
    // it so the underlying footer is accessible for the assertions below.
    const errorDialog = page.getByRole("dialog", {
      name: /unhandled runtime error/i,
    });
    if (await errorDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
      await errorDialog.getByRole("button", { name: /close/i }).click();
    }
  });

  // ──────────────────────────────────────────────────────────────
  // FOOTER-001 – Governance Forum link (controlled by "governance-forum" link)
  // ──────────────────────────────────────────────────────────────
  test("FOOTER-001: Footer contains a Governance Forum link when governance-forum link is configured", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    const governanceForumLink = ui.link("governance-forum");
    if (!governanceForumLink) {
      test.skip(true, "Tenant has no governance-forum link configured");
    }

    const forumAnchor = page.getByTestId("footer-governance-forum-link");

    await expect(forumAnchor).toBeVisible();
    await expect(forumAnchor).toHaveAttribute("href", governanceForumLink!.url);
  });

  // ──────────────────────────────────────────────────────────────
  // FOOTER-002 – Report bugs & feedback (controlled by "bugs" link)
  // ──────────────────────────────────────────────────────────────
  test("FOOTER-002: Footer contains a Report bugs & feedback link when bugs link is configured", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    const bugsLink = ui.link("bugs");
    if (!bugsLink) {
      test.skip(true, "Tenant has no bugs link configured");
    }

    const bugsAnchor = page.getByTestId("footer-bugs-link");

    await expect(bugsAnchor).toBeVisible();
    await expect(bugsAnchor).toHaveAttribute("href", bugsLink!.url);
  });

  // ──────────────────────────────────────────────────────────────
  // FOOTER-003 – Change log (controlled by "changelog" link and
  //              the absence of the "footer/hide-changelog" toggle)
  // ──────────────────────────────────────────────────────────────
  test("FOOTER-003: Footer contains a Change log link when changelog link is configured and not hidden", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    const changeLogLink = ui.link("changelog");
    const hideChangelog = ui.toggle("footer/hide-changelog")?.enabled;

    if (!changeLogLink || hideChangelog) {
      test.skip(
        true,
        "Tenant has no changelog link or it is hidden via footer/hide-changelog toggle"
      );
    }

    const changelogAnchor = page.getByTestId("footer-changelog-link");

    await expect(changelogAnchor).toBeVisible();
    await expect(changelogAnchor).toHaveAttribute("href", changeLogLink!.url);
  });

  // ──────────────────────────────────────────────────────────────
  // FOOTER-004 – FAQ link (controlled by "faq" link)
  // ──────────────────────────────────────────────────────────────
  test("FOOTER-004: Footer contains a FAQ link when faq link is configured", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    const faqLink = ui.link("faq");
    if (!faqLink) {
      test.skip(true, "Tenant has no faq link configured");
    }

    const faqAnchor = page.getByTestId("footer-faq-link");

    await expect(faqAnchor).toBeVisible();
    await expect(faqAnchor).toHaveAttribute("href", faqLink!.url);
  });

  // ──────────────────────────────────────────────────────────────
  // FOOTER-005 – Discord icon link (controlled by "discord" link)
  // ──────────────────────────────────────────────────────────────
  test("FOOTER-005: Footer contains a Discord icon link when discord link is configured", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    const discordLink = ui.link("discord");
    if (!discordLink) {
      test.skip(true, "Tenant has no discord link configured");
    }

    const discordAnchor = page.getByTestId("footer-discord-link");

    await expect(discordAnchor).toBeVisible();
    await expect(discordAnchor).toHaveAttribute("href", discordLink!.url);
  });

  // ──────────────────────────────────────────────────────────────
  // FOOTER-006 – X (Twitter) icon link (controlled by "townstwitter" link)
  // ──────────────────────────────────────────────────────────────
  test("FOOTER-006: Footer contains an X icon link when townstwitter link is configured", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    const twitterLink = ui.link("townstwitter");
    if (!twitterLink) {
      test.skip(true, "Tenant has no townstwitter link configured");
    }

    const xAnchor = page.getByTestId("footer-twitter-link");

    await expect(xAnchor).toBeVisible();
    await expect(xAnchor).toHaveAttribute("href", twitterLink!.url);
  });

  // ──────────────────────────────────────────────────────────────
  // FOOTER-007 – Farcaster icon link (controlled by "townsfarcaster" link)
  // ──────────────────────────────────────────────────────────────
  test("FOOTER-007: Footer contains a Farcaster icon link when townsfarcaster link is configured", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    const farcasterLink = ui.link("townsfarcaster");
    if (!farcasterLink) {
      test.skip(true, "Tenant has no townsfarcaster link configured");
    }

    const farcasterAnchor = page.getByTestId("footer-farcaster-link");

    await expect(farcasterAnchor).toBeVisible();
    await expect(farcasterAnchor).toHaveAttribute("href", farcasterLink!.url);
  });

  // ──────────────────────────────────────────────────────────────
  // FOOTER-008 – Total supply (controlled by "footer/hide-total-supply" toggle)
  // ──────────────────────────────────────────────────────────────
  test("FOOTER-008: Footer contains Total Supply when footer/hide-total-supply toggle is NOT enabled", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    if (ui.toggle("footer/hide-total-supply")?.enabled) {
      test.skip(true, "Tenant has footer/hide-total-supply toggle enabled");
    }

    await expect(page.getByTestId("footer-total-supply")).toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────
  // FOOTER-009 – Votable supply (controlled by "footer/hide-votable-supply" toggle)
  // ──────────────────────────────────────────────────────────────
  test("FOOTER-009: Footer contains Votable Supply when footer/hide-votable-supply toggle is NOT enabled", async ({
    page,
  }) => {
    const { ui } = getMockTenant();
    if (ui.toggle("footer/hide-total-supply")?.enabled) {
      test.skip(true, "Tenant has footer/hide-total-supply toggle enabled");
    }
    if (ui.toggle("footer/hide-votable-supply")?.enabled) {
      test.skip(true, "Tenant has footer/hide-votable-supply toggle enabled");
    }

    await expect(page.getByTestId("footer-votable-supply")).toBeVisible();
  });
});
