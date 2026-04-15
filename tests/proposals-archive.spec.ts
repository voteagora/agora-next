/**
 * E2E tests: Archive proposal list and detail pages with mock CPLS fixtures.
 *
 * The mock CPLS server (started in tests/global-setup.ts) intercepts GCS
 * requests made by the Next.js server, serving fixtures from
 * src/__mocks__/dao_node/ and src/__mocks__/eas-atlas/.
 *
 * List-page assertions use `data-testid="proposal-list-item-{id}"` on the row
 * and `data-testid="proposal-status"` for the status pill.
 *
 * Detail-page assertions use:
 *   - `data-testid="proposal-title"` for the proposal title
 *   - `data-testid="proposal-status-badge"` for the status badge
 */

import { test, expect } from "@playwright/test";

// ── Shared ID prefix helpers ──────────────────────────────────────────────────

function syntheticId(n: number): string {
  return `99000000000000000000000000000000000000000000000000000000000000000000000000${String(n).padStart(3, "0")}`;
}

// ── Expected statuses (matches deriveStatus.mockFixtures.test.ts EXPECTED map) ─

const LIST_CASES: Array<{
  id: string;
  expectedStatus: string;
  label: string;
}> = [
  // ──── Synthetic dao_node ────────────────────────────────────────────────────
  {
    id: syntheticId(1),
    expectedStatus: "defeated",
    label: "Standard — quorum not met",
  },
  {
    id: syntheticId(2),
    expectedStatus: "defeated",
    label: "Standard — approval threshold not met",
  },
  {
    id: syntheticId(3),
    expectedStatus: "cancelled",
    label: "Standard — cancelled",
  },
  {
    id: syntheticId(4),
    expectedStatus: "queued",
    label: "Standard — queued",
  },
  {
    id: syntheticId(5),
    expectedStatus: "passed",
    label: "Standard — passed (signal-only)",
  },
  {
    id: syntheticId(6),
    expectedStatus: "defeated",
    label: "Hybrid Standard — defeated",
  },
  {
    id: syntheticId(7),
    expectedStatus: "defeated",
    label: "Approval — quorum not met",
  },
  {
    id: syntheticId(8),
    expectedStatus: "defeated",
    label: "Approval — max choices not reached",
  },
  {
    id: syntheticId(9),
    expectedStatus: "defeated",
    label: "Hybrid Approval — quorum not met",
  },
  {
    id: syntheticId(10),
    expectedStatus: "succeeded",
    label: "Hybrid Approval — top-choices succeeded",
  },
  {
    id: syntheticId(11),
    expectedStatus: "defeated",
    label: "Optimistic — vetoed",
  },
  {
    id: syntheticId(12),
    expectedStatus: "defeated",
    label: "Hybrid Optimistic Tiered — vetoed",
  },
  // ──── Synthetic eas-atlas ────────────────────────────────────────────────────
  {
    id: syntheticId(13),
    expectedStatus: "defeated",
    label: "Offchain Optimistic — vetoed",
  },
  {
    id: syntheticId(14),
    expectedStatus: "succeeded",
    label: "Offchain Standard — succeeded",
  },
  {
    id: syntheticId(17),
    expectedStatus: "succeeded",
    label: "Offchain Approval — succeeded",
  },
  {
    id: syntheticId(18),
    expectedStatus: "defeated",
    label: "Offchain Approval — insufficient voters",
  },
  {
    id: syntheticId(19),
    expectedStatus: "defeated",
    label: "Offchain Approval — quorum not met",
  },
  {
    id: syntheticId(20),
    expectedStatus: "succeeded",
    label: "Offchain Optimistic Tiered — succeeded",
  },
  {
    id: syntheticId(21),
    expectedStatus: "defeated",
    label: "Offchain Optimistic Tiered — vetoed",
  },
  // ──── Real dao_node proposals ────────────────────────────────────────────────
  {
    id: "104658512477211447238723406913978051219515164565395855005009394415444207632959",
    expectedStatus: "succeeded",
    label: "Real Hybrid Approval — succeeded",
  },
  {
    id: "28197030874936103651584757576099649781961082558352101632047737121219887503363",
    expectedStatus: "succeeded",
    label: "Real Approval — succeeded",
  },
  {
    id: "32872683835969469583703720873380428072981331285364097246290907925181946140808",
    expectedStatus: "succeeded",
    label: "Real Hybrid Optimistic Tiered — succeeded",
  },
  {
    id: "77379844029098348047245706083901850540159595802129942495264753179306805786028",
    expectedStatus: "succeeded",
    label: "Real Hybrid Standard — succeeded",
  },
];

