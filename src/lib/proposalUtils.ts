import { getHumanBlockTime } from "./blockTimes";
import {
  Proposal,
  BlockBasedProposal,
  TimestampBasedProposal,
  ProposalPayload,
} from "@/app/api/common/proposals/proposal";
import { Abi, decodeFunctionData, keccak256 } from "viem";
import Tenant from "./tenant/tenant";
import { Block, toUtf8Bytes, formatUnits } from "ethers";
import { mapArbitrumBlockToMainnetBlock } from "./utils";
import {
  TENANT_NAMESPACES,
  OFFCHAIN_THRESHOLDS,
  HYBRID_VOTE_WEIGHTS,
  disapprovalThreshold,
} from "./constants";
import { ProposalType } from "./types";

// Type guards
export function isTimestampBasedProposal(
  proposal: ProposalPayload
): proposal is ProposalPayload & TimestampBasedProposal {
  return (
    "start_timestamp" in proposal &&
    typeof proposal.start_timestamp === "string"
  );
}

export function isBlockBasedProposal(
  proposal: ProposalPayload
): proposal is ProposalPayload & BlockBasedProposal {
  return "start_block" in proposal && typeof proposal.start_block === "string";
}

// Safe accessor functions
export function getStartTimestamp(
  proposal: ProposalPayload
): string | undefined {
  return isTimestampBasedProposal(proposal)
    ? proposal.start_timestamp
    : undefined;
}

export function getEndTimestamp(proposal: ProposalPayload): string | undefined {
  return isTimestampBasedProposal(proposal)
    ? proposal.end_timestamp
    : undefined;
}

export function getStartBlock(proposal: ProposalPayload): string | undefined {
  if (isBlockBasedProposal(proposal)) {
    return proposal.start_block;
  }
  return undefined;
}

export function getEndBlock(proposal: ProposalPayload): string | undefined {
  if (isBlockBasedProposal(proposal)) {
    return proposal.end_block || undefined;
  }
  return undefined;
}

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
  return calldatas.map((calldata) => {
    const parsedCalldata: `0x${string}` = calldata.startsWith("0x")
      ? calldata
      : (("0x" + calldata) as `0x${string}`);
    const abi = knownAbis[parsedCalldata.slice(0, 10)];
    let functionName = "unknown";
    let functionArgs = [] as string[];

    if (abi) {
      const decodedData = decodeFunctionData({
        abi: abi,
        data: parsedCalldata,
      });
      functionName = decodedData.functionName;
      functionArgs = decodedData.args as string[];
    }

    return {
      functionArgs,
      functionName,
    };
  });
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

export const mapOffchainProposalType = (
  proposalType: ProposalType
): ProposalType => {
  switch (proposalType) {
    case "OFFCHAIN_STANDARD":
      return "HYBRID_STANDARD";
    case "OFFCHAIN_APPROVAL":
      return "HYBRID_APPROVAL";
    case "OFFCHAIN_OPTIMISTIC":
      return "HYBRID_OPTIMISTIC";
    case "OFFCHAIN_OPTIMISTIC_TIERED":
      return "HYBRID_OPTIMISTIC_TIERED";
    default:
      return proposalType;
  }
};

/**
 * Parse proposal into proposal response
 */

export async function parseProposal(
  proposal: ProposalPayload,
  latestBlock: Block | null,
  quorum: bigint | null,
  votableSupply: bigint,
  offchainProposal?: ProposalPayload
): Promise<Proposal> {
  const { contracts, ui } = Tenant.current();
  const isTimeStampBasedTenant = ui.toggle(
    "use-timestamp-for-proposals"
  )?.enabled;

  // Use the safe accessor functions
  let startBlock: bigint | string | null = getStartBlock(proposal) || null;
  let endBlock: bigint | string | null = getEndBlock(proposal) || null;
  let queuedBlock: bigint | string | null = proposal.queued_block;
  let executedBlock: bigint | string | null = proposal.executed_block;
  let cancelledBlock: bigint | string | null = proposal.cancelled_block;
  let createdBlock: bigint | string | null = proposal.created_block;
  let offChainProposalData = offchainProposal?.proposal_data;
  let proposalType = proposal.proposal_type as ProposalType;

  if (offChainProposalData) {
    proposalType = mapOffchainProposalType(
      offchainProposal?.proposal_type as ProposalType
    );
  }

  if (
    contracts.governor.chain.id === 42161 ||
    contracts.governor.chain.id === 421614
  ) {
    queuedBlock = queuedBlock
      ? await mapArbitrumBlockToMainnetBlock(BigInt(queuedBlock))
      : null;
    executedBlock = executedBlock
      ? await mapArbitrumBlockToMainnetBlock(executedBlock)
      : null;
    cancelledBlock = cancelledBlock
      ? await mapArbitrumBlockToMainnetBlock(cancelledBlock)
      : null;
    createdBlock = createdBlock
      ? await mapArbitrumBlockToMainnetBlock(createdBlock)
      : null;
  }

  const proposalData = parseProposalData(
    JSON.stringify(proposal.proposal_data || {}),
    proposalType
  );

  let proposalResults;
  if (proposal.proposal_type.includes("OFFCHAIN") && !offChainProposalData) {
    proposalResults = parseOffChainProposalResults(
      JSON.stringify(proposal.proposal_results || {}),
      proposalType
    );
  } else {
    proposalResults = parseProposalResults(
      JSON.stringify(proposal.proposal_results || {}),
      proposalData,
      String(startBlock),
      JSON.stringify(offchainProposal?.proposal_data?.offchain_tally || {})
    );
  }

  const calculateStartTime = (): Date | null => {
    if (proposalData.key === "SNAPSHOT") {
      return new Date(proposalData.kind.start_ts * 1000);
    } else if (isTimeStampBasedTenant && isTimestampBasedProposal(proposal)) {
      const timestamp: string | undefined = getStartTimestamp(proposal);
      return timestamp ? new Date(Number(timestamp) * 1000) : null;
    } else if (latestBlock && startBlock !== null) {
      return getHumanBlockTime(startBlock, latestBlock);
    }
    return null;
  };

  const calculateEndTime = (): Date | null => {
    if (proposalData.key === "SNAPSHOT") {
      return new Date(proposalData.kind.end_ts * 1000);
    } else if (isTimeStampBasedTenant && isTimestampBasedProposal(proposal)) {
      const timestamp: string | undefined = getEndTimestamp(proposal);
      return timestamp ? new Date(Number(timestamp) * 1000) : null;
    } else if (latestBlock && endBlock !== null) {
      return getHumanBlockTime(endBlock, latestBlock);
    }
    return null;
  };

  const proposalTypeData =
    proposal.proposal_type_data as ProposalTypeData | null;

  const hardcodedThreshold =
    proposal.proposal_id ===
    "3505139576575581948952533286313165208104296221987341923460133599388956364165"
      ? BigInt(5100)
      : null;

  return {
    id: proposal.proposal_id,
    proposer: proposal.proposer,
    snapshotBlockNumber: Number(proposal.created_block),
    createdTime:
      proposalData.key === "SNAPSHOT"
        ? new Date(proposalData.kind.created_ts * 1000)
        : latestBlock
          ? getHumanBlockTime(createdBlock ?? 0, latestBlock)
          : null,
    startTime: calculateStartTime(),
    startBlock: proposalData.key === "SNAPSHOT" ? null : startBlock,
    endTime: calculateEndTime(),
    endBlock: proposalData.key === "SNAPSHOT" ? null : endBlock,
    cancelledTime:
      proposalData.key === "SNAPSHOT"
        ? null
        : latestBlock && proposal.cancelled_block
          ? getHumanBlockTime(cancelledBlock ?? 0, latestBlock)
          : null,
    executedTime:
      proposalData.key === "SNAPSHOT"
        ? null
        : latestBlock && proposal.executed_block
          ? getHumanBlockTime(executedBlock ?? 0, latestBlock)
          : null,
    executedBlock: proposalData.key === "SNAPSHOT" ? null : executedBlock,
    queuedTime:
      proposalData.key === "SNAPSHOT"
        ? null
        : latestBlock && proposal.queued_block
          ? getHumanBlockTime(queuedBlock ?? 0, latestBlock)
          : null,
    markdowntitle:
      (proposalData.key === "SNAPSHOT" && proposalData.kind.title) ||
      getTitleFromProposalDescription(proposal.description || ""),
    description:
      (proposalData.key === "SNAPSHOT" && proposalData.kind.body) ||
      proposal.description,
    quorum,
    approvalThreshold:
      hardcodedThreshold ??
      (proposalTypeData && proposalTypeData.approval_threshold),
    proposalData: proposalData.kind,
    unformattedProposalData: proposal.proposal_data_raw,
    proposalResults: proposalResults.kind,
    proposalType,
    status: latestBlock
      ? await getProposalStatus(
          proposal,
          proposalResults,
          proposalData,
          latestBlock,
          quorum,
          votableSupply
        )
      : null,
    createdTransactionHash: proposal.created_transaction_hash,
    cancelledTransactionHash: proposal.cancelled_transaction_hash,
    executedTransactionHash: proposal.executed_transaction_hash,
  };
}

