import * as theme from "@/styles/theme";
import { Prisma, ProposalType } from "@prisma/client";
import {
  ParsedProposalData,
  getProposalTotalValue,
  getTitleFromProposalDescription,
  parseProposalData,
} from "./proposalUtils";
import { getHumanBlockTime } from "./blockTimes";
import { Block } from "ethers";
import { Vote } from "@/app/api/votes/vote";

/**
 * Vote primitives
 */

export type Support = "AGAINST" | "ABSTAIN" | "FOR";

export function parseSupport(
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

type ParsedParams = {
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
};

export function parseParams(
  params: string | null,
  proposalData: ParsedProposalData[ProposalType]
): ParsedParams[ProposalType]["kind"] {
  if (params === null || proposalData.key !== "APPROVAL") {
    return null;
  }

  try {
    const parsedParams = JSON.parse(params);
    return parsedParams[0].map((param: string) => {
      const idx = Number(param);
      return proposalData.kind.options[idx].description;
    });
  } catch (e) {
    return null;
  }
}

/**
 * Parse votes into votes response
 */

export function parseVote(
  vote: Prisma.VotesGetPayload<true>,
  proposalData: ParsedProposalData[ProposalType],
  latestBlock: Block | null
): Vote {
  return {
    transactionHash: vote.transaction_hash,
    address: vote.voter,
    proposal_id: vote.proposal_id,
    support: parseSupport(vote.support, vote.proposal_type),
    weight: vote.weight,
    reason: vote.reason,
    params: parseParams(vote.params, proposalData),
    proposalValue: getProposalTotalValue(proposalData) || BigInt(0),
    proposalTitle: getTitleFromProposalDescription(vote.description || ""),
    proposalType: vote.proposal_type,
    timestamp: latestBlock
      ? getHumanBlockTime(
          vote.block_number,
          latestBlock.number,
          latestBlock.timestamp
        )
      : null,
  };
}
