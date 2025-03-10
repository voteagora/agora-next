/**
 * Calculates Copeland voting scores based on ranked preferences with constraints:
 * - Each letter represents a single option with both EXT 2Y and EXT 1Y values
 * - The top 2 scoring letters receive EXT 2Y funding
 * - The next 4 scoring letters receive EXT 1Y funding
 *
 * @param votes Array of vote objects containing voter info and choices
 * @param options Array of available options
 * @returns Object containing calculated Copeland scores, winners, and details
 */
interface Vote {
  id: string;
  voter: string;
  choice: number[];
  vp: number;
}

interface PairwiseComparison {
  option1: string;
  option2: string;
  winner: string | null;
  option1Wins: number;
  option2Wins: number;
}

export interface CopelandResult {
  letter: string;
  fundingType: "EXT 2Y" | "EXT 1Y" | "None";
  comparisons: PairwiseComparison[];
  totalWins: number;
  totalLosses: number;
  avgVotingPowerFor: number;
  avgVotingPowerAgainst: number;
}

function calculateCopelandVote(
  votes: Vote[],
  options: string[]
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
    totalVotingPower += vote.vp;

    const noneIndex = options.findIndex((choice) => choice === "NONE BELOW");

    const optionRanks: Record<string, number> = {};

    options.forEach((option, index) => {
      const rank = vote.choice.findIndex((choice) => choice === index + 1);

      // Only consider options that are ranked higher than "NONE BELOW"
      // or options that are valid if "NONE BELOW" isn't in options
      if (noneIndex === -1 || rank < noneIndex) {
        optionRanks[option] = rank;
      } else {
        optionRanks[option] = -1;
      }
    });

    for (let i = 0; i < options.length; i++) {
      const option1 = options[i];

      // Skip "NONE BELOW" itself from comparisons
      if (option1 === "NONE BELOW") {
        continue;
      }

      for (let j = i + 1; j < options.length; j++) {
        const option2 = options[j];

        // Skip "NONE BELOW" itself from comparisons
        if (option2 === "NONE BELOW") {
          continue;
        }

        // If option1 is below "NONE BELOW", it loses to option2
        if (!(option1 in optionRanks) || optionRanks[option1] === -1) {
          pairwiseWins[option2][option1] += vote.vp;
          continue;
        }

        // If option2 is below "NONE BELOW", it loses to option1
        if (!(option2 in optionRanks) || optionRanks[option2] === -1) {
          pairwiseWins[option1][option2] += vote.vp;
          continue;
        }

        // Both options are above "NONE BELOW", compare their ranks
        // Lower rank is better (1 is better than 2)
        if (optionRanks[option1] < optionRanks[option2]) {
          pairwiseWins[option1][option2] += vote.vp;
        } else if (optionRanks[option1] > optionRanks[option2]) {
          pairwiseWins[option2][option1] += vote.vp;
        } else {
          // If tied, track voting power for this pair
          pairwiseVotingPower[option1][option2].total += vote.vp;
          pairwiseVotingPower[option1][option2].count += 1;
          pairwiseVotingPower[option2][option1].total += vote.vp;
          pairwiseVotingPower[option2][option1].count += 1;
        }
      }
    }
  });

  const pairwiseComparisons: PairwiseComparison[] = [];

  options.forEach((option1) => {
    options.forEach((option2) => {
      if (option1 !== option2 && option1 < option2) {
        const option1Wins = pairwiseWins[option1][option2] || 0;
        const option2Wins = pairwiseWins[option2][option1] || 0;

        // If tied, use average voting power for this specific pair as tiebreaker
        if (option1Wins === option2Wins) {
          const option1AvgVP =
            pairwiseVotingPower[option1][option2].count > 0
              ? pairwiseVotingPower[option1][option2].total /
                pairwiseVotingPower[option1][option2].count
              : 0;
          const option2AvgVP =
            pairwiseVotingPower[option2][option1].count > 0
              ? pairwiseVotingPower[option2][option1].total /
                pairwiseVotingPower[option2][option1].count
              : 0;

          if (option1AvgVP > option2AvgVP) {
            scores[option1]++;
          } else if (option2AvgVP > option1AvgVP) {
            scores[option2]++;
          }
        } else if (option1Wins > option2Wins) {
          scores[option1]++;
        } else if (option1Wins < option2Wins) {
          scores[option2]++;
        }

        pairwiseComparisons.push({
          option1,
          option2,
          winner:
            option1Wins > option2Wins
              ? option1
              : option2Wins > option1Wins
                ? option2
                : null,
          option1Wins,
          option2Wins,
        });
      }
    });
  });

  const letterOptions = options.filter((option) => option !== "NONE BELOW");

  const sortedOptions = letterOptions
    .map((option) => ({ option, score: scores[option] }))
    .sort((a, b) => b.score - a.score);

  const ext2yWinners = sortedOptions.slice(0, 2).map((item) => item.option);

  const ext1yWinners = sortedOptions.slice(2, 6).map((item) => item.option);

  const results = sortedOptions
    .map((option) => option.option)
    .map((option) => {
      let fundingType: "EXT 2Y" | "EXT 1Y" | "None" = "None";
      if (ext2yWinners.includes(option)) {
        fundingType = "EXT 2Y";
      } else if (ext1yWinners.includes(option)) {
        fundingType = "EXT 1Y";
      }

      const comparisons = pairwiseComparisons
        .filter(
          (comp) =>
            (comp.option1 === option || comp.option2 === option) &&
            comp.option1 !== "NONE BELOW" &&
            comp.option2 !== "NONE BELOW"
        )
        .map((comp) => {
          const isOption1 = comp.option1 === option;
          const winMargin = isOption1
            ? comp.option1Wins - comp.option2Wins
            : comp.option2Wins - comp.option1Wins;

          return {
            ...comp,
            winMargin,
          };
        })
        .sort((a, b) => b.winMargin - a.winMargin);

      const totalWins = comparisons.filter(
        (comp) =>
          (comp.option1 === option && comp.option1Wins > comp.option2Wins) ||
          (comp.option2 === option && comp.option2Wins > comp.option1Wins)
      ).length;

      const totalLosses = comparisons.filter(
        (comp) =>
          (comp.option1 === option && comp.option1Wins < comp.option2Wins) ||
          (comp.option2 === option && comp.option2Wins < comp.option1Wins)
      ).length;

      let totalVotingPowerFor = 0;
      let totalVotingPowerAgainst = 0;

      comparisons.forEach((comp) => {
        if (comp.option1 === option) {
          totalVotingPowerFor += comp.option1Wins;
          totalVotingPowerAgainst += comp.option2Wins;
        } else if (comp.option2 === option) {
          totalVotingPowerFor += comp.option2Wins;
          totalVotingPowerAgainst += comp.option1Wins;
        }
      });

      const numVotesForThisOption = votes.filter((vote) => {
        return vote.choice.some((choice) => {
          const noneIndex = options.findIndex((o) => o === "NONE BELOW");
          return (
            options[choice - 1] === option &&
            (noneIndex === -1 || choice - 1 < noneIndex)
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
        fundingType,
        letter: option,
      };
    });

  return results;
}

const options = [
  "Epsilon Co: $500,000 / $250,000",
  "Delta Innovations: $400,000 / $200,000",
  "Gamma Corp: $300,000 / $150,000",
  "Beta Ltd: $200,000 / $100,000",
  "Alpha Inc: $450,000 / $225,000",
  "Omega Co: $350,000 / $175,000",
  "Zeta Co: $250,000 / $125,000",
  "Globex Corp: $325,000 / $162,500",
  "Omega Enterprises: $375,000 / $187,500",
  "Theta Systems: $425,000 / $212,500",
  "NONE BELOW",
];

/**
 * Generate random votes for simulation
 * @param numVotes Number of votes to generate
 * @param options Available options
 * @returns Array of randomly generated votes
 */
function generateRandomVotes(numVotes: number, options: string[]): Vote[] {
  const votes: Vote[] = [];

  for (let i = 0; i < numVotes; i++) {
    const shuffledOptions = [...options].sort(() => Math.random() - 0.5);

    const rankings: number[] = new Array(options.length);

    for (let j = 0; j < options.length; j++) {
      const option = shuffledOptions[j];
      const originalIndex = options.indexOf(option);

      rankings[originalIndex] = j + 1;
    }

    const votingPower = Math.floor(Math.random() * 900000) + 100000;

    votes.push({
      id: `vote-${i}-${Math.random().toString(36).substring(2, 15)}`,
      voter: `0x${Math.random().toString(36).substring(2, 15)}`,
      choice: rankings,
      vp: votingPower,
    });
  }

  return votes;
}

export const simulateCopelandVoting = () => {
  const simulatedVotes = generateRandomVotes(25, options);
  const result = calculateCopelandVote(simulatedVotes, options);
  // TODO: remove this
  console.log("simulatedVotes:", JSON.stringify(simulatedVotes, null, 2));
  console.log("options:", options);
  return result;
};