// ── List-page tests ───────────────────────────────────────────────────────────

test.describe("Proposals archive list – mock fixtures", () => {
  test.beforeEach(async ({ page }) => {
    // Use ?filter=everything to include cancelled proposals too
    await page.goto("/proposals?filter=everything");

    // Wait for at least one proposal row to appear before asserting specifics
    await page.waitForSelector('[data-testid^="proposal-list-item-"]', {
      timeout: 30000,
    });
  });

  for (const { id, expectedStatus, label } of LIST_CASES) {
    test(`list row: ${label} → ${expectedStatus}`, async ({ page }) => {
      const row = page.getByTestId(`proposal-list-item-${id}`);
      await expect(row).toBeVisible({ timeout: 15000 });

      // All status pills within the row should agree on the expected status.
      // BaseRowLayout renders the status pill once (mobile) or twice (desktop).
      const statusPills = row.getByTestId("proposal-status");
      const count = await statusPills.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        await expect(statusPills.nth(i)).toHaveText(expectedStatus);
      }
    });
  }

  test("list row: real executed standard proposal", async ({ page }) => {
    const id =
      "95125315478676153337636309965804486010918292377915044655013986825087199254978";
    const row = page.getByTestId(`proposal-list-item-${id}`);
    await expect(row).toBeVisible({ timeout: 15000 });

    const statusPills = row.getByTestId("proposal-status");
    const count = await statusPills.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(statusPills.nth(i)).toHaveText("executed");
    }
  });

  test("list row: real succeeded eas-atlas optimistic proposal", async ({
    page,
  }) => {
    const id =
      "104254402796183118613790552174556993080165650973960750641671478192868760878324";
    const row = page.getByTestId(`proposal-list-item-${id}`);
    await expect(row).toBeVisible({ timeout: 15000 });

    const statusPills = row.getByTestId("proposal-status");
    const count = await statusPills.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(statusPills.nth(i)).toHaveText("succeeded");
    }
  });
});

// ── Detail-page tests ─────────────────────────────────────────────────────────

/**
 * Helper: navigate to a proposal detail page, wait for the title to appear,
 * and return the page for further assertions.
 */
async function gotoDetail(page: any, id: string) {
  await page.goto(`/proposals/${id}`);
  await page.getByTestId("proposal-title").waitFor({ timeout: 30000 });
}

test.describe("Proposals archive detail – Standard", () => {
  // FOR/AGAINST use specialFormatting (round to integer, comma-separated).
  // Quorum uses the same formatting. Threshold is in basis-points / 100.
  // Values are derived directly from the mock fixture JSON.

  test("STANDARD defeated (quorum not met): exact vote values", async ({
    page,
  }) => {
    // fixture 001: for=900K, against=100K, quorum≈29.05M, threshold=51%
    await gotoDetail(page, syntheticId(1));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "DEFEATED"
    );
    await expect(page.getByTestId("proposal-votes-for")).toHaveText(
      "FOR - 900,000"
    );
    await expect(page.getByTestId("proposal-votes-against")).toHaveText(
      "AGAINST - 100,000"
    );
    await expect(page.getByTestId("proposal-votes-quorum")).toContainText(
      "29,048,440"
    );
    await expect(page.getByTestId("proposal-votes-threshold")).toHaveText(
      "Threshold 51%"
    );
  });

  test("STANDARD defeated (approval threshold not met): exact vote values", async ({
    page,
  }) => {
    // fixture 002: for=10M, against=25M, quorum≈29.05M, threshold=51%
    await gotoDetail(page, syntheticId(2));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "DEFEATED"
    );
    await expect(page.getByTestId("proposal-votes-for")).toHaveText(
      "FOR - 10,000,000"
    );
    await expect(page.getByTestId("proposal-votes-against")).toHaveText(
      "AGAINST - 25,000,000"
    );
    await expect(page.getByTestId("proposal-votes-quorum")).toContainText(
      "29,048,440"
    );
    await expect(page.getByTestId("proposal-votes-threshold")).toHaveText(
      "Threshold 51%"
    );
  });

  test("STANDARD cancelled: badge only", async ({ page }) => {
    await gotoDetail(page, syntheticId(3));
    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "CANCELLED"
    );
  });

  test("STANDARD queued: badge only", async ({ page }) => {
    await gotoDetail(page, syntheticId(4));
    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "QUEUED"
    );
  });

  test("Real STANDARD executed: exact vote values", async ({ page }) => {
    // Real proposal: for≈46.33M, against≈48K, quorum≈29.05M, threshold=51%
    await gotoDetail(
      page,
      "95125315478676153337636309965804486010918292377915044655013986825087199254978"
    );
    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "EXECUTED"
    );
    await expect(page.getByTestId("proposal-votes-for")).toHaveText(
      "FOR - 46,330,175"
    );
    await expect(page.getByTestId("proposal-votes-against")).toHaveText(
      "AGAINST - 48,220"
    );
    await expect(page.getByTestId("proposal-votes-quorum")).toContainText(
      "29,048,440"
    );
    await expect(page.getByTestId("proposal-votes-threshold")).toHaveText(
      "Threshold 51%"
    );
  });
});

