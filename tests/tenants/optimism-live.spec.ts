import { test, expect } from "@playwright/test";

const byTestIdOrText = (page: any, testId: string, text: RegExp | string) =>
  page.getByTestId(testId).or(page.getByText(text).first()).first();

/**
 * Live tests for Optimism — https://vote.optimism.io
 *
 * Covers all proposal types available on the Optimism tenant.
 * Tests run directly against production; no local server required.
 *
 * Proposal matrix:
 * ┌────────────────────────────────────────────────────────────────────────────────────┬──────────────────┬────────────┬────────────┐
 * │ Proposal ID                                                                        │ Title                          │ Type         │ House │
 * ├────────────────────────────────────────────────────────────────────────────────────┼──────────────────┼────────────┼────────────┤
 * │ 95125315478676153337636309965804486010918292377915044655013986825087199254978       │ Security Council S7 Retro      │ standard     │ TH    │
 * │ 28197030874936103651584757576099649781961082558352101632047737121219887503363       │ Security Council Elections: A  │ approval     │ TH    │
 * │ 43611390841042156127733279917289923399354155784945103358272334363949369459237       │ S8 Gov Fund: Developer Adv Bd  │ optimistic   │ TH    │
 * │ 104254402796183118613790552174556993080165650973960750641671478192868760878324      │ S8 Retro Funding: Dev Tooling  │ optimistic   │ CH    │
 * │ 77379844029098348047245706083901850540159595802129942495264753179306805786028       │ Season 8: Intent Ratification  │ standard     │ JH    │
 * │ 104658512477211447238723406913978051219515164565395855005009394415444207632959      │ Dev Advisory Board: Members    │ approval     │ JH    │
 * │ 32872683835969469583703720873380428072981331285364097246290907925181946140808       │ Maintenance Upgrade: 16a       │ optimistic   │ JH    │
 * └────────────────────────────────────────────────────────────────────────────────────┴──────────────────┴────────────┴────────────┘
 */

// ─── Standard proposal — Token House (TH) ────────────────────────────────────
// https://vote.optimism.io/proposals/95125315478676153337636309965804486010918292377915044655013986825087199254978
// Security Council Season 7 Retroactive Funding Request
// Type: standard | House: Token House | Status: EXECUTED

test.describe("[optimism] Standard TH — Security Council S7 Retroactive Funding", () => {
  const PROPOSAL_ID =
    "95125315478676153337636309965804486010918292377915044655013986825087199254978";

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
        /Security Council Season 7 Retroactive/i
      )
    ).toContainText(/Security Council Season 7 Retroactive/i);
  });

  test("should show EXECUTED status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Standard proposals that pass and are executed show EXECUTED
    await expect(
      byTestIdOrText(page, "proposal-status-badge", /^EXECUTED$/)
    ).toHaveText("EXECUTED");
  });

  test("should display FOR / AGAINST vote counts and quorum", async ({
    page,
  }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Standard proposal vote summary: FOR -, AGAINST -, Quorum
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
      byTestIdOrText(page, "proposal-votes-quorum", /29,048,440/)
    ).toContainText(/29,048,440/); // quorum threshold
    await expect(
      byTestIdOrText(page, "proposal-votes-for", /46,330,175/)
    ).toContainText(/46,330,175/); // FOR
    await expect(
      byTestIdOrText(page, "proposal-votes-against", /48,220/)
    ).toContainText(/48,220/); // AGAINST
  });

  test("should show voting activity section", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      byTestIdOrText(page, "proposal-voting-activity-title", /Voting activity/i)
    ).toBeVisible();
  });
});

// ─── Approval proposal — Token House (TH) ────────────────────────────────────
// https://vote.optimism.io/proposals/28197030874936103651584757576099649781961082558352101632047737121219887503363
// Security Council Elections: Cohort A Lead
// Type: approval | House: Token House | Status: SUCCEEDED