/**
 * Extract proposal total value
 */
export function getProposalTotalValue(
  proposalData: ParsedProposalData[ProposalType]
) {
  switch (proposalData.key) {
    case "STANDARD":
    case "OPTIMISTIC": {
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
  SNAPSHOT: {
    key: "SNAPSHOT";
    kind: {
      title: string;
      start_ts: number;
      end_ts: number;
      created_ts: number;
      link: string;
      scores: string[];
      type: string;
      votes: string;
      state: "pending" | "active" | "closed";
      body: string;
      choices: string[];
    };
  };
  STANDARD: {
    key: "STANDARD";
    kind: {
      options: {
        targets: string[];
        values: string[];
        signatures: string[];
        calldatas: string[];
        functionArgsName: {
          functionName: string;
          functionArgs: string[];
        }[];
      }[];
    };
  };
  HYBRID_STANDARD: {
    key: "HYBRID_STANDARD";
    kind: {
      options: {
        targets: string[];
        values: string[];
        signatures: string[];
        calldatas: string[];
        functionArgsName: {
          functionName: string;
          functionArgs: string[];
        }[];
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
        functionArgsName: {
          functionName: string;
          functionArgs: string[];
        }[];
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
  HYBRID_APPROVAL: {
    key: "HYBRID_APPROVAL";
    kind: {
      options: {
        targets: string[];
        values: string[];
        calldatas: string[];
        description: string;
        functionArgsName: {
          functionName: string;
          functionArgs: string[];
        }[];
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
  HYBRID_OPTIMISTIC: {
    key: "HYBRID_OPTIMISTIC";
    kind: { options: [] };
  };
  HYBRID_OPTIMISTIC_TIERED: {
    key: "HYBRID_OPTIMISTIC_TIERED";
    kind: {
      options: [];
      tiers: number[];
      onchainProposalId?: string;
      created_attestation_hash?: string;
      cancelled_attestation_hash?: string;
    };
  };
  OFFCHAIN_OPTIMISTIC_TIERED: {
    key: "OFFCHAIN_OPTIMISTIC_TIERED";
    kind: {
      options: [];
      tiers: number[];
      onchainProposalId?: string;
      created_attestation_hash?: string;
      cancelled_attestation_hash?: string;
    };
  };
  OFFCHAIN_OPTIMISTIC: {
    key: "OFFCHAIN_OPTIMISTIC";
    kind: {
      options: [];
      onchainProposalId?: string;
      created_attestation_hash?: string;
      cancelled_attestation_hash?: string;
    };
  };
  OFFCHAIN_STANDARD: {
    key: "OFFCHAIN_STANDARD";
    kind: {
      options: [];
      onchainProposalId?: string;
      created_attestation_hash?: string;
      cancelled_attestation_hash?: string;
    };
  };
  OFFCHAIN_APPROVAL: {
    key: "OFFCHAIN_APPROVAL";
    kind: {
      options: [];
      onchainProposalId?: string;
      choices: string[];
      created_attestation_hash?: string;
      cancelled_attestation_hash?: string;
    };
  };
};

export function parseIfNecessary(obj: string | object) {
  return typeof obj === "string" ? JSON.parse(obj) : obj;
}

function parseMultipleStringsSeparatedByComma(obj: string | object) {
  return typeof obj === "string"
    ? obj
        .split(/(?![^(]*\)),\s*/)
        .map((item) => item.replace(/^['"]|['"]$/g, ""))
    : Array.isArray(obj)
      ? obj
          .map((item) =>
            typeof item === "string"
              ? item
                  .split(/(?![^(]*\)),\s*/)
                  .map((i) => i.replace(/^['"]|['"]$/g, ""))
              : item
          )
          .flat()
      : obj;
}

export function parseProposalData(
  proposalData: string,
  proposalType: ProposalType
): ParsedProposalData[ProposalType] {
  switch (proposalType) {
    case "SNAPSHOT": {
      const parsedProposalData = JSON.parse(proposalData);
      return {
        key: proposalType,
        kind: {
          title: parsedProposalData.title ?? "",
          start_ts: parsedProposalData.start_ts ?? 0,
          end_ts: parsedProposalData.end_ts ?? 0,
          created_ts: parsedProposalData.created_ts ?? 0,
          link: parsedProposalData.link ?? "",
          scores: parsedProposalData.scores ?? [],
          type: parsedProposalData.type ?? "",
          votes: parsedProposalData.votes ?? "",
          state: parsedProposalData.state ?? "",
          body: parsedProposalData.body ?? "",
          choices: parsedProposalData.choices ?? [],
        },
      };
    }
    case "STANDARD":
    case "HYBRID_STANDARD": {
      const parsedProposalData = JSON.parse(proposalData);
      try {
        const calldatas: any = parseMultipleStringsSeparatedByComma(
          parseIfNecessary(parsedProposalData.calldatas)
        );
        const targets: any = parseMultipleStringsSeparatedByComma(
          parseIfNecessary(parsedProposalData.targets)
        );
        const values = parseIfNecessary(parsedProposalData.values);
        const signatures: any = parseMultipleStringsSeparatedByComma(
          parseIfNecessary(parsedProposalData.signatures)
        );
        const functionArgsName = decodeCalldata(calldatas);

        return {
          key: proposalType,
          kind: {
            options: [
              {
                targets,
                values,
                signatures,
                calldatas,
                functionArgsName,
              },
            ],
          },
        };
      } catch (error) {
        console.log(
          `Error parsing proposal calldatas: '${proposalData}'`,
          error
        );
      }
    }
    case "OPTIMISTIC": {
      return {
        key: proposalType,
        kind: { options: [] },
      };
    }
    case "HYBRID_OPTIMISTIC_TIERED": {
      const parsedProposalData = JSON.parse(proposalData);
      return {
        key: proposalType,
        kind: {
          options: [],
          tiers: parsedProposalData.tiers,
          created_attestation_hash: parsedProposalData.created_attestation_hash,
          cancelled_attestation_hash:
            parsedProposalData.cancelled_attestation_hash,
        },
      };
    }
    case "APPROVAL":
    case "HYBRID_APPROVAL": {
      const parsedProposalData = JSON.parse(proposalData);
      const [maxApprovals, criteria, budgetToken, criteriaValue, budgetAmount] =
        parsedProposalData[1] as [string, string, string, string, string];
      return {
        key: proposalType,
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

              const functionArgsName = decodeCalldata(
                calldatas as `0x${string}`[]
              );

              return {
                targets,
                values,
                calldatas,
                description,
                functionArgsName,
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

    case "OFFCHAIN_OPTIMISTIC_TIERED": {
      const parsedProposalData = JSON.parse(proposalData);
      return {
        key: proposalType,
        kind: {
          options: [],
          tiers: parsedProposalData.tiers,
          onchainProposalId: parsedProposalData.onchain_proposalid,
          created_attestation_hash: parsedProposalData.created_attestation_hash,
          cancelled_attestation_hash:
            parsedProposalData.cancelled_attestation_hash,
        },
      };
    }
    case "OFFCHAIN_OPTIMISTIC": {
      const parsedProposalData = JSON.parse(proposalData);
      return {
        key: proposalType,
        kind: {
          options: [],
          onchainProposalId: parsedProposalData.onchain_proposalid,
          created_attestation_hash: parsedProposalData.created_attestation_hash,
          cancelled_attestation_hash:
            parsedProposalData.cancelled_attestation_hash,
        },
      };
    }
    case "OFFCHAIN_STANDARD": {
      const parsedProposalData = JSON.parse(proposalData);
      return {
        key: proposalType,
        kind: {
          options: [],
          onchainProposalId: parsedProposalData.onchain_proposalid,
          created_attestation_hash: parsedProposalData.created_attestation_hash,
          cancelled_attestation_hash:
            parsedProposalData.cancelled_attestation_hash,
        },
      };
    }
    case "OFFCHAIN_APPROVAL": {
      const parsedProposalData = JSON.parse(proposalData);
      return {
        key: proposalType,
        kind: {
          onchainProposalId: parsedProposalData.onchain_proposalid,
          choices: parsedProposalData.choices,
          options: [],
          created_attestation_hash: parsedProposalData.created_attestation_hash,
          cancelled_attestation_hash:
            parsedProposalData.cancelled_attestation_hash,
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
  SNAPSHOT: {
    key: "SNAPSHOT";
    kind: {
      scores: string[];
      status: "pending" | "active" | "closed";
    };
  };
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
      against: bigint;
      options: {
        option: string;
        votes: bigint;
      }[];
      criteria: "THRESHOLD" | "TOP_CHOICES";
      criteriaValue: bigint;
    };
  };
  OFFCHAIN_OPTIMISTIC_TIERED: {
    key: "OFFCHAIN_OPTIMISTIC_TIERED";
    kind: {
      CHAIN: {
        for: bigint;
        against: bigint;
      };
      PROJECT: {
        for: bigint;
        against: bigint;
      };
      USER: {
        for: bigint;
        against: bigint;
      };
      for: bigint;
      against: bigint;
    };
  };
  OFFCHAIN_OPTIMISTIC: {
    key: "OFFCHAIN_OPTIMISTIC";
    kind: {
      for: bigint;
      abstain: bigint;
      against: bigint;
    };
  };
  OFFCHAIN_STANDARD: {
    key: "OFFCHAIN_STANDARD";
    kind: {
      for: bigint;
      abstain: bigint;
      against: bigint;
    };
  };
  OFFCHAIN_APPROVAL: {
    key: "OFFCHAIN_APPROVAL";
    kind: {
      for: bigint;
      abstain: bigint;
      against: bigint;
      choices: {
        choice: string;
        votes: bigint;
      }[];
    };
  };
  HYBRID_STANDARD: {
    key: "HYBRID_STANDARD";
    kind: {
      CHAIN: {
        for: bigint;
        abstain: bigint;
        against: bigint;
      };
      PROJECT: {
        for: bigint;
        abstain: bigint;
        against: bigint;
      };
      USER: {
        for: bigint;
        abstain: bigint;
        against: bigint;
      };
      DELEGATES?: {
        for: bigint;
        abstain: bigint;
        against: bigint;
      };
      for: bigint;
      against: bigint;
      abstain: bigint;
    };
  };
  HYBRID_APPROVAL: {
    key: "HYBRID_APPROVAL";
    kind: {
      options: {
        option: string;
        votes: bigint;
      }[];
      PROJECT: Record<string, bigint>;
      USER: Record<string, bigint>;
      CHAIN: Record<string, bigint>;
      DELEGATES?: Record<string, bigint>;
      criteria: "THRESHOLD" | "TOP_CHOICES";
      criteriaValue: bigint;
      for: bigint;
      against: bigint;
      abstain: bigint;
    };
  };
  HYBRID_OPTIMISTIC: {
    key: "HYBRID_OPTIMISTIC";
    kind: {
      CHAIN: {
        for: bigint;
        against: bigint;
      };
      PROJECT: {
        for: bigint;
        against: bigint;
      };
      USER: {
        for: bigint;
        against: bigint;
      };
      DELEGATES?: {
        for: bigint;
        against: bigint;
      };
    };
  };
  HYBRID_OPTIMISTIC_TIERED: {
    key: "HYBRID_OPTIMISTIC_TIERED";
    kind: {
      CHAIN: {
        for: bigint;
        against: bigint;
      };
      PROJECT: {
        for: bigint;
        against: bigint;
      };
      USER: {
        for: bigint;
        against: bigint;
      };
      DELEGATES?: {
        for: bigint;
        against: bigint;
      };
      for: bigint;
      against: bigint;
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
  proposalData: ParsedProposalData[ProposalType],
  startBlock: string,
  offlineProposalData?: string
): ParsedProposalResults[ProposalType] {
  const type = proposalData.key;
  switch (type) {
    case "SNAPSHOT": {
      return {
        key: "SNAPSHOT",
        kind: {
          scores: JSON.parse(proposalResults).scores ?? [],
          status: proposalData.kind.state ?? "",
        },
      };
    }
    case "STANDARD":
    case "OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_STANDARD": {
      const parsedProposalResults = JSON.parse(proposalResults).standard;

      return {
        key: proposalData.key,
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

      const { namespace, contracts } = Tenant.current();

      const standardResults = (() => {
        if (
          namespace === TENANT_NAMESPACES.OPTIMISM &&
          contracts.governor.v6UpgradeBlock &&
          Number(startBlock) < contracts.governor.v6UpgradeBlock
        ) {
          return {
            for: BigInt(parsedProposalResults.standard?.[0] ?? 0),
            against: 0n,
            abstain: BigInt(parsedProposalResults.standard?.[1] ?? 0),
          };
        }

        return {
          for: BigInt(parsedProposalResults.standard?.[1] ?? 0),
          against: BigInt(parsedProposalResults.standard?.[0] ?? 0),
          abstain: BigInt(parsedProposalResults.standard?.[2] ?? 0),
        };
      })();

      return {
        key: "APPROVAL",
        kind: {
          for: standardResults.for,
          abstain: standardResults.abstain,
          against: standardResults.against,
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
    case "OFFCHAIN_APPROVAL": {
      const parsedProposalResults = JSON.parse(
        proposalResults
      ) as ProposalResults;
      const standardResults = parsedProposalResults.standard;

      return {
        key: "OFFCHAIN_APPROVAL",
        kind: {
          for: BigInt(standardResults?.[1] ?? 0),
          against: BigInt(standardResults?.[0] ?? 0),
          abstain: BigInt(standardResults?.[2] ?? 0),
          choices: proposalData.kind.choices.map((choice, idx) => {
            return {
              choice: choice,
              votes: BigInt(
                parsedProposalResults.approval?.find((res) => {
                  return res.param === idx.toString();
                })?.votes ?? 0
              ),
            };
          }),
        },
      };
    }
    case "HYBRID_STANDARD": {
      // Parse onchain data (DELEGATES) from proposalResults
      const parsedProposalResults = JSON.parse(proposalResults).standard;
      const delegatesResults = {
        for: BigInt(parsedProposalResults?.[1] ?? 0),
        against: BigInt(parsedProposalResults?.[0] ?? 0),
        abstain: BigInt(parsedProposalResults?.[2] ?? 0),
      };

      // Parse offchain data from offlineProposalData
      const offchainResults = parseOffChainProposalResults(
        offlineProposalData || "{}",
        "HYBRID_STANDARD"
      );

      // Combine both results
      return {
        key: "HYBRID_STANDARD",
        kind: {
          ...offchainResults.kind,
          DELEGATES: delegatesResults,
          ...delegatesResults,
        },
      };
    }
    case "HYBRID_OPTIMISTIC": {
      // Parse onchain data (DELEGATES) from proposalResults
      const parsedProposalResults = JSON.parse(proposalResults).standard;
      const delegatesResults = {
        for: BigInt(parsedProposalResults?.[1] ?? 0),
        against: BigInt(parsedProposalResults?.[0] ?? 0),
        abstain: BigInt(parsedProposalResults?.[2] ?? 0),
      };

      // Parse offchain data from offlineProposalData
      const offchainResults = parseOffChainProposalResults(
        offlineProposalData || "{}",
        "HYBRID_OPTIMISTIC"
      );

      // Combine both results
      return {
        key: "HYBRID_OPTIMISTIC",
        kind: {
          ...offchainResults.kind,
          DELEGATES: delegatesResults,
        },
      };
    }
    case "OFFCHAIN_OPTIMISTIC_TIERED": {
      return parseOffChainProposalResults(
        proposalResults || "{}",
        "OFFCHAIN_OPTIMISTIC_TIERED"
      );
    }
    case "HYBRID_OPTIMISTIC_TIERED": {
      // Parse onchain data (DELEGATES) from proposalResults
      const parsedProposalResults = JSON.parse(proposalResults).standard;
      const delegatesResults = {
        for: BigInt(parsedProposalResults?.[1] ?? 0),
        against: BigInt(parsedProposalResults?.[0] ?? 0),
        abstain: BigInt(parsedProposalResults?.[2] ?? 0),
      };

      // Parse offchain data from offlineProposalData
      const offchainResults = parseOffChainProposalResults(
        offlineProposalData || "{}",
        "HYBRID_OPTIMISTIC_TIERED"
      );

      // Combine both results
      return {
        key: "HYBRID_OPTIMISTIC_TIERED",
        kind: {
          ...offchainResults.kind,
          DELEGATES: delegatesResults,
          ...delegatesResults,
        },
      };
    }
    case "HYBRID_APPROVAL": {
      // Parse onchain data from proposalResults
      const parsedProposalResults = JSON.parse(
        proposalResults
      ) as ProposalResults;
      const { namespace, contracts } = Tenant.current();

      // Not sure whey we did this in APPROVAL,
      // Have to comeback and check this
      const standardResults = (() => {
        if (
          namespace === TENANT_NAMESPACES.OPTIMISM &&
          contracts.governor.v6UpgradeBlock &&
          Number(startBlock) < contracts.governor.v6UpgradeBlock
        ) {
          return {
            for: BigInt(parsedProposalResults.standard?.[0] ?? 0),
            against: 0n,
            abstain: BigInt(parsedProposalResults.standard?.[1] ?? 0),
          };
        }

        return {
          for: BigInt(parsedProposalResults.standard?.[1] ?? 0),
          against: BigInt(parsedProposalResults.standard?.[0] ?? 0),
          abstain: BigInt(parsedProposalResults.standard?.[2] ?? 0),
        };
      })();

      // Parse offchain data from offlineProposalData
      const offchainResults = parseOffChainProposalResults(
        offlineProposalData || "{}",
        "HYBRID_APPROVAL"
      );

      // Transform the DELEGATES data to match the same structure as other categories
      const delegatesOptions: Record<string, bigint> = {};
      proposalData.kind.options.forEach((option, idx) => {
        const optionName = option.description;
        const voteCount = BigInt(
          parsedProposalResults.approval?.find(
            (res) => res.param === idx.toString()
          )?.votes ?? 0
        );
        delegatesOptions[optionName] = voteCount;
      });

      // Combine both results
      return {
        key: "HYBRID_APPROVAL",
        kind: {
          ...offchainResults.kind,
          DELEGATES: delegatesOptions, // Use the transformed structure
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
          ...standardResults,
        },
      };
    }
  }
}

export function parseOffChainProposalResults(
  // proposalResults is expected to be a stringified JSON of the offchain_tally object
  proposalResults: string,
  proposalType: ProposalType
): any {
  switch (proposalType) {
    case "OFFCHAIN_STANDARD":
    case "HYBRID_STANDARD":
      const tallyData = JSON.parse(proposalResults);
      const processTallySource = (
        sourceData: { [key: string]: number } | undefined
      ) => {
        return {
          for: BigInt(sourceData?.["1"] ?? 0),
          against: BigInt(sourceData?.["0"] ?? 0),
          abstain: BigInt(sourceData?.["2"] ?? 0),
        };
      };

      const result = {
        key: proposalType,
        kind: {
          PROJECT: processTallySource(tallyData?.PROJECT),
          USER: processTallySource(tallyData?.USER),
          CHAIN: processTallySource(tallyData?.CHAIN),
        },
      };

      if (proposalType === "OFFCHAIN_STANDARD") {
        const allForVotes =
          result.kind.PROJECT.for +
          result.kind.USER.for +
          result.kind.CHAIN.for;
        const allAgainstVotes =
          result.kind.PROJECT.against +
          result.kind.USER.against +
          result.kind.CHAIN.against;
        const allAbstainVotes =
          result.kind.PROJECT.abstain +
          result.kind.USER.abstain +
          result.kind.CHAIN.abstain;
        return {
          ...result,
          kind: {
            ...result.kind,
            for: allForVotes,
            against: allAgainstVotes,
            abstain: allAbstainVotes,
          },
        };
      } else {
        return result;
      }

    case "OFFCHAIN_APPROVAL":
    case "HYBRID_APPROVAL": {
      const tallyData = JSON.parse(proposalResults);

      const processApprovalTallySource = (
        sourceData: Array<{ param: string; votes: number }> | undefined
      ) => {
        if (!sourceData || !Array.isArray(sourceData)) return {};

        // Convert the array of options to an object with option names as keys
        return sourceData.reduce(
          (acc, item) => {
            if (
              item &&
              typeof item === "object" &&
              "param" in item &&
              "votes" in item
            ) {
              acc[item.param] = BigInt(item.votes || 0);
            }
            return acc;
          },
          {} as Record<string, bigint>
        );
      };

      const result = {
        key: proposalType,
        kind: {
          PROJECT: processApprovalTallySource(tallyData?.PROJECT),
          USER: processApprovalTallySource(tallyData?.USER),
          CHAIN: processApprovalTallySource(tallyData?.CHAIN),
        },
      };
      if (proposalType === "OFFCHAIN_APPROVAL") {
        const allForVotes =
          result.kind.PROJECT.for +
          result.kind.USER.for +
          result.kind.CHAIN.for;
        const allAgainstVotes =
          result.kind.PROJECT.against +
          result.kind.USER.against +
          result.kind.CHAIN.against;

        return {
          ...result,
          kind: {
            ...result.kind,
            for: allForVotes,
            against: allAgainstVotes,
          },
        };
      }
      return result;
    }
    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC_TIERED":
    case "HYBRID_OPTIMISTIC_TIERED": {
      const tallyData = JSON.parse(proposalResults);
      const processTallySource = (
        sourceData: { [key: string]: number } | undefined
      ) => {
        return {
          for: BigInt(sourceData?.["1"] ?? 0),
          against: BigInt(sourceData?.["0"] ?? 0),
          abstain: BigInt(sourceData?.["2"] ?? 0),
        };
      };

      const result = {
        key: proposalType,
        kind: {
          PROJECT: processTallySource(tallyData?.PROJECT),
          USER: processTallySource(tallyData?.USER),
          CHAIN: processTallySource(tallyData?.CHAIN),
        },
      };
      if (
        proposalType === "OFFCHAIN_OPTIMISTIC_TIERED" ||
        proposalType === "OFFCHAIN_OPTIMISTIC"
      ) {
        const allForVotes =
          result.kind.PROJECT.for +
          result.kind.USER.for +
          result.kind.CHAIN.for;
        const allAgainstVotes =
          result.kind.PROJECT.against +
          result.kind.USER.against +
          result.kind.CHAIN.against;

        return {
          ...result,
          kind: {
            ...result.kind,
            for: allForVotes,
            against: allAgainstVotes,
          },
        };
      }
      return result;
    }
    default:
      // Return a default structure for unsupported proposal types
      console.error(`Unsupported proposal type: ${proposalType}`);
      return {
        key: proposalType,
        kind: {},
      };
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
  | "FAILED"
  | "PENDING"
  | "QUEUED"
  | "EXECUTED"
  | "CLOSED"
  | "PASSED";

export async function getProposalStatus(
  proposal: ProposalPayload,
  proposalResults: ParsedProposalResults[ProposalType],
  proposalData: ParsedProposalData[ProposalType],
  latestBlock: Block | null,
  quorum: bigint | null,
  votableSupply: bigint
): Promise<ProposalStatus> {
  const TEN_DAYS_IN_SECONDS = 10 * 24 * 60 * 60;
  const { contracts, ui } = Tenant.current();

  const checkHasNoCalldata = (): boolean => {
    if (
      proposal.proposal_type === "SNAPSHOT" ||
      proposal.proposal_type === "OPTIMISTIC" ||
      proposal.proposal_type.startsWith("OFFCHAIN")
    ) {
      return true;
    }

    if (!proposal.proposal_data) {
      return true;
    }

    const dataAsString =
      typeof proposal.proposal_data === "string"
        ? proposal.proposal_data
        : JSON.stringify(proposal.proposal_data);

    if (dataAsString.trim() === "" || dataAsString.trim() === "{}") {
      return true;
    }

    try {
      const parsedProposalData = parseProposalData(
        dataAsString,
        proposal.proposal_type as ProposalType
      );

      if (parsedProposalData.key === "STANDARD") {
        const options = parsedProposalData.kind.options[0];
        if (!options) return true;
        const noTargets =
          !options.targets ||
          options.targets.length === 0 ||
          options.targets.every(
            (t) =>
              !t ||
              t.trim() === "" ||
              t.toLowerCase() === "0x0000000000000000000000000000000000000000"
          );
        const noCalldatas =
          !options.calldatas ||
          options.calldatas.length === 0 ||
          options.calldatas.every(
            (cd) => !cd || cd.trim() === "" || cd.toLowerCase() === "0x"
          );
        return noTargets || noCalldatas;
      }
      if (parsedProposalData.key === "APPROVAL") {
        if (
          !parsedProposalData.kind.options ||
          parsedProposalData.kind.options.length === 0
        )
          return true;
        return parsedProposalData.kind.options.every((opt) => {
          const noTargets =
            !opt.targets ||
            opt.targets.length === 0 ||
            opt.targets.every(
              (t) =>
                !t ||
                t.trim() === "" ||
                t.toLowerCase() === "0x0000000000000000000000000000000000000000"
            );
          const noCalldatas =
            !opt.calldatas ||
            opt.calldatas.length === 0 ||
            opt.calldatas.every(
              (cd) => !cd || cd.trim() === "" || cd.toLowerCase() === "0x"
            );
          return noTargets || noCalldatas;
        });
      }
    } catch (e) {
      console.error(
        `Error parsing proposal_data in checkHasNoCalldata for proposal ID ${proposal.proposal_id}, type ${proposal.proposal_type}:`,
        e
      );
      return true;
    }
    return true;
  };

  if (proposalResults.key === "SNAPSHOT") {
    return proposalResults.kind.status.toUpperCase() as ProposalStatus;
  }
  if (
    proposal.cancelled_block ||
    (proposalData.kind as ParsedProposalData["OFFCHAIN_STANDARD"]["kind"])
      .cancelled_attestation_hash
  ) {
    return "CANCELLED";
  }
  if (proposal.executed_block) {
    return "EXECUTED";
  }

  if (proposal.queued_block && latestBlock) {
    let queueEventTimeSeconds: number | null = null;
    const isArb =
      contracts.governor.chain.id === 42161 ||
      contracts.governor.chain.id === 421614;
    let blockNumForQueueTime: string | bigint | null = proposal.queued_block;

    if (isArb && proposal.queued_block) {
      const mappedBlock = await mapArbitrumBlockToMainnetBlock(
        BigInt(proposal.queued_block)
      );
      if (mappedBlock) {
        blockNumForQueueTime = mappedBlock;
      } else {
        blockNumForQueueTime = null;
      }
    }

    if (blockNumForQueueTime) {
      const queuedBlockTime = getHumanBlockTime(
        blockNumForQueueTime.toString(),
        latestBlock
      );
      if (queuedBlockTime) {
        queueEventTimeSeconds = Math.floor(queuedBlockTime.getTime() / 1000);
      }
    }

    if (
      queueEventTimeSeconds &&
      latestBlock.timestamp - queueEventTimeSeconds > TEN_DAYS_IN_SECONDS
    ) {
      if (checkHasNoCalldata()) {
        return "PASSED";
      }
    }
    return "QUEUED";
  }

  const isTimeStampBasedTenant = ui.toggle(
    "use-timestamp-for-proposals"
  )?.enabled;

  if (isTimeStampBasedTenant && isTimestampBasedProposal(proposal)) {
    const startTimestamp = getStartTimestamp(proposal);
    const endTimestamp = getEndTimestamp(proposal);

    if (
      !startTimestamp ||
      !latestBlock ||
      Number(startTimestamp) > latestBlock.timestamp
    ) {
      return "PENDING";
    }
    if (!endTimestamp || Number(endTimestamp) > latestBlock.timestamp) {
      return "ACTIVE";
    }
  } else if (isBlockBasedProposal(proposal)) {
    const startBlock = getStartBlock(proposal);
    const endBlock = getEndBlock(proposal);

    if (
      !startBlock ||
      !latestBlock ||
      Number(startBlock) > latestBlock.number
    ) {
      return "PENDING";
    }
    if (!endBlock || Number(endBlock) > latestBlock.number) {
      return "ACTIVE";
    }
  }

  // Ensure we have a return value for all code paths
  switch (proposalResults.key) {
    case "STANDARD":
    case "OFFCHAIN_STANDARD": {
      const {
        for: forVotes,
        against: againstVotes,
        abstain: abstainVotes,
      } = proposalResults.kind;

      const quorumForGovernor = getProposalCurrentQuorum(proposalResults.kind);

      if ((quorum && quorumForGovernor < quorum) || forVotes < againstVotes) {
        return "DEFEATED";
      }

      if (forVotes > againstVotes) {
        return "SUCCEEDED";
      }

      return "FAILED";
    }
    case "HYBRID_STANDARD": {
      // Use shared helper function for calculating weighted metrics
      const tallies = calculateHybridStandardTallies(
        proposalResults.kind,
        Number(quorum!),
        true // isHybridStandard = true since we're in HYBRID_STANDARD case
      );

      // Check if both quorum and approval thresholds are met
      if (tallies.quorumMet) {
        return "SUCCEEDED";
      }

      return "DEFEATED";
    }
    case "OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC": {
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
    case "OFFCHAIN_APPROVAL": {
      const { for: forVotes, abstain: abstainVotes } = proposalResults.kind;
      const proposalQuorumVotes = forVotes + abstainVotes;

      if (quorum && proposalQuorumVotes < quorum) {
        return "DEFEATED";
      }

      return "SUCCEEDED";
    }
    case "HYBRID_APPROVAL": {
      const kind = proposalResults.kind;

      // Use shared utility function for calculating hybrid approval metrics
      const metrics = calculateHybridApprovalMetrics(
        kind,
        Number(quorum!),
        Number(kind.criteriaValue)
      );

      // Check if weighted quorum is met
      if (!metrics.quorumMet) {
        return "DEFEATED";
      }

      if (kind.criteria === "THRESHOLD") {
        return metrics.thresholdMet ? "SUCCEEDED" : "DEFEATED";
      } else {
        return "SUCCEEDED";
      }
    }
    case "HYBRID_OPTIMISTIC":
    case "HYBRID_OPTIMISTIC_TIERED": {
      // Calculate total votes across all categories: DELEGATES, CHAIN, PROJECT, USER
      const kind = proposalResults.kind;

      // Sum up votes from all categories
      let totalForVotes = 0n;
      let totalAgainstVotes = 0n;
      let totalAbstainVotes = 0n;

      // Add DELEGATES votes if available
      if (kind.DELEGATES) {
        totalForVotes += kind.DELEGATES.for;
        totalAgainstVotes += kind.DELEGATES.against;
      }

      // Add CHAIN votes
      totalForVotes += kind.CHAIN.for;
      totalAgainstVotes += kind.CHAIN.against;

      // Add PROJECT votes
      totalForVotes += kind.PROJECT.for;
      totalAgainstVotes += kind.PROJECT.against;

      // Add USER votes
      totalForVotes += kind.USER.for;
      totalAgainstVotes += kind.USER.against;

      if (BigInt(totalAgainstVotes) > BigInt(votableSupply!) / 2n) {
        return "DEFEATED";
      } else {
        return "SUCCEEDED";
      }
    }
    default: {
      // Default case to handle any unmatched proposalResults.key values
      console.warn(
        `Unhandled proposal type in getProposalStatus: ${(proposalResults as any).key}`
      );
      return "FAILED";
    }
  }
}

const ensureHexPrefix = (hex: string): `0x${string}` => {
  return hex.startsWith("0x") ? (hex as `0x${string}`) : `0x${hex}`;
};

export const proposalToCallArgs = (proposal: Proposal) => {
  const dynamicProposalType: keyof ParsedProposalData =
    proposal.proposalType as keyof ParsedProposalData;
  const proposalData =
    proposal.proposalData as ParsedProposalData[typeof dynamicProposalType]["kind"];

  return [
    "options" in proposalData ? proposalData.options[0].targets : "",
    "options" in proposalData ? proposalData.options[0].values : "",
    "options" in proposalData
      ? proposalData.options[0].calldatas.map(ensureHexPrefix)
      : "",
    keccak256(toUtf8Bytes(proposal.description!)),
  ];
};

type ProposalTypeData = {
  proposal_type_id: number;
  name: string;
  quorum: bigint;
  approval_threshold: bigint;
};

/**
 * Get proposal current quorum
 */
export function getProposalCurrentQuorum(
  proposalResults:
    | ParsedProposalResults["APPROVAL"]["kind"]
    | ParsedProposalResults["STANDARD"]["kind"]
    | ParsedProposalResults["OPTIMISTIC"]["kind"]
) {
  const { namespace } = Tenant.current();

  switch (namespace) {
    case TENANT_NAMESPACES.UNISWAP:
      return BigInt(proposalResults.for);

    case TENANT_NAMESPACES.SCROLL:
      return (
        BigInt(proposalResults.for) +
        BigInt(proposalResults.against) +
        BigInt(proposalResults.abstain)
      );
    default:
      return BigInt(proposalResults.for) + BigInt(proposalResults.abstain);
  }
}

export function isProposalCreatedBeforeUpgradeCheck(proposal: Proposal) {
  const { namespace } = Tenant.current();
  return (
    namespace === TENANT_NAMESPACES.OPTIMISM &&
    proposal.createdTime &&
    new Date(proposal.createdTime) < new Date("2024-01-08")
  );
}

/**
 * Calculates metrics for an optimistic proposal
 * @param proposal - The proposal to analyze
 * @param votableSupply - The total votable supply
 * @returns An object with the calculated metrics:
 *  - againstRelativeAmount: Percentage of votes against
 *  - againstLength: Total number of votes against
 *  - formattedVotableSupply: Formatted votable supply
 *  - status: Proposal status ('approved' or 'defeated')
 */
export function calculateOptimisticProposalMetrics(
  proposal: Proposal,
  votableSupply: string
) {
  const tokenDecimals = Tenant.current().token.decimals;

  const formattedVotableSupply = Number(
    BigInt(votableSupply || "0") / BigInt(10 ** tokenDecimals)
  );

  const proposalResults = proposal.proposalResults as {
    against?: string;
  } | null;
  const againstAmount = proposalResults?.against || "0";

  const againstLength = Number(formatUnits(againstAmount, tokenDecimals));

  const againstRelativeAmount =
    formattedVotableSupply > 0
      ? Number(((againstLength / formattedVotableSupply) * 100).toFixed(2))
      : 0;

  const status =
    againstRelativeAmount <= disapprovalThreshold ? "approved" : "defeated";

  return {
    againstRelativeAmount,
    againstLength,
    formattedVotableSupply,
    status,
  };
}
// Shared helper functions for hybrid approval calculations
export function calculateHybridApprovalOptionVotes(
  optionName: string,
  proposalResults: any
) {
  let optionVotes = 0n;

  if (proposalResults.DELEGATES?.[optionName]) {
    optionVotes += BigInt(proposalResults.DELEGATES[optionName]);
  }
  if (proposalResults.CHAIN?.[optionName]) {
    optionVotes += BigInt(proposalResults.CHAIN[optionName]);
  }
  if (proposalResults.PROJECT?.[optionName]) {
    optionVotes += BigInt(proposalResults.PROJECT[optionName]);
  }
  if (proposalResults.USER?.[optionName]) {
    optionVotes += BigInt(proposalResults.USER[optionName]);
  }

  return optionVotes;
}

export function calculateHybridApprovalWeightedPercentage(
  optionName: string,
  proposalResults: any,
  quorum: number
) {
  const eligibleVoters = {
    delegates: Number(quorum) * (100 / 30), // Convert 30% quorum to total eligible
    apps: OFFCHAIN_THRESHOLDS.PROJECT,
    users: OFFCHAIN_THRESHOLDS.USER,
    chains: OFFCHAIN_THRESHOLDS.CHAIN,
  };

  const weights = HYBRID_VOTE_WEIGHTS;
  let weightedOptionPercentage = 0;

  // Calculate contribution from each group
  const delegatesVotes = proposalResults.DELEGATES?.[optionName]
    ? Number(proposalResults.DELEGATES[optionName])
    : 0;
  const appsVotes = proposalResults.PROJECT?.[optionName]
    ? Number(proposalResults.PROJECT[optionName])
    : 0;
  const usersVotes = proposalResults.USER?.[optionName]
    ? Number(proposalResults.USER[optionName])
    : 0;
  const chainsVotes = proposalResults.CHAIN?.[optionName]
    ? Number(proposalResults.CHAIN[optionName])
    : 0;

  weightedOptionPercentage +=
    (delegatesVotes / eligibleVoters.delegates) * weights.delegates;
  weightedOptionPercentage += (appsVotes / eligibleVoters.apps) * weights.apps;
  weightedOptionPercentage +=
    (usersVotes / eligibleVoters.users) * weights.users;
  weightedOptionPercentage +=
    (chainsVotes / eligibleVoters.chains) * weights.chains;

  return weightedOptionPercentage;
}

export function calculateHybridApprovalMetrics(
  proposalResults: any,
  quorum: number,
  criteriaValue: string | number
) {
  const quorumThreshold = 0.3;

  // Get all option names across all categories
  const optionNames = new Set<string>();
  if (proposalResults.PROJECT)
    Object.keys(proposalResults.PROJECT).forEach((key) => optionNames.add(key));
  if (proposalResults.USER)
    Object.keys(proposalResults.USER).forEach((key) => optionNames.add(key));
  if (proposalResults.CHAIN)
    Object.keys(proposalResults.CHAIN).forEach((key) => optionNames.add(key));
  if (proposalResults.DELEGATES)
    Object.keys(proposalResults.DELEGATES).forEach((key) =>
      optionNames.add(key)
    );

  let totalWeightedParticipation = 0;
  let thresholdMet = false;
  const optionResults = [];

  // Calculate weighted participation and check threshold for each option
  for (const optionName of optionNames) {
    const weightedPercentage = calculateHybridApprovalWeightedPercentage(
      optionName,
      proposalResults,
      quorum
    );

    totalWeightedParticipation += weightedPercentage;

    const meetsThreshold =
      proposalResults.criteria === "THRESHOLD" &&
      weightedPercentage >= Number(criteriaValue) / 100;

    if (meetsThreshold) {
      thresholdMet = true;
    }

    optionResults.push({
      optionName,
      weightedPercentage,
      meetsThreshold,
      rawVotes: calculateHybridApprovalOptionVotes(optionName, proposalResults),
    });
  }

  return {
    totalWeightedParticipation,
    thresholdMet,
    optionResults,
    quorumMet: totalWeightedParticipation >= quorumThreshold,
  };
}

// Shared helper function for calculating hybrid standard metrics
function calculateHybridStandardTallies(
  proposalResults: any,
  delegateQuorum: number,
  isHybridStandard: boolean
) {
  const eligibleVoters = {
    delegates: Number(delegateQuorum) * (100 / 30), // Convert 30% quorum to total eligible
    apps: OFFCHAIN_THRESHOLDS.PROJECT,
    users: OFFCHAIN_THRESHOLDS.USER,
    chains: OFFCHAIN_THRESHOLDS.CHAIN,
  };

  const quorumThreshold = 0.3;
  const approvalThreshold = 0.51;

  const calculateTally = (category: any, eligibleCount: number) => {
    const forVotes = category?.for ? Number(category.for) : 0;
    const againstVotes = category?.against ? Number(category.against) : 0;
    const abstainVotes = category?.abstain ? Number(category.abstain) : 0;
    const totalVotes = forVotes + againstVotes;

    return {
      forVotes,
      againstVotes,
      abstainVotes,
      totalVotes,
      quorum: totalVotes / eligibleCount,
      approval: totalVotes > 0 ? forVotes / totalVotes : 0,
      passingQuorum: totalVotes / eligibleCount >= quorumThreshold,
      passingApproval:
        totalVotes > 0 ? forVotes / totalVotes >= approvalThreshold : false,
    };
  };

  const delegatesTally = calculateTally(
    proposalResults?.DELEGATES,
    eligibleVoters.delegates
  );
  const appsTally = calculateTally(
    proposalResults?.PROJECT,
    eligibleVoters.apps
  );
  const usersTally = calculateTally(
    proposalResults?.USER,
    eligibleVoters.users
  );
  const chainsTally = calculateTally(
    proposalResults?.CHAIN,
    eligibleVoters.chains
  );

  // Setup weights and participating groups based on proposal type
  let tallies, tallyWeights, eligibleCounts;

  if (isHybridStandard) {
    // All 4 groups participate with hybrid weights
    tallies = [delegatesTally, appsTally, usersTally, chainsTally];
    tallyWeights = [
      HYBRID_VOTE_WEIGHTS.delegates,
      HYBRID_VOTE_WEIGHTS.apps,
      HYBRID_VOTE_WEIGHTS.users,
      HYBRID_VOTE_WEIGHTS.chains,
    ];
    eligibleCounts = [
      eligibleVoters.delegates,
      eligibleVoters.apps,
      eligibleVoters.users,
      eligibleVoters.chains,
    ];
  } else {
    // Only 3 groups participate with equal weights
    tallies = [appsTally, usersTally, chainsTally];
    tallyWeights = [1 / 3, 1 / 3, 1 / 3];
    eligibleCounts = [
      eligibleVoters.apps,
      eligibleVoters.users,
      eligibleVoters.chains,
    ];
  }

  const finalQuorum = tallies.reduce(
    (sum, tally, index) => sum + tally.quorum * tallyWeights[index],
    0
  );

  const finalApproval = tallies.reduce(
    (sum, tally, index) => sum + tally.approval * tallyWeights[index],
    0
  );

  const finalQuorumMet = finalQuorum >= quorumThreshold;
  const finalApprovalMet = finalApproval >= approvalThreshold;

  return {
    tallies,
    tallyWeights,
    eligibleCounts,
    finalQuorum,
    finalApproval,
    finalQuorumMet,
    finalApprovalMet,
    quorumMet: finalQuorumMet && finalApprovalMet,
  };
}

export function calculateHybridStandardProposalMetrics(proposal: Proposal) {
  const proposalResults =
    proposal.proposalResults as ParsedProposalResults["HYBRID_STANDARD"]["kind"];

  // Use shared helper function
  const talliesData = calculateHybridStandardTallies(
    proposalResults,
    Number(proposal.quorum),
    proposal.proposalType === "HYBRID_STANDARD"
  );

  // Calculate weighted totals for display based on actual participation relative to eligible voters
  const baseValue = 100; // Use a base value for proportional representation

  const calculatedTotalForVotes = talliesData.tallies.reduce(
    (sum, tally, index) =>
      sum +
      (tally.forVotes / talliesData.eligibleCounts[index]) *
        talliesData.tallyWeights[index] *
        baseValue,
    0
  );
  const calculatedTotalAgainstVotes = talliesData.tallies.reduce(
    (sum, tally, index) =>
      sum +
      (tally.againstVotes / talliesData.eligibleCounts[index]) *
        talliesData.tallyWeights[index] *
        baseValue,
    0
  );

  return {
    quorumPercentage: talliesData.finalQuorum * 100,
    quorumMet: talliesData.quorumMet,
    totalForVotesPercentage: Math.round(calculatedTotalForVotes),
    totalAgainstVotesPercentage: Math.round(calculatedTotalAgainstVotes),
  };
}

export function calculateHybridOptimisticProposalMetrics(proposal: Proposal) {
  const proposalResults =
    proposal.proposalResults as ParsedProposalResults["HYBRID_OPTIMISTIC_TIERED"]["kind"];

  // For delegates, we need to calculate the total eligible voters
  // proposal.quorum is 30% of votable supply, so we need to multiply by (100/30)
  const eligibleVoters = {
    delegates: Number(proposal.quorum) * (100 / 30),
    apps: OFFCHAIN_THRESHOLDS.PROJECT,
    users: OFFCHAIN_THRESHOLDS.USER,
    chains: OFFCHAIN_THRESHOLDS.CHAIN,
  };

  // Get thresholds from tiers array: [2GroupThreshold, 3GroupThreshold, 4GroupThreshold]
  const proposalData =
    proposal.proposalData as ParsedProposalData["HYBRID_OPTIMISTIC_TIERED"]["kind"];
  const tiers = proposalData?.tiers || [55, 45, 35];
  const thresholds = {
    twoGroups: tiers[0] || 55,
    threeGroups: tiers[1] || 45,
    fourGroups: tiers[2] || 35,
  };

  const calculateVetoTally = (category: any, eligibleCount: number) => {
    const againstVotes = category?.against ? Number(category.against) : 0;
    const vetoPercentage = (againstVotes / eligibleCount) * 100;
    return {
      againstVotes,
      vetoPercentage,
    };
  };

  const delegatesTally = calculateVetoTally(
    proposalResults?.DELEGATES,
    eligibleVoters.delegates
  );
  const appsTally = calculateVetoTally(
    proposalResults?.PROJECT,
    eligibleVoters.apps
  );
  const usersTally = calculateVetoTally(
    proposalResults?.USER,
    eligibleVoters.users
  );
  const chainsTally = calculateVetoTally(
    proposalResults?.CHAIN,
    eligibleVoters.chains
  );

  // Setup groups based on proposal type
  let groupTallies;
  if (proposal.proposalType === "HYBRID_OPTIMISTIC_TIERED") {
    groupTallies = [
      { name: "delegates", ...delegatesTally },
      { name: "apps", ...appsTally },
      { name: "users", ...usersTally },
      { name: "chains", ...chainsTally },
    ];
  } else {
    groupTallies = [
      { name: "apps", ...appsTally },
      { name: "users", ...usersTally },
      { name: "chains", ...chainsTally },
    ];
  }

  // Count groups that exceed their respective thresholds
  const groupsExceedingThresholds = groupTallies.map((group) => ({
    ...group,
    exceedsThreshold: group.vetoPercentage >= thresholds.fourGroups,
  }));

  const numGroupsVetoing = groupsExceedingThresholds.filter(
    (g) => g.exceedsThreshold
  ).length;

  // Determine if veto is triggered based on tiered logic
  let vetoTriggered = false;
  if (numGroupsVetoing >= 4) {
    vetoTriggered =
      groupsExceedingThresholds.filter(
        (g) => g.vetoPercentage >= thresholds.fourGroups
      ).length >= 4;
  } else if (numGroupsVetoing >= 3) {
    vetoTriggered =
      groupsExceedingThresholds.filter(
        (g) => g.vetoPercentage >= thresholds.threeGroups
      ).length >= 3;
  } else if (numGroupsVetoing >= 2) {
    vetoTriggered =
      groupsExceedingThresholds.filter(
        (g) => g.vetoPercentage >= thresholds.twoGroups
      ).length >= 2;
  }

  // Calculate weighted total for display (normalized to a base value for representation)
  const baseValue = 100;
  const weights =
    proposal.proposalType === "HYBRID_OPTIMISTIC_TIERED"
      ? [
          HYBRID_VOTE_WEIGHTS.delegates,
          HYBRID_VOTE_WEIGHTS.apps,
          HYBRID_VOTE_WEIGHTS.users,
          HYBRID_VOTE_WEIGHTS.chains,
        ]
      : [1 / 3, 1 / 3, 1 / 3];

  const calculatedTotalAgainstVotes = groupTallies.reduce(
    (sum, tally, index) =>
      sum + (tally.vetoPercentage / 100) * (weights[index] || 0) * baseValue,
    0
  );

  return {
    vetoThresholdMet: vetoTriggered,
    totalAgainstVotes: Math.round(calculatedTotalAgainstVotes),
    groupTallies: groupsExceedingThresholds,
    thresholds,
  };
}
