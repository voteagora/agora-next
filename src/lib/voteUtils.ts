import {
  getProposalTotalValue,
  getTitleFromProposalDescription,
  ParsedProposalData,
  ParsedProposalResults,
  calculateHybridStandardProposalMetrics,
  calculateHybridApprovalProposalMetrics,
  calculateHybridOptimisticProposalMetrics,
} from "./proposalUtils";
import { getHumanBlockTime } from "./blockTimes";
import {
  SnapshotVote,
  Vote,
  VotePayload,
  SnapshotVotePayload,
} from "@/app/api/common/votes/vote";
import { VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { Block } from "ethers";
import { AbiCoder } from "ethers";
import { mapArbitrumBlockToMainnetBlock } from "./utils";
import { formatUnits, parseUnits } from "viem";
import { format } from "date-fns";
import { tokenForContractAddress } from "./tokenUtils";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ProposalType } from "./types";

/**
 * Vote primitives
 */

export type Support = "AGAINST" | "ABSTAIN" | "FOR";

export function parseSupport(
  support: string | null,
  proposalType: ProposalType,
  start_block: string | null
): Support {
  /**
   * @dev If start_block number of vote is less than 114615036, then it's a proposal
   *      from old approval voting module where 0 = for, 1 = against
   *      create approval voting module is 0 = against, 1 = abstain, 2 = for
   *      note that block number is indicative but works
   */

  const { namespace, contracts } = Tenant.current();

  if (
    namespace === TENANT_NAMESPACES.OPTIMISM &&
    start_block &&
    contracts.governor.v6UpgradeBlock &&
    Number(start_block) < contracts.governor.v6UpgradeBlock
  ) {
    return parseSupportOldModule(support, proposalType);
  }

  switch (Number(support)) {
    case 0:
      return "AGAINST";
    case 1:
      return "FOR";

    default:
      return "ABSTAIN";
  }
}

export function parseSupportOldModule(
  support: string | null,
  proposalType: ProposalType
): Support {
  switch (Number(support)) {
    case 0:
      return proposalType === "APPROVAL" ? "FOR" : "AGAINST";

    case 1:
      return proposalType === "APPROVAL" ? "ABSTAIN" : "FOR";

    default:
      return "ABSTAIN";
  }
}

/**
 * Parse vote params
 */

export type ParsedParams = {
  APPROVAL: {
    key: "APPROVAL";
    kind: string[];
  };
  STANDARD: {
    key: "STANDARD";
    kind: null;
  };
  OPTIMISTIC: {
    key: "OPTIMISTIC";
    kind: null;
  };
  SNAPSHOT: {
    key: "SNAPSHOT";
    kind: null;
  };
  OFFCHAIN_OPTIMISTIC_TIERED: {
    key: "OFFCHAIN_OPTIMISTIC_TIERED";
    kind: null;
  };
  OFFCHAIN_OPTIMISTIC: {
    key: "OFFCHAIN_OPTIMISTIC";
    kind: null;
  };
  OFFCHAIN_STANDARD: {
    key: "OFFCHAIN_STANDARD";
    kind: null;
  };
  OFFCHAIN_APPROVAL: {
    key: "OFFCHAIN_APPROVAL";
    kind: string[];
  };
  HYBRID_STANDARD: {
    key: "HYBRID_STANDARD";
    kind: string[];
  };
  HYBRID_APPROVAL: {
    key: "HYBRID_APPROVAL";
    kind: string[];
  };
  HYBRID_OPTIMISTIC: {
    key: "HYBRID_OPTIMISTIC";
    kind: string[];
  };
  HYBRID_OPTIMISTIC_TIERED: {
    key: "HYBRID_OPTIMISTIC_TIERED";
    kind: string[];
  };
};

