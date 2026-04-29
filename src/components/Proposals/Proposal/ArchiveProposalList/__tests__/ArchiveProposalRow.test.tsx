/**
 * Proposal list row UI tests
 *
 * For each synthetic mock fixture we render the appropriate ArchiveProposalRow
 * and assert that:
 *   - the row container is present (`data-testid="proposal-list-item-{id}"`)
 *   - the proposal title is rendered
 *   - the status pill (`data-testid="proposal-status-{id}"`) shows the expected text
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(cleanup);
import { readFileSync } from "fs";
import { join } from "path";

// ── Mocks (must come before any component imports) ──────────────────────────

vi.mock("server-only", () => ({}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      namespace: "optimism",
      slug: "OP",
      token: { decimals: 18, symbol: "OP" },
      ui: {
        toggle: (_name: string) => ({ enabled: false }),
        organization: { title: "Optimism Foundation" },
        customization: {},
      },
      contracts: {
        token: { chain: { id: 10 } },
        chainForTime: { id: 10 },
      },
    }),
  },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/shared/ENSName", () => ({
  default: ({ address }: { address: string }) => (
    <span data-testid="ens-name">{address?.slice(0, 6)}</span>
  ),
}));

vi.mock(
  "@/components/Proposals/Proposal/ProposalTimeStatus",
  () => ({
    default: () => <span data-testid="time-status" />,
  }),
  { virtual: true }
);

// ── Component under test ─────────────────────────────────────────────────────

import React from "react";
import { ArchiveProposalRow } from "../ArchiveProposalRow";

// ── Fixture helpers ───────────────────────────────────────────────────────────

const MOCK_ROOT = join(__dirname, "../../../../../../tests/__mocks__");

function loadProposal(source: "dao_node" | "eas-atlas", id: string) {
  return JSON.parse(
    readFileSync(join(MOCK_ROOT, source, `${id}.json`), "utf8")
  );
}

/**
 * Expected status label (lowercase, as rendered by ProposalStatus).
 * Matches the EXPECTED map in deriveStatus.mockFixtures.test.ts.
 */
const LIST_CASES: Array<{
  source: "dao_node" | "eas-atlas";
  id: string;
  expectedStatus: string;
  label: string;
}> = [
  // ──── Standard (dao_node) ────────────────────────────────────────────────
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000001",
    expectedStatus: "defeated",
    label: "Standard — quorum not met → defeated",
  },
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000002",
    expectedStatus: "defeated",
    label: "Standard — approval threshold not met → defeated",
  },
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000003",
    expectedStatus: "cancelled",
    label: "Standard — cancelled",
  },
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000004",
    expectedStatus: "queued",
    label: "Standard — queued",
  },
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000005",
    expectedStatus: "passed",
    label: "Standard — passed (signal-only)",
  },
  // ──── Hybrid Standard (dao_node) ─────────────────────────────────────────
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000006",
    expectedStatus: "defeated",
    label: "Hybrid Standard — defeated",
  },
  // ──── Approval (dao_node) ────────────────────────────────────────────────
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000007",
    expectedStatus: "defeated",
    label: "Approval — quorum not met → defeated",
  },
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000010",
    expectedStatus: "succeeded",
    label: "Hybrid Approval — top-choices succeeded",
  },
  // ──── Optimistic (dao_node) ──────────────────────────────────────────────
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000011",
    expectedStatus: "defeated",
    label: "Optimistic — vetoed → defeated",
  },
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000012",
    expectedStatus: "defeated",
    label: "Hybrid Optimistic Tiered — vetoed → defeated",
  },
  // ──── Offchain Standard (eas-atlas) ──────────────────────────────────────
  {
    source: "eas-atlas",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000014",
    expectedStatus: "succeeded",
    label: "Offchain Standard — succeeded",
  },
  // ──── Offchain Optimistic (eas-atlas) ────────────────────────────────────
  {
    source: "eas-atlas",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000013",
    expectedStatus: "defeated",
    label: "Offchain Optimistic — vetoed → defeated",
  },
  // ──── Offchain Approval (eas-atlas) ──────────────────────────────────────
  {
    source: "eas-atlas",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000017",
    expectedStatus: "succeeded",
    label: "Offchain Approval — succeeded",
  },
  {
    source: "eas-atlas",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000018",
    expectedStatus: "defeated",
    label: "Offchain Approval — insufficient voters → defeated",
  },
  // ──── Offchain Optimistic Tiered (eas-atlas) ─────────────────────────────
  {
    source: "eas-atlas",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000020",
    expectedStatus: "succeeded",
    label: "Offchain Optimistic Tiered — succeeded",
  },
  {
    source: "eas-atlas",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000021",
    expectedStatus: "defeated",
    label: "Offchain Optimistic Tiered — vetoed → defeated",
  },
];

// ── Tests ────────────────────────────────────────────────────────────────────

describe("ArchiveProposalRow – proposal list item rendering", () => {
  for (const { source, id, expectedStatus, label } of LIST_CASES) {
    it(label, () => {
      const proposal = loadProposal(source, id);

      render(<ArchiveProposalRow proposal={proposal} tokenDecimals={18} />);

      // Row container is identifiable by id
      const row = screen.getByTestId(`proposal-list-item-${id}`);
      expect(row).toBeTruthy();

      // Title is rendered somewhere in the row
      if (proposal.title) {
        expect(row.textContent).toContain(
          proposal.title.slice(0, 20) // partial match is fine for long titles
        );
      }

      // Status pill shows the correct state.
      // ProposalStatus is rendered twice per row (mobile + desktop column)
      // so we use getAllByTestId and assert every instance agrees.
      const statusEls = screen.getAllByTestId(`proposal-status-${id}`);
      expect(statusEls.length).toBeGreaterThan(0);
      for (const el of statusEls) {
        expect(el.textContent?.toLowerCase()).toBe(expectedStatus);
      }
    });
  }
});

describe("ArchiveProposalRow – real archived proposals", () => {
  it("renders a real executed standard proposal", () => {
    const id =
      "95125315478676153337636309965804486010918292377915044655013986825087199254978";
    const proposal = loadProposal("dao_node", `${id}`);

    render(<ArchiveProposalRow proposal={proposal} tokenDecimals={18} />);

    expect(screen.getByTestId(`proposal-list-item-${id}`)).toBeTruthy();
    const statusEls = screen.getAllByTestId(`proposal-status-${id}`);
    for (const el of statusEls) expect(el.textContent).toBe("executed");
  });

  it("renders a real succeeded hybrid optimistic tiered proposal", () => {
    const id =
      "32872683835969469583703720873380428072981331285364097246290907925181946140808";
    const proposal = loadProposal("dao_node", `${id}`);

    render(<ArchiveProposalRow proposal={proposal} tokenDecimals={18} />);

    expect(screen.getByTestId(`proposal-list-item-${id}`)).toBeTruthy();
    const statusEls = screen.getAllByTestId(`proposal-status-${id}`);
    for (const el of statusEls) expect(el.textContent).toBe("succeeded");
  });

  it("renders a real succeeded eas-atlas optimistic proposal", () => {
    const id =
      "104254402796183118613790552174556993080165650973960750641671478192868760878324";
    const proposal = loadProposal("eas-atlas", `${id}`);

    render(<ArchiveProposalRow proposal={proposal} tokenDecimals={18} />);

    expect(screen.getByTestId(`proposal-list-item-${id}`)).toBeTruthy();
    const statusEls = screen.getAllByTestId(`proposal-status-${id}`);
    for (const el of statusEls) expect(el.textContent).toBe("succeeded");
  });
});
