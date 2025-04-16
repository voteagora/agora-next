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

  describe("Extended Funding Rules", () => {
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

    // Mock funding info
    const fundingInfo = {
      "Team A": { ext: 100000, std: 300000, isEligibleFor2Y: true },
      "Team A (Extended)": { ext: 100000, std: 300000, isEligibleFor2Y: true },
      "Team B": { ext: 200000, std: 400000, isEligibleFor2Y: false },
      "Team B (Extended)": { ext: 200000, std: 400000, isEligibleFor2Y: false },
      "Team C": { ext: 300000, std: 500000, isEligibleFor2Y: false },
      "Team C (Extended)": { ext: 300000, std: 500000, isEligibleFor2Y: false },
      "NONE BELOW": { ext: null, std: 0, isEligibleFor2Y: false },
    };

    // Total budget
    const budget = 2000000;

    it("should only give extended funding if standard option received funding", () => {
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

      // Set a budget that's enough for Team A and Team A (Extended) but not for Team B
      const smallBudget = 500000;

      const results = calculateCopelandVote(
        votes,
        options,
        smallBudget,
        fundingInfo
      );

      // Find Team A and Team A (Extended) in results
      const teamA = results.find((r) => r.option === "Team A");
      const teamAExt = results.find((r) => r.option === "Team A (Extended)");

      // Find Team B and Team B (Extended) in results
      const teamB = results.find((r) => r.option === "Team B");
      const teamBExt = results.find((r) => r.option === "Team B (Extended)");

      expect(teamA).toBeDefined();
      expect(teamAExt).toBeDefined();
      expect(teamB).toBeDefined();
      expect(teamBExt).toBeDefined();

      // Team A should get STD funding
      expect(teamA!.fundingType).toBe("STD");

      // Team A (Extended) should get extended funding (either EXT1Y or EXT2Y) because Team A got STD funding
      expect(["EXT1Y", "EXT2Y"]).toContain(teamAExt!.fundingType);

      // Team B should not get STD funding due to budget constraints
      expect(teamB!.fundingType).toBe("None");

      // Team B (Extended) should not get any funding because Team B didn't get STD funding
      expect(teamBExt!.fundingType).toBe("None");
    });

    it("should not give extended funding if standard option didn't receive funding due to budget constraints", () => {
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

      // Set a very small budget so that no options can be funded
      const tinyBudget = 100000;

      const results = calculateCopelandVote(
        votes,
        options,
        tinyBudget,
        fundingInfo
      );

      // Find Team A and Team A (Extended) in results
      const teamA = results.find((r) => r.option === "Team A");
      const teamAExt = results.find((r) => r.option === "Team A (Extended)");

      expect(teamA).toBeDefined();
      expect(teamAExt).toBeDefined();

      // Team A should not get STD funding due to budget constraints
      expect(teamA!.fundingType).toBe("None");

      // Team A (Extended) should not get any funding because Team A didn't get STD funding
      expect(teamAExt!.fundingType).toBe("None");
    });
  });

  describe("Average Voting Power Calculation", () => {
    const options = [
      "Option A",
      "Option B",
      "Option C",
      "NONE BELOW",
      "Option D",
    ];

    const fundingInfo = {
      "Option A": { ext: 100000, std: 300000, isEligibleFor2Y: true },
      "Option B": { ext: 200000, std: 400000, isEligibleFor2Y: false },
      "Option C": { ext: 300000, std: 500000, isEligibleFor2Y: false },
      "NONE BELOW": { ext: null, std: 0, isEligibleFor2Y: false },
      "Option D": { ext: 400000, std: 600000, isEligibleFor2Y: false },
    };

    const budget = 2000000;

    it("should correctly calculate avgVotingPowerFor and avgVotingPowerAgainst", () => {
      const votes: SnapshotVote[] = [
        {
          id: "1",
          address: "0x123",
          createdAt: new Date(),
          // Option A is ranked 1, Option B is ranked 2, Option C is ranked 3, NONE BELOW is ranked 4, Option D is ranked 5
          choice: JSON.stringify([1, 2, 3, 4, 5]),
          votingPower: 100,
          title: "Test Vote 1",
          reason: "",
          choiceLabels: {},
        },
        {
          id: "2",
          address: "0x456",
          createdAt: new Date(),
          // Option B is ranked 1, Option A is ranked 2, Option C is ranked 3, NONE BELOW is ranked 4, Option D is ranked 5
          choice: JSON.stringify([2, 1, 3, 4, 5]),
          votingPower: 200,
          title: "Test Vote 2",
          reason: "",
          choiceLabels: {},
        },
        {
          id: "3",
          address: "0x789",
          createdAt: new Date(),
          // Option C is ranked 1, NONE BELOW is ranked 2, Option A, B, D are below NONE BELOW
          choice: JSON.stringify([3, 4, 5, 2, 1]),
          votingPower: 300,
          title: "Test Vote 3",
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

      const optionA = results.find((r) => r.option === "Option A");
      const optionB = results.find((r) => r.option === "Option B");
      const optionC = results.find((r) => r.option === "Option C");
      const optionD = results.find((r) => r.option === "Option D");

      expect(optionA).toBeDefined();
      expect(optionB).toBeDefined();
      expect(optionC).toBeDefined();
      expect(optionD).toBeDefined();

      // Option A:
      // - In Vote 1: Ranked 1st with voting power 100
      // - In Vote 2: Ranked 2nd with voting power 200
      // - In Vote 3: Below NONE BELOW (should not count)
      // Total voting power for: 300 (100 + 200)
      // Total votes that count: 2
      // Expected avgVotingPowerFor: 150 (300/2)
      expect(optionA!.avgVotingPowerFor).toBeCloseTo(150);

      // Option B:
      // - In Vote 1: Ranked 2nd with voting power 100
      // - In Vote 2: Ranked 1st with voting power 200
      // - In Vote 3: Below NONE BELOW (should not count)
      // Total voting power for: 300 (100 + 200)
      // Total votes that count: 2
      // Expected avgVotingPowerFor: 150 (300/2)
      expect(optionB!.avgVotingPowerFor).toBeCloseTo(150);

      // Option C:
      // - In Vote 1: Ranked 3rd with voting power 100
      // - In Vote 2: Ranked 3rd with voting power 200
      // - In Vote 3: Ranked 1st with voting power 300
      // Total voting power for: 600 (100 + 200 + 300)
      // Total votes that count: 3
      // Expected avgVotingPowerFor: 200 (600/3)
      expect(optionC!.avgVotingPowerFor).toBeCloseTo(200);

      // Option D:
      // - In Vote 1: Below NONE BELOW
      // - In Vote 2: Below NONE BELOW
      // - In Vote 3: Below NONE BELOW
      // Total voting power for: 0 (all votes are below NONE BELOW)
      // Expected avgVotingPowerFor: 0
      expect(optionD!.avgVotingPowerFor).toBeCloseTo(0);
    });

    it("should handle votes with options ranked below NONE BELOW correctly", () => {
      // Create votes where some options are ranked below NONE BELOW
      const votes: SnapshotVote[] = [
        {
          id: "1",
          address: "0x123",
          createdAt: new Date(),
          // NONE BELOW is ranked 1, all other options are below it
          choice: JSON.stringify([4, 5, 3, 1, 2]),
          votingPower: 100,
          title: "Test Vote 1",
          reason: "",
          choiceLabels: {},
        },
        {
          id: "2",
          address: "0x456",
          createdAt: new Date(),
          // Option A is ranked 1, NONE BELOW is ranked 2, all others are below it
          choice: JSON.stringify([1, 5, 4, 2, 3]),
          votingPower: 200,
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

      // Find each option in results
      const optionA = results.find((r) => r.option === "Option A");
      const optionB = results.find((r) => r.option === "Option B");

      expect(optionA).toBeDefined();
      expect(optionB).toBeDefined();

      // Option A:
      // - In Vote 1: Below NONE BELOW (should not count)
      // - In Vote 2: Ranked 1st with voting power 200
      // Total voting power for: 200
      // Total votes that count: 1
      // Expected avgVotingPowerFor: 200 (200/1)
      expect(optionA!.avgVotingPowerFor).toBeCloseTo(200);

      // Option B:
      // - In Vote 1: Below NONE BELOW (should not count)
      // - In Vote 2: Below NONE BELOW (should not count)
      // Total voting power for: 0
      // Expected avgVotingPowerFor: 0
      expect(optionB!.avgVotingPowerFor).toBeCloseTo(0);
    });

    it("should count standard option as valid if its extended version is above NONE BELOW", () => {
      // Create votes where extended options are above NONE BELOW but standard options are below
      const votes: SnapshotVote[] = [
        {
          id: "1",
          address: "0x123",
          createdAt: new Date(),
          // Option A (Extended) is ranked 1, NONE BELOW is ranked 2, Option A is ranked 3
          // Even though Option A is below NONE BELOW, it should be considered valid
          // because its extended version is above NONE BELOW
          choice: JSON.stringify([2, 5, 4, 3, 1]),
          votingPower: 100,
          title: "Test Vote 1",
          reason: "",
          choiceLabels: {},
        },
      ];

      const extendedOptions = [
        "Option A",
        "Option A (Extended)",
        "Option B",
        "NONE BELOW",
        "Option C",
      ];

      const extendedFundingInfo = {
        "Option A": { ext: 100000, std: 300000, isEligibleFor2Y: true },
        "Option A (Extended)": {
          ext: 100000,
          std: 300000,
          isEligibleFor2Y: true,
        },
        "Option B": { ext: 200000, std: 400000, isEligibleFor2Y: false },
        "NONE BELOW": { ext: null, std: 0, isEligibleFor2Y: false },
        "Option C": { ext: 300000, std: 500000, isEligibleFor2Y: false },
      };

      const results = calculateCopelandVote(
        votes,
        extendedOptions,
        budget,
        extendedFundingInfo
      );

      const optionA = results.find((r) => r.option === "Option A");

      expect(optionA).toBeDefined();

      // Option A should be considered valid because its extended version is above NONE BELOW
      // So its avgVotingPowerFor should be 100 (the voting power of the vote)
      expect(optionA!.avgVotingPowerFor).toBeCloseTo(100);
    });
  });
});