export function parseParams(
  params: string | null,
  proposalData: ParsedProposalData[ProposalType]
): ParsedParams[ProposalType]["kind"] {
  if (params === null || proposalData.key !== "APPROVAL") {
    return null;
  }

  const parsedParams =
    typeof params === "string" && params.startsWith("[")
      ? JSON.parse(params)
      : params;

  try {
    let selectedOptions = [];
    if (typeof parsedParams === "string") {
      const hexParams = params.startsWith("0x") ? params : `0x${params}`;

      const decoded = new AbiCoder().decode(["uint256[]"], hexParams);

      selectedOptions = decoded[0];
    } else {
      selectedOptions = parsedParams?.flat();
    }

    const result = selectedOptions.map((optionIndex: bigint) => {
      const idx = Number(optionIndex);
      return proposalData.kind.options[idx].description;
    });

    return result;
  } catch (e) {
    console.error("Error decoding params:", e);
    return null;
  }
}

export function parseSnapshotVote(vote: SnapshotVotePayload): SnapshotVote {
  return {
    id: vote.id,
    title: vote.title || "",
    address: vote.voter,
    createdAt: new Date(Number(vote.created) * 1000), // Convert seconds to milliseconds for Date
    choice: vote.choice,
    votingPower: vote.vp,
    reason: vote.reason || "",
    choiceLabels: vote.choice_labels || {},
  };
}

/**
 * Parse votes into votes response
 */

export async function parseVote(
  vote: VotePayload,
  proposalData?: ParsedProposalData[ProposalType],
  latestBlock?: Block | null
): Promise<Vote> {
  const { contracts } = Tenant.current();
  let blockNumber = vote.block_number;
  if (
    contracts.governor.chain.id === 42161 ||
    contracts.governor.chain.id === 421614
  ) {
    blockNumber = await mapArbitrumBlockToMainnetBlock(blockNumber);
  }

  return {
    transactionHash: vote.transaction_hash,
    address: vote.voter,
    proposalId: vote.proposal_id,
    support: parseSupport(vote.support, vote.proposal_type, vote.start_block),
    weight: vote.weight.toFixed(0),
    reason: vote.reason,
    params: proposalData ? parseParams(vote.params, proposalData) : null,
    proposalValue: proposalData
      ? (getProposalTotalValue(proposalData) ?? BigInt(0))
      : BigInt(0),
    proposalTitle: getTitleFromProposalDescription(vote.description || ""),
    proposalType: vote.proposal_type,
    blockNumber: vote.block_number,
    timestamp: latestBlock ? getHumanBlockTime(blockNumber, latestBlock) : null,
    citizenType: vote.citizen_type || null,
    voterMetadata: vote.voter_metadata || {},
  };
}

/**
 * Check if vote is missing from voting power
 */

export type MissingVote = "ADVANCED" | "DIRECT" | "BOTH" | "NONE";

export function checkMissingVoteForDelegate(
  delegateVotes: Vote[],
  votingPower: VotingPowerData
): MissingVote {
  const totalVotes = delegateVotes.reduce(
    (acc, vote) => acc + BigInt(vote.weight),
    0n
  );

  if (delegateVotes.length > 0 && totalVotes >= BigInt(votingPower.totalVP)) {
    return "NONE";
  }

  const nonZeroVotes = delegateVotes.filter((vote) => BigInt(vote.weight) > 0n);
  const hasAdvancedVP = BigInt(votingPower.advancedVP) > 0n;
  const hasDirectVP = BigInt(votingPower.directVP) > 0n;
  const hasVoted = delegateVotes.length > 0;
  const hasMultipleVotes = nonZeroVotes.length > 1;
  const hasVotedWithDirectVP = delegateVotes.some(
    (vote) => BigInt(vote.weight) === BigInt(votingPower.directVP)
  );

  // Direct vote is always going to match the vp of the vote

  // Case where delegate voted with both advanced and direct voting power.
  if (hasMultipleVotes) {
    if (
      delegateVotes.some(
        (vote) => BigInt(vote.weight) === BigInt(votingPower.directVP)
      )
    ) {
      return "NONE";
    }
    if (hasDirectVP) {
      return "DIRECT";
    }
    return "NONE";
  }

  // Case where no advanced voting power.
  // User with 0 VP can cast a Direct Vote.
  if (!hasAdvancedVP) {
    return hasVoted ? "NONE" : "DIRECT";
  }

  // Case where delegate has advanced voting power and not voted at all.
  if (!hasVoted) {
    return hasDirectVP ? "BOTH" : "ADVANCED";
  }

  // Case where delegate can only vote with advanced and has already voted.
  if (!hasDirectVP) {
    return "NONE";
  }

  // Case where delegate has advanced voting power and voted only once.
  return hasVotedWithDirectVP ? "ADVANCED" : "DIRECT";
}

