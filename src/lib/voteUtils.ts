/**
 * Parse vote params
 */

import { Prisma, ProposalType } from "@prisma/client";
import {
  ParsedProposalData,
  Support,
  parseProposalData,
  parseSupport,
} from "./proposalUtils";
import { getHumanBlockTime } from "./blockTimes";
import { Block } from "ethers";

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
 * Parse proposal into proposal response
 */

export type VotesForProposalResponse = {
  address: string;
  proposal_id: string;
  support: Support;
  amount: string;
  reason: string | null;
  params: ParsedParams[ProposalType]["kind"];
  timestamp: Date | null;
};

export function parseVotesForProposal(
  votes: Prisma.VotesGetPayload<true>[],
  latestBlock: Block | null
): VotesForProposalResponse[] {
  return votes.map((vote) => {
    const proposalData = parseProposalData(
      JSON.stringify(vote.proposal_data || {}),
      vote.proposal_type
    );
    return {
      address: vote.voter,
      proposal_id: vote.proposal_id,
      support: parseSupport(vote.support, vote.proposal_type),
      amount: vote.weight,
      reason: vote.reason,
      params: parseParams(vote.params, proposalData),
      timestamp: latestBlock
        ? getHumanBlockTime(
            vote.block_number,
            latestBlock.number,
            latestBlock.timestamp
          )
        : null,
    };
  });
}