test.describe("[optimism] Approval TH — Security Council Elections: Cohort A Lead", () => {
  const PROPOSAL_ID =
    "28197030874936103651584757576099649781961082558352101632047737121219887503363";

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
        /Security Council Elections.*Cohort A/i
      )
    ).toContainText(/Security Council Elections.*Cohort A/i);
  });

  test("should show SUCCEEDED status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Approval proposals that meet quorum show SUCCEEDED
    await expect(
      byTestIdOrText(page, "proposal-status-badge", /^SUCCEEDED$/)
    ).toHaveText("SUCCEEDED");
  });

  test("should render the results panel with candidate details", async ({
    page,
  }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Approval proposals for a single nominee: shows candidate results panel instead of FOR/AGAINST
    await expect(
      byTestIdOrText(page, "proposal-results-tab", /^Results$/)
    ).toBeVisible();
    await expect(
      byTestIdOrText(page, "proposal-results-panel", /^Results$/)
    ).toBeVisible();
    await expect(page.getByText("alisha").first()).toBeVisible();
    await expect(page.getByText("100.00%").first()).toBeVisible();
  });
});

// ─── Optimistic proposal — Token House (TH) ──────────────────────────────────
// https://vote.optimism.io/proposals/43611390841042156127733279917289923399354155784945103358272334363949369459237
// S8 Governance Fund Mission: Developer Advisory Board
// Type: optimistic | House: Token House | Status: SUCCEEDED

test.describe("[optimism] Optimistic TH — S8 Governance Fund Mission: Developer Advisory Board", () => {
  const PROPOSAL_ID =
    "43611390841042156127733279917289923399354155784945103358272334363949369459237";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should display the proposal title", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      byTestIdOrText(page, "proposal-title", /Developer Advisory Board/i)
    ).toContainText(/Developer Advisory Board/i);
  });

  test("should show SUCCEEDED status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Optimistic proposals that were not vetoed show SUCCEEDED
    await expect(
      byTestIdOrText(page, "proposal-status-badge", /^SUCCEEDED$/)
    ).toHaveText("SUCCEEDED");
  });

  test("should display optimistic approval mechanics and veto threshold", async ({
    page,
  }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Optimistic proposals: veto-unless mechanic — pass unless 20% vetoes
    await expect(
      byTestIdOrText(page, "proposal-voting-activity-title", /Voting activity/i)
    ).toBeVisible();
    await expect(
      byTestIdOrText(
        page,
        "proposal-optimistic-summary-title",
        /optimistically/i
      )
    ).toContainText(/optimistically/i);
    await expect(
      byTestIdOrText(
        page,
        "proposal-optimistic-summary-description",
        /automatically pass unless 20% of the votable supply/i
      )
    ).toContainText(/automatically pass unless 20% of the votable supply/i);
    // Exact veto percentage scraped from live page 2026-04-08
    await expect(
      page.getByText(/1\.34% \(1,048,876 OP\) is against/i).first()
    ).toBeVisible();
  });
});

// ─── Optimistic proposal — Citizens House (CH) ───────────────────────────────
// https://vote.optimism.io/proposals/104254402796183118613790552174556993080165650973960750641671478192868760878324
// S8 Retro Funding Mission: Developer Tooling
// Type: optimistic | House: Citizens House | Status: SUCCEEDED

test.describe("[optimism] Optimistic CH — S8 Retro Funding Mission: Developer Tooling", () => {
  const PROPOSAL_ID =
    "104254402796183118613790552174556993080165650973960750641671478192868760878324";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should display the proposal title", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      byTestIdOrText(page, "proposal-title", /Developer Tooling/i)
    ).toContainText(/Developer Tooling/i);
  });

  test("should show SUCCEEDED status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      byTestIdOrText(page, "proposal-status-badge", /^SUCCEEDED$/)
    ).toHaveText("SUCCEEDED");
  });

  test("should display the optimistic voter breakdown results", async ({
    page,
  }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      byTestIdOrText(page, "proposal-results-tab", /^Results$/)
    ).toBeVisible();
    await expect(
      byTestIdOrText(page, "proposal-results-panel", /^Results$/)
    ).toBeVisible();
    await expect(page.getByText("Total Votes").first()).toBeVisible();
    await expect(page.getByText("5.1%").first()).toBeVisible();

    // Verify voter groups
    await expect(page.getByText("Chains").first()).toBeVisible();
    await expect(page.getByText("Apps").first()).toBeVisible();
    await expect(page.getByText("Users").first()).toBeVisible();
  });
});

// ─── Standard proposal — Joint House (JH) ────────────────────────────────────
// https://vote.optimism.io/proposals/77379844029098348047245706083901850540159595802129942495264753179306805786028
// Season 8: Intent Ratification
// Type: standard | House: Joint House | Status: SUCCEEDED

