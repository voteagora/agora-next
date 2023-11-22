import { getQuorumForProposal } from "./governorUtils";
import { Prisma, ProposalType } from "@prisma/client";
import { getHumanBlockTime } from "./blockTimes";
import { Block } from "ethers";

/**
 * Proposal title extraction
 */

const extractTitle = (body: string | undefined): string | null => {
  if (!body) return null;
  const hashResult = body.match(/^\s*#{1,6}\s+([^\n]+)/);
  if (hashResult) {
    return hashResult[1];
  }

  const equalResult = body.match(/^\s*([^\n]+)\n(={3,25}|-{3,25})/);
  if (equalResult) {
    return equalResult[1];
  }

  const textResult = body.match(/^\s*([^\n]+)\s*/);
  if (textResult) {
    return textResult[1];
  }

  return null;
};

const removeBold = (text: string | null): string | null =>
  text ? text.replace(/\*\*/g, "") : text;

const removeItalics = (text: string | null): string | null =>
  text ? text.replace(/__/g, "") : text;

export function getTitleFromProposalDescription(description: string = "") {
  const normalizedDescription = description
    .replace(/\\n/g, "\n")
    .replace(/(^['"]|['"]$)/g, "");

  return (
    removeItalics(removeBold(extractTitle(normalizedDescription)))?.trim() ??
    "Untitled"
  );
}

/**
 * Parse proposal into proposal response
 */

export type ProposalResponse = {
  id: string;
  proposer: string;
  created_time: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  markdowntitle: string;
  proposaData: ParsedProposalData[ProposalType]["kind"];
  proposalResults: ParsedProposalResults[ProposalType]["kind"];
  proposalType: ProposalType | null;
  status: ProposalStatus | null;
};

export async function parseProposal(
  proposal: Prisma.ProposalsGetPayload<true>,
  latestBlock: Block | null
): Promise<ProposalResponse> {
  const proposalData = parseProposalData(
    JSON.stringify(proposal.proposal_data || {}),
    proposal.proposal_type as ProposalType
  );
  const proposalResutsls = parseProposalResults(
    JSON.stringify(proposal.proposal_results || {}),
    proposalData
  );
  return {
    id: proposal.proposal_id,
    proposer: proposal.proposer,
    created_time: latestBlock
      ? getHumanBlockTime(
          proposal.created_block,
          latestBlock.number,
          latestBlock.timestamp
        )
      : null,
    start_time: latestBlock
      ? getHumanBlockTime(
          proposal.start_block,
          latestBlock.number,
          latestBlock.timestamp
        )
      : null,
    end_time: latestBlock
      ? getHumanBlockTime(
          proposal.end_block,
          latestBlock.number,
          latestBlock.timestamp
        )
      : null,
    markdowntitle: getTitleFromProposalDescription(proposal.description || ""),
    proposaData: proposalData.kind,
    proposalResults: proposalResutsls.kind,
    proposalType: proposal.proposal_type as ProposalType,
    status: latestBlock
      ? await getProposalStatus(
          proposal,
          proposalResutsls,
          Number(latestBlock.number)
        )
      : null,
  };
}

/**
 * Extract proposal total value
 */

export function getProposalTotalValue(
  proposalData: ParsedProposalData[ProposalType]
) {
  switch (proposalData.key) {
    case "STANDARD": {
      return proposalData.kind.values.reduce((acc, val) => {
        return acc + BigInt(val);
      }, 0n);
    }
    case "APPROVAL": {
      return proposalData.kind.options.reduce((acc, option) => {
        return (
          option.values.reduce((sum, val) => {
            return BigInt(val) + sum;
          }, 0n) + acc
        );
      }, 0n);
    }
  }
}

export type ParsedProposalData = {
  STANDARD: {
    key: "STANDARD";
    kind: {
      targets: string[];
      values: string[];
      signatures: string[];
      calldatas: string[];
    };
  };
  APPROVAL: {
    key: "APPROVAL";
    kind: {
      options: {
        targets: string[];
        values: string[];
        calldatas: string[];
        description: string;
      }[];
      proposalSettings: {
        maxApprovals: number;
        criteria: "THRESHOLD" | "TOP_CHOICES";
        budgetToken: string;
        criteriaValue: bigint;
        budgetAmount: bigint;
      };
    };
  };
};

export function parseProposalData(
  proposalData: string,
  proposalType: ProposalType
): ParsedProposalData[ProposalType] {
  switch (proposalType) {
    case "STANDARD": {
      const parsedProposalData = JSON.parse(proposalData);
      return {
        key: "STANDARD",
        kind: {
          targets: JSON.parse(parsedProposalData.targets),
          values: JSON.parse(parsedProposalData.values),
          signatures: JSON.parse(parsedProposalData.signatures),
          calldatas: JSON.parse(parsedProposalData.calldatas),
        },
      };
    }
    case "APPROVAL": {
      const parsedProposalData = JSON.parse(proposalData);
      const [maxApprovals, criteria, budgetToken, criteriaValue, budgetAmount] =
        parsedProposalData[1] as [string, string, string, string, string];
      return {
        key: "APPROVAL",
        kind: {
          options: (
            parsedProposalData[0] as Array<
              [string[], string[], string[], string]
            >
          ).map((option) => {
            return {
              targets: option[0],
              values: option[1],
              calldatas: option[2],
              description: option[3],
            };
          }),
          proposalSettings: {
            maxApprovals: Number(maxApprovals),
            criteria: toApprovalVotingCriteria(Number(criteria)),
            budgetToken,
            criteriaValue: BigInt(criteriaValue),
            budgetAmount: BigInt(budgetAmount),
          },
        },
      };
    }
    default: {
      throw new Error(`unknown type ${proposalType}`);
    }
  }
}

function toApprovalVotingCriteria(value: number): "THRESHOLD" | "TOP_CHOICES" {
  switch (value) {
    case 0:
      return "THRESHOLD";
    case 1:
      return "TOP_CHOICES";
    default:
      throw new Error(`unknown type ${value}`);
  }
}

/**
 * Parse proposal results
 */

type ParsedProposalResults = {
  STANDARD: {
    key: "STANDARD";
    kind: {
      for: bigint;
      against: bigint;
      abstain: bigint;
    };
  };
  APPROVAL: {
    key: "APPROVAL";
    kind: {
      for: bigint;
      abstain: bigint;
      options: {
        option: string;
        votes: bigint;
      }[];
      criteria: "THRESHOLD" | "TOP_CHOICES";
      criteriaValue: bigint;
    };
  };
};

export function parseProposalResults(
  proposalResults: string,
  proposalData: ParsedProposalData[ProposalType]
): ParsedProposalResults[ProposalType] {
  switch (proposalData.key) {
    case "STANDARD": {
      const parsedProposalResults = JSON.parse(proposalResults).standard;

      return {
        key: "STANDARD",
        kind: {
          for: BigInt(parsedProposalResults?.[1] ?? 0),
          against: BigInt(parsedProposalResults?.[0] ?? 0),
          abstain: BigInt(parsedProposalResults?.[2] ?? 0),
        },
      };
    }
    case "APPROVAL": {
      const parsedProposalResults = JSON.parse(proposalResults);
      return {
        key: "APPROVAL",
        kind: {
          for:
            parsedProposalResults.approval?.reduce(
              (sum: bigint, { votes }: { votes: string }) => {
                return sum + BigInt(votes);
              },
              0n
            ) ?? 0n,
          abstain: BigInt(parsedProposalResults.standard?.[1] ?? 0),
          options: proposalData.kind.options.map((option, idx) => {
            return {
              option: option.description,
              votes: parsedProposalResults.approval?.[idx] ?? 0n,
            };
          }),
          criteria: proposalData.kind.proposalSettings.criteria,
          criteriaValue: proposalData.kind.proposalSettings.criteriaValue,
        },
      };
    }
  }
}

/**
 * Parse proposal status
 */

export type ProposalStatus =
  | "CANCELLED"
  | "SUCCEEDED"
  | "DEFEATED"
  | "ACTIVE"
  | "PENDING"
  | "QUEUED"
  | "EXECUTED";

export async function getProposalStatus(
  proposal: Prisma.ProposalsGetPayload<true>,
  proposalResults: ParsedProposalResults[ProposalType],
  latestBlock: number
): Promise<ProposalStatus> {
  if (proposal.cancelled_block) {
    return "CANCELLED";
  }
  if (proposal.executed_block) {
    return "EXECUTED";
  }
  if (
    !proposal.start_block ||
    !latestBlock ||
    Number(proposal.start_block) > latestBlock
  ) {
    return "PENDING";
  }
  if (!proposal.end_block || Number(proposal.end_block) > latestBlock) {
    return "ACTIVE";
  }

  const quorum = await getQuorumForProposal(proposal);

  switch (proposalResults.key) {
    case "STANDARD": {
      const {
        for: forVotes,
        against: againstVotes,
        abstain: abstainVotes,
      } = proposalResults.kind;
      const proposalQuorumVotes = forVotes + abstainVotes;

      if ((quorum && proposalQuorumVotes < quorum) || forVotes < againstVotes) {
        return "DEFEATED";
      }

      if (forVotes > againstVotes) {
        return "SUCCEEDED";
      }

      break;
    }
    case "APPROVAL": {
      const { for: forVotes, abstain: abstainVotes } = proposalResults.kind;
      const proposalQuorumVotes = forVotes + abstainVotes;

      if (quorum && proposalQuorumVotes < quorum) {
        return "DEFEATED";
      }

      if (proposalResults.kind.criteria === "THRESHOLD") {
        for (const option of proposalResults.kind.options) {
          if (option.votes > proposalResults.kind.criteriaValue) {
            return "SUCCEEDED";
          }
        }

        return "DEFEATED";
      } else {
        return "SUCCEEDED";
      }
    }
  }

  return "QUEUED";
}
