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

// Constants
const NONE_BELOW = "none below";
const EXTENDED_SUFFIX = " - ext";

// Rank values
const RANK_UNRANKED = -1;
const RANK_BELOW_NONE = -2;

// Funding types
type FundingType = "EXT2Y" | "EXT1Y" | "STD" | "None";

interface PairwiseComparison {
  option1: string;
  option2: string;
  winner: string | null;
  option1VotingPower: number;
  option2VotingPower: number;
}

interface FundingInfo {
  ext: number | null;
  std: number;
  isEligibleFor2Y: boolean;
}

export interface CopelandResult {
  option: string;
  fundingType: FundingType;
  comparisons: PairwiseComparison[];
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  avgVotingPowerFor: number;
  avgVotingPowerAgainst: number;
  fundingInfo: FundingInfo;
}

/**
 * Identifies if an option is an extended version of a standard option
 * @param option The option to check
 * @returns The base option name if it's an extended option, null otherwise
 */
function getBaseOptionFromExtended(
  option: string,
  options: string[]
): string | null {
  const optionWithoutSuffix = option.split("-")?.[0]?.trim();
  if (optionWithoutSuffix) {
    return (
      options.find(
        (o) => o.startsWith(optionWithoutSuffix) && !o.endsWith(EXTENDED_SUFFIX)
      ) || null
    );
  }
  return null;
}

const findFundingInfo = (
  option: string,
  options: string[],
  fundingInfo: Record<string, FundingInfo>
) => {
  const baseOption = getBaseOptionFromExtended(option, options) ?? option;
  const optionWithoutSuffix = baseOption.split("-")?.[0]?.trim();
  return (
    fundingInfo[optionWithoutSuffix] || {
      ext: 0,
      std: 0,
      isEligibleFor2Y: false,
    }
  );
};
/**
 * Checks if an option is an extended version
 * @param option The option to check
 * @returns True if the option is an extended version, false otherwise
 */
function isExtendedOption(option: string): boolean {
  return option.endsWith(EXTENDED_SUFFIX);
}

