import { test, expect } from "@playwright/test";

const byTestIdOrText = (page: any, testId: string, text: RegExp | string) =>
  page.getByTestId(testId).or(page.getByText(text).first()).first();

/**
 * Live tests for ENS DAO — https://agora.ensdao.org
 *
 * ENS uses the OpenZeppelin governance (OZ-gov) framework and also supports
 * Snapshot voting (copeland / ranked-choice).
 *
 * Proposal matrix:
 * ┌───────────────────────────────────────────────────────────────────────────────────────────┬────────────────────────────────────┬──────────────────────┐
 * │ Proposal ID / Hash                                                                        │ Title                              │ Type                 │
 * ├───────────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────┼──────────────────────┤
 * │ 12950686153984121876325788121804936905339482144562527684056466889156345680789              │ [EP 6.23] Endowment karpatkey #6  │ standard (OZ-gov)    │
 * │ 0x98c65ac02f738ddb430fcd723ea5852a45168550b3daf20f75d5d508ecf28aa1                        │ [EP 6.10] Select providers SPP2   │ copeland (snapshot)  │
 * └───────────────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────┴──────────────────────┘
 */

// ─── Standard proposal — OZ-gov ──────────────────────────────────────────────
// https://agora.ensdao.org/proposals/12950686153984121876325788121804936905339482144562527684056466889156345680789
// [EP 6.23] [Executable] Endowment permissions to karpatkey - Update #6
// Type: standard (OZ-gov) | Status: EXECUTED

test.describe("[ens] Standard (OZ-gov) — [EP 6.23] Endowment permissions to karpatkey", () => {
  const PROPOSAL_ID =
    "12950686153984121876325788121804936905339482144562527684056466889156345680789";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should display the proposal title", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      byTestIdOrText(page, "proposal-title", /EP 6\.23|Endowment.*karpatkey/i)
    ).toContainText(/EP 6\.23|Endowment.*karpatkey/i);
  });

  test("should show EXECUTED status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // OZ-gov standard proposals that pass and execute show EXECUTED
    await expect(
      byTestIdOrText(page, "proposal-status-badge", /^EXECUTED$/)
    ).toHaveText("EXECUTED");
  });

  test("should display FOR / AGAINST vote counts and quorum (OZ-gov standard)", async ({
    page,
  }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // OZ-gov standard proposals render FOR / AGAINST labels and Quorum
    await expect(
      byTestIdOrText(page, "proposal-votes-for", /FOR\s*-/i)
    ).toBeVisible();
    await expect(
      byTestIdOrText(page, "proposal-votes-against", /AGAINST\s*-/i)
    ).toBeVisible();
    await expect(
      byTestIdOrText(page, "proposal-votes-quorum", /Quorum/i)
    ).toBeVisible();
    // Exact vote totals scraped from live page 2026-04-08
    await expect(
      byTestIdOrText(page, "proposal-votes-for", /1,229,861/)
    ).toContainText(/1,229,861/); // FOR
    await expect(
      byTestIdOrText(page, "proposal-votes-quorum", /1,000,000/)
    ).toContainText(/1,000,000/); // quorum threshold
  });
});

// ─── Snapshot Copeland proposal ───────────────────────────────────────────────
// https://agora.ensdao.org/proposals/0x98c65ac02f738ddb430fcd723ea5852a45168550b3daf20f75d5d508ecf28aa1
// [EP 6.10] [Social] Select providers for Service Provider Program Season II
// Type: snapshot copeland (ranked-choice) | Status: CLOSED

test.describe("[ens] Snapshot Copeland (ranked-choice) — [EP 6.10] Select providers for SPP2", () => {
  const PROPOSAL_ID =
    "0x98c65ac02f738ddb430fcd723ea5852a45168550b3daf20f75d5d508ecf28aa1";

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
        /EP 6\.10|Select providers|Service Provider Program/i
      )
    ).toContainText(/EP 6\.10|Select providers|Service Provider Program/i);
  });

  test("should show CLOSED status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Snapshot copeland proposals that are finished show CLOSED
    await expect(
      byTestIdOrText(page, "proposal-status-badge", /^CLOSED$/)
    ).toHaveText("CLOSED");
  });

  test("should render ranked-choice / copeland voting results", async ({
    page,
  }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Copeland/ranked-choice proposals render a results panel with candidates
    // (not a simple FOR / AGAINST summary)
    await expect(
      byTestIdOrText(page, "proposal-results-tab", /^Results$/)
    ).toBeVisible();
    await expect(
      byTestIdOrText(page, "proposal-results-panel", /Results|Rank|Provider/i)
    ).toBeVisible();
  });
});
