/**
 * Calculates Copeland voting scores based on ranked preferences with constraints:
 *
 * @param votes Array of vote objects containing voter info and choices
 * @param options Array of available options
 * @param budget Total budget for funding
 * @param fundingInfo Object containing funding information for each option
 * @returns Object containing calculated Copeland scores, winners, and details
 */

import { SnapshotVote } from "@/app/api/common/votes/vote";

interface PairwiseComparison {
  option1: string;
  option2: string;
  winner: string | null;
  option1VotingPower: number;
  option2VotingPower: number;
}

interface FundingInfo {
  ext: number;
  std: number;
  isEligibleFor2Y: boolean;
}

export interface CopelandResult {
  option: string;
  fundingType: "EXT2Y" | "EXT1Y" | "STD" | "None";
  comparisons: PairwiseComparison[];
  totalWins: number;
  totalLosses: number;
  avgVotingPowerFor: number;
  avgVotingPowerAgainst: number;
  fundingInfo: FundingInfo;
}

export function calculateCopelandVote(
  votes: SnapshotVote[],
  options: string[],
  budget: number,
  fundingInfo: Record<string, FundingInfo>
): CopelandResult[] {
  const scores: Record<string, number> = {};
  const pairwiseWins: Record<string, Record<string, number>> = {};
  const pairwiseVotingPower: Record<
    string,
    Record<string, { total: number; count: number }>
  > = {};
  let totalVotingPower = 0;

  options.forEach((option) => {
    scores[option] = 0;
    pairwiseWins[option] = {};
    pairwiseVotingPower[option] = {};
    options.forEach((opponent) => {
      if (option !== opponent) {
        pairwiseWins[option][opponent] = 0;
        pairwiseVotingPower[option][opponent] = { total: 0, count: 0 };
      }
    });
  });

  votes.forEach((vote) => {
    totalVotingPower += vote.votingPower;

    const parsedChoice = vote.choice?.startsWith("[")
      ? JSON.parse(vote.choice)
      : vote.choice;

    const noneRank = (parsedChoice as number[]).findIndex(
      (choice) => choice === options.findIndex((o) => o === "NONE BELOW") + 1
    );

    const optionRanks: Record<string, number> = {};

    // First, initialize all options as unranked
    options.forEach((option) => {
      optionRanks[option] = -1;
    });

    // Then, process the voter's choices
    options.forEach((option, index) => {
      const rank = (parsedChoice as number[]).findIndex(
        (choice) => choice === index + 1
      );
      // If the option is found in the voter's choices
      if (rank !== -1) {
        // If NONE BELOW exists and this option is after it, mark as below NONE BELOW
        // The lower the rank, the better
        if (noneRank !== -1 && rank > noneRank) {
          optionRanks[option] = -2; // Use -2 to indicate below NONE BELOW
        } else {
          optionRanks[option] = rank;
        }
      }
      // If option not found in choices, it stays as -1 (unranked)
    });

    for (let i = 0; i < options.length; i++) {
      const option1 = options[i];

      for (let j = i + 1; j < options.length; j++) {
        const option2 = options[j];

        // Skip if both options are below "NONE BELOW"
        if (optionRanks[option1] === -2 && optionRanks[option2] === -2) {
          continue;
        }

        // Skip if either option is unranked (-1) => should not happen as all options will be included in the vote
        if (optionRanks[option1] === -1 || optionRanks[option2] === -1) {
          continue;
        }

        // If option1 is below "NONE BELOW", option2 wins
        if (optionRanks[option1] === -2) {
          pairwiseVotingPower[option2][option1].total += vote.votingPower;
          pairwiseVotingPower[option2][option1].count += 1;
          continue;
        }

        // If option2 is below "NONE BELOW", option1 wins
        if (optionRanks[option2] === -2) {
          pairwiseVotingPower[option1][option2].total += vote.votingPower;
          pairwiseVotingPower[option1][option2].count += 1;
          continue;
        }

        // For all other cases (including when one option is "NONE BELOW"), compare ranks normally
        // Lower rank is better (1 is better than 2)
        if (optionRanks[option1] < optionRanks[option2]) {
          pairwiseVotingPower[option1][option2].total += vote.votingPower;
          pairwiseVotingPower[option1][option2].count += 1;
        } else if (optionRanks[option1] > optionRanks[option2]) {
          pairwiseVotingPower[option2][option1].total += vote.votingPower;
          pairwiseVotingPower[option2][option1].count += 1;
        } else {
          // If tied, track voting power for this pair
          pairwiseVotingPower[option1][option2].total += vote.votingPower;
          pairwiseVotingPower[option1][option2].count += 1;
          pairwiseVotingPower[option2][option1].total += vote.votingPower;
          pairwiseVotingPower[option2][option1].count += 1;
        }
      }
    }
  });

  const pairwiseComparisons: PairwiseComparison[] = [];

  options.forEach((option1) => {
    options.forEach((option2) => {
      if (option1 !== option2 && option1 < option2) {
        const option1VotingPower = pairwiseVotingPower[option1][option2];
        const option2VotingPower = pairwiseVotingPower[option2][option1];

        // First compare total voting power
        if (option1VotingPower.total > option2VotingPower.total) {
          scores[option1]++;
        } else if (option2VotingPower.total > option1VotingPower.total) {
          scores[option2]++;
        } else {
          // If tied on total voting power, use average as tiebreaker
          const option1AvgVP =
            option1VotingPower.count > 0
              ? option1VotingPower.total / option1VotingPower.count
              : 0;
          const option2AvgVP =
            option2VotingPower.count > 0
              ? option2VotingPower.total / option2VotingPower.count
              : 0;

          if (option1AvgVP > option2AvgVP) {
            scores[option1]++;
          } else if (option2AvgVP > option1AvgVP) {
            scores[option2]++;
          }
        }

        pairwiseComparisons.push({
          option1,
          option2,
          winner:
            option1VotingPower.total > option2VotingPower.total
              ? option1
              : option2VotingPower.total > option1VotingPower.total
                ? option2
                : option1VotingPower.count > 0 && option2VotingPower.count > 0
                  ? option1VotingPower.total / option1VotingPower.count >
                    option2VotingPower.total / option2VotingPower.count
                    ? option1
                    : option2VotingPower.total / option2VotingPower.count >
                        option1VotingPower.total / option1VotingPower.count
                      ? option2
                      : null
                  : null,
          option1VotingPower: option1VotingPower.total,
          option2VotingPower: option2VotingPower.total,
        });
      }
    });
  });

  const results = options.map((option) => {
    const comparisons = pairwiseComparisons
      .filter((comp) => comp.option1 === option || comp.option2 === option)
      .map((comp) => {
        const isOption1 = comp.option1 === option;
        const winMargin = isOption1
          ? comp.option1VotingPower - comp.option2VotingPower
          : comp.option2VotingPower - comp.option1VotingPower;

        return {
          ...comp,
          winMargin,
        };
      })
      .sort((a, b) => b.winMargin - a.winMargin);

    const totalWins = comparisons.filter(
      (comp) =>
        (comp.option1 === option &&
          comp.option1VotingPower > comp.option2VotingPower) ||
        (comp.option2 === option &&
          comp.option2VotingPower > comp.option1VotingPower)
    ).length;

    const totalLosses = comparisons.filter(
      (comp) =>
        (comp.option1 === option &&
          comp.option1VotingPower < comp.option2VotingPower) ||
        (comp.option2 === option &&
          comp.option2VotingPower < comp.option1VotingPower)
    ).length;

    let totalVotingPowerFor = 0;
    let totalVotingPowerAgainst = 0;

    comparisons.forEach((comp) => {
      if (comp.option1 === option) {
        totalVotingPowerFor += comp.option1VotingPower;
        totalVotingPowerAgainst += comp.option2VotingPower;
      } else if (comp.option2 === option) {
        totalVotingPowerFor += comp.option2VotingPower;
        totalVotingPowerAgainst += comp.option1VotingPower;
      }
    });

    const numVotesForThisOption = votes.filter((vote) => {
      const parsedChoice = vote.choice?.startsWith("[")
        ? JSON.parse(vote.choice)
        : vote.choice;
      return (parsedChoice as number[]).some((choice) => {
        const noneIndex = options.findIndex((o) => o === "NONE BELOW");
        return (
          options[choice - 1] === option &&
          (noneIndex === -1 || choice - 1 <= noneIndex)
        );
      });
    }).length;

    const avgVotingPowerFor =
      numVotesForThisOption > 0
        ? totalVotingPowerFor / numVotesForThisOption
        : 0;
    const avgVotingPowerAgainst =
      numVotesForThisOption > 0
        ? totalVotingPowerAgainst / numVotesForThisOption
        : 0;

    return {
      comparisons,
      totalWins,
      totalLosses,
      avgVotingPowerFor,
      avgVotingPowerAgainst,
      option,
      fundingInfo: fundingInfo[option] || {
        ext: 0,
        std: 0,
        isEligibleFor2Y: false,
      },
    };
  });

  const sortedOptions = [...options]
    .map((option) => ({
      option,
      score: scores[option],
      avgVotingPower:
        results.find((r) => r.option === option)?.avgVotingPowerFor || 0,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.avgVotingPower - a.avgVotingPower;
    });

  // Find the position of NONE BELOW in the sorted options
  const noneBelowPosition = sortedOptions.findIndex(
    (option) => option.option === "NONE BELOW"
  );

  // Calculate funding allocations based on 2 buckets
  const EXT2Y_BUDGET = budget * 0.333; // $1.5M for 2Y bucket
  const EXT1Y_BUDGET = budget * 0.666; // $3M for 1Y bucket

  let remaining2YBudget = EXT2Y_BUDGET;
  let remaining1YBudget = EXT1Y_BUDGET;

  // First pass: Allocate funding based on priority rules
  const resultsWithFunding = sortedOptions
    .map((option) => option.option)
    .map((option, index) => {
      const info = fundingInfo[option] || {
        ext: 0,
        std: 0,
        isEligibleFor2Y: false,
      };
      let fundingType: "EXT2Y" | "EXT1Y" | "STD" | "None" = "None";

      // NONE BELOW option always gets None funding type
      if (option === "NONE BELOW") {
        return {
          ...results.find((r) => r.option === option)!,
          fundingType: "None" as const,
        };
      }

      // Check if the option is above NONE BELOW
      const isAboveNoneBelow =
        noneBelowPosition === -1 || index < noneBelowPosition;

      // Only allocate funding if the option is above NONE BELOW
      if (isAboveNoneBelow) {
        // Check if eligible for 2Y funding and has budget remaining
        if (info.isEligibleFor2Y && remaining2YBudget >= info.ext) {
          fundingType = "EXT2Y";
          remaining2YBudget -= info.ext;
        } else if (remaining1YBudget >= info.ext) {
          fundingType = "EXT1Y";
          remaining1YBudget -= info.ext;
        } else if (remaining1YBudget >= info.std) {
          fundingType = "STD";
          remaining1YBudget -= info.std;
        }
      }

      return {
        ...results.find((r) => r.option === option)!,
        fundingType,
      };
    });

  // Second pass: Move remaining 2Y budget to 1Y bucket if no more eligible candidates
  const hasMoreEligible2YCandidates = resultsWithFunding.some(
    (result, index) =>
      result.fundingType === "None" &&
      result.fundingInfo.isEligibleFor2Y &&
      result.fundingInfo.ext < remaining2YBudget &&
      (noneBelowPosition === -1 || index < noneBelowPosition)
  );

  if (!hasMoreEligible2YCandidates && remaining2YBudget > 0) {
    remaining1YBudget += remaining2YBudget;
    remaining2YBudget = 0;
  }

  // Sort options for 1Y funding based on total wins => removing options that got funding in the first pass
  const sortedFor1Y = resultsWithFunding
    .filter(
      (result, index) =>
        result.fundingType === "None" &&
        result.option !== "NONE BELOW" &&
        index < noneBelowPosition // Ensure option is above NONE BELOW
    )
    .sort((a, b) => {
      if (b.totalWins !== a.totalWins) {
        return b.totalWins - a.totalWins;
      }
      return b.avgVotingPowerFor - a.avgVotingPowerFor;
    });

  // Create a mutable copy of results for 1Y allocation
  const mutableResults: CopelandResult[] = [...resultsWithFunding];

  // Allocate remaining 1Y funding
  for (const result of sortedFor1Y) {
    if (
      remaining1YBudget >= result.fundingInfo.std &&
      result.option !== "NONE BELOW"
    ) {
      const resultIndex = mutableResults.findIndex(
        (r) => r.option === result.option
      );
      if (resultIndex !== -1) {
          mutableResults[resultIndex] = {
            ...mutableResults[resultIndex],
            fundingType: "STD" as const,
          };
          remaining1YBudget -= result.fundingInfo.std;
      }
    }
  }

  return mutableResults;
}
