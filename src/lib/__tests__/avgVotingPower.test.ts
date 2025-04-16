import { calculateCopelandVote } from "../copelandCalculation";
import { SnapshotVote } from "@/app/api/common/votes/vote";
import { describe, it, expect } from "vitest";

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

    const results = calculateCopelandVote(votes, options, budget, fundingInfo);

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

    const results = calculateCopelandVote(votes, options, budget, fundingInfo);

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
