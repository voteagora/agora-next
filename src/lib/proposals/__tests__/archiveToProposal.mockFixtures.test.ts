/**
 * Proposal detail page – normalization tests using mock fixtures
 *
 * archiveToProposal() is the single entry point that transforms raw archive
 * JSON into the Proposal type consumed by all detail-page components.  These
 * tests verify that the key fields rendered by the detail page
 * (status, title, proposalType) are derived correctly from each mock fixture.
 *
 * UI test-id hooks verified here:
 *   - proposal.status  → rendered by ProposalStatusDetail[data-testid="proposal-status-badge"]
 *   - proposal.markdowntitle → rendered by ProposalTitle[data-testid="proposal-title"]
 */

import { describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

// ── Mocks (must be hoisted before any import that transitively loads Tenant) ─

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      namespace: "optimism",
      ui: {
        toggle: (_name: string) => ({ enabled: false }),
      },
      contracts: {
        token: {
          chain: { id: 10 },
          provider: {
            getBlock: vi.fn().mockResolvedValue(null),
          },
        },
        chainForTime: { id: 10 },
      },
    }),
  },
}));

vi.mock("server-only", () => ({}));

// ── Import after mocks ────────────────────────────────────────────────────────

import { archiveToProposal } from "../normalizeArchive";

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_ROOT = join(__dirname, "../../../__mocks__");

function load(source: "dao_node" | "eas-atlas", id: string) {
  return JSON.parse(
    readFileSync(join(MOCK_ROOT, source, `${id}.json`), "utf8")
  );
}

// ── Expected outcomes ─────────────────────────────────────────────────────────

interface DetailExpectation {
  source: "dao_node" | "eas-atlas";
  id: string;
  status: string;
  proposalType: string;
  label: string;
}

const DETAIL_CASES: DetailExpectation[] = [
  // ──── Standard ──────────────────────────────────────────────────────────
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000001",
    status: "DEFEATED",
    proposalType: "STANDARD",
    label: "Standard — quorum not met",
  },
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000003",
    status: "CANCELLED",
    proposalType: "STANDARD",
    label: "Standard — cancelled",
  },
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000004",
    status: "QUEUED",
    proposalType: "STANDARD",
    label: "Standard — queued",
  },
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000005",
    status: "PASSED",
    proposalType: "STANDARD",
    label: "Standard — passed (signal-only)",
  },
  // ──── Hybrid Standard ───────────────────────────────────────────────────
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000006",
    status: "DEFEATED",
    proposalType: "HYBRID_STANDARD",
    label: "Hybrid Standard — defeated",
  },
  // ──── Approval ──────────────────────────────────────────────────────────
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000007",
    status: "DEFEATED",
    proposalType: "APPROVAL",
    label: "Approval — quorum not met",
  },
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000010",
    status: "SUCCEEDED",
    proposalType: "HYBRID_APPROVAL",
    label: "Hybrid Approval — top-choices succeeded",
  },
  // ──── Optimistic ────────────────────────────────────────────────────────
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000011",
    status: "DEFEATED",
    proposalType: "OPTIMISTIC",
    label: "Optimistic — vetoed",
  },
  {
    source: "dao_node",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000012",
    status: "DEFEATED",
    proposalType: "HYBRID_OPTIMISTIC_TIERED",
    label: "Hybrid Optimistic Tiered — vetoed",
  },
  // ──── Real archived proposals ────────────────────────────────────────────
  {
    source: "dao_node",
    id: "95125315478676153337636309965804486010918292377915044655013986825087199254978",
    status: "EXECUTED",
    proposalType: "STANDARD",
    label: "Real — standard executed",
  },
  {
    source: "dao_node",
    id: "43611390841042156127733279917289923399354155784945103358272334363949369459237",
    status: "SUCCEEDED",
    proposalType: "OPTIMISTIC",
    label: "Real — optimistic succeeded",
  },
  // ──── eas-atlas offchain ─────────────────────────────────────────────────
  {
    source: "eas-atlas",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000014",
    status: "SUCCEEDED",
    proposalType: "OFFCHAIN_STANDARD",
    label: "Offchain Standard — succeeded",
  },
  {
    source: "eas-atlas",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000013",
    status: "DEFEATED",
    proposalType: "OFFCHAIN_OPTIMISTIC",
    label: "Offchain Optimistic — vetoed",
  },
  {
    source: "eas-atlas",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000017",
    status: "SUCCEEDED",
    proposalType: "OFFCHAIN_APPROVAL",
    label: "Offchain Approval — succeeded",
  },
  {
    source: "eas-atlas",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000020",
    status: "SUCCEEDED",
    proposalType: "OFFCHAIN_OPTIMISTIC_TIERED",
    label: "Offchain Optimistic Tiered — succeeded",
  },
  {
    source: "eas-atlas",
    id: "99000000000000000000000000000000000000000000000000000000000000000000000000021",
    status: "DEFEATED",
    proposalType: "OFFCHAIN_OPTIMISTIC_TIERED",
    label: "Offchain Optimistic Tiered — vetoed",
  },
  {
    source: "eas-atlas",
    id: "104254402796183118613790552174556993080165650973960750641671478192868760878324",
    status: "SUCCEEDED",
    proposalType: "OFFCHAIN_OPTIMISTIC",
    label: "Real eas-atlas optimistic — succeeded",
  },
];

