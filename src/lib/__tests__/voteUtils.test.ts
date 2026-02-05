import { calculateVoteMetadata, Support } from "../voteUtils";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import { expect, describe, it, vi } from "vitest";

vi.mock("../tenant/tenant", () => ({
  default: {
    current: () => ({
      namespace: "OPTIMISM",
      brandName: "Optimism",
      isProd: false,
      slug: "optimism",
      token: { decimals: 18 },
      contracts: {
        governor: {
          optionBudgetChangeDate: new Date("2024-01-01"),
        },
        token: {
          chain: {
            id: 1,
          },
        },
      },
      ui: {
        toggle: (key: string) => ({
          enabled: false,
        }),
      },
    }),
  },
}));

describe("calculateVoteMetadata", () => {
  const baseProposal: Proposal = {
    id: "1",
    proposer: "0x123",
    snapshotBlockNumber: 1,
    createdTime: new Date("2024-03-01"),
    startTime: new Date("2024-03-01"),
    endTime: new Date("2024-03-08"),
    cancelledTime: new Date(0),
    executedTime: new Date(0),
    queuedTime: new Date(0),
    startBlock: BigInt(1),
    endBlock: BigInt(1),
    executedBlock: BigInt(1),
    markdowntitle: "Test Proposal",
    description: "Test Description",
    quorum: BigInt(0),
    approvalThreshold: BigInt(0),
    proposalData: {
      created_ts: 1715136000,
      options: [],
      state: "active",
      title: "Test Proposal",
      type: "STANDARD",
      votes: "0",
      end_ts: 1715136000,
      scores: [],
      start_ts: 1715136000,
      link: "https://test.com",
      disapprovalThreshold: 12,
      proposalSettings: {
        criteria: "THRESHOLD",
        criteriaValue: BigInt(500),
        budgetToken: "0x789",
        budgetAmount: BigInt(1000),
        maxApprovals: 1,
      },
    },
    unformattedProposalData: "0x",
    proposalResults: {
      for: BigInt(0),
      against: BigInt(0),
      abstain: BigInt(0),
    },
    proposalType: "STANDARD" as any,
    proposalTypeData: null,
    status: "ACTIVE" as any,
    createdTransactionHash: "0x",
    cancelledTransactionHash: "0x",
    executedTransactionHash: "0x",
  };

  const baseVote: Vote = {
    transactionHash: "0xabc",
    address: "0x456",
    proposalId: "1",
    support: "FOR" as Support,
    weight: "100",
    reason: "",
    params: [],
    proposalValue: BigInt(0),
    proposalTitle: "Test Proposal",
    proposalType: "STANDARD",
    timestamp: new Date("2024-03-02"),
    blockNumber: BigInt(123),
    citizenType: null,
    voterMetadata: null,
  };

  describe("Standard Proposal", () => {
    it("should calculate metadata for a standard proposal", () => {
      const proposal: Proposal = {
        ...baseProposal,
        proposalType: "STANDARD" as any,
        proposalResults: {
          for: BigInt(600),
          against: BigInt(300),
          abstain: BigInt(100),
        },
        endTime: new Date("2024-03-08T23:59:59Z"),
      };

      const vote = {
        ...baseVote,
        reason: "Test Reason",
      };

      const result = calculateVoteMetadata({
        proposal,
        votes: [vote],
        votableSupply: "1000",
      });

      expect(result.forPercentage).toBeCloseTo(60);
      expect(result.againstPercentage).toBeCloseTo(30);
      expect(result.support).toBe("FOR");
      expect(result.reason).toBe("Test Reason");
      expect(result.endsIn).toContain("ENDS ~Mar 8");
      expect(result.transactionHash).toBe("0xabc");
    });
  });

  describe("Optimistic Proposal", () => {
    it("should calculate metadata for an optimistic proposal", () => {
      const proposal: Proposal = {
        ...baseProposal,
        proposalType: "OPTIMISTIC" as any,
        proposalResults: {
          for: BigInt(0),
          against: BigInt(120000000000000000000),
          abstain: BigInt(0),
        },
      };

      const result = calculateVoteMetadata({
        proposal,
        votes: [baseVote],
        votableSupply: "1000000000000000000000",
      });

      expect(result.forPercentage).toBe(0);
      // Assuming disapprovalThreshold is 12%, this should be 100%
      expect(result.againstPercentage).toBeCloseTo(100);
    });

    it("should calculate metadata for an optimistic proposal with 30% against", () => {
      const proposal: Proposal = {
        ...baseProposal,
        proposalType: "OPTIMISTIC" as any,
        proposalResults: {
          for: BigInt(0),
          against: BigInt(1000000000000000000000 * 0.03), // 3% of votable supply
          abstain: BigInt(0),
        },
      };

      const result = calculateVoteMetadata({
        proposal,
        votes: [baseVote],
        votableSupply: "1000000000000000000000",
      });

      expect(result.forPercentage).toBe(0);
      // Assuming disapprovalThreshold is 12%, this should be 25%
      expect(result.againstPercentage).toBeCloseTo(25);
    });
  });

  describe("Approval Proposal", () => {
    it("should calculate metadata for an approval proposal with threshold criteria", () => {
      const proposal: Proposal = {
        ...baseProposal,
        proposalType: "APPROVAL" as any,
        createdTime: new Date("2024-12-31"),
        proposalData: {
          ...baseProposal.proposalData,
          type: "APPROVAL",
          proposalSettings: {
            criteria: "THRESHOLD",
            criteriaValue: BigInt(500),
            budgetToken: "0x789",
            budgetAmount: BigInt(1000),
            maxApprovals: 1,
          },
          options: [
            {
              description: "Option 1",
              budgetTokensSpent: BigInt(300),
              targets: [],
              values: [],
              calldatas: [],
              functionArgsName: [],
            },
            {
              description: "Option 2",
              budgetTokensSpent: BigInt(400),
              targets: [],
              values: [],
              calldatas: [],
              functionArgsName: [],
            },
          ],
        },
        proposalResults: {
          for: BigInt(1100),
          against: BigInt(0),
          abstain: BigInt(0),
          options: [
            { option: "Option 1", votes: BigInt(700) },
            { option: "Option 2", votes: BigInt(400) },
          ],
        },
      };

      const result = calculateVoteMetadata({
        proposal,
        votes: [baseVote],
      });

      expect(result.options).toHaveLength(2);
      expect(result.options[0].isApproved).toBe(true);
      expect(result.options[0].description).toBe("Option 1");
      expect(result.options[1].isApproved).toBe(false);
      expect(result.totalOptions).toBe(2);
    });

    it("should calculate metadata for an approval proposal with threshold criteria with 3 options and one above budget", () => {
      const proposal: Proposal = {
        ...baseProposal,
        proposalType: "APPROVAL" as any,
        createdTime: new Date("2024-12-31"),
        proposalData: {
          ...baseProposal.proposalData,
          type: "APPROVAL",
          proposalSettings: {
            criteria: "THRESHOLD",
            criteriaValue: BigInt(500),
            budgetToken: "0x789",
            budgetAmount: BigInt(1000),
            maxApprovals: 1,
          },
          options: [
            {
              description: "Option 1",
              budgetTokensSpent: BigInt(300),
              targets: [],
              values: [],
              calldatas: [],
              functionArgsName: [],
            },
            {
              description: "Option 2",
              budgetTokensSpent: BigInt(100),
              targets: [],
              values: [],
              calldatas: [],
              functionArgsName: [],
            },
            {
              description: "Option 3",
              budgetTokensSpent: BigInt(1000),
              targets: [],
              values: [],
              calldatas: [],
              functionArgsName: [],
            },
          ],
        },
        proposalResults: {
          for: BigInt(2100),
          against: BigInt(0),
          abstain: BigInt(0),
          options: [
            { option: "Option 1", votes: BigInt(700) },
            { option: "Option 2", votes: BigInt(700) },
            { option: "Option 3", votes: BigInt(700) },
          ],
        },
      };

      const result = calculateVoteMetadata({
        proposal,
        votes: [baseVote],
      });

      expect(result.options).toHaveLength(3);
      expect(result.options[0].isApproved).toBe(true);
      expect(result.options[0].description).toBe("Option 1");
      expect(result.options[1].isApproved).toBe(true);
      expect(result.options[2].isApproved).toBe(false);
      expect(result.totalOptions).toBe(3);
    });

    it("should handle approval proposal with top choices criteria", () => {
      const proposal: Proposal = {
        ...baseProposal,
        proposalType: "APPROVAL" as any,
        proposalData: {
          ...baseProposal.proposalData,
          type: "APPROVAL",
          proposalSettings: {
            criteria: "TOP_CHOICES",
            criteriaValue: BigInt(1),
            budgetToken: "0x789",
            budgetAmount: BigInt(1000),
            maxApprovals: 1,
          },
          options: [
            {
              description: "Option 1",
              budgetTokensSpent: BigInt(300),
              targets: [],
              values: [],
              calldatas: [],
              functionArgsName: [],
            },
            {
              description: "Option 2",
              budgetTokensSpent: BigInt(400),
              targets: [],
              values: [],
              calldatas: [],
              functionArgsName: [],
            },
          ],
        },
        proposalResults: {
          for: BigInt(1000),
          against: BigInt(0),
          abstain: BigInt(0),
          options: [
            { option: "Option 1", votes: BigInt(600) },
            { option: "Option 2", votes: BigInt(400) },
          ],
        },
      };

      const result = calculateVoteMetadata({
        proposal,
        votes: [baseVote],
      });

      expect(result.options).toHaveLength(2);
      expect(result.options[0].isApproved).toBe(true);
      expect(result.options[1].isApproved).toBe(false);
    });

    it("should handle approval proposal with more than 7 options", () => {
      const options = Array.from({ length: 10 }, (_, i) => ({
        option: `Option ${i + 1}`,
        votes: BigInt((1000 - i * 100).toString()),
      }));

      const proposal: Proposal = {
        ...baseProposal,
        proposalType: "APPROVAL" as any,
        proposalData: {
          ...baseProposal.proposalData,
          type: "APPROVAL",
          proposalSettings: {
            criteria: "THRESHOLD",
            criteriaValue: BigInt(500),
            budgetToken: "0x789",
            budgetAmount: BigInt(10000),
            maxApprovals: 10,
          },
          options: options.map((opt, i) => ({
            description: opt.option,
            budgetTokensSpent: BigInt((300 + i * 100).toString()),
            targets: [],
            values: [],
            calldatas: [],
            functionArgsName: [],
          })),
        },
        proposalResults: {
          for: BigInt(1000),
          against: BigInt(0),
          abstain: BigInt(0),
          options,
        },
      };

      const result = calculateVoteMetadata({
        proposal,
        votes: [baseVote],
      });

      expect(result.options).toHaveLength(7);
      expect(result.totalOptions).toBe(10);
    });
  });

  describe("with newVote prop", () => {
    it("should adjust vote percentages for standard proposal with new FOR vote", () => {
      const proposal: Proposal = {
        ...baseProposal,
        proposalType: "STANDARD" as any,
        proposalResults: {
          for: BigInt(600),
          against: BigInt(300),
          abstain: BigInt(100),
        },
      };

      const result = calculateVoteMetadata({
        proposal,
        votes: [],
        newVote: {
          support: "FOR",
          weight: "100",
          reason: "New vote reason",
          params: [],
        },
      });

      // Total votes: 1100 (600 + 300 + 100 + 100 new)
      // For votes: 700 (600 + 100 new)
      expect(result.forPercentage).toBeCloseTo(63.64); // 700/1100
      expect(result.againstPercentage).toBeCloseTo(27.27); // 300/1100
      expect(result.reason).toBe("New vote reason");
    });

    it("should adjust vote percentages for optimistic proposal with new AGAINST vote", () => {
      const proposal: Proposal = {
        ...baseProposal,
        proposalType: "OPTIMISTIC" as any,
        proposalResults: {
          for: BigInt(0),
          against: BigInt(120000000000000000000), // 120 tokens
          abstain: BigInt(0),
        },
      };

      const result = calculateVoteMetadata({
        proposal,
        votes: [],
        votableSupply: "1000000000000000000000", // 1000 tokens
        newVote: {
          support: "AGAINST",
          weight: "30000000000000000000", // 30 tokens
          reason: "",
          params: [],
        },
      });

      expect(result.forPercentage).toBe(0);
      // 150 tokens against out of 120 token threshold (12% of 1000) => 125% but capped at 100%
      expect(result.againstPercentage).toBeCloseTo(100);
    });

    it("should adjust approval proposal option votes with new vote", () => {
      const proposal: Proposal = {
        ...baseProposal,
        proposalType: "APPROVAL" as any,
        proposalData: {
          ...baseProposal.proposalData,
          type: "APPROVAL",
          proposalSettings: {
            criteria: "THRESHOLD",
            criteriaValue: BigInt(500),
            budgetToken: "0x789",
            budgetAmount: BigInt(1000),
            maxApprovals: 2,
          },
          options: [
            {
              description: "Option 1",
              budgetTokensSpent: BigInt(300),
              targets: [],
              values: [],
              calldatas: [],
              functionArgsName: [],
            },
            {
              description: "Option 2",
              budgetTokensSpent: BigInt(400),
              targets: [],
              values: [],
              calldatas: [],
              functionArgsName: [],
            },
          ],
        },
        proposalResults: {
          for: BigInt(1000),
          against: BigInt(0),
          abstain: BigInt(0),
          options: [
            { option: "Option 1", votes: BigInt(400) },
            { option: "Option 2", votes: BigInt(600) },
          ],
        },
      };

      const result = calculateVoteMetadata({
        proposal,
        votes: [],
        newVote: {
          support: "FOR",
          weight: "200",
          reason: "",
          params: ["Option 1"],
        },
      });

      expect(result.options).toHaveLength(2);
      expect(result.options[0].votes).toBe("600"); // Option 1: 400 + 200
      expect(result.options[0].isApproved).toBe(true);
      expect(result.options[1].votes).toBe("600"); // Option 2: unchanged
      expect(result.options[1].isApproved).toBe(true);
    });
  });
});
