import { test, expect } from "@playwright/test";

const byTestIdOrText = (page: any, testId: string, text: RegExp | string) =>
  page.getByTestId(testId).or(page.getByText(text).first()).first();

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
      byTestIdOrText(
        page,
        "proposal-title",
        /CYBER Staking Incentives.*Q2|Staking Incentives for Q2/i
      )
    ).toContainText(/CYBER Staking Incentives.*Q2|Staking Incentives for Q2/i);
  });

  test("should display FOR vote count and quorum (AG 1/1.1 standard)", async ({
    page,
  }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // AG 1/1.1 standard proposals render FOR / AGAINST labels and Quorum threshold
    await expect(
      byTestIdOrText(page, "proposal-votes-for", /FOR\s*-/i)
    ).toBeVisible();
    await expect(
      byTestIdOrText(page, "proposal-votes-quorum", /Quorum/i)
    ).toBeVisible();
    // Exact values scraped from live page 2026-04-08
    await expect(
      byTestIdOrText(page, "proposal-votes-for", /365,648/)
    ).toContainText(/365,648/); // FOR votes
    await expect(
      byTestIdOrText(page, "proposal-votes-quorum", /129,139/)
    ).toContainText(/129,139/); // quorum value
    await expect(
      byTestIdOrText(page, "proposal-votes-threshold", /Threshold 51%/i)
    ).toContainText(/Threshold 51%/i);
  });

  test("should show voting activity section", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      byTestIdOrText(page, "proposal-voting-activity-title", /Voting activity/i)
    ).toBeVisible();
  });

  test("should display the proposal end date", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Proposal ended on Apr 10, 2025
    await expect(page.getByText(/Apr 10, 2025|Ended/i).first()).toBeVisible();
  });
});
