import * as theme from "@/styles/theme";
import { Prisma, ProposalType } from "@prisma/client";
import {
  ParsedProposalData,
  getProposalTotalValue,
  parseProposalData,
} from "./proposalUtils";
import { getHumanBlockTime } from "./blockTimes";
import { Block } from "ethers";

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
};

export function parseParams(
  params: string | null,
  proposaData: ParsedProposalData[ProposalType]
): ParsedParams[ProposalType]["kind"] {
  if (params === null || proposaData.key !== "APPROVAL") {
    return null;
  }

  try {
    const parsedParams = JSON.parse(params);
    return parsedParams[0].map((param: string) => {
      const idx = Number(param);
      return proposaData.kind.options[idx].description;
    });
  } catch (e) {
    return null;
  }
}

/**
 * Parse votes into votes response
 */

export type VotesResponse = {
  address: string;
  proposal_id: string;
  support: Support;
  weight: string;
  reason: string | null;
  params: ParsedParams[ProposalType]["kind"];
  proposalValue: bigint;
  proposalDescription: string;
  proposalType: ProposalType;
  timestamp: Date | null;
};

export function parseVote(
  vote: Prisma.VotesGetPayload<true>,
  proposalData: ParsedProposalData[ProposalType],
  latestBlock: Block | null
): VotesResponse {
  return {
    address: vote.voter,
    proposal_id: vote.proposal_id,
    support: parseSupport(vote.support, vote.proposal_type),
    weight: vote.weight,
    reason: vote.reason,
    params: parseParams(vote.params, proposalData),
    proposalValue: getProposalTotalValue(proposalData),
    proposalDescription: vote.description || "",
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
