import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      ui: {
        toggle: (_name: string) => ({ enabled: false }),
      },
      contracts: {
        token: {
          chain: { id: 1 },
          provider: {
            getBlock: vi.fn().mockResolvedValue(null),
          },
        },
        chainForTime: { id: 1 },
      },
    }),
  },
}));

vi.mock("server-only", () => ({}));

import { archiveToProposal } from "../normalizeArchive";

const past = Math.floor(Date.now() / 1000) - 3600;

describe("archiveToProposal", () => {
  it("preserves offchain proposal ids for pure offchain archive proposals", async () => {
    const normalized = await archiveToProposal({
      id: "atlas-1",
      title: "Offchain proposal",
      proposer: "0xabc",
      proposer_ens: null,
      description: "desc",
      start_blocktime: past,
      end_blocktime: past,
      start_block: 1,
      end_block: 2,
      data_eng_properties: {
        liveness: "archived",
        source: "eas-atlas",
      },
      proposal_type: "STANDARD",
      outcome: {
        USER: { "1": 1, "0": 0, "2": 0 },
        APP: {},
        CHAIN: {},
      },
    } as any);

    expect(normalized.offchainProposalId).toBe("atlas-1");
  });

  it("preserves linked offchain ids for hybrid archive proposals", async () => {
    const normalized = await archiveToProposal({
      id: "onchain-1",
      title: "Hybrid proposal",
      proposer: "0xabc",
      proposer_ens: null,
      description: "desc",
      start_blocktime: past,
      end_blocktime: past,
      start_block: 1,
      end_block: 2,
      data_eng_properties: {
        liveness: "archived",
        source: "dao_node",
      },
      proposal_type: 1,
      proposal_type_info: {
        name: "basic",
        approval_threshold: 0,
      },
      voting_module_name: "standard",
      hybrid: true,
      totals: { "no-param": {} },
      govless_proposal: {
        id: "atlas-linked-1",
        outcome: {
          USER: { "1": 1, "0": 0, "2": 0 },
          APP: {},
          CHAIN: {},
        },
      },
    } as any);

    expect(normalized.offchainProposalId).toBe("atlas-linked-1");
  });
});