// ── Test suite ────────────────────────────────────────────────────────────────

describe("archiveToProposal – proposal detail normalization", () => {
  for (const { source, id, status, proposalType, label } of DETAIL_CASES) {
    it(label, async () => {
      const raw = load(source, id);
      const proposal = await archiveToProposal(raw, { tokenDecimals: 18 });

      // status → rendered by ProposalStatusDetail[data-testid="proposal-status-badge"]
      expect(proposal.status).toBe(status);

      // proposalType → determines which detail-page component is rendered
      expect(proposal.proposalType).toBe(proposalType);

      // markdowntitle → rendered by ProposalTitle[data-testid="proposal-title"]
      expect(typeof proposal.markdowntitle).toBe("string");
      expect(proposal.markdowntitle.length).toBeGreaterThan(0);

      // id round-trips correctly
      expect(proposal.id).toBe(String(raw.id));
    });
  }
});

describe("archiveToProposal – offchainProposalId wiring", () => {
  it("sets offchainProposalId for pure offchain eas-atlas proposals", async () => {
    const id =
      "99000000000000000000000000000000000000000000000000000000000000000000000000014";
    const raw = load("eas-atlas", id);
    const proposal = await archiveToProposal(raw, { tokenDecimals: 18 });

    expect(proposal.offchainProposalId).toBe(id);
  });

  it("sets offchainProposalId from govless_proposal for hybrid proposals", async () => {
    const id =
      "99000000000000000000000000000000000000000000000000000000000000000000000000006";
    const raw = load("dao_node", id);
    const proposal = await archiveToProposal(raw, { tokenDecimals: 18 });

    // The govless_proposal id is the atlas-side id
    expect(proposal.offchainProposalId).toBe(
      String(raw.govless_proposal?.id ?? raw.govless_proposal?.uid)
    );
  });
});

describe("archiveToProposal – all mock fixtures normalise without throwing", () => {
  const sources: Array<"dao_node" | "eas-atlas"> = ["dao_node", "eas-atlas"];

  for (const source of sources) {
    const dir = join(MOCK_ROOT, source);
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const id = file.replace(".json", "");
      it(`${source}/${id.slice(0, 4)}…${id.slice(-3)} normalises without error`, async () => {
        const raw = JSON.parse(readFileSync(join(dir, file), "utf8"));
        await expect(
          archiveToProposal(raw, { tokenDecimals: 18 })
        ).resolves.toBeDefined();
      });
    }
  }
});
