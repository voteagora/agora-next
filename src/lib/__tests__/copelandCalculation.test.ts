import { calculateCopelandVote } from "../copelandCalculation";
import { SnapshotVote } from "@/app/api/common/votes/vote";
import { expect, describe, it } from "vitest";

describe("Copeland Calculation", () => {
  // Mock funding info
  const fundingInfo = {
    "Team A": { ext: 500000, std: 300000, isEligibleFor2Y: true },
    "Team A (Extended)": { ext: 500000, std: 300000, isEligibleFor2Y: true },
    "Team B": { ext: 400000, std: 200000, isEligibleFor2Y: true },
    "Team B (Extended)": { ext: 400000, std: 200000, isEligibleFor2Y: true },
    "Team C": { ext: 300000, std: 150000, isEligibleFor2Y: false },
    "Team C (Extended)": { ext: 300000, std: 150000, isEligibleFor2Y: false },
    "NONE BELOW": { ext: null, std: 0, isEligibleFor2Y: false },
  };

  // Mock options
  const options = [
    "Team A",
    "Team A (Extended)",
    "Team B",
    "Team B (Extended)",
    "Team C",
    "Team C (Extended)",
    "NONE BELOW",
  ];

  // Total budget
  const budget = 4500000;

  describe("Extended vs Standard option ranking", () => {
    it("should move standard option above extended when extended is ranked higher", () => {
      // Create a vote where Team A (Extended) is ranked higher than Team A
      const votes: SnapshotVote[] = [
        {
          id: "1",
          address: "0x123",
          createdAt: new Date(),
          // Team A (Extended) is ranked 1, Team A is ranked 3
          // This should result in Team A being moved to rank 2
          choice: JSON.stringify([2, 3, 1, 4, 5, 6, 7]),
          votingPower: 100,
          title: "Test Vote",
          reason: "",
          choiceLabels: {},
        },
      ];

      const results = calculateCopelandVote(
        votes,
        options,
        budget,
        fundingInfo
      );

      // Find Team A and Team A (Extended) in results
      const teamA = results.find((r) => r.option === "Team A");
      const teamAExt = results.find((r) => r.option === "Team A (Extended)");

      // Check if Team A has more wins than it would have without the reordering
      expect(teamA).toBeDefined();
      expect(teamAExt).toBeDefined();

      // Team A should have 6 wins (against all other options)
      expect(teamA!.totalWins).toBe(6);
    });

    it("should not change rankings when standard is already above extended", () => {
      // Create a vote where Team A is already ranked higher than Team A (Extended)
      const votes: SnapshotVote[] = [
        {
          id: "1",
          address: "0x123",
          createdAt: new Date(),
          // Team A is ranked 1, Team A (Extended) is ranked 2
          choice: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
          votingPower: 100,
          title: "Test Vote",
          reason: "",
          choiceLabels: {},
        },
      ];

      const results = calculateCopelandVote(
        votes,
        options,
        budget,
        fundingInfo
      );

      // Find Team A and Team A (Extended) in results
      const teamA = results.find((r) => r.option === "Team A");
      const teamAExt = results.find((r) => r.option === "Team A (Extended)");

      expect(teamA).toBeDefined();
      expect(teamAExt).toBeDefined();

      // Team A should have 6 wins (against all other options)
      expect(teamA!.totalWins).toBe(6);
      // Team A (Extended) should have 5 wins (against all except Team A)
      expect(teamAExt!.totalWins).toBe(5);
    });
  });

  describe("Funding type allocation", () => {
    it("should only give standard funding to standard options", () => {
      // Create votes to establish a clear ranking
      const votes: SnapshotVote[] = [
        {
          id: "1",
          address: "0x123",
          createdAt: new Date(),
          // Team A is ranked 1, Team A (Extended) is ranked 2, etc.
          choice: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
          votingPower: 100,
          title: "Test Vote",
          reason: "",
          choiceLabels: {},
        },
      ];

      const results = calculateCopelandVote(
        votes,
        options,
        budget,
        fundingInfo
      );

      // Find Team A, Team B, and Team C in results
      const teamA = results.find((r) => r.option === "Team A");
      const teamB = results.find((r) => r.option === "Team B");
      const teamC = results.find((r) => r.option === "Team C");

      expect(teamA).toBeDefined();
      expect(teamB).toBeDefined();
      expect(teamC).toBeDefined();

      // Standard options should only get STD funding
      expect(teamA!.fundingType).toBe("STD");
      expect(teamB!.fundingType).toBe("STD");
      expect(teamC!.fundingType).toBe("STD");
    });

    it("should only give extended funding to extended options", () => {
      // Create votes to establish a clear ranking
      const votes: SnapshotVote[] = [
        {
          id: "1",
          address: "0x123",
          createdAt: new Date(),
          // Team A (Extended) is ranked 1, Team A is ranked 2, etc.
          choice: JSON.stringify([2, 1, 4, 3, 6, 5, 7]),
          votingPower: 100,
          title: "Test Vote",
          reason: "",
          choiceLabels: {},
        },
      ];

      const results = calculateCopelandVote(
        votes,
        options,
        budget,
        fundingInfo
      );

      // Find extended options in results
      const teamAExt = results.find((r) => r.option === "Team A (Extended)");
      const teamBExt = results.find((r) => r.option === "Team B (Extended)");
      const teamCExt = results.find((r) => r.option === "Team C (Extended)");

      expect(teamAExt).toBeDefined();
      expect(teamBExt).toBeDefined();
      expect(teamCExt).toBeDefined();

      // Extended options should get extended funding
      // Team A (Extended) is eligible for 2Y and in top 10
      expect(teamAExt!.fundingType).toBe("EXT2Y");
      // Team B (Extended) is eligible for 2Y and in top 10
      expect(teamBExt!.fundingType).toBe("EXT2Y");
      // Team C (Extended) is not eligible for 2Y but still gets EXT1Y
      expect(teamCExt!.fundingType).toBe("EXT1Y");
    });
  });

  describe("Multiple votes", () => {
    it("should correctly aggregate multiple votes", () => {
      // Create multiple votes with different rankings
      const votes: SnapshotVote[] = [
        {
          id: "1",
          address: "0x123",
          createdAt: new Date(),
          // Team A is ranked 1, Team A (Extended) is ranked 2, etc.
          choice: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
          votingPower: 100,
          title: "Test Vote",
          reason: "",
          choiceLabels: {},
        },
        {
          id: "2",
          address: "0x456",
          createdAt: new Date(),
          // Team B is ranked 1, Team B (Extended) is ranked 2, etc.
          choice: JSON.stringify([3, 4, 1, 2, 5, 6, 7]),
          votingPower: 50,
          title: "Test Vote 2",
          reason: "",
          choiceLabels: {},
        },
      ];

      const results = calculateCopelandVote(
        votes,
        options,
        budget,
        fundingInfo
      );

      // Find Team A and Team B in results
      const teamA = results.find((r) => r.option === "Team A");
      const teamB = results.find((r) => r.option === "Team B");

      expect(teamA).toBeDefined();
      expect(teamB).toBeDefined();

      // Team A should still win due to higher voting power in pairwise comparisons
      expect(teamA!.totalWins).toBeGreaterThan(teamB!.totalWins);
      expect(teamA!.totalWins).toBe(6);
    });
  });
});
