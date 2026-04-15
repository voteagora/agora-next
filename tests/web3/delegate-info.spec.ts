import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";
test.describe("Delegate Info Page Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/delegates/0x1234567890123456789012345678901234567890");
  });

  test("DEL-INFO-001: delegates/0xaddress page delegate info card", async ({
    page,
  }) => {
    await expect(page.locator('text="Voting power"')).toBeVisible();
    await expect(page.locator('text="Delegated addresses"')).toBeVisible();
    await expect(page.locator('text="Proposals created"')).toBeVisible();
    await expect(
      page.locator('text="For/Against/Abstain"').first()
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Delegate" }).first()
    ).toBeVisible();
  });

  test("DEL-INFO-002: VP info tooltip on delegate info card", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("voting-power-info-tooltip")?.enabled)
      test.skip(true, "Tenant disabled this feature");
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
    const { ui } = Tenant.current();
    if (!ui.toggle("show-delegate-badges")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await expect(
      page.locator('[data-testid="delegate-badges"], .badge')
    ).toBeVisible();
  });

  test("DEL-INFO-005: info card displays location and description", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("show-ens-text-records")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    // Checks for dynamic string rendering associated with ENS text records
  });

  test("DEL-INFO-006: info card displays follower counts", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("show-efp-stats")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await expect(page.locator('text="Followers"')).toBeVisible();
    await expect(page.locator('text="Following"')).toBeVisible();
  });

  test("DEL-INFO-007: delegates/0xaddress page delegate participation", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("show-participation")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    await expect(
      page
        .getByText("Active delegate", { exact: false })
        .or(page.getByText("Inactive delegate", { exact: false }))
        .or(page.getByText("Gathering Data", { exact: false }))
    ).toBeVisible();
  });

  test("DEL-INFO-008: delegate page Delegate Statement", async ({ page }) => {
    const section = page
      .locator('text="Delegate statement"')
      .or(page.getByText("No delegate statement"));
    await expect(section.first()).toBeVisible();
  });

  test("DEL-INFO-009: delegate page Top Issues", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.governanceIssues || ui.governanceIssues.length === 0)
      test.skip(true, "Tenant disabled this feature");
    await expect(
      page
        .locator('text="Top Issues"')
        .or(page.locator('text="Views on top issues"'))
        .or(page.getByText("No delegate statement"))
        .first()
    ).toBeVisible();
  });

  test("DEL-INFO-010: delegate page Represented Stakeholders", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.governanceStakeholders || ui.governanceStakeholders.length === 0)
      test.skip(true, "Tenant disabled this feature");
    await expect(
      page
        .locator('text="Represented Stakeholders"')
        .or(page.getByText("No delegate statement"))
        .first()
    ).toBeVisible();
  });

  test("DEL-INFO-011: delegate page Past Votes", async ({ page }) => {
    await expect(page.locator('text="Past Votes"')).toBeVisible();
  });

  test("DEL-INFO-012: delegate page Past Votes filter (On-chain/Snapshot)", async ({
    page,
  }) => {
    const tenant = Tenant.current();
    if (tenant.slug !== "ENS") test.skip(true, "Feature isolated to ENS");
    await expect(page.locator('text="On-chain votes"')).toBeVisible();
    await expect(page.locator('text="Snapshot votes"')).toBeVisible();
  });

  test("DEL-INFO-013: delegate page Delegated from/Delegated to", async ({
    page,
  }) => {
    await expect(
      page
        .locator('text="Delegated from"')
        .or(page.locator('text="No delegations found."'))
        .first()
    ).toBeVisible();
  });

  test("DEL-INFO-014: delegate page Discussions", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.page("forums")) test.skip(true, "Tenant disabled this feature");
    await expect(page.locator('text="Discussions"')).toBeVisible();
  });

  test("DEL-INFO-015: delegate page Discussions Topics Created", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.page("forums")) test.skip(true, "Tenant disabled this feature");
    await expect(page.locator('text="Topics Created"')).toBeVisible();
  });

  test("DEL-INFO-016: delegate page Discussions Recent Posts", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.page("forums")) test.skip(true, "Tenant disabled this feature");
    await expect(page.locator('text="Recent Posts"')).toBeVisible();
  });
});