export function getVpToDisplay(
  votingPower: VotingPowerData,
  missingVote: MissingVote
): string {
  if (missingVote === "ADVANCED") {
    return votingPower.advancedVP;
  }

  if (missingVote === "DIRECT") {
    return votingPower.directVP;
  }

  if (missingVote === "BOTH") {
    return votingPower.totalVP;
  }

  return "";
}

type VoteMetadataParams = {
  proposal: Proposal;
  votes?: Vote[] | null;
  votableSupply?: string;
  address?: string;
  newVote?: Pick<Vote, "support" | "reason" | "weight" | "params">;
};

export function calculateVoteMetadata({
  proposal,
  votes,
  votableSupply,
  address,
  newVote,
}: VoteMetadataParams) {
  const vote = votes?.[0];
  const { token, contracts } = Tenant.current();

  const formattedVotableSupply = votableSupply
    ? Number(BigInt(votableSupply) / BigInt(10 ** token.decimals))
    : Number(115000000);

  const endsIn = proposal.endTime
    ? `ENDS ~${format(new Date(proposal.endTime), "MMM d")}`
    : "";

  // Handle hybrid proposals with weighted calculations
  let boundedForPercentage = 0;
  let boundedAgainstPercentage = 0;

  if (proposal.proposalType === "HYBRID_STANDARD") {
    const metrics = calculateHybridStandardProposalMetrics(proposal);
    boundedForPercentage = metrics.totalForVotesPercentage;
    boundedAgainstPercentage = metrics.totalAgainstVotesPercentage;
  } else if (proposal.proposalType === "HYBRID_APPROVAL") {
    const metrics = calculateHybridApprovalProposalMetrics({
      proposalResults:
        proposal.proposalResults as ParsedProposalResults["HYBRID_APPROVAL"]["kind"],
      proposalData:
        proposal.proposalData as ParsedProposalData["HYBRID_APPROVAL"]["kind"],
      quorum: Number(proposal.quorum),
      createdTime: proposal.createdTime,
    });
    boundedForPercentage = metrics.totalWeightedParticipation;
    boundedAgainstPercentage = 0; // Approval proposals don't typically show against percentage
  } else if (
    proposal.proposalType === "HYBRID_OPTIMISTIC" ||
    proposal.proposalType === "HYBRID_OPTIMISTIC_TIERED"
  ) {
    const metrics = calculateHybridOptimisticProposalMetrics(proposal);
    boundedForPercentage = 0; // Optimistic proposals don't show for percentage
    boundedAgainstPercentage = metrics.totalAgainstVotes;
  } else {
    // Standard calculation for non-hybrid proposals
    const results =
      proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];

    const adjustedResults = {
      for: BigInt(results.for),
      against: BigInt(results.against),
      abstain: BigInt(results.abstain),
    };

    if (newVote) {
      const newVoteWeight = BigInt(newVote.weight);
      if (newVote.support === "FOR") adjustedResults.for += newVoteWeight;
      else if (newVote.support === "AGAINST")
        adjustedResults.against += newVoteWeight;
      else if (newVote.support === "ABSTAIN")
        adjustedResults.abstain += newVoteWeight;
    }

    const totalVotes =
      adjustedResults.for + adjustedResults.against + adjustedResults.abstain;

    const calculatePercentage = (value: bigint, total: bigint): number => {
      if (total === BigInt(0)) return 0;
      try {
        const percentage = (Number(value) / Number(total)) * 100;
        return isFinite(percentage) ? percentage : 0;
      } catch {
        return 0;
      }
    };

    const calculateOptimisticAgainstPercentage = (): number => {
      try {
        const againstAmount = Number(
          formatUnits(adjustedResults.against, token.decimals)
        );
        const proposalData =
          proposal.proposalData as ParsedProposalData["OPTIMISTIC"]["kind"];
        const disapprovalThreshold = proposalData.disapprovalThreshold;
        const thresholdAmount =
          (disapprovalThreshold * Number(formattedVotableSupply)) / 100;

        if (thresholdAmount === 0) return 0;

        const percentage = (againstAmount / thresholdAmount) * 100;
        return isFinite(percentage) ? percentage : 0;
      } catch {
        return 0;
      }
    };

    const forPercentage =
      proposal.proposalType === "OPTIMISTIC"
        ? 0
        : calculatePercentage(adjustedResults.for, totalVotes);

    const againstPercentage =
      proposal.proposalType === "OPTIMISTIC"
        ? calculateOptimisticAgainstPercentage()
        : calculatePercentage(adjustedResults.against, totalVotes);

    // Ensure percentages are within bounds
    boundedForPercentage = Math.min(Math.max(forPercentage, 0), 100);
    boundedAgainstPercentage = Math.min(Math.max(againstPercentage, 0), 100);
  }

  let parsedOptions: {
    description: string;
    votes: string;
    votesAmountBN: string;
    totalVotingPower: string;
    proposalSettings: any;
    thresholdPosition: number;
    isApproved: boolean;
  }[] = [];
  let totalOptions = 0;

  if (
    proposal.proposalType === "APPROVAL" ||
    proposal.proposalType === "HYBRID_APPROVAL"
  ) {
    const proposalData =
      proposal.proposalData as ParsedProposalData["APPROVAL"]["kind"];

    const { decimals: contractTokenDecimals } = tokenForContractAddress(
      proposalData.proposalSettings.budgetToken
    );

    const proposalResults =
      proposal.proposalResults as ParsedProposalResults["APPROVAL"]["kind"];
    const proposalSettings = proposalData.proposalSettings;
    const options = proposalResults.options;

    let totalVotingPower;
    let thresholdPosition;

    if (proposal.proposalType === "HYBRID_APPROVAL") {
      // Use weighted calculations for hybrid approval
      const metrics = calculateHybridApprovalProposalMetrics({
        proposalResults:
          proposal.proposalResults as ParsedProposalResults["HYBRID_APPROVAL"]["kind"],
        proposalData:
          proposal.proposalData as ParsedProposalData["HYBRID_APPROVAL"]["kind"],
        quorum: Number(proposal.quorum),
        createdTime: proposal.createdTime,
      });
      totalVotingPower = BigInt(
        Math.round(metrics.totalWeightedParticipation * 10000)
      ); // Convert to scaled format

      thresholdPosition = (() => {
        if (proposalSettings.criteria === "THRESHOLD") {
          const thresholdPercentage =
            Number(proposalSettings.criteriaValue) / 100;
          if (metrics.totalWeightedParticipation < thresholdPercentage * 1.5) {
            return 66;
          } else {
            return metrics.totalWeightedParticipation > 0
              ? Math.max(
                  (thresholdPercentage / metrics.totalWeightedParticipation) *
                    100,
                  5
                )
              : 5;
          }
        }
        return 0;
      })();
    } else {
      // Standard approval calculation
      totalVotingPower =
        BigInt(proposalResults.for) +
        BigInt(proposalResults.abstain) +
        BigInt(proposalResults.against);

      if (newVote) {
        totalVotingPower += BigInt(newVote.weight);
      }

      thresholdPosition = (() => {
        if (proposalSettings.criteria === "THRESHOLD") {
          const threshold = BigInt(proposalSettings.criteriaValue);
          if (totalVotingPower < (threshold * BigInt(15)) / BigInt(10)) {
            return 66;
          } else {
            // calculate threshold position, min 5% max 66%
            return totalVotingPower
              ? Math.max(
                  Number((threshold * BigInt(100)) / totalVotingPower),
                  5
                )
              : 5;
          }
        }
        return 0;
      })();
    }

    let availableBudget = BigInt(proposalSettings.budgetAmount);
    let isExceeded = false;

    const mutableOptions = [...options];
    let sortedOptions;

    if (proposal.proposalType === "HYBRID_APPROVAL") {
      // For hybrid approval, use weighted percentage for sorting
      const metrics = calculateHybridApprovalProposalMetrics({
        proposalResults:
          proposal.proposalResults as ParsedProposalResults["HYBRID_APPROVAL"]["kind"],
        proposalData:
          proposal.proposalData as ParsedProposalData["HYBRID_APPROVAL"]["kind"],
        quorum: Number(proposal.quorum),
        createdTime: proposal.createdTime,
      });
      sortedOptions = mutableOptions
        .map((option, i) => ({
          ...option,
          ...proposalData.options[i],
          weightedPercentage:
            metrics.optionResults.find(
              (result) => result.optionName === option.option
            )?.weightedPercentage || 0,
        }))
        .sort((a, b) => b.weightedPercentage - a.weightedPercentage);
    } else {
      // Standard sorting by raw votes
      sortedOptions = mutableOptions
        .map((option, i) => {
          const votes = BigInt(option.votes || 0);
          const newVoteForOption = newVote?.params?.includes(option.option)
            ? BigInt(newVote.weight)
            : BigInt(0);

          return {
            ...option,
            ...proposalData.options[i],
            votes: (votes + newVoteForOption).toString(),
          };
        })
        .sort((a, b) =>
          BigInt(b.votes || 0) > BigInt(a.votes || 0)
            ? 1
            : BigInt(b.votes || 0) < BigInt(a.votes || 0)
              ? -1
              : 0
        );
    }

    totalOptions = sortedOptions.length;

    sortedOptions
      .slice(0, totalOptions > 7 ? 7 : totalOptions)
      .forEach((option, index) => {
        let isApproved = false;
        let votesAmountBN;
        let votes;

        if (proposal.proposalType === "HYBRID_APPROVAL") {
          // For hybrid approval, use weighted percentage
          const weightedPercentage = (option as any).weightedPercentage || 0;
          votesAmountBN = BigInt(Math.round(weightedPercentage * 10000)); // Convert to scaled format
          votes = String(Math.round(weightedPercentage * 100)); // Convert to percentage format
        } else {
          // Standard calculation
          votesAmountBN = BigInt(option?.votes || 0);
          votes = String(option.votes);
        }

        const optionBudget =
          (proposal?.createdTime as Date) >
          contracts.governor.optionBudgetChangeDate!
            ? BigInt(option?.budgetTokensSpent || 0)
            : parseUnits(
                option?.budgetTokensSpent?.toString() || "0",
                contractTokenDecimals
              );

        if (proposalSettings.criteria === "TOP_CHOICES") {
          isApproved = index < Number(proposalSettings.criteriaValue);
        } else if (proposalSettings.criteria === "THRESHOLD") {
          if (proposal.proposalType === "HYBRID_APPROVAL") {
            // For hybrid approval, compare weighted percentage to threshold
            const thresholdPercentage = Number(proposalSettings.criteriaValue);
            const weightedPercentage = (option as any).weightedPercentage || 0;
            isApproved =
              !isExceeded &&
              weightedPercentage >= thresholdPercentage &&
              availableBudget >= optionBudget;
          } else {
            // Standard threshold comparison
            const threshold = BigInt(proposalSettings.criteriaValue);
            isApproved =
              !isExceeded &&
              votesAmountBN >= threshold &&
              availableBudget >= optionBudget;
          }

          if (isApproved) {
            availableBudget = availableBudget - optionBudget;
          } else {
            isExceeded = true;
          }
        }

        parsedOptions.push({
          description: option.option,
          votes,
          votesAmountBN: String(votesAmountBN),
          totalVotingPower: String(totalVotingPower),
          proposalSettings,
          thresholdPosition,
          isApproved,
        });
      });
  }

  return {
    support: vote?.support || newVote?.support,
    blockNumber: vote?.blockNumber,
    timestamp: vote?.timestamp
      ? format(new Date(vote.timestamp), "MMM d, yyyy h:mm a")
      : format(new Date(), "MMM d, yyyy h:mm a"),
    address: address || vote?.address,
    endsIn,
    forPercentage: boundedForPercentage,
    againstPercentage: boundedAgainstPercentage,
    totalOptions,
    options: parsedOptions,
    reason: vote?.reason || newVote?.reason,
    transactionHash: vote?.transactionHash,
  };
}

