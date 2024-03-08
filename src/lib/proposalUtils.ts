import { ProposalType } from "@prisma/client";
import { getHumanBlockTime } from "./blockTimes";
import { Proposal, ProposalPayload } from "@/app/api/common/proposals/proposal";
import { Abi, decodeFunctionData } from "viem";

const knownAbis: Record<string, Abi> = {
  "0x5ef2c7f0": [
    {
      constant: false,
      inputs: [
        { name: "_node", type: "bytes32" },
        { name: "_label", type: "bytes32" },
        { name: "_owner", type: "address" },
        { name: "_resolver", type: "address" },
        { name: "_ttl", type: "uint64" },
      ],
      name: "setSubnodeRecord",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  "0x10f13a8c": [
    {
      constant: false,
      inputs: [
        { name: "_node", type: "bytes32" },
        { name: "_key", type: "string" },
        { name: "_value", type: "string" },
      ],
      name: "setText",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  "0xb4720477": [
    {
      constant: false,
      inputs: [
        { name: "_child", type: "address" },
        { name: "_message", type: "bytes" },
      ],
      name: "sendMessageToChild",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  "0xa9059cbb": [
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "transfer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  "0x095ea7b3": [
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  "0x7b1837de": [
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_amount", type: "uint256" },
      ],
      name: "fund",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  "0x23b872dd": [
    {
      constant: false,
      inputs: [
        { name: "_from", type: "address" },
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};

const decodeCalldata = (calldatas: `0x${string}`[]) => {
  if (!calldatas || calldatas.length === 0 || !calldatas[0]) {
    return { functionName: "unknown", functionArgs: [] as string[] };
  }

  const abi = knownAbis[calldatas[0].slice(0, 10)];
  let functionName = "unknown";
  let functionArgs = [] as string[];

  if (abi) {
    const decodedData = decodeFunctionData({
      abi: abi,
      data: calldatas[0],
    });
    functionName = decodedData.functionName;
    functionArgs = decodedData.args as string[];
  }

  return { functionName, functionArgs };
};

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

export async function parseProposal(
  proposal: ProposalPayload,
  latestBlock: number,
  quorum: bigint | null,
  votableSupply: bigint
): Promise<Proposal> {
  const proposalData = parseProposalData(
    JSON.stringify(proposal.proposal_data || {}),
    proposal.proposal_type as ProposalType
  );
  const proposalResuts = parseProposalResults(
    JSON.stringify(proposal.proposal_results || {}),
    proposalData
  );

  const proposalTypeData =
    proposal.proposal_type_data as ProposalTypeData | null;

  return {
    id: proposal.proposal_id,
    proposer: proposal.proposer,
    snapshotBlockNumber: Number(proposal.created_block),
    created_time: latestBlock
      ? getHumanBlockTime(proposal.created_block, latestBlock)
      : null,
    start_time: latestBlock
      ? getHumanBlockTime(proposal.start_block, latestBlock)
      : null,
    end_time: latestBlock
      ? getHumanBlockTime(proposal.end_block, latestBlock)
      : null,
    markdowntitle: getTitleFromProposalDescription(proposal.description || ""),
    description: proposal.description,
    quorum,
    approvalThreshold: proposalTypeData && proposalTypeData.approval_threshold,
    proposalData: proposalData.kind,
    unformattedProposalData: proposal.proposal_data_raw,
    proposalResults: proposalResuts.kind,
    proposalType: proposal.proposal_type as ProposalType,
    status: latestBlock
      ? await getProposalStatus(
        proposal,
        proposalResuts,
        latestBlock,
        quorum,
        votableSupply
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
    case "STANDARD" || "OPTIMISTIC": {
      return proposalData.kind.options.reduce((acc, option) => {
        return (
          option.values.reduce((sum, val) => {
            return BigInt(val) + sum;
          }, 0n) + acc
        );
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
      options: {
        targets: string[];
        values: string[];
        signatures: string[];
        calldatas: string[];
        functionName: string;
        functionArgs: string[];
      }[];
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
        functionName: string;
        functionArgs: string[];
        budgetTokensSpent: bigint | null;
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
  OPTIMISTIC: {
    key: "OPTIMISTIC";
    kind: { options: [] };
  };
};

export function parseProposalData(
  proposalData: string,
  proposalType: ProposalType
): ParsedProposalData[ProposalType] {
  switch (proposalType) {
    case "STANDARD": {
      const parsedProposalData = JSON.parse(proposalData);
      const calldatas = JSON.parse(parsedProposalData.calldatas);
      const { functionArgs, functionName } = decodeCalldata(calldatas);
      return {
        key: "STANDARD",
        kind: {
          options: [
            {
              targets: JSON.parse(parsedProposalData.targets),
              values: JSON.parse(parsedProposalData.values),
              signatures: JSON.parse(parsedProposalData.signatures),
              calldatas: calldatas,
              functionName,
              functionArgs,
            },
          ],
        },
      };
    }
    case "OPTIMISTIC": {
      return {
        key: "OPTIMISTIC",
        kind: { options: [] },
      };
    }
    case "APPROVAL": {
      const parsedProposalData = JSON.parse(proposalData);
      const [maxApprovals, criteria, budgetToken, criteriaValue, budgetAmount] =
        parsedProposalData[1] as [string, string, string, string, string];
      return {
        key: "APPROVAL",
        kind: {
          options: parsedProposalData[0].map(
            (option: Array<string | string[]>) => {
              const [
                budgetTokensSpent,
                targets,
                values,
                calldatas,
                description,
              ] = (() => {
                if (option.length === 4) {
                  return [
                    null,
                    option[0],
                    option[1],
                    option[2],
                    option[3],
                  ] as const;
                } else if (option.length === 5) {
                  return [
                    option[0],
                    option[1],
                    option[2],
                    option[3],
                    option[4],
                  ] as const;
                } else {
                  throw new Error("unknown option length");
                }
              })();

              const { functionArgs, functionName } = decodeCalldata(
                calldatas as `0x${string}`[]
              );

              return {
                targets,
                values,
                calldatas,
                description,
                functionName,
                functionArgs,
                budgetTokensSpent,
              };
            }
          ),
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

export type ParsedProposalResults = {
  STANDARD: {
    key: "STANDARD";
    kind: {
      for: bigint;
      against: bigint;
      abstain: bigint;
    };
  };
  OPTIMISTIC: {
    key: "OPTIMISTIC";
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

type ProposalResults = {
  standard: [string, string, string];
  approval: {
    param: string;
    votes: string;
  }[];
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
    case "OPTIMISTIC": {
      const parsedProposalResults = JSON.parse(proposalResults).standard;

      return {
        key: "OPTIMISTIC",
        kind: {
          for: BigInt(parsedProposalResults?.[1] ?? 0),
          against: BigInt(parsedProposalResults?.[0] ?? 0),
          abstain: BigInt(parsedProposalResults?.[2] ?? 0),
        },
      };
    }
    case "APPROVAL": {
      const parsedProposalResults = JSON.parse(
        proposalResults
      ) as ProposalResults;

      return {
        key: "APPROVAL",
        kind: {
          for: BigInt(parsedProposalResults.standard?.[0] ?? 0),
          abstain: BigInt(parsedProposalResults.standard?.[1] ?? 0),
          options: proposalData.kind.options.map((option, idx) => {
            return {
              option: option.description,
              votes: BigInt(
                parsedProposalResults.approval?.find((res) => {
                  return res.param === idx.toString();
                })?.votes ?? 0
              ),
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
  proposal: ProposalPayload,
  proposalResults: ParsedProposalResults[ProposalType],
  latestBlock: number,
  quorum: bigint | null,
  votableSupply: bigint
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
    case "OPTIMISTIC": {
      const {
        for: forVotes,
        against: againstVotes,
        abstain: abstainVotes,
      } = proposalResults.kind;

      // Check against 50% of votable supply
      if (BigInt(againstVotes) > BigInt(votableSupply!) / 2n) {
        return "DEFEATED";
      } else return "SUCCEEDED";
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

type ProposalTypeData = {
  proposal_type_id: number;
  name: string;
  quorum: bigint;
  approval_threshold: bigint;
};
