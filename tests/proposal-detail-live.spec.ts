import { test, expect } from "@playwright/test";

/**
 * Live API proposal detail tests — no MSW mocks.
 * The server at port 3001 fetches real data from the DAO Node.
 *
 * Proposals under test:
 *  1. 95125315478676153337636309965804486010918292377915044655013986825087199254978  (unknown title)
 *  2. 28197030874936103651584757576099649781961082558352101632047737121219887503363   Security Council Elections: Cohort A Lead   (STANDARD)
 *  3. 43611390841042156127733279917289923399354155784945103358272334363949369459237   S8 Governance Fund Mission: Developer Advisory Board  (OPTIMISTIC)
 *  4. 104254402796183118613790552174556993080165650973960750641671478192868760878324  (unknown title)
 *  5. 77379844029098348047245706083901850540159595802129942495264753179306805786028   Season 8: Intent Ratification  (STANDARD)
 *  6. 104658512477211447238723406913978051219515164565395855005009394415444207632959  Developer Advisory Board Election: Members  (APPROVAL)
 *  7. 32872683835969469583703720873380428072981331285364097246290907925181946140808   Maintenance Upgrade: 16a  (OPTIMISTIC)
 */

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Status badge values the ProposalStatusDetail component may render. */
const STATUS_PATTERN =
  /ACTIVE|CLOSED|SUCCEEDED|DEFEATED|EXECUTED|CANCELLED|QUEUED|FAILED/;

// ─── Proposal 1 ─────────────────────────────────────────────────────────────

test.describe("Proposal 95125315…254978", () => {
  const PROPOSAL_ID =
    "95125315478676153337636309965804486010918292377915044655013986825087199254978";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Verify we land on the correct URL
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should render a proposal status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    const statusBadge = page.getByText(STATUS_PATTERN).first();
    await expect(statusBadge).toBeVisible();
  });

  test("should render the voting activity section", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page.getByText(/Voting activity/i).first()).toBeVisible();
  });
});

// ─── Proposal 2 ─────────────────────────────────────────────────────────────

test.describe("Proposal 28197030…503363 — Security Council Elections: Cohort A Lead", () => {
  const PROPOSAL_ID =
    "28197030874936103651584757576099649781961082558352101632047737121219887503363";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should display the proposal title", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      page.getByText(/Security Council Elections.*Cohort A/i).first()
    ).toBeVisible();
  });

  test("should render a proposal status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    const statusBadge = page.getByText(STATUS_PATTERN).first();
    await expect(statusBadge).toBeVisible();
  });

  test("should render the results panel with candidate details", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Approval proposals for a single nominee: shows candidate results panel instead of FOR/AGAINST
    await expect(page.getByText("Results", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("alisha").first()).toBeVisible();
    await expect(page.getByText("100.00%").first()).toBeVisible();
  });
});

// ─── Proposal 3 ─────────────────────────────────────────────────────────────

test.describe("Proposal 43611390…459237 — S8 Governance Fund Mission: Developer Advisory Board", () => {
  const PROPOSAL_ID =
    "43611390841042156127733279917289923399354155784945103358272334363949369459237";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should display the proposal title", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      page.getByText(/Developer Advisory Board/i).first()
    ).toBeVisible();
  });

  test("should render a proposal status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    const statusBadge = page.getByText(STATUS_PATTERN).first();
    await expect(statusBadge).toBeVisible();
  });

  test("should render optimistic voting activity", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Optimistic proposals render "Voting activity" header
    await expect(page.getByText(/Voting activity/i).first()).toBeVisible();
    // And show the optimistic pass/veto status
    await expect(page.getByText(/optimistically/i).first()).toBeVisible();
  });
});

// ─── Proposal 4 ─────────────────────────────────────────────────────────────

test.describe("Proposal 104254402…878324", () => {
  const PROPOSAL_ID =
    "104254402796183118613790552174556993080165650973960750641671478192868760878324";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should render a proposal status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    const statusBadge = page.getByText(STATUS_PATTERN).first();
    await expect(statusBadge).toBeVisible();
  });

  test("should render the voting activity section", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page.getByText(/Voting activity/i).first()).toBeVisible();
  });
});

// ─── Proposal 5 ─────────────────────────────────────────────────────────────

test.describe("Proposal 77379844…786028 — Season 8: Intent Ratification", () => {
  const PROPOSAL_ID =
    "77379844029098348047245706083901850540159595802129942495264753179306805786028";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should display the proposal title", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      page.getByText(/Season 8.*Intent Ratification|Intent Ratification/i).first()
    ).toBeVisible();
  });

  test("should render a proposal status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    const statusBadge = page.getByText(STATUS_PATTERN).first();
    await expect(statusBadge).toBeVisible();
  });

  test("should render house-specific vote results", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Standard JH proposals show Results tab with FOR/ABSTAIN/AGAINST column and house breakdown
    await expect(page.getByText("Results", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("GROUP").first()).toBeVisible();
    await expect(page.getByText("FOR").first()).toBeVisible();
    await expect(page.getByText("AGAINST").first()).toBeVisible();
    await expect(page.getByText("Delegates").first()).toBeVisible();
    await expect(page.getByText("51.16M").first()).toBeVisible();
    await expect(page.getByText(/Quorum Met 38%/i).first()).toBeVisible();
  });
});

// ─── Proposal 6 ─────────────────────────────────────────────────────────────

test.describe("Proposal 104658512…632959 — Developer Advisory Board Election: Members", () => {
  const PROPOSAL_ID =
    "104658512477211447238723406913978051219515164565395855005009394415444207632959";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should display the proposal title", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      page.getByText(/Developer Advisory Board Election.*Members|Developer Advisory Board/i).first()
    ).toBeVisible();
  });

  test("should render a proposal status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    const statusBadge = page.getByText(STATUS_PATTERN).first();
    await expect(statusBadge).toBeVisible();
  });

  test("should render approval results panel", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    // Approval proposals use ApprovalVotesPanel which has a Results/Votes tab structure
    await expect(page.getByText("Results", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Votes", { exact: true }).first()).toBeVisible();
  });
});

// ─── Proposal 7 ─────────────────────────────────────────────────────────────

test.describe("Proposal 32872683…140808 — Maintenance Upgrade: 16a", () => {
  const PROPOSAL_ID =
    "32872683835969469583703720873380428072981331285364097246290907925181946140808";

  test("should load the proposal detail page", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page).toHaveURL(new RegExp(`/proposals/${PROPOSAL_ID}`));
  });

  test("should display the proposal title", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(
      page.getByText(/Maintenance Upgrade.*16a|16a/i).first()
    ).toBeVisible();
  });

  test("should render a proposal status badge", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    const statusBadge = page.getByText(STATUS_PATTERN).first();
    await expect(statusBadge).toBeVisible();
  });

  test("should display the optimistic veto threshold and breakdown", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page.getByText("Results", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Proposal has passed").first()).toBeVisible();
    await expect(page.getByText("One of three thresholds are applied, based on the number of groups signaling to veto.").first()).toBeVisible();
  });

  test("should indicate this is a veto-type vote", async ({ page }) => {
    await page.goto(`/proposals/${PROPOSAL_ID}`);
    await expect(page.getByText(/automatically pass unless|votable supply/i).first()).toBeVisible();
  });
});