test.describe("Proposals archive detail – Hybrid Standard", () => {
  test("HYBRID_STANDARD defeated: quorum Not Met + group breakdown", async ({
    page,
  }) => {
    await gotoDetail(page, syntheticId(6));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "DEFEATED"
    );
    // Quorum status chip shows Not Met for defeated
    await expect(page.getByTestId("proposal-quorum-status")).toHaveText(
      "Not Met"
    );
    // Hybrid standard shows Delegates, Chains, Apps, Users groups
    for (const group of ["delegates", "chains", "apps", "users"]) {
      await expect(
        page.getByTestId(`proposal-vote-group-${group}`)
      ).toBeVisible();
    }
  });
});

test.describe("Proposals archive detail – Approval", () => {
  test("APPROVAL defeated: results panel visible + badge", async ({ page }) => {
    await gotoDetail(page, syntheticId(7));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "DEFEATED"
    );
    await expect(page.getByTestId("proposal-results-panel")).toBeVisible();
  });

  test("HYBRID_APPROVAL succeeded: results panel visible + badge", async ({
    page,
  }) => {
    await gotoDetail(page, syntheticId(10));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "SUCCEEDED"
    );
    await expect(page.getByTestId("proposal-results-panel")).toBeVisible();
  });
});

test.describe("Proposals archive detail – Optimistic", () => {
  test("OPTIMISTIC defeated: exact optimistic summary values", async ({
    page,
  }) => {
    // fixture 011: against=30M, total_voting_power=116036238 OP,
    //   disapprovalThreshold=20% (2000 bps), againstRelativeAmount=25.85%
    await gotoDetail(page, syntheticId(11));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "DEFEATED"
    );
    await expect(
      page.getByTestId("proposal-optimistic-summary-title")
    ).toHaveText("This proposal is optimistically defeated");
    // Description contains disapproval threshold, current against %, and against amount
    await expect(
      page.getByTestId("proposal-optimistic-summary-description")
    ).toContainText("20%");
    await expect(
      page.getByTestId("proposal-optimistic-summary-description")
    ).toContainText("25.85%");
    await expect(
      page.getByTestId("proposal-optimistic-summary-description")
    ).toContainText("30,000,000");
  });

  test("HYBRID_OPTIMISTIC_TIERED vetoed: Proposal Vetoed title + veto tier explanation + all veto groups", async ({
    page,
  }) => {
    // fixture 012: tiers=[55,45,35], delegates≈62% and users=60% both ≥ 55%
    //   → twoGroups tier tripped (2 groups exceed 55%)
    await gotoDetail(page, syntheticId(12));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "DEFEATED"
    );
    await expect(
      page.getByTestId("proposal-optimistic-summary-title")
    ).toHaveText("Proposal Vetoed");
    await expect(
      page.getByTestId("proposal-optimistic-summary-description")
    ).toContainText("2 groups tripped the 55%-threshold");
    // Tiered card shows individual veto-group bars
    for (const group of ["chains", "apps", "users", "delegates"]) {
      await expect(
        page.getByTestId(`proposal-veto-group-${group}`)
      ).toBeVisible();
    }
  });
});

