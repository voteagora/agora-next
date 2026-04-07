import { test, expect } from "@playwright/test";

/**
 * Live tests for Scroll — https://gov.scroll.io
 *
 * Scroll uses the Agora 1/1.1 governance framework.
 *
 * Proposal matrix:
 * ┌───────────────────────────────────────────────────────────────────────────────────┬──────────────────────────────┬──────────────┐
 * │ Proposal ID                                                                       │ Title                        │ Type         │
 * ├───────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────┼──────────────┤
 * │ 17736716284166632362836192914377789635944846939193281594888966652732932587143      │ DAO Treasury Management RFP  │ approval     │
 * └───────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────┴──────────────┘
 */

// ─── Approval proposal — AG 1/1.1 ────────────────────────────────────────────
// https://gov.scroll.io/proposals/17736716284166632362836192914377789635944846939193281594888966652732932587143
// DAO Treasury Management RFP
// Type: approval (AG 1/1.1 top-choices) | Status: SUCCEEDED

test.describe("[scroll] Approval (AG 1/1.1) — DAO Treasury Management RFP", () => {
  const PROPOSAL_ID =
    "17736716284166632362836192914377789635944846939193281594888966652732932587143";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should display the proposal title", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      page.getByText(/DAO Treasury Management|Treasury Management RFP/i).first()
    ).toBeVisible();
  });

  test("should show SUCCEEDED status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Approval (top-choices) proposals that complete with a winner show SUCCEEDED
    await expect(page.getByText("SUCCEEDED", { exact: true }).first()).toBeVisible();
  });

  test("should render approval voting panel with candidates and top-choices results", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Approval AG 1/1.1 renders a top-choices results panel with candidates ranked
    // The three candidates are: 9Summits, Avantgarde, kpk
    await expect(
      page.getByText(/9Summits|Avantgarde|kpk/i).first()
    ).toBeVisible();
  });

  test("should show top-choices voting description", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Top-choices proposals describe the election mechanic
    await expect(
      page.getByText(/top.*choices|top 1 option|voters can select/i).first()
    ).toBeVisible();
  });
});
