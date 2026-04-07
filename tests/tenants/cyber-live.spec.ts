import { test, expect } from "@playwright/test";

/**
 * Live tests for Cyber — https://gov.cyber.co
 *
 * Cyber uses the Agora 1/1.1 governance framework.
 *
 * Proposal matrix:
 * ┌───────────────────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────┬──────────────┐
 * │ Proposal ID                                                                       │ Title                                   │ Type         │
 * ├───────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────┼──────────────┤
 * │ 51864681802578431055051774372360255768364008881797769364315800242780425500096      │ Setting CYBER Staking Incentives Q2 '25 │ standard     │
 * └───────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────┴──────────────┘
 */

// ─── Standard proposal — AG 1/1.1 ────────────────────────────────────────────
// https://gov.cyber.co/proposals/51864681802578431055051774372360255768364008881797769364315800242780425500096
// Setting CYBER Staking Incentives for Q2 2025
// Type: standard (AG 1/1.1) | Status: Ended (no on-chain execution badge)

test.describe("[cyber] Standard (AG 1/1.1) — Setting CYBER Staking Incentives for Q2 2025", () => {
  const PROPOSAL_ID =
    "51864681802578431055051774372360255768364008881797769364315800242780425500096";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should display the proposal title", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      page.getByText(/CYBER Staking Incentives.*Q2|Staking Incentives for Q2/i).first()
    ).toBeVisible();
  });

  test("should display FOR vote count and quorum (AG 1/1.1 standard)", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // AG 1/1.1 standard proposals render FOR / AGAINST labels and Quorum threshold
    await expect(page.getByText(/FOR\s*-/i).first()).toBeVisible();
    await expect(page.getByText(/Quorum/i).first()).toBeVisible();
    // Exact values scraped from live page 2026-04-08
    await expect(page.getByText(/365,648/).first()).toBeVisible(); // FOR votes
    await expect(page.getByText(/129,139/).first()).toBeVisible(); // quorum value
    await expect(page.getByText(/Threshold 51%/i).first()).toBeVisible();
  });

  test("should show voting activity section", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page.getByText(/Voting activity/i).first()).toBeVisible();
  });

  test("should display the proposal end date", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Proposal ended on Apr 10, 2025
    await expect(page.getByText(/Apr 10, 2025|Ended/i).first()).toBeVisible();
  });
});
