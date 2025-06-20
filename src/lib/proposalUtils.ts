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
import { TENANT_NAMESPACES, disapprovalThreshold } from "./constants";
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

/**
 * Parse proposal into proposal response
 */

export async function parseProposal(
  proposal: ProposalPayload,
  latestBlock: Block | null,
  quorum: bigint | null,
  votableSupply: bigint
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
    proposal.proposal_type as ProposalType
  );
  const proposalResuts = parseProposalResults(
    JSON.stringify(proposal.proposal_results || {}),
    proposalData,
    String(startBlock)
  );

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
  OPTIMISTIC: {
    key: "OPTIMISTIC";
    kind: { options: [] };
  };
  OFFCHAIN_STANDARD: {
    key: "OFFCHAIN_STANDARD";
    kind: { options: [] };
  };
  OFFCHAIN_APPROVAL: {
    key: "OFFCHAIN_APPROVAL";
    kind: { options: [] };
  };
  OFFCHAIN_OPTIMISTIC: {
    key: "OFFCHAIN_OPTIMISTIC";
    kind: { options: [] };
  };
  OFFCHAIN_OPTIMISTIC_TIERED: {
    key: "OFFCHAIN_OPTIMISTIC_TIERED";
    kind: { options: [] };
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
        key: "SNAPSHOT",
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
    case "STANDARD": {
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
          key: "STANDARD",
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
    case "OFFCHAIN_STANDARD":
    case "OFFCHAIN_APPROVAL":
    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC_TIERED": {
      return {
        key: proposalType,
        kind: { options: [] },
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
  OFFCHAIN_STANDARD: {
    key: "OFFCHAIN_STANDARD";
    kind: null;
  };
  OFFCHAIN_APPROVAL: {
    key: "OFFCHAIN_APPROVAL";
    kind: null;
  };
  OFFCHAIN_OPTIMISTIC: {
    key: "OFFCHAIN_OPTIMISTIC";
    kind: null;
  };
  OFFCHAIN_OPTIMISTIC_TIERED: {
    key: "OFFCHAIN_OPTIMISTIC_TIERED";
    kind: null;
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
  startBlock: string
): ParsedProposalResults[ProposalType] {
  switch (proposalData.key) {
    case "SNAPSHOT": {
      return {
        key: "SNAPSHOT",
        kind: {
          scores: JSON.parse(proposalResults).scores ?? [],
          status: proposalData.kind.state ?? "",
        },
      };
    }
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
    case "OFFCHAIN_STANDARD":
    case "OFFCHAIN_APPROVAL":
    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC_TIERED": {
      return {
        key: proposalData.key,
        kind: null,
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
  | "FAILED"
  | "PENDING"
  | "QUEUED"
  | "EXECUTED"
  | "CLOSED"
  | "PASSED";

export async function getProposalStatus(
  proposal: ProposalPayload,
  proposalResults: ParsedProposalResults[ProposalType],
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
      proposal.proposal_type.startsWith("OFFCHAIN_")
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
  if (proposal.cancelled_block) {
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

  switch (proposalResults.key) {
    case "STANDARD": {
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
    case "OFFCHAIN_STANDARD":
    case "OFFCHAIN_APPROVAL":
    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC_TIERED": {
      return "PENDING";
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