test.describe("[optimism] Standard JH — Season 8: Intent Ratification", () => {
  const PROPOSAL_ID =
    "77379844029098348047245706083901850540159595802129942495264753179306805786028";

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
        /Season 8.*Intent Ratification|Intent Ratification/i
      )
    ).toContainText(/Season 8.*Intent Ratification|Intent Ratification/i);
  });

  test("should show SUCCEEDED status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      byTestIdOrText(page, "proposal-status-badge", /^SUCCEEDED$/)
    ).toHaveText("SUCCEEDED");
  });

  test("should render house-specific vote results", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Standard JH proposals show Results tab with FOR/ABSTAIN/AGAINST column and house breakdown
    await expect(
      byTestIdOrText(page, "proposal-results-tab", /^Results$/)
    ).toBeVisible();
    await expect(
      byTestIdOrText(page, "proposal-results-panel", /^GROUP$/)
    ).toBeVisible();
    await expect(page.getByText("GROUP").first()).toBeVisible();
    await expect(page.getByText("FOR").first()).toBeVisible();
    await expect(page.getByText("AGAINST").first()).toBeVisible();
    await expect(page.getByText("Delegates").first()).toBeVisible();
    await expect(page.getByText("51.16M").first()).toBeVisible();
    await expect(page.getByText(/38%/i).first()).toBeVisible();
  });
});

// ─── Approval proposal — Joint House (JH) ────────────────────────────────────
// https://vote.optimism.io/proposals/104658512477211447238723406913978051219515164565395855005009394415444207632959
// Developer Advisory Board Election: Members
// Type: approval | House: Joint House | Status: SUCCEEDED

test.describe("[optimism] Approval JH — Developer Advisory Board Election: Members", () => {
  const PROPOSAL_ID =
    "104658512477211447238723406913978051219515164565395855005009394415444207632959";

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
        /Developer Advisory Board.*Members|Developer Advisory Board/i
      )
    ).toContainText(
      /Developer Advisory Board.*Members|Developer Advisory Board/i
    );
  });

  test("should show SUCCEEDED status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      byTestIdOrText(page, "proposal-status-badge", /^SUCCEEDED$/)
    ).toHaveText("SUCCEEDED");
  });

  test("should render the approval voting panel with candidates and results", async ({
    page,
  }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Approval JH: multi-candidate approval vote — renders a results/candidates panel
    await expect(
      byTestIdOrText(page, "proposal-results-tab", /^Results$/)
    ).toBeVisible();
    await expect(
      byTestIdOrText(page, "proposal-results-panel", /^Votes$/)
    ).toBeVisible();
    await expect(
      page.getByText("Votes", { exact: true }).first()
    ).toBeVisible();
  });
});

// ─── Optimistic proposal — Joint House (JH) ──────────────────────────────────
// https://vote.optimism.io/proposals/32872683835969469583703720873380428072981331285364097246290907925181946140808
// Maintenance Upgrade: 16a
// Type: optimistic | House: Joint House | Status: SUCCEEDED

test.describe("[optimism] Optimistic JH — Maintenance Upgrade: 16a", () => {
  const PROPOSAL_ID =
    "32872683835969469583703720873380428072981331285364097246290907925181946140808";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should display the proposal title", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      byTestIdOrText(page, "proposal-title", /Maintenance Upgrade.*16a|16a/i)
    ).toContainText(/Maintenance Upgrade.*16a|16a/i);
  });

  test("should show SUCCEEDED status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      byTestIdOrText(page, "proposal-status-badge", /^SUCCEEDED$/)
    ).toHaveText("SUCCEEDED");
  });

  test("should display the optimistic veto threshold and breakdown", async ({
    page,
  }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      byTestIdOrText(page, "proposal-results-tab", /^Results$/)
    ).toBeVisible();
    await expect(
      byTestIdOrText(
        page,
        "proposal-optimistic-summary-title",
        "Proposal has passed"
      )
    ).toContainText("Proposal has passed");
    await expect(
      byTestIdOrText(
        page,
        "proposal-optimistic-summary-description",
        "One of three thresholds are applied, based on the number of groups signaling to veto."
      )
    ).toContainText(
      "One of three thresholds are applied, based on the number of groups signaling to veto."
    );
  });
});
