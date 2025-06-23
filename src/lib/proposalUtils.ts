import { getHumanBlockTime } from "./blockTimes";
import {
  Proposal,
  BlockBasedProposal,
  TimestampBasedProposal,
  ProposalPayload,
} from "@/app/api/common/proposals/proposal";
import { Abi, decodeFunctionData, keccak256, parseUnits } from "viem";
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
import {
  parseOffChainProposalResults,
  parseProposalResults,
} from "./proposalUtils/parseProposalResults";
import { getProposalStatus } from "./proposalUtils/proposalStatus";
import { tokenForContractAddress } from "./tokenUtils";

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
      return "OFFCHAIN_OPTIMISTIC";
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
    proposalType,
    offChainProposalData?.calculation_options
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
    offchainProposalId: offchainProposal?.proposal_id,
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
      calculationOptions?: 0 | 1;
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
      calculationOptions?: 0 | 1;
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
      calculationOptions?: 0 | 1;
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
  proposalType: ProposalType,
  calculationOptions?: 0 | 1
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
            calculationOptions,
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
          calculationOptions: parsedProposalData.calculation_options,
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
      APP: {
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
      APP: {
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
      APP: Record<string, bigint>;
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
      APP: {
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
      APP: {
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
    | ParsedProposalResults["OPTIMISTIC"]["kind"],
  calculationOptions?: 0 | 1
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
    case TENANT_NAMESPACES.OPTIMISM:
      if (calculationOptions === 1) {
        return BigInt(proposalResults.for);
      } else {
        return BigInt(proposalResults.for) + BigInt(proposalResults.abstain);
      }
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
  if (proposalResults.APP?.[optionName]) {
    optionVotes += BigInt(proposalResults.APP[optionName]);
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
    apps: OFFCHAIN_THRESHOLDS.APP,
    users: OFFCHAIN_THRESHOLDS.USER,
    chains: OFFCHAIN_THRESHOLDS.CHAIN,
  };

  const weights = HYBRID_VOTE_WEIGHTS;
  let weightedOptionPercentage = 0;

  // Calculate contribution from each group
  const delegatesVotes = proposalResults.DELEGATES?.[optionName]
    ? Number(proposalResults.DELEGATES[optionName])
    : 0;
  const appsVotes = proposalResults.APP?.[optionName]
    ? Number(proposalResults.APP[optionName])
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
  proposal: any,
  includeOptionApprovalData = false
) {
  const quorumThreshold = 0.3; // 30% quorum

  // Extract data from proposal object
  const proposalResults = proposal.proposalResults;
  const proposalData = proposal.proposalData;
  const quorum = Number(proposal.quorum);

  // Get criteria value from proposal results (module-level criteria)
  const criteriaValue =
    proposalResults?.criteriaValue ||
    proposalData?.proposalSettings?.criteriaValue ||
    0;

  // Get governor-level approval threshold if available
  const governorApprovalThreshold =
    typeof proposal.approvalThreshold === "bigint"
      ? Number(proposal.approvalThreshold)
      : proposal.approvalThreshold || 0;

  // Get all option names across all categories
  const optionNames = new Set<string>();
  if (proposalResults.APP)
    Object.keys(proposalResults.APP).forEach((key) => optionNames.add(key));
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
  const optionResults: Array<{
    optionName: string;
    weightedPercentage: number;
    meetsThreshold: boolean;
    rawVotes: bigint;
  }> = [];

  // Sort options to get index for TOP_CHOICES criteria
  const sortedOptions = Array.from(optionNames).sort((a, b) => {
    const aWeighted = calculateHybridApprovalWeightedPercentage(
      a,
      proposalResults,
      quorum
    );
    const bWeighted = calculateHybridApprovalWeightedPercentage(
      b,
      proposalResults,
      quorum
    );
    return bWeighted - aWeighted;
  });

  // Calculate weighted participation and check threshold for each option
  for (const optionName of optionNames) {
    const weightedPercentage = calculateHybridApprovalWeightedPercentage(
      optionName,
      proposalResults,
      quorum
    );

    totalWeightedParticipation += weightedPercentage;

    // Check module-level criteria
    let meetsModuleCriteria = false;
    if (proposalResults.criteria === "THRESHOLD") {
      // Module criteria is in basis points (10000 = 100%)
      const thresholdPercentage = Number(criteriaValue) / 10000;
      meetsModuleCriteria = weightedPercentage >= thresholdPercentage;
    } else if (proposalResults.criteria === "TOP_CHOICES") {
      const optionIndex = sortedOptions.indexOf(optionName);
      meetsModuleCriteria = optionIndex < Number(criteriaValue);
    }

    if (meetsModuleCriteria) {
      thresholdMet = true;
    }

    optionResults.push({
      optionName,
      weightedPercentage,
      meetsThreshold: meetsModuleCriteria,
      rawVotes: calculateHybridApprovalOptionVotes(optionName, proposalResults),
    });
  }

  // Calculate governor-level approval threshold check
  const proposalForVotes = BigInt(proposalResults?.for || 0);
  const proposalAgainstVotes = BigInt(proposalResults?.against || 0);
  const proposalTotalVotes = proposalForVotes + proposalAgainstVotes;

  // TODO: this is not correct since, the total votes will have to be weighted instead of raw votes
  const passesGovernorThreshold =
    !governorApprovalThreshold ||
    governorApprovalThreshold === 0 ||
    (proposalTotalVotes > 0n &&
      (proposalForVotes * 10000n) / proposalTotalVotes >=
        BigInt(governorApprovalThreshold));

  // If option approval data requested, calculate full approval data
  let optionsWithApproval = null;
  let remainingBudget = null;

  if (
    includeOptionApprovalData &&
    proposalData?.proposalSettings &&
    proposalResults?.options
  ) {
    const proposalSettings = proposalData.proposalSettings;
    const options = proposalResults.options;

    const { contracts } = Tenant.current();
    const { decimals: contractTokenDecimals } = tokenForContractAddress(
      proposalSettings.budgetToken
    );

    // Prepare enriched options with proposal data
    const enrichedOptions = options.map((option: any, i: number) => {
      return { ...option, ...proposalData.options[i] };
    });

    let availableBudget = BigInt(proposalSettings.budgetAmount);
    let isExceeded = false;

    optionsWithApproval = enrichedOptions.map((option: any) => {
      const optionBudget = calculateOptionBudget(
        option,
        proposal.createdTime as Date,
        contracts.governor.optionBudgetChangeDate || null,
        contractTokenDecimals
      );

      // Find metrics for this option
      const optionMetrics = optionResults.find(
        (result) => result.optionName === option.option
      );

      // Determine if option is approved
      const isApproved = !!(
        passesGovernorThreshold &&
        optionMetrics?.meetsThreshold &&
        availableBudget >= optionBudget
      );

      if (isApproved) {
        availableBudget = availableBudget - optionBudget;
      } else if (
        optionMetrics?.meetsThreshold &&
        availableBudget < optionBudget
      ) {
        isExceeded = true;
      }

      return {
        ...option,
        optionBudget,
        passesModuleCriteria: optionMetrics?.meetsThreshold || false,
        isApproved,
        weightedPercentage: optionMetrics?.weightedPercentage || 0,
        rawVotes: optionMetrics?.rawVotes || 0n,
        budgetExceeded:
          isExceeded && optionMetrics?.meetsThreshold && !isApproved,
      };
    });

    remainingBudget = availableBudget;
  }

  return {
    totalWeightedParticipation,
    thresholdMet,
    optionResults,
    quorumMet: totalWeightedParticipation >= quorumThreshold,
    passesGovernorThreshold,
    proposalForVotes,
    proposalAgainstVotes,
    proposalTotalVotes,
    optionsWithApproval,
    remainingBudget,
  };
}

// Helper function to calculate option budget based on proposal creation time
export function calculateOptionBudget(
  option: any,
  proposalCreatedTime: Date,
  optionBudgetChangeDate: Date | null,
  contractTokenDecimals: number
): bigint {
  return proposalCreatedTime > (optionBudgetChangeDate || new Date(0))
    ? BigInt(option?.budgetTokensSpent || 0)
    : parseUnits(
        option?.budgetTokensSpent?.toString() || "0",
        contractTokenDecimals
      );
}

// Shared helper function for calculating hybrid standard metrics
export function calculateHybridStandardTallies(
  proposalResults: any,
  delegateQuorum: number,
  isHybridStandard: boolean,
  calculationOptions?: 0 | 1
) {
  const eligibleVoters = {
    delegates: Number(delegateQuorum) * (100 / 30), // Convert 30% quorum to total eligible
    apps: OFFCHAIN_THRESHOLDS.APP,
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
    let quorumVotes = forVotes + abstainVotes;

    if (calculationOptions === 1) {
      quorumVotes = forVotes;
    }

    return {
      forVotes,
      againstVotes,
      abstainVotes,
      quorumVotes,
      quorum: quorumVotes / eligibleCount,
      approval: quorumVotes > 0 ? forVotes / totalVotes : 0,
      passingQuorum: quorumVotes / eligibleCount >= quorumThreshold,
      passingApproval:
        quorumVotes > 0 ? forVotes / totalVotes >= approvalThreshold : false,
    };
  };

  const delegatesTally = calculateTally(
    proposalResults?.DELEGATES,
    eligibleVoters.delegates
  );
  const appsTally = calculateTally(
    proposalResults?.APP,
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
  const calculationOptions = (
    proposal.proposalData as ParsedProposalData["HYBRID_STANDARD"]["kind"]
  ).calculationOptions;

  // Use shared helper function
  const talliesData = calculateHybridStandardTallies(
    proposalResults,
    Number(proposal.quorum),
    proposal.proposalType === "HYBRID_STANDARD",
    calculationOptions
  );

  // Calculate weighted FOR votes as percentage of potential participation
  const calculatedTotalForVotes = talliesData.tallies.reduce(
    (sum, tally, index) => {
      const forPercentage =
        tally.forVotes > 0
          ? (tally.forVotes / talliesData.eligibleCounts[index]) * 100
          : 0;
      return sum + forPercentage * talliesData.tallyWeights[index];
    },
    0
  );

  // Calculate weighted AGAINST votes as percentage of potential participation
  const calculatedTotalAgainstVotes = talliesData.tallies.reduce(
    (sum, tally, index) => {
      const againstPercentage =
        tally.againstVotes > 0
          ? (tally.againstVotes / talliesData.eligibleCounts[index]) * 100
          : 0;
      return sum + againstPercentage * talliesData.tallyWeights[index];
    },
    0
  );

  const calculatedTotalAbstainVotes = talliesData.tallies.reduce(
    (sum, tally, index) => {
      const abstainPercentage =
        tally.abstainVotes > 0
          ? (tally.abstainVotes / talliesData.eligibleCounts[index]) * 100
          : 0;
      return sum + abstainPercentage * talliesData.tallyWeights[index];
    },
    0
  );

  return {
    quorumPercentage: talliesData.finalQuorum * 100,
    quorumMet: talliesData.quorumMet,
    totalForVotesPercentage: Number(calculatedTotalForVotes.toFixed(2)),
    totalAgainstVotesPercentage: Number(calculatedTotalAgainstVotes.toFixed(2)),
    totalAbstainVotesPercentage:
      calculationOptions === 0
        ? Number(calculatedTotalAbstainVotes.toFixed(2))
        : 0,
  };
}

export function calculateHybridApprovalProposalMetrics(proposal: Proposal) {
  const proposalResults =
    proposal.proposalResults as ParsedProposalResults["HYBRID_APPROVAL"]["kind"];
  const proposalData =
    proposal.proposalData as ParsedProposalData["HYBRID_APPROVAL"]["kind"];

  // For delegates, we need to calculate the total eligible voters
  // proposal.quorum is 30% of votable supply, so we need to multiply by (100/30)
  const eligibleVoters = {
    delegates: Number(proposal.quorum) * (100 / 30),
    apps: OFFCHAIN_THRESHOLDS.APP,
    users: OFFCHAIN_THRESHOLDS.USER,
    chains: OFFCHAIN_THRESHOLDS.CHAIN,
  };

  // Setup weights and participating groups based on proposal type
  let tallyWeights, eligibleCounts;
  if (proposal.proposalType === "HYBRID_APPROVAL") {
    // All 4 groups participate with hybrid weights
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
    tallyWeights = [1 / 3, 1 / 3, 1 / 3];
    eligibleCounts = [
      eligibleVoters.apps,
      eligibleVoters.users,
      eligibleVoters.chains,
    ];
  }

  // Get all option names across all categories
  const optionNames = new Set<string>();
  if (proposalResults.APP)
    Object.keys(proposalResults.APP).forEach((key) => optionNames.add(key));
  if (proposalResults.USER)
    Object.keys(proposalResults.USER).forEach((key) => optionNames.add(key));
  if (proposalResults.CHAIN)
    Object.keys(proposalResults.CHAIN).forEach((key) => optionNames.add(key));
  if (proposalResults.DELEGATES)
    Object.keys(proposalResults.DELEGATES).forEach((key) =>
      optionNames.add(key)
    );

  // Calculate weighted participation for each option
  const optionResults = [];
  for (const optionName of optionNames) {
    const categories =
      proposal.proposalType === "HYBRID_APPROVAL"
        ? [
            proposalResults.DELEGATES,
            proposalResults.APP,
            proposalResults.USER,
            proposalResults.CHAIN,
          ]
        : [
            proposalResults.APP,
            proposalResults.USER,
            proposalResults.CHAIN,
          ];

    // Calculate weighted votes as percentage of potential participation
    const calculatedWeightedVotes = categories.reduce(
      (sum, category, index) => {
        const votes = category?.[optionName] ? Number(category[optionName]) : 0;
        const votesPercentage =
          votes > 0 ? (votes / eligibleCounts[index]) * 100 : 0;
        return sum + votesPercentage * tallyWeights[index];
      },
      0
    );

    optionResults.push({
      optionName,
      weightedPercentage: Number(calculatedWeightedVotes.toFixed(2)),
      rawVotes: categories.reduce((sum, category) => {
        const votes = category?.[optionName] ? Number(category[optionName]) : 0;
        return sum + votes;
      }, 0),
    });
  }

  // Calculate total weighted participation (sum of all option votes)
  const totalWeightedParticipation = optionResults.reduce(
    (sum, option) => sum + option.weightedPercentage,
    0
  );

  // Check if quorum is met (30% threshold)
  const quorumThreshold = 30;
  const quorumMet = totalWeightedParticipation >= quorumThreshold;

  // Check if threshold is met for THRESHOLD criteria
  const criteriaValue = proposalData?.proposalSettings?.criteriaValue;
  const thresholdMet =
    proposalResults.criteria === "THRESHOLD" && criteriaValue
      ? optionResults.some(
          (option) => option.weightedPercentage >= Number(criteriaValue)
        )
      : false;

  return {
    totalWeightedParticipation: Number(totalWeightedParticipation.toFixed(2)),
    quorumMet,
    thresholdMet,
    optionResults,
  };
}

export function calculateHybridOptimisticProposalMetrics(proposal: Proposal) {
  const proposalResults =
    proposal.proposalResults as ParsedProposalResults["HYBRID_OPTIMISTIC_TIERED"]["kind"];

  // For delegates, we need to calculate the total eligible voters
  // proposal.quorum is 30% of votable supply, so we need to multiply by (100/30)
  const eligibleVoters = {
    delegates: Number(proposal.quorum) * (100 / 30),
    apps: OFFCHAIN_THRESHOLDS.APP,
    users: OFFCHAIN_THRESHOLDS.USER,
    chains: OFFCHAIN_THRESHOLDS.CHAIN,
  };

  // Get thresholds from tiers array: [2GroupThreshold, 3GroupThreshold, 4GroupThreshold]
  const proposalData =
    proposal.proposalType === "HYBRID_OPTIMISTIC_TIERED"
      ? (proposal.proposalData as ParsedProposalData["HYBRID_OPTIMISTIC_TIERED"]["kind"])
      : (proposal.proposalData as ParsedProposalData["HYBRID_OPTIMISTIC"]["kind"]);

  const tiers = (proposalData as any)?.tiers || [55, 45, 35];
  const thresholds = {
    twoGroups: tiers[0] || 55,
    threeGroups: tiers[1] || 45,
    fourGroups: tiers[2] || 35,
  };

  // Setup weights based on proposal type
  let tallyWeights;
  if (proposal.proposalType === "HYBRID_OPTIMISTIC_TIERED") {
    tallyWeights = [
      HYBRID_VOTE_WEIGHTS.delegates,
      HYBRID_VOTE_WEIGHTS.apps,
      HYBRID_VOTE_WEIGHTS.users,
      HYBRID_VOTE_WEIGHTS.chains,
    ];
  } else {
    tallyWeights = [1 / 3, 1 / 3, 1 / 3];
  }

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
    proposalResults?.APP,
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

  // Calculate weighted total against votes as percentage of potential participation
  const calculatedTotalAgainstVotes = groupTallies.reduce(
    (sum, tally, index) => {
      const againstPercentage = tally.vetoPercentage;
      return sum + againstPercentage * tallyWeights[index];
    },
    0
  );

  return {
    vetoThresholdMet: vetoTriggered,
    totalAgainstVotes: Number(calculatedTotalAgainstVotes.toFixed(2)),
    groupTallies: groupsExceedingThresholds,
    thresholds,
  };
}