export function calculateCopelandVote(
  votes: SnapshotVote[],
  options: string[],
  budget_2y: number,
  budget_1y: number,
  fundingInfo: Record<string, FundingInfo>
): CopelandResult[] {
  // Early return if no votes
  if (!votes || votes.length === 0) {
    return options.map((option) => ({
      option,
      fundingType: "None",
      comparisons: [],
      totalWins: 0,
      totalLosses: 0,
      totalTies: 0,
      avgVotingPowerFor: 0,
      avgVotingPowerAgainst: 0,
      fundingInfo: findFundingInfo(option, options, fundingInfo),
    }));
  }

  // Create a map of extended options to their standard counterparts
  const extendedToStandardMap = new Map<string, string>();

  const scores: Record<string, number> = {};
  const pairwiseWins: Record<string, Record<string, number>> = {};
  const pairwiseVotingPower: Record<
    string,
    Record<string, { total: number; count: number }>
  > = {};
  let totalVotingPower = 0;

  options.forEach((option) => {
    const baseOption = getBaseOptionFromExtended(option, options);
    if (baseOption) {
      extendedToStandardMap.set(option, baseOption);
    }
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

    const noneIndex = options.findIndex((o) => o === NONE_BELOW);
    const noneRank =
      noneIndex !== -1
        ? (parsedChoice as number[]).findIndex(
            (choice) => choice === noneIndex + 1
          )
        : -1;

    const optionRanks: Record<string, number> = {};

    // First, initialize all options as unranked
    options.forEach((option) => {
      optionRanks[option] = RANK_UNRANKED;
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
          optionRanks[option] = RANK_BELOW_NONE;
        } else {
          optionRanks[option] = rank;
        }
      }
      // If option not found in choices, it stays as unranked
    });

    // Apply the rule: if a voter ranks a team's extended budget above its basic budget,
    // move the basic entry directly above the extended
    extendedToStandardMap.forEach((standardOption, extendedOption) => {
      const extendedRank = optionRanks[extendedOption];
      const standardRank = optionRanks[standardOption];

      // Only process if extended is ranked higher (lower number) than standard
      if (
        extendedRank < standardRank ||
        (standardRank < 0 && extendedRank >= 0)
      ) {
        // Move standard option to be just above extended
        const oldStandardRank = standardRank;
        optionRanks[standardOption] = extendedRank;

        // Adjust ranks of options between old standard position and new position
        options.forEach((opt) => {
          const optRank = optionRanks[opt];
          if (
            opt !== standardOption &&
            optRank >= 0 &&
            optRank >= extendedRank &&
            optRank < oldStandardRank
          ) {
            // Shift these options down by 1
            optionRanks[opt] += 1;
          }
        });
      }
    });

    for (let i = 0; i < options.length; i++) {
      const option1 = options[i];

      for (let j = i + 1; j < options.length; j++) {
        const option2 = options[j];

        const optionRank1 = optionRanks[option1];
        const optionRank2 = optionRanks[option2];

        // Skip if both options are below NONE_BELOW
        if (
          optionRank1 === RANK_BELOW_NONE &&
          optionRank2 === RANK_BELOW_NONE
        ) {
          continue;
        }

        // Skip if either option is unranked => should not happen as all options will be included in the vote
        if (optionRank1 === RANK_UNRANKED || optionRank2 === RANK_UNRANKED) {
          continue;
        }

        // If option1 is below NONE_BELOW, option2 wins
        if (optionRank1 === RANK_BELOW_NONE) {
          pairwiseVotingPower[option2][option1].total += vote.votingPower;
          pairwiseVotingPower[option2][option1].count += 1;
          continue;
        }

        // If option2 is below NONE_BELOW, option1 wins
        if (optionRank2 === RANK_BELOW_NONE) {
          pairwiseVotingPower[option1][option2].total += vote.votingPower;
          pairwiseVotingPower[option1][option2].count += 1;
          continue;
        }

        // For all other cases (including when one option is NONE_BELOW), compare ranks normally
        // Lower rank is better (0 is better than 1)

        if (optionRank1 < optionRank2) {
          // Option 1 is ranked higher
          pairwiseVotingPower[option1][option2].total += vote.votingPower;
          pairwiseVotingPower[option1][option2].count += 1;
        } else if (optionRank1 > optionRank2) {
          // Option 2 is ranked higher
          pairwiseVotingPower[option2][option1].total += vote.votingPower;
          pairwiseVotingPower[option2][option1].count += 1;
        } else {
          // Tie (should be impossible as this is in the vote)
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

        const votePower1 = option1VotingPower.total;
        const votePower2 = option2VotingPower.total;

        let winner: string | null = null;

        // First compare total voting power
        if (votePower1 > votePower2) {
          scores[option1]++;
          winner = option1;
        } else if (votePower2 > votePower1) {
          scores[option2]++;
          winner = option2;
        } else {
          // If tied on total voting power, award 0.5 points to each
          scores[option1] += 0.5;
          scores[option2] += 0.5;
        }

        pairwiseComparisons.push({
          option1,
          option2,
          winner,
          option1VotingPower: votePower1,
          option2VotingPower: votePower2,
        });
      }
    });
  });

  // Create results for each option
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

    let totalWins = 0;
    let totalLosses = 0;
    let totalTies = 0;

    let totalVotingPowerFor = 0;
    let totalVotingPowerAgainst = 0;

    comparisons.forEach((comp) => {
      if (comp.winner && comp.winner === option) {
        totalWins++;
      } else if (comp.winner && comp.winner !== option) {
        totalLosses++;
      } else {
        totalTies++;
      }

      if (comp.option1 === option) {
        totalVotingPowerFor += comp.option1VotingPower;
        totalVotingPowerAgainst += comp.option2VotingPower;
      } else if (comp.option2 === option) {
        totalVotingPowerFor += comp.option2VotingPower;
        totalVotingPowerAgainst += comp.option1VotingPower;
      }
    });

    // Count the number of votes that ranked this option ABOVE NONE BELOW
    const votesForThisOption = votes.filter((vote) => {
      const parsedChoice = vote.choice?.startsWith("[")
        ? JSON.parse(vote.choice)
        : vote.choice;

      // Find the index of NONE BELOW in the options array
      const noneIndex = options.findIndex(
        (o) => o.toLowerCase() === NONE_BELOW
      );

      // Find the rank of NONE BELOW in this vote
      const noneRank =
        noneIndex !== -1
          ? (parsedChoice as number[]).findIndex(
              (choice) => choice === noneIndex + 1
            )
          : -1;

      // Find the rank of this option in this vote
      const optionIndex = options.findIndex((o) => o === option);
      const optionRank = (parsedChoice as number[]).findIndex(
        (choice) => choice === optionIndex + 1
      );

      // Check if this option is a standard option that might have been moved up
      const isStandardOption = !isExtendedOption(option);

      // If this is a standard option, check if it has an extended version
      const hasExtendedVersion =
        isStandardOption &&
        options.includes(`${option.split("-")?.[0]?.trim()}${EXTENDED_SUFFIX}`);

      if (isStandardOption && hasExtendedVersion) {
        // Find the extended version of this option
        const extendedOption = `${option.split("-")?.[0]?.trim()}${EXTENDED_SUFFIX}`;
        const extendedIndex = options.findIndex((o) => o === extendedOption);
        const extendedRank = (parsedChoice as number[]).findIndex(
          (choice) => choice === extendedIndex + 1
        );

        // If the extended version is ranked above NONE BELOW, then the standard version
        // should also be considered valid (since it would have been moved up)
        if (
          extendedRank !== -1 &&
          (noneRank === -1 || extendedRank < noneRank)
        ) {
          return true;
        }
      }

      // Standard check: Option must be ranked AND (NONE BELOW not ranked OR option ranked above NONE BELOW)
      return optionRank !== -1 && (noneRank === -1 || optionRank < noneRank);
    });

    // Calculate total voting power of valid votes for this option
    const totalVotingPowerOfValidVotes = votesForThisOption.reduce(
      (sum, vote) => sum + vote.votingPower,
      0
    );

    // Count of valid votes
    const validVoteCount = votesForThisOption.length;

    // Calculate average voting power - divide the total voting power by the number of valid votes
    const avgVotingPowerFor =
      validVoteCount > 0 ? totalVotingPowerOfValidVotes / validVoteCount : 0;

    // Calculate average voting power against
    const totalVotingPowerAgainstOption =
      totalVotingPower - totalVotingPowerOfValidVotes;
    const invalidVoteCount = votes.length - validVoteCount;
    const avgVotingPowerAgainst =
      invalidVoteCount > 0
        ? totalVotingPowerAgainstOption / invalidVoteCount
        : 0;

    return {
      comparisons,
      totalWins,
      totalLosses,
      totalTies,
      avgVotingPowerFor,
      avgVotingPowerAgainst,
      option,
      fundingInfo: findFundingInfo(option, options, fundingInfo),
    };
  });

  const sortedOptions = [...options]
    .map((option) => {
      const result = results.find((r) => r.option === option)!;
      // Calculate average support across all matches
      const totalSupport = result.comparisons.reduce((sum, comp) => {
        if (comp.option1 === option) {
          return sum + comp.option1VotingPower;
        } else {
          return sum + comp.option2VotingPower;
        }
      }, 0);
      const avgSupport =
        result.comparisons.length > 0
          ? totalSupport / result.comparisons.length
          : 0;

      return {
        option,
        score: scores[option],
        avgSupport,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.avgSupport - a.avgSupport;
    });

  // Find the position of NONE BELOW in the sorted options
  const noneBelowPosition = sortedOptions.findIndex(
    (option) => option.option.toLowerCase() === NONE_BELOW
  );

  let remaining2YBudget = budget_2y;
  let remainingTotalBudget = budget_1y + budget_2y;

  // Determine if an option is in the top 10 (for 2Y eligibility)
  const isInTop10 = (option: string): boolean => {
    const position = sortedOptions.findIndex((opt) => opt.option === option);
    return position < 10;
  };

  let resultsWithFunding: CopelandResult[] = [];

  // First pass: Allocate funding based on priority rules
  sortedOptions
    .map((option) => option.option)
    .map((option, index) => {
      const info = findFundingInfo(option, options, fundingInfo);
      let fundingType: FundingType = "None";

      // NONE_BELOW option always gets None funding type
      if (option === NONE_BELOW) {
        resultsWithFunding.push({
          ...results.find((r) => r.option === option)!,
          fundingType: "None" as FundingType,
        });
        return;
      }

      // Check if the option is above NONE BELOW
      const isAboveNoneBelow =
        noneBelowPosition === -1 || index < noneBelowPosition;

      // Only allocate funding if the option is above NONE_BELOW
      if (isAboveNoneBelow) {
        const isExtended = isExtendedOption(option);
        const canGet2Y = info.isEligibleFor2Y && isInTop10(option);

        if (isExtended) {
          // For extended options, check if the standard option has received funding
          const standardOption = getBaseOptionFromExtended(option, options);
          if (standardOption) {
            const standardResult = resultsWithFunding.find(
              (r) => r.option === standardOption
            );
            // Only allocate funding to extended option if standard option has received funding
            if (standardResult && standardResult.fundingType === "STD") {
              if (
                canGet2Y &&
                info.ext !== null &&
                remaining2YBudget >= info.ext
              ) {
                fundingType = "EXT2Y";
                remaining2YBudget -= info.ext;
                remainingTotalBudget -= info.ext;
              } else if (
                info.ext !== null &&
                remainingTotalBudget >= info.ext
              ) {
                fundingType = "EXT1Y";
                let missingFunding = info.ext;
                if (canGet2Y) {
                  missingFunding -= remaining2YBudget;
                  remainingTotalBudget -= remaining2YBudget;
                  remaining2YBudget = 0;
                }
                remainingTotalBudget -= missingFunding;
              }
            }
          }
        } else {
          // Standard options can only get STD funding
          if (canGet2Y && remaining2YBudget >= info.std) {
            fundingType = "STD";
            remaining2YBudget -= info.std;
            remainingTotalBudget -= info.std;
          } else if (remainingTotalBudget >= info.std) {
            fundingType = "STD";
            let missingFunding = info.std;
            if (canGet2Y) {
              missingFunding -= remaining2YBudget;
              remainingTotalBudget -= remaining2YBudget;
              remaining2YBudget = 0;
            }
            remainingTotalBudget -= missingFunding;
          }
        }
      }

      resultsWithFunding.push({
        ...results.find((r) => r.option === option)!,
        fundingType,
      });
    });

  // Sort options for 1Y funding based on total wins
  const sortedFor1Y = resultsWithFunding
    .filter(
      (result, index) =>
        result.fundingType === "None" &&
        result.option.toLowerCase() !== NONE_BELOW &&
        index < noneBelowPosition // Ensure option is above NONE BELOW
    )
    .sort((a, b) => {
      if (b.totalWins !== a.totalWins) {
        return b.totalWins - a.totalWins;
      }
      return b.avgVotingPowerFor - a.avgVotingPowerFor;
    });

  // Allocate remaining 1Y funding
  for (const result of sortedFor1Y) {
    // Skip NONE_BELOW options
    if (result.option === NONE_BELOW) continue;

    const resultIndex = resultsWithFunding.findIndex(
      (r) => r.option === result.option
    );

    if (resultIndex === -1) continue;

    const isExtended = isExtendedOption(result.option);

    if (isExtended) {
      // For extended options, check if the standard option has received funding
      const standardOption = getBaseOptionFromExtended(result.option, options);
      if (standardOption) {
        const standardResult = resultsWithFunding.find(
          (r) => r.option === standardOption
        );
        // Only allocate funding to extended option if standard option has received funding
        if (standardResult && standardResult.fundingType === "STD") {
          const fundingAmount = result.fundingInfo.ext;
          if (fundingAmount !== null && remainingTotalBudget >= fundingAmount) {
            resultsWithFunding[resultIndex] = {
              ...resultsWithFunding[resultIndex],
              fundingType: "EXT1Y" as FundingType,
            };
            remainingTotalBudget -= fundingAmount;
          }
        }
      }
    } else {
      // Standard options can only get STD funding
      const fundingAmount = result.fundingInfo.std;
      if (remainingTotalBudget >= fundingAmount) {
        resultsWithFunding[resultIndex] = {
          ...resultsWithFunding[resultIndex],
          fundingType: "STD" as FundingType,
        };
        remainingTotalBudget -= fundingAmount;
      }
    }
  }

  return resultsWithFunding;
}