test.describe("Proposals archive detail – Offchain Standard", () => {
  test("OFFCHAIN_STANDARD succeeded: quorum Met + group breakdown + badge", async ({
    page,
  }) => {
    await gotoDetail(page, syntheticId(14));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "SUCCEEDED"
    );
    await expect(page.getByTestId("proposal-quorum-status")).toHaveText("Met");
    for (const group of ["chains", "apps", "users"]) {
      await expect(
        page.getByTestId(`proposal-vote-group-${group}`)
      ).toBeVisible();
    }
  });
});

test.describe("Proposals archive detail – Offchain Optimistic", () => {
  test("OFFCHAIN_OPTIMISTIC vetoed: group breakdown + badge", async ({
    page,
  }) => {
    await gotoDetail(page, syntheticId(13));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "DEFEATED"
    );
    for (const group of ["chains", "apps", "users"]) {
      await expect(
        page.getByTestId(`proposal-vote-group-${group}`)
      ).toBeVisible();
    }
  });

  test("OFFCHAIN_OPTIMISTIC_TIERED succeeded: group breakdown + badge", async ({
    page,
  }) => {
    await gotoDetail(page, syntheticId(20));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "SUCCEEDED"
    );
    for (const group of ["chains", "apps", "users"]) {
      await expect(
        page.getByTestId(`proposal-vote-group-${group}`)
      ).toBeVisible();
    }
  });

  test("OFFCHAIN_OPTIMISTIC_TIERED vetoed: group breakdown + badge", async ({
    page,
  }) => {
    await gotoDetail(page, syntheticId(21));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "DEFEATED"
    );
    for (const group of ["chains", "apps", "users"]) {
      await expect(
        page.getByTestId(`proposal-vote-group-${group}`)
      ).toBeVisible();
    }
  });
});

test.describe("Proposals archive detail – Offchain Approval", () => {
  test("OFFCHAIN_APPROVAL succeeded: results panel + badge", async ({
    page,
  }) => {
    await gotoDetail(page, syntheticId(17));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "SUCCEEDED"
    );
    await expect(page.getByTestId("proposal-results-panel")).toBeVisible();
  });

  test("OFFCHAIN_APPROVAL defeated: results panel + badge", async ({
    page,
  }) => {
    await gotoDetail(page, syntheticId(18));

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "DEFEATED"
    );
    await expect(page.getByTestId("proposal-results-panel")).toBeVisible();
  });
});

