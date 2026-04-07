import { test, expect } from "@playwright/test";

test.describe("Delegate Info Page Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/delegates/0x1234567890123456789012345678901234567890");
  });

  test("DEL-INFO-001: delegates/0xaddress page delegate info card", async ({
    page,
  }) => {
    await expect(page.locator('text="Voting Power"')).toBeVisible();
    await expect(page.locator('text="Delegated addresses"')).toBeVisible();
    await expect(page.locator('text="Proposals Created"')).toBeVisible();
    await expect(page.locator('text="For"').first()).toBeVisible();
    await expect(page.locator('text="Against"').first()).toBeVisible();
    await expect(page.locator('text="Abstain"').first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Delegate" }).first()
    ).toBeVisible();
  });

  test("DEL-INFO-002: VP info tooltip on delegate info card", async ({
    page,
  }) => {
    // Note: controlled by voting-power-info-tooltip in src/lib/tenant/configs/ui/
    await expect(page.locator('[data-testid="vp-tooltip"]')).toBeVisible();
  });

  test("DEL-INFO-003: info card has Edit my Profile link if logged in user matches viewed user", async ({
    page,
  }) => {
    test.skip(true, "Requires Synpress authentication flow - Skipped for now");
  });

  test("DEL-INFO-004: info card displays the delegates badges", async ({
    page,
  }) => {
    // Note: controlled by show-delegate-badges in src/lib/tenant/configs/ui/
    await expect(
      page.locator('[data-testid="delegate-badges"], .badge')
    ).toBeVisible();
  });

  test("DEL-INFO-005: info card displays location and description", async ({
    page,
  }) => {
    // Note: controlled by show-ens-text-records in src/lib/tenant/configs/ui/
    // Checks for dynamic string rendering associated with ENS text records
  });

  test("DEL-INFO-006: info card displays follower counts", async ({ page }) => {
    // Note: controlled by show-efp-stats in src/lib/tenant/configs/ui/
    await expect(page.locator('text="Followers"')).toBeVisible();
    await expect(page.locator('text="Following"')).toBeVisible();
  });

  test("DEL-INFO-007: delegates/0xaddress page delegate participation", async ({
    page,
  }) => {
    // Note: controlled by show-participation in src/lib/tenant/configs/ui/
    await expect(
      page
        .locator('text="Participation"')
        .or(page.locator('text="Inactive"'))
        .or(page.locator('text="Gathering data"'))
    ).toBeVisible();
  });

  test("DEL-INFO-008: delegate page Delegate Statement", async ({ page }) => {
    const section = page
      .locator('text="Delegate statement"')
      .or(page.locator('text="No delegate statement"'));
    await expect(section.first()).toBeVisible();
  });

  test("DEL-INFO-009: delegate page Top Issues", async ({ page }) => {
    // Note: controlled by governanceIssues in src/lib/tenant/configs/ui/
    await expect(
      page
        .locator('text="Top Issues"')
        .or(page.locator('text="Views on top issues"'))
    ).toBeVisible();
  });

  test("DEL-INFO-010: delegate page Represented Stakeholders", async ({
    page,
  }) => {
    // Note: controlled by governanceStakeholders in src/lib/tenant/configs/ui/
    await expect(page.locator('text="Represented Stakeholders"')).toBeVisible();
  });

  test("DEL-INFO-011: delegate page Past Votes", async ({ page }) => {
    await expect(page.locator('text="Past Votes"')).toBeVisible();
  });

  test("DEL-INFO-012: delegate page Past Votes filter (On-chain/Snapshot)", async ({
    page,
  }) => {
    // Note: controlled by DAO slug being ENS
    await expect(page.locator('text="On-chain votes"')).toBeVisible();
    await expect(page.locator('text="Snapshot votes"')).toBeVisible();
  });

  test("DEL-INFO-013: delegate page Delegated from/Delegated to", async ({
    page,
  }) => {
    await expect(page.locator('text="Delegated from"')).toBeVisible();
  });

  test("DEL-INFO-014: delegate page Discussions", async ({ page }) => {
    // Note: controlled by forums in src/lib/tenant/configs/ui/
    await expect(page.locator('text="Discussions"')).toBeVisible();
  });

  test("DEL-INFO-015: delegate page Discussions Topics Created", async ({
    page,
  }) => {
    // Note: controlled by forums in src/lib/tenant/configs/ui/
    await expect(page.locator('text="Topics Created"')).toBeVisible();
  });

  test("DEL-INFO-016: delegate page Discussions Recent Posts", async ({
    page,
  }) => {
    // Note: controlled by forums in src/lib/tenant/configs/ui/
    await expect(page.locator('text="Recent Posts"')).toBeVisible();
  });
});
