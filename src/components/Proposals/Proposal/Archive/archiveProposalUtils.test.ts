import { describe, it, expect } from "vitest";
import { deriveStatus } from "./archiveProposalUtils";
import { ArchiveListProposal } from "@/lib/types/archiveProposal";

describe("deriveStatus", () => {
  const decimals = 18;
  const baseProposal: Partial<ArchiveListProposal> = {
    id: "1",
    total_voting_power_at_start: "1000000000000000000000000", // 1M tokens
    start_blocktime: Math.floor(Date.now() / 1000) - 86400, // Started 1 day ago
    end_blocktime: Math.floor(Date.now() / 1000) - 3600, // Ended 1 hour ago
    data_eng_properties: { source: "eas-oodao", liveness: "live" },
    proposal_type: {
      name: "Standard",
      description: "Standard proposal type",
      quorum: 400, // 4% in basis points
      approval_threshold: 5000, // 50% in basis points
      eas_uid: "0x123",
      class: "STANDARD",
    },
  };

  describe("Terminal States", () => {
    it("should return CANCELLED when cancel_event exists", () => {
      const proposal = {
        ...baseProposal,
        cancel_event: { transaction_hash: "0xabc" },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("CANCELLED");
    });

    it("should return CANCELLED when lifecycle_stage is CANCELLED", () => {
      const proposal = {
        ...baseProposal,
        lifecycle_stage: "CANCELLED",
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("CANCELLED");
    });

    it("should return EXECUTED when execute_event exists", () => {
      const proposal = {
        ...baseProposal,
        execute_event: { transaction_hash: "0xdef", blocktime: 123456 },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("EXECUTED");
    });

    it("should return QUEUED when queue_event exists and not expired", () => {
      const proposal = {
        ...baseProposal,
        queue_event: {
          transaction_hash: "0xghi",
          timestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        },
        calldatas: ["0x123"],
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("QUEUED");
    });

    it("should return PASSED when queued for >10 days with no onchain actions", () => {
      const proposal = {
        ...baseProposal,
        queue_event: {
          transaction_hash: "0xjkl",
          timestamp: Math.floor(Date.now() / 1000) - 11 * 86400, // 11 days ago
        },
        calldatas: ["0x"],
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("PASSED");
    });

    it("should return CANCELLED when delete_event exists", () => {
      const proposal = {
        ...baseProposal,
        delete_event: { attestation_time: 123456 },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("CANCELLED");
    });
  });

  describe("Time-based States", () => {
    it("should return PENDING when start time is in the future", () => {
      const proposal = {
        ...baseProposal,
        start_blocktime: Math.floor(Date.now() / 1000) + 3600, // Starts in 1 hour
        end_blocktime: Math.floor(Date.now() / 1000) + 7200,
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("PENDING");
    });

    it("should return ACTIVE when current time is between start and end", () => {
      const proposal = {
        ...baseProposal,
        start_blocktime: Math.floor(Date.now() / 1000) - 3600, // Started 1 hour ago
        end_blocktime: Math.floor(Date.now() / 1000) + 3600, // Ends in 1 hour
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("ACTIVE");
    });
  });

  describe("Optimistic Voting", () => {
    it("should return SUCCEEDED when against votes are below quorum", () => {
      const proposal = {
        ...baseProposal,
        kwargs: { voting_module: "optimistic" },
        outcome: {
          "token-holders": {
            "0": "10000000000000000000000", // 10K against (1% of 1M)
            "1": "0",
            "2": "0",
          },
        },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("SUCCEEDED");
    });

    it("should return DEFEATED when against votes exceed quorum", () => {
      const proposal = {
        ...baseProposal,
        kwargs: { voting_module: "optimistic" },
        outcome: {
          "token-holders": {
            "0": "50000000000000000000000", // 50K against (5% of 1M, exceeds 4% quorum)
            "1": "0",
            "2": "0",
          },
        },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("DEFEATED");
    });
  });

  describe("Approval Voting", () => {
    it("should return SUCCEEDED when for votes exceed quorum with threshold criteria", () => {
      const proposal = {
        ...baseProposal,
        kwargs: {
          voting_module: "approval",
          criteria: "THRESHOLD",
          criteria_value: 1000,
        },
        outcome: {
          "no-param": {
            "1": "50000000000000000000000", // 50K for votes (5% of 1M, exceeds 4% quorum)
          },
          "token-holders": {
            "0": { "1": "10000000000000000000000" }, // Option 0: 10K votes
            "1": { "1": "20000000000000000000000" }, // Option 1: 20K votes (exceeds threshold of 1000)
          },
        },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("SUCCEEDED");
    });

    it("should return DEFEATED when for votes are below quorum", () => {
      const proposal = {
        ...baseProposal,
        kwargs: {
          voting_module: "approval",
          criteria: "THRESHOLD",
          criteria_value: 1000,
        },
        outcome: {
          "no-param": {
            "1": "30000000000000000000000", // 30K for votes (3% of 1M, below 4% quorum)
          },
          "token-holders": {},
        },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("DEFEATED");
    });

    it("should return DEFEATED when no option exceeds threshold", () => {
      const proposal = {
        ...baseProposal,
        kwargs: {
          voting_module: "approval",
          criteria: "THRESHOLD",
          criteria_value: "100000000000000000000000", // 100K threshold
        },
        outcome: {
          "no-param": {
            "1": "50000000000000000000000", // 50K for votes (exceeds quorum)
          },
          "token-holders": {
            "0": { "1": "10000000000000000000000" }, // Option 0: 10K votes (below threshold)
            "1": { "1": "20000000000000000000000" }, // Option 1: 20K votes (below threshold)
          },
        },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("DEFEATED");
    });

    it("should return SUCCEEDED for top choices criteria", () => {
      const proposal = {
        ...baseProposal,
        kwargs: {
          voting_module: "approval",
          criteria: 1, // TOP_CHOICES
          criteria_value: 2,
        },
        outcome: {
          "no-param": {
            "1": "50000000000000000000000", // 50K for votes (exceeds quorum)
          },
          "token-holders": {},
        },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("SUCCEEDED");
    });
  });

  describe("Standard Voting", () => {
    it("should return SUCCEEDED when for votes exceed quorum and approval threshold", () => {
      const proposal = {
        ...baseProposal,
        outcome: {
          "token-holders": {
            "0": "100000000000000000000000", // 100K against
            "1": "600000000000000000000000", // 600K for (60% of total votes, exceeds 50% threshold)
            "2": "50000000000000000000000", // 50K abstain
          },
        },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("SUCCEEDED");
    });

    it("should return DEFEATED when for votes are below quorum", () => {
      const proposal = {
        ...baseProposal,
        outcome: {
          "token-holders": {
            "0": "10000000000000000000000", // 10K against
            "1": "20000000000000000000000", // 20K for (3% of 1M, below 4% quorum)
            "2": "5000000000000000000000", // 5K abstain
          },
        },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("DEFEATED");
    });

    it("should return DEFEATED when for votes don't meet approval threshold", () => {
      const proposal = {
        ...baseProposal,
        outcome: {
          "token-holders": {
            "0": "600000000000000000000000", // 600K against
            "1": "100000000000000000000000", // 100K for (14% of total votes, below 50% threshold)
            "2": "50000000000000000000000", // 50K abstain
          },
        },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("DEFEATED");
    });

    it("should handle nested vote structures for approval voting", () => {
      const proposal = {
        ...baseProposal,
        outcome: {
          "token-holders": {
            "0": { "1": "100000000000000000000000" }, // Nested structure
            "1": { "1": "600000000000000000000000" },
            "2": { "1": "50000000000000000000000" },
          },
        },
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("SUCCEEDED");
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing outcome data", () => {
      const proposal = {
        ...baseProposal,
        outcome: undefined,
      } as ArchiveListProposal;

      expect(deriveStatus(proposal, decimals)).toBe("DEFEATED");
    });

    it("should handle zero total voting power", () => {
      const proposal = {
        ...baseProposal,
        total_voting_power_at_start: "0",
        outcome: {
          "token-holders": {
            "1": "100000000000000000000000",
          },
        },
      } as ArchiveListProposal;

      // Should not throw, should handle gracefully
      expect(() => deriveStatus(proposal, decimals)).not.toThrow();
    });

    it("should handle missing proposal_type", () => {
      const proposal = {
        ...baseProposal,
        proposal_type: null as any,
        outcome: {
          "token-holders": {
            "1": "100000000000000000000000",
          },
        },
      } as ArchiveListProposal;

      // Should use default thresholds
      expect(() => deriveStatus(proposal, decimals)).not.toThrow();
    });
  });
});