test.describe("Proposals archive detail – Real archived proposals", () => {
  test("Real eas-atlas OFFCHAIN_OPTIMISTIC succeeded: group against counts + percentages", async ({
    page,
  }) => {
    // outcome: APP→1 against, USER→143 against, CHAIN→0 against
    // OFFCHAIN_THRESHOLDS: APP=100, USER=1000, CHAIN=15
    await gotoDetail(
      page,
      "104254402796183118613790552174556993080165650973960750641671478192868760878324"
    );

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "SUCCEEDED"
    );
    // Group names
    for (const group of ["chains", "apps", "users"]) {
      await expect(
        page.getByTestId(`proposal-vote-group-${group}`)
      ).toBeVisible();
    }
    // Against vote counts
    await expect(
      page.getByTestId("proposal-vote-group-chains-againstVotes")
    ).toHaveText("0");
    await expect(
      page.getByTestId("proposal-vote-group-apps-againstVotes")
    ).toHaveText("1");
    await expect(
      page.getByTestId("proposal-vote-group-users-againstVotes")
    ).toHaveText("143");
    // Veto percentages (against / eligibleCount * 100, toFixed(1))
    await expect(
      page.getByTestId("proposal-vote-group-chains-votePercentage")
    ).toHaveText("0.0%");
    await expect(
      page.getByTestId("proposal-vote-group-apps-votePercentage")
    ).toHaveText("1.0%");
    await expect(
      page.getByTestId("proposal-vote-group-users-votePercentage")
    ).toHaveText("14.3%");
  });

  test("Real dao_node HYBRID_APPROVAL succeeded: results panel", async ({
    page,
  }) => {
    await gotoDetail(
      page,
      "104658512477211447238723406913978051219515164565395855005009394415444207632959"
    );

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "SUCCEEDED"
    );
    await expect(page.getByTestId("proposal-results-panel")).toBeVisible();
  });

  test("Real dao_node APPROVAL succeeded: results panel", async ({ page }) => {
    await gotoDetail(
      page,
      "28197030874936103651584757576099649781961082558352101632047737121219887503363"
    );

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "SUCCEEDED"
    );
    await expect(page.getByTestId("proposal-results-panel")).toBeVisible();
  });

  test("Real dao_node HYBRID_OPTIMISTIC_TIERED succeeded: Proposal has passed + veto groups", async ({
    page,
  }) => {
    // tiers=[1100,1400,1700] bps → normalized [17,14,11]%
    // no group exceeds 11% threshold → Proposal has passed
    await gotoDetail(
      page,
      "32872683835969469583703720873380428072981331285364097246290907925181946140808"
    );

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "SUCCEEDED"
    );
    await expect(
      page.getByTestId("proposal-optimistic-summary-title")
    ).toHaveText("Proposal has passed");
    for (const group of ["chains", "apps", "users", "delegates"]) {
      await expect(
        page.getByTestId(`proposal-veto-group-${group}`)
      ).toBeVisible();
    }
  });

  test("Real dao_node HYBRID_STANDARD succeeded: quorum Met + group vote counts + weights", async ({
    page,
  }) => {
    // govless outcome: APP→for=3, CHAIN→for=5, USER→against=9,for=537,abstain=22
    // HYBRID_VOTE_WEIGHTS: delegates=50%, chains/apps/users=16.67% each
    await gotoDetail(
      page,
      "77379844029098348047245706083901850540159595802129942495264753179306805786028"
    );

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "SUCCEEDED"
    );
    await expect(page.getByTestId("proposal-quorum-status")).toHaveText("Met");
    // All 4 group names visible
    for (const group of ["delegates", "chains", "apps", "users"]) {
      await expect(
        page.getByTestId(`proposal-vote-group-${group}`)
      ).toBeVisible();
    }
    // Citizen group voter counts (raw counts, not wei)
    await expect(
      page.getByTestId("proposal-vote-group-chains-forVotes")
    ).toHaveText("5");
    await expect(
      page.getByTestId("proposal-vote-group-apps-forVotes")
    ).toHaveText("3");
    await expect(
      page.getByTestId("proposal-vote-group-users-forVotes")
    ).toHaveText("537");
    await expect(
      page.getByTestId("proposal-vote-group-users-againstVotes")
    ).toHaveText("9");
    await expect(
      page.getByTestId("proposal-vote-group-users-abstainVotes")
    ).toHaveText("22");
    // Group vote-weight columns
    await expect(
      page.getByTestId("proposal-vote-group-delegates-weight")
    ).toHaveText("50.00");
    await expect(
      page.getByTestId("proposal-vote-group-chains-weight")
    ).toHaveText("16.67");
  });

  test("Real dao_node OPTIMISTIC succeeded: exact optimistic summary values", async ({
    page,
  }) => {
    // against≈1.05M OP, total_voting_power=116036238 OP, disapprovalThreshold=20%
    // againstRelativeAmount = 1048876.39 / 116036238 * 100 ≈ 0.90%
    await gotoDetail(
      page,
      "43611390841042156127733279917289923399354155784945103358272334363949369459237"
    );

    await expect(page.getByTestId("proposal-status-badge")).toHaveText(
      "SUCCEEDED"
    );
    await expect(
      page.getByTestId("proposal-optimistic-summary-title")
    ).toHaveText("This proposal is optimistically approved");
    await expect(
      page.getByTestId("proposal-optimistic-summary-description")
    ).toContainText("20%");
    await expect(
      page.getByTestId("proposal-optimistic-summary-description")
    ).toContainText("0.9%");
    await expect(
      page.getByTestId("proposal-optimistic-summary-description")
    ).toContainText("1,048,876");
  });
});