export function calculateVoteMetadataMinified({
  proposal,
  votableSupply,
  newVote,
}: {
  proposal: Proposal;
  votableSupply?: string;
  newVote?: Pick<Vote, "support" | "reason" | "weight" | "params">;
}) {
  const { token } = Tenant.current();

  const formattedVotableSupply = votableSupply
    ? Number(BigInt(votableSupply) / BigInt(10 ** token.decimals))
    : Number(115000000);

  const endsIn = proposal.endTime
    ? `ENDS ~${format(new Date(proposal.endTime), "MMM d")}`
    : "";

  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];

  const adjustedResults = {
    for: BigInt(results.for || 0n),
    against: BigInt(results.against || 0n),
    abstain: BigInt(results.abstain || 0n),
  };

  if (newVote) {
    const newVoteWeight = BigInt(newVote.weight);
    if (newVote.support === "FOR") adjustedResults.for += newVoteWeight;
    else if (newVote.support === "AGAINST")
      adjustedResults.against += newVoteWeight;
    else if (newVote.support === "ABSTAIN")
      adjustedResults.abstain += newVoteWeight;
  }

  const totalVotes =
    adjustedResults.for + adjustedResults.against + adjustedResults.abstain;

  const calculatePercentage = (value: bigint, total: bigint): number => {
    if (total === BigInt(0)) return 0;
    try {
      const percentage = (Number(value) / Number(total)) * 100;
      return isFinite(percentage) ? percentage : 0;
    } catch {
      return 0;
    }
  };

  const calculateOptimisticAgainstPercentage = (): number => {
    try {
      const againstAmount = Number(
        formatUnits(adjustedResults.against, token.decimals)
      );
      const proposalData =
        proposal.proposalData as ParsedProposalData["OPTIMISTIC"]["kind"];
      const disapprovalThreshold = proposalData.disapprovalThreshold;
      const thresholdAmount =
        (disapprovalThreshold * Number(formattedVotableSupply)) / 100;

      if (thresholdAmount === 0) return 0;

      const percentage = (againstAmount / thresholdAmount) * 100;
      return isFinite(percentage) ? percentage : 0;
    } catch {
      return 0;
    }
  };

  const forPercentage =
    proposal.proposalType === "OPTIMISTIC"
      ? 0
      : calculatePercentage(adjustedResults.for, totalVotes);

  const againstPercentage =
    proposal.proposalType === "OPTIMISTIC"
      ? calculateOptimisticAgainstPercentage()
      : calculatePercentage(adjustedResults.against, totalVotes);

  // Ensure percentages are within bounds
  const boundedForPercentage = Math.min(Math.max(forPercentage, 0), 100);
  const boundedAgainstPercentage = Math.min(
    Math.max(againstPercentage, 0),
    100
  );

  return {
    endsIn,
    forPercentage: boundedForPercentage,
    againstPercentage: boundedAgainstPercentage,
  };
}
