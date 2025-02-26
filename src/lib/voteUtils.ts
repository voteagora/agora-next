import * as theme from "@/styles/theme";
import { ProposalType } from "@prisma/client";
import {
  getProposalTotalValue,
  getTitleFromProposalDescription,
  ParsedProposalData,
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

export function colorForSupportType(supportType: Support) {
  switch (supportType) {
    case "AGAINST":
      return theme.colors.red["700"];

    case "ABSTAIN":
      return theme.colors.gray["700"];

    case "FOR":
      return theme.colors.green["700"];
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
  proposalData: ParsedProposalData[ProposalType],
  latestBlock: Block | null
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
    params: parseParams(vote.params, proposalData),
    proposalValue: getProposalTotalValue(proposalData) || BigInt(0),
    proposalTitle: getTitleFromProposalDescription(vote.description || ""),
    proposalType: vote.proposal_type,
    timestamp: latestBlock ? getHumanBlockTime(blockNumber, latestBlock) : null,
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
